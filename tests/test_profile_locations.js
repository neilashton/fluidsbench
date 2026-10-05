const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { projection, guideMarkup } = require("../assets/js/profile-locations.js");

const payload = fs.readFileSync(path.join(__dirname, "../assets/data/profile-locations/drivaerml-v9.json"));
const definitions = JSON.parse(payload);
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

test("display definitions match the pinned FluidsBench v9 profile contract byte for byte", () => {
  assert.equal(createHash("sha256").update(payload).digest("hex"), "df22bc807b62f925c32659d681ac44064e6acf46449038b8431b1e9139aba1e8");
  assert.equal(definitions.velocity_profiles.stations.length, 16);
  assert.equal(definitions.pressure_cuts.stations.length, 4);
});

test("orthographic projections preserve metre scale and distinguish collapsed lines", () => {
  for (const view of ["side", "top"]) {
    const p = projection(view);
    const origin = p.point([0, 0, 0]);
    near(distance(origin, p.point([1, 0, 0])), p.scale);
    near(distance(origin, p.point(view === "side" ? [0, 0, 1] : [0, 1, 0])), p.scale);
    assert.ok(p.point([1, 0, 0])[0] > origin[0]);
    assert.ok(p.point(view === "side" ? [0, 0, 1] : [0, 1, 0])[1] < origin[1]);
    for (const station of definitions.velocity_profiles.stations) {
      for (const endpoint of [station.start_m, station.end_m]) {
        const [x, y] = p.point(endpoint);
        assert.ok(x > 0 && x < 720 && y > 0 && y < 320, station.id);
      }
    }
  }
  const v3 = definitions.velocity_profiles.stations.find((s) => s.source_profile_id === "V3");
  const u1 = definitions.velocity_profiles.stations.find((s) => s.source_profile_id === "U1");
  const side = projection("side");
  const top = projection("top");
  near(distance(side.point(v3.start_m), side.point(v3.end_m)), 2 * side.scale);
  near(distance(top.point(v3.start_m), top.point(v3.end_m)), 0);
  near(distance(side.point(u1.start_m), side.point(u1.end_m)), 0);
  near(distance(top.point(u1.start_m), top.point(u1.end_m)), 3 * top.scale);
});

test("all fixed stations are selectable and their detail coordinates come from the contract", () => {
  for (const station of definitions.velocity_profiles.stations) {
    const html = guideMarkup(definitions, { placement: "constant", quantity: "velocity", stationId: station.id });
    assert.ok(html.includes(`<strong>${station.label}</strong>`));
    assert.ok(html.includes(`data-location-station="${station.id}" aria-pressed="true"`));
    for (const candidate of definitions.velocity_profiles.stations) {
      assert.ok(html.includes(`data-location-station="${candidate.id}"`));
    }
  }
});

test("Cp centreline cuts retain separate anatomical regions despite sharing one plane", () => {
  const upper = definitions.pressure_cuts.stations.find((s) => s.id === "upperbody_centerline");
  const lower = definitions.pressure_cuts.stations.find((s) => s.id === "underbody_centerline");
  assert.deepEqual(upper.plane, { axis: "y", value_m: 0 });
  assert.deepEqual(lower.plane, upper.plane);
  assert.notEqual(lower.anatomical_scope, upper.anatomical_scope);
  for (const station of definitions.pressure_cuts.stations) {
    const html = guideMarkup(definitions, { placement: "constant", quantity: "cp", stationId: station.id });
    assert.ok(html.includes(station.anatomical_scope.replaceAll("_", " ")));
    assert.ok(html.includes("not the sampled Cp paths"));
    assert.ok(html.includes(`data-location-station="${station.id}" aria-pressed="true"`));
  }
});

test("relative mode never presents fixed endpoints as case-specific locations", () => {
  for (const quantity of ["velocity", "cp"]) {
    const html = guideMarkup(definitions, { placement: "relative", quantity, stationId: "V3" });
    assert.ok(html.includes("spatial coordinates have not yet been"));
    assert.ok(!html.includes("<svg"));
    assert.ok(!html.includes("4.007"));
  }
});

test("panel-specific SVG labels remain unique across velocity and Cp guides", () => {
  const velocity = guideMarkup(definitions, {
    placement: "constant",
    quantity: "velocity",
    stationId: "autocfd5_v3",
    idPrefix: "profile-1-locations",
  });
  const cp = guideMarkup(definitions, { placement: "constant", quantity: "cp", stationId: "upperbody_centerline", idPrefix: "profile-0-locations" });
  const ids = [...(velocity + cp).matchAll(/\bid="([^" ]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(velocity.includes('aria-labelledby="profile-1-locations-side-title profile-1-locations-side-desc"'));
  assert.ok(cp.includes('aria-labelledby="profile-0-locations-top-title profile-0-locations-top-desc"'));
});

test("unknown or missing support cannot be replaced by another station's location", () => {
  const unknown = guideMarkup(definitions, { placement: "constant", quantity: "velocity", stationId: "prototype_0_25l" });
  assert.ok(unknown.includes("unavailable for this station"));
  assert.ok(!unknown.includes("<svg"));
  const filtered = guideMarkup(definitions, { placement: "constant", quantity: "velocity", stationId: "autocfd5_v3", stationIds: ["autocfd5_v3"] });
  assert.ok(filtered.includes('data-location-station="autocfd5_v3"'));
  assert.ok(!filtered.includes('data-location-station="autocfd5_v1"'));
});

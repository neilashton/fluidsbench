// Node unit tests for the pure logic in assets/js/carbench.js.
// Loaded via `vm` (not require) so it works regardless of package.json "type".
// Run: node tests/carbench.test.cjs
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

const src = fs.readFileSync(path.join(__dirname, "..", "assets", "js", "carbench.js"), "utf8");
const sandbox = { module: { exports: {} }, console: console };
vm.createContext(sandbox);
vm.runInContext(src, sandbox);
const cb = sandbox.module.exports;

const registry = {
  surface_pressure_rel_l2: { display_name: "rel L2", unit: "", direction: "lower_better", decimals: 4, datasets: ["DrivAerNet++"] },
  surface_pressure_r2: { display_name: "R²", unit: "", direction: "higher_better", decimals: 4, datasets: ["DrivAerNet++"] },
  surface_pressure_mse: { display_name: "MSE", unit: "m⁴/s⁴", direction: "lower_better", decimals: 0, datasets: ["DrivAerNet++"] },
  r2_cd: { display_name: "Cd R²", unit: "", direction: "higher_better", decimals: 3, datasets: ["AhmedML", "DrivAerML"] },
};

const rows = [
  {
    model: "AB-UPT", benchmark: "CarBench", dataset: "DrivAerNet++", model_type: "Transformer", parameter_count: 6.01,
    metrics: {
      surface_pressure_rel_l2: { value: 0.1358, std: 0.0024 },
      surface_pressure_r2: { value: 0.9675, std: 0.0019 },
      surface_pressure_mse: { value: 559 },
    },
  },
  {
    model: "PointNet", benchmark: "CarBench", dataset: "DrivAerNet++", model_type: "Point cloud", parameter_count: 1.67,
    metrics: {
      surface_pressure_rel_l2: { value: 0.3803 },
      surface_pressure_r2: { value: 0.7639 },
      surface_pressure_mse: { value: 3350 },
    },
  },
  { model: "SomeCFD", dataset: "AhmedML", surface_pressure_l2: 3.0 }, // a non-CarBench (flat) row
];

let passed = 0;
let failed = 0;
function check(name, fn) {
  try {
    fn();
    passed += 1;
  } catch (error) {
    failed += 1;
    console.error("FAIL: " + name + " — " + error.message);
  }
}

check("selectCarbenchRows keeps only CarBench rows", function () {
  const selected = cb.selectCarbenchRows(rows);
  assert.strictEqual(selected.length, 2);
  assert.ok(selected.every(function (r) { return r.benchmark === "CarBench"; }));
});

check("isCarbenchEntry falls back to dataset when untagged", function () {
  assert.strictEqual(cb.isCarbenchEntry({ dataset: "DrivAerNet++" }), true);
  assert.strictEqual(cb.isCarbenchEntry({ dataset: "AhmedML" }), false);
});

check("carbenchMetricIds filters to DrivAerNet++ in registry order", function () {
  // Array.from normalises the sandbox-realm array so deepStrictEqual compares contents.
  assert.deepStrictEqual(Array.from(cb.carbenchMetricIds(registry)), [
    "surface_pressure_rel_l2",
    "surface_pressure_r2",
    "surface_pressure_mse",
  ]);
});

check("metricValue reads the nested metrics map", function () {
  assert.strictEqual(cb.metricValue(rows[0], "surface_pressure_rel_l2"), 0.1358);
  assert.strictEqual(cb.metricValue(rows[0], "inference_latency_ms"), null);
});

check("formatMetricValue applies decimals, std, and unit", function () {
  assert.strictEqual(cb.formatMetricValue(rows[0], "surface_pressure_rel_l2", registry), "0.1358 ± 0.0024");
  assert.strictEqual(cb.formatMetricValue(rows[0], "surface_pressure_mse", registry), "559 m⁴/s⁴");
  assert.strictEqual(cb.formatMetricValue(rows[0], "inference_latency_ms", registry), "—");
});

check("sortRows by rel L2 ranks AB-UPT first (lower is better)", function () {
  const sorted = cb.sortRows(cb.selectCarbenchRows(rows), "surface_pressure_rel_l2", registry);
  assert.strictEqual(sorted[0].model, "AB-UPT");
});

check("sortRows by R² ranks AB-UPT first (higher is better)", function () {
  const sorted = cb.sortRows(cb.selectCarbenchRows(rows), "surface_pressure_r2", registry);
  assert.strictEqual(sorted[0].model, "AB-UPT");
});

console.log("carbench.js: " + passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);

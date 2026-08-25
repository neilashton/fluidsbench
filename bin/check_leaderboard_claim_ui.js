#!/usr/bin/env node

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { webcrypto } = require("node:crypto");

const root = path.resolve(__dirname, "..");
const submissionRoot = path.resolve(process.env.FLUIDSBENCH_SUBMISSION_ROOT || path.resolve(root, "../fluidsbench-submission"));
const scriptPath = path.join(root, "assets/js/leaderboard.js");
const displayConfig = JSON.parse(fs.readFileSync(path.join(root, "_data/leaderboard_display.json"), "utf8"));
const source = fs.readFileSync(scriptPath, "utf8");
const marker = "})();";
const markerIndex = source.lastIndexOf(marker);
assert.notEqual(markerIndex, -1, "leaderboard script must end with its IIFE");
const instrumented = `${source.slice(0, markerIndex)}
window.__FluidsBenchClaimTest = {
  activeColumns,
  activeMetricDefinitions,
  bibtexEscape,
  canonicalResultPermalink,
  citationValues,
  claimEligibility,
  decimalHalfUp,
  ensureClaimRecord,
  ensureClaimsIndex,
  exportMetadataColumns,
  exportProvenance,
  fallbackRankings,
  generatedRankingMatches,
  headlineMetricDefinitions,
  leaderboardManifestProvenance,
  claimRecordCheck,
  normalizeRow,
  openDetails,
  predictionArtifactStatus,
  predictionAvailability,
  predictionMetricRecomputation,
  radarMetricAxes,
  radarNormalizedValue,
  representationSummary,
  reproducibilityArtifactAvailability,
  mappingSummary,
  metricDefinition,
  resultRevision,
  resultRowById,
  revisionRowsForActiveSplit,
  versionsForRow,
  rowRanking,
  renderReleaseMetadata,
  renderSubmissionAvailability,
  scoringSupportSummary,
  rowsForActiveSplit,
  sourceSubmission,
  state,
  verifyManifestSha256,
};
${source.slice(markerIndex)}`;

const elements = new Map();
const context = {
  Blob,
  Map,
  Set,
  TextDecoder,
  TextEncoder,
  URL,
  URLSearchParams,
  Response,
  console,
  document: {
    readyState: "loading",
    addEventListener() {},
    getElementById(id) {
      if (!elements.has(id)) {
        elements.set(id, {
          hidden: false,
          open: false,
          textContent: "",
          setAttribute(name, value) {
            this[name] = value;
            if (name === "open") this.open = true;
          },
        });
      }
      return elements.get(id);
    },
  },
  async fetch(value) {
    const url = new URL(value);
    const assetRoots = ["leaderboard/", "submissions/", "evaluation/", "validation/"];
    const decodedPath = decodeURIComponent(url.pathname);
    const offsets = assetRoots.map((assetRoot) => decodedPath.lastIndexOf(`/${assetRoot}`)).filter((offset) => offset >= 0);
    if (!offsets.length) return new Response("not found", { status: 404 });
    const relative = decodedPath.slice(Math.min(...offsets) + 1);
    const target = path.resolve(submissionRoot, relative);
    if (!target.startsWith(`${submissionRoot}${path.sep}`) || !fs.existsSync(target)) return new Response("not found", { status: 404 });
    return new Response(fs.readFileSync(target), { status: 200 });
  },
  navigator: {},
  window: {
    FluidsBenchLeaderboardBaseUrl: "https://example.test/assets/",
    FluidsBenchLeaderboardManifestUrl: "https://example.test/assets/leaderboard/manifest.json",
    FluidsBenchLeaderboardManifestSha256: "9".repeat(64),
    FluidsBenchLeaderboardDisplay: displayConfig,
    FluidsBenchProfileGroundTruthBaseUrl: "https://example.test/profile-ground-truth/",
    addEventListener() {},
    clearTimeout,
    crypto: webcrypto,
    location: { href: "https://fluidsbench.org/", hostname: "fluidsbench.org" },
    setTimeout,
  },
};
vm.createContext(context);
vm.runInContext(instrumented, context, { filename: scriptPath });

const api = context.window.__FluidsBenchClaimTest;
assert.equal(api.verifyManifestSha256("9".repeat(64)).verified, true);
assert.equal(api.verifyManifestSha256("a".repeat(64), "").required, false);
assert.throws(() => api.verifyManifestSha256("8".repeat(64)), /publication-time release snapshot SHA-256/);
assert.match(source, /release\.status === "official" && !expectedManifestSha256/);
assert.equal(api.decimalHalfUp(1.25, 1), 1.3);
assert.equal(api.decimalHalfUp(-1.25, 1), -1.3);
assert.equal(api.decimalHalfUp(9926.64999999999, 1), 9926.6);
assert.equal(api.decimalHalfUp(-91.4564999999999, 3), -91.456);

api.state.metrics = new Map([["score", { id: "score", unit: "" }]]);
const policy = {
  metric_id: "score",
  direction: "higher",
  decimal_places: 1,
  rounding: "decimal_half_up",
  method: "competition",
  scope: "exact_data_release_dataset_split",
};
const rows = [
  { id: "first", metricValues: { score: 10 } },
  { id: "tie-b", metricValues: { score: 9.94 } },
  { id: "tie-a", metricValues: { score: 9.93 } },
  { id: "fourth", metricValues: { score: 9.8 } },
];
const ranked = api.fallbackRankings(rows, policy);
assert.deepEqual(
  Array.from(ranked, ({ row, ranking }) => [row.id, ranking.rank]),
  [
    ["first", 1],
    ["tie-a", 2],
    ["tie-b", 2],
    ["fourth", 4],
  ]
);
assert.equal(ranked[1].ranking.tied, true);
assert.equal(ranked[1].ranking.tie_count, 2);
assert.equal(api.generatedRankingMatches({ ...ranked[1].ranking }, ranked[1].ranking), true);
assert.equal(api.generatedRankingMatches({ ...ranked[1].ranking, rank: 3 }, ranked[1].ranking), false);

assert.equal(api.bibtexEscape("A_B & 50% {x}\\# $^~"), "A\\_B \\& 50\\% \\{x\\}\\textbackslash{}\\# \\$\\textasciicircum{}\\textasciitilde{}");
assert.match(source, /author = \{\{\$\{bibtexEscape\(author\)\}\}\}/);

api.state.manifest = {
  data_release: {
    status: "official",
    reproducibility_contract_version: "open-reproducibility-2.0",
    license: { spdx_id: "CC-BY-4.0", name: "CC BY 4.0", url: "https://creativecommons.org/licenses/by/4.0/", scope: "Test" },
  },
};
api.renderReleaseMetadata();
assert.equal(elements.get("leaderboard-data-warning-title").textContent, "Official submitted-data release:");
assert.match(elements.get("leaderboard-data-warning-text").textContent, /submitter-provided metrics, spatial declarations, and profile predictions/);
assert.match(elements.get("leaderboard-data-warning").className, /is-official/);

api.state.manifest = {
  data_release: {
    id: "prototype-copy-test",
    status: "prototype",
    feed_sha256: "a".repeat(64),
    license: {
      spdx_id: "Apache-2.0",
      name: "Apache License 2.0",
      url: "https://www.apache.org/licenses/LICENSE-2.0",
      scope: "Test",
    },
  },
};
api.state.feedVerified = true;
api.state.loadedFeedSha256 = "a".repeat(64);
api.state.dataset = "";
api.renderReleaseMetadata();
assert.doesNotMatch(elements.get("leaderboard-data-warning-text").textContent, /Public code, model, and environment artifacts are optional/);
assert.match(elements.get("leaderboard-release-meta").textContent, /licence Apache License 2\.0/);
assert.doesNotMatch(elements.get("leaderboard-release-meta").textContent, /Apache-2\.0 — Apache License 2\.0/);
assert.doesNotMatch(elements.get("leaderboard-release-meta").textContent, /feed bytes verified/);
assert.doesNotMatch(elements.get("leaderboard-release-meta").textContent, /no immutable archive/);
assert.doesNotMatch(elements.get("leaderboard-release-meta").textContent, /no immutable release view/);
assert.equal(
  elements.get("leaderboard-claim-eligibility").textContent,
  "This data release is not declared eligible for academic citation or promotion."
);

const manifest = JSON.parse(fs.readFileSync(path.join(submissionRoot, "leaderboard/manifest.json"), "utf8"));
const feed = JSON.parse(fs.readFileSync(path.join(submissionRoot, manifest.all_file), "utf8"));
const leaderboardPageSource = fs.readFileSync(path.join(root, "_pages/leaderboard.md"), "utf8");
api.state.manifest = manifest;
api.state.metrics = new Map(manifest.metric_definitions.map((definition) => [definition.id, definition]));
api.state.rows = new Map(manifest.datasets.map((dataset) => [dataset.name, []]));
api.state.feedVerified = true;

assert.deepEqual(
  Object.keys(displayConfig).sort(),
  manifest.datasets.map((dataset) => dataset.slug).sort(),
  "every dataset must have exactly one headline-metric configuration"
);
manifest.datasets.forEach((dataset) => {
  api.state.dataset = dataset.name;
  const configuredIds = displayConfig[dataset.slug].headline_metric_ids;
  assert.equal(configuredIds.length, 5, `${dataset.name} must declare five headline metrics`);
  assert.equal(configuredIds[0], dataset.ranking.metric_id, `${dataset.name} must foreground its ranking metric`);
  configuredIds.forEach((metricId) => {
    assert.ok(dataset.metric_ids.includes(metricId), `${dataset.name} headline metric ${metricId} must exist in its feed`);
  });
  const configuredRadarIds = displayConfig[dataset.slug].radar_metric_ids;
  const compositeComponents = new Map((dataset.overall_score_composite?.components || []).map((component) => [component.metric_id, component]));
  assert.equal(new Set(configuredRadarIds).size, configuredRadarIds.length, `${dataset.name} radar axes must be unique`);
  configuredRadarIds.forEach((metricId) => {
    assert.ok(dataset.metric_ids.includes(metricId), `${dataset.name} radar metric ${metricId} must exist in its feed`);
    assert.ok(compositeComponents.has(metricId), `${dataset.name} radar metric ${metricId} must use a published score transform`);
  });
  if (configuredRadarIds.length < 3) {
    assert.match(
      displayConfig[dataset.slug].radar_unavailable_reason || "",
      /scored/i,
      `${dataset.name} must explain why a radar chart is scientifically unavailable`
    );
  } else {
    assert.equal(configuredRadarIds.length, 4, `${dataset.name} must declare four radar axes`);
  }
  assert.deepEqual(
    Array.from(api.radarMetricAxes(), (axis) => axis.definition.id),
    configuredRadarIds,
    `${dataset.name} radar order must follow its display configuration`
  );
  assert.deepEqual(
    Array.from(api.headlineMetricDefinitions(), (definition) => definition.id),
    configuredIds,
    `${dataset.name} summary metric order must follow its display configuration`
  );
  api.state.metricView = "summary";
  assert.deepEqual(
    Array.from(
      api
        .activeColumns()
        .filter((column) => column.definition)
        .map((column) => column.definition.id)
    ),
    configuredIds,
    `${dataset.name} summary table must contain only its headline metrics`
  );
  api.state.metricView = "full";
  api.state.visibleGroups = new Set(["absolute", "relative", "integral", "diagnostics", "scores", "model-details"]);
  assert.equal(
    api.activeColumns().filter((column) => column.definition).length,
    dataset.metric_ids.length,
    `${dataset.name} full table must retain every metric`
  );
});
api.state.metricView = "summary";

assert.equal(api.radarNormalizedValue(0, { transform: "bounded_error", cap: 20 }), 100);
assert.equal(api.radarNormalizedValue(10, { transform: "bounded_error", cap: 20 }), 50);
assert.equal(api.radarNormalizedValue(25, { transform: "bounded_error", cap: 20 }), 0);
assert.equal(api.radarNormalizedValue(0.82, { transform: "bounded_quality" }), 82);
assert.equal(api.radarNormalizedValue(-0.3, { transform: "bounded_quality" }), 0);
assert.equal(api.radarNormalizedValue(null, { transform: "bounded_quality" }), null);
assert.ok(
  leaderboardPageSource.indexOf('id="leaderboard-metric-view-toggle"') < leaderboardPageSource.indexOf('id="leaderboard-radar-panel"') &&
    leaderboardPageSource.indexOf('id="leaderboard-radar-panel"') < leaderboardPageSource.indexOf('class="leaderboard-table-wrap"'),
  "radar comparison must sit between the metric-view controls and leaderboard table"
);

const baseSurfacePressureDefinition = api.state.metrics.get("surface_pressure_rel_l2");
const baseSurfacePressureSnapshot = JSON.stringify(baseSurfacePressureDefinition);
const expectedSurfaceWeighting = new Map([
  ["AhmedML", "area-weighted"],
  ["AirfRANS", "length-weighted"],
  ["DrivAerML", "area-weighted"],
  ["DrivAerNet++", "area-weighted"],
  ["HiLiftAeroML", "area-weighted"],
  ["WindsorML", "area-weighted"],
]);
expectedSurfaceWeighting.forEach((weighting, datasetName) => {
  api.state.dataset = datasetName;
  const definition = api.metricDefinition("surface_pressure_rel_l2");
  assert.match(definition.label, new RegExp(`\\(${weighting}\\)$`));
  assert.match(definition.description, new RegExp(`^(?:Per-case )?${weighting}`, "i"));
  assert.notStrictEqual(definition, baseSurfacePressureDefinition, `${datasetName} must receive a resolved presentation copy`);
});
assert.equal(
  JSON.stringify(baseSurfacePressureDefinition),
  baseSurfacePressureSnapshot,
  "dataset presentation overrides must not mutate the shared metric definition"
);
manifest.datasets.forEach((dataset) => {
  api.state.dataset = dataset.name;
  api.activeMetricDefinitions().forEach((definition) => {
    assert.doesNotMatch(definition.label, /area- or length-weighted/i, `${dataset.name}/${definition.id} must use exact weighting wording`);
    assert.doesNotMatch(
      definition.description || "",
      /area- or length-weighted/i,
      `${dataset.name}/${definition.id} must use exact weighting wording`
    );
    assert.doesNotMatch(definition.label, /flow-domain (?:velocity|pressure)/i, `${dataset.name}/${definition.id} must use simple quantity names`);
    assert.doesNotMatch(
      definition.description || "",
      /flow-domain (?:velocity|pressure)/i,
      `${dataset.name}/${definition.id} must use simple quantity names`
    );
  });
});

feed.map(api.normalizeRow).forEach((row) => api.state.rows.get(row.dataset)?.push(row));
manifest.datasets.forEach((dataset) => {
  api.state.dataset = dataset.name;
  dataset.splits.forEach((split) => {
    api.state.split = split.name;
    const rankedRows = api.rowsForActiveSplit();
    rankedRows.forEach((row) => {
      assert.equal(
        row._ranking.source,
        "verified_generated_release",
        `${dataset.name}/${split.name}/${row.id} generated ranking must match an independent full-split calculation`
      );
    });
  });
});

api.state.manifest = {
  data_release: { release_view_url: "https://fluidsbench.org/releases/release-1/" },
};
assert.equal(
  api.canonicalResultPermalink({ id: "model-1", dataset_id: "ahmedml", split_id: "full" }),
  "https://fluidsbench.org/releases/release-1/?view=result&dataset=ahmedml&split=full&result=model-1"
);

async function verifyGeneratedClaimRecords() {
  api.state.manifest = manifest;
  api.state.loadedFeedSha256 = manifest.data_release.feed_sha256;
  const claimIndex = await api.ensureClaimsIndex();
  assert.ok(claimIndex, "claim index must pass browser-equivalent hash and binding verification");
  for (const dataset of manifest.datasets) {
    api.state.dataset = dataset.name;
    for (const split of dataset.splits) {
      api.state.split = split.name;
      for (const row of api.rowsForActiveSplit()) {
        await api.ensureClaimRecord(row);
        assert.equal(api.claimRecordCheck(row)?.status, "verified", `${dataset.name}/${split.name}/${row.id} claim record must verify`);
      }
    }
  }
}

function verifyOfficialAcademicHappyPath() {
  const submissionId = "model-rd-v2";
  const releaseId = "release-2026-07";
  const assetBaseUrl = `https://assets.fluidsbench.org/releases/${releaseId}/`;
  const releaseViewUrl = `https://fluidsbench.org/releases/${releaseId}/`;
  const resultPermalink = `${releaseViewUrl}?view=result&dataset=example&split=full&result=${submissionId}`;
  const claimRecordUrl = `${assetBaseUrl}leaderboard/claims/example/full/${submissionId}.json`;
  const feedSha256 = "a".repeat(64);
  const groundTruthSha256 = "b".repeat(64);
  const validationSha256 = "c".repeat(64);
  const evaluationSha256 = "d".repeat(64);
  const profileSha256 = "e".repeat(64);
  const ranking = {
    metric_id: "score",
    value: 9.94,
    ranked_value: 9.9,
    display_value: "9.9",
    unit: "points",
    direction: "higher",
    decimal_places: 1,
    rounding: "decimal_half_up",
    method: "competition",
    rank: 1,
    ranked_result_count: 1,
    tied: false,
    tie_count: 1,
  };
  const validation = {
    schema_version: "2.0",
    status: "validated",
    contract_version: "open-reproducibility-2.0",
    reference_version: "reference-v1",
    case_set_id: "standard",
    profile_ground_truth_release_id: "ground-truth-2026-07",
    profile_ground_truth_manifest_sha256: groundTruthSha256,
    validated_by: "Maintainer",
    validated_at: "2026-07-22T00:00:00Z",
    validation_scope: "submitted_data_only",
    model_execution: "not_performed",
    metric_recomputation: "not_performed",
    reviewed_submission_sha256: "f".repeat(64),
    evaluation_evidence_sha256: evaluationSha256,
    profile_index_sha256: profileSha256,
    evidence_path: `submissions/example/${submissionId}/maintainer-validation.json`,
    evidence_sha256: validationSha256,
  };
  const row = {
    id: submissionId,
    submission_id: submissionId,
    schema_version: "2.0",
    model: "R&D_v2",
    dataset: "Example",
    dataset_id: "example",
    split: "Full",
    split_id: "full",
    metricValues: { score: 9.94 },
    metric_values: { score: 9.94 },
    modelTypes: ["Mesh"],
    model_types: ["Mesh"],
    parameterCount: 1,
    approvalStatus: "approved",
    approval: { status: "approved", validation: { evidence_sha256: validationSha256 } },
    reproducibility: { contract_version: "open-reproducibility-2.0" },
    evaluation: { evidence_file: "evaluation-evidence.json", evidence_sha256: evaluationSha256 },
    profile_data: {
      index_file: `submissions/example/${submissionId}/profiles/index.json`,
      index_sha256: profileSha256,
      case_set_id: "standard",
      profile_ground_truth_release_id: "ground-truth-2026-07",
      profile_ground_truth_manifest_sha256: groundTruthSha256,
    },
    scoring_support: {
      status: "official",
      release_id: "example-scoring-v1",
      manifest_url: "https://example.test/scoring-support/manifest.json",
      manifest_sha256: "6".repeat(64),
    },
    spatial_discretization: {
      format: "fluidsbench-discretization-v1",
      file: "discretization.json",
      sha256: "7".repeat(64),
      summary: {
        training: {
          surface_input: {
            used: true,
            representation: "point_cloud",
            entity_counts: [{ entity: "vertex", count: { kind: "fixed", value: 1024 } }],
            native_comparison: {
              status: "reported",
              native_entity_counts: [{ entity: "vertex", count: { kind: "fixed", value: 8192 } }],
              fractions: [{ entity: "vertex", fraction: { kind: "fixed", value: 0.125 } }],
            },
            sampling: { kind: "fixed", method: "farthest point", seed: 7 },
            domain: {
              kind: "axis_aligned_box",
              coordinate_frame: "vehicle",
              length_unit: "m",
              minimum: [-1, -2, -3],
              maximum: [4, 5, 6],
              boundary_inclusion: "closed",
            },
            connectivity: "none",
          },
          surface_supervision: {
            used: true,
            representation: "point_cloud",
            entity_counts: [{ entity: "vertex", count: { kind: "fixed", value: 2048 } }],
            native_comparison: { status: "not_applicable" },
            sampling: { kind: "none" },
            domain: { kind: "full_dataset_domain" },
            connectivity: "none",
          },
          volume_input: { used: false },
          volume_supervision: { used: false },
        },
        inference: {
          geometry_dependency: "surface_geometry",
          surface_input: {
            used: true,
            representation: "point_cloud",
            entity_counts: [{ entity: "vertex", count: { kind: "fixed", value: 1024 } }],
            native_comparison: { status: "not_applicable" },
            sampling: { kind: "none" },
            domain: { kind: "full_dataset_domain" },
            connectivity: "none",
          },
          volume_input: { used: false },
          direct_outputs: [
            {
              id: "surface-output",
              domain: "surface",
              representation: {
                used: true,
                representation: "query_points",
                entity_counts: [{ entity: "point", count: { kind: "fixed", value: 4096 } }],
                native_comparison: { status: "not_applicable" },
                sampling: { kind: "none" },
                domain: { kind: "full_dataset_domain" },
                connectivity: "none",
              },
              queries_per_forward_pass: { kind: "fixed", value: 1024 },
            },
          ],
          mappings: [
            {
              support_id: "surface-support",
              source_output_id: "surface-output",
              method: { kind: "nearest" },
              implementation: "evaluation/map.py",
              extrapolation_policy: "forbidden",
              unmapped_fraction: 0,
              extrapolated_fraction: 0,
              final_coverage_fraction: 1,
            },
          ],
        },
        case_manifest: {
          format: "jsonl",
          file: "discretization/cases.jsonl",
          sha256: "3".repeat(64),
          case_count: 1,
        },
      },
    },
    case_metrics: {
      format: "fluidsbench-case-metrics-v1",
      file: "metrics/cases.json",
      sha256: "8".repeat(64),
      case_count: 1,
    },
    prediction_artifacts: [
      {
        artifact_id: "scored",
        kind: "scored_predictions",
        provider: "huggingface",
        repository_url: "https://huggingface.co/datasets/example/predictions",
        revision: "4".repeat(40),
        manifest_file: "fluidsbench-predictions.json",
        manifest_sha256: "5".repeat(64),
        format: "fluidsbench-prediction-artifact-v1",
        support_release_id: "example-scoring-v1",
        support_manifest_sha256: "6".repeat(64),
        split_id: "full",
        coverage: { kind: "complete_split", case_count: 1, expected_case_count: 1 },
        license_spdx: "CC-BY-4.0",
      },
    ],
    prediction_artifact_status: {
      sharing: "declared",
      declared_artifact_count: 1,
      maintainer_check_status: "recorded",
      checked_artifact_count: 1,
      check_file: `submissions/example/${submissionId}/prediction-artifact-checks.json`,
      check_sha256: "0".repeat(64),
      checks: [
        {
          artifact_id: "scored",
          status: "format_checked",
          checked_at: "2026-07-22T00:00:00Z",
          checked_by: "FluidsBench",
          repository_revision: "4".repeat(40),
          manifest_sha256: "5".repeat(64),
          checked_case_count: 1,
          recomputed_case_count: 0,
          expected_case_count: 1,
          metric_recomputation: "not_performed",
        },
      ],
    },
    maintainer_validation: validation,
    ranking,
    claim_eligibility: {
      academic_citation: true,
      promotion: true,
      reason_code: "approved_submitted_data_result",
      reason: "Approved submitted-data result in this immutable release.",
    },
    result_revision: {
      series_id: "model-rd",
      version: 2,
      supersedes: "model-rd-v1",
      change_summary: "Updated training and evaluation mapping.",
      is_latest: true,
      latest_submission_id: submissionId,
      version_count: 2,
    },
  };
  const trainingSurfaceSummary = api.representationSummary(row.spatial_discretization.summary.training.surface_input);
  assert.match(trainingSurfaceSummary, /vertex: 1,024 per case/i);
  assert.match(trainingSurfaceSummary, /native vertex: 8,192 per case/i);
  assert.match(trainingSurfaceSummary, /vertex: 12\.5% of native/i);
  assert.match(trainingSurfaceSummary, /sampling: farthest point/);
  assert.match(trainingSurfaceSummary, /domain: \[-1, -2, -3\] to \[4, 5, 6\] m in vehicle/);
  assert.doesNotMatch(trainingSurfaceSummary, /\[object Object\]/);
  const directOutputSummary = api.representationSummary(row.spatial_discretization.summary.inference.direct_outputs[0]);
  assert.match(directOutputSummary, /point: 4,096 per case/i);
  assert.match(directOutputSummary, /1,024 queries per forward pass/);
  assert.doesNotMatch(directOutputSummary, /\[object Object\]/);
  const declaredMappingSummary = api.mappingSummary(row);
  assert.match(declaredMappingSummary, /method: Nearest/);
  assert.match(declaredMappingSummary, /coverage: 100%/);
  assert.doesNotMatch(declaredMappingSummary, /\[object Object\]/);

  api.state.manifest = {
    all_file: "leaderboard/all.json",
    ranking_contract: {
      version: "1.0",
      scope: ["release_id", "dataset_id", "split_id"],
      method: "competition",
      tie_sequence_example: [1, 2, 2, 4],
      comparison: "rounded_metric_value",
      rounding: "decimal_half_up",
    },
    data_release: {
      id: releaseId,
      status: "official",
      generated_at: "2026-07-22T00:00:00Z",
      feed_sha256: feedSha256,
      archive_url: "https://doi.org/10.0000/fluidsbench.example",
      release_view_url: releaseViewUrl,
      asset_base_url: assetBaseUrl,
      reproducibility_contract_version: "open-reproducibility-2.0",
      profile_ground_truth: {
        release_id: "ground-truth-2026-07",
        manifest_url: "https://fluidsbench.org/releases/ground-truth-2026-07/manifest.json",
        manifest_sha256: groundTruthSha256,
      },
      license: {
        spdx_id: "CC-BY-4.0",
        name: "Creative Commons Attribution 4.0",
        url: "https://creativecommons.org/licenses/by/4.0/",
        scope: "Published result metadata.",
      },
      citation: { author: "FluidsBench contributors", title: "FluidsBench Leaderboard", publisher: "FluidsBench", year: 2026 },
    },
    metric_definitions: [{ id: "score", label: "Score", plain_label: "Score", unit: "points", digits: 1, direction: "higher" }],
    datasets: [
      {
        name: "Example",
        slug: "example",
        metric_ids: ["score"],
        ranking: { metric_id: "score", direction: "higher", decimal_places: 1, rounding: "decimal_half_up", method: "competition" },
        splits: [{ id: "full", name: "Full" }],
      },
    ],
  };
  api.state.metrics = new Map(api.state.manifest.metric_definitions.map((definition) => [definition.id, definition]));
  api.state.rows = new Map([["Example", [row]]]);
  const previousRow = {
    ...row,
    id: "model-rd-v1",
    submission_id: "model-rd-v1",
    submitted_at: "2026-07-20",
    date: "2026-07-20",
    ranking: undefined,
    claim_eligibility: undefined,
    result_revision: {
      series_id: "model-rd",
      version: 1,
      supersedes: null,
      change_summary: "Initial published result.",
      is_latest: false,
      latest_submission_id: submissionId,
      version_count: 2,
    },
  };
  api.state.revisionRows = new Map([["Example", [previousRow, row]]]);
  api.state.dataset = "Example";
  api.state.split = "Full";
  api.state.resultId = submissionId;
  api.state.feedVerified = true;
  api.state.loadedFeedSha256 = feedSha256;
  api.state.loadedManifestSha256 = "9".repeat(64);
  api.state.manifestPinVerified = true;
  api.state.releaseMismatch = false;
  api.state.groundTruthManifestProvenance = {
    release_id: "ground-truth-2026-07",
    sha256: groundTruthSha256,
  };
  api.state.claimsIndexProvenance = { status: "verified", sha256: "1".repeat(64) };
  api.state.claimRecords = new Map([
    [
      `${submissionId}|example|full`,
      {
        status: "verified",
        sha256: "2".repeat(64),
        url: claimRecordUrl,
        data: { claim_record_url: claimRecordUrl, result_permalink: resultPermalink },
      },
    ],
  ]);
  const validationUrl = `${assetBaseUrl}${validation.evidence_path}`;
  api.state.validationEvidenceChecks = new Map([[validationUrl, { status: "verified", sha256: validationSha256 }]]);

  const rankedRow = api.rowsForActiveSplit()[0];
  assert.equal(rankedRow._ranking.source, "verified_generated_release");
  const eligibility = api.claimEligibility(rankedRow);
  assert.equal(eligibility.academic_citation, true);
  assert.equal(eligibility.promotion, true);
  assert.equal(eligibility.browser_verification.passed, true);
  const missingArtifactAvailability = api.reproducibilityArtifactAvailability(rankedRow);
  assert.equal(missingArtifactAvailability.code, "not_supplied");
  assert.equal(missingArtifactAvailability.model, "not_supplied");
  assert.equal(missingArtifactAvailability.environment, "not_supplied");
  assert.equal(missingArtifactAvailability.documentation, "not_supplied");
  assert.equal(
    api.claimEligibility(rankedRow).academic_citation,
    true,
    "missing optional code, model, and environment artifacts must not gate citation"
  );
  assert.equal(api.claimEligibility(rankedRow).promotion, true, "missing optional code, model, and environment artifacts must not gate promotion");
  assert.equal(api.versionsForRow(rankedRow).length, 2);
  assert.equal(api.rowRanking(previousRow), null, "superseded versions must not receive a current release rank");
  assert.equal(api.claimEligibility(previousRow).academic_citation, false);
  api.openDetails(previousRow, false);
  const previousVersionDetails = elements.get("details-dialog-body").innerHTML;
  assert.match(previousVersionDetails, /Not ranked — superseded version/);
  assert.match(previousVersionDetails, /Initial published result/);
  assert.match(previousVersionDetails, /data-result-revision="model-rd-v2"/);
  api.openDetails(rankedRow, false);
  const missingArtifactDetails = elements.get("details-dialog-body").innerHTML;
  assert.match(missingArtifactDetails, /Code artifact availability<\/dt><dd>Not supplied \(optional\)/);
  assert.match(missingArtifactDetails, /Model artifact availability<\/dt><dd>Not supplied \(optional\)/);
  assert.match(missingArtifactDetails, /Environment artifact availability<\/dt><dd>Not supplied \(optional\)/);
  assert.match(missingArtifactDetails, /Their absence does not affect accuracy rank, academic-citation eligibility, or promotion eligibility/);
  assert.match(missingArtifactDetails, /Detailed methodology was not recorded under this result's schema/);

  const rowWithPrototypeMethodology = {
    ...rankedRow,
    methodology: {
      format: "fluidsbench-method-v1",
      record_kind: "prototype_fixture",
      record_note: "Fixture only <not author-verified>.",
      architecture: {
        description: "A compact graph surrogate used to exercise the leaderboard interface.",
        total_parameter_count: 1250000,
        parameter_count_basis: "rounded_from_reported_millions",
        submitter_trainable_parameter_count: 0,
        components: [
          {
            id: "prototype-surrogate",
            family: "Graph neural network",
            role: "Surface-field predictor.",
            description: "Aggregate component; internal layers were not recorded.",
            parameter_count: 1250000,
          },
        ],
        key_hyperparameters: [
          {
            id: "reported-variant",
            component_ids: ["prototype-surrogate"],
            name: "reported_model_variant",
            value: "GraphNet",
            description: "Only the displayed model family was retained.",
          },
        ],
        input_features: [
          {
            id: "surface-coordinates",
            component_ids: ["prototype-surrogate"],
            name: "surface_coordinates",
            domain: "surface",
            component_count: 3,
            description: "Three-dimensional surface coordinates.",
          },
        ],
        predicted_fields: [
          {
            field_id: "surface.p",
            domain: "surface",
            component_count: 1,
            component_ids: ["prototype-surrogate"],
            production: "direct_model_output",
            description: "Surface pressure fixture output.",
          },
        ],
      },
      data_handling: {
        normalization: "Not recorded for this prototype fixture.",
        preprocessing: "Not recorded for this prototype fixture.",
        sampling: "Not recorded for this prototype fixture.",
      },
      training: {
        stages: [
          {
            id: "prototype-training-not-recorded",
            status: "prototype_not_recorded",
            component_ids: ["prototype-surrogate"],
            description: "No executable training run accompanies this fixture.",
          },
        ],
      },
      checkpoints: [],
      inference_compute: {
        status: "not_measured",
        reason: "No retained model checkpoint is associated with this fixture.",
      },
    },
  };
  api.openDetails(rowWithPrototypeMethodology, false);
  const prototypeMethodologyDetails = elements.get("details-dialog-body").innerHTML;
  assert.match(prototypeMethodologyDetails, /Prototype fixture metadata — not author-verified/);
  assert.match(prototypeMethodologyDetails, /Fixture only &lt;not author-verified&gt;\./);
  assert.match(prototypeMethodologyDetails, /1,250,000/);
  assert.match(prototypeMethodologyDetails, /surface\.p/);
  assert.match(prototypeMethodologyDetails, /No retained model checkpoint is associated with this methodology record/);
  assert.match(prototypeMethodologyDetails, /Reason not measured<\/dt><dd>No retained model checkpoint is associated with this fixture/);

  const citation = api.citationValues();
  assert.match(citation.plain, /exact data release release-2026-07/);
  assert.match(citation.plain, /release manifest SHA-256 9999/);
  assert.match(citation.bibtex, /author = \{\{FluidsBench contributors\}\}/);
  assert.match(citation.bibtex, /R\\&D\\_v2/);
  assert.match(citation.promotion, /rank 1 of 1/);
  assert.match(citation.promotion, /did not run the model/);
  assert.match(citation.promotion, /did not recompute base metrics/);

  const provenance = api.exportProvenance(1);
  const exportColumns = api.exportMetadataColumns(provenance);
  const columnNames = new Set(exportColumns.map(([name]) => name));
  [
    "release_id",
    "leaderboard_manifest_sha256",
    "leaderboard_manifest_pin_verified",
    "rank",
    "ranking_metric_id",
    "ranking_scope_release_id",
    "ranking_scope_dataset_id",
    "ranking_scope_split_id",
    "declared_academic_citation_eligible",
    "declared_promotion_eligible",
    "browser_verification_status",
    "claim_record_url",
    "scoring_support_release_id",
    "scoring_support_manifest_sha256",
    "discretization_sha256",
    "case_metrics_sha256",
    "prediction_data_status",
    "prediction_artifact_check_status",
    "prediction_metric_recomputation",
    "reproducibility_code_artifact_availability",
    "reproducibility_model_artifact_availability",
    "reproducibility_environment_artifact_availability",
    "reproducibility_artifact_documentation_availability",
    "methodology_format",
    "methodology_record_kind",
    "methodology_total_parameter_count",
    "methodology_json",
  ].forEach((name) => assert.equal(columnNames.has(name), true, `${name} must be present in CSV exports`));
  const exportValues = new Map(exportColumns.map(([name, value]) => [name, value(rankedRow)]));
  assert.equal(exportValues.get("prediction_artifact_check_record_file"), `submissions/example/${submissionId}/prediction-artifact-checks.json`);
  assert.equal(exportValues.get("prediction_artifact_check_record_sha256"), "0".repeat(64));
  assert.equal(exportValues.get("reproducibility_code_artifact_availability"), "not_supplied");
  assert.equal(exportValues.get("reproducibility_model_artifact_availability"), "not_supplied");
  assert.equal(exportValues.get("reproducibility_environment_artifact_availability"), "not_supplied");
  assert.equal(exportValues.get("reproducibility_artifact_documentation_availability"), "not_supplied");
  assert.equal(exportValues.get("reproducibility_code_repository"), undefined);
  assert.equal(exportValues.get("model_artifact_url"), undefined);
  assert.equal(exportValues.get("environment_url"), undefined);
  const exportedRow = api.sourceSubmission(rankedRow);
  assert.equal(exportedRow.ranking.rank, 1);
  assert.equal(exportedRow.claim_eligibility.academic_citation, true);
  assert.equal(exportedRow.browser_verification.passed, true);
  assert.equal(exportedRow.copy_readiness.promotion, true);
  assert.equal(exportedRow.claim_record.url, claimRecordUrl);
  assert.equal(exportedRow.spatial_provenance.scoring_support.release_id, "example-scoring-v1");
  assert.equal(exportedRow.spatial_provenance.discretization.sha256, "7".repeat(64));
  assert.equal(exportedRow.spatial_provenance.discretization.cases_file, "discretization/cases.jsonl");
  assert.equal(exportedRow.spatial_provenance.discretization.cases_sha256, "3".repeat(64));
  assert.equal(exportedRow.prediction_evidence.availability.label, "Complete · 1/1");
  assert.equal(exportedRow.prediction_evidence.artifact_check.display_status.label, "Format checked");
  assert.equal(exportedRow.prediction_evidence.metric_recomputation.label, "Not performed");
  assert.equal(exportedRow.prediction_evidence.maintainer_checks.file, `submissions/example/${submissionId}/prediction-artifact-checks.json`);
  assert.equal(exportedRow.prediction_evidence.maintainer_checks.sha256, "0".repeat(64));
  assert.equal(exportedRow.reproducibility_artifact_availability.code, "not_supplied");
  assert.equal(exportedRow.reproducibility_artifact_availability.model, "not_supplied");
  assert.equal(exportedRow.reproducibility_artifact_availability.environment, "not_supplied");
  assert.equal(exportedRow.reproducibility_artifact_availability.documentation, "not_supplied");
  assert.equal(api.claimEligibility(rankedRow).academic_citation, true, "optional prediction metadata must not gate citation");
  assert.equal(api.claimEligibility(rankedRow).promotion, true, "optional prediction metadata must not gate promotion");

  row.reproducibility.code = {
    repository_url: "https://github.com/example/model",
    commit: "a".repeat(40),
    license_spdx: "Apache-2.0",
  };
  row.reproducibility.model_artifact = {
    url: "https://huggingface.co/example/model",
    sha256: "a".repeat(64),
    license_spdx: "Apache-2.0",
  };
  row.reproducibility.environment = {
    kind: "lockfile",
    url: "https://github.com/example/model/blob/main/conda-lock.yml",
    sha256: "b".repeat(64),
  };
  row.reproducibility.artifact_documentation_url = "https://github.com/example/model/blob/main/README.md";
  const rowWithArtifacts = api.rowsForActiveSplit()[0];
  const providedArtifactAvailability = api.reproducibilityArtifactAvailability(rowWithArtifacts);
  assert.equal(providedArtifactAvailability.code, "provided");
  assert.equal(providedArtifactAvailability.model, "provided");
  assert.equal(providedArtifactAvailability.environment, "provided");
  assert.equal(providedArtifactAvailability.documentation, "provided");
  assert.equal(api.claimEligibility(rowWithArtifacts).academic_citation, true, "provided optional artifacts must not change citation eligibility");
  assert.equal(api.claimEligibility(rowWithArtifacts).promotion, true, "provided optional artifacts must not change promotion eligibility");
  const providedExportValues = new Map(exportColumns.map(([name, value]) => [name, value(rowWithArtifacts)]));
  assert.equal(providedExportValues.get("reproducibility_code_artifact_availability"), "provided");
  assert.equal(providedExportValues.get("reproducibility_code_repository"), "https://github.com/example/model");
  assert.equal(providedExportValues.get("reproducibility_model_artifact_availability"), "provided");
  assert.equal(providedExportValues.get("model_artifact_url"), "https://huggingface.co/example/model");
  assert.equal(providedExportValues.get("reproducibility_environment_artifact_availability"), "provided");
  assert.equal(providedExportValues.get("environment_url"), "https://github.com/example/model/blob/main/conda-lock.yml");
  assert.equal(providedExportValues.get("reproducibility_artifact_documentation_availability"), "provided");
  assert.equal(providedExportValues.get("artifact_documentation_url"), "https://github.com/example/model/blob/main/README.md");
  const providedExportedRow = api.sourceSubmission(rowWithArtifacts);
  assert.equal(providedExportedRow.reproducibility_artifact_availability.code, "provided");
  assert.equal(providedExportedRow.reproducibility.code.repository_url, "https://github.com/example/model");
  assert.equal(providedExportedRow.reproducibility.model_artifact.url, "https://huggingface.co/example/model");
  assert.equal(providedExportedRow.reproducibility.environment.url, "https://github.com/example/model/blob/main/conda-lock.yml");
  api.openDetails(rowWithArtifacts, false);
  const providedArtifactDetails = elements.get("details-dialog-body").innerHTML;
  assert.match(providedArtifactDetails, /Code artifact availability<\/dt><dd>Provided/);
  assert.match(providedArtifactDetails, /Model artifact availability<\/dt><dd>Provided/);
  assert.match(providedArtifactDetails, /Environment artifact availability<\/dt><dd>Provided/);
  assert.match(providedArtifactDetails, /Code repository \(optional\)/);
  assert.match(providedArtifactDetails, /Model artifact \(optional\)/);
  assert.match(providedArtifactDetails, /Environment artifact \(optional\)/);
  delete row.reproducibility.code;
  delete row.reproducibility.model_artifact;
  delete row.reproducibility.environment;
  delete row.reproducibility.artifact_documentation_url;

  row.prediction_artifact_status.checks[0].status = "metrics_recomputed";
  row.prediction_artifact_status.checks[0].metric_recomputation = "performed";
  row.prediction_artifact_status.checks[0].recomputed_case_count = 1;
  const recomputedCitation = api.citationValues();
  assert.match(recomputedCitation.promotion, /recomputed the complete evaluation\/test split metrics/);
  assert.doesNotMatch(recomputedCitation.promotion, /did not recompute base metrics/);

  row.schema_version = "3.0";
  row.reproducibility.contract_version = "open-reproducibility-3.0";
  validation.schema_version = "3.0";
  validation.contract_version = "open-reproducibility-3.0";
  validation.scoring_support_release_id = "example-scoring-v1";
  validation.scoring_support_manifest_sha256 = "6".repeat(64);
  validation.discretization_sha256 = "7".repeat(64);
  validation.case_metrics_sha256 = "8".repeat(64);
  api.state.manifest.data_release.reproducibility_contract_version = "open-reproducibility-3.0";
  api.state.manifest.datasets[0].scoring_support = {
    status: "official",
    submissions_open: false,
    closed_reason: "This immutable release is no longer accepting submissions.",
    owner_approval: {
      approved_by: "Dataset owner",
      approved_at: "2026-07-20T00:00:00Z",
      pull_request_url: "https://github.com/example/repository/pull/1",
    },
    ...row.scoring_support,
  };
  row.prediction_artifact_status.checks[0].status = "failed";
  row.prediction_artifact_status.checks[0].metric_recomputation = "not_performed";
  row.prediction_artifact_status.checks[0].recomputed_case_count = 0;
  const v3RankedRow = api.rowsForActiveSplit()[0];
  assert.equal(api.claimEligibility(v3RankedRow).academic_citation, true, "approved schema-v3 results remain citable after submissions close");
  assert.equal(api.claimEligibility(v3RankedRow).promotion, true, "optional prediction-check failure must not gate promotion");
  assert.equal(api.reproducibilityArtifactAvailability(v3RankedRow).code, "not_supplied");
  assert.equal(
    api.claimEligibility(v3RankedRow).academic_citation,
    true,
    "schema-v3 citations must not require optional code, model, or environment artifacts"
  );
  assert.equal(
    api.claimEligibility(v3RankedRow).promotion,
    true,
    "schema-v3 promotions must not require optional code, model, or environment artifacts"
  );
  const ownerApproval = api.state.manifest.datasets[0].scoring_support.owner_approval;
  delete api.state.manifest.datasets[0].scoring_support.owner_approval;
  assert.equal(api.claimEligibility(v3RankedRow).academic_citation, false, "schema-v3 claims require the frozen dataset-owner approval");
  api.state.manifest.datasets[0].scoring_support.owner_approval = ownerApproval;
  api.state.manifest.datasets[0].scoring_support.status = "owner_review_required";
  assert.equal(api.claimEligibility(v3RankedRow).academic_citation, false, "schema-v3 claims require official scoring support in the frozen release");
  api.state.manifest.datasets[0].scoring_support.status = "official";

  api.renderReleaseMetadata();
  assert.equal(elements.get("open-citation-dialog").disabled, false);
  assert.equal(elements.get("leaderboard-claim-eligibility").hidden, true);
  validation.status = "pending";
  api.renderReleaseMetadata();
  assert.equal(elements.get("open-citation-dialog").disabled, true);
  assert.equal(elements.get("leaderboard-claim-eligibility").hidden, false);
  assert.match(elements.get("leaderboard-claim-eligibility").textContent, /browser verification has not passed/);
  assert.match(elements.get("leaderboard-claim-eligibility").textContent, /submitted-data-only contract/);
}

function verifyPredictionEvidenceLabels() {
  const empty = { prediction_artifacts: [] };
  assert.equal(api.predictionAvailability(empty).label, "Not shared");
  assert.equal(api.predictionArtifactStatus(empty).label, "Not applicable");
  assert.equal(api.predictionMetricRecomputation(empty).label, "Not performed");

  const examples = {
    prediction_artifacts: [
      {
        artifact_id: "examples",
        kind: "scored_predictions",
        coverage: { kind: "example_cases", case_count: 3, expected_case_count: 50 },
      },
    ],
    prediction_artifact_status: {
      sharing: "declared",
      declared_artifact_count: 1,
      maintainer_check_status: "recorded",
      checked_artifact_count: 1,
      checks: [
        {
          artifact_id: "examples",
          status: "accessible",
          checked_case_count: 3,
          recomputed_case_count: 3,
          expected_case_count: 50,
          metric_recomputation: "partial",
        },
      ],
    },
  };
  assert.equal(api.predictionAvailability(examples).label, "Examples · 3/50");
  assert.equal(api.predictionArtifactStatus(examples).label, "Accessible");
  assert.equal(api.predictionMetricRecomputation(examples).label, "Example cases recomputed · 3/50");

  examples.prediction_artifact_status.checks[0].status = "failed";
  examples.prediction_artifact_status.checks[0].metric_recomputation = "not_performed";
  examples.prediction_artifact_status.checks[0].recomputed_case_count = 0;
  assert.equal(api.predictionArtifactStatus(examples).label, "Check failed");
  assert.equal(api.predictionMetricRecomputation(examples).label, "Not performed");

  const legacy = {
    ...examples,
    prediction_artifact_status: undefined,
    prediction_artifact_checks: [
      {
        artifact_id: "examples",
        status: "format_checked",
        checked_case_count: 3,
        recomputed_case_count: 0,
        expected_case_count: 50,
        metric_recomputation: "not_performed",
      },
    ],
  };
  assert.equal(api.predictionArtifactStatus(legacy).label, "Format checked");

  const multiple = {
    prediction_artifacts: [
      {
        artifact_id: "primary-complete",
        kind: "scored_predictions",
        coverage: { kind: "complete_split", case_count: 50, expected_case_count: 50 },
      },
      {
        artifact_id: "secondary-examples",
        kind: "direct_model_outputs",
        coverage: { kind: "example_cases", case_count: 3, expected_case_count: 50 },
      },
    ],
    prediction_artifact_status: {
      checks: [
        {
          artifact_id: "secondary-examples",
          status: "metrics_recomputed",
          checked_case_count: 3,
          recomputed_case_count: 3,
          expected_case_count: 50,
          metric_recomputation: "partial",
        },
      ],
    },
  };
  assert.equal(api.predictionAvailability(multiple).label, "Complete · 50/50");
  assert.equal(api.predictionArtifactStatus(multiple).label, "Not checked");
  assert.equal(api.predictionMetricRecomputation(multiple).label, "Not performed");
}

function verifyDatasetSubmissionAvailability() {
  api.state.manifest = {
    datasets: [
      {
        name: "Pending",
        slug: "pending",
        scoring_support: {
          status: "owner_review_required",
          submissions_open: false,
          closed_reason: "Dataset-owner scoring-support approval is pending",
        },
      },
    ],
  };
  api.state.dataset = "Pending";
  api.renderSubmissionAvailability();
  assert.equal(elements.get("open-submission-repo").disabled, true);
  assert.equal(elements.get("submission-status").textContent, "Submissions are currently closed.");

  api.state.manifest.datasets[0].scoring_support = {
    status: "official",
    release_id: "pending-scoring-v1",
    submissions_open: true,
  };
  api.renderSubmissionAvailability();
  assert.equal(elements.get("open-submission-repo").disabled, false);
  assert.match(elements.get("submission-status").textContent, /submissions are open/);
  assert.equal(
    api.scoringSupportSummary({ schema_version: "2.0" }).release_id,
    undefined,
    "historical rows must not inherit the active dataset scoring support"
  );
}

verifyGeneratedClaimRecords()
  .then(() => {
    verifyPredictionEvidenceLabels();
    verifyDatasetSubmissionAvailability();
    verifyOfficialAcademicHappyPath();
    console.log("leaderboard claim UI checks passed");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

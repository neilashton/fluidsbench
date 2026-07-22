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
const source = fs.readFileSync(scriptPath, "utf8");
const marker = "})();";
const markerIndex = source.lastIndexOf(marker);
assert.notEqual(markerIndex, -1, "leaderboard script must end with its IIFE");
const instrumented = `${source.slice(0, markerIndex)}
window.__FluidsBenchClaimTest = {
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
  leaderboardManifestProvenance,
  claimRecordCheck,
  normalizeRow,
  renderReleaseMetadata,
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
      if (!elements.has(id)) elements.set(id, { hidden: false, open: false, textContent: "" });
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
assert.match(elements.get("leaderboard-data-warning-text").textContent, /submitter-provided metrics and profile predictions/);
assert.match(elements.get("leaderboard-data-warning").className, /is-official/);

const manifest = JSON.parse(fs.readFileSync(path.join(submissionRoot, "leaderboard/manifest.json"), "utf8"));
const feed = JSON.parse(fs.readFileSync(path.join(submissionRoot, manifest.all_file), "utf8"));
api.state.manifest = manifest;
api.state.metrics = new Map(manifest.metric_definitions.map((definition) => [definition.id, definition]));
api.state.rows = new Map(manifest.datasets.map((dataset) => [dataset.name, []]));
api.state.feedVerified = true;
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
    maintainer_validation: validation,
    ranking,
    claim_eligibility: {
      academic_citation: true,
      promotion: true,
      reason_code: "approved_submitted_data_result",
      reason: "Approved submitted-data result in this immutable release.",
    },
  };
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

  const citation = api.citationValues();
  assert.match(citation.plain, /exact data release release-2026-07/);
  assert.match(citation.plain, /release manifest SHA-256 9999/);
  assert.match(citation.bibtex, /author = \{\{FluidsBench contributors\}\}/);
  assert.match(citation.bibtex, /R\\&D\\_v2/);
  assert.match(citation.promotion, /rank 1 of 1/);
  assert.match(citation.promotion, /not run the model or recompute base metrics/);

  const provenance = api.exportProvenance(1);
  const columnNames = new Set(api.exportMetadataColumns(provenance).map(([name]) => name));
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
  ].forEach((name) => assert.equal(columnNames.has(name), true, `${name} must be present in CSV exports`));
  const exportedRow = api.sourceSubmission(rankedRow);
  assert.equal(exportedRow.ranking.rank, 1);
  assert.equal(exportedRow.claim_eligibility.academic_citation, true);
  assert.equal(exportedRow.browser_verification.passed, true);
  assert.equal(exportedRow.copy_readiness.promotion, true);
  assert.equal(exportedRow.claim_record.url, claimRecordUrl);

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

verifyGeneratedClaimRecords()
  .then(() => {
    verifyOfficialAcademicHappyPath();
    console.log("leaderboard claim UI checks passed");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

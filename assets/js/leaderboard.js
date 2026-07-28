(function () {
  "use strict";

  const baseUrl = window.FluidsBenchLeaderboardBaseUrl;
  const manifestUrl = window.FluidsBenchLeaderboardManifestUrl;
  const expectedManifestSha256 = String(window.FluidsBenchLeaderboardManifestSha256 || "").trim();
  const groundTruthBaseUrl = window.FluidsBenchProfileGroundTruthBaseUrl;
  const palette = [
    "#0072b2",
    "#d55e00",
    "#009e73",
    "#cc79a7",
    "#e69f00",
    "#56b4e9",
    "#f0e442",
    "#000000",
    "#6f4e7c",
    "#2f4b7c",
    "#8c564b",
    "#17becf",
  ];
  const maxFigureModels = palette.length;
  const reproducibilityContractVersions = {
    2: "open-reproducibility-2.0",
    3: "open-reproducibility-3.0",
  };
  const columnGroups = [
    { id: "absolute", label: "Absolute", className: "metric-group-absolute" },
    { id: "relative", label: "Relative", className: "metric-group-relative" },
    { id: "integral", label: "Integral forces / moments", className: "metric-group-integral" },
    { id: "scores", label: "Scores", className: "metric-group-scores" },
    { id: "model-details", label: "Model details", className: "metric-group-neutral" },
  ];

  const state = {
    manifest: null,
    metrics: new Map(),
    rows: new Map(),
    loadedManifestSha256: null,
    manifestPinVerified: false,
    groundTruthManifest: null,
    groundTruthIndexes: new Map(),
    groundTruthChunks: new Map(),
    profileIndexes: new Map(),
    profileChunks: new Map(),
    feedRowsLoaded: false,
    loadedFeedSha256: null,
    feedVerified: false,
    groundTruthManifestProvenance: null,
    groundTruthComparisonHealthy: false,
    groundTruthComparisonKey: "",
    groundTruthComparisonCaseSetId: "",
    validationEvidenceChecks: new Map(),
    validationEvidencePromises: new Map(),
    claimsIndex: null,
    claimsIndexProvenance: null,
    claimsIndexPromise: null,
    claimRecords: new Map(),
    claimRecordPromises: new Map(),
    dataset: "",
    split: "",
    modelType: "",
    sortKey: "rank",
    sortDirection: "asc",
    visibleGroups: new Set(),
    exportScope: "current",
    comparedModelIds: new Set(),
    staleComparedModelIds: new Set(),
    comparisonMetric: "",
    scatterX: "",
    scatterY: "",
    panelSelections: new Map(),
    profileCaseIds: [],
    profileCase: "",
    groundTruthCase: null,
    profileCases: new Map(),
    profileCaseErrors: new Map(),
    charts: {},
    figureSpecs: new Map(),
    figureCaptions: new Map(),
    resultId: "",
    requestedReleaseId: "",
    requestedResultId: "",
    releaseMismatch: false,
    resultUnavailable: false,
    loadVersion: 0,
    profileLoadVersion: 0,
    profileReadyVersion: -1,
  };
  let helpHideTimer = null;
  let activeHelpButton = null;

  function element(id) {
    return document.getElementById(id);
  }

  function datasetSelects() {
    return document.querySelectorAll("[data-leaderboard-dataset-select]");
  }

  function splitSelects() {
    return document.querySelectorAll("[data-leaderboard-split-select]");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formattedMetricLabelHtml(value) {
    return escapeHtml(value).replace(/\bC_([DLM])\b/g, "C<sub>$1</sub>");
  }

  function appendFormattedMetricLabel(parent, value) {
    const label = document.createElement("span");
    label.className = "leaderboard-metric-label";
    label.innerHTML = formattedMetricLabelHtml(value);
    parent.appendChild(label);
  }

  function plainMetricLabel(definition) {
    return definition?.plain_label || definition?.label || "";
  }

  function slug(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function finiteNumber(value) {
    if (value === null || value === undefined || typeof value === "boolean") return null;
    if (typeof value === "string" && !value.trim()) return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function isLocalUrl(value) {
    try {
      return ["127.0.0.1", "localhost", "::1"].includes(new URL(value, window.location.href).hostname);
    } catch (_error) {
      return false;
    }
  }

  function leaderboardAssetBaseUrl() {
    if (isLocalUrl(baseUrl)) return baseUrl;
    return safeHttpUrl(dataRelease().asset_base_url) || baseUrl;
  }

  function declaredLeaderboardAssetUrl(file) {
    const declaredBase = safeHttpUrl(dataRelease().asset_base_url);
    return declaredBase ? fileUrl(file, declaredBase) : "";
  }

  function fileUrl(file, root = leaderboardAssetBaseUrl()) {
    const normalizedRoot = root.endsWith("/") ? root : `${root}/`;
    return new URL(file, normalizedRoot).href;
  }

  function dataRelease() {
    return state.manifest?.data_release || {};
  }

  function resultDataOriginLabel() {
    const origin = publicationScope().result_data_origin;
    if (origin === "submitter_provided") return "submitter-provided";
    if (origin === "illustrative_dummy_data") return "illustrative prototype";
    return humanize(origin || "not supplied").toLowerCase();
  }

  function publicationScope() {
    const prototype = dataRelease().status === "prototype_dummy_data";
    return {
      result_data_origin: prototype ? "illustrative_dummy_data" : "submitter_provided",
      validation_scope: prototype ? "not_applicable" : "submitted_data_only",
      model_execution: "not_performed",
      metric_recomputation: prototype ? "not_applicable" : "result_specific",
    };
  }

  function submissionSchemaMajor(row) {
    const major = Number(String(row?.schema_version || "1").split(".")[0]);
    return Number.isInteger(major) ? major : 1;
  }

  function expectedReproducibilityContract(row) {
    return reproducibilityContractVersions[submissionSchemaMajor(row)] || null;
  }

  function supportedReproducibilityContract(value) {
    return Object.values(reproducibilityContractVersions).includes(value);
  }

  function releaseViewUrl() {
    return safeHttpUrl(dataRelease().release_view_url);
  }

  function groundTruthManifestVerified() {
    const expected = dataRelease().profile_ground_truth || {};
    const loaded = state.groundTruthManifestProvenance || {};
    return Boolean(
      expected.release_id && expected.manifest_sha256 && loaded.release_id === expected.release_id && loaded.sha256 === expected.manifest_sha256
    );
  }

  function releaseGroundTruthManifestUrl() {
    const declared = safeHttpUrl(dataRelease().profile_ground_truth?.manifest_url);
    const localOrPrototype = isLocalUrl(groundTruthBaseUrl) || dataRelease().status === "prototype_dummy_data";
    if (localOrPrototype) return fileUrl("manifest.json", groundTruthBaseUrl);
    return declared;
  }

  function currentGroundTruthComparisonKey() {
    return [dataRelease().id || "unversioned", state.dataset, state.split, state.profileCase].join("|");
  }

  function setGroundTruthComparisonHealth(healthy, caseSetId = "") {
    state.groundTruthComparisonHealthy = Boolean(healthy);
    state.groundTruthComparisonKey = healthy ? currentGroundTruthComparisonKey() : "";
    state.groundTruthComparisonCaseSetId = healthy ? caseSetId : "";
  }

  function activeSplitDefinition() {
    return splitOptions().find((split) => split.name === state.split);
  }

  function viewSearchParams(includeResult = true) {
    const params = new URLSearchParams();
    const dataset = activeDataset();
    const split = activeSplitDefinition();
    if (dataRelease().id) params.set("release", dataRelease().id);
    if (dataset) params.set("dataset", slug(dataset.name));
    if (split) params.set("split", split.id || slug(split.name));
    if (state.modelType) params.set("model_type", state.modelType);
    params.set("sort", state.sortKey);
    params.set("direction", state.sortDirection);
    params.set(
      "columns",
      columnGroups
        .map(({ id }) => id)
        .filter((id) => state.visibleGroups.has(id))
        .join(",")
    );
    params.set("models", Array.from(state.comparedModelIds).join(","));
    if (state.comparisonMetric) params.set("comparison", state.comparisonMetric);
    if (state.scatterX) params.set("scatter_x", state.scatterX);
    if (state.scatterY) params.set("scatter_y", state.scatterY);
    if (state.profileCase) params.set("case", state.profileCase);
    (dataset?.diagnostic_panels || []).forEach((panel) => {
      const selection = panelSelection(panel);
      if (selection.quantity) params.set(`quantity_${panel.id}`, selection.quantity);
      if (selection.station) params.set(`station_${panel.id}`, selection.station);
    });
    if (includeResult && state.resultId) params.set("result", state.resultId);
    return params;
  }

  function readUrlState() {
    const params = new URLSearchParams(window.location.search);
    return {
      releaseId: params.get("release") || "",
      dataset: params.get("dataset") || "",
      split: params.get("split") || "",
      modelType: params.get("model_type") || "",
      sortKey: params.get("sort") || "",
      sortDirection: params.get("direction") || "",
      visibleGroups: (params.get("columns") || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      hasVisibleGroups: params.has("columns"),
      comparedModelIds: (params.get("models") || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      hasComparedModelIds: params.has("models"),
      comparisonMetric: params.get("comparison") || "",
      scatterX: params.get("scatter_x") || "",
      scatterY: params.get("scatter_y") || "",
      profileCase: params.get("case") || "",
      resultId: params.get("result") || "",
      params,
    };
  }

  function updateUrl() {
    if (!state.dataset) return;
    const query = viewSearchParams().toString();
    window.history.replaceState(null, "", `${window.location.pathname}?${query}${window.location.hash}`);
  }

  function currentViewUrl(canonical = false, includeResult = true) {
    const root = canonical && dataRelease().canonical_url ? dataRelease().canonical_url : window.location.href;
    const url = new URL(root, window.location.href);
    url.search = viewSearchParams(includeResult).toString();
    url.hash = "";
    return url.href;
  }

  function resultUrl(row, canonical = false) {
    const verifiedClaim = verifiedClaimRecord(row);
    if (canonical && verifiedClaim?.result_permalink) return verifiedClaim.result_permalink;
    const immutablePermalink = canonicalResultPermalink(row);
    if (canonical && immutablePermalink) return immutablePermalink;
    const root = window.location.href;
    const url = new URL(root, window.location.href);
    const params = viewSearchParams(false);
    params.set("result", row.id);
    url.search = params.toString();
    url.hash = "";
    return url.href;
  }

  function canonicalResultPermalink(row) {
    if (!releaseViewUrl()) return "";
    const url = new URL(releaseViewUrl(), window.location.href);
    ["view", "dataset", "split", "result"].forEach((key) => url.searchParams.delete(key));
    url.searchParams.append("view", "result");
    url.searchParams.append("dataset", row.dataset_id || slug(row.dataset));
    url.searchParams.append("split", row.split_id || slug(row.split));
    url.searchParams.append("result", row.id);
    url.hash = "";
    return url.href;
  }

  function citedViewUrl() {
    const url = new URL(releaseViewUrl() || window.location.href, window.location.href);
    const params = new URLSearchParams();
    const dataset = activeDataset();
    const split = activeSplitDefinition();
    if (dataset) params.set("dataset", dataset.slug || slug(dataset.name));
    if (split) params.set("split", split.id || slug(split.name));
    url.search = params.toString();
    url.hash = "";
    return url.href;
  }

  async function sha256Hex(value) {
    if (!window.crypto?.subtle) return null;
    const digest = await window.crypto.subtle.digest("SHA-256", value);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  async function fetchJsonWithProvenance(url, label) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}`);
    const bytes = await response.arrayBuffer();
    const text = new TextDecoder("utf-8").decode(bytes);
    return { data: JSON.parse(text), text, sha256: await sha256Hex(bytes) };
  }

  function verifyManifestSha256(loadedSha256, expectedSha256 = expectedManifestSha256) {
    const expected = String(expectedSha256 || "").trim();
    const loaded = String(loadedSha256 || "").trim();
    if (expected && !/^[a-f0-9]{64}$/.test(expected)) {
      throw new Error("the release snapshot contains an invalid publication-time leaderboard manifest SHA-256");
    }
    if (!expected) return { required: false, expected_sha256: null, loaded_sha256: loaded || null, verified: false };
    if (!loaded) throw new Error("this browser cannot verify the publication-time leaderboard manifest SHA-256");
    if (loaded !== expected) {
      throw new Error("leaderboard manifest bytes do not match the publication-time release snapshot SHA-256");
    }
    return { required: true, expected_sha256: expected, loaded_sha256: loaded, verified: true };
  }

  function leaderboardManifestProvenance() {
    return {
      url: manifestUrl,
      publication_sha256: expectedManifestSha256 || null,
      loaded_sha256: state.loadedManifestSha256,
      pin_required: Boolean(expectedManifestSha256),
      pin_verified: state.manifestPinVerified,
    };
  }

  function releaseManifestSha256() {
    return expectedManifestSha256 || state.loadedManifestSha256 || "";
  }

  function claimsReleaseMetadata() {
    const claims = dataRelease().claims;
    return claims && typeof claims === "object" ? claims : {};
  }

  function jsonStructuresEqual(left, right) {
    if (left === right) return true;
    if (Array.isArray(left) || Array.isArray(right)) {
      return (
        Array.isArray(left) &&
        Array.isArray(right) &&
        left.length === right.length &&
        left.every((value, index) => jsonStructuresEqual(value, right[index]))
      );
    }
    if (left && right && typeof left === "object" && typeof right === "object") {
      const leftKeys = Object.keys(left).sort();
      const rightKeys = Object.keys(right).sort();
      return (
        leftKeys.length === rightKeys.length && leftKeys.every((key, index) => key === rightKeys[index] && jsonStructuresEqual(left[key], right[key]))
      );
    }
    return false;
  }

  function claimRecordKey(row) {
    return [row?.id, row?.dataset_id || slug(row?.dataset), row?.split_id || slug(row?.split)].join("|");
  }

  function claimIndexEntry(row) {
    if (!Array.isArray(state.claimsIndex?.records)) return null;
    return (
      state.claimsIndex.records.find(
        (entry) =>
          entry.submission_id === row.id &&
          entry.dataset_id === (row.dataset_id || slug(row.dataset)) &&
          entry.split_id === (row.split_id || slug(row.split))
      ) || null
    );
  }

  function claimRecordCheck(row) {
    return state.claimRecords.get(claimRecordKey(row)) || null;
  }

  function verifiedClaimRecord(row) {
    const check = claimRecordCheck(row);
    return check?.status === "verified" ? check.data : null;
  }

  async function ensureClaimsIndex() {
    if (state.claimsIndex) return state.claimsIndex;
    if (state.claimsIndexPromise) return state.claimsIndexPromise;
    if (["failed", "not_configured"].includes(state.claimsIndexProvenance?.status)) return null;
    const declared = claimsReleaseMetadata();
    if (!declared.index_file || !declared.index_sha256) {
      state.claimsIndexProvenance = { status: "not_configured", url: null, sha256: null, error: null };
      return null;
    }
    state.claimsIndexProvenance = { status: "loading", url: fileUrl(declared.index_file), sha256: null, error: null };
    state.claimsIndexPromise = (async () => {
      try {
        const loaded = await fetchJsonWithProvenance(state.claimsIndexProvenance.url, "leaderboard claim index");
        if (!loaded.sha256 || loaded.sha256 !== declared.index_sha256) {
          throw new Error("claim index checksum does not match the selected data release");
        }
        if (loaded.data?.release_id !== dataRelease().id || loaded.data?.release_status !== dataRelease().status) {
          throw new Error("claim index release binding does not match the selected data release");
        }
        if (loaded.data?.feed_sha256 !== dataRelease().feed_sha256) {
          throw new Error("claim index feed binding does not match the hash-verified leaderboard feed");
        }
        if (loaded.data?.feed_file !== state.manifest?.all_file) {
          throw new Error("claim index feed path does not match the selected leaderboard manifest");
        }
        if (!jsonStructuresEqual(loaded.data?.ranking_contract, state.manifest?.ranking_contract)) {
          throw new Error("claim index ranking contract does not match the selected leaderboard manifest");
        }
        if (!Array.isArray(loaded.data?.records) || Number(loaded.data.record_count) !== loaded.data.records.length) {
          throw new Error("claim index record count is invalid");
        }
        if (declared.schema_version && loaded.data.schema_version !== declared.schema_version) {
          throw new Error("claim index schema version does not match the selected data release");
        }
        if (Number(declared.record_count) !== loaded.data.records.length) {
          throw new Error("claim index record count does not match the selected data release");
        }
        const eligibleRecordCount = loaded.data.records.filter((entry) => entry.eligible === true).length;
        if (Number(loaded.data.eligible_record_count) !== eligibleRecordCount || Number(declared.eligible_record_count) !== eligibleRecordCount) {
          throw new Error("claim index eligible-record count does not match its entries and release metadata");
        }
        loaded.data.records.forEach((entry) => {
          const expectedClaimId = [loaded.data.release_id, entry.dataset_id, entry.split_id, entry.submission_id].join("/");
          const expectedFile = `leaderboard/claims/${entry.dataset_id}/${entry.split_id}/${entry.submission_id}.json`;
          if (typeof entry.eligible !== "boolean") throw new Error("claim index eligibility values must be booleans");
          if (entry.claim_id !== expectedClaimId || entry.file !== expectedFile || !/^[a-f0-9]{64}$/.test(entry.sha256 || "")) {
            throw new Error("claim index contains an invalid claim identity, path, or checksum");
          }
        });
        const uniqueKeys = [
          ["result identity", (entry) => `${entry.submission_id}|${entry.dataset_id}|${entry.split_id}`],
          ["claim ID", (entry) => entry.claim_id],
          ["claim file", (entry) => entry.file],
        ];
        uniqueKeys.forEach(([label, keyFor]) => {
          const values = loaded.data.records.map(keyFor);
          if (new Set(values).size !== values.length) throw new Error(`claim index contains a duplicate ${label}`);
        });
        state.claimsIndex = loaded.data;
        state.claimsIndexProvenance = {
          status: "verified",
          url: state.claimsIndexProvenance.url,
          sha256: loaded.sha256,
          error: null,
        };
        return state.claimsIndex;
      } catch (error) {
        state.claimsIndexProvenance = {
          ...state.claimsIndexProvenance,
          status: "failed",
          sha256: null,
          error: error.message,
        };
        console.error(error);
        return null;
      } finally {
        state.claimsIndexPromise = null;
        refreshCitationEligibilityUi();
      }
    })();
    return state.claimsIndexPromise;
  }

  function matchingClaimRanking(recordRanking, row) {
    const expected = rowRanking(row);
    if (!recordRanking || !expected) return false;
    const fields = [
      "metric_id",
      "value",
      "ranked_value",
      "display_value",
      "unit",
      "direction",
      "decimal_places",
      "rounding",
      "method",
      "rank",
      "ranked_result_count",
      "tied",
      "tie_count",
    ];
    return fields.every((field) => String(recordRanking[field]) === String(expected[field]));
  }

  function matchingClaimEligibility(recordEligibility, row) {
    const expected = row.claim_eligibility;
    if (!recordEligibility || !expected) return false;
    return ["academic_citation", "promotion", "reason_code", "reason"].every(
      (field) => String(recordEligibility[field] ?? "") === String(expected[field] ?? "")
    );
  }

  async function verifyClaimBindings(record, row, entry) {
    const validation = maintainerValidation(row);
    const result = record.result || {};
    if (record.claim_id !== entry.claim_id) throw new Error("claim record ID does not match its index entry");
    if (
      record.release?.id !== dataRelease().id ||
      record.release?.status !== dataRelease().status ||
      record.release?.published_at !== dataRelease().generated_at ||
      (record.release?.archive_url || null) !== (dataRelease().archive_url || null) ||
      (record.release?.release_view_url || null) !== (dataRelease().release_view_url || null)
    ) {
      throw new Error("claim record release binding does not match the selected data release");
    }
    if (
      result.submission_id !== row.id ||
      result.dataset_id !== (row.dataset_id || slug(row.dataset)) ||
      result.split_id !== (row.split_id || slug(row.split)) ||
      result.model !== row.model ||
      result.dataset !== row.dataset ||
      result.split !== row.split
    ) {
      throw new Error("claim record result binding does not match the hash-verified feed row");
    }
    if (!matchingClaimRanking(record.ranking, row)) throw new Error("claim record ranking does not match the hash-verified feed row");
    if (!matchingClaimEligibility(record.eligibility, row)) {
      throw new Error("claim record eligibility does not match the hash-verified feed row");
    }
    const declaredEligible = row.claim_eligibility?.academic_citation === true && row.claim_eligibility?.promotion === true;
    if (entry.eligible !== declaredEligible) {
      throw new Error("claim index eligibility does not match the hash-verified feed row");
    }
    const bindings = record.bindings || {};
    const resultBinding = bindings.result || {};
    if (
      resultBinding.feed_file !== state.manifest?.all_file ||
      resultBinding.feed_sha256 !== dataRelease().feed_sha256 ||
      Number(resultBinding.row_index) !== row._feedIndex
    ) {
      throw new Error("claim record result binding does not select this exact row in the hash-verified feed");
    }
    const sourceBinding = bindings.source_submission || {};
    const expectedSourcePath = `submissions/${row.dataset_id}/${row.id}/submission.json`;
    if (sourceBinding.path !== expectedSourcePath || !/^[a-f0-9]{64}$/.test(sourceBinding.sha256 || "")) {
      throw new Error("claim record source-submission binding does not match the selected feed row");
    }
    const loadedSource = await fetchJsonWithProvenance(fileUrl(sourceBinding.path), `${rowLabel(row)} source submission`);
    if (loadedSource.sha256 !== sourceBinding.sha256) {
      throw new Error("source-submission bytes do not match the checksum-verified claim record");
    }
    const sourceModel = typeof loadedSource.data?.model === "string" ? loadedSource.data.model : loadedSource.data?.model?.name;
    if (
      loadedSource.data?.submission_id !== row.id ||
      loadedSource.data?.dataset_id !== row.dataset_id ||
      loadedSource.data?.split_id !== row.split_id ||
      sourceModel !== row.model
    ) {
      throw new Error("source-submission identity does not match the hash-verified leaderboard feed row");
    }
    const evaluationBinding = bindings.evaluation_evidence || {};
    const expectedEvaluationPath = `submissions/${row.dataset_id}/${row.id}/${row.evaluation?.evidence_file}`;
    if (
      evaluationBinding.path !== expectedEvaluationPath ||
      !row.evaluation?.evidence_sha256 ||
      evaluationBinding.sha256 !== row.evaluation.evidence_sha256
    ) {
      throw new Error("claim record evaluation-evidence binding does not match the hash-verified feed row");
    }
    const profileBinding = bindings.profile_index || {};
    if (
      profileBinding.path !== row.profile_data?.index_file ||
      !row.profile_data?.index_sha256 ||
      profileBinding.sha256 !== row.profile_data.index_sha256
    ) {
      throw new Error("claim record profile-index binding does not match the hash-verified feed row");
    }
    const schemaMajor = submissionSchemaMajor(row);
    const support = scoringSupportSummary(row);
    const supportBinding = bindings.scoring_support;
    if (schemaMajor >= 3 || supportBinding) {
      if (
        !support.release_id ||
        !support.manifest_url ||
        !support.manifest_sha256 ||
        supportBinding?.release_id !== support.release_id ||
        supportBinding?.manifest_url !== support.manifest_url ||
        supportBinding?.manifest_sha256 !== support.manifest_sha256
      ) {
        throw new Error("claim record scoring-support binding does not match the hash-verified feed row");
      }
    }
    const discretization = discretizationBinding(row);
    const discretizationClaimBinding = bindings.spatial_discretization;
    if (schemaMajor >= 3 || discretizationClaimBinding) {
      if (
        !bindingFile(discretization) ||
        !bindingSha256(discretization) ||
        discretizationClaimBinding?.path !== submissionAssetPath(row, bindingFile(discretization)) ||
        discretizationClaimBinding?.sha256 !== bindingSha256(discretization)
      ) {
        throw new Error("claim record spatial-discretization binding does not match the hash-verified feed row");
      }
    }
    const discretizationCases = discretizationCaseBinding(row);
    const discretizationCasesClaimBinding = bindings.discretization_cases;
    if (schemaMajor >= 3 || discretizationCasesClaimBinding) {
      if (
        !bindingFile(discretizationCases) ||
        !bindingSha256(discretizationCases) ||
        discretizationCasesClaimBinding?.path !== submissionAssetPath(row, bindingFile(discretizationCases)) ||
        discretizationCasesClaimBinding?.sha256 !== bindingSha256(discretizationCases)
      ) {
        throw new Error("claim record per-case discretization binding does not match the hash-verified feed row");
      }
    }
    const caseMetrics = caseMetricsBinding(row);
    const caseMetricsClaimBinding = bindings.case_metrics;
    if (schemaMajor >= 3 || caseMetricsClaimBinding) {
      if (
        !bindingFile(caseMetrics) ||
        !bindingSha256(caseMetrics) ||
        caseMetricsClaimBinding?.path !== submissionAssetPath(row, bindingFile(caseMetrics)) ||
        caseMetricsClaimBinding?.sha256 !== bindingSha256(caseMetrics)
      ) {
        throw new Error("claim record case-metrics binding does not match the hash-verified feed row");
      }
    }
    const validationBinding = bindings.maintainer_validation;
    if (validation && Object.keys(validation).length) {
      if (
        !validationBinding ||
        validationBinding.path !== validation.evidence_path ||
        validationBinding.sha256 !== validation.evidence_sha256 ||
        validationBinding.status !== validation.status ||
        validationBinding.validation_scope !== validation.validation_scope ||
        validationBinding.model_execution !== validation.model_execution ||
        validationBinding.metric_recomputation !== validation.metric_recomputation
      ) {
        throw new Error("claim record maintainer-validation binding does not match the hash-verified feed row");
      }
    } else if (validationBinding) {
      throw new Error("claim record supplies maintainer validation that is absent from the hash-verified feed row");
    }
    const expectedPermalink = canonicalResultPermalink(row) || null;
    if ((record.result_permalink || null) !== expectedPermalink) {
      throw new Error("claim record result permalink does not match the immutable release view");
    }
    const expectedClaimRecordUrl = dataRelease().status === "official" ? declaredLeaderboardAssetUrl(entry.file) || null : null;
    if ((record.claim_record_url || null) !== expectedClaimRecordUrl) {
      throw new Error("claim record URL does not match the immutable release view");
    }
  }

  async function ensureClaimRecord(row) {
    await ensureClaimsIndex();
    const key = claimRecordKey(row);
    const existing = claimRecordCheck(row);
    if (existing?.status === "verified") return verifiedClaimRecord(row);
    if (["failed", "not_listed"].includes(existing?.status)) return null;
    if (state.claimRecordPromises.has(key)) return state.claimRecordPromises.get(key);
    const entry = claimIndexEntry(row);
    if (!entry?.file || !entry.sha256) {
      state.claimRecords.set(key, { status: "not_listed", data: null, sha256: null, url: null, error: null });
      refreshCitationEligibilityUi();
      return null;
    }
    const recordUrl = fileUrl(entry.file);
    state.claimRecords.set(key, { status: "loading", data: null, sha256: null, url: recordUrl, error: null });
    const promise = (async () => {
      try {
        const loaded = await fetchJsonWithProvenance(recordUrl, `${rowLabel(row)} claim record`);
        if (!loaded.sha256 || loaded.sha256 !== entry.sha256) {
          throw new Error("claim record checksum does not match its verified index entry");
        }
        await verifyClaimBindings(loaded.data, row, entry);
        state.claimRecords.set(key, { status: "verified", data: loaded.data, sha256: loaded.sha256, url: recordUrl, error: null });
        return loaded.data;
      } catch (error) {
        state.claimRecords.set(key, { status: "failed", data: null, sha256: null, url: recordUrl, error: error.message });
        console.error(error);
        return null;
      } finally {
        state.claimRecordPromises.delete(key);
        refreshCitationEligibilityUi();
      }
    })();
    state.claimRecordPromises.set(key, promise);
    return promise;
  }

  function datasetEntries() {
    return Array.isArray(state.manifest?.datasets) ? state.manifest.datasets : [];
  }

  function activeDataset() {
    return datasetEntries().find((dataset) => dataset.name === state.dataset);
  }

  function metricDefinition(metricId) {
    return state.metrics.get(metricId);
  }

  function trainingRegimeDefinitions() {
    return Array.isArray(state.manifest?.training_regimes) ? state.manifest.training_regimes : [];
  }

  function trainingRegimeDefinition(regimeId) {
    const normalizedId = regimeId === "zero_shot" ? "pretrained_zero_shot" : regimeId;
    return trainingRegimeDefinitions().find((definition) => definition.id === normalizedId);
  }

  function activeMetricDefinitions() {
    return (activeDataset()?.metric_ids || []).map(metricDefinition).filter(Boolean);
  }

  function splitOptions(dataset = activeDataset()) {
    return Array.isArray(dataset?.splits) ? dataset.splits : [];
  }

  function populateSelect(select, options, selectedValue) {
    if (!select) return "";
    const current = selectedValue ?? select.value;
    select.replaceChildren();
    options.forEach((option) => {
      const item = document.createElement("option");
      item.value = option.value;
      item.textContent = option.label;
      if (option.title) item.title = option.title;
      select.appendChild(item);
    });
    const selected = options.some((option) => option.value === current) ? current : options[0]?.value || "";
    select.value = selected;
    return selected;
  }

  function syncDatasetSelects() {
    const options = datasetEntries().map((dataset) => ({ value: dataset.name, label: dataset.name }));
    datasetSelects().forEach((select) => populateSelect(select, options, state.dataset));
  }

  function syncSplitSelects() {
    const options = splitOptions().map((split) => ({
      value: split.name,
      label: split.label || split.name,
      title: split.description || "",
    }));
    if (!options.some((option) => option.value === state.split)) {
      state.split = options[0]?.value || "";
    }
    splitSelects().forEach((select) => populateSelect(select, options, state.split));
  }

  function normalizeRow(entry, feedIndex) {
    const metricValues = {};
    Object.entries(entry.metric_values || {}).forEach(([metricId, value]) => {
      const number = finiteNumber(value);
      if (number !== null) metricValues[metricId] = number;
    });
    const modelTypes = Array.isArray(entry.model_types) ? entry.model_types.filter(Boolean) : [entry.model_type].filter(Boolean);
    const normalized = {
      ...entry,
      _feedIndex: feedIndex,
      id: entry.submission_id || `${entry.dataset}-${entry.split}-${entry.model}`,
      model: entry.model || "Unnamed model",
      modelTypes,
      metricValues,
      parameterCount: finiteNumber(entry.parameter_count_millions ?? entry.parameter_count),
      submitter: entry.submitter_name || entry.institution || "Unknown submitter",
      date: entry.submitted_at || "",
      approvalStatus: entry.approval?.status || "not_supplied",
    };
    normalized.predictionDataRank = predictionAvailability(normalized).rank;
    return normalized;
  }

  function record(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function firstValue(...values) {
    return values.find((value) => value !== null && value !== undefined && value !== "");
  }

  function nestedValue(value, ...paths) {
    for (const path of paths) {
      let candidate = value;
      for (const key of path) candidate = record(candidate)[key];
      if (candidate !== null && candidate !== undefined && candidate !== "") return candidate;
    }
    return null;
  }

  function reproducibilityArtifactAvailability(row) {
    const reproducibility = record(row?.reproducibility);
    const objectAvailability = (value) => (Object.keys(record(value)).length ? "provided" : "not_supplied");
    const valueAvailability = (value) => (typeof value === "string" && value.trim() ? "provided" : "not_supplied");
    return {
      code: objectAvailability(reproducibility.code),
      model: objectAvailability(reproducibility.model_artifact),
      environment: objectAvailability(reproducibility.environment),
      documentation: valueAvailability(reproducibility.artifact_documentation_url),
    };
  }

  function optionalArtifactAvailabilityLabel(value) {
    return value === "provided" ? "Provided" : "Not supplied (optional)";
  }

  function scoringSupportBinding(row) {
    return record(
      firstValue(
        row?.scoring_support,
        row?.scoring_support_binding,
        row?.spatial_discretization?.scoring_support,
        row?.discretization?.scoring_support
      )
    );
  }

  function scoringSupportSummary(row) {
    const support = scoringSupportBinding(row);
    const supports = Array.isArray(support.supports) ? support.supports : [];
    const supportFor = (domain) => supports.find((candidate) => candidate?.domain === domain) || {};
    return {
      release_id: firstValue(support.release_id, support.id, support.scoring_support_release_id),
      status: support.status,
      manifest_url: firstValue(support.manifest_url, support.url),
      manifest_sha256: firstValue(support.manifest_sha256, support.sha256),
      surface_support_id: firstValue(support.surface_support_id, support.surface?.support_id, supportFor("surface").id),
      volume_support_id: firstValue(support.volume_support_id, support.volume?.support_id, supportFor("volume").id),
    };
  }

  function discretizationBinding(row) {
    return record(firstValue(row?.discretization, row?.spatial_discretization));
  }

  function discretizationSummary(row) {
    const binding = discretizationBinding(row);
    return record(firstValue(row?.discretization_summary, row?.spatial_discretization_summary, binding.summary, binding));
  }

  function discretizationCaseBinding(row) {
    const binding = discretizationBinding(row);
    const summary = discretizationSummary(row);
    return record(
      firstValue(
        row?.discretization_cases,
        row?.spatial_discretization_cases,
        binding.case_manifest,
        binding.cases,
        summary.case_manifest,
        summary.per_case_manifest
      )
    );
  }

  function caseMetricsBinding(row) {
    return record(firstValue(row?.case_metrics, row?.evaluation?.case_metrics, row?.evaluation?.per_case_metrics));
  }

  function bindingFile(value) {
    const binding = record(value);
    return firstValue(binding.file, binding.path, binding.report_file, binding.manifest_file);
  }

  function bindingSha256(value) {
    const binding = record(value);
    return firstValue(binding.sha256, binding.report_sha256, binding.manifest_sha256);
  }

  function submissionAssetPath(row, file) {
    if (!file) return "";
    return String(file).startsWith("submissions/") ? String(file) : `submissions/${row.dataset_id}/${row.id}/${file}`;
  }

  function predictionArtifacts(row) {
    const candidates = firstValue(
      row?.prediction_artifacts,
      row?.prediction_artifact ? [row.prediction_artifact] : null,
      row?.reproducibility?.prediction_artifacts
    );
    return Array.isArray(candidates) ? candidates.filter((value) => value && typeof value === "object") : [];
  }

  function primaryPredictionArtifact(row) {
    const artifacts = predictionArtifacts(row);
    const preferred = artifacts.filter((artifact) => ["scored_predictions", "both"].includes(artifact.kind));
    const candidates = preferred.length
      ? preferred
      : artifacts.filter((artifact) => artifact.kind === "direct_model_outputs").length
        ? artifacts.filter((artifact) => artifact.kind === "direct_model_outputs")
        : artifacts;
    return (
      [...candidates].sort((left, right) => {
        const leftCoverage = record(left.coverage);
        const rightCoverage = record(right.coverage);
        const leftComplete = leftCoverage.kind === "complete_split" ? 1 : 0;
        const rightComplete = rightCoverage.kind === "complete_split" ? 1 : 0;
        return rightComplete - leftComplete || (finiteNumber(rightCoverage.case_count) ?? 0) - (finiteNumber(leftCoverage.case_count) ?? 0);
      })[0] || {}
    );
  }

  function predictionArtifactProvider(artifact) {
    if (artifact?.provider) return humanize(artifact.provider);
    const url = safeHttpUrl(firstValue(artifact?.repository_url, artifact?.url));
    if (!url) return null;
    const host = new URL(url).hostname.toLowerCase();
    if (host === "huggingface.co" || host.endsWith(".huggingface.co")) return "Hugging Face";
    if (host === "github.com" || host.endsWith(".github.com")) return "GitHub";
    if (host === "zenodo.org" || host.endsWith(".zenodo.org")) return "Zenodo";
    return host;
  }

  function predictionArtifactCheck(row) {
    const checks = firstValue(row?.prediction_artifact_checks, row?.prediction_artifact_status?.checks);
    if (Array.isArray(checks)) {
      const artifactId = primaryPredictionArtifact(row).artifact_id;
      return record(checks.find((check) => check?.artifact_id === artifactId));
    }
    return record(
      firstValue(
        row?.prediction_artifact_check,
        checks,
        row?.prediction_artifact_validation,
        row?.approval?.prediction_artifact_check,
        row?.maintainer_validation?.prediction_artifact_check
      )
    );
  }

  function predictionArtifactChecks(row) {
    const checks = firstValue(row?.prediction_artifact_checks, row?.prediction_artifact_status?.checks);
    if (Array.isArray(checks)) {
      return checks.filter((check) => check && typeof check === "object");
    }
    const check = predictionArtifactCheck(row);
    return Object.keys(check).length ? [check] : [];
  }

  function predictionArtifactChecksBinding(row) {
    const status = record(row?.prediction_artifact_status);
    return record(
      firstValue(
        row?.prediction_artifact_checks_binding,
        status.check_file || status.check_sha256 ? { file: status.check_file, sha256: status.check_sha256 } : null
      )
    );
  }

  function splitTestCount(row) {
    const dataset = datasetEntries().find((candidate) => candidate.name === row?.dataset || candidate.slug === row?.dataset_id);
    const split = (dataset?.splits || []).find((candidate) => candidate.id === row?.split_id || candidate.name === row?.split);
    return finiteNumber(split?.test_count);
  }

  function predictionCoverage(row) {
    const artifact = primaryPredictionArtifact(row);
    const coverage = record(artifact.coverage);
    const caseIds = Array.isArray(coverage.case_ids) ? coverage.case_ids : [];
    const count = finiteNumber(firstValue(coverage.case_count, artifact.case_count, caseIds.length || null));
    const expected = finiteNumber(firstValue(coverage.expected_case_count, artifact.expected_case_count, splitTestCount(row)));
    const kind = firstValue(coverage.kind, artifact.coverage_kind);
    const complete = kind === "complete_split" || (count !== null && expected !== null && count === expected);
    return { kind: complete ? "complete_split" : "example_cases", count, expected };
  }

  function predictionAvailability(row) {
    if (!predictionArtifacts(row).length) {
      return { code: "not_shared", label: "Not shared", rank: 0, count: 0, expected: splitTestCount(row) };
    }
    const coverage = predictionCoverage(row);
    const count = coverage.count ?? "?";
    const expected = coverage.expected ?? "?";
    return {
      code: coverage.kind,
      label: coverage.kind === "complete_split" ? `Complete · ${count}/${expected}` : `Examples · ${count}/${expected}`,
      rank: coverage.kind === "complete_split" ? 2 : 1,
      count: coverage.count,
      expected: coverage.expected,
    };
  }

  function predictionArtifactStatus(row) {
    const artifact = primaryPredictionArtifact(row);
    if (!Object.keys(artifact).length) return { code: "not_applicable", label: "Not applicable" };
    const check = predictionArtifactCheck(row);
    const raw = String(firstValue(check.status, artifact.check_status, "not_checked")).toLowerCase();
    const codes = {
      not_applicable: ["not_applicable", "Not applicable"],
      not_checked: ["not_checked", "Not checked"],
      accessible: ["accessible", "Accessible"],
      format_checked: ["format_checked", "Format checked"],
      metrics_recomputed: ["format_checked", "Format checked"],
      metrics_reproduced: ["format_checked", "Format checked"],
      failed: ["failed", "Check failed"],
      check_failed: ["failed", "Check failed"],
    };
    const [code, label] = codes[raw] || codes.not_checked;
    return { code, label };
  }

  function predictionMetricRecomputation(row) {
    const check = predictionArtifactCheck(row);
    const declared = firstValue(check.metric_recomputation, row?.prediction_metric_recomputation);
    const recomputation = typeof declared === "string" ? { status: declared } : record(declared);
    const raw = String(
      firstValue(recomputation.status, ["metrics_recomputed", "metrics_reproduced"].includes(check.status) ? "complete_split" : "not_performed")
    ).toLowerCase();
    const count = finiteNumber(firstValue(recomputation.case_count, check.recomputed_case_count));
    const expected = finiteNumber(firstValue(recomputation.expected_case_count, check.expected_case_count, predictionCoverage(row).expected));
    if (["complete_split", "performed", "metrics_recomputed", "metrics_reproduced"].includes(raw)) {
      return {
        code: "complete_split",
        label: "Complete split recomputed by FluidsBench",
        count: count ?? expected,
        expected,
      };
    }
    if (["example_cases", "partial", "partial_cases"].includes(raw)) {
      return {
        code: "example_cases",
        label: `Example cases recomputed · ${count ?? "?"}/${expected ?? "?"}`,
        count,
        expected,
      };
    }
    return { code: "not_performed", label: "Not performed", count: 0, expected };
  }

  function compactJson(value) {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value !== "object") return String(value);
    try {
      return JSON.stringify(value);
    } catch (_error) {
      return String(value);
    }
  }

  function countSummary(value) {
    if (value === null || value === undefined || value === "") return null;
    const direct = finiteNumber(value);
    if (direct !== null) return direct.toLocaleString();
    const count = record(value);
    if (count.kind === "fixed" && finiteNumber(count.value) !== null) {
      return Number(count.value).toLocaleString();
    }
    if (count.kind === "per_case") {
      const minimum = finiteNumber(count.minimum);
      const median = finiteNumber(count.median);
      const maximum = finiteNumber(count.maximum);
      return `min/median/max ${minimum?.toLocaleString() ?? "?"}/${median?.toLocaleString() ?? "?"}/${maximum?.toLocaleString() ?? "?"}`;
    }
    return compactJson(value);
  }

  function fractionSummary(value) {
    if (value === null || value === undefined || value === "") return null;
    const fraction = record(value);
    if (fraction.kind === "fixed" && finiteNumber(fraction.value) !== null) {
      return `${(Number(fraction.value) * 100).toLocaleString()}%`;
    }
    if (fraction.kind === "per_case") {
      const values = [fraction.minimum, fraction.median, fraction.maximum].map(finiteNumber);
      return `min/median/max ${values.map((item) => (item === null ? "?" : `${(item * 100).toLocaleString()}%`)).join("/")}`;
    }
    const direct = finiteNumber(value);
    return direct === null ? compactJson(value) : `${(direct * 100).toLocaleString()}%`;
  }

  function representationSummary(value) {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value !== "object") return humanize(value);
    const item = record(value);
    if (item.used === false) return "Not used";
    const parts = [];
    if (item.id) parts.push(String(item.id));
    if (item.domain && typeof item.domain === "string") parts.push(humanize(item.domain));
    const representation = firstValue(typeof item.representation === "string" ? item.representation : null, item.kind, item.type);
    if (representation) parts.push(humanize(representation));
    if (item.representation && typeof item.representation === "object") {
      parts.push(representationSummary(item.representation));
    }
    if (item.entity) parts.push(humanize(item.entity));
    const count = countSummary(firstValue(item.count, item.count_per_case, item.median_count, item.count_median));
    if (count) parts.push(`${count} per case`);
    if (Array.isArray(item.entity_counts)) {
      item.entity_counts.forEach((entry) => {
        const entityCount = countSummary(entry?.count);
        if (entityCount) parts.push(`${humanize(entry.entity) || "entities"}: ${entityCount} per case`);
      });
    }
    const nativeFraction = fractionSummary(item.fraction_of_native);
    if (nativeFraction) parts.push(`${nativeFraction} of native support`);
    const nativeComparison = record(item.native_comparison);
    if (nativeComparison.status === "reported") {
      (nativeComparison.native_entity_counts || []).forEach((entry) => {
        const nativeCount = countSummary(entry?.count);
        if (nativeCount) parts.push(`native ${humanize(entry.entity) || "entities"}: ${nativeCount} per case`);
      });
      (nativeComparison.fractions || []).forEach((entry) => {
        const fraction = fractionSummary(entry?.fraction);
        if (fraction) parts.push(`${humanize(entry.entity) || "entities"}: ${fraction} of native`);
      });
    } else if (nativeComparison.status === "not_applicable") {
      parts.push("native comparison: not applicable");
    } else if (nativeComparison.status === "unknown_with_explanation") {
      parts.push(`native comparison unknown: ${nativeComparison.explanation}`);
    }
    if (Array.isArray(item.dimensions)) parts.push(item.dimensions.join(" × "));
    const minimum = finiteNumber(firstValue(item.minimum_count, item.count_min));
    const maximum = finiteNumber(firstValue(item.maximum_count, item.count_max));
    if (minimum !== null || maximum !== null) {
      parts.push(`range ${minimum === null ? "?" : minimum.toLocaleString()}–${maximum === null ? "?" : maximum.toLocaleString()}`);
    }
    if (item.sampling) {
      const sampling = record(item.sampling);
      const samplingKind = String(sampling.kind || "");
      const samplingLabel = samplingKind === "none" ? "none" : sampling.method || humanize(samplingKind) || compactJson(item.sampling);
      const resampled = samplingKind === "resampled_each_epoch" || sampling.resampled_each_epoch === true;
      parts.push(`sampling: ${samplingLabel}${resampled ? " (resampled each epoch)" : ""}`);
    }
    if (item.connectivity) parts.push(`connectivity: ${humanize(item.connectivity)}`);
    const domain = firstValue(item.domain && typeof item.domain === "object" ? item.domain : null, item.bounding_box, item.bbox);
    if (domain) {
      const domainRecord = record(domain);
      if (domainRecord.kind === "axis_aligned_box") {
        parts.push(
          `domain: [${(domainRecord.minimum || []).join(", ")}] to [${(domainRecord.maximum || []).join(", ")}] ${
            domainRecord.length_unit || ""
          } in ${domainRecord.coordinate_frame || "unspecified frame"}`
        );
      } else {
        parts.push(`domain: ${humanize(domainRecord.kind) || compactJson(domain)}`);
      }
    }
    const queries = countSummary(item.queries_per_forward_pass);
    if (queries) parts.push(`${queries} queries per forward pass`);
    return parts.length ? parts.join("; ") : compactJson(value);
  }

  function mappingMethodSummary(value) {
    if (!value) return null;
    if (typeof value === "string") return humanize(value);
    const method = record(value);
    if (method.kind === "reference_rule") {
      return `reference rule ${method.rule_id || "unspecified"}${method.rule_version ? ` (${method.rule_version})` : ""}`;
    }
    return humanize(method.kind) || compactJson(value);
  }

  function spatialComponent(row, ...paths) {
    return nestedValue(discretizationSummary(row), ...paths);
  }

  function inferenceDirectOutputs(row, domain = null) {
    const outputs = spatialComponent(row, ["inference", "direct_outputs"]);
    if (!Array.isArray(outputs)) return [];
    return domain ? outputs.filter((output) => output?.domain === domain) : outputs;
  }

  function directOutputSummary(row, domain) {
    const outputs = inferenceDirectOutputs(row, domain);
    return outputs.length ? outputs.map(representationSummary).join(" | ") : null;
  }

  function inferenceMappings(row) {
    const mappings = spatialComponent(
      row,
      ["inference", "mappings"],
      ["inference", "mapping_to_scoring_support"],
      ["mapping_to_scoring_support"],
      ["scoring_mapping"]
    );
    return Array.isArray(mappings) ? mappings : mappings ? [mappings] : [];
  }

  function mappingSummary(row) {
    const mappings = inferenceMappings(row);
    if (!mappings.length) return null;
    return mappings
      .map((mapping) => {
        const item = record(mapping);
        const coverage = finiteNumber(item.final_coverage_fraction);
        const unmapped = finiteNumber(item.unmapped_fraction);
        const extrapolated = finiteNumber(item.extrapolated_fraction);
        return [
          item.support_id ? `${item.support_id} from ${item.source_output_id || "declared output"}` : null,
          item.method ? `method: ${mappingMethodSummary(item.method)}` : null,
          coverage === null ? null : `coverage: ${(coverage * 100).toLocaleString()}%`,
          unmapped === null ? null : `unmapped: ${(unmapped * 100).toLocaleString()}%`,
          extrapolated === null ? null : `extrapolated: ${(extrapolated * 100).toLocaleString()}%`,
        ]
          .filter(Boolean)
          .join("; ");
      })
      .join(" | ");
  }

  function scoringCoverageSummary(row) {
    const mappings = inferenceMappings(row);
    if (!mappings.length) return null;
    return mappings
      .map((mapping) => {
        const item = record(mapping);
        const coverage = finiteNumber(item.final_coverage_fraction);
        const unmapped = finiteNumber(item.unmapped_fraction);
        const extrapolated = finiteNumber(item.extrapolated_fraction);
        return `${item.support_id || "support"}: ${coverage === null ? "coverage not supplied" : `${coverage * 100}% coverage`}, ${
          unmapped === null ? "unmapped fraction not supplied" : `${unmapped * 100}% unmapped`
        }, ${extrapolated === null ? "extrapolated fraction not supplied" : `${extrapolated * 100}% extrapolated`}`;
      })
      .join(" | ");
  }

  async function ensureRows(dataset) {
    if (state.rows.has(dataset.name)) return state.rows.get(dataset.name);
    if (!state.feedRowsLoaded) {
      if (!state.manifest?.all_file) throw new Error("manifest does not declare the complete scalar feed");
      const loaded = await fetchJsonWithProvenance(fileUrl(state.manifest.all_file), "complete leaderboard feed");
      if (!Array.isArray(loaded.data)) throw new Error("complete leaderboard feed must be an array");
      if (!loaded.sha256) throw new Error("this browser cannot verify the leaderboard feed SHA-256 digest");
      const expectedSha256 = dataRelease().feed_sha256;
      if (!expectedSha256 || loaded.sha256 !== expectedSha256) {
        throw new Error("complete leaderboard feed checksum does not match the selected data release");
      }
      datasetEntries().forEach((entry) => state.rows.set(entry.name, []));
      loaded.data
        .map((entry, index) => normalizeRow(entry, index))
        .forEach((row) => {
          if (state.rows.has(row.dataset)) state.rows.get(row.dataset).push(row);
        });
      state.loadedFeedSha256 = loaded.sha256;
      state.feedVerified = true;
      state.feedRowsLoaded = true;
      await ensureClaimsIndex();
    }
    return state.rows.get(dataset.name) || [];
  }

  async function ensureGroundTruthManifest() {
    if (state.groundTruthManifest) return state.groundTruthManifest;
    const expected = dataRelease().profile_ground_truth;
    const selectedManifestUrl = releaseGroundTruthManifestUrl();
    if (!selectedManifestUrl) throw new Error("the selected release does not declare a profile ground-truth manifest URL");
    const loaded = await fetchJsonWithProvenance(selectedManifestUrl, "profile ground-truth manifest");
    if (!loaded.sha256) throw new Error("this browser cannot verify the profile ground-truth manifest SHA-256 digest");
    if (!expected?.manifest_sha256 || loaded.sha256 !== expected.manifest_sha256) {
      throw new Error("profile ground-truth manifest checksum does not match the selected data release");
    }
    if (!expected.release_id || loaded.data?.data_release?.id !== expected.release_id) {
      throw new Error("profile ground-truth release ID does not match the selected data release");
    }
    if (dataRelease().status === "official") {
      const groundTruthRelease = loaded.data?.data_release || {};
      if (groundTruthRelease.status !== "official" || !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(groundTruthRelease.source_commit || "")) {
        throw new Error("official results require profile ground truth pinned to an immutable source commit");
      }
    }
    state.groundTruthManifestProvenance = {
      url: selectedManifestUrl,
      base_url: new URL(".", selectedManifestUrl).href,
      sha256: loaded.sha256,
      release_id: loaded.data?.data_release?.id || null,
    };
    state.groundTruthManifest = loaded.data;
    refreshCitationEligibilityUi();
    return state.groundTruthManifest;
  }

  async function groundTruthIndex(datasetName, splitName) {
    const manifest = await ensureGroundTruthManifest();
    const dataset = (manifest.datasets || []).find((candidate) => candidate.name === datasetName);
    const split = (dataset?.splits || []).find((candidate) => candidate.label === splitName);
    const caseSet = (dataset?.case_sets || []).find((candidate) => candidate.id === split?.case_set_id);
    if (!caseSet?.index_file) throw new Error(`${datasetName} / ${splitName} has no profile ground-truth index`);
    const indexUrl = fileUrl(caseSet.index_file, state.groundTruthManifestProvenance?.base_url || groundTruthBaseUrl);
    if (!state.groundTruthIndexes.has(indexUrl)) {
      state.groundTruthIndexes.set(indexUrl, await fetchJsonWithProvenance(indexUrl, `${datasetName} profile ground-truth index`));
    }
    const cached = state.groundTruthIndexes.get(indexUrl);
    if (!caseSet.index_sha256 || !cached.sha256 || cached.sha256 !== caseSet.index_sha256) {
      throw new Error(`${datasetName} profile ground-truth index checksum does not match its release manifest`);
    }
    return { index: cached.data, indexUrl, indexSha256: cached.sha256, caseSetId: caseSet.id };
  }

  async function submissionProfileIndex(row) {
    const indexFile = row.profile_data?.index_file;
    if (!indexFile) throw new Error(`${rowLabel(row)} has no profile index`);
    const indexUrl = fileUrl(indexFile);
    if (!state.profileIndexes.has(indexUrl)) {
      state.profileIndexes.set(indexUrl, await fetchJsonWithProvenance(indexUrl, `${rowLabel(row)} profile index`));
    }
    const cached = state.profileIndexes.get(indexUrl);
    if (!row.profile_data?.index_sha256 || !cached.sha256 || cached.sha256 !== row.profile_data.index_sha256) {
      throw new Error(`${rowLabel(row)} profile index checksum does not match the verified leaderboard feed`);
    }
    return { index: cached.data, indexUrl, indexSha256: cached.sha256 };
  }

  function caseIds(index) {
    return (index?.chunks || []).flatMap((chunk) => chunk.case_ids || []);
  }

  async function indexedProfileCase(context, caseId, cache, label) {
    const entry = (context.index?.chunks || []).find((chunk) => (chunk.case_ids || []).includes(caseId));
    if (!entry) return null;
    const chunkUrl = new URL(entry.file, context.indexUrl).href;
    if (!cache.has(chunkUrl)) cache.set(chunkUrl, await fetchJsonWithProvenance(chunkUrl, `${label} profile chunk`));
    const cached = cache.get(chunkUrl);
    if (entry.sha256 && cached.sha256 && entry.sha256 !== cached.sha256) {
      throw new Error(`${label} profile chunk checksum does not match its index`);
    }
    const profileCase = (cached.data?.cases || []).find((candidate) => candidate.case_id === caseId);
    if (!profileCase) return null;
    return {
      ...profileCase,
      _fluidsbenchProvenance: {
        index_url: context.indexUrl,
        index_sha256: context.indexSha256 || null,
        chunk_url: chunkUrl,
        chunk_declared_sha256: entry.sha256 || null,
        chunk_downloaded_sha256: cached.sha256 || null,
      },
    };
  }

  function ranking() {
    return activeDataset()?.ranking || { metric_id: activeMetricDefinitions()[0]?.id, direction: "higher" };
  }

  function rankingDecimalPlaces() {
    const selectedRanking = ranking();
    const definition = metricDefinition(selectedRanking.metric_id);
    const configured =
      selectedRanking.decimal_places ?? selectedRanking.precision?.decimal_places ?? selectedRanking.precision_digits ?? definition?.digits ?? 2;
    const digits = finiteNumber(configured);
    return digits === null ? 2 : Math.max(0, Math.min(12, Math.trunc(digits)));
  }

  function rankingPolicy() {
    const selectedRanking = ranking();
    const contract = state.manifest?.ranking_contract || {};
    return {
      metric_id: selectedRanking.metric_id,
      direction: selectedRanking.direction === "lower" ? "lower" : "higher",
      decimal_places: rankingDecimalPlaces(),
      rounding: selectedRanking.precision?.rounding || selectedRanking.rounding || contract.rounding || "decimal_half_up",
      method: selectedRanking.method || contract.method || "competition",
      scope: "exact_data_release_dataset_split",
    };
  }

  function decimalHalfUp(value, decimalPlaces) {
    const number = finiteNumber(value);
    if (number === null) return null;
    const [coefficient, exponentText = "0"] = Math.abs(number).toString().toLowerCase().split("e");
    const [whole, fraction = ""] = coefficient.split(".");
    let digits = `${whole}${fraction}`;
    let decimalPosition = whole.length + Number(exponentText);
    if (decimalPosition < 0) {
      digits = `${"0".repeat(-decimalPosition)}${digits}`;
      decimalPosition = 0;
    }
    const cut = decimalPosition + decimalPlaces;
    if (digits.length <= cut) digits = digits.padEnd(cut + 1, "0");
    const retained = digits.slice(0, cut) || "0";
    const nextDigit = Number(digits[cut] || "0");
    const roundedInteger = BigInt(retained) + (nextDigit >= 5 ? 1n : 0n);
    const rounded = (number < 0 ? -1 : 1) * (Number(roundedInteger) / 10 ** decimalPlaces);
    return Object.is(rounded, -0) ? 0 : rounded;
  }

  function rankedDisplayValue(value, policy = rankingPolicy()) {
    const rounded = decimalHalfUp(value, policy.decimal_places);
    return rounded === null ? "N/A" : rounded.toFixed(policy.decimal_places);
  }

  function generatedRanking(row, policy) {
    const generated = row.ranking;
    if (!state.feedVerified || !generated || typeof generated !== "object") return null;
    const requiredNumberFields = ["value", "ranked_value", "rank", "ranked_result_count", "tie_count"];
    if (requiredNumberFields.some((field) => finiteNumber(generated[field]) === null)) return null;
    if (
      generated.metric_id !== policy.metric_id ||
      generated.direction !== policy.direction ||
      Number(generated.decimal_places) !== policy.decimal_places ||
      generated.rounding !== policy.rounding ||
      generated.method !== policy.method
    ) {
      return null;
    }
    return {
      metric_id: generated.metric_id,
      value: Number(generated.value),
      ranked_value: Number(generated.ranked_value),
      display_value: String(generated.display_value ?? rankedDisplayValue(generated.ranked_value, policy)),
      unit: String(generated.unit || ""),
      direction: generated.direction,
      decimal_places: policy.decimal_places,
      rounding: generated.rounding,
      method: generated.method,
      rank: Number(generated.rank),
      ranked_result_count: Number(generated.ranked_result_count),
      tied: Boolean(generated.tied),
      tie_count: Number(generated.tie_count),
      source: "hash_verified_feed",
    };
  }

  function fallbackRankings(rows, policy) {
    const ranked = rows
      .map((row) => ({
        row,
        value: finiteNumber(row.metricValues[policy.metric_id]),
        rankedValue: decimalHalfUp(row.metricValues[policy.metric_id], policy.decimal_places),
      }))
      .sort((a, b) => {
        const compared = compareNumbers(a.rankedValue, b.rankedValue, policy.direction);
        return compared || String(a.row.id).localeCompare(String(b.row.id));
      });
    const rankedResultCount = ranked.filter(({ rankedValue }) => rankedValue !== null).length;
    const tieCounts = new Map();
    ranked.forEach(({ rankedValue }) => {
      if (rankedValue === null) return;
      const key = String(rankedValue);
      tieCounts.set(key, (tieCounts.get(key) || 0) + 1);
    });
    let previousRankedValue = null;
    let competitionRank = null;
    let rankedPosition = 0;
    return ranked.map(({ row, value, rankedValue }) => {
      if (rankedValue === null) {
        return {
          row,
          ranking: {
            ...policy,
            value: null,
            ranked_value: null,
            display_value: "N/A",
            unit: metricDefinition(policy.metric_id)?.unit || "",
            rank: null,
            ranked_result_count: rankedResultCount,
            tied: false,
            tie_count: 0,
            source: "computed_fallback",
          },
        };
      }
      rankedPosition += 1;
      if (previousRankedValue === null || rankedValue !== previousRankedValue) competitionRank = rankedPosition;
      previousRankedValue = rankedValue;
      const tieCount = tieCounts.get(String(rankedValue)) || 1;
      return {
        row,
        ranking: {
          ...policy,
          value,
          ranked_value: rankedValue,
          display_value: rankedDisplayValue(rankedValue, policy),
          unit: metricDefinition(policy.metric_id)?.unit || "",
          rank: competitionRank,
          ranked_result_count: rankedResultCount,
          tied: tieCount > 1,
          tie_count: tieCount,
          source: "computed_fallback",
        },
      };
    });
  }

  function generatedRankingMatches(generated, fallback) {
    if (!generated || !fallback) return false;
    const fields = [
      "metric_id",
      "value",
      "ranked_value",
      "display_value",
      "unit",
      "direction",
      "decimal_places",
      "rounding",
      "method",
      "rank",
      "ranked_result_count",
      "tied",
      "tie_count",
    ];
    return fields.every((field) => String(generated[field]) === String(fallback[field]));
  }

  function compareNumbers(a, b, direction) {
    const aValue = finiteNumber(a);
    const bValue = finiteNumber(b);
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return 1;
    if (bValue === null) return -1;
    return direction === "lower" ? aValue - bValue : bValue - aValue;
  }

  function rowsForActiveSplit() {
    const allRows = (state.rows.get(state.dataset) || []).filter((row) => row.split === state.split);
    const policy = rankingPolicy();
    const fallback = fallbackRankings(allRows, policy);
    const fallbackById = new Map(fallback.map((item) => [item.row.id, item.ranking]));
    const generated = allRows.map((row) => generatedRanking(row, policy));
    const generatedIsConsistent =
      generated.length && generated.every((item, index) => generatedRankingMatches(item, fallbackById.get(allRows[index].id)));
    if (generatedIsConsistent) {
      const generatedById = new Map(allRows.map((row, index) => [row.id, generated[index]]));
      return fallback.map(({ row }) => {
        const verifiedRanking = { ...generatedById.get(row.id), source: "verified_generated_release" };
        return { ...row, rank: verifiedRanking.rank, _ranking: verifiedRanking };
      });
    }
    const generatedWasPresent = allRows.some((row) => row.ranking && typeof row.ranking === "object");
    return fallback.map(({ row, ranking: rowRanking }) => {
      const verifiedFallback = {
        ...rowRanking,
        source: generatedWasPresent ? "computed_fallback_generated_release_mismatch" : "computed_fallback_legacy_release",
      };
      return { ...row, rank: verifiedFallback.rank, _ranking: verifiedFallback };
    });
  }

  function rowRanking(row) {
    return row?._ranking || generatedRanking(row, rankingPolicy()) || fallbackRankings([row], rankingPolicy())[0]?.ranking || null;
  }

  function rowsForCurrentModelType() {
    return rowsForActiveSplit().filter((row) => !state.modelType || row.modelTypes.includes(state.modelType));
  }

  function figureRows() {
    return rowsForCurrentModelType().filter((row) => state.comparedModelIds.has(row.id));
  }

  function filteredRows() {
    const ranked = rowsForCurrentModelType();
    if (state.sortKey === "rank") {
      const direction = state.sortDirection === "asc" ? "lower" : "higher";
      return ranked.slice().sort((a, b) => compareNumbers(a.rank, b.rank, direction) || String(a.id).localeCompare(String(b.id)));
    }
    const direction = state.sortDirection === "asc" ? "lower" : "higher";
    return ranked.slice().sort((a, b) => {
      if (state.sortKey.startsWith("metric:")) {
        const metricId = state.sortKey.slice(7);
        return compareNumbers(a.metricValues[metricId], b.metricValues[metricId], direction);
      }
      if (state.sortKey === "parameters") {
        return compareNumbers(a.parameterCount, b.parameterCount, direction);
      }
      if (state.sortKey === "predictionData") {
        return compareNumbers(a.predictionDataRank, b.predictionDataRank, direction);
      }
      const aValue = String(a[state.sortKey] || "");
      const bValue = String(b[state.sortKey] || "");
      return aValue.localeCompare(bValue) * (state.sortDirection === "asc" ? 1 : -1);
    });
  }

  function rowLabel(row) {
    const duplicateModelCount = rowsForActiveSplit().filter((candidate) => candidate.model === row.model).length;
    return duplicateModelCount > 1 ? `${row.model} (${row.id})` : row.model;
  }

  function formatNumber(value, digits) {
    const number = finiteNumber(value);
    if (number === null) return "N/A";
    return number.toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }

  function formatMetric(value, definition) {
    const isRankingMetric = definition?.id && definition.id === ranking().metric_id;
    const digits = isRankingMetric ? rankingDecimalPlaces() : definition?.digits ?? 2;
    const displayValue = isRankingMetric ? decimalHalfUp(value, digits) : value;
    const formatted = formatNumber(displayValue, digits);
    if (formatted === "N/A" || !definition?.unit) return formatted;
    return `${formatted}${definition.unit === "%" ? "" : " "}${definition.unit}`;
  }

  function safeHttpUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(value, window.location.href);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch (_error) {
      return "";
    }
  }

  function releaseArchiveUrl() {
    return safeHttpUrl(dataRelease().archive_url || dataRelease().doi_url);
  }

  function releaseLicenseMetadata() {
    const license = dataRelease().license;
    if (typeof license === "string" && license.trim()) {
      return { label: license.trim(), spdxId: "", name: license.trim(), url: "", scope: "Not supplied" };
    }
    if (license && typeof license === "object") {
      const spdxId = String(license.spdx_id || license.spdx || "").trim();
      const name = String(license.name || "").trim();
      const url = safeHttpUrl(license.url);
      const scope = String(license.scope || "Not supplied").trim();
      return {
        label: [spdxId, name].filter(Boolean).join(" — ") || "Not supplied",
        spdxId,
        name,
        url,
        scope,
      };
    }
    return {
      label: "Not supplied by this data release",
      spdxId: "",
      name: "",
      url: "",
      scope: "Not supplied; consult each upstream dataset and model artifact licence",
    };
  }

  function releaseStamp() {
    const release = dataRelease();
    const scope = publicationScope();
    const checksum = release.feed_sha256
      ? `verified feed SHA-256 ${state.feedVerified ? state.loadedFeedSha256 : release.feed_sha256}`
      : "feed checksum not supplied";
    const archive = releaseArchiveUrl() ? `archive ${releaseArchiveUrl()}` : "no immutable archive URL supplied";
    const manifestDigest = releaseManifestSha256();
    const manifest = manifestDigest ? `; release manifest SHA-256 ${manifestDigest}` : "";
    return `FluidsBench data release ${release.id || "unversioned"} (status: ${humanize(
      release.status || "not supplied"
    )}; ${checksum}${manifest}; ${archive}; result-data origin: ${humanize(scope.result_data_origin)})`;
  }

  function humanize(value) {
    return String(value || "")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  function formatReleaseDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return value;
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
  }

  function releaseSourceUrl() {
    const release = dataRelease();
    const repository = String(release.source_repository || "").replace(/\/$/, "");
    if (!repository) return "";
    if (release.source_commit) return safeHttpUrl(`${repository}/commit/${release.source_commit}`);
    if (release.source_ref) return safeHttpUrl(`${repository}/tree/${encodeURIComponent(release.source_ref)}`);
    return safeHttpUrl(repository);
  }

  function renderSubmissionAvailability() {
    const dataset = activeDataset();
    const support = record(dataset?.scoring_support);
    const supportStatus = String(firstValue(support.status, dataset?.scoring_support_status, "not_published"));
    const workflowOpen = support.submissions_open === true;
    const open = supportStatus === "official" && workflowOpen;
    const status = element("submission-status");
    const button = element("open-submission-repo");
    if (status) {
      status.textContent = open
        ? `${dataset.name} submissions are open. Final scores use ${support.release_id || "the official scoring-support release"}.`
        : "Submissions are currently closed.";
    }
    if (button) {
      button.disabled = !open;
      button.textContent = open ? "Submit a result" : "Submit a result — closed";
    }
  }

  function renderReleaseMetadata() {
    const release = dataRelease();
    renderSubmissionAvailability();
    const dataWarning = element("leaderboard-data-warning");
    const dataWarningTitle = element("leaderboard-data-warning-title");
    const dataWarningText = element("leaderboard-data-warning-text");
    const officialRelease = release.status === "official";
    if (dataWarning) dataWarning.className = `leaderboard-data-warning${officialRelease ? " is-official" : ""}`;
    if (dataWarningTitle) dataWarningTitle.textContent = officialRelease ? "Official submitted-data release:" : "Prototype only:";
    if (dataWarningText) {
      dataWarningText.textContent = officialRelease
        ? " results use submitter-provided metrics, spatial declarations, and profile predictions from open, versioned submission packages. FluidsBench validates and approves each submitted package but does not run the model. Any prediction-artifact checks and metric recomputation are reported separately for each result."
        : " all results currently shown are illustrative dummy data. They are not official results and must not be cited or promoted as leaderboard claims. Official open-track results will use submitter-provided metrics and profile predictions, pass FluidsBench package validation, and receive maintainer approval. Public code, model, and environment artifacts are optional.";
    }
    element("leaderboard-release-id").textContent = release.id || "Unversioned";
    const details = [];
    if (release.status) details.push(humanize(release.status));
    if (release.generated_at) details.push(`generated ${formatReleaseDate(release.generated_at)}`);
    if (release.feed_sha256) details.push(`SHA-256 ${release.feed_sha256.slice(0, 12)}...`);
    if (state.feedVerified) details.push("feed bytes verified");
    if (releaseManifestSha256()) details.push(`manifest SHA-256 ${releaseManifestSha256().slice(0, 12)}...`);
    if (state.manifestPinVerified) details.push("manifest bytes match snapshot pin");
    if (release.reproducibility_contract_version) details.push(release.reproducibility_contract_version);
    const license = releaseLicenseMetadata();
    details.push(`licence ${license.label}`);
    if (!releaseArchiveUrl()) details.push("no immutable archive");
    if (!releaseViewUrl()) details.push("no immutable release view");
    const meta = element("leaderboard-release-meta");
    meta.textContent = details.join(" | ");
    if (release.feed_sha256) meta.title = `Feed SHA-256: ${release.feed_sha256}`;
    const source = element("leaderboard-release-source");
    const sourceUrl = releaseSourceUrl();
    source.hidden = !sourceUrl;
    if (sourceUrl) {
      source.href = sourceUrl;
      source.textContent = release.source_commit
        ? `Source ${String(release.source_commit).slice(0, 7)}`
        : `Source ${release.source_ref || "repository"}`;
    }
    ["export-leaderboard-csv", "export-leaderboard-json"].forEach((id) => {
      const button = element(id);
      if (button) button.disabled = !state.dataset || !state.feedVerified;
    });
    const citationButton = element("open-citation-dialog");
    if (citationButton) {
      const citedRow = state.resultId ? rowsForActiveSplit().find((row) => row.id === state.resultId) : null;
      const eligibility = claimEligibility(citedRow);
      const eligible = eligibility.academic_citation;
      citationButton.disabled = !state.dataset || !eligible;
      citationButton.title = eligible
        ? citedRow
          ? "Cite this approved result from a hash-verified official release"
          : "Cite this hash-verified official release"
        : eligibility.reason;
      const status = element("leaderboard-claim-eligibility");
      if (status) {
        status.hidden = !state.dataset || eligible;
        status.textContent = eligible
          ? ""
          : eligibility.declared.academic_citation
            ? `Citation copying is temporarily unavailable because browser verification has not passed: ${eligibility.reason}`
            : `This release is not declared eligible for citation: ${eligibility.declared.reason}`;
      }
    }
    const warning = element("leaderboard-release-warning");
    if (warning) {
      warning.hidden = !state.releaseMismatch && !state.resultUnavailable;
      warning.textContent = state.releaseMismatch
        ? `This link requested data release ${state.requestedReleaseId}, but that release is not loaded. The page is showing ${
            release.id || "an unversioned release"
          }; the requested result has not been opened. Use the archived release URL to verify the original record.`
        : state.resultUnavailable
          ? `Result ${state.requestedResultId} is not present in data release ${
              release.id || "unversioned"
            }. The result link has not been silently redirected to another row.`
          : "";
    }
  }

  function csvCell(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
    let rendered = typeof value === "object" ? JSON.stringify(value) : String(value);
    if (/^[\t ]*[=+\-@]/.test(rendered)) rendered = `'${rendered}`;
    return /[",\r\n]/.test(rendered) ? `"${rendered.replaceAll('"', '""')}"` : rendered;
  }

  function tableExportRows() {
    return state.exportScope === "full" ? rowsForActiveSplit() : filteredRows();
  }

  function exportProvenance(rowCount) {
    const license = releaseLicenseMetadata();
    const currentView = state.exportScope === "current";
    return {
      export_scope: currentView ? "current_filtered_view" : "full_selected_split",
      row_count: rowCount,
      release_id: dataRelease().id || null,
      release_status: dataRelease().status || null,
      feed_sha256: dataRelease().feed_sha256 || null,
      loaded_feed_sha256: state.loadedFeedSha256,
      feed_verified: state.feedVerified,
      archive_url: releaseArchiveUrl() || null,
      release_view_url: releaseViewUrl() || null,
      asset_base_url: leaderboardAssetBaseUrl(),
      leaderboard_manifest: leaderboardManifestProvenance(),
      profile_ground_truth: {
        ...dataRelease().profile_ground_truth,
        loaded_manifest_sha256: state.groundTruthManifestProvenance?.sha256 || null,
        loaded_release_id: state.groundTruthManifestProvenance?.release_id || null,
      },
      source_repository: dataRelease().source_repository || null,
      source_ref: dataRelease().source_ref || null,
      source_commit: dataRelease().source_commit || null,
      reproducibility_contract_version: dataRelease().reproducibility_contract_version || null,
      ranking_contract: state.manifest?.ranking_contract || rankingPolicy(),
      claims_index: {
        ...claimsReleaseMetadata(),
        verification_status: state.claimsIndexProvenance?.status || "not_checked",
        loaded_sha256: state.claimsIndexProvenance?.sha256 || null,
        url: state.claimsIndexProvenance?.url || null,
      },
      publication_scope: publicationScope(),
      license: {
        spdx_id: license.spdxId || null,
        name: license.name || null,
        url: license.url || null,
        scope: license.scope,
        fallback_notice: license.spdxId ? null : license.label,
      },
      view_url: currentViewUrl(false, false),
      filters: {
        dataset: state.dataset,
        split: state.split,
        split_id: activeSplitDefinition()?.id || null,
        model_type: currentView ? state.modelType || null : null,
        sort: currentView ? { key: state.sortKey, direction: state.sortDirection } : { key: "rank", direction: "asc" },
        visible_column_groups: Array.from(state.visibleGroups),
        compared_model_ids: figureRows().map((row) => row.id),
      },
    };
  }

  function exportMetadataColumns(provenance) {
    return [
      ["export_scope", () => provenance.export_scope],
      ["export_row_count", () => provenance.row_count],
      ["release_id", () => provenance.release_id],
      ["release_status", () => provenance.release_status],
      ["feed_sha256", () => provenance.feed_sha256],
      ["loaded_feed_sha256", () => provenance.loaded_feed_sha256],
      ["feed_verified", () => provenance.feed_verified],
      ["release_reproducibility_contract", () => provenance.reproducibility_contract_version],
      ["publication_scope_json", () => provenance.publication_scope],
      ["archive_url", () => provenance.archive_url],
      ["release_view_url", () => provenance.release_view_url],
      ["asset_base_url", () => provenance.asset_base_url],
      ["leaderboard_manifest_url", () => provenance.leaderboard_manifest.url],
      ["leaderboard_manifest_sha256", () => provenance.leaderboard_manifest.publication_sha256 || provenance.leaderboard_manifest.loaded_sha256],
      ["loaded_leaderboard_manifest_sha256", () => provenance.leaderboard_manifest.loaded_sha256],
      ["leaderboard_manifest_pin_required", () => provenance.leaderboard_manifest.pin_required],
      ["leaderboard_manifest_pin_verified", () => provenance.leaderboard_manifest.pin_verified],
      ["profile_ground_truth_json", () => provenance.profile_ground_truth],
      ["ranking_contract_json", () => provenance.ranking_contract],
      ["claims_index_json", () => provenance.claims_index],
      ["view_url", () => provenance.view_url],
      ["release_license_spdx", () => provenance.license.spdx_id],
      ["release_license_name", () => provenance.license.name],
      ["release_license_url", () => provenance.license.url],
      ["release_license_scope", () => provenance.license.scope],
      ["filters_json", () => provenance.filters],
      ["rank", (row) => row.rank],
      ["ranked_result_count", (row) => rowRanking(row)?.ranked_result_count],
      ["rank_tied", (row) => rowRanking(row)?.tied],
      ["rank_tie_count", (row) => rowRanking(row)?.tie_count],
      ["ranking_metric_id", (row) => rowRanking(row)?.metric_id],
      ["ranking_metric_label", (row) => plainMetricLabel(metricDefinition(rowRanking(row)?.metric_id))],
      ["ranking_metric_value", (row) => rowRanking(row)?.ranked_value],
      ["ranking_metric_display_value", (row) => rowRanking(row)?.display_value],
      ["ranking_metric_raw_value", (row) => rowRanking(row)?.value],
      ["ranking_metric_unit", (row) => rowRanking(row)?.unit],
      ["ranking_direction", (row) => rowRanking(row)?.direction],
      ["ranking_decimal_places", (row) => rowRanking(row)?.decimal_places],
      ["ranking_rounding", (row) => rowRanking(row)?.rounding],
      ["ranking_method", (row) => rowRanking(row)?.method],
      ["ranking_scope_release_id", () => provenance.release_id],
      ["ranking_scope_dataset", (row) => row.dataset],
      ["ranking_scope_dataset_id", (row) => row.dataset_id],
      ["ranking_scope_split", (row) => row.split],
      ["ranking_scope_split_id", (row) => row.split_id],
      ["declared_academic_citation_eligible", (row) => declaredClaimEligibility(row).academic_citation],
      ["declared_promotion_eligible", (row) => declaredClaimEligibility(row).promotion],
      ["declared_eligibility_reason_code", (row) => declaredClaimEligibility(row).reason_code],
      ["declared_eligibility_reason", (row) => declaredClaimEligibility(row).reason],
      ["browser_verification_passed", (row) => claimEligibility(row).browser_verification.passed],
      ["browser_verification_status", (row) => claimEligibility(row).browser_verification.status],
      ["browser_verification_reason_codes", (row) => claimEligibility(row).browser_verification.reason_codes],
      ["browser_verification_reasons", (row) => claimEligibility(row).browser_verification.reasons],
      ["academic_citation_copy_enabled", (row) => claimEligibility(row).academic_citation],
      ["promotion_copy_enabled", (row) => claimEligibility(row).promotion],
      ["claim_record_url", (row) => resultClaimRecordUrl(row)],
      ["claim_record_attempted_url", (row) => claimRecordCheck(row)?.url],
      ["claim_record_sha256", (row) => claimRecordCheck(row)?.sha256],
      ["claim_record_verification_status", (row) => claimRecordCheck(row)?.status || "not_checked"],
      ["claim_record_verification_error", (row) => claimRecordCheck(row)?.error],
      ["submission_id", (row) => row.id],
      ["dataset", (row) => row.dataset],
      ["dataset_version", (row) => row.dataset_version],
      ["split", (row) => row.split],
      ["split_id", (row) => row.split_id],
      ["model", (row) => row.model],
      ["submitted_by", (row) => row.submitter],
      ["institution", (row) => row.institution],
      ["model_types", (row) => row.modelTypes],
      ["training_regime", (row) => row.training_regime],
      ["target_data_used", (row) => row.target_data_used],
      ["external_pretraining", (row) => row.external_pretraining],
      ["pretraining_data", (row) => row.pretraining_data],
      ["training_regime_explanation", (row) => row.training_regime_explanation],
      ["parameter_count_millions", (row) => row.parameter_count_millions ?? row.parameterCount],
      ["submitted_at", (row) => row.date],
      ["evaluation_reference_version", (row) => row.evaluation?.reference_version],
      ["evaluation_code_revision", (row) => row.evaluation?.code_revision],
      ["evaluation_command", (row) => row.evaluation?.command],
      ["evaluation_evidence_file", (row) => row.evaluation?.evidence_file],
      ["evaluation_evidence_sha256", (row) => row.evaluation?.evidence_sha256],
      ["scoring_support_release_id", (row) => scoringSupportSummary(row).release_id],
      ["scoring_support_status", (row) => scoringSupportSummary(row).status],
      ["scoring_support_manifest_url", (row) => scoringSupportSummary(row).manifest_url],
      ["scoring_support_manifest_sha256", (row) => scoringSupportSummary(row).manifest_sha256],
      ["surface_scoring_support_id", (row) => scoringSupportSummary(row).surface_support_id],
      ["volume_scoring_support_id", (row) => scoringSupportSummary(row).volume_support_id],
      ["discretization_file", (row) => bindingFile(discretizationBinding(row))],
      ["discretization_sha256", (row) => bindingSha256(discretizationBinding(row))],
      ["discretization_cases_file", (row) => bindingFile(discretizationCaseBinding(row))],
      ["discretization_cases_sha256", (row) => bindingSha256(discretizationCaseBinding(row))],
      ["case_metrics_file", (row) => bindingFile(caseMetricsBinding(row))],
      ["case_metrics_sha256", (row) => bindingSha256(caseMetricsBinding(row))],
      ["case_metrics_case_count", (row) => caseMetricsBinding(row).case_count],
      [
        "training_surface_input_json",
        (row) => spatialComponent(row, ["training", "surface", "input"], ["training", "surface_input"], ["training_surface_input"]),
      ],
      [
        "training_surface_supervision_json",
        (row) => spatialComponent(row, ["training", "surface", "supervision"], ["training", "surface_supervision"], ["training_surface_supervision"]),
      ],
      [
        "training_volume_input_json",
        (row) => spatialComponent(row, ["training", "volume", "input"], ["training", "volume_input"], ["training_volume_input"]),
      ],
      [
        "training_volume_supervision_json",
        (row) => spatialComponent(row, ["training", "volume", "supervision"], ["training", "volume_supervision"], ["training_volume_supervision"]),
      ],
      [
        "inference_surface_input_json",
        (row) => spatialComponent(row, ["inference", "surface_input"], ["inference", "geometry_input", "surface"], ["inference_surface_input"]),
      ],
      [
        "inference_volume_input_json",
        (row) => spatialComponent(row, ["inference", "volume_input"], ["inference", "geometry_input", "volume"], ["inference_volume_input"]),
      ],
      [
        "inference_mesh_dependency",
        (row) =>
          spatialComponent(
            row,
            ["inference", "geometry_dependency"],
            ["inference", "mesh_dependency"],
            ["inference", "native_mesh_dependency"],
            ["inference_mesh_dependency"]
          ),
      ],
      [
        "direct_surface_output_json",
        (row) =>
          inferenceDirectOutputs(row, "surface").length
            ? inferenceDirectOutputs(row, "surface")
            : spatialComponent(row, ["inference", "surface_direct_output"], ["surface_direct_output"]),
      ],
      [
        "direct_volume_output_json",
        (row) =>
          inferenceDirectOutputs(row, "volume").length
            ? inferenceDirectOutputs(row, "volume")
            : spatialComponent(row, ["inference", "volume_direct_output"], ["volume_direct_output"]),
      ],
      ["scoring_mapping_json", (row) => inferenceMappings(row)],
      ["declared_scoring_coverage_json", (row) => scoringCoverageSummary(row)],
      ["prediction_data_status", (row) => predictionAvailability(row).label],
      ["prediction_artifacts_json", (row) => predictionArtifacts(row)],
      ["prediction_artifact_checks_json", (row) => predictionArtifactChecks(row)],
      ["prediction_coverage_kind", (row) => predictionAvailability(row).code],
      ["prediction_case_count", (row) => predictionAvailability(row).count],
      ["prediction_expected_case_count", (row) => predictionAvailability(row).expected],
      ["prediction_artifact_kind", (row) => primaryPredictionArtifact(row).kind],
      ["prediction_artifact_provider", (row) => predictionArtifactProvider(primaryPredictionArtifact(row))],
      ["prediction_artifact_repository_url", (row) => firstValue(primaryPredictionArtifact(row).repository_url, primaryPredictionArtifact(row).url)],
      ["prediction_artifact_revision", (row) => primaryPredictionArtifact(row).revision],
      ["prediction_artifact_manifest_file", (row) => primaryPredictionArtifact(row).manifest_file],
      ["prediction_artifact_manifest_sha256", (row) => primaryPredictionArtifact(row).manifest_sha256],
      ["prediction_artifact_format", (row) => primaryPredictionArtifact(row).format],
      ["prediction_artifact_license_spdx", (row) => primaryPredictionArtifact(row).license_spdx],
      ["prediction_artifact_check_status", (row) => predictionArtifactStatus(row).label],
      ["prediction_artifact_check_code", (row) => predictionArtifactStatus(row).code],
      ["prediction_artifact_checked_by", (row) => predictionArtifactCheck(row).checked_by],
      ["prediction_artifact_checked_at", (row) => predictionArtifactCheck(row).checked_at],
      ["prediction_artifact_check_record_file", (row) => bindingFile(predictionArtifactChecksBinding(row))],
      ["prediction_artifact_check_record_sha256", (row) => bindingSha256(predictionArtifactChecksBinding(row))],
      ["prediction_metric_recomputation", (row) => predictionMetricRecomputation(row).label],
      ["prediction_metric_recomputation_code", (row) => predictionMetricRecomputation(row).code],
      ["prediction_metric_recomputed_case_count", (row) => predictionMetricRecomputation(row).count],
      ["prediction_metric_recomputed_expected_case_count", (row) => predictionMetricRecomputation(row).expected],
      ["reproducibility_contract", (row) => row.reproducibility?.contract_version],
      ["reproducibility_access", (row) => row.reproducibility?.access],
      ["public_test_data_use", (row) => row.reproducibility?.public_test_data_use],
      ["result_data_license", (row) => row.reproducibility?.result_data_license_spdx],
      ["reproducibility_code_artifact_availability", (row) => reproducibilityArtifactAvailability(row).code],
      ["reproducibility_code_repository", (row) => row.reproducibility?.code?.repository_url],
      ["reproducibility_code_commit", (row) => row.reproducibility?.code?.commit],
      ["reproducibility_code_license", (row) => row.reproducibility?.code?.license_spdx],
      ["reproducibility_model_artifact_availability", (row) => reproducibilityArtifactAvailability(row).model],
      ["model_artifact_url", (row) => row.reproducibility?.model_artifact?.url],
      ["model_artifact_sha256", (row) => row.reproducibility?.model_artifact?.sha256],
      ["model_artifact_license", (row) => row.reproducibility?.model_artifact?.license_spdx],
      ["reproducibility_environment_artifact_availability", (row) => reproducibilityArtifactAvailability(row).environment],
      ["environment_kind", (row) => row.reproducibility?.environment?.kind],
      ["environment_url", (row) => row.reproducibility?.environment?.url],
      ["environment_sha256", (row) => row.reproducibility?.environment?.sha256],
      ["reproducibility_artifact_documentation_availability", (row) => reproducibilityArtifactAvailability(row).documentation],
      ["artifact_documentation_url", (row) => row.reproducibility?.artifact_documentation_url],
      ["approval_status", (row) => row.approval?.status],
      ["approved_by", (row) => row.approval?.approved_by],
      ["approved_at", (row) => row.approval?.approved_at],
      ["pull_request_url", (row) => row.approval?.pull_request_url],
      ["maintainer_validation_status", (row) => maintainerValidation(row).status],
      ["maintainer_validation_schema_version", (row) => maintainerValidation(row).schema_version],
      ["maintainer_validation_contract", (row) => maintainerValidation(row).contract_version],
      ["maintainer_validation_reference", (row) => maintainerValidation(row).reference_version],
      ["maintainer_validated_by", (row) => maintainerValidation(row).validated_by],
      ["maintainer_validated_at", (row) => maintainerValidation(row).validated_at],
      ["validation_scope", (row) => maintainerValidation(row).validation_scope],
      ["model_execution", (row) => maintainerValidation(row).model_execution],
      ["metric_recomputation", (row) => maintainerValidation(row).metric_recomputation],
      ["reviewed_submission_sha256", (row) => maintainerValidation(row).reviewed_submission_sha256],
      ["validated_evaluation_evidence_sha256", (row) => maintainerValidation(row).evaluation_evidence_sha256],
      ["validated_profile_index_sha256", (row) => maintainerValidation(row).profile_index_sha256],
      ["validated_case_set_id", (row) => maintainerValidation(row).case_set_id],
      ["validated_profile_ground_truth_release_id", (row) => maintainerValidation(row).profile_ground_truth_release_id],
      ["validated_profile_ground_truth_manifest_sha256", (row) => maintainerValidation(row).profile_ground_truth_manifest_sha256],
      ["validated_scoring_support_release_id", (row) => maintainerValidation(row).scoring_support_release_id],
      ["validated_scoring_support_manifest_sha256", (row) => maintainerValidation(row).scoring_support_manifest_sha256],
      ["validated_discretization_sha256", (row) => maintainerValidation(row).discretization_sha256],
      ["validated_case_metrics_sha256", (row) => maintainerValidation(row).case_metrics_sha256],
      ["maintainer_validation_evidence_path", (row) => maintainerValidation(row).evidence_path],
      ["maintainer_validation_evidence_sha256", (row) => maintainerValidation(row).evidence_sha256],
      ["paper_url", (row) => row.paper_url],
      ["code_url", (row) => row.code_url],
      ["profile_index_file", (row) => row.profile_data?.index_file],
      ["profile_index_sha256", (row) => row.profile_data?.index_sha256],
      ["profile_ground_truth_release_id", (row) => row.profile_data?.profile_ground_truth_release_id],
      ["profile_ground_truth_manifest_sha256", (row) => row.profile_data?.profile_ground_truth_manifest_sha256],
      ["result_permalink", (row) => resultUrl(row, Boolean(releaseViewUrl()))],
      ["note", (row) => row.note],
    ];
  }

  function exportFilename(extension) {
    const releaseId = slug(dataRelease().id || "unversioned");
    return `fluidsbench-${slug(state.dataset)}-${slug(state.split)}-${state.exportScope}-${releaseId}.${extension}`;
  }

  function downloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    element("leaderboard-release-action-status").textContent = `Downloaded ${filename}.`;
  }

  function downloadText(filename, content, type) {
    downloadBlob(filename, new Blob([content], { type }));
  }

  async function verifiedTableExportRows() {
    const rows = tableExportRows();
    const snapshot = {
      dataset: state.dataset,
      split: state.split,
      exportScope: state.exportScope,
      modelType: state.modelType,
      sortKey: state.sortKey,
      sortDirection: state.sortDirection,
      loadVersion: state.loadVersion,
      viewQuery: viewSearchParams(false).toString(),
      rowIds: rows.map((row) => row.id),
    };
    const status = element("leaderboard-release-action-status");
    if (status) status.textContent = "Verifying claim and validation records for the table export...";
    await ensureClaimsIndex();
    await Promise.all(rows.flatMap((row) => [ensureClaimRecord(row), ensureValidationEvidence(row)]));
    const currentRowIds = tableExportRows().map((row) => row.id);
    if (
      state.dataset !== snapshot.dataset ||
      state.split !== snapshot.split ||
      state.exportScope !== snapshot.exportScope ||
      state.modelType !== snapshot.modelType ||
      state.sortKey !== snapshot.sortKey ||
      state.sortDirection !== snapshot.sortDirection ||
      state.loadVersion !== snapshot.loadVersion ||
      viewSearchParams(false).toString() !== snapshot.viewQuery ||
      currentRowIds.join("\u0000") !== snapshot.rowIds.join("\u0000")
    ) {
      throw new Error("The leaderboard selection changed while export records were being verified; export the current view again.");
    }
    return rows;
  }

  async function exportCsv() {
    try {
      const rows = await verifiedTableExportRows();
      const provenance = exportProvenance(rows.length);
      const metadata = exportMetadataColumns(provenance);
      const metrics = activeMetricDefinitions();
      const header = [...metadata.map(([label]) => label), ...metrics.map((definition) => definition.id)];
      const lines = [header.map(csvCell).join(",")];
      rows.forEach((row) => {
        const values = [...metadata.map(([, value]) => value(row)), ...metrics.map((definition) => row.metricValues[definition.id])];
        lines.push(values.map(csvCell).join(","));
      });
      downloadText(exportFilename("csv"), `${lines.join("\n")}\n`, "text/csv;charset=utf-8");
    } catch (error) {
      const status = element("leaderboard-release-action-status");
      if (status) status.textContent = `Could not export table CSV: ${error.message}`;
      console.error(error);
    }
  }

  function sourceSubmission(row) {
    const { id, rank, metricValues, modelTypes, parameterCount, submitter, date, _ranking, _feedIndex, ranking, claim_eligibility, ...source } = row;
    const eligibility = claimEligibility(row);
    const claimCheck = claimRecordCheck(row);
    return {
      rank,
      ranked_result_count: rowRanking(row)?.ranked_result_count ?? null,
      rank_tied: rowRanking(row)?.tied ?? false,
      rank_tie_count: rowRanking(row)?.tie_count ?? 0,
      ranking: rowRanking(row),
      claim_eligibility: claim_eligibility || declaredClaimEligibility(row),
      browser_verification: eligibility.browser_verification,
      copy_readiness: {
        academic_citation: eligibility.academic_citation,
        promotion: eligibility.promotion,
      },
      ...source,
      spatial_provenance: {
        scoring_support: scoringSupportSummary(row),
        discretization: {
          file: bindingFile(discretizationBinding(row)) || null,
          sha256: bindingSha256(discretizationBinding(row)) || null,
          cases_file: bindingFile(discretizationCaseBinding(row)) || null,
          cases_sha256: bindingSha256(discretizationCaseBinding(row)) || null,
          summary: discretizationSummary(row),
        },
        case_metrics: {
          file: bindingFile(caseMetricsBinding(row)) || null,
          sha256: bindingSha256(caseMetricsBinding(row)) || null,
          case_count: finiteNumber(caseMetricsBinding(row).case_count),
        },
      },
      prediction_evidence: {
        availability: predictionAvailability(row),
        artifacts: predictionArtifacts(row),
        artifact: primaryPredictionArtifact(row),
        maintainer_checks: {
          file: bindingFile(predictionArtifactChecksBinding(row)) || null,
          sha256: bindingSha256(predictionArtifactChecksBinding(row)) || null,
          checks: predictionArtifactChecks(row),
        },
        primary_artifact: primaryPredictionArtifact(row),
        primary_artifact_check: {
          ...predictionArtifactCheck(row),
          display_status: predictionArtifactStatus(row),
        },
        artifact_check: {
          ...predictionArtifactCheck(row),
          display_status: predictionArtifactStatus(row),
        },
        metric_recomputation: predictionMetricRecomputation(row),
      },
      reproducibility_artifact_availability: reproducibilityArtifactAvailability(row),
      result_permalink: resultUrl(row, Boolean(releaseViewUrl())),
      claim_record: {
        url: resultClaimRecordUrl(row) || null,
        attempted_url: claimCheck?.url || null,
        sha256: claimCheck?.sha256 || null,
        verification_status: claimCheck?.status || "not_checked",
        verification_error: claimCheck?.error || null,
      },
    };
  }

  async function exportJson() {
    try {
      const rows = await verifiedTableExportRows();
      const provenance = exportProvenance(rows.length);
      const payload = {
        schema_version: "fluidsbench-leaderboard-export-v4",
        exported_at: new Date().toISOString(),
        data_release: dataRelease(),
        provenance,
        ranking: rankingPolicy(),
        metric_definitions: activeMetricDefinitions(),
        submissions: rows.map(sourceSubmission),
      };
      downloadText(exportFilename("json"), `${JSON.stringify(payload, null, 2)}\n`, "application/json;charset=utf-8");
    } catch (error) {
      const status = element("leaderboard-release-action-status");
      if (status) status.textContent = `Could not export table JSON: ${error.message}`;
      console.error(error);
    }
  }

  function rankingValueText(context) {
    if (!context || context.ranked_value === null || context.ranked_value === undefined) return "not supplied";
    return `${context.display_value}${context.unit ? ` ${context.unit}` : ""}`;
  }

  function resultRankText(context) {
    if (!context || context.rank === null || context.rank === undefined) return "unranked";
    return `${context.tied ? "joint " : ""}rank ${context.rank} of ${context.ranked_result_count}`;
  }

  function resultClaimRecordUrl(row) {
    const check = claimRecordCheck(row);
    if (check?.status !== "verified") return "";
    const record = verifiedClaimRecord(row);
    return safeHttpUrl(record?.claim_record_url);
  }

  function bibtexEscape(value) {
    const escaped = {
      "\\": "\\textbackslash{}",
      "{": "\\{",
      "}": "\\}",
      "&": "\\&",
      "%": "\\%",
      _: "\\_",
      "#": "\\#",
      $: "\\$",
      "^": "\\textasciicircum{}",
      "~": "\\textasciitilde{}",
    };
    return Array.from(String(value ?? ""), (character) => escaped[character] || (/\s/.test(character) ? " " : character)).join("");
  }

  function metricRecomputationStatement(row) {
    if (!row) return "Metric recomputation is result-specific; consult each result record.";
    const recomputation = predictionMetricRecomputation(row);
    if (recomputation.code === "complete_split") {
      return "FluidsBench recomputed the complete evaluation/test split metrics from the shared scored predictions.";
    }
    if (recomputation.code === "example_cases") {
      return `FluidsBench recomputed ${recomputation.count ?? "some"}/${
        recomputation.expected ?? "?"
      } example evaluation/test cases; complete-split metric recomputation was not performed.`;
    }
    return "FluidsBench did not recompute base metrics from scored predictions.";
  }

  function citationValues() {
    const release = dataRelease();
    const citation = release.citation || {};
    const author = citation.author || "FluidsBench contributors";
    const title = citation.title || "FluidsBench Leaderboard";
    const publisher = citation.publisher || "FluidsBench";
    const year = citation.year || new Date(release.generated_at || Date.now()).getUTCFullYear();
    const releaseId = release.id || "unversioned";
    const checksum = release.feed_sha256 || "not supplied";
    const manifestChecksum = releaseManifestSha256() || "not supplied";
    const citedResult = state.resultId ? rowsForActiveSplit().find((row) => row.id === state.resultId) : null;
    const url = citedResult ? resultUrl(citedResult, true) : citedViewUrl();
    const validation = citedResult ? maintainerValidation(citedResult) : {};
    const resultRanking = citedResult ? rowRanking(citedResult) : null;
    const context = citedResult ? `${state.dataset}, ${state.split}, ${citedResult.model} (${citedResult.id})` : `${state.dataset}, ${state.split}`;
    const status = humanize(release.status || "not supplied");
    const resultNote = citedResult
      ? ` ${resultRankText(resultRanking)} by ${
          plainMetricLabel(metricDefinition(resultRanking?.metric_id)) || resultRanking?.metric_id || "the ranking metric"
        } (${rankingValueText(resultRanking)}; ${
          resultRanking?.direction || "direction not supplied"
        } is better), scoped to this exact dataset, split, and release. Result status: ${humanize(
          citedResult.approvalStatus
        )}; submission package validation ${validation.status || "not supplied"} (scope: ${
          validation.validation_scope || "not supplied"
        }; model execution: ${validation.model_execution || "not supplied"}; metric recomputation: ${
          validation.metric_recomputation || "not supplied"
        }; profile ground-truth release: ${validation.profile_ground_truth_release_id || "not supplied"}; profile ground-truth manifest SHA-256: ${
          validation.profile_ground_truth_manifest_sha256 || "not supplied"
        }), validation record SHA-256 ${validation.evidence_sha256 || "not supplied"}.`
      : "";
    const license = releaseLicenseMetadata();
    const archiveNote = releaseArchiveUrl() ? `Release data archive: ${releaseArchiveUrl()}.` : "No separate release data archive is supplied.";
    const releaseViewNote = releaseViewUrl() ? `Immutable release view: ${releaseViewUrl()}.` : "No immutable release view is supplied.";
    const bibtexKeyParts = ["fluidsbench", slug(state.dataset), slug(state.split)];
    if (citedResult) bibtexKeyParts.push(slug(citedResult.id));
    bibtexKeyParts.push(slug(releaseId));
    const bibtexKey = bibtexKeyParts.filter(Boolean).join("_").replaceAll("-", "_");
    const claimRecord = citedResult ? resultClaimRecordUrl(citedResult) : "";
    const recomputationNote = metricRecomputationStatement(citedResult);
    const promotion = citedResult
      ? `In FluidsBench data release ${releaseId}, ${citedResult.model} is recorded at ${resultRankText(resultRanking)} on ${state.dataset} / ${
          state.split
        }, ordered by ${
          plainMetricLabel(metricDefinition(resultRanking?.metric_id)) || resultRanking?.metric_id || "the ranking metric"
        } (${rankingValueText(resultRanking)}; ${
          resultRanking?.direction || "direction not supplied"
        } is better). The score is calculated on the declared evaluation/test split, not the training split. This rank applies only to that exact dataset, split, and release—not the changing current leaderboard. The result uses submitter-provided metrics and profile predictions; FluidsBench validated the submitted package and did not run the model. ${recomputationNote} Release manifest SHA-256: ${manifestChecksum}. ${url}${
          claimRecord ? ` Claim record: ${claimRecord}` : ""
        }`
      : "";
    const bibtexTitle = citedResult ? `FluidsBench result: ${citedResult.model} on ${state.dataset} / ${state.split}` : `${title}: ${context}`;
    const bibtexNote = `Exact data release ${releaseId}; status ${status}; release manifest SHA-256 ${manifestChecksum}; feed SHA-256 ${checksum}; licence ${
      license.label
    };${resultNote} model-result data are ${resultDataOriginLabel()}; FluidsBench model execution was not performed; ${recomputationNote} ${releaseViewNote} ${archiveNote}${
      claimRecord ? ` Claim record: ${claimRecord}.` : ""
    }`;
    return {
      plain: `${author} (${year}). ${title}: ${context}. ${publisher}, exact data release ${releaseId} (status: ${status}), release manifest SHA-256 ${manifestChecksum}, verified feed SHA-256 ${checksum}.${resultNote} Model-result data are ${resultDataOriginLabel()}; FluidsBench model execution was not performed. ${recomputationNote} Scores refer to the declared evaluation/test split, not the training split. Licence: ${
        license.label
      }; scope: ${license.scope}. ${releaseViewNote} ${archiveNote} ${claimRecord ? `Claim record: ${claimRecord}. ` : ""}${url}`,
      bibtex: `@misc{${bibtexKey},\n  author = {{${bibtexEscape(author)}}},\n  title = {${bibtexEscape(bibtexTitle)}},\n  year = {${bibtexEscape(
        year
      )}},\n  publisher = {${bibtexEscape(publisher)}},\n  version = {${bibtexEscape(releaseId)}},\n  url = {${bibtexEscape(
        url
      )}},\n  note = {${bibtexEscape(bibtexNote)}}\n}`,
      promotion,
    };
  }

  function openCitationDialog() {
    const citation = citationValues();
    element("citation-text").textContent = citation.plain;
    element("citation-bibtex").textContent = citation.bibtex;
    element("citation-copy-status").textContent = "";
    const dialog = element("citation-dialog");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  async function copyCitation(kind) {
    const value = citationValues()[kind];
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
      else {
        const input = document.createElement("textarea");
        input.value = value;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      element("citation-copy-status").textContent = `${kind === "bibtex" ? "BibTeX" : "Plain-text citation"} copied.`;
    } catch (error) {
      element("citation-copy-status").textContent = `Could not copy automatically: ${error.message}`;
    }
  }

  function staticHelp(key) {
    const types = Array.from(new Set((state.rows.get(state.dataset) || []).flatMap((row) => row.modelTypes))).join(", ");
    const policy = rankingPolicy();
    const rankMetric = metricDefinition(policy.metric_id);
    const trainingLabels = trainingRegimeDefinitions()
      .map((definition) => definition.label)
      .join(", ");
    const definitions = {
      rank: `Competition rank within this exact loaded release, dataset, and split, ordered by ${rankMetric?.label || "the ranking metric"} at ${
        policy.decimal_places
      } decimal place${
        policy.decimal_places === 1 ? "" : "s"
      }. Ties share a position (1, 2, 2, 4). Filters and table sorting do not change rank. Prototype rows are not official rankings.`,
      model: "Model name declared by the submitter. Open-code and model-artifact provenance appears in result details when supplied.",
      submitter: "Person, research group, institution, or company submitting the result.",
      split: `Declared ${state.dataset} benchmark split used for training and public-ground-truth evaluation.`,
      modelTypes: `One or more submitted architecture categories. Available here: ${types || "none"}.`,
      status:
        "Prototype rows are illustrative only. An official result requires a validated submission package and maintainer approval. Public code, model, and environment artifacts are optional and are reported when supplied; their absence does not affect rank, citation eligibility, or promotion eligibility.",
      predictionData:
        "Optional public scored predictions or direct model outputs. Complete means every case in the selected split is declared; Examples means only some cases are declared. Sharing does not affect accuracy rank, citation eligibility, or promotion eligibility. Open Details for the separate artifact-check and metric-recomputation statuses.",
      training: `How the model was initialized and whether target-dataset training data were used. Supported values: ${trainingLabels}.`,
      parameters: "Submitter-reported trainable parameter count in millions; a missing value remains missing rather than being treated as zero.",
      date: "Date associated with the submitted result.",
      details: "Opens a deep-linkable result record with submission, optional-artifact, validation, approval, and metric metadata.",
    };
    return definitions[key] || "";
  }

  function metricDescription(definition) {
    return String(definition.description || "")
      .replace(/\s*(?:Lower|Higher) is better\.?\s*$/i, "")
      .trim();
  }

  function metricHelp(definition) {
    const direction = definition.direction === "lower" ? "Lower is better." : "Higher is better.";
    const unit = definition.unit ? ` Unit: ${definition.unit}.` : "";
    return `${metricDescription(definition)} ${direction}${unit}`;
  }

  function metricColumnGroup(definition) {
    return definition.column_group || definition.group;
  }

  function groupClass(group) {
    return columnGroups.find((candidate) => candidate.id === group)?.className || "metric-group-neutral";
  }

  function columnGroupLabel(group, defaultLabel) {
    return activeDataset()?.column_group_labels?.[group] || defaultLabel;
  }

  function allColumns() {
    const columns = [
      { key: "rank", label: "Rank", sortKey: "rank" },
      { key: "model", label: "Model", sortKey: "model" },
      { key: "submitter", label: "Submitted by", sortKey: "submitter" },
      { key: "modelTypes", label: "Model type", sortKey: "modelTypes", group: "model-details" },
      { key: "training", label: "Training", sortKey: "training_regime", group: "model-details" },
      { key: "predictionData", label: "Prediction data", sortKey: "predictionData", group: "model-details" },
      { key: "status", label: "Result status", sortKey: "approvalStatus", group: "model-details" },
      { key: "split", label: "Split", sortKey: "split" },
    ];
    activeMetricDefinitions().forEach((definition) => {
      columns.push({
        key: definition.id,
        label: definition.label,
        plainLabel: plainMetricLabel(definition),
        sortKey: `metric:${definition.id}`,
        group: metricColumnGroup(definition),
        definition,
      });
    });
    columns.push(
      { key: "parameters", label: "Parameters (M)", sortKey: "parameters", group: "model-details" },
      { key: "date", label: "Date", sortKey: "date", group: "model-details" },
      { key: "details", label: "Details", group: "model-details" }
    );
    return columns;
  }

  function activeColumns() {
    return allColumns().filter((column) => !column.group || state.visibleGroups.has(column.group));
  }

  function initializeVisibleGroups() {
    state.visibleGroups = new Set(activeMetricDefinitions().map(metricColumnGroup));
    state.visibleGroups.add("model-details");
  }

  function renderColumnToggles() {
    const container = element("leaderboard-column-toggles");
    if (!container) return;
    container.replaceChildren();
    const availableGroups = new Set(activeMetricDefinitions().map(metricColumnGroup));
    availableGroups.add("model-details");
    columnGroups
      .filter(({ id }) => availableGroups.has(id))
      .forEach(({ id: group, label: defaultLabel, className }) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `leaderboard-column-toggle ${className}`;
        button.dataset.columnGroupToggle = group;
        button.textContent = columnGroupLabel(group, defaultLabel);
        button.setAttribute("aria-pressed", String(state.visibleGroups.has(group)));
        button.classList.toggle("is-active", state.visibleGroups.has(group));
        button.addEventListener("click", () => {
          if (state.visibleGroups.has(group)) state.visibleGroups.delete(group);
          else state.visibleGroups.add(group);
          renderColumnToggles();
          renderTable();
          updateUrl();
        });
        container.appendChild(button);
      });
  }

  function headerHelpButton(column) {
    const help = document.createElement("button");
    help.type = "button";
    help.className = "leaderboard-column-help";
    help.textContent = "i";
    help.setAttribute("aria-label", `About ${column.plainLabel || column.label}`);
    help.setAttribute("aria-controls", "column-help-popover");
    help.setAttribute("aria-expanded", "false");
    help.dataset.helpTitle = column.label;
    help.dataset.helpText = column.definition ? metricHelp(column.definition) : staticHelp(column.key);
    if (column.definition) {
      help.dataset.definitionHref = "#metric-definitions";
      help.dataset.definitionLabel = "Metric definitions";
    } else if (column.key === "split") {
      help.dataset.definitionHref = "#split-definitions";
      help.dataset.definitionLabel = "Split definitions";
    } else if (column.key === "training") {
      help.dataset.definitionHref = "#training-definitions";
      help.dataset.definitionLabel = "Training definitions";
    }
    help.addEventListener("click", () => showHelp(help));
    return help;
  }

  function renderHeader() {
    const row = element("leaderboard-header-row");
    row.replaceChildren();
    let previousGroup = null;
    activeColumns().forEach((column) => {
      const th = document.createElement("th");
      th.scope = "col";
      th.dataset.columnKey = column.key;
      if (column.group) {
        th.dataset.columnGroup = column.group;
        th.classList.add(groupClass(column.group));
      }
      if (column.group && column.group !== previousGroup) th.classList.add("leaderboard-group-start");
      previousGroup = column.group || previousGroup;

      const wrapper = document.createElement("div");
      wrapper.className = "leaderboard-header-content";
      if (column.sortKey) {
        const sortButton = document.createElement("button");
        sortButton.type = "button";
        sortButton.className = "leaderboard-sort-button";
        const active = state.sortKey === column.sortKey;
        if (active) th.setAttribute("aria-sort", state.sortDirection === "asc" ? "ascending" : "descending");
        appendFormattedMetricLabel(sortButton, column.label);
        if (active) {
          const indicator = document.createElement("span");
          indicator.setAttribute("aria-hidden", "true");
          indicator.textContent = state.sortDirection === "asc" ? "  ↑" : "  ↓";
          sortButton.appendChild(indicator);
        }
        const nextDirection = active
          ? state.sortDirection === "asc"
            ? "descending"
            : "ascending"
          : defaultSortDirection(column) === "asc"
            ? "ascending"
            : "descending";
        sortButton.setAttribute("aria-label", `Sort by ${column.plainLabel || column.label}, ${nextDirection}`);
        sortButton.addEventListener("click", () => changeSort(column));
        wrapper.appendChild(sortButton);
      } else {
        const label = document.createElement("span");
        appendFormattedMetricLabel(label, column.label);
        wrapper.appendChild(label);
      }
      wrapper.appendChild(headerHelpButton(column));
      th.appendChild(wrapper);
      row.appendChild(th);
    });
  }

  function defaultSortDirection(column) {
    if (column.key === "predictionData") return "desc";
    if (column.key === "rank" || ["model", "submitter", "split", "modelTypes", "training", "status", "date"].includes(column.key)) {
      return "asc";
    }
    if (column.definition) return column.definition.direction === "lower" ? "asc" : "desc";
    return column.key === "parameters" ? "asc" : "desc";
  }

  function changeSort(column) {
    if (state.sortKey === column.sortKey) {
      state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
    } else {
      state.sortKey = column.sortKey;
      state.sortDirection = defaultSortDirection(column);
    }
    renderTable();
    updateUrl();
  }

  function trainingLabel(row) {
    return trainingRegimeDefinition(row.training_regime)?.label || row.training_regime || "Not supplied";
  }

  function targetDataLabel(value) {
    const labels = {
      none: "None",
      official_train: "Declared benchmark training partition",
      other: "Other target-dataset data",
    };
    return labels[value] || value || "Not supplied";
  }

  function pretrainingDataLabel(items) {
    if (!Array.isArray(items) || !items.length) return "None declared";
    return items
      .map((item) => {
        if (typeof item === "string") return item;
        const details = [
          item?.type,
          item?.samples ? `${item.samples} samples` : "",
          item?.public === true ? "public" : item?.public === false ? "non-public" : "",
        ]
          .filter(Boolean)
          .join(", ");
        const name = item?.name || "Unnamed pretraining dataset";
        return `${name}${details ? ` (${details})` : ""}${item?.notes ? `: ${item.notes}` : ""}`;
      })
      .join("; ");
  }

  function cellValue(row, column) {
    if (column.definition) return formatMetric(row.metricValues[column.key], column.definition);
    const values = {
      rank: row.rank,
      model: row.model,
      submitter: row.submitter,
      split: row.split,
      modelTypes: row.modelTypes.join(", ") || "Not supplied",
      training: trainingLabel(row),
      predictionData: predictionAvailability(row).label,
      status: humanize(row.approvalStatus),
      parameters: formatNumber(row.parameterCount, 2),
      date: row.date || "Not supplied",
    };
    return values[column.key] ?? "";
  }

  function chip(className, value) {
    const item = document.createElement("span");
    item.className = className;
    item.textContent = value;
    return item;
  }

  function appendCellContent(cell, submission, column) {
    if (column.key === "details") {
      const link = document.createElement("a");
      link.className = "leaderboard-detail-button";
      link.href = resultUrl(submission);
      link.textContent = "Details";
      link.addEventListener("click", (event) => {
        event.preventDefault();
        openDetails(submission);
      });
      cell.appendChild(link);
      return;
    }
    if (column.key === "rank") {
      const context = rowRanking(submission);
      const rankChip = chip("leaderboard-rank", submission.rank ?? "—");
      if (context?.tied) {
        rankChip.title = `Joint rank ${context.rank}; ${context.tie_count} results share this published value.`;
        rankChip.setAttribute("aria-label", `Joint rank ${context.rank} of ${context.ranked_result_count}, shared by ${context.tie_count} results`);
      }
      cell.appendChild(rankChip);
      return;
    }
    if (column.key === "model") {
      cell.classList.add("leaderboard-model");
      const link = document.createElement("a");
      link.className = "leaderboard-result-link";
      link.href = resultUrl(submission);
      link.textContent = cellValue(submission, column);
      link.addEventListener("click", (event) => {
        event.preventDefault();
        openDetails(submission);
      });
      cell.appendChild(link);
      return;
    } else if (column.key === "submitter") {
      cell.classList.add("leaderboard-submitter");
    } else if (column.key === "split") {
      cell.appendChild(chip("leaderboard-split", submission.split));
      return;
    } else if (column.key === "modelTypes") {
      const list = document.createElement("span");
      list.className = "leaderboard-chip-list";
      const types = submission.modelTypes.length ? submission.modelTypes : ["Not supplied"];
      types.forEach((type) => list.appendChild(chip("leaderboard-type", type)));
      cell.appendChild(list);
      return;
    } else if (column.key === "training") {
      cell.appendChild(chip("leaderboard-training", trainingLabel(submission)));
      return;
    } else if (column.key === "predictionData") {
      cell.appendChild(chip("leaderboard-training", predictionAvailability(submission).label));
      return;
    } else if (column.key === "status") {
      cell.appendChild(chip("leaderboard-training", humanize(submission.approvalStatus)));
      return;
    }
    cell.textContent = cellValue(submission, column);
  }

  function renderTable() {
    renderHeader();
    const body = element("leaderboard-body");
    body.replaceChildren();
    const rows = filteredRows();
    if (!rows.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = Math.max(1, activeColumns().length);
      cell.className = "leaderboard-empty";
      cell.textContent = "No leaderboard rows match this dataset, split, and model type.";
      row.appendChild(cell);
      body.appendChild(row);
      return;
    }

    const columns = activeColumns();
    rows.forEach((submission) => {
      const row = document.createElement("tr");
      row.dataset.submissionId = submission.id;
      let previousGroup = null;
      columns.forEach((column) => {
        const cell = document.createElement("td");
        cell.dataset.label = column.plainLabel || column.label;
        cell.dataset.columnKey = column.key;
        if (column.group) {
          cell.dataset.columnGroup = column.group;
          cell.classList.add(groupClass(column.group));
        }
        if (column.group && column.group !== previousGroup) cell.classList.add("leaderboard-group-start");
        previousGroup = column.group || previousGroup;
        appendCellContent(cell, submission, column);
        row.appendChild(cell);
      });
      body.appendChild(row);
    });
  }

  function renderTypeFilter() {
    const types = Array.from(new Set((state.rows.get(state.dataset) || []).flatMap((row) => row.modelTypes))).sort();
    const options = [{ value: "", label: "All model types" }, ...types.map((type) => ({ value: type, label: type }))];
    state.modelType = populateSelect(element("type-filter"), options, state.modelType);
  }

  function setDefaultComparedModels() {
    state.comparedModelIds = new Set(
      rowsForCurrentModelType()
        .slice(0, 5)
        .map((row) => row.id)
    );
    state.staleComparedModelIds = new Set();
  }

  function renderComparisonModelPicker() {
    const container = element("comparison-model-options");
    if (!container) return;
    container.replaceChildren();
    const rows = rowsForCurrentModelType();
    const selectedCount = rows.filter((row) => state.comparedModelIds.has(row.id)).length;
    rows.forEach((row) => {
      const label = document.createElement("label");
      label.className = "leaderboard-model-option";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = row.id;
      input.checked = state.comparedModelIds.has(row.id);
      input.disabled = !input.checked && selectedCount >= maxFigureModels;
      input.dataset.comparisonModel = "";
      const text = document.createElement("span");
      const context = rowRanking(row);
      text.textContent = `${rowLabel(row)} — ${context?.tied ? "joint " : ""}rank ${row.rank ?? "unranked"}`;
      label.append(input, text);
      container.appendChild(label);
    });
    const staleCount = state.staleComparedModelIds.size;
    const count = element("comparison-model-count");
    if (count) {
      count.textContent = `${selectedCount} of ${rows.length} models selected${
        staleCount
          ? `; ${staleCount} requested model ID${staleCount === 1 ? " could" : "s could"} not be used (unavailable or above the figure limit)`
          : ""
      }. Maximum ${maxFigureModels}.`;
    }
  }

  function updateFigureSelection() {
    renderComparisonModelPicker();
    renderComparisonChart();
    renderScatterChart();
    void refreshProfileContext();
    updateUrl();
  }

  function comparisonDefinitions() {
    return activeMetricDefinitions().filter((definition) => definition.comparison_group);
  }

  function renderComparisonControls() {
    const definitions = comparisonDefinitions();
    if (!definitions.some((definition) => definition.id === state.comparisonMetric)) {
      const rankMetricId = ranking().metric_id;
      state.comparisonMetric = definitions.some((definition) => definition.id === rankMetricId) ? rankMetricId : definitions[0]?.id || "";
    }
    const options = definitions.map((definition) => {
      const groupLabel = definition.comparison_group_label || definition.group_label;
      const unit = definition.unit ? ` (${definition.unit})` : "";
      return {
        value: definition.id,
        label: `${groupLabel}: ${plainMetricLabel(definition)}${unit}`,
      };
    });
    state.comparisonMetric = populateSelect(element("comparison-metric"), options, state.comparisonMetric);
  }

  function chartTextColor() {
    return getComputedStyle(document.documentElement).getPropertyValue("--global-text-color").trim() || "#27313b";
  }

  function chartGridColor() {
    return getComputedStyle(document.documentElement).getPropertyValue("--global-divider-color").trim() || "rgba(90,100,110,.18)";
  }

  function destroyChart(key) {
    state.charts[key]?.destroy();
    state.charts[key] = null;
  }

  function profileFigureReady(key) {
    const values = state.figureSpecs.get(key)?.data?.values;
    return Boolean(
      key.startsWith("profile-") &&
        state.profileReadyVersion === state.profileLoadVersion &&
        Array.isArray(values) &&
        values.length &&
        state.figureCaptions.get(key)
    );
  }

  function assertProfileFigureCurrent(key, version) {
    if (!key.startsWith("profile-")) return;
    if (version !== state.profileLoadVersion || version !== state.profileReadyVersion || !profileFigureReady(key)) {
      throw new Error("The profile selection changed while this export was being prepared; try again after loading finishes");
    }
  }

  function syncProfileActionAvailability() {
    document.querySelectorAll('[data-figure-key^="profile-"], [data-copy-caption^="profile-"], [data-profile-data-index]').forEach((button) => {
      const key = button.dataset.figureKey || button.dataset.copyCaption || `profile-${button.dataset.profileDataIndex}`;
      button.disabled = !profileFigureReady(key);
    });
  }

  function invalidateProfileFigure(key, clearSummary = true) {
    state.figureSpecs.delete(key);
    state.figureCaptions.delete(key);
    destroyChart(key);
    const index = key.slice("profile-".length);
    const canvas = element(`${key}-chart`);
    if (canvas) canvas.hidden = true;
    const caption = element(`${key}-figure-caption`);
    if (caption) caption.textContent = "";
    const table = element(`${key}-data-table`);
    if (table) table.replaceChildren();
    if (clearSummary) setChartSummary(`${key}-chart-summary`, "");
    document.querySelectorAll(`[data-figure-key="${key}"], [data-copy-caption="${key}"], [data-profile-data-index="${index}"]`).forEach((button) => {
      button.disabled = true;
    });
  }

  function invalidateProfileFigures() {
    state.profileReadyVersion = -1;
    const keys = new Set(
      [...state.figureSpecs.keys(), ...state.figureCaptions.keys()]
        .filter((key) => key.startsWith("profile-"))
        .concat(Array.from(document.querySelectorAll("[data-profile-panel]"), (section) => `profile-${section.dataset.profilePanel}`))
    );
    keys.forEach((key) => invalidateProfileFigure(key));
    syncProfileActionAvailability();
  }

  function comparisonLabel(value, definition) {
    return formatMetric(value, definition);
  }

  function rowsForMetric(rows, definition) {
    return rows
      .filter((row) => finiteNumber(row.metricValues[definition.id]) !== null)
      .sort((a, b) => compareNumbers(a.metricValues[definition.id], b.metricValues[definition.id], definition.direction));
  }

  function omissionSentence(rows, reason) {
    if (!rows.length) return "";
    return ` Omitted selected result${rows.length === 1 ? "" : "s"} ${rows.map((row) => row.id).join(", ")} (${reason}).`;
  }

  function setChartSummary(id, text) {
    const summary = element(id);
    if (summary) summary.textContent = text;
  }

  function setFigureCaption(key, text) {
    state.figureCaptions.set(key, text);
    const caption = element(`${key}-figure-caption`);
    if (caption) caption.textContent = text;
  }

  function renderNumericTable(containerId, captionText, columns, rows) {
    const container = element(containerId);
    if (!container) return;
    container.replaceChildren();
    const table = document.createElement("table");
    table.className = "leaderboard-data-table";
    const caption = document.createElement("caption");
    caption.textContent = captionText;
    const head = document.createElement("thead");
    const headRow = document.createElement("tr");
    columns.forEach((column) => {
      const cell = document.createElement("th");
      cell.scope = "col";
      cell.textContent = column.label;
      headRow.appendChild(cell);
    });
    head.appendChild(headRow);
    const body = document.createElement("tbody");
    rows.forEach((row) => {
      const tableRow = document.createElement("tr");
      columns.forEach((column) => {
        const cell = document.createElement("td");
        const value = typeof column.value === "function" ? column.value(row) : row[column.value];
        cell.textContent = value === null || value === undefined ? "" : String(value);
        tableRow.appendChild(cell);
      });
      body.appendChild(tableRow);
    });
    table.append(caption, head, body);
    container.appendChild(table);
  }

  function figureFilename(key, extension) {
    return `fluidsbench-${slug(state.dataset)}-${slug(state.split)}-${slug(key)}-${slug(dataRelease().id || "unversioned")}.${extension}`;
  }

  function xmlEscape(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");
  }

  function figureExportSnapshot(key, format) {
    const spec = state.figureSpecs.get(key);
    if (!spec) throw new Error("No figure data are available for this selection");
    const captionEntry = state.figureCaptions.get(key);
    const caption = captionEntry || releaseStamp();
    const metadata = {
      schema_version: "fluidsbench-svg-metadata-v2",
      release: dataRelease(),
      leaderboard_manifest: leaderboardManifestProvenance(),
      loaded_feed_sha256: state.loadedFeedSha256,
      feed_verified: state.feedVerified,
      loaded_profile_ground_truth_manifest: state.groundTruthManifestProvenance ? { ...state.groundTruthManifestProvenance } : null,
      archive_url: releaseArchiveUrl() || null,
      license: releaseLicenseMetadata(),
      publication_scope: publicationScope(),
      view_url: currentViewUrl(false, false),
      selected_submission_ids: Array.from(new Set((spec.data?.values || []).map((row) => row.submission_id).filter(Boolean))),
      caption,
      figure_spec: spec,
    };
    return {
      key,
      spec,
      captionEntry,
      caption,
      metadata,
      svgTitle: `${state.dataset}: ${key}`,
      filename: format === "print" ? "" : figureFilename(key, format),
      profileVersion: key.startsWith("profile-") ? state.profileLoadVersion : null,
    };
  }

  function assertFigureExportCurrent(snapshot) {
    if (state.figureSpecs.get(snapshot.key) !== snapshot.spec || state.figureCaptions.get(snapshot.key) !== snapshot.captionEntry) {
      throw new Error("Figure selection changed while the export was being prepared; export again for the current view");
    }
    if (snapshot.profileVersion !== null) assertProfileFigureCurrent(snapshot.key, snapshot.profileVersion);
  }

  function decorateSvg(svg, snapshot) {
    const annotation = `<title>${xmlEscape(snapshot.svgTitle)}</title><desc>${xmlEscape(snapshot.caption)}</desc><metadata>${xmlEscape(
      JSON.stringify(snapshot.metadata)
    )}</metadata>`;
    return svg.replace(/<svg([^>]*)>/, `<svg$1>${annotation}`);
  }

  function figureSpecBase(title, values) {
    const release = dataRelease();
    const subtitle = [
      `Data release ${release.id || "unversioned"} · status ${humanize(release.status || "not supplied")}`,
      `Release manifest SHA-256: ${releaseManifestSha256() || "not supplied"}`,
      `Verified scalar feed SHA-256: ${state.loadedFeedSha256 || release.feed_sha256 || "not supplied"}`,
      `Result data: ${humanize(publicationScope().result_data_origin)} · FluidsBench model execution and base-metric recomputation: not performed`,
      releaseArchiveUrl() ? `Release data archive: ${releaseArchiveUrl()}` : "No separate release data archive supplied",
      releaseViewUrl() ? `Immutable release view: ${releaseViewUrl()}` : "No immutable release view supplied",
    ];
    if (release.profile_ground_truth?.release_id) {
      subtitle.push(
        `Profile ground truth: ${release.profile_ground_truth.release_id} · manifest SHA-256 ${
          release.profile_ground_truth.manifest_sha256 || "not supplied"
        }`
      );
    }
    if (release.status !== "official") subtitle.push("PROTOTYPE — NOT FOR CITATION OR PROMOTIONAL CLAIMS");
    return {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      width: 900,
      height: 480,
      background: "white",
      padding: 16,
      title: {
        text: title,
        subtitle,
        anchor: "start",
        color: "#111827",
        fontSize: 18,
        subtitleColor: "#4b5563",
        subtitleFontSize: 11,
        subtitleLineHeight: 15,
      },
      data: { values },
      config: {
        font: "Arial",
        axis: {
          domainColor: "#4b5563",
          gridColor: "#e5e7eb",
          labelColor: "#111827",
          titleColor: "#111827",
          titleFontWeight: 600,
        },
        legend: { labelColor: "#111827", titleColor: "#111827" },
        view: { stroke: null },
      },
      usermeta: {
        fluidsbench_release: dataRelease(),
        fluidsbench_archive_url: releaseArchiveUrl() || null,
        fluidsbench_license: releaseLicenseMetadata(),
        fluidsbench_publication_scope: publicationScope(),
        fluidsbench_view_url: currentViewUrl(false, false),
      },
    };
  }

  async function withVegaView(spec, callback) {
    if (typeof window.vegaEmbed !== "function") throw new Error("The vector export library is not available");
    const host = document.createElement("div");
    host.style.cssText = "left:-10000px;position:fixed;top:0;width:960px;";
    document.body.appendChild(host);
    let result;
    try {
      result = await window.vegaEmbed(host, spec, { actions: false, renderer: "svg" });
      await result.view.runAsync();
      return await callback(result.view);
    } finally {
      result?.view?.finalize();
      host.remove();
    }
  }

  function printFigureSvg(svg, caption) {
    element("leaderboard-print-figure")?.remove();
    const printArea = document.createElement("section");
    printArea.id = "leaderboard-print-figure";
    printArea.setAttribute("aria-label", "FluidsBench figure print view");
    printArea.innerHTML = svg;
    const captionElement = document.createElement("p");
    captionElement.textContent = caption;
    printArea.appendChild(captionElement);
    document.body.appendChild(printArea);
    const cleanup = () => {
      document.body.classList.remove("leaderboard-printing");
      printArea.remove();
    };
    window.addEventListener("afterprint", cleanup, { once: true });
    document.body.classList.add("leaderboard-printing");
    window.print();
    window.setTimeout(() => {
      if (document.body.classList.contains("leaderboard-printing")) cleanup();
    }, 120000);
  }

  async function exportFigure(key, format) {
    const status = element("leaderboard-release-action-status");
    try {
      const snapshot = figureExportSnapshot(key, format);
      assertFigureExportCurrent(snapshot);
      if (status) status.textContent = `Preparing ${format === "print" ? "print view" : format.toUpperCase()}...`;
      if (format === "svg") {
        const renderedSvg = await withVegaView(snapshot.spec, (view) => view.toSVG());
        assertFigureExportCurrent(snapshot);
        const svg = decorateSvg(renderedSvg, snapshot);
        downloadText(snapshot.filename, svg, "image/svg+xml;charset=utf-8");
      } else if (format === "png") {
        const dataUrl = await withVegaView(snapshot.spec, (view) => view.toImageURL("png", 3));
        assertFigureExportCurrent(snapshot);
        const blob = await fetch(dataUrl).then((response) => response.blob());
        assertFigureExportCurrent(snapshot);
        downloadBlob(snapshot.filename, blob);
      } else if (format === "print") {
        const renderedSvg = await withVegaView(snapshot.spec, (view) => view.toSVG());
        assertFigureExportCurrent(snapshot);
        const svg = decorateSvg(renderedSvg, snapshot);
        printFigureSvg(svg, snapshot.caption);
        if (status) status.textContent = "Opened the browser print dialog; choose Save as PDF to create a PDF.";
      }
    } catch (error) {
      if (status) status.textContent = `Could not export figure: ${error.message}`;
      console.error(error);
    }
  }

  async function copyText(value) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.cssText = "opacity:0;position:fixed;";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }

  async function copyFigureCaption(key) {
    const caption = state.figureCaptions.get(key);
    if (!caption) return;
    const status = element("leaderboard-release-action-status");
    try {
      await copyText(caption);
      if (status) status.textContent = "Figure caption copied.";
    } catch (error) {
      if (status) status.textContent = `Could not copy caption: ${error.message}`;
    }
  }

  async function copyResultCitation(kind) {
    const status = element("result-citation-copy-status");
    const row = state.resultId ? rowsForActiveSplit().find((candidate) => candidate.id === state.resultId) : null;
    const eligibility = claimEligibility(row);
    const allowed = kind === "promotion" ? eligibility.promotion : eligibility.academic_citation;
    if (!row || !allowed) {
      const declaredAllowed = kind === "promotion" ? eligibility.declared.promotion : eligibility.declared.academic_citation;
      if (status) {
        status.textContent = declaredAllowed
          ? `Copying is temporarily unavailable because browser verification has not passed: ${eligibility.reason}`
          : `Copy unavailable under the release declaration: ${eligibility.declared.reason}`;
      }
      return;
    }
    try {
      await copyText(citationValues()[kind]);
      if (status) {
        status.textContent = `${kind === "bibtex" ? "Result BibTeX" : kind === "promotion" ? "Leaderboard claim" : "Result citation"} copied.`;
      }
    } catch (error) {
      if (status) status.textContent = `Could not copy result citation: ${error.message}`;
    }
  }

  const barValueLabels = {
    id: "barValueLabels",
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      ctx.save();
      ctx.fillStyle = chartTextColor();
      ctx.font = "600 11px system-ui, sans-serif";
      ctx.textAlign = "center";
      chart.data.datasets.forEach((dataset, datasetIndex) => {
        const definition = dataset.metricDefinition;
        chart.getDatasetMeta(datasetIndex).data.forEach((bar, index) => {
          const value = dataset.data[index];
          if (!Number.isFinite(value)) return;
          ctx.fillText(comparisonLabel(value, definition), bar.x, Math.max(chart.chartArea.top + 10, bar.y - 7));
        });
      });
      ctx.restore();
    },
  };

  function renderComparisonChart() {
    const canvas = element("comparison-chart");
    if (!canvas || typeof Chart === "undefined") return;
    destroyChart("comparison");
    const definition = comparisonDefinitions().find((candidate) => candidate.id === state.comparisonMetric);
    if (!definition) return;
    const selectedRows = figureRows();
    const rows = rowsForMetric(selectedRows, definition);
    const omittedRows = selectedRows.filter((row) => finiteNumber(row.metricValues[definition.id]) === null);
    const directionText = `${definition.direction === "lower" ? "Lower" : "Higher"} is better`;
    const unitText = definition.unit ? ` Values are shown in ${definition.unit}.` : "";
    element("comparison-description").textContent = `${plainMetricLabel(definition)}: ${directionText.toLowerCase()}.${unitText}`;
    const rowsWithValues = rows;
    const bestRow = rowsWithValues[0];
    const bestText = bestRow
      ? ` Best displayed value: ${rowLabel(bestRow)}, ${formatMetric(bestRow.metricValues[definition.id], definition)}.`
      : " No numeric values are available for this selection.";
    canvas.setAttribute("aria-label", `${plainMetricLabel(definition)} comparison for ${state.dataset}, ${state.split}`);
    setChartSummary(
      "comparison-chart-summary",
      `${plainMetricLabel(definition)} bar chart for ${state.dataset}, ${state.split}. ${
        rowsWithValues.length
      } explicitly selected submissions displayed. ${directionText}.${bestText}${omissionSentence(omittedRows, "metric unavailable")}`
    );
    const caption = `${state.dataset}, ${state.split}: ${plainMetricLabel(definition)} for ${rows.length} explicitly selected model${
      rows.length === 1 ? "" : "s"
    }; ${directionText.toLowerCase()}.${omissionSentence(
      omittedRows,
      "metric unavailable"
    )} ${releaseStamp()}. Open reproducibility track with public scored ground truth.`;
    setFigureCaption("comparison", caption);
    const figureValues = rows.map((row, index) => ({
      model: rowLabel(row),
      submission_id: row.id,
      rank: row.rank,
      value: row.metricValues[definition.id],
      order: index,
      ...validationMetadata(row),
    }));
    state.figureSpecs.set("comparison", {
      ...figureSpecBase(`${state.dataset}: ${plainMetricLabel(definition)}`, figureValues),
      mark: { type: "bar", color: palette[0], tooltip: true },
      encoding: {
        x: {
          field: "model",
          type: "nominal",
          sort: { field: "order", order: "ascending" },
          axis: { labelAngle: -25, labelLimit: 180, title: "Model" },
        },
        y: { field: "value", type: "quantitative", scale: { zero: true }, title: axisTitle(definition) },
        tooltip: [
          { field: "model", type: "nominal", title: "Model" },
          { field: "submission_id", type: "nominal", title: "Submission ID" },
          { field: "rank", type: "quantitative", title: "Overall rank" },
          { field: "value", type: "quantitative", title: plainMetricLabel(definition) },
        ],
      },
    });
    renderNumericTable(
      "comparison-data-table",
      `${plainMetricLabel(definition)} values used in the displayed figure.`,
      [
        { label: "Model", value: (row) => rowLabel(row) },
        { label: "Submission ID", value: "id" },
        { label: "Rank", value: "rank" },
        { label: plainMetricLabel(definition), value: (row) => String(row.metricValues[definition.id]) },
        { label: "Unit", value: () => definition.unit || "dimensionless" },
        { label: "Direction", value: () => `${definition.direction} is better` },
      ],
      rows
    );
    state.charts.comparison = new Chart(canvas, {
      type: "bar",
      data: {
        labels: rows.map(rowLabel),
        datasets: [
          {
            label: plainMetricLabel(definition),
            data: rows.map((row) => row.metricValues[definition.id]),
            backgroundColor: `${palette[0]}cc`,
            borderColor: palette[0],
            borderWidth: 1,
            metricDefinition: definition,
          },
        ],
      },
      plugins: [barValueLabels],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 34, right: 10 } },
        interaction: { mode: "index", intersect: false },
        scales: {
          x: { ticks: { color: chartTextColor() }, grid: { display: false } },
          y: {
            beginAtZero: true,
            grace: "12%",
            title: { display: true, text: axisTitle(definition), color: chartTextColor() },
            ticks: { color: chartTextColor() },
            grid: { color: chartGridColor() },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(context) {
                return `${context.dataset.label}: ${comparisonLabel(context.raw, context.dataset.metricDefinition)}`;
              },
            },
          },
        },
      },
    });
  }

  function scatterDefinitions() {
    return [...activeMetricDefinitions(), { id: "parameters", label: "Parameters", unit: "M", digits: 2, direction: "neutral", kind: "metadata" }];
  }

  function renderScatterControls() {
    const definitions = scatterDefinitions();
    const options = definitions.map((definition) => ({ value: definition.id, label: plainMetricLabel(definition) }));
    const rankMetricId = ranking().metric_id;
    if (!definitions.some((definition) => definition.id === state.scatterY)) state.scatterY = rankMetricId;
    if (!definitions.some((definition) => definition.id === state.scatterX) || state.scatterX === state.scatterY) {
      state.scatterX = definitions.find((definition) => definition.id !== state.scatterY)?.id || state.scatterY;
    }
    state.scatterX = populateSelect(element("scatter-x-axis"), options, state.scatterX);
    state.scatterY = populateSelect(element("scatter-y-axis"), options, state.scatterY);
  }

  function scatterValue(row, metricId) {
    return metricId === "parameters" ? row.parameterCount : row.metricValues[metricId];
  }

  function axisTitle(definition) {
    const label = `${plainMetricLabel(definition)}${definition.unit ? ` (${definition.unit})` : ""}`;
    if (definition.direction === "neutral") return label;
    const direction = definition.direction === "lower" ? "lower is better" : "higher is better";
    return `${label}; ${direction}`;
  }

  function renderScatterChart() {
    const canvas = element("scatter-chart");
    if (!canvas || typeof Chart === "undefined") return;
    destroyChart("scatter");
    const definitions = new Map(scatterDefinitions().map((definition) => [definition.id, definition]));
    const xDefinition = definitions.get(state.scatterX);
    const yDefinition = definitions.get(state.scatterY);
    if (!xDefinition || !yDefinition) return;
    const rows = figureRows();
    const points = rows
      .map((row, index) => ({
        x: scatterValue(row, state.scatterX),
        y: scatterValue(row, state.scatterY),
        row,
        backgroundColor: palette[index % palette.length],
      }))
      .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
    const plottedIds = new Set(points.map((point) => point.row.id));
    const omittedRows = rows.filter((row) => !plottedIds.has(row.id));
    const xValues = points.map((point) => point.x);
    const yValues = points.map((point) => point.y);
    const rangeText = points.length
      ? ` ${plainMetricLabel(xDefinition)} ranges from ${formatMetric(Math.min(...xValues), xDefinition)} to ${formatMetric(
          Math.max(...xValues),
          xDefinition
        )}; ${plainMetricLabel(yDefinition)} ranges from ${formatMetric(Math.min(...yValues), yDefinition)} to ${formatMetric(
          Math.max(...yValues),
          yDefinition
        )}.`
      : " No submissions have numeric values for both selected axes.";
    canvas.setAttribute(
      "aria-label",
      `${plainMetricLabel(xDefinition)} versus ${plainMetricLabel(yDefinition)} for ${state.dataset}, ${state.split}`
    );
    setChartSummary(
      "scatter-chart-summary",
      `Scatter chart for ${state.dataset}, ${state.split}, with ${points.length} explicitly selected submissions.${rangeText}${omissionSentence(
        omittedRows,
        "one or both axis values unavailable"
      )}`
    );
    const caption = `${state.dataset}, ${state.split}: ${plainMetricLabel(xDefinition)} versus ${plainMetricLabel(yDefinition)} for ${
      points.length
    } explicitly selected model${points.length === 1 ? "" : "s"}.${omissionSentence(
      omittedRows,
      "one or both axis values unavailable"
    )} ${releaseStamp()}. Open reproducibility track with public scored ground truth.`;
    setFigureCaption("scatter", caption);
    const figureValues = points.map((point, index) => ({
      model: rowLabel(point.row),
      submission_id: point.row.id,
      rank: point.row.rank,
      x: point.x,
      y: point.y,
      order: index,
      ...validationMetadata(point.row),
    }));
    state.figureSpecs.set("scatter", {
      ...figureSpecBase(`${state.dataset}: metric scatter`, figureValues),
      mark: { type: "point", filled: true, size: 120, tooltip: true },
      encoding: {
        x: { field: "x", type: "quantitative", title: axisTitle(xDefinition) },
        y: { field: "y", type: "quantitative", title: axisTitle(yDefinition) },
        color: {
          field: "model",
          type: "nominal",
          scale: { domain: figureValues.map((point) => point.model), range: palette.slice(0, figureValues.length) },
          legend: { title: "Model", labelLimit: 260 },
        },
        tooltip: [
          { field: "model", type: "nominal", title: "Model" },
          { field: "submission_id", type: "nominal", title: "Submission ID" },
          { field: "rank", type: "quantitative", title: "Overall rank" },
          { field: "x", type: "quantitative", title: plainMetricLabel(xDefinition) },
          { field: "y", type: "quantitative", title: plainMetricLabel(yDefinition) },
        ],
      },
    });
    renderNumericTable(
      "scatter-data-table",
      `Values used in the displayed ${plainMetricLabel(xDefinition)} versus ${plainMetricLabel(yDefinition)} figure.`,
      [
        { label: "Model", value: (point) => rowLabel(point.row) },
        { label: "Submission ID", value: (point) => point.row.id },
        { label: "Rank", value: (point) => point.row.rank },
        { label: plainMetricLabel(xDefinition), value: (point) => String(point.x) },
        { label: "X unit", value: () => xDefinition.unit || "dimensionless" },
        { label: plainMetricLabel(yDefinition), value: (point) => String(point.y) },
        { label: "Y unit", value: () => yDefinition.unit || "dimensionless" },
      ],
      points
    );
    state.charts.scatter = new Chart(canvas, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: `${plainMetricLabel(xDefinition)} vs ${plainMetricLabel(yDefinition)}`,
            data: points,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: points.map((point) => point.backgroundColor),
            pointBorderColor: "#ffffff",
            pointBorderWidth: 1.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        parsing: false,
        scales: {
          x: {
            title: { display: true, text: axisTitle(xDefinition), color: chartTextColor() },
            ticks: { color: chartTextColor() },
            grid: { color: chartGridColor() },
          },
          y: {
            title: { display: true, text: axisTitle(yDefinition), color: chartTextColor() },
            ticks: { color: chartTextColor() },
            grid: { color: chartGridColor() },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title(items) {
                return items[0]?.raw?.row ? rowLabel(items[0].raw.row) : "Submission";
              },
              label(context) {
                const point = context.raw;
                return [
                  `${plainMetricLabel(xDefinition)}: ${formatMetric(point.x, xDefinition)}`,
                  `${plainMetricLabel(yDefinition)}: ${formatMetric(point.y, yDefinition)}`,
                ];
              },
            },
          },
        },
      },
    });
  }

  function panelSelection(panel) {
    const key = `${state.dataset}:${panel.id}`;
    if (!state.panelSelections.has(key)) {
      state.panelSelections.set(key, {
        quantity: panel.quantities?.[0]?.id || "",
        station: panel.stations?.[0]?.id || "",
      });
    }
    return state.panelSelections.get(key);
  }

  function profileCaseSelects() {
    return document.querySelectorAll("[data-profile-case-select]");
  }

  function syncProfileCaseSelects() {
    const options = state.profileCaseIds.map((caseId) => ({ value: caseId, label: caseId }));
    profileCaseSelects().forEach((select) => {
      populateSelect(select, options, state.profileCase);
      select.disabled = options.length === 0;
    });
  }

  function setProfileStatus(message) {
    (activeDataset()?.diagnostic_panels || []).forEach((_, index) => {
      const status = element(`profile-${index}-status`);
      if (!status) return;
      status.hidden = !message;
      status.textContent = message;
    });
  }

  function renderPanelControls(index) {
    const panel = activeDataset()?.diagnostic_panels?.[index];
    const section = document.querySelector(`[data-profile-panel="${index}"]`);
    if (!panel) {
      if (section) section.hidden = true;
      return;
    }
    if (section) section.hidden = false;
    element(`profile-${index}-title`).textContent = panel.title;
    const hasPlaceholderStations = (panel.stations || []).some((station) => station.id.startsWith("prototype_"));
    element(`profile-${index}-description`).textContent = hasPlaceholderStations
      ? `${panel.description} These stations are illustrative placeholders, not official dataset locations.`
      : panel.description;
    const selection = panelSelection(panel);
    selection.quantity = populateSelect(
      element(`profile-${index}-quantity`),
      (panel.quantities || []).map((quantity) => ({ value: quantity.id, label: quantity.label })),
      selection.quantity
    );
    selection.station = populateSelect(
      element(`profile-${index}-station`),
      (panel.stations || []).map((station) => {
        const isPlaceholder = station.id.startsWith("prototype_");
        return {
          value: station.id,
          label: isPlaceholder ? `Illustrative: ${station.label}` : station.label,
          title: isPlaceholder ? `${station.description} This is not an official dataset station.` : station.description,
        };
      }),
      selection.station
    );
    const quantityControl = element(`profile-${index}-quantity`)?.closest(".chart-control");
    if (quantityControl) quantityControl.hidden = (panel.quantities || []).length <= 1;
    syncProfileCaseSelects();
  }

  function profilePanelElement(panel, index) {
    const section = document.createElement("section");
    section.className = "leaderboard-panel profile-panel";
    section.dataset.profilePanel = index;
    section.innerHTML = `
      <div class="leaderboard-panel-heading">
        <div>
          <h3 id="profile-${index}-title"></h3>
          <p id="profile-${index}-description"></p>
        </div>
        <div class="chart-control-row">
          <div class="chart-control">
            <label class="chart-control-title" for="profile-${index}-dataset">Dataset</label>
            <select id="profile-${index}-dataset" data-leaderboard-dataset-select></select>
          </div>
          <div class="chart-control">
            <label class="chart-control-title" for="profile-${index}-split">Split</label>
            <select id="profile-${index}-split" data-leaderboard-split-select></select>
          </div>
          <div class="chart-control profile-case-control">
            <label class="chart-control-title" for="profile-${index}-case">Public evaluation geometry</label>
            <select id="profile-${index}-case" data-profile-case-select disabled></select>
          </div>
          <div class="chart-control">
            <label class="chart-control-title" for="profile-${index}-quantity">Quantity</label>
            <select id="profile-${index}-quantity"></select>
          </div>
          <div class="chart-control">
            <label class="chart-control-title" for="profile-${index}-station">Station</label>
            <select id="profile-${index}-station"></select>
          </div>
        </div>
      </div>
      <div class="leaderboard-figure-toolbar" role="group" aria-label="${escapeHtml(panel.title)} figure and data actions">
        <button class="leaderboard-action-button" type="button" data-figure-key="profile-${index}" data-figure-format="svg" disabled>SVG</button>
        <button class="leaderboard-action-button" type="button" data-figure-key="profile-${index}" data-figure-format="png" disabled>High-res PNG</button>
        <button class="leaderboard-action-button" type="button" data-figure-key="profile-${index}" data-figure-format="print" disabled>Print / save PDF</button>
        <button class="leaderboard-action-button" type="button" data-profile-data-index="${index}" data-profile-data-format="csv" disabled>Plot data CSV</button>
        <button class="leaderboard-action-button" type="button" data-profile-data-index="${index}" data-profile-data-format="json" disabled>Plot data JSON</button>
        <button class="leaderboard-action-button" type="button" data-copy-caption="profile-${index}" disabled>Copy caption</button>
      </div>
      <div class="chart-frame">
        <p id="profile-${index}-status" class="profile-chart-status" role="status">Loading profile data...</p>
        <canvas id="profile-${index}-chart" role="img" aria-label="${escapeHtml(
          panel.title
        )}" aria-describedby="profile-${index}-chart-summary profile-${index}-figure-caption"></canvas>
        <p id="profile-${index}-chart-summary" class="leaderboard-sr-only"></p>
      </div>
      <p id="profile-${index}-figure-caption" class="leaderboard-figure-caption"></p>
      <details class="leaderboard-numeric-data">
        <summary>View numeric figure data</summary>
        <div id="profile-${index}-data-table" class="leaderboard-data-table-wrap"></div>
      </details>`;
    return section;
  }

  function renderDiagnosticPanels() {
    Object.keys(state.charts)
      .filter((key) => key.startsWith("profile-"))
      .forEach(destroyChart);
    const container = element("leaderboard-profile-panels");
    if (!container) return;
    container.replaceChildren();
    const panels = activeDataset()?.diagnostic_panels || [];
    panels.forEach((panel, index) => {
      container.appendChild(profilePanelElement(panel, index));
      renderPanelControls(index);
      element(`profile-${index}-quantity`)?.addEventListener("change", (event) => {
        panelSelection(panel).quantity = event.target.value;
        renderProfileChart(index);
        updateUrl();
      });
      element(`profile-${index}-station`)?.addEventListener("change", (event) => {
        panelSelection(panel).station = event.target.value;
        renderProfileChart(index);
        updateUrl();
      });
    });
    syncDatasetSelects();
    syncSplitSelects();
    syncProfileCaseSelects();
    syncProfileActionAvailability();
  }

  function profileSeries(source, panel, stationId, quantity) {
    const match = (source?.series || []).find((candidate) => {
      return candidate.panel_id === panel.id && candidate.station_id === stationId && candidate.quantity_id === quantity.id;
    });
    if (!match) return null;
    const coordinates = match.coordinate || [];
    const values = match.prediction || match.value || [];
    const sourcePointCount = Math.max(coordinates.length, values.length);
    const points = [];
    for (let index = 0; index < sourcePointCount; index += 1) {
      const x = finiteNumber(coordinates[index]);
      const y = finiteNumber(values[index]);
      if (x !== null && y !== null) points.push({ x, y, sourcePointIndex: index });
    }
    return points.length ? { points, sourcePointCount, droppedPointCount: sourcePointCount - points.length } : null;
  }

  async function refreshProfileContext() {
    const version = ++state.profileLoadVersion;
    invalidateProfileFigures();
    const dataset = activeDataset();
    if (!dataset || !state.split) {
      setProfileStatus("No profile data are available for this selection.");
      return;
    }
    const rows = figureRows();
    setGroundTruthComparisonHealth(false);
    setProfileStatus("Loading profile data...");
    try {
      let groundTruthContext = null;
      let groundTruthError = null;
      let availableCaseIds = [];
      try {
        groundTruthContext = await groundTruthIndex(state.dataset, state.split);
        availableCaseIds = caseIds(groundTruthContext.index);
      } catch (error) {
        groundTruthError = error;
        showProfileWarning(error);
      }
      if (!availableCaseIds.length && rows.length) {
        const fallback = await submissionProfileIndex(rows[0]);
        availableCaseIds = caseIds(fallback.index);
      }
      if (version !== state.profileLoadVersion) return;
      state.profileCaseIds = availableCaseIds;
      if (!availableCaseIds.includes(state.profileCase)) state.profileCase = availableCaseIds[0] || "";
      syncProfileCaseSelects();
      if (!state.profileCase) {
        state.groundTruthCase = null;
        state.profileCases = new Map();
        state.profileCaseErrors = new Map();
        setProfileStatus("No profile cases are available for this dataset and split.");
        syncProfileActionAvailability();
        return;
      }

      const groundTruthRequest = groundTruthContext
        ? indexedProfileCase(groundTruthContext, state.profileCase, state.groundTruthChunks, `${state.dataset} ground truth`)
        : Promise.resolve(null);
      const rowRequests = rows.map(async (row) => {
        try {
          const context = await submissionProfileIndex(row);
          const value = await indexedProfileCase(context, state.profileCase, state.profileChunks, rowLabel(row));
          return { id: row.id, value, error: value ? null : "selected case is absent from the checksum-verified submitted profile package" };
        } catch (error) {
          console.error(error);
          return { id: row.id, value: null, error: error.message };
        }
      });
      const [groundTruthCase, rowCases] = await Promise.all([groundTruthRequest, Promise.all(rowRequests)]);
      if (version !== state.profileLoadVersion) return;
      state.groundTruthCase = groundTruthCase;
      state.profileCases = new Map(rowCases.map(({ id, value }) => [id, value]));
      state.profileCaseErrors = new Map(rowCases.filter(({ error }) => error).map(({ id, error }) => [id, error]));
      if (groundTruthError || !groundTruthCase) {
        if (!groundTruthError) showProfileWarning(new Error("the selected case is absent from the checksum-verified ground-truth package"));
        setGroundTruthComparisonHealth(false);
        setProfileStatus("Profile comparison is unavailable because the selected ground-truth case could not be verified.");
        syncProfileActionAvailability();
        return;
      }
      element("leaderboard-profile-warning").hidden = true;
      setGroundTruthComparisonHealth(true, groundTruthContext.caseSetId);
      state.profileReadyVersion = version;
      setProfileStatus("");
      dataset.diagnostic_panels.forEach((_, index) => renderProfileChart(index));
      syncProfileActionAvailability();
    } catch (error) {
      if (version !== state.profileLoadVersion) return;
      state.groundTruthCase = null;
      state.profileCases = new Map();
      state.profileCaseErrors = new Map();
      invalidateProfileFigures();
      setProfileStatus(`Profile data could not be loaded: ${error.message}`);
      showProfileWarning(error);
      setGroundTruthComparisonHealth(false);
      console.error(error);
    }
  }

  function renderProfileChart(index) {
    const figureKey = `profile-${index}`;
    invalidateProfileFigure(figureKey);
    const panel = activeDataset()?.diagnostic_panels?.[index];
    const canvas = element(`profile-${index}-chart`);
    if (state.profileReadyVersion !== state.profileLoadVersion || !panel || !canvas || typeof Chart === "undefined") return;
    const selection = panelSelection(panel);
    const quantity = (panel.quantities || []).find((candidate) => candidate.id === selection.quantity);
    const station = (panel.stations || []).find((candidate) => candidate.id === selection.station);
    if (!quantity || !station) return;

    const datasets = [];
    const omittedProfiles = [];
    const groundTruthSeries = profileSeries(state.groundTruthCase, panel, station.id, quantity);
    if (groundTruthSeries) {
      datasets.push({
        label: "Ground truth",
        seriesRole: "public_ground_truth",
        submissionId: null,
        sourceProvenance: state.groundTruthCase?._fluidsbenchProvenance || {},
        lineStyle: "solid",
        data: groundTruthSeries.points,
        sourcePointCount: groundTruthSeries.sourcePointCount,
        droppedPointCount: groundTruthSeries.droppedPointCount,
        borderColor: chartTextColor(),
        backgroundColor: chartTextColor(),
        borderWidth: 3,
        pointRadius: 0,
        tension: 0,
      });
    }
    figureRows().forEach((row, rowIndex) => {
      const series = profileSeries(state.profileCases.get(row.id), panel, station.id, quantity);
      if (!series) {
        omittedProfiles.push({
          row,
          reason: state.profileCaseErrors.get(row.id) || "requested panel, station, or quantity is unavailable",
        });
        return;
      }
      datasets.push({
        label: rowLabel(row),
        seriesRole: "submission_prediction",
        submissionId: row.id,
        rank: row.rank,
        validationMetadata: validationMetadata(row),
        sourceProvenance: state.profileCases.get(row.id)?._fluidsbenchProvenance || {},
        lineStyle: rowIndex % 2 ? "dashed" : "solid",
        data: series.points,
        sourcePointCount: series.sourcePointCount,
        droppedPointCount: series.droppedPointCount,
        borderColor: palette[rowIndex % palette.length],
        backgroundColor: palette[rowIndex % palette.length],
        borderWidth: 2,
        borderDash: rowIndex % 2 ? [6, 3] : [],
        pointRadius: 0,
        tension: 0,
      });
    });

    const submissionCurveCount = datasets.length - (groundTruthSeries ? 1 : 0);
    const profileOmissionText = omittedProfiles.length
      ? ` Omitted selected result${omittedProfiles.length === 1 ? "" : "s"}: ${omittedProfiles
          .map(({ row, reason }) => `${row.id} (${reason})`)
          .join("; ")}.`
      : "";
    const status = element(`profile-${index}-status`);
    if (status) {
      status.hidden = datasets.length > 0;
      status.textContent = datasets.length ? "" : `No curves are available for ${state.profileCase || "the selected geometry"} at this station.`;
    }
    canvas.hidden = datasets.length === 0;
    canvas.setAttribute("aria-label", `${panel.title}: ${quantity.label} at ${station.label} for ${state.profileCase}`);
    setChartSummary(
      `profile-${index}-chart-summary`,
      `${panel.title} for ${state.dataset}, ${state.split}, geometry ${state.profileCase}. Showing ${quantity.label} at ${station.label}. ${
        groundTruthSeries ? "Ground truth is included." : "Ground truth is unavailable."
      } ${submissionCurveCount} submission curves are displayed.${profileOmissionText}`
    );

    if (!datasets.length) {
      syncProfileActionAvailability();
      return;
    }
    const plottedValues = datasets.flatMap((dataset, seriesIndex) =>
      dataset.data.map((point, pointIndex) => ({
        series: dataset.label,
        series_role: dataset.seriesRole,
        submission_id: dataset.submissionId,
        rank: dataset.rank ?? null,
        series_order: seriesIndex,
        line_style: dataset.lineStyle,
        point_index: pointIndex,
        source_point_index: point.sourcePointIndex,
        source_point_count: dataset.sourcePointCount,
        dropped_point_count: dataset.droppedPointCount,
        x: point.x,
        y: point.y,
        source_index_url: dataset.sourceProvenance?.index_url || null,
        source_index_sha256: dataset.sourceProvenance?.index_sha256 || null,
        source_chunk_url: dataset.sourceProvenance?.chunk_url || null,
        source_chunk_declared_sha256: dataset.sourceProvenance?.chunk_declared_sha256 || null,
        source_chunk_downloaded_sha256: dataset.sourceProvenance?.chunk_downloaded_sha256 || null,
        ...(dataset.validationMetadata || validationMetadata(null)),
      }))
    );
    const droppedPointCount = datasets.reduce((total, dataset) => total + dataset.droppedPointCount, 0);
    const caption = `${state.dataset}, ${state.split}, public evaluation geometry ${state.profileCase}: ${quantity.label} at ${
      station.label
    }, showing ${
      groundTruthSeries ? "public ground truth and " : ""
    }${submissionCurveCount} explicitly selected ${resultDataOriginLabel()} model curve${
      submissionCurveCount === 1 ? "" : "s"
    }. Lines preserve native source order and join finite source coordinate/value pairs without smoothing, interpolation, resampling, or sorting; ${
      droppedPointCount || "no"
    } invalid or unpaired source point${droppedPointCount === 1 ? " was" : "s were"} omitted.${profileOmissionText} ${releaseStamp()}.`;
    setFigureCaption(figureKey, caption);
    const domain = datasets.map((dataset) => dataset.label);
    const range = datasets.map((dataset) => dataset.borderColor);
    state.figureSpecs.set(figureKey, {
      ...figureSpecBase(`${state.dataset}: ${panel.title}`, plottedValues),
      mark: { type: "line", interpolate: "linear", point: false, tooltip: true },
      encoding: {
        x: { field: "x", type: "quantitative", title: station.x_label },
        y: {
          field: "y",
          type: "quantitative",
          title: quantity.y_label,
          scale: { reverse: Boolean(panel.reverse_y), zero: false },
        },
        color: {
          field: "series",
          type: "nominal",
          scale: { domain, range },
          legend: { title: "Series", labelLimit: 260 },
        },
        strokeDash: {
          field: "line_style",
          type: "nominal",
          scale: {
            domain: ["solid", "dashed"],
            range: [
              [1, 0],
              [6, 3],
            ],
          },
          legend: null,
        },
        detail: [{ field: "series" }],
        order: { field: "source_point_index", type: "quantitative" },
        strokeWidth: {
          condition: { test: "datum.series_role === 'public_ground_truth'", value: 3 },
          value: 2,
        },
        tooltip: [
          { field: "series", type: "nominal", title: "Series" },
          { field: "submission_id", type: "nominal", title: "Submission ID" },
          { field: "x", type: "quantitative", title: station.x_label },
          { field: "y", type: "quantitative", title: quantity.y_label },
        ],
      },
    });
    renderNumericTable(
      `${figureKey}-data-table`,
      `Finite source coordinate/value pairs used in the displayed figure, in native source order; omitted-point counts are explicit and no smoothing, interpolation, resampling, or sorting is applied.`,
      [
        { label: "Series", value: "series" },
        { label: "Role", value: "series_role" },
        { label: "Line style", value: "line_style" },
        { label: "Submission ID", value: "submission_id" },
        { label: "Plotted point", value: "point_index" },
        { label: "Source point", value: "source_point_index" },
        { label: "Source points", value: "source_point_count" },
        { label: "Dropped points", value: "dropped_point_count" },
        { label: station.x_label, value: "x" },
        { label: quantity.y_label, value: "y" },
      ],
      plottedValues
    );

    state.charts[`profile-${index}`] = new Chart(canvas, {
      type: "line",
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        parsing: false,
        interaction: { mode: "nearest", intersect: false },
        scales: {
          x: {
            type: "linear",
            title: { display: true, text: station.x_label, color: chartTextColor() },
            ticks: { color: chartTextColor() },
            grid: { color: chartGridColor() },
          },
          y: {
            reverse: Boolean(panel.reverse_y),
            title: { display: true, text: quantity.y_label, color: chartTextColor() },
            ticks: { color: chartTextColor() },
            grid: { color: chartGridColor() },
          },
        },
        plugins: {
          legend: { labels: { color: chartTextColor(), usePointStyle: true } },
          tooltip: { callbacks: { title: () => station.label } },
        },
      },
    });
    syncProfileActionAvailability();
  }

  function profileDataExport(index) {
    const figureKey = `profile-${index}`;
    if (!profileFigureReady(figureKey)) throw new Error("No current plotted profile data are available");
    const panel = activeDataset()?.diagnostic_panels?.[index];
    const selection = panel ? panelSelection(panel) : null;
    const quantity = (panel?.quantities || []).find((candidate) => candidate.id === selection?.quantity);
    const station = (panel?.stations || []).find((candidate) => candidate.id === selection?.station);
    const spec = state.figureSpecs.get(figureKey);
    const points = Array.isArray(spec?.data?.values) ? spec.data.values : [];
    if (!panel || !quantity || !station || !points.length) throw new Error("No plotted profile data are available");
    const license = releaseLicenseMetadata();
    return {
      schema_version: "fluidsbench-profile-plot-export-v2",
      exported_at: new Date().toISOString(),
      provenance: {
        export_scope: "exact_displayed_profile_figure",
        row_count: points.length,
        release_id: dataRelease().id || null,
        release_status: dataRelease().status || null,
        reproducibility_contract_version: dataRelease().reproducibility_contract_version || null,
        publication_scope: publicationScope(),
        leaderboard_manifest: leaderboardManifestProvenance(),
        feed_sha256: dataRelease().feed_sha256 || null,
        loaded_feed_sha256: state.loadedFeedSha256,
        feed_verified: state.feedVerified,
        archive_url: releaseArchiveUrl() || null,
        profile_ground_truth: {
          ...dataRelease().profile_ground_truth,
          loaded_manifest_sha256: state.groundTruthManifestProvenance?.sha256 || null,
          loaded_release_id: state.groundTruthManifestProvenance?.release_id || null,
        },
        view_url: currentViewUrl(false, false),
        license: {
          spdx_id: license.spdxId || null,
          name: license.name || null,
          url: license.url || null,
          scope: license.scope,
          fallback_notice: license.spdxId ? null : license.label,
        },
      },
      figure: {
        dataset: state.dataset,
        split: state.split,
        split_id: activeSplitDefinition()?.id || null,
        public_evaluation_case_id: state.profileCase,
        panel_id: panel.id,
        panel_title: panel.title,
        station_id: station.id,
        station_label: station.label,
        quantity_id: quantity.id,
        quantity_label: quantity.label,
        x_label: station.x_label,
        y_label: quantity.y_label,
        requested_model_ids: figureRows().map((row) => row.id),
        plotted_model_ids: Array.from(new Set(points.map((point) => point.submission_id).filter(Boolean))),
        processing:
          "Finite submitted/reference coordinate-value pairs in native source order; no smoothing, interpolation, resampling, or sorting; dropped and source point counts are recorded per row",
        caption: state.figureCaptions.get(`profile-${index}`),
      },
      points,
    };
  }

  function profileDataFilename(index, extension) {
    const panel = activeDataset()?.diagnostic_panels?.[index];
    const selection = panel ? panelSelection(panel) : {};
    return figureFilename(
      `profile-data-${panel?.id || index}-${state.profileCase}-${selection.station || "station"}-${selection.quantity || "quantity"}`,
      extension
    );
  }

  function exportProfileData(index, format) {
    const status = element("leaderboard-release-action-status");
    try {
      const payload = profileDataExport(index);
      if (format === "json") {
        downloadText(profileDataFilename(index, "json"), `${JSON.stringify(payload, null, 2)}\n`, "application/json;charset=utf-8");
        return;
      }
      const metadata = payload.provenance;
      const figure = payload.figure;
      const columns = [
        "export_scope",
        "export_row_count",
        "release_id",
        "release_status",
        "release_reproducibility_contract",
        "publication_scope_json",
        "feed_sha256",
        "loaded_feed_sha256",
        "feed_verified",
        "archive_url",
        "profile_ground_truth_json",
        "view_url",
        "release_license_spdx",
        "release_license_name",
        "release_license_url",
        "release_license_scope",
        "dataset",
        "split",
        "split_id",
        "public_evaluation_case_id",
        "panel_id",
        "station_id",
        "quantity_id",
        "processing",
        "series",
        "series_role",
        "line_style",
        "submission_id",
        "rank",
        "series_order",
        "point_index",
        "source_point_index",
        "source_point_count",
        "dropped_point_count",
        "source_index_url",
        "source_index_sha256",
        "source_chunk_url",
        "source_chunk_declared_sha256",
        "source_chunk_downloaded_sha256",
        "maintainer_validation_status",
        "validation_scope",
        "model_execution",
        "metric_recomputation",
        "validated_case_set_id",
        "submitted_profile_ground_truth_release_id",
        "submitted_profile_ground_truth_manifest_sha256",
        "validated_profile_ground_truth_release_id",
        "validated_profile_ground_truth_manifest_sha256",
        "maintainer_validation_evidence_sha256",
        "x",
        "y",
      ];
      const lines = [columns.map(csvCell).join(",")];
      payload.points.forEach((point) => {
        const values = [
          metadata.export_scope,
          metadata.row_count,
          metadata.release_id,
          metadata.release_status,
          metadata.reproducibility_contract_version,
          metadata.publication_scope,
          metadata.feed_sha256,
          metadata.loaded_feed_sha256,
          metadata.feed_verified,
          metadata.archive_url,
          metadata.profile_ground_truth,
          metadata.view_url,
          metadata.license.spdx_id,
          metadata.license.name,
          metadata.license.url,
          metadata.license.scope,
          figure.dataset,
          figure.split,
          figure.split_id,
          figure.public_evaluation_case_id,
          figure.panel_id,
          figure.station_id,
          figure.quantity_id,
          figure.processing,
          point.series,
          point.series_role,
          point.line_style,
          point.submission_id,
          point.rank,
          point.series_order,
          point.point_index,
          point.source_point_index,
          point.source_point_count,
          point.dropped_point_count,
          point.source_index_url,
          point.source_index_sha256,
          point.source_chunk_url,
          point.source_chunk_declared_sha256,
          point.source_chunk_downloaded_sha256,
          point.maintainer_validation_status,
          point.validation_scope,
          point.model_execution,
          point.metric_recomputation,
          point.validated_case_set_id,
          point.submitted_profile_ground_truth_release_id,
          point.submitted_profile_ground_truth_manifest_sha256,
          point.validated_profile_ground_truth_release_id,
          point.validated_profile_ground_truth_manifest_sha256,
          point.maintainer_validation_evidence_sha256,
          point.x,
          point.y,
        ];
        lines.push(values.map(csvCell).join(","));
      });
      downloadText(profileDataFilename(index, "csv"), `${lines.join("\n")}\n`, "text/csv;charset=utf-8");
    } catch (error) {
      if (status) status.textContent = `Could not export plotted data: ${error.message}`;
    }
  }

  function renderMetricDefinitions() {
    const list = element("metric-definitions-list");
    if (window.MathJax?.typesetClear) window.MathJax.typesetClear([list]);
    list.replaceChildren();
    const policy = rankingPolicy();
    const rankMetric = metricDefinition(policy.metric_id);
    element("metric-definitions-intro").textContent = `Metrics shown for ${
      state.dataset
    }. The selected dataset controls the table columns and all chart choices. ${
      plainMetricLabel(rankMetric) || policy.metric_id
    } is displayed and ranked at ${policy.decimal_places} decimal place${policy.decimal_places === 1 ? "" : "s"}.`;
    activeMetricDefinitions().forEach((definition) => {
      const wrapper = document.createElement("div");
      wrapper.className = groupClass(metricColumnGroup(definition));
      const term = document.createElement("dt");
      appendFormattedMetricLabel(term, definition.label);
      if (definition.unit) term.appendChild(document.createTextNode(` (${definition.unit})`));
      const description = document.createElement("dd");
      description.appendChild(document.createTextNode(`${metricDescription(definition)} `));
      const direction = document.createElement("strong");
      direction.textContent = `${definition.direction === "lower" ? "Lower" : "Higher"} is better.`;
      description.appendChild(direction);
      if (definition.equation) {
        const line = document.createElement("div");
        line.className = "leaderboard-metric-equation";
        line.textContent = `\\(${definition.equation}\\)`;
        description.appendChild(line);
      }
      wrapper.append(term, description);
      list.appendChild(wrapper);
    });
    const typeset = () => {
      const result = window.MathJax?.typesetPromise?.([list]);
      result?.catch((error) => console.error("Could not typeset metrics", error));
    };
    if (window.MathJax?.typesetPromise) typeset();
    else element("MathJax-script")?.addEventListener("load", typeset, { once: true });
  }

  function definitionStatus(text) {
    const status = document.createElement("span");
    status.className = "leaderboard-definition-status";
    status.textContent = text;
    return status;
  }

  function splitCountsText(split) {
    const counts = [
      ["Train", split.train_count],
      ["Validation", split.validation_count],
      ["Test", split.test_count],
    ]
      .filter(([, value]) => finiteNumber(value) !== null)
      .map(([label, value]) => `${label}: ${Number(value).toLocaleString()}`);
    return counts.join(" / ");
  }

  function renderSplitDefinitions() {
    const list = element("split-definitions-list");
    list.replaceChildren();
    element("split-definitions-intro").textContent =
      `Splits available for ${state.dataset}. Changing any Split selector updates the table and every chart together.`;
    splitOptions().forEach((split) => {
      const wrapper = document.createElement("div");
      wrapper.className = "metric-group-neutral";
      const term = document.createElement("dt");
      term.appendChild(document.createTextNode(split.label || split.name));
      if (split.name === state.split) term.appendChild(definitionStatus("Selected"));
      const description = document.createElement("dd");
      description.appendChild(document.createTextNode(split.description || "No description supplied."));
      const counts = splitCountsText(split);
      if (counts) {
        const meta = document.createElement("span");
        meta.className = "leaderboard-definition-meta";
        meta.textContent = counts;
        description.appendChild(meta);
      }
      wrapper.append(term, description);
      list.appendChild(wrapper);
    });
  }

  function renderTrainingDefinitions() {
    const list = element("training-definitions-list");
    list.replaceChildren();
    element("training-definitions-intro").textContent =
      `Training values defined by the planned submission format. Each status is based on the loaded ${state.dataset} data and the selected ${state.split} table.`;
    const selectedRegimes = new Set(rowsForActiveSplit().map((row) => row.training_regime));
    const datasetRegimes = new Set((state.rows.get(state.dataset) || []).map((row) => row.training_regime));
    trainingRegimeDefinitions().forEach((definition) => {
      const wrapper = document.createElement("div");
      wrapper.className = "metric-group-neutral";
      const term = document.createElement("dt");
      term.appendChild(document.createTextNode(definition.label));
      const status = selectedRegimes.has(definition.id)
        ? "Shown in selected table"
        : datasetRegimes.has(definition.id)
          ? `Used in another ${state.dataset} split`
          : "Planned submission value";
      term.appendChild(definitionStatus(status));
      const description = document.createElement("dd");
      description.textContent = definition.description;
      wrapper.append(term, description);
      list.appendChild(wrapper);
    });
  }

  function renderDefinitions() {
    renderMetricDefinitions();
    renderSplitDefinitions();
    renderTrainingDefinitions();
  }

  function renderRankingPolicy() {
    const target = element("leaderboard-ranking-policy");
    if (!target) return;
    const policy = rankingPolicy();
    const definition = metricDefinition(policy.metric_id);
    const rows = rowsForActiveSplit();
    const rankedCount = rows[0] ? rowRanking(rows[0])?.ranked_result_count : 0;
    target.textContent = `Ranking policy for data release ${dataRelease().id || "unversioned"}, ${state.dataset} / ${state.split}: ${
      plainMetricLabel(definition) || policy.metric_id
    }, ${policy.direction} is better, compared at ${policy.decimal_places} decimal place${
      policy.decimal_places === 1 ? "" : "s"
    } using decimal-half-up rounding. Competition ranking gives tied values the same position (1, 2, 2, 4). The rank covers ${
      rankedCount || "all"
    } ranked result${rankedCount === 1 ? "" : "s"} in this exact dataset, split, and release; model-type filters and table sorting do not change it.`;
  }

  function detailsMetricGroups(row) {
    const groups = new Map();
    activeMetricDefinitions().forEach((definition) => {
      if (!groups.has(definition.group_label)) groups.set(definition.group_label, []);
      groups.get(definition.group_label).push({ definition, value: row.metricValues[definition.id] });
    });
    return groups;
  }

  function detailsRow(label, value, formatMetricLabel = false) {
    const renderedLabel = formatMetricLabel ? formattedMetricLabelHtml(label) : escapeHtml(label);
    const renderedValue = value === null || value === undefined || value === "" ? "Not supplied" : value;
    return `<div><dt>${renderedLabel}</dt><dd>${escapeHtml(renderedValue)}</dd></div>`;
  }

  function detailsLink(label, value) {
    const url = safeHttpUrl(value);
    return url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>` : "";
  }

  function evaluationEvidenceUrl(row) {
    const indexFile = row.profile_data?.index_file;
    const evidenceFile = row.evaluation?.evidence_file;
    if (!indexFile || !evidenceFile) return "";
    try {
      return safeHttpUrl(new URL(`../${evidenceFile}`, fileUrl(indexFile)).href);
    } catch (_error) {
      return "";
    }
  }

  function maintainerValidation(row) {
    const validation = row?.maintainer_validation || row?.approval?.validation;
    return validation && typeof validation === "object" ? validation : {};
  }

  function validationMetadata(row) {
    const validation = maintainerValidation(row);
    return {
      maintainer_validation_status: validation.status || null,
      maintainer_validation_schema_version: validation.schema_version || null,
      validation_scope: validation.validation_scope || null,
      model_execution: validation.model_execution || null,
      metric_recomputation: validation.metric_recomputation || null,
      validated_case_set_id: validation.case_set_id || null,
      submitted_profile_ground_truth_release_id: row?.profile_data?.profile_ground_truth_release_id || null,
      submitted_profile_ground_truth_manifest_sha256: row?.profile_data?.profile_ground_truth_manifest_sha256 || null,
      validated_profile_ground_truth_release_id: validation.profile_ground_truth_release_id || null,
      validated_profile_ground_truth_manifest_sha256: validation.profile_ground_truth_manifest_sha256 || null,
      validated_scoring_support_release_id: validation.scoring_support_release_id || null,
      validated_scoring_support_manifest_sha256: validation.scoring_support_manifest_sha256 || null,
      validated_discretization_sha256: validation.discretization_sha256 || null,
      validated_case_metrics_sha256: validation.case_metrics_sha256 || null,
      maintainer_validation_evidence_sha256: validation.evidence_sha256 || null,
    };
  }

  function validationEvidenceUrl(row) {
    const evidencePath = maintainerValidation(row).evidence_path;
    if (!evidencePath) return "";
    try {
      return safeHttpUrl(fileUrl(evidencePath));
    } catch (_error) {
      return "";
    }
  }

  function validationEvidenceCheck(row) {
    const url = validationEvidenceUrl(row);
    return url ? state.validationEvidenceChecks.get(url) : null;
  }

  function validationEvidenceVerified(row) {
    const validation = maintainerValidation(row);
    const check = validationEvidenceCheck(row);
    return Boolean(check?.status === "verified" && check.sha256 === validation.evidence_sha256);
  }

  function declaredClaimEligibility(row = null) {
    if (!row) {
      const eligible = dataRelease().status === "official";
      return {
        academic_citation: eligible,
        promotion: eligible,
        reason_code: eligible ? "eligible" : "release_not_official",
        reason: eligible
          ? "This release is declared eligible for citation."
          : "This data release is not declared eligible for academic citation or promotion.",
        source: "data_release",
      };
    }
    const declared = row.claim_eligibility;
    if (!state.feedVerified || !declared || typeof declared !== "object") {
      return {
        academic_citation: false,
        promotion: false,
        reason_code: "claim_eligibility_missing",
        reason: "The hash-verified feed does not contain generated claim eligibility for this result.",
        source: "unavailable",
      };
    }
    return {
      academic_citation: declared.academic_citation === true,
      promotion: declared.promotion === true,
      reason_code: declared.reason_code || (declared.academic_citation && declared.promotion ? "eligible" : "not_eligible"),
      reason: declared.reason || "No declared eligibility reason was supplied.",
      source: verifiedClaimRecord(row) ? "verified_claim_record" : "hash_verified_feed",
    };
  }

  function claimEligibility(row = null) {
    const release = dataRelease();
    const blockers = [];
    const addBlocker = (code, reason, targets = ["academic_citation", "promotion"]) => {
      blockers.push({ code, reason, targets });
    };
    if (release.status !== "official") addBlocker("release_not_official", "This data release is not official.");
    if (release.status === "official" && !expectedManifestSha256) {
      addBlocker(
        "manifest_pin_not_configured",
        "This page does not publish a SHA-256 pin for the leaderboard manifest; use the immutable release snapshot."
      );
    } else if (expectedManifestSha256 && !state.manifestPinVerified) {
      addBlocker("manifest_pin_not_verified", "The loaded leaderboard manifest bytes have not matched the publication-time SHA-256 pin.");
    }
    if (!supportedReproducibilityContract(release.reproducibility_contract_version)) {
      addBlocker(
        "release_contract_mismatch",
        `The release does not use a supported open-reproducibility contract (${Object.values(reproducibilityContractVersions).join(" or ")}).`
      );
    }
    if (!state.feedVerified) addBlocker("feed_not_verified", "The leaderboard feed bytes have not been SHA-256 verified.");
    if (!groundTruthManifestVerified()) {
      addBlocker("ground_truth_manifest_not_verified", "The release's public ground-truth manifest has not been SHA-256 verified.");
    }
    if (!releaseViewUrl()) {
      addBlocker("release_view_unavailable", "This release has no immutable release-view URL for later verification.");
    }
    if (state.releaseMismatch) {
      addBlocker("requested_release_not_loaded", "The release requested by this URL is not the release currently loaded.");
    }

    if (row && !blockers.length) {
      const validation = maintainerValidation(row);
      const profile = row.profile_data || {};
      const evaluation = row.evaluation || {};
      const expectedGroundTruth = release.profile_ground_truth || {};
      const loadedGroundTruth = state.groundTruthManifestProvenance || {};
      const schemaMajor = submissionSchemaMajor(row);
      const expectedContract = expectedReproducibilityContract(row);
      // Code, model, environment, and artifact-documentation fields are optional evidence.
      // Claim eligibility is bound to the contract and validated submitted data, not artifact presence.
      if (rowRanking(row)?.source === "computed_fallback_generated_release_mismatch") {
        addBlocker(
          "generated_ranking_mismatch",
          "The generated release ranking does not match an independent full-split competition-ranking calculation."
        );
      }
      if (!row.claim_eligibility || typeof row.claim_eligibility !== "object") {
        addBlocker("claim_eligibility_missing", "The hash-verified feed row does not contain generated claim eligibility metadata.");
      }
      if (
        row.approval?.status !== "approved" ||
        ![2, 3].includes(schemaMajor) ||
        row.schema_version !== `${schemaMajor}.0` ||
        row.reproducibility?.contract_version !== expectedContract ||
        release.reproducibility_contract_version !== expectedContract
      ) {
        addBlocker("result_not_approved", "The result is not an approved schema-v2 or schema-v3 open-contract submission.");
      }
      if (
        validation.schema_version !== `${schemaMajor}.0` ||
        validation.contract_version !== expectedContract ||
        validation.status !== "validated" ||
        validation.validation_scope !== "submitted_data_only" ||
        validation.model_execution !== "not_performed" ||
        validation.metric_recomputation !== "not_performed"
      ) {
        addBlocker("validation_contract_mismatch", "The maintainer validation metadata does not match the submitted-data-only contract.");
      }
      if (schemaMajor >= 3) {
        const support = scoringSupportSummary(row);
        const datasetSupport = record(activeDataset()?.scoring_support);
        const ownerApproval = record(datasetSupport.owner_approval);
        const ownerApprovalComplete = ["approved_by", "approved_at", "pull_request_url"].every(
          (field) => typeof ownerApproval[field] === "string" && ownerApproval[field].trim()
        );
        if (
          support.status !== "official" ||
          datasetSupport.status !== "official" ||
          !ownerApprovalComplete ||
          !support.release_id ||
          support.release_id !== datasetSupport.release_id ||
          !support.manifest_url ||
          support.manifest_url !== datasetSupport.manifest_url ||
          validation.scoring_support_release_id !== support.release_id ||
          !support.manifest_sha256 ||
          support.manifest_sha256 !== datasetSupport.manifest_sha256 ||
          validation.scoring_support_manifest_sha256 !== support.manifest_sha256 ||
          validation.discretization_sha256 !== bindingSha256(discretizationBinding(row)) ||
          validation.case_metrics_sha256 !== bindingSha256(caseMetricsBinding(row))
        ) {
          addBlocker(
            "spatial_evidence_binding_mismatch",
            "The schema-v3 result is not bound to owner-approved official scoring support, discretization, case metrics, and matching validation hashes."
          );
        }
      }
      if (
        !validation.profile_ground_truth_release_id ||
        validation.profile_ground_truth_release_id !== expectedGroundTruth.release_id ||
        validation.profile_ground_truth_release_id !== loadedGroundTruth.release_id ||
        validation.profile_ground_truth_release_id !== profile.profile_ground_truth_release_id ||
        !validation.profile_ground_truth_manifest_sha256 ||
        validation.profile_ground_truth_manifest_sha256 !== expectedGroundTruth.manifest_sha256 ||
        validation.profile_ground_truth_manifest_sha256 !== loadedGroundTruth.sha256 ||
        validation.profile_ground_truth_manifest_sha256 !== profile.profile_ground_truth_manifest_sha256 ||
        !validation.case_set_id ||
        validation.case_set_id !== profile.case_set_id
      ) {
        addBlocker(
          "ground_truth_binding_mismatch",
          "The result and validation record do not bind to this release's public ground truth and case set."
        );
      }
      if (
        !validation.profile_index_sha256 ||
        validation.profile_index_sha256 !== profile.index_sha256 ||
        !validation.evaluation_evidence_sha256 ||
        validation.evaluation_evidence_sha256 !== evaluation.evidence_sha256 ||
        !validation.evidence_sha256 ||
        validation.evidence_sha256 !== row.approval?.validation?.evidence_sha256
      ) {
        addBlocker("submitted_data_binding_mismatch", "The submitted profile, evaluation, approval, and validation hashes do not agree.");
      }
      if (state.claimsIndexProvenance?.status !== "verified") {
        const reason =
          state.claimsIndexProvenance?.status === "failed"
            ? `The release claim index failed verification: ${state.claimsIndexProvenance.error}`
            : state.claimsIndexProvenance?.status === "loading"
              ? "The release claim index is still being verified."
              : "The release does not provide a checksum-verified claim index.";
        addBlocker("claim_index_not_verified", reason);
      }
      const recordCheck = claimRecordCheck(row);
      if (recordCheck?.status !== "verified") {
        const reason =
          recordCheck?.status === "failed"
            ? `The result claim record failed verification: ${recordCheck.error}`
            : recordCheck?.status === "loading"
              ? "The result claim record is still being verified."
              : recordCheck?.status === "not_listed"
                ? "This result is not listed in the release claim index."
                : "The result claim record has not yet been verified.";
        addBlocker("claim_record_not_verified", reason);
      }
      const validationCheck = validationEvidenceCheck(row);
      if (!validationEvidenceVerified(row)) {
        const reason =
          validationCheck?.status === "failed"
            ? `The maintainer validation record failed verification: ${validationCheck.error}`
            : validationCheck?.status === "loading"
              ? "The maintainer validation record is still being verified."
              : "The maintainer validation record has not yet been checksum-verified.";
        addBlocker("validation_record_not_verified", reason);
      }
    }

    const reasonsFor = (target) => blockers.filter((blocker) => blocker.targets.includes(target));
    const academicBlockers = reasonsFor("academic_citation");
    const promotionBlockers = reasonsFor("promotion");
    const declared = declaredClaimEligibility(row);
    const uniqueBlockers = blockers.filter(
      (blocker, index) => blockers.findIndex((candidate) => candidate.code === blocker.code && candidate.reason === blocker.reason) === index
    );
    return {
      academic_citation: declared.academic_citation && academicBlockers.length === 0,
      promotion: declared.promotion && promotionBlockers.length === 0,
      declared,
      browser_verification: {
        passed: uniqueBlockers.length === 0,
        status: uniqueBlockers.length === 0 ? "verified" : "not_verified",
        reason_codes: uniqueBlockers.map((blocker) => blocker.code),
        reasons: uniqueBlockers.map((blocker) => blocker.reason),
      },
      reason_code: !declared.academic_citation || !declared.promotion ? declared.reason_code : uniqueBlockers[0]?.code || "eligible",
      reason:
        !declared.academic_citation || !declared.promotion
          ? declared.reason
          : uniqueBlockers.map((blocker) => blocker.reason).join(" ") || "Eligible for this exact release, dataset, and split.",
      reasons: uniqueBlockers,
      academic_reasons: academicBlockers,
      promotion_reasons: promotionBlockers,
    };
  }

  async function ensureValidationEvidence(row) {
    const url = validationEvidenceUrl(row);
    const validation = maintainerValidation(row);
    const approvalSha256 = row.approval?.validation?.evidence_sha256;
    if (!url || !validation.evidence_sha256 || !approvalSha256) return;
    const existing = state.validationEvidenceChecks.get(url);
    if (existing && existing.status !== "loading") return;
    if (state.validationEvidencePromises.has(url)) return state.validationEvidencePromises.get(url);
    state.validationEvidenceChecks.set(url, { status: "loading", sha256: null, error: null });
    const promise = (async () => {
      try {
        const loaded = await fetchJsonWithProvenance(url, `${rowLabel(row)} validation record`);
        if (!loaded.sha256 || loaded.sha256 !== validation.evidence_sha256 || loaded.sha256 !== approvalSha256) {
          throw new Error("validation record checksum does not match the hash-verified leaderboard feed");
        }
        const bindings = [
          ["schema_version", validation.schema_version],
          ["submission_id", row.id],
          ["dataset_id", row.dataset_id],
          ["split_id", row.split_id],
          ["status", validation.status],
          ["contract_version", validation.contract_version],
          ["reference_version", validation.reference_version],
          ["case_set_id", validation.case_set_id],
          ["profile_ground_truth_release_id", validation.profile_ground_truth_release_id],
          ["profile_ground_truth_manifest_sha256", validation.profile_ground_truth_manifest_sha256],
          ["validated_by", validation.validated_by],
          ["validated_at", validation.validated_at],
          ["validation_scope", validation.validation_scope],
          ["model_execution", validation.model_execution],
          ["metric_recomputation", validation.metric_recomputation],
          ["reviewed_submission_sha256", validation.reviewed_submission_sha256],
          ["evaluation_evidence_sha256", validation.evaluation_evidence_sha256],
          ["profile_index_sha256", validation.profile_index_sha256],
        ];
        if (submissionSchemaMajor(row) >= 3) {
          bindings.push(
            ["scoring_support_release_id", validation.scoring_support_release_id],
            ["scoring_support_manifest_sha256", validation.scoring_support_manifest_sha256],
            ["discretization_sha256", validation.discretization_sha256],
            ["case_metrics_sha256", validation.case_metrics_sha256]
          );
        }
        const mismatch = bindings.find(([key, expected]) => !expected || loaded.data?.[key] !== expected);
        if (mismatch) throw new Error(`validation record ${mismatch[0]} does not match the hash-verified leaderboard feed`);
        state.validationEvidenceChecks.set(url, { status: "verified", sha256: loaded.sha256, error: null });
      } catch (error) {
        state.validationEvidenceChecks.set(url, { status: "failed", sha256: null, error: error.message });
        console.error(error);
      } finally {
        state.validationEvidencePromises.delete(url);
        refreshCitationEligibilityUi();
      }
    })();
    state.validationEvidencePromises.set(url, promise);
    return promise;
  }

  function refreshCitationEligibilityUi() {
    if (!state.manifest) return;
    renderReleaseMetadata();
    const dialog = element("details-dialog");
    if (!dialog?.open || !state.resultId) return;
    const focused = document.activeElement;
    const focusWasInside = Boolean(focused && dialog.contains?.(focused));
    const focusedHref = focusWasInside && focused.tagName === "A" ? focused.href : "";
    const focusedCopyAction = focusWasInside ? focused.dataset?.copyResultCitation || "" : "";
    const row = rowsForActiveSplit().find((candidate) => candidate.id === state.resultId);
    if (!row) return;
    openDetails(row, false);
    const body = element("details-dialog-body");
    const replacement = focusedCopyAction
      ? body?.querySelector?.(`[data-copy-result-citation="${focusedCopyAction}"]`)
      : focusedHref
        ? Array.from(body?.querySelectorAll?.("a") || []).find((link) => link.href === focusedHref)
        : null;
    replacement?.focus();
  }

  function openDetails(row, syncUrl = true) {
    state.resultId = row.id;
    if (syncUrl) updateUrl();
    renderReleaseMetadata();
    const dialog = element("details-dialog");
    element("details-dialog-title").textContent = row.model;
    element("details-dialog-subtitle").textContent = `${row.dataset} / ${row.split}`;
    const links = [
      detailsLink("Paper", row.paper_url),
      detailsLink("Legacy code link", row.code_url),
      detailsLink("Result permalink", resultUrl(row, Boolean(releaseViewUrl()))),
    ]
      .filter(Boolean)
      .join(" &middot; ");
    const evaluationLinks = [detailsLink("Submitter evaluation record", evaluationEvidenceUrl(row))].filter(Boolean).join(" &middot; ");
    const reproducibilityLinks = [
      detailsLink("Code repository (optional)", row.reproducibility?.code?.repository_url),
      detailsLink("Model artifact (optional)", row.reproducibility?.model_artifact?.url),
      detailsLink("Environment artifact (optional)", row.reproducibility?.environment?.url),
      detailsLink("Artifact documentation (optional)", row.reproducibility?.artifact_documentation_url),
    ]
      .filter(Boolean)
      .join(" &middot; ");
    const reproducibilityArtifacts = reproducibilityArtifactAvailability(row);
    const support = scoringSupportSummary(row);
    const datasetSupport = record(activeDataset()?.scoring_support);
    const supportOwnerApproval = support.release_id && datasetSupport.release_id === support.release_id ? record(datasetSupport.owner_approval) : {};
    const supportLinks = [
      detailsLink("Official scoring-support manifest", support.manifest_url),
      detailsLink("Dataset-owner approval", supportOwnerApproval.pull_request_url),
    ]
      .filter(Boolean)
      .join(" &middot; ");
    const predictionArtifact = primaryPredictionArtifact(row);
    const predictionCheck = predictionArtifactCheck(row);
    const predictionLinks = predictionArtifacts(row)
      .map((artifact, index) =>
        detailsLink(
          predictionArtifacts(row).length === 1 ? "Public prediction repository" : `Public prediction repository ${index + 1}`,
          firstValue(artifact.repository_url, artifact.url)
        )
      )
      .filter(Boolean)
      .join(" &middot; ");
    const trainingSurfaceInput = spatialComponent(row, ["training", "surface", "input"], ["training", "surface_input"], ["training_surface_input"]);
    const trainingSurfaceSupervision = spatialComponent(
      row,
      ["training", "surface", "supervision"],
      ["training", "surface_supervision"],
      ["training_surface_supervision"]
    );
    const trainingVolumeInput = spatialComponent(row, ["training", "volume", "input"], ["training", "volume_input"], ["training_volume_input"]);
    const trainingVolumeSupervision = spatialComponent(
      row,
      ["training", "volume", "supervision"],
      ["training", "volume_supervision"],
      ["training_volume_supervision"]
    );
    const inferenceSurfaceInput = spatialComponent(
      row,
      ["inference", "surface_input"],
      ["inference", "geometry_input", "surface"],
      ["inference_surface_input"]
    );
    const inferenceVolumeInput = spatialComponent(
      row,
      ["inference", "volume_input"],
      ["inference", "geometry_input", "volume"],
      ["inference_volume_input"]
    );
    const inferenceMeshDependency = spatialComponent(
      row,
      ["inference", "geometry_dependency"],
      ["inference", "mesh_dependency"],
      ["inference", "native_mesh_dependency"],
      ["inference_mesh_dependency"]
    );
    const directSurfaceOutput =
      directOutputSummary(row, "surface") ||
      representationSummary(spatialComponent(row, ["inference", "surface_direct_output"], ["surface_direct_output"]));
    const directVolumeOutput =
      directOutputSummary(row, "volume") ||
      representationSummary(spatialComponent(row, ["inference", "volume_direct_output"], ["volume_direct_output"]));
    const scoringMapping = mappingSummary(row);
    const scoringCoverage = scoringCoverageSummary(row);
    const validation = maintainerValidation(row);
    void ensureValidationEvidence(row);
    void ensureClaimRecord(row);
    const validationCheck = validationEvidenceCheck(row);
    const claimCheck = claimRecordCheck(row);
    const eligibility = claimEligibility(row);
    const rankContext = rowRanking(row);
    const approvalLinks = [
      detailsLink("Approval pull request", row.approval?.pull_request_url),
      detailsLink("Validation record", validationEvidenceUrl(row)),
      detailsLink("Claim record", resultClaimRecordUrl(row)),
    ]
      .filter(Boolean)
      .join(" &middot; ");
    const metricSections = Array.from(detailsMetricGroups(row).entries())
      .map(([group, metrics]) => {
        const values = metrics.map(({ definition, value }) => detailsRow(definition.label, formatMetric(value, definition), true)).join("");
        return `<section><h4>${escapeHtml(group)}</h4><dl>${values}</dl></section>`;
      })
      .join("");
    const resultCitationActions = `<div class="leaderboard-result-citation-actions">
          <button class="leaderboard-action-button" type="button" data-copy-result-citation="plain" aria-describedby="result-citation-eligibility" ${
            eligibility.academic_citation ? "" : "disabled"
          }>Copy result citation</button>
          <button class="leaderboard-action-button" type="button" data-copy-result-citation="bibtex" aria-describedby="result-citation-eligibility" ${
            eligibility.academic_citation ? "" : "disabled"
          }>Copy result BibTeX</button>
          <button class="leaderboard-action-button" type="button" data-copy-result-citation="promotion" aria-describedby="result-citation-eligibility" ${
            eligibility.promotion ? "" : "disabled"
          }>Copy leaderboard claim</button>
          <p id="result-citation-eligibility" class="leaderboard-claim-eligibility" role="status">${escapeHtml(
            eligibility.academic_citation && eligibility.promotion
              ? "Copying is enabled for this exact release, dataset, and split."
              : eligibility.declared.academic_citation && eligibility.declared.promotion
                ? `Copying is temporarily unavailable because browser verification has not passed: ${eligibility.reason}`
                : `Declared claim eligibility: ${eligibility.declared.reason}`
          )}</p>
          <p id="result-citation-copy-status" class="leaderboard-copy-status" role="status"></p>
        </div>`;
    element("details-dialog-body").innerHTML = `
      <section><h4>Rank and claim context</h4><dl>
        ${detailsRow("Rank in this release", resultRankText(rankContext))}
        ${detailsRow("Ranked result count", rankContext?.ranked_result_count)}
        ${detailsRow("Tied", rankContext?.tied ? `Yes — ${rankContext.tie_count} results share this rank` : "No")}
        ${detailsRow("Ranking metric", plainMetricLabel(metricDefinition(rankContext?.metric_id)) || rankContext?.metric_id)}
        ${detailsRow("Published ranking value", rankingValueText(rankContext))}
        ${detailsRow("Submitter-provided ranking value", rankContext?.value)}
        ${detailsRow("Ranking direction", `${humanize(rankContext?.direction)} is better`)}
        ${detailsRow(
          "Published ranking precision",
          `${rankContext?.decimal_places} decimal place${rankContext?.decimal_places === 1 ? "" : "s"}; decimal-half-up rounding`
        )}
        ${detailsRow("Tie method", "Competition ranking (1, 2, 2, 4)")}
        ${detailsRow("Exact rank scope", `${state.dataset} / ${state.split} / ${dataRelease().id || "unversioned"}`)}
        ${detailsRow("Claim record SHA-256", claimCheck?.sha256)}
        ${detailsRow("Claim record bytes", humanize(claimCheck?.status || "not_checked"))}
        ${detailsRow("Claim record attempted URL", claimCheck?.url)}
        ${detailsRow("Claim record verification error", claimCheck?.error)}
      </dl><p class="details-note">This rank is fixed to the exact dataset, split, and data release shown above. It is not a claim about the changing current leaderboard.</p></section>
      <section><h4>Submission</h4><dl>
        ${detailsRow("Submission ID", row.id)}
        ${detailsRow("Dataset version", row.dataset_version)}
        ${detailsRow("Split ID", row.split_id)}
        ${detailsRow("Submitted by", row.submitter)}
        ${detailsRow("Institution", row.institution)}
        ${detailsRow("Model types", row.modelTypes.join(", "))}
        ${detailsRow("Parameters", row.parameterCount === null ? null : `${formatNumber(row.parameterCount, 2)} M`)}
        ${detailsRow("Date", row.date)}
      </dl>${links ? `<p>${links}</p>` : ""}${row.note ? `<p>${escapeHtml(row.note)}</p>` : ""}</section>
      <section><h4>Training</h4><dl>
        ${detailsRow("Regime", trainingLabel(row))}
        ${detailsRow("Target-dataset data", targetDataLabel(row.target_data_used))}
        ${detailsRow("External pretraining", row.external_pretraining === true ? "Yes" : row.external_pretraining === false ? "No" : "Not supplied")}
        ${detailsRow("Pretraining data", pretrainingDataLabel(row.pretraining_data))}
        ${detailsRow("Protocol explanation", row.training_regime_explanation)}
      </dl></section>
      <section><h4>Result scoring support</h4><dl>
        ${detailsRow("Scoring-support release", support.release_id)}
        ${detailsRow("Scoring-support status", humanize(support.status))}
        ${detailsRow("Manifest SHA-256", support.manifest_sha256)}
        ${detailsRow("Surface support ID", support.surface_support_id)}
        ${detailsRow("Volume support ID", support.volume_support_id)}
        ${detailsRow("Dataset-owner approved by", supportOwnerApproval.approved_by)}
        ${detailsRow("Dataset-owner approval date", supportOwnerApproval.approved_at)}
      </dl>${supportLinks ? `<p>${supportLinks}</p>` : ""}
      <p class="details-note">${
        support.release_id
          ? "These benchmark-owned locations, IDs, targets, and weights define where final errors are calculated on the declared evaluation/test split. They do not require the model to train or infer at those same locations."
          : "This historical result has no result-specific scoring-support binding. Do not infer that it used the active dataset's current support release."
      }</p></section>
      <section><h4>Submitter-reported spatial setup</h4><dl>
        ${detailsRow("Training surface input", representationSummary(trainingSurfaceInput))}
        ${detailsRow("Training surface supervision", representationSummary(trainingSurfaceSupervision))}
        ${detailsRow("Training volume input", representationSummary(trainingVolumeInput))}
        ${detailsRow("Training volume supervision", representationSummary(trainingVolumeSupervision))}
        ${detailsRow("Inference surface input", representationSummary(inferenceSurfaceInput))}
        ${detailsRow("Inference volume input", representationSummary(inferenceVolumeInput))}
        ${detailsRow("Inference mesh dependency", representationSummary(inferenceMeshDependency))}
        ${detailsRow("Direct surface output/query support", directSurfaceOutput)}
        ${detailsRow("Direct volume output/query support", directVolumeOutput)}
        ${detailsRow("Discretization report file", bindingFile(discretizationBinding(row)))}
        ${detailsRow("Discretization report SHA-256", bindingSha256(discretizationBinding(row)))}
        ${detailsRow("Per-case discretization file", bindingFile(discretizationCaseBinding(row)))}
        ${detailsRow("Per-case discretization SHA-256", bindingSha256(discretizationCaseBinding(row)))}
      </dl><p class="details-note">The model's direct inference locations are reported by the submitter; package validation does not observe the model's internal queries.</p></section>
      <section><h4>Scoring alignment</h4><dl>
        ${detailsRow("Declared mapping to official support", scoringMapping)}
        ${detailsRow("Declared final coverage (package-checked)", scoringCoverage)}
        ${detailsRow("Per-case metric file", bindingFile(caseMetricsBinding(row)))}
        ${detailsRow("Per-case metric SHA-256", bindingSha256(caseMetricsBinding(row)))}
      </dl><p class="details-note">Only predictions are mapped. The reference evaluator loads the fixed ground truth and weights at the official support before calculating errors.</p></section>
      <section><h4>Optional public predictions</h4><dl>
        ${detailsRow("Prediction data", predictionAvailability(row).label)}
        ${detailsRow("Declared artifact count", predictionArtifacts(row).length)}
        ${detailsRow(
          "Declared artifact kinds",
          predictionArtifacts(row)
            .map((artifact) => humanize(artifact.kind))
            .join(", ")
        )}
        ${detailsRow("Primary artifact kind (used for status)", humanize(predictionArtifact.kind))}
        ${detailsRow("Provider", predictionArtifactProvider(predictionArtifact))}
        ${detailsRow("Pinned revision", predictionArtifact.revision)}
        ${detailsRow("Prediction manifest file", predictionArtifact.manifest_file)}
        ${detailsRow("Prediction manifest SHA-256", predictionArtifact.manifest_sha256)}
        ${detailsRow("Format", predictionArtifact.format)}
        ${detailsRow("Licence", predictionArtifact.license_spdx)}
        ${detailsRow("Artifact check", predictionArtifactStatus(row).label)}
        ${detailsRow("Checked by", predictionCheck.checked_by)}
        ${detailsRow("Checked at", predictionCheck.checked_at)}
        ${detailsRow("Maintainer check record", bindingFile(predictionArtifactChecksBinding(row)))}
        ${detailsRow("Maintainer check record SHA-256", bindingSha256(predictionArtifactChecksBinding(row)))}
        ${detailsRow("Metric recomputation", predictionMetricRecomputation(row).label)}
      </dl>${predictionLinks ? `<p>${predictionLinks}</p>` : ""}
      <p class="details-note">Prediction sharing and these checks are informational. They do not change accuracy rank, academic-citation eligibility, or promotion eligibility.</p></section>
      <section><h4>Submitter-reported evaluation provenance</h4><dl>
        ${detailsRow("Declared reference version", row.evaluation?.reference_version)}
        ${detailsRow("Declared code revision", row.evaluation?.code_revision)}
        ${detailsRow("Declared evaluation command", row.evaluation?.command)}
        ${detailsRow("Evaluation record file", row.evaluation?.evidence_file)}
        ${detailsRow("Evaluation record SHA-256", row.evaluation?.evidence_sha256)}
        ${detailsRow("Profile case set", row.profile_data?.case_set_id)}
        ${detailsRow("Profile case count", row.profile_data?.case_count)}
        ${detailsRow("Profile index SHA-256", row.profile_data?.index_sha256)}
        ${detailsRow("Profile ground-truth release", row.profile_data?.profile_ground_truth_release_id)}
        ${detailsRow("Profile ground-truth manifest SHA-256", row.profile_data?.profile_ground_truth_manifest_sha256)}
      </dl>${evaluationLinks ? `<p>${evaluationLinks}</p>` : ""}</section>
      <section><h4>Reproducibility record</h4><dl>
        ${detailsRow("Contract", row.reproducibility?.contract_version)}
        ${detailsRow("Submission-package access", humanize(row.reproducibility?.access))}
        ${detailsRow("Public evaluation-data use", humanize(row.reproducibility?.public_test_data_use))}
        ${detailsRow("Result-data licence", row.reproducibility?.result_data_license_spdx)}
        ${detailsRow("Code artifact availability", optionalArtifactAvailabilityLabel(reproducibilityArtifacts.code))}
        ${detailsRow("Code repository", row.reproducibility?.code?.repository_url)}
        ${detailsRow("Code commit", row.reproducibility?.code?.commit)}
        ${detailsRow("Code licence", row.reproducibility?.code?.license_spdx)}
        ${detailsRow("Model artifact availability", optionalArtifactAvailabilityLabel(reproducibilityArtifacts.model))}
        ${detailsRow("Model artifact", row.reproducibility?.model_artifact?.url)}
        ${detailsRow("Model SHA-256", row.reproducibility?.model_artifact?.sha256)}
        ${detailsRow("Model licence", row.reproducibility?.model_artifact?.license_spdx)}
        ${detailsRow("Environment artifact availability", optionalArtifactAvailabilityLabel(reproducibilityArtifacts.environment))}
        ${detailsRow("Environment kind", humanize(row.reproducibility?.environment?.kind))}
        ${detailsRow("Environment", row.reproducibility?.environment?.url)}
        ${detailsRow("Environment SHA-256", row.reproducibility?.environment?.sha256)}
        ${detailsRow("Artifact documentation availability", optionalArtifactAvailabilityLabel(reproducibilityArtifacts.documentation))}
        ${detailsRow("Artifact documentation", row.reproducibility?.artifact_documentation_url)}
      </dl>${reproducibilityLinks ? `<p>${reproducibilityLinks}</p>` : ""}
      <p class="details-note">Code, model, environment, and artifact-documentation links are optional. When supplied, this record reports their submitter-provided identifiers and metadata. Their absence does not affect accuracy rank, academic-citation eligibility, or promotion eligibility.</p></section>
      <section><h4>Result status and submitted-data validation</h4><dl>
        ${detailsRow("Status", humanize(row.approval?.status))}
        ${detailsRow(
          "Academic citation eligibility",
          eligibility.declared.academic_citation
            ? "Declared eligible for this exact release context"
            : `Declared not eligible — ${eligibility.declared.reason}`
        )}
        ${detailsRow(
          "Promotion eligibility",
          eligibility.declared.promotion
            ? "Declared eligible for this exact release context"
            : `Declared not eligible — ${eligibility.declared.reason}`
        )}
        ${detailsRow(
          "Browser verification",
          eligibility.browser_verification.passed
            ? "Passed"
            : `Not passed — ${eligibility.browser_verification.reasons.join(" ") || "verification has not completed"}`
        )}
        ${detailsRow("Approved by", row.approval?.approved_by)}
        ${detailsRow("Approval date", row.approval?.approved_at)}
        ${detailsRow("Approval note", row.approval?.note)}
        ${detailsRow("Package validation", humanize(validation.status))}
        ${detailsRow("Validation schema version", validation.schema_version)}
        ${detailsRow("Validation scope", humanize(validation.validation_scope))}
        ${detailsRow("Model execution by FluidsBench", humanize(validation.model_execution))}
        ${detailsRow("Base-metric recomputation by FluidsBench", humanize(validation.metric_recomputation))}
        ${detailsRow("Validated profile case set", validation.case_set_id)}
        ${detailsRow("Validated profile ground-truth release", validation.profile_ground_truth_release_id)}
        ${detailsRow("Validated profile ground-truth manifest SHA-256", validation.profile_ground_truth_manifest_sha256)}
        ${detailsRow("Validated scoring-support release", validation.scoring_support_release_id)}
        ${detailsRow("Validated scoring-support manifest SHA-256", validation.scoring_support_manifest_sha256)}
        ${detailsRow("Validated discretization SHA-256", validation.discretization_sha256)}
        ${detailsRow("Validated case-metrics SHA-256", validation.case_metrics_sha256)}
        ${detailsRow("Validation record SHA-256", validation.evidence_sha256)}
        ${detailsRow("Validation record bytes", humanize(validationCheck?.status || "not_checked"))}
      </dl>${approvalLinks ? `<p>${approvalLinks}</p>` : ""}${resultCitationActions}</section>
      ${metricSections}`;
    if (dialog.open) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function showHelp(button) {
    window.clearTimeout(helpHideTimer);
    const popover = element("column-help-popover");
    if (activeHelpButton && activeHelpButton !== button) activeHelpButton.setAttribute("aria-expanded", "false");
    activeHelpButton = button;
    button.setAttribute("aria-expanded", "true");
    const definitionLink = button.dataset.definitionHref
      ? ` <a href="${escapeHtml(button.dataset.definitionHref)}">${escapeHtml(button.dataset.definitionLabel)}</a>`
      : "";
    popover.innerHTML = `<strong>${formattedMetricLabelHtml(button.dataset.helpTitle)}</strong><p>${escapeHtml(
      button.dataset.helpText
    )}${definitionLink}</p>`;
    popover.hidden = false;
    const rect = button.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 24);
    popover.style.width = `${width}px`;
    popover.style.left = `${Math.max(12, Math.min(window.innerWidth - width - 12, rect.left + rect.width / 2 - width / 2))}px`;
    popover.style.top = `${Math.min(window.innerHeight - popover.offsetHeight - 12, rect.bottom + 8)}px`;
  }

  function hideHelp() {
    element("column-help-popover").hidden = true;
    activeHelpButton?.setAttribute("aria-expanded", "false");
    activeHelpButton = null;
  }

  function scheduleHelpHide() {
    window.clearTimeout(helpHideTimer);
    helpHideTimer = window.setTimeout(hideHelp, 160);
  }

  function applyRestoredState(restored) {
    if (!restored) return;
    const split = splitOptions().find((candidate) => {
      return candidate.id === restored.split || candidate.name === restored.split || slug(candidate.name) === restored.split;
    });
    if (split) state.split = split.name;

    const modelTypes = new Set((state.rows.get(state.dataset) || []).flatMap((row) => row.modelTypes));
    if (modelTypes.has(restored.modelType)) state.modelType = restored.modelType;

    const sortKeys = new Set(
      allColumns()
        .map((column) => column.sortKey)
        .filter(Boolean)
    );
    if (sortKeys.has(restored.sortKey)) state.sortKey = restored.sortKey;
    if (["asc", "desc"].includes(restored.sortDirection)) state.sortDirection = restored.sortDirection;

    if (restored.hasVisibleGroups) {
      const availableGroups = new Set(activeMetricDefinitions().map(metricColumnGroup));
      availableGroups.add("model-details");
      state.visibleGroups = new Set(restored.visibleGroups.filter((group) => availableGroups.has(group)));
    }

    const metricIds = new Set(activeMetricDefinitions().map((definition) => definition.id));
    if (metricIds.has(restored.comparisonMetric)) state.comparisonMetric = restored.comparisonMetric;

    const availableRowIds = new Set(rowsForActiveSplit().map((row) => row.id));
    if (restored.hasComparedModelIds) {
      const availableRequestedIds = restored.comparedModelIds.filter((id) => availableRowIds.has(id));
      state.comparedModelIds = new Set(availableRequestedIds.slice(0, maxFigureModels));
      state.staleComparedModelIds = new Set([
        ...restored.comparedModelIds.filter((id) => !availableRowIds.has(id)),
        ...availableRequestedIds.slice(maxFigureModels),
      ]);
    } else {
      setDefaultComparedModels();
    }

    const scatterIds = new Set(scatterDefinitions().map((definition) => definition.id));
    if (scatterIds.has(restored.scatterX)) state.scatterX = restored.scatterX;
    if (scatterIds.has(restored.scatterY)) state.scatterY = restored.scatterY;
    state.profileCase = restored.profileCase;

    state.requestedResultId = restored.resultId;
    const resultExists = rowsForActiveSplit().some((row) => row.id === restored.resultId);
    state.resultUnavailable = Boolean(restored.resultId && !state.releaseMismatch && !resultExists);
    state.resultId = restored.resultId && !state.releaseMismatch && resultExists ? restored.resultId : "";

    (activeDataset()?.diagnostic_panels || []).forEach((panel) => {
      const quantity = restored.params.get(`quantity_${panel.id}`);
      const station = restored.params.get(`station_${panel.id}`);
      const selection = panelSelection(panel);
      if ((panel.quantities || []).some((candidate) => candidate.id === quantity)) selection.quantity = quantity;
      if ((panel.stations || []).some((candidate) => candidate.id === station)) selection.station = station;
    });
  }

  function renderAll() {
    renderReleaseMetadata();
    renderColumnToggles();
    renderTable();
    renderRankingPolicy();
    renderTypeFilter();
    renderComparisonModelPicker();
    renderComparisonControls();
    renderScatterControls();
    renderDiagnosticPanels();
    renderDefinitions();
    renderComparisonChart();
    renderScatterChart();
    void refreshProfileContext();
  }

  function showError(error, message = "Could not load leaderboard data") {
    const box = element("leaderboard-error");
    box.hidden = false;
    box.textContent = `${message}: ${error.message}`;
  }

  function setLoading(datasetName = "") {
    const status = element("leaderboard-load-status");
    const isLoading = Boolean(datasetName);
    status.hidden = !isLoading;
    status.textContent = isLoading ? `Loading ${datasetName}...` : "";
    document.querySelector(".leaderboard-page")?.setAttribute("aria-busy", String(isLoading));
    datasetSelects().forEach((select) => {
      select.disabled = isLoading;
    });
  }

  function showProfileWarning(error) {
    const box = element("leaderboard-profile-warning");
    box.hidden = false;
    box.textContent = `Leaderboard results loaded, but reference profile curves are unavailable: ${error.message}`;
  }

  async function setDataset(datasetName, restored = null, syncUrl = true) {
    const dataset = datasetEntries().find((candidate) => candidate.name === datasetName);
    if (!dataset) return;
    const detailsDialog = element("details-dialog");
    if (detailsDialog?.open) {
      state.resultId = "";
      detailsDialog.close();
    }
    const version = ++state.loadVersion;
    const previousDataset = state.dataset;
    syncDatasetSelects();
    syncSplitSelects();
    element("leaderboard-error").hidden = true;
    element("leaderboard-profile-warning").hidden = true;
    setLoading(dataset.name);
    try {
      await ensureRows(dataset);
      if (version !== state.loadVersion) return;
      state.dataset = dataset.name;
      state.split = dataset.splits?.[0]?.name || "";
      state.modelType = "";
      state.sortKey = "rank";
      state.sortDirection = "asc";
      state.comparisonMetric = dataset.ranking?.metric_id || "";
      state.scatterX = "";
      state.scatterY = dataset.ranking?.metric_id || "";
      state.comparedModelIds = new Set();
      state.staleComparedModelIds = new Set();
      state.profileCaseIds = [];
      state.profileCase = "";
      state.groundTruthCase = null;
      state.profileCases = new Map();
      state.profileCaseErrors = new Map();
      state.resultId = "";
      state.resultUnavailable = false;
      if (!restored) {
        state.requestedReleaseId = "";
        state.requestedResultId = "";
        state.releaseMismatch = false;
      }
      initializeVisibleGroups();
      if (restored) applyRestoredState(restored);
      else setDefaultComparedModels();
      syncDatasetSelects();
      syncSplitSelects();
      element("leaderboard-error").hidden = true;
      renderAll();
      if (state.resultId) {
        const targetRow = rowsForActiveSplit().find((row) => row.id === state.resultId);
        if (targetRow) openDetails(targetRow, false);
      }
      if (syncUrl) updateUrl();
    } catch (error) {
      if (version === state.loadVersion) {
        syncDatasetSelects();
        syncSplitSelects();
        const message = previousDataset ? `Could not load ${dataset.name}; ${previousDataset} remains selected` : `Could not load ${dataset.name}`;
        showError(error, message);
      }
      console.error(error);
    } finally {
      if (version === state.loadVersion) setLoading();
    }
  }

  function setSplit(splitName) {
    if (!splitOptions().some((split) => split.name === splitName)) return;
    const detailsDialog = element("details-dialog");
    if (detailsDialog?.open) {
      state.resultId = "";
      detailsDialog.close();
    }
    state.split = splitName;
    syncSplitSelects();
    state.sortKey = "rank";
    state.sortDirection = "asc";
    state.resultId = "";
    state.requestedResultId = "";
    state.resultUnavailable = false;
    state.staleComparedModelIds = new Set();
    setDefaultComparedModels();
    state.profileCaseIds = [];
    state.profileCase = "";
    state.groundTruthCase = null;
    state.profileCases = new Map();
    state.profileCaseErrors = new Map();
    renderAll();
    updateUrl();
  }

  function configureEvents() {
    element("open-submission-repo")?.addEventListener("click", (event) => {
      if (event.currentTarget.disabled || !activeDataset()) return;
      const sourceRef = String(window.FluidsBenchSubmissionSourceRef || "main");
      window.open(
        `https://github.com/neilashton/fluidsbench-submission/tree/${encodeURIComponent(sourceRef)}/submissions/${activeDataset().slug}`,
        "_blank",
        "noopener,noreferrer"
      );
    });
    document.addEventListener("change", (event) => {
      if (event.target.matches("[data-leaderboard-dataset-select]")) setDataset(event.target.value);
      else if (event.target.matches("[data-leaderboard-split-select]")) setSplit(event.target.value);
      else if (event.target.matches("[data-profile-case-select]")) {
        state.profileCase = event.target.value;
        syncProfileCaseSelects();
        void refreshProfileContext();
        updateUrl();
      } else if (event.target.matches("[data-comparison-model]")) {
        if (event.target.checked && state.comparedModelIds.size >= maxFigureModels) {
          event.target.checked = false;
          element("comparison-model-count").textContent = `Choose at most ${maxFigureModels} models for readable, color-consistent figures.`;
          return;
        }
        if (event.target.checked) state.comparedModelIds.add(event.target.value);
        else state.comparedModelIds.delete(event.target.value);
        state.staleComparedModelIds.delete(event.target.value);
        updateFigureSelection();
      }
    });
    element("type-filter")?.addEventListener("change", (event) => {
      state.modelType = event.target.value;
      renderTable();
      updateFigureSelection();
    });
    element("comparison-metric")?.addEventListener("change", (event) => {
      state.comparisonMetric = event.target.value;
      renderComparisonChart();
      updateUrl();
    });
    element("scatter-x-axis")?.addEventListener("change", (event) => {
      state.scatterX = event.target.value;
      renderScatterChart();
      updateUrl();
    });
    element("scatter-y-axis")?.addEventListener("change", (event) => {
      state.scatterY = event.target.value;
      renderScatterChart();
      updateUrl();
    });
    element("export-leaderboard-csv")?.addEventListener("click", exportCsv);
    element("export-leaderboard-json")?.addEventListener("click", exportJson);
    element("leaderboard-export-scope")?.addEventListener("change", (event) => {
      state.exportScope = event.target.value === "full" ? "full" : "current";
    });
    element("select-all-comparison-models")?.addEventListener("click", () => {
      state.comparedModelIds = new Set(
        rowsForCurrentModelType()
          .slice(0, maxFigureModels)
          .map((row) => row.id)
      );
      state.staleComparedModelIds = new Set();
      updateFigureSelection();
    });
    element("clear-comparison-models")?.addEventListener("click", () => {
      state.comparedModelIds = new Set();
      state.staleComparedModelIds = new Set();
      updateFigureSelection();
    });
    element("open-citation-dialog")?.addEventListener("click", openCitationDialog);
    element("copy-citation-text")?.addEventListener("click", () => void copyCitation("plain"));
    element("copy-citation-bibtex")?.addEventListener("click", () => void copyCitation("bibtex"));
    element("close-details-dialog")?.addEventListener("click", () => element("details-dialog").close());
    element("details-dialog")?.addEventListener("click", (event) => {
      if (event.target === event.currentTarget) event.currentTarget.close();
    });
    element("details-dialog")?.addEventListener("close", () => {
      if (!state.resultId) return;
      state.resultId = "";
      updateUrl();
      renderReleaseMetadata();
    });
    element("close-citation-dialog")?.addEventListener("click", () => element("citation-dialog").close());
    element("citation-dialog")?.addEventListener("click", (event) => {
      if (event.target === event.currentTarget) event.currentTarget.close();
    });
    document.addEventListener("click", (event) => {
      const resultCitationButton = event.target.closest("[data-copy-result-citation]");
      if (resultCitationButton) {
        void copyResultCitation(resultCitationButton.dataset.copyResultCitation);
        return;
      }
      const figureButton = event.target.closest("[data-figure-key][data-figure-format]");
      if (figureButton) {
        void exportFigure(figureButton.dataset.figureKey, figureButton.dataset.figureFormat);
        return;
      }
      const captionButton = event.target.closest("[data-copy-caption]");
      if (captionButton) {
        void copyFigureCaption(captionButton.dataset.copyCaption);
        return;
      }
      const profileDataButton = event.target.closest("[data-profile-data-index][data-profile-data-format]");
      if (profileDataButton) {
        exportProfileData(Number(profileDataButton.dataset.profileDataIndex), profileDataButton.dataset.profileDataFormat);
      }
    });
    document.addEventListener("mouseover", (event) => {
      const button = event.target.closest(".leaderboard-column-help");
      if (button) showHelp(button);
    });
    document.addEventListener("focusin", (event) => {
      const button = event.target.closest(".leaderboard-column-help");
      if (button) showHelp(button);
    });
    document.addEventListener("mouseout", (event) => {
      if (event.target.closest(".leaderboard-column-help")) scheduleHelpHide();
    });
    document.addEventListener("focusout", (event) => {
      if (event.target.closest(".leaderboard-column-help")) scheduleHelpHide();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !element("column-help-popover").hidden) {
        const button = activeHelpButton;
        hideHelp();
        button?.focus();
      }
    });
    window.addEventListener("resize", hideHelp);
    window.addEventListener("popstate", () => {
      const restored = readUrlState();
      state.requestedReleaseId = restored.releaseId;
      state.releaseMismatch = Boolean(restored.releaseId && restored.releaseId !== dataRelease().id);
      const dataset = datasetEntries().find((candidate) => slug(candidate.name) === restored.dataset) || datasetEntries()[0];
      if (dataset) void setDataset(dataset.name, restored, false);
    });
    const helpPopover = element("column-help-popover");
    helpPopover?.addEventListener("mouseenter", () => window.clearTimeout(helpHideTimer));
    helpPopover?.addEventListener("mouseleave", scheduleHelpHide);
    helpPopover?.addEventListener("focusin", () => window.clearTimeout(helpHideTimer));
    helpPopover?.addEventListener("focusout", scheduleHelpHide);
    helpPopover?.addEventListener("click", (event) => {
      if (event.target.closest("a")) hideHelp();
    });
  }

  async function initialize() {
    configureEvents();
    try {
      const loadedManifest = await fetchJsonWithProvenance(manifestUrl, "leaderboard manifest");
      const manifestCheck = verifyManifestSha256(loadedManifest.sha256);
      state.loadedManifestSha256 = loadedManifest.sha256;
      state.manifestPinVerified = manifestCheck.verified;
      state.manifest = loadedManifest.data;
      if (!Array.isArray(state.manifest.metric_definitions) || !Array.isArray(state.manifest.training_regimes) || !datasetEntries().length) {
        throw new Error("manifest is missing dataset-driven leaderboard definitions");
      }
      state.metrics = new Map(state.manifest.metric_definitions.map((definition) => [definition.id, definition]));
      const restored = readUrlState();
      state.requestedReleaseId = restored.releaseId;
      state.releaseMismatch = Boolean(restored.releaseId && restored.releaseId !== dataRelease().id);
      const initial = datasetEntries().find((dataset) => slug(dataset.name) === restored.dataset) || datasetEntries()[0];
      await setDataset(initial.name, restored, false);
    } catch (error) {
      showError(error);
      console.error(error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
})();

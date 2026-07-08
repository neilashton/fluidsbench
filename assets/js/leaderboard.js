(function () {
  const weights = {
    surfacePressure: 0.15,
    surfaceTau: 0.1,
    volumeVelocity: 0.15,
    volumePressure: 0.1,
    r2Cd: 0.15,
    r2Cl: 0.1,
    velocityProfileR2: 0.15,
    cpCutR2: 0.1,
  };

  const errorCaps = {
    surfacePressure: 15,
    surfaceTau: 20,
    volumeVelocity: 12,
    volumePressure: 15,
  };

  const relL1Ratios = {
    surfacePressure: 0.72,
    surfaceTau: 0.68,
    volumeVelocity: 0.7,
    volumePressure: 0.69,
  };

  const defaultSplit = "Default";

  const leaderboardBaseUrl =
    window.FluidsBenchLeaderboardBaseUrl || new URL("/", window.location.origin).href;
  const leaderboardManifestUrl =
    window.FluidsBenchLeaderboardManifestUrl ||
    new URL("/leaderboard/manifest.json", window.location.origin).href;
  const approvedSubmissionsSourceLabel =
    window.FluidsBenchApprovedSubmissionsSourceLabel || "leaderboard manifest";

  const lowerIsBetterMetrics = new Set([
    "surfacePressure",
    "surfacePressureL1",
    "surfaceTau",
    "surfaceTauL1",
    "volumeVelocity",
    "volumeVelocityL1",
    "volumePressure",
    "volumePressureL1",
    "params",
  ]);

  const errorMetricCaps = {
    surfacePressure: errorCaps.surfacePressure,
    surfacePressureL1: errorCaps.surfacePressure * relL1Ratios.surfacePressure,
    surfaceTau: errorCaps.surfaceTau,
    surfaceTauL1: errorCaps.surfaceTau * relL1Ratios.surfaceTau,
    volumeVelocity: errorCaps.volumeVelocity,
    volumeVelocityL1: errorCaps.volumeVelocity * relL1Ratios.volumeVelocity,
    volumePressure: errorCaps.volumePressure,
    volumePressureL1: errorCaps.volumePressure * relL1Ratios.volumePressure,
  };

  const scoreComponentWeights = {
    fieldScore: 0.5,
    forceScore: 0.25,
    diagnosticScore: 0.25,
  };

  const metricDefinitions = {
    surfacePressure: { label: "Surface pressure L2", digits: 2, unit: "%", scoreKind: "error", cap: errorMetricCaps.surfacePressure },
    surfacePressureL1: { label: "Surface pressure L1", digits: 2, unit: "%", scoreKind: "error", cap: errorMetricCaps.surfacePressureL1 },
    surfaceTau: { label: "Surface tau wall L2", digits: 2, unit: "%", scoreKind: "error", cap: errorMetricCaps.surfaceTau },
    surfaceTauL1: { label: "Surface tau wall L1", digits: 2, unit: "%", scoreKind: "error", cap: errorMetricCaps.surfaceTauL1 },
    volumeVelocity: { label: "Volume velocity L2", digits: 2, unit: "%", scoreKind: "error", cap: errorMetricCaps.volumeVelocity },
    volumeVelocityL1: { label: "Volume velocity L1", digits: 2, unit: "%", scoreKind: "error", cap: errorMetricCaps.volumeVelocityL1 },
    volumePressure: { label: "Volume pressure L2", digits: 2, unit: "%", scoreKind: "error", cap: errorMetricCaps.volumePressure },
    volumePressureL1: { label: "Volume pressure L1", digits: 2, unit: "%", scoreKind: "error", cap: errorMetricCaps.volumePressureL1 },
    r2Cd: { label: "Cd R2", digits: 3, scoreKind: "r2" },
    r2Cl: { label: "Cl R2", digits: 3, scoreKind: "r2" },
    forceR2: { label: "Force R2 mean", digits: 3, scoreKind: "r2" },
    velocityProfileR2: { label: "Velocity profiles R2", digits: 3, scoreKind: "r2" },
    cpCutR2: { label: "Cp cuts R2", digits: 3, scoreKind: "r2" },
    fieldScore: { label: "Field score", digits: 1, scoreKind: "score" },
    forceScore: { label: "Force score", digits: 1, scoreKind: "score" },
    diagnosticScore: { label: "Diagnostic score", digits: 1, scoreKind: "score" },
    score: { label: "Overall score", digits: 1, scoreKind: "score" },
  };

  const comparisonMetricGroups = {
    summary: ["score", "fieldScore", "forceScore", "diagnosticScore"],
    l2: ["surfacePressure", "surfaceTau", "volumeVelocity", "volumePressure"],
    l1: ["surfacePressureL1", "surfaceTauL1", "volumeVelocityL1", "volumePressureL1"],
    r2: ["r2Cd", "r2Cl", "forceR2", "velocityProfileR2", "cpCutR2"],
  };

  const allChartDatasetsValue = "__all_datasets__";
  const allChartSplitsValue = "__all_splits__";

  const predefinedSplitOptions = [
    { value: defaultSplit, label: "Default", datasets: ["AhmedML", "DrivAerML", "DrivAerNet++", "WindsorML"] },
    { value: "Full", label: "Full", datasets: ["HiLiftAeroML", "AirfRANS"] },
    { value: "Scarce", label: "Scarce", datasets: ["AirfRANS"] },
    { value: "Reynolds extrapolation", label: "Reynolds extrapolation", datasets: ["AirfRANS"] },
    { value: "AoA extrapolation", label: "AoA extrapolation", datasets: ["AirfRANS"] },
    { value: "AoA 4", label: "AoA 4", datasets: ["HiLiftAeroML"] },
    { value: "AoA 12", label: "AoA 12", datasets: ["HiLiftAeroML"] },
    { value: "AoA 22", label: "AoA 22", datasets: ["HiLiftAeroML"] },
  ];

  const comparisonColors = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
  const datasetColors = ["#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#64748b", "#1e40af"];

  const scatterAxisDefinitions = [
    { key: "rank", label: "Rank", digits: 0 },
    { key: "surfacePressure", label: "Surface pressure L2 (%)", digits: 2 },
    { key: "surfacePressureL1", label: "Surface pressure L1 (%)", digits: 2 },
    { key: "surfaceTau", label: "Surface tau wall L2 (%)", digits: 2 },
    { key: "surfaceTauL1", label: "Surface tau wall L1 (%)", digits: 2 },
    { key: "volumeVelocity", label: "Volume velocity L2 (%)", digits: 2 },
    { key: "volumeVelocityL1", label: "Volume velocity L1 (%)", digits: 2 },
    { key: "volumePressure", label: "Volume pressure L2 (%)", digits: 2 },
    { key: "volumePressureL1", label: "Volume pressure L1 (%)", digits: 2 },
    { key: "r2Cd", label: "Cd R2", digits: 3 },
    { key: "r2Cl", label: "Cl R2", digits: 3 },
    { key: "velocityProfileR2", label: "Velocity profiles R2", digits: 3 },
    { key: "cpCutR2", label: "Cp cuts R2", digits: 3 },
    { key: "params", label: "Params (M)", digits: 2 },
    { key: "date", label: "Submission date", kind: "date" },
    { key: "fieldScore", label: "Field score (50%)", digits: 1 },
    { key: "forceScore", label: "Force score (25%)", digits: 1 },
    { key: "diagnosticScore", label: "Diagnostic score (25%)", digits: 1 },
    { key: "score", label: "Overall score", digits: 1 },
  ];

  let submissions = [];
  let leaderboardManifest = null;
  let approvedDatasetRows = new Map();
  let datasetLoadPromises = new Map();
  let dataRefreshToken = 0;
  let approvedSubmissionStatusMessage = `Loading approved submissions from ${approvedSubmissionsSourceLabel}...`;

  const datasetProfiles = {
    AhmedML: {
      cpTitle: "Centreline surface Cp",
      cpDescription: "Submitted Cp diagnostic cuts for the selected AhmedML rows.",
      cpXTitle: "x/L along Ahmed body centreline",
      velocityTitle: "Velocity profiles",
      velocityDescription: "Submitted wake velocity diagnostic profiles for the selected AhmedML rows.",
      velocityXTitle: "Diagnostic coordinate",
    },
    DrivAerML: {
      cpTitle: "DrivAer centreline Cp",
      cpDescription: "Submitted Cp diagnostic cuts for the selected DrivAerML rows.",
      cpXTitle: "x/L along DrivAer centreline",
      velocityTitle: "DrivAer wake velocity profiles",
      velocityDescription: "Submitted wake velocity diagnostic profiles for the selected DrivAerML rows.",
      velocityXTitle: "Diagnostic coordinate",
    },
    "DrivAerNet++": {
      cpTitle: "DrivAerNet++ surface pressure cut",
      cpDescription: "Submitted Cp diagnostic cuts for the selected DrivAerNet++ rows.",
      cpXTitle: "x/L along DrivAerNet++ centreline",
      velocityTitle: "DrivAerNet++ wake velocity profiles",
      velocityDescription: "Submitted wake velocity diagnostic profiles for the selected DrivAerNet++ rows.",
      velocityXTitle: "Diagnostic coordinate",
    },
    WindsorML: {
      cpTitle: "Windsor body centreline Cp",
      cpDescription: "Submitted Cp diagnostic cuts for the selected WindsorML rows.",
      cpXTitle: "x/L along Windsor body centreline",
      velocityTitle: "Windsor wake velocity profiles",
      velocityDescription: "Submitted wake velocity diagnostic profiles for the selected WindsorML rows.",
      velocityXTitle: "Diagnostic coordinate",
    },
    HiLiftAeroML: {
      cpTitle: "CRM-HL wing section Cp",
      cpDescription: "Submitted Cp diagnostic cuts for the selected HiLiftAeroML rows.",
      cpXTitle: "x/c along CRM-HL section",
      velocityTitle: "HiLiftAeroML near-wall velocity profiles",
      velocityDescription: "Submitted near-wall velocity diagnostic profiles for the selected HiLiftAeroML rows.",
      velocityXTitle: "Diagnostic coordinate",
    },
    AirfRANS: {
      cpTitle: "AirfRANS airfoil surface Cp",
      cpDescription: "Submitted Cp diagnostic cuts for the selected AirfRANS rows.",
      cpXTitle: "x/c along airfoil chord",
      velocityTitle: "AirfRANS boundary-layer velocity profiles",
      velocityDescription: "Submitted boundary-layer velocity diagnostic profiles for the selected AirfRANS rows.",
      velocityXTitle: "Diagnostic coordinate",
    },
  };

  let sortState = { key: "score", direction: "desc" };
  let primaryRankingKey = "score";
  let comparisonChart = null;
  let comparisonChartRowsCache = [];
  let scatterChart = null;
  let scatterChartRowsCache = [];
  let cpChart = null;
  let velocityChart = null;
  let activeStation = "0.25L";
  const chartSelections = {
    cp: { dataset: "AhmedML", split: defaultSplit },
    velocity: { dataset: "AhmedML", split: defaultSplit },
  };
  const chartScopeSelections = {
    comparison: { dataset: allChartDatasetsValue, split: allChartSplitsValue },
    scatter: { dataset: allChartDatasetsValue, split: allChartSplitsValue },
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function errorScore(value, cap) {
    return clamp(100 * (1 - value / cap), 0, 100);
  }

  function r2Score(value) {
    return clamp(value, 0, 1) * 100;
  }

  function metricScore(row, key) {
    const metric = metricDefinitions[key];
    const value = Number(row[key]);
    if (!metric || !Number.isFinite(value)) return null;

    if (metric.scoreKind === "error") return errorScore(value, metric.cap);
    if (metric.scoreKind === "r2") return r2Score(value);
    if (metric.scoreKind === "score") return clamp(value, 0, 100);
    return null;
  }

  function formatMetricValue(row, key) {
    const metric = metricDefinitions[key];
    const value = Number(row[key]);
    if (!metric || !Number.isFinite(value)) return "N/A";

    const formatted = formatNumber(value, metric.digits);
    return metric.unit ? `${formatted}${metric.unit}` : formatted;
  }

  function comparisonValueDigits(metric) {
    if (!metric) return 1;
    if (metric.scoreKind === "r2") return 2;
    return 1;
  }

  function formatComparisonValue(row, key) {
    const metric = metricDefinitions[key];
    const value = Number(row[key]);
    if (!metric || !Number.isFinite(value)) return "N/A";

    if (metric.scoreKind === "score") return `${formatNumber(value, 1)} pts`;
    if (metric.scoreKind === "r2") return formatNumber(value, comparisonValueDigits(metric));
    if (metric.unit) return `${formatNumber(value, comparisonValueDigits(metric))}${metric.unit}`;
    return formatNumber(value, comparisonValueDigits(metric));
  }

  function fieldComponentScore(row) {
    return (
      weights.surfacePressure * errorScore(row.surfacePressure, errorCaps.surfacePressure) +
      weights.surfaceTau * errorScore(row.surfaceTau, errorCaps.surfaceTau) +
      weights.volumeVelocity * errorScore(row.volumeVelocity, errorCaps.volumeVelocity) +
      weights.volumePressure * errorScore(row.volumePressure, errorCaps.volumePressure)
    ) / scoreComponentWeights.fieldScore;
  }

  function forceComponentScore(row) {
    return (
      weights.r2Cd * r2Score(row.r2Cd) +
      weights.r2Cl * r2Score(row.r2Cl)
    ) / scoreComponentWeights.forceScore;
  }

  function diagnosticComponentScore(row) {
    return (
      weights.velocityProfileR2 * r2Score(row.velocityProfileR2) +
      weights.cpCutR2 * r2Score(row.cpCutR2)
    ) / scoreComponentWeights.diagnosticScore;
  }

  function weightedScore(row) {
    return (
      scoreComponentWeights.fieldScore * fieldComponentScore(row) +
      scoreComponentWeights.forceScore * forceComponentScore(row) +
      scoreComponentWeights.diagnosticScore * diagnosticComponentScore(row)
    );
  }

  function forceR2(row) {
    return (row.r2Cd + row.r2Cl) / 2;
  }

  function estimatedRelL1(row, key) {
    return row[key] * relL1Ratios[key];
  }

  function defaultSortDirection(key) {
    if (
      key === "rank" ||
      key === "model" ||
      key === "submittedBy" ||
      key === "type" ||
      key === "dataset" ||
      key === "split" ||
      lowerIsBetterMetrics.has(key)
    ) {
      return "asc";
    }
    return "desc";
  }

  function compareRows(a, b, key, direction) {
    const multiplier = direction === "asc" ? 1 : -1;
    if (typeof a[key] === "string") {
      return a[key].localeCompare(b[key]) * multiplier;
    }
    return (a[key] - b[key]) * multiplier;
  }

  function enrichedRows() {
    return submissions.map((row) => ({
      ...row,
      submittedBy: displaySubmitter(row, "Reference baseline"),
      split: rowSplit(row),
      surfacePressureL1: row.surfacePressureL1 ?? estimatedRelL1(row, "surfacePressure"),
      surfaceTauL1: row.surfaceTauL1 ?? estimatedRelL1(row, "surfaceTau"),
      volumeVelocityL1: row.volumeVelocityL1 ?? estimatedRelL1(row, "volumeVelocity"),
      volumePressureL1: row.volumePressureL1 ?? estimatedRelL1(row, "volumePressure"),
      forceR2: forceR2(row),
      fieldScore: fieldComponentScore(row),
      forceScore: forceComponentScore(row),
      diagnosticScore: diagnosticComponentScore(row),
      score: weightedScore(row),
    }));
  }

  function rowMatchesFilters(row, filters) {
    const datasetMatch = filters.datasets.all || filters.datasets.values.has(row.dataset);
    const typeMatch = filters.types.all || filters.types.values.has(row.type);
    const splitMatch = filters.splits.all || filters.splits.values.has(row.split);
    return datasetMatch && typeMatch && splitMatch;
  }

  function rankedRows() {
    const filters = currentFilters();
    return enrichedRows()
      .filter((row) => rowMatchesFilters(row, filters))
      .sort((a, b) => compareRows(a, b, primaryRankingKey, defaultSortDirection(primaryRankingKey)))
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }

  function formatNumber(value, digits) {
    return Number(value).toFixed(digits);
  }

  function parseNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function uniqueInOrder(values) {
    const seen = new Set();
    return values.filter((value) => {
      if (!value || seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }

  function slug(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function safeExternalUrl(value) {
    const rawValue = String(value || "").trim();
    if (!rawValue) return "";

    try {
      const url = new URL(rawValue, window.location.href);
      return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
    } catch {
      return "";
    }
  }

  function displayDate(entry) {
    if (entry.submission_date) return entry.submission_date;
    if (entry.submitted_at) return String(entry.submitted_at).slice(0, 10);
    return "";
  }

  function displaySubmitter(entry, fallback = "") {
    return (
      entry.submittedBy ||
      entry.submitterName ||
      entry.submitter_name ||
      entry.submitter ||
      entry.institution ||
      fallback
    );
  }

  function normalizeSplit(value, dataset) {
    const rawValue = String(value || "").trim();
    if (!rawValue) return defaultSplit;

    const lowerValue = rawValue.toLowerCase();
    if (lowerValue === "default") return defaultSplit;
    if (lowerValue === "full") return "Full";

    const aoaMatch = rawValue.match(/(?:aoa\s*)?(\d+)/i);
    if (dataset === "HiLiftAeroML" && aoaMatch) return `AoA ${aoaMatch[1]}`;

    return rawValue;
  }

  function rowSplit(row) {
    if (row.split) return normalizeSplit(row.split, row.dataset);
    if (row.dataset !== "HiLiftAeroML") return defaultSplit;
    const id = row.id || "";
    const model = row.model || "";
    if (id.includes("full")) return "Full";

    const aoaMatch = id.match(/aoa(\d+)/i) || model.match(/AoA\s*(\d+)/i);
    return aoaMatch ? `AoA ${aoaMatch[1]}` : defaultSplit;
  }

  function normalizeDiagnosticSeries(series, idKeys) {
    if (!series || !Array.isArray(series.values)) return null;

    const id = idKeys.map((key) => series[key]).find(Boolean) || "diagnostic_series";
    return {
      id,
      caseId: series.case_id || "",
      coordinateFrame: series.coordinate_frame || "",
      quantity: series.quantity || "",
      values: series.values.filter((value) => value && typeof value === "object"),
    };
  }

  function normalizeDiagnostics(diagnostics) {
    if (!diagnostics || typeof diagnostics !== "object") {
      return { cpCuts: [], velocityProfiles: [] };
    }

    return {
      cpCuts: (Array.isArray(diagnostics.cp_cuts) ? diagnostics.cp_cuts : [])
        .map((series) => normalizeDiagnosticSeries(series, ["cut_id", "case_id"]))
        .filter(Boolean),
      velocityProfiles: (Array.isArray(diagnostics.velocity_profiles) ? diagnostics.velocity_profiles : [])
        .map((series) => normalizeDiagnosticSeries(series, ["station_id", "case_id"]))
        .filter(Boolean),
    };
  }

  function diagnosticSummary(row, key, emptyText) {
    const entries = row?.diagnostics?.[key] || [];
    if (!entries.length) return emptyText;
    return entries.map((entry) => entry.id).join(", ");
  }

  function firstNumericField(point, keys) {
    for (const key of keys.filter(Boolean)) {
      const value = parseNumber(point[key]);
      if (value !== null) return value;
    }
    return null;
  }

  function diagnosticPointSeries(series, xKeys, yKeys) {
    if (!series || !Array.isArray(series.values)) return null;

    const quantityKeys = [series.quantity, ...yKeys].filter(Boolean);
    const data = series.values
      .map((point) => {
        const x = firstNumericField(point, xKeys);
        const y = firstNumericField(point, quantityKeys);
        return x === null || y === null ? null : { x, y };
      })
      .filter(Boolean)
      .sort((a, b) => a.x - b.x);

    return data.length ? data : null;
  }

  function stationToken(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  }

  function diagnosticVelocitySeries(row, station) {
    const profiles = row?.diagnostics?.velocityProfiles || [];
    if (!profiles.length) return null;

    const activeToken = stationToken(activeStation);
    const matchedProfile =
      profiles.find((profile) => stationToken(profile.id).includes(activeToken)) ||
      profiles.find((profile) => stationToken(activeStation).includes(stationToken(profile.id))) ||
      profiles[0];

    return diagnosticPointSeries(matchedProfile, ["z", "y", "x", "s", "distance"], ["u_over_u_inf", "u", "velocity", "value"]);
  }

  function diagnosticCpSeries(row) {
    const cut = row?.diagnostics?.cpCuts?.[0];
    return diagnosticPointSeries(cut, ["x", "s", "arc_length"], ["cp", "pressure_coefficient", "value"]);
  }

  function knownDatasetNames() {
    return uniqueInOrder([
      ...Object.keys(datasetProfiles),
      ...leaderboardDatasetNames(),
      ...submissions.map((row) => row.dataset),
    ]);
  }

  function knownSplitOptions() {
    const optionsByValue = new Map();

    const addOption = (value, label, datasets = []) => {
      if (!value) return;
      const normalizedValue = normalizeSplit(value);
      if (!optionsByValue.has(normalizedValue)) {
        optionsByValue.set(normalizedValue, {
          value: normalizedValue,
          label: label || normalizedValue,
          datasets: new Set(),
        });
      }

      const option = optionsByValue.get(normalizedValue);
      datasets.filter(Boolean).forEach((dataset) => option.datasets.add(dataset));
    };

    predefinedSplitOptions.forEach((option) => {
      addOption(option.value, option.label, option.datasets);
    });
    submissions.forEach((row) => {
      addOption(rowSplit(row), rowSplit(row), [row.dataset]);
    });

    const splitOrder = new Map(predefinedSplitOptions.map((option, index) => [option.value, index]));
    return Array.from(optionsByValue.values())
      .map((option) => ({ ...option, datasets: Array.from(option.datasets) }))
      .sort((a, b) => {
        const aOrder = splitOrder.has(a.value) ? splitOrder.get(a.value) : 999;
        const bOrder = splitOrder.has(b.value) ? splitOrder.get(b.value) : 999;
        return aOrder - bOrder || a.label.localeCompare(b.label);
      });
  }

  function chartScopeRows(scope) {
    const selection = chartScopeSelections[scope];
    const rows = enrichedRows().filter((row) => {
      const datasetMatch = !selection || selection.dataset === allChartDatasetsValue || row.dataset === selection.dataset;
      const splitMatch = !selection || selection.split === allChartSplitsValue || row.split === selection.split;
      return datasetMatch && splitMatch;
    });

    return rows
      .sort((a, b) => compareRows(a, b, primaryRankingKey, defaultSortDirection(primaryRankingKey)))
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }

  function chartProfile(chartType) {
    return datasetProfiles[chartSelections[chartType]?.dataset] || datasetProfiles.AhmedML;
  }

  function normalizeApprovedSubmission(entry) {
    const metrics = {
      surfacePressure: parseNumber(entry.surface_pressure_l2),
      surfacePressureL1: parseNumber(entry.surface_pressure_l1),
      surfaceTau: parseNumber(entry.surface_tau_l2),
      surfaceTauL1: parseNumber(entry.surface_tau_l1),
      volumeVelocity: parseNumber(entry.volume_velocity_l2),
      volumeVelocityL1: parseNumber(entry.volume_velocity_l1),
      volumePressure: parseNumber(entry.volume_pressure_l2),
      volumePressureL1: parseNumber(entry.volume_pressure_l1),
      r2Cd: parseNumber(entry.r2_cd),
      r2Cl: parseNumber(entry.r2_cl),
      velocityProfileR2: parseNumber(entry.velocity_profile_r2),
      cpCutR2: parseNumber(entry.cp_cut_r2),
    };
    if (Object.values(metrics).some((value) => value === null)) return null;

    const model = entry.model || "Unnamed model";
    const dataset = entry.dataset || "AhmedML";
    const id = `approved-${entry.submission_id || slug(`${dataset}-${rowSplit(entry)}-${model}`)}`;
    return {
      id,
      model,
      type: entry.model_type || "Other",
      dataset,
      split: normalizeSplit(entry.split ?? entry.dataset_split ?? entry.benchmark_split, dataset),
      ...metrics,
      params: parseNumber(entry.parameter_count ?? entry.num_parameters) ?? 0,
      date: displayDate(entry),
      submittedBy: displaySubmitter(entry, "Approved submission"),
      href: `#details-${id}`,
      paperUrl: entry.paper_url || "",
      codeUrl: entry.code_url || "",
      institution: entry.institution || "",
      diagnostics: normalizeDiagnostics(entry.diagnostics),
      note: entry.note || (entry.institution ? `Approved submission from ${entry.institution}.` : "Approved submission."),
    };
  }

  function renderApprovedSubmissionStatus() {
    const status = document.getElementById("leaderboard-source-status");
    if (!status) return;
    status.textContent = approvedSubmissionStatusMessage;
  }

  function normalizedLeaderboardBaseUrl() {
    return leaderboardBaseUrl.endsWith("/") ? leaderboardBaseUrl : `${leaderboardBaseUrl}/`;
  }

  function leaderboardFileUrl(file) {
    return new URL(file, normalizedLeaderboardBaseUrl()).href;
  }

  async function fetchLeaderboardJson(url, label) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}`);
    return response.json();
  }

  function leaderboardDatasetEntries() {
    return Array.isArray(leaderboardManifest?.datasets) ? leaderboardManifest.datasets : [];
  }

  function leaderboardDatasetNames() {
    return leaderboardDatasetEntries().map((entry) => entry.name).filter(Boolean);
  }

  function leaderboardDatasetEntry(datasetName) {
    return leaderboardDatasetEntries().find((entry) => entry.name === datasetName);
  }

  function refreshSubmissionsFromApprovedCache() {
    const approvedRows = Array.from(approvedDatasetRows.values()).flat();
    submissions = [...approvedRows];
  }

  function approvedSubmissionCount() {
    return Array.from(approvedDatasetRows.values()).reduce((total, rows) => total + rows.length, 0);
  }

  function setApprovedLoadedStatus(failedCount = 0) {
    const loadedDatasets = approvedDatasetRows.size;
    const totalDatasets = leaderboardDatasetEntries().length;
    const rows = approvedSubmissionCount();
    const datasetLabel = totalDatasets === 1 ? "dataset feed" : "dataset feeds";
    const failureText = failedCount ? ` ${failedCount} ${failedCount === 1 ? "feed" : "feeds"} failed to load.` : "";

    approvedSubmissionStatusMessage =
      `Loaded ${rows} approved submission${rows === 1 ? "" : "s"} from ` +
      `${loadedDatasets}/${totalDatasets} ${datasetLabel} via ${approvedSubmissionsSourceLabel}.` +
      failureText;
  }

  async function loadLeaderboardManifest() {
    if (leaderboardManifest) return leaderboardManifest;

    const manifest = await fetchLeaderboardJson(leaderboardManifestUrl, approvedSubmissionsSourceLabel);
    if (!manifest || !Array.isArray(manifest.datasets)) {
      throw new Error(`${approvedSubmissionsSourceLabel} must contain a datasets array`);
    }

    leaderboardManifest = manifest;
    approvedSubmissionStatusMessage =
      `Loaded ${leaderboardDatasetEntries().length} dataset feed${leaderboardDatasetEntries().length === 1 ? "" : "s"} ` +
      `from ${approvedSubmissionsSourceLabel}.`;
    return leaderboardManifest;
  }

  async function loadDatasetRows(datasetName) {
    if (approvedDatasetRows.has(datasetName)) return approvedDatasetRows.get(datasetName);
    if (datasetLoadPromises.has(datasetName)) return datasetLoadPromises.get(datasetName);

    const entry = leaderboardDatasetEntry(datasetName);
    if (!entry?.file) return [];

    const datasetUrl = leaderboardFileUrl(entry.file);
    const loadPromise = (async () => {
      const entries = await fetchLeaderboardJson(datasetUrl, entry.file);
      if (!Array.isArray(entries)) throw new Error(`${entry.file} must contain an array`);

      const rows = entries.map(normalizeApprovedSubmission).filter(Boolean);
      approvedDatasetRows.set(datasetName, rows);
      refreshSubmissionsFromApprovedCache();
      return rows;
    })().catch((error) => {
      datasetLoadPromises.delete(datasetName);
      throw error;
    });

    datasetLoadPromises.set(datasetName, loadPromise);
    return loadPromise;
  }

  function datasetsForChartScope(scope) {
    const selection = chartScopeSelections[scope];
    if (!selection || selection.dataset === allChartDatasetsValue) return leaderboardDatasetNames();
    return [selection.dataset];
  }

  function datasetsForCurrentState() {
    const filters = currentFilters();
    const datasets = new Set();

    if (filters.datasets.all) {
      leaderboardDatasetNames().forEach((datasetName) => datasets.add(datasetName));
    } else {
      filters.datasets.values.forEach((datasetName) => datasets.add(datasetName));
    }

    ["cp", "velocity"].forEach((chartType) => {
      if (chartSelections[chartType]?.dataset) datasets.add(chartSelections[chartType].dataset);
    });
    ["comparison", "scatter"].forEach((scope) => {
      datasetsForChartScope(scope).forEach((datasetName) => datasets.add(datasetName));
    });

    return Array.from(datasets).filter((datasetName) => Boolean(leaderboardDatasetEntry(datasetName)));
  }

  async function ensureDatasetRows(datasetNames) {
    const names = Array.from(new Set(datasetNames));
    const missing = names.filter((datasetName) => !approvedDatasetRows.has(datasetName));
    if (!missing.length) {
      refreshSubmissionsFromApprovedCache();
      setApprovedLoadedStatus();
      return;
    }

    approvedSubmissionStatusMessage =
      `Loading ${missing.length} dataset feed${missing.length === 1 ? "" : "s"} from ${approvedSubmissionsSourceLabel}...`;
    renderApprovedSubmissionStatus();

    const results = await Promise.allSettled(missing.map((datasetName) => loadDatasetRows(datasetName)));
    const failedCount = results.filter((result) => result.status === "rejected").length;
    refreshSubmissionsFromApprovedCache();
    setApprovedLoadedStatus(failedCount);
  }

  async function ensureDatasetsForCurrentState() {
    await loadLeaderboardManifest();
    await ensureDatasetRows(datasetsForCurrentState());
  }

  async function loadApprovedSubmissions() {
    try {
      await ensureDatasetsForCurrentState();
    } catch (error) {
      submissions = [];
      approvedSubmissionStatusMessage = `Could not load ${approvedSubmissionsSourceLabel} (${error.message}). No submission rows are available.`;
    }
  }

  async function refreshLeaderboardForCurrentState() {
    const token = ++dataRefreshToken;
    try {
      await ensureDatasetsForCurrentState();
      if (token !== dataRefreshToken) return;
    } catch (error) {
      if (token !== dataRefreshToken) return;
      approvedSubmissionStatusMessage =
        `Could not load ${approvedSubmissionsSourceLabel} (${error.message}). Showing currently cached rows.`;
    }

    renderApprovedSubmissionStatus();
    renderTable();
    refreshAllChartPanels();
  }

  async function refreshChartPanelForSelection(chartType) {
    try {
      await ensureDatasetRows([chartSelections[chartType].dataset]);
    } catch (error) {
      approvedSubmissionStatusMessage =
        `Could not load ${chartSelections[chartType].dataset} from ${approvedSubmissionsSourceLabel} (${error.message}).`;
    }
    renderApprovedSubmissionStatus();
    syncChartPanel(chartType);
  }

  async function refreshScopedMetricChart(scope) {
    try {
      await loadLeaderboardManifest();
      await ensureDatasetRows(datasetsForChartScope(scope));
    } catch (error) {
      approvedSubmissionStatusMessage =
        `Could not load ${approvedSubmissionsSourceLabel} for ${scope} chart (${error.message}). Showing currently cached rows.`;
    }

    renderApprovedSubmissionStatus();
    populateChartScopeDatasetSelect(scope);
    syncChartScopeSplitSelect(scope);
    if (scope === "comparison") updateComparisonChart();
    if (scope === "scatter") updateScatterChart();
  }

  function tableCell(label, value, className) {
    const td = document.createElement("td");
    td.setAttribute("data-label", label);
    if (className) td.className = className;
    if (value instanceof Node) {
      td.appendChild(value);
    } else {
      td.textContent = value;
    }
    return td;
  }

  function chipCell(label, value, cellClassName, chipClassName) {
    const chip = document.createElement("span");
    chip.className = chipClassName;
    chip.textContent = value;
    return tableCell(label, chip, cellClassName);
  }

  function metricCell(label, row, key, className) {
    const metric = metricDefinitions[key];
    const value = Number(row[key]);
    const td = tableCell(label, Number.isFinite(value) ? formatNumber(value, metric?.digits ?? 2) : "N/A", className);
    const score = metricScore(row, key);

    td.classList.add("leaderboard-metric-cell");
    if (score !== null) {
      td.title = `${metric?.label || label}: ${formatMetricValue(row, key)}; normalized score ${formatNumber(score, 1)} / 100`;
    }

    return td;
  }

  function currentFilters() {
    return {
      datasets: checkedFilterValues("dataset-filter"),
      types: checkedFilterValues("type-filter"),
      splits: checkedFilterValues("split-filter"),
    };
  }

  function filteredRows() {
    return rankedRows();
  }

  function sortedRows() {
    const rows = filteredRows();
    return rows.sort((a, b) => compareRows(a, b, sortState.key, sortState.direction));
  }

  function updateSortIndicators() {
    document.querySelectorAll(".leaderboard-table th[data-sort]").forEach((th) => {
      const key = th.getAttribute("data-sort");
      const isActive = key === sortState.key;
      th.classList.toggle("sort-asc", isActive && sortState.direction === "asc");
      th.classList.toggle("sort-desc", isActive && sortState.direction === "desc");
      th.setAttribute("aria-sort", isActive ? (sortState.direction === "asc" ? "ascending" : "descending") : "none");
      th.title = isActive
        ? `Sorted ${sortState.direction === "asc" ? "ascending" : "descending"}; click to reverse`
        : `Sort by ${th.textContent.replace(/\s+/g, " ").trim()}`;
    });
  }

  function renderTable() {
    const tbody = document.getElementById("leaderboard-body");
    if (!tbody) return;
    updateSortIndicators();
    tbody.textContent = "";

    sortedRows().forEach((row) => {
      const tr = document.createElement("tr");

      const rank = document.createElement("span");
      rank.className = "leaderboard-rank";
      rank.textContent = row.rank;
      tr.appendChild(tableCell("Rank", rank));

      tr.appendChild(tableCell("Model", row.model, "leaderboard-model"));
      tr.appendChild(tableCell("Submitted by", row.submittedBy, "leaderboard-submitter"));
      tr.appendChild(chipCell("Type", row.type, "leaderboard-type-cell", "leaderboard-type"));
      tr.appendChild(chipCell("Dataset", row.dataset, "leaderboard-dataset-cell", "leaderboard-dataset"));
      tr.appendChild(chipCell("Split", row.split, "leaderboard-split-cell", "leaderboard-split"));
      tr.appendChild(metricCell("Surface pressure rel L2 (%)", row, "surfacePressure"));
      tr.appendChild(metricCell("Surface pressure rel L1 (%)", row, "surfacePressureL1"));
      tr.appendChild(metricCell("Surface tau wall rel L2 (%)", row, "surfaceTau"));
      tr.appendChild(metricCell("Surface tau wall rel L1 (%)", row, "surfaceTauL1"));
      tr.appendChild(metricCell("Volume velocity rel L2 (%)", row, "volumeVelocity"));
      tr.appendChild(metricCell("Volume velocity rel L1 (%)", row, "volumeVelocityL1"));
      tr.appendChild(metricCell("Volume pressure rel L2 (%)", row, "volumePressure"));
      tr.appendChild(metricCell("Volume pressure rel L1 (%)", row, "volumePressureL1"));
      tr.appendChild(metricCell("Cd R2", row, "r2Cd"));
      tr.appendChild(metricCell("Cl R2", row, "r2Cl"));
      tr.appendChild(metricCell("Velocity profiles R2", row, "velocityProfileR2"));
      tr.appendChild(metricCell("Cp cuts R2", row, "cpCutR2"));
      tr.appendChild(tableCell("Params (M)", formatNumber(row.params, 2)));
      tr.appendChild(tableCell("Submission date", row.date));
      tr.appendChild(metricCell("Field score (50%)", row, "fieldScore", "leaderboard-component-score"));
      tr.appendChild(metricCell("Force score (25%)", row, "forceScore", "leaderboard-component-score"));
      tr.appendChild(metricCell("Diagnostic score (25%)", row, "diagnosticScore", "leaderboard-component-score"));
      tr.appendChild(metricCell("Overall score", row, "score", "leaderboard-score"));

      const details = document.createElement("button");
      details.className = "leaderboard-detail-button";
      details.type = "button";
      details.textContent = "Details";
      details.addEventListener("click", () => openDetailsDialog(row));
      tr.appendChild(tableCell("Details", details));

      tbody.appendChild(tr);
    });
  }

  function configureSort() {
    document.querySelectorAll(".leaderboard-table th[data-sort]").forEach((th) => {
      const sortColumn = () => {
        const key = th.getAttribute("data-sort");
        if (sortState.key === key) {
          sortState.direction = sortState.direction === "asc" ? "desc" : "asc";
        } else {
          sortState = { key, direction: defaultSortDirection(key) };
        }
        renderTable();
        updateComparisonChart();
        updateScatterChart();
      };

      th.tabIndex = 0;
      th.setAttribute("role", "button");
      th.addEventListener("click", sortColumn);
      th.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        sortColumn();
      });
    });
  }

  function configurePrimaryRanking() {
    const select = document.getElementById("score-sort");
    if (!select) return;
    select.addEventListener("change", () => {
      primaryRankingKey = select.value;
      sortState = { key: primaryRankingKey, direction: defaultSortDirection(primaryRankingKey) };
      renderTable();
      refreshAllChartPanels();
    });
  }

  function configureFilters() {
    ["dataset-filter", "type-filter", "split-filter"].forEach(configureFilterGroup);
    syncSplitFilterOptions();
    document.addEventListener("click", (event) => {
      const activeDropdown = event.target instanceof Element ? event.target.closest(".leaderboard-filter-dropdown") : null;
      closeFilterDropdowns(activeDropdown);
    });
  }

  function filterInputs(containerId) {
    return Array.from(document.querySelectorAll(`#${containerId} input[type="checkbox"]`));
  }

  function checkedFilterValues(containerId) {
    const inputs = filterInputs(containerId).filter((input) => !input.disabled);
    const allInput = inputs.find((input) => input.dataset.filterAll !== undefined);
    const selected = inputs.filter((input) => input !== allInput && input.checked).map((input) => input.value);
    return {
      all: !allInput || allInput.checked || selected.length === 0,
      values: new Set(selected),
    };
  }

  function updateFilterGroup(containerId, changedInput) {
    const inputs = filterInputs(containerId);
    const allInput = inputs.find((input) => input.dataset.filterAll !== undefined);
    const optionInputs = inputs.filter((input) => input !== allInput && !input.disabled);
    if (!allInput) return;

    if (!changedInput) {
      allInput.checked = !optionInputs.some((input) => input.checked);
      return;
    }

    if (changedInput === allInput && allInput.checked) {
      optionInputs.forEach((input) => {
        input.checked = false;
      });
      return;
    }

    if (changedInput !== allInput && changedInput?.checked) {
      allInput.checked = false;
    }

    if (!optionInputs.some((input) => input.checked)) {
      allInput.checked = true;
    }
  }

  function syncSplitFilterOptions() {
    const splitContainer = document.getElementById("split-filter");
    if (!splitContainer) return;

    const datasetFilter = checkedFilterValues("dataset-filter");
    splitContainer.querySelectorAll("[data-split-datasets]").forEach((label) => {
      const datasets = (label.dataset.splitDatasets || "").split(/\s+/).filter(Boolean);
      const visible = datasetFilter.all || datasets.some((dataset) => datasetFilter.values.has(dataset));
      const input = label.querySelector('input[type="checkbox"]');

      label.hidden = !visible;
      if (input) {
        input.disabled = !visible;
        if (!visible) input.checked = false;
      }
    });

    updateFilterGroup("split-filter");
    updateFilterSummary("split-filter");
  }

  function filterOptionLabel(input) {
    return input.closest("label")?.textContent.trim() || input.value;
  }

  function updateFilterSummary(containerId) {
    const container = document.getElementById(containerId);
    const summary = container?.querySelector("[data-filter-summary]");
    if (!container || !summary) return;

    const inputs = filterInputs(containerId);
    const allInput = inputs.find((input) => input.dataset.filterAll !== undefined);
    const selected = inputs.filter((input) => input !== allInput && input.checked);

    if (!allInput || allInput.checked || selected.length === 0) {
      summary.textContent = container.dataset.allLabel || "All";
    } else if (selected.length === 1) {
      summary.textContent = filterOptionLabel(selected[0]);
    } else if (selected.length === 2) {
      summary.textContent = selected.map(filterOptionLabel).join(", ");
    } else {
      summary.textContent = `${selected.length} selected`;
    }
  }

  function setFilterDropdownOpen(container, open) {
    const toggle = container.querySelector("[data-filter-toggle]");
    const menu = container.querySelector("[data-filter-menu]");
    if (!toggle || !menu) return;

    container.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
  }

  function closeFilterDropdowns(exceptContainer) {
    document.querySelectorAll(".leaderboard-filter-dropdown.is-open").forEach((container) => {
      if (container !== exceptContainer) {
        setFilterDropdownOpen(container, false);
      }
    });
  }

  function configureDropdownShell(container) {
    if (!container) return;
    if (container.dataset.dropdownConfigured === "true") return;
    container.dataset.dropdownConfigured = "true";

    const toggle = container.querySelector("[data-filter-toggle]");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const shouldOpen = !container.classList.contains("is-open");
        closeFilterDropdowns(container);
        setFilterDropdownOpen(container, shouldOpen);
      });
    }

    container.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setFilterDropdownOpen(container, false);
      }
    });
  }

  function configureFilterGroup(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    configureDropdownShell(container);

    container.addEventListener("change", (event) => {
      if (!(event.target instanceof HTMLInputElement)) return;
      updateFilterGroup(containerId, event.target);
      if (containerId === "dataset-filter") {
        syncSplitFilterOptions();
      }
      updateFilterSummary(containerId);
      void refreshLeaderboardForCurrentState();
    });
    updateFilterSummary(containerId);
  }

  function selectedRadioInput(containerId) {
    return document.querySelector(`#${containerId} input[type="radio"]:checked:not(:disabled)`);
  }

  function selectedRadioValue(containerId, fallback) {
    return selectedRadioInput(containerId)?.value || fallback;
  }

  function updateSingleFilterSummary(containerId) {
    const container = document.getElementById(containerId);
    const summary = container?.querySelector("[data-filter-summary]");
    const selected = selectedRadioInput(containerId);
    if (summary && selected) summary.textContent = filterOptionLabel(selected);
  }

  function syncChartSplitOptions(chartType) {
    const containerId = `${chartType}-split-filter`;
    const splitContainer = document.getElementById(containerId);
    if (!splitContainer) return;

    const dataset = chartSelections[chartType].dataset;
    let firstVisibleInput = null;
    let selectedVisible = false;

    splitContainer.querySelectorAll("[data-split-datasets]").forEach((label) => {
      const datasets = (label.dataset.splitDatasets || "").split(/\s+/).filter(Boolean);
      const visible = datasets.includes(dataset);
      const input = label.querySelector('input[type="radio"]');

      label.hidden = !visible;
      if (input) {
        input.disabled = !visible;
        if (!visible) input.checked = false;
        if (visible && !firstVisibleInput) firstVisibleInput = input;
        if (visible && input.checked) selectedVisible = true;
      }
    });

    if (!selectedVisible && firstVisibleInput) {
      firstVisibleInput.checked = true;
    }

    chartSelections[chartType].split = normalizeSplit(selectedRadioValue(containerId, defaultSplit), dataset);
    updateSingleFilterSummary(containerId);
  }

  function configureChartSingleFilter(containerId, chartType, key) {
    const container = document.getElementById(containerId);
    if (!container) return;

    configureDropdownShell(container);

    const selectedValue = selectedRadioValue(containerId, key === "split" ? defaultSplit : "AhmedML");
    chartSelections[chartType][key] = key === "split" ? normalizeSplit(selectedValue, chartSelections[chartType].dataset) : selectedValue;
    updateSingleFilterSummary(containerId);

    container.addEventListener("change", (event) => {
      if (!(event.target instanceof HTMLInputElement) || event.target.type !== "radio") return;

      if (key === "dataset") {
        chartSelections[chartType].dataset = event.target.value;
        syncChartSplitOptions(chartType);
      } else {
        chartSelections[chartType].split = normalizeSplit(event.target.value, chartSelections[chartType].dataset);
      }

      updateSingleFilterSummary(containerId);
      void refreshChartPanelForSelection(chartType);
      setFilterDropdownOpen(container, false);
    });
  }

  function checkedModels(containerId) {
    return Array.from(document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`)).map((input) => input.value);
  }

  function updateChartModelSummary(filterId, menuId) {
    const container = document.getElementById(filterId);
    const summary = container?.querySelector("[data-chart-model-summary]");
    if (!summary) return;

    const selected = Array.from(document.querySelectorAll(`#${menuId} input[type="checkbox"]:checked`));
    if (selected.length === 0) {
      summary.textContent = "No submissions";
    } else if (selected.length === 1) {
      summary.textContent = filterOptionLabel(selected[0]);
    } else if (selected.length === 2) {
      summary.textContent = selected.map(filterOptionLabel).join(", ");
    } else {
      summary.textContent = `${selected.length} submissions`;
    }
  }

  function configureChartModelFilter(filterId, menuId, chartType) {
    const container = document.getElementById(filterId);
    if (!container) return;

    configureDropdownShell(container);
    container.addEventListener("change", (event) => {
      if (!(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") return;
      updateChartModelSummary(filterId, menuId);
      if (chartType === "cp") updateCpChart();
      if (chartType === "velocity") updateVelocityChart();
    });
  }

  function cpSeries(modelId) {
    const row = submissions.find((entry) => entry.id === modelId);
    return diagnosticCpSeries(row);
  }

  function velocitySeries(modelId) {
    const row = submissions.find((entry) => entry.id === modelId);
    return diagnosticVelocitySeries(row);
  }

  function chartTextColor() {
    return getComputedStyle(document.documentElement).getPropertyValue("--global-text-color").trim() || "#111827";
  }

  function gridColor() {
    return getComputedStyle(document.documentElement).getPropertyValue("--global-divider-color").trim() || "rgba(0,0,0,0.1)";
  }

  function baseChartOptions(yTitle, xTitle) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "nearest", intersect: false },
      plugins: {
        legend: { labels: { color: chartTextColor(), usePointStyle: true } },
        tooltip: { enabled: true },
      },
      scales: {
        x: {
          title: { display: true, text: xTitle, color: chartTextColor() },
          ticks: { color: chartTextColor() },
          grid: { color: gridColor() },
        },
        y: {
          title: { display: true, text: yTitle, color: chartTextColor() },
          ticks: { color: chartTextColor() },
          grid: { color: gridColor() },
        },
      },
    };
  }

  function lineDataset(label, data, color, dashed) {
    return {
      label,
      data,
      borderColor: color,
      backgroundColor: color,
      borderDash: dashed ? [6, 4] : [],
      borderWidth: dashed ? 2 : 2.5,
      pointRadius: dashed ? 0 : 2,
      tension: 0.35,
    };
  }

  function modelColor(modelId, index) {
    const fallbackColors = ["#0072b2", "#009e73", "#d55e00", "#cc79a7", "#f0a202", "#6f42c1"];
    return fallbackColors[index % fallbackColors.length];
  }

  function hexToRgba(hex, alpha) {
    const value = hex.replace("#", "");
    const number = parseInt(value, 16);
    const red = (number >> 16) & 255;
    const green = (number >> 8) & 255;
    const blue = number & 255;
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  function setText(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  }

  function chartScopeDatasetSelect(scope) {
    return document.getElementById(`${scope}-dataset-filter`);
  }

  function chartScopeSplitSelect(scope) {
    return document.getElementById(`${scope}-split-filter`);
  }

  function populateChartScopeDatasetSelect(scope) {
    const select = chartScopeDatasetSelect(scope);
    if (!select) return;

    const currentValue = chartScopeSelections[scope]?.dataset || allChartDatasetsValue;
    select.textContent = "";

    const allOption = document.createElement("option");
    allOption.value = allChartDatasetsValue;
    allOption.textContent = "All datasets";
    select.appendChild(allOption);

    knownDatasetNames().forEach((datasetName) => {
      const option = document.createElement("option");
      option.value = datasetName;
      option.textContent = datasetName;
      select.appendChild(option);
    });

    select.value = Array.from(select.options).some((option) => option.value === currentValue)
      ? currentValue
      : allChartDatasetsValue;
    chartScopeSelections[scope].dataset = select.value;
  }

  function syncChartScopeSplitSelect(scope) {
    const select = chartScopeSplitSelect(scope);
    if (!select) return;

    const selection = chartScopeSelections[scope];
    const selectedDataset = selection?.dataset || allChartDatasetsValue;
    const currentValue = selection?.split || allChartSplitsValue;
    select.textContent = "";

    const allOption = document.createElement("option");
    allOption.value = allChartSplitsValue;
    allOption.textContent = "All splits";
    select.appendChild(allOption);

    knownSplitOptions()
      .filter((option) => {
        return (
          selectedDataset === allChartDatasetsValue ||
          option.datasets.length === 0 ||
          option.datasets.includes(selectedDataset)
        );
      })
      .forEach((splitOption) => {
        const option = document.createElement("option");
        option.value = splitOption.value;
        option.textContent = splitOption.label;
        select.appendChild(option);
      });

    select.value = Array.from(select.options).some((option) => option.value === currentValue)
      ? currentValue
      : allChartSplitsValue;
    chartScopeSelections[scope].split = select.value;
  }

  function configureChartScopeControls(scope) {
    const datasetSelect = chartScopeDatasetSelect(scope);
    const splitSelect = chartScopeSplitSelect(scope);
    if (!datasetSelect || !splitSelect || !chartScopeSelections[scope]) return;

    populateChartScopeDatasetSelect(scope);
    syncChartScopeSplitSelect(scope);

    datasetSelect.addEventListener("change", () => {
      chartScopeSelections[scope].dataset = datasetSelect.value || allChartDatasetsValue;
      syncChartScopeSplitSelect(scope);
      void refreshScopedMetricChart(scope);
    });

    splitSelect.addEventListener("change", () => {
      chartScopeSelections[scope].split = splitSelect.value || allChartSplitsValue;
      void refreshScopedMetricChart(scope);
    });
  }

  function comparisonMetricGroup() {
    const selected = document.getElementById("comparison-metric-group")?.value || "summary";
    return comparisonMetricGroups[selected] ? selected : "summary";
  }

  function comparisonRowCount() {
    const selected = Number(document.getElementById("comparison-row-count")?.value || 5);
    return Number.isFinite(selected) ? selected : 5;
  }

  function comparisonRowLabel(row) {
    const splitLabel = row.split && row.split !== defaultSplit ? ` / ${row.split}` : "";
    return `${row.model} (${row.dataset}${splitLabel})`;
  }

  function comparisonAxisTitle(group) {
    if (group === "l2") return "Relative L2 error (%) - lower is better";
    if (group === "l1") return "Relative L1 error (%) - lower is better";
    if (group === "r2") return "R2 - higher is better";
    return "Score (points) - higher is better";
  }

  function comparisonMetricValue(row, metricKey) {
    const value = Number(row[metricKey]);
    return Number.isFinite(value) ? Number(value.toFixed(3)) : null;
  }

  function comparisonDatasets(metricKeys, rows) {
    return metricKeys.map((metricKey, index) => {
      const metric = metricDefinitions[metricKey];
      const color = comparisonColors[index % comparisonColors.length];
      return {
        label: metric?.label || metricKey,
        metricKey,
        data: rows.map((row) => comparisonMetricValue(row, metricKey)),
        backgroundColor: hexToRgba(color, 0.68),
        borderColor: color,
        borderRadius: 4,
        borderWidth: 1,
        maxBarThickness: 28,
      };
    });
  }

  const comparisonValueLabelPlugin = {
    id: "comparisonValueLabels",
    afterDatasetsDraw(chart) {
      const { ctx, chartArea } = chart;
      ctx.save();
      ctx.fillStyle = chartTextColor();
      ctx.font = "600 10px Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";

      chart.data.datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);
        if (meta.hidden) return;

        meta.data.forEach((bar, valueIndex) => {
          const row = comparisonChartRowsCache[valueIndex];
          const value = Number(row?.[dataset.metricKey]);
          if (!row || !dataset.metricKey || !Number.isFinite(value)) return;

          const label = formatComparisonValue(row, dataset.metricKey);
          const y = Math.max(chartArea.top + 10, bar.y - 4);
          ctx.fillText(label, bar.x, y);
        });
      });

      ctx.restore();
    },
  };

  function comparisonChartOptions() {
    const options = baseChartOptions("Normalized score (higher is better)", "Submission");
    options.interaction = { mode: "index", intersect: false };
    options.layout = { padding: { top: 24 } };
    options.plugins.tooltip = {
      callbacks: {
        title(items) {
          const row = comparisonChartRowsCache[items[0]?.dataIndex];
          return row ? `${row.model} - ${row.dataset} / ${row.split}` : "";
        },
        label(context) {
          const row = comparisonChartRowsCache[context.dataIndex];
          const metricKey = context.dataset.metricKey;
          const value = Number(context.parsed.y);
          if (!row || !metricKey || !Number.isFinite(value)) return context.dataset.label;
          return `${context.dataset.label}: ${formatComparisonValue(row, metricKey)}`;
        },
      },
    };
    options.scales.x.grid.display = false;
    options.scales.x.ticks.autoSkip = false;
    options.scales.x.ticks.maxRotation = 35;
    options.scales.x.ticks.callback = function (value) {
      const label = this.getLabelForValue(value);
      return label.length > 24 ? `${label.slice(0, 23)}...` : label;
    };
    options.scales.y.min = 0;
    options.scales.y.max = 100;
    return options;
  }

  function updateComparisonChart() {
    if (!comparisonChart) return;

    const group = comparisonMetricGroup();
    const rows = chartScopeRows("comparison").slice(0, comparisonRowCount());
    const metricKeys = comparisonMetricGroups[group];
    comparisonChartRowsCache = rows;
    comparisonChart.data.labels = rows.map(comparisonRowLabel);
    comparisonChart.data.datasets = comparisonDatasets(metricKeys, rows);
    comparisonChart.options.scales.y.title.text = comparisonAxisTitle(group);
    comparisonChart.options.scales.y.min = 0;
    comparisonChart.options.scales.y.max = group === "r2" ? 1 : group === "summary" ? 100 : undefined;
    comparisonChart.update();
  }

  function configureComparisonControls() {
    configureChartScopeControls("comparison");
    ["comparison-metric-group", "comparison-row-count"].forEach((id) => {
      document.getElementById(id)?.addEventListener("change", updateComparisonChart);
    });
  }

  function scatterAxisDefinition(key) {
    return scatterAxisDefinitions.find((axis) => axis.key === key) || scatterAxisDefinitions[0];
  }

  function populateScatterAxisSelect(select, defaultKey) {
    if (!select) return;
    select.textContent = "";
    scatterAxisDefinitions.forEach((axis) => {
      const option = document.createElement("option");
      option.value = axis.key;
      option.textContent = axis.label;
      option.selected = axis.key === defaultKey;
      select.appendChild(option);
    });
  }

  function selectedScatterAxis(id, fallback) {
    const selected = document.getElementById(id)?.value || fallback;
    return scatterAxisDefinition(selected).key;
  }

  function scatterAxisValue(row, key) {
    const axis = scatterAxisDefinition(key);
    if (axis.kind === "date") {
      const timestamp = Date.parse(row[key]);
      return Number.isFinite(timestamp) ? timestamp : null;
    }

    const value = Number(row[key]);
    return Number.isFinite(value) ? value : null;
  }

  function formatDateValue(value) {
    const timestamp = typeof value === "number" ? value : Date.parse(value);
    if (!Number.isFinite(timestamp)) return "N/A";
    return new Date(timestamp).toISOString().slice(0, 10);
  }

  function formatScatterAxisValue(row, key) {
    const axis = scatterAxisDefinition(key);
    if (axis.kind === "date") return formatDateValue(row[key]);

    const value = Number(row[key]);
    if (!Number.isFinite(value)) return "N/A";
    return formatNumber(value, axis.digits ?? 2);
  }

  function scatterTickLabel(key, value) {
    const axis = scatterAxisDefinition(key);
    if (axis.kind === "date") return formatDateValue(Number(value));
    if (!Number.isFinite(Number(value))) return value;
    return formatNumber(Number(value), axis.digits ?? 2);
  }

  function datasetColor(dataset, index) {
    return datasetColors[index % datasetColors.length];
  }

  function scatterDatasets(rows, xKey, yKey) {
    const groupedRows = new Map();
    scatterChartRowsCache = [];

    rows.forEach((row) => {
      const x = scatterAxisValue(row, xKey);
      const y = scatterAxisValue(row, yKey);
      if (x === null || y === null) return;

      if (!groupedRows.has(row.dataset)) groupedRows.set(row.dataset, []);
      groupedRows.get(row.dataset).push({
        x,
        y,
        rowIndex: scatterChartRowsCache.length,
      });
      scatterChartRowsCache.push(row);
    });

    return Array.from(groupedRows.entries()).map(([dataset, data], index) => {
      const color = datasetColor(dataset, index);
      return {
        label: dataset,
        data,
        backgroundColor: hexToRgba(color, 0.72),
        borderColor: color,
        borderWidth: 1,
        pointRadius: 5,
        pointHoverRadius: 7,
      };
    });
  }

  function scatterChartOptions() {
    const options = baseChartOptions("Overall score", "Params (M)");
    options.interaction = { mode: "nearest", intersect: true };
    options.plugins.tooltip = {
      callbacks: {
        title(items) {
          const row = scatterChartRowsCache[items[0]?.raw?.rowIndex];
          return row ? row.model : "";
        },
        label(context) {
          const row = scatterChartRowsCache[context.raw?.rowIndex];
          if (!row) return context.dataset.label;
          const xKey = selectedScatterAxis("scatter-x-axis", "params");
          const yKey = selectedScatterAxis("scatter-y-axis", "score");
          return [
            `${row.dataset} / ${row.split}`,
            `Submitted by: ${row.submittedBy}`,
            `${scatterAxisDefinition(xKey).label}: ${formatScatterAxisValue(row, xKey)}`,
            `${scatterAxisDefinition(yKey).label}: ${formatScatterAxisValue(row, yKey)}`,
          ];
        },
      },
    };
    options.scales.x.type = "linear";
    options.scales.x.grace = "8%";
    options.scales.y.type = "linear";
    options.scales.y.grace = "8%";
    return options;
  }

  function updateScatterChart() {
    if (!scatterChart) return;

    const xKey = selectedScatterAxis("scatter-x-axis", "params");
    const yKey = selectedScatterAxis("scatter-y-axis", "score");
    const xAxis = scatterAxisDefinition(xKey);
    const yAxis = scatterAxisDefinition(yKey);
    const rows = chartScopeRows("scatter");

    scatterChart.data.datasets = scatterDatasets(rows, xKey, yKey);
    scatterChart.options.scales.x.title.text = xAxis.label;
    scatterChart.options.scales.x.ticks.callback = (value) => scatterTickLabel(xKey, value);
    scatterChart.options.scales.y.title.text = yAxis.label;
    scatterChart.options.scales.y.ticks.callback = (value) => scatterTickLabel(yKey, value);
    scatterChart.update();
  }

  function configureScatterControls() {
    const xSelect = document.getElementById("scatter-x-axis");
    const ySelect = document.getElementById("scatter-y-axis");
    configureChartScopeControls("scatter");
    populateScatterAxisSelect(xSelect, "params");
    populateScatterAxisSelect(ySelect, "score");
    xSelect?.addEventListener("change", updateScatterChart);
    ySelect?.addEventListener("change", updateScatterChart);
  }

  function chartRows(chartType) {
    const selection = chartSelections[chartType];
    return enrichedRows()
      .filter((row) => row.dataset === selection.dataset && row.split === selection.split)
      .sort((a, b) => compareRows(a, b, primaryRankingKey, defaultSortDirection(primaryRankingKey)));
  }

  function updateCpChart() {
    if (!cpChart) return;
    const profile = chartProfile("cp");
    const models = checkedModels("cp-models");
    cpChart.data.labels = [];
    cpChart.data.datasets = models
      .map((modelId, index) => {
        const row = submissions.find((entry) => entry.id === modelId);
        const series = cpSeries(modelId);
        return series ? lineDataset(row?.model || modelId, series, modelColor(modelId, index), true) : null;
      })
      .filter(Boolean);
    cpChart.options.scales.x.type = "linear";
    cpChart.options.scales.x.title.text = profile.cpXTitle;
    cpChart.update();
  }

  function updateVelocityChart() {
    if (!velocityChart) return;
    const profile = chartProfile("velocity");
    const models = checkedModels("velocity-models");
    setText("velocity-station-label", activeStation);
    velocityChart.data.labels = [];
    velocityChart.data.datasets = models
      .map((modelId, index) => {
        const row = submissions.find((entry) => entry.id === modelId);
        const series = velocitySeries(modelId);
        return series ? lineDataset(row?.model || modelId, series, modelColor(modelId, index), true) : null;
      })
      .filter(Boolean);
    velocityChart.options.scales.x.type = "linear";
    velocityChart.options.scales.x.title.text = profile.velocityXTitle || "z/H";
    velocityChart.update();
  }

  function renderModelToggles(containerId, chartType) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.textContent = "";

    const rows = chartRows(chartType).slice(0, 12);
    if (!rows.length) {
      const empty = document.createElement("div");
      empty.className = "leaderboard-filter-empty";
      empty.textContent = "No submissions for this dataset and split";
      container.appendChild(empty);
      updateChartModelSummary(`${containerId}-filter`, containerId);
      return;
    }

    rows.forEach((row, index) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      label.className = "leaderboard-filter-option";
      input.type = "checkbox";
      input.value = row.id;
      input.checked = index < 3;
      label.append(input, document.createTextNode(` ${row.model}`));
      container.appendChild(label);
    });

    updateChartModelSummary(`${containerId}-filter`, containerId);
  }

  function syncChartPanel(chartType) {
    const profile = chartProfile(chartType);

    if (chartType === "cp") {
      setText("cp-panel-title", profile.cpTitle);
      setText("cp-panel-description", profile.cpDescription);
      renderModelToggles("cp-models", chartType);
      updateCpChart();
      return;
    }

    setText("velocity-panel-title", profile.velocityTitle);
    setText("velocity-panel-description", profile.velocityDescription);
    document.querySelectorAll(".station-toggle").forEach((button) => {
      button.classList.toggle("active", button.getAttribute("data-station") === activeStation);
    });
    renderModelToggles("velocity-models", chartType);
    updateVelocityChart();
  }

  function refreshAllChartPanels() {
    ["comparison", "scatter"].forEach((scope) => {
      populateChartScopeDatasetSelect(scope);
      syncChartScopeSplitSelect(scope);
    });
    updateComparisonChart();
    updateScatterChart();
    syncChartPanel("cp");
    syncChartPanel("velocity");
  }

  function configureChartControls() {
    ["cp", "velocity"].forEach((chartType) => {
      configureChartSingleFilter(`${chartType}-dataset-filter`, chartType, "dataset");
      configureChartSingleFilter(`${chartType}-split-filter`, chartType, "split");
      configureChartModelFilter(`${chartType}-models-filter`, `${chartType}-models`, chartType);
      syncChartSplitOptions(chartType);
    });
  }

  function configureCharts() {
    if (!window.Chart) return;

    configureComparisonControls();
    configureScatterControls();
    configureChartControls();

    const comparisonCanvas = document.getElementById("comparison-chart");
    if (comparisonCanvas) {
      comparisonChart = new Chart(comparisonCanvas, {
        type: "bar",
        data: { labels: [], datasets: [] },
        options: comparisonChartOptions(),
        plugins: [comparisonValueLabelPlugin],
      });
    }

    const scatterCanvas = document.getElementById("scatter-chart");
    if (scatterCanvas) {
      scatterChart = new Chart(scatterCanvas, {
        type: "scatter",
        data: { datasets: [] },
        options: scatterChartOptions(),
      });
    }

    const cpCanvas = document.getElementById("cp-chart");
    if (cpCanvas) {
      const profile = chartProfile("cp");
      cpChart = new Chart(cpCanvas, {
        type: "line",
        data: { labels: [], datasets: [] },
        options: baseChartOptions("Cp", profile.cpXTitle),
      });
    }

    const velocityCanvas = document.getElementById("velocity-chart");
    if (velocityCanvas) {
      const velocityProfile = chartProfile("velocity");
      velocityChart = new Chart(velocityCanvas, {
        type: "line",
        data: { labels: [], datasets: [] },
        options: baseChartOptions("U / U∞", velocityProfile.velocityXTitle || "z/H"),
      });
    }

    document.querySelectorAll(".station-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        activeStation = button.getAttribute("data-station");
        document.querySelectorAll(".station-toggle").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        updateVelocityChart();
      });
    });

    refreshAllChartPanels();
  }

  function appendDetailField(container, label, value) {
    const wrapper = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");

    term.textContent = label;
    description.textContent = value || "Not provided";
    wrapper.append(term, description);
    container.appendChild(wrapper);
  }

  function appendDetailLink(container, label, url) {
    const safeUrl = safeExternalUrl(url);
    if (!safeUrl) return;

    const link = document.createElement("a");
    link.href = safeUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = label;
    container.appendChild(link);
  }

  function openDetailsDialog(row) {
    const dialog = document.getElementById("details-dialog");
    const title = document.getElementById("details-dialog-title");
    const subtitle = document.getElementById("details-dialog-subtitle");
    const body = document.getElementById("details-dialog-body");
    if (!dialog || !title || !subtitle || !body) return;

    title.textContent = row.model;
    subtitle.textContent = `${row.dataset} / ${row.split}`;
    body.textContent = "";

    const note = document.createElement("p");
    note.className = "details-note";
    note.textContent = row.note || "No additional notes have been provided for this submission.";
    body.appendChild(note);

    const details = document.createElement("dl");
    details.className = "details-grid";
    appendDetailField(details, "Submitted by", row.submittedBy);
    appendDetailField(details, "Model type", row.type);
    appendDetailField(details, "Dataset", row.dataset);
    appendDetailField(details, "Split", row.split);
    appendDetailField(details, "Field score (50%)", formatNumber(row.fieldScore, 1));
    appendDetailField(details, "Force score (25%)", formatNumber(row.forceScore, 1));
    appendDetailField(details, "Diagnostic score (25%)", formatNumber(row.diagnosticScore, 1));
    appendDetailField(details, "Overall score", formatNumber(row.score, 1));
    appendDetailField(details, "Cd R2", formatNumber(row.r2Cd, 3));
    appendDetailField(details, "Cl R2", formatNumber(row.r2Cl, 3));
    appendDetailField(details, "Velocity profiles R2", formatNumber(row.velocityProfileR2, 3));
    appendDetailField(details, "Cp cuts R2", formatNumber(row.cpCutR2, 3));
    appendDetailField(details, "Cp diagnostic cuts", diagnosticSummary(row, "cpCuts", "Not provided"));
    appendDetailField(details, "Velocity diagnostic profiles", diagnosticSummary(row, "velocityProfiles", "Not provided"));
    appendDetailField(details, "Params (M)", formatNumber(row.params, 2));
    appendDetailField(details, "Submission date", row.date);
    body.appendChild(details);

    const links = document.createElement("p");
    links.className = "details-links";
    appendDetailLink(links, "Paper", row.paperUrl);
    appendDetailLink(links, "Code", row.codeUrl);
    if (links.childElementCount > 0) body.appendChild(links);

    if (dialog.showModal) {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "open");
    }
  }

  function configureDetailsDialog() {
    const dialog = document.getElementById("details-dialog");
    const closeButton = document.getElementById("close-details-dialog");

    closeButton?.addEventListener("click", () => dialog?.close());
    dialog?.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  async function initLeaderboard() {
    renderApprovedSubmissionStatus();
    configureSort();
    configurePrimaryRanking();
    configureFilters();
    configureDetailsDialog();
    await loadApprovedSubmissions();
    renderApprovedSubmissionStatus();
    renderTable();
    configureCharts();
  }

  window.addEventListener("load", initLeaderboard);
})();

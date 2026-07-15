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
  const fullSplit = "Full";

  const leaderboardBaseUrl =
    window.FluidsBenchLeaderboardBaseUrl || new URL("/", window.location.origin).href;
  const leaderboardManifestUrl =
    window.FluidsBenchLeaderboardManifestUrl ||
    new URL("/leaderboard/manifest.json", window.location.origin).href;
  const approvedSubmissionsSourceLabel =
    window.FluidsBenchApprovedSubmissionsSourceLabel || "leaderboard manifest";
  const diagnosticGroundTruthBaseUrl =
    window.FluidsBenchDiagnosticGroundTruthBaseUrl ||
    new URL("/assets/data/diagnostic-ground-truth/", window.location.origin).href;
  const diagnosticGroundTruthManifestUrl =
    window.FluidsBenchDiagnosticGroundTruthManifestUrl ||
    new URL("manifest.json", diagnosticGroundTruthBaseUrl).href;
  const velocityGroundTruthStationIds = ["prototype_0_25l", "prototype_0_50l", "prototype_1_00l"];

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

  const columnHelpDefinitions = {
    rank: {
      title: "Rank",
      description: "Position within the selected dataset and split, ordered by weighted overall score.",
    },
    model: {
      title: "Model",
      description: "The model name supplied by the submitter. This is a free-text value.",
    },
    submittedBy: {
      title: "Submitted by",
      description: "The person, research group, institution, or company that submitted the result.",
    },
    type: {
      title: "Model type",
      description: "One or more broad architecture categories supplied with the submission.",
      options: ["Transformer", "GNN", "Neural operator", "Implicit field", "MLP", "Point cloud", "Other"],
    },
    trainingRegimeLabel: {
      title: "Training",
      description: "How the model used external pretraining and the official benchmark training data.",
      options: ["Scratch", "Zero-shot", "Pretrained + official train", "Other"],
    },
    dataset: {
      title: "Dataset",
      description: "The FluidsBench benchmark dataset used for evaluation.",
      options: ["AhmedML", "DrivAerML", "DrivAerNet++", "WindsorML", "HiLiftAeroML", "AirfRANS"],
    },
    split: {
      title: "Split",
      description: "The official benchmark split evaluated. Available choices depend on the selected dataset.",
      options: () => predefinedSplitOptions.map((option) => option.label),
    },
    score: {
      title: "Overall score",
      description: "A 0-100 weighted score: 50% field, 25% force, and 25% diagnostic performance. Higher is better.",
      metricsLink: true,
    },
    fieldScore: {
      title: "Field score",
      description: "A 0-100 score derived from the four relative L2 field errors. Higher is better.",
      metricsLink: true,
    },
    forceScore: {
      title: "Force score",
      description: "A 0-100 weighted blend of drag and lift R2. Higher is better.",
      metricsLink: true,
    },
    diagnosticScore: {
      title: "Diagnostic score",
      description: "A 0-100 weighted blend of velocity-profile and Cp-cut R2. Higher is better.",
      metricsLink: true,
    },
    surfacePressure: {
      title: "Surface pressure relative L2",
      description: "Relative L2 error for predicted surface pressure in dimensional physical space. Lower is better.",
      metricsLink: true,
    },
    surfacePressureL1: {
      title: "Surface pressure relative L1",
      description: "Relative L1 error for predicted surface pressure in dimensional physical space. Lower is better.",
      metricsLink: true,
    },
    surfaceTau: {
      title: "Surface wall shear relative L2",
      description: "Relative L2 error for predicted surface wall shear in dimensional physical space. Lower is better.",
      metricsLink: true,
    },
    surfaceTauL1: {
      title: "Surface wall shear relative L1",
      description: "Relative L1 error for predicted surface wall shear in dimensional physical space. Lower is better.",
      metricsLink: true,
    },
    volumeVelocity: {
      title: "Volume velocity relative L2",
      description: "Relative L2 error for the predicted volume velocity field. Lower is better.",
      metricsLink: true,
    },
    volumeVelocityL1: {
      title: "Volume velocity relative L1",
      description: "Relative L1 error for the predicted volume velocity field. Lower is better.",
      metricsLink: true,
    },
    volumePressure: {
      title: "Volume pressure relative L2",
      description: "Relative L2 error for the predicted volume pressure field. Lower is better.",
      metricsLink: true,
    },
    volumePressureL1: {
      title: "Volume pressure relative L1",
      description: "Relative L1 error for the predicted volume pressure field. Lower is better.",
      metricsLink: true,
    },
    r2Cd: {
      title: "Drag coefficient R2",
      description: "Coefficient of determination for predicted drag coefficient across evaluated cases. Higher is better.",
      metricsLink: true,
    },
    r2Cl: {
      title: "Lift coefficient R2",
      description: "Coefficient of determination for predicted lift coefficient across evaluated cases. Higher is better.",
      metricsLink: true,
    },
    velocityProfileR2: {
      title: "Velocity profiles R2",
      description: "Coefficient of determination for the required velocity-profile diagnostics. Higher is better.",
      metricsLink: true,
    },
    cpCutR2: {
      title: "Cp cuts R2",
      description: "Coefficient of determination for the required surface-pressure coefficient cuts. Higher is better.",
      metricsLink: true,
    },
    params: {
      title: "Parameters",
      description: "The submitter-reported model parameter count, displayed in millions.",
    },
    date: {
      title: "Submission date",
      description: "The date associated with the approved leaderboard submission.",
    },
    details: {
      title: "Details",
      description: "Opens submission metadata, training information, diagnostic coverage, and paper or code links.",
    },
  };

  const comparisonMetricGroups = {
    summary: ["score", "fieldScore", "forceScore", "diagnosticScore"],
    l2: ["surfacePressure", "surfaceTau", "volumeVelocity", "volumePressure"],
    l1: ["surfacePressureL1", "surfaceTauL1", "volumeVelocityL1", "volumePressureL1"],
    r2: ["r2Cd", "r2Cl", "forceR2", "velocityProfileR2", "cpCutR2"],
  };

  const dynamicComparisonGroups = new Set(["dimensional-mae", "dimensional-rmse", "coefficient-mae"]);

  const columnGroups = [
    "component-scores",
    "relative-errors",
    "absolute-errors",
    "r2-metrics",
    "model-details",
  ];
  const columnVisibilityStorageKey = "fluidsbench-leaderboard-column-groups";

  const tableColumnsBeforeDynamic = [
    { key: "rank", label: "Rank" },
    { key: "model", label: "Model" },
    { key: "submittedBy", label: "Submitted by" },
    { key: "type", label: "Type" },
    { key: "trainingRegimeLabel", label: "Training" },
    { key: "dataset", label: "Dataset", groupStart: true },
    { key: "split", label: "Split" },
    { key: "score", label: "Overall score", groupStart: true },
    { key: "fieldScore", label: "Field score", group: "component-scores", groupStart: true },
    { key: "forceScore", label: "Force score", group: "component-scores", groupStart: true },
    { key: "diagnosticScore", label: "Diagnostic score", group: "component-scores", groupStart: true },
    { key: "surfacePressure", label: "Surface pressure<br>rel L2 (%)", group: "relative-errors", groupStart: true, html: true },
    { key: "surfacePressureL1", label: "Surface pressure<br>rel L1 (%)", group: "relative-errors", html: true },
    { key: "surfaceTau", label: "Surface tau wall<br>rel L2 (%)", group: "relative-errors", groupStart: true, html: true },
    { key: "surfaceTauL1", label: "Surface tau wall<br>rel L1 (%)", group: "relative-errors", html: true },
    { key: "volumeVelocity", label: "Volume velocity<br>rel L2 (%)", group: "relative-errors", groupStart: true, html: true },
    { key: "volumeVelocityL1", label: "Volume velocity<br>rel L1 (%)", group: "relative-errors", html: true },
    { key: "volumePressure", label: "Volume pressure<br>rel L2 (%)", group: "relative-errors", groupStart: true, html: true },
    { key: "volumePressureL1", label: "Volume pressure<br>rel L1 (%)", group: "relative-errors", html: true },
  ];

  const tableColumnsAfterDynamic = [
    { key: "r2Cd", label: "C<sub>d</sub> R<sup>2</sup>", group: "r2-metrics", groupStart: true, html: true },
    { key: "r2Cl", label: "C<sub>l</sub> R<sup>2</sup>", group: "r2-metrics", html: true },
    { key: "velocityProfileR2", label: "Velocity profiles<br>R<sup>2</sup>", group: "r2-metrics", groupStart: true, html: true },
    { key: "cpCutR2", label: "Cp cuts<br>R<sup>2</sup>", group: "r2-metrics", html: true },
    { key: "params", label: "Params (M)", group: "model-details", groupStart: true },
    { key: "date", label: "Submission date", group: "model-details" },
    { key: "details", label: "Details", groupStart: true, sortable: false },
  ];

  const trainingRegimeLabels = {
    from_scratch: "Scratch",
    pretrained_zero_shot: "Zero-shot",
    pretrained_official_train: "Pretrained + official train",
    other: "Other",
  };

  const targetDataLabels = {
    official_train: "Official train",
    none: "None",
    other: "Other",
  };

  const splitAliases = new Map([
    ["full", "Full"],
    ["medium", "Medium"],
    ["scarce", "Scarce"],
    ["super_scarce", "Super scarce"],
    ["super-scarce", "Super scarce"],
    ["super scarce", "Super scarce"],
    ["geometry", "Geometry"],
    ["high_drag", "High drag"],
    ["high-drag", "High drag"],
    ["high drag", "High drag"],
    ["low_drag", "Low drag"],
    ["low-drag", "Low drag"],
    ["low drag", "Low drag"],
    ["image_wake", "Image wake"],
    ["image-wake", "Image wake"],
    ["image wake", "Image wake"],
    ["rear_separation", "Rear separation"],
    ["rear-separation", "Rear separation"],
    ["rear separation", "Rear separation"],
    ["geometry_medium", "Geometry medium"],
    ["geometry-medium", "Geometry medium"],
    ["geometry medium", "Geometry medium"],
    ["geometry_scarce", "Geometry scarce"],
    ["geometry-scarce", "Geometry scarce"],
    ["geometry scarce", "Geometry scarce"],
    ["geometry_super_scarce", "Geometry super scarce"],
    ["geometry-super-scarce", "Geometry super scarce"],
    ["geometry super scarce", "Geometry super scarce"],
    ["single_aoa_4", "AoA 4"],
    ["single-aoa-4", "AoA 4"],
    ["single aoa 4", "AoA 4"],
    ["single_aoa_12", "AoA 12"],
    ["single-aoa-12", "AoA 12"],
    ["single aoa 12", "AoA 12"],
    ["single_aoa_22", "AoA 22"],
    ["single-aoa-22", "AoA 22"],
    ["single aoa 22", "AoA 22"],
    ["aoa", "AoA extrapolation"],
    ["deflection", "Deflection"],
    ["stall", "Stall"],
  ]);

  const predefinedSplitOptions = [
    { value: defaultSplit, label: "Default", datasets: ["DrivAerNet++", "WindsorML"] },
    { value: fullSplit, label: "Full", datasets: ["AhmedML", "DrivAerML", "HiLiftAeroML", "AirfRANS"] },
    { value: "Medium", label: "Medium", datasets: ["AhmedML", "DrivAerML", "HiLiftAeroML"] },
    { value: "Scarce", label: "Scarce", datasets: ["AhmedML", "DrivAerML", "HiLiftAeroML", "AirfRANS"] },
    { value: "Super scarce", label: "Super scarce", datasets: ["AhmedML", "DrivAerML", "HiLiftAeroML"] },
    { value: "Geometry", label: "Geometry", datasets: ["AhmedML", "DrivAerML", "HiLiftAeroML"] },
    { value: "Geometry medium", label: "Geometry medium", datasets: ["HiLiftAeroML"] },
    { value: "Geometry scarce", label: "Geometry scarce", datasets: ["HiLiftAeroML"] },
    { value: "Geometry super scarce", label: "Geometry super scarce", datasets: ["HiLiftAeroML"] },
    { value: "High drag", label: "High drag", datasets: ["AhmedML", "DrivAerML"] },
    { value: "Low drag", label: "Low drag", datasets: ["AhmedML", "DrivAerML"] },
    { value: "Image wake", label: "Image wake", datasets: ["AhmedML"] },
    { value: "Rear separation", label: "Rear separation", datasets: ["DrivAerML"] },
    { value: "Reynolds extrapolation", label: "Reynolds extrapolation", datasets: ["AirfRANS"] },
    { value: "AoA extrapolation", label: "AoA extrapolation", datasets: ["HiLiftAeroML", "AirfRANS"] },
    { value: "Deflection", label: "Deflection", datasets: ["HiLiftAeroML"] },
    { value: "Stall", label: "Stall", datasets: ["HiLiftAeroML"] },
    { value: "AoA 4", label: "AoA 4", datasets: ["HiLiftAeroML"] },
    { value: "AoA 12", label: "AoA 12", datasets: ["HiLiftAeroML"] },
    { value: "AoA 22", label: "AoA 22", datasets: ["HiLiftAeroML"] },
  ];

  const comparisonColors = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
  const datasetColors = ["#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#64748b", "#1e40af"];

  const scatterAxisDefinitions = [
    { key: "rank", label: "Rank", digits: 0, direction: "lower" },
    { key: "surfacePressure", label: "Surface pressure L2 (%)", digits: 2, direction: "lower" },
    { key: "surfacePressureL1", label: "Surface pressure L1 (%)", digits: 2, direction: "lower" },
    { key: "surfaceTau", label: "Surface tau wall L2 (%)", digits: 2, direction: "lower" },
    { key: "surfaceTauL1", label: "Surface tau wall L1 (%)", digits: 2, direction: "lower" },
    { key: "volumeVelocity", label: "Volume velocity L2 (%)", digits: 2, direction: "lower" },
    { key: "volumeVelocityL1", label: "Volume velocity L1 (%)", digits: 2, direction: "lower" },
    { key: "volumePressure", label: "Volume pressure L2 (%)", digits: 2, direction: "lower" },
    { key: "volumePressureL1", label: "Volume pressure L1 (%)", digits: 2, direction: "lower" },
    { key: "r2Cd", label: "Cd R2", digits: 3, direction: "higher" },
    { key: "r2Cl", label: "Cl R2", digits: 3, direction: "higher" },
    { key: "velocityProfileR2", label: "Velocity profiles R2", digits: 3, direction: "higher" },
    { key: "cpCutR2", label: "Cp cuts R2", digits: 3, direction: "higher" },
    { key: "params", label: "Params (M)", digits: 2 },
    { key: "date", label: "Submission date", kind: "date" },
    { key: "fieldScore", label: "Field score (50%)", digits: 1, direction: "higher" },
    { key: "forceScore", label: "Force score (25%)", digits: 1, direction: "higher" },
    { key: "diagnosticScore", label: "Diagnostic score (25%)", digits: 1, direction: "higher" },
    { key: "score", label: "Overall score", digits: 1, direction: "higher" },
  ];

  let submissions = [];
  let leaderboardManifest = null;
  let approvedDatasetRows = new Map();
  let datasetLoadPromises = new Map();
  let diagnosticGroundTruthManifest = null;
  const diagnosticGroundTruthByDataset = new Map();
  const diagnosticGroundTruthLoadPromises = new Map();
  let dataRefreshToken = 0;
  let approvedSubmissionStatusMessage = `Loading approved submissions from ${approvedSubmissionsSourceLabel}...`;

  const datasetProfiles = {
    AhmedML: {
      cpTitle: "AhmedML surface Cp",
      cpDescription: "Submitted Cp diagnostic cuts for the selected AhmedML rows.",
      cpXTitle: "x/L along Ahmed body centreline",
      velocityTitle: "Velocity profiles",
      velocityDescription: "Submitted wake velocity diagnostic profiles for the selected AhmedML rows.",
      velocityXTitle: "Diagnostic coordinate",
    },
    DrivAerML: {
      cpTitle: "DrivAerML surface Cp",
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
      cpTitle: "WindsorML surface Cp",
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
  const rankMetricKey = "score";
  let comparisonChart = null;
  let comparisonChartRowsCache = [];
  let scatterChart = null;
  let scatterChartRowsCache = [];
  let cpChart = null;
  let velocityChart = null;
  let activeStation = "0.25L";
  let columnHelpPopover = null;
  let activeColumnHelpTrigger = null;
  let columnHelpHideTimer = null;
  let columnHelpGlobalEventsConfigured = false;
  let columnVisibility = loadColumnVisibility();
  const cpStationSelections = new Map();
  const sharedSelection = { dataset: "AhmedML", split: fullSplit };
  const chartSelections = {
    cp: { dataset: "AhmedML", split: fullSplit },
    velocity: { dataset: "AhmedML", split: fullSplit },
  };
  const chartScopeSelections = {
    comparison: { dataset: "AhmedML", split: fullSplit },
    scatter: { dataset: "AhmedML", split: fullSplit },
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
    if (!metric.unit) return formatted;
    return `${formatted}${metric.unit === "%" ? "" : " "}${metric.unit}`;
  }

  function comparisonValueDigits(metric) {
    if (!metric) return 1;
    if (metric.scoreKind === "r2") return 2;
    if (metric.scoreKind === "absoluteError") return metric.digits;
    return 1;
  }

  function formatComparisonValue(row, key) {
    const metric = metricDefinitions[key];
    const value = Number(row[key]);
    if (!metric || !Number.isFinite(value)) return "N/A";

    if (metric.scoreKind === "score") return `${formatNumber(value, 1)} pts`;
    if (metric.scoreKind === "r2") return formatNumber(value, comparisonValueDigits(metric));
    if (metric.unit) {
      const spacer = metric.unit === "%" ? "" : " ";
      return `${formatNumber(value, comparisonValueDigits(metric))}${spacer}${metric.unit}`;
    }
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
      key === "trainingRegimeLabel" ||
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
    const aValue = Number(a[key]);
    const bValue = Number(b[key]);
    if (!Number.isFinite(aValue) && !Number.isFinite(bValue)) return 0;
    if (!Number.isFinite(aValue)) return 1;
    if (!Number.isFinite(bValue)) return -1;
    return (aValue - bValue) * multiplier;
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
    const rowTypes = row.modelTypes?.length ? row.modelTypes : [row.type];
    const typeMatch = filters.types.all || rowTypes.some((type) => filters.types.values.has(type));
    const splitMatch = filters.splits.all || filters.splits.values.has(row.split);
    return datasetMatch && typeMatch && splitMatch;
  }

  function rankedRows() {
    const filters = currentFilters();
    return enrichedRows()
      .filter((row) => rowMatchesFilters(row, filters))
      .sort((a, b) => compareRows(a, b, rankMetricKey, defaultSortDirection(rankMetricKey)))
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
    if (splitAliases.has(lowerValue)) return splitAliases.get(lowerValue);

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
      stationId: series.station_id || "",
      stationLabel: series.station_label || "",
      caseId: series.case_id || "",
      xLabel: series.x_label || "",
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

  function matchingVelocityProfile(row, station) {
    const profiles = row?.diagnostics?.velocityProfiles || [];
    if (!profiles.length) return null;

    const activeToken = stationToken(station);
    return (
      profiles.find((profile) => stationToken(profile.id).includes(activeToken)) ||
      profiles.find((profile) => activeToken.includes(stationToken(profile.id))) ||
      profiles[0]
    );
  }

  function diagnosticVelocitySeries(row, station = activeStation) {
    const profile = matchingVelocityProfile(row, station);
    return diagnosticPointSeries(profile, ["z", "y", "x", "s", "distance"], ["u_over_u_inf", "u", "velocity", "value"]);
  }

  function diagnosticCpSeries(row, stationId) {
    const cuts = row?.diagnostics?.cpCuts || [];
    const cut = cuts.find((series) => series.stationId === stationId) || cuts[0];
    return diagnosticPointSeries(cut, ["x", "s", "arc_length"], ["cp", "pressure_coefficient", "value"]);
  }

  function normalizeModelTypes(entry) {
    const rawTypes = Array.isArray(entry.model_types)
      ? entry.model_types
      : Array.isArray(entry.modelTypes)
        ? entry.modelTypes
        : [entry.model_type ?? entry.modelType ?? entry.type];
    const splitTypes = rawTypes.flatMap((type) => String(type || "").split(/[;,|]/));
    const types = uniqueInOrder(splitTypes.map((type) => type.trim()).filter(Boolean));
    return types.length ? types : ["Other"];
  }

  function modelTypesLabel(row) {
    const types = row.modelTypes?.length ? row.modelTypes : [row.type || "Other"];
    return types.join(", ");
  }

  function normalizeTrainingRegime(value) {
    const key = String(value || "from_scratch").trim();
    return Object.prototype.hasOwnProperty.call(trainingRegimeLabels, key) ? key : "other";
  }

  function trainingLabelFor(regime) {
    return trainingRegimeLabels[normalizeTrainingRegime(regime)];
  }

  function normalizeTargetDataUsed(value) {
    const key = String(value || "official_train").trim();
    return Object.prototype.hasOwnProperty.call(targetDataLabels, key) ? key : "other";
  }

  function targetDataLabelFor(value) {
    return targetDataLabels[normalizeTargetDataUsed(value)];
  }

  function parseBoolean(value, fallback = false) {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "yes", "1"].includes(normalized)) return true;
      if (["false", "no", "0"].includes(normalized)) return false;
    }
    return fallback;
  }

  function normalizePretrainingData(value) {
    const items = Array.isArray(value) ? value : [];
    return items
      .filter(Boolean)
      .map((item) => (typeof item === "string" ? { name: item } : item))
      .filter((item) => item && typeof item === "object");
  }

  function pretrainingDataLabel(row) {
    if (!row.externalPretraining) return "None";
    if (!row.pretrainingData?.length) return "Not specified";
    return row.pretrainingData
      .map((item) => [item.name, item.type].filter(Boolean).join(" - "))
      .filter(Boolean)
      .join("; ") || "Not specified";
  }

  function knownDatasetNames() {
    return uniqueInOrder([
      ...Object.keys(datasetProfiles),
      ...leaderboardDatasetNames(),
      ...submissions.map((row) => row.dataset),
    ]);
  }

  function normalizeDatasetSelection(dataset) {
    const knownDatasets = knownDatasetNames();
    if (dataset && knownDatasets.includes(dataset)) {
      return dataset;
    }

    return knownDatasets[0] || "AhmedML";
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
    leaderboardDatasetEntries().forEach((entry) => {
      (Array.isArray(entry.splits) ? entry.splits : []).forEach((split) => {
        const splitValue = split.name || split.label || split.id;
        addOption(splitValue, split.name || split.label || splitValue, [entry.name]);
      });
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
    const selectedDataset = normalizeDatasetSelection(selection?.dataset);
    if (selection) selection.dataset = selectedDataset;

    const rows = enrichedRows().filter((row) => {
      const datasetMatch = row.dataset === selectedDataset;
      const splitMatch = !selection || row.split === selection.split;
      return datasetMatch && splitMatch;
    });

    return rows
      .sort((a, b) => compareRows(a, b, rankMetricKey, defaultSortDirection(rankMetricKey)))
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
    const dynamicMetrics = normalizedDynamicMetricValues(entry, dataset);
    const id = `approved-${entry.submission_id || slug(`${dataset}-${rowSplit(entry)}-${model}`)}`;
    const modelTypes = normalizeModelTypes(entry);
    const trainingRegime = normalizeTrainingRegime(entry.training_regime ?? entry.trainingRegime);
    const targetDataUsed = normalizeTargetDataUsed(entry.target_data_used ?? entry.targetDataUsed);
    const externalPretraining = parseBoolean(
      entry.external_pretraining ?? entry.externalPretraining,
      trainingRegime.startsWith("pretrained_")
    );
    return {
      id,
      model,
      type: modelTypes[0],
      modelTypes,
      trainingRegime,
      trainingRegimeLabel: trainingLabelFor(trainingRegime),
      targetDataUsed,
      targetDataLabel: targetDataLabelFor(targetDataUsed),
      externalPretraining,
      pretrainingData: normalizePretrainingData(entry.pretraining_data ?? entry.pretrainingData),
      dataset,
      split: normalizeSplit(entry.split ?? entry.dataset_split ?? entry.benchmark_split, dataset),
      ...metrics,
      ...dynamicMetrics,
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

  function normalizedDiagnosticGroundTruthBaseUrl() {
    return diagnosticGroundTruthBaseUrl.endsWith("/")
      ? diagnosticGroundTruthBaseUrl
      : `${diagnosticGroundTruthBaseUrl}/`;
  }

  function diagnosticGroundTruthFileUrl(file) {
    return new URL(file, normalizedDiagnosticGroundTruthBaseUrl()).href;
  }

  async function fetchLeaderboardJson(url, label) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}`);
    return response.json();
  }

  async function loadDiagnosticGroundTruthManifest() {
    if (diagnosticGroundTruthManifest) return diagnosticGroundTruthManifest;

    const manifest = await fetchLeaderboardJson(
      diagnosticGroundTruthManifestUrl,
      "diagnostic ground-truth manifest"
    );
    if (!manifest || !Array.isArray(manifest.datasets)) {
      throw new Error("diagnostic ground-truth manifest must contain a datasets array");
    }
    diagnosticGroundTruthManifest = manifest;
    return diagnosticGroundTruthManifest;
  }

  function diagnosticGroundTruthEntry(datasetName) {
    const entries = Array.isArray(diagnosticGroundTruthManifest?.datasets)
      ? diagnosticGroundTruthManifest.datasets
      : [];
    return entries.find((entry) => entry.name === datasetName);
  }

  function validateDiagnosticStationCoverage(datasetName, kind, series, expectedIds) {
    const stationIds = series.map((entry) => entry.stationId).filter(Boolean);
    const uniqueStationIds = new Set(stationIds);
    const missing = expectedIds.filter((stationId) => !uniqueStationIds.has(stationId));
    const unknown = Array.from(uniqueStationIds).filter((stationId) => !expectedIds.includes(stationId));
    const hasDuplicates = uniqueStationIds.size !== stationIds.length;
    const invalidValues = series.some((entry) => !entry.values.length);

    if (missing.length || unknown.length || hasDuplicates || invalidValues) {
      const details = [
        missing.length ? `missing ${missing.join(", ")}` : "",
        unknown.length ? `unknown ${unknown.join(", ")}` : "",
        hasDuplicates ? "duplicate station IDs" : "",
        invalidValues ? "empty value arrays" : "",
      ].filter(Boolean).join("; ");
      throw new Error(`${datasetName} ${kind} ground truth has invalid station coverage (${details})`);
    }
  }

  function validateDiagnosticGroundTruth(datasetName, groundTruth) {
    const expectedCpStationIds = (
      leaderboardDatasetEntry(datasetName)?.diagnostics?.cp_stations || []
    ).map((station) => station.id);
    validateDiagnosticStationCoverage(
      datasetName,
      "Cp",
      groundTruth.diagnostics.cpCuts,
      expectedCpStationIds
    );
    validateDiagnosticStationCoverage(
      datasetName,
      "velocity",
      groundTruth.diagnostics.velocityProfiles,
      velocityGroundTruthStationIds
    );
  }

  async function loadDiagnosticGroundTruth(datasetName) {
    if (diagnosticGroundTruthByDataset.has(datasetName)) {
      return diagnosticGroundTruthByDataset.get(datasetName);
    }
    if (diagnosticGroundTruthLoadPromises.has(datasetName)) {
      return diagnosticGroundTruthLoadPromises.get(datasetName);
    }

    const loadPromise = (async () => {
      await loadDiagnosticGroundTruthManifest();
      const entry = diagnosticGroundTruthEntry(datasetName);
      if (!entry?.file) throw new Error(`no diagnostic ground-truth file is configured for ${datasetName}`);

      const payload = await fetchLeaderboardJson(
        diagnosticGroundTruthFileUrl(entry.file),
        `${datasetName} diagnostic ground truth`
      );
      if (!payload || payload.dataset !== datasetName) {
        throw new Error(`${entry.file} must declare dataset ${datasetName}`);
      }

      const groundTruth = {
        dataset: datasetName,
        status: payload.status || diagnosticGroundTruthManifest.status || "",
        diagnostics: normalizeDiagnostics(payload.diagnostics),
      };
      validateDiagnosticGroundTruth(datasetName, groundTruth);
      diagnosticGroundTruthByDataset.set(datasetName, groundTruth);
      return groundTruth;
    })().catch((error) => {
      diagnosticGroundTruthLoadPromises.delete(datasetName);
      throw error;
    });

    diagnosticGroundTruthLoadPromises.set(datasetName, loadPromise);
    return loadPromise;
  }

  async function ensureDiagnosticGroundTruth(datasetName) {
    try {
      return await loadDiagnosticGroundTruth(datasetName);
    } catch (error) {
      console.warn(`Could not load ${datasetName} diagnostic ground truth:`, error);
      return null;
    }
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

  function metricCatalogDefinitions(group) {
    const definitions = leaderboardManifest?.metric_catalog?.[group];
    return Array.isArray(definitions) ? definitions : [];
  }

  function enabledDatasetMetricDefinitions(datasetName, group) {
    const enabledIds = leaderboardDatasetEntry(datasetName)?.metrics?.[group];
    if (!Array.isArray(enabledIds)) return [];
    const catalog = new Map(metricCatalogDefinitions(group).map((definition) => [definition.id, definition]));
    return enabledIds.map((metricId) => catalog.get(metricId)).filter(Boolean);
  }

  function dimensionalMetricKey(metricId, statistic) {
    return `dimensional:${metricId}:${statistic}`;
  }

  function coefficientMetricKey(metricId) {
    return `coefficient:${metricId}:mae`;
  }

  function unitSuffix(unit) {
    return unit ? ` (${unit})` : "";
  }

  function activeDynamicMetricDefinitions(datasetName = sharedSelection.dataset) {
    const fields = [];
    enabledDatasetMetricDefinitions(datasetName, "dimensional_fields").forEach((definition) => {
      const statistics = Array.isArray(definition.statistics) ? definition.statistics : [];
      statistics.forEach((statistic) => {
        const statisticLabel = statistic.toUpperCase();
        const key = dimensionalMetricKey(definition.id, statistic);
        const weighting = definition.weighting === "face_area" ? "face-area-weighted" : "cell-volume-weighted";
        const metric = {
          key,
          id: definition.id,
          category: "dimensional-field",
          statistic,
          label: `${definition.label} ${statisticLabel}${unitSuffix(definition.unit)}`,
          tableLines: [definition.label, `${statisticLabel}${unitSuffix(definition.unit)}`],
          digits: Number.isInteger(definition.digits) ? definition.digits : 2,
          unit: definition.unit || "",
          scoreKind: "absoluteError",
          direction: "lower",
        };
        metricDefinitions[key] = metric;
        columnHelpDefinitions[key] = {
          title: metric.label,
          description:
            `${statisticLabel} for ${definition.label.toLowerCase()} in dimensional SI units, using ${weighting} ` +
            "errors with equal weighting across evaluated cases. Lower is better.",
          metricsLink: true,
        };
        lowerIsBetterMetrics.add(key);
        fields.push(metric);
      });
    });

    const coefficients = enabledDatasetMetricDefinitions(datasetName, "coefficient_errors").map((definition) => {
      const key = coefficientMetricKey(definition.id);
      const metric = {
        key,
        id: definition.id,
        category: "coefficient-error",
        statistic: definition.statistic || "mae",
        label: `${definition.label} MAE${unitSuffix(definition.unit)}`,
        tableLines: [definition.label, `MAE${unitSuffix(definition.unit)}`],
        digits: Number.isInteger(definition.digits) ? definition.digits : 4,
        unit: definition.unit || "",
        scoreKind: "absoluteError",
        direction: "lower",
      };
      metricDefinitions[key] = metric;
      columnHelpDefinitions[key] = {
        title: metric.label,
        description:
          `Mean absolute difference between predicted and reference ${definition.label} across evaluated cases. ` +
          "Lower is better.",
        metricsLink: true,
      };
      lowerIsBetterMetrics.add(key);
      return metric;
    });

    return { fields, coefficients, all: [...fields, ...coefficients] };
  }

  function normalizedDynamicMetricValues(entry, datasetName) {
    const values = {};
    const dynamic = activeDynamicMetricDefinitions(datasetName);
    dynamic.fields.forEach((definition) => {
      values[definition.key] = parseNumber(
        entry.dimensional_field_errors?.[definition.id]?.[definition.statistic]
      );
    });
    dynamic.coefficients.forEach((definition) => {
      values[definition.key] = parseNumber(entry.absolute_coefficient_errors?.[definition.id]);
    });
    return values;
  }

  function dynamicTableColumns(datasetName = sharedSelection.dataset) {
    const dynamic = activeDynamicMetricDefinitions(datasetName);
    return [
      ...dynamic.fields.map((metric) => ({
        key: metric.key,
        labelLines: metric.tableLines,
        group: "absolute-errors",
        groupStart: metric.statistic === "mae",
      })),
      ...dynamic.coefficients.map((metric) => ({
        key: metric.key,
        labelLines: metric.tableLines,
        group: "absolute-errors",
        groupStart: true,
      })),
    ];
  }

  function activeTableColumns() {
    return [
      ...tableColumnsBeforeDynamic,
      ...dynamicTableColumns(sharedSelection.dataset),
      ...tableColumnsAfterDynamic,
    ];
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

  function datasetsForCurrentState() {
    return leaderboardDatasetEntry(sharedSelection.dataset) ? [sharedSelection.dataset] : [];
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
    await Promise.all([
      ensureDatasetRows(datasetsForCurrentState()),
      ensureDiagnosticGroundTruth(sharedSelection.dataset),
    ]);
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
    renderTableHeader();
    renderTable();
    refreshAllChartPanels();
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

  function chipListCell(label, values, cellClassName, chipClassName) {
    const wrapper = document.createElement("span");
    wrapper.className = "leaderboard-chip-list";
    values.forEach((value) => {
      const chip = document.createElement("span");
      chip.className = chipClassName;
      chip.textContent = value;
      wrapper.appendChild(chip);
    });
    return tableCell(label, wrapper, cellClassName);
  }

  function metricCell(label, row, key, className) {
    const metric = metricDefinitions[key];
    const value = Number(row[key]);
    const td = tableCell(label, Number.isFinite(value) ? formatNumber(value, metric?.digits ?? 2) : "N/A", className);
    const score = metricScore(row, key);

    td.classList.add("leaderboard-metric-cell");
    if (score !== null) {
      td.title = `${metric?.label || label}: ${formatMetricValue(row, key)}; normalized score ${formatNumber(score, 1)} / 100`;
    } else if (Number.isFinite(value)) {
      td.title = `${metric?.label || label}: ${formatMetricValue(row, key)}`;
    }

    return td;
  }

  function currentFilters() {
    return {
      datasets: selectedFilterValue("dataset-filter", sharedSelection.dataset),
      types: checkedFilterValues("type-filter"),
      splits: selectedFilterValue("split-filter", sharedSelection.split),
    };
  }

  function filteredRows() {
    return rankedRows();
  }

  function sortedRows() {
    const rows = filteredRows();
    return rows.sort((a, b) => compareRows(a, b, sortState.key, sortState.direction));
  }

  function clearColumnHelpHideTimer() {
    if (columnHelpHideTimer) window.clearTimeout(columnHelpHideTimer);
    columnHelpHideTimer = null;
  }

  function hideColumnHelp() {
    clearColumnHelpHideTimer();
    if (activeColumnHelpTrigger) activeColumnHelpTrigger.setAttribute("aria-expanded", "false");
    activeColumnHelpTrigger = null;
    if (columnHelpPopover) columnHelpPopover.hidden = true;
  }

  function scheduleColumnHelpHide() {
    clearColumnHelpHideTimer();
    columnHelpHideTimer = window.setTimeout(hideColumnHelp, 160);
  }

  function ensureColumnHelpPopover() {
    if (columnHelpPopover) return columnHelpPopover;

    columnHelpPopover = document.createElement("aside");
    columnHelpPopover.id = "leaderboard-column-help-popover";
    columnHelpPopover.className = "leaderboard-column-help-popover";
    columnHelpPopover.setAttribute("role", "dialog");
    columnHelpPopover.setAttribute("aria-label", "Leaderboard column information");
    columnHelpPopover.hidden = true;
    columnHelpPopover.addEventListener("pointerenter", clearColumnHelpHideTimer);
    columnHelpPopover.addEventListener("pointerleave", scheduleColumnHelpHide);
    columnHelpPopover.addEventListener("focusin", clearColumnHelpHideTimer);
    columnHelpPopover.addEventListener("focusout", scheduleColumnHelpHide);
    document.body.appendChild(columnHelpPopover);
    return columnHelpPopover;
  }

  function positionColumnHelpPopover(trigger) {
    if (!columnHelpPopover || columnHelpPopover.hidden) return;

    const margin = 8;
    const gap = 8;
    const triggerRect = trigger.getBoundingClientRect();
    const popoverRect = columnHelpPopover.getBoundingClientRect();
    let left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
    let top = triggerRect.bottom + gap;

    left = clamp(left, margin, window.innerWidth - popoverRect.width - margin);
    if (top + popoverRect.height > window.innerHeight - margin) {
      top = triggerRect.top - popoverRect.height - gap;
    }
    top = Math.max(margin, top);

    columnHelpPopover.style.left = `${left}px`;
    columnHelpPopover.style.top = `${top}px`;
  }

  function renderColumnHelp(definition) {
    const popover = ensureColumnHelpPopover();
    popover.textContent = "";

    const title = document.createElement("strong");
    title.className = "leaderboard-column-help-title";
    title.textContent = definition.title;
    popover.appendChild(title);

    const description = document.createElement("p");
    description.textContent = definition.description;
    popover.appendChild(description);

    const options = typeof definition.options === "function" ? definition.options() : definition.options;
    if (options?.length) {
      const optionText = document.createElement("p");
      optionText.className = "leaderboard-column-help-options";
      optionText.textContent = `Options: ${uniqueInOrder(options).join(", ")}.`;
      popover.appendChild(optionText);
    }

    if (definition.metricsLink) {
      const link = document.createElement("a");
      link.href = "#metric-definitions";
      link.textContent = "Metric definitions and equations";
      link.addEventListener("click", hideColumnHelp);
      popover.appendChild(link);
    }
  }

  function showColumnHelp(trigger, definition) {
    clearColumnHelpHideTimer();
    if (activeColumnHelpTrigger && activeColumnHelpTrigger !== trigger) {
      activeColumnHelpTrigger.setAttribute("aria-expanded", "false");
    }

    activeColumnHelpTrigger = trigger;
    trigger.setAttribute("aria-expanded", "true");
    renderColumnHelp(definition);
    columnHelpPopover.hidden = false;
    window.requestAnimationFrame(() => positionColumnHelpPopover(trigger));
  }

  function configureColumnHelp() {
    ensureColumnHelpPopover();

    document.querySelectorAll(".leaderboard-table th").forEach((th) => {
      const key = th.dataset.columnHelp || th.dataset.sort;
      const definition = columnHelpDefinitions[key];
      if (!definition || th.querySelector(".leaderboard-column-help-trigger")) return;

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "leaderboard-column-help-trigger";
      trigger.setAttribute("aria-label", `About ${definition.title}`);
      trigger.setAttribute("aria-controls", "leaderboard-column-help-popover");
      trigger.setAttribute("aria-expanded", "false");

      const icon = document.createElement("i");
      icon.className = "fa-solid fa-circle-info";
      icon.setAttribute("aria-hidden", "true");
      trigger.appendChild(icon);
      th.appendChild(trigger);

      trigger.addEventListener("pointerenter", () => showColumnHelp(trigger, definition));
      trigger.addEventListener("pointerleave", scheduleColumnHelpHide);
      trigger.addEventListener("focus", () => showColumnHelp(trigger, definition));
      trigger.addEventListener("blur", scheduleColumnHelpHide);
      trigger.addEventListener("click", (event) => {
        event.stopPropagation();
        showColumnHelp(trigger, definition);
      });
      trigger.addEventListener("keydown", (event) => {
        event.stopPropagation();
        if (event.key === "Escape") {
          event.preventDefault();
          hideColumnHelp();
        }
      });
    });

    if (columnHelpGlobalEventsConfigured) return;
    columnHelpGlobalEventsConfigured = true;

    document.addEventListener("pointerdown", (event) => {
      if (event.target instanceof Element && event.target.closest(".leaderboard-column-help-trigger, .leaderboard-column-help-popover")) {
        return;
      }
      hideColumnHelp();
    });
    window.addEventListener("resize", hideColumnHelp);
    window.addEventListener("scroll", hideColumnHelp, true);
  }

  function appendTableHeaderLabel(th, column) {
    if (column.labelLines) {
      column.labelLines.forEach((line, index) => {
        if (index > 0) th.appendChild(document.createElement("br"));
        th.appendChild(document.createTextNode(line));
      });
      return;
    }

    if (column.html) {
      th.innerHTML = column.label;
    } else {
      th.textContent = column.label;
    }
  }

  function renderTableHeader() {
    const headerRow = document.getElementById("leaderboard-header-row");
    if (!headerRow) return;
    hideColumnHelp();
    activeColumnHelpTrigger = null;

    const columns = activeTableColumns();
    const sortableKeys = new Set(columns.filter((column) => column.sortable !== false).map((column) => column.key));
    if (!sortableKeys.has(sortState.key)) sortState = { key: rankMetricKey, direction: "desc" };

    headerRow.textContent = "";
    columns.forEach((column) => {
      const th = document.createElement("th");
      if (column.groupStart) th.classList.add("leaderboard-group-start");
      if (column.group) th.dataset.columnGroup = column.group;
      if (column.sortable === false) {
        th.dataset.columnHelp = column.key;
      } else {
        th.dataset.sort = column.key;
      }
      appendTableHeaderLabel(th, column);
      headerRow.appendChild(th);
    });

    configureSort();
    configureColumnHelp();
    updateSortIndicators();
    applyColumnVisibility();
  }

  function updateSortIndicators() {
    document.querySelectorAll(".leaderboard-table th[data-sort]").forEach((th) => {
      const key = th.getAttribute("data-sort");
      const isActive = key === sortState.key;
      th.classList.toggle("sort-asc", isActive && sortState.direction === "asc");
      th.classList.toggle("sort-desc", isActive && sortState.direction === "desc");
      th.setAttribute("aria-sort", isActive ? (sortState.direction === "asc" ? "ascending" : "descending") : "none");
      th.setAttribute("aria-label", isActive
        ? `Sorted ${sortState.direction === "asc" ? "ascending" : "descending"}; click to reverse`
        : `Sort by ${th.textContent.replace(/\s+/g, " ").trim()}`);
    });
  }

  function renderTable() {
    const tbody = document.getElementById("leaderboard-body");
    if (!tbody) return;
    updateSortIndicators();
    tbody.textContent = "";

    const columns = activeTableColumns();
    sortedRows().forEach((row) => {
      const tr = document.createElement("tr");

      const rank = document.createElement("span");
      rank.className = "leaderboard-rank";
      rank.textContent = row.rank;
      tr.appendChild(tableCell("Rank", rank));

      tr.appendChild(tableCell("Model", row.model, "leaderboard-model"));
      tr.appendChild(tableCell("Submitted by", row.submittedBy, "leaderboard-submitter"));
      tr.appendChild(chipListCell("Type", row.modelTypes?.length ? row.modelTypes : [row.type], "leaderboard-type-cell", "leaderboard-type"));
      tr.appendChild(chipCell("Training", row.trainingRegimeLabel, "leaderboard-training-cell", "leaderboard-training"));
      tr.appendChild(chipCell("Dataset", row.dataset, "leaderboard-dataset-cell leaderboard-group-start", "leaderboard-dataset"));
      tr.appendChild(chipCell("Split", row.split, "leaderboard-split-cell", "leaderboard-split"));
      tr.appendChild(metricCell("Overall score", row, "score", "leaderboard-score leaderboard-group-start"));
      tr.appendChild(metricCell("Field score", row, "fieldScore", "leaderboard-component-score leaderboard-group-start"));
      tr.appendChild(metricCell("Force score", row, "forceScore", "leaderboard-component-score leaderboard-group-start"));
      tr.appendChild(metricCell("Diagnostic score", row, "diagnosticScore", "leaderboard-component-score leaderboard-group-start"));
      tr.appendChild(metricCell("Surface pressure rel L2 (%)", row, "surfacePressure", "leaderboard-group-start"));
      tr.appendChild(metricCell("Surface pressure rel L1 (%)", row, "surfacePressureL1"));
      tr.appendChild(metricCell("Surface tau wall rel L2 (%)", row, "surfaceTau", "leaderboard-group-start"));
      tr.appendChild(metricCell("Surface tau wall rel L1 (%)", row, "surfaceTauL1"));
      tr.appendChild(metricCell("Volume velocity rel L2 (%)", row, "volumeVelocity", "leaderboard-group-start"));
      tr.appendChild(metricCell("Volume velocity rel L1 (%)", row, "volumeVelocityL1"));
      tr.appendChild(metricCell("Volume pressure rel L2 (%)", row, "volumePressure", "leaderboard-group-start"));
      tr.appendChild(metricCell("Volume pressure rel L1 (%)", row, "volumePressureL1"));

      const dynamicMetrics = activeDynamicMetricDefinitions(row.dataset);
      dynamicMetrics.fields.forEach((metric) => {
        tr.appendChild(metricCell(
          metric.label,
          row,
          metric.key,
          metric.statistic === "mae" ? "leaderboard-group-start" : ""
        ));
      });
      dynamicMetrics.coefficients.forEach((metric) => {
        tr.appendChild(metricCell(metric.label, row, metric.key, "leaderboard-group-start"));
      });

      tr.appendChild(metricCell("Cd R2", row, "r2Cd", "leaderboard-group-start"));
      tr.appendChild(metricCell("Cl R2", row, "r2Cl"));
      tr.appendChild(metricCell("Velocity profiles R2", row, "velocityProfileR2", "leaderboard-group-start"));
      tr.appendChild(metricCell("Cp cuts R2", row, "cpCutR2"));
      tr.appendChild(tableCell("Params (M)", formatNumber(row.params, 2), "leaderboard-group-start"));
      tr.appendChild(tableCell("Submission date", row.date));

      const details = document.createElement("button");
      details.className = "leaderboard-detail-button";
      details.type = "button";
      details.textContent = "Details";
      details.addEventListener("click", () => openDetailsDialog(row));
      tr.appendChild(tableCell("Details", details, "leaderboard-group-start"));

      Array.from(tr.children).forEach((cell, index) => {
        const columnGroup = columns[index]?.group;
        if (columnGroup) cell.dataset.columnGroup = columnGroup;
      });

      tbody.appendChild(tr);
    });
    applyColumnVisibility();
  }

  function configureSort() {
    document.querySelectorAll(".leaderboard-table th[data-sort]").forEach((th) => {
      const sortColumn = (event) => {
        if (event?.target instanceof Element && event.target.closest(".leaderboard-column-help-trigger")) return;
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
        if (event.target !== th) return;
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        sortColumn();
      });
    });
  }

  function configureFilters() {
    configureLinkedSingleFilter("dataset-filter", "dataset");
    configureLinkedSingleFilter("split-filter", "split");
    configureFilterGroup("type-filter");
    syncLinkedSelectionControls();
    document.addEventListener("click", (event) => {
      const activeDropdown = event.target instanceof Element ? event.target.closest(".leaderboard-filter-dropdown") : null;
      closeFilterDropdowns(activeDropdown);
    });
  }

  function defaultColumnVisibility() {
    return Object.fromEntries(columnGroups.map((group) => [group, true]));
  }

  function loadColumnVisibility() {
    const defaults = defaultColumnVisibility();
    try {
      const saved = JSON.parse(window.localStorage.getItem(columnVisibilityStorageKey));
      if (!saved || typeof saved !== "object") return defaults;
      columnGroups.forEach((group) => {
        if (typeof saved[group] === "boolean") defaults[group] = saved[group];
      });
    } catch (_error) {
      return defaults;
    }
    return defaults;
  }

  function saveColumnVisibility() {
    try {
      window.localStorage.setItem(columnVisibilityStorageKey, JSON.stringify(columnVisibility));
    } catch (_error) {
      // The controls still work when browser storage is disabled.
    }
  }

  function updateColumnControls() {
    const controls = document.getElementById("leaderboard-column-controls");
    if (!controls) return;

    controls.querySelectorAll("[data-column-group-toggle]").forEach((button) => {
      const isVisible = columnVisibility[button.dataset.columnGroupToggle] !== false;
      button.classList.toggle("is-active", isVisible);
      button.setAttribute("aria-pressed", String(isVisible));
    });
  }

  function applyColumnVisibility() {
    document.querySelectorAll(".leaderboard-table [data-column-group]").forEach((element) => {
      const group = element.dataset.columnGroup;
      element.classList.toggle("leaderboard-column-hidden", columnVisibility[group] === false);
    });
    const hasHiddenColumns = columnGroups.some((group) => columnVisibility[group] === false);
    document.querySelector(".leaderboard-table")?.classList.toggle("leaderboard-columns-reduced", hasHiddenColumns);
    updateColumnControls();
  }

  function resetHiddenSort() {
    const sortedColumn = activeTableColumns().find((column) => column.key === sortState.key);
    if (sortedColumn?.group && columnVisibility[sortedColumn.group] === false) {
      sortState = { key: rankMetricKey, direction: "desc" };
    }
  }

  function refreshColumnVisibility() {
    saveColumnVisibility();
    resetHiddenSort();
    renderTable();
    updateComparisonChart();
    updateScatterChart();
  }

  function configureColumnControls() {
    const controls = document.getElementById("leaderboard-column-controls");
    if (!controls) return;

    controls.addEventListener("click", (event) => {
      const button = event.target instanceof Element ? event.target.closest("[data-column-group-toggle]") : null;
      if (!button) return;
      const group = button.dataset.columnGroupToggle;
      columnVisibility[group] = columnVisibility[group] === false;
      refreshColumnVisibility();
    });
    applyColumnVisibility();
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

  function selectedFilterValue(containerId, fallback) {
    const value = selectedRadioValue(containerId, fallback);
    return {
      all: false,
      values: new Set([value]),
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

  function availableSplitsForDataset(dataset) {
    return knownSplitOptions().filter((option) => option.datasets.length === 0 || option.datasets.includes(dataset));
  }

  function validSplitForDataset(dataset, requestedSplit) {
    const options = availableSplitsForDataset(dataset);
    const normalizedRequested = normalizeSplit(requestedSplit, dataset);
    if (options.some((option) => option.value === normalizedRequested)) return normalizedRequested;
    if (options.some((option) => option.value === fullSplit)) return fullSplit;
    if (options.some((option) => option.value === defaultSplit)) return defaultSplit;
    return options[0]?.value || normalizedRequested || defaultSplit;
  }

  function setRadioFilterValue(containerId, value) {
    const inputs = Array.from(document.querySelectorAll(`#${containerId} input[type="radio"]`));
    const selected = inputs.find((input) => input.value === value && !input.disabled);
    if (selected) selected.checked = true;
    updateSingleFilterSummary(containerId);
  }

  function syncSplitRadioOptions(containerId, dataset, split) {
    const splitContainer = document.getElementById(containerId);
    if (!splitContainer) return;

    splitContainer.querySelectorAll("[data-split-datasets]").forEach((label) => {
      const datasets = (label.dataset.splitDatasets || "").split(/\s+/).filter(Boolean);
      const visible = datasets.includes(dataset);
      const input = label.querySelector('input[type="radio"]');

      label.hidden = !visible;
      if (input) {
        input.disabled = !visible;
        if (!visible) input.checked = false;
      }
    });

    setRadioFilterValue(containerId, split);
    updateSingleFilterSummary(containerId);
  }

  function syncLinkedSelectionControls() {
    const dataset = normalizeDatasetSelection(sharedSelection.dataset);
    const split = validSplitForDataset(dataset, sharedSelection.split);
    sharedSelection.dataset = dataset;
    sharedSelection.split = split;

    Object.values(chartSelections).forEach((selection) => {
      selection.dataset = dataset;
      selection.split = split;
    });
    Object.values(chartScopeSelections).forEach((selection) => {
      selection.dataset = dataset;
      selection.split = split;
    });

    ["dataset-filter", "cp-dataset-filter", "velocity-dataset-filter"].forEach((containerId) => {
      setRadioFilterValue(containerId, dataset);
    });
    ["split-filter", "cp-split-filter", "velocity-split-filter"].forEach((containerId) => {
      syncSplitRadioOptions(containerId, dataset, split);
    });
    ["comparison", "scatter"].forEach((scope) => {
      populateChartScopeDatasetSelect(scope);
      syncChartScopeSplitSelect(scope);
    });
    syncScatterAxisControls();
  }

  function setLinkedSelection(dataset, split) {
    sharedSelection.dataset = normalizeDatasetSelection(dataset);
    sharedSelection.split = validSplitForDataset(sharedSelection.dataset, split);
    syncLinkedSelectionControls();
    void refreshLeaderboardForCurrentState();
  }

  function configureLinkedSingleFilter(containerId, key) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (container.dataset.linkedFilterConfigured === "true") return;
    container.dataset.linkedFilterConfigured = "true";

    configureDropdownShell(container);
    updateSingleFilterSummary(containerId);

    container.addEventListener("change", (event) => {
      if (!(event.target instanceof HTMLInputElement) || event.target.type !== "radio") return;
      const dataset = key === "dataset" ? event.target.value : sharedSelection.dataset;
      const split = key === "split" ? event.target.value : sharedSelection.split;
      setLinkedSelection(dataset, split);
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

  function cpSeries(modelId, stationId) {
    const row = submissions.find((entry) => entry.id === modelId);
    return diagnosticCpSeries(row, stationId);
  }

  function velocitySeries(modelId) {
    const row = submissions.find((entry) => entry.id === modelId);
    return diagnosticVelocitySeries(row, activeStation);
  }

  function diagnosticGroundTruth(datasetName) {
    return diagnosticGroundTruthByDataset.get(datasetName) || null;
  }

  function cpGroundTruthSeries(datasetName, stationId) {
    return diagnosticCpSeries(diagnosticGroundTruth(datasetName), stationId);
  }

  function velocityGroundTruthProfile(datasetName) {
    return matchingVelocityProfile(diagnosticGroundTruth(datasetName), activeStation);
  }

  function velocityGroundTruthSeries(datasetName) {
    return diagnosticVelocitySeries(diagnosticGroundTruth(datasetName), activeStation);
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

  function groundTruthLineDataset(data) {
    const dataset = lineDataset("Ground truth", data, chartTextColor(), false);
    dataset.borderWidth = 3;
    dataset.pointRadius = 0;
    return dataset;
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

    const currentValue = normalizeDatasetSelection(chartScopeSelections[scope]?.dataset);
    select.textContent = "";

    knownDatasetNames().forEach((datasetName) => {
      const option = document.createElement("option");
      option.value = datasetName;
      option.textContent = datasetName;
      select.appendChild(option);
    });

    select.value = Array.from(select.options).some((option) => option.value === currentValue)
      ? currentValue
      : sharedSelection.dataset;
    if (!select.value && select.options.length) select.value = select.options[0].value;
    chartScopeSelections[scope].dataset = select.value;
  }

  function syncChartScopeSplitSelect(scope) {
    const select = chartScopeSplitSelect(scope);
    if (!select) return;

    const selection = chartScopeSelections[scope];
    const selectedDataset = normalizeDatasetSelection(selection?.dataset);
    if (selection) selection.dataset = selectedDataset;
    const currentValue = validSplitForDataset(selectedDataset, selection?.split);
    select.textContent = "";

    availableSplitsForDataset(selectedDataset)
      .forEach((splitOption) => {
        const option = document.createElement("option");
        option.value = splitOption.value;
        option.textContent = splitOption.label;
        select.appendChild(option);
      });

    select.value = Array.from(select.options).some((option) => option.value === currentValue)
      ? currentValue
      : sharedSelection.split;
    if (!select.value && select.options.length) select.value = select.options[0].value;
    chartScopeSelections[scope].split = select.value;
  }

  function configureChartScopeControls(scope) {
    const datasetSelect = chartScopeDatasetSelect(scope);
    const splitSelect = chartScopeSplitSelect(scope);
    if (!datasetSelect || !splitSelect || !chartScopeSelections[scope]) return;

    populateChartScopeDatasetSelect(scope);
    syncChartScopeSplitSelect(scope);

    datasetSelect.addEventListener("change", () => {
      setLinkedSelection(datasetSelect.value, sharedSelection.split);
    });

    splitSelect.addEventListener("change", () => {
      setLinkedSelection(sharedSelection.dataset, splitSelect.value);
    });
  }

  function comparisonMetricGroup() {
    const selected = document.getElementById("comparison-metric-group")?.value || "summary";
    return (comparisonMetricGroups[selected] || dynamicComparisonGroups.has(selected)) ? selected : "summary";
  }

  function comparisonMetricKeys(group) {
    if (group === "dimensional-mae") {
      return activeDynamicMetricDefinitions().fields
        .filter((metric) => metric.statistic === "mae")
        .map((metric) => metric.key);
    }
    if (group === "dimensional-rmse") {
      return activeDynamicMetricDefinitions().fields
        .filter((metric) => metric.statistic === "rmse")
        .map((metric) => metric.key);
    }
    if (group === "coefficient-mae") {
      return activeDynamicMetricDefinitions().coefficients.map((metric) => metric.key);
    }
    return comparisonMetricGroups[group] || comparisonMetricGroups.summary;
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
    if (group === "dimensional-mae") return "Dimensional MAE - lower is better";
    if (group === "dimensional-rmse") return "Dimensional RMSE - lower is better";
    if (group === "coefficient-mae") return "Coefficient MAE - lower is better";
    return "Score (points) - higher is better";
  }

  function comparisonMetricValue(row, metricKey) {
    const value = Number(row[metricKey]);
    const digits = metricDefinitions[metricKey]?.digits ?? 3;
    return Number.isFinite(value) ? Number(value.toFixed(digits)) : null;
  }

  function comparisonMetricUnits(metricKeys) {
    return uniqueInOrder(metricKeys.map((key) => metricDefinitions[key]?.unit || "").filter(Boolean));
  }

  function comparisonMetricAxisId(metricKey, metricKeys, group) {
    if (!group.startsWith("dimensional-")) return "y";
    const units = comparisonMetricUnits(metricKeys);
    return units.indexOf(metricDefinitions[metricKey]?.unit || "") > 0 ? "y1" : "y";
  }

  function comparisonDatasets(metricKeys, rows, group) {
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
        yAxisID: comparisonMetricAxisId(metricKey, metricKeys, group),
      };
    });
  }

  const comparisonValueLabelPlugin = {
    id: "comparisonValueLabels",
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
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
          const y = Math.max(12, bar.y - 6);
          ctx.fillText(label, bar.x, y);
        });
      });

      ctx.restore();
    },
  };

  function comparisonChartOptions() {
    const options = baseChartOptions("Normalized score (higher is better)", "Submission");
    options.interaction = { mode: "index", intersect: false };
    options.layout = { padding: { top: 30 } };
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
    const metricKeys = comparisonMetricKeys(group);
    comparisonChartRowsCache = rows;
    comparisonChart.data.labels = rows.map(comparisonRowLabel);
    comparisonChart.data.datasets = comparisonDatasets(metricKeys, rows, group);

    const yScale = comparisonChart.options.scales.y;
    const units = comparisonMetricUnits(metricKeys);
    yScale.position = "left";
    yScale.title.text = units[0]
      ? `${group === "dimensional-rmse" ? "RMSE" : "MAE"} (${units[0]}) - lower is better`
      : comparisonAxisTitle(group);
    yScale.min = 0;
    if (group === "r2") yScale.max = 1;
    else if (group === "summary") yScale.max = 100;
    else delete yScale.max;

    delete comparisonChart.options.scales.y1;
    if (units.length > 1) {
      comparisonChart.options.scales.y1 = {
        type: "linear",
        position: "right",
        min: 0,
        title: {
          display: true,
          text: `${group === "dimensional-rmse" ? "RMSE" : "MAE"} (${units[1]}) - lower is better`,
          color: chartTextColor(),
        },
        ticks: { color: chartTextColor() },
        grid: { drawOnChartArea: false, color: gridColor() },
      };
    }
    comparisonChart.update();
  }

  function configureComparisonControls() {
    configureChartScopeControls("comparison");
    ["comparison-metric-group", "comparison-row-count"].forEach((id) => {
      document.getElementById(id)?.addEventListener("change", updateComparisonChart);
    });
  }

  function scatterAxisDefinition(key) {
    const definitions = activeScatterAxisDefinitions();
    return definitions.find((axis) => axis.key === key) || definitions[0];
  }

  function activeScatterAxisDefinitions() {
    const dynamicAxes = activeDynamicMetricDefinitions().all.map((metric) => ({
      key: metric.key,
      label: metric.label,
      digits: metric.digits,
      unit: metric.unit,
      direction: metric.direction,
    }));
    return [...scatterAxisDefinitions, ...dynamicAxes];
  }

  function populateScatterAxisSelect(select, defaultKey) {
    if (!select) return;
    const requestedKey = select.value || defaultKey;
    const definitions = activeScatterAxisDefinitions();
    select.textContent = "";
    definitions.forEach((axis) => {
      const option = document.createElement("option");
      option.value = axis.key;
      option.textContent = axis.label;
      select.appendChild(option);
    });
    select.value = definitions.some((axis) => axis.key === requestedKey) ? requestedKey : defaultKey;
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
    const formatted = formatNumber(value, axis.digits ?? 2);
    if (!axis.unit) return formatted;
    return `${formatted}${axis.unit === "%" ? "" : " "}${axis.unit}`;
  }

  function scatterTickLabel(key, value) {
    const axis = scatterAxisDefinition(key);
    if (axis.kind === "date") return formatDateValue(Number(value));
    if (!Number.isFinite(Number(value))) return value;
    return formatNumber(Number(value), axis.digits ?? 2);
  }

  function scatterAxisTitle(axis) {
    if (axis.direction === "lower") return `${axis.label} - lower is better`;
    if (axis.direction === "higher") return `${axis.label} - higher is better`;
    return axis.label;
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
    scatterChart.options.scales.x.title.text = scatterAxisTitle(xAxis);
    scatterChart.options.scales.x.ticks.callback = (value) => scatterTickLabel(xKey, value);
    scatterChart.options.scales.y.title.text = scatterAxisTitle(yAxis);
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

  function syncScatterAxisControls() {
    populateScatterAxisSelect(document.getElementById("scatter-x-axis"), "params");
    populateScatterAxisSelect(document.getElementById("scatter-y-axis"), "score");
  }

  function chartRows(chartType) {
    const selection = chartSelections[chartType];
    return enrichedRows()
      .filter((row) => row.dataset === selection.dataset && row.split === selection.split)
      .sort((a, b) => compareRows(a, b, rankMetricKey, defaultSortDirection(rankMetricKey)));
  }

  function cpStationDefinitions(datasetName = chartSelections.cp.dataset) {
    const stations = leaderboardDatasetEntry(datasetName)?.diagnostics?.cp_stations;
    return Array.isArray(stations) ? stations : [];
  }

  function currentCpStationDefinition() {
    const datasetName = chartSelections.cp.dataset;
    const definitions = cpStationDefinitions(datasetName);
    const requestedId = cpStationSelections.get(datasetName);
    const definition = definitions.find((station) => station.id === requestedId) || definitions[0] || null;
    if (definition) cpStationSelections.set(datasetName, definition.id);
    return definition;
  }

  function syncCpStationControl() {
    const select = document.getElementById("cp-station-select");
    if (!select) return;

    const definitions = cpStationDefinitions();
    const activeDefinition = currentCpStationDefinition();
    select.textContent = "";
    definitions.forEach((station) => {
      const option = document.createElement("option");
      option.value = station.id;
      option.textContent = station.label || station.id;
      select.appendChild(option);
    });
    select.disabled = definitions.length === 0;
    if (activeDefinition) {
      select.value = activeDefinition.id;
      select.title = activeDefinition.description || activeDefinition.label || activeDefinition.id;
    } else {
      select.removeAttribute("title");
    }
  }

  function updateCpChart() {
    if (!cpChart) return;
    const profile = chartProfile("cp");
    const station = currentCpStationDefinition();
    const models = checkedModels("cp-models");
    const groundTruth = cpGroundTruthSeries(chartSelections.cp.dataset, station?.id);
    cpChart.data.labels = [];
    const predictionDatasets = models
      .map((modelId, index) => {
        const row = submissions.find((entry) => entry.id === modelId);
        const series = cpSeries(modelId, station?.id);
        return series ? lineDataset(row?.model || modelId, series, modelColor(modelId, index), true) : null;
      })
      .filter(Boolean);
    cpChart.data.datasets = [
      ...(groundTruth ? [groundTruthLineDataset(groundTruth)] : []),
      ...predictionDatasets,
    ];
    cpChart.options.scales.x.type = "linear";
    cpChart.options.scales.x.title.text = station?.x_label || profile.cpXTitle;
    cpChart.update();
  }

  function updateVelocityChart() {
    if (!velocityChart) return;
    const profile = chartProfile("velocity");
    const groundTruthProfile = velocityGroundTruthProfile(chartSelections.velocity.dataset);
    const groundTruth = velocityGroundTruthSeries(chartSelections.velocity.dataset);
    const models = checkedModels("velocity-models");
    setText("velocity-station-label", groundTruthProfile?.stationLabel || activeStation);
    velocityChart.data.labels = [];
    const predictionDatasets = models
      .map((modelId, index) => {
        const row = submissions.find((entry) => entry.id === modelId);
        const series = velocitySeries(modelId);
        return series ? lineDataset(row?.model || modelId, series, modelColor(modelId, index), true) : null;
      })
      .filter(Boolean);
    velocityChart.data.datasets = [
      ...(groundTruth ? [groundTruthLineDataset(groundTruth)] : []),
      ...predictionDatasets,
    ];
    velocityChart.options.scales.x.type = "linear";
    velocityChart.options.scales.x.title.text = groundTruthProfile?.xLabel || profile.velocityXTitle || "z/H";
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
      syncCpStationControl();
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
    syncLinkedSelectionControls();
    updateComparisonChart();
    updateScatterChart();
    syncChartPanel("cp");
    syncChartPanel("velocity");
  }

  function configureChartControls() {
    ["cp", "velocity"].forEach((chartType) => {
      configureLinkedSingleFilter(`${chartType}-dataset-filter`, "dataset");
      configureLinkedSingleFilter(`${chartType}-split-filter`, "split");
      configureChartModelFilter(`${chartType}-models-filter`, `${chartType}-models`, chartType);
    });
    document.getElementById("cp-station-select")?.addEventListener("change", (event) => {
      cpStationSelections.set(chartSelections.cp.dataset, event.target.value);
      syncCpStationControl();
      updateCpChart();
    });
    syncLinkedSelectionControls();
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
    appendDetailField(details, "Model types", modelTypesLabel(row));
    appendDetailField(details, "Training regime", row.trainingRegimeLabel);
    appendDetailField(details, "Target data used", row.targetDataLabel);
    appendDetailField(details, "External pretraining", row.externalPretraining ? "Yes" : "No");
    appendDetailField(details, "Pretraining data", pretrainingDataLabel(row));
    appendDetailField(details, "Dataset", row.dataset);
    appendDetailField(details, "Split", row.split);
    appendDetailField(details, "Field score (50%)", formatNumber(row.fieldScore, 1));
    appendDetailField(details, "Force score (25%)", formatNumber(row.forceScore, 1));
    appendDetailField(details, "Diagnostic score (25%)", formatNumber(row.diagnosticScore, 1));
    appendDetailField(details, "Overall score", formatNumber(row.score, 1));
    activeDynamicMetricDefinitions(row.dataset).all.forEach((metric) => {
      appendDetailField(details, metric.label, formatMetricValue(row, metric.key));
    });
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
    renderTableHeader();
    configureFilters();
    configureColumnControls();
    configureDetailsDialog();
    await loadApprovedSubmissions();
    renderApprovedSubmissionStatus();
    renderTableHeader();
    renderTable();
    configureCharts();
  }

  window.addEventListener("load", initLeaderboard);
})();

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

  const exampleSubmissions = [
    {
      id: "ab-upt",
      model: "AB-UPT",
      type: "Transformer",
      dataset: "AhmedML",
      surfacePressure: 3.0,
      surfaceTau: 3.88,
      volumeVelocity: 1.88,
      volumePressure: 1.98,
      r2Cd: 0.993,
      r2Cl: 0.987,
      params: 8.75,
      date: "2025-06-13",
      velocityProfileR2: 0.982,
      cpCutR2: 0.976,
      href: "#details-ab-upt",
      note: "Reported AhmedML L2 metrics from AB-UPT v2; L1, force, and profile R2 values are example placeholders.",
    },
    {
      id: "transformer",
      model: "Transformer",
      type: "Transformer",
      dataset: "AhmedML",
      surfacePressure: 3.41,
      surfaceTau: 4.03,
      volumeVelocity: 2.09,
      volumePressure: 2.16,
      r2Cd: 0.985,
      r2Cl: 0.971,
      params: 5.49,
      date: "2025-06-13",
      velocityProfileR2: 0.969,
      cpCutR2: 0.961,
      href: "#details-transformer",
      note: "Baseline L2 metrics from AB-UPT v2 appendix; L1 and diagnostic R2 values are illustrative.",
    },
    {
      id: "transolver",
      model: "Transolver",
      type: "Transformer",
      dataset: "AhmedML",
      surfacePressure: 3.66,
      surfaceTau: 4.0,
      volumeVelocity: 2.19,
      volumePressure: 2.16,
      r2Cd: 0.981,
      r2Cl: 0.965,
      params: 5.49,
      date: "2025-06-13",
      velocityProfileR2: 0.963,
      cpCutR2: 0.954,
      href: "#details-transolver",
      note: "Baseline L2 metrics from AB-UPT v2 appendix; L1 and diagnostic R2 values are illustrative.",
    },
    {
      id: "oformer",
      model: "OFormer",
      type: "Transformer",
      dataset: "AhmedML",
      surfacePressure: 3.55,
      surfaceTau: 4.1,
      volumeVelocity: 2.21,
      volumePressure: 2.27,
      r2Cd: 0.979,
      r2Cl: 0.962,
      params: 6.1,
      date: "2025-06-13",
      velocityProfileR2: 0.958,
      cpCutR2: 0.952,
      href: "#details-oformer",
      note: "Baseline L2 metrics from AB-UPT v2 appendix; L1 and diagnostic R2 values are illustrative.",
    },
    {
      id: "upt",
      model: "UPT",
      type: "Transformer",
      dataset: "AhmedML",
      surfacePressure: 3.9,
      surfaceTau: 5.52,
      volumeVelocity: 2.62,
      volumePressure: 3.01,
      r2Cd: 0.968,
      r2Cl: 0.948,
      params: 10.98,
      date: "2025-06-13",
      velocityProfileR2: 0.941,
      cpCutR2: 0.934,
      href: "#details-upt",
      note: "Baseline L2 metrics from AB-UPT v2 appendix; L1 and diagnostic R2 values are illustrative.",
    },
    {
      id: "graph-u-net",
      model: "Graph U-Net",
      type: "GNN",
      dataset: "AhmedML",
      surfacePressure: 6.42,
      surfaceTau: 7.21,
      volumeVelocity: 4.14,
      volumePressure: 5.17,
      r2Cd: 0.93,
      r2Cl: 0.902,
      params: 14.11,
      date: "2025-06-13",
      velocityProfileR2: 0.884,
      cpCutR2: 0.891,
      href: "#details-graph-u-net",
      note: "Baseline L2 metrics from AB-UPT v2 appendix; L1 and diagnostic R2 values are illustrative.",
    },
    {
      id: "pointnet",
      model: "PointNet",
      type: "Point cloud",
      dataset: "AhmedML",
      surfacePressure: 8.51,
      surfaceTau: 10.07,
      volumeVelocity: 5.43,
      volumePressure: 6.12,
      r2Cd: 0.889,
      r2Cl: 0.852,
      params: 3.6,
      date: "2025-06-13",
      velocityProfileR2: 0.831,
      cpCutR2: 0.846,
      href: "#details-pointnet",
      note: "Baseline L2 metrics from AB-UPT v2 appendix; L1 and diagnostic R2 values are illustrative.",
    },
    {
      id: "gino",
      model: "GINO",
      type: "Neural operator",
      dataset: "AhmedML",
      surfacePressure: 7.9,
      surfaceTau: 8.18,
      volumeVelocity: 6.23,
      volumePressure: 8.1,
      r2Cd: 0.874,
      r2Cl: 0.841,
      params: 15.6,
      date: "2025-06-13",
      velocityProfileR2: 0.812,
      cpCutR2: 0.825,
      href: "#details-gino",
      note: "Baseline L2 metrics from AB-UPT v2 appendix; L1 and diagnostic R2 values are illustrative.",
    },
    {
      id: "lno",
      model: "LNO",
      type: "Neural operator",
      dataset: "AhmedML",
      surfacePressure: 12.91,
      surfaceTau: 11.44,
      volumeVelocity: 7.56,
      volumePressure: 8.47,
      r2Cd: 0.829,
      r2Cl: 0.792,
      params: 6.3,
      date: "2025-06-13",
      velocityProfileR2: 0.778,
      cpCutR2: 0.764,
      href: "#details-lno",
      note: "Baseline L2 metrics from AB-UPT v2 appendix; L1 and diagnostic R2 values are illustrative.",
    },
    {
      id: "drivaerml-ab-upt",
      model: "AB-UPT",
      type: "Transformer",
      dataset: "DrivAerML",
      surfacePressure: 3.82,
      surfaceTau: 7.29,
      volumeVelocity: 5.93,
      volumePressure: 6.08,
      r2Cd: 0.991,
      r2Cl: 0.984,
      params: 8.75,
      date: "2025-06-13",
      velocityProfileR2: 0.97,
      cpCutR2: 0.968,
      href: "#details-drivaerml-ab-upt",
      note: "Reported DrivAerML L2 metrics from AB-UPT v2 Table 7; L1, force, and profile R2 values are example placeholders.",
    },
    {
      id: "drivaerml-transformer",
      model: "Transformer",
      type: "Transformer",
      dataset: "DrivAerML",
      surfacePressure: 4.35,
      surfaceTau: 8.26,
      volumeVelocity: 6.21,
      volumePressure: 6.27,
      r2Cd: 0.975,
      r2Cl: 0.959,
      params: 5.49,
      date: "2025-06-13",
      velocityProfileR2: 0.94,
      cpCutR2: 0.938,
      href: "#details-drivaerml-transformer",
      note: "Baseline DrivAerML L2 metrics from AB-UPT v2 Table 7; L1 and diagnostic R2 values are illustrative.",
    },
    {
      id: "drivaerml-transolver",
      model: "Transolver",
      type: "Transformer",
      dataset: "DrivAerML",
      surfacePressure: 4.81,
      surfaceTau: 8.95,
      volumeVelocity: 6.78,
      volumePressure: 7.74,
      r2Cd: 0.971,
      r2Cl: 0.955,
      params: 5.49,
      date: "2025-06-13",
      velocityProfileR2: 0.935,
      cpCutR2: 0.932,
      href: "#details-drivaerml-transolver",
      note: "Baseline DrivAerML L2 metrics from AB-UPT v2 Table 7; L1 and diagnostic R2 values are illustrative.",
    },
    {
      id: "drivaerml-oformer",
      model: "OFormer",
      type: "Transformer",
      dataset: "DrivAerML",
      surfacePressure: 4.48,
      surfaceTau: 8.92,
      volumeVelocity: 6.64,
      volumePressure: 7.1,
      r2Cd: 0.973,
      r2Cl: 0.958,
      params: 6.1,
      date: "2025-06-13",
      velocityProfileR2: 0.938,
      cpCutR2: 0.936,
      href: "#details-drivaerml-oformer",
      note: "Baseline DrivAerML L2 metrics from AB-UPT v2 Table 7; L1 and diagnostic R2 values are illustrative.",
    },
    {
      id: "drivaerml-upt",
      model: "UPT",
      type: "Transformer",
      dataset: "DrivAerML",
      surfacePressure: 7.85,
      surfaceTau: 12.7,
      volumeVelocity: 9.02,
      volumePressure: 10.54,
      r2Cd: 0.955,
      r2Cl: 0.931,
      params: 10.98,
      date: "2025-06-13",
      velocityProfileR2: 0.905,
      cpCutR2: 0.9,
      href: "#details-drivaerml-upt",
      note: "Baseline DrivAerML L2 metrics from AB-UPT v2 Table 7; L1 and diagnostic R2 values are illustrative.",
    },
    {
      id: "drivaerml-graph-u-net",
      model: "Graph U-Net",
      type: "GNN",
      dataset: "DrivAerML",
      surfacePressure: 16.13,
      surfaceTau: 27.85,
      volumeVelocity: 17.98,
      volumePressure: 20.52,
      r2Cd: 0.89,
      r2Cl: 0.86,
      params: 14.11,
      date: "2025-06-13",
      velocityProfileR2: 0.79,
      cpCutR2: 0.805,
      href: "#details-drivaerml-graph-u-net",
      note: "Baseline DrivAerML L2 metrics from AB-UPT v2 Table 7; L1 and diagnostic R2 values are illustrative.",
    },
    {
      id: "drivaerml-pointnet",
      model: "PointNet",
      type: "Point cloud",
      dataset: "DrivAerML",
      surfacePressure: 23.63,
      surfaceTau: 41.85,
      volumeVelocity: 28.12,
      volumePressure: 31.23,
      r2Cd: 0.83,
      r2Cl: 0.79,
      params: 3.6,
      date: "2025-06-13",
      velocityProfileR2: 0.69,
      cpCutR2: 0.71,
      href: "#details-drivaerml-pointnet",
      note: "Baseline DrivAerML L2 metrics from AB-UPT v2 Table 7; L1 and diagnostic R2 values are illustrative.",
    },
    {
      id: "drivaerml-gino",
      model: "GINO",
      type: "Neural operator",
      dataset: "DrivAerML",
      surfacePressure: 13.03,
      surfaceTau: 21.71,
      volumeVelocity: 40.58,
      volumePressure: 44.9,
      r2Cd: 0.82,
      r2Cl: 0.78,
      params: 15.6,
      date: "2025-06-13",
      velocityProfileR2: 0.65,
      cpCutR2: 0.67,
      href: "#details-drivaerml-gino",
      note: "Baseline DrivAerML L2 metrics from AB-UPT v2 Table 7; L1 and diagnostic R2 values are illustrative.",
    },
    {
      id: "drivaerml-lno",
      model: "LNO",
      type: "Neural operator",
      dataset: "DrivAerML",
      surfacePressure: 20.51,
      surfaceTau: 36.44,
      volumeVelocity: 23.27,
      volumePressure: 27.02,
      r2Cd: 0.85,
      r2Cl: 0.81,
      params: 6.3,
      date: "2025-06-13",
      velocityProfileR2: 0.74,
      cpCutR2: 0.755,
      href: "#details-drivaerml-lno",
      note: "Baseline DrivAerML L2 metrics from AB-UPT v2 Table 7; L1 and diagnostic R2 values are illustrative.",
    },
    {
      id: "drivaernetpp-ab-upt",
      model: "AB-UPT",
      type: "Transformer",
      dataset: "DrivAerNet++",
      surfacePressure: 13.58,
      surfaceTau: 16.98,
      volumeVelocity: 15.62,
      volumePressure: 14.26,
      r2Cd: 0.968,
      r2Cl: 0.968,
      params: 6.01,
      date: "2025-11-25",
      velocityProfileR2: 0.938,
      cpCutR2: 0.968,
      href: "#details-drivaernetpp-ab-upt",
      note: "CarBench Table 1 reports DrivAerNet++ surface-pressure Rel L2, pressure-field R2, and parameter count; force, volume, wall-shear, and profile metrics are placeholders until a DrivAerNet++ evaluator is available.",
    },
    {
      id: "drivaernetpp-transolver-large",
      model: "TransolverLarge",
      type: "Transformer",
      dataset: "DrivAerNet++",
      surfacePressure: 14.57,
      surfaceTau: 18.21,
      volumeVelocity: 16.76,
      volumePressure: 15.3,
      r2Cd: 0.96,
      r2Cl: 0.96,
      params: 7.58,
      date: "2025-11-25",
      velocityProfileR2: 0.93,
      cpCutR2: 0.96,
      href: "#details-drivaernetpp-transolver-large",
      note: "CarBench Table 1 reports DrivAerNet++ surface-pressure Rel L2, pressure-field R2, and parameter count; force, volume, wall-shear, and profile metrics are placeholders until a DrivAerNet++ evaluator is available.",
    },
    {
      id: "drivaernetpp-transolver",
      model: "Transolver",
      type: "Transformer",
      dataset: "DrivAerNet++",
      surfacePressure: 15.03,
      surfaceTau: 18.79,
      volumeVelocity: 17.28,
      volumePressure: 15.78,
      r2Cd: 0.958,
      r2Cl: 0.958,
      params: 2.47,
      date: "2025-11-25",
      velocityProfileR2: 0.928,
      cpCutR2: 0.958,
      href: "#details-drivaernetpp-transolver",
      note: "CarBench Table 1 reports DrivAerNet++ surface-pressure Rel L2, pressure-field R2, and parameter count; force, volume, wall-shear, and profile metrics are placeholders until a DrivAerNet++ evaluator is available.",
    },
    {
      id: "drivaernetpp-transolver-plus-plus",
      model: "Transolver++",
      type: "Transformer",
      dataset: "DrivAerNet++",
      surfacePressure: 15.73,
      surfaceTau: 19.66,
      volumeVelocity: 18.09,
      volumePressure: 16.52,
      r2Cd: 0.954,
      r2Cl: 0.954,
      params: 1.81,
      date: "2025-11-25",
      velocityProfileR2: 0.924,
      cpCutR2: 0.954,
      href: "#details-drivaernetpp-transolver-plus-plus",
      note: "CarBench Table 1 reports DrivAerNet++ surface-pressure Rel L2, pressure-field R2, and parameter count; force, volume, wall-shear, and profile metrics are placeholders until a DrivAerNet++ evaluator is available.",
    },
    {
      id: "drivaernetpp-tripnet",
      model: "TripNet",
      type: "Implicit field",
      dataset: "DrivAerNet++",
      surfacePressure: 16.08,
      surfaceTau: 20.1,
      volumeVelocity: 18.49,
      volumePressure: 16.88,
      r2Cd: 0.959,
      r2Cl: 0.959,
      params: 24.1,
      date: "2025-11-25",
      velocityProfileR2: 0.929,
      cpCutR2: 0.959,
      href: "#details-drivaernetpp-tripnet",
      note: "CarBench Table 1 reports DrivAerNet++ surface-pressure Rel L2, pressure-field R2, and parameter count; force, volume, wall-shear, and profile metrics are placeholders until a DrivAerNet++ evaluator is available.",
    },
    {
      id: "drivaernetpp-pointtransformer",
      model: "PointTransformer",
      type: "Point cloud",
      dataset: "DrivAerNet++",
      surfacePressure: 19.09,
      surfaceTau: 23.86,
      volumeVelocity: 21.95,
      volumePressure: 20.03,
      r2Cd: 0.936,
      r2Cl: 0.936,
      params: 3.05,
      date: "2025-11-25",
      velocityProfileR2: 0.906,
      cpCutR2: 0.936,
      href: "#details-drivaernetpp-pointtransformer",
      note: "CarBench Table 1 reports DrivAerNet++ surface-pressure Rel L2, pressure-field R2, and parameter count; force, volume, wall-shear, and profile metrics are placeholders until a DrivAerNet++ evaluator is available.",
    },
    {
      id: "drivaernetpp-regdgcnn",
      model: "RegDGCNN",
      type: "GNN",
      dataset: "DrivAerNet++",
      surfacePressure: 20.06,
      surfaceTau: 25.08,
      volumeVelocity: 23.07,
      volumePressure: 21.06,
      r2Cd: 0.933,
      r2Cl: 0.933,
      params: 1.44,
      date: "2025-11-25",
      velocityProfileR2: 0.903,
      cpCutR2: 0.933,
      href: "#details-drivaernetpp-regdgcnn",
      note: "CarBench Table 1 reports DrivAerNet++ surface-pressure Rel L2, pressure-field R2, and parameter count; force, volume, wall-shear, and profile metrics are placeholders until a DrivAerNet++ evaluator is available.",
    },
    {
      id: "drivaernetpp-pointnet-large",
      model: "PointNetLarge",
      type: "Point cloud",
      dataset: "DrivAerNet++",
      surfacePressure: 24.36,
      surfaceTau: 30.45,
      volumeVelocity: 28.01,
      volumePressure: 25.58,
      r2Cd: 0.903,
      r2Cl: 0.903,
      params: 32.58,
      date: "2025-11-25",
      velocityProfileR2: 0.873,
      cpCutR2: 0.903,
      href: "#details-drivaernetpp-pointnet-large",
      note: "CarBench Table 1 reports DrivAerNet++ surface-pressure Rel L2, pressure-field R2, and parameter count; force, volume, wall-shear, and profile metrics are placeholders until a DrivAerNet++ evaluator is available.",
    },
    {
      id: "drivaernetpp-pointmae",
      model: "PointMAE",
      type: "Point cloud",
      dataset: "DrivAerNet++",
      surfacePressure: 27.13,
      surfaceTau: 33.91,
      volumeVelocity: 31.2,
      volumePressure: 28.49,
      r2Cd: 0.879,
      r2Cl: 0.879,
      params: 1.67,
      date: "2025-11-25",
      velocityProfileR2: 0.849,
      cpCutR2: 0.879,
      href: "#details-drivaernetpp-pointmae",
      note: "CarBench Table 1 reports DrivAerNet++ surface-pressure Rel L2, pressure-field R2, and parameter count; force, volume, wall-shear, and profile metrics are placeholders until a DrivAerNet++ evaluator is available.",
    },
    {
      id: "drivaernetpp-neuraloperator",
      model: "NeuralOperator",
      type: "Neural operator",
      dataset: "DrivAerNet++",
      surfacePressure: 30.16,
      surfaceTau: 37.7,
      volumeVelocity: 34.68,
      volumePressure: 31.67,
      r2Cd: 0.85,
      r2Cl: 0.85,
      params: 2.1,
      date: "2025-11-25",
      velocityProfileR2: 0.82,
      cpCutR2: 0.85,
      href: "#details-drivaernetpp-neuraloperator",
      note: "CarBench Table 1 reports DrivAerNet++ surface-pressure Rel L2, pressure-field R2, and parameter count; force, volume, wall-shear, and profile metrics are placeholders until a DrivAerNet++ evaluator is available.",
    },
    {
      id: "drivaernetpp-pointnet",
      model: "PointNet",
      type: "Point cloud",
      dataset: "DrivAerNet++",
      surfacePressure: 38.03,
      surfaceTau: 47.54,
      volumeVelocity: 43.73,
      volumePressure: 39.93,
      r2Cd: 0.764,
      r2Cl: 0.764,
      params: 1.67,
      date: "2025-11-25",
      velocityProfileR2: 0.734,
      cpCutR2: 0.764,
      href: "#details-drivaernetpp-pointnet",
      note: "CarBench Table 1 reports DrivAerNet++ surface-pressure Rel L2, pressure-field R2, and parameter count; force, volume, wall-shear, and profile metrics are placeholders until a DrivAerNet++ evaluator is available.",
    },
    {
      id: "windsorml-ab-upt",
      model: "AB-UPT",
      type: "Transformer",
      dataset: "WindsorML",
      surfacePressure: 4.1,
      surfaceTau: 6.85,
      volumeVelocity: 4.35,
      volumePressure: 4.8,
      r2Cd: 0.989,
      r2Cl: 0.982,
      params: 8.75,
      date: "2024-07-27",
      velocityProfileR2: 0.966,
      cpCutR2: 0.964,
      href: "#details-windsorml-ab-upt",
      note: "Illustrative WindsorML prototype row. AB-UPT v2 does not report WindsorML benchmark metrics; replace with evaluator outputs.",
    },
    {
      id: "windsorml-transformer",
      model: "Transformer",
      type: "Transformer",
      dataset: "WindsorML",
      surfacePressure: 4.62,
      surfaceTau: 7.45,
      volumeVelocity: 4.92,
      volumePressure: 5.18,
      r2Cd: 0.972,
      r2Cl: 0.955,
      params: 5.49,
      date: "2024-07-27",
      velocityProfileR2: 0.936,
      cpCutR2: 0.934,
      href: "#details-windsorml-transformer",
      note: "Illustrative WindsorML prototype row. AB-UPT v2 does not report WindsorML benchmark metrics; replace with evaluator outputs.",
    },
    {
      id: "windsorml-transolver",
      model: "Transolver",
      type: "Transformer",
      dataset: "WindsorML",
      surfacePressure: 4.88,
      surfaceTau: 7.82,
      volumeVelocity: 5.1,
      volumePressure: 5.42,
      r2Cd: 0.969,
      r2Cl: 0.951,
      params: 5.49,
      date: "2024-07-27",
      velocityProfileR2: 0.931,
      cpCutR2: 0.929,
      href: "#details-windsorml-transolver",
      note: "Illustrative WindsorML prototype row. AB-UPT v2 does not report WindsorML benchmark metrics; replace with evaluator outputs.",
    },
    {
      id: "windsorml-oformer",
      model: "OFormer",
      type: "Transformer",
      dataset: "WindsorML",
      surfacePressure: 4.75,
      surfaceTau: 7.7,
      volumeVelocity: 5.04,
      volumePressure: 5.36,
      r2Cd: 0.97,
      r2Cl: 0.953,
      params: 6.1,
      date: "2024-07-27",
      velocityProfileR2: 0.933,
      cpCutR2: 0.931,
      href: "#details-windsorml-oformer",
      note: "Illustrative WindsorML prototype row. AB-UPT v2 does not report WindsorML benchmark metrics; replace with evaluator outputs.",
    },
    {
      id: "windsorml-upt",
      model: "UPT",
      type: "Transformer",
      dataset: "WindsorML",
      surfacePressure: 7.2,
      surfaceTau: 11.4,
      volumeVelocity: 7.3,
      volumePressure: 8.15,
      r2Cd: 0.949,
      r2Cl: 0.925,
      params: 10.98,
      date: "2024-07-27",
      velocityProfileR2: 0.898,
      cpCutR2: 0.895,
      href: "#details-windsorml-upt",
      note: "Illustrative WindsorML prototype row. AB-UPT v2 does not report WindsorML benchmark metrics; replace with evaluator outputs.",
    },
    {
      id: "windsorml-graph-u-net",
      model: "Graph U-Net",
      type: "GNN",
      dataset: "WindsorML",
      surfacePressure: 14.8,
      surfaceTau: 24.2,
      volumeVelocity: 15.5,
      volumePressure: 18.4,
      r2Cd: 0.875,
      r2Cl: 0.842,
      params: 14.11,
      date: "2024-07-27",
      velocityProfileR2: 0.772,
      cpCutR2: 0.786,
      href: "#details-windsorml-graph-u-net",
      note: "Illustrative WindsorML prototype row. AB-UPT v2 does not report WindsorML benchmark metrics; replace with evaluator outputs.",
    },
    {
      id: "windsorml-pointnet",
      model: "PointNet",
      type: "Point cloud",
      dataset: "WindsorML",
      surfacePressure: 21.7,
      surfaceTau: 38.6,
      volumeVelocity: 24.9,
      volumePressure: 29.8,
      r2Cd: 0.815,
      r2Cl: 0.77,
      params: 3.6,
      date: "2024-07-27",
      velocityProfileR2: 0.665,
      cpCutR2: 0.688,
      href: "#details-windsorml-pointnet",
      note: "Illustrative WindsorML prototype row. AB-UPT v2 does not report WindsorML benchmark metrics; replace with evaluator outputs.",
    },
    {
      id: "windsorml-gino",
      model: "GINO",
      type: "Neural operator",
      dataset: "WindsorML",
      surfacePressure: 12.7,
      surfaceTau: 20.9,
      volumeVelocity: 33.5,
      volumePressure: 36.2,
      r2Cd: 0.805,
      r2Cl: 0.765,
      params: 15.6,
      date: "2024-07-27",
      velocityProfileR2: 0.638,
      cpCutR2: 0.655,
      href: "#details-windsorml-gino",
      note: "Illustrative WindsorML prototype row. AB-UPT v2 does not report WindsorML benchmark metrics; replace with evaluator outputs.",
    },
    {
      id: "windsorml-lno",
      model: "LNO",
      type: "Neural operator",
      dataset: "WindsorML",
      surfacePressure: 18.3,
      surfaceTau: 32.4,
      volumeVelocity: 21.8,
      volumePressure: 25.6,
      r2Cd: 0.836,
      r2Cl: 0.798,
      params: 6.3,
      date: "2024-07-27",
      velocityProfileR2: 0.724,
      cpCutR2: 0.74,
      href: "#details-windsorml-lno",
      note: "Illustrative WindsorML prototype row. AB-UPT v2 does not report WindsorML benchmark metrics; replace with evaluator outputs.",
    },
    {
      id: "hiliftaeroml-geot-full",
      model: "GeoTransolver (full split)",
      type: "Transformer",
      dataset: "HiLiftAeroML",
      surfacePressure: 8.84,
      surfaceTau: 11.09,
      volumeVelocity: 8.78,
      volumePressure: 8.06,
      r2Cd: 0.995,
      r2Cl: 0.992,
      params: 9.05,
      date: "2026-06-25",
      velocityProfileR2: 0.94,
      cpCutR2: 0.952,
      href: "#details-hiliftaeroml-geot-full",
      note: "HiLiftAeroML full-split GeoTransolver L2 and force R2 metrics from Table 6 of the local HiLiftAeroML PDF; L1 and diagnostic cut R2 values are illustrative.",
    },
    {
      id: "hiliftaeroml-geot-aoa4",
      model: "GeoTransolver (AoA 4)",
      type: "Transformer",
      dataset: "HiLiftAeroML",
      surfacePressure: 6.18,
      surfaceTau: 12.72,
      volumeVelocity: 6.68,
      volumePressure: 5.02,
      r2Cd: 0.997,
      r2Cl: 0.998,
      params: 9.05,
      date: "2026-06-25",
      velocityProfileR2: 0.956,
      cpCutR2: 0.972,
      href: "#details-hiliftaeroml-geot-aoa4",
      note: "HiLiftAeroML AoA = 4 deg GeoTransolver L2 and force R2 metrics from Table 6 of the local HiLiftAeroML PDF; L1 and diagnostic cut R2 values are illustrative.",
    },
    {
      id: "hiliftaeroml-transolver-aoa4",
      model: "Transolver (AoA 4)",
      type: "Transformer",
      dataset: "HiLiftAeroML",
      surfacePressure: 7.77,
      surfaceTau: 13.98,
      volumeVelocity: 9.82,
      volumePressure: 7.23,
      r2Cd: 0.992,
      r2Cl: 0.994,
      params: 6.02,
      date: "2026-06-25",
      velocityProfileR2: 0.928,
      cpCutR2: 0.946,
      href: "#details-hiliftaeroml-transolver-aoa4",
      note: "HiLiftAeroML AoA = 4 deg Transolver L2 and force R2 metrics from Table 6 of the local HiLiftAeroML PDF; L1 and diagnostic cut R2 values are illustrative.",
    },
    {
      id: "hiliftaeroml-geot-aoa12",
      model: "GeoTransolver (AoA 12)",
      type: "Transformer",
      dataset: "HiLiftAeroML",
      surfacePressure: 4.6,
      surfaceTau: 11.35,
      volumeVelocity: 9.17,
      volumePressure: 4.9,
      r2Cd: 0.99,
      r2Cl: 0.992,
      params: 9.05,
      date: "2026-06-25",
      velocityProfileR2: 0.934,
      cpCutR2: 0.958,
      href: "#details-hiliftaeroml-geot-aoa12",
      note: "HiLiftAeroML AoA = 12 deg GeoTransolver L2 and force R2 metrics from Table 6 of the local HiLiftAeroML PDF; L1 and diagnostic cut R2 values are illustrative.",
    },
    {
      id: "hiliftaeroml-transolver-aoa12",
      model: "Transolver (AoA 12)",
      type: "Transformer",
      dataset: "HiLiftAeroML",
      surfacePressure: 5.94,
      surfaceTau: 12.94,
      volumeVelocity: 11.39,
      volumePressure: 8.43,
      r2Cd: 0.992,
      r2Cl: 0.993,
      params: 6.02,
      date: "2026-06-25",
      velocityProfileR2: 0.92,
      cpCutR2: 0.944,
      href: "#details-hiliftaeroml-transolver-aoa12",
      note: "HiLiftAeroML AoA = 12 deg Transolver L2 and force R2 metrics from Table 6 of the local HiLiftAeroML PDF; L1 and diagnostic cut R2 values are illustrative.",
    },
    {
      id: "hiliftaeroml-geot-aoa22",
      model: "GeoTransolver (AoA 22)",
      type: "Transformer",
      dataset: "HiLiftAeroML",
      surfacePressure: 15.46,
      surfaceTau: 20.32,
      volumeVelocity: 16.91,
      volumePressure: 14.19,
      r2Cd: 0.94,
      r2Cl: 0.872,
      params: 9.05,
      date: "2026-06-25",
      velocityProfileR2: 0.812,
      cpCutR2: 0.82,
      href: "#details-hiliftaeroml-geot-aoa22",
      note: "HiLiftAeroML AoA = 22 deg GeoTransolver L2 and force R2 metrics from Table 6 of the local HiLiftAeroML PDF; L1 and diagnostic cut R2 values are illustrative.",
    },
    {
      id: "hiliftaeroml-transolver-aoa22",
      model: "Transolver (AoA 22)",
      type: "Transformer",
      dataset: "HiLiftAeroML",
      surfacePressure: 16.59,
      surfaceTau: 20.23,
      volumeVelocity: 19.12,
      volumePressure: 15.63,
      r2Cd: 0.939,
      r2Cl: 0.886,
      params: 6.02,
      date: "2026-06-25",
      velocityProfileR2: 0.798,
      cpCutR2: 0.807,
      href: "#details-hiliftaeroml-transolver-aoa22",
      note: "HiLiftAeroML AoA = 22 deg Transolver L2 and force R2 metrics from Table 6 of the local HiLiftAeroML PDF; L1 and diagnostic cut R2 values are illustrative.",
    },
    {
      id: "airfrans-mlp-full",
      model: "MLP",
      type: "MLP",
      dataset: "AirfRANS",
      split: "Full",
      surfacePressure: 33.62,
      surfaceTau: 4.29,
      volumeVelocity: 9.82,
      volumePressure: 8.6,
      r2Cd: 0.957,
      r2Cl: 0.992,
      params: 0.02,
      date: "2023-06-01",
      velocityProfileR2: 0.902,
      cpCutR2: 0.913,
      href: "#details-airfrans-mlp-full",
      note: "AirfRANS full-data baseline from the arXiv v3 benchmark tables. Field columns are prototype conversions from normalized MSE values; force R2 columns are placeholders derived from force relative-error diagnostics until a dimensional FluidsBench evaluator is available.",
    },
    {
      id: "airfrans-graphsage-full",
      model: "GraphSAGE",
      type: "GNN",
      dataset: "AirfRANS",
      split: "Full",
      surfacePressure: 25.69,
      surfaceTau: 4.05,
      volumeVelocity: 9.54,
      volumePressure: 8.12,
      r2Cd: 0.96,
      r2Cl: 0.995,
      params: 0.03,
      date: "2023-06-01",
      velocityProfileR2: 0.905,
      cpCutR2: 0.965,
      href: "#details-airfrans-graphsage-full",
      note: "AirfRANS full-data baseline from the arXiv v3 benchmark tables. Field columns are prototype conversions from normalized MSE values; force R2 columns are placeholders derived from force relative-error diagnostics until a dimensional FluidsBench evaluator is available.",
    },
    {
      id: "airfrans-pointnet-full",
      model: "PointNet",
      type: "Point cloud",
      dataset: "AirfRANS",
      split: "Full",
      surfacePressure: 30.5,
      surfaceTau: 14.64,
      volumeVelocity: 18.89,
      volumePressure: 10.72,
      r2Cd: 0.854,
      r2Cl: 0.993,
      params: 0.08,
      date: "2023-06-01",
      velocityProfileR2: 0.811,
      cpCutR2: 0.938,
      href: "#details-airfrans-pointnet-full",
      note: "AirfRANS full-data baseline from the arXiv v3 benchmark tables. Field columns are prototype conversions from normalized MSE values; force R2 columns are placeholders derived from force relative-error diagnostics until a dimensional FluidsBench evaluator is available.",
    },
    {
      id: "airfrans-graph-u-net-full",
      model: "Graph U-Net",
      type: "GNN",
      dataset: "AirfRANS",
      split: "Full",
      surfacePressure: 19.75,
      surfaceTau: 10.39,
      volumeVelocity: 13.32,
      volumePressure: 8.12,
      r2Cd: 0.896,
      r2Cl: 0.995,
      params: 0.07,
      date: "2023-06-01",
      velocityProfileR2: 0.867,
      cpCutR2: 0.967,
      href: "#details-airfrans-graph-u-net-full",
      note: "AirfRANS full-data baseline from the arXiv v3 benchmark tables. Field columns are prototype conversions from normalized MSE values; force R2 columns are placeholders derived from force relative-error diagnostics until a dimensional FluidsBench evaluator is available.",
    },
  ];

  let submissions = [...exampleSubmissions];
  let leaderboardManifest = null;
  let approvedDatasetRows = new Map();
  let datasetLoadPromises = new Map();
  let dataRefreshToken = 0;
  let approvedSubmissionStatusMessage = `Loading approved submissions from ${approvedSubmissionsSourceLabel}...`;

  const datasetProfiles = {
    AhmedML: {
      cpTitle: "Centreline surface Cp",
      cpDescription: "Ground truth versus selected submissions along the Ahmed body centreline.",
      cpXTitle: "x/L along Ahmed body centreline",
      cp: {
        x: [0, 0.05, 0.1, 0.18, 0.28, 0.4, 0.52, 0.64, 0.76, 0.86, 0.94, 1],
        groundTruth: [0.78, 0.42, 0.08, -0.1, -0.22, -0.3, -0.34, -0.31, -0.22, -0.05, 0.16, 0.02],
      },
      velocityTitle: "Velocity profiles",
      velocityDescription: "Wake velocity profiles for the selected AhmedML station.",
      velocityXTitle: "z/H",
      velocityStations: {
        "0.25L": {
          label: "x/H = 0.25 downstream",
          z: [0, 0.12, 0.24, 0.36, 0.48, 0.6, 0.78, 0.96, 1.16, 1.36],
          groundTruth: [0.32, 0.38, 0.48, 0.62, 0.76, 0.88, 0.96, 1.02, 1.04, 1.04],
        },
        "0.50L": {
          label: "x/H = 0.50 downstream",
          z: [0, 0.12, 0.24, 0.36, 0.48, 0.6, 0.78, 0.96, 1.16, 1.36],
          groundTruth: [0.42, 0.46, 0.55, 0.68, 0.8, 0.9, 0.98, 1.03, 1.05, 1.05],
        },
        "1.00L": {
          label: "x/H = 1.00 downstream",
          z: [0, 0.12, 0.24, 0.36, 0.48, 0.6, 0.78, 0.96, 1.16, 1.36],
          groundTruth: [0.58, 0.6, 0.66, 0.76, 0.86, 0.94, 1.0, 1.04, 1.05, 1.05],
        },
      },
    },
    DrivAerML: {
      cpTitle: "DrivAer centreline Cp",
      cpDescription: "Ground truth versus selected submissions along the DrivAer body symmetry-line surface cut.",
      cpXTitle: "x/L along DrivAer centreline",
      cp: {
        x: [0, 0.06, 0.12, 0.2, 0.31, 0.43, 0.55, 0.68, 0.79, 0.88, 0.95, 1],
        groundTruth: [0.92, 0.58, 0.2, -0.08, -0.32, -0.48, -0.52, -0.41, -0.2, 0.01, 0.14, 0.05],
      },
      velocityTitle: "DrivAer wake velocity profiles",
      velocityDescription: "Wake velocity profiles for the selected DrivAerML downstream station.",
      velocityXTitle: "z/L",
      velocityStations: {
        "0.25L": {
          label: "x/L = 0.25 behind the DrivAer tail",
          z: [0, 0.1, 0.22, 0.34, 0.46, 0.58, 0.72, 0.9, 1.1, 1.32],
          groundTruth: [0.22, 0.3, 0.45, 0.63, 0.78, 0.89, 0.97, 1.02, 1.04, 1.04],
        },
        "0.50L": {
          label: "x/L = 0.50 behind the DrivAer tail",
          z: [0, 0.1, 0.22, 0.34, 0.46, 0.58, 0.72, 0.9, 1.1, 1.32],
          groundTruth: [0.36, 0.41, 0.53, 0.68, 0.81, 0.91, 0.98, 1.03, 1.05, 1.05],
        },
        "1.00L": {
          label: "x/L = 1.00 behind the DrivAer tail",
          z: [0, 0.1, 0.22, 0.34, 0.46, 0.58, 0.72, 0.9, 1.1, 1.32],
          groundTruth: [0.52, 0.56, 0.64, 0.76, 0.87, 0.95, 1.0, 1.04, 1.05, 1.05],
        },
      },
    },
    "DrivAerNet++": {
      cpTitle: "DrivAerNet++ surface pressure cut",
      cpDescription: "Ground truth versus selected submissions along a representative DrivAerNet++ body centreline surface cut.",
      cpXTitle: "x/L along DrivAerNet++ centreline",
      cp: {
        x: [0, 0.05, 0.11, 0.18, 0.28, 0.4, 0.52, 0.65, 0.77, 0.88, 0.95, 1],
        groundTruth: [0.95, 0.62, 0.25, -0.05, -0.34, -0.54, -0.58, -0.44, -0.2, 0.02, 0.16, 0.06],
      },
      velocityTitle: "DrivAerNet++ wake velocity profiles",
      velocityDescription: "Representative wake velocity profiles for the selected DrivAerNet++ station.",
      velocityXTitle: "z/L",
      velocityStations: {
        "0.25L": {
          label: "x/L = 0.25 behind the vehicle base",
          z: [0, 0.1, 0.22, 0.34, 0.46, 0.58, 0.72, 0.9, 1.1, 1.32],
          groundTruth: [0.2, 0.29, 0.44, 0.62, 0.78, 0.9, 0.98, 1.03, 1.05, 1.05],
        },
        "0.50L": {
          label: "x/L = 0.50 behind the vehicle base",
          z: [0, 0.1, 0.22, 0.34, 0.46, 0.58, 0.72, 0.9, 1.1, 1.32],
          groundTruth: [0.34, 0.4, 0.52, 0.68, 0.82, 0.92, 0.99, 1.04, 1.05, 1.05],
        },
        "1.00L": {
          label: "x/L = 1.00 behind the vehicle base",
          z: [0, 0.1, 0.22, 0.34, 0.46, 0.58, 0.72, 0.9, 1.1, 1.32],
          groundTruth: [0.5, 0.55, 0.64, 0.76, 0.87, 0.96, 1.01, 1.05, 1.06, 1.06],
        },
      },
    },
    WindsorML: {
      cpTitle: "Windsor body centreline Cp",
      cpDescription: "Ground truth versus selected submissions along the Windsor body roof and deck centreline cut.",
      cpXTitle: "x/L along Windsor body centreline",
      cp: {
        x: [0, 0.05, 0.11, 0.19, 0.3, 0.42, 0.54, 0.66, 0.78, 0.88, 0.95, 1],
        groundTruth: [0.82, 0.48, 0.14, -0.06, -0.24, -0.36, -0.43, -0.34, -0.16, 0.03, 0.18, 0.08],
      },
      velocityTitle: "Windsor wake velocity profiles",
      velocityDescription: "Wake velocity profiles for the selected WindsorML downstream station.",
      velocityXTitle: "z/L",
      velocityStations: {
        "0.25L": {
          label: "x/L = 0.25 behind the Windsor base",
          z: [0, 0.1, 0.22, 0.34, 0.46, 0.58, 0.72, 0.9, 1.1, 1.32],
          groundTruth: [0.28, 0.34, 0.48, 0.65, 0.8, 0.91, 0.98, 1.03, 1.05, 1.05],
        },
        "0.50L": {
          label: "x/L = 0.50 behind the Windsor base",
          z: [0, 0.1, 0.22, 0.34, 0.46, 0.58, 0.72, 0.9, 1.1, 1.32],
          groundTruth: [0.4, 0.45, 0.56, 0.7, 0.83, 0.93, 0.99, 1.04, 1.05, 1.05],
        },
        "1.00L": {
          label: "x/L = 1.00 behind the Windsor base",
          z: [0, 0.1, 0.22, 0.34, 0.46, 0.58, 0.72, 0.9, 1.1, 1.32],
          groundTruth: [0.55, 0.59, 0.67, 0.78, 0.88, 0.96, 1.01, 1.04, 1.05, 1.05],
        },
      },
    },
    HiLiftAeroML: {
      cpTitle: "CRM-HL wing section Cp",
      cpDescription: "Ground truth versus selected submissions along a representative HiLiftAeroML wing section cut.",
      cpXTitle: "x/c along CRM-HL section",
      cp: {
        x: [0, 0.01, 0.02, 0.04, 0.07, 0.12, 0.2, 0.32, 0.48, 0.66, 0.84, 1],
        groundTruth: [-0.35, -2.2, -1.72, -1.18, -0.82, -0.54, -0.32, -0.18, -0.08, 0.0, 0.07, 0.11],
      },
      velocityTitle: "HiLiftAeroML near-wall velocity profiles",
      velocityDescription: "Near-wall streamwise velocity profiles for representative CRM-HL profile windows.",
      velocityXTitle: "SDF distance / Lref",
      velocityStations: {
        "0.25L": {
          label: "Inboard wake profile window",
          z: [0, 0.006, 0.012, 0.018, 0.024, 0.032, 0.04, 0.05, 0.06],
          groundTruth: [0.62, 0.7, 0.78, 0.86, 0.94, 1.0, 1.04, 1.07, 1.08],
        },
        "0.50L": {
          label: "Main element near-wall window",
          z: [0, 0.006, 0.012, 0.018, 0.024, 0.032, 0.04, 0.05, 0.06],
          groundTruth: [0.72, 0.78, 0.84, 0.9, 0.96, 1.02, 1.06, 1.09, 1.11],
        },
        "1.00L": {
          label: "Aft wake profile window",
          z: [0, 0.006, 0.012, 0.018, 0.024, 0.032, 0.04, 0.05, 0.06],
          groundTruth: [0.18, 0.27, 0.39, 0.52, 0.65, 0.78, 0.88, 0.96, 1.01],
        },
      },
    },
    AirfRANS: {
      cpTitle: "AirfRANS airfoil surface Cp",
      cpDescription: "Ground truth versus selected submissions along a representative AirfRANS airfoil surface pressure cut.",
      cpXTitle: "x/c along airfoil chord",
      cp: {
        x: [0, 0.01, 0.025, 0.05, 0.09, 0.15, 0.25, 0.38, 0.52, 0.68, 0.84, 1],
        groundTruth: [0.12, -1.42, -1.18, -0.86, -0.62, -0.43, -0.27, -0.15, -0.06, 0.01, 0.07, 0.1],
      },
      velocityTitle: "AirfRANS boundary-layer velocity profiles",
      velocityDescription: "Boundary-layer velocity profiles for representative AirfRANS chordwise stations.",
      velocityXTitle: "wall-normal distance / c",
      velocityStations: {
        "0.25L": {
          label: "x/c = 0.20 upper-surface profile",
          z: [0, 0.002, 0.005, 0.01, 0.018, 0.03, 0.045, 0.065, 0.09],
          groundTruth: [0.0, 0.18, 0.36, 0.55, 0.72, 0.86, 0.95, 1.0, 1.03],
        },
        "0.50L": {
          label: "x/c = 0.50 upper-surface profile",
          z: [0, 0.002, 0.005, 0.01, 0.018, 0.03, 0.045, 0.065, 0.09],
          groundTruth: [0.0, 0.14, 0.31, 0.5, 0.68, 0.83, 0.94, 1.01, 1.04],
        },
        "1.00L": {
          label: "x/c = 0.80 upper-surface profile",
          z: [0, 0.002, 0.005, 0.01, 0.018, 0.03, 0.045, 0.065, 0.09],
          groundTruth: [0.0, 0.1, 0.24, 0.42, 0.61, 0.78, 0.91, 0.99, 1.04],
        },
      },
    },
  };

  const palette = {
    groundTruth: "#0f172a",
    "ab-upt": "#2563eb",
    transformer: "#10b981",
    transolver: "#8b5cf6",
    oformer: "#ec4899",
    upt: "#f59e0b",
    "graph-u-net": "#64748b",
    pointnet: "#94a3b8",
    gino: "#06b6d4",
    lno: "#1e40af",
    "hiliftaeroml-geot-full": "#1e40af",
    "hiliftaeroml-geot-aoa4": "#2563eb",
    "hiliftaeroml-transolver-aoa4": "#8b5cf6",
    "hiliftaeroml-geot-aoa12": "#10b981",
    "hiliftaeroml-transolver-aoa12": "#f59e0b",
    "hiliftaeroml-geot-aoa22": "#ec4899",
    "hiliftaeroml-transolver-aoa22": "#64748b",
    "airfrans-mlp-full": "#64748b",
    "airfrans-graphsage-full": "#2563eb",
    "airfrans-pointnet-full": "#10b981",
    "airfrans-graph-u-net-full": "#8b5cf6",
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

  function selectedDatasetForCharts() {
    const filters = currentFilters();
    const selectedDataset = filters.datasets.all
      ? chartSelections.cp.dataset
      : Array.from(filters.datasets.values).find((dataset) => datasetProfiles[dataset]);
    return datasetProfiles[selectedDataset] ? selectedDataset : chartSelections.cp.dataset;
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
    submissions = [...approvedRows, ...exampleSubmissions];
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
      submissions = [...exampleSubmissions];
      approvedSubmissionStatusMessage = `Could not load ${approvedSubmissionsSourceLabel} (${error.message}). Showing reference baseline rows.`;
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

  function modelPerturbation(modelId, index, scale) {
    const row = submissions.find((entry) => entry.id === modelId);
    const direction = index % 2 === 0 ? 1 : -1;
    const magnitude = row ? (100 - weightedScore(row)) / 100 : 0.2;
    return direction * magnitude * scale * (0.45 + index / 18);
  }

  function cpSeries(modelId, chartType) {
    const profile = chartProfile(chartType);
    return profile.cp.groundTruth.map((value, index) => value + modelPerturbation(modelId, index, 0.22));
  }

  function velocitySeries(modelId, station) {
    return station.groundTruth.map((value, index) => {
      const wakeWeight = index < 6 ? 1.0 : 0.4;
      return clamp(value + modelPerturbation(modelId, index, 0.18) * wakeWeight, 0, 1.15);
    });
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
    return palette[modelId] || fallbackColors[index % fallbackColors.length];
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
    return palette[slug(dataset)] || datasetColors[index % datasetColors.length];
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
    cpChart.data.labels = profile.cp.x;
    cpChart.data.datasets = [
      lineDataset("Ground truth", profile.cp.groundTruth, palette.groundTruth, false),
      ...models.map((modelId, index) => {
        const row = submissions.find((entry) => entry.id === modelId);
        return lineDataset(row?.model || modelId, cpSeries(modelId, "cp"), modelColor(modelId, index), true);
      }),
    ];
    cpChart.options.scales.x.title.text = profile.cpXTitle;
    cpChart.update();
  }

  function updateVelocityChart() {
    if (!velocityChart) return;
    const profile = chartProfile("velocity");
    const station = profile.velocityStations[activeStation] || Object.values(profile.velocityStations)[0];
    const models = checkedModels("velocity-models");
    setText("velocity-station-label", station.label);
    velocityChart.data.labels = station.z;
    velocityChart.data.datasets = [
      lineDataset("Ground truth", station.groundTruth, palette.groundTruth, false),
      ...models.map((modelId, index) => {
        const row = submissions.find((entry) => entry.id === modelId);
        return lineDataset(row?.model || modelId, velocitySeries(modelId, station), modelColor(modelId, index), true);
      }),
    ];
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

    if (!profile.velocityStations[activeStation]) {
      activeStation = Object.keys(profile.velocityStations)[0];
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
        data: { labels: profile.cp.x, datasets: [] },
        options: baseChartOptions("Cp", profile.cpXTitle),
      });
    }

    const velocityCanvas = document.getElementById("velocity-chart");
    if (velocityCanvas) {
      const velocityProfile = chartProfile("velocity");
      const station = velocityProfile.velocityStations[activeStation];
      velocityChart = new Chart(velocityCanvas, {
        type: "line",
        data: { labels: station.z, datasets: [] },
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

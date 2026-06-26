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

  const backendUrls = {
    dev: {
      fetch: "https://ezmaejyn7i7f4djjlgzqycukw40gjojx.lambda-url.us-east-1.on.aws/",
      submit: "https://aynbbamhdmpw5jbjdnwygs46qe0nbgwy.lambda-url.us-east-1.on.aws/",
    },
    prod: {
      fetch: "https://7qdywdyxlfmc7neivnarewbvpy0gkjvg.lambda-url.us-east-1.on.aws/",
      submit: "https://vjfjkk3bwskka2qezpzksof3s40cpowl.lambda-url.us-east-1.on.aws/",
    },
  };

  const backendEnvironment = ["localhost", "127.0.0.1"].includes(window.location.hostname) ? "dev" : "prod";
  const fetchUrl = backendUrls[backendEnvironment].fetch;
  const submitUrl = backendUrls[backendEnvironment].submit;

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
  ];

  let submissions = [...exampleSubmissions];
  let backendStatusMessage = "Loading approved submissions from the leaderboard backend...";

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
  };

  const palette = {
    groundTruth: "#111827",
    "ab-upt": "#0072b2",
    transformer: "#009e73",
    transolver: "#d55e00",
    oformer: "#cc79a7",
    upt: "#f0a202",
    "graph-u-net": "#6f42c1",
    pointnet: "#7f7f7f",
    gino: "#56b4e9",
    lno: "#b22222",
    "hiliftaeroml-geot-full": "#005f73",
    "hiliftaeroml-geot-aoa4": "#0a9396",
    "hiliftaeroml-transolver-aoa4": "#ee9b00",
    "hiliftaeroml-geot-aoa12": "#94d2bd",
    "hiliftaeroml-transolver-aoa12": "#ca6702",
    "hiliftaeroml-geot-aoa22": "#bb3e03",
    "hiliftaeroml-transolver-aoa22": "#9b2226",
  };

  let sortState = { key: "score", direction: "desc" };
  let primaryRankingKey = "score";
  let cpChart = null;
  let velocityChart = null;
  let activeStation = "0.25L";
  let activeChartDataset = "AhmedML";

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function errorScore(value, cap) {
    return clamp(100 * (1 - value / cap), 0, 100);
  }

  function r2Score(value) {
    return clamp(value, 0, 1) * 100;
  }

  function weightedScore(row) {
    return (
      weights.surfacePressure * errorScore(row.surfacePressure, errorCaps.surfacePressure) +
      weights.surfaceTau * errorScore(row.surfaceTau, errorCaps.surfaceTau) +
      weights.volumeVelocity * errorScore(row.volumeVelocity, errorCaps.volumeVelocity) +
      weights.volumePressure * errorScore(row.volumePressure, errorCaps.volumePressure) +
      weights.r2Cd * r2Score(row.r2Cd) +
      weights.r2Cl * r2Score(row.r2Cl) +
      weights.velocityProfileR2 * r2Score(row.velocityProfileR2) +
      weights.cpCutR2 * r2Score(row.cpCutR2)
    );
  }

  function forceR2(row) {
    return (row.r2Cd + row.r2Cl) / 2;
  }

  function estimatedRelL1(row, key) {
    return row[key] * relL1Ratios[key];
  }

  function defaultSortDirection(key) {
    if (key === "model" || key === "type" || key === "dataset" || lowerIsBetterMetrics.has(key)) return "asc";
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
      surfacePressureL1: row.surfacePressureL1 ?? estimatedRelL1(row, "surfacePressure"),
      surfaceTauL1: row.surfaceTauL1 ?? estimatedRelL1(row, "surfaceTau"),
      volumeVelocityL1: row.volumeVelocityL1 ?? estimatedRelL1(row, "volumeVelocity"),
      volumePressureL1: row.volumePressureL1 ?? estimatedRelL1(row, "volumePressure"),
      forceR2: forceR2(row),
      score: weightedScore(row),
    }));
  }

  function rowMatchesFilters(row, filters) {
    const datasetMatch = filters.dataset === "all" || row.dataset === filters.dataset;
    const typeMatch = filters.type === "all" || row.type === filters.type;
    return datasetMatch && typeMatch;
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

  function slug(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function displayDate(entry) {
    if (entry.submission_date) return entry.submission_date;
    if (entry.submitted_at) return String(entry.submitted_at).slice(0, 10);
    return "";
  }

  function chartProfile() {
    return datasetProfiles[activeChartDataset] || datasetProfiles.AhmedML;
  }

  function selectedDatasetForCharts() {
    const selectedDataset = document.getElementById("dataset-filter")?.value || "AhmedML";
    return datasetProfiles[selectedDataset] ? selectedDataset : "AhmedML";
  }

  function normalizeBackendSubmission(entry) {
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
    const id = `backend-${entry.submission_id || slug(model)}`;
    return {
      id,
      model,
      type: entry.model_type || "Other",
      dataset: entry.dataset || "AhmedML",
      ...metrics,
      params: parseNumber(entry.parameter_count ?? entry.num_parameters) ?? 0,
      date: displayDate(entry),
      href: `#details-${id}`,
      paperUrl: entry.paper_url || "",
      codeUrl: entry.code_url || "",
      institution: entry.institution || "",
      note: entry.institution ? `Approved backend submission from ${entry.institution}.` : "Approved backend submission.",
    };
  }

  function renderBackendStatus() {
    const status = document.getElementById("leaderboard-backend-status");
    if (!status) return;
    status.textContent = backendStatusMessage;
  }

  async function loadBackendSubmissions() {
    try {
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const entries = await response.json();
      const backendRows = entries.map(normalizeBackendSubmission).filter(Boolean);
      submissions = [...backendRows, ...exampleSubmissions];
      backendStatusMessage = backendRows.length
        ? `Loaded ${backendRows.length} approved backend submission${backendRows.length === 1 ? "" : "s"} from ${backendEnvironment}.`
        : `Backend reachable in ${backendEnvironment}, but no approved supported metric submissions were found. Showing example rows.`;
    } catch (error) {
      submissions = [...exampleSubmissions];
      backendStatusMessage = `Backend unavailable from this page (${error.message}). Showing example rows.`;
    }
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

  function currentFilters() {
    const dataset = document.getElementById("dataset-filter")?.value || "all";
    const type = document.getElementById("type-filter")?.value || "all";
    return { dataset, type };
  }

  function filteredRows() {
    return rankedRows();
  }

  function sortedRows() {
    const rows = filteredRows();
    return rows.sort((a, b) => compareRows(a, b, sortState.key, sortState.direction));
  }

  function renderTable() {
    const tbody = document.getElementById("leaderboard-body");
    if (!tbody) return;
    tbody.textContent = "";

    sortedRows().forEach((row) => {
      const tr = document.createElement("tr");

      const rank = document.createElement("span");
      rank.className = "leaderboard-rank";
      rank.textContent = row.rank;
      tr.appendChild(tableCell("Rank", rank));

      tr.appendChild(tableCell("Model", row.model, "leaderboard-model"));
      tr.appendChild(tableCell("Type", row.type, "leaderboard-type-cell"));
      tr.lastElementChild.innerHTML = `<span class="leaderboard-type">${row.type}</span>`;
      tr.appendChild(tableCell("Dataset", row.dataset, "leaderboard-dataset-cell"));
      tr.lastElementChild.innerHTML = `<span class="leaderboard-dataset">${row.dataset}</span>`;
      tr.appendChild(tableCell("Surface pressure dim. rel L2 (%)", formatNumber(row.surfacePressure, 2)));
      tr.appendChild(tableCell("Surface pressure dim. rel L1 (%)", formatNumber(row.surfacePressureL1, 2)));
      tr.appendChild(tableCell("Surface tau wall dim. rel L2 (%)", formatNumber(row.surfaceTau, 2)));
      tr.appendChild(tableCell("Surface tau wall dim. rel L1 (%)", formatNumber(row.surfaceTauL1, 2)));
      tr.appendChild(tableCell("Volume velocity dim. rel L2 (%)", formatNumber(row.volumeVelocity, 2)));
      tr.appendChild(tableCell("Volume velocity dim. rel L1 (%)", formatNumber(row.volumeVelocityL1, 2)));
      tr.appendChild(tableCell("Volume pressure dim. rel L2 (%)", formatNumber(row.volumePressure, 2)));
      tr.appendChild(tableCell("Volume pressure dim. rel L1 (%)", formatNumber(row.volumePressureL1, 2)));
      tr.appendChild(tableCell("Cd R2", formatNumber(row.r2Cd, 3)));
      tr.appendChild(tableCell("Cl R2", formatNumber(row.r2Cl, 3)));
      tr.appendChild(tableCell("Velocity profiles R2", formatNumber(row.velocityProfileR2, 3)));
      tr.appendChild(tableCell("Cp cuts R2", formatNumber(row.cpCutR2, 3)));
      tr.appendChild(tableCell("Params (M)", formatNumber(row.params, 2)));
      tr.appendChild(tableCell("Submission date", row.date));
      tr.appendChild(tableCell("Overall score", formatNumber(row.score, 1), "leaderboard-score"));

      const details = document.createElement("a");
      details.className = "leaderboard-detail-link";
      details.href = row.href;
      details.textContent = "Details";
      tr.appendChild(tableCell("Details", details));

      tbody.appendChild(tr);
    });
  }

  function configureSort() {
    document.querySelectorAll(".leaderboard-table th[data-sort]").forEach((th) => {
      th.addEventListener("click", () => {
        const key = th.getAttribute("data-sort");
        if (sortState.key === key) {
          sortState.direction = sortState.direction === "asc" ? "desc" : "asc";
        } else {
          sortState = { key, direction: defaultSortDirection(key) };
        }
        renderTable();
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
      renderDetails();
      syncChartsToDataset();
    });
  }

  function configureFilters() {
    ["dataset-filter", "type-filter"].forEach((id) => {
      document.getElementById(id)?.addEventListener("change", () => {
        renderTable();
        renderDetails();
        syncChartsToDataset();
      });
    });
  }

  function checkedModels(containerId) {
    return Array.from(document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`)).map((input) => input.value);
  }

  function modelPerturbation(modelId, index, scale) {
    const row = submissions.find((entry) => entry.id === modelId);
    const direction = index % 2 === 0 ? 1 : -1;
    const magnitude = row ? (100 - weightedScore(row)) / 100 : 0.2;
    return direction * magnitude * scale * (0.45 + index / 18);
  }

  function cpSeries(modelId) {
    const profile = chartProfile();
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

  function setText(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  }

  function chartRows() {
    return enrichedRows()
      .filter((row) => row.dataset === activeChartDataset)
      .sort((a, b) => compareRows(a, b, primaryRankingKey, defaultSortDirection(primaryRankingKey)));
  }

  function updateCpChart() {
    if (!cpChart) return;
    const profile = chartProfile();
    const models = checkedModels("cp-models");
    cpChart.data.labels = profile.cp.x;
    cpChart.data.datasets = [
      lineDataset("Ground truth", profile.cp.groundTruth, palette.groundTruth, false),
      ...models.map((modelId, index) => {
        const row = submissions.find((entry) => entry.id === modelId);
        return lineDataset(row?.model || modelId, cpSeries(modelId), modelColor(modelId, index), true);
      }),
    ];
    cpChart.options.scales.x.title.text = profile.cpXTitle;
    cpChart.update();
  }

  function updateVelocityChart() {
    if (!velocityChart) return;
    const profile = chartProfile();
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

  function renderModelToggles(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.textContent = "";

    chartRows()
      .slice(0, 6)
      .forEach((row, index) => {
        const label = document.createElement("label");
        label.className = "chart-chip";
        label.innerHTML = `<input type="checkbox" value="${row.id}" ${index < 3 ? "checked" : ""}> ${row.model}`;
        label.querySelector("input").addEventListener("change", () => {
          if (containerId === "cp-models") updateCpChart();
          if (containerId === "velocity-models") updateVelocityChart();
        });
        container.appendChild(label);
      });
  }

  function syncChartsToDataset() {
    activeChartDataset = selectedDatasetForCharts();
    const profile = chartProfile();
    if (!profile.velocityStations[activeStation]) {
      activeStation = Object.keys(profile.velocityStations)[0];
    }

    setText("cp-panel-title", profile.cpTitle);
    setText("cp-panel-description", profile.cpDescription);
    setText("velocity-panel-title", profile.velocityTitle);
    setText("velocity-panel-description", profile.velocityDescription);
    document.querySelectorAll(".station-toggle").forEach((button) => {
      button.classList.toggle("active", button.getAttribute("data-station") === activeStation);
    });
    renderModelToggles("cp-models");
    renderModelToggles("velocity-models");
    updateCpChart();
    updateVelocityChart();
  }

  function configureCharts() {
    if (!window.Chart) return;

    const cpCanvas = document.getElementById("cp-chart");
    if (cpCanvas) {
      const profile = chartProfile();
      cpChart = new Chart(cpCanvas, {
        type: "line",
        data: { labels: profile.cp.x, datasets: [] },
        options: baseChartOptions("Cp", profile.cpXTitle),
      });
    }

    const velocityCanvas = document.getElementById("velocity-chart");
    if (velocityCanvas) {
      const station = chartProfile().velocityStations[activeStation];
      velocityChart = new Chart(velocityCanvas, {
        type: "line",
        data: { labels: station.z, datasets: [] },
        options: baseChartOptions("U / U∞", chartProfile().velocityXTitle || "z/H"),
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

    syncChartsToDataset();
  }

  function formValue(form, name) {
    return form.elements[name]?.value?.trim() || "";
  }

  function numberFormValue(form, name) {
    return Number(formValue(form, name));
  }

  function setSubmitStatus(message, isError) {
    const status = document.getElementById("submission-form-status");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("error", Boolean(isError));
  }

  function submissionPayload(form) {
    return {
      model: formValue(form, "model"),
      model_type: formValue(form, "model_type"),
      dataset: formValue(form, "dataset"),
      parameter_count: numberFormValue(form, "parameter_count"),
      surface_pressure_l2: numberFormValue(form, "surface_pressure_l2"),
      surface_pressure_l1: numberFormValue(form, "surface_pressure_l1"),
      surface_tau_l2: numberFormValue(form, "surface_tau_l2"),
      surface_tau_l1: numberFormValue(form, "surface_tau_l1"),
      volume_velocity_l2: numberFormValue(form, "volume_velocity_l2"),
      volume_velocity_l1: numberFormValue(form, "volume_velocity_l1"),
      volume_pressure_l2: numberFormValue(form, "volume_pressure_l2"),
      volume_pressure_l1: numberFormValue(form, "volume_pressure_l1"),
      r2_cd: numberFormValue(form, "r2_cd"),
      r2_cl: numberFormValue(form, "r2_cl"),
      velocity_profile_r2: numberFormValue(form, "velocity_profile_r2"),
      cp_cut_r2: numberFormValue(form, "cp_cut_r2"),
      submitter_name: formValue(form, "submitter_name"),
      contact_email: formValue(form, "contact_email"),
      institution: formValue(form, "institution"),
      paper_url: formValue(form, "paper_url"),
      code_url: formValue(form, "code_url"),
    };
  }

  async function uploadTrace(uploadUrl, file) {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/zip" },
      body: file,
    });
    if (!response.ok) throw new Error(`trace upload failed with HTTP ${response.status}`);
  }

  async function submitResult(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');
    const traceFile = form.elements.trace_file?.files?.[0];
    if (!traceFile) {
      setSubmitStatus("Choose a .zip trace file before submitting.", true);
      return;
    }

    submitButton.disabled = true;
    setSubmitStatus("Submitting metadata...", false);

    try {
      const response = await fetch(submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionPayload(form)),
      });
      const responseBody = await response.json().catch(() => ({}));
      if (response.status !== 201) {
        throw new Error(responseBody.error || `metadata submission failed with HTTP ${response.status}`);
      }

      setSubmitStatus("Uploading trace archive...", false);
      await uploadTrace(responseBody.upload_url, traceFile);
      setSubmitStatus(`Submission ${responseBody.submission_id} received. It will appear in the table after approval.`, false);
      form.reset();
    } catch (error) {
      setSubmitStatus(error.message, true);
    } finally {
      submitButton.disabled = false;
    }
  }

  function configureSubmissionForm() {
    const openButton = document.getElementById("open-submission-form");
    const dialog = document.getElementById("submission-dialog");
    const closeButton = document.getElementById("close-submission-form");
    const form = document.getElementById("leaderboard-submission-form");

    openButton?.addEventListener("click", () => {
      setSubmitStatus("", false);
      if (form?.elements.dataset && datasetProfiles[selectedDatasetForCharts()]) {
        form.elements.dataset.value = selectedDatasetForCharts();
      }
      if (dialog?.showModal) {
        dialog.showModal();
      } else {
        dialog?.setAttribute("open", "open");
      }
    });

    closeButton?.addEventListener("click", () => dialog?.close());
    form?.addEventListener("submit", submitResult);
  }

  function renderDetails() {
    const container = document.getElementById("submission-detail-grid");
    if (!container) return;
    container.textContent = "";

    sortedRows().forEach((row) => {
      const card = document.createElement("section");
      card.className = "submission-card";
      card.id = row.href.replace("#", "");
      const links = [
        row.paperUrl ? `<a href="${row.paperUrl}" target="_blank" rel="noopener">Paper</a>` : "",
        row.codeUrl ? `<a href="${row.codeUrl}" target="_blank" rel="noopener">Code</a>` : "",
      ]
        .filter(Boolean)
        .join(" ");
      card.innerHTML = `
        <h4>${row.model}</h4>
        <p>${row.note}</p>
        ${links ? `<p class="submission-card-links">${links}</p>` : ""}
      `;
      container.appendChild(card);
    });
  }

  async function initLeaderboard() {
    renderBackendStatus();
    configureSort();
    configurePrimaryRanking();
    configureFilters();
    configureSubmissionForm();
    await loadBackendSubmissions();
    renderBackendStatus();
    renderTable();
    renderDetails();
    configureCharts();
  }

  window.addEventListener("load", initLeaderboard);
})();

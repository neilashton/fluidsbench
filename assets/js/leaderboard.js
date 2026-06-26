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

  const submissions = [
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
  ];

  const cpProfile = {
    x: [0, 0.05, 0.1, 0.18, 0.28, 0.4, 0.52, 0.64, 0.76, 0.86, 0.94, 1],
    groundTruth: [0.78, 0.42, 0.08, -0.1, -0.22, -0.3, -0.34, -0.31, -0.22, -0.05, 0.16, 0.02],
  };

  const velocityStations = {
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
  };

  let sortState = { key: "score", direction: "desc" };
  let primaryRankingKey = "score";
  let cpChart = null;
  let velocityChart = null;
  let activeStation = "0.25L";

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
      surfacePressureL1: estimatedRelL1(row, "surfacePressure"),
      surfaceTauL1: estimatedRelL1(row, "surfaceTau"),
      volumeVelocityL1: estimatedRelL1(row, "volumeVelocity"),
      volumePressureL1: estimatedRelL1(row, "volumePressure"),
      forceR2: forceR2(row),
      score: weightedScore(row),
    }));
  }

  function rankedRows() {
    return enrichedRows()
      .sort((a, b) => compareRows(a, b, primaryRankingKey, defaultSortDirection(primaryRankingKey)))
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }

  function formatNumber(value, digits) {
    return Number(value).toFixed(digits);
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
    const filters = currentFilters();
    return rankedRows().filter((row) => {
      const datasetMatch = filters.dataset === "all" || row.dataset === filters.dataset;
      const typeMatch = filters.type === "all" || row.type === filters.type;
      return datasetMatch && typeMatch;
    });
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
    });
  }

  function configureFilters() {
    ["dataset-filter", "type-filter"].forEach((id) => {
      document.getElementById(id)?.addEventListener("change", renderTable);
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
    return cpProfile.groundTruth.map((value, index) => value + modelPerturbation(modelId, index, 0.22));
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

  function updateCpChart() {
    if (!cpChart) return;
    const models = checkedModels("cp-models");
    cpChart.data.datasets = [
      lineDataset("Ground truth", cpProfile.groundTruth, palette.groundTruth, false),
      ...models.map((modelId) => {
        const row = submissions.find((entry) => entry.id === modelId);
        return lineDataset(row.model, cpSeries(modelId), palette[modelId], true);
      }),
    ];
    cpChart.update();
  }

  function updateVelocityChart() {
    if (!velocityChart) return;
    const station = velocityStations[activeStation];
    const models = checkedModels("velocity-models");
    document.getElementById("velocity-station-label").textContent = station.label;
    velocityChart.data.labels = station.z;
    velocityChart.data.datasets = [
      lineDataset("Ground truth", station.groundTruth, palette.groundTruth, false),
      ...models.map((modelId) => {
        const row = submissions.find((entry) => entry.id === modelId);
        return lineDataset(row.model, velocitySeries(modelId, station), palette[modelId], true);
      }),
    ];
    velocityChart.update();
  }

  function renderModelToggles(containerId, defaults) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.textContent = "";

    enrichedRows()
      .slice(0, 6)
      .forEach((row) => {
        const label = document.createElement("label");
        label.className = "chart-chip";
        label.innerHTML = `<input type="checkbox" value="${row.id}" ${defaults.includes(row.id) ? "checked" : ""}> ${row.model}`;
        label.querySelector("input").addEventListener("change", () => {
          if (containerId === "cp-models") updateCpChart();
          if (containerId === "velocity-models") updateVelocityChart();
        });
        container.appendChild(label);
      });
  }

  function configureCharts() {
    if (!window.Chart) return;

    renderModelToggles("cp-models", ["ab-upt", "transformer", "transolver"]);
    renderModelToggles("velocity-models", ["ab-upt", "transformer", "transolver"]);

    const cpCanvas = document.getElementById("cp-chart");
    if (cpCanvas) {
      cpChart = new Chart(cpCanvas, {
        type: "line",
        data: { labels: cpProfile.x, datasets: [] },
        options: baseChartOptions("Cp", "x/L along Ahmed body centreline"),
      });
      updateCpChart();
    }

    const velocityCanvas = document.getElementById("velocity-chart");
    if (velocityCanvas) {
      const station = velocityStations[activeStation];
      velocityChart = new Chart(velocityCanvas, {
        type: "line",
        data: { labels: station.z, datasets: [] },
        options: baseChartOptions("U / U∞", "z/H"),
      });
      updateVelocityChart();
    }

    document.querySelectorAll(".station-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        activeStation = button.getAttribute("data-station");
        document.querySelectorAll(".station-toggle").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        updateVelocityChart();
      });
    });
  }

  function renderDetails() {
    const container = document.getElementById("submission-detail-grid");
    if (!container) return;
    container.textContent = "";

    enrichedRows().forEach((row) => {
      const card = document.createElement("section");
      card.className = "submission-card";
      card.id = row.href.replace("#", "");
      card.innerHTML = `
        <h4>${row.model}</h4>
        <p>${row.note}</p>
      `;
      container.appendChild(card);
    });
  }

  function initLeaderboard() {
    renderTable();
    configureSort();
    configurePrimaryRanking();
    configureFilters();
    renderDetails();
    configureCharts();
  }

  window.addEventListener("load", initLeaderboard);
})();

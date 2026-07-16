(function () {
  "use strict";

  const baseUrl = window.FluidsBenchLeaderboardBaseUrl;
  const manifestUrl = window.FluidsBenchLeaderboardManifestUrl;
  const groundTruthBaseUrl = window.FluidsBenchDiagnosticGroundTruthBaseUrl;
  const palette = ["#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#64748b", "#1e40af"];
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
    groundTruthManifest: null,
    groundTruth: new Map(),
    dataset: "",
    split: "",
    modelType: "",
    sortKey: "rank",
    sortDirection: "asc",
    visibleGroups: new Set(),
    comparisonMetric: "",
    scatterX: "",
    scatterY: "",
    panelSelections: new Map(),
    charts: {},
    loadVersion: 0,
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
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function fileUrl(file, root = baseUrl) {
    const normalizedRoot = root.endsWith("/") ? root : `${root}/`;
    return new URL(file, normalizedRoot).href;
  }

  async function fetchJson(url, label) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}`);
    return response.json();
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

  function normalizeRow(entry) {
    const metricValues = {};
    Object.entries(entry.metric_values || {}).forEach(([metricId, value]) => {
      const number = finiteNumber(value);
      if (number !== null) metricValues[metricId] = number;
    });
    const modelTypes = Array.isArray(entry.model_types) ? entry.model_types.filter(Boolean) : [entry.model_type].filter(Boolean);
    return {
      ...entry,
      id: entry.submission_id || `${entry.dataset}-${entry.split}-${entry.model}`,
      model: entry.model || "Unnamed model",
      modelTypes,
      metricValues,
      parameterCount: finiteNumber(entry.parameter_count) ?? 0,
      submitter: entry.submitter_name || entry.institution || "Unknown submitter",
      date: entry.submitted_at || "",
    };
  }

  async function ensureRows(dataset) {
    if (state.rows.has(dataset.name)) return state.rows.get(dataset.name);
    const payload = await fetchJson(fileUrl(dataset.file), `${dataset.name} leaderboard feed`);
    if (!Array.isArray(payload)) throw new Error(`${dataset.name} leaderboard feed must be an array`);
    const rows = payload.map(normalizeRow);
    state.rows.set(dataset.name, rows);
    return rows;
  }

  async function ensureGroundTruthManifest() {
    if (state.groundTruthManifest) return state.groundTruthManifest;
    state.groundTruthManifest = await fetchJson(fileUrl("manifest.json", groundTruthBaseUrl), "profile ground-truth manifest");
    return state.groundTruthManifest;
  }

  async function ensureGroundTruth(datasetName) {
    if (state.groundTruth.has(datasetName)) return state.groundTruth.get(datasetName);
    const manifest = await ensureGroundTruthManifest();
    const entry = (manifest.datasets || []).find((candidate) => candidate.name === datasetName);
    if (!entry?.file) return null;
    const payload = await fetchJson(fileUrl(entry.file, groundTruthBaseUrl), `${datasetName} ground truth`);
    state.groundTruth.set(datasetName, payload);
    return payload;
  }

  function ranking() {
    return activeDataset()?.ranking || { metric_id: activeMetricDefinitions()[0]?.id, direction: "higher" };
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
    const rank = ranking();
    return allRows
      .slice()
      .sort((a, b) => compareNumbers(a.metricValues[rank.metric_id], b.metricValues[rank.metric_id], rank.direction))
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }

  function filteredRows() {
    const ranked = rowsForActiveSplit().filter((row) => {
      return !state.modelType || row.modelTypes.includes(state.modelType);
    });
    if (state.sortKey === "rank") {
      return ranked.slice().sort((a, b) => (state.sortDirection === "asc" ? a.rank - b.rank : b.rank - a.rank));
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
    const formatted = formatNumber(value, definition?.digits ?? 2);
    if (formatted === "N/A" || !definition?.unit) return formatted;
    return `${formatted}${definition.unit === "%" ? "" : " "}${definition.unit}`;
  }

  function staticHelp(key) {
    const types = Array.from(new Set((state.rows.get(state.dataset) || []).flatMap((row) => row.modelTypes))).join(", ");
    const rankMetric = metricDefinition(ranking().metric_id);
    const trainingLabels = trainingRegimeDefinitions()
      .map((definition) => definition.label)
      .join(", ");
    const definitions = {
      rank: `Official position for this dataset and split, ordered by ${rankMetric?.label || "the ranking metric"}.`,
      model: "Free-text model name supplied with the approved submission.",
      submitter: "Person, research group, institution, or company submitting the result.",
      split: `Official ${state.dataset} benchmark split used for training and evaluation.`,
      modelTypes: `One or more submitted architecture categories. Available here: ${types || "none"}.`,
      training: `How the model was initialized and whether target-dataset training data were used. Supported values: ${trainingLabels}.`,
      parameters: "Submitter-reported trainable parameter count in millions.",
      date: "Date associated with the approved submission.",
      details: "Opens submission metadata, links, and the complete metric list.",
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
    if (column.key === "rank" || ["model", "submitter", "split", "modelTypes", "training", "date"].includes(column.key)) {
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
  }

  function trainingLabel(row) {
    return trainingRegimeDefinition(row.training_regime)?.label || row.training_regime || "Not supplied";
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
      const button = document.createElement("button");
      button.type = "button";
      button.className = "leaderboard-detail-button";
      button.textContent = "Details";
      button.addEventListener("click", () => openDetails(submission));
      cell.appendChild(button);
      return;
    }
    if (column.key === "rank") {
      cell.appendChild(chip("leaderboard-rank", submission.rank));
      return;
    }
    if (column.key === "model") {
      cell.classList.add("leaderboard-model");
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
      cell.textContent = "No approved submissions match this dataset, split, and model type.";
      row.appendChild(cell);
      body.appendChild(row);
      return;
    }

    const columns = activeColumns();
    rows.forEach((submission) => {
      const row = document.createElement("tr");
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

  function comparisonLabel(value, definition) {
    return formatMetric(value, definition);
  }

  function setChartSummary(id, text) {
    const summary = element(id);
    if (summary) summary.textContent = text;
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
    const rowCount = Number(element("comparison-row-count")?.value || 5);
    const rows = rowsForActiveSplit().slice(0, rowCount);
    const directionText = `${definition.direction === "lower" ? "Lower" : "Higher"} is better`;
    const unitText = definition.unit ? ` Values are shown in ${definition.unit}.` : "";
    element("comparison-description").textContent = `${plainMetricLabel(definition)}: ${directionText.toLowerCase()}.${unitText}`;
    const rowsWithValues = rows.filter((row) => finiteNumber(row.metricValues[definition.id]) !== null);
    const bestRow = rowsWithValues
      .slice()
      .sort((a, b) => compareNumbers(a.metricValues[definition.id], b.metricValues[definition.id], definition.direction))[0];
    const bestText = bestRow
      ? ` Best displayed value: ${rowLabel(bestRow)}, ${formatMetric(bestRow.metricValues[definition.id], definition)}.`
      : " No numeric values are available for this selection.";
    canvas.setAttribute("aria-label", `${plainMetricLabel(definition)} comparison for ${state.dataset}, ${state.split}`);
    setChartSummary(
      "comparison-chart-summary",
      `${plainMetricLabel(definition)} bar chart for ${state.dataset}, ${state.split}. ${
        rowsWithValues.length
      } submissions displayed. ${directionText}.${bestText}`
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
    const rows = rowsForActiveSplit();
    const points = rows
      .map((row, index) => ({
        x: scatterValue(row, state.scatterX),
        y: scatterValue(row, state.scatterY),
        row,
        backgroundColor: palette[index % palette.length],
      }))
      .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
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
    setChartSummary("scatter-chart-summary", `Scatter chart for ${state.dataset}, ${state.split}, with ${points.length} submissions.${rangeText}`);
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
  }

  function diagnosticPanelElement(panel, index) {
    const section = document.createElement("section");
    section.className = "leaderboard-panel diagnostic-panel";
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
      <div class="chart-frame">
        <canvas id="profile-${index}-chart" role="img" aria-label="${escapeHtml(
          panel.title
        )}" aria-describedby="profile-${index}-chart-summary"></canvas>
        <p id="profile-${index}-chart-summary" class="leaderboard-sr-only"></p>
      </div>`;
    return section;
  }

  function renderDiagnosticPanels() {
    Object.keys(state.charts)
      .filter((key) => key.startsWith("profile-"))
      .forEach(destroyChart);
    const container = element("leaderboard-diagnostic-panels");
    if (!container) return;
    container.replaceChildren();
    const panels = activeDataset()?.diagnostic_panels || [];
    panels.forEach((panel, index) => {
      container.appendChild(diagnosticPanelElement(panel, index));
      renderPanelControls(index);
      element(`profile-${index}-quantity`)?.addEventListener("change", (event) => {
        panelSelection(panel).quantity = event.target.value;
        renderProfileChart(index);
      });
      element(`profile-${index}-station`)?.addEventListener("change", (event) => {
        panelSelection(panel).station = event.target.value;
        renderProfileChart(index);
      });
    });
    syncDatasetSelects();
    syncSplitSelects();
  }

  function firstNumeric(point, keys) {
    for (const key of keys || []) {
      const value = finiteNumber(point?.[key]);
      if (value !== null) return value;
    }
    return null;
  }

  function seriesQuantityId(series, panel) {
    const candidate = series?.quantity_id || series?.quantity;
    if ((panel.quantities || []).some((quantity) => quantity.id === candidate)) return candidate;
    return panel.quantities?.length === 1 ? panel.quantities[0].id : null;
  }

  function diagnosticSeries(source, panel, stationId, quantity) {
    const series = source?.diagnostics?.[panel.data_key];
    if (!Array.isArray(series)) return null;
    const match = series.find((candidate) => {
      return candidate.station_id === stationId && seriesQuantityId(candidate, panel) === quantity.id;
    });
    if (!match) return null;
    const points = (match.values || [])
      .map((point) => ({ x: firstNumeric(point, panel.x_keys), y: firstNumeric(point, quantity.y_keys) }))
      .filter((point) => point.x !== null && point.y !== null)
      .sort((a, b) => a.x - b.x);
    return points.length ? points : null;
  }

  function renderProfileChart(index) {
    const panel = activeDataset()?.diagnostic_panels?.[index];
    const canvas = element(`profile-${index}-chart`);
    if (!panel || !canvas || typeof Chart === "undefined") return;
    destroyChart(`profile-${index}`);
    const selection = panelSelection(panel);
    const quantity = (panel.quantities || []).find((candidate) => candidate.id === selection.quantity);
    const station = (panel.stations || []).find((candidate) => candidate.id === selection.station);
    if (!quantity || !station) return;

    const datasets = [];
    const groundTruth = state.groundTruth.get(state.dataset);
    const groundTruthPoints = diagnosticSeries(groundTruth, panel, station.id, quantity);
    if (groundTruthPoints) {
      datasets.push({
        label: "Ground truth",
        data: groundTruthPoints,
        borderColor: chartTextColor(),
        backgroundColor: chartTextColor(),
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.18,
      });
    }
    rowsForActiveSplit()
      .slice(0, 6)
      .forEach((row, rowIndex) => {
        const points = diagnosticSeries(row, panel, station.id, quantity);
        if (!points) return;
        datasets.push({
          label: rowLabel(row),
          data: points,
          borderColor: palette[rowIndex % palette.length],
          backgroundColor: palette[rowIndex % palette.length],
          borderWidth: 2,
          borderDash: rowIndex % 2 ? [6, 3] : [],
          pointRadius: 0,
          tension: 0.18,
        });
      });

    const submissionCurveCount = datasets.length - (groundTruthPoints ? 1 : 0);
    canvas.setAttribute("aria-label", `${panel.title}: ${quantity.label} at ${station.label}`);
    setChartSummary(
      `profile-${index}-chart-summary`,
      `${panel.title} for ${state.dataset}, ${state.split}. Showing ${quantity.label} at ${station.label}. ${
        groundTruthPoints ? "Ground truth is included." : "Ground truth is unavailable."
      } ${submissionCurveCount} submission curves are displayed.`
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
  }

  function renderMetricDefinitions() {
    const list = element("metric-definitions-list");
    if (window.MathJax?.typesetClear) window.MathJax.typesetClear([list]);
    list.replaceChildren();
    element("metric-definitions-intro").textContent =
      `Metrics shown for ${state.dataset}. The selected dataset controls the table columns and all chart choices.`;
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
      `Training values accepted by the submission format. Each status is based on the loaded ${state.dataset} data and the selected ${state.split} table.`;
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
          : "Accepted submission value";
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
    return `<div><dt>${renderedLabel}</dt><dd>${escapeHtml(value || "Not supplied")}</dd></div>`;
  }

  function openDetails(row) {
    const dialog = element("details-dialog");
    element("details-dialog-title").textContent = row.model;
    element("details-dialog-subtitle").textContent = `${row.dataset} / ${row.split}`;
    const links = [
      row.paper_url ? `<a href="${escapeHtml(row.paper_url)}" target="_blank" rel="noopener noreferrer">Paper</a>` : "",
      row.code_url ? `<a href="${escapeHtml(row.code_url)}" target="_blank" rel="noopener noreferrer">Code</a>` : "",
    ]
      .filter(Boolean)
      .join(" &middot; ");
    const metricSections = Array.from(detailsMetricGroups(row).entries())
      .map(([group, metrics]) => {
        const values = metrics.map(({ definition, value }) => detailsRow(definition.label, formatMetric(value, definition), true)).join("");
        return `<section><h4>${escapeHtml(group)}</h4><dl>${values}</dl></section>`;
      })
      .join("");
    element("details-dialog-body").innerHTML = `
      <section><h4>Submission</h4><dl>
        ${detailsRow("Submission ID", row.id)}
        ${detailsRow("Submitted by", row.submitter)}
        ${detailsRow("Institution", row.institution)}
        ${detailsRow("Model types", row.modelTypes.join(", "))}
        ${detailsRow("Training", trainingLabel(row))}
        ${detailsRow("Parameters", `${formatNumber(row.parameterCount, 2)} M`)}
        ${detailsRow("Date", row.date)}
      </dl>${links ? `<p>${links}</p>` : ""}${row.note ? `<p>${escapeHtml(row.note)}</p>` : ""}</section>
      ${metricSections}`;
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

  function renderAll() {
    renderColumnToggles();
    renderTable();
    renderTypeFilter();
    renderComparisonControls();
    renderScatterControls();
    renderDiagnosticPanels();
    renderDefinitions();
    renderComparisonChart();
    renderScatterChart();
    (activeDataset()?.diagnostic_panels || []).forEach((_, index) => renderProfileChart(index));
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

  function showDiagnosticWarning(error) {
    const box = element("leaderboard-diagnostic-warning");
    box.hidden = false;
    box.textContent = `Leaderboard results loaded, but reference profile curves are unavailable: ${error.message}`;
  }

  async function setDataset(datasetName) {
    const dataset = datasetEntries().find((candidate) => candidate.name === datasetName);
    if (!dataset) return;
    const version = ++state.loadVersion;
    const previousDataset = state.dataset;
    syncDatasetSelects();
    syncSplitSelects();
    element("leaderboard-error").hidden = true;
    element("leaderboard-diagnostic-warning").hidden = true;
    setLoading(dataset.name);
    const groundTruthRequest = ensureGroundTruth(dataset.name).then(
      (data) => ({ data, error: null }),
      (error) => ({ data: null, error })
    );
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
      initializeVisibleGroups();
      syncDatasetSelects();
      syncSplitSelects();
      element("leaderboard-error").hidden = true;
      renderAll();
      groundTruthRequest.then((result) => {
        if (version !== state.loadVersion || state.dataset !== dataset.name) return;
        if (result.error) showDiagnosticWarning(result.error);
        else {
          element("leaderboard-diagnostic-warning").hidden = true;
          (activeDataset()?.diagnostic_panels || []).forEach((_, index) => renderProfileChart(index));
        }
      });
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
    state.split = splitName;
    syncSplitSelects();
    state.sortKey = "rank";
    state.sortDirection = "asc";
    renderAll();
  }

  function configureEvents() {
    document.addEventListener("change", (event) => {
      if (event.target.matches("[data-leaderboard-dataset-select]")) setDataset(event.target.value);
      else if (event.target.matches("[data-leaderboard-split-select]")) setSplit(event.target.value);
    });
    element("type-filter")?.addEventListener("change", (event) => {
      state.modelType = event.target.value;
      renderTable();
    });
    element("comparison-metric")?.addEventListener("change", (event) => {
      state.comparisonMetric = event.target.value;
      renderComparisonChart();
    });
    element("comparison-row-count")?.addEventListener("change", renderComparisonChart);
    element("scatter-x-axis")?.addEventListener("change", (event) => {
      state.scatterX = event.target.value;
      renderScatterChart();
    });
    element("scatter-y-axis")?.addEventListener("change", (event) => {
      state.scatterY = event.target.value;
      renderScatterChart();
    });
    element("close-details-dialog")?.addEventListener("click", () => element("details-dialog").close());
    element("details-dialog")?.addEventListener("click", (event) => {
      if (event.target === event.currentTarget) event.currentTarget.close();
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
      state.manifest = await fetchJson(manifestUrl, "leaderboard manifest");
      if (!Array.isArray(state.manifest.metric_definitions) || !Array.isArray(state.manifest.training_regimes) || !datasetEntries().length) {
        throw new Error("manifest is missing dataset-driven leaderboard definitions");
      }
      state.metrics = new Map(state.manifest.metric_definitions.map((definition) => [definition.id, definition]));
      const initial = datasetEntries()[0];
      await setDataset(initial.name);
    } catch (error) {
      showError(error);
      console.error(error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
})();

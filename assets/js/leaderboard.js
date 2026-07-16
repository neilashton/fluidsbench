(function () {
  "use strict";

  const baseUrl = window.FluidsBenchLeaderboardBaseUrl;
  const manifestUrl = window.FluidsBenchLeaderboardManifestUrl;
  const groundTruthBaseUrl = window.FluidsBenchProfileGroundTruthBaseUrl;
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
    groundTruthIndexes: new Map(),
    groundTruthChunks: new Map(),
    profileIndexes: new Map(),
    profileChunks: new Map(),
    dataset: "",
    split: "",
    modelType: "",
    sortKey: "rank",
    sortDirection: "asc",
    visibleGroups: new Set(),
    comparisonMetric: "",
    comparisonRowCount: 5,
    scatterX: "",
    scatterY: "",
    panelSelections: new Map(),
    profileCaseIds: [],
    profileCase: "",
    groundTruthCase: null,
    profileCases: new Map(),
    charts: {},
    loadVersion: 0,
    profileLoadVersion: 0,
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

  function dataRelease() {
    return state.manifest?.data_release || {};
  }

  function activeSplitDefinition() {
    return splitOptions().find((split) => split.name === state.split);
  }

  function viewSearchParams() {
    const params = new URLSearchParams();
    const dataset = activeDataset();
    const split = activeSplitDefinition();
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
    if (state.comparisonMetric) params.set("comparison", state.comparisonMetric);
    params.set("comparison_count", String(state.comparisonRowCount));
    if (state.scatterX) params.set("scatter_x", state.scatterX);
    if (state.scatterY) params.set("scatter_y", state.scatterY);
    if (state.profileCase) params.set("case", state.profileCase);
    (dataset?.diagnostic_panels || []).forEach((panel) => {
      const selection = panelSelection(panel);
      if (selection.quantity) params.set(`quantity_${panel.id}`, selection.quantity);
      if (selection.station) params.set(`station_${panel.id}`, selection.station);
    });
    return params;
  }

  function readUrlState() {
    const params = new URLSearchParams(window.location.search);
    return {
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
      comparisonMetric: params.get("comparison") || "",
      comparisonRowCount: Number(params.get("comparison_count")),
      scatterX: params.get("scatter_x") || "",
      scatterY: params.get("scatter_y") || "",
      profileCase: params.get("case") || "",
      params,
    };
  }

  function updateUrl() {
    if (!state.dataset) return;
    const query = viewSearchParams().toString();
    window.history.replaceState(null, "", `${window.location.pathname}?${query}${window.location.hash}`);
  }

  function currentViewUrl(canonical = false) {
    const root = canonical && dataRelease().canonical_url ? dataRelease().canonical_url : window.location.href;
    const url = new URL(root, window.location.href);
    url.search = viewSearchParams().toString();
    url.hash = "";
    return url.href;
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

  async function groundTruthIndex(datasetName, splitName) {
    const manifest = await ensureGroundTruthManifest();
    const dataset = (manifest.datasets || []).find((candidate) => candidate.name === datasetName);
    const split = (dataset?.splits || []).find((candidate) => candidate.label === splitName);
    const caseSet = (dataset?.case_sets || []).find((candidate) => candidate.id === split?.case_set_id);
    if (!caseSet?.index_file) throw new Error(`${datasetName} / ${splitName} has no profile ground-truth index`);
    const indexUrl = fileUrl(caseSet.index_file, groundTruthBaseUrl);
    if (!state.groundTruthIndexes.has(indexUrl)) {
      state.groundTruthIndexes.set(indexUrl, await fetchJson(indexUrl, `${datasetName} profile ground-truth index`));
    }
    return { index: state.groundTruthIndexes.get(indexUrl), indexUrl };
  }

  async function submissionProfileIndex(row) {
    const indexFile = row.profile_data?.index_file;
    if (!indexFile) throw new Error(`${rowLabel(row)} has no profile index`);
    const indexUrl = fileUrl(indexFile);
    if (!state.profileIndexes.has(indexUrl)) {
      state.profileIndexes.set(indexUrl, await fetchJson(indexUrl, `${rowLabel(row)} profile index`));
    }
    return { index: state.profileIndexes.get(indexUrl), indexUrl };
  }

  function caseIds(index) {
    return (index?.chunks || []).flatMap((chunk) => chunk.case_ids || []);
  }

  async function indexedProfileCase(context, caseId, cache, label) {
    const entry = (context.index?.chunks || []).find((chunk) => (chunk.case_ids || []).includes(caseId));
    if (!entry) return null;
    const chunkUrl = new URL(entry.file, context.indexUrl).href;
    if (!cache.has(chunkUrl)) cache.set(chunkUrl, await fetchJson(chunkUrl, `${label} profile chunk`));
    return (cache.get(chunkUrl)?.cases || []).find((candidate) => candidate.case_id === caseId) || null;
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

  function safeHttpUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(value, window.location.href);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch (_error) {
      return "";
    }
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

  function renderReleaseMetadata() {
    const release = dataRelease();
    element("leaderboard-release-id").textContent = release.id || "Unversioned";
    const details = [];
    if (release.status) details.push(humanize(release.status));
    if (release.generated_at) details.push(`generated ${formatReleaseDate(release.generated_at)}`);
    if (release.feed_sha256) details.push(`SHA-256 ${release.feed_sha256.slice(0, 12)}...`);
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
    ["export-leaderboard-csv", "export-leaderboard-json", "open-citation-dialog"].forEach((id) => {
      const button = element(id);
      if (button) button.disabled = !state.dataset;
    });
  }

  function csvCell(value) {
    if (value === null || value === undefined) return "";
    const rendered = typeof value === "object" ? JSON.stringify(value) : String(value);
    return /[",\r\n]/.test(rendered) ? `"${rendered.replaceAll('"', '""')}"` : rendered;
  }

  function exportMetadataColumns() {
    return [
      ["release_id", () => dataRelease().id],
      ["feed_sha256", () => dataRelease().feed_sha256],
      ["rank", (row) => row.rank],
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
      ["approval_status", (row) => row.approval?.status],
      ["approved_by", (row) => row.approval?.approved_by],
      ["approved_at", (row) => row.approval?.approved_at],
      ["pull_request_url", (row) => row.approval?.pull_request_url],
      ["paper_url", (row) => row.paper_url],
      ["code_url", (row) => row.code_url],
      ["profile_index_file", (row) => row.profile_data?.index_file],
      ["note", (row) => row.note],
    ];
  }

  function exportFilename(extension) {
    const releaseId = slug(dataRelease().id || "unversioned");
    return `fluidsbench-${slug(state.dataset)}-${slug(state.split)}-${releaseId}.${extension}`;
  }

  function downloadText(filename, content, type) {
    const blob = new Blob([content], { type });
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

  function exportCsv() {
    const metadata = exportMetadataColumns();
    const metrics = activeMetricDefinitions();
    const header = [...metadata.map(([label]) => label), ...metrics.map((definition) => definition.id)];
    const lines = [header.map(csvCell).join(",")];
    filteredRows().forEach((row) => {
      const values = [...metadata.map(([, value]) => value(row)), ...metrics.map((definition) => row.metricValues[definition.id])];
      lines.push(values.map(csvCell).join(","));
    });
    downloadText(exportFilename("csv"), `${lines.join("\n")}\n`, "text/csv;charset=utf-8");
  }

  function sourceSubmission(row) {
    const { id, rank, metricValues, modelTypes, parameterCount, submitter, date, ...source } = row;
    return { rank, ...source };
  }

  function exportJson() {
    const payload = {
      schema_version: "fluidsbench-leaderboard-export-v1",
      exported_at: new Date().toISOString(),
      data_release: dataRelease(),
      view: {
        url: currentViewUrl(true),
        dataset: state.dataset,
        split: state.split,
        split_id: activeSplitDefinition()?.id || null,
        model_type: state.modelType || null,
        ranking: ranking(),
        sort: { key: state.sortKey, direction: state.sortDirection },
        visible_column_groups: Array.from(state.visibleGroups),
      },
      metric_definitions: activeMetricDefinitions(),
      submissions: filteredRows().map(sourceSubmission),
    };
    downloadText(exportFilename("json"), `${JSON.stringify(payload, null, 2)}\n`, "application/json;charset=utf-8");
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
    const url = currentViewUrl(true);
    const context = `${state.dataset}, ${state.split}`;
    return {
      plain: `${author} (${year}). ${title}: ${context}. ${publisher}, data release ${releaseId}, feed SHA-256 ${checksum}. ${url}`,
      bibtex: `@misc{fluidsbench_${slug(state.dataset).replaceAll(
        "-",
        "_"
      )}_${year},\n  author = {${author}},\n  title = {${title}: ${context}},\n  year = {${year}},\n  publisher = {${publisher}},\n  url = {${url}},\n  note = {Data release ${releaseId}; feed SHA-256 ${checksum}}\n}`,
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
    updateUrl();
  }

  function trainingLabel(row) {
    return trainingRegimeDefinition(row.training_regime)?.label || row.training_regime || "Not supplied";
  }

  function targetDataLabel(value) {
    const labels = {
      none: "None",
      official_train: "Official training data for this split",
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
    const rowCountSelect = element("comparison-row-count");
    if (rowCountSelect) rowCountSelect.value = String(state.comparisonRowCount);
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

  function topRowsForMetric(rows, definition, count) {
    return rows
      .filter((row) => finiteNumber(row.metricValues[definition.id]) !== null)
      .sort((a, b) => compareNumbers(a.metricValues[definition.id], b.metricValues[definition.id], definition.direction))
      .slice(0, count);
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
    const rowCount = state.comparisonRowCount;
    const rows = topRowsForMetric(rowsForActiveSplit(), definition, rowCount);
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
            <label class="chart-control-title" for="profile-${index}-case">Test geometry</label>
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
      <div class="chart-frame">
        <p id="profile-${index}-status" class="profile-chart-status" role="status">Loading profile data...</p>
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
  }

  function profileSeries(source, panel, stationId, quantity) {
    const match = (source?.series || []).find((candidate) => {
      return candidate.panel_id === panel.id && candidate.station_id === stationId && candidate.quantity_id === quantity.id;
    });
    if (!match) return null;
    const values = match.prediction || match.value || [];
    const points = (match.coordinate || [])
      .map((coordinate, index) => ({ x: finiteNumber(coordinate), y: finiteNumber(values[index]) }))
      .filter((point) => point.x !== null && point.y !== null)
      .sort((a, b) => a.x - b.x);
    return points.length ? points : null;
  }

  async function refreshProfileContext() {
    const dataset = activeDataset();
    if (!dataset || !state.split) return;
    const version = ++state.profileLoadVersion;
    const rows = rowsForActiveSplit().slice(0, 6);
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
        setProfileStatus("No profile cases are available for this dataset and split.");
        dataset.diagnostic_panels.forEach((_, index) => renderProfileChart(index));
        return;
      }

      const groundTruthRequest = groundTruthContext
        ? indexedProfileCase(groundTruthContext, state.profileCase, state.groundTruthChunks, `${state.dataset} ground truth`)
        : Promise.resolve(null);
      const rowRequests = rows.map(async (row) => {
        try {
          const context = await submissionProfileIndex(row);
          const value = await indexedProfileCase(context, state.profileCase, state.profileChunks, rowLabel(row));
          return [row.id, value];
        } catch (error) {
          console.error(error);
          return [row.id, null];
        }
      });
      const [groundTruthCase, rowCases] = await Promise.all([groundTruthRequest, Promise.all(rowRequests)]);
      if (version !== state.profileLoadVersion) return;
      state.groundTruthCase = groundTruthCase;
      state.profileCases = new Map(rowCases);
      if (!groundTruthError) element("leaderboard-profile-warning").hidden = true;
      setProfileStatus("");
      dataset.diagnostic_panels.forEach((_, index) => renderProfileChart(index));
    } catch (error) {
      if (version !== state.profileLoadVersion) return;
      state.groundTruthCase = null;
      state.profileCases = new Map();
      setProfileStatus(`Profile data could not be loaded: ${error.message}`);
      showProfileWarning(error);
      console.error(error);
    }
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
    const groundTruthPoints = profileSeries(state.groundTruthCase, panel, station.id, quantity);
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
        const points = profileSeries(state.profileCases.get(row.id), panel, station.id, quantity);
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

  function openDetails(row) {
    const dialog = element("details-dialog");
    element("details-dialog-title").textContent = row.model;
    element("details-dialog-subtitle").textContent = `${row.dataset} / ${row.split}`;
    const links = [detailsLink("Paper", row.paper_url), detailsLink("Code", row.code_url)].filter(Boolean).join(" &middot; ");
    const evaluationLinks = [detailsLink("Evaluation evidence", evaluationEvidenceUrl(row))].filter(Boolean).join(" &middot; ");
    const approvalLinks = [detailsLink("Approval pull request", row.approval?.pull_request_url)].filter(Boolean).join(" &middot; ");
    const metricSections = Array.from(detailsMetricGroups(row).entries())
      .map(([group, metrics]) => {
        const values = metrics.map(({ definition, value }) => detailsRow(definition.label, formatMetric(value, definition), true)).join("");
        return `<section><h4>${escapeHtml(group)}</h4><dl>${values}</dl></section>`;
      })
      .join("");
    element("details-dialog-body").innerHTML = `
      <section><h4>Submission</h4><dl>
        ${detailsRow("Submission ID", row.id)}
        ${detailsRow("Dataset version", row.dataset_version)}
        ${detailsRow("Split ID", row.split_id)}
        ${detailsRow("Submitted by", row.submitter)}
        ${detailsRow("Institution", row.institution)}
        ${detailsRow("Model types", row.modelTypes.join(", "))}
        ${detailsRow("Parameters", `${formatNumber(row.parameterCount, 2)} M`)}
        ${detailsRow("Date", row.date)}
      </dl>${links ? `<p>${links}</p>` : ""}${row.note ? `<p>${escapeHtml(row.note)}</p>` : ""}</section>
      <section><h4>Training</h4><dl>
        ${detailsRow("Regime", trainingLabel(row))}
        ${detailsRow("Target-dataset data", targetDataLabel(row.target_data_used))}
        ${detailsRow("External pretraining", row.external_pretraining === true ? "Yes" : row.external_pretraining === false ? "No" : "Not supplied")}
        ${detailsRow("Pretraining data", pretrainingDataLabel(row.pretraining_data))}
        ${detailsRow("Protocol explanation", row.training_regime_explanation)}
      </dl></section>
      <section><h4>Evaluation provenance</h4><dl>
        ${detailsRow("Reference version", row.evaluation?.reference_version)}
        ${detailsRow("Code revision", row.evaluation?.code_revision)}
        ${detailsRow("Evaluation command", row.evaluation?.command)}
        ${detailsRow("Evidence file", row.evaluation?.evidence_file)}
        ${detailsRow("Evidence SHA-256", row.evaluation?.evidence_sha256)}
        ${detailsRow("Profile case set", row.profile_data?.case_set_id)}
        ${detailsRow("Profile case count", row.profile_data?.case_count)}
      </dl>${evaluationLinks ? `<p>${evaluationLinks}</p>` : ""}</section>
      <section><h4>Approval</h4><dl>
        ${detailsRow("Status", humanize(row.approval?.status))}
        ${detailsRow("Reviewed by", row.approval?.approved_by)}
        ${detailsRow("Approval date", row.approval?.approved_at)}
        ${detailsRow("Approval note", row.approval?.note)}
      </dl>${approvalLinks ? `<p>${approvalLinks}</p>` : ""}</section>
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
    if ([3, 5, 10].includes(restored.comparisonRowCount)) state.comparisonRowCount = restored.comparisonRowCount;

    const scatterIds = new Set(scatterDefinitions().map((definition) => definition.id));
    if (scatterIds.has(restored.scatterX)) state.scatterX = restored.scatterX;
    if (scatterIds.has(restored.scatterY)) state.scatterY = restored.scatterY;
    state.profileCase = restored.profileCase;

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
    renderTypeFilter();
    renderComparisonControls();
    renderScatterControls();
    renderDiagnosticPanels();
    renderDefinitions();
    renderComparisonChart();
    renderScatterChart();
    (activeDataset()?.diagnostic_panels || []).forEach((_, index) => renderProfileChart(index));
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
      state.comparisonRowCount = 5;
      state.scatterX = "";
      state.scatterY = dataset.ranking?.metric_id || "";
      state.profileCaseIds = [];
      state.profileCase = "";
      state.groundTruthCase = null;
      state.profileCases = new Map();
      initializeVisibleGroups();
      applyRestoredState(restored);
      syncDatasetSelects();
      syncSplitSelects();
      element("leaderboard-error").hidden = true;
      renderAll();
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
    state.split = splitName;
    syncSplitSelects();
    state.sortKey = "rank";
    state.sortDirection = "asc";
    state.profileCaseIds = [];
    state.profileCase = "";
    state.groundTruthCase = null;
    state.profileCases = new Map();
    renderAll();
    updateUrl();
  }

  function configureEvents() {
    document.addEventListener("change", (event) => {
      if (event.target.matches("[data-leaderboard-dataset-select]")) setDataset(event.target.value);
      else if (event.target.matches("[data-leaderboard-split-select]")) setSplit(event.target.value);
      else if (event.target.matches("[data-profile-case-select]")) {
        state.profileCase = event.target.value;
        syncProfileCaseSelects();
        void refreshProfileContext();
        updateUrl();
      }
    });
    element("type-filter")?.addEventListener("change", (event) => {
      state.modelType = event.target.value;
      renderTable();
      updateUrl();
    });
    element("comparison-metric")?.addEventListener("change", (event) => {
      state.comparisonMetric = event.target.value;
      renderComparisonChart();
      updateUrl();
    });
    element("comparison-row-count")?.addEventListener("change", (event) => {
      state.comparisonRowCount = Number(event.target.value);
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
    element("open-citation-dialog")?.addEventListener("click", openCitationDialog);
    element("copy-citation-text")?.addEventListener("click", () => void copyCitation("plain"));
    element("copy-citation-bibtex")?.addEventListener("click", () => void copyCitation("bibtex"));
    element("close-details-dialog")?.addEventListener("click", () => element("details-dialog").close());
    element("details-dialog")?.addEventListener("click", (event) => {
      if (event.target === event.currentTarget) event.currentTarget.close();
    });
    element("close-citation-dialog")?.addEventListener("click", () => element("citation-dialog").close());
    element("citation-dialog")?.addEventListener("click", (event) => {
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
      const restored = readUrlState();
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

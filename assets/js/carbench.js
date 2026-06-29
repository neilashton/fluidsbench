// CarBench leaderboard view.
//
// Renders the CarBench results (DrivAerNet++ surface-pressure prediction) from the SHARED
// FluidsBench backend — the same fetch Lambda the main leaderboard uses — filtered to rows
// tagged benchmark == "CarBench". Columns are driven by the metric registry (_data/metrics.yml),
// injected into the page as window.FB_METRICS, so this view needs no hard-coded column list.
//
// The pure helpers are exported for Node-based unit tests; the DOM bootstrap runs only in a
// browser. Reuses the existing .leaderboard-table styles for visual consistency.
(function (root) {
  "use strict";

  var DATASET = "DrivAerNet++";
  var BENCHMARK = "CarBench";

  // Shared backend fetch endpoints (same URLs the main leaderboard.js uses).
  var backendFetchUrls = {
    dev: "https://ezmaejyn7i7f4djjlgzqycukw40gjojx.lambda-url.us-east-1.on.aws/",
    prod: "https://7qdywdyxlfmc7neivnarewbvpy0gkjvg.lambda-url.us-east-1.on.aws/",
  };

  // ---- pure helpers (unit-tested via Node) ----

  function isCarbenchEntry(entry) {
    if (!entry) return false;
    if (entry.benchmark) return entry.benchmark === BENCHMARK;
    return entry.dataset === DATASET; // fallback for rows imported before the benchmark tag
  }

  function selectCarbenchRows(entries) {
    return (Array.isArray(entries) ? entries : []).filter(isCarbenchEntry);
  }

  function metricEntry(row, id) {
    return row && row.metrics ? row.metrics[id] : undefined;
  }

  function metricValue(row, id) {
    var m = metricEntry(row, id);
    if (!m || m.value === null || m.value === undefined) return null;
    var n = Number(m.value);
    return Number.isFinite(n) ? n : null;
  }

  // Metric ids the registry marks as applicable to DrivAerNet++, in registry order.
  function carbenchMetricIds(registry) {
    return Object.keys(registry || {}).filter(function (id) {
      var spec = registry[id];
      return spec && Array.isArray(spec.datasets) && spec.datasets.indexOf(DATASET) !== -1;
    });
  }

  function formatMetricValue(row, id, registry) {
    var spec = (registry || {})[id] || {};
    var value = metricValue(row, id);
    if (value === null) return "—"; // em dash
    var decimals = typeof spec.decimals === "number" ? spec.decimals : 3;
    var text = value.toFixed(decimals);
    var m = metricEntry(row, id);
    if (m && m.std !== null && m.std !== undefined) {
      text += " ± " + Number(m.std).toFixed(decimals);
    }
    if (spec.unit) text += " " + spec.unit;
    return text;
  }

  function compareRows(a, b, id, registry) {
    var spec = (registry || {})[id] || {};
    var dir = spec.direction === "higher_better" ? -1 : 1; // default lower_better => ascending
    var va = metricValue(a, id);
    var vb = metricValue(b, id);
    if (va === null && vb === null) return 0;
    if (va === null) return 1; // rows missing the sort metric sink to the bottom
    if (vb === null) return -1;
    if (va === vb) return 0;
    return va < vb ? -dir : dir;
  }

  function sortRows(rows, id, registry) {
    return rows.slice().sort(function (a, b) {
      return compareRows(a, b, id, registry);
    });
  }

  var api = {
    DATASET: DATASET,
    BENCHMARK: BENCHMARK,
    isCarbenchEntry: isCarbenchEntry,
    selectCarbenchRows: selectCarbenchRows,
    metricValue: metricValue,
    carbenchMetricIds: carbenchMetricIds,
    formatMetricValue: formatMetricValue,
    compareRows: compareRows,
    sortRows: sortRows,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.CarBench = api;

  // ---- DOM bootstrap (browser only) ----
  if (typeof document === "undefined" || typeof window === "undefined") return;

  var registry = window.FB_METRICS || {};
  var env = ["localhost", "127.0.0.1"].indexOf(window.location.hostname) !== -1 ? "dev" : "prod";
  var fetchUrl = backendFetchUrls[env];
  var state = { rows: [], sortId: "surface_pressure_rel_l2" };

  function setStatus(message) {
    var el = document.getElementById("carbench-status");
    if (el) el.textContent = message;
  }

  function th(label, sortId) {
    var cell = document.createElement("th");
    cell.textContent = label;
    if (sortId) {
      cell.setAttribute("data-sort", sortId);
      cell.style.cursor = "pointer";
      cell.addEventListener("click", function () {
        state.sortId = sortId;
        render();
      });
    }
    return cell;
  }

  function td(value) {
    var cell = document.createElement("td");
    if (value instanceof Node) cell.appendChild(value);
    else cell.textContent = value;
    return cell;
  }

  function buildLinks(row) {
    var span = document.createElement("span");
    [["paper_url", "paper"], ["code_url", "code"]].forEach(function (pair) {
      if (row[pair[0]]) {
        var a = document.createElement("a");
        a.href = row[pair[0]];
        a.textContent = pair[1];
        a.target = "_blank";
        a.rel = "noopener";
        a.style.marginRight = "0.5rem";
        span.appendChild(a);
      }
    });
    return span;
  }

  function render() {
    var table = document.getElementById("carbench-table");
    if (!table) return;
    var metricIds = carbenchMetricIds(registry);
    var rows = sortRows(state.rows, state.sortId, registry);

    var headRow = document.createElement("tr");
    headRow.appendChild(th("Rank"));
    headRow.appendChild(th("Model"));
    headRow.appendChild(th("Type"));
    headRow.appendChild(th("Params (M)"));
    metricIds.forEach(function (id) {
      var spec = registry[id] || {};
      headRow.appendChild(th(spec.display_name || id, id));
    });
    headRow.appendChild(th("Year"));
    headRow.appendChild(th("Links"));

    var body = document.createDocumentFragment();
    rows.forEach(function (row, index) {
      var tr = document.createElement("tr");
      tr.appendChild(td(String(index + 1)));
      tr.appendChild(td(row.model || "—"));
      tr.appendChild(td(row.model_type || "—"));
      tr.appendChild(td(row.parameter_count !== undefined && row.parameter_count !== null
        ? Number(row.parameter_count).toFixed(2)
        : "—"));
      metricIds.forEach(function (id) {
        tr.appendChild(td(formatMetricValue(row, id, registry)));
      });
      tr.appendChild(td(row.year ? String(row.year) : "—"));
      tr.appendChild(td(buildLinks(row)));
      body.appendChild(tr);
    });

    var thead = table.querySelector("thead");
    var tbody = table.querySelector("tbody");
    thead.innerHTML = "";
    thead.appendChild(headRow);
    tbody.innerHTML = "";
    tbody.appendChild(body);
  }

  function load() {
    setStatus("Loading CarBench results from the " + env + " backend…");
    fetch(fetchUrl)
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (entries) {
        state.rows = selectCarbenchRows(entries);
        setStatus(state.rows.length
          ? "Loaded " + state.rows.length + " CarBench submission" + (state.rows.length === 1 ? "" : "s") +
            " on " + DATASET + " (surface pressure)."
          : "Backend reachable, but no approved CarBench submissions were found yet.");
        render();
      })
      .catch(function (error) {
        setStatus("CarBench backend unavailable from this page (" + error.message + ").");
      });
  }

  document.addEventListener("DOMContentLoaded", load);
})(typeof self !== "undefined" ? self : this);

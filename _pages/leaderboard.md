---
layout: page
permalink: /
title: leaderboard
description:
nav: false
hide_header: true
hide_header_background: true
wide: true
chart:
  chartjs: true
  vega_lite: true
---

<div class="leaderboard-page">
  <header class="leaderboard-masthead">
    <h1>FluidsBench Leaderboard</h1>
    <div class="leaderboard-source-row">
      <span id="submission-status" class="leaderboard-submit-status"
        >Submissions remain closed while the open-reproducibility workflow is finalized.</span
      >
      <button
        id="open-submission-repo"
        class="leaderboard-submit-button"
        type="button"
        aria-describedby="submission-status"
        disabled
      >Submit a result - coming soon</button>
    </div>
  </header>

  <aside class="leaderboard-data-warning" role="note" aria-label="Leaderboard data status">
    <strong>Prototype only:</strong> all results currently shown are illustrative dummy data. They are not official, independently replayed results and
    must not be cited or promoted as leaderboard claims. FluidsBench's open reproducibility track will publish all scored ground truth and require open,
    versioned code and model artifacts plus independent maintainer replay before a result becomes official.
  </aside>

  <section class="leaderboard-release-bar" aria-label="Leaderboard data release">
    <div class="leaderboard-release-summary">
      <span class="leaderboard-release-label">Data release</span>
      <strong id="leaderboard-release-id">Loading...</strong>
      <span id="leaderboard-release-meta" class="leaderboard-release-meta"></span>
      <a id="leaderboard-release-source" href="#" target="_blank" rel="noopener noreferrer" hidden>Source</a>
    </div>
    <div class="leaderboard-release-actions" aria-label="Research data actions">
      <label class="leaderboard-export-scope" for="leaderboard-export-scope">
        <span>Table export rows</span>
        <select id="leaderboard-export-scope">
          <option value="current">Current filtered view</option>
          <option value="full">Full selected split</option>
        </select>
      </label>
      <button id="export-leaderboard-csv" class="leaderboard-action-button" type="button" disabled>
        <i class="fa-solid fa-file-csv" aria-hidden="true"></i><span>Table CSV</span>
      </button>
      <button id="export-leaderboard-json" class="leaderboard-action-button" type="button" disabled>
        <i class="fa-solid fa-file-code" aria-hidden="true"></i><span>Table JSON</span>
      </button>
      <button id="open-citation-dialog" class="leaderboard-action-button" type="button" disabled>
        <i class="fa-solid fa-quote-left" aria-hidden="true"></i><span>Cite official release</span>
      </button>
    </div>
    <p id="leaderboard-release-action-status" class="leaderboard-sr-only" role="status"></p>
  </section>
  <div id="leaderboard-release-warning" class="leaderboard-profile-warning" role="alert" hidden></div>

  <section class="leaderboard-controls" aria-label="Leaderboard filters">
    <div class="leaderboard-control">
      <label class="leaderboard-control-title" for="dataset-filter">Dataset</label>
      <select id="dataset-filter" data-leaderboard-dataset-select></select>
    </div>
    <div class="leaderboard-control">
      <label class="leaderboard-control-title" for="split-filter">Split</label>
      <select id="split-filter" data-leaderboard-split-select></select>
    </div>
    <div class="leaderboard-control">
      <label class="leaderboard-control-title" for="type-filter">Model type</label>
      <select id="type-filter"><option value="">All model types</option></select>
    </div>
  </section>

  <fieldset class="leaderboard-model-picker" aria-describedby="comparison-model-description">
    <legend>Models shown in figures</legend>
    <p id="comparison-model-description">
      Request the same models for the comparison, scatter, and profile figures. The first five ranked rows are selected initially; each caption lists
      any requested model that cannot be plotted because the required metric or profile is unavailable. This choice is independent of table-export
      scope. Up to twelve models may be shown at once so colors remain consistent across screen and exported figures.
    </p>
    <div class="leaderboard-model-picker-actions">
      <button id="select-all-comparison-models" class="leaderboard-action-button" type="button">Select up to 12</button>
      <button id="clear-comparison-models" class="leaderboard-action-button" type="button">Clear</button>
      <span id="comparison-model-count" role="status"></span>
    </div>
    <div id="comparison-model-options" class="leaderboard-model-options"></div>
  </fieldset>

  <div id="leaderboard-error" class="leaderboard-load-error" role="alert" hidden></div>
  <div id="leaderboard-load-status" class="leaderboard-load-status" role="status" hidden></div>
  <div id="leaderboard-profile-warning" class="leaderboard-profile-warning" role="status" hidden></div>

  <div class="leaderboard-table-area">
    <div class="leaderboard-table-toolbar" id="leaderboard-column-controls" role="group" aria-label="Visible table column groups">
      <span class="leaderboard-column-controls-label">Columns</span>
      <div class="leaderboard-column-toggles" id="leaderboard-column-toggles"></div>
    </div>
    <section class="leaderboard-table-wrap" aria-label="CFD leaderboard table">
      <table class="leaderboard-table">
        <thead><tr id="leaderboard-header-row"></tr></thead>
        <tbody id="leaderboard-body"></tbody>
      </table>
    </section>
  </div>

  <section class="leaderboard-panel leaderboard-comparison-panel">
    <div class="leaderboard-panel-heading">
      <div>
        <h3>Metric comparison</h3>
        <p id="comparison-description">Compare the leading submissions for one metric.</p>
      </div>
      <div class="chart-control-row">
        <div class="chart-control">
          <label class="chart-control-title" for="comparison-dataset-filter">Dataset</label>
          <select id="comparison-dataset-filter" data-leaderboard-dataset-select></select>
        </div>
        <div class="chart-control">
          <label class="chart-control-title" for="comparison-split-filter">Split</label>
          <select id="comparison-split-filter" data-leaderboard-split-select></select>
        </div>
        <div class="chart-control">
          <label class="chart-control-title" for="comparison-metric">Metric</label>
          <select id="comparison-metric"></select>
        </div>
      </div>
    </div>
    <div class="leaderboard-figure-toolbar" role="group" aria-label="Metric comparison figure actions">
      <button class="leaderboard-action-button" type="button" data-figure-key="comparison" data-figure-format="svg">SVG</button>
      <button class="leaderboard-action-button" type="button" data-figure-key="comparison" data-figure-format="png">High-res PNG</button>
      <button class="leaderboard-action-button" type="button" data-figure-key="comparison" data-figure-format="print">Print / save PDF</button>
      <button class="leaderboard-action-button" type="button" data-copy-caption="comparison">Copy caption</button>
    </div>
    <div class="chart-frame comparison-chart-frame">
      <canvas id="comparison-chart" role="img" aria-label="Leaderboard metric comparison chart" aria-describedby="comparison-chart-summary"></canvas>
      <p id="comparison-chart-summary" class="leaderboard-sr-only"></p>
    </div>
    <p id="comparison-figure-caption" class="leaderboard-figure-caption"></p>
    <details class="leaderboard-numeric-data">
      <summary>View numeric figure data</summary>
      <div id="comparison-data-table" class="leaderboard-data-table-wrap"></div>
    </details>
  </section>

  <section class="leaderboard-panel leaderboard-scatter-panel">
    <div class="leaderboard-panel-heading">
      <div>
        <h3>Metric scatter</h3>
        <p>Choose any two numeric columns available for the selected dataset.</p>
      </div>
      <div class="chart-control-row">
        <div class="chart-control">
          <label class="chart-control-title" for="scatter-dataset-filter">Dataset</label>
          <select id="scatter-dataset-filter" data-leaderboard-dataset-select></select>
        </div>
        <div class="chart-control">
          <label class="chart-control-title" for="scatter-split-filter">Split</label>
          <select id="scatter-split-filter" data-leaderboard-split-select></select>
        </div>
        <div class="chart-control">
          <label class="chart-control-title" for="scatter-x-axis">X axis</label>
          <select id="scatter-x-axis"></select>
        </div>
        <div class="chart-control">
          <label class="chart-control-title" for="scatter-y-axis">Y axis</label>
          <select id="scatter-y-axis"></select>
        </div>
      </div>
    </div>
    <div class="leaderboard-figure-toolbar" role="group" aria-label="Metric scatter figure actions">
      <button class="leaderboard-action-button" type="button" data-figure-key="scatter" data-figure-format="svg">SVG</button>
      <button class="leaderboard-action-button" type="button" data-figure-key="scatter" data-figure-format="png">High-res PNG</button>
      <button class="leaderboard-action-button" type="button" data-figure-key="scatter" data-figure-format="print">Print / save PDF</button>
      <button class="leaderboard-action-button" type="button" data-copy-caption="scatter">Copy caption</button>
    </div>
    <div class="chart-frame scatter-chart-frame">
      <canvas id="scatter-chart" role="img" aria-label="Leaderboard metric scatter chart" aria-describedby="scatter-chart-summary"></canvas>
      <p id="scatter-chart-summary" class="leaderboard-sr-only"></p>
    </div>
    <p id="scatter-figure-caption" class="leaderboard-figure-caption"></p>
    <details class="leaderboard-numeric-data">
      <summary>View numeric figure data</summary>
      <div id="scatter-data-table" class="leaderboard-data-table-wrap"></div>
    </details>
  </section>

  <div id="leaderboard-profile-panels" class="leaderboard-profile-panels"></div>

  <div class="leaderboard-definitions" aria-label="Leaderboard definitions">
    <section class="metric-definitions" id="metric-definitions">
      <h3>Metric definitions</h3>
      <p id="metric-definitions-intro"></p>
      <dl id="metric-definitions-list"></dl>
    </section>

    <section class="metric-definitions" id="split-definitions">
      <h3>Split definitions</h3>
      <p id="split-definitions-intro"></p>
      <dl id="split-definitions-list"></dl>
    </section>

    <section class="metric-definitions" id="training-definitions">
      <h3>Training definitions</h3>
      <p id="training-definitions-intro"></p>
      <dl id="training-definitions-list"></dl>
    </section>

  </div>

  <dialog class="details-dialog" id="details-dialog" aria-labelledby="details-dialog-title">
    <article class="details-dialog-card">
      <div class="details-dialog-header">
        <div>
          <p id="details-dialog-subtitle" class="details-dialog-subtitle"></p>
          <h3 id="details-dialog-title">Submission details</h3>
        </div>
        <button id="close-details-dialog" class="details-dialog-close" type="button" aria-label="Close details">&times;</button>
      </div>
      <div id="details-dialog-body" class="details-dialog-body"></div>
    </article>
  </dialog>

  <dialog class="details-dialog citation-dialog" id="citation-dialog" aria-labelledby="citation-dialog-title">
    <article class="details-dialog-card">
      <div class="details-dialog-header">
        <div>
          <p class="details-dialog-subtitle">Current leaderboard view</p>
          <h3 id="citation-dialog-title">Citation</h3>
        </div>
        <button id="close-citation-dialog" class="details-dialog-close" type="button" aria-label="Close citation">&times;</button>
      </div>
      <div class="citation-dialog-body">
        <section>
          <div class="citation-heading-row">
            <h4>Plain text</h4>
            <button id="copy-citation-text" class="leaderboard-action-button" type="button">
              <i class="fa-solid fa-copy" aria-hidden="true"></i><span>Copy</span>
            </button>
          </div>
          <p id="citation-text" class="citation-text"></p>
        </section>
        <section>
          <div class="citation-heading-row">
            <h4>BibTeX</h4>
            <button id="copy-citation-bibtex" class="leaderboard-action-button" type="button">
              <i class="fa-solid fa-copy" aria-hidden="true"></i><span>Copy</span>
            </button>
          </div>
          <pre class="citation-bibtex"><code id="citation-bibtex"></code></pre>
        </section>
        <p id="citation-copy-status" class="leaderboard-copy-status" role="status"></p>
      </div>
    </article>
  </dialog>

  <div id="column-help-popover" class="column-help-popover" role="dialog" aria-label="Column information" hidden></div>
</div>

<script>
  const localLeaderboard = ["127.0.0.1", "localhost"].includes(window.location.hostname);
  window.FluidsBenchLeaderboardBaseUrl = localLeaderboard
    ? "http://127.0.0.1:4100/"
    : "https://raw.githubusercontent.com/neilashton/fluidsbench-submission/dev/";
  window.FluidsBenchLeaderboardManifestUrl =
    window.FluidsBenchLeaderboardBaseUrl + "leaderboard/manifest.json";
  window.FluidsBenchProfileGroundTruthBaseUrl =
    new URL("{{ '/assets/data/profile-ground-truth/' | relative_url }}", window.location.origin).href;
</script>
<script defer src="{{ '/assets/js/leaderboard.js' | relative_url | bust_file_cache }}"></script>

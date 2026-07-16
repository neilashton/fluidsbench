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
---

<div class="leaderboard-page">
  <header class="leaderboard-masthead">
    <h1>FluidsBench Leaderboard</h1>
    <div class="leaderboard-source-row">
      <span id="submission-status" class="leaderboard-submit-status">Submissions are not yet open.</span>
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
    Work in progress: all results currently shown are illustrative dummy data.
  </aside>

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

  <div id="leaderboard-error" class="leaderboard-load-error" role="alert" hidden></div>
  <div id="leaderboard-load-status" class="leaderboard-load-status" role="status" hidden></div>
  <div id="leaderboard-diagnostic-warning" class="leaderboard-diagnostic-warning" role="status" hidden></div>

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
        <div class="chart-control">
          <label class="chart-control-title" for="comparison-row-count">Top submissions</label>
          <select id="comparison-row-count">
            <option value="3">3</option>
            <option value="5" selected>5</option>
            <option value="10">10</option>
          </select>
        </div>
      </div>
    </div>
    <div class="chart-frame comparison-chart-frame">
      <canvas id="comparison-chart" role="img" aria-label="Leaderboard metric comparison chart" aria-describedby="comparison-chart-summary"></canvas>
      <p id="comparison-chart-summary" class="leaderboard-sr-only"></p>
    </div>
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
    <div class="chart-frame scatter-chart-frame">
      <canvas id="scatter-chart" role="img" aria-label="Leaderboard metric scatter chart" aria-describedby="scatter-chart-summary"></canvas>
      <p id="scatter-chart-summary" class="leaderboard-sr-only"></p>
    </div>
  </section>

  <div id="leaderboard-diagnostic-panels" class="leaderboard-diagnostic-panels"></div>

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

  <div id="column-help-popover" class="column-help-popover" role="dialog" aria-label="Column information" hidden></div>
</div>

<script>
  const localLeaderboard = ["127.0.0.1", "localhost"].includes(window.location.hostname);
  window.FluidsBenchLeaderboardBaseUrl = localLeaderboard
    ? "http://127.0.0.1:4100/"
    : "https://raw.githubusercontent.com/neilashton/fluidsbench-submission/dev/";
  window.FluidsBenchLeaderboardManifestUrl =
    window.FluidsBenchLeaderboardBaseUrl + "leaderboard/manifest.json";
  window.FluidsBenchDiagnosticGroundTruthBaseUrl =
    new URL("{{ '/assets/data/diagnostic-ground-truth/' | relative_url }}", window.location.origin).href;
</script>
<script defer src="{{ '/assets/js/leaderboard.js' | relative_url | bust_file_cache }}"></script>

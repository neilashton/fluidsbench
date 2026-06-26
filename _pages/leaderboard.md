---
layout: page
permalink: /leaderboards/
title: leaderboards
page_title: AhmedML leaderboard
page_description: Example benchmark view for AhmedML neural CFD surrogate submissions.
description:
nav: true
nav_order: 5
chart:
  chartjs: true
---

<div class="leaderboard-page">
  <section>
    <p class="leaderboard-kicker">Prototype leaderboard</p>
    <p class="leaderboard-intro">
      This example uses the AhmedML rows reported in the AB-UPT v2 paper as seed data. Relative L2 values and parameter
      counts are paper-derived; relative L1, force, centerline Cp, and velocity-profile R<sup>2</sup> values are
      placeholders so the scoring and visual workflow can be reviewed before real submissions are wired in. Field error
      metrics are reported on unnormalized physical-space quantities.
    </p>
  </section>

  <p class="leaderboard-note">
    Lower relative L2 error is better. Higher R<sup>2</sup> and overall score are better. Submission date is set to
    2025-06-13, the AB-UPT v2 revision date used for these example rows. Table values come from
    <a href="https://arxiv.org/html/2502.09692v2">AB-UPT v2</a>; plot traces are illustrative Ahmed-body profiles
    informed by the <a href="https://arxiv.org/html/2407.20801">AhmedML paper</a> and should be replaced by evaluator
    exports once those cuts are defined. The submission format and metric definitions are listed on the
    <a href="{{ '/datasets/ahmedml/' | relative_url }}">AhmedML dataset page</a>.
  </p>

  <section class="leaderboard-controls" aria-label="Leaderboard filters">
    <div class="leaderboard-control">
      <label for="dataset-filter">Dataset</label>
      <select id="dataset-filter">
        <option value="all">All datasets</option>
        <option value="AhmedML" selected>AhmedML</option>
      </select>
    </div>
    <div class="leaderboard-control">
      <label for="type-filter">Model type</label>
      <select id="type-filter">
        <option value="all">All model types</option>
        <option value="Transformer">Transformer</option>
        <option value="GNN">GNN</option>
        <option value="Neural operator">Neural operator</option>
        <option value="Point cloud">Point cloud</option>
      </select>
    </div>
    <div class="leaderboard-control">
      <label for="score-sort">Primary ranking</label>
      <select id="score-sort">
        <option value="score" selected>Weighted overall score</option>
        <option value="forceR2">Force R² (Cd/Cl mean)</option>
        <option value="r2Cd">Cd R²</option>
        <option value="r2Cl">Cl R²</option>
        <option value="velocityProfileR2">Velocity profiles R²</option>
        <option value="cpCutR2">Cp cuts R²</option>
        <option value="surfacePressure">Surface pressure dim. rel L2</option>
        <option value="surfacePressureL1">Surface pressure dim. rel L1</option>
        <option value="surfaceTau">Surface tau wall dim. rel L2</option>
        <option value="surfaceTauL1">Surface tau wall dim. rel L1</option>
        <option value="volumeVelocity">Volume velocity dim. rel L2</option>
        <option value="volumeVelocityL1">Volume velocity dim. rel L1</option>
        <option value="volumePressure">Volume pressure dim. rel L2</option>
        <option value="volumePressureL1">Volume pressure dim. rel L1</option>
      </select>
    </div>
  </section>

  <section class="leaderboard-table-wrap" aria-label="AhmedML leaderboard table">
    <table class="leaderboard-table">
      <thead>
        <tr>
          <th data-sort="rank">Rank</th>
          <th data-sort="model">Model</th>
          <th data-sort="type">Type</th>
          <th data-sort="dataset">Dataset</th>
          <th data-sort="surfacePressure">Surface pressure<br>dim. rel L2 (%)</th>
          <th data-sort="surfacePressureL1">Surface pressure<br>dim. rel L1 (%)</th>
          <th data-sort="surfaceTau">Surface tau wall<br>dim. rel L2 (%)</th>
          <th data-sort="surfaceTauL1">Surface tau wall<br>dim. rel L1 (%)</th>
          <th data-sort="volumeVelocity">Volume velocity<br>dim. rel L2 (%)</th>
          <th data-sort="volumeVelocityL1">Volume velocity<br>dim. rel L1 (%)</th>
          <th data-sort="volumePressure">Volume pressure<br>dim. rel L2 (%)</th>
          <th data-sort="volumePressureL1">Volume pressure<br>dim. rel L1 (%)</th>
          <th data-sort="r2Cd">C<sub>d</sub> R<sup>2</sup></th>
          <th data-sort="r2Cl">C<sub>l</sub> R<sup>2</sup></th>
          <th data-sort="velocityProfileR2">Velocity profiles<br>R<sup>2</sup></th>
          <th data-sort="cpCutR2">Cp cuts<br>R<sup>2</sup></th>
          <th data-sort="params">Params (M)</th>
          <th data-sort="date">Submission date</th>
          <th data-sort="score">Overall score</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody id="leaderboard-body"></tbody>
    </table>
  </section>

  <section class="leaderboard-panel">
    <h3>Centreline surface Cp</h3>
    <p>Ground truth versus selected submissions along the Ahmed body centreline.</p>
    <div class="chart-toolbar">
      <div class="chart-options" id="cp-models" aria-label="Cp model toggles"></div>
    </div>
    <div class="chart-frame">
      <canvas id="cp-chart"></canvas>
    </div>
  </section>

  <section class="leaderboard-panel">
    <h3>Velocity profiles</h3>
    <p><span id="velocity-station-label">x/H = 0.25 downstream</span></p>
    <div class="chart-toolbar">
      <div class="chart-options" aria-label="Velocity station toggles">
        <button class="station-toggle active" type="button" data-station="0.25L">0.25L</button>
        <button class="station-toggle" type="button" data-station="0.50L">0.50L</button>
        <button class="station-toggle" type="button" data-station="1.00L">1.00L</button>
      </div>
      <div class="chart-options" id="velocity-models" aria-label="Velocity model toggles"></div>
    </div>
    <div class="chart-frame">
      <canvas id="velocity-chart"></canvas>
    </div>
  </section>

  <section class="submission-details">
    <h3>Submission details</h3>
    <div class="submission-grid" id="submission-detail-grid"></div>
  </section>

  <section class="metric-definitions">
    <h3>Metric definitions</h3>
    <dl>
      <div>
        <dt>Weighted overall score</dt>
        <dd>
          0-100 score combining field accuracy (50%), integrated force R<sup>2</sup> (25%), and diagnostic cut
          R<sup>2</sup> (25%).
        </dd>
      </div>
      <div>
        <dt>Field relative L2 and L1</dt>
        <dd>
          Relative L2 and L1 errors for surface pressure, surface wall shear, volume velocity, and volume pressure after
          mapping predictions and targets back to dimensional physical space. Lower is better. The prototype L1 values are
          illustrative until evaluator exports are available.
        </dd>
      </div>
      <div>
        <dt>Error-to-score caps</dt>
        <dd>
          L2 metrics are mapped to bounded subscores using caps of 15% for surface pressure, 20% for wall shear, 12% for
          volume velocity, and 15% for volume pressure.
        </dd>
      </div>
      <div>
        <dt>Force R<sup>2</sup></dt>
        <dd>Mean of C<sub>d</sub> R<sup>2</sup> and C<sub>l</sub> R<sup>2</sup> over the evaluated cases.</dd>
      </div>
      <div>
        <dt>Velocity profiles R<sup>2</sup></dt>
        <dd>Coefficient of determination for selected wake velocity profiles. The exact profile cuts are still to be defined.</dd>
      </div>
      <div>
        <dt>Cp cuts R<sup>2</sup></dt>
        <dd>Coefficient of determination for selected surface pressure coefficient cuts. The exact surface cuts are still to be defined.</dd>
      </div>
    </dl>
  </section>
</div>

<script defer src="{{ '/assets/js/leaderboard.js' | relative_url | bust_file_cache }}"></script>

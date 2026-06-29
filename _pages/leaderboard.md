---
layout: page
permalink: /leaderboards/
title: leaderboards
description:
nav: true
nav_order: 5
hide_header: true
chart:
  chartjs: true
---

<div class="leaderboard-page">
  <div class="leaderboard-backend-row">
    <p id="leaderboard-backend-status">Loading approved submissions from the leaderboard backend...</p>
    <button id="open-submission-form" class="leaderboard-submit-button" type="button">Submit result</button>
  </div>

  <p class="leaderboard-subnav">
    Looking for the CarBench (DrivAerNet++ surface-pressure) benchmark?
    <a href="{{ '/leaderboards/carbench/' | relative_url }}">View the CarBench leaderboard →</a>
  </p>

  <section class="leaderboard-controls" aria-label="Leaderboard filters">
    <div class="leaderboard-control">
      <span class="leaderboard-control-title" id="dataset-filter-label">Dataset</span>
      <div class="leaderboard-filter-dropdown" id="dataset-filter" data-all-label="All datasets">
        <button
          class="leaderboard-filter-toggle"
          type="button"
          aria-controls="dataset-filter-menu"
          aria-expanded="false"
          aria-haspopup="true"
          data-filter-toggle
        >
          <span data-filter-summary>All datasets</span>
          <span class="leaderboard-filter-caret" aria-hidden="true"></span>
        </button>
        <div
          class="leaderboard-filter-menu"
          id="dataset-filter-menu"
          role="group"
          aria-labelledby="dataset-filter-label"
          data-filter-menu
          hidden
        >
          <label class="leaderboard-filter-option">
            <input data-filter-all type="checkbox" value="all" checked />
            All datasets
          </label>
          <label class="leaderboard-filter-option">
            <input type="checkbox" value="AhmedML" />
            AhmedML
          </label>
          <label class="leaderboard-filter-option">
            <input type="checkbox" value="DrivAerML" />
            DrivAerML
          </label>
          <label class="leaderboard-filter-option">
            <input type="checkbox" value="DrivAerNet++" />
            DrivAerNet++
          </label>
          <label class="leaderboard-filter-option">
            <input type="checkbox" value="WindsorML" />
            WindsorML
          </label>
          <label class="leaderboard-filter-option">
            <input type="checkbox" value="HiLiftAeroML" />
            HiLiftAeroML
          </label>
          <label class="leaderboard-filter-option">
            <input type="checkbox" value="AirfRANS" />
            AirfRANS
          </label>
        </div>
      </div>
    </div>
    <div class="leaderboard-control">
      <span class="leaderboard-control-title" id="type-filter-label">Model type</span>
      <div class="leaderboard-filter-dropdown" id="type-filter" data-all-label="All model types">
        <button
          class="leaderboard-filter-toggle"
          type="button"
          aria-controls="type-filter-menu"
          aria-expanded="false"
          aria-haspopup="true"
          data-filter-toggle
        >
          <span data-filter-summary>All model types</span>
          <span class="leaderboard-filter-caret" aria-hidden="true"></span>
        </button>
        <div
          class="leaderboard-filter-menu"
          id="type-filter-menu"
          role="group"
          aria-labelledby="type-filter-label"
          data-filter-menu
          hidden
        >
          <label class="leaderboard-filter-option">
            <input data-filter-all type="checkbox" value="all" checked />
            All model types
          </label>
          <label class="leaderboard-filter-option">
            <input type="checkbox" value="Transformer" />
            Transformer
          </label>
          <label class="leaderboard-filter-option">
            <input type="checkbox" value="GNN" />
            GNN
          </label>
          <label class="leaderboard-filter-option">
            <input type="checkbox" value="Neural operator" />
            Neural operator
          </label>
          <label class="leaderboard-filter-option">
            <input type="checkbox" value="Implicit field" />
            Implicit field
          </label>
          <label class="leaderboard-filter-option">
            <input type="checkbox" value="MLP" />
            MLP
          </label>
          <label class="leaderboard-filter-option">
            <input type="checkbox" value="Point cloud" />
            Point cloud
          </label>
        </div>
      </div>
    </div>
    <div class="leaderboard-control">
      <span class="leaderboard-control-title" id="split-filter-label">Split</span>
      <div class="leaderboard-filter-dropdown" id="split-filter" data-all-label="All splits">
        <button
          class="leaderboard-filter-toggle"
          type="button"
          aria-controls="split-filter-menu"
          aria-expanded="false"
          aria-haspopup="true"
          data-filter-toggle
        >
          <span data-filter-summary>All splits</span>
          <span class="leaderboard-filter-caret" aria-hidden="true"></span>
        </button>
        <div
          class="leaderboard-filter-menu"
          id="split-filter-menu"
          role="group"
          aria-labelledby="split-filter-label"
          data-filter-menu
          hidden
        >
          <label class="leaderboard-filter-option">
            <input data-filter-all type="checkbox" value="all" checked />
            All splits
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML DrivAerNet++ WindsorML">
            <input type="checkbox" value="Default" />
            Default
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML AirfRANS">
            <input type="checkbox" value="Full" />
            Full
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="AirfRANS">
            <input type="checkbox" value="Scarce" />
            Scarce
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="AirfRANS">
            <input type="checkbox" value="Reynolds extrapolation" />
            Reynolds extrapolation
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="AirfRANS">
            <input type="checkbox" value="AoA extrapolation" />
            AoA extrapolation
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
            <input type="checkbox" value="AoA 4" />
            AoA 4
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
            <input type="checkbox" value="AoA 12" />
            AoA 12
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
            <input type="checkbox" value="AoA 22" />
            AoA 22
          </label>
        </div>
      </div>
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

  <section class="leaderboard-table-wrap" aria-label="CFD leaderboard table">
    <table class="leaderboard-table">
      <thead>
        <tr>
          <th data-sort="rank">Rank</th>
          <th data-sort="model">Model</th>
          <th data-sort="type">Type</th>
          <th data-sort="dataset">Dataset</th>
          <th data-sort="split">Split</th>
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
    <h3 id="cp-panel-title">Centreline surface Cp</h3>
    <p id="cp-panel-description">Ground truth versus selected submissions along the Ahmed body centreline.</p>
    <div class="chart-control-row" aria-label="Cp plot filters">
      <div class="chart-control">
        <span class="chart-control-title" id="cp-dataset-filter-label">Dataset</span>
        <div class="leaderboard-filter-dropdown" id="cp-dataset-filter">
          <button
            class="leaderboard-filter-toggle"
            type="button"
            aria-controls="cp-dataset-filter-menu"
            aria-expanded="false"
            aria-haspopup="true"
            data-filter-toggle
          >
            <span data-filter-summary>AhmedML</span>
            <span class="leaderboard-filter-caret" aria-hidden="true"></span>
          </button>
          <div
            class="leaderboard-filter-menu"
            id="cp-dataset-filter-menu"
            role="radiogroup"
            aria-labelledby="cp-dataset-filter-label"
            data-filter-menu
            hidden
          >
            <label class="leaderboard-filter-option">
              <input name="cp-dataset-filter-value" type="radio" value="AhmedML" checked />
              AhmedML
            </label>
            <label class="leaderboard-filter-option">
              <input name="cp-dataset-filter-value" type="radio" value="DrivAerML" />
              DrivAerML
            </label>
            <label class="leaderboard-filter-option">
              <input name="cp-dataset-filter-value" type="radio" value="DrivAerNet++" />
              DrivAerNet++
            </label>
            <label class="leaderboard-filter-option">
              <input name="cp-dataset-filter-value" type="radio" value="WindsorML" />
              WindsorML
            </label>
            <label class="leaderboard-filter-option">
              <input name="cp-dataset-filter-value" type="radio" value="HiLiftAeroML" />
              HiLiftAeroML
            </label>
            <label class="leaderboard-filter-option">
              <input name="cp-dataset-filter-value" type="radio" value="AirfRANS" />
              AirfRANS
            </label>
          </div>
        </div>
      </div>
      <div class="chart-control">
        <span class="chart-control-title" id="cp-split-filter-label">Split</span>
        <div class="leaderboard-filter-dropdown" id="cp-split-filter">
          <button
            class="leaderboard-filter-toggle"
            type="button"
            aria-controls="cp-split-filter-menu"
            aria-expanded="false"
            aria-haspopup="true"
            data-filter-toggle
          >
            <span data-filter-summary>Default</span>
            <span class="leaderboard-filter-caret" aria-hidden="true"></span>
          </button>
          <div
            class="leaderboard-filter-menu"
            id="cp-split-filter-menu"
            role="radiogroup"
            aria-labelledby="cp-split-filter-label"
            data-filter-menu
            hidden
          >
            <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML DrivAerNet++ WindsorML">
              <input name="cp-split-filter-value" type="radio" value="Default" checked />
              Default
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML AirfRANS">
              <input name="cp-split-filter-value" type="radio" value="Full" />
              Full
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AirfRANS">
              <input name="cp-split-filter-value" type="radio" value="Scarce" />
              Scarce
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AirfRANS">
              <input name="cp-split-filter-value" type="radio" value="Reynolds extrapolation" />
              Reynolds extrapolation
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AirfRANS">
              <input name="cp-split-filter-value" type="radio" value="AoA extrapolation" />
              AoA extrapolation
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
              <input name="cp-split-filter-value" type="radio" value="AoA 4" />
              AoA 4
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
              <input name="cp-split-filter-value" type="radio" value="AoA 12" />
              AoA 12
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
              <input name="cp-split-filter-value" type="radio" value="AoA 22" />
              AoA 22
            </label>
          </div>
        </div>
      </div>
      <div class="chart-control chart-model-control">
        <span class="chart-control-title" id="cp-models-label">Submissions</span>
        <div class="leaderboard-filter-dropdown" id="cp-models-filter">
          <button
            class="leaderboard-filter-toggle"
            type="button"
            aria-controls="cp-models"
            aria-expanded="false"
            aria-haspopup="true"
            data-filter-toggle
          >
            <span data-chart-model-summary>Top submissions</span>
            <span class="leaderboard-filter-caret" aria-hidden="true"></span>
          </button>
          <div
            class="leaderboard-filter-menu"
            id="cp-models"
            role="group"
            aria-labelledby="cp-models-label"
            data-filter-menu
            hidden
          ></div>
        </div>
      </div>
    </div>
    <div class="chart-frame">
      <canvas id="cp-chart"></canvas>
    </div>
  </section>

  <section class="leaderboard-panel">
    <h3 id="velocity-panel-title">Velocity profiles</h3>
    <p><span id="velocity-panel-description">Wake velocity profiles for the selected AhmedML station.</span></p>
    <p><span id="velocity-station-label">x/H = 0.25 downstream</span></p>
    <div class="chart-control-row velocity-chart-controls" aria-label="Velocity plot filters">
      <div class="chart-control">
        <span class="chart-control-title" id="velocity-dataset-filter-label">Dataset</span>
        <div class="leaderboard-filter-dropdown" id="velocity-dataset-filter">
          <button
            class="leaderboard-filter-toggle"
            type="button"
            aria-controls="velocity-dataset-filter-menu"
            aria-expanded="false"
            aria-haspopup="true"
            data-filter-toggle
          >
            <span data-filter-summary>AhmedML</span>
            <span class="leaderboard-filter-caret" aria-hidden="true"></span>
          </button>
          <div
            class="leaderboard-filter-menu"
            id="velocity-dataset-filter-menu"
            role="radiogroup"
            aria-labelledby="velocity-dataset-filter-label"
            data-filter-menu
            hidden
          >
            <label class="leaderboard-filter-option">
              <input name="velocity-dataset-filter-value" type="radio" value="AhmedML" checked />
              AhmedML
            </label>
            <label class="leaderboard-filter-option">
              <input name="velocity-dataset-filter-value" type="radio" value="DrivAerML" />
              DrivAerML
            </label>
            <label class="leaderboard-filter-option">
              <input name="velocity-dataset-filter-value" type="radio" value="DrivAerNet++" />
              DrivAerNet++
            </label>
            <label class="leaderboard-filter-option">
              <input name="velocity-dataset-filter-value" type="radio" value="WindsorML" />
              WindsorML
            </label>
            <label class="leaderboard-filter-option">
              <input name="velocity-dataset-filter-value" type="radio" value="HiLiftAeroML" />
              HiLiftAeroML
            </label>
            <label class="leaderboard-filter-option">
              <input name="velocity-dataset-filter-value" type="radio" value="AirfRANS" />
              AirfRANS
            </label>
          </div>
        </div>
      </div>
      <div class="chart-control">
        <span class="chart-control-title" id="velocity-split-filter-label">Split</span>
        <div class="leaderboard-filter-dropdown" id="velocity-split-filter">
          <button
            class="leaderboard-filter-toggle"
            type="button"
            aria-controls="velocity-split-filter-menu"
            aria-expanded="false"
            aria-haspopup="true"
            data-filter-toggle
          >
            <span data-filter-summary>Default</span>
            <span class="leaderboard-filter-caret" aria-hidden="true"></span>
          </button>
          <div
            class="leaderboard-filter-menu"
            id="velocity-split-filter-menu"
            role="radiogroup"
            aria-labelledby="velocity-split-filter-label"
            data-filter-menu
            hidden
          >
            <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML DrivAerNet++ WindsorML">
              <input name="velocity-split-filter-value" type="radio" value="Default" checked />
              Default
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML AirfRANS">
              <input name="velocity-split-filter-value" type="radio" value="Full" />
              Full
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AirfRANS">
              <input name="velocity-split-filter-value" type="radio" value="Scarce" />
              Scarce
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AirfRANS">
              <input name="velocity-split-filter-value" type="radio" value="Reynolds extrapolation" />
              Reynolds extrapolation
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AirfRANS">
              <input name="velocity-split-filter-value" type="radio" value="AoA extrapolation" />
              AoA extrapolation
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
              <input name="velocity-split-filter-value" type="radio" value="AoA 4" />
              AoA 4
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
              <input name="velocity-split-filter-value" type="radio" value="AoA 12" />
              AoA 12
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
              <input name="velocity-split-filter-value" type="radio" value="AoA 22" />
              AoA 22
            </label>
          </div>
        </div>
      </div>
      <div class="chart-control chart-station-control">
        <span class="chart-control-title">Station</span>
        <div class="chart-options" aria-label="Velocity station toggles">
          <button class="station-toggle active" type="button" data-station="0.25L">0.25L</button>
          <button class="station-toggle" type="button" data-station="0.50L">0.50L</button>
          <button class="station-toggle" type="button" data-station="1.00L">1.00L</button>
        </div>
      </div>
      <div class="chart-control chart-model-control">
        <span class="chart-control-title" id="velocity-models-label">Submissions</span>
        <div class="leaderboard-filter-dropdown" id="velocity-models-filter">
          <button
            class="leaderboard-filter-toggle"
            type="button"
            aria-controls="velocity-models"
            aria-expanded="false"
            aria-haspopup="true"
            data-filter-toggle
          >
            <span data-chart-model-summary>Top submissions</span>
            <span class="leaderboard-filter-caret" aria-hidden="true"></span>
          </button>
          <div
            class="leaderboard-filter-menu"
            id="velocity-models"
            role="group"
            aria-labelledby="velocity-models-label"
            data-filter-menu
            hidden
          ></div>
        </div>
      </div>
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

  <dialog class="submission-dialog" id="submission-dialog">
    <form class="submission-form" id="leaderboard-submission-form" method="dialog">
      <div class="submission-form-header">
        <h3>Submit benchmark result</h3>
        <button id="close-submission-form" type="button" aria-label="Close submission form">×</button>
      </div>

      <div class="submission-form-grid">
        <label>
          Model name
          <input name="model" required type="text" />
        </label>
        <label>
          Model type
          <select name="model_type" required>
            <option value="">Select...</option>
            <option>Transformer</option>
            <option>GNN</option>
            <option>Neural operator</option>
            <option>Implicit field</option>
            <option>MLP</option>
            <option>Point cloud</option>
            <option>CNN</option>
            <option>Other</option>
          </select>
        </label>
        <label>
          Dataset
          <select name="dataset" required>
            <option>AhmedML</option>
            <option>DrivAerML</option>
            <option>DrivAerNet++</option>
            <option>WindsorML</option>
            <option>HiLiftAeroML</option>
            <option>AirfRANS</option>
          </select>
        </label>
        <label>
          Split
          <select name="split" required>
            <option>Default</option>
            <option>Full</option>
            <option>AoA 4</option>
            <option>AoA 12</option>
            <option>AoA 22</option>
            <option>Scarce</option>
            <option>Reynolds extrapolation</option>
            <option>AoA extrapolation</option>
          </select>
        </label>
        <label>
          Parameters (M)
          <input min="0" name="parameter_count" required step="any" type="number" />
        </label>
        <label>
          Surface pressure L2 (%)
          <input min="0" name="surface_pressure_l2" required step="any" type="number" />
        </label>
        <label>
          Surface pressure L1 (%)
          <input min="0" name="surface_pressure_l1" required step="any" type="number" />
        </label>
        <label>
          Surface tau wall L2 (%)
          <input min="0" name="surface_tau_l2" required step="any" type="number" />
        </label>
        <label>
          Surface tau wall L1 (%)
          <input min="0" name="surface_tau_l1" required step="any" type="number" />
        </label>
        <label>
          Volume velocity L2 (%)
          <input min="0" name="volume_velocity_l2" required step="any" type="number" />
        </label>
        <label>
          Volume velocity L1 (%)
          <input min="0" name="volume_velocity_l1" required step="any" type="number" />
        </label>
        <label>
          Volume pressure L2 (%)
          <input min="0" name="volume_pressure_l2" required step="any" type="number" />
        </label>
        <label>
          Volume pressure L1 (%)
          <input min="0" name="volume_pressure_l1" required step="any" type="number" />
        </label>
        <label>
          C<sub>d</sub> R<sup>2</sup>
          <input max="1" name="r2_cd" required step="any" type="number" />
        </label>
        <label>
          C<sub>l</sub> R<sup>2</sup>
          <input max="1" name="r2_cl" required step="any" type="number" />
        </label>
        <label>
          Velocity profiles R<sup>2</sup>
          <input max="1" name="velocity_profile_r2" required step="any" type="number" />
        </label>
        <label>
          Cp cuts R<sup>2</sup>
          <input max="1" name="cp_cut_r2" required step="any" type="number" />
        </label>
        <label>
          Submitter name
          <input name="submitter_name" required type="text" />
        </label>
        <label>
          Contact email
          <input name="contact_email" required type="email" />
        </label>
        <label>
          Institution
          <input name="institution" type="text" />
        </label>
        <label>
          Paper URL
          <input name="paper_url" type="url" />
        </label>
        <label>
          Code URL
          <input name="code_url" type="url" />
        </label>
        <label>
          Trace archive (.zip)
          <input accept=".zip,application/zip" name="trace_file" required type="file" />
        </label>
      </div>

      <p id="submission-form-status" class="submission-form-status"></p>
      <div class="submission-form-footer">
        <button type="submit">Submit metadata and upload trace</button>
      </div>
    </form>

  </dialog>
</div>

<script defer src="{{ '/assets/js/leaderboard.js' | relative_url | bust_file_cache }}"></script>

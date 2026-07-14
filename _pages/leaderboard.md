---
layout: page
permalink: /
title: leaderboard
description:
nav: false
hide_header: true
wide: true
chart:
  chartjs: true
---

<div class="leaderboard-page">
  <div class="leaderboard-source-row">
    <a
      id="open-submission-repo"
      class="leaderboard-submit-button"
      href="https://github.com/neilashton/fluidsbench-submission"
      target="_blank"
      rel="noopener"
    >Submit result</a>
  </div>

  <section class="leaderboard-controls" aria-label="Leaderboard filters">
    <div class="leaderboard-control">
      <span class="leaderboard-control-title" id="dataset-filter-label">Dataset</span>
      <div class="leaderboard-filter-dropdown" id="dataset-filter">
        <button
          class="leaderboard-filter-toggle"
          type="button"
          aria-controls="dataset-filter-menu"
          aria-expanded="false"
          aria-haspopup="true"
          data-filter-toggle
        >
          <span data-filter-summary>AhmedML</span>
          <span class="leaderboard-filter-caret" aria-hidden="true"></span>
        </button>
        <div
          class="leaderboard-filter-menu"
          id="dataset-filter-menu"
          role="radiogroup"
          aria-labelledby="dataset-filter-label"
          data-filter-menu
          hidden
        >
          <label class="leaderboard-filter-option">
            <input name="dataset-filter-value" type="radio" value="AhmedML" checked />
            AhmedML
          </label>
          <label class="leaderboard-filter-option">
            <input name="dataset-filter-value" type="radio" value="DrivAerML" />
            DrivAerML
          </label>
          <label class="leaderboard-filter-option">
            <input name="dataset-filter-value" type="radio" value="DrivAerNet++" />
            DrivAerNet++
          </label>
          <label class="leaderboard-filter-option">
            <input name="dataset-filter-value" type="radio" value="WindsorML" />
            WindsorML
          </label>
          <label class="leaderboard-filter-option">
            <input name="dataset-filter-value" type="radio" value="HiLiftAeroML" />
            HiLiftAeroML
          </label>
          <label class="leaderboard-filter-option">
            <input name="dataset-filter-value" type="radio" value="AirfRANS" />
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
      <div class="leaderboard-filter-dropdown" id="split-filter">
        <button
          class="leaderboard-filter-toggle"
          type="button"
          aria-controls="split-filter-menu"
          aria-expanded="false"
          aria-haspopup="true"
          data-filter-toggle
        >
          <span data-filter-summary>Full</span>
          <span class="leaderboard-filter-caret" aria-hidden="true"></span>
        </button>
        <div
          class="leaderboard-filter-menu"
          id="split-filter-menu"
          role="radiogroup"
          aria-labelledby="split-filter-label"
          data-filter-menu
          hidden
        >
          <label class="leaderboard-filter-option" data-split-datasets="DrivAerNet++ WindsorML">
            <input name="split-filter-value" type="radio" value="Default" />
            Default
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML HiLiftAeroML AirfRANS">
            <input name="split-filter-value" type="radio" value="Full" checked />
            Full
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML HiLiftAeroML">
            <input name="split-filter-value" type="radio" value="Medium" />
            Medium
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML HiLiftAeroML AirfRANS">
            <input name="split-filter-value" type="radio" value="Scarce" />
            Scarce
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML HiLiftAeroML">
            <input name="split-filter-value" type="radio" value="Super scarce" />
            Super scarce
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML HiLiftAeroML">
            <input name="split-filter-value" type="radio" value="Geometry" />
            Geometry
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
            <input name="split-filter-value" type="radio" value="Geometry medium" />
            Geometry medium
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
            <input name="split-filter-value" type="radio" value="Geometry scarce" />
            Geometry scarce
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
            <input name="split-filter-value" type="radio" value="Geometry super scarce" />
            Geometry super scarce
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML">
            <input name="split-filter-value" type="radio" value="High drag" />
            High drag
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML">
            <input name="split-filter-value" type="radio" value="Low drag" />
            Low drag
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="AhmedML">
            <input name="split-filter-value" type="radio" value="Image wake" />
            Image wake
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="DrivAerML">
            <input name="split-filter-value" type="radio" value="Rear separation" />
            Rear separation
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="AirfRANS">
            <input name="split-filter-value" type="radio" value="Reynolds extrapolation" />
            Reynolds extrapolation
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML AirfRANS">
            <input name="split-filter-value" type="radio" value="AoA extrapolation" />
            AoA extrapolation
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
            <input name="split-filter-value" type="radio" value="Deflection" />
            Deflection
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
            <input name="split-filter-value" type="radio" value="Stall" />
            Stall
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
            <input name="split-filter-value" type="radio" value="AoA 4" />
            AoA 4
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
            <input name="split-filter-value" type="radio" value="AoA 12" />
            AoA 12
          </label>
          <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
            <input name="split-filter-value" type="radio" value="AoA 22" />
            AoA 22
          </label>
        </div>
      </div>
    </div>
  </section>

  <aside class="leaderboard-data-warning" role="note" aria-label="Leaderboard data status">
    <strong>Work in progress:</strong> this leaderboard currently displays dummy data with illustrative split assignments.
  </aside>

  <div class="leaderboard-table-area">
    <div class="leaderboard-table-toolbar" id="leaderboard-column-controls" role="group" aria-label="Visible table column groups">
      <span class="leaderboard-column-controls-label">
        <i class="fa-solid fa-table-columns" aria-hidden="true"></i>
        Columns
      </span>
      <div class="leaderboard-column-toggles">
        <button type="button" class="leaderboard-column-toggle" data-column-group-toggle="component-scores" aria-pressed="true">
          Component scores
        </button>
        <button type="button" class="leaderboard-column-toggle" data-column-group-toggle="relative-errors" aria-pressed="true">
          Relative errors
        </button>
        <button type="button" class="leaderboard-column-toggle" data-column-group-toggle="absolute-errors" aria-pressed="true">
          Absolute errors
        </button>
        <button type="button" class="leaderboard-column-toggle" data-column-group-toggle="r2-metrics" aria-pressed="true">
          R² metrics
        </button>
        <button type="button" class="leaderboard-column-toggle" data-column-group-toggle="model-details" aria-pressed="true">
          Model details
        </button>
      </div>
    </div>

    <section class="leaderboard-table-wrap" aria-label="CFD leaderboard table">
      <table class="leaderboard-table">
        <thead>
          <tr id="leaderboard-header-row"></tr>
        </thead>
        <tbody id="leaderboard-body"></tbody>
      </table>
    </section>
  </div>

  <section class="leaderboard-panel leaderboard-comparison-panel">
    <div class="comparison-header">
      <div>
        <h3>Metric comparison</h3>
        <p>Compare selected metric groups for a chosen dataset and split.</p>
      </div>
      <div class="comparison-control-row" aria-label="Metric comparison controls">
        <div class="chart-control">
          <label class="chart-control-title" for="comparison-dataset-filter">Dataset</label>
          <select id="comparison-dataset-filter"></select>
        </div>
        <div class="chart-control">
          <label class="chart-control-title" for="comparison-split-filter">Split</label>
          <select id="comparison-split-filter"></select>
        </div>
        <div class="chart-control">
          <label class="chart-control-title" for="comparison-metric-group">Metric group</label>
          <select id="comparison-metric-group">
            <option value="summary" selected>Summary scores</option>
            <option value="l2">L2 errors</option>
            <option value="l1">L1 errors</option>
            <option value="r2">R2 metrics</option>
            <option value="dimensional-mae">Dimensional MAE</option>
            <option value="dimensional-rmse">Dimensional RMSE</option>
            <option value="coefficient-mae">Coefficient MAE</option>
          </select>
        </div>
        <div class="chart-control">
          <label class="chart-control-title" for="comparison-row-count">Rows</label>
          <select id="comparison-row-count">
            <option value="5" selected>Top 5</option>
            <option value="10">Top 10</option>
            <option value="15">Top 15</option>
          </select>
        </div>
      </div>
    </div>
    <div class="chart-frame comparison-chart-frame">
      <canvas id="comparison-chart" aria-label="Leaderboard metric comparison chart"></canvas>
    </div>
  </section>

  <section class="leaderboard-panel leaderboard-scatter-panel">
    <div class="comparison-header">
      <div>
        <h3>Scatter explorer</h3>
        <p>Plot any numeric leaderboard column against another for a chosen dataset and split.</p>
      </div>
      <div class="scatter-control-row" aria-label="Scatter axis controls">
        <div class="chart-control">
          <label class="chart-control-title" for="scatter-dataset-filter">Dataset</label>
          <select id="scatter-dataset-filter"></select>
        </div>
        <div class="chart-control">
          <label class="chart-control-title" for="scatter-split-filter">Split</label>
          <select id="scatter-split-filter"></select>
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
      <canvas id="scatter-chart" aria-label="Leaderboard metric scatter chart"></canvas>
    </div>
  </section>

  <section class="leaderboard-panel">
    <h3 id="cp-panel-title">Centreline surface Cp</h3>
    <p id="cp-panel-description">Submitted Cp diagnostic cuts for the selected dataset and split.</p>
    <div class="chart-control-row cp-chart-controls" aria-label="Cp plot filters">
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
            <span data-filter-summary>Full</span>
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
            <label class="leaderboard-filter-option" data-split-datasets="DrivAerNet++ WindsorML">
              <input name="cp-split-filter-value" type="radio" value="Default" />
              Default
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML HiLiftAeroML AirfRANS">
              <input name="cp-split-filter-value" type="radio" value="Full" checked />
              Full
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML HiLiftAeroML">
              <input name="cp-split-filter-value" type="radio" value="Medium" />
              Medium
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML HiLiftAeroML AirfRANS">
              <input name="cp-split-filter-value" type="radio" value="Scarce" />
              Scarce
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML HiLiftAeroML">
              <input name="cp-split-filter-value" type="radio" value="Super scarce" />
              Super scarce
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML HiLiftAeroML">
              <input name="cp-split-filter-value" type="radio" value="Geometry" />
              Geometry
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
              <input name="cp-split-filter-value" type="radio" value="Geometry medium" />
              Geometry medium
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
              <input name="cp-split-filter-value" type="radio" value="Geometry scarce" />
              Geometry scarce
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
              <input name="cp-split-filter-value" type="radio" value="Geometry super scarce" />
              Geometry super scarce
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML">
              <input name="cp-split-filter-value" type="radio" value="High drag" />
              High drag
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML">
              <input name="cp-split-filter-value" type="radio" value="Low drag" />
              Low drag
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AhmedML">
              <input name="cp-split-filter-value" type="radio" value="Image wake" />
              Image wake
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="DrivAerML">
              <input name="cp-split-filter-value" type="radio" value="Rear separation" />
              Rear separation
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AirfRANS">
              <input name="cp-split-filter-value" type="radio" value="Reynolds extrapolation" />
              Reynolds extrapolation
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML AirfRANS">
              <input name="cp-split-filter-value" type="radio" value="AoA extrapolation" />
              AoA extrapolation
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
              <input name="cp-split-filter-value" type="radio" value="Deflection" />
              Deflection
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
              <input name="cp-split-filter-value" type="radio" value="Stall" />
              Stall
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
        <label class="chart-control-title" for="cp-station-select">Station</label>
        <select id="cp-station-select" aria-label="Cp station"></select>
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
    <p><span id="velocity-panel-description">Submitted velocity diagnostic profiles for the selected dataset and split.</span></p>
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
            <span data-filter-summary>Full</span>
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
            <label class="leaderboard-filter-option" data-split-datasets="DrivAerNet++ WindsorML">
              <input name="velocity-split-filter-value" type="radio" value="Default" />
              Default
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML HiLiftAeroML AirfRANS">
              <input name="velocity-split-filter-value" type="radio" value="Full" checked />
              Full
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML HiLiftAeroML">
              <input name="velocity-split-filter-value" type="radio" value="Medium" />
              Medium
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML HiLiftAeroML AirfRANS">
              <input name="velocity-split-filter-value" type="radio" value="Scarce" />
              Scarce
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML HiLiftAeroML">
              <input name="velocity-split-filter-value" type="radio" value="Super scarce" />
              Super scarce
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML HiLiftAeroML">
              <input name="velocity-split-filter-value" type="radio" value="Geometry" />
              Geometry
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
              <input name="velocity-split-filter-value" type="radio" value="Geometry medium" />
              Geometry medium
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
              <input name="velocity-split-filter-value" type="radio" value="Geometry scarce" />
              Geometry scarce
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
              <input name="velocity-split-filter-value" type="radio" value="Geometry super scarce" />
              Geometry super scarce
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML">
              <input name="velocity-split-filter-value" type="radio" value="High drag" />
              High drag
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AhmedML DrivAerML">
              <input name="velocity-split-filter-value" type="radio" value="Low drag" />
              Low drag
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AhmedML">
              <input name="velocity-split-filter-value" type="radio" value="Image wake" />
              Image wake
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="DrivAerML">
              <input name="velocity-split-filter-value" type="radio" value="Rear separation" />
              Rear separation
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="AirfRANS">
              <input name="velocity-split-filter-value" type="radio" value="Reynolds extrapolation" />
              Reynolds extrapolation
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML AirfRANS">
              <input name="velocity-split-filter-value" type="radio" value="AoA extrapolation" />
              AoA extrapolation
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
              <input name="velocity-split-filter-value" type="radio" value="Deflection" />
              Deflection
            </label>
            <label class="leaderboard-filter-option" data-split-datasets="HiLiftAeroML">
              <input name="velocity-split-filter-value" type="radio" value="Stall" />
              Stall
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

  <section class="metric-definitions" id="metric-definitions">
    <h3>Metric definitions</h3>
    <dl>
      <div>
        <dt>Weighted overall score</dt>
        <dd>
          0-100 score combining the field score (50%), force score (25%), and diagnostic score (25%). Each component is
          also shown in the main table.
          <br />
          <code>Overall = 0.50 Field + 0.25 Force + 0.25 Diagnostic</code>
        </dd>
      </div>
      <div>
        <dt>Field relative L2 and L1</dt>
        <dd>
          Relative L2 and L1 errors for surface pressure, surface wall shear, volume velocity, and volume pressure after
          mapping predictions and targets back to dimensional physical space. Lower is better. Values are read from the
          approved submission files when evaluator exports are available.
          <br />
          <code>Lp_rel(%) = 100 ||y_pred - y_true||_p / ||y_true||_p</code>
        </dd>
      </div>
      <div>
        <dt>Dimensional field MAE and RMSE</dt>
        <dd>
          Errors are evaluated after reversing model normalization and converting predictions and targets to the SI unit
          shown in the column header. Surface quantities use face-area weights, volume quantities use cell-volume
          weights, and each test case contributes equally. For vector fields, the point error is the Euclidean vector
          magnitude. Lower is better.
          <br />
          <code>MAE(q) = (1/N) sum_i [sum_j w_ij ||qhat_ij - q_ij|| / sum_j w_ij]</code>
          <br />
          <code>RMSE(q) = sqrt((1/N) sum_i [sum_j w_ij ||qhat_ij - q_ij||^2 / sum_j w_ij])</code>
        </dd>
      </div>
      <div>
        <dt>Absolute force and moment coefficient error</dt>
        <dd>
          Mean absolute difference between the predicted and reference coefficient over all evaluated cases. Coefficients
          are dimensionless and the available force or moment components depend on the selected dataset. Lower is better.
          <br />
          <code>MAE(C) = (1/N) sum_i |Chat_i - C_i|</code>
        </dd>
      </div>
      <div>
        <dt>Field score</dt>
        <dd>
          0-100 score from the four L2 field-error columns, contributing 50% of the weighted overall score.
          <br />
          <code>E_score(e, cap) = clamp(100(1 - e / cap), 0, 100)</code>
          <br />
          <code>Field = (0.15 S_p + 0.10 S_tau + 0.15 V_u + 0.10 V_p) / 0.50</code>
        </dd>
      </div>
      <div>
        <dt>Force score</dt>
        <dd>
          0-100 weighted blend of C<sub>d</sub> R<sup>2</sup> and C<sub>l</sub> R<sup>2</sup>, contributing 25% of the
          weighted overall score.
          <br />
          <code>R2_score(r) = 100 clamp(r, 0, 1)</code>
          <br />
          <code>Force = (0.15 R2_score(Cd) + 0.10 R2_score(Cl)) / 0.25</code>
        </dd>
      </div>
      <div>
        <dt>Diagnostic score</dt>
        <dd>
          0-100 weighted blend of velocity-profile R<sup>2</sup> and Cp-cut R<sup>2</sup>, contributing 25% of the
          weighted overall score.
          <br />
          <code>Diagnostic = (0.15 R2_score(velocity profiles) + 0.10 R2_score(Cp cuts)) / 0.25</code>
        </dd>
      </div>
      <div>
        <dt>Error-to-score caps</dt>
        <dd>
          L2 metrics are mapped to bounded subscores using caps of 15% for surface pressure, 20% for wall shear, 12% for
          volume velocity, and 15% for volume pressure.
          <br />
          <code>S_p = E_score(surface pressure L2, 15)</code>,
          <code>S_tau = E_score(surface tau wall L2, 20)</code>,
          <code>V_u = E_score(volume velocity L2, 12)</code>,
          <code>V_p = E_score(volume pressure L2, 15)</code>
        </dd>
      </div>
      <div>
        <dt>Force R<sup>2</sup></dt>
        <dd>
          Mean of C<sub>d</sub> R<sup>2</sup> and C<sub>l</sub> R<sup>2</sup> over the evaluated cases.
          <br />
          <code>Force R2 mean = (R2(Cd) + R2(Cl)) / 2</code>
        </dd>
      </div>
      <div>
        <dt>Velocity profiles R<sup>2</sup></dt>
        <dd>
          Coefficient of determination for selected wake velocity profiles. The exact profile cuts are still to be defined.
          <br />
          <code>R2 = 1 - sum_i (y_i - yhat_i)^2 / sum_i (y_i - mean(y))^2</code>
        </dd>
      </div>
      <div>
        <dt>Cp cuts R<sup>2</sup></dt>
        <dd>
          Coefficient of determination for selected surface pressure coefficient cuts. The exact surface cuts are still to be defined.
          <br />
          <code>R2 = 1 - sum_i (Cp_i - Cphat_i)^2 / sum_i (Cp_i - mean(Cp))^2</code>
        </dd>
      </div>
    </dl>
  </section>

  <dialog class="details-dialog" id="details-dialog" aria-labelledby="details-dialog-title">
    <article class="details-dialog-card">
      <div class="details-dialog-header">
        <div>
          <p id="details-dialog-subtitle" class="details-dialog-subtitle"></p>
          <h3 id="details-dialog-title">Submission details</h3>
        </div>
        <button id="close-details-dialog" class="details-dialog-close" type="button" aria-label="Close details">×</button>
      </div>
      <div id="details-dialog-body" class="details-dialog-body"></div>
    </article>
  </dialog>

</div>

<script>
  window.FluidsBenchLeaderboardBaseUrl =
    "https://raw.githubusercontent.com/neilashton/fluidsbench-submission/dev/";
  window.FluidsBenchLeaderboardManifestUrl =
    "https://raw.githubusercontent.com/neilashton/fluidsbench-submission/dev/leaderboard/manifest.json";
  window.FluidsBenchApprovedSubmissionsSourceLabel = "fluidsbench-submission dev manifest";
</script>
<script defer src="{{ '/assets/js/leaderboard.js' | relative_url | bust_file_cache }}"></script>

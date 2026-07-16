---
layout: page
permalink: /datasets/drivaernetplusplus/
title: DrivAerNet++ dataset
page_title: DrivAerNet++ dataset
page_description: Dataset overview and leaderboard submission format for DrivAerNet++.
description:
nav: false
hide_header_background: true
compact_masthead: true
---

<div class="dataset-page">
  <section>
    <p class="dataset-kicker">Dataset specification</p>
    <p class="dataset-intro">
      DrivAerNet++ is a large-scale, high-fidelity CFD dataset for automotive external aerodynamics. CarBench uses it as
      the basis for a standardized benchmark on surface pressure prediction across realistic car geometries.
    </p>
    <p>
      The source dataset and tooling are maintained by the DrivAerNet++ project, with benchmark training and evaluation
      code released through <a href="https://github.com/Mohamedelrefaie/CarBench">CarBench</a>. Dataset access is
      available from <a href="https://github.com/Mohamedelrefaie/DrivAerNet">the DrivAerNet++ repository</a> and the
      <a href="https://huggingface.co/datasets/MoElrefaie/DrivAerNet">Hugging Face dataset page</a>.
    </p>
  </section>

  <section class="dataset-panel">
    <h3>Dataset summary</h3>
    <dl class="dataset-facts">
      <div>
        <dt>Geometry</dt>
        <dd>Realistic DrivAer-derived car configurations, including fastback, notchback, and estateback categories.</dd>
      </div>
      <div>
        <dt>Cases</dt>
        <dd>More than 8,000 steady-state high-fidelity car simulations.</dd>
      </div>
      <div>
        <dt>Primary CarBench task</dt>
        <dd>Surface kinematic pressure prediction from geometry.</dd>
      </div>
      <div>
        <dt>Default split</dt>
        <dd>CarBench unseen test split. The first leaderboard split is named <code>Default</code>.</dd>
      </div>
      <div>
        <dt>Reported CarBench metrics</dt>
        <dd>Surface pressure MSE, MAE, RMSE, pressure-field R<sup>2</sup>, relative L2, model size, memory, and latency.</dd>
      </div>
      <div>
        <dt>Current FluidsBench status</dt>
        <dd>Prototype rows use CarBench surface-pressure results; force, volume, and profile metrics require a future evaluator.</dd>
      </div>
    </dl>
  </section>

  <section class="dataset-panel">
    {% include dataset_submission_v1.html slug="drivaernetplusplus" dataset="DrivAerNet++" %}

  </section>

  <section class="dataset-panel">
    <h3>Cp stations</h3>
    <p>
      DrivAerNet++ publishes surface pressure over annotated vehicle components but not a canonical set of one-dimensional
      Cp traces. FluidsBench defines the following benchmark traces using regions described in the
      <a href="https://arxiv.org/abs/2406.09624">DrivAerNet++ paper</a>. Use the exact ID in <code>station_id</code>.
    </p>
    <div class="dataset-table-wrap">
      <table class="dataset-table compact">
        <thead><tr><th>Station ID</th><th>Displayed station</th></tr></thead>
        <tbody>
          <tr><td><code>upper_body_centerline</code></td><td>Upper-body component centreline.</td></tr>
          <tr><td><code>underbody_centerline</code></td><td>Smooth or detailed underbody centreline.</td></tr>
          <tr><td><code>front_wheelhouse</code></td><td>Annotated front-wheel region.</td></tr>
          <tr><td><code>rear_body_centerline</code></td><td>Fastback, notchback, or estateback rear-body centreline.</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="dataset-panel">
    <h3>Metric definitions</h3>
    <dl class="metric-definition-list">
      <div>
        <dt>Relative L2 error</dt>
        <dd>
          For a target field <code>q</code>, first map predictions and targets back to dimensional physical space:
          <code>q* = inverse_transform(q)</code>. The score is
          <code>||q_pred* - q_true*||_2 / ||q_true*||_2</code>, reported as a percentage.
        </dd>
      </div>
      <div>
        <dt>Relative L1 error</dt>
        <dd>
          After the same dimensional inverse transform, the score is
          <code>||q_pred* - q_true*||_1 / ||q_true*||_1</code>, reported as a percentage.
        </dd>
      </div>
      <div>
        <dt>Surface pressure relative L2</dt>
        <dd>
          CarBench reports this as relative L2 on the DrivAerNet++ unseen test set. FluidsBench displays the CarBench
          fractional values as percentages.
        </dd>
      </div>
      <div>
        <dt>Pressure-field R<sup>2</sup></dt>
        <dd>
          Coefficient of determination over flattened surface pressure samples:
          <code>1 - sum((q_pred - q_true)^2) / sum((q_true - mean(q_true))^2)</code>.
        </dd>
      </div>
      <div>
        <dt>C<sub>d</sub> and C<sub>l</sub> R<sup>2</sup></dt>
        <dd>
          Future FluidsBench scoring should compute R<sup>2</sup> over all evaluated cases using predicted drag and lift
          coefficients. CarBench v1 explicitly does not evaluate global aerodynamic coefficients.
        </dd>
      </div>
      <div>
        <dt>Cp cut R<sup>2</sup></dt>
        <dd>
          One global R<sup>2</sup> over all selected surface pressure coefficient samples from held-out test cases,
          flattened across <code>case_id</code>, <code>cut_id</code>, <code>station_id</code>, and sample locations.
        </dd>
      </div>
      <div>
        <dt>Velocity profile R<sup>2</sup></dt>
        <dd>
          R<sup>2</sup> over selected wake profile samples. Unless a benchmark package states otherwise, vector
          components should be flattened across stations, cases, and sample points.
        </dd>
      </div>
    </dl>
  </section>

  <section class="dataset-panel">
    <h3>CarBench values used in the prototype</h3>
    <p>
      The current leaderboard rows use CarBench Table 1 values for surface pressure relative L2, pressure-field
      R<sup>2</sup>, and parameter count. The paper states that its first release focuses on surface pressure and does
      not evaluate drag/lift coefficients or volumetric fields, so those non-pressure leaderboard fields are placeholders
      until a DrivAerNet++ FluidsBench evaluator is available.
    </p>
  </section>

  <section class="dataset-panel">
    <h3>References</h3>
    <ul>
      <li><a href="https://arxiv.org/abs/2512.07847">CarBench paper</a></li>
      <li><a href="https://github.com/Mohamedelrefaie/CarBench">CarBench code</a></li>
      <li><a href="https://github.com/Mohamedelrefaie/DrivAerNet">DrivAerNet++ repository</a></li>
      <li><a href="https://huggingface.co/datasets/MoElrefaie/DrivAerNet">DrivAerNet++ Hugging Face dataset</a></li>
    </ul>
  </section>
</div>

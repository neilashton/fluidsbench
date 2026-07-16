---
layout: page
permalink: /datasets/ahmedml/
title: AhmedML dataset
page_title: AhmedML dataset
page_description: Dataset overview and leaderboard submission format for AhmedML.
description:
nav: false
hide_header_background: true
compact_masthead: true
---

<div class="dataset-page">
  <section>
    <p class="dataset-kicker">Dataset specification</p>
    <p class="dataset-intro">
      AhmedML is a high-fidelity CFD dataset for incompressible, low-speed bluff-body aerodynamics using the Ahmed car
      body. It contains 500 geometric variants, with boundary fields, volume fields, geometry, slices, and time-averaged
      force and moment data.
    </p>
    <p>
      The source dataset is maintained at
      <a href="https://caemldatasets.org/ahmedml/">caemldatasets.org/ahmedml</a>. The dataset page describes the full
      download layout, including Hugging Face access, OpenFOAM case setup, STL files, VTP/VTU fields, and force/moment
      CSV files.
    </p>
  </section>

  <section class="dataset-panel">
    <h3>Dataset summary</h3>
    <dl class="dataset-facts">
      <div>
        <dt>Geometry</dt>
        <dd>Parametric Ahmed car body variants.</dd>
      </div>
      <div>
        <dt>Cases</dt>
        <dd>500 CFD simulations.</dd>
      </div>
      <div>
        <dt>Solver</dt>
        <dd>OpenFOAM v2212 finite-volume simulations.</dd>
      </div>
      <div>
        <dt>Fidelity</dt>
        <dd>Transient hybrid RANS-LES, approximately 80 convective time units per case.</dd>
      </div>
      <div>
        <dt>Mesh scale</dt>
        <dd>Approximately 20 million cells per case.</dd>
      </div>
      <div>
        <dt>License</dt>
        <dd>CC BY-SA 4.0, as stated by the dataset source.</dd>
      </div>
    </dl>
  </section>

  <section class="dataset-panel">
    <h3>Official benchmark splits</h3>
    <p>
      AhmedML submissions should set <code>split</code> to one of the benchmark split names below. The split files are
      distributed as a flat manifest with train, validation, and test run IDs for each split.
    </p>

    <div class="dataset-table-wrap">
      <table class="dataset-table compact">
        <thead>
          <tr>
            <th>Split</th>
            <th>Purpose</th>
            <th>Train</th>
            <th>Validation</th>
            <th>Test</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>Full</code></td>
            <td>Seed-42 random public baseline split.</td>
            <td>400</td>
            <td>50</td>
            <td>50</td>
          </tr>
          <tr>
            <td><code>Medium</code></td>
            <td>Nested data-efficiency subset with fixed validation and test cases.</td>
            <td>133</td>
            <td>50</td>
            <td>50</td>
          </tr>
          <tr>
            <td><code>Scarce</code></td>
            <td>Smaller nested data-efficiency subset with fixed validation and test cases.</td>
            <td>67</td>
            <td>50</td>
            <td>50</td>
          </tr>
          <tr>
            <td><code>Super scarce</code></td>
            <td>Minimum-data nested training subset with fixed validation and test cases.</td>
            <td>11</td>
            <td>50</td>
            <td>50</td>
          </tr>
          <tr>
            <td><code>Geometry</code></td>
            <td>STL-Chamfer geometry out-of-distribution split.</td>
            <td>350</td>
            <td>50</td>
            <td>100</td>
          </tr>
          <tr>
            <td><code>High drag</code></td>
            <td>High-drag force-regime out-of-distribution split.</td>
            <td>350</td>
            <td>50</td>
            <td>100</td>
          </tr>
          <tr>
            <td><code>Low drag</code></td>
            <td>Low-drag force-regime out-of-distribution split.</td>
            <td>350</td>
            <td>50</td>
            <td>100</td>
          </tr>
          <tr>
            <td><code>Image wake</code></td>
            <td>Image-derived UxMean wake out-of-distribution split.</td>
            <td>350</td>
            <td>50</td>
            <td>100</td>
          </tr>
        </tbody>
      </table>
    </div>

  </section>

  <section class="dataset-panel">
    {% include dataset_submission_v1.html slug="ahmedml" dataset="AhmedML" %}

  </section>

  <section class="dataset-panel">
    <h3>Cp stations</h3>
    <p>
      AhmedML does not publish a canonical set of one-dimensional pressure traces. FluidsBench therefore defines the
      following symmetry-plane benchmark traces, informed by the body regions described in the
      <a href="https://arxiv.org/abs/2407.20801">AhmedML paper</a>. Use the exact ID in <code>station_id</code>.
    </p>
    <div class="dataset-table-wrap">
      <table class="dataset-table compact">
        <thead><tr><th>Station ID</th><th>Displayed station</th></tr></thead>
        <tbody>
          <tr><td><code>upper_body_centerline</code></td><td>Upper-body centreline over the roof and rear slant.</td></tr>
          <tr><td><code>underbody_centerline</code></td><td>Underbody centreline along the underfloor.</td></tr>
          <tr><td><code>rear_slant_centerline</code></td><td>Centreline across the pressure-sensitive rear slant.</td></tr>
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
          For a target field \(q\), first map predictions and targets back to dimensional physical space:
          \(q^\ast = T_q^{-1}(q)\). The score is \(E_q = ||\hat{q}^\ast - q^\ast||_2 / ||q^\ast||_2\), reported as
          \(100 E_q\). Vector fields are flattened across cases, points, and components before the norm is taken.
        </dd>
      </div>
      <div>
        <dt>Relative L1 error</dt>
        <dd>
          For a target field \(q\), after mapping predictions and targets back to dimensional physical space, the
          relative L1 error is \(A_q = ||\hat{q}^\ast - q^\ast||_1 / ||q^\ast||_1\), reported as \(100 A_q\). Vector
          fields are flattened across cases, points, and components before the norm is taken.
        </dd>
      </div>
      <div>
        <dt>Dimensional evaluation</dt>
        <dd>
          Relative L1 and L2 metrics are not computed on normalized, standardized, or non-dimensional training targets. If
          a model predicts normalized values, the submission/evaluator must undo that transform before scoring.
          C<sub>d</sub>, C<sub>l</sub>, and Cp-cut comparisons remain coefficient-based by definition.
        </dd>
      </div>
      <div>
        <dt>Surface pressure relative L1/L2</dt>
        <dd>
          Relative L1 and L2 error for dimensional surface pressure <code>p_surface_pred</code> against the evaluator surface
          pressure values. Cp is used only for the Cp-cut comparisons and plots.
        </dd>
      </div>
      <div>
        <dt>Surface wall-shear relative L1/L2</dt>
        <dd>
          Relative L1 and L2 error for the wall-shear vector \(\tau_w = (\tau_{w,x}, \tau_{w,y}, \tau_{w,z})\) on the
          Ahmed body surface.
        </dd>
      </div>
      <div>
        <dt>Volume velocity relative L1/L2</dt>
        <dd>
          Relative L1 and L2 error for the velocity vector \(u = (u_x, u_y, u_z)\) on the benchmark volume sample points.
        </dd>
      </div>
      <div>
        <dt>Volume pressure relative L1/L2</dt>
        <dd>Relative L1 and L2 error for pressure on the benchmark volume sample points.</dd>
      </div>
      <div>
        <dt>AB-UPT convention</dt>
        <dd>
          This matches the AB-UPT evaluation convention: targets are normalized for training, but evaluation metrics are
          computed on unnormalized predictions and targets.
        </dd>
      </div>
      <div>
        <dt>Coefficient of determination</dt>
        <dd>
          For scalar values \(y_i\), \(R^2 = 1 - \sum_i(\hat{y}_i - y_i)^2 / \sum_i(y_i - \bar{y})^2\). Higher is
          better; 1.0 is perfect.
        </dd>
      </div>
      <div>
        <dt>C<sub>d</sub> and C<sub>l</sub> R<sup>2</sup></dt>
        <dd>
          R<sup>2</sup> computed over all evaluated cases using predicted drag coefficient <code>cd_pred</code> and lift
          coefficient <code>cl_pred</code>.
        </dd>
      </div>
      <div>
        <dt>Force R<sup>2</sup></dt>
        <dd>Mean of C<sub>d</sub> R<sup>2</sup> and C<sub>l</sub> R<sup>2</sup>.</dd>
      </div>
      <div>
        <dt>Cp cut R<sup>2</sup></dt>
        <dd>
          One global R<sup>2</sup> over all selected surface pressure coefficient samples from the held-out test cases.
          The evaluator flattens <code>cp_pred</code> and ground-truth <code>cp</code> across
          <code>case_id</code>, <code>cut_id</code>, <code>station_id</code>, and cut sample locations before computing
          R<sup>2</sup>. The plotted trace is chosen with the leaderboard station selector.
        </dd>
      </div>
      <div>
        <dt>Cp cut comparisons</dt>
        <dd>
          Per-case and per-cut R<sup>2</sup> values can be reported as profile comparisons, but the leaderboard ranking should use
          the global held-out score so that cases with low Cp variance do not dominate through unstable per-case
          averages.
        </dd>
      </div>
      <div>
        <dt>Velocity profile R<sup>2</sup></dt>
        <dd>
          R<sup>2</sup> over the selected wake profile samples. Unless the benchmark package states otherwise, the score is
          computed on the velocity vector components flattened across stations, cases, and sample points.
        </dd>
      </div>
    </dl>
  </section>

  <section class="dataset-panel">
    <h3>Default overall score</h3>
    <p>
      The leaderboard can be ranked by any individual metric. Its default ranking is a bounded 0-100 weighted score:
    </p>
    <p>
      Relative L1 fields are reported as sortable supplementary metrics, but they are not included in this default score unless a
      future benchmark rule assigns them weights.
    </p>
    <pre><code>S_error(q) = 100 * max(0, 1 - E_q / cap_q)
S_R2(q)    = 100 * min(1, max(0, R2_q))
S_overall  = sum(weight_q * S_q)</code></pre>
    <div class="dataset-table-wrap">
      <table class="dataset-table compact">
        <thead>
          <tr>
            <th>Component</th>
            <th>Weight</th>
            <th>Cap or transform</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Dimensional surface pressure relative L2</td>
            <td>15%</td>
            <td>15% cap</td>
          </tr>
          <tr>
            <td>Dimensional surface wall-shear relative L2</td>
            <td>10%</td>
            <td>20% cap</td>
          </tr>
          <tr>
            <td>Dimensional volume velocity relative L2</td>
            <td>15%</td>
            <td>12% cap</td>
          </tr>
          <tr>
            <td>Dimensional volume pressure relative L2</td>
            <td>10%</td>
            <td>15% cap</td>
          </tr>
          <tr>
            <td>C<sub>d</sub> R<sup>2</sup></td>
            <td>15%</td>
            <td>Clamped to [0, 1]</td>
          </tr>
          <tr>
            <td>C<sub>l</sub> R<sup>2</sup></td>
            <td>10%</td>
            <td>Clamped to [0, 1]</td>
          </tr>
          <tr>
            <td>Velocity profile R<sup>2</sup></td>
            <td>15%</td>
            <td>Clamped to [0, 1]</td>
          </tr>
          <tr>
            <td>Cp cut R<sup>2</sup></td>
            <td>10%</td>
            <td>Clamped to [0, 1]</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="dataset-panel">
    <h3>Links</h3>
    <ul>
      <li><a href="https://caemldatasets.org/ahmedml/">AhmedML dataset page</a></li>
      <li><a href="https://arxiv.org/abs/2407.20801">AhmedML paper</a></li>
      <li><a href="{{ '/' | relative_url }}">Automotive CFD leaderboard prototype</a></li>
    </ul>
  </section>
</div>

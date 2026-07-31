---
layout: page
permalink: /datasets/drivaerml/
title: DrivAerML dataset
page_title: DrivAerML dataset
page_description: Dataset overview and leaderboard submission format for DrivAerML.
description:
nav: false
hide_header_background: true
compact_masthead: true
---

<div class="dataset-page">
  <section>
    <p class="dataset-kicker">Dataset specification</p>
    <p class="dataset-intro">
      DrivAerML is a high-fidelity CFD dataset for road-car external aerodynamics based on 500 parametrically morphed
      variants of the DrivAer notchback vehicle. It provides geometry, surface fields, volume fields, slices, and
      time-averaged forces and moments for machine-learning surrogate development.
    </p>
    <p>
      The source dataset is maintained at
      <a href="https://caemldatasets.org/drivaerml/">caemldatasets.org/drivaerml</a>. The dataset page describes the full
      Hugging Face layout, including STL geometry, VTP boundary fields, VTU volume fields, force/moment CSV files, and
      flow slices.
    </p>
  </section>

  <section class="dataset-panel">
    <h3>Dataset summary</h3>
    <dl class="dataset-facts">
      <div>
        <dt>Geometry</dt>
        <dd>Parametrically morphed DrivAer notchback road-car variants.</dd>
      </div>
      <div>
        <dt>Cases</dt>
        <dd>500 CFD simulations.</dd>
      </div>
      <div>
        <dt>Solver</dt>
        <dd>OpenFOAM v2212 finite-volume simulations with custom workflow modifications.</dd>
      </div>
      <div>
        <dt>Fidelity</dt>
        <dd>Scale-resolving hybrid RANS-LES representative of industrial automotive aerodynamic workflows.</dd>
      </div>
      <div>
        <dt>Mesh scale</dt>
        <dd>Approximately 140 million volume grid cells and 8.8 million surface points per case.</dd>
      </div>
      <div>
        <dt>License</dt>
        <dd>CC BY-SA 4.0, as stated by the dataset source.</dd>
      </div>
    </dl>
  </section>

  <section class="dataset-panel">
    <h3>Planned benchmark splits</h3>
    <p>
      DrivAerML submissions should set <code>split</code> to one of the benchmark split names below. The public split
      manifest excludes the 16 unavailable or author-held-back run IDs from every train, validation, and test partition.
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
            <td>34</td>
            <td>50</td>
          </tr>
          <tr>
            <td><code>Medium</code></td>
            <td>Nested data-efficiency subset with fixed validation and test cases.</td>
            <td>133</td>
            <td>34</td>
            <td>50</td>
          </tr>
          <tr>
            <td><code>Scarce</code></td>
            <td>Smaller nested data-efficiency subset with fixed validation and test cases.</td>
            <td>67</td>
            <td>34</td>
            <td>50</td>
          </tr>
          <tr>
            <td><code>Super scarce</code></td>
            <td>Minimum-data nested training subset with fixed validation and test cases.</td>
            <td>11</td>
            <td>34</td>
            <td>50</td>
          </tr>
          <tr>
            <td><code>Geometry</code></td>
            <td>STL-surface Chamfer geometry out-of-distribution split.</td>
            <td>339</td>
            <td>48</td>
            <td>97</td>
          </tr>
          <tr>
            <td><code>High drag</code></td>
            <td>High-drag force-regime out-of-distribution split.</td>
            <td>339</td>
            <td>48</td>
            <td>97</td>
          </tr>
          <tr>
            <td><code>Low drag</code></td>
            <td>Low-drag force-regime out-of-distribution split.</td>
            <td>339</td>
            <td>48</td>
            <td>97</td>
          </tr>
          <tr>
            <td><code>Rear separation</code></td>
            <td>Image-derived low-speed wake and rear-separation out-of-distribution split.</td>
            <td>339</td>
            <td>48</td>
            <td>97</td>
          </tr>
        </tbody>
      </table>
    </div>

  </section>

  <section class="dataset-panel">
    {% include dataset_submission.html slug="drivaerml" dataset="DrivAerML" %}

  </section>

  <section class="dataset-panel">
    {% include dataset_scoring_contract.html slug="drivaerml" dataset="DrivAerML" %}
  </section>

  <section class="dataset-panel">
    <h3>Cp stations</h3>
    <p>
      These stations reproduce the surface-pressure probe traces in the
      <a href="https://arxiv.org/abs/2408.11969">DrivAerML validation study</a>. Use the exact ID in
      <code>station_id</code>.
    </p>
    <div class="dataset-table-wrap">
      <table class="dataset-table compact">
        <thead><tr><th>Station ID</th><th>Published trace</th></tr></thead>
        <tbody>
          <tr><td><code>upperbody_centerline</code></td><td>Upper-body centreline, y = 0 m (Figure 17a).</td></tr>
          <tr><td><code>underbody_centerline</code></td><td>Underbody centreline, y = 0 m (Figure 17b).</td></tr>
          <tr><td><code>sidewall_z_0_15</code></td><td>Sidewall, z = 0.15 m (Figure 22a).</td></tr>
          <tr><td><code>front_left_wheelhouse_y_neg_0_6</code></td><td>Front-left wheelhouse, y = -0.6 m (Figure 22b).</td></tr>
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
          For each evaluation/test geometry, map predictions to every entity in the release-bound public field support and return predictions and
          targets to dimensional physical space, \(q^\ast = T_q^{-1}(q)\). Calculate both paired relative-L2 values from the accumulated
          sufficient statistics: physical-area weighting is primary on the boundary, while equal-entity weighting is primary in the flow volume.
          Report the complete-case percentages first, then take the arithmetic mean of the geometry-level values.
        </dd>
      </div>
      <div>
        <dt>Relative L1 error</dt>
        <dd>
          When reported as a supplementary metric, relative L1 uses the same complete dimensional support and the primary weighting for that domain.
          Calculate a percentage for each geometry, then take the arithmetic mean of the geometry-level percentages.
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
          Relative L1 and L2 error for dimensional surface pressure <code>p_surface_pred</code> against the evaluator
          surface pressure values. Cp is used only for the Cp-cut comparisons and plots.
        </dd>
      </div>
      <div>
        <dt>Surface wall-shear relative L1/L2</dt>
        <dd>
          Relative L1 and L2 error for the wall-shear vector \(\tau_w = (\tau_{w,x}, \tau_{w,y}, \tau_{w,z})\) on the
          vehicle surface.
        </dd>
      </div>
      <div>
        <dt>Volume velocity relative L1/L2</dt>
        <dd>
          Relative L1 and L2 error for the velocity vector \(u = (u_x, u_y, u_z)\) on every field-bearing entity in the
          release-bound reconstructed volume support.
        </dd>
      </div>
      <div>
        <dt>Volume pressure relative L1/L2</dt>
        <dd>Relative L1 and L2 error for pressure on every field-bearing entity in that same public volume support.</dd>
      </div>
      <div>
        <dt>AB-UPT convention</dt>
        <dd>
          The equal-entity secondary relative L2 is the AB-UPT-compatible value: targets may be normalized for training,
          but evaluation uses unnormalized predictions and targets. FluidsBench additionally uses the area-weighted
          boundary value as its primary surface metric.
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
          coefficient <code>cl_pred</code>. AB-UPT computes these forces from high-resolution surface pressure and wall
          shear stress predictions.
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
          R<sup>2</sup> over selected wake profile samples behind the vehicle. Unless the benchmark package states
          otherwise, the score is computed on the velocity vector components flattened across stations, cases, and sample
          points.
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
            <td>Dimensional surface pressure, physical-area-weighted relative L2</td>
            <td>15%</td>
            <td>15% cap</td>
          </tr>
          <tr>
            <td>Dimensional surface wall shear, physical-area-weighted relative L2</td>
            <td>10%</td>
            <td>20% cap</td>
          </tr>
          <tr>
            <td>Dimensional volume velocity, equal-entity relative L2</td>
            <td>15%</td>
            <td>12% cap</td>
          </tr>
          <tr>
            <td>Dimensional volume pressure, equal-entity relative L2</td>
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
      <li><a href="https://caemldatasets.org/drivaerml/">DrivAerML dataset page</a></li>
      <li><a href="https://arxiv.org/abs/2408.11969">DrivAerML paper</a></li>
      <li><a href="{{ '/' | relative_url }}">Automotive CFD leaderboard prototype</a></li>
    </ul>
  </section>
</div>

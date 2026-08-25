---
layout: page
permalink: /datasets/windsorml/
title: WindsorML dataset
page_title: WindsorML dataset
page_description: Dataset overview and leaderboard submission format for WindsorML.
description:
nav: false
hide_header_background: true
compact_masthead: true
---

<div class="dataset-page">
  {% include dataset_intro.html slug="windsorml" %}

  <section class="dataset-panel">
    <h3>Dataset summary</h3>
    <dl class="dataset-facts">
      <div>
        <dt>Geometry</dt>
        <dd>Geometric variants of the Windsor body, a simplified automotive bluff-body configuration.</dd>
      </div>
      <div>
        <dt>Cases</dt>
        <dd>355 CFD simulations.</dd>
      </div>
      <div>
        <dt>Solver</dt>
        <dd>Volcano Platforms GPU-native Cartesian immersed-boundary CFD solver.</dd>
      </div>
      <div>
        <dt>Fidelity</dt>
        <dd>Wall-Modelled Large-Eddy Simulation (WMLES), run transiently for approximately 80 convective time units.</dd>
      </div>
      <div>
        <dt>Mesh scale</dt>
        <dd>Approximately 300 million cells per case, with the paper describing meshes above 280 million cells.</dd>
      </div>
      <div>
        <dt>Included data</dt>
        <dd>Aggregate metadata for 355 cases and complete per-run geometry, fields, images, forces, and boundary weights for runs 0–349.</dd>
      </div>
      <div>
        <dt>License</dt>
        <dd>CC-BY-SA, as stated by the dataset paper and dataset source.</dd>
      </div>
    </dl>
  </section>

  <section class="dataset-panel dataset-getting-started">
    {% include dataset_getting_started.html slug="windsorml" %}
  </section>

  {% include dataset_design_space.html slug="windsorml" %}

  <section class="dataset-panel">
    <h3>Published source splits</h3>
    <p>
      WindsorML now publishes eight deterministic source split families. These are current source definitions, not yet active FluidsBench case
      bindings: the submission specification still contains one prototype case and needs a fixed policy for the five runs without complete per-run
      fields.
    </p>
    <div class="dataset-table-wrap">
      <table class="dataset-table compact">
        <thead><tr><th>Split ID</th><th>Purpose</th><th>Train</th><th>Validation</th><th>Test</th></tr></thead>
        <tbody>
          <tr><td><code>full</code></td><td>Random source baseline.</td><td>284</td><td>35</td><td>36</td></tr>
          <tr><td><code>medium</code></td><td>Nested data-efficiency subset.</td><td>95</td><td>35</td><td>36</td></tr>
          <tr><td><code>scarce</code></td><td>Smaller nested subset.</td><td>47</td><td>35</td><td>36</td></tr>
          <tr><td><code>super_scarce</code></td><td>Minimum-data nested subset.</td><td>8</td><td>35</td><td>36</td></tr>
          <tr><td><code>geometry</code></td><td>Geometry out of distribution.</td><td>248</td><td>36</td><td>71</td></tr>
          <tr><td><code>high_drag</code></td><td>High-drag out of distribution.</td><td>248</td><td>36</td><td>71</td></tr>
          <tr><td><code>low_drag</code></td><td>Low-drag out of distribution.</td><td>248</td><td>36</td><td>71</td></tr>
          <tr><td><code>image_wake</code></td><td>Image-derived wake out of distribution.</td><td>248</td><td>36</td><td>71</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="dataset-panel">
    {% include dataset_submission.html slug="windsorml" dataset="WindsorML" %}

  </section>

  <section class="dataset-panel">
    {% include dataset_scoring_contract.html slug="windsorml" dataset="WindsorML" %}
  </section>

  <section class="dataset-panel">
    <h3>Cp stations</h3>
    <p>
      These stations reproduce the mean surface-pressure cuts in the supplementary validation of the
      <a href="https://arxiv.org/abs/2407.19320">WindsorML paper</a>. Use the exact ID in <code>station_id</code>.
    </p>
    <div class="dataset-table-wrap">
      <table class="dataset-table compact">
        <thead><tr><th>Station ID</th><th>Published trace</th></tr></thead>
        <tbody>
          <tr><td><code>symmetry_plane_z_0</code></td><td>Symmetry-plane trace, z = 0 m (Figure 18).</td></tr>
          <tr><td><code>horizontal_cut_y_0_2595</code></td><td>Horizontal trace, y = 0.2595 m (Figure 19).</td></tr>
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
          For each evaluation/test geometry, map predictions to every entity in the release-bound public field support and undo any training
          normalization. Calculate both paired relative-L2 values from the accumulated
          sufficient statistics: area-weighted L2 is primary on the boundary, while unweighted cell L2 (each cell counts equally) is primary in the flow volume.
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
        <dt>Dataset-native evaluation</dt>
        <dd>
          The boundary arrays are the dimensionless coefficients <code>cpavg</code>, <code>cfxavg</code>,
          <code>cfyavg</code>, and <code>cfzavg</code>, not pressure or wall shear in pascals. Volume fields are scored in
          their release-bound dataset-native representation. Any normalization used for training must be undone first.
        </dd>
      </div>
      <div>
        <dt>Surface pressure-coefficient relative L1/L2</dt>
        <dd>
          Relative L1 and paired relative L2 error for <code>cpavg</code> at every point in the public boundary VTU.
        </dd>
      </div>
      <div>
        <dt>Surface skin-friction-coefficient relative L1/L2</dt>
        <dd>
          Relative L1 and paired relative L2 error for the coefficient vector
          <code>(cfxavg, cfyavg, cfzavg)</code> at every public boundary point.
        </dd>
      </div>
      <div>
        <dt>Volume velocity relative L1/L2</dt>
        <dd>
          Relative L1 and L2 error for the velocity vector \(u = (u_x, u_y, u_z)\) on every field-bearing cell in the
          release-bound public volume VTU.
        </dd>
      </div>
      <div>
        <dt>Volume pressure relative L1/L2</dt>
        <dd>Relative L1 and L2 error for pressure on every field-bearing cell in the same public volume VTU.</dd>
      </div>
      <div>
        <dt>AB-UPT convention</dt>
        <dd>
          The secondary unweighted point relative L2 (each point counts equally) follows the AB-UPT-compatible convention used for AhmedML and DrivAerML: targets
          may be normalized for training, but evaluation uses unnormalized predictions and targets. FluidsBench uses the
          area-weighted boundary value as its primary surface metric. AB-UPT v2 does not report WindsorML numbers.
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
          R<sup>2</sup> over selected wake profile samples behind the body. Unless the benchmark package states otherwise,
          the score is computed on the velocity vector components flattened across stations, cases, and sample points.
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
            <td>Surface pressure coefficient, area-weighted relative L2</td>
            <td>15%</td>
            <td>15% cap</td>
          </tr>
          <tr>
            <td>Surface skin-friction coefficient vector, area-weighted relative L2</td>
            <td>10%</td>
            <td>20% cap</td>
          </tr>
          <tr>
            <td>Dimensional volume velocity, unweighted cell relative L2</td>
            <td>15%</td>
            <td>12% cap</td>
          </tr>
          <tr>
            <td>Dimensional volume pressure, unweighted cell relative L2</td>
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
      <li><a href="https://caemldatasets.org/windsorml/">WindsorML dataset page</a></li>
      <li><a href="https://arxiv.org/abs/2407.19320">WindsorML paper</a></li>
      <li><a href="{{ '/' | relative_url }}">Automotive CFD leaderboard prototype</a></li>
    </ul>
  </section>
</div>

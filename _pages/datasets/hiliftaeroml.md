---
layout: page
permalink: /datasets/hiliftaeroml/
title: HiLiftAeroML dataset
page_title: HiLiftAeroML dataset
page_description: Dataset overview and leaderboard submission format for HiLiftAeroML.
description:
nav: false
---

<div class="dataset-page">
  <section>
    <p class="dataset-kicker">Dataset specification</p>
    <p class="dataset-intro">
      HiLiftAeroML is a high-fidelity CFD dataset for high-lift aircraft aerodynamics using the NASA Common Research
      Model High-Lift (CRM-HL) configuration. It provides CAD geometry, time-averaged surface and volume fields, flow
      visualisations, and integrated aerodynamic coefficients for machine-learning surrogate development.
    </p>
    <p>
      The source dataset is maintained at
      <a href="https://caemldatasets.org/hiliftaeroml/">caemldatasets.org/hiliftaeroml</a> and hosted on Hugging Face.
      The current FluidsBench example rows use completed 200k inference benchmark results from the HiLiftAeroML paper and
      the local June 25, 2026 PDF.
    </p>
  </section>

  <section class="dataset-panel">
    <h3>Dataset summary</h3>
    <dl class="dataset-facts">
      <div>
        <dt>Geometry</dt>
        <dd>NASA CRM-HL high-lift aircraft with parameterized slat and flap deflections and gaps.</dd>
      </div>
      <div>
        <dt>Cases</dt>
        <dd>1,800 simulations: 180 geometry variants across 10 angles of attack from 4 degrees to 22 degrees.</dd>
      </div>
      <div>
        <dt>Solver</dt>
        <dd>Fidelity Charles explicit unstructured finite-volume solver with Fidelity Stitch Voronoi meshing.</dd>
      </div>
      <div>
        <dt>Fidelity</dt>
        <dd>Wall-Modeled Large-Eddy Simulation (WMLES) with solution-adapted grids.</dd>
      </div>
      <div>
        <dt>Flow conditions</dt>
        <dd>Mach 0.2 and chord-based Reynolds number 1.6 x 10<sup>6</sup>.</dd>
      </div>
      <div>
        <dt>Mesh scale</dt>
        <dd>Solution-adapted grids between roughly 300M and 500M control volumes; exported volume meshes are octree-based.</dd>
      </div>
      <div>
        <dt>License</dt>
        <dd>CC BY 4.0, as stated by the dataset source.</dd>
      </div>
    </dl>
  </section>

  <section class="dataset-panel">
    <h3>Official benchmark splits</h3>
    <p>
      HiLiftAeroML submissions should set <code>split</code> to one of the benchmark split names below. The split
      manifest covers the 1,800 complete LHC cases: 180 geometries across 10 angles of attack from 4 to 22 degrees.
      The raw Hugging Face manifest IDs are accepted as aliases by the leaderboard, but the table below shows the
      readable names used on FluidsBench.
    </p>

    <div class="dataset-table-wrap">
      <table class="dataset-table compact">
        <thead>
          <tr>
            <th>Split</th>
            <th>Manifest ID</th>
            <th>Type</th>
            <th>Purpose</th>
            <th>Train</th>
            <th>Validation</th>
            <th>Test</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>Full</code></td>
            <td><code>full</code></td>
            <td>In-dist</td>
            <td>Random case-level baseline split.</td>
            <td>1260</td>
            <td>180</td>
            <td>360</td>
          </tr>
          <tr>
            <td><code>Medium</code></td>
            <td><code>medium</code></td>
            <td>In-dist</td>
            <td>Intermediate data-efficiency split between Full and Scarce.</td>
            <td>510</td>
            <td>180</td>
            <td>360</td>
          </tr>
          <tr>
            <td><code>Scarce</code></td>
            <td><code>scarce</code></td>
            <td>In-dist</td>
            <td>Data-efficiency split using one sixth of the Full training data.</td>
            <td>210</td>
            <td>180</td>
            <td>360</td>
          </tr>
          <tr>
            <td><code>Super scarce</code></td>
            <td><code>super_scarce</code></td>
            <td>In-dist</td>
            <td>Extreme data-efficiency split using one thirty-sixth of the Full training data.</td>
            <td>35</td>
            <td>180</td>
            <td>360</td>
          </tr>
          <tr>
            <td><code>Geometry</code></td>
            <td><code>geometry</code></td>
            <td>In-dist</td>
            <td>Generalization to unseen geometries, with all 10 AoAs per selected geometry.</td>
            <td>1260</td>
            <td>180</td>
            <td>360</td>
          </tr>
          <tr>
            <td><code>Geometry medium</code></td>
            <td><code>geometry_medium</code></td>
            <td>In-dist</td>
            <td>Unseen-geometry generalization from 51 training geometries.</td>
            <td>510</td>
            <td>180</td>
            <td>360</td>
          </tr>
          <tr>
            <td><code>Geometry scarce</code></td>
            <td><code>geometry_scarce</code></td>
            <td>In-dist</td>
            <td>Unseen-geometry generalization from 21 training geometries.</td>
            <td>210</td>
            <td>180</td>
            <td>360</td>
          </tr>
          <tr>
            <td><code>Geometry super scarce</code></td>
            <td><code>geometry_super_scarce</code></td>
            <td>In-dist</td>
            <td>Unseen-geometry generalization from 4 training geometries.</td>
            <td>40</td>
            <td>180</td>
            <td>360</td>
          </tr>
          <tr>
            <td><code>AoA 4</code></td>
            <td><code>single_aoa_4</code></td>
            <td>In-dist</td>
            <td>Single-AoA geometry generalization at 4 degrees, representative of pre-stall flow.</td>
            <td>126</td>
            <td>18</td>
            <td>36</td>
          </tr>
          <tr>
            <td><code>AoA 12</code></td>
            <td><code>single_aoa_12</code></td>
            <td>In-dist</td>
            <td>Single-AoA geometry generalization at 12 degrees, representative of mid-range flow.</td>
            <td>126</td>
            <td>18</td>
            <td>36</td>
          </tr>
          <tr>
            <td><code>AoA 22</code></td>
            <td><code>single_aoa_22</code></td>
            <td>In-dist</td>
            <td>Single-AoA geometry generalization at 22 degrees, representative of post-stall flow.</td>
            <td>126</td>
            <td>18</td>
            <td>36</td>
          </tr>
          <tr>
            <td><code>AoA extrapolation</code></td>
            <td><code>aoa</code></td>
            <td>OOD</td>
            <td>Train and validate on AoA &lt;= 12 degrees, then test on AoA &gt;= 14 degrees.</td>
            <td>788</td>
            <td>112</td>
            <td>900</td>
          </tr>
          <tr>
            <td><code>Deflection</code></td>
            <td><code>deflection</code></td>
            <td>OOD</td>
            <td>Geometry extrapolation from low mean deflection to high deflection settings.</td>
            <td>1260</td>
            <td>180</td>
            <td>360</td>
          </tr>
          <tr>
            <td><code>Stall</code></td>
            <td><code>stall</code></td>
            <td>OOD</td>
            <td>Flow-regime extrapolation from pre-stall training cases to post-stall test cases.</td>
            <td>942</td>
            <td>135</td>
            <td>723</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="dataset-panel">
    <h3>Leaderboard submission package</h3>
    <p>
      Submit one compressed archive per model. Prediction files should use the benchmark case identifiers and point order
      provided by the evaluator package. The evaluator owns the ground-truth files and computes all metrics from the
      predicted values below. Field values used for relative L1 and L2 must be submitted in dataset-native dimensional
      units after undoing any training normalization or non-dimensionalization.
    </p>

    <div class="dataset-table-wrap">
      <table class="dataset-table">
        <thead>
          <tr>
            <th>File</th>
            <th>Required columns or fields</th>
            <th>Used for</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>metadata.json</code></td>
            <td><code>model_name</code>, <code>model_type</code>, <code>model_types</code>, <code>dataset</code>, <code>split</code>, <code>parameter_count</code>, <code>submission_date</code></td>
            <td>Leaderboard display and filtering.</td>
          </tr>
          <tr>
            <td><code>surface_fields.parquet</code></td>
            <td><code>case_id</code>, <code>point_id</code>, <code>p_surface_pred</code>, <code>tau_wall_x_pred</code>, <code>tau_wall_y_pred</code>, <code>tau_wall_z_pred</code></td>
            <td>Dimensional surface pressure relative L1/L2 and dimensional surface wall-shear relative L1/L2.</td>
          </tr>
          <tr>
            <td><code>volume_fields.parquet</code></td>
            <td><code>case_id</code>, <code>point_id</code>, <code>u_x_pred</code>, <code>u_y_pred</code>, <code>u_z_pred</code>, <code>p_volume_pred</code></td>
            <td>Dimensional volume velocity relative L1/L2 and dimensional volume pressure relative L1/L2.</td>
          </tr>
          <tr>
            <td><code>forces.csv</code></td>
            <td><code>case_id</code>, <code>cd_pred</code>, <code>cl_pred</code>, optional <code>cm_pred</code></td>
            <td>C<sub>d</sub> R<sup>2</sup>, C<sub>l</sub> R<sup>2</sup>, force R<sup>2</sup>, and optional pitching-moment diagnostics.</td>
          </tr>
          <tr>
            <td><code>cp_cuts.csv</code></td>
            <td><code>case_id</code>, <code>cut_id</code>, <code>x_over_c</code>, <code>cp_pred</code></td>
            <td>Cp cut R<sup>2</sup> and CRM-HL wing section Cp plots.</td>
          </tr>
          <tr>
            <td><code>velocity_profiles.csv</code></td>
            <td><code>case_id</code>, <code>station_id</code>, <code>sdf_distance_over_lref</code>, <code>u_parallel_pred</code></td>
            <td>Velocity profile R<sup>2</sup> and near-wall profile plots.</td>
          </tr>
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
          a model predicts normalized values, the submission/evaluator must undo that transform before scoring. For
          HiLiftAeroML this means pressure, wall shear, and velocity are evaluated in the dataset-native physical units;
          C<sub>d</sub>, C<sub>l</sub>, and Cp-cut diagnostics remain coefficient-based by definition.
        </dd>
      </div>
      <div>
        <dt>Surface pressure relative L1/L2</dt>
        <dd>
          Relative L1 and L2 error for dimensional surface pressure <code>p_surface_pred</code> against the evaluator
          surface pressure values. Cp is used only for the Cp-cut diagnostic and plots.
        </dd>
      </div>
      <div>
        <dt>Surface wall-shear relative L1/L2</dt>
        <dd>
          Relative L1 and L2 error for the wall-shear vector \(\tau_w = (\tau_{w,x}, \tau_{w,y}, \tau_{w,z})\) on the
          CRM-HL aircraft surface.
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
          coefficient <code>cl_pred</code>. HiLiftAeroML also reports pitching-moment R<sup>2</sup> in the paper; the
          current leaderboard stores C<sub>d</sub> and C<sub>l</sub> for consistency with the automotive tables.
        </dd>
      </div>
      <div>
        <dt>Force R<sup>2</sup></dt>
        <dd>Mean of C<sub>d</sub> R<sup>2</sup> and C<sub>l</sub> R<sup>2</sup>.</dd>
      </div>
      <div>
        <dt>Cp cut R<sup>2</sup></dt>
        <dd>
          One global R<sup>2</sup> over all selected wing-section surface pressure coefficient samples from the held-out
          test cases. The evaluator flattens <code>cp_pred</code> and ground-truth <code>cp</code> across
          <code>case_id</code>, <code>cut_id</code>, and section sample locations before computing R<sup>2</sup>. The
          first plotted cut is a representative CRM-HL wing section Cp trace.
        </dd>
      </div>
      <div>
        <dt>Cp cut diagnostics</dt>
        <dd>
          Per-case and per-cut R<sup>2</sup> values can be reported as diagnostics, but the leaderboard ranking should use
          the global held-out score so that cases with low Cp variance do not dominate through unstable per-case
          averages.
        </dd>
      </div>
      <div>
        <dt>Velocity profile R<sup>2</sup></dt>
        <dd>
          R<sup>2</sup> over selected near-wall profile samples. Unless the benchmark package states otherwise, the score
          is computed on <code>u_parallel_pred</code> flattened across profile windows, cases, and sample locations.
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
      Relative L1 fields are reported and sortable diagnostics, but they are not included in this default score unless a
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
      <li><a href="https://caemldatasets.org/hiliftaeroml/">HiLiftAeroML dataset page</a></li>
      <li><a href="https://arxiv.org/abs/2605.19565">HiLiftAeroML paper</a></li>
      <li><a href="https://huggingface.co/datasets/nvidia/HiLiftAeroML">HiLiftAeroML Hugging Face dataset</a></li>
      <li><a href="https://huggingface.co/datasets/nvidia/HiLiftAeroML/blob/main/splits/README.md">HiLiftAeroML split README</a></li>
      <li><a href="{{ '/' | relative_url }}">CFD leaderboard prototype</a></li>
    </ul>
  </section>
</div>

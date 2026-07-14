---
layout: page
permalink: /datasets/airfrans/
title: AirfRANS dataset
page_title: AirfRANS dataset
page_description: Dataset overview and leaderboard submission format for AirfRANS.
description:
nav: false
---

<div class="dataset-page">
  <section>
    <p class="dataset-kicker">Dataset specification</p>
    <p class="dataset-intro">
      AirfRANS is a high-fidelity CFD dataset for two-dimensional incompressible steady-state Reynolds-Averaged
      Navier-Stokes solutions around airfoils. It targets surrogate models that predict flow fields and aerodynamic
      coefficients over NACA 4- and 5-digit airfoils.
    </p>
    <p>
      The dataset is described in the
      <a href="https://arxiv.org/abs/2212.07564">AirfRANS paper</a>. Code and loading utilities are available from
      <a href="https://github.com/Extrality/AirfRANS">the AirfRANS benchmark repository</a> and
      <a href="https://github.com/Extrality/airfrans_lib">airfrans_lib</a>.
    </p>
  </section>

  <section class="dataset-panel">
    <h3>Dataset summary</h3>
    <dl class="dataset-facts">
      <div>
        <dt>Geometry</dt>
        <dd>NACA 4- and 5-digit airfoils.</dd>
      </div>
      <div>
        <dt>Cases</dt>
        <dd>1,000 two-dimensional RANS simulations.</dd>
      </div>
      <div>
        <dt>Flow regime</dt>
        <dd>Subsonic, steady-state, incompressible RANS.</dd>
      </div>
      <div>
        <dt>Conditions</dt>
        <dd>Reynolds numbers between 2 million and 6 million, with angles of attack between -5 and 15 degrees.</dd>
      </div>
      <div>
        <dt>Benchmark splits</dt>
        <dd><code>Full</code>, <code>Scarce</code>, <code>Reynolds extrapolation</code>, and <code>AoA extrapolation</code>.</dd>
      </div>
      <div>
        <dt>Fields</dt>
        <dd>Velocity components, reduced pressure, turbulent kinematic viscosity, and surface pressure coefficients.</dd>
      </div>
    </dl>
  </section>

  <section class="dataset-panel">
    <h3>Leaderboard submission package</h3>
    <p>
      Submit one compressed archive per model and split. Prediction files should use the evaluator's case identifiers,
      mesh point order, and surface point order. Field values used for relative L1 and L2 must be submitted in
      dataset-native dimensional units after undoing any training normalization or non-dimensionalization.
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
            <td>
              <code>model_name</code>, <code>model_type</code>, <code>dataset</code>, <code>split</code>,
              <code>parameter_count</code>, <code>submission_date</code>
            </td>
            <td>Leaderboard display and filtering.</td>
          </tr>
          <tr>
            <td><code>surface_fields.parquet</code></td>
            <td><code>case_id</code>, <code>point_id</code>, <code>p_surface_pred</code></td>
            <td>Dimensional surface pressure relative L1/L2 and surface Cp diagnostics.</td>
          </tr>
          <tr>
            <td><code>surface_wall_shear.parquet</code></td>
            <td><code>case_id</code>, <code>point_id</code>, <code>tau_wall_x_pred</code>, <code>tau_wall_y_pred</code></td>
            <td>Dimensional wall-shear relative L1/L2 and drag-sensitive boundary-layer diagnostics.</td>
          </tr>
          <tr>
            <td><code>volume_fields.parquet</code></td>
            <td><code>case_id</code>, <code>point_id</code>, <code>u_x_pred</code>, <code>u_y_pred</code>, <code>p_volume_pred</code>, <code>nu_t_pred</code></td>
            <td>Dimensional velocity and pressure relative L1/L2, plus optional turbulent-viscosity diagnostics.</td>
          </tr>
          <tr>
            <td><code>forces.csv</code></td>
            <td><code>case_id</code>, <code>cd_pred</code>, <code>cl_pred</code></td>
            <td>C<sub>d</sub> R<sup>2</sup>, C<sub>l</sub> R<sup>2</sup>, and force R<sup>2</sup>.</td>
          </tr>
          <tr>
            <td><code>cp_cuts.csv</code></td>
            <td><code>case_id</code>, <code>cut_id</code>, <code>station_id</code>, <code>x_over_c</code>, <code>cp_pred</code></td>
            <td>Cp cut R<sup>2</sup> and airfoil surface Cp plots.</td>
          </tr>
          <tr>
            <td><code>velocity_profiles.csv</code></td>
            <td><code>case_id</code>, <code>station_id</code>, <code>wall_distance_over_c</code>, <code>u_x_pred</code>, <code>u_y_pred</code></td>
            <td>Boundary-layer velocity profile R<sup>2</sup> and velocity-profile plots.</td>
          </tr>
        </tbody>
      </table>
    </div>

  </section>

  <section class="dataset-panel">
    <h3>Cp stations</h3>
    <p>
      The <a href="https://arxiv.org/abs/2212.07564">AirfRANS paper</a> evaluates pressure distributions on the two
      airfoil sides separately. Use the exact ID in <code>station_id</code>.
    </p>
    <div class="dataset-table-wrap">
      <table class="dataset-table compact">
        <thead><tr><th>Station ID</th><th>Displayed station</th></tr></thead>
        <tbody>
          <tr><td><code>upper_surface</code></td><td>Upper surface (extrados).</td></tr>
          <tr><td><code>lower_surface</code></td><td>Lower surface (intrados).</td></tr>
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
        <dt>Dimensional evaluation</dt>
        <dd>
          AirfRANS models are commonly trained on normalized fields. FluidsBench relative L1/L2 metrics should be
          computed after undoing those normalizations, not on the normalized fields reported by the original MSE tables.
        </dd>
      </div>
      <div>
        <dt>Surface pressure relative L1/L2</dt>
        <dd>Relative L1 and L2 error for dimensional pressure on the airfoil surface.</dd>
      </div>
      <div>
        <dt>Surface wall-shear relative L1/L2</dt>
        <dd>Relative L1 and L2 error for the two-dimensional wall-shear vector on the airfoil surface.</dd>
      </div>
      <div>
        <dt>Volume velocity and pressure relative L1/L2</dt>
        <dd>
          Velocity uses the flattened <code>u_x</code> and <code>u_y</code> components across all evaluated cases and mesh
          points. Pressure uses the flattened volume pressure values.
        </dd>
      </div>
      <div>
        <dt>C<sub>d</sub> and C<sub>l</sub> R<sup>2</sup></dt>
        <dd>
          R<sup>2</sup> over all evaluated cases using drag and lift coefficients computed from the predicted fields. The
          original AirfRANS paper reports force relative errors and Spearman correlations; FluidsBench should compute
          R<sup>2</sup> directly when evaluator outputs are available.
        </dd>
      </div>
      <div>
        <dt>Cp cut R<sup>2</sup></dt>
        <dd>
          One global R<sup>2</sup> over all selected airfoil surface pressure coefficient samples from held-out cases,
          flattened across <code>case_id</code>, <code>cut_id</code>, <code>station_id</code>, and chordwise sample locations.
        </dd>
      </div>
      <div>
        <dt>Velocity profile R<sup>2</sup></dt>
        <dd>
          R<sup>2</sup> over selected boundary-layer velocity profiles, flattened across stations, cases, sample points,
          and velocity components.
        </dd>
      </div>
    </dl>
  </section>

  <section class="dataset-panel">
    <h3>Prototype values</h3>
    <p>
      The current leaderboard rows use the full-data-regime AirfRANS baseline tables from arXiv v3. The paper reports
      normalized-field MSE, force relative errors, Spearman correlations, and parameter counts. Because those are not the
      final FluidsBench dimensional relative L1/L2 and R<sup>2</sup> evaluator outputs, the displayed field and force
      scores are prototype conversions and should be replaced by official evaluator exports.
    </p>
  </section>

  <section class="dataset-panel">
    <h3>References</h3>
    <ul>
      <li><a href="https://arxiv.org/abs/2212.07564">AirfRANS paper</a></li>
      <li><a href="https://github.com/Extrality/AirfRANS">AirfRANS benchmark repository</a></li>
      <li><a href="https://github.com/Extrality/airfrans_lib">airfrans_lib</a></li>
      <li><a href="https://airfrans.readthedocs.io/en/latest/modules/dataset.html">AirfRANS documentation</a></li>
    </ul>
  </section>
</div>

---
layout: page
permalink: /datasets/airfrans/
title: AirfRANS dataset
page_title: AirfRANS dataset
page_description: Dataset overview and leaderboard submission format for AirfRANS.
description:
nav: false
hide_header_background: true
compact_masthead: true
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
    {% include dataset_submission_v1.html slug="airfrans" dataset="AirfRANS" %}

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

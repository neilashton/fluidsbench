---
layout: page
permalink: /datasets/blendednet/
title: BlendedNet dataset
page_title: BlendedNet dataset
page_description: Dataset overview and leaderboard submission format for BlendedNet.
nav: false
hide_header_background: true
compact_masthead: true
---

<div class="dataset-page">
  <section class="dataset-section">
    <h2>Overview</h2>
    <p>
      BlendedNet is a high-fidelity aerodynamic dataset for parametrically generated blended-wing-body aircraft. The
      published training and validation pool contains 8,830 cases from 999 geometries. A separate test release contains
      870 cases from 100 geometries that do not occur in the training pool.
    </p>
    <p>
      The cases use steady RANS simulations in FUN3D with the Spalart-Allmaras turbulence model and meshes of roughly
      9-14 million volume cells. Inputs combine surface coordinates and normals, nine geometry parameters, altitude,
      Reynolds number, Mach number, angle of attack, and sideslip angle.
    </p>
    <p>
      The initial FluidsBench target follows the published surrogate: surface <code>Cp</code>, <code>Cfx</code>, and
      <code>Cfz</code>, plus integrated C<sub>D</sub>, C<sub>L</sub>, and C<sub>My</sub>. The archive also contains
      <code>Cfy</code>, but it is not ranked until a dataset-owner-approved evaluator adds it to the benchmark contract.
    </p>
  </section>

  <section class="dataset-section">
    <h2>Planned benchmark split</h2>
    <p>
      Set the submission <code>split</code> to the exact ID below. Cases are grouped by geometry, and the fixed test
      geometries must not be used for model fitting, hyperparameter selection, or preprocessing statistics.
    </p>
    <div class="dataset-table-wrap">
      <table class="dataset-table">
        <thead><tr><th>Split ID</th><th>Train/validation pool</th><th>Fixed test</th></tr></thead>
        <tbody>
          <tr><td><code>geometry_holdout</code></td><td>8,830 cases from 999 geometries</td><td>870 cases from 100 unseen geometries</td></tr>
        </tbody>
      </table>
    </div>
    <p>
      The publication divides the 8,830-case pool into 90% training and 10% validation by geometry. FluidsBench records
      the released pool as one split because submissions are evaluated against the separate geometry-disjoint test set.
    </p>
  </section>

  <section class="dataset-section">
    {% include dataset_submission.html heading=2 slug="blendednet" dataset="BlendedNet" %}
  </section>

  <section class="dataset-section">
    <h2>Leaderboard metrics</h2>
    <p>
      FluidsBench ranks <code>blended_surface_rel_l2</code>, the mean relative L2 error across <code>Cp</code>,
      <code>Cfx</code>, and <code>Cfz</code>. Lower is better. This aggregate is a FluidsBench display rule; the paper
      reports the component metrics separately.
    </p>
    <p><code>MSE = (1/N) sum_i (yhat_i-y_i)^2</code></p>
    <p><code>MAE = (1/N) sum_i |yhat_i-y_i|</code></p>
    <p><code>L1_rel(%) = 100 sum_i |yhat_i-y_i| / sum_i |y_i|</code></p>
    <p><code>L2_rel(%) = 100 sqrt(sum_i (yhat_i-y_i)^2) / sqrt(sum_i y_i^2)</code></p>
    <p><code>R2 = 1 - sum_i (y_i-yhat_i)^2 / sum_i (y_i-mean(y))^2</code></p>
    <p><code>surface_mean_L2 = (L2_Cp + L2_Cfx + L2_Cfz) / 3</code></p>
  </section>

  <section class="dataset-section">
    <h2>Profile comparisons</h2>
    <p>
      BlendedNet publishes surface coefficient fields rather than full three-dimensional flow fields. The leaderboard
      therefore shows pressure and skin-friction cuts, but does not invent a velocity-profile comparison.
    </p>
    <p>
      Current ground-truth and submitted curves are clearly labelled illustrative dummy data. They must be replaced once
      FluidsBench publishes a canonical case, extraction coordinates, interpolation rule, and tolerance for each cut.
    </p>
  </section>

  <section class="dataset-section">
    <h2>Citation</h2>
    <p>
      Nicholas Sung, Steven Spreizer, Mohamed Elrefaie, Kaira Samuel, Matthew C. Jones, and Faez Ahmed. "BlendedNet: A
      Blended Wing Body Aircraft Dataset and Surrogate Model for Aerodynamic Predictions." Volume 3B: 51st Design
      Automation Conference, IDETC-CIE2025. ASME, August 2025.
    </p>
  </section>

  <section class="dataset-section">
    <h2>Related links</h2>
    <ul>
      <li><a href="https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/VJT9EP">BlendedNet dataset on Harvard Dataverse</a></li>
      <li><a href="https://doi.org/10.1115/DETC2025-168977">ASME conference paper</a></li>
      <li><a href="https://arxiv.org/abs/2509.07209">Open-access paper on arXiv</a></li>
      <li><a href="https://github.com/neilashton/fluidsbench-submission">FluidsBench submission repository</a></li>
    </ul>
  </section>
</div>

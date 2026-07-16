---
layout: page
permalink: /datasets/blendednet/
title: BlendedNet dataset
page_title: BlendedNet dataset
page_description: Dataset overview and leaderboard submission format for BlendedNet.
nav: false
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
      <code>Cfy</code>, but it is not ranked until an approved evaluator adds it to the benchmark contract.
    </p>
  </section>

  <section class="dataset-section">
    <h2>Official split</h2>
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
    <h2>Leaderboard submission package</h2>
    <p>
      Submit one JSON file per model under <code>submissions/blendednet/</code> in the
      <a href="https://github.com/neilashton/fluidsbench-submission">FluidsBench submission repository</a>. Metric values
      must come from the approved evaluator. The evaluator and exact public test protocol remain TODO.
    </p>

    <h3>Required JSON structure</h3>
    <pre><code>{

"submission_id": "unique-lab-model-blendednet-id",
"model": "Published model name",
"model_type": "Point cloud",
"model_types": ["Point cloud", "MLP"],
"training_regime": "from_scratch",
"target_data_used": "official_train",
"external_pretraining": false,
"pretraining_data": [],
"dataset": "BlendedNet",
"split": "geometry_holdout",
"parameter_count": 5.4,
"submitter_name": "Person, laboratory, or company",
"institution": "Institution name",
"paper_url": "https://...",
"code_url": "https://...",
"submitted_at": "YYYY-MM-DD",
"metric_values": { ... },
"diagnostics": {
"cp_cuts": [ ... ],
"skin_friction_profiles": [ ... ]
}
}</code></pre>

    <p>
      <code>model_types</code> may contain multiple architecture categories. The accepted training regimes are
      <code>from_scratch</code>, <code>pretrained_zero_shot</code>, <code>pretrained_official_train</code>, and
      <code>other</code>. Externally pretrained submissions must identify the pretraining datasets in
      <code>pretraining_data</code>.
    </p>

    <h3>Metric values</h3>
    <p>
      The <code>metric_values</code> object must contain every metric listed in the manifest. All aerodynamic
      coefficients are dimensionless.
    </p>
    <div class="dataset-table-wrap">
      <table class="dataset-table compact">
        <thead><tr><th>Output</th><th>Metric ID prefix</th><th>Required suffixes</th></tr></thead>
        <tbody>
          <tr><td>Surface pressure coefficient</td><td><code>blended_cp</code></td><td><code>mse</code>, <code>mae</code>, <code>rel_l1</code>, <code>rel_l2</code>, <code>r2</code></td></tr>
          <tr><td>Streamwise skin-friction coefficient</td><td><code>blended_cfx</code></td><td><code>mse</code>, <code>mae</code>, <code>rel_l1</code>, <code>rel_l2</code>, <code>r2</code></td></tr>
          <tr><td>Vertical skin-friction coefficient</td><td><code>blended_cfz</code></td><td><code>mse</code>, <code>mae</code>, <code>rel_l1</code>, <code>rel_l2</code>, <code>r2</code></td></tr>
          <tr><td>Integrated C<sub>D</sub>, C<sub>L</sub>, and C<sub>My</sub></td><td><code>c_drag</code>, <code>c_lift</code>, <code>c_pitch</code></td><td><code>mae</code>, <code>r2</code></td></tr>
        </tbody>
      </table>
    </div>
    <p>
      <code>blended_surface_rel_l2</code> must equal the arithmetic mean of <code>blended_cp_rel_l2</code>,
      <code>blended_cfx_rel_l2</code>, and <code>blended_cfz_rel_l2</code>.
    </p>

    <h3>Profile arrays</h3>
    <p>
      Each series requires a non-empty <code>case_id</code>, exact station and quantity IDs, and numeric
      <code>x_over_c1</code> points. The three current stations are deliberately prefixed <code>prototype_</code> because
      their canonical extraction locations and tolerances are not yet part of the published dataset.
    </p>
    <div class="dataset-table-wrap">
      <table class="dataset-table compact">
        <thead><tr><th>Array</th><th>Quantity IDs</th><th>Required stations</th></tr></thead>
        <tbody>
          <tr><td><code>cp_cuts</code></td><td><code>cp</code></td><td><code>prototype_centerline</code>, <code>prototype_midspan</code>, <code>prototype_outer_wing</code></td></tr>
          <tr><td><code>skin_friction_profiles</code></td><td><code>cfx</code>, <code>cfz</code></td><td><code>prototype_centerline</code>, <code>prototype_midspan</code>, <code>prototype_outer_wing</code></td></tr>
        </tbody>
      </table>
    </div>
    <pre><code>{

"case_id": "evaluator-case-id",
"station_id": "prototype_midspan",
"quantity_id": "cp",
"values": [
{"x_over_c1": 0.0, "cp": -0.2},
{"x_over_c1": 1.0, "cp": 0.1}
]
}</code></pre>

    <h3>Validation and review evidence</h3>
    <p>Run the repository validator before opening the pull request:</p>
    <pre><code>python3 scripts/manage_leaderboard.py validate submissions/blendednet/&lt;submission-file&gt;.json</code></pre>
    <p>The pull request must include:</p>
    <ul>
      <li>the evaluator version or commit and exact command used;</li>
      <li>confirmation that the geometry-disjoint split was preserved;</li>
      <li>the model checkpoint or reproducible code revision used to generate predictions;</li>
      <li>the evaluator output reproducing every submitted metric; and</li>
      <li>confirmation that profile curves came from the same evaluated predictions.</li>
    </ul>
    <p>
      Use
      <a href="https://github.com/neilashton/fluidsbench-submission/blob/dev/submissions/blendednet/dummy-blendednet-geometry-holdout.json">the complete prototype submission</a>
      as a structural example. Its values are illustrative only.
    </p>

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

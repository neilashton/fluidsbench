---
layout: page
permalink: /datasets/rotor37/
title: Rotor37 dataset
page_title: Rotor37 dataset
page_description: Dataset overview and leaderboard submission format for Rotor37.
nav: false
---

<div class="dataset-page">
  <section class="dataset-section">
    <h2>Overview</h2>
    <p>
      Rotor37 contains 1,200 three-dimensional CFD simulations derived from NASA Rotor 37 compressor configurations.
      FluidsBench follows the current PLAID release: 1,000 cases form the training pool and 200 cases form the fixed
      hidden test set.
    </p>
    <p>
      Inputs are blade geometry, surface normals, rotational speed <code>Omega</code>, and pressure condition
      <code>P</code>. The current canonical outputs are <code>Density</code>, <code>Pressure</code>, and
      <code>Temperature</code> fields plus <code>Massflow</code>, <code>Compression_ratio</code>, and
      <code>Efficiency</code> scalars. The obsolete polytropic-efficiency target from earlier work is not used.
    </p>
  </section>

  <section class="dataset-section">
    <h2>Official splits</h2>
    <p>
      Set the submission <code>split</code> to the exact ID below. The reduced training sets use the official published
      non-contiguous index selections; they must not be replaced by the first <em>N</em> cases. Every split uses the same
      200-case test set.
    </p>
    <div class="dataset-table-wrap">
      <table class="dataset-table">
        <thead><tr><th>Split ID</th><th>Train</th><th>Test</th></tr></thead>
        <tbody>
          <tr><td><code>train_1000</code></td><td>1,000</td><td>200</td></tr>
          <tr><td><code>train_500</code></td><td>500</td><td>200</td></tr>
          <tr><td><code>train_250</code></td><td>250</td><td>200</td></tr>
          <tr><td><code>train_125</code></td><td>125</td><td>200</td></tr>
          <tr><td><code>train_64</code></td><td>64</td><td>200</td></tr>
          <tr><td><code>train_32</code></td><td>32</td><td>200</td></tr>
          <tr><td><code>train_16</code></td><td>16</td><td>200</td></tr>
          <tr><td><code>train_8</code></td><td>8</td><td>200</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="dataset-section">
    <h2>Leaderboard submission package</h2>
    <p>
      Submit one JSON file per model and split under <code>submissions/rotor37/</code> in the
      <a href="https://github.com/neilashton/fluidsbench-submission">FluidsBench submission repository</a>. Metric values
      must be exported by the approved Rotor37 evaluator; do not calculate or edit leaderboard scores by hand.
    </p>

    <h3>Required JSON structure</h3>
    <pre><code>{

"submission_id": "unique-lab-model-rotor37-split-id",
"model": "Published model name",
"model_type": "Neural operator",
"model_types": ["Neural operator", "Transformer"],
"training_regime": "from_scratch",
"target_data_used": "official_train",
"external_pretraining": false,
"pretraining_data": [],
"dataset": "Rotor37",
"split": "train_500",
"parameter_count": 7.5,
"submitter_name": "Person, laboratory, or company",
"institution": "Institution name",
"paper_url": "https://...",
"code_url": "https://...",
"submitted_at": "YYYY-MM-DD",
"metric_values": { ... },
"diagnostics": {
"blade_profiles": [ ... ],
"blade_thermo_profiles": [ ... ]
}
}</code></pre>

<p>
<code>model_types</code> may contain multiple architecture categories. The accepted training regimes are
<code>from_scratch</code>, <code>pretrained_zero_shot</code>, <code>pretrained_official_train</code>, and
<code>other</code>. Externally pretrained submissions must describe the pretraining datasets in
<code>pretraining_data</code>.
</p>

    <h3>Metric values</h3>
    <p>
      The <code>metric_values</code> object must contain <code>total_error</code> and all six metrics listed below for
      each output. Relative L1 and L2 values are percentages. RRMSE and R<sup>2</sup> are dimensionless.
      <code>total_error</code> must equal the arithmetic mean of the six RRMSE values.
    </p>
    <div class="dataset-table-wrap">
      <table class="dataset-table compact">
        <thead><tr><th>Output</th><th>Metric ID prefix</th><th>Required suffixes</th><th>MAE/RMSE unit</th></tr></thead>
        <tbody>
          <tr><td>Density</td><td><code>rotor_density</code></td><td><code>rrmse</code>, <code>rel_l2</code>, <code>rel_l1</code>, <code>r2</code>, <code>mae</code>, <code>rmse</code></td><td>kg/m<sup>3</sup></td></tr>
          <tr><td>Pressure</td><td><code>rotor_pressure</code></td><td><code>rrmse</code>, <code>rel_l2</code>, <code>rel_l1</code>, <code>r2</code>, <code>mae</code>, <code>rmse</code></td><td>Pa</td></tr>
          <tr><td>Temperature</td><td><code>rotor_temperature</code></td><td><code>rrmse</code>, <code>rel_l2</code>, <code>rel_l1</code>, <code>r2</code>, <code>mae</code>, <code>rmse</code></td><td>K</td></tr>
          <tr><td>Mass flow</td><td><code>rotor_massflow</code></td><td><code>rrmse</code>, <code>rel_l2</code>, <code>rel_l1</code>, <code>r2</code>, <code>mae</code>, <code>rmse</code></td><td>kg/s</td></tr>
          <tr><td>Compression ratio</td><td><code>rotor_compression_ratio</code></td><td><code>rrmse</code>, <code>rel_l2</code>, <code>rel_l1</code>, <code>r2</code>, <code>mae</code>, <code>rmse</code></td><td>dimensionless</td></tr>
          <tr><td>Efficiency</td><td><code>rotor_efficiency</code></td><td><code>rrmse</code>, <code>rel_l2</code>, <code>rel_l1</code>, <code>r2</code>, <code>mae</code>, <code>rmse</code></td><td>dimensionless</td></tr>
        </tbody>
      </table>
    </div>

    <h3>Diagnostic arrays</h3>
    <p>
      Supply one pressure-ratio series and two thermodynamic series at each of <code>span_10</code>,
      <code>span_50</code>, and <code>span_90</code>. Each series requires a non-empty <code>case_id</code>, the exact
      station and quantity IDs, and numeric points.
    </p>
    <div class="dataset-table-wrap">
      <table class="dataset-table compact">
        <thead><tr><th>Array</th><th>Quantity ID</th><th>Point fields</th><th>Required stations</th></tr></thead>
        <tbody>
          <tr><td><code>blade_profiles</code></td><td><code>pressure_ratio</code></td><td><code>x_over_c</code>, <code>pressure_ratio</code></td><td><code>span_10</code>, <code>span_50</code>, <code>span_90</code></td></tr>
          <tr><td><code>blade_thermo_profiles</code></td><td><code>temperature_ratio</code></td><td><code>x_over_c</code>, <code>temperature_ratio</code></td><td><code>span_10</code>, <code>span_50</code>, <code>span_90</code></td></tr>
          <tr><td><code>blade_thermo_profiles</code></td><td><code>density_ratio</code></td><td><code>x_over_c</code>, <code>density_ratio</code></td><td><code>span_10</code>, <code>span_50</code>, <code>span_90</code></td></tr>
        </tbody>
      </table>
    </div>
    <pre><code>{

"case_id": "evaluator-case-id",
"station_id": "span_50",
"quantity_id": "pressure_ratio",
"values": [
{"x_over_c": 0.0, "pressure_ratio": 0.88},
{"x_over_c": 1.0, "pressure_ratio": 1.47}
]
}</code></pre>

    <h3>Validation and review evidence</h3>
    <p>Run the repository validator before opening the pull request:</p>
    <pre><code>python3 scripts/manage_leaderboard.py validate submissions/rotor37/&lt;submission-file&gt;.json</code></pre>
    <p>The pull request must include:</p>
    <ul>
      <li>the evaluator version or commit and the exact command used;</li>
      <li>the official split ID and the published non-contiguous index file or its checksum;</li>
      <li>the model checkpoint or reproducible code revision used to generate predictions;</li>
      <li>the evaluator output or log reproducing every submitted metric; and</li>
      <li>confirmation that dimensional values were restored before MAE and RMSE were calculated.</li>
    </ul>
    <p>
      Use
      <a href="https://github.com/neilashton/fluidsbench-submission/blob/dev/submissions/rotor37/dummy-rotor37-train_1000.json">the complete prototype submission</a>
      as a structural example. It contains illustrative values only. Generated files under <code>leaderboard/</code> are
      rebuilt by maintainers after approval.
    </p>

  </section>

  <section class="dataset-section">
    <h2>Leaderboard metrics</h2>
    <p>
      The primary ranking is <code>total_error</code>, the arithmetic mean of the six official PLAID RRMSE values. Lower
      is better. Relative L1, relative L2, and R<sup>2</sup> are also shown for every output. Rotor37 additionally shows
      dimensional MAE and RMSE in <code>kg/m^3</code>, <code>Pa</code>, <code>K</code>, and <code>kg/s</code> where
      applicable; compression ratio and efficiency are dimensionless.
    </p>
    <p><code>RRMSE_field = sqrt((1/n) sum_i [((1/N_i) ||fhat_i - f_i||_2^2) / ||f_i||_inf^2])</code></p>
    <p><code>RRMSE_scalar = sqrt((1/n) sum_i [|shat_i - s_i|^2 / |s_i|^2])</code></p>
    <p><code>total_error = (1/6) sum_j RRMSE_j</code></p>
    <p><code>MAE = (1/N) sum_i |yhat_i-y_i|</code></p>
    <p><code>RMSE = sqrt((1/N) sum_i (yhat_i-y_i)^2)</code></p>
    <p><code>L1_rel(%) = 100 sum_i w_i |yhat_i-y_i| / sum_i w_i |y_i|</code></p>
    <p><code>L2_rel(%) = 100 sqrt(sum_i w_i (yhat_i-y_i)^2) / sqrt(sum_i w_i y_i^2)</code></p>
    <p><code>R2 = 1 - sum_i (y_i-yhat_i)^2 / sum_i (y_i-mean(y))^2</code></p>
  </section>

  <section class="dataset-section">
    <h2>Diagnostic profiles</h2>
    <p>
      The station IDs are <code>span_10</code>, <code>span_50</code>, and <code>span_90</code>. At each station,
      submissions provide pressure ratio <code>p/P</code> against normalized chord, plus normalized temperature and
      density profiles. Rotor37 does not define a submitted velocity-profile diagnostic, so the leaderboard does not
      invent one.
    </p>
    <p>The current reference and prediction curves are illustrative dummy data for interface testing.</p>
  </section>

  <section class="dataset-section">
    <h2>Related links</h2>
    <ul>
      <li><a href="https://huggingface.co/datasets/PLAID-datasets/Rotor37">PLAID Rotor37 dataset</a></li>
      <li><a href="https://zenodo.org/records/14840190">Rotor37 archive on Zenodo</a></li>
      <li><a href="https://arxiv.org/abs/2505.02974">PLAID benchmark paper</a></li>
      <li><a href="https://arxiv.org/abs/2305.12871">MMGP Rotor37 study</a></li>
      <li><a href="https://github.com/neilashton/fluidsbench-submission">FluidsBench submission repository</a></li>
    </ul>
  </section>
</div>

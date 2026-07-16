---
layout: page
permalink: /datasets/vki-ls59/
title: VKI-LS59 dataset
page_title: VKI-LS59 dataset
page_description: Dataset overview and leaderboard submission format for VKI-LS59.
nav: false
hide_header_background: true
compact_masthead: true
---

<div class="dataset-page">
  <section class="dataset-section">
    <h2>Overview</h2>
    <p>
      VKI-LS59 contains 839 two-dimensional CFD simulations of the LS59 turbine cascade across inlet incidence and
      outlet Mach number. FluidsBench follows the PLAID release: 671 cases form the published training pool and 168
      cases form the fixed hidden test set.
    </p>
    <p>
      The model inputs are <code>angle_in</code>, <code>mach_out</code>, geometry, and signed-distance information.
      Stored outputs are density (<code>ro</code>), momentum (<code>rou</code> and <code>rov</code>), energy
      (<code>roe</code>), turbulent kinematic viscosity (<code>nut</code>), Mach number (<code>mach</code>), and
      blade-surface isentropic Mach number (<code>M_iso</code>). Scalar targets are the source dataset's unexpanded
      <code>Q</code> quantity, power, pressure ratio (<code>Pr</code>), temperature ratio (<code>Tr</code>), isentropic
      efficiency (<code>eth_is</code>), and outlet angle (<code>angle_out</code>).
    </p>
  </section>

  <section class="dataset-section">
    <h2>Official splits</h2>
    <p>
      Set the submission <code>split</code> to the exact ID below. Reduced VKI-LS59 training sets use the first
      <em>N</em> entries of the published training index sequence; every split uses the same 168-case test set.
    </p>
    <div class="dataset-table-wrap">
      <table class="dataset-table">
        <thead><tr><th>Split ID</th><th>Train</th><th>Test</th></tr></thead>
        <tbody>
          <tr><td><code>train</code></td><td>671</td><td>168</td></tr>
          <tr><td><code>train_500</code></td><td>500</td><td>168</td></tr>
          <tr><td><code>train_250</code></td><td>250</td><td>168</td></tr>
          <tr><td><code>train_125</code></td><td>125</td><td>168</td></tr>
          <tr><td><code>train_64</code></td><td>64</td><td>168</td></tr>
          <tr><td><code>train_32</code></td><td>32</td><td>168</td></tr>
          <tr><td><code>train_16</code></td><td>16</td><td>168</td></tr>
          <tr><td><code>train_8</code></td><td>8</td><td>168</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="dataset-section">
    <h2>Leaderboard submission package</h2>
    <p>
      Submit one JSON file per model and split under <code>submissions/vki-ls59/</code> in the
      <a href="https://github.com/neilashton/fluidsbench-submission">FluidsBench submission repository</a>. Metric values
      must come from the approved VKI-LS59 evaluator; do not calculate or edit leaderboard scores by hand.
    </p>

    <h3>Required JSON structure</h3>
    <pre><code>{

"submission_id": "unique-lab-model-vki-split-id",
"model": "Published model name",
"model_type": "Neural operator",
"model_types": ["Neural operator", "Transformer"],
"training_regime": "from_scratch",
"target_data_used": "official_train",
"external_pretraining": false,
"pretraining_data": [],
"dataset": "VKI-LS59",
"split": "train_500",
"parameter_count": 7.5,
"submitter_name": "Person, laboratory, or company",
"institution": "Institution name",
"paper_url": "https://...",
"code_url": "https://...",
"submitted_at": "YYYY-MM-DD",
"metric_values": { ... },
"diagnostics": {
"surface_profiles": [ ... ],
"flow_profiles": [ ... ]
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
      The <code>metric_values</code> object must contain <code>total_error</code> and all four metrics listed below for
      every enabled output. Relative L1 and L2 values are percentages; RRMSE and R<sup>2</sup> are dimensionless.
      <code>total_error</code> must equal the arithmetic mean of the eight RRMSE values.
    </p>
    <div class="dataset-table-wrap">
      <table class="dataset-table compact">
        <thead><tr><th>Outputs</th><th>Metric ID pattern</th><th>Required suffixes</th></tr></thead>
        <tbody>
          <tr>
            <td>Mach number and turbulent kinematic viscosity</td>
            <td><code>vki_mach_*</code>, <code>vki_nut_*</code></td>
            <td><code>rrmse</code>, <code>rel_l2</code>, <code>rel_l1</code>, <code>r2</code></td>
          </tr>
          <tr>
            <td>Q, power, pressure ratio, temperature ratio, isentropic efficiency, and outlet angle</td>
            <td><code>vki_q_*</code>, <code>vki_power_*</code>, <code>vki_pr_*</code>, <code>vki_tr_*</code>, <code>vki_eth_is_*</code>, <code>vki_angle_out_*</code></td>
            <td><code>rrmse</code>, <code>rel_l2</code>, <code>rel_l1</code>, <code>r2</code></td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3>Profile arrays</h3>
    <p>Each series requires a non-empty <code>case_id</code>, the exact station ID, a quantity ID, and numeric points.</p>
    <div class="dataset-table-wrap">
      <table class="dataset-table compact">
        <thead><tr><th>Array</th><th>Required station</th><th>Quantity</th><th>Point fields</th></tr></thead>
        <tbody>
          <tr><td><code>surface_profiles</code></td><td><code>pressure_side</code></td><td><code>m_iso</code></td><td><code>x_over_c</code>, <code>m_iso</code></td></tr>
          <tr><td><code>surface_profiles</code></td><td><code>suction_side</code></td><td><code>m_iso</code></td><td><code>x_over_c</code>, <code>m_iso</code></td></tr>
          <tr><td><code>flow_profiles</code></td><td><code>outlet_plane_2</code></td><td><code>velocity_ratio</code></td><td><code>pitch_fraction</code>, <code>velocity_ratio</code></td></tr>
        </tbody>
      </table>
    </div>
    <pre><code>{

"case_id": "evaluator-case-id",
"station_id": "pressure_side",
"quantity_id": "m_iso",
"values": [
{"x_over_c": 0.0, "m_iso": 0.62},
{"x_over_c": 1.0, "m_iso": 1.14}
]
}</code></pre>

    <h3>Validation and review evidence</h3>
    <p>Run the repository validator before opening the pull request:</p>
    <pre><code>python3 scripts/manage_leaderboard.py validate submissions/vki-ls59/&lt;submission-file&gt;.json</code></pre>
    <p>The pull request must include:</p>
    <ul>
      <li>the evaluator version or commit and the exact command used;</li>
      <li>the official split ID and confirmation that the published index sequence was used;</li>
      <li>the model checkpoint or reproducible code revision used to generate predictions;</li>
      <li>the evaluator output or log reproducing every submitted metric; and</li>
      <li>confirmation that the profile arrays came from the same evaluated prediction set.</li>
    </ul>
    <p>
      Use
      <a href="https://github.com/neilashton/fluidsbench-submission/blob/dev/submissions/vki-ls59/dummy-vki-ls59-train.json">the complete prototype submission</a>
      as a structural example. It contains illustrative values only. Generated files under <code>leaderboard/</code> are
      rebuilt by maintainers after approval.
    </p>

  </section>

  <section class="dataset-section">
    <h2>Leaderboard metrics</h2>
    <p>
      The primary ranking is <code>total_error</code>, the arithmetic mean of the official PLAID RRMSE values for
      <code>mach</code>, <code>nut</code>, and the six scalar outputs. Lower is better. FluidsBench also displays
      relative L1, relative L2, and R<sup>2</sup> for each ranked output.
    </p>
    <p><code>RRMSE_field = sqrt((1/n) sum_i [((1/N_i) ||fhat_i - f_i||_2^2) / ||f_i||_inf^2])</code></p>
    <p><code>RRMSE_scalar = sqrt((1/n) sum_i [|shat_i - s_i|^2 / |s_i|^2])</code></p>
    <p><code>total_error = (1/m) sum_j RRMSE_j</code></p>
    <p><code>L1_rel(%) = 100 sum_i w_i |yhat_i-y_i| / sum_i w_i |y_i|</code></p>
    <p><code>L2_rel(%) = 100 sqrt(sum_i w_i (yhat_i-y_i)^2) / sqrt(sum_i w_i y_i^2)</code></p>
    <p><code>R2 = 1 - sum_i (y_i-yhat_i)^2 / sum_i (y_i-mean(y))^2</code></p>
    <p>
      Dimensional MAE/RMSE columns are intentionally not enabled until FluidsBench fixes a canonical public
      denormalization and unit convention for every VKI-LS59 output.
    </p>
  </section>

  <section class="dataset-section">
    <h2>Profile comparisons</h2>
    <p>Approved submissions provide the following station IDs and quantities:</p>
    <ul>
      <li><code>pressure_side</code> and <code>suction_side</code>: <code>M_iso</code> against normalized chord.</li>
      <li><code>outlet_plane_2</code>: normalized downstream velocity against pitch fraction.</li>
    </ul>
    <p>
      The current curves are clearly labelled prototype data for interface testing. The outlet trace is associated with
      the published LS59 downstream plane at <code>x/c = 2.842</code>; it is not presented as an experimental trace.
    </p>
  </section>

  <section class="dataset-section">
    <h2>Related links</h2>
    <ul>
      <li><a href="https://huggingface.co/datasets/PLAID-datasets/VKI-LS59">PLAID VKI-LS59 dataset</a></li>
      <li><a href="https://zenodo.org/records/14840512">VKI-LS59 archive on Zenodo</a></li>
      <li><a href="https://arxiv.org/abs/2505.02974">PLAID benchmark paper</a></li>
      <li><a href="https://github.com/neilashton/fluidsbench-submission">FluidsBench submission repository</a></li>
    </ul>
  </section>
</div>

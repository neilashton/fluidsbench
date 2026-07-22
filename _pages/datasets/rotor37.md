---
layout: page
permalink: /datasets/rotor37/
title: Rotor37 dataset
page_title: Rotor37 dataset
page_description: Dataset overview and leaderboard submission format for Rotor37.
nav: false
hide_header_background: true
compact_masthead: true
---

<div class="dataset-page">
  <section class="dataset-section">
    <h2>Overview</h2>
    <p>
      Rotor37 contains 1,200 three-dimensional CFD simulations derived from NASA Rotor 37 compressor configurations.
      FluidsBench follows the current PLAID release: 1,000 cases form the training pool and 200 cases form the published
      evaluation set. Under the FluidsBench open-reproducibility policy, the scored case list and ground truth are public.
    </p>
    <p>
      Inputs are blade geometry, surface normals, rotational speed <code>Omega</code>, and pressure condition
      <code>P</code>. The current canonical outputs are <code>Density</code>, <code>Pressure</code>, and
      <code>Temperature</code> fields plus <code>Massflow</code>, <code>Compression_ratio</code>, and
      <code>Efficiency</code> scalars. The obsolete polytropic-efficiency target from earlier work is not used.
    </p>
  </section>

  <section class="dataset-section">
    <h2>Planned benchmark splits</h2>
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
    {% include dataset_submission.html heading=2 slug="rotor37" dataset="Rotor37" %}
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
    <h2>Profile comparisons</h2>
    <p>
      The station IDs are <code>span_10</code>, <code>span_50</code>, and <code>span_90</code>. At each station,
      submissions provide pressure ratio <code>p/P</code> against normalized chord, plus normalized temperature and
      density profiles. Rotor37 does not define a submitted velocity-profile comparison, so the leaderboard does not
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

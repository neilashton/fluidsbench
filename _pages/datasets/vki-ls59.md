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
      cases form the published evaluation set. Under the FluidsBench open-reproducibility policy, the scored case list
      and ground truth are public.
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
    <h2>Planned benchmark splits</h2>
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
    {% include dataset_submission.html heading=2 slug="vki-ls59" dataset="VKI-LS59" %}
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
    <p>The planned submitter-provided profile format uses the following station IDs and quantities:</p>
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

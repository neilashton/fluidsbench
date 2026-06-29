---
layout: page
permalink: /leaderboards/carbench/
title: CarBench
description: Neural-surrogate leaderboard for DrivAerNet++ surface-pressure prediction (CarBench).
nav: false
---

<div class="leaderboard-page">
  <div class="leaderboard-backend-row">
    <p id="carbench-status">Loading CarBench results from the leaderboard backend…</p>
    <a class="leaderboard-submit-button" href="https://decode.mit.edu/carbench/" target="_blank" rel="noopener">CarBench @ MIT DECODE</a>
  </div>

  <p>
    <strong>CarBench</strong> benchmarks neural surrogates for <strong>surface-pressure</strong> prediction on the
    <strong>DrivAerNet++</strong> dataset. These entries are imported from the
    <a href="https://decode.mit.edu/carbench/" target="_blank" rel="noopener">CarBench leaderboard</a>
    and served from the shared FluidsBench backend. Click a metric header to re-rank.
  </p>

  <section class="leaderboard-table-wrap" aria-label="CarBench leaderboard table">
    <table class="leaderboard-table" id="carbench-table">
      <thead></thead>
      <tbody></tbody>
    </table>
  </section>
</div>

<script>
  // Metric registry (_data/metrics.yml) drives the CarBench columns, units, and sort directions.
  window.FB_METRICS = {{ site.data.metrics.metrics | jsonify }};
</script>
<script defer src="{{ '/assets/js/carbench.js' | relative_url | bust_file_cache }}"></script>

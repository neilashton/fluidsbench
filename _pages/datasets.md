---
layout: page
permalink: /datasets/
title: datasets
description:
nav: true
nav_order: 6
---

<div class="datasets-page">
  <p class="datasets-intro">
    Dataset pages collect the source dataset links, benchmark split notes, and the exact prediction format expected by
    FluidsBench leaderboards.
  </p>

  <section class="dataset-list" aria-label="Available datasets">
    <article class="dataset-card">
      <div>
        <p class="dataset-kicker">Automotive external aerodynamics</p>
        <h3>AhmedML</h3>
        <p>
          High-fidelity CFD data for 500 geometric variants of the Ahmed car body. The FluidsBench page defines the
          leaderboard submission format for field errors, force R<sup>2</sup>, centreline Cp cuts, and velocity profiles.
        </p>
      </div>
      <a href="{{ '/datasets/ahmedml/' | relative_url }}">View dataset spec</a>
    </article>
  </section>
</div>

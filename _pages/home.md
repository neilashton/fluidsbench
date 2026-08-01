---
layout: home
title: about
permalink: /about/
nav: true
nav_order: 2
page_title: "About FluidsBench"
page_subtitle: A public benchmark for comparing AI surrogate models across computational fluid-dynamics datasets
hide_header_background: true
compact_masthead: true
---

<div class="about-page">
  <section class="about-intro" aria-labelledby="about-overview">
    <h2 id="about-overview">A shared benchmark for AI in fluid dynamics</h2>
    <p class="about-lead">
      FluidsBench brings public datasets, dataset-specific scoring rules, a consistent submission format, and versioned leaderboard releases together in one place. The aim is to make results easier to compare, inspect, and cite.
    </p>
    <p>
      Each dataset defines its evaluation cases, scoring locations, fields, and metrics. Submitters run their own models, calculate the required metrics and profile predictions, and provide the result package. FluidsBench validates the package and publishes approved submitted values, tables, and plots alongside the public ground truth. It does not run submitted models or recalculate the submitted field and force metrics.
    </p>
    <div class="about-actions" aria-label="Explore FluidsBench">
      <a class="about-action about-action--primary" href="{{ '/' | relative_url }}">View the leaderboard</a>
      <a class="about-action" href="{{ '/datasets/' | relative_url }}">Explore the datasets</a>
    </div>
  </section>

  <section class="about-benefits" aria-labelledby="about-benefits-title">
    <h2 id="about-benefits-title">What FluidsBench provides</h2>
    <div class="about-benefit-grid">
      <article class="about-benefit-card">
        <h3>Defined evaluation</h3>
        <p>Public evaluation cases, scoring locations, ground truth, fields, and metric definitions for every supported dataset.</p>
      </article>
      <article class="about-benefit-card">
        <h3>Clear comparisons</h3>
        <p>Results compared within the same dataset, split, and release, with the scoring basis stated alongside each leaderboard view.</p>
      </article>
      <article class="about-benefit-card">
        <h3>Durable evidence</h3>
        <p>Versioned result records and exports that preserve the release, metric, rank, and metadata behind an academic claim.</p>
      </article>
    </div>
  </section>

  <aside class="about-status" aria-labelledby="about-status-title">
    <h2 id="about-status-title">Current status</h2>
    <p>
      The leaderboard is currently a prototype and submissions are closed. All displayed rows and profile curves are illustrative dummy data, not official results, and should not be cited or promoted as leaderboard claims.
    </p>
  </aside>

  <section class="about-people" aria-labelledby="about-people-title">
    <h2 id="about-people-title">People</h2>
    <p class="about-section-intro">
      FluidsBench is developed by an organising committee spanning academia and industry, with guidance from its scientific and industrial advisory board.
    </p>

    {% include people_grid.liquid
      people=site.data.people.organisers
      id="organisers"
      heading="Organising committee"
    %}

    {% include people_grid.liquid
      people=site.data.people.advisory_board
      id="advisory-board"
      heading="Scientific and industrial advisory board"
    %}

  </section>

  <section class="about-contact" aria-labelledby="about-contact-title">
    <h2 id="about-contact-title">Contact</h2>
    <p>
      For questions about the benchmark, datasets, or submissions, email
      <a href="mailto:admin@fluidsbench.org">admin@fluidsbench.org</a>.
    </p>
  </section>
</div>

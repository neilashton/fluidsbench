---
layout: home
title: home
permalink: /
page_title: "About FluidsBench"
page_subtitle: A public benchmark designed for comparable, citable evaluation of AI surrogate models in fluid dynamics
description: Learn how FluidsBench evaluates CFD surrogate models and meet the academic and industry team behind the benchmark.
show_navbar_brand: true
---

<div class="about-page">
  <section class="about-intro" aria-label="About the benchmark">
    <p class="about-lead">
      FluidsBench is designed to make official results from AI surrogate models easier to compare, inspect, and cite. It brings public fluid-dynamics datasets, dataset-specific evaluation rules, and versioned leaderboard releases into one benchmark.
    </p>
    <p>
      Results in this field are often reported using different meshes, splits, fields, and metrics. FluidsBench retains the scientific requirements of each dataset while providing one consistent process for submitting and publishing results. Each published result remains tied to its dataset, split, and release so that a paper or public claim can be checked later.
    </p>
    <div class="about-links" aria-label="Upcoming FluidsBench sections">
      <span class="about-link-disabled">View the leaderboard <span>(coming soon)</span></span>
      <span class="about-link-disabled">Explore the datasets <span>(coming soon)</span></span>
    </div>
  </section>

  <section class="about-process" aria-labelledby="about-process-title">
    <p class="about-eyebrow">Benchmark process</p>
    <h2 id="about-process-title">How it works</h2>
    <div class="about-process-grid">
      <article class="about-process-step">
        <span class="about-process-number" aria-hidden="true">01</span>
        <h3>Define the evaluation</h3>
        <p>Dataset teams define the public test cases, native scoring locations, required fields, and metrics.</p>
      </article>
      <article class="about-process-step">
        <span class="about-process-number" aria-hidden="true">02</span>
        <h3>Evaluate and package</h3>
        <p>Model authors run their own models and provide every reported metric and required profile prediction.</p>
      </article>
      <article class="about-process-step">
        <span class="about-process-number" aria-hidden="true">03</span>
        <h3>Validate and publish</h3>
        <p>FluidsBench checks each package for the required structure and internal consistency, then turns approved submitter-provided values into leaderboard tables and plots against public ground truth.</p>
      </article>
    </div>
    <p class="about-process-note">
      FluidsBench does not run submitted models or recalculate reported metrics from prediction fields. Links to public code, model, and environment artifacts are optional and are displayed when supplied.
    </p>
  </section>

  <aside class="about-status" role="note" aria-label="Current benchmark status">
    <span class="about-status-label">Current phase</span>
    <p>
      <strong>Prototype:</strong> submissions are currently closed. All displayed results are illustrative dummy data, not official results, and must not be cited or promoted.
    </p>
  </aside>

{% include people_grid.liquid people=site.data.people.organisers id="organisers" heading="Organising committee" variant="organisers" %}

{% include people_grid.liquid people=site.data.people.advisory_board id="advisory-board" heading="Scientific and industrial advisory board" variant="advisory" %}

  <section class="about-contact" aria-labelledby="about-contact-title">
    <h2 id="about-contact-title">Questions?</h2>
    <p>
      For questions about the benchmark, datasets, or submissions, email <a href="mailto:admin@fluidsbench.org">admin@fluidsbench.org</a>.
    </p>
  </section>
</div>

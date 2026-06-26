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
    <article class="dataset-card">
      <div>
        <p class="dataset-kicker">Automotive external aerodynamics</p>
        <h3>DrivAerML</h3>
        <p>
          High-fidelity CFD data for 500 parametrically morphed DrivAer notchback variants. The FluidsBench page defines
          the leaderboard submission format for dimensional field errors, integrated force R<sup>2</sup>, centreline Cp
          cuts, and wake velocity profiles.
        </p>
      </div>
      <a href="{{ '/datasets/drivaerml/' | relative_url }}">View dataset spec</a>
    </article>
    <article class="dataset-card">
      <div>
        <p class="dataset-kicker">Automotive external aerodynamics</p>
        <h3>DrivAerNet++</h3>
        <p>
          Large-scale high-fidelity automotive CFD data used by CarBench, covering over 8,000 car simulations across
          multiple body categories. The FluidsBench page defines the pressure-field leaderboard format and notes the
          additional fields needed for future force, volume, Cp-cut, and velocity-profile scoring.
        </p>
      </div>
      <a href="{{ '/datasets/drivaernetplusplus/' | relative_url }}">View dataset spec</a>
    </article>
    <article class="dataset-card">
      <div>
        <p class="dataset-kicker">Automotive external aerodynamics</p>
        <h3>WindsorML</h3>
        <p>
          High-fidelity WMLES data for 355 geometric variants of the Windsor body. The FluidsBench page defines the
          leaderboard submission format for dimensional field errors, integrated force R<sup>2</sup>, centreline Cp cuts,
          and wake velocity profiles.
        </p>
      </div>
      <a href="{{ '/datasets/windsorml/' | relative_url }}">View dataset spec</a>
    </article>
    <article class="dataset-card">
      <div>
        <p class="dataset-kicker">Aerospace high-lift aerodynamics</p>
        <h3>HiLiftAeroML</h3>
        <p>
          High-fidelity WMLES data for 180 NASA CRM-HL geometry variants across 10 angles of attack. The FluidsBench page
          defines the leaderboard submission format for dimensional field errors, integrated force R<sup>2</sup>, wing
          section Cp cuts, and near-wall velocity profiles.
        </p>
      </div>
      <a href="{{ '/datasets/hiliftaeroml/' | relative_url }}">View dataset spec</a>
    </article>
    <article class="dataset-card">
      <div>
        <p class="dataset-kicker">Airfoil RANS aerodynamics</p>
        <h3>AirfRANS</h3>
        <p>
          High-fidelity 2D RANS simulations over NACA 4- and 5-digit airfoils. The FluidsBench page defines the
          submission format for field errors, force coefficients, surface Cp profiles, and boundary-layer velocity
          profiles across the AirfRANS benchmark regimes.
        </p>
      </div>
      <a href="{{ '/datasets/airfrans/' | relative_url }}">View dataset spec</a>
    </article>
  </section>
</div>

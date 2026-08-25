---
layout: page
permalink: /datasets/hiliftaeroml/
title: HiLiftAeroML dataset
page_title: HiLiftAeroML dataset
page_description: Dataset overview and leaderboard submission format for HiLiftAeroML.
description:
nav: false
hide_header_background: true
compact_masthead: true
---

<div class="dataset-page">
  {% include dataset_intro.html slug="hiliftaeroml" %}

  <section class="dataset-panel">
    <h3>Dataset summary</h3>
    <dl class="dataset-facts">
      <div>
        <dt>Geometry</dt>
        <dd>NASA CRM-HL high-lift aircraft with parameterized slat and flap deflections and gaps.</dd>
      </div>
      <div>
        <dt>Cases</dt>
        <dd>1,800 simulations: 180 geometry variants across 10 angles of attack from 4 degrees to 22 degrees.</dd>
      </div>
      <div>
        <dt>Solver</dt>
        <dd>Fidelity Charles explicit unstructured finite-volume solver with Fidelity Stitch Voronoi meshing.</dd>
      </div>
      <div>
        <dt>Fidelity</dt>
        <dd>Wall-Modeled Large-Eddy Simulation (WMLES) with solution-adapted grids.</dd>
      </div>
      <div>
        <dt>Flow conditions</dt>
        <dd>Mach 0.2 and chord-based Reynolds number 1.6 x 10<sup>6</sup>.</dd>
      </div>
      <div>
        <dt>Mesh scale</dt>
        <dd>Solution-adapted grids between roughly 300M and 500M control volumes; exported volume meshes are octree-based.</dd>
      </div>
      <div>
        <dt>License</dt>
        <dd>CC BY 4.0, as stated by the dataset source.</dd>
      </div>
    </dl>
  </section>

  <section class="dataset-panel dataset-getting-started">
    {% include dataset_getting_started.html slug="hiliftaeroml" %}
  </section>

  {% include dataset_design_space.html slug="hiliftaeroml" %}

  <section class="dataset-panel">
    <h3>Published source splits</h3>
    <p>
      The Hugging Face source publishes these fourteen deterministic split families over all 1,800 cases. The table gives the exact manifest IDs and
      counts. The corresponding FluidsBench case files are still marked <code>prototype_generated</code>, so they remain development bindings until
      the exact scored arrays, masks, weights, evaluator, and case lists are finalized.
    </p>

    <div class="dataset-table-wrap">
      <table class="dataset-table compact">
        <thead>
          <tr>
            <th>Split</th>
            <th>Manifest ID</th>
            <th>Type</th>
            <th>Purpose</th>
            <th>Train</th>
            <th>Validation</th>
            <th>Test</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>Full</code></td>
            <td><code>full</code></td>
            <td>In-dist</td>
            <td>Random case-level baseline split.</td>
            <td>1260</td>
            <td>180</td>
            <td>360</td>
          </tr>
          <tr>
            <td><code>Medium</code></td>
            <td><code>medium</code></td>
            <td>In-dist</td>
            <td>Intermediate data-efficiency split between Full and Scarce.</td>
            <td>510</td>
            <td>180</td>
            <td>360</td>
          </tr>
          <tr>
            <td><code>Scarce</code></td>
            <td><code>scarce</code></td>
            <td>In-dist</td>
            <td>Data-efficiency split using one sixth of the Full training data.</td>
            <td>210</td>
            <td>180</td>
            <td>360</td>
          </tr>
          <tr>
            <td><code>Super scarce</code></td>
            <td><code>super_scarce</code></td>
            <td>In-dist</td>
            <td>Extreme data-efficiency split using one thirty-sixth of the Full training data.</td>
            <td>35</td>
            <td>180</td>
            <td>360</td>
          </tr>
          <tr>
            <td><code>Geometry</code></td>
            <td><code>geometry</code></td>
            <td>In-dist</td>
            <td>Generalization to unseen geometries, with all 10 AoAs per selected geometry.</td>
            <td>1260</td>
            <td>180</td>
            <td>360</td>
          </tr>
          <tr>
            <td><code>Geometry medium</code></td>
            <td><code>geometry_medium</code></td>
            <td>In-dist</td>
            <td>Unseen-geometry generalization from 51 training geometries.</td>
            <td>510</td>
            <td>180</td>
            <td>360</td>
          </tr>
          <tr>
            <td><code>Geometry scarce</code></td>
            <td><code>geometry_scarce</code></td>
            <td>In-dist</td>
            <td>Unseen-geometry generalization from 21 training geometries.</td>
            <td>210</td>
            <td>180</td>
            <td>360</td>
          </tr>
          <tr>
            <td><code>Geometry super scarce</code></td>
            <td><code>geometry_super_scarce</code></td>
            <td>In-dist</td>
            <td>Unseen-geometry generalization from 4 training geometries.</td>
            <td>40</td>
            <td>180</td>
            <td>360</td>
          </tr>
          <tr>
            <td><code>AoA 4</code></td>
            <td><code>single_aoa_4</code></td>
            <td>In-dist</td>
            <td>Single-AoA geometry generalization at 4 degrees, representative of pre-stall flow.</td>
            <td>126</td>
            <td>18</td>
            <td>36</td>
          </tr>
          <tr>
            <td><code>AoA 12</code></td>
            <td><code>single_aoa_12</code></td>
            <td>In-dist</td>
            <td>Single-AoA geometry generalization at 12 degrees, representative of mid-range flow.</td>
            <td>126</td>
            <td>18</td>
            <td>36</td>
          </tr>
          <tr>
            <td><code>AoA 22</code></td>
            <td><code>single_aoa_22</code></td>
            <td>In-dist</td>
            <td>Single-AoA geometry generalization at 22 degrees, representative of post-stall flow.</td>
            <td>126</td>
            <td>18</td>
            <td>36</td>
          </tr>
          <tr>
            <td><code>AoA extrapolation</code></td>
            <td><code>aoa</code></td>
            <td>OOD</td>
            <td>Train and validate on AoA &lt;= 12 degrees, then test on AoA &gt;= 14 degrees.</td>
            <td>788</td>
            <td>112</td>
            <td>900</td>
          </tr>
          <tr>
            <td><code>Deflection</code></td>
            <td><code>deflection</code></td>
            <td>OOD</td>
            <td>Geometry extrapolation from low mean deflection to high deflection settings.</td>
            <td>1260</td>
            <td>180</td>
            <td>360</td>
          </tr>
          <tr>
            <td><code>Stall</code></td>
            <td><code>stall</code></td>
            <td>OOD</td>
            <td>Flow-regime extrapolation from pre-stall training cases to post-stall test cases.</td>
            <td>942</td>
            <td>135</td>
            <td>723</td>
          </tr>
        </tbody>
      </table>
    </div>

  </section>

  <section class="dataset-panel">
    {% include dataset_submission.html slug="hiliftaeroml" dataset="HiLiftAeroML" %}

  </section>

  <section class="dataset-panel">
    {% include dataset_scoring_contract.html slug="hiliftaeroml" dataset="HiLiftAeroML" %}
  </section>

  <section class="dataset-panel">
    <h3>Cp stations</h3>
    <p>
      Submit all ten CRM-HL wing pressure rows A through J defined by the official HLPW-5 postprocessing instructions.
      Figure 15 of the <a href="https://arxiv.org/abs/2605.19565">HiLiftAeroML paper</a> plots A, D, G, and I as a
      validation subset; those four examples are not the complete workshop station set. Rows run progressively from
      inboard to outboard. Use the exact ID below and provide full-scale <code>x</code> coordinates in inches.
    </p>
    <div class="dataset-table-wrap">
      <table class="dataset-table compact">
        <thead>
          <tr><th>Station ID</th><th>Row</th><th>Wing dog-leg x (in)</th><th>Case 2 elements</th></tr>
        </thead>
        <tbody>
          <tr><td><code>pressure_belt_a</code></td><td>A</td><td>1126.61</td><td>Slat, main wing, flap</td></tr>
          <tr><td><code>pressure_belt_b</code></td><td>B</td><td>1199.86</td><td>Slat, main wing, flap</td></tr>
          <tr><td><code>pressure_belt_c</code></td><td>C</td><td>1266.16</td><td>Main wing, flap; no Case 2 slat cut</td></tr>
          <tr><td><code>pressure_belt_d</code></td><td>D</td><td>1332.41</td><td>Slat, main wing, flap</td></tr>
          <tr><td><code>pressure_belt_e</code></td><td>E</td><td>1402.17</td><td>Slat, main wing, flap</td></tr>
          <tr><td><code>pressure_belt_f</code></td><td>F</td><td>1478.90</td><td>Slat, main wing, flap</td></tr>
          <tr><td><code>pressure_belt_g</code></td><td>G</td><td>1555.64</td><td>Slat, main wing, flap</td></tr>
          <tr><td><code>pressure_belt_h</code></td><td>H</td><td>1621.91</td><td>Slat and main wing; no flap row</td></tr>
          <tr><td><code>pressure_belt_i</code></td><td>I</td><td>1709.11</td><td>Slat and main wing; no flap row</td></tr>
          <tr><td><code>pressure_belt_j</code></td><td>J</td><td>1778.87</td><td>Slat and main wing; no flap row</td></tr>
        </tbody>
      </table>
    </div>
    <p>
      The exact HLPW-5 cutting-plane equations and element-specific extraction macros are available in the
      <a href="https://aiaa-hlpw.org/HLPW/index-workshop5.html">workshop archive</a>. The leaderboard curves are currently
      illustrative dummy data, but their station coverage and coordinate convention match the workshop format.
    </p>
  </section>

  <section class="dataset-panel">
    <h3>Velocity stations</h3>
    <p>
      Use all 16 locations from the official HLPW-5 Case 2.4 velocity-profile template. Each trace is extracted vertically
      at fixed full-scale <code>x,y</code> coordinates, with <code>z_offset_in = z - z_surface</code>. Coordinates are in
      inches and station IDs must match the values below. The prototype leaderboard values are dummy data; the locations
      and coordinate convention are taken from the
      <a href="https://aiaa-hlpw.org/HLPW/index-workshop5.html">HLPW-5 workshop archive</a>.
    </p>
    <div class="dataset-table-wrap">
      <table class="dataset-table compact">
        <thead>
          <tr><th>Station ID</th><th>HLPW-5 label</th><th>x (in)</th><th>y (in)</th><th>z surface (in)</th></tr>
        </thead>
        <tbody>
          <tr><td><code>hlpw5_a_1</code></td><td>A.1</td><td>1034.9500</td><td>137.9135</td><td>191.7500</td></tr>
          <tr><td><code>hlpw5_a_2</code></td><td>A.2</td><td>1071.2212</td><td>160.9808</td><td>195.4808</td></tr>
          <tr><td><code>hlpw5_a_3</code></td><td>A.3</td><td>1365.5096</td><td>227.1058</td><td>183.1173</td></tr>
          <tr><td><code>hlpw5_a_4</code></td><td>A.4</td><td>1385.4231</td><td>128.3423</td><td>156.9615</td></tr>
          <tr><td><code>hlpw5_a_5</code></td><td>A.5</td><td>1421.5757</td><td>129.1298</td><td>148.0621</td></tr>
          <tr><td><code>hlpw5_a_6</code></td><td>A.6</td><td>1444.4584</td><td>225.9062</td><td>167.1960</td></tr>
          <tr><td><code>hlpw5_b_1</code></td><td>B.1</td><td>1163.5769</td><td>379.9615</td><td>190.8654</td></tr>
          <tr><td><code>hlpw5_b_2</code></td><td>B.2</td><td>1203.7442</td><td>374.8077</td><td>208.4231</td></tr>
          <tr><td><code>hlpw5_b_3</code></td><td>B.3</td><td>1398.1731</td><td>360.8769</td><td>205.5577</td></tr>
          <tr><td><code>hlpw5_b_4</code></td><td>B.4</td><td>1493.6878</td><td>361.0165</td><td>173.5348</td></tr>
          <tr><td><code>hlpw5_c_1</code></td><td>C.1</td><td>1699.5212</td><td>964.3962</td><td>258.4827</td></tr>
          <tr><td><code>hlpw5_c_2</code></td><td>C.2</td><td>1730.9519</td><td>956.0558</td><td>258.5019</td></tr>
          <tr><td><code>hlpw5_c_3</code></td><td>C.3</td><td>1762.3500</td><td>949.1462</td><td>255.5058</td></tr>
          <tr><td><code>hlpw5_d_1</code></td><td>D.1</td><td>1799.3942</td><td>1152.4692</td><td>268.0192</td></tr>
          <tr><td><code>hlpw5_d_2</code></td><td>D.2</td><td>1821.0673</td><td>1152.2827</td><td>270.1462</td></tr>
          <tr><td><code>hlpw5_d_3</code></td><td>D.3</td><td>1842.7404</td><td>1152.2058</td><td>271.0212</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="dataset-panel">
    <h3>Metric definitions</h3>
    <dl class="metric-definition-list">
      <div>
        <dt>Relative L2 error</dt>
        <dd>
          For each evaluation/test geometry, map predictions to every entity in the release-bound public field support and return predictions and
          targets to dimensional physical space, \(q^\ast = T_q^{-1}(q)\). Calculate both paired relative-L2 values from the accumulated
          sufficient statistics: area-weighted L2 is primary on the boundary, while unweighted point L2 (each point counts equally) is primary in the flow volume.
          Report the complete-case percentages first, then take the arithmetic mean of the geometry-level values.
        </dd>
      </div>
      <div>
        <dt>Relative L1 error</dt>
        <dd>
          When reported as a supplementary metric, relative L1 uses the same complete dimensional support and the primary weighting for that domain.
          Calculate a percentage for each geometry, then take the arithmetic mean of the geometry-level percentages.
        </dd>
      </div>
      <div>
        <dt>Dimensional evaluation</dt>
        <dd>
          Relative L1 and L2 metrics are not computed on normalized, standardized, or non-dimensional training targets. If
          a model predicts normalized values, the submission/evaluator must undo that transform before scoring. For
          HiLiftAeroML this means pressure, wall shear, and velocity are evaluated in the dataset-native physical units;
          C<sub>d</sub>, C<sub>l</sub>, and Cp-cut comparisons remain coefficient-based by definition.
        </dd>
      </div>
      <div>
        <dt>Surface pressure relative L1/L2</dt>
        <dd>
          Relative L1 and L2 error for dimensional surface pressure <code>p_surface_pred</code> against the evaluator
          surface pressure values. Cp is used only for the Cp-cut comparisons and plots.
        </dd>
      </div>
      <div>
        <dt>Surface wall-shear relative L1/L2</dt>
        <dd>
          Relative L1 and L2 error for the wall-shear vector \(\tau_w = (\tau_{w,x}, \tau_{w,y}, \tau_{w,z})\) on the
          CRM-HL aircraft surface.
        </dd>
      </div>
      <div>
        <dt>Volume velocity relative L1/L2</dt>
        <dd>
          Relative L1 and L2 error for the velocity vector \(u = (u_x, u_y, u_z)\) on every field-bearing
          <code>PointData</code> location in the released volume VTU.
        </dd>
      </div>
      <div>
        <dt>Volume pressure relative L1/L2</dt>
        <dd>Relative L1 and L2 error for pressure on every field-bearing point in the same public volume VTU.</dd>
      </div>
      <div>
        <dt>Coefficient of determination</dt>
        <dd>
          For scalar values \(y_i\), \(R^2 = 1 - \sum_i(\hat{y}_i - y_i)^2 / \sum_i(y_i - \bar{y})^2\). Higher is
          better; 1.0 is perfect.
        </dd>
      </div>
      <div>
        <dt>C<sub>d</sub> and C<sub>l</sub> R<sup>2</sup></dt>
        <dd>
          R<sup>2</sup> computed over all evaluated cases using predicted drag coefficient <code>cd_pred</code> and lift
          coefficient <code>cl_pred</code>. HiLiftAeroML also reports pitching-moment R<sup>2</sup> in the paper; the
          current leaderboard stores C<sub>d</sub> and C<sub>l</sub> for consistency with the automotive tables.
        </dd>
      </div>
      <div>
        <dt>Force R<sup>2</sup></dt>
        <dd>Mean of C<sub>d</sub> R<sup>2</sup> and C<sub>l</sub> R<sup>2</sup>.</dd>
      </div>
      <div>
        <dt>Cp cut R<sup>2</sup></dt>
        <dd>
          One global R<sup>2</sup> over all selected wing-section surface pressure coefficient samples from the held-out
          test cases. The evaluator flattens <code>cp_pred</code> and ground-truth <code>cp</code> across
          <code>case_id</code>, <code>cut_id</code>, <code>station_id</code>, and section sample locations before computing
          R<sup>2</sup>. The plotted pressure belt is chosen with the leaderboard station selector.
        </dd>
      </div>
      <div>
        <dt>Cp cut comparisons</dt>
        <dd>
          Per-case and per-cut R<sup>2</sup> values can be reported as profile comparisons, but the leaderboard ranking should use
          the global held-out score so that cases with low Cp variance do not dominate through unstable per-case
          averages.
        </dd>
      </div>
      <div>
        <dt>Velocity profile R<sup>2</sup></dt>
        <dd>
          R<sup>2</sup> over the HLPW-5 A.1-D.3 profile samples. The leaderboard score is computed on
          <code>u_over_u_inf_pred</code>, flattened across evaluated cases, all 16 stations, and vertical sample locations.
        </dd>
      </div>
    </dl>
  </section>

  <section class="dataset-panel">
    <h3>Default overall score</h3>
    <p>
      The leaderboard can be ranked by any individual metric. Its default ranking is a bounded 0-100 weighted score:
    </p>
    <p>
      Relative L1 fields are reported as sortable supplementary metrics, but they are not included in this default score unless a
      future benchmark rule assigns them weights.
    </p>
    <pre><code>S_error(q) = 100 * max(0, 1 - E_q / cap_q)
S_R2(q)    = 100 * min(1, max(0, R2_q))
S_overall  = sum(weight_q * S_q)</code></pre>
    <div class="dataset-table-wrap">
      <table class="dataset-table compact">
        <thead>
          <tr>
            <th>Component</th>
            <th>Weight</th>
            <th>Cap or transform</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Dimensional surface pressure, area-weighted relative L2</td>
            <td>15%</td>
            <td>15% cap</td>
          </tr>
          <tr>
            <td>Dimensional surface wall shear, area-weighted relative L2</td>
            <td>10%</td>
            <td>20% cap</td>
          </tr>
          <tr>
            <td>Dimensional volume velocity, unweighted point relative L2</td>
            <td>15%</td>
            <td>12% cap</td>
          </tr>
          <tr>
            <td>Dimensional volume pressure, unweighted point relative L2</td>
            <td>10%</td>
            <td>15% cap</td>
          </tr>
          <tr>
            <td>C<sub>d</sub> R<sup>2</sup></td>
            <td>15%</td>
            <td>Clamped to [0, 1]</td>
          </tr>
          <tr>
            <td>C<sub>l</sub> R<sup>2</sup></td>
            <td>10%</td>
            <td>Clamped to [0, 1]</td>
          </tr>
          <tr>
            <td>Velocity profile R<sup>2</sup></td>
            <td>15%</td>
            <td>Clamped to [0, 1]</td>
          </tr>
          <tr>
            <td>Cp cut R<sup>2</sup></td>
            <td>10%</td>
            <td>Clamped to [0, 1]</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="dataset-panel">
    <h3>Links</h3>
    <ul>
      <li><a href="https://caemldatasets.org/hiliftaeroml/">HiLiftAeroML dataset page</a></li>
      <li><a href="https://arxiv.org/abs/2605.19565">HiLiftAeroML paper</a></li>
      <li><a href="https://huggingface.co/datasets/nvidia/HiLiftAeroML">HiLiftAeroML Hugging Face dataset</a></li>
      <li><a href="https://huggingface.co/datasets/nvidia/HiLiftAeroML/blob/main/splits/README.md">HiLiftAeroML split README</a></li>
      <li><a href="https://aiaa-hlpw.org/HLPW/index-workshop5.html">HLPW-5 workshop archive and submission templates</a></li>
      <li><a href="https://ntrs.nasa.gov/citations/20240014255">NASA HLPW-5 workshop summary</a></li>
      <li><a href="{{ '/' | relative_url }}">CFD leaderboard prototype</a></li>
    </ul>
  </section>
</div>

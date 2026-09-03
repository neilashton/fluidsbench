# Profile ground truth

This directory is generated from dataset-owned reference profiles and is publicly served by the FluidsBench website. FluidsBench
uses an open reproducibility track: scored ground truth and case lists are public and are kept separate from participant
submissions. Evaluation cases remain a declared test partition and must not be used for model fitting, hyperparameter selection, or
preprocessing statistics.

The top-level review release and legacy analytical fixtures remain explicitly marked `prototype_dummy_data`; they are not native CFD
truth and must not be presented as such. DrivAerML is the exception within this review release: its separately declared,
checksum-bound `native_cfd` bundle contains dataset-owner-produced native values and is never sourced from the analytical fixture
generator. Publishing that reference bundle does not make a leaderboard result official. An official result still requires a
validated submission package and maintainer approval; none of the current rows is official or approved. Public code, model,
environment, and artifact-documentation links are optional and do not affect rank, academic-citation eligibility, or promotion
eligibility. Submitted metrics and profile predictions are provided by the submitter. FluidsBench does not execute submitted code or
models or recompute base metrics.

A prototype case set may declare `coverage: representative_subset` so the review site can inspect a small number of genuine,
checksum-verified dataset profiles without copying the complete evaluation partition into this repository. Every representative
case must be a member of the corresponding official split. This mode is rejected for official releases, which require complete
ordered case coverage.

`manifest.json` maps leaderboard splits to shared evaluation case sets. Each case set has an index and JSON chunks containing compact
`case_id`, `panel_id`, `station_id`, `quantity_id`, `coordinate`, and `value` arrays. The frontend fetches only the chunk needed for
the selected evaluation geometry. The scalar leaderboard release pins the profile-ground-truth release ID and manifest SHA-256; that
manifest in turn pins every case-set index, and each index pins its chunks. The browser verifies this complete chain before plotting
or exporting profile data. Official ground-truth releases must also name an immutable source commit.

DrivAerML native CFD truth uses the separate versioned master/thin-index
contract. One all-484 master index binds the pinned public dataset revision,
the non-analytical `native_cfd` declaration, every shared chunk, and all eight
official split indexes. The split indexes contain only ordered case references
to those shared chunks, so the website does not duplicate native truth bytes.
Every materialized curve binds its support, placement receipt, ordered sample
and native-cell lineage, coordinates, values, unsupported samples, and segment
boundaries with canonical SHA-256 identities. Shared Cp aliases contain no
arrays and resolve only to their exact canonical constant support.

Native schema 3.0 keeps each Cp curve's cumulative surface arc length as its
unchanged support, compatibility, and scoring coordinate. It also binds an
aligned display-only `streamwise_x_m` array, derived in source order from the
midpoint x of the exact retained plane-intersection segment. The dashboard
defaults to **Physical streamwise x coordinate, m** for comparison with
AutoCFD and published plots, while **Surface arc length (scoring coordinate),
m** remains selectable and is included with physical x in tooltips and data
exports. Predictions continue to submit only the approved arc coordinate; the
browser uses reference physical x only after the existing support and arc-byte
compatibility checks pass. Neither view sorts, interpolates, resamples, or
joins across a retained segment break.

The DrivAerML velocity and Cp panels keep fixed locations and
geometry-relative locations in separate selectors. Geometry-relative profiles
are labelled **diagnostic, not scored**, while verified reference curves are
labelled **Native CFD ground truth** rather than generic ground truth. Publishing or displaying those native
profiles does not activate relative scoring, change metric weights, or open
submissions. A missing digest, identity mismatch, reordered coordinate, or
unresolved alias makes the affected comparison explicitly unavailable; the
browser never falls back to a similarly named station or another placement
family. Retained segment boundaries are also rendered and exported without
bridging unsupported samples.

The AirfRANS review fixtures are generated with `bin/generate_airfrans_ground_truth.py` from the hash-bound reference extraction and
an additional official angle-of-attack case produced by the pinned extractor in `fluidsbench-submission`. The publisher verifies the
profile-definition and extractor hashes, exact dependency versions, split membership, VTK-valid sample counts, perfect-copy result,
and all eight 1,001-point series before updating the AirfRANS chunks, indexes, and release manifest.

From the website repository, regenerate the additional extraction and publish the review fixtures with:

```bash
uv run --no-project \
  --with-requirements ../fluidsbench-submission/examples/airfrans-profile-extraction/requirements.txt \
  python ../fluidsbench-submission/examples/airfrans-profile-extraction/extract.py \
  --dataset-root /path/to/AirfRANS/Dataset \
  --case-name airFoil2D_SST_88.307_-4.328_3.461_7.533_0.0_15.226 \
  --output /tmp/airfrans-aoa-extraction.json

python3 bin/generate_airfrans_ground_truth.py \
  --submission-root ../fluidsbench-submission \
  --standard-extraction ../fluidsbench-submission/examples/airfrans-profile-extraction/example_extraction.json \
  --aoa-extraction /tmp/airfrans-aoa-extraction.json \
  --release-id prototype-profile-ground-truth-YYYY-MM-DD \
  --generated-at YYYY-MM-DDTHH:MM:SSZ
```

The former DrivAerML analytical curves are teaching fixtures, not native CFD
truth. They are no longer a production input and cannot overwrite the
browser-consumable native bundle. If those historical fixtures are needed for
development, regenerate them only into the isolated analytical-prototype area:

```bash
python3 bin/generate_drivaerml_ground_truth.py \
  --submission-root ../fluidsbench-submission
```

Never copy that output into `profile-ground-truth/datasets/drivaerml` or label
it as native truth.

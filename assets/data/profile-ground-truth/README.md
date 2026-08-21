# Profile ground truth

This directory is generated from dataset-owned reference profiles and is publicly served by the FluidsBench website. FluidsBench
uses an open reproducibility track: scored ground truth and case lists are public and are kept separate from participant
submissions. Evaluation cases remain a declared test partition and must not be used for model fitting, hyperparameter selection, or
preprocessing statistics.

The current files are explicitly marked `prototype_dummy_data` and must be replaced with dataset-owner-approved values before
submissions open. An official result requires a validated submission package and maintainer approval; none of the current rows is
official or approved. Public code, model, environment, and artifact-documentation links are optional and do not affect rank,
academic-citation eligibility, or promotion eligibility. Submitted metrics and profile predictions are provided by the submitter.
FluidsBench does not execute submitted code or models or recompute base metrics.

A prototype case set may declare `coverage: representative_subset` so the review site can inspect a small number of genuine,
checksum-verified dataset profiles without copying the complete evaluation partition into this repository. Every representative
case must be a member of the corresponding official split. This mode is rejected for official releases, which require complete
ordered case coverage.

`manifest.json` maps leaderboard splits to shared evaluation case sets. Each case set has an index and JSON chunks containing compact
`case_id`, `panel_id`, `station_id`, `quantity_id`, `coordinate`, and `value` arrays. The frontend fetches only the chunk needed for
the selected evaluation geometry. The scalar leaderboard release pins the profile-ground-truth release ID and manifest SHA-256; that
manifest in turn pins every case-set index, and each index pins its chunks. The browser verifies this complete chain before plotting
or exporting profile data. Official ground-truth releases must also name an immutable source commit.

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

The DrivAerML prototype bundle uses the official case IDs, all four continuous
Cp-cut series, and all sixteen AutoCFD5 velocity lines on the exact candidate
10 mm grids. Its CFD-like reference values are analytical teaching data, not
native DrivAerML truth; this is explicit because immutable native Cp-cut
support remains an activation gate. Regenerate the website bundle from the
matching submission-contract checkout with:

```bash
python3 bin/generate_drivaerml_ground_truth.py \
  --submission-root ../fluidsbench-submission
```

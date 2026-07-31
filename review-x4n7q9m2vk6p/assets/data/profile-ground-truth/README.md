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

`manifest.json` maps leaderboard splits to shared evaluation case sets. Each case set has an index and JSON chunks containing compact
`case_id`, `panel_id`, `station_id`, `quantity_id`, `coordinate`, and `value` arrays. The frontend fetches only the chunk needed for
the selected evaluation geometry. The scalar leaderboard release pins the profile-ground-truth release ID and manifest SHA-256; that
manifest in turn pins every case-set index, and each index pins its chunks. The browser verifies this complete chain before plotting
or exporting profile data. Official ground-truth releases must also name an immutable source commit.

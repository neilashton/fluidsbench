# Diagnostic ground truth

This directory is the website-owned source for the reference curves shown in the leaderboard Cp and velocity-profile
charts. Prediction curves remain in approved submission files in `fluidsbench-submission`; ground-truth values must not be
copied into that repository.

`manifest.json` maps each dataset name to one JSON file under `datasets/`. Each dataset file contains:

- `diagnostics.cp_cuts`: one reference curve for every Cp `station_id` declared by the approved-submission manifest.
- `diagnostics.velocity_profiles`: one reference curve for each leaderboard velocity station.
- `status`: `prototype_dummy_data` until the arrays are replaced by evaluator-owned benchmark values.

Every curve uses `values` objects with a numeric `x` coordinate and either `cp` or `u_over_u_inf`. Keep station IDs stable:
the frontend validates coverage before displaying a reference curve.

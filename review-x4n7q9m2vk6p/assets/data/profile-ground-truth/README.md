# Profile ground truth

This directory is generated from dataset-owned reference profiles and is served by the FluidsBench website. Ground truth is kept
separate from participant submissions. The current files are explicitly marked `prototype_dummy_data` and must be replaced with
dataset-owner-approved values before the leaderboard accepts real submissions.

`manifest.json` maps leaderboard splits to shared test case sets. Each case set has an index and JSON chunks containing compact
`case_id`, `panel_id`, `station_id`, `quantity_id`, `coordinate`, and `value` arrays. The frontend fetches only the chunk needed for
the selected test geometry.


# FluidsBench

Assess physics AI surrogate models across realistic fluid dynamics datasets.

- [Website](https://fluidsbench.org/)
- [Development review site](https://fluidsbench.org/review-x4n7q9m2vk6p/) — work in progress
- **[Submit results: specifications, evaluators, and instructions](https://github.com/neilashton/fluidsbench-submission)**

## Current status

**Production submissions remain closed. AirfRANS dev intake is open for Full, Scarce and AoA extrapolation.**
Follow the [AirfRANS participant quickstart](https://github.com/neilashton/fluidsbench-submission/blob/dev/benchmark-specs/airfrans/QUICKSTART.md)
and submit PRs against `dev`. Reynolds remains closed. Full (200 cases) and AoA (196 cases) have completed participant
workflow trials using existing Transolver++ predictions, including interruption/resume and packaging. The AoA package
has also completed separate maintainer approval and publication on the development review site, with the older
prototype-contract entry retained in history. This does not open production intake.

Prototype and candidate rows remain labelled separately. The 23
HiLiftAeroML previews (11 Transolver, 12 GeoTransolver) retain real surrogate inference and CFD profile truth across represented
Table 5 splits, but remain unapproved owner-review candidates.

AhmedML, WindsorML, DrivAerML and DrivAerNet++ accept development-candidate PRs against `dev` using their
[participant quickstarts](https://github.com/neilashton/fluidsbench-submission/blob/dev/SUBMITTING.md).
Separate maintainer registration controls their unranked, non-citable dev display. HiLiftAeroML intake remains closed;
BlendedNet, Rotor37 and VKI-LS59 remain coming soon.

## Evaluation and results

Evaluation partitions, case lists, ground truth, scoring locations, and metric definitions are public. Submitters run their
models, map predictions to official support, and calculate metrics and profiles using the published definitions. FluidsBench
validates the result package and publishes approved submitted values; it does not execute models or recompute base metrics
from full prediction fields.

Public code, models, environments, documentation, and predictions are optional. When supplied, their links, revisions, digests,
licences, and check status accompany the result. Their absence does not affect accuracy ranking, citation, or promotion eligibility.

Only the latest published version in a result series is ranked. Earlier versions can appear as unranked historical rows;
result details link the immutable v1/v2/v3 history with dates and change summaries. Current scalar feeds and claims remain
latest-only; the submission repository publishes the complete hash-bound history in `leaderboard/revisions.json`.

## Contributing to the website

This repository contains the website, leaderboard interface, public profile-truth data, release tooling, and copies of shared
data-contract schemas. The [submission repository](https://github.com/neilashton/fluidsbench-submission) owns benchmark
specifications, scoring-support releases, submission schemas, validators, and result packages. Shared contract changes need
coordinated PRs in both repositories.

See [CONTRIBUTING.md](CONTRIBUTING.md) for Docker/native setup, validation commands, preview builds, and the protected-branch workflow.

<a id="evaluation-approach"></a>
<a id="repository-responsibilities"></a>
<a id="result-versions"></a>
<a id="local-development"></a>
<a id="docker"></a>
<a id="native-jekyll"></a>
<a id="validation"></a>

The former setup and validation sections are now in the [contributor guide](CONTRIBUTING.md#local-development).

## Theme and licence

Built with [Jekyll](https://jekyllrb.com/) and the [al-folio](https://github.com/alshedivat/al-folio) theme foundation.
The retained theme and website code use the [MIT License](LICENSE).

## Contact

[admin@fluidsbench.org](mailto:admin@fluidsbench.org)

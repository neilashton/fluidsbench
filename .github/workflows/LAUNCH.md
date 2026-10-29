# Launch and review deployment

The existing `neilashton` repositories are being prepared for review before the
ownership move. Do not create or populate the new FluidsBench repositories or
publish the production site until Neil approves the reviewed version.

## Current review

The site uses `phase: collecting`. AirfRANS Full, Scarce and AoA, AhmedML,
WindsorML, DrivAerML and DrivAerNet++ are open for submissions. AirfRANS Reynolds
is closed. HiLiftAeroML, BlendedNet, Rotor37 and VKI-LS59 are coming soon.

The submission cutoff and first leaderboard release are planned for **5 December
2026, 23:59:59 Anywhere on Earth (UTC−12)**, equivalent to **6 December 2026,
11:59:59 UTC**. The clock is informational; expiry never publishes results.

Pushing website `dev` deploys only the unlisted review prefix:
<https://fluidsbench.org/review-x4n7q9m2vk6p/>. This preview is publicly accessible
but has noindex metadata and no incoming production navigation links.
The production website is unchanged by this workflow.

The optional committee page at
<https://fluidsbench.org/review-x4n7q9m2vk6p/committee-leaderboard/>
shows the empty leaderboard. All trial submissions and their rows have been
removed from the reviewed source. The preview feed and availability snapshot
are pinned to the reviewed submission commit. They do not follow trial feeds.

Participant PRs still target the existing submission repository's `dev` branch
until the ownership move. They use normal contributor validation; no development
intake flag or separate preview registration is required. An unreleased feed
stays empty even if a package has been approved.

## Keep the website and submission source together

When the reviewed contract changes:

1. Run the submission tests, scoring-support validation and feed check.
2. Update `submission_source_ref` and `leaderboard_base_url` in `_config.yml` and
   `_config_preview.yml`, plus the intake checkout in `profile-contract.yml`.
3. Regenerate `_data/submission_status.json` with
   `python3 bin/prepare_submission_status.py --submission-root PATH`.
4. Sync public schemas, pressure-reference documentation, dataset contract
   digests and display-only profile-location bindings when their inputs change.
5. Run the website tests and build checks, then review the deployed preview.

The historical profile-truth checkout in CI verifies immutable CFD assets. It
is a test dependency, not a feed displayed by the review site.

## After the review and explicit approval

Create fresh repositories from the reviewed source trees as new initial commits;
do not transfer the old repositories or push their branches, tags or history.
Update owner URLs and PR targets, mirror any support releases while preserving
artifact bytes, and rerun download, validation, link and deployment checks.
The submission repository provides `scripts/export_launch_snapshot.py` for a
local history-free, submission-free export. That command makes no remote changes.

Publish the collection homepage only after the new ownership and hosting checks
pass. The current production website branch is `master`; the deployment workflow
also supports `main`. Select and verify the new repository's production branch
and Pages settings before deploying it.

## Leaderboard publication

| Phase | Homepage | Submission behaviour |
| --- | --- | --- |
| `announced` | Announcement and countdown | Preparation only |
| `collecting` | Announcement and countdown | Open datasets accept packages |
| `reviewing` | Announcement and countdown | First cohort under review; later entries remain possible |
| `live` | Leaderboard | A checked, immutable official release is required |

Review packages using contributor and maintainer checks. Record the eligible
PRs and exact participant commits at the cutoff. Formal approval does not publish
a package while the source manifest is `unreleased`.

Prepare a complete cohort on a release branch. Publish its immutable assets,
verify their bytes, and run **Publish immutable leaderboard release snapshot**
from the configured production branch with the exact artifact commit and release
ID. Then set `phase: live`, `release_id`, the pinned `submission_source_ref`,
immutable `leaderboard_base_url`, and `leaderboard_manifest_sha256` together.
The live build rejects a non-official release, mismatched ID or digest, or a
floating feed. Later corrections require a new release ID; preserve existing
release snapshots.

## Checks

```sh
ruby bin/check_launch_contract.rb
node --test tests/*.js
python3 -m unittest discover -s tests -p 'test_*.py'
python3 bin/prepare_submission_status.py --submission-root PATH --check
bundle exec jekyll build --config _config.yml,_config_preview.yml
python3 bin/check_native_profile_build.py _site
python3 bin/check_launch_build.py _site --phase collecting --committee-review
```

The deployment also removes discovery files, checks preview paths and noindex
metadata, purges unused CSS, and fingerprints the final stylesheet bytes.
Verify desktop/mobile, dates, submission links, coming-soon entries and the empty
leaderboard after both deployment workflows complete.

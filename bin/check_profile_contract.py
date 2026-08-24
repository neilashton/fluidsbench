#!/usr/bin/env python3
"""Check website ground truth against the fluidsbench-submission contract."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
GROUND_TRUTH_ROOT = ROOT / "assets" / "data" / "profile-ground-truth"
PUBLIC_TOP_LEVEL_SCHEMA_ROOT = ROOT / "schemas"
TOP_LEVEL_SCHEMA_NAMES = ("methodology-contract-v1.schema.json",)
PUBLIC_SCHEMA_ROOT = ROOT / "schemas" / "v2"
V2_SCHEMA_NAMES = (
    "submission.schema.json",
    "evaluation-evidence.schema.json",
    "maintainer-validation.schema.json",
)
PUBLIC_V3_SCHEMA_ROOT = ROOT / "schemas" / "v3"
V3_SCHEMA_NAMES = (
    "submission.schema.json",
    "evaluation-evidence.schema.json",
    "discretization.schema.json",
    "discretization-case.schema.json",
    "case-metrics.schema.json",
    "maintainer-validation.schema.json",
    "prediction-artifact.schema.json",
    "prediction-artifact-checks.schema.json",
)
PUBLIC_SCORING_SUPPORT_SCHEMA_ROOT = ROOT / "schemas" / "scoring-support" / "v1"
SCORING_SUPPORT_SCHEMA_NAMES = (
    "manifest.schema.json",
    "case-index.schema.json",
    "case-chunk.schema.json",
)
PUBLIC_RELEASE_SCHEMA_ROOT = ROOT / "schemas" / "releases"
RELEASE_SCHEMA_NAMES = (
    "claim-index.schema.json",
    "revision-history.schema.json",
    "result-claim.schema.json",
)
COMPLETE_COVERAGE = "complete_split"
REPRESENTATIVE_COVERAGE = "representative_subset"


def load_json(path: Path) -> Any:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def finite_numbers(values: Any) -> bool:
    return isinstance(values, list) and all(
        isinstance(value, (int, float))
        and not isinstance(value, bool)
        and math.isfinite(value)
        for value in values
    )


def case_coverage_errors(
    expected_case_ids: list[str],
    indexed_case_ids: list[str],
    coverage: str,
    release_status: str,
) -> list[str]:
    if len(indexed_case_ids) != len(set(indexed_case_ids)):
        return ["ground-truth case IDs contain duplicates"]
    if coverage == COMPLETE_COVERAGE:
        if indexed_case_ids != expected_case_ids:
            return ["ground-truth case IDs differ from the submission split"]
        return []
    if coverage != REPRESENTATIVE_COVERAGE:
        return [f"ground-truth coverage {coverage!r} is invalid"]

    errors: list[str] = []
    if release_status != "prototype_dummy_data":
        errors.append(
            "representative profile subsets are permitted only in prototype releases"
        )
    if not indexed_case_ids:
        errors.append("representative profile subset is empty")
    unexpected = sorted(set(indexed_case_ids) - set(expected_case_ids))
    if unexpected:
        errors.append(
            f"representative profile cases are absent from the official split: {unexpected}"
        )
    return errors


def check(submission_root: Path) -> list[str]:
    errors: list[str] = []
    for schema_name in TOP_LEVEL_SCHEMA_NAMES:
        source_schema = submission_root / "schemas" / schema_name
        public_schema = PUBLIC_TOP_LEVEL_SCHEMA_ROOT / schema_name
        if not source_schema.is_file():
            errors.append(f"submission repository is missing schemas/{schema_name}")
        elif not public_schema.is_file():
            errors.append(f"website is missing public schema schemas/{schema_name}")
        elif public_schema.read_bytes() != source_schema.read_bytes():
            errors.append(
                f"public schema schemas/{schema_name} differs from the submission contract"
            )

    for schema_name in V2_SCHEMA_NAMES:
        source_schema = submission_root / "schemas" / "v2" / schema_name
        public_schema = PUBLIC_SCHEMA_ROOT / schema_name
        if not source_schema.is_file():
            errors.append(f"submission repository is missing schemas/v2/{schema_name}")
        elif not public_schema.is_file():
            errors.append(f"website is missing public schema schemas/v2/{schema_name}")
        elif public_schema.read_bytes() != source_schema.read_bytes():
            errors.append(
                f"public schema schemas/v2/{schema_name} differs from the submission contract"
            )

    for schema_name in V3_SCHEMA_NAMES:
        source_schema = submission_root / "schemas" / "v3" / schema_name
        public_schema = PUBLIC_V3_SCHEMA_ROOT / schema_name
        if not source_schema.is_file():
            errors.append(f"submission repository is missing schemas/v3/{schema_name}")
        elif not public_schema.is_file():
            errors.append(f"website is missing public schema schemas/v3/{schema_name}")
        elif public_schema.read_bytes() != source_schema.read_bytes():
            errors.append(
                f"public schema schemas/v3/{schema_name} differs from the submission contract"
            )

    for schema_name in SCORING_SUPPORT_SCHEMA_NAMES:
        source_schema = (
            submission_root / "schemas" / "scoring-support" / "v1" / schema_name
        )
        public_schema = PUBLIC_SCORING_SUPPORT_SCHEMA_ROOT / schema_name
        if not source_schema.is_file():
            errors.append(
                f"submission repository is missing schemas/scoring-support/v1/{schema_name}"
            )
        elif not public_schema.is_file():
            errors.append(
                f"website is missing public schema schemas/scoring-support/v1/{schema_name}"
            )
        elif public_schema.read_bytes() != source_schema.read_bytes():
            errors.append(
                f"public schema schemas/scoring-support/v1/{schema_name} differs from the submission contract"
            )

    for schema_name in RELEASE_SCHEMA_NAMES:
        source_schema = submission_root / "schemas" / "releases" / schema_name
        public_schema = PUBLIC_RELEASE_SCHEMA_ROOT / schema_name
        if not source_schema.is_file():
            errors.append(
                f"submission repository is missing schemas/releases/{schema_name}"
            )
        elif not public_schema.is_file():
            errors.append(
                f"website is missing public schema schemas/releases/{schema_name}"
            )
        elif public_schema.read_bytes() != source_schema.read_bytes():
            errors.append(
                f"public schema schemas/releases/{schema_name} differs from the submission contract"
            )

    submission_manifest = load_json(submission_root / "leaderboard" / "manifest.json")
    ground_truth_manifest_path = GROUND_TRUTH_ROOT / "manifest.json"
    ground_truth_manifest = load_json(ground_truth_manifest_path)
    scalar_release = submission_manifest.get("data_release", {})
    expected_ground_truth = scalar_release.get("profile_ground_truth", {})
    ground_truth_release = ground_truth_manifest.get("data_release", {})
    if expected_ground_truth.get("release_id") != ground_truth_release.get("id"):
        errors.append("scalar and profile-ground-truth release IDs differ")
    if expected_ground_truth.get("manifest_sha256") != sha256_file(
        ground_truth_manifest_path
    ):
        errors.append(
            "scalar release does not pin the current profile-ground-truth manifest SHA-256"
        )
    if scalar_release.get("status") == "official":
        source_commit = ground_truth_release.get("source_commit", "")
        if ground_truth_release.get("status") != "official" or len(
            source_commit
        ) not in {40, 64}:
            errors.append(
                "official scalar data require official profile ground truth pinned to a full source commit"
            )
    ground_truth_datasets = {
        dataset["id"]: dataset for dataset in ground_truth_manifest.get("datasets", [])
    }
    expected_dataset_ids = {
        dataset["slug"] for dataset in submission_manifest["datasets"]
    }
    if set(ground_truth_datasets) != expected_dataset_ids:
        errors.append(
            f"ground-truth dataset IDs differ: expected={sorted(expected_dataset_ids)}, actual={sorted(ground_truth_datasets)}"
        )

    for dataset in submission_manifest["datasets"]:
        dataset_id = dataset["slug"]
        ground_truth_dataset = ground_truth_datasets.get(dataset_id)
        if not ground_truth_dataset:
            continue
        spec = load_json(
            submission_root / "benchmark-specs" / dataset_id / "submission-spec.json"
        )
        profile_definition: dict[str, Any] = {}
        expected_extractor_sha256 = ""
        if dataset_id == "airfrans":
            profile_binding = spec["profile_definition"]
            profile_definition = load_json(
                submission_root
                / "benchmark-specs"
                / dataset_id
                / profile_binding["file"]
            )
            reference_fixture = load_json(
                submission_root / profile_definition["reference_fixture"]["file"]
            )
            expected_extractor_sha256 = reference_fixture["provenance"][
                "extractor_sha256"
            ]
        spec_splits = {split["id"]: split for split in spec["splits"]}
        ground_truth_splits = {
            split["id"]: split for split in ground_truth_dataset.get("splits", [])
        }
        if set(spec_splits) != set(ground_truth_splits):
            errors.append(
                f"{dataset_id}: ground-truth split IDs differ from the submission specification"
            )
        case_sets = {
            case_set["id"]: case_set
            for case_set in ground_truth_dataset.get("case_sets", [])
        }
        expected_by_case_set: dict[str, list[str]] = {}
        split_ids_by_case_set: dict[str, list[str]] = {}
        for split_id, split in spec_splits.items():
            split_index = load_json(
                submission_root / "benchmark-specs" / dataset_id / split["index_file"]
            )
            case_set_id = split["case_set_id"]
            split_ids_by_case_set.setdefault(case_set_id, []).append(split_id)
            previous = expected_by_case_set.setdefault(
                case_set_id, split_index["case_ids"]
            )
            if previous != split_index["case_ids"]:
                errors.append(
                    f"{dataset_id}/{case_set_id}: submission splits disagree on shared case IDs"
                )
            ground_truth_split = ground_truth_splits.get(split_id, {})
            if ground_truth_split.get("case_set_id") != case_set_id:
                errors.append(
                    f"{dataset_id}/{split_id}: ground-truth case_set_id is stale"
                )

        panels = {panel["id"]: panel for panel in spec["profile_panels"]}
        expected_series = {
            (panel_id, station_id, quantity_id)
            for panel_id, panel in panels.items()
            for station_id in panel["station_ids"]
            for quantity_id in panel["quantity_ids"]
        }
        for case_set_id, expected_case_ids in expected_by_case_set.items():
            case_set = case_sets.get(case_set_id)
            if not case_set:
                errors.append(
                    f"{dataset_id}: missing ground-truth case set {case_set_id}"
                )
                continue
            index_path = GROUND_TRUTH_ROOT / case_set["index_file"]
            if not index_path.is_file():
                errors.append(
                    f"{dataset_id}/{case_set_id}: missing {case_set['index_file']}"
                )
                continue
            if case_set.get("index_sha256") != sha256_file(index_path):
                errors.append(
                    f"{dataset_id}/{case_set_id}: release manifest index_sha256 mismatch"
                )
            index = load_json(index_path)
            indexed_case_ids = [
                case_id
                for chunk in index.get("chunks", [])
                for case_id in chunk.get("case_ids", [])
            ]
            coverage = case_set.get("coverage", COMPLETE_COVERAGE)
            for coverage_error in case_coverage_errors(
                expected_case_ids,
                indexed_case_ids,
                coverage,
                ground_truth_release.get("status", ""),
            ):
                errors.append(f"{dataset_id}/{case_set_id}: {coverage_error}")
            if case_set.get("case_count") != len(indexed_case_ids):
                errors.append(
                    f"{dataset_id}/{case_set_id}: release manifest case_count is stale"
                )
            if index.get("case_count") != len(indexed_case_ids):
                errors.append(
                    f"{dataset_id}/{case_set_id}: profile index case_count is stale"
                )
            if index.get("coverage", COMPLETE_COVERAGE) != coverage:
                errors.append(
                    f"{dataset_id}/{case_set_id}: profile index coverage differs from the release manifest"
                )
            for split_id in split_ids_by_case_set[case_set_id]:
                if ground_truth_splits.get(split_id, {}).get("case_count") != len(
                    indexed_case_ids
                ):
                    errors.append(
                        f"{dataset_id}/{split_id}: ground-truth split case_count is stale"
                    )
            loaded_case_ids: list[str] = []
            for chunk_entry in index.get("chunks", []):
                chunk_path = index_path.parent / chunk_entry["file"]
                if not chunk_path.is_file():
                    errors.append(
                        f"{dataset_id}/{case_set_id}: missing chunk {chunk_entry['file']}"
                    )
                    continue
                if sha256_file(chunk_path) != chunk_entry.get("sha256"):
                    errors.append(
                        f"{dataset_id}/{case_set_id}/{chunk_entry['file']}: sha256 mismatch"
                    )
                chunk = load_json(chunk_path)
                if coverage == REPRESENTATIVE_COVERAGE and dataset_id == "airfrans":
                    provenance = chunk.get("provenance", {})
                    if chunk.get("status") != "official_dataset_reference_fixture":
                        errors.append(
                            f"{dataset_id}/{case_set_id}/{chunk_entry['file']}: fixture status is invalid"
                        )
                    if provenance.get(
                        "profile_definition_id"
                    ) != profile_definition.get("profile_definition_id"):
                        errors.append(
                            f"{dataset_id}/{case_set_id}/{chunk_entry['file']}: profile definition ID is stale"
                        )
                    if provenance.get("profile_definition_sha256") != spec[
                        "profile_definition"
                    ].get("sha256"):
                        errors.append(
                            f"{dataset_id}/{case_set_id}/{chunk_entry['file']}: profile definition SHA-256 is stale"
                        )
                    if provenance.get("extractor_sha256") != expected_extractor_sha256:
                        errors.append(
                            f"{dataset_id}/{case_set_id}/{chunk_entry['file']}: extractor SHA-256 is stale"
                        )
                    if provenance.get("sampling", {}).get(
                        "normal_transform"
                    ) != profile_definition.get("extraction", {}).get(
                        "normal_transform"
                    ):
                        errors.append(
                            f"{dataset_id}/{case_set_id}/{chunk_entry['file']}: normal transform is stale"
                        )
                chunk_case_ids = [
                    case.get("case_id") for case in chunk.get("cases", [])
                ]
                if chunk_case_ids != chunk_entry.get("case_ids"):
                    errors.append(
                        f"{dataset_id}/{case_set_id}/{chunk_entry['file']}: index case order mismatch"
                    )
                loaded_case_ids.extend(chunk_case_ids)
                for case in chunk.get("cases", []):
                    provided = set()
                    for series in case.get("series", []):
                        key = (
                            series.get("panel_id"),
                            series.get("station_id"),
                            series.get("quantity_id"),
                        )
                        if key in provided:
                            errors.append(
                                f"{dataset_id}/{case['case_id']}: duplicate profile series {key}"
                            )
                        provided.add(key)
                        coordinate = series.get("coordinate")
                        value = series.get("value")
                        if (
                            not finite_numbers(coordinate)
                            or not finite_numbers(value)
                            or len(coordinate) != len(value)
                        ):
                            errors.append(
                                f"{dataset_id}/{case['case_id']}/{key}: invalid coordinate/value arrays"
                            )
                        elif len(coordinate) < 2 or any(
                            right <= left
                            for left, right in zip(coordinate, coordinate[1:])
                        ):
                            errors.append(
                                f"{dataset_id}/{case['case_id']}/{key}: coordinates are not strictly increasing"
                            )
                        panel = panels.get(series.get("panel_id"), {})
                        station_sample_counts = panel.get(
                            "station_sample_counts", {}
                        )
                        sample_count = (
                            station_sample_counts.get(series.get("station_id"))
                            if isinstance(station_sample_counts, dict)
                            else None
                        )
                        if sample_count is None:
                            sample_count = panel.get("sample_count")
                        if isinstance(sample_count, int) and (
                            not isinstance(coordinate, list)
                            or len(coordinate) != sample_count
                        ):
                            errors.append(
                                f"{dataset_id}/{case['case_id']}/{key}: expected {sample_count} profile samples"
                            )
                        station_intervals = panel.get(
                            "station_coordinate_intervals", {}
                        )
                        interval = (
                            station_intervals.get(series.get("station_id"))
                            if isinstance(station_intervals, dict)
                            else None
                        )
                        if interval is None:
                            interval = panel.get("coordinate_interval")
                        if (
                            isinstance(interval, list)
                            and len(interval) == 2
                            and finite_numbers(interval)
                            and isinstance(coordinate, list)
                            and len(coordinate) >= 2
                        ):
                            start, end = interval
                            if not math.isclose(
                                coordinate[0], start, rel_tol=0.0, abs_tol=1e-12
                            ) or not math.isclose(
                                coordinate[-1], end, rel_tol=0.0, abs_tol=1e-12
                            ):
                                errors.append(
                                    f"{dataset_id}/{case['case_id']}/{key}: coordinate interval differs from the contract"
                                )
                            station_spacings = panel.get(
                                "station_coordinate_spacings", {}
                            )
                            spacing = (
                                station_spacings.get(series.get("station_id"))
                                if isinstance(station_spacings, dict)
                                else None
                            )
                            if spacing is None:
                                spacing = panel.get("coordinate_spacing")
                            if spacing == "uniform":
                                denominator = len(coordinate) - 1
                                if any(
                                    not math.isclose(
                                        value,
                                        start
                                        + (end - start) * index / denominator,
                                        rel_tol=0.0,
                                        abs_tol=1e-12,
                                    )
                                    for index, value in enumerate(coordinate)
                                ):
                                    errors.append(
                                        f"{dataset_id}/{case['case_id']}/{key}: coordinates are not uniformly spaced over the contract interval"
                                    )
                    missing = expected_series - provided
                    if missing:
                        errors.append(
                            f"{dataset_id}/{case['case_id']}: missing ground-truth series {sorted(missing)}"
                        )
            if loaded_case_ids != indexed_case_ids:
                errors.append(
                    f"{dataset_id}/{case_set_id}: loaded chunk cases differ from the index"
                )
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--submission-root",
        type=Path,
        default=ROOT.parent / "fluidsbench-submission",
        help="path to a fluidsbench-submission checkout",
    )
    args = parser.parse_args()
    errors = check(args.submission_root.resolve())
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    manifest = load_json(GROUND_TRUTH_ROOT / "manifest.json")
    case_set_count = sum(
        len(dataset.get("case_sets", [])) for dataset in manifest["datasets"]
    )
    print(
        f"Validated {len(TOP_LEVEL_SCHEMA_NAMES)} public methodology schema, "
        f"{len(V2_SCHEMA_NAMES)} public v2 schemas, {len(V3_SCHEMA_NAMES)} public v3 schemas, "
        f"{len(SCORING_SUPPORT_SCHEMA_NAMES)} public scoring-support schemas, "
        f"{len(RELEASE_SCHEMA_NAMES)} public release schemas, and profile ground truth for "
        f"{len(manifest['datasets'])} datasets and {case_set_count} case sets."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

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


def load_json(path: Path) -> Any:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def finite_numbers(values: Any) -> bool:
    return isinstance(values, list) and all(
        isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)
        for value in values
    )


def check(submission_root: Path) -> list[str]:
    errors: list[str] = []
    submission_manifest = load_json(submission_root / "leaderboard" / "manifest.json")
    ground_truth_manifest_path = GROUND_TRUTH_ROOT / "manifest.json"
    ground_truth_manifest = load_json(ground_truth_manifest_path)
    scalar_release = submission_manifest.get("data_release", {})
    expected_ground_truth = scalar_release.get("profile_ground_truth", {})
    ground_truth_release = ground_truth_manifest.get("data_release", {})
    if expected_ground_truth.get("release_id") != ground_truth_release.get("id"):
        errors.append("scalar and profile-ground-truth release IDs differ")
    if expected_ground_truth.get("manifest_sha256") != sha256_file(ground_truth_manifest_path):
        errors.append("scalar release does not pin the current profile-ground-truth manifest SHA-256")
    if scalar_release.get("status") == "official":
        source_commit = ground_truth_release.get("source_commit", "")
        if ground_truth_release.get("status") != "official" or len(source_commit) not in {40, 64}:
            errors.append("official scalar data require official profile ground truth pinned to a full source commit")
    ground_truth_datasets = {dataset["id"]: dataset for dataset in ground_truth_manifest.get("datasets", [])}
    expected_dataset_ids = {dataset["slug"] for dataset in submission_manifest["datasets"]}
    if set(ground_truth_datasets) != expected_dataset_ids:
        errors.append(
            f"ground-truth dataset IDs differ: expected={sorted(expected_dataset_ids)}, actual={sorted(ground_truth_datasets)}"
        )

    for dataset in submission_manifest["datasets"]:
        dataset_id = dataset["slug"]
        ground_truth_dataset = ground_truth_datasets.get(dataset_id)
        if not ground_truth_dataset:
            continue
        spec = load_json(submission_root / "benchmark-specs" / dataset_id / "submission-spec.json")
        spec_splits = {split["id"]: split for split in spec["splits"]}
        ground_truth_splits = {split["id"]: split for split in ground_truth_dataset.get("splits", [])}
        if set(spec_splits) != set(ground_truth_splits):
            errors.append(f"{dataset_id}: ground-truth split IDs differ from the submission specification")
        case_sets = {case_set["id"]: case_set for case_set in ground_truth_dataset.get("case_sets", [])}
        expected_by_case_set: dict[str, list[str]] = {}
        for split_id, split in spec_splits.items():
            split_index = load_json(submission_root / "benchmark-specs" / dataset_id / split["index_file"])
            case_set_id = split["case_set_id"]
            previous = expected_by_case_set.setdefault(case_set_id, split_index["case_ids"])
            if previous != split_index["case_ids"]:
                errors.append(f"{dataset_id}/{case_set_id}: submission splits disagree on shared case IDs")
            ground_truth_split = ground_truth_splits.get(split_id, {})
            if ground_truth_split.get("case_set_id") != case_set_id:
                errors.append(f"{dataset_id}/{split_id}: ground-truth case_set_id is stale")

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
                errors.append(f"{dataset_id}: missing ground-truth case set {case_set_id}")
                continue
            index_path = GROUND_TRUTH_ROOT / case_set["index_file"]
            if not index_path.is_file():
                errors.append(f"{dataset_id}/{case_set_id}: missing {case_set['index_file']}")
                continue
            if case_set.get("index_sha256") != sha256_file(index_path):
                errors.append(f"{dataset_id}/{case_set_id}: release manifest index_sha256 mismatch")
            index = load_json(index_path)
            indexed_case_ids = [case_id for chunk in index.get("chunks", []) for case_id in chunk.get("case_ids", [])]
            if indexed_case_ids != expected_case_ids:
                errors.append(f"{dataset_id}/{case_set_id}: ground-truth case IDs differ from the submission split")
            loaded_case_ids: list[str] = []
            for chunk_entry in index.get("chunks", []):
                chunk_path = index_path.parent / chunk_entry["file"]
                if not chunk_path.is_file():
                    errors.append(f"{dataset_id}/{case_set_id}: missing chunk {chunk_entry['file']}")
                    continue
                if sha256_file(chunk_path) != chunk_entry.get("sha256"):
                    errors.append(f"{dataset_id}/{case_set_id}/{chunk_entry['file']}: sha256 mismatch")
                chunk = load_json(chunk_path)
                chunk_case_ids = [case.get("case_id") for case in chunk.get("cases", [])]
                if chunk_case_ids != chunk_entry.get("case_ids"):
                    errors.append(f"{dataset_id}/{case_set_id}/{chunk_entry['file']}: index case order mismatch")
                loaded_case_ids.extend(chunk_case_ids)
                for case in chunk.get("cases", []):
                    provided = set()
                    for series in case.get("series", []):
                        key = (series.get("panel_id"), series.get("station_id"), series.get("quantity_id"))
                        if key in provided:
                            errors.append(f"{dataset_id}/{case['case_id']}: duplicate profile series {key}")
                        provided.add(key)
                        coordinate = series.get("coordinate")
                        value = series.get("value")
                        if not finite_numbers(coordinate) or not finite_numbers(value) or len(coordinate) != len(value):
                            errors.append(f"{dataset_id}/{case['case_id']}/{key}: invalid coordinate/value arrays")
                        elif len(coordinate) < 2 or any(right <= left for left, right in zip(coordinate, coordinate[1:])):
                            errors.append(f"{dataset_id}/{case['case_id']}/{key}: coordinates are not strictly increasing")
                    missing = expected_series - provided
                    if missing:
                        errors.append(f"{dataset_id}/{case['case_id']}: missing ground-truth series {sorted(missing)}")
            if loaded_case_ids != indexed_case_ids:
                errors.append(f"{dataset_id}/{case_set_id}: loaded chunk cases differ from the index")
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
    case_set_count = sum(len(dataset.get("case_sets", [])) for dataset in manifest["datasets"])
    print(f"Validated profile ground truth for {len(manifest['datasets'])} datasets and {case_set_count} case sets.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

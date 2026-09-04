#!/usr/bin/env python3
"""Export plot-only HiLiftAeroML truth from evaluator-owned compact support.

The generated release preserves every compact support sample and every explicit
velocity gap, but deliberately omits evaluator weights, native mapping arrays,
and full-field/native-profile data.  It is a visualization release, not an
independent scoring source.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import sys
from pathlib import Path
from typing import Any

import numpy as np


RELEASE_ID = "hiliftaeroml-compact-profile-truth-full360-v1"
INDEX_SCHEMA = "fluidsbench-hiliftaeroml-compact-profile-truth-index-v1"
CHUNK_SCHEMA = "fluidsbench-hiliftaeroml-compact-profile-truth-chunk-v1"
PROVENANCE_SCHEMA = "fluidsbench-hiliftaeroml-compact-profile-truth-provenance-v1"
RECEIPT_SCHEMA = "fluidsbench-hiliftaeroml-compact-profile-truth-release-v1"
FORMAT = "fluidsbench-hiliftaeroml-compact-profile-truth-v1"
SCHEMA_VERSION = "1.0"
CASE_SET_ID = "caseset-ac791749e527"
CHUNK_SIZE = 10
CP_ROWS = tuple("ABCDEFGHIJ")
VELOCITY_STATIONS = ("B.2", "B.3", "C.1", "C.2", "C.3")
CASE_ARRAY_ORDER = (
    "cp_x_in",
    "cp_truth",
    "cp_branch_point_offsets",
    "cp_branch_row_code",
    "velocity_truth_speed_over_u_inf",
)
COMMON_ARRAY_ORDER = (
    "velocity_coordinate_in",
    "velocity_valid_mask",
    "velocity_station_row_offsets",
)


def sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def compact_json_bytes(value: Any) -> bytes:
    return (
        json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        + "\n"
    ).encode("utf-8")


def pretty_json_bytes(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def write_bytes(path: Path, payload: bytes) -> dict[str, Any]:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(payload)
    return {"sha256": sha256_bytes(payload), "byte_size": len(payload)}


def load_json(path: Path) -> Any:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def load_compact_module(path: Path) -> Any:
    spec = importlib.util.spec_from_file_location(
        "fluidsbench_hilift_compact_profiles", path
    )
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot import compact profile implementation: {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def relative_record(path: str, details: dict[str, Any]) -> dict[str, Any]:
    return {"file": path, **details}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--support-release", type=Path, required=True)
    parser.add_argument("--compact-module", type=Path, required=True)
    parser.add_argument("--output-root", type=Path, required=True)
    parser.add_argument("--source-repository", required=True)
    parser.add_argument("--source-revision", required=True)
    parser.add_argument("--generated-at", required=True)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    support_root = args.support_release.resolve()
    output_root = args.output_root.resolve()
    require(not output_root.exists(), f"refusing to overwrite output: {output_root}")
    require(
        args.generated_at.endswith("Z"),
        "--generated-at must be an explicit UTC timestamp ending in Z",
    )
    compact = load_compact_module(args.compact_module.resolve())

    source_manifest_path = support_root / "manifest.json"
    source_index_path = support_root / "index.json"
    source_manifest = load_json(source_manifest_path)
    source_index = load_json(source_index_path)
    source_manifest_sha = sha256_file(source_manifest_path)
    require(source_manifest["index"]["sha256"] == sha256_file(source_index_path), "source support index SHA-256 differs from its manifest")
    require(source_manifest["release_id"] == source_index["release_id"], "source support release IDs differ")
    require(source_index["case_count"] == 360, "source support must contain 360 cases")
    require(source_index["case_ids"] == source_index["case_sets"][0]["case_ids"], "source support case order differs from its sole case set")
    require(source_index["case_sets"][0]["case_set_id"] == CASE_SET_ID, "source support case-set identity differs")
    case_ids = list(source_index["case_ids"])
    require(len(case_ids) == len(set(case_ids)) == 360, "source case IDs must be unique")

    output_root.mkdir(parents=True)
    chunks_root = output_root / "chunks"
    artifacts_root = output_root / "artifacts"
    chunks_root.mkdir()
    artifacts_root.mkdir()

    common_arrays: dict[str, np.ndarray] | None = None
    common_source_sha: str | None = None
    case_documents: list[dict[str, Any]] = []
    total_cp_points = 0
    total_cp_branches = 0
    total_velocity_values = 0
    max_float32_cp_error = 0.0
    max_float32_velocity_error = 0.0

    for ordinal, case_id in enumerate(case_ids):
        source_case_ref = source_index["case_records"][case_id]
        source_case_path = support_root / source_case_ref["file"]
        require(sha256_file(source_case_path) == source_case_ref["sha256"], f"{case_id}: source case-record SHA-256 differs")
        require(source_case_path.stat().st_size == source_case_ref["byte_size"], f"{case_id}: source case-record size differs")
        source_case = load_json(source_case_path)
        support_ref = source_case["support"]
        support_path = support_root / support_ref["file"]
        require(sha256_file(support_path) == support_ref["sha256"], f"{case_id}: support artifact SHA-256 differs")
        require(support_path.stat().st_size == support_ref["byte_size"], f"{case_id}: support artifact size differs")
        support, loaded_support_sha = compact.load_compact_support_npz(support_path)
        require(loaded_support_sha == support_ref["sha256"], f"{case_id}: canonical support digest differs")
        expected_metadata = compact.compact_case_metadata(support)
        require(source_case["surface_cp"] == expected_metadata["surface_cp"], f"{case_id}: Cp metadata differs from live support")
        require(source_case["volume_velocity"] == expected_metadata["volume_velocity"], f"{case_id}: velocity metadata differs from live support")

        cp_x = support["cp_xyz_in"][:, 0].astype(np.float32)
        cp_truth = support["cp_truth"].astype(np.float32)
        cp_offsets = support["cp_branch_point_offsets"].astype(np.int32)
        cp_rows = np.array(support["cp_branch_row_code"], copy=True)
        valid = support["velocity_valid_mask"]
        velocity_truth = support["velocity_truth_speed_over_uinf"][valid].astype(np.float32)
        require(np.all(np.isfinite(cp_x)), f"{case_id}: plot Cp coordinates are non-finite")
        require(np.all(np.isfinite(cp_truth)), f"{case_id}: plot Cp truth is non-finite")
        require(np.all(np.isfinite(velocity_truth)) and np.all(velocity_truth >= 0.0), f"{case_id}: plot velocity truth is invalid")
        require(cp_offsets[-1] == len(cp_x), f"{case_id}: Cp offsets do not cover plot arrays")
        require(len(cp_rows) + 1 == len(cp_offsets), f"{case_id}: Cp row/offset counts differ")
        require(set(cp_rows.tolist()) == set(range(10)), f"{case_id}: Cp A-J row coverage is incomplete")

        velocity_xyz = support["velocity_requested_xyz_in"]
        velocity_offsets = support["velocity_station_row_offsets"].astype(np.int32)
        velocity_coordinate = np.empty(len(valid), dtype=np.float32)
        for start_raw, stop_raw in zip(velocity_offsets[:-1], velocity_offsets[1:], strict=True):
            start = int(start_raw)
            stop = int(stop_raw)
            velocity_coordinate[start:stop] = (velocity_xyz[start:stop, 2] - velocity_xyz[start, 2]).astype(np.float32)
        candidate_common = {
            "velocity_coordinate_in": velocity_coordinate,
            "velocity_valid_mask": np.array(valid, copy=True),
            "velocity_station_row_offsets": velocity_offsets,
        }
        candidate_common_sha = sha256_bytes(compact.deterministic_npz_bytes(candidate_common, order=COMMON_ARRAY_ORDER))
        if common_arrays is None:
            common_arrays = candidate_common
            common_source_sha = candidate_common_sha
        else:
            require(candidate_common_sha == common_source_sha, f"{case_id}: shared velocity plotting support differs")

        case_arrays = {
            "cp_x_in": cp_x,
            "cp_truth": cp_truth,
            "cp_branch_point_offsets": cp_offsets,
            "cp_branch_row_code": cp_rows,
            "velocity_truth_speed_over_u_inf": velocity_truth,
        }
        payload = compact.deterministic_npz_bytes(case_arrays, order=CASE_ARRAY_ORDER)
        artifact_rel = f"artifacts/{case_id}/plot-profile-truth.npz"
        artifact_details = write_bytes(output_root / artifact_rel, payload)

        cp_error = float(np.max(np.abs(support["cp_truth"] - cp_truth.astype(np.float64))))
        velocity_error = float(np.max(np.abs(support["velocity_truth_speed_over_uinf"][valid] - velocity_truth.astype(np.float64))))
        max_float32_cp_error = max(max_float32_cp_error, cp_error)
        max_float32_velocity_error = max(max_float32_velocity_error, velocity_error)
        total_cp_points += len(cp_truth)
        total_cp_branches += len(cp_rows)
        total_velocity_values += len(velocity_truth)

        case_documents.append(
            {
                "case_id": case_id,
                "case_ordinal": ordinal,
                "truth_source": {
                    "source_kind": "native_cfd",
                    "analytical_dummy": False,
                    "role": "plot_only_not_scoring_source",
                },
                "source_support": {
                    "release_id": source_manifest["release_id"],
                    "case_record_sha256": source_case_ref["sha256"],
                    "artifact_sha256": support_ref["sha256"],
                },
                "artifact": {
                    "format": "numpy-npz-v1",
                    **relative_record(artifact_rel, artifact_details),
                    "array_order": list(CASE_ARRAY_ORDER),
                    "content": "plot_only_truth",
                },
                "surface_cp": {
                    **source_case["surface_cp"],
                    "station_order": list(CP_ROWS),
                    "plot_coordinate_array": "cp_x_in",
                    "plot_coordinate_id": "streamwise_x_in",
                    "plot_coordinate_unit": "in",
                    "truth_array": "cp_truth",
                    "truth_dtype": "float32",
                    "truth_conversion": "round_to_nearest_ieee754_binary32_from_evaluator_binary64",
                },
                "volume_velocity": {
                    **source_case["volume_velocity"],
                    "plot_coordinate_array": "velocity_coordinate_in",
                    "plot_coordinate_id": "z_minus_surface_z_in",
                    "plot_coordinate_unit": "in",
                    "truth_array": "velocity_truth_speed_over_u_inf",
                    "truth_storage": "valid_rows_only_in_station_major_prediction_order",
                    "truth_dtype": "float32",
                    "truth_conversion": "round_to_nearest_ieee754_binary32_from_evaluator_binary64",
                },
            }
        )

    assert common_arrays is not None
    common_payload = compact.deterministic_npz_bytes(common_arrays, order=COMMON_ARRAY_ORDER)
    common_rel = "artifacts/common/velocity-plot-support.npz"
    common_details = write_bytes(output_root / common_rel, common_payload)

    chunk_refs: list[dict[str, Any]] = []
    for chunk_index, start in enumerate(range(0, len(case_documents), CHUNK_SIZE)):
        cases = case_documents[start : start + CHUNK_SIZE]
        chunk_id = f"chunk-{chunk_index:03d}"
        chunk = {
            "schema": CHUNK_SCHEMA,
            "schema_version": SCHEMA_VERSION,
            "format": FORMAT,
            "release_id": RELEASE_ID,
            "dataset_id": "hiliftaeroml",
            "case_set_id": CASE_SET_ID,
            "case_count": len(cases),
            "case_ids": [case["case_id"] for case in cases],
            "cases": cases,
        }
        chunk_rel = f"chunks/{chunk_id}.json"
        chunk_details = write_bytes(output_root / chunk_rel, compact_json_bytes(chunk))
        chunk_refs.append(
            {
                "chunk_id": chunk_id,
                **relative_record(chunk_rel, chunk_details),
                "case_count": len(cases),
                "case_ids": chunk["case_ids"],
            }
        )

    index = {
        "schema": INDEX_SCHEMA,
        "schema_version": SCHEMA_VERSION,
        "format": FORMAT,
        "release_id": RELEASE_ID,
        "status": "public_plot_only_candidate",
        "usage": "browser_visualization_only_not_metric_recomputation",
        "dataset_id": "hiliftaeroml",
        "dataset_revision": source_manifest["source_profile_truth_release_id"],
        "case_set_id": CASE_SET_ID,
        "coverage": "complete_split",
        "case_count": len(case_ids),
        "case_ids": case_ids,
        "profile_contract_id": source_manifest["profile_contract_id"],
        "profile_contract_sha256": source_manifest["profile_contract_sha256"],
        "source_profile_truth_release_id": source_manifest["source_profile_truth_release_id"],
        "source_profile_truth_manifest_sha256": source_manifest["source_profile_truth_manifest_sha256"],
        "source_compact_support_release_id": source_manifest["release_id"],
        "source_compact_support_manifest_sha256": source_manifest_sha,
        "cp_resolution": {
            "rule": "all_compact_support_points_with_at_most_128_points_per_physical_connected_graph",
            "maximum_points_per_physical_graph": 128,
            "rows": list(CP_ROWS),
            "resampling_during_publication": False,
        },
        "plot_precision": {
            "coordinates": "float32",
            "truth_values": "float32",
            "scoring_values": "not_included",
        },
        "common_support": {
            "format": "numpy-npz-v1",
            **relative_record(common_rel, common_details),
            "array_order": list(COMMON_ARRAY_ORDER),
            "station_order": list(VELOCITY_STATIONS),
            "rows_per_station": 801,
            "row_count": 4005,
        },
        "chunks": chunk_refs,
    }
    index_details = write_bytes(output_root / "index.json", pretty_json_bytes(index))

    provenance = {
        "schema": PROVENANCE_SCHEMA,
        "schema_version": SCHEMA_VERSION,
        "release_id": RELEASE_ID,
        "generated_at": args.generated_at,
        "generator": {
            "file": "bin/export_hiliftaeroml_compact_profile_truth.py",
            "sha256": sha256_file(Path(__file__)),
        },
        "source_repository": args.source_repository,
        "source_revision": args.source_revision,
        "source_compact_module": {
            "file": "reference/hiliftaeroml/compact_profiles.py",
            "sha256": sha256_file(args.compact_module.resolve()),
        },
        "source_compact_support": {
            "release_id": source_manifest["release_id"],
            "manifest_sha256": source_manifest_sha,
            "index_sha256": source_manifest["index"]["sha256"],
        },
        "transformation": {
            "scope": "plot_only_projection",
            "cp": "preserve every retained support row and branch boundary; select streamwise x; cast coordinate and truth to float32",
            "velocity": "preserve shared station coordinates and validity mask; cast valid truth values to float32",
            "omitted": [
                "quadrature_weights",
                "native_mapping_arrays",
                "nonplot_topology_codes",
                "full_field_truth",
                "native_lossless_profile_archive",
            ],
            "metric_recomputation_permitted": False,
        },
        "observed_rounding_error": {
            "maximum_absolute_cp": max_float32_cp_error,
            "maximum_absolute_velocity_speed_over_u_inf": max_float32_velocity_error,
        },
    }
    provenance_details = write_bytes(output_root / "provenance.json", pretty_json_bytes(provenance))

    release_files = []
    for path in sorted(output_root.rglob("*")):
        if path.is_file() and path.name != "release-receipt.json":
            release_files.append(
                {
                    "file": path.relative_to(output_root).as_posix(),
                    "sha256": sha256_file(path),
                    "byte_size": path.stat().st_size,
                }
            )
    receipt = {
        "schema": RECEIPT_SCHEMA,
        "schema_version": SCHEMA_VERSION,
        "release_id": RELEASE_ID,
        "generated_at": args.generated_at,
        "status": "public_plot_only_candidate",
        "case_count": len(case_ids),
        "cp_point_count": total_cp_points,
        "cp_branch_count": total_cp_branches,
        "velocity_valid_value_count": total_velocity_values,
        "index": relative_record("index.json", index_details),
        "provenance": relative_record("provenance.json", provenance_details),
        "file_count_excluding_receipt": len(release_files),
        "payload_byte_size_excluding_receipt": sum(item["byte_size"] for item in release_files),
        "files": release_files,
    }
    receipt_details = write_bytes(output_root / "release-receipt.json", compact_json_bytes(receipt))
    print(
        json.dumps(
            {
                "release_id": RELEASE_ID,
                "case_count": len(case_ids),
                "cp_point_count": total_cp_points,
                "velocity_valid_value_count": total_velocity_values,
                "index_sha256": index_details["sha256"],
                "receipt_sha256": receipt_details["sha256"],
                "total_bytes": sum(path.stat().st_size for path in output_root.rglob("*") if path.is_file()),
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

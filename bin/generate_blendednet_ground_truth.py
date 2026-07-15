#!/usr/bin/env python3
"""Generate website-owned prototype reference curves for BlendedNet."""

from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DATA_ROOT = ROOT / "assets" / "data" / "diagnostic-ground-truth"


def rounded(value: float) -> float:
    return round(value, 6)


def profile(
    station_id: str,
    quantity_id: str,
    y_key: str,
    points: list[tuple[float, float]],
) -> dict[str, Any]:
    return {
        "case_id": "prototype_ground_truth_case",
        "station_id": station_id,
        "quantity_id": quantity_id,
        "values": [
            {"x_over_c1": rounded(x), y_key: rounded(y)} for x, y in points
        ],
    }


def blendednet() -> dict[str, Any]:
    x_values = [i / 12 for i in range(13)]
    cp_cuts = []
    friction_profiles = []
    stations = (
        ("prototype_centerline", 0.0),
        ("prototype_midspan", 0.45),
        ("prototype_outer_wing", 0.8),
    )
    for station_id, span_fraction in stations:
        cp_cuts.append(
            profile(
                station_id,
                "cp",
                "cp",
                [
                    (
                        x,
                        -0.82
                        * (1.0 - 0.42 * span_fraction)
                        * math.exp(-((x - 0.18) / 0.2) ** 2)
                        + 0.24 * x,
                    )
                    for x in x_values
                ],
            )
        )
        friction_profiles.extend(
            [
                profile(
                    station_id,
                    "cfx",
                    "cfx",
                    [
                        (x, 0.0036 * (1.0 - 0.28 * span_fraction) * (1.0 - 0.62 * x))
                        for x in x_values
                    ],
                ),
                profile(
                    station_id,
                    "cfz",
                    "cfz",
                    [
                        (x, -0.0011 * span_fraction * math.sin(math.pi * x))
                        for x in x_values
                    ],
                ),
            ]
        )
    return {
        "dataset": "BlendedNet",
        "status": "prototype_dummy_data",
        "note": (
            "Illustrative FluidsBench reference traces for interface testing; "
            "not BlendedNet solver exports or official validation cuts."
        ),
        "diagnostics": {
            "cp_cuts": cp_cuts,
            "skin_friction_profiles": friction_profiles,
        },
    }


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def main() -> None:
    write_json(DATA_ROOT / "datasets" / "blendednet.json", blendednet())
    manifest_path = DATA_ROOT / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    entries = {entry["name"]: entry for entry in manifest["datasets"]}
    entries["BlendedNet"] = {"name": "BlendedNet", "file": "datasets/blendednet.json"}
    manifest["datasets"] = list(entries.values())
    write_json(manifest_path, manifest)


if __name__ == "__main__":
    main()

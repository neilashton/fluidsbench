#!/usr/bin/env python3
"""Generate website-owned prototype reference curves for turbomachinery datasets."""

from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DATA_ROOT = ROOT / "assets" / "data" / "diagnostic-ground-truth"


def rounded(value: float) -> float:
    return round(value, 5)


def profile(case_id: str, station_id: str, quantity_id: str, x_key: str, y_key: str, points: list[tuple[float, float]]) -> dict[str, Any]:
    return {
        "case_id": case_id,
        "station_id": station_id,
        "quantity_id": quantity_id,
        "values": [{x_key: rounded(x), y_key: rounded(y)} for x, y in points],
    }


def vki() -> dict[str, Any]:
    x_values = [i / 12 for i in range(13)]
    pitch = [i / 14 for i in range(15)]
    return {
        "dataset": "VKI-LS59",
        "status": "prototype_dummy_data",
        "note": "Illustrative FluidsBench reference traces for interface testing; not experimental LS59 measurements.",
        "diagnostics": {
            "surface_profiles": [
                profile("prototype_ground_truth_case", "pressure_side", "m_iso", "x_over_c", "m_iso", [(x, 0.62 + 0.52 * x + 0.08 * math.sin(math.pi * x)) for x in x_values]),
                profile("prototype_ground_truth_case", "suction_side", "m_iso", "x_over_c", "m_iso", [(x, 0.48 + 0.95 * math.sin(math.pi * x) ** 0.72 + 0.22 * x) for x in x_values]),
            ],
            "flow_profiles": [
                profile("prototype_ground_truth_case", "outlet_plane_2", "velocity_ratio", "pitch_fraction", "velocity_ratio", [(x, 1.01 - 0.27 * math.exp(-((x - 0.53) / 0.115) ** 2)) for x in pitch])
            ],
        },
    }


def rotor() -> dict[str, Any]:
    x_values = [i / 12 for i in range(13)]
    pressure_profiles = []
    thermo_profiles = []
    for station_index, station_id in enumerate(("span_10", "span_50", "span_90")):
        span_factor = 0.94 + 0.06 * station_index
        pressure_profiles.append(profile("prototype_ground_truth_case", station_id, "pressure_ratio", "x_over_c", "pressure_ratio", [(x, 0.88 + span_factor * (0.28 * x + 0.34 * x**1.8) + 0.035 * math.sin(math.pi * x)) for x in x_values]))
        thermo_profiles.extend(
            [
                profile("prototype_ground_truth_case", station_id, "temperature_ratio", "x_over_c", "temperature_ratio", [(x, 0.99 + span_factor * 0.23 * x**1.45) for x in x_values]),
                profile("prototype_ground_truth_case", station_id, "density_ratio", "x_over_c", "density_ratio", [(x, 0.96 + span_factor * 0.19 * x**1.25) for x in x_values]),
            ]
        )
    return {
        "dataset": "Rotor37",
        "status": "prototype_dummy_data",
        "note": "Illustrative FluidsBench reference traces for interface testing; not Rotor37 measurements or solver exports.",
        "diagnostics": {"blade_profiles": pressure_profiles, "blade_thermo_profiles": thermo_profiles},
    }


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def main() -> None:
    write_json(DATA_ROOT / "datasets" / "vki-ls59.json", vki())
    write_json(DATA_ROOT / "datasets" / "rotor37.json", rotor())
    manifest_path = DATA_ROOT / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    additions = {
        "VKI-LS59": "datasets/vki-ls59.json",
        "Rotor37": "datasets/rotor37.json",
    }
    entries = {entry["name"]: entry for entry in manifest["datasets"]}
    for name, file in additions.items():
        entries[name] = {"name": name, "file": file}
    manifest["schema_version"] = "0.2.0"
    manifest["datasets"] = list(entries.values())
    write_json(manifest_path, manifest)


if __name__ == "__main__":
    main()

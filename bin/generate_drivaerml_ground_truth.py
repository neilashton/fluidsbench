#!/usr/bin/env python3
"""Publish contract-aligned analytical DrivAerML prototype ground truth."""

from __future__ import annotations

import argparse
import importlib.util
from pathlib import Path
from types import ModuleType


ROOT = Path(__file__).resolve().parents[1]
GROUND_TRUTH_ROOT = ROOT / "assets" / "data" / "profile-ground-truth"


def load_generator(submission_root: Path) -> ModuleType:
    generator_path = (
        submission_root
        / "scripts"
        / "generate_drivaerml_leaderboard_fixtures.py"
    )
    specification = importlib.util.spec_from_file_location(
        "fluidsbench_drivaerml_fixture_generator",
        generator_path,
    )
    if specification is None or specification.loader is None:
        raise RuntimeError(f"cannot import {generator_path}")
    module = importlib.util.module_from_spec(specification)
    specification.loader.exec_module(module)
    return module


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--submission-root",
        type=Path,
        default=ROOT.parent / "fluidsbench-submission",
        help="path to the matching fluidsbench-submission checkout",
    )
    args = parser.parse_args()
    generator = load_generator(args.submission_root.expanduser().resolve())
    benchmark = generator.load_json(generator.DATASET_ROOT / "submission-spec.json")
    digest = generator.write_ground_truth_bundle(GROUND_TRUTH_ROOT, benchmark)
    print(f"Regenerated DrivAerML prototype ground truth: {digest}")


if __name__ == "__main__":
    main()

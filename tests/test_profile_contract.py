from __future__ import annotations

import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "bin"))

import check_profile_contract  # noqa: E402


class ProfileCaseCoverageTests(unittest.TestCase):
    def test_complete_release_requires_exact_ordered_split(self) -> None:
        self.assertEqual(
            check_profile_contract.case_coverage_errors(
                ["case-a", "case-b"],
                ["case-a", "case-b"],
                check_profile_contract.COMPLETE_COVERAGE,
                "prototype_dummy_data",
            ),
            [],
        )
        errors = check_profile_contract.case_coverage_errors(
            ["case-a", "case-b"],
            ["case-a"],
            check_profile_contract.COMPLETE_COVERAGE,
            "prototype_dummy_data",
        )
        self.assertTrue(any("differ" in error for error in errors))

    def test_prototype_may_publish_official_split_members_as_fixtures(self) -> None:
        self.assertEqual(
            check_profile_contract.case_coverage_errors(
                ["case-a", "case-b"],
                ["case-b"],
                check_profile_contract.REPRESENTATIVE_COVERAGE,
                "prototype_dummy_data",
            ),
            [],
        )

    def test_representative_fixture_rejects_unknown_empty_or_duplicate_cases(
        self,
    ) -> None:
        unknown = check_profile_contract.case_coverage_errors(
            ["case-a"],
            ["case-z"],
            check_profile_contract.REPRESENTATIVE_COVERAGE,
            "prototype_dummy_data",
        )
        self.assertTrue(any("absent" in error for error in unknown))
        empty = check_profile_contract.case_coverage_errors(
            ["case-a"],
            [],
            check_profile_contract.REPRESENTATIVE_COVERAGE,
            "prototype_dummy_data",
        )
        self.assertTrue(any("empty" in error for error in empty))
        duplicate = check_profile_contract.case_coverage_errors(
            ["case-a"],
            ["case-a", "case-a"],
            check_profile_contract.REPRESENTATIVE_COVERAGE,
            "prototype_dummy_data",
        )
        self.assertTrue(any("duplicates" in error for error in duplicate))

    def test_official_release_rejects_representative_subset(self) -> None:
        errors = check_profile_contract.case_coverage_errors(
            ["case-a", "case-b"],
            ["case-a"],
            check_profile_contract.REPRESENTATIVE_COVERAGE,
            "official",
        )
        self.assertTrue(any("prototype" in error for error in errors))


if __name__ == "__main__":
    unittest.main()

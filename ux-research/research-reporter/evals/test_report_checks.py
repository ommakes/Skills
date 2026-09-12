"""
test_report_checks.py — automated eval for research-reporter's
deterministic checks. Run with:
python3 -m unittest evals.test_report_checks -v
(from the research-reporter/ directory)
"""

import sys
import os
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
import report_checks  # noqa: E402


class TestValidateReportStructure(unittest.TestCase):
    def test_complete_report_has_no_missing_sections(self):
        report = """
        # Executive Summary
        blah

        ## Methodology
        blah

        ## Benchmark Comparison
        blah

        ## Findings
        blah

        ## Recommendations
        blah
        """
        self.assertEqual(report_checks.validate_report_structure(report), [])

    def test_missing_section_is_detected(self):
        report = "# Executive Summary\nblah\n## Findings\nblah"
        missing = report_checks.validate_report_structure(report)
        self.assertIn("methodology", missing)
        self.assertIn("recommendations", missing)
        self.assertNotIn("executive summary", missing)


class TestSelectFormat(unittest.TestCase):
    def test_internal_is_markdown(self):
        self.assertEqual(report_checks.select_format("internal").format, "markdown")

    def test_leadership_is_docx(self):
        self.assertEqual(report_checks.select_format("leadership").format, "docx")

    def test_unknown_audience_raises(self):
        with self.assertRaises(ValueError):
            report_checks.select_format("random_audience")


class TestCheckPreservedValues(unittest.TestCase):
    def test_ci_preserved_passes(self):
        synthesis = {"ci": [4.89, 6.40]}
        report = "The score came in with a 90% CI of [4.89, 6.40]."
        result = report_checks.check_preserved_values(synthesis, report)
        self.assertTrue(result.passed)

    def test_dropped_ci_fails(self):
        synthesis = {"ci": [4.89, 6.40]}
        report = "The score came in around average, no CI mentioned."
        result = report_checks.check_preserved_values(synthesis, report)
        self.assertFalse(result.passed)
        self.assertTrue(any("4.89" in v or "6.4" in v for v in result.violations))

    def test_dropped_low_confidence_flag_fails(self):
        synthesis = {"low_confidence_flag": True}
        report = "SEQ came in at 5.64, looking solid overall."
        result = report_checks.check_preserved_values(synthesis, report)
        self.assertFalse(result.passed)

    def test_preserved_low_confidence_flag_passes(self):
        synthesis = {"low_confidence_flag": True}
        report = "⚠️ Low confidence — n below floor. SEQ came in at 5.64."
        result = report_checks.check_preserved_values(synthesis, report)
        self.assertTrue(result.passed)

    def test_dropped_severity_tier_fails(self):
        synthesis = {"severity_tiers": {"checkout friction": "Critical"}}
        report = "Checkout friction was mentioned by a few respondents."
        result = report_checks.check_preserved_values(synthesis, report)
        self.assertFalse(result.passed)

    def test_preserved_severity_tier_passes(self):
        synthesis = {"severity_tiers": {"checkout friction": "Critical"}}
        report = "Checkout friction is Critical — fix before removing staff support."
        result = report_checks.check_preserved_values(synthesis, report)
        self.assertTrue(result.passed)


if __name__ == "__main__":
    unittest.main(verbosity=2)

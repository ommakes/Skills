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

    def test_dropped_evidence_confidence_fails(self):
        synthesis = {"evidence_confidence": {"overall": "MEDIUM"}}
        report = "SEQ came in at 5.64. We're fairly sure about this."
        result = report_checks.check_preserved_values(synthesis, report)
        self.assertFalse(result.passed)

    def test_preserved_evidence_confidence_passes(self):
        synthesis = {"evidence_confidence": {"overall": "MEDIUM"}}
        report = "Evidence confidence: MEDIUM. SEQ came in at 5.64."
        result = report_checks.check_preserved_values(synthesis, report)
        self.assertTrue(result.passed)

    def test_dropped_claim_strength_fails(self):
        synthesis = {"themes": [{"id": "T-01", "claim_strength": "correlated"}]}
        report = "Navigation difficulty tracked with lower satisfaction scores."
        result = report_checks.check_preserved_values(synthesis, report)
        self.assertFalse(result.passed)

    def test_preserved_claim_strength_passes(self):
        synthesis = {"themes": [{"id": "T-01", "claim_strength": "correlated"}]}
        report = "This finding is correlated, not causal: navigation difficulty tracked with lower scores."
        result = report_checks.check_preserved_values(synthesis, report)
        self.assertTrue(result.passed)


class TestCheckNoUnsupportedCausalLanguage(unittest.TestCase):
    def test_causal_language_without_causal_finding_fails(self):
        synthesis = {"themes": [{"id": "T-01", "claim_strength": "correlated"}]}
        report = "The confusing navigation caused users to abandon checkout."
        result = report_checks.check_no_unsupported_causal_language(synthesis, report)
        self.assertFalse(result.passed)
        self.assertTrue(any("caused" in v for v in result.violations))

    def test_causal_language_with_causal_finding_passes(self):
        synthesis = {"themes": [{"id": "T-01", "claim_strength": "causal"}]}
        report = "The redesigned navigation caused satisfaction to increase."
        result = report_checks.check_no_unsupported_causal_language(synthesis, report)
        self.assertTrue(result.passed)

    def test_no_causal_language_passes_regardless(self):
        synthesis = {"themes": [{"id": "T-01", "claim_strength": "observed"}]}
        report = "Navigation difficulty was associated with lower satisfaction scores."
        result = report_checks.check_no_unsupported_causal_language(synthesis, report)
        self.assertTrue(result.passed)


class TestValidateReportJson(unittest.TestCase):
    def _complete_report(self):
        return {
            "study": "x", "product": "unsoku", "audience": "internal",
            "format": "markdown", "executive_summary": "x", "methodology": "x",
            "benchmark_comparison": "x", "findings": [], "recommendations": [],
        }

    def test_complete_report_has_no_missing_fields(self):
        self.assertEqual(report_checks.validate_report_json(self._complete_report()), [])

    def test_incomplete_report_lists_missing_fields(self):
        missing = report_checks.validate_report_json({"study": "x"})
        self.assertIn("findings", missing)
        self.assertIn("recommendations", missing)
        self.assertNotIn("study", missing)


if __name__ == "__main__":
    unittest.main(verbosity=2)

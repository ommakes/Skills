"""
test_selection.py — automated eval for survey-architect's deterministic
lookups. Run with: python3 -m unittest evals.test_selection -v
(from the survey-architect/ directory)
"""

import sys
import os
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
import selection  # noqa: E402


class TestSelectInstrument(unittest.TestCase):
    def test_task_completion_maps_to_seq(self):
        result = selection.select_instrument("task_completion")
        self.assertEqual(result.instrument, "SEQ")
        self.assertEqual(result.item_count, 1)

    def test_product_usability_full_maps_to_sus(self):
        result = selection.select_instrument("product_usability_full")
        self.assertEqual(result.instrument, "SUS")
        self.assertEqual(result.item_count, 10)

    def test_product_usability_lite_maps_to_umux_lite(self):
        result = selection.select_instrument("product_usability_lite")
        self.assertEqual(result.instrument, "UMUX-Lite")
        self.assertEqual(result.item_count, 2)

    def test_relationship_loyalty_maps_to_nps(self):
        result = selection.select_instrument("relationship_loyalty")
        self.assertEqual(result.instrument, "NPS")

    def test_website_relationship_maps_to_supr_q(self):
        result = selection.select_instrument("website_relationship_benchmark")
        self.assertEqual(result.instrument, "SUPR-Q")
        self.assertEqual(result.item_count, 8)

    def test_transactional_satisfaction_maps_to_csat(self):
        result = selection.select_instrument("transactional_satisfaction")
        self.assertEqual(result.instrument, "CSAT")

    def test_transactional_effort_maps_to_ces(self):
        result = selection.select_instrument("transactional_effort")
        self.assertEqual(result.instrument, "CES")

    def test_diagnostic_maps_to_pssuq(self):
        result = selection.select_instrument("diagnostic_subscales")
        self.assertEqual(result.instrument, "PSSUQ")
        self.assertEqual(result.item_count, 16)

    def test_unknown_decision_type_raises_not_defaults(self):
        # This is the important negative case: an unrecognized
        # decision_type must fail loudly, not silently default to some
        # "safe" instrument — that's what forces the custom-item-set /
        # no-benchmark flag to actually happen.
        with self.assertRaises(ValueError):
            selection.select_instrument("something_made_up")


class TestRequiredSampleSize(unittest.TestCase):
    def test_rough_benchmark_is_20(self):
        self.assertEqual(selection.required_sample_size("rough_benchmark").recommended_n, 20)

    def test_between_subjects_is_213(self):
        self.assertEqual(
            selection.required_sample_size("compare_two_conditions_between").recommended_n, 213
        )

    def test_within_subjects_is_93(self):
        self.assertEqual(
            selection.required_sample_size("compare_two_conditions_within").recommended_n, 93
        )

    def test_ongoing_tracking_is_30(self):
        self.assertEqual(selection.required_sample_size("ongoing_tracking").recommended_n, 30)

    def test_unknown_purpose_raises(self):
        with self.assertRaises(ValueError):
            selection.required_sample_size("vibes")


class TestValidateSurveySpec(unittest.TestCase):
    def test_complete_spec_has_no_missing_fields(self):
        spec = {
            "study": "x", "product": "acme", "instrument": "SEQ",
            "items": [], "trigger_event": "x", "frequency_cap": "x",
            "required_n": 20, "scoring_formula": "mean",
        }
        self.assertEqual(selection.validate_survey_spec(spec), [])

    def test_incomplete_spec_lists_missing_fields(self):
        spec = {"study": "x", "product": "acme"}
        missing = selection.validate_survey_spec(spec)
        self.assertIn("instrument", missing)
        self.assertIn("required_n", missing)
        self.assertNotIn("study", missing)


class TestValidateIntakeSpec(unittest.TestCase):
    def test_complete_intake_has_no_missing_fields(self):
        intake = {
            "study": "x", "product": "acme", "learning_goal": "x",
            "experience_moment": "task", "decision_type": "task_completion",
            "instrument": "SEQ", "required_n": 20,
        }
        self.assertEqual(selection.validate_intake_spec(intake), [])

    def test_incomplete_intake_lists_missing_fields(self):
        intake = {"study": "x", "product": "acme"}
        missing = selection.validate_intake_spec(intake)
        self.assertIn("decision_type", missing)
        self.assertIn("required_n", missing)
        self.assertNotIn("study", missing)

    def test_missing_prior_benchmark_reused_is_not_an_error(self):
        # Only meaningful when Step 0 Q4 found an existing series — its
        # absence on a first-ever study is not a validation failure.
        intake = {
            "study": "x", "product": "acme", "learning_goal": "x",
            "experience_moment": "task", "decision_type": "task_completion",
            "instrument": "SEQ", "required_n": 20,
        }
        self.assertNotIn("prior_benchmark_reused", selection.validate_intake_spec(intake))


if __name__ == "__main__":
    unittest.main(verbosity=2)

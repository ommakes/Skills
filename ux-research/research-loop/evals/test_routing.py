"""
test_routing.py — automated eval for research-loop's deterministic
entry-detection and loop-back-limit logic. Run with:
python3 -m unittest evals.test_routing -v
(from the research-loop/ directory)
"""

import sys
import os
import tempfile
import shutil
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
import routing  # noqa: E402


class TestDetectEntryPoint(unittest.TestCase):
    def test_new_question_no_data_goes_to_survey_architect(self):
        result = routing.detect_entry_point(
            has_learning_goal=True, has_raw_data=False,
            has_study_folder=False, has_synthesis_file=False,
        )
        self.assertEqual(result, "survey-architect")

    def test_raw_data_no_study_folder_is_standalone_synthesis(self):
        # e.g. a pile of app store reviews pasted in cold
        result = routing.detect_entry_point(
            has_learning_goal=False, has_raw_data=True,
            has_study_folder=False, has_synthesis_file=False,
        )
        self.assertEqual(result, "feedback-synthesizer-standalone")

    def test_raw_data_with_study_folder_is_loaded_synthesis(self):
        result = routing.detect_entry_point(
            has_learning_goal=True, has_raw_data=True,
            has_study_folder=True, has_synthesis_file=False,
        )
        self.assertEqual(result, "feedback-synthesizer-loaded")

    def test_synthesis_file_present_goes_to_reporter(self):
        result = routing.detect_entry_point(
            has_learning_goal=True, has_raw_data=True,
            has_study_folder=True, has_synthesis_file=True,
        )
        self.assertEqual(result, "research-reporter")

    def test_synthesis_file_takes_priority_over_everything_else(self):
        # Even a bare, vague-looking state should route to reporter if
        # a synthesis file exists — it's the most-progressed artifact.
        result = routing.detect_entry_point(
            has_learning_goal=False, has_raw_data=False,
            has_study_folder=False, has_synthesis_file=True,
        )
        self.assertEqual(result, "research-reporter")

    def test_vague_ask_defaults_to_survey_architect(self):
        result = routing.detect_entry_point(
            has_learning_goal=False, has_raw_data=False,
            has_study_folder=False, has_synthesis_file=False,
        )
        self.assertEqual(result, "survey-architect")


class TestShouldEscalate(unittest.TestCase):
    def test_zero_loopbacks_does_not_escalate(self):
        self.assertFalse(routing.should_escalate_to_researcher(0).should_escalate)

    def test_one_loopback_does_not_escalate(self):
        # A 2nd loop-back is still within budget (max default is 2)
        self.assertFalse(routing.should_escalate_to_researcher(1).should_escalate)

    def test_two_loopbacks_escalates(self):
        # Budget used up — a 3rd loop-back should not run automatically
        self.assertTrue(routing.should_escalate_to_researcher(2).should_escalate)

    def test_custom_max_respected(self):
        self.assertFalse(routing.should_escalate_to_researcher(3, max_loopbacks=5).should_escalate)
        self.assertTrue(routing.should_escalate_to_researcher(5, max_loopbacks=5).should_escalate)


class TestPathHelpers(unittest.TestCase):
    def test_study_dir_format(self):
        self.assertEqual(routing.study_dir("unsoku-signup-flow-seq"),
                          "/research/unsoku-signup-flow-seq/")

    def test_benchmark_path_format(self):
        self.assertEqual(routing.benchmark_path("unsoku"),
                          "/research/_benchmarks/unsoku.md")


class TestNextState(unittest.TestCase):
    def test_allowed_forward_transition_succeeds(self):
        self.assertEqual(routing.next_state("INTAKE", "SURVEY_DESIGN"), "SURVEY_DESIGN")

    def test_allowed_kickback_transition_succeeds(self):
        self.assertEqual(routing.next_state("SYNTHESIS", "SURVEY_DESIGN"), "SURVEY_DESIGN")

    def test_skipping_a_stage_raises(self):
        # INTAKE straight to REPORTING is exactly the kind of accidental
        # skip the transition graph exists to catch.
        with self.assertRaises(ValueError):
            routing.next_state("INTAKE", "REPORTING")

    def test_transition_from_terminal_state_raises(self):
        with self.assertRaises(ValueError):
            routing.next_state("COMPLETE", "INTAKE")

    def test_unrecognized_state_raises(self):
        with self.assertRaises(ValueError):
            routing.next_state("MADE_UP_STATE", "INTAKE")


class TestStateFilePersistence(unittest.TestCase):
    def setUp(self):
        self.tmp_dir = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.tmp_dir, ignore_errors=True)

    def test_read_state_on_missing_file_returns_none(self):
        self.assertIsNone(routing.read_state(self.tmp_dir))

    def test_write_then_read_state_round_trips(self):
        state = {"study_id": "x", "state": "INTAKE", "loopbacks": {"total": 0, "max": 2}}
        routing.write_state(self.tmp_dir, state)
        self.assertEqual(routing.read_state(self.tmp_dir), state)

    def test_write_state_creates_missing_directory(self):
        nested = os.path.join(self.tmp_dir, "a-study")
        routing.write_state(nested, {"study_id": "x", "state": "INTAKE"})
        self.assertTrue(os.path.isdir(nested))
        self.assertTrue(os.path.exists(routing.state_file_path(nested)))


class TestValidateBenchmark(unittest.TestCase):
    def test_complete_entry_has_no_missing_fields(self):
        entry = {
            "instrument": "SUS", "wording_version": "2026-01", "scale": [1, 5],
            "population": "active customers", "sampling_method": "intercept",
            "trigger": "post-checkout", "n": 142,
        }
        self.assertEqual(routing.validate_benchmark(entry), [])

    def test_incomplete_entry_lists_missing_fields(self):
        missing = routing.validate_benchmark({"instrument": "SUS"})
        self.assertIn("wording_version", missing)
        self.assertIn("n", missing)


class TestCheckBenchmarkComparability(unittest.TestCase):
    def _base_entry(self):
        return {
            "instrument": "SUS", "wording_version": "2026-01", "scale": [1, 5],
            "population": "active customers", "sampling_method": "intercept",
            "trigger": "post-checkout", "n": 142,
        }

    def test_identical_conditions_are_comparable(self):
        current = self._base_entry()
        previous = self._base_entry()
        result = routing.check_benchmark_comparability(current, previous)
        self.assertTrue(result.comparable)
        self.assertEqual(result.mismatched_fields, [])

    def test_different_wording_version_is_not_comparable(self):
        current = self._base_entry()
        previous = self._base_entry()
        previous["wording_version"] = "2025-06"
        result = routing.check_benchmark_comparability(current, previous)
        self.assertFalse(result.comparable)
        self.assertIn("wording_version", result.mismatched_fields)

    def test_different_n_alone_does_not_block_comparability(self):
        # Sample size differing between waves is normal and doesn't
        # affect whether the measurement itself is comparable.
        current = self._base_entry()
        previous = self._base_entry()
        previous["n"] = 40
        result = routing.check_benchmark_comparability(current, previous)
        self.assertTrue(result.comparable)


if __name__ == "__main__":
    unittest.main(verbosity=2)

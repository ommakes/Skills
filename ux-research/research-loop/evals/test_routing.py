"""
test_routing.py — automated eval for research-loop's deterministic
entry-detection and loop-back-limit logic. Run with:
python3 -m unittest evals.test_routing -v
(from the research-loop/ directory)
"""

import sys
import os
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


if __name__ == "__main__":
    unittest.main(verbosity=2)

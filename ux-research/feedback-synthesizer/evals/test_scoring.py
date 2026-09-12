"""
test_scoring.py — automated eval for feedback-synthesizer's scoring math.

Run with: python3 -m unittest evals.test_scoring -v
(from the feedback-synthesizer/ directory)

These are the deterministic, objectively-gradable half of feedback-
synthesizer's evals — pure arithmetic with a known correct answer, no
LLM judgment involved. The qualitative half (theme coding, small-n
kickback judgment) lives in evals/qualitative_cases.md instead, since
those require a human or an LLM grader to assess, not a fixed assertion.

Re-run this file after ANY edit to scoring.py. A change that breaks one
of these should block the edit, not get discovered on the next live
study.
"""

import sys
import os
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
import scoring  # noqa: E402


class TestSusScore(unittest.TestCase):
    def test_straight_lining_always_scores_50(self):
        """Documented property of the SUS formula: because 5 items are
        reverse-scored, ANY straight-line response (all items the same
        value, 1-5) scores exactly 50. This is a real, known invariant
        of the formula — not an arbitrary fixture — so it's a strong
        regression check that the odd/even reverse-scoring logic is
        still wired correctly."""
        for k in range(1, 6):
            with self.subTest(k=k):
                self.assertAlmostEqual(scoring.sus_score([k] * 10), 50.0)

    def test_best_possible_pattern(self):
        # Odd items (positive framing) answered 5, even items (negative
        # framing) answered 1 = best possible usability response.
        responses = [5, 1, 5, 1, 5, 1, 5, 1, 5, 1]
        self.assertAlmostEqual(scoring.sus_score(responses), 100.0)

    def test_worst_possible_pattern(self):
        responses = [1, 5, 1, 5, 1, 5, 1, 5, 1, 5]
        self.assertAlmostEqual(scoring.sus_score(responses), 0.0)

    def test_wrong_length_raises(self):
        with self.assertRaises(ValueError):
            scoring.sus_score([3, 3, 3])

    def test_out_of_range_raises(self):
        with self.assertRaises(ValueError):
            scoring.sus_score([6, 3, 3, 3, 3, 3, 3, 3, 3, 3])


class TestUmuxScore(unittest.TestCase):
    def test_straight_lining_always_scores_50(self):
        """Same invariant as SUS: 2 of 4 items are reverse-scored, so
        straight-lining always lands at 50."""
        for k in range(1, 8):
            with self.subTest(k=k):
                self.assertAlmostEqual(scoring.umux_score([k] * 4), 50.0)


class TestUmuxLiteScore(unittest.TestCase):
    def test_max_scores(self):
        result = scoring.umux_lite_score(7, 7)
        self.assertAlmostEqual(result.umux_lite_score, 100.0)
        self.assertAlmostEqual(result.predicted_sus, 87.9)

    def test_min_scores(self):
        result = scoring.umux_lite_score(1, 1)
        self.assertAlmostEqual(result.umux_lite_score, 0.0)
        self.assertAlmostEqual(result.predicted_sus, 22.9)


class TestNpsScore(unittest.TestCase):
    def test_all_promoters(self):
        result = scoring.nps_score([10, 9, 10, 9])
        self.assertEqual(result.promoters, 4)
        self.assertEqual(result.detractors, 0)
        self.assertAlmostEqual(result.nps, 100.0)

    def test_all_detractors(self):
        result = scoring.nps_score([0, 3, 6, 6])
        self.assertEqual(result.detractors, 4)
        self.assertAlmostEqual(result.nps, -100.0)

    def test_all_passives(self):
        result = scoring.nps_score([7, 8, 7, 8])
        self.assertEqual(result.passives, 4)
        self.assertAlmostEqual(result.nps, 0.0)

    def test_mixed(self):
        # 2 promoters, 1 passive, 1 detractor out of 4
        result = scoring.nps_score([10, 9, 8, 5])
        self.assertAlmostEqual(result.nps, 25.0)  # 50% - 25% = 25


class TestCsat(unittest.TestCase):
    def test_top_two_box_all_max(self):
        self.assertAlmostEqual(scoring.csat_top_two_box([5, 5, 5]), 100.0)

    def test_top_two_box_all_min(self):
        self.assertAlmostEqual(scoring.csat_top_two_box([1, 1, 1]), 0.0)

    def test_top_two_box_mixed(self):
        # 3 of 5 responses are in the top two boxes (4 or 5)
        self.assertAlmostEqual(scoring.csat_top_two_box([5, 4, 3, 2, 1]), 40.0)


class TestSuprQ(unittest.TestCase):
    def test_all_max(self):
        result = scoring.supr_q_score([5, 5, 5, 5, 5, 5, 5], 10)
        self.assertAlmostEqual(result.raw_score, 100.0)

    def test_all_min(self):
        result = scoring.supr_q_score([1, 1, 1, 1, 1, 1, 1], 0)
        self.assertAlmostEqual(result.raw_score, 20.0)

    def test_wrong_item_count_raises(self):
        with self.assertRaises(ValueError):
            scoring.supr_q_score([5, 5, 5], 10)


class TestConfidenceInterval(unittest.TestCase):
    def test_pilot_data_matches_manual_calc(self):
        """Regression test locking in the exact numbers from the Unsoku
        signup-flow pilot test run, verified independently during that
        test (n=14, mean=5.64, 90% CI=[4.89, 6.40])."""
        scores = [7, 6, 7, 3, 6, 7, 2, 6, 7, 4, 6, 7, 5, 6]
        result = scoring.confidence_interval(scores, confidence=0.90)
        self.assertEqual(result.n, 14)
        self.assertAlmostEqual(result.mean, 5.64, places=2)
        self.assertAlmostEqual(result.ci_low, 4.89, places=2)
        self.assertAlmostEqual(result.ci_high, 6.40, places=2)

    def test_requires_at_least_two_scores(self):
        with self.assertRaises(ValueError):
            scoring.confidence_interval([5])


class TestSignificance(unittest.TestCase):
    def test_pilot_data_not_significant_vs_benchmark(self):
        """Same pilot data: the mean (5.64) isn't statistically
        different from the SEQ benchmark (5.5) at n=14 — this was the
        actual finding in the test run (p=.743, CI overlaps benchmark)."""
        scores = [7, 6, 7, 3, 6, 7, 2, 6, 7, 4, 6, 7, 5, 6]
        result = scoring.significance_vs_benchmark(scores, 5.5, confidence=0.90)
        self.assertAlmostEqual(result.p_value, 0.743, places=2)
        self.assertFalse(result.significant)

    def test_clearly_different_scores_are_significant(self):
        low_scores = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2]
        result = scoring.significance_vs_benchmark(low_scores, 5.5, confidence=0.90)
        self.assertTrue(result.significant)


class TestSeverityTier(unittest.TestCase):
    """This is the regression suite for the exact bug found during the
    Unsoku pilot test: a theme with low OVERALL frequency but high
    WITHIN-BAND frequency and a clear skew must tier as Critical, not
    get diluted down by the whole-sample percentage."""

    def test_pilot_bug_case_is_critical(self):
        # 3 of 4 low scorers mentioned it (75%), 0 of 10 high scorers
        # (0%) — overall frequency is only 3/14 = 21%, but this must
        # still tier as Critical per the v1.1.0 fix.
        result = scoring.severity_tier(
            affected_band_theme_count=3, affected_band_n=4,
            unaffected_band_theme_count=0, unaffected_band_n=10,
        )
        self.assertEqual(result.tier, "Critical")
        self.assertAlmostEqual(result.overall_frequency_pct, 3 / 14 * 100, places=1)

    def test_high_frequency_but_no_skew_is_notable_not_critical(self):
        # 60% of low scorers mention it, but so do 50% of high scorers —
        # high within-band frequency alone isn't enough without a skew.
        result = scoring.severity_tier(
            affected_band_theme_count=6, affected_band_n=10,
            unaffected_band_theme_count=5, unaffected_band_n=10,
        )
        self.assertEqual(result.tier, "Notable")

    def test_low_frequency_no_skew_is_minor(self):
        result = scoring.severity_tier(
            affected_band_theme_count=1, affected_band_n=10,
            unaffected_band_theme_count=1, unaffected_band_n=10,
        )
        self.assertEqual(result.tier, "Minor")

    def test_strong_skew_but_below_threshold_is_notable(self):
        # Clear skew (30% vs 0%) but under the 50% within-band threshold
        # for Critical — should land as Notable, not Critical or Minor.
        result = scoring.severity_tier(
            affected_band_theme_count=3, affected_band_n=10,
            unaffected_band_theme_count=0, unaffected_band_n=10,
        )
        self.assertEqual(result.tier, "Notable")


if __name__ == "__main__":
    unittest.main(verbosity=2)

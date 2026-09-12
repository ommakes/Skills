"""
scoring.py — deterministic scoring for feedback-synthesizer.

Run these functions instead of computing formulas by hand. This exists
because SUS/SEQ/NPS/UMUX-Lite/SUPR-Q/CSAT/CES scoring, confidence
intervals, and significance tests are exact, well-defined calculations —
there is no judgment involved, so there is no reason to risk an LLM doing
arithmetic in its head when a script can do it exactly the same way every
time.

Dependency: scipy (for the t-distribution in confidence intervals and
significance tests). If scipy isn't available in the execution
environment, install it before running this script — do not approximate
the t-distribution by hand.

Usage from the skill: import this module and call the relevant
`*_score` function, then `confidence_interval` and, if comparing against
a benchmark or prior wave, `significance_vs_benchmark` or
`compare_waves`. Pass the *raw* results through unmodified — don't
pre-average anything before calling these.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Sequence
import math

try:
    from scipy import stats
except ImportError as e:  # pragma: no cover
    raise ImportError(
        "scipy is required for confidence_interval and significance "
        "testing. Install it (pip install scipy) before running "
        "feedback-synthesizer's scoring functions."
    ) from e


# ---------------------------------------------------------------------------
# Statistical policy — the one place these numbers live. SKILL.md refers
# to this module rather than restating the values, so a policy change
# (e.g. moving to 95% CIs) happens in exactly one place.
# ---------------------------------------------------------------------------

DEFAULT_CONFIDENCE_LEVEL = 0.90  # matches MeasuringU's UX-research convention
SMALL_SAMPLE_POLICY = "conservative"  # widen CI + flag loudly, never refuse

EVIDENCE_CONFIDENCE_LEVELS = ("HIGH", "MEDIUM", "LOW", "INSUFFICIENT")
"""
Evidence confidence is a *different question* from a confidence interval.
A CI describes uncertainty around one statistic. Evidence confidence
describes how much to trust the overall conclusion — sample quality,
source quality, coding confidence, and triangulation across methods all
factor in. A narrow CI does not, by itself, justify "high" evidence
confidence; a wide CI does not, by itself, justify "low." Keep the two
vocabularies separate in synthesis output.
"""

CLAIM_STRENGTH_LEVELS = ("observed", "associated", "correlated", "causal")
"""
Ladder for how strongly a finding's evidence supports its language:
  observed   — this was reported/measured, no relationship claimed
  associated — co-occurs with another variable, direction not tested
  correlated — a statistical relationship was actually tested
  causal     — one thing was shown to produce the other

Only survey/feedback data (observational by construction) backs this
skill's findings — see validate_claim_strength() below, which is the
enforcement point for never letting "causal" appear without a design
that can support it.
"""


def validate_claim_strength(level: str, has_causal_design: bool = False) -> None:
    """
    Raises ValueError if `level` isn't a recognized rung, or if "causal"
    is claimed without `has_causal_design=True` (an actual experiment,
    randomized test, or strong quasi-experimental design — never true for
    a plain survey/feedback synthesis, which is why the default is
    False). This is the guard against observational research quietly
    becoming causal language during synthesis or reporting.
    """
    if level not in CLAIM_STRENGTH_LEVELS:
        raise ValueError(
            f"'{level}' isn't a recognized claim-strength level. Valid: "
            f"{CLAIM_STRENGTH_LEVELS}"
        )
    if level == "causal" and not has_causal_design:
        raise ValueError(
            "claim_strength='causal' requires has_causal_design=True — a "
            "survey/feedback synthesis is observational by construction. "
            "Use 'correlated' instead unless this study actually ran an "
            "experiment or a strong quasi-experimental design."
        )


# ---------------------------------------------------------------------------
# Instrument scoring
# ---------------------------------------------------------------------------

def sus_score(responses: Sequence[int]) -> float:
    """
    System Usability Scale. `responses` is exactly 10 ints, 1-5, in item
    order (item 1 first ... item 10 last). Odd items are "positive"
    framing, even items are "negative" framing, per Brooke's original
    instrument.
    Returns a 0-100 score. NOT a percentage — don't relabel it as one.
    """
    if len(responses) != 10:
        raise ValueError(f"SUS requires exactly 10 responses, got {len(responses)}")
    if not all(1 <= r <= 5 for r in responses):
        raise ValueError("SUS responses must each be 1-5")
    total = 0
    for i, r in enumerate(responses, start=1):
        total += (r - 1) if i % 2 == 1 else (5 - r)
    return total * 2.5


def seq_score(responses: Sequence[float]) -> float:
    """
    Single Ease Question. `responses` is a list of 1-7 ratings, one per
    respondent, for a single task. Returns the mean — SEQ has no
    per-respondent transformation, only aggregation.
    """
    if not responses:
        raise ValueError("seq_score requires at least one response")
    if not all(1 <= r <= 7 for r in responses):
        raise ValueError("SEQ responses must each be 1-7")
    return sum(responses) / len(responses)


def umux_score(responses: Sequence[int]) -> float:
    """
    Full UMUX (4 items, 7-point, items 1&3 positive, 2&4 negative).
    `responses` is 4 ints in item order. Returns a 0-100 score
    comparable to SUS.
    """
    if len(responses) != 4:
        raise ValueError(f"UMUX requires exactly 4 responses, got {len(responses)}")
    if not all(1 <= r <= 7 for r in responses):
        raise ValueError("UMUX responses must each be 1-7")
    transformed = []
    for i, r in enumerate(responses, start=1):
        zero_based = r - 1  # 0-6
        transformed.append(zero_based if i in (1, 3) else (6 - zero_based))
    return sum(transformed) / 24 * 100


@dataclass
class UmuxLiteResult:
    umux_lite_score: float       # 0-100
    predicted_sus: float         # 0-100, via Lewis/Utesch/Maher regression


def umux_lite_score(item1: int, item2: int) -> UmuxLiteResult:
    """
    UMUX-Lite (2 items, 7-point: usefulness, ease of use).
    Returns both the raw 0-100 score and the predicted SUS score via the
    published regression: SUS = 0.65 * ((i1+i2-2) * (100/12)) + 22.9
    """
    if not (1 <= item1 <= 7 and 1 <= item2 <= 7):
        raise ValueError("UMUX-Lite items must each be 1-7")
    raw = ((item1 + item2 - 2) * (100 / 12))
    predicted_sus = 0.65 * raw + 22.9
    return UmuxLiteResult(umux_lite_score=raw, predicted_sus=predicted_sus)


@dataclass
class NpsResult:
    n: int
    promoters: int
    passives: int
    detractors: int
    nps: float  # -100 to 100


def nps_score(responses: Sequence[int]) -> NpsResult:
    """
    Net Promoter Score. `responses` is a list of 0-10 ints.
    """
    if not responses:
        raise ValueError("nps_score requires at least one response")
    if not all(0 <= r <= 10 for r in responses):
        raise ValueError("NPS responses must each be 0-10")
    n = len(responses)
    promoters = sum(1 for r in responses if r >= 9)
    detractors = sum(1 for r in responses if r <= 6)
    passives = n - promoters - detractors
    nps = (promoters / n - detractors / n) * 100
    return NpsResult(n=n, promoters=promoters, passives=passives,
                      detractors=detractors, nps=nps)


def csat_top_two_box(responses: Sequence[int], scale_max: int = 5) -> float:
    """
    CSAT as top-two-box percentage. `responses` on a 1..scale_max scale
    (default 5). Returns a 0-100 percentage.
    """
    if not responses:
        raise ValueError("csat_top_two_box requires at least one response")
    if not all(1 <= r <= scale_max for r in responses):
        raise ValueError(f"CSAT responses must each be 1-{scale_max}")
    top_two = {scale_max, scale_max - 1}
    return sum(1 for r in responses if r in top_two) / len(responses) * 100


def csat_mean(responses: Sequence[int]) -> float:
    """CSAT as a mean rating instead of top-two-box. State which method
    you're using in the synthesis output — the two aren't comparable."""
    if not responses:
        raise ValueError("csat_mean requires at least one response")
    return sum(responses) / len(responses)


def ces_score(responses: Sequence[int]) -> float:
    """Customer Effort Score. Mean of raw responses (1-7 for CES 2.0,
    1-5 for the original CES 1.0 — pass whichever scale was used)."""
    if not responses:
        raise ValueError("ces_score requires at least one response")
    return sum(responses) / len(responses)


@dataclass
class SuprQResult:
    raw_score: float          # 0-100, averaged across all 8 items
    subscale_usability: float
    subscale_trust: float
    subscale_appearance: float
    subscale_loyalty: float


def supr_q_score(five_point_items: Sequence[int], nps_item_0_to_10: int) -> SuprQResult:
    """
    SUPR-Q (8 items). `five_point_items` is exactly 7 ints, 1-5, in this
    fixed order: [usability_1, usability_2, trust_1, trust_2, loyalty_1,
    appearance_1, appearance_2]. `nps_item_0_to_10` is item 8 (loyalty /
    recommend), 0-10.

    The 11-point item is interpolated onto the 5-point scale before
    averaging: value = 1 + (nps_item / 10) * 4.

    NOTE: this returns a raw 0-100 average, NOT a percentile rank.
    Percentile ranking requires MeasuringU's licensed normative database
    — flag in the synthesis output that no percentile lookup was run
    unless you actually have access to that database.
    """
    if len(five_point_items) != 7:
        raise ValueError(f"SUPR-Q requires exactly 7 five-point items, got {len(five_point_items)}")
    if not all(1 <= r <= 5 for r in five_point_items):
        raise ValueError("SUPR-Q 5-point items must each be 1-5")
    if not (0 <= nps_item_0_to_10 <= 10):
        raise ValueError("SUPR-Q's loyalty item must be 0-10")

    interpolated = 1 + (nps_item_0_to_10 / 10) * 4
    usability = five_point_items[0:2]
    trust = five_point_items[2:4]
    loyalty_5pt = five_point_items[4]
    appearance = five_point_items[5:7]

    all_items = list(five_point_items) + [interpolated]
    raw = sum(all_items) / len(all_items) / 5 * 100  # normalize 1-5 scale to 0-100

    return SuprQResult(
        raw_score=raw,
        subscale_usability=sum(usability) / len(usability) / 5 * 100,
        subscale_trust=sum(trust) / len(trust) / 5 * 100,
        subscale_appearance=sum(appearance) / len(appearance) / 5 * 100,
        subscale_loyalty=((loyalty_5pt + interpolated) / 2) / 5 * 100,
    )


# ---------------------------------------------------------------------------
# Confidence intervals and significance testing
# ---------------------------------------------------------------------------

@dataclass
class CiResult:
    mean: float
    n: int
    sd: float
    ci_low: float
    ci_high: float
    confidence: float


def confidence_interval(scores: Sequence[float], confidence: float = DEFAULT_CONFIDENCE_LEVEL) -> CiResult:
    """
    Confidence interval around a mean, via the t-distribution (correct
    for small samples — this is the UX-research-standard approach,
    matching MeasuringU's convention of reporting 90% CIs).
    Requires at least 2 scores (need variance).
    """
    n = len(scores)
    if n < 2:
        raise ValueError("confidence_interval requires at least 2 scores")
    mean = sum(scores) / n
    sd = math.sqrt(sum((x - mean) ** 2 for x in scores) / (n - 1))
    se = sd / math.sqrt(n)
    tail = 1 - (1 - confidence) / 2
    t_crit = stats.t.ppf(tail, df=n - 1)
    return CiResult(
        mean=mean, n=n, sd=sd,
        ci_low=mean - t_crit * se,
        ci_high=mean + t_crit * se,
        confidence=confidence,
    )


@dataclass
class SigTestResult:
    t_stat: float
    p_value: float
    significant: bool  # at the CI's alpha (e.g. p < 0.10 for a 90% CI)


def significance_vs_benchmark(scores: Sequence[float], benchmark: float,
                                confidence: float = DEFAULT_CONFIDENCE_LEVEL) -> SigTestResult:
    """One-sample t-test against a published benchmark (e.g. SUS's 68,
    SEQ's ~5.5). Use this instead of eyeballing whether a score is
    'above' or 'below' benchmark."""
    alpha = 1 - confidence
    t_stat, p_value = stats.ttest_1samp(scores, benchmark)
    return SigTestResult(t_stat=t_stat, p_value=p_value, significant=p_value < alpha)


def compare_waves(scores_a: Sequence[float], scores_b: Sequence[float],
                   paired: bool = False, confidence: float = DEFAULT_CONFIDENCE_LEVEL) -> SigTestResult:
    """Compare two waves of the same instrument. Use paired=True only if
    the same respondents were measured both times (rare for UX surveys —
    default False, independent samples)."""
    alpha = 1 - confidence
    if paired:
        if len(scores_a) != len(scores_b):
            raise ValueError("Paired comparison requires equal-length samples")
        t_stat, p_value = stats.ttest_rel(scores_a, scores_b)
    else:
        t_stat, p_value = stats.ttest_ind(scores_a, scores_b)
    return SigTestResult(t_stat=t_stat, p_value=p_value, significant=p_value < alpha)


# ---------------------------------------------------------------------------
# Severity tiering (fixed per the v1.1.0 patch — within-band frequency,
# not whole-sample frequency)
# ---------------------------------------------------------------------------

SEVERITY_TIERS = ("Critical", "Notable", "Minor")

VALID_OVERRIDE_REASONS = (
    "safety", "accessibility", "legal_compliance", "severe_user_harm",
    "critical_task_blockage",
)
"""
The only reasons `severity_tier`'s `override` argument will accept. This
is deliberately a closed list, not a free-text field: an override exists
to let a legitimate outside consideration (a safety issue, an
accessibility barrier, a legal exposure) outrank a frequency-based tier
— e.g. a low-frequency accessibility barrier can still outrank a
high-frequency cosmetic complaint. It is not a way to bump a tier
because a stakeholder would prefer a different number.
"""


@dataclass
class SeverityResult:
    tier: str  # "Critical" | "Notable" | "Minor"
    within_band_frequency_pct: float
    unaffected_band_frequency_pct: float
    overall_frequency_pct: float
    reasoning: str
    computed_tier: str  # the tier the frequency/skew heuristic alone produced
    override_reason: str | None = None  # None unless an override was applied


def severity_tier(affected_band_theme_count: int, affected_band_n: int,
                   unaffected_band_theme_count: int, unaffected_band_n: int,
                   critical_within_band_threshold: float = 0.50,
                   override: str | None = None) -> SeverityResult:
    """
    Computes a theme's severity tier from raw counts — this is the exact
    logic described in feedback-synthesizer's Step 4, made deterministic
    so tiering doesn't depend on an LLM eyeballing percentages correctly.

    `affected_band_*` = the score band you're investigating (e.g.
    respondents who scored <= 5).
    `unaffected_band_*` = everyone else.

    The frequency/skew heuristic below is a default, not a law: pass
    `override` (one of VALID_OVERRIDE_REASONS) to force the result to
    "Critical" regardless of what the heuristic computes — e.g. a
    low-frequency accessibility barrier that the frequency math alone
    would tier as "Minor." `computed_tier` on the result always reports
    what the heuristic actually produced, so an override is never silent
    — state both the computed tier and the override reason in synthesis
    output, never just the final label.
    """
    if affected_band_n == 0:
        raise ValueError("affected_band_n must be > 0")
    if override is not None and override not in VALID_OVERRIDE_REASONS:
        raise ValueError(
            f"'{override}' isn't a recognized override reason. Valid: "
            f"{VALID_OVERRIDE_REASONS}. An override exists for a "
            f"legitimate outside consideration, not stakeholder "
            f"preference — if none of these reasons apply, don't "
            f"override the computed tier."
        )

    within_band_pct = affected_band_theme_count / affected_band_n * 100
    unaffected_pct = (unaffected_band_theme_count / unaffected_band_n * 100
                       if unaffected_band_n > 0 else 0.0)
    total_theme_count = affected_band_theme_count + unaffected_band_theme_count
    total_n = affected_band_n + unaffected_band_n
    overall_pct = total_theme_count / total_n * 100 if total_n > 0 else 0.0

    high_within_band = (within_band_pct / 100) >= critical_within_band_threshold
    clear_skew = within_band_pct > unaffected_pct * 1.5 or (unaffected_pct == 0 and within_band_pct > 0)

    if high_within_band and clear_skew:
        computed_tier = "Critical"
        reasoning = (f"{within_band_pct:.0f}% of the affected band mentioned this "
                     f"(>= {critical_within_band_threshold*100:.0f}% threshold) and it's "
                     f"clearly skewed vs. the unaffected band ({unaffected_pct:.0f}%), "
                     f"even though overall frequency is only {overall_pct:.0f}%.")
    elif high_within_band or clear_skew:
        computed_tier = "Notable"
        reasoning = (f"Meets one of two Critical conditions, not both — "
                     f"within-band {within_band_pct:.0f}%, unaffected-band {unaffected_pct:.0f}%, "
                     f"overall {overall_pct:.0f}%.")
    else:
        computed_tier = "Minor"
        reasoning = (f"Low within-band frequency ({within_band_pct:.0f}%) with no "
                     f"meaningful skew vs. unaffected band ({unaffected_pct:.0f}%).")

    final_tier = computed_tier
    if override is not None and computed_tier != "Critical":
        final_tier = "Critical"
        reasoning = (f"{reasoning} Overridden to Critical: {override.replace('_', ' ')} "
                     f"outranks the frequency-based tier.")

    return SeverityResult(
        tier=final_tier,
        within_band_frequency_pct=within_band_pct,
        unaffected_band_frequency_pct=unaffected_pct,
        overall_frequency_pct=overall_pct,
        reasoning=reasoning,
        computed_tier=computed_tier,
        override_reason=override,
    )


# ---------------------------------------------------------------------------
# Synthesis artifact validation
# ---------------------------------------------------------------------------

_REQUIRED_SYNTHESIS_FIELDS = [
    "study", "product", "instrument", "n", "score", "significance",
    "low_confidence_flag", "themes", "cross_references",
    "evidence_confidence", "alternative_explanations", "cannot_determine",
]


def validate_synthesis(synthesis: dict) -> list[str]:
    """
    Checks a feedback-synthesizer output (the dict that would become
    02-synthesis.json) for required top-level fields and for the two
    enumerated values (evidence_confidence, and each theme's
    claim_strength/severity tier) actually being one of the allowed
    options. Returns a list of problem strings — empty means valid.

    This is structural, like survey-architect's validate_survey_spec: it
    can catch a missing field or an invalid enum value, but it can't
    judge whether the *content* is right (whether a theme's severity
    should really be Critical, whether the alternative explanations are
    the real ones). That's still your judgment call.
    """
    problems = [f for f in _REQUIRED_SYNTHESIS_FIELDS if f not in synthesis]

    ec = synthesis.get("evidence_confidence")
    if ec is not None:
        level = ec.get("overall") if isinstance(ec, dict) else ec
        if level not in EVIDENCE_CONFIDENCE_LEVELS:
            problems.append(
                f"evidence_confidence '{level}' not one of {EVIDENCE_CONFIDENCE_LEVELS}"
            )

    for theme in synthesis.get("themes", []):
        tier = (theme.get("severity") or {}).get("tier")
        if tier is not None and tier not in SEVERITY_TIERS:
            problems.append(
                f"theme '{theme.get('id', '?')}' severity tier '{tier}' not one of {SEVERITY_TIERS}"
            )
        claim_strength = theme.get("claim_strength")
        if claim_strength is not None and claim_strength not in CLAIM_STRENGTH_LEVELS:
            problems.append(
                f"theme '{theme.get('id', '?')}' claim_strength '{claim_strength}' "
                f"not one of {CLAIM_STRENGTH_LEVELS}"
            )

    return problems

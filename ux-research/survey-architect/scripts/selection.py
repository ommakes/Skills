"""
selection.py — deterministic parts of survey-architect: instrument
lookup, sample-size floor, and output-spec validation.

What's NOT in here, on purpose: classifying a requester's freeform
answers into a decision_type ("is this task-level or relationship-
level?") is judgment, not arithmetic — that stays in SKILL.md's Step 0
intake, done by whoever's running the skill. This module starts *after*
that classification: given a clean decision_type, return the instrument
deterministically, so the same decision_type never accidentally maps to
a different instrument on a different run.

Sample sizes here are MeasuringU's published rule-of-thumb bands (see
survey-architect Step 2), not a computed power analysis. A true power
calculation needs an effect size and alpha/power assumptions a requester
usually can't supply at intake time — building one anyway would imply a
precision the field's own guidance doesn't claim. If you need an actual
power analysis for a specific comparison, that's a separate ask with its
own inputs, not something this lookup should fake.
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import Optional


@dataclass
class InstrumentChoice:
    instrument: str
    item_count: int
    has_external_benchmark: bool
    notes: str


_DECISION_TABLE: dict[str, InstrumentChoice] = {
    "task_completion": InstrumentChoice(
        "SEQ", 1, True, "Single task, mid-test. Benchmark ~5.5 (7-pt scale)."
    ),
    "product_usability_full": InstrumentChoice(
        "SUS", 10, True, "Full session, post-study. Benchmark mean 68 (SD 12.5)."
    ),
    "product_usability_lite": InstrumentChoice(
        "UMUX-Lite", 2, True, "Full session, tight item budget. Predicts SUS within ~1%."
    ),
    "website_relationship_benchmark": InstrumentChoice(
        "SUPR-Q", 8, True, "Website/app relationship. Raw score, not a percentile, "
        "unless you have MeasuringU's licensed norms."
    ),
    "relationship_loyalty": InstrumentChoice(
        "NPS", 1, True, "Relationship, quarterly+. No universal cutoff — track your own trend."
    ),
    "transactional_satisfaction": InstrumentChoice(
        "CSAT", 1, True, "Single touchpoint. State top-two-box vs. mean up front."
    ),
    "transactional_effort": InstrumentChoice(
        "CES", 1, True, "Support/self-serve interaction. Use CES 2.0 (7-pt) wording."
    ),
    "diagnostic_subscales": InstrumentChoice(
        "PSSUQ", 16, True, "Post-study, need Usefulness/Info/Interface subscales."
    ),
    "adoption_prediction": InstrumentChoice(
        "TAM", 12, True, "Pre-launch. Asks likelihood, not agreement — different framing."
    ),
    "adoption_prediction_lite": InstrumentChoice(
        "UMUX-Lite (as mini-TAM)", 2, True, "Pre-launch, tight budget."
    ),
}


def select_instrument(decision_type: str) -> InstrumentChoice:
    """
    Look up the instrument for a decision_type already classified during
    intake. Raises ValueError (not a silent default) if decision_type
    doesn't match anything — that's the signal to build a custom item
    set and flag that it has no external benchmark, per Step 1.
    """
    if decision_type not in _DECISION_TABLE:
        raise ValueError(
            f"'{decision_type}' doesn't match a known instrument. Build a "
            f"custom item set and flag explicitly that it has no external "
            f"benchmark — do not force it into the nearest table row."
        )
    return _DECISION_TABLE[decision_type]


@dataclass
class SampleSizeGuidance:
    recommended_n: int
    purpose: str
    source_note: str


_SAMPLE_SIZE_TABLE: dict[str, SampleSizeGuidance] = {
    "rough_benchmark": SampleSizeGuidance(
        20, "rough_benchmark",
        "~±8 pt SUS margin (or equivalent) at 90% confidence (MeasuringU rule of thumb)."
    ),
    "compare_two_conditions_between": SampleSizeGuidance(
        213, "compare_two_conditions_between",
        "Between-subjects, to detect a 12% difference at 90% confidence / 80% power."
    ),
    "compare_two_conditions_within": SampleSizeGuidance(
        93, "compare_two_conditions_within",
        "Within-subjects (same respondents both conditions), same 12%/90%/80% target."
    ),
    "ongoing_tracking": SampleSizeGuidance(
        30, "ongoing_tracking",
        "Floor for a stable per-wave estimate in a longitudinal benchmark series."
    ),
}


def required_sample_size(purpose: str) -> SampleSizeGuidance:
    """
    Look up the sample-size floor for a stated purpose. This is a rule-
    of-thumb lookup, not a computed power analysis — see module
    docstring. Raises ValueError on an unrecognized purpose rather than
    guessing a number.
    """
    if purpose not in _SAMPLE_SIZE_TABLE:
        raise ValueError(
            f"'{purpose}' isn't a recognized sample-size purpose. Valid: "
            f"{list(_SAMPLE_SIZE_TABLE.keys())}"
        )
    return _SAMPLE_SIZE_TABLE[purpose]


_REQUIRED_SPEC_FIELDS = [
    "study", "product", "instrument", "items", "trigger_event",
    "frequency_cap", "required_n", "scoring_formula",
]


def validate_survey_spec(spec: dict) -> list[str]:
    """
    Checks a survey-architect output spec (the dict that would become
    01-survey-spec.json) for required fields. Returns a list of missing
    field names — empty list means valid. This is a structural check
    only; it doesn't validate that the instrument/items are the RIGHT
    choice, only that the spec is complete enough for
    feedback-synthesizer to consume without guessing.
    """
    return [f for f in _REQUIRED_SPEC_FIELDS if f not in spec]

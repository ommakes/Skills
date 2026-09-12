"""
routing.py — deterministic parts of research-loop: which skill an input
should enter at, and whether a loop-back count has hit the ceiling.

What's NOT in here, on purpose: recognizing that a specific score-drop
kickback is or isn't warranted (the frequency/skew judgment from
feedback-synthesizer, or the "no converging qual signal" judgment from
its Case 3) is a substantive research call, not a routing mechanic. This
module only decides which skill's turn it is and when to stop looping —
it doesn't decide whether a given kickback should have happened.
"""

from __future__ import annotations
from dataclasses import dataclass


def detect_entry_point(
    has_learning_goal: bool,
    has_raw_data: bool,
    has_study_folder: bool,
    has_synthesis_file: bool,
) -> str:
    """
    Mirrors the Entry Detection table in research-loop's SKILL.md.
    `has_study_folder` means /research/<study-name>/ already exists for
    this input (i.e. survey-architect already ran for it at some point).

    A finished synthesis file always routes to the reporter, even if a
    learning goal or raw data is also present in the conversation — the
    synthesis file is the most-progressed artifact and takes priority.

    A vague/no-signal input (none of the flags set) defaults to
    survey-architect — its own Step 0 intake is what clarifies a vague
    ask, not this router.
    """
    if has_synthesis_file:
        return "research-reporter"
    if has_raw_data and has_study_folder:
        return "feedback-synthesizer-loaded"
    if has_raw_data and not has_study_folder:
        return "feedback-synthesizer-standalone"
    if has_learning_goal:
        return "survey-architect"
    return "survey-architect"  # vague ask — Step 0 intake will clarify


@dataclass
class LoopbackDecision:
    should_escalate: bool
    loopback_count: int
    max_loopbacks: int
    reasoning: str


def should_escalate_to_researcher(loopback_count: int, max_loopbacks: int = 2) -> LoopbackDecision:
    """
    Decides whether the NEXT loop-back should actually happen, or
    whether the loop has already used its budget and should surface the
    trade-off to the researcher instead.

    `loopback_count` = how many loop-backs have already completed for
    this study. Escalate (stop looping, ask the researcher) once that
    count has reached max_loopbacks — i.e. a 3rd loop-back, by default,
    never runs automatically.
    """
    escalate = loopback_count >= max_loopbacks
    reasoning = (
        f"{loopback_count} loop-back(s) already used against a max of "
        f"{max_loopbacks} — {'stop and surface to researcher' if escalate else 'proceed with the next loop-back'}."
    )
    return LoopbackDecision(
        should_escalate=escalate,
        loopback_count=loopback_count,
        max_loopbacks=max_loopbacks,
        reasoning=reasoning,
    )


def study_dir(study_name: str) -> str:
    """Standard path for a study's handoff files."""
    return f"/research/{study_name}/"


def benchmark_path(product: str) -> str:
    """Standard path for a product's longitudinal benchmark file."""
    return f"/research/_benchmarks/{product}.md"

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
from dataclasses import dataclass, field
import json
import os


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


def study_dir(study_name: str, research_root: str = "/research") -> str:
    """Standard path for a study's handoff files. `research_root` comes
    from ../config/product-context.yaml — the default here matches that
    file's shipped value, but the config file is the source of truth."""
    return f"{research_root}/{study_name}/"


def benchmark_path(product: str, benchmarks_root: str = "/research/_benchmarks") -> str:
    """Standard path for a product's longitudinal benchmark file.
    `benchmarks_root` comes from ../config/product-context.yaml, same
    note as study_dir() above."""
    return f"{benchmarks_root}/{product}.md"


# ---------------------------------------------------------------------------
# Explicit per-study state
#
# detect_entry_point() above infers progress by sniffing which files
# exist — that's still how a cold start (raw data pasted in with no
# state file at all) gets classified. Once a study is underway, this
# state file replaces re-sniffing on every turn: research-loop reads and
# writes one 00-state.json per study instead of re-inferring "what stage
# are we at" from context each time. This is deliberately a flat file +
# a fixed transition graph, not a workflow engine — the graph exists so
# an obviously-wrong jump (INTAKE straight to REPORTING) fails loudly
# instead of quietly happening because the model inferred it was fine.
# ---------------------------------------------------------------------------

STATES = (
    "INTAKE", "SURVEY_DESIGN", "DATA_READY", "SYNTHESIS",
    "SYNTHESIS_REVIEW", "REPORTING", "REPORT_REVIEW", "COMPLETE",
)

_ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "INTAKE": {"SURVEY_DESIGN"},
    "SURVEY_DESIGN": {"DATA_READY", "INTAKE"},
    "DATA_READY": {"SYNTHESIS"},
    "SYNTHESIS": {"SYNTHESIS_REVIEW", "SURVEY_DESIGN"},          # kickback: sample/instrument
    "SYNTHESIS_REVIEW": {"REPORTING", "SYNTHESIS"},               # kickback: re-analysis needed
    "REPORTING": {"REPORT_REVIEW"},
    "REPORT_REVIEW": {"COMPLETE", "SYNTHESIS"},                   # kickback: missing CI/severity
    "COMPLETE": set(),
}


def next_state(current_state: str, target_state: str) -> str:
    """
    Validates a proposed state transition against the fixed graph above.
    Returns `target_state` on success; raises ValueError (naming the
    actually-allowed next states) if the jump isn't one of them. This is
    what catches an accidental skip (e.g. straight from INTAKE to
    REPORTING) before it happens, rather than after.
    """
    if current_state not in STATES:
        raise ValueError(f"'{current_state}' isn't a recognized state. Valid: {STATES}")
    if target_state not in STATES:
        raise ValueError(f"'{target_state}' isn't a recognized state. Valid: {STATES}")
    allowed = _ALLOWED_TRANSITIONS[current_state]
    if target_state not in allowed:
        raise ValueError(
            f"Transition {current_state} -> {target_state} isn't allowed. "
            f"From {current_state}, valid next states are: "
            f"{sorted(allowed) if allowed else '(none — this is a terminal state)'}"
        )
    return target_state


def state_file_path(study_dir_path: str) -> str:
    """Standard path for a study's state file, given its study_dir()."""
    return os.path.join(study_dir_path, "00-state.json")


def write_state(study_dir_path: str, state: dict) -> str:
    """
    Writes `state` to <study_dir_path>/00-state.json, creating the
    directory if needed. Returns the path written. Expected shape:
    `study_id`, `state` (one of STATES), `loopbacks` ({total, max}),
    `artifacts` (artifact-name -> path), `validation`
    (artifact-name -> "valid" | list of problems).
    """
    os.makedirs(study_dir_path, exist_ok=True)
    path = state_file_path(study_dir_path)
    with open(path, "w") as f:
        json.dump(state, f, indent=2)
    return path


def read_state(study_dir_path: str) -> dict | None:
    """Reads a study's state file. Returns None if it doesn't exist yet
    (a study that hasn't started, or a cold start via detect_entry_point
    instead)."""
    path = state_file_path(study_dir_path)
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Benchmark validation and comparability
# ---------------------------------------------------------------------------

_REQUIRED_BENCHMARK_FIELDS = [
    "instrument", "wording_version", "scale", "population",
    "sampling_method", "trigger", "n",
]


def validate_benchmark(entry: dict) -> list[str]:
    """
    Checks one /research/_benchmarks/<product>.md wave entry (the dict
    form, before it's rendered to the markdown log) for the fields
    check_benchmark_comparability needs to do its job. Returns a list of
    missing field names — empty means valid.
    """
    return [f for f in _REQUIRED_BENCHMARK_FIELDS if f not in entry]


_COMPARABILITY_FIELDS = [
    "instrument", "wording_version", "scale", "population",
    "sampling_method", "trigger",
]


@dataclass
class ComparabilityResult:
    comparable: bool
    mismatched_fields: list[str] = field(default_factory=list)


def check_benchmark_comparability(current: dict, previous: dict) -> ComparabilityResult:
    """
    Compares two benchmark wave entries' measurement conditions before
    letting feedback-synthesizer or research-reporter treat them as two
    points on the same trend line. A mismatch on instrument, wording
    version, scale, target population, sampling method, or trigger means
    a score movement between the two waves could be a measurement
    artifact rather than a real change — report the waves side by side
    instead of implying a trend when `comparable` is False.

    Suppression/frequency-cap differences are deliberately NOT checked
    here — they affect who gets asked, not what's being measured. Note
    them as context if relevant, but don't block comparability on them
    alone.
    """
    mismatched = [f for f in _COMPARABILITY_FIELDS if current.get(f) != previous.get(f)]
    return ComparabilityResult(comparable=len(mismatched) == 0, mismatched_fields=mismatched)

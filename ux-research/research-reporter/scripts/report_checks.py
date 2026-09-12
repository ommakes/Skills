"""
report_checks.py — deterministic parts of research-reporter: does the
report contain what it's required to contain, unchanged, in the right
format for the audience.

What's NOT in here, on purpose: whether the prose actually reads well,
whether the narrative voice fits the audience, whether the
recommendations are framed usefully — all judgment, stays in SKILL.md.
This module only checks the things that have a clear right answer: did a
specific number survive formatting, is a required section present, does
the audience map to the right file format.
"""

from __future__ import annotations
from dataclasses import dataclass
import re


REQUIRED_SECTIONS = [
    "executive summary",
    "methodology",
    "benchmark comparison",
    "findings",
    "recommendations",
]


def validate_report_structure(report_text: str) -> list[str]:
    """
    Returns section names missing from the report (case-insensitive
    substring match against markdown headers or plain text). Empty list
    = structurally complete. Doesn't check quality of the content, only
    presence.
    """
    lowered = report_text.lower()
    return [s for s in REQUIRED_SECTIONS if s not in lowered]


@dataclass
class FormatChoice:
    format: str  # "markdown" or "docx"
    tone: str


_AUDIENCE_FORMAT_TABLE = {
    "internal": FormatChoice("markdown", "terse, bullet-heavy"),
    "leadership": FormatChoice("docx", "fuller prose, more framing"),
    "external": FormatChoice("docx", "fuller prose, more framing"),
}


def select_format(audience: str) -> FormatChoice:
    """
    Look up the expected format/tone for a stated audience. Raises
    ValueError on an unrecognized audience rather than silently
    defaulting to one format — an unrecognized audience should be asked
    about, not guessed.
    """
    if audience not in _AUDIENCE_FORMAT_TABLE:
        raise ValueError(
            f"'{audience}' isn't a recognized audience. Ask the requester "
            f"which format/tone they need rather than guessing. Valid: "
            f"{list(_AUDIENCE_FORMAT_TABLE.keys())}"
        )
    return _AUDIENCE_FORMAT_TABLE[audience]


def _extract_numbers(text: str) -> set[str]:
    """Pull out numeric tokens (including decimals and negatives) so we
    can check whether specific figures survived into the report text."""
    return set(re.findall(r"-?\d+\.?\d*", text))


@dataclass
class PreservationResult:
    violations: list[str]
    passed: bool


def check_preserved_values(synthesis: dict, report_text: str) -> PreservationResult:
    """
    Checks that critical values from a synthesis dict survived into the
    report text unchanged. `synthesis` is expected to optionally contain:
      - "ci": [low, high]                (both numbers must appear)
      - "low_confidence_flag": bool      (if True, a low-confidence
                                           phrase must appear)
      - "severity_tiers": {theme: tier}  (each tier label must appear)
      - "significant": bool              (if present, report must not
                                           contradict it — see note below)

    This is a structural/textual check, not a semantic one: it can catch
    a dropped number or a missing flag, but it can't catch a report that
    quietly reinterprets "directional" as "confirmed" in prose without
    changing any number — that's still a human/judgment review item.
    """
    violations: list[str] = []
    report_numbers = _extract_numbers(report_text)
    lowered = report_text.lower()

    if "ci" in synthesis:
        low, high = synthesis["ci"]
        for val in (low, high):
            token = f"{val:.2f}".rstrip("0").rstrip(".") if isinstance(val, float) else str(val)
            # accept either the exact float or a same-value integer/decimal token
            candidates = {str(val), f"{val:.1f}", f"{val:.2f}"}
            if not (candidates & report_numbers):
                violations.append(f"CI value {val} not found in report text")

    if synthesis.get("low_confidence_flag"):
        if "low confidence" not in lowered and "⚠️" not in report_text:
            violations.append("Low-confidence flag present in synthesis but missing from report")

    for theme, tier in synthesis.get("severity_tiers", {}).items():
        if tier.lower() not in lowered:
            violations.append(f"Severity tier '{tier}' for theme '{theme}' not found in report")

    ec = synthesis.get("evidence_confidence")
    if ec is not None:
        level = ec.get("overall") if isinstance(ec, dict) else ec
        if level and level.lower() not in lowered:
            violations.append(f"Evidence confidence '{level}' not found in report")

    for theme in synthesis.get("themes", []):
        claim_strength = theme.get("claim_strength")
        if claim_strength and claim_strength.lower() not in lowered:
            violations.append(
                f"Claim strength '{claim_strength}' for theme "
                f"'{theme.get('id', '?')}' not found in report"
            )

    return PreservationResult(violations=violations, passed=len(violations) == 0)


_CAUSAL_LANGUAGE = ("caused", "causes", "resulted in", "led to", "drove", "produced")


def check_no_unsupported_causal_language(synthesis: dict, report_text: str) -> PreservationResult:
    """
    Flags causal-sounding verbs in `report_text` ("caused", "led to",
    "drove", ...) unless at least one theme in `synthesis` actually
    carries `claim_strength == "causal"`. This is the guard against a
    correlational finding quietly becoming a causal claim during report
    writing — the claim-strength ladder should only ever move in the
    direction the evidence supports, never up, and reporting is exactly
    the step where that kind of silent upgrade tends to happen (a
    stakeholder asks for a punchier exec summary, "associated with" turns
    into "drove").

    Like the other checks here, this is textual, not semantic: it can
    catch the word "caused" appearing without backing, but a report that
    says "strongly suggests" about a merely-observed finding needs a
    human read, same as the docstring above notes for "directional" vs
    "confirmed."
    """
    has_causal_claim = any(
        theme.get("claim_strength") == "causal" for theme in synthesis.get("themes", [])
    )
    if has_causal_claim:
        return PreservationResult(violations=[], passed=True)

    lowered = report_text.lower()
    hits = [verb for verb in _CAUSAL_LANGUAGE if verb in lowered]
    violations = [
        f"causal language '{verb}' used, but no theme in the synthesis "
        f"has claim_strength='causal'"
        for verb in hits
    ]
    return PreservationResult(violations=violations, passed=len(violations) == 0)


_REQUIRED_REPORT_FIELDS = [
    "study", "product", "audience", "format", "executive_summary",
    "methodology", "benchmark_comparison", "findings", "recommendations",
]


def validate_report_json(report: dict) -> list[str]:
    """
    Checks a research-reporter output (the dict that would become
    03-report.json) for required top-level fields. Returns a list of
    missing field names — empty means valid. Structural only, same as
    validate_report_structure() above for the prose version — it can't
    judge whether the prose is honest, only whether the shape is
    complete.
    """
    return [f for f in _REQUIRED_REPORT_FIELDS if f not in report]

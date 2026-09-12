# Changelog — UX Research skills

All four skills (`survey-architect`, `feedback-synthesizer`,
`research-reporter`, `research-loop`) are versioned independently; this
file tracks all of them together since they shipped as one system.

## 2026-09-12

### survey-architect 1.1.1

Made the skill product-agnostic. Step 0's intake question named a fixed
list of internal products (Personify, Vois, Righter, Unsoku, Localwolla,
Smileframe, Uslo) as examples of what to ask for — replaced with a
generic instruction to name the product or surface specifically. The
Step 4 output section's "In-app" bullet similarly assumed a
Personify/Vois/Unsoku stack by default; it now describes matching
whatever UI conventions the target product actually uses, with the
vois-tokens/righter routing kept as conditional (only when the target
happens to use the Vois design system) rather than assumed.

No change to instrument selection, sample-size, or output logic — this
is example/framing text only. Eval fixtures across all four skills that
referenced the same named products in example inputs (`qualitative_cases.md`
in each skill, plus one changelog entry above) were swapped to a generic
placeholder product for consistency.

## 2026-09-11

### feedback-synthesizer 1.2.0, survey-architect 1.1.0, research-reporter 1.1.0, research-loop 1.1.0

Added `scripts/` and `evals/` to all four skills:

- **survey-architect** — `scripts/selection.py` (deterministic instrument
  lookup, sample-size floor, output-spec validation) and `evals/` (16
  automated tests + `qualitative_cases.md` covering the instrument-vs-
  requester-phrasing mismatch, intake answers that don't line up, and
  the existing-benchmark-series constraint).
- **feedback-synthesizer** — `scripts/scoring.py` (every instrument's
  scoring formula, confidence intervals, significance testing, and the
  fixed severity-tier logic) and `evals/` (26 automated tests + 4
  qualitative cases).
- **research-reporter** — `scripts/report_checks.py` (audience-format
  lookup, section-completeness check, verbatim-preservation check) and
  `evals/` (11 automated tests + 3 qualitative cases). The skill file
  now explicitly flags that the preservation check can't catch a report
  that keeps every number but still reframes "directional" as
  "confirmed" — that failure mode needs a human read.
- **research-loop** — `scripts/routing.py` (deterministic entry-point
  detection, loop-back ceiling) and `evals/` (12 automated tests + 4
  qualitative cases).

Verified with a fresh read-through of each SKILL.md (not from memory of
writing it) against 6 of the qualitative cases — all passed. Noted
limitation: no subagents available in this environment, so "fresh" means
re-reading the file cold, not an independently spawned model instance.

### feedback-synthesizer 1.1.0

Fixed a real bug found during a synthetic pilot test (simulated
signup-flow SEQ study, n=14): severity tiering measured a theme's
frequency against the whole sample, which diluted a theme that was
mentioned by 75% of low scorers (but only 21% of the full sample) down
to a lower tier than it deserved.

- Severity tier now measures frequency **within the affected score
  band** first, reporting overall % as context only, not as the driver
  of the tier.
- Added an explicit instruction against keyword/string-matching for
  theme coding, after the same pilot test showed a literal search for
  "payment" would have missed a comment describing the same friction
  ("had to re-enter my card info twice") without using that word.

### survey-architect 1.0.0, feedback-synthesizer 1.0.0, research-reporter 1.0.0, research-loop 1.0.0

Initial versions. Architecture decided collaboratively:

- Severity/priority scoring owned by feedback-synthesizer (not
  research-reporter) — it's read the raw data and is best positioned to
  judge urgency.
- Per-study structured handoff files at `/research/<study-name>/`
  (survey-architect writes intake + spec, feedback-synthesizer writes
  synthesis, research-reporter writes the report), plus a running
  per-product longitudinal benchmark at `/research/_benchmarks/<product>.md`.
- research-loop runs as a loop with kickback, not a one-way dispatcher —
  feedback-synthesizer can escalate back to survey-architect when a
  sample is too thin or the instrument doesn't match the stated goal;
  capped at 2 loop-backs before surfacing to the researcher.
- Small samples get flagged loudly and scored anyway, never silently
  reported and never refused outright — escalating to a loop-back only
  when the gap is too large for the qualitative evidence to compensate.
- research-reporter never re-derives scores, themes, or severity, and
  outputs to markdown/Notion (internal) or docx (formal/external),
  chosen per audience.
- survey-architect outputs platform-native deploy-ready files (Qualtrics
  QSF, Typeform JSON, or an in-app spec) rather than a generic text spec.

Validated end-to-end against a synthetic pilot study before shipping
(see feedback-synthesizer 1.1.0 above for what that test found).

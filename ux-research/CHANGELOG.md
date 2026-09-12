# Changelog — UX Research skills

All four skills (`survey-architect`, `feedback-synthesizer`,
`research-reporter`, `research-loop`) are versioned independently; this
file tracks all of them together since they shipped as one system.

## 2026-09-12

### survey-architect 1.2.0, feedback-synthesizer 1.3.0, research-reporter 1.2.0, research-loop 1.2.0

Hardening pass following an external review of the v1 system (see PR
discussion). The review's central recommendation was "make the workflow
more explicit, structured, testable, and machine-readable" rather than
adding more prose — implemented as a scoped subset of its 15
recommendations (Phase 1 + 2 of the resulting plan; qualitative/
adversarial-eval-suite work deferred to a later phase):

**Architecture / portability**
- `config/product-context.yaml` — the product list and research/
  benchmark root paths, previously hardcoded in survey-architect's
  intake, now live in one file so the skill family is portable across
  organizations. `routing.study_dir()`/`benchmark_path()` take these as
  optional overrides (defaults unchanged, so existing callers are
  unaffected).
- `## Rules` sections (replacing "What this skill never does") tag every
  bullet with MUST / MUST NOT / SHOULD / STOP, with the precedence
  legend centralized in `ux-research/README.md` rather than repeated in
  all four files.
- CI (`.github/workflows/ux-research-checks.yml`) now runs all four
  eval suites plus SKILL.md frontmatter validation on every push/PR
  touching `ux-research/**`.

**Canonical JSON contracts**
- `00-intake.json`, `02-synthesis.json`, and `03-report.json` join the
  existing `01-survey-spec.json` as canonical, machine-readable
  artifacts — the `.md` files are now explicitly the human-readable copy
  of the same facts, never an independent source of information.
- New validators: `selection.validate_intake_spec`,
  `scoring.validate_synthesis`, `report_checks.validate_report_json`,
  `routing.validate_benchmark` — same structural-check pattern as the
  existing `validate_survey_spec`/`validate_report_structure`.
- Deliberately *not* done: a separate `schemas/*.schema.json` directory
  with a JSON Schema library dependency. The validators above are the
  single source of truth for required shape, in the same
  dependency-free-Python style as the rest of `scripts/`, to avoid the
  three-way duplication (schema file + validator + SKILL.md prose) the
  review itself warned against.

**Research rigor**
- **Evidence confidence** (`HIGH`/`MEDIUM`/`LOW`/`INSUFFICIENT`,
  `scoring.EVIDENCE_CONFIDENCE_LEVELS`) is now tracked separately from
  any confidence interval — a narrow CI no longer doubles as "the
  conclusion is trustworthy."
- **Claim-strength ladder** (`observed` → `associated` → `correlated` →
  `causal`, `scoring.CLAIM_STRENGTH_LEVELS`) tags every finding.
  `scoring.validate_claim_strength()` raises if `causal` is used without
  an experimental design behind it — a survey/feedback synthesis never
  has one, so this is the enforcement point for never letting
  correlational data quietly become causal language. research-reporter's
  new `report_checks.check_no_unsupported_causal_language()` catches the
  same failure mode surfacing later, in report prose.
- **Severity overrides** — `scoring.severity_tier()` takes an optional
  `override` (one of `VALID_OVERRIDE_REASONS`: safety, accessibility,
  legal_compliance, severe_user_harm, critical_task_blockage) that can
  bump the frequency-based tier to Critical. Always reported alongside
  `computed_tier`, never silently.
- **Alternative explanations / "cannot determine"** — required fields on
  findings above Minor severity, so a single plausible reading of the
  data doesn't stand in as the only one.
- **Multi-pass qualitative coding** — feedback-synthesizer's Step 2 is
  now a 10-step protocol (read everything first → initial codes →
  consistency review → merge/split → candidate themes → actively search
  for disconfirming cases → test against the full dataset → quantify
  only once stable → per-theme coding confidence → cross-reference),
  replacing a single read-and-label pass.
- **Statistical policy centralization** — `DEFAULT_CONFIDENCE_LEVEL` and
  `SMALL_SAMPLE_POLICY` are now named constants in `scoring.py`
  (previously the same 0.90 value was a literal default on three
  separate functions). research-reporter's SKILL.md now explicitly
  distinguishes statistical significance, practical significance, and
  evidence confidence as three separate questions.
- **Benchmark comparability** — `routing.check_benchmark_comparability()`
  compares instrument/wording-version/scale/population/sampling-method/
  trigger between two waves before a trend line is allowed; research-
  reporter reports incomparable waves side by side instead.

**State**
- research-loop maintains an explicit per-study `00-state.json`
  (`routing.STATES`, `read_state`/`write_state`/`next_state` against a
  fixed transition graph) once a study is underway, replacing repeated
  file-existence sniffing on every turn. `detect_entry_point` remains
  the cold-start path for a study with no state file yet. This is
  deliberately a flat file plus a small graph, not a workflow engine —
  the review's own "don't over-engineer the state machine" guidance was
  followed by keeping it to 8 states and 3 kickback edges rather than a
  fully general one.

Deferred to a later pass (the review's Phase 3): formal adversarial eval
suites per skill (the "just call this significant," "make the summary
more upbeat," "remove the outliers" class of cases) and CI running the
qualitative cases via a model-graded harness — this repo has no such
harness yet, so those cases stay human/fresh-model-reviewed, same as
before.

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

Fixed a real bug found during a synthetic pilot test (simulated Unsoku
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

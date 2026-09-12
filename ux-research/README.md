# UX Research

Four skills that work together as a research team — programming surveys,
synthesizing quant + qual feedback, and writing stakeholder reports —
plus a router that orchestrates the loop between them. Each skill also
works standalone.

## Install

```
npx skills add ommakes/Skills/ux-research/survey-architect
npx skills add ommakes/Skills/ux-research/feedback-synthesizer
npx skills add ommakes/Skills/ux-research/research-reporter
npx skills add ommakes/Skills/ux-research/research-loop
```

## The loop

```
research-loop (orchestrator — entry detection, file structure, kickbacks)
    │
    ├─ survey-architect     → intake → instrument selection → sample size → deploy-ready spec
    │                          (SEQ, SUS, UMUX-Lite, SUPR-Q, NPS, CSAT, CES, PSSUQ, or custom)
    │
    ├─ feedback-synthesizer → scores + confidence intervals + significance testing
    │                          + qualitative theme coding + severity tiers, cross-referenced
    │
    └─ research-reporter    → audience-formatted report (internal markdown/Notion,
                               formal docx), never re-deriving synthesizer's numbers
```

Unlike a one-way pipeline, the loop can push back on itself:
feedback-synthesizer can kick back to survey-architect when a sample is
too thin or the wrong instrument was used for the stated goal, and
research-reporter kicks back to feedback-synthesizer rather than
inventing a missing confidence interval or severity tier. Max 2
loop-backs per study before it surfaces the trade-off to you instead of
spinning.

### Survey Architect

Turns "I need to know something about users" into a specific, validated,
platform-deploy-ready survey. Opens with an intake (product, decision,
where it sits in the user's experience) before ever picking an
instrument — the wrong instrument answers a question nobody asked.

**Use when:** starting a new research question, before any data exists.

Bundles `scripts/selection.py` for the deterministic instrument lookup,
sample-size floor, and output-spec validation, plus `evals/` for
regression testing.

→ [`survey-architect/`](./survey-architect)

### Feedback Synthesizer

Turns raw scores + open-text comments into one connected finding, not
two separate reports that happen to share a doc. Runs real confidence
intervals and significance testing (never eyeballed), codes qualitative
themes by judgment (not keyword matching), and owns severity/priority
scoring — cross-referencing which themes actually drive low scores
rather than reporting scores and comments side by side.

**Use when:** raw survey results or a pile of feedback exists and needs
turning into findings. Works standalone — doesn't require
survey-architect to have run first.

Bundles `scripts/scoring.py` for every instrument's scoring formula, CI,
and significance test, plus `evals/` — including a regression test that
locks in a real bug found during testing (severity tiering diluted by
whole-sample frequency instead of frequency within the affected score
band).

→ [`feedback-synthesizer/`](./feedback-synthesizer)

### Research Reporter

Turns a synthesis into something a stakeholder actually reads and acts
on — audience-formatted, but never re-scoring, re-testing, or
softening a caveat feedback-synthesizer already established.

**Use when:** synthesis is done and needs turning into something
shareable.

Bundles `scripts/report_checks.py` for audience-format lookup, section
completeness, and verbatim-preservation checks — flagged explicitly in
the skill itself: these checks can prove a number wasn't dropped, but
can't catch a report that keeps every number and still reframes
"directional" as "confirmed" in prose. That still needs a human read.

→ [`research-reporter/`](./research-reporter)

### Research Loop

The orchestrator. Detects which skill an input should enter at, manages
the per-study file structure and the per-product longitudinal benchmark,
and enforces the loop-back ceiling.

**Use when:** starting any UX research task — this is the entry point,
not the three skills directly, unless you already know exactly which
one you need.

Bundles `scripts/routing.py` for deterministic entry detection and the
loop-back ceiling, plus `evals/`.

→ [`research-loop/`](./research-loop)

## File structure this system maintains

```
/research/<study-name>/
  00-intake.md            — product, learning goal, instrument decision
  01-survey-spec.json     — deploy-ready spec: items, scoring, n, triggers
  02-synthesis.md          — scores, CIs, significance, themes, severity
  03-report-internal.md    — internal-audience report
  03-report-formal.docx    — formal-audience report, if requested

/research/_benchmarks/<product>.md
  — running log: date, instrument, score, CI, n, per wave
  — running qualitative theme taxonomy for the product
```

## Testing

Each skill's `evals/test_*.py` is a dependency-free (beyond `scipy` for
feedback-synthesizer's stats) `unittest` suite covering the
deterministic parts — instrument lookups, scoring formulas, confidence
intervals, severity tiering, entry-point routing. Run after touching the
matching `scripts/*.py`:

```
cd ux-research/<skill-name>
python3 -m unittest discover -s evals -v
```

Each skill's `evals/qualitative_cases.md` covers the judgment calls a
fixed assertion can't grade (theme coding without keyword shortcuts,
when a thin sample should kick back vs. just get flagged, refusing to
manufacture a narrative for an unexplained score movement). These need a
human or a fresh model run to check, not a test runner — see each
skill's file for the specific cases and their fail conditions.

No CI wired up yet; run manually after edits. See
[`CHANGELOG.md`](./CHANGELOG.md) for version history across all four
skills.

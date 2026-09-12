---
name: research-loop
version: 1.1.0
author: Personify Labs
description: >
  Orchestrates survey-architect, feedback-synthesizer, and research-reporter
  as an iterative research loop — not a one-way pipeline. Detects when a
  downstream skill can't proceed cleanly (data too thin to trust, wrong
  instrument for the stated goal) and routes back upstream instead of
  producing a shaky output. Maintains the per-study file structure at
  /research/<study-name>/ and the per-product longitudinal benchmark at
  /research/_benchmarks/<product>.md. Use this as the single entry point
  for any UX research task — a new study, raw data to make sense of, or a
  report to write — rather than calling the three skills directly. Trigger
  when someone starts a new research study, pastes raw feedback/survey
  data without a study already in motion, or asks to "run the research
  loop." Bundles scripts/routing.py for deterministic entry detection and
  the loop-back ceiling (run it, don't count loop-backs by hand) and
  evals/ for regression testing.
tags:
  - user-research
  - ux-research
  - orchestration
  - router
license: CC-BY 4.0
---

# Research Loop

Runs survey-architect, feedback-synthesizer, and research-reporter as a
loop that behaves like an actual research team: someone can say "that
sample's too small, we need more data" and send it back, rather than
quietly writing up a shaky number.

Each of the three skills works standalone. This skill exists for the
handoffs between them and the file structure that lets a later skill (or
a later *study*) pick up where an earlier one left off.

-----

## The loop at a glance

```
Entry detection
    ↓
survey-architect (intake → instrument → sample size → deploy-ready spec)
    ↓
 [ pause: wait for data collection ]
    ↓
feedback-synthesizer (score + CI + significance + theme + severity)
    ↑___________kick back if n insufficient for stated goal_______|
    ↓
research-reporter (audience-formatted output)
```

Max loop-backs: 2 per study. If a second kickback doesn't resolve it,
surface the trade-off to the researcher rather than looping a third time.

-----

## Entry detection

**Run `scripts/routing.py`'s `detect_entry_point(...)`** rather than
eyeballing the table below — pass whether a learning goal, raw data, an
existing study folder, and a synthesis file are present, and use its
return value. The table is here to show the reasoning, not to be
hand-matched each time:

| What's pasted / asked | Entry point |
|---|---|
| A research question, no data yet ("I need to know if X is usable") | survey-architect |
| Raw survey results / CSV / feedback pile, no study folder exists yet | feedback-synthesizer (standalone mode — no spec file to read) |
| Raw data + an existing `/research/<study-name>/` folder | feedback-synthesizer (loaded mode — reads the spec) |
| A finished `02-synthesis.md` and a request to write something up | research-reporter |
| "Run the research loop" with a vague ask | Start at survey-architect Step 0 (intake) — let intake clarify |

A finished synthesis file always wins the routing decision, even if a
learning goal or raw data is also present — it's the most-progressed
artifact for that study. Don't force every input through all three
stages: a pile of app store reviews with no survey behind it goes
straight to feedback-synthesizer in standalone mode, full stop — this
is a common failure mode worth guarding against explicitly (see
qualitative_cases.md Case 1).

-----

## File structure

```
/research/<study-name>/
  00-intake.md          — product, learning goal, instrument decision (survey-architect)
  01-survey-spec.json   — deploy-ready spec: items, scoring, n, triggers (survey-architect)
  02-synthesis.md        — scores, CIs, significance, themes, severity (feedback-synthesizer)
  03-report-internal.md  — internal-audience report (research-reporter)
  03-report-formal.docx  — formal-audience report, if requested (research-reporter)

/research/_benchmarks/<product>.md
  — running log: date, instrument, score, CI, n, per wave
  — running qual theme taxonomy for the product
```

Every skill reads what exists before assuming it needs to build it. If
`00-intake.md` already answers a question a skill would otherwise ask
the researcher, use it — don't re-ask.

-----

## Loop state

Print this at every handoff so the researcher can see where things stand:

```
━━ Research Loop State ━━━━━━━━━━━━━━━━━━━━
Study:         [study-name]
Product:       [product, from intake]
Learning goal: [one line, from intake]

Stage:
  ✓ survey-architect    instrument: [X], n required: [Y]
  ● feedback-synthesizer   in progress
  ○ research-reporter      pending

Kickbacks:     [none | count + reason]
Confidence:    [none flagged | LOW — n=X vs required Y]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

-----

## Kickback conditions

A kickback is any point where a downstream skill cannot honestly proceed
without an upstream decision changing.

**feedback-synthesizer → survey-architect:**
Sample size is so far below the required floor that the stated learning
goal genuinely can't be answered (not just "flag and proceed" — that's
the normal small-n handling inside synthesizer itself; this is the
escalated case where the gap is too large to paper over with a wider CI).
Kick back with: current n, required n, and a recommendation (extend
collection window, widen distribution, or accept a narrower claim than
originally scoped).

**feedback-synthesizer → survey-architect (instrument mismatch):**
The data doesn't actually support the learning goal the intake recorded
— e.g., a single NPS item was collected but the real question was about
task-level usability. Kick back with what instrument should have been
used, so the next wave corrects it.

**research-reporter → feedback-synthesizer:**
The synthesis file is missing something the report structure requires
(no severity tiers, no CI on a headline score) — this should be rare if
synthesizer followed its own spec, but the reporter should never
backfill or invent a missing CI/severity itself.

Output format for any kickback:

```
━━ Kickback ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
From:   [skill]
To:     [skill]
Reason: [one sentence]
What changes: [what the upstream skill should do differently this time]
Loop-back count: [N of 2 max]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

-----

## Max loop-backs

**Run `scripts/routing.py`'s `should_escalate_to_researcher(loopback_count)`**
before attempting another loop-back — don't just count in your head.
If it returns `should_escalate=True` (2 loop-backs already used):

> "Two loop-backs on [issue] without resolving it. Here's where things
> stand: [current state]. Options: A — accept the limitation and report
> it as a caveat, B — pause the study and revisit scope. Which do you
> want?"

Don't attempt a third loop-back without the researcher's input.

-----

## Modes

**Gated (default):** pause at each stage transition and each kickback
for confirmation. Use for a new study or an unfamiliar product.

**Fast:** run straight through, noting any kickbacks in the final
summary rather than pausing on them. Opt in with "fast mode" or "just
run it."

-----

## Loop completion block

```
━━ Research Loop Complete ━━━━━━━━━━━━━━━━━
Study:          [study-name]
Product:        [product]
Instrument:     [instrument used]
n:              [final n]  Confidence: [flagged / not flagged]

Headline result: [score + CI, one line]
vs. benchmark:   [trend direction, from _benchmarks file]

Top findings:    [Critical-tier items, one line each]
Kickbacks:       [none | list with reason]

Outputs:
  Internal report: [path]
  Formal report:   [path, if generated]
  Benchmark file:  updated at /research/_benchmarks/<product>.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

-----

## What this skill never does

- Forces standalone feedback (no survey behind it) through survey-architect first
- Treats a synthesizer small-n flag as an automatic kickback — that's
  normal handling inside synthesizer; only an unanswerable-goal gap
  escalates to a loop kickback
- Loops back more than twice without surfacing to the researcher
- Skips writing to `/research/_benchmarks/<product>.md` after a
  completed synthesis
- Lets research-reporter fill in a missing CI or severity tier itself
  instead of kicking back to synthesizer
- Re-runs survey-architect's intake if `00-intake.md` already answers
  the same questions

-----

## Quick reference

| Input | Entry point |
|---|---|
| New research question, no data | survey-architect |
| Raw data, no study folder | feedback-synthesizer (standalone) |
| Raw data, study folder exists | feedback-synthesizer (loaded) |
| Synthesis done, need a writeup | research-reporter |
| Synthesizer: n too low for the goal | Kick back to survey-architect |
| Synthesizer: wrong instrument for the goal | Kick back to survey-architect |
| Reporter: synthesis missing CI/severity | Kick back to feedback-synthesizer |
| 2 kickbacks, still unresolved | Surface to researcher, stop |
| Loop complete | Completion block, update benchmark file |

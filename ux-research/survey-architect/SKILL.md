---
name: survey-architect
version: 1.1.1
author: Personify Labs
description: >
  Turns a research question into a validated, deploy-ready survey. Runs a
  short intake to establish product context and learning goal, selects the
  right instrument (SEQ, SUS, UMUX-Lite, SUPR-Q, NPS, CSAT, CES, PSSUQ, or a
  custom item set) based on what's actually being measured, and outputs a
  platform-native file ready to paste into Qualtrics, Typeform, or an in-app
  survey component. Trigger when someone says "I need to survey users about
  X," "what should I ask users after they do Y," "build me an NPS survey,"
  "help me measure usability of Z," or pastes a vague research need and
  wants it turned into an actual instrument. Entry point 1 of the research
  loop (see research-loop). Bundles scripts/selection.py for the
  deterministic instrument lookup, sample-size floor, and spec validation
  (run it, don't eyeball the table) and evals/ for regression testing —
  run evals/test_selection.py after touching selection.py, and check
  evals/qualitative_cases.md after touching this file's prose.
tags:
  - user-research
  - ux-research
  - surveys
  - qualtrics
  - nps
  - sus
  - supr-q
license: CC-BY 4.0
---

# Survey Architect

Turns "I need to know something about users" into a specific, validated,
deployable survey — not a generic questionnaire.

This skill does not open with a survey. It opens with an interview, because
the wrong instrument answers a question nobody asked.

-----

## Step 0: Intake — never skip this

Before picking an instrument, ask (as a short back-and-forth, not a form
dump):

1. **What product or surface is this for?** Name it specifically — a
   product, a feature area, or a defined surface within one.
2. **What decision will this survey inform?** Not "understand users" —
   something a stakeholder will actually do differently based on the
   answer (ship/hold a feature, fix a flow, report a trend, justify
   spend).
3. **Where in the user's experience does this sit?** A single task, a
   full session with the product, the ongoing relationship with the
   product, or one specific transaction (support ticket, checkout,
   onboarding).
4. **Has this been measured before for this product?** If yes, check
   `/research/_benchmarks/<product>.md` — reuse the same instrument and
   wording so the new wave is comparable. Don't introduce a new
   instrument mid-series without a stated reason.

If the answers to 2 and 3 don't line up (e.g., "I want to know if the
onboarding flow is easy" but the answer to 3 is "relationship"), point that
out before proceeding. Don't silently pick one.

Do not proceed to instrument selection until 1–3 are answered.

-----

## Step 1: Instrument selection

Classify the intake answers into a decision_type first — this part is
judgment, not arithmetic — then **run `scripts/selection.py`'s
`select_instrument(decision_type)`** rather than eyeballing the table
below, so the same decision_type can never silently map to a different
instrument on a different run. The table is here for the judgment call
of classifying the situation, not for hand-picking the instrument once
it's classified:

| Decision type | `decision_type` value | Where it sits | Instrument |
|---|---|---|---|
| Is this task doable? | `task_completion` | Single task, mid-test | SEQ |
| Is the product/feature usable overall? | `product_usability_full` / `product_usability_lite` | Full session, post-study | SUS / UMUX-Lite |
| How does our UX compare to the market? | `website_relationship_benchmark` | Website/app relationship | SUPR-Q |
| Are users loyal / would they recommend us? | `relationship_loyalty` | Relationship, quarterly | NPS |
| Were they happy with this specific interaction? | `transactional_satisfaction` | Transactional | CSAT |
| Was this support/self-serve interaction low-friction? | `transactional_effort` | Transactional (support) | CES 2.0 |
| Need diagnostic subscales? | `diagnostic_subscales` | Post-study, deeper | PSSUQ |
| Will they actually adopt this before it ships? | `adoption_prediction` / `adoption_prediction_lite` | Pre-launch prediction | TAM / UMUX-Lite |

Don't let the requester's phrasing ("I want NPS") override what they're
actually asking — if someone asks for NPS but the real question is "is
this specific flow usable," say so and recommend SEQ instead, with the
trade-off named. If `select_instrument` raises (nothing fits), build a
short custom item set and say explicitly that it has no external
benchmark, so the report later doesn't imply false comparability.

**Never modify the wording of a validated instrument** (SUS, SUPR-Q, UMUX,
UMUX-Lite, PSSUQ). A single reworded item breaks the benchmark comparison.
If the wording genuinely doesn't fit (e.g., "system" feels wrong for a
consumer app), swap the bracketed placeholder only — never the item
structure.

-----

## Step 2: Sample size

**Run `scripts/selection.py`'s `required_sample_size(purpose)`** for the
floor, rather than reciting the numbers from memory:

- `rough_benchmark` → 20
- `compare_two_conditions_between` → 213
- `compare_two_conditions_within` → 93
- `ongoing_tracking` → 30

These are MeasuringU's published rule-of-thumb bands, not a computed
power analysis — a true power calculation needs an effect size and
alpha/power assumptions most requesters can't supply at intake. If a
requester needs an actual power calculation for a specific comparison,
say that's a separate, more involved ask rather than quietly
approximating one here.

If the requester's expected reach won't hit the floor for what they asked
for, say so now — this is what feeds the small-sample flag downstream in
feedback-synthesizer. Don't let a study launch that's structurally
under-powered without the requester knowing going in.

-----

## Step 3: Trigger and frequency logic

Specify, as part of the spec, not left to the deploying team to guess:

- **Trigger event:** the specific action/moment that fires the survey
  (task completion, session end, ticket resolution, N days after
  signup) — never "on page load" or a calendar date alone
- **Frequency cap:** global cooldown (default: one survey per person per
  14 days) plus per-instrument cap (relationship metrics like NPS: no
  more than every 90–180 days)
- **Suppression rule:** don't re-survey someone who scored as a recent
  detractor/low scorer until the issue is addressed

-----

## Step 4: Output

Produce a **platform-native, deploy-ready** artifact — not a generic spec —
matched to how it'll actually be shipped:

- **Qualtrics** → QSF-importable question block (question text, response
  scale, scoring formula as a note)
- **Typeform** → JSON matching Typeform's question schema
- **In-app** → a small component matching the product's existing UI
  conventions (route through vois-tokens/righter if the target uses the
  Vois design system and UI copy beyond the validated item wording is
  needed — e.g., intro screen, thank-you screen)
- **Unspecified platform** → ask which one before generating, don't
  default silently

Along with the deployable file, always also write the structured handoff
file (see research-loop for schema) to `/research/<study-name>/00-intake.md`
and `/research/<study-name>/01-survey-spec.json`, containing: product,
learning goal, instrument chosen, item text, scoring formula, required n,
trigger/frequency rules. Before writing it, run
`scripts/selection.py`'s `validate_survey_spec(spec)` — if it returns
any missing fields, fill them in before writing the file. This is what
feedback-synthesizer reads later — it should never have to re-derive the
instrument from the raw data alone, and it shouldn't hit a missing field
that a two-line check would have caught.

-----

## What this skill never does

- Skips intake because the requester named an instrument already
- Modifies validated item wording to "sound more natural"
- Recommends an instrument the intake answers don't support (e.g., NPS
  for a single-task usability question)
- Launches a study without stating the required sample size up front
- Outputs a generic text spec when a platform was named
- Picks a survey platform without asking, when none was specified
- Introduces a new instrument for a product with an existing benchmark
  series, without flagging the break in comparability

-----

## Quick reference

| Requester says | What to check | Likely instrument |
|---|---|---|
| "Is this new flow usable?" | Single task, mid-test | SEQ |
| "How's the product doing overall?" | Full session, post-study | SUS or UMUX-Lite |
| "Are people loyal to us?" | Relationship, quarterly | NPS |
| "Was support helpful?" | Transactional | CSAT or CES |
| "How do we compare to competitors' UX?" | Relationship, benchmarked | SUPR-Q |
| "Will people actually use this feature?" | Pre-launch | TAM / UMUX-Lite |
| Nothing above fits | Custom, one-off | Custom item set, no benchmark |

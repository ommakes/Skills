# Vois Evaluation Harness

A scenario set for checking whether a screen generated with the `vois-*` skills actually followed the decision layer (`vois-components`' job trees, `vois-patterns`' path trees), not just whether it used the right tokens.

## What this is not

Not a new rule format. `scenarios.json` doesn't invent a YAML scenario schema — a scenario is just an existing `components-rules.json` job's `condition` paired with its `recommendation` (renamed `expected_outcome` here) and the near-miss outcomes its own `rationale` already rules out (`forbidden_outcomes`). If a scenario's expected outcome looks wrong, the fix is in `components-rules.json`'s decision tree, not in this file — this file only restates it for testing purposes.

Not a scored, weighted rubric yet. `score_categories` names the dimensions a run can be judged on (token/component/pattern/visual/decision-layer/anti-pattern/accessibility adherence), but none carry a weight. Assigning percentages to categories with zero scenarios run yet would be inventing numbers exactly the way `vois-tokens` warns against inventing token values — see `score_categories_note` in `scenarios.json`.

Not automated. There's no runner script. Running a scenario means: hand its `user_prompt` to an agent with the `vois-*` skills active as if it were a real feature request, let it build the screen, and check the result against `expected_outcome` and `forbidden_outcomes` by hand.

## Run log

**Run 1 — 2026-09-12.** All 10 scenarios run blind: a fresh agent per scenario got only `user_prompt` (no scenario ID, no `expected_outcome`, explicitly blocked from reading this folder), told the repo's Vois skills applied, and left to decide for itself.

- **9/10 passed** — the agent's choice matched `expected_outcome` and hit none of `forbidden_outcomes`, and in every passing case the agent's own report showed it had actually consulted the relevant `components-rules.json` job rather than guessing.
- **1 miss, and a real one: EVAL-006.** The prompt ("edit a single row's status inline") described a genuine single-field edit. The agent reasoned its way to Popover via `JOB-CONTEXTUAL-INFO` + `JOB-DATA-ENTRY` instead of the Sheet answer this scenario expected from `JOB-OVERLAY-INTERACTION` — and on inspection, `JOB-OVERLAY-INTERACTION`'s tree genuinely didn't rule Popover out: a single field anchored to a list item satisfied both its Dialog branch (1-4 fields, self-contained) and its Sheet branch (relates to a list item) with nothing to disambiguate. The agent's alternative was defensible, not a wrong guess.

**Fix applied**, per Phase 6: `JOB-OVERLAY-INTERACTION` in `components-rules.json` gained an explicit Popover branch for "exactly one field, anchored to the trigger," and the Sheet branch's condition narrowed to "a handful of fields or more" so the two no longer overlap (`vois-components` 1.4.2 → 1.5.0). EVAL-006 was reworded to an unambiguous multi-field edit so it actually tests the Sheet branch as originally intended, and EVAL-011 was added to cover the newly-explicit Popover branch — bringing the set to 11.

**Re-run, same session:** both the reworded EVAL-006 and the new EVAL-011 run blind again, fresh agents, same method as run 1. EVAL-006 (assignee/due-date/priority, three fields) → Sheet, citing `table-list.md`'s "handful of fields" language and the updated Quick Reference. EVAL-011 (single-field status change) → Popover, with the agent's own report noting `components-rules.json`'s rationale "explicitly addresses 'changing one row's status from a table.'" Both passed; the ambiguity that caused the original miss is gone.

## Why 10 scenarios, and why these five jobs

(Now 11, after run 1 above added one to close a gap it found — the number was never meant to be fixed, see the run log.)


`components-rules.json` has 20 job trees; this first pass only draws from five confirmed to have clean, unambiguous condition → recommendation trees with rationale already written: `JOB-CONFIRM-DESTRUCTIVE`, `JOB-TRANSIENT-FEEDBACK`, `JOB-OVERLAY-INTERACTION`, `JOB-LOADING-STATE`, `JOB-EMPTY-CONTENT`. The other 15 jobs are legitimate scenario material too, but writing scenarios for a job that hasn't been re-checked for decision-layer gaps risks baking a stale assumption into a test. Extend this file job by job as each one gets that check, not all at once.

## Using a run's results

A scenario run tells you two different things, and it's worth keeping them separate:

- **A wrong outcome** (the agent picked a `forbidden_outcomes` entry, or missed `expected_outcome` entirely) means the decision layer wasn't followed. Check whether the rule was legible where the agent would have found it — sometimes this is a prompting/routing problem (the agent never reached `vois-components`), not a content problem.
- **A right outcome by luck** (matched `expected_outcome` without any evidence the agent consulted the relevant job) doesn't validate the decision layer either — it just means the obvious answer and the correct answer happened to coincide this time. Scenarios here were picked because their `forbidden_outcomes` are plausible enough that a naive agent could land on them, but that's not a guarantee for every prompt phrasing.

## Where this fits in the design-intelligence-layer plan

This harness is Phase 5 of that plan (`design-intelligence-layer-prd.md`). Phase 6, the iteration loop, is: run these scenarios, find where a rule is missing or unclear, fix it in the *existing* skill file it belongs to (not a new parallel file), re-run. Nothing in this folder replaces that loop — it just gives it something concrete to run against.

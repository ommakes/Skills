# Vois Evaluation Harness

A scenario set for checking whether a screen generated with the `vois-*` skills actually followed the decision layer (`vois-components`' job trees, `vois-patterns`' path trees), not just whether it used the right tokens.

## What this is not

Not a new rule format. `scenarios.json` doesn't invent a YAML scenario schema — a scenario is just an existing `components-rules.json` job's `condition` paired with its `recommendation` (renamed `expected_outcome` here) and the near-miss outcomes its own `rationale` already rules out (`forbidden_outcomes`). If a scenario's expected outcome looks wrong, the fix is in `components-rules.json`'s decision tree, not in this file — this file only restates it for testing purposes.

Not a scored, weighted rubric yet. `score_categories` names the dimensions a run can be judged on (token/component/pattern/visual/decision-layer/anti-pattern/accessibility adherence), but none carry a weight. Assigning percentages to categories with zero scenarios run yet would be inventing numbers exactly the way `vois-tokens` warns against inventing token values — see `score_categories_note` in `scenarios.json`.

Not automated. There's no runner script. Running a scenario means: hand its `user_prompt` to an agent with the `vois-*` skills active as if it were a real feature request, let it build the screen, and check the result against `expected_outcome` and `forbidden_outcomes` by hand.

## Why 10 scenarios, and why these five jobs

`components-rules.json` has 20 job trees; this first pass only draws from five confirmed to have clean, unambiguous condition → recommendation trees with rationale already written: `JOB-CONFIRM-DESTRUCTIVE`, `JOB-TRANSIENT-FEEDBACK`, `JOB-OVERLAY-INTERACTION`, `JOB-LOADING-STATE`, `JOB-EMPTY-CONTENT`. The other 15 jobs are legitimate scenario material too, but writing scenarios for a job that hasn't been re-checked for decision-layer gaps risks baking a stale assumption into a test. Extend this file job by job as each one gets that check, not all at once.

## Using a run's results

A scenario run tells you two different things, and it's worth keeping them separate:

- **A wrong outcome** (the agent picked a `forbidden_outcomes` entry, or missed `expected_outcome` entirely) means the decision layer wasn't followed. Check whether the rule was legible where the agent would have found it — sometimes this is a prompting/routing problem (the agent never reached `vois-components`), not a content problem.
- **A right outcome by luck** (matched `expected_outcome` without any evidence the agent consulted the relevant job) doesn't validate the decision layer either — it just means the obvious answer and the correct answer happened to coincide this time. Scenarios here were picked because their `forbidden_outcomes` are plausible enough that a naive agent could land on them, but that's not a guarantee for every prompt phrasing.

## Where this fits in the design-intelligence-layer plan

This harness is Phase 5 of that plan (`design-intelligence-layer-prd.md`). Phase 6, the iteration loop, is: run these scenarios, find where a rule is missing or unclear, fix it in the *existing* skill file it belongs to (not a new parallel file), re-run. Nothing in this folder replaces that loop — it just gives it something concrete to run against.

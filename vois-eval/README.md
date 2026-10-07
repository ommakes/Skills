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

**Run 2 — 2026-10-06.** The 40 new scenarios plus the two Stepper scenarios (EVAL-012 and EVAL-013), 42 in all. Same blind method as run 1, with one difference: run 1 had each agent build the screen, and run 2 asked for the decision only, as a three-line report (what it would use, which rules it looked up, what was unclear). That makes 42 runs cheap, but it tests the decision and not whether the finished screen follows through. The "rules looked up" line is the agent's own account, and it was wrong twice: two agents named job ids that don't exist (one for the secondary-content job, one for the contain-content job).

- **41 of 42 matched `expected_outcome` and avoided every `forbidden_outcomes` entry.**
- **One miss: EVAL-034.** The prompt had four settings areas. The agent chose sidebar navigation with sub-pages, because `vois-patterns` `PATH-A-DEPTH-DEEP` says 4 or more settings sections use a sidebar. `JOB-SWITCH-VIEWS` said Tabs for a settings page and never mentioned that rule. That is a real conflict between two skills. **Fix:** the Tabs branch now says a settings page with 4 or more sections uses sidebar navigation instead (`vois-components` 1.10.1 → 1.10.2). EVAL-034 was reworded to three areas, which both rules agree on. It was re-run and chose Tabs.
- **One contested: EVAL-038, decided 2026-10-07.** An invoice detail page reached from the Invoices list. The first run chose a back link, which is what `JOB-NAVIGATION-POSITION` said for one level deep. The re-run chose a breadcrumb (Home > Invoices > invoice), citing `PATH-E` (a read-only record page puts a breadcrumb above the title) and `PATH-B-ROW-OPEN`, and counted Home as a level. The job and the patterns disagreed. **Decision:** a record page opened from its list gets a Breadcrumb, and Home counts as a level. `JOB-NAVIGATION-POSITION` now says 3 or more levels counting Home is a Breadcrumb, and 2 levels (Home > Page) is a back link (`vois-components` 1.10.2). EVAL-038's expected outcome changed from Back link to Breadcrumb, and EVAL-054 was added so the back link branch still has a scenario. Re-run after the decision: EVAL-037 and EVAL-038 chose the Breadcrumb and EVAL-054 chose the back link. An earlier rewording of the rationale made the re-run worse and was reverted before this decision.

Gaps the agents named in their reports. They are gaps, not conflicts, and I have not checked each one:
- HoverCard is missing from the Quick Reference (EVAL-016).
- No spec for a dismissible Badge: markup, `aria-label`, focus after removal (EVAL-018).
- No guidance on how to make a whole Card clickable, or on actions nested inside one (EVAL-040).
- Panel has no shadcn component and no spec (EVAL-042).
- Mobile filters in a Drawer are stated only in one job line, with no pattern (EVAL-043).
- Click-to-edit outside a table is not covered; one agent borrowed the table cell rule (EVAL-033).
- Toggle versus ToggleGroup for independent toolbar buttons is unspecified (EVAL-019).
- The presence indicator has no spec or token (EVAL-026).
- 12 monthly points sits on the boundary between a column chart and a line chart, with no tiebreaker in `vois-dataviz` (EVAL-053).
- One agent said the 1 to 3 line Textarea guidance conflicts with the 3-line token minimum (EVAL-049).
- One agent said a checkout form of about 16 fields lands in `PATH-C-COMPLEX`, which suggests Tabs, which conflicts with a single submit button (EVAL-032).

## Coverage

All 21 jobs in `components-rules.json` have at least one scenario: 54 in total. Each one names its branch of the job's decision tree with `tree_path` (indexes into `decision_tree`, then `sub_branches`). `node check-scenarios.mjs` fails if a scenario's `condition` is not that branch's text word for word, if its `expected_outcome` does not start with the tree's recommendation (up to the first bracket or dash, ignoring case and punctuation), or if a job or score category does not exist. It runs in CI, so a tree change that makes a scenario stale shows up as a failing check.

Scenarios EVAL-014 to EVAL-053 were written for the 15 jobs that had none, and EVAL-054 was added afterwards for the back link branch. Not every branch has one: 53 of the 97 branches that recommend something do, and the checker prints that count. The gaps include the Plain and Alert branches of the empty-content job, the Table, Tabs and Card branches of the data-visualization job, and the Input, Radio and Command branches of the text, binary-choice and list jobs.

## Using a run's results

A scenario run tells you two different things, and it's worth keeping them separate:

- **A wrong outcome** (the agent picked a `forbidden_outcomes` entry, or missed `expected_outcome` entirely) means the decision layer wasn't followed. Check whether the rule was legible where the agent would have found it — sometimes this is a prompting/routing problem (the agent never reached `vois-components`), not a content problem.
- **A right outcome by luck** (matched `expected_outcome` without any evidence the agent consulted the relevant job) doesn't validate the decision layer either — it just means the obvious answer and the correct answer happened to coincide this time. Scenarios here were picked because their `forbidden_outcomes` are plausible enough that a naive agent could land on them, but that's not a guarantee for every prompt phrasing.

## Where this fits in the design-intelligence-layer plan

This harness is Phase 5 of that plan (`design-intelligence-layer-prd.md`). Phase 6, the iteration loop, is: run these scenarios, find where a rule is missing or unclear, fix it in the *existing* skill file it belongs to (not a new parallel file), re-run. Nothing in this folder replaces that loop — it just gives it something concrete to run against.

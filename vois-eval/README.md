# Vois Evaluation Harness

A scenario set for checking whether a screen generated with the `vois-*` skills actually followed the decision layer (`vois-components`' job trees, `vois-patterns`' path trees), not just whether it used the right tokens.

## What this is not

Not a new rule format. `scenarios.json` doesn't invent a YAML scenario schema — a scenario is just an existing `components-rules.json` job's `condition` paired with its `recommendation` (renamed `expected_outcome` here) and the near-miss outcomes its own `rationale` already rules out (`forbidden_outcomes`). If a scenario's expected outcome looks wrong, the fix is in `components-rules.json`'s decision tree, not in this file — this file only restates it for testing purposes.

Not a scored, weighted rubric yet. `score_categories` names the dimensions a run can be judged on (token/component/pattern/visual/decision-layer/anti-pattern/accessibility adherence), but none carry a weight. Assigning percentages to categories with zero scenarios run yet would be inventing numbers exactly the way `vois-tokens` warns against inventing token values — see `score_categories_note` in `scenarios.json`.

Not automated for the 54 scenarios in `scenarios.json`. Their expected outcomes are prose, so running one still means: hand its `user_prompt` to an agent with the `vois-*` skills active, let it build the screen, and check the result against `expected_outcome` and `forbidden_outcomes` by hand. The tasks in `lookalike-pass/` and `tasks/` are different: they carry checks a script can run, and `run/run.mjs` runs them (see "Running the task runner" below).

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

## Running the task runner

`run/run.mjs` takes the lookalike prompts (`LP-*`, `HP-*`) and the design tasks in `tasks/design-tasks.json` (`DT-*`), builds each screen with the `claude` CLI, and scores the TSX with scripts. It runs every task with the skills on and with them off, several times each, and writes one results file to `results/`.

```
node vois-eval/run/run.mjs --dry-run                                   # show the plan, call nothing
node vois-eval/run/run.mjs --model claude-sonnet-5-5 --samples 3        # all tasks, both conditions
node vois-eval/run/run.mjs --model claude-haiku-5-5 --tasks DT-01,DT-04 --samples 1 --smoke
```

It calls a model, so it costs money and is run by hand, before a release or after a change to a skill. CI never runs it. `--model` is required, and should be the full model id (not an alias like `sonnet`), because the results file records which model produced it and the runner checks that the model that answered is the one you named. `--samples` defaults to 3, because one sample per prompt says nothing about variance. `--budget` caps the cost of each call (default $1) and `--max-turns` its turns (default 40).

**The two conditions.** *On*: the run directory holds a copy of `vois-patterns`, `vois-components`, `vois-tokens`, `vois-dataviz` and `righter` from this checkout under `./skills`, and the prompt says they apply and where they are. That pins the skill version under test; a copy that comes out without its `SKILL.md` stops the sample instead of running "skills on" with no skills. *Off*: an empty directory and the baseline prompt that forbids reading skills.

**What is and is not isolated.** Both conditions get the same four tools (Read, Write, Glob, Grep), no MCP servers (`--strict-mcp-config`) and project-only settings. That removes the Skill tool, skill listing, the shell and MCP tools. It matters: in a probe with the CLI's default tools and project-only settings, the agent still listed the account's installed Vois skills. It does **not** sandbox files. Read and Glob accept absolute paths, and the user's own `CLAUDE.md` memory may still load (I have not tested that, and the runner does not control it). The off prompt only asks the agent not to read skills. So the runner logs every tool call, and each sample records `outside_cwd_access`: the paths its file tools touched outside the run directory (a `~` path counts as outside). If an off sample has any, check it did not read installed skills before trusting the off rate. `check-results.mjs` warns about them and the run summary counts them as `outside_access`. If a memory file mentions Vois, nothing here would show it: run on a machine whose user-level memory says nothing about Vois, or the off rate may be too high. Each results file lists these settings under `isolation`.

**What a pass means.** A sample passes when all of these hold: it imports one of the task's `expected_imports`, imports none of its `forbidden_imports`, the lookalike scanner (`lookalike-pass/scan.mjs`) finds nothing, and every `required_patterns` regex matches while no `forbidden_patterns` regex does. Comments are removed first by a small scanner, so naming a component in a comment does not count and text that only looks like a comment (`<p>Press // to search</p>`, a URL, `"components/*"`) is kept. One known gap: a trailing comment after a plain word or number (`x = 1 // note`) is kept. The `vois-tokens` and `vois-dataviz` detector findings are recorded in each row but do not decide the pass, because those detectors are advisory.

**Runs that stop early.** A run that hits the turn or budget limit is scored on whatever screen it had written and marked `truncated`, because a skills-on agent reads many files first and would otherwise be marked down for it. The summary counts them and `check-results.mjs` warns, so compare the on and off counts before reading the rates. Any other CLI error, a timeout, or an agent that wrote no code is an error row: it counts as a failed sample and is reported separately, so an outage cannot make a run look better. A timeout or a missing result event also marks the sample `cost_unknown`, which makes the cost total a lower bound. A sample answered by a different model than the one named (the CLI can fall back on overload) is marked `model_mismatch` and the run is not compared.

**What it does not measure.** It does not render anything, so layout, spacing, contrast and interaction are not checked. The pattern checks are heuristics read from the rules named in each task's `source_rules`: a pass means the obvious failure did not happen, not that the screen is good. The `DT-*` tasks are marked `review: unreviewed`, because a designer has not yet signed off on their expectations; treat their rates as provisional until someone has. There is no LLM judge.

**The results file** (schema `vois-eval-results/1`) is named `results/<date>-<model>.json`, with `-smoke` or `-partial` added for those runs and `-2`, `-3` for a later run on the same day; the runner never overwrites an earlier file (`--out` with `--force` is the one way to replace a file on purpose). It records the model, when it was made, the `claude` CLI version, the git sha and whether the working tree was dirty (the skills are copied from the working tree, so a dirty tree is not reproducible from the sha), the isolation settings, the version of each skill under test, every sample with its score, cost, duration and flags, and a per-condition summary.

**What CI checks.** `check-results.mjs` checks each file's shape, that nothing is missing or duplicated, that the flags follow from the findings (a sample cannot be marked as passing with a failure listed), and that the summary matches the samples. Then, for each model, it compares that model's newest **full** run with the full run before it, and fails if the skills-on pass rate fell by more than 10 points over the tasks they share. A run is full only if it covers every default task with both conditions (`full: true`); a run with `--tasks`, `--limit`, one condition or `--smoke` is kept but never compared. Runs are ordered by their `created_at` time. A comparison is skipped, with the reason printed, when the samples per task differ, when either run has `model_mismatch` samples, or when fewer than 5 tasks are shared.

`node --test vois-eval/run/run.test.mjs` tests the scoring, task loading, results checks and run loop. It uses a stand-in for the `claude` CLI (`run/fake-claude.cjs`) for the parts that touch the CLI, so it costs nothing.

## Using a run's results

A scenario run tells you two different things, and it's worth keeping them separate:

- **A wrong outcome** (the agent picked a `forbidden_outcomes` entry, or missed `expected_outcome` entirely) means the decision layer wasn't followed. Check whether the rule was legible where the agent would have found it — sometimes this is a prompting/routing problem (the agent never reached `vois-components`), not a content problem.
- **A right outcome by luck** (matched `expected_outcome` without any evidence the agent consulted the relevant job) doesn't validate the decision layer either — it just means the obvious answer and the correct answer happened to coincide this time. Scenarios here were picked because their `forbidden_outcomes` are plausible enough that a naive agent could land on them, but that's not a guarantee for every prompt phrasing.

## Where this fits in the design-intelligence-layer plan

This harness is Phase 5 of that plan (`design-intelligence-layer-prd.md`). Phase 6, the iteration loop, is: run these scenarios, find where a rule is missing or unclear, fix it in the *existing* skill file it belongs to (not a new parallel file), re-run. Nothing in this folder replaces that loop — it just gives it something concrete to run against.

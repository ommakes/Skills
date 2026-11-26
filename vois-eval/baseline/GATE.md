# Phase 2 gate: JIT retrieval

Run 26 Nov 2026, two rounds. Round 1 used the original hint; round 2 used the hint after Om's decision to ask for whole rule ids.

**Verdict, Cursor-subagent harness, round 2: held retrieval passes; adversarial retrieval fails on one id.**

- Held retrieval: recall 1.000, no HELD id missed on any row, packets and query calls inside the limits. Passes every check.
- Adversarial retrieval: recall 0.944 (needs 0.95). The only miss is `PATH-TABLE-BULK-BAR` on ADV-02 (3 of 3). It needs a content change in the private repo that I cannot make, see "Decisions from Om".
- Quality (`quality.mjs`) was not run, so the Phase 2 gate as a whole is not met. Workstream D must not start.

Round 1 (original hint) failed: held 0.900, adversarial 0.852. Those files stay in this folder as the before.

## Read this first: which harness produced these

The skills are meant for any setup (Claude, OpenAI, Cursor and others), so no single harness is the reference. The only built-in runner, `baseline.mjs`, spawns the `claude` CLI, and this VM has no `claude` CLI or model credentials. At the user's request each sample was run as a Cursor subagent (model slug `claude-sonnet-5-5-medium`) through `vois-eval/run/subagent-harness.mjs`, which writes rows in the same shape and is scored by the same `gate()`. Differences from the `claude -p` runner, all recorded in each file's `harness_note`:

- The query-only Bash hook cannot be enforced. `other_bash_attempts` and `search_calls` are not measured (`null`).
- Tokens, cost and turns are not available. `total_in_tokens.median` is `n/a` in the table, and the plan's token comparison cannot be made from these files.
- Measured, not self-reported: every `query.mjs` call (a logging copy in each run directory records argv, exit code and packet lines) and every file open (`watch-opens.py`, inotify). No open outside the run directories happened.
- The subagent also sees the host project's rules, and the prompt arrives as a file (`prompt.txt`) the subagent reads first, not as the user message.
- A file open is not a Read. A text search over `skills/` opens every file. Two ADV-08 samples did exactly that (192 opens each, in alphabetical order, and their reports say they searched).
- The skills arm copies `vois-components/CHANGELOG.md`, which describes HELD-04, 06 and 10 and their answers. Entries for those were seen in the run directory, so skills-arm numbers may be raised. The retrieval arm opened no CHANGELOG.
- `vois-fields` is not in `SKILLS_UNDER_TEST`, so it is not in the run directory; field rules are reachable only through `query.mjs --fields` and `--id`.

Compare files only within the same harness; do not mix these with `baseline.mjs` files or draw a token conclusion from them. The recall, packet-size and "did it open the cards" checks do not depend on the model vendor, so they carry over; the query-only enforcement and the token numbers do not. The 95% claim needs a harness that enforces query-only access and records tokens, whichever vendor that is.

## Gate table

Model for all rows: `claude-sonnet-5-5-medium` (Cursor subagent). Quality pass rate was not run in any row. Round 2 rows use the new `REPORT_ID_HINT` (see below); round 1 rows do not. The skills arm has no retrieval hint and was not rerun.

| file | model | arm | samples | rule_recall.mean | query_calls.median | packet_lines.median | packet_lines.over_40 | total_in_tokens.median | pass_rate (quality) | pass |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-11-26-held-skills.json | claude-sonnet-5-5-medium | skills | 30 | 0.833 | 0 (no query calls) | n/a | n/a | n/a | not run | n/a (comparison arm) |
| 2026-11-26-held-retrieval.json (round 1, old hint) | claude-sonnet-5-5-medium | retrieval | 30 | 0.900 | 3 | 21 (max 28) | 0 of 98 | n/a | not run | no |
| **2026-11-26-held-retrieval-v2.json (round 2)** | claude-sonnet-5-5-medium | retrieval | 30 | **1.000** | 4 | 17 (max 28) | 0 of 111 | n/a | not run | **yes** |
| 2026-11-26-adv-retrieval.json (round 1, old hint) | claude-sonnet-5-5-medium | retrieval | 30 (27 scored; ADV-09 has no ids) | 0.852 | 4 | 18 (max 36) | 0 of 120 | n/a | not run | no |
| **2026-11-26-adv-retrieval-v2.json (round 2)** | claude-sonnet-5-5-medium | retrieval | 30 (27 scored) | **0.944** | 5 | 14 (max 36) | 0 of 154 | n/a | not run | **no** (ADV-02 only) |
| 2026-11-26-smoke-retrieval.json | claude-sonnet-5-5-medium | retrieval | 2 | not claimed | 5 | 17 (max 26) | 0 of 10 | n/a | not run | yes (no row has `error`) |
| quality (`quality.mjs`) | n/a | skills vs retrieval | 0 | n/a | n/a | n/a | n/a | n/a | not run | not run |

### Checks, round 2

Held retrieval (`baseline.mjs --gate 2026-11-26-held-retrieval-v2.json --skills-file 2026-11-26-held-skills.json`): every check passes. Recall 1.000 over 30 samples (30 of 30 full), packets 0 of 111 over 40 (median 17), `query_calls.median` 4, `errored` 0, retrieval recall above skills (0.833), no HELD id missed, no SKILL.md or card opened. `GATE: pass`.

Adversarial retrieval (`baseline.mjs --gate 2026-11-26-adv-retrieval-v2.json --read ADV-09=pass`):

- fail: `rule_recall.mean >= 0.95` (0.944 over 27 samples; 24 of 27 full). The three misses are all `PATH-TABLE-BULK-BAR` on ADV-02.
- pass: ADV-07 names `FIELD-SENSITIVE-STORAGE` (3 of 3); ADV-10 names `PATH-TABLE-NARROW-SELECT` or `PATH-TABLE-BULK-DESTRUCTIVE` (3 of 3); packets (0 of 154 over 40, median 14); `query_calls.median` 5; `errored` 0; ADV-09 read pass (Om's decision); no SKILL.md or card opened. `GATE: fail`.

Round 1 (old hint) for reference: held mean 0.900 with HELD-01 `DS-A11Y-020` and HELD-03 `DS-PANEL-003` missed on every sample; adversarial mean 0.852 with ADV-01 `DS-PANEL-003` (2 of 3), ADV-02 `PATH-TABLE-BULK-BAR` (3 of 3) and ADV-05 `DS-PANEL-003` (3 of 3) missed.

Held skills arm (round 1, not rerun): mean 0.833. Missed: HELD-01 `DS-A11Y-020` (s1); HELD-02 `JOB-CHOOSE-FROM-LIST` (s3); HELD-03 `DS-PANEL-003` (s1, s2, s3); HELD-05 `JOB-TRANSIENT-FEEDBACK` (s3); HELD-08 `JOB-SWITCH-VIEWS` (s1).

Search sweeps: ADV-08 s2 (192 files) and HELD-09 s3 (29 files) ran a text search or listing over `skills/`. The harness now excludes bursts of 20 or more opens inside one second from `file_paths` and records them as `search_sweep_files`, so the card check no longer fires on them. Round 1 files were recollected from the same raw data with this rule (two ADV-08 sweeps of 192 files). Opens of directories outside the run directories (the watcher's own start-up scan) are not counted as outside opens.

## After the private fix (vois-skills PR 147), ADV-02 rerun

The private change (`PATH-TABLE-BULK-DESTRUCTIVE` builds on `PATH-TABLE-BULK-BAR`, names AlertDialog; vois-patterns 1.23.7, vois-components 1.44.3) was ported by applying the PR's diff, bumping versions by hand where `skills.json`, the README and `SKILL.md` differed from the private base, and rebuilding `vois-components/data/retrieval-index.json` with `retrieval.mjs --write`. The rebuilt index equals the PR's index hunk. Offline checks pass: `retrieval.mjs`, `retrieval.test.mjs`, `check-rule-sync`, `check-verification`, `validate-skills`, `check-routing`, `check-skill-paths`, `check-reference-files`, `check-scenarios`, the eval tests (226 pass), `port-from-private.test`.

`JOB-CONFIRM-DESTRUCTIVE`'s packet is unchanged at 12 lines and does not list `PATH-TABLE-BULK-BAR`. The bar is reached in two hops, through `--id PATH-TABLE-BULK-DESTRUCTIVE`.

ADV-02, 3 samples, retrieval arm, Cursor subagent harness, hint v2 (`2026-11-26-adv02-after-fix.json`): recall 1.000, all three samples name `PATH-TABLE-BULK-BAR`, query calls 5 to 7, no card or SKILL.md opened, 0 of 18 packets over 40 lines. Before the fix it missed in 3 of 3. This is ADV-02 only: the other adversarial scenarios were not rerun, because the index change touches one rule. A full adversarial rerun with the quality run will give the single adversarial number for the gate.

## Decisions from Om (26 Nov) and what was done

| decision | Om's choice | status |
|---|---|---|
| ADV-09 | pass | recorded; the v2 gate run uses `--read ADV-09=pass` |
| Shorthand ids | edit the hint, keep the scorer strict | done: `REPORT_ID_HINT` in `baseline.mjs`, added to the retrieval arm of the decide-only prompt (not to `quality.mjs`). Its example ids are invented and are not real rule ids, so it names no answer. Rerun: held 0.900 to 1.000, adversarial 0.852 to 0.944 |
| ADV-02 `PATH-TABLE-BULK-BAR` | add it to `builds_on` of `PATH-TABLE-BULK-DESTRUCTIVE`, keep the required id | done in the private repo (PR 147, another worker) and ported here; ADV-02 rerun passes 3 of 3 (see above) |
| "Dialog" vs AlertDialog in `PATH-TABLE-BULK-DESTRUCTIVE` | fix the text | done in the same PR and ported. All six ADV-02 and ADV-10 round 2 reports chose AlertDialog, so the wording did not change an answer, but it is still a conflict in the packet |
| Card check on ADV-08 | treat as artifact, tighten the harness | done (sweep rule above, with a test) |
| Which harness is the claim | Cursor subagent, after adding token capture and query-only enforcement | **partly blocked.** Neither can be added from inside a Cursor subagent: the Task tool returns text only, with no token counts, and there is no hook on its shell tool. What exists: every `query.mjs` call and file open is measured. Not available: tokens, cost, other Bash and search counts, an enforced query-only rule. If Cursor exposes token usage or a command hook for subagents, `collect` can read it; until then the table says `n/a` |
| Push | grant cursor[bot] write access | waiting on the grant. Push still returns 403 |

## Offline results (workstream A, same day)

| check | result |
|---|---|
| `retrieval.test.mjs` | 35 pass |
| `retrieval.mjs` | `retrieval: OK` |
| `baseline.test.mjs` | 36 pass (10 new for `gate()` and `--gate`) |
| `subagent-harness.test.mjs` | 3 pass |
| `quality.test.mjs` | 7 pass |
| `baseline.mjs --dry-run --retrieval`, held-out and adversarial | `10 scenarios x 3 samples = 30 calls` each |
| `quality.mjs --dry-run --arms skills,retrieval --samples 1` | 90 calls (45 design tasks); 270 at `--samples 3` |

Packet checks: `Dialog` exit 0, 22 lines, `missing none`; `toggle group` exit 0 and names Toggle; `Nonesuch` exit 3; unknown `--job` exit 3; name plus `--job` exit 1. In the subagent runs every logged `query.mjs` call that produced a packet exited 0 (228 packets).

Private packet-size print (read-only, `ommakes/vois-skills`, over the 55 `scenarios.json` scenarios, with the five private `SKILL.md` files):

| figure | value |
|---|---|
| entry load today (5 `SKILL.md`, every task) | 32,985 tokens |
| packet tokens, job plus component | median 530, p90 1,380, max 1,867 |
| packet lines, job plus component | median 27, p90 45, max 55 |

Static size only. The gate's `packet_lines` counts each packet the model actually read, one per call.

## Open questions (workstream C)

1. **Card text vs counts: models did not open the cards. Keep counts.** In held retrieval 0 of 30 samples opened a `behaviors/*.md` or any `SKILL.md`; the only opens in all 62 retrieval samples were the two ADV-08 text searches. By contrast 23 of 30 held skills-arm samples opened a card and all 30 opened `vois-components/SKILL.md`. Round 2 agrees (0 of 60 retrieval samples opened a card or SKILL.md once searches are excluded). So: do not add a second lookup to the hint, and `query.mjs` does not need to print the card text. This holds only on this subagent harness; confirm on each harness you ship for, since the tool set differs.
2. **Two jobs, two components: list both, no conflict mark.** `--job JOB-CONFIRM-DESTRUCTIVE --job JOB-DATA-ENTRY` exits 0, lists both job trees and then AlertDialog and Toast under the first, Field and Form under the second, with no conflict line. In the reports I checked (HELD-03, ADV-02, ADV-09, ADV-10) none picked one component and left a second job unnamed; I did not read all 62.
3. **Who owns adversarial answers.** Om corrected ADV-02, 06, 07, 08 on 25 Nov and kept the ids on ADV-01, 03, 04, 05, 10 on 26 Nov. The prose `answer` on those five may still be Claude's draft; the numeric gate uses `required_rules` only, so it is not blocked. ADV-09 stays a human read and no id is added in the scorer.

## Next steps

1. Someone with write access to `ommakes/vois-skills`: the `builds_on` change for `PATH-TABLE-BULK-BAR` and the AlertDialog text fix above. Then port to the public repo and rerun ADV-02 on this harness; expect adversarial recall to clear 0.95.
2. Run the quality check (`quality.mjs`, 270 code-writing calls at three samples). It has not run on any harness, and the gate is not met without it.
3. Grant cursor[bot] write access to `ommakes/Skills` (or name a fork) so the branch can be pushed and the PR opened.
4. Token counts and query-only enforcement need a harness that can supply them. The `claude -p` runner has both, as one example (needs the `claude` CLI):

```bash
MODEL=claude-sonnet-5-5
node vois-eval/run/baseline.mjs --model "$MODEL" --samples 3 --tasks vois-eval/heldout/om-2026-11-25.json --out vois-eval/baseline/2026-11-26-held-skills-claude.json
node vois-eval/run/baseline.mjs --model "$MODEL" --samples 3 --retrieval --tasks vois-eval/heldout/om-2026-11-25.json --out vois-eval/baseline/2026-11-26-held-retrieval-claude.json
node vois-eval/run/baseline.mjs --model "$MODEL" --samples 3 --retrieval --tasks vois-eval/heldout/adversarial-2026-11-25.json --out vois-eval/baseline/2026-11-26-adv-retrieval-claude.json
node vois-eval/run/quality.mjs --model "$MODEL" --arms skills,retrieval --samples 3
node vois-eval/run/baseline.mjs --gate vois-eval/baseline/2026-11-26-held-retrieval-claude.json --skills-file vois-eval/baseline/2026-11-26-held-skills-claude.json
node vois-eval/run/baseline.mjs --gate vois-eval/baseline/2026-11-26-adv-retrieval-claude.json --read ADV-09=pass
```

## What changed in the runner

- `gate()` and `--gate` in `baseline.mjs`: the plan's pass rule as a pure function, tested without a model.
- `lookups.file_paths` in `baseline.mjs`: each row now stores the relative paths it read, which the cards question needs.
- `REPORT_ID_HINT` in `baseline.mjs`: asks for whole rule ids in line 2 of a decide-only report. Retrieval arm only.
- `subagent-harness.mjs`, `watch-opens.py`, `subagent-harness.test.mjs`: the Cursor-subagent harness used here, including the search-sweep rule. Usage is in the header of `subagent-harness.mjs`.

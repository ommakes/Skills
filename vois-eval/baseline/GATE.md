# Phase 2 gate: JIT retrieval

Run 26 Nov 2026. **Verdict: fail.** Held retrieval recall is 0.900 (needs 0.95) and two HELD ids are missed on every sample. The quality (eval score) check was not run. Workstream D must not start.

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

Model for all rows: `claude-sonnet-5-5-medium` (Cursor subagent). Quality pass rate was not run in any row.

| file | model | arm | samples | rule_recall.mean | query_calls.median | packet_lines.median | packet_lines.over_40 | total_in_tokens.median | pass_rate (quality) | pass |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-11-26-held-skills.json | claude-sonnet-5-5-medium | skills | 30 | 0.833 | 0 (no query calls) | n/a | n/a | n/a | not run | n/a (comparison arm) |
| 2026-11-26-held-retrieval.json | claude-sonnet-5-5-medium | retrieval | 30 | 0.900 | 3 | 21 (max 28) | 0 of 98 | n/a | not run | **no** |
| 2026-11-26-adv-retrieval.json | claude-sonnet-5-5-medium | retrieval | 30 (27 scored; ADV-09 has no ids) | 0.852 | 4 | 18 (max 36) | 0 of 120 | n/a | not run | **no** |
| 2026-11-26-smoke-retrieval.json | claude-sonnet-5-5-medium | retrieval | 2 | not claimed | 5 | 17 (max 26) | 0 of 10 | n/a | not run | yes (no row has `error`) |
| quality (`quality.mjs`) | n/a | skills vs retrieval | 0 | n/a | n/a | n/a | n/a | n/a | not run | not run |

### Checks that passed and failed

Held retrieval (`baseline.mjs --gate 2026-11-26-held-retrieval.json --skills-file 2026-11-26-held-skills.json`):

- fail: `rule_recall.mean >= 0.95` (0.900 over 30 samples; 24 of 30 full)
- fail: no HELD id misses a required rule on any row
- pass: packets (0 over 40, median 21), `query_calls.median` 3, `errored` 0, retrieval recall (0.900) not lower than skills (0.833), no SKILL.md or behaviors card opened

Adversarial retrieval (`baseline.mjs --gate 2026-11-26-adv-retrieval.json`):

- fail: `rule_recall.mean >= 0.95` (0.852 over 27 samples)
- pass: ADV-07 names `FIELD-SENSITIVE-STORAGE` (3 of 3); ADV-10 names `PATH-TABLE-NARROW-SELECT` or `PATH-TABLE-BULK-DESTRUCTIVE` (3 of 3); packets and query calls; `errored` 0
- ADV-09 read: **needs Om.** My read is below; `gate()` records it as missing until a person passes `--read ADV-09=pass`.
- fail as the gate is written: "no SKILL.md or behaviors card opened" shows 46 reads in 2 samples. These are the ADV-08 text searches, not reads (see above). Treat it as a pass for the claim, but the written rule fails it, so say so if the number is reused.

### `rules_missing`, every id

Held skills: HELD-01 DS-A11Y-020 (s1); HELD-02 JOB-CHOOSE-FROM-LIST (s3); HELD-03 DS-PANEL-003 (s1, s2, s3); HELD-05 JOB-TRANSIENT-FEEDBACK (s3); HELD-08 JOB-SWITCH-VIEWS (s1).

Held retrieval: HELD-01 DS-A11Y-020 (s1, s2, s3); HELD-03 DS-PANEL-003 (s1, s2, s3). Every other HELD id was named on every sample.

Adversarial retrieval: ADV-01 DS-PANEL-003 (s2, s3); ADV-02 PATH-TABLE-BULK-BAR (s1, s2, s3); ADV-05 DS-PANEL-003 (s1, s2, s3). Nothing missing on ADV-03, 04, 06, 07, 08, 10.

### Why these ids are missed, and what to change

1. **DS-A11Y-020 on HELD-01 (3 of 3) is shorthand, not a missing lookup.** The packet prints `DS-A11Y-020` in full. All three reports wrote `DS-A11Y-019/020`, `019/020/022` or `019/020/021/022`. The scorer counts only a whole id, as the plan says. DS-PANEL-003 on HELD-03 s1 (`DS-PANEL-002/003`) and s3 (`DS-PANEL-001 to 007`), and on ADV-01 s3, is the same habit. If those forms were expanded, HELD-01 would pass on all three samples, HELD-03 would still miss on s2, and the HELD mean would be about 0.98, but HELD-03 would still fail the per-id rule. This is a hypothetical, not a result. Proposed change, inside the plan's allowed levers: add to `RETRIEVAL_HINT` "write every rule id in full in line 2; do not write `019/020`". That is a hint edit, so rerun held retrieval after it. Do not change the scorer to accept ranges without Om deciding it.
2. **DS-PANEL-003 on HELD-03 s2, ADV-01 s2 and ADV-05 is a real gap in what the model reports.** The id appears only inside the text of `PATH-B-ROW-OPEN` (the Sheet rule). The models read that rule, but on those samples they did not carry `DS-PANEL-003` into the report. The same hint line ("list every id you relied on, in full, including ids named inside a rule's text") addresses it. A packet change is the alternative: print `DS-PANEL-003` in a separate "also named" line for `--id PATH-B-ROW-OPEN`.
3. **PATH-TABLE-BULK-BAR on ADV-02 (3 of 3).** `PATH-TABLE-BULK-BAR` builds on `JOB-EXPOSE-ACTIONS` and `PATH-B-ROW-ACTIONS`, not on `JOB-CONFIRM-DESTRUCTIVE`, and the `JOB-CONFIRM-DESTRUCTIVE` packet's "page rules that build on it" line already holds 12 ids and does not include it. All three samples answered with the destructive branch (AlertDialog with count, or undo toast) and never named the bar. Proposed change: add `PATH-TABLE-BULK-BAR` to the `builds_on` of `PATH-TABLE-BULK-DESTRUCTIVE`, so `--id PATH-TABLE-BULK-DESTRUCTIVE` prints it; or accept that the destructive-branch ids are enough for ADV-02. The second is Om's call because he set the ids on ADV-02.
4. Separate observation, not scored: `PATH-TABLE-BULK-DESTRUCTIVE` says "Use a Dialog (see JOB-CONFIRM-DESTRUCTIVE)" while the job says AlertDialog for irreversible actions. The three ADV-02 reports all say AlertDialog. Aligning the path text is a content change in the private repo.

### ADV-09 read (provisional, for Om to confirm)

Task: a live overlay showing each teammate's cursor in a shared document. The expected answer: say the skills have no spec for this, do not invent a rule from the nearest component.

All three reports open with "the skills have no rule for the cursor overlay itself", say no job fits, and build the layer custom. Each borrows Avatar and the presence indicator for the name label, and says the presence indicator is "workspace-specific, check manifest". None cites a rule for the overlay. My read: **pass** on all three. Using Avatar for a name label is borrowing an existing part, not inventing a rule, but "a made-up answer from the nearest component counts as a fail" is Om's line, so it is his to confirm.

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

1. **Card text vs counts: models did not open the cards. Keep counts.** In held retrieval 0 of 30 samples opened a `behaviors/*.md` or any `SKILL.md`; the only opens in all 62 retrieval samples were the two ADV-08 text searches. By contrast 23 of 30 held skills-arm samples opened a card and all 30 opened `vois-components/SKILL.md`. So: do not add a second lookup to the hint, and `query.mjs` does not need to print the card text. This holds only on this subagent harness; confirm on each harness you ship for, since the tool set differs.
2. **Two jobs, two components: list both, no conflict mark.** `--job JOB-CONFIRM-DESTRUCTIVE --job JOB-DATA-ENTRY` exits 0, lists both job trees and then AlertDialog and Toast under the first, Field and Form under the second, with no conflict line. In the reports I checked (HELD-03, ADV-02, ADV-09, ADV-10) none picked one component and left a second job unnamed; I did not read all 62.
3. **Who owns adversarial answers.** Om corrected ADV-02, 06, 07, 08 on 25 Nov and kept the ids on ADV-01, 03, 04, 05, 10 on 26 Nov. The prose `answer` on those five may still be Claude's draft; the numeric gate uses `required_rules` only, so it is not blocked. ADV-09 stays a human read and no id is added in the scorer.

## Next steps

1. Om: confirm the ADV-09 read, and decide item 3 above (ADV-02 ids) and whether ranges like `019/020` should ever count. Otherwise make the hint change in item 1 and rerun.
2. Rerun after any hint change in each setup you care about (Cursor, OpenAI, Claude and so on). The `claude -p` runner, as one example (needs the `claude` CLI):

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
- `subagent-harness.mjs`, `watch-opens.py`, `subagent-harness.test.mjs`: the fallback harness used here. Usage is in the header of `subagent-harness.mjs`.

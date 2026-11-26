# Phase 2 gate: JIT retrieval

Status 26 Nov 2026: **model runs not done, verdict not available.** The offline checks and `gate()` are done and committed. The runs in workstream B were blocked: the VM that prepared this file has no `claude` CLI and no Anthropic credentials (no `ANTHROPIC_API_KEY`, no `~/.claude` login). No result file in this folder was produced, edited or estimated by hand. Every table cell below that needs a model says `not run`.

## What Om runs

Needs the `claude` CLI, logged in, Node 22, repo root of `ommakes/Skills` on this branch. Pick one model id and use it everywhere. The runs above are 30 + 30 + 30 + 2 calls, plus the quality run (45 tasks x 2 arms x 3 samples = 270 calls), each capped at `--budget 1` USD.

```bash
MODEL=claude-sonnet-5-5   # or the model you want the claim made on

node vois-eval/run/baseline.mjs --model "$MODEL" --samples 3 \
  --tasks vois-eval/heldout/om-2026-11-25.json \
  --out vois-eval/baseline/2026-11-26-held-skills.json

node vois-eval/run/baseline.mjs --model "$MODEL" --samples 3 --retrieval \
  --tasks vois-eval/heldout/om-2026-11-25.json \
  --out vois-eval/baseline/2026-11-26-held-retrieval.json

node vois-eval/run/baseline.mjs --model "$MODEL" --samples 3 --retrieval \
  --tasks vois-eval/heldout/adversarial-2026-11-25.json \
  --out vois-eval/baseline/2026-11-26-adv-retrieval.json

node vois-eval/run/baseline.mjs --model "$MODEL" --samples 1 --retrieval \
  --scenarios EVAL-001,EVAL-002 \
  --out vois-eval/baseline/2026-11-26-smoke-retrieval.json

node vois-eval/run/quality.mjs --model "$MODEL" --arms skills,retrieval --samples 3
```

If any row has `truncated: true`, rerun that file with a higher `--budget` and `--resume`. Then score, with no model call:

```bash
node vois-eval/run/baseline.mjs --gate vois-eval/baseline/2026-11-26-held-retrieval.json \
  --skills-file vois-eval/baseline/2026-11-26-held-skills.json
node vois-eval/run/baseline.mjs --gate vois-eval/baseline/2026-11-26-adv-retrieval.json \
  --read ADV-09=pass     # only after you read the three ADV-09 reports; use fail if they do not
```

Each prints one line per check and `GATE: pass` or `GATE: fail`, and exits 0 or 1. Fill the table below from the files and `summary` blocks. Add `--cards-decided` only after question 1 is answered (see below).

## Gate table

| file | model | arm | samples | rule_recall.mean | query_calls.median | packet_lines.median | packet_lines.over_40 | total_in_tokens.median | quality pass_rate | pass |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-11-26-held-skills.json | not run | skills | 30 | not run | n/a | n/a | n/a | not run | not run | n/a (comparison arm) |
| 2026-11-26-held-retrieval.json | not run | retrieval | 30 | not run | not run | not run | not run | not run | not run | not run |
| 2026-11-26-adv-retrieval.json | not run | retrieval | 30 | not run (ADV-09 excluded) | not run | not run | not run | not run | not run | not run |
| 2026-11-26-smoke-retrieval.json | not run | retrieval | 2 | not claimed | not run | not run | not run | not run | not run | not run (pass = every row has no `error`) |
| `<date>-quality-<model>.json` | not run | skills vs retrieval | 3 | n/a | n/a | n/a | n/a | n/a | skills: not run, retrieval: not run | not run (pass = retrieval >= skills) |

`rules_missing` ids per file: not run.

Pass rule (from the plan):

- Held retrieval: `gate()` passes and no HELD-01 to HELD-10 row misses a required id.
- Adversarial retrieval: `gate()` passes on rows with required ids, ADV-07 names `FIELD-SENSITIVE-STORAGE`, ADV-10 names `PATH-TABLE-NARROW-SELECT` or `PATH-TABLE-BULK-DESTRUCTIVE`, and a person records `ADV-09: read: pass|fail`.
- Quality: `summary.retrieval.pass_rate` >= `summary.skills.pass_rate`.
- Smoke: file exists and no row has `error`.

ADV-09 read: not done (no reports exist yet).

**Verdict: not decided. Workstream D must not start.**

## Offline results (workstream A, 26 Nov 2026, Node 22.23, `ommakes/Skills` main at `8fae87f`)

| check | result |
|---|---|
| `retrieval.test.mjs` | 35 pass, 0 fail |
| `retrieval.mjs` | `retrieval: OK`, no problems |
| `baseline.test.mjs` | 36 pass (26 existing, 10 new for `gate()` and `--gate`) |
| `quality.test.mjs` | 7 pass |
| `baseline.mjs --dry-run --retrieval`, held-out | `10 scenarios x 3 samples = 30 calls` |
| `baseline.mjs --dry-run --retrieval`, adversarial | `10 scenarios x 3 samples = 30 calls` |
| `quality.mjs --dry-run --arms skills,retrieval --samples 1` | `90 call(s): 45 task(s) x skills + retrieval x 1 sample(s)`. This is the design-task corpus only, not HELD or ADV. |

Packet checks:

| command | exit | result |
|---|---|---|
| `query.mjs Dialog` | 0 | 22 lines (limit 40), `missing    none` |
| `query.mjs --jobs` | 0 | 24 jobs, 26 lines |
| `query.mjs "toggle group"` | 0 | names Toggle, registry `vois-toggle-group` |
| `query.mjs Nonesuch` | 3 | as required |
| `query.mjs --job JOB-CONFIRM-DESTRUCTIVE --job JOB-NOPE` | 3 | as required |
| `query.mjs Dialog --job JOB-DATA-ENTRY` | 1 | as required |

Private packet-size print (read-only; `ommakes/vois-skills` `vois-components/scripts/baseline.mjs` run against the 55 `scenarios.json` scenarios, with the five private `SKILL.md` files and the public `query.mjs` and index, which have the same SHAs):

| figure | value |
|---|---|
| entry load today (5 `SKILL.md`, every task) | 32,985 tokens (131,937 bytes / 4) |
| all `.md` in those 5 skills | 229,058 tokens (rough: non-`SKILL.md` files came from the public tree; private-only reference files such as `vois-router` references are not counted) |
| packet tokens (job packet plus component packet) | median 530, p90 1,380, max 1,867 |
| packet lines (job plus component) | median 27, p90 45, max 55 |
| scenarios with no component or no packet | none |

This is a static size comparison. It does not measure recall, lookups or model behavior. The Phase 0 record for those is the JSON in this folder once the runs exist. Note the static number counts a job packet and a component packet together; the gate's `packet_lines` counts each packet the model actually read, one per query call.

## Runner change that came with `gate()`

`lookups()` in `baseline.mjs` stored only `files_read` (a count). The plan needs the paths (SKILL.md and `behaviors/*.md` reads, question 1), so each row now also stores `lookups.file_paths`, relative to the run directory (for example `skills/vois-components/behaviors/dialog.md`). Result files written before this change have no paths. `gate()` fails a retrieval row that read a file with no path recorded, rather than passing it.

Two decisions inside `gate()` that you may want to change:

- While the cards question is open (`cardsDecided` false), any retrieval row that read a `SKILL.md` or `behaviors/*.md` fails the gate. The plan says this literally. A model that is told to run the query first may still open `SKILL.md`; if so the gate fails on that alone. Check `reads_of_skill_or_card` in the output, and if the reads are only `SKILL.md` and not cards, decide whether that should block, then rerun with `--cards-decided`.
- The ADV-07 and ADV-10 checks read the stored `report` field, which the runner cuts at 1,500 characters. The reply is three lines, so this should not matter.

## Open questions (workstream C)

1. **Card text vs counts: not answered, needs the held retrieval run.** Count the samples whose `rows[].lookups.file_paths` contain `behaviors/*.md`. `--gate` prints each such read as a `read` line. Most samples open a card: Phase 3 must not tell the model to stop at the packet; consider printing the card from `query.mjs` when `--full` is off. Almost none: keep counts, add no second lookup to the hint. Decision: pending. It blocks how short the Dialog section of `SKILL.md` can get, not the deletion of duplicate job trees.

2. **Two jobs, two components: answered offline.** `node vois-components/scripts/query.mjs --job JOB-CONFIRM-DESTRUCTIVE --job JOB-DATA-ENTRY` exits 0 and lists both jobs (each with its decision tree and the PATH rules that build on it), then a `components named` block: AlertDialog and Toast under JOB-CONFIRM-DESTRUCTIVE, Field and Form under JOB-DATA-ENTRY. It prints no conflict line. Answer: **list both; no conflict mark.** Reopen only if a held-out or adversarial report picks one component and never names the other job. That check needs the runs: pending until then, but no script change is warranted now.

3. **Who owns adversarial answers: answered from the task file.** `adversarial-2026-11-25.json` records that ADV-02, 06, 07, 08 were corrected by Om, and that Om kept the required ids on ADV-01, 03, 04, 05, 10 on 26 Nov 2026. The prose `answer` on those five can still be the model's draft. The numeric gate uses `required_rules` only, so it is not blocked on the prose. ADV-09 has no `required_rules` and stays a human read; nothing in the scoring script adds an id. If Om wants an id there, he edits the JSON and reruns `--scenarios ADV-09 --resume`.

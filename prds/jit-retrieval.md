# PRD: Just-in-time retrieval for the Vois skills

Status: pilot in progress (Phase 1)
Owner: Om
Repos: `ommakes/vois-skills` (canonical), `ommakes/Skills` (public mirror)
Replaces: the three "JIT Rule Retrieval Architecture" drafts (rev 1 to 3). This version keeps their sequencing and cuts what the repo does not need yet.

## 1. Problem

A small design task loads a lot of text. The chain's `SKILL.md` files hold about 20,000 words before any reference file (router 6.1k, loop 4.9k, tokens 4.4k, components 2.8k, patterns 1.8k, fields 0.7k), and the references hold about 90,000 more. To find the three rules and one behavior card that apply to a Dialog, a model reads the skill, follows its index, opens files and searches. The instruction "query the JSON, do not read everything" is itself prose, so models skip it.

The knowledge is well organized. Rules, jobs, behavior cards and the registry each have stable IDs and validators. What is missing is a fast, checked way to get from a task to the few records it needs.

## 2. Goal

Give the model one small, complete packet for the task at hand, from a plain script that works in both repos without MCP. Prove it against today's skills before any `SKILL.md` text is removed.

Success is fewer tokens per correct design decision, with no rise in missed rules. Token count alone is not success.

## 3. Non-goals for the pilot

- Thinning any `SKILL.md`. That is Phase 3 and needs the Phase 2 gate.
- A `docs/` layer. Moving prose out of `SKILL.md` is thinning.
- Semantic, vector or LLM matching.
- Authored trigger phrases. Added only if Phase 2 shows the model picks jobs badly.
- An `owner` field. The folder a file sits in is its owner; the build stamps it.
- Per-rule token estimates. Packet size is measured instead.
- Dependency-aware CI.
- Skills other than `vois-components` (plus the `vois-tokens` rules it links to).

## 4. Key decisions

### 4.1 Two entry points, not one

| Path | Question | Route | Uses jobs? |
|---|---|---|---|
| Build | "How do I build this Dialog right?" | component → rules, behavior card, lookalikes, registry item | No |
| Pick | "What should I use to confirm a delete?" | task → job → decision tree → candidate components | Yes |

Most small tasks name the component ("fix the Dialog's focus", "add an error state to this field"). Routing those through a job is a detour. Jobs earn their place when the component is not yet chosen: each job holds a decision tree and the "why not the others" answers, which is the most valuable judgment in `vois-components`.

### 4.2 The model picks the job; the script does the rest

There are 24 jobs. Their IDs, titles and one-line framing fit in about 500 tokens (`query.mjs --jobs`). The model reads that list and names one or more job IDs. The script then returns each job's decision tree, merges jobs, removes duplicate components and reports what it could not find.

This is deterministic where it matters (lookup and composition) and leaves language understanding to the model, which does it better than a lexical scorer tuned on 40 examples. A wrong pick is visible in the output. If Phase 2 shows the model picks badly, add trigger phrases and a scored matcher then (rev 3, section 8).

### 4.3 Links are the real work, so most are derived

The graph needs edges that today exist only partly:

| Edge | Source | Kind |
|---|---|---|
| component → registry item | `component-names.json` `registry` | exists |
| component → behavior card | `component-names.json` new `card` field | authored, 12 entries (15 once the registry 0.31.0 cards land) |
| component → rule (scoped categories) | `component-names.json` new `ruleScopes` | authored, 3 categories |
| component → rule (cited by its card) | `behaviors/*.json` row `rules` | derived |
| component → rule and lookalike (built instead) | `components-rules.json` lookalike `instead` and `rule_ids` | derived |
| component → rule (named in rule text) | `vois-rules.json` `rule`, whole-word match | derived |
| job → component | decision tree `recommendation`, whole-word match | derived |

All authored links live in `vois-components/data/component-names.json`, so `vois-tokens` data does not change in the pilot. Every rule link records its provenance (`category`, `card`, `lookalike`, `mentions`). Job links are their own list, taken from the decision tree text.

Most of the 247 `vois-tokens` rules are cross-cutting (accessibility, color, spacing) and apply to everything. They are not copied into every packet, which is how bloat comes back. The packet names how many global rules exist and points to `vois-tokens`. Only component-scoped rules travel in the packet. Detector rules are listed under Validation, since a script enforces them.

### 4.4 The index ships inside the skill

Skills install one at a time, so a root-level `retrieval/` folder would not ship with `vois-components`. The generated index lives at `vois-components/data/retrieval-index.json` and carries the text of every rule it links to. `query.mjs` reads only that file, so an installed skill works on its own. CI rebuilds the index and fails when the committed copy is stale, the same way `behaviors.mjs` checks its generated `.md`.

### 4.5 Result states

Three states, not four. "Exact" and "high confidence" have no scoring rule to tell them apart yet.

- `match`: one component or job resolved. Exit code 0.
- `ambiguous`: more than one candidate, listed with how each matched. Exit code 2.
- `no_match`: nothing resolved, or one of several `--job` ids is unknown. Lists the nearest names by spelling. Exit code 3. Never falls back to reading the whole skill.
- Bad usage (a flag with no value, two modes at once, an unknown flag) is exit code 1.

Each packet also lists what it could not provide: no behavior card, no registry item, a job that names no known component. Missing data is shown, never invented.

## 5. The packet

```
VOIS PACKET  component: Dialog  (match)
registry   vois-dialog  [status: have]
card       behaviors/dialog.md  20 rows: 1 decide, 1 differs, 7 native, 8 supply, 3 unchecked
jobs       JOB-OVERLAY-INTERACTION
rules
  DS-A11Y-001  [lookalike] Every interactive element has a hit area of at least var(--hit-area-min) in both...
  DS-A11Y-007  [card, lookalike] Icon-only buttons need `aria-label`.
  DS-A11Y-019  [card] Every dialog has an accessible name (DialogTitle or AlertDialogTitle, visually hidden...
  DS-A11Y-021  [card] When a dialog closes, focus returns to the element that opened it. If that element is...
  DS-A11Y-022  [card, mentions] Escape closes a dialog, and a click on the scrim closes a Dialog (not an Al...
  DS-MODAL-003  [category, lookalike] Prevent layout shift. When a modal opens and the page scrollbar disap...
  DS-MODAL-004  [card, category] The body of a dialog scrolls. The header and the footer stay in view. A ta...
  DS-MODAL-007  [category] Never use a modal for navigation. A list of places to go is a menu or a page.
  DS-RESPONSIVE-008  [card] Below --breakpoint-md a dialog that holds a choice (confirm, select, stepper, s...
also named DS-ELEVATION-002, DS-ELEVATION-005, DS-TOKEN-005 (rules that name it in passing; --id for the text)
lookalikes
  LOOKALIKE-006  built: A `fixed inset-0` backdrop with a centered box  instead: Dialog, AlertDialog or She...
  LOOKALIKE-008  built: "x", "×" or `&times;` as text for a close control  instead: The close control that ...
validate   DS-MODAL-001, DS-MODAL-002, DS-MODAL-005, DS-MODAL-006, LOOKALIKE-008 (checked by detectors)
global     183 cross-cutting rules in vois-tokens apply as well
missing    none
```

That is the real output today, with long rule lines cut here for width (the tool prints them whole).

Target: at most 40 lines for one component (a test enforces it). Today they run 6 to 25. `--full` adds the card's rows and the job rationale (progressive disclosure, level 2 and 3). `--json` gives the same data for tools.

## 6. Interface

```
node vois-components/scripts/query.mjs Dialog                  # build path, by any name or alias
node vois-components/scripts/query.mjs --jobs                  # the 24 jobs, for the model to choose from
node vois-components/scripts/query.mjs --job JOB-CONFIRM-DESTRUCTIVE --job JOB-DATA-ENTRY
node vois-components/scripts/query.mjs --id DS-MODAL-004       # rule, BHV row, LOOKALIKE or JOB id
node vois-components/scripts/query.mjs --audit                 # coverage and gaps
node vois-components/scripts/retrieval.mjs [--write]           # check, or rebuild, the index
```

Names resolve case-insensitively against `id`, `inventory`, `shadcn` and `registry` (`alert-dialog`, `AlertDialog`, `Alert Dialog`, `vois-alert-dialog`). A name two components share resolves to the one whose registry item it is (`toggle group` is Toggle, whose item is `vois-toggle-group`), and comes back ambiguous otherwise.

## 7. Integrity checks

`retrieval.mjs` (check mode, in CI) fails when:

1. The committed index differs from a fresh build.
2. A `card` names a file that does not exist, or two components claim the same card, or a card has no component.
3. A `ruleScopes` category does not exist in `vois-rules.json`, or names a component that is not in `component-names.json`.
4. A `registry` value names an item missing from `registry/registry.json` (skipped where the registry folder is absent, as in an install).
5. A rule cited by a card or a lookalike row does not exist.
6. Component ids or aliases collide (two components answer to the same name).

`--audit` reports, without failing: jobs that name no known component, components with no card, components with no registry item, and components no job names.

`retrieval.test.mjs` breaks each input in a copy and expects the check to fail, per the repo's "guards need a test from the other side" rule. It also covers whole-word matching (`Dialog` must not match inside `AlertDialog`) and alias lookup.

## 8. Rollout

| Phase | Work | Gate to move on |
|---|---|---|
| 0. Baseline | Measure today's tokens and lookups per task on 30 to 40 tasks: the `vois-eval` scenarios, about 10 held-out tasks from real tickets, and about 10 adversarial ones (indirect wording, near neighbors). Someone other than the mapping author writes the held-out set. | Baseline recorded |
| 1. Build | Authored links, index, `query.mjs`, integrity checks, tests. Both repos. No `SKILL.md` change. | CI green, second review |
| 2. Prove | Run the corpus with a one-line instruction to use `query.mjs`. Compare with the baseline. | Required-rule recall ≥ 95% on held-out tasks, eval score not lower, median packet ≤ 40 lines |
| 3. Thin | Remove redundant model-facing text from `vois-components/SKILL.md` only. Re-run the corpus. | Same gate as Phase 2 |
| 4. Expand | `vois-fields`, then `vois-patterns`. Trigger phrases or a matcher only if job picks fail. | Per skill |

The `vois-eval` scenarios are quoted from the decision trees, so they share the jobs' wording and will pass almost by default. Treat them as a smoke test. The held-out and adversarial sets are the evidence.

Metrics kept for the pilot: required-rule recall, packet size, rate of `ambiguous` plus `no_match`, and eval score. The rest from rev 3 wait until there is data.

## 9. Mirror

`vois-components` is a design system skill, so `vois-skills` is canonical. The same `query.mjs`, `retrieval.mjs`, test and generated index go to `ommakes/Skills` after the private change merges. `check-mirror.mjs` already fails when shared rule data differs; it gains `vois-components/scripts/retrieval.mjs`, `query.mjs` and the index in its list of files that must match. The public script never calls MCP. `vois-router` stays premium and optional: retrieval takes a component or job directly, so it works with or without a router in front.

## 10. Open questions

1. Who writes the held-out and adversarial tasks? Best source: real tickets from a design team, not the decision trees.
2. Should `query.mjs` print the full card by default for a carded component, or only the counts? The pilot prints counts; Phase 2 will show whether models then open the card anyway (a second lookup).
3. When two jobs recommend different components for the same need, the packet lists both with their job. Is that enough, or should it mark a conflict explicitly? Decide after Phase 2.

## 11. Implementation plan (Phase 1)

1. `component-names.json`: add `card` to the components with a behavior card (12 on `main`; Progress, Separator and InputOTP join when the registry 0.31.0 batch lands), and a top-level `ruleScopes` (`DS-MODAL`: Dialog, AlertDialog, Drawer, Sheet; `DS-TABLE`: Table; `DS-PANEL`: Sheet, Drawer).
2. `vois-components/scripts/retrieval.mjs`: build the index from `component-names.json`, `components-rules.json`, `behaviors/*.json` and `../vois-tokens/data/vois-rules.json`. `--write` writes it; the default checks it and runs the integrity checks.
3. `vois-components/scripts/query.mjs`: reads only the index. Build, pick, id and audit modes, text and `--json` output, exit codes per section 4.5.
4. `vois-components/scripts/retrieval.test.mjs`: the guards from section 7, each from the other side.
5. CI: add both commands to `CLAUDE.md` and `.github/workflows/design-system-checks.yml`.
6. Docs: `vois-components/README.md` section, CHANGELOG, version bump, `skills.json`. `SKILL.md` gets only its version line.
7. Port to `ommakes/Skills` and extend `check-mirror.mjs`.

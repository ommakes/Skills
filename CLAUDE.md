# Working in this repo

Short notes for anyone (human or agent) changing validators, detectors, or the rule data. They come from review findings we have already had to fix once.

## Before every push

Run what CI runs:

```
node scripts/check-rule-sync.mjs
python3 scripts/check-routing.py
bash scripts/validate-skills.sh
node vois-tokens/scripts/detect.test.mjs
node vois-teams/scripts/validate.test.mjs
node vois-teams/scripts/validate.mjs all
node vois-eval/check-scenarios.mjs
node vois-eval/lookalike-pass/scan.test.mjs
node vois-dataviz/scripts/dataviz.test.mjs
node scripts/check-mirror.mjs --private <path to a checkout of ommakes/vois-skills>
```

Then read your own diff as if someone else wrote it, looking for the classes below. For anything that touches a validator, detector or regex, get a second set of eyes (a `/code-review` run or a fresh subagent that has not seen your reasoning) before pushing. Every Bugbot round so far found things the author could have found by reading the diff once more.

## Checklist for a validator, detector or regex

- **Equality.** What does "equal" mean for each value? Sets are unordered (`[4,8]` equals `[8,4]`). Compare a canonical form, not raw JSON.
- **Identity.** Which fields identify something, and is each one checked for uniqueness? Every id field, not just the first one you thought of, and across files as well as inside one.
- **Matching text.** A match string must hit exactly once, and must not hit inside a longer number or word (`8` inside `80`, `2 to 5` inside a rationale).
- **Patterns.** Does each pattern match where intended and nowhere else? Try a different order, separator, casing, empty value, null, and a very long input. `[^>]*` stops at the `>` in `=>`. A substring test like "contains load" also matches `setUploadSuccess`. A name test like `title=` also matches `data-title=`.
- **Paths and globs.** Test root-relative, `./`, leading `/`, absolute and Windows (`\`) paths. If a validator and a hook both read the same globs, they must share one definition (braces, folder-covers-contents, case). A change to one means a change to the other.
- **Bad config fails closed.** A malformed scope, schema or value must make the rule stricter or skipped, never wider. Never let a wrong type turn into "applies everywhere".
- **Guards need a test from the other side.** For each guard, write the input that tries to get past it from an unexpected direction, and watch the test fail without the guard.
- **Claims in docs and rule text.** Counts, version numbers and "the check does X" sentences must be checked against the code. If the row says it flags `x`, run it on `x`.

## Experiments that break things

Mutation tests ("what if I remove this guard") run in a copy or a `git worktree`, never in the working tree with uncommitted edits. Do not use `git checkout <file>` to undo an experiment, and never open a file for writing in the same expression that reads it (`open(p,"w").write(open(p).read())` empties the file). Commit first, then experiment.

## Conventions

- For the Vois design system skills (`vois-tokens`, `vois-patterns`, `vois-components`, `vois-dataviz`, `righter`), `ommakes/vois-skills` (private) is canonical. Change the rules, the detector and the premium wording there first. This repo is the standalone mirror: it must work without the Vois MCP.
- Port to this repo after the private change merges. `scripts/check-mirror.mjs` checks the mirror. It fails when the shared detector code differs, when a rule ID or its content differs outside the named exceptions in `ALLOWED`, or when a public skill presents an MCP call as required. Run it with `--private <path to a checkout of ommakes/vois-skills>`. CI does this with a read-only token.
- Public must never gain a required MCP call. If a change needs the MCP, the premium wording goes in the private repo only.
- Other skills in this repo (`design-ask`, `design-rationale`, `conversion-patterns`, `metrics-tagging`, and the rest) keep the public repo as their source.
- Branch from `main`, open a draft PR against `main`, and do not stack PR bases. Do not merge your own PRs.
- Bump the skill version and write a CHANGELOG entry for any change to a skill's behavior, and update `skills.json`, the README version line and the Figma edition frontmatter together.
- Tunable limits live in `vois-teams/data/ranges.json`; the hook's `TUNABLES` in `vois-tokens/scripts/team-overrides.mjs` must match it (a test checks).

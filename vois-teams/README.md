# Team overrides and base-change proposals

The Vois rules are one base that every team inherits. This folder is how a team changes that base for itself, and how a team asks to change it for everyone. It starts with one team and is built for several.

## Which one do I use

| I want to... | Use | Where it goes |
|---|---|---|
| Tighten a limit for my team, such as a shorter animation ceiling | Team override, `restrict` | `.vois/teams/<team>.json` in my repo |
| Pick my own value where the base leaves a range open, such as the icon stroke width | Team override, `refine` | same file |
| Add a rule only my team needs | Team override, `add` | same file |
| Change a rule so every team gets it | Base-change proposal | a `BCP-` file in `vois-teams/proposals/` in the skills repo |
| Loosen a rule, even just for my team | Base-change proposal, kind `relax` | same |
| Quiet the per-edit hook about one rule in my project | `hook-admin.mjs ignore-rule`, see `vois-tokens/references/hooks.md` | `.vois/config.json` |

The test for override or proposal: should every team inherit this? If yes, it is a proposal. If only your team needs it, it is an override. An override can add, tighten or choose. It can never loosen. If your team needs an exception to a base rule, the rule is either wrong for everyone, which is a proposal, or your team is the exception, and the answer is to ask.

The hook ignore list is a different thing. It silences a check in your editor. It does not change what the design rule requires, and it only exists for the checks the hook runs.

## A team override file

One file per team, at `.vois/teams/<team>.json` in that team's repo. The file name is the team id.

```json
{
  "schema": "vois-team-override/1",
  "team": "payments",
  "scope": { "paths": ["apps/payments/**"] },
  "overrides": [
    { "id": "payments-001", "op": "restrict", "rule": "DS-ANIMATION-001", "param": "max_duration_ms", "value": 200,
      "reason": "Checkout steps should feel instant on slow devices." }
  ]
}
```

`examples/payments.json` and `examples/growth.json` are complete files.

- `team`: 2 to 31 lowercase letters, digits or hyphens, starting with a letter.
- `scope.paths`: optional path globs the team's overrides apply to, relative to the project root. Leave it out for a repo with one team and the overrides apply everywhere. A glob can use `**` (any folders), `*` and `?` (inside one folder) and `{a,b}`. A folder name such as `apps/payments` covers everything under it. A leading `./` or `/` is ignored and `\` counts as `/`. Extglobs such as `@(a|b)` are rejected, and any other character is matched literally. Matching is case sensitive in the hook.
- Every override has an `id` like `payments-001` and a `reason` of at least 12 characters that says why this team needs it.

### The three ops

| Op | What it does | The check |
|---|---|---|
| `restrict` | Tightens a limit the base marks as tunable, in its stricter direction | The value must be on the stricter side of the base and inside the allowed range |
| `refine` | Chooses a value for a limit that has no stricter direction, such as a stroke width | The value must be inside the allowed range |
| `add` | Adds a rule that only this team has | The id is `TEAM-<TEAM>-nnn`, it must not reuse a base id, and it needs `text`, `severity` and, optionally, `enforcement`, `extends` and `applies_when` |

There is no op that loosens. `relax`, `disable`, `ignore`, `exempt`, `waive` and `remove` are rejected with a pointer to the proposal flow. An `add` rule can be stricter than the base. The validator can't tell whether it contradicts a base rule, so a reviewer has to.

### Several teams

Each team has its own file. When more than one file is validated together:

- Team ids must be unique.
- Two teams whose scopes overlap cannot set the same limit to different values. A team with no scope covers the whole repo, so it overlaps everything. Scopes are compared by the text before the first wildcard, after dropping a leading `./` or `/`, turning `\` into `/` and ignoring case, which is conservative: `apps/payments/**` and `apps/payments/checkout/**` count as overlapping.
- Teams with separate scopes can set the same limit differently. That is the point.

## Which limits a team can change

Only limits listed in `data/ranges.json`. Each entry has a base value, a stricter direction, and the range a team can pick from. One entry can also say it must stay at or above another (`at_least`): the large-element animation ceiling can't drop below the default one. `match` is text that must appear in the base rule, so reword or renumber a rule and the check fails until the entry is updated.

| Rule | Param | Base | Stricter | Allowed |
|---|---|---|---|---|
| `DS-ANIMATION-001` | `max_duration_ms` | 300 ms | lower | 100 to 300 |
| `DS-ANIMATION-002` | `max_duration_ms` | 500 ms | lower | 200 to 500 |
| `DS-ANIMATION-005` | `min_start_scale` | 0.9 | higher | 0.9 to 1 |
| `DS-ANIMATION-008` | `min_press_scale` | 0.95 | higher | 0.95 to 1 |
| `DS-A11Y-004` | `min_contrast_normal_text` | 4.5 | higher | 4.5 to 7 |
| `DS-A11Y-004` | `min_contrast_large_text_and_ui` | 3 | higher | 3 to 4.5 |
| `DS-TYPOGRAPHY-001` | `max_text_styles` | 3 | lower | 1 to 3 |
| `DS-TYPOGRAPHY-008` | `max_text_width_ch` | 65 ch | lower | 40 to 65 |
| `DS-MKT-002` | `min_display_font_size_px` | 28 px | higher | 28 to 48 |
| `DS-MKT-005` | `max_marketing_body_width_ch` | 56 ch | lower | 40 to 56 |
| `DS-MKT-008` | `max_section_gap_px` | 240 px | lower | 96 to 240 |
| `DS-CSS-003` | `max_selector_nesting` | 2 | lower | 1 to 2 |
| `DS-ICON-001` | `stroke_width_px` | 1.5 px | none (refine) | 1 to 2 |
| `DS-SPACING-001` | `spacing_divisors` | [4, 8] | subset | a subset of [4, 8] |
| `DS-ICON-002` | `icon_sizes_px` | [16, 20, 24, 32] | subset | a subset of [16, 20, 24, 32] |
| `DS-RESPONSIVE-002` | `test_breakpoints_px` | [640, 768, 1024] | superset | the base plus any of [1280, 1536] |
| `JOB-MULTISTEP-GUIDE` | `stepper_max_steps` | 5 | lower | 2 to 5 |
| `JOB-CHOOSE-FROM-LIST` | `select_max_items` | 8 | lower | 4 to 8 |
| `JOB-DISPLAY-DATA` | `table_max_rows` | 100 | lower | 25 to 100 |
| `JOB-CONTEXTUAL-INFO` | `tooltip_max_words` | 25 | lower | 5 to 25 |
| `JOB-EXPOSE-ACTIONS` | `max_visible_actions` | 3 | lower | 2 to 3 |
| `JOB-OVERLAY-INTERACTION` | `dialog_max_fields` | 4 | lower | 1 to 4 |
| `JOB-SWITCH-VIEWS` | `segmented_max_options` | 4 | lower | 2 to 4 |

### Numeric rules that are not tunable, and why

Most numbers in the base rules are not limits.

- **Rules of thumb and ratios**: `DS-COLOR-004` (60/30/10), `DS-SURFACE-004`, `DS-SURFACE-005`, `DS-SURFACE-009`, `DS-SURFACE-011` (nudges of a few pixels, a stagger), `DS-MKT-006` (gap ratios), `DS-SURFACE-002` (a 24px judgment line). Making these tunable would suggest they are limits.
- **A table of values**: `DS-MKT-004` is a type scale, and is stated as a starting point.
- **Bound to a workspace token**: `DS-A11Y-001` is `var(--hit-area-min)`, which the workspace sets.
- **A threshold shared by two rules**: `PATH-A-DEPTH-SHALLOW` and `PATH-A-DEPTH-DEEP`, the three `PATH-C` form sizes, the column counts across `PATH-B-SIMPLE`, `PATH-B-COMPLEX`, `PATH-B-NARROW` and `PATH-TABLE-NARROW-ROW`, the 8-field Sheet line (`JOB-OVERLAY-INTERACTION` and `PATH-B-ROW-OPEN`), and the page sizes (`JOB-DISPLAY-DATA` and `PATH-B-SIMPLE`). Moving the number in one rule leaves a gap or an overlap in the other, so they need a base change.
- **Layout mechanics**: `DS-TABLE-006` z-index values and `DS-TABLE-008` container width.

## Base-change proposals

For a change every team should inherit. One file per proposal in `proposals/`, named `BCP-001.json`. `examples/BCP-000.json` is a worked example.

```json
{
  "schema": "vois-base-proposal/1",
  "id": "BCP-001",
  "from_team": "payments",
  "created": "2026-10-06",
  "status": "open",
  "rule": "DS-ANIMATION-001",
  "change": { "kind": "value", "param": "max_duration_ms", "from": 300, "to": 250 },
  "reason": "Three teams already restrict this limit to 250ms or less.",
  "why_everyone": "Every product team ships the same slow-device paths."
}
```

| `change.kind` | Needs |
|---|---|
| `value` | `param`, `from`, `to`. `from` must equal the current base while the proposal is open. A `to` outside the current range is a warning, because the range changes too |
| `text` | `from`, the exact words in the rule now, and `to` |
| `new-rule` | `text` and `severity`, and no `rule` that already exists |
| `relax` | `summary`, and `evidence` (links, scenario ids or run notes that show the rule is wrong or costs too much) |
| `remove` | the same as `relax` |

Every proposal needs `why_everyone`, one or two sentences on why all teams should get it. Status is `open`, `accepted`, `rejected` or `withdrawn`. `accepted` needs `resolved_in` (for example `vois-tokens 1.20.0`) and `rejected` needs `decision_note`. The owner of the base decides. Merging a proposal does not change the rule: the change is a separate edit to the skill, with its own version bump.

When a base value moves, a team override that is now looser than the new base fails validation, and the team updates it.

## Running the checks

```bash
node vois-teams/scripts/validate.mjs all                         # ranges, examples, proposals
node vois-teams/scripts/validate.mjs check .vois/teams           # a team's override files
node vois-teams/scripts/validate.mjs check .vois/teams --skills-dir /path/to/skills
node vois-teams/scripts/validate.test.mjs                        # the tests
```

Run `all` and the tests in CI for this repo. A team repo runs `check` on `.vois/teams` and passes `--skills-dir` when the skills are installed somewhere else. Errors exit 1.

## What this does not do yet

- **Only four limits are checked.** The `vois-tokens` hook reads `.vois/teams` and applies a team's value for `DS-ANIMATION-001` and `DS-ANIMATION-002` (animation ceilings), `DS-ANIMATION-008` (press scale) and `DS-SPACING-001` (spacing divisors). The other limits in `ranges.json` can be set, but the hook has no detector for them. Contrast, text width and the component thresholds are still judged by reading. `vois-tokens/references/hooks.md` has the details.
- **No server side.** Overrides live in each team's repo. Nothing stops a hand edit past the validator, so run it in CI.
- **Added rules are text.** An `add` rule is read by people and agents. Only the base rules the hook knows get a mechanical check.

## Why the ranges are in one file

The limits could sit on each rule in the three skills' data files. That means editing three skills and bumping three versions. A single file, tied to the base text by `match`, did the same job without touching them. Moving each entry onto its rule later is mechanical.

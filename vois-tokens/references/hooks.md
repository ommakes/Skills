# Automated Checks `[DS-HOOKS]`

A subset of this skill's Pre-Submit Checklist is mechanically verifiable — no LLM judgment required. `scripts/detect.mjs` checks those rules deterministically with regex/string matching (no dependencies, no AST parser) and can be wired into a hook that fires automatically on every file edit in Claude Code, Cursor, or Codex.

**This is purely additive.** It catches violations the instant they're written — seconds after generation, inside the same harness that wrote the code. It does not replace this checklist (most rules still require visual/layout judgment an LLM provides), and it does not touch, call, or compete with the separate GitHub-integrated token-drift app that reconciles raw values against the live token list on its own schedule. The hook only ever writes new files under the consumer project's `.vois/` directory; it never edits token source files and never calls GitHub.

## What's auto-verified vs. judgment-only

| `[DS-*]` ID | Mechanically checked? | Notes |
|---|---|---|
| `DS-COLOR-001` | Yes — advisory only | Hardcoded hex. Tiered `quality`, never blocks — overlaps with the token-drift app's job; this hook just flags fast mid-generation. |
| `DS-COLOR-002` | Yes — advisory only | Raw Tailwind palette class. Same advisory-only reasoning as `DS-COLOR-001`. |
| `DS-A11Y-003` | Yes | `outline: none`/`outline-none` without a nearby `:focus-visible`. |
| `DS-A11Y-010` | Yes | `<img>` missing `alt`. |
| `DS-A11Y-012` | Yes | Consecutive `<br>` used for spacing. |
| `DS-SPACING-001` | Yes | Arbitrary bracket value (`p-[13px]`) not divisible by 4. |
| `DS-TAILWIND-004` | Yes — blockable | `!important`. High-confidence enough to deny in Cursor. |
| `DS-TAILWIND-005` | Yes | `transition: all` / `transition-all`. |
| `DS-ANIMATION-001` | Yes | Duration over 300ms (500ms ceiling). |
| `DS-ANIMATION-004` | Yes | Animation/transition present with no `prefers-reduced-motion` anywhere in the file. |
| `DS-ANIMATION-005` | Yes — blockable | Animating from `scale(0)`. High-confidence enough to deny in Cursor. |
| `DS-ANIMATION-008` | Yes | Press/active scale below `0.95`. |
| `DS-ANIMATION-009` | Yes | `will-change` on a disallowed property. |
| `DS-LAYOUT-001` | Yes | `vh`/`h-screen` instead of `svh`/`dvh`/`lvh`. |
| `DS-TYPOGRAPHY-009` | Yes | Three-period ellipsis instead of `…`. |
| `DS-CSS-002` | Yes | `#id` selector used for styling. |
| `DS-CSS-007` | Yes | Hand-authored `@media` query in `px`. |
| `DS-MODAL-001`/`002` | Yes | Custom (non-Radix) Dialog/Modal missing `inert` or `overscroll-behavior: contain`. |
| Everything else in the Pre-Submit Checklist | No — judgment only | Touch-target sizing, contrast ratios, optical alignment, 60/30/10 color distribution, concentric radius, `div`-onClick-without-role, enter/exit choreography, and similar require layout/contrast computation or visual judgment a regex can't do. Keep grading these by reading the code, the way this skill always has. |

## Setup

Run `hook-admin.mjs` from inside your **own project** (the consumer of this skill), not from this skills repo:

```bash
node /path/to/Skills/vois-tokens/scripts/hook-admin.mjs install --harness all
```

`--harness` accepts `claude`, `cursor`, `codex`, or `all` (default). This writes:

- `.vois/config.json` (commit this — shared team config) with sane defaults if it doesn't exist yet.
- `.vois/.gitignore` ignoring `config.local.json` (personal overrides) and `hook-cache.json` (session-local dedup cache).
- The hook entry in whichever harness manifest(s) you asked for:
  - **Claude Code / Codex** — `.claude/settings.json` / `.codex/hooks.json`, `PostToolUse` on `Edit|Write|MultiEdit`, running `hook.mjs`. Non-blocking — it always exits 0 and only prints a nudge into the agent's context.
  - **Cursor** — `.cursor/hooks.json`, `beforeEdit`, running `hook-before-edit.mjs`. Blocking, but only for the two `slop`-severity rules (`DS-TAILWIND-004`, `DS-ANIMATION-005`) — everything else is advisory even here.

The exact JSON contract shapes for Cursor's and Codex's hook manifests are ported from [pbakaus/impeccable](https://github.com/pbakaus/impeccable)'s shipping implementation for these three harnesses rather than independently re-derived from each harness's current docs in this session. If a harness has since changed its hook contract, treat the generated manifest as a starting point and adjust the command/matcher shape to match.

## Living with the hook

A hook that nags forever gets disabled. This one is designed not to:

- **Session dedup** — a finding is only reported once per file per session; a second nudge only appears if the finding is still there several edits later (as a "still unresolved" reminder, not a repeat of the original).
- **Suppression after 6 edits** — if a file gets 6+ edits with an outstanding finding still present, the hook stops nudging about that file and tells you how to silence it for good.
- **Denial-fatigue downgrade (Cursor only)** — after 3 consecutive blocks on the same (file, rule) pair, the hook stops blocking and downgrades to an advisory nudge instead. A single rule can never deadlock the agent.

## Managing exceptions

Run these from inside your project, same as `install`:

```bash
node /path/to/Skills/vois-tokens/scripts/hook-admin.mjs status
node /path/to/Skills/vois-tokens/scripts/hook-admin.mjs on
node /path/to/Skills/vois-tokens/scripts/hook-admin.mjs off
node /path/to/Skills/vois-tokens/scripts/hook-admin.mjs ignore-rule DS-TAILWIND-005 --shared
node /path/to/Skills/vois-tokens/scripts/hook-admin.mjs ignore-file "src/legacy/**" --local
node /path/to/Skills/vois-tokens/scripts/hook-admin.mjs ignore-value DS-COLOR-001 "#FAFAFA" --shared
node /path/to/Skills/vois-tokens/scripts/hook-admin.mjs reset
```

- `--shared` writes to `.vois/config.json` (commit it — applies to everyone on the project).
- `--local` writes to `.vois/config.local.json` (gitignored — your personal overrides, e.g. a rule you're temporarily disabling while migrating a legacy area).
- `reset` clears the session cache (dedup state, edit counts, block counts) without touching your ignore lists.

## Running the detector standalone

Useful in CI, in `vois-loop`'s validate step, or to spot-check a file by hand:

```bash
node /path/to/Skills/vois-tokens/scripts/detect.mjs path/to/file.tsx [more files...]
```

Prints JSON findings (`ruleId`, `severity`, `file`, `line`, `snippet`, `message`, `fixHint`) to stdout. This is the raw detector — it does not consult `.vois/config.json`'s ignore lists; that filtering happens in the hook layer (`hook-lib.mjs`), not here, so CI and ad-hoc runs always see every mechanical finding.

# Changelog

All notable changes to the Vois Tokens skill are documented here.

---

## [1.23.1] - 2026-10-10

### Fixed

- **`surfaces.md` did not read tokens only, as 1.23.0 said.** The card hover still used `ease-out` and the exit example still used `easeIn`, both literal curves against `DS-MOTION-001`. They now use `var(--motion-ease-standard)` and `motionEase.standard`. The Motion snippets also had no import for `motionDuration`, `motionDistance`, `motionEase` or `motionSpring`, so copied code did not compile. Each now imports from `motion-tokens.ts`.
- The enter example's stagger reuses the `instant` duration token as the gap between chunks. The file now says so, and says a different gap belongs in the token file, not in the component.

### Notes

- No rule or token changed.
- **Version bump:** `1.23.0` → `1.23.1`

---

## [1.23.0] - 2026-10-09

### Added

- **Five motion rules** in `references/animation.md` and `data/vois-rules.json`: `DS-MOTION-003` (a morph runs inside one duration token, never out then in), `DS-MOTION-004` (a tray is one container that stays mounted between steps), `DS-MOTION-005` (content a travelling element leaves behind blurs at most the `DS-SURFACE-014` value, and the traveller never blurs), `DS-MOTION-006` (springs at `bounce: 0` with a token, and a retargeted transition continues from its current velocity), `DS-MOTION-007` (delight never gates the task, loops pause under reduced motion, one-off effects play once).
- **A `motion-tokens.ts` starter** with `motionDuration`, `motionEase` and `motionSpring`, so the TypeScript side of the tokens has a named home.
- **Five checklist lines** in `SKILL.md`, one per new rule.

### Changed

- **The spring contradiction is resolved.** `animation.md` said springs are native iOS patterns, not web UI, while `surfaces.md` required a spring for icon swaps. Springs are now allowed on the web at `bounce: 0` with a token duration, and the iOS line is gone.
- **`surfaces.md` no longer holds literal motion values.** The icon transition uses `motionSpring.standard` (its duration is now the base token, 250ms, where it was a literal 0.3s). The card hover, enter and exit snippets and the no-library fallback read tokens too: the 100ms stagger is `motionDuration.instant` and the 12px travel is a new `motionDistance.short` in the TypeScript token starter. They broke `DS-MOTION-001`. Prose that describes a stagger (about 80ms per word) is guidance, not code, and is unchanged.
- `DS-SURFACE-014` points to the icon morph spec for declared pairs (`menu` to `close`, `close` to `back`) and keeps the crossfade for everything else.

### Notes

- No detector change. The new rules are advisory.
- **Version bump:** `1.22.1` → `1.23.0`

---

## [1.22.1] - 2026-10-09

### Added

- **Tailwind v4 notes** in `references/animation.md`. `--ease-*` and `--default-transition-*` are theme variables, but there is no `--duration-*` namespace, so a class such as `duration-fast` generates no CSS and raises no error. Use `duration-[var(--motion-duration-fast)]`, and check the computed `transition-duration` after a build.

### Notes

- No rule or token changed.
- **Version bump:** `1.22.0` → `1.22.1`

---

## [1.22.0] - 2026-10-09

### Added

- **`--motion-distance-short`** is now a named motion token in `references/animation.md`. The morph specs already used it for the label morph's rise and the directional slide, but the token list did not name it and no value was given.
- **A starter token file** in `references/animation.md` with starting values for every motion token (durations 100, 150, 250 and 400ms; the two easings reuse the existing ease-out-quart and ease-out-quint curves; distance 12px, with 8px to 16px as the range). Before, the file gave names only, so a project with no token source had no values to start from.

### Changed

- The "names only" sentence now says values live in the project's token file, and points to the starter file when there is none. No rule text changed.
- **Version bump:** `1.21.1` → `1.22.0`

---

## [1.21.1] - 2026-10-09

### Changed

- **Pointers to the motion guidance.** The `references/animation.md` row in `SKILL.md` now points at `vois-patterns/references/motion.md` (when to morph) and `vois-components/references/motion-morphs.md` (morph specs). No rule or token changed.
- **Version bump:** `1.21.0` → `1.21.1`

---

## [1.21.0] - 2026-10-08

### Added

- **`DS-MOTION-001`: literal timing and curves.** Flags a literal duration, `cubic-bezier(...)` curve, or numeric easing array in code or CSS, in Tailwind (`duration-[150ms]`, `duration-200`), CSS (`transition: opacity 150ms`, `animation-duration`), Motion (`duration: 0.2`, `ease: [...]`), and StyleX (`transitionDuration: "150ms"`) spellings. Zero is allowed for reduced motion. Token references (`var(--motion-duration-fast)`) pass. A file named `motion-tokens.{css,scss,ts,js}` (or a leading-underscore SCSS partial, `_motion-tokens.scss`) may define literal values, but usage there is still checked, and a file with a `transition={{...}}` JSX prop is not exempt. `tokens.css` and `my-motion-tokens.ts` are checked like any other file. Outside that file, any custom property or SCSS variable holding a time or curve is flagged, under any name, along with inline-style and `setProperty` definitions.
- **`DS-MOTION-002`: slow duration for large elements.** The slow duration token is for drawers, sheets, and modals entering only. Judgment only, no detector.
- **Motion Tokens section in `references/animation.md`** with the token names and the token-file rule. The names are listed here; values stay in the project's token source.

### Changed

- **Examples in `references/animation.md` use token references** instead of literal `150ms`, `200ms`, and `duration: 0.2`.
- **Clean fixture `good.tsx`** uses `duration-[var(--motion-duration-base)]` instead of `duration-200`.
- **Version bump:** `1.20.2` → `1.21.0`

### Notes

- `DS-MOTION-001` flags a literal duration even when it is under 300ms. A 150ms literal is a token violation, not a speed violation, so it is flagged. Existing `DS-ANIMATION-001` still catches anything over the ceiling.
- Named easing keywords (`ease-out`, `linear`) are not flagged. The detector checks numbers and `cubic-bezier(...)` only.
- `0.01ms` is allowed. It is the reduced-motion override in `references/animation.md`, not a motion value. Zero is allowed too.
- `duration:` and `delay:` keys count only when the word `transition` appears in the text just before them, so `toast({ duration: 3000 })` passes. `transition-colors` is a class name and does not count.
- Limits: a plain JS object of durations (`motionDuration = { fast: 0.15 }`) outside the token file is not detected, and a basename match exempts `motion-tokens.*` in any directory. Generated files (for example a copy of a framework theme) are flagged; exclude them in your ignore list.

---

## [1.20.2] - 2026-10-07

### Fixed

- **`DS-TABLE-001` was quadratic on a large file with no braces.** Finding CSS-style blocks used a regex that rescanned every brace-free run from each start position, so 165KB of plain text took 43 seconds and could stall the per-edit hook. A one-pass scanner (`cssBlocks`) replaces it. A randomized test checks it finds the same blocks as the old regex, and another checks a large brace-free file stays fast.

### Changed

- **Version bump:** `1.20.1` → `1.20.2`

---

## [1.20.1] - 2026-10-07

### Fixed

A second independent review of 1.20.0 found these.

- **`LOOKALIKE-009` missed bare calls in files written without semicolons.** The "declared in this file" test ran from the first `import` to the first `;`, so a file with no semicolons counted every call as declared. It now reads one import statement. A prop or object key named `confirm` or `alert` no longer counts as a declaration, and a `//` inside a URL is not a comment.
- **Tags with an apostrophe in a comment or a regex were skipped.** `jsx-tags.mjs` now ends a JavaScript string at the end of its line, skips `/* */` and `//` comments inside braces, handles an escaped backslash, and treats JSX attribute strings as having no escapes.
- **A team value that changes nothing is not credited.** `spacing_divisors: [4]` checks the same as the base, so no finding says a team set it, and `hook-admin status` says "no change from the base". A team ceiling for `DS-ANIMATION-002` below the standard one is credited when it applies.
- A scope path of only spaces matches nothing. The scope-glob wording in `hooks.md` and `team-overrides.mjs` no longer says the validator matches globs; it only compares the text before the first wildcard.

### Changed

- **Version bump:** `1.20.0` → `1.20.1`

---

## [1.20.0] - 2026-10-07

### Added

- **The hook reads team overrides.** `hook.mjs` and `detect.mjs --root` read `<project>/.vois/teams/*.json` and check a team's files against the team's tighter limits: `DS-ANIMATION-001` and `DS-ANIMATION-002` (animation ceilings), `DS-ANIMATION-008` (press scale) and `DS-SPACING-001` (spacing divisors). Files are matched by the override file's `scope.paths`. A finding from a team limit says which team set it.
- A value that loosens the base, sits outside its range, or comes from a malformed file is ignored, so the hook never loosens. `hook-admin.mjs status` lists each team override as applied, ignored, or not checked by the hook.
- New `scripts/team-overrides.mjs`. `detect.test.mjs` covers scope matching, ignored values, several teams, the `vois-teams` payments example end to end, and a check that the hook's limits match `vois-teams/data/ranges.json`.
- `hooks.md` has a Team overrides section.
- A scope that is not `{ paths: [strings] }` skips the team file instead of widening it to the repo. Scope globs follow the validator: `{a,b}`, `[abc]`, a leading `./` or `/`, `\`, and a folder name covering its contents. `detect.mjs --root` resolves a relative file path from the current folder.

### Fixed

- **The `components/ui/` skip missed project-relative paths.** The lookalike checks skip shadcn primitives, but the check needed a separator in front of `components/`, so `components/ui/button.tsx` was not skipped when the path had no `src/` or other folder before it. Those files are where raw `<button>` and `animate-spin` belong. The check now also matches at the start of the path.

- **Lookalike detectors read JSX tags properly.** A new `scripts/jsx-tags.mjs` skips braces and quotes, so `{count >= 3}` or `{a > b ? x : y}` no longer ends a tag early. `LOOKALIKE-009` ignores functions the file declares, methods, comments and prose in JSX text. `LOOKALIKE-010` also flags amber, green and the other palette colors, not only red. `LOOKALIKE-011` ignores `data-title`. `LOOKALIKE-007` skips only exact busy-flag names and reads `3_000` and `3 * 1000`. Component imports count from any path.
- **Animation checks.** `duration-[0.6s]` and every seconds spelling are compared against the ceiling, a message no longer credits a team for the base 500ms ceiling, and `active:scale-[0.9]` is checked against the press floor.

### Changed

- **Version bump:** `1.19.0` → `1.20.0`

---

## [1.19.0] - 2026-10-06

### Added

- **Lookalike checks in the hook.** Nine rules, `LOOKALIKE-001`, `002`, `003`, `005`, `007`, `008`, `009`, `010` and `011`, flag markup that does a component's job without the component: a raw `<button>` with its own focus ring, `animate-spin`, `role="radio"`, a clickable `div`, a `setTimeout` that hides a message, a close glyph, `window.confirm`, `alert` or `prompt`, a hand-built alert box and `title=` as a tooltip. The ids are the rows of the lookalike table in `vois-components`. They are advisory only, skip `components/ui/`, and use the same ignore and dedup settings as the other rules. `LOOKALIKE-004` and `006` have no precise regex and stay judgment-only.
- `detect.test.mjs` checks that every `LOOKALIKE-*` id is a row in the table, that `components/ui/` is skipped, and the edge cases for `005`, `007` and `009`.

### Changed

- `hooks.md` no longer lists `div`-onClick-without-role as judgment-only, and has a Lookalike checks section.
- The `good.tsx` fixture uses a link for its focus-ring example, since a raw `<button>` with a focus ring is now a finding.
- **Version bump:** `1.18.1` → `1.19.0`

---

## [1.18.1] - 2026-10-06

### Fixed

- **File counts.** `SKILL.md` said the rules come from 13 files and `data/vois-rules.json` said 14. The rules come from 15: 17 reference files minus `anti-slop.md` and `hooks.md`. `README.md` said version 1.14.0.

### Changed

- **Version bump:** `1.18.0` → `1.18.1`

---

## [1.18.0] - 2026-10-06

### Added

- **Status color roles.** `DS-COLOR-008` fixes four semantic roles (`info`, `positive`, `negative`, `warning`), each with four tokens (base, `-foreground`, `-surface`, `-border`). `DS-COLOR-009` says to pick a role by meaning, and merges `destructive` into `negative`: there is no separate `destructive` token, and a destructive Button reads `--color-negative`. `success` becomes `positive`. New "Status Colors" section in `references/color.md`, a `status_roles` group in `data/tokens.json`, and a line in the Pre-Submit Checklist.
- Names only. The OKLCH values stay per workspace, as before.
- Examples in `components.md` and `stylex.md` now read `--color-negative`. The `destructive` Button variant keeps its name, since that is the shadcn API.

### Why

A lookalike pass found a status-label build that fell back to stock Badge variants because the token set had no success or warning color.

### Changed

- **Version bump:** `1.17.1` → `1.18.0`

---

## [1.17.1] - 2026-10-02

### Changed

- **`DS-SURFACE-002` and `DS-A11Y-013` metadata aligned** with the private `vois-skills` copy. `DS-SURFACE-002` now says when it applies (padding between nested surfaces exceeds 24px) instead of listing that as an exception. `DS-A11Y-013` now also says when it applies (images not in the initial viewport). Rule text and severity are unchanged.

---

## [1.17.0] - 2026-10-02

### Added

- **`references/marketing-type-and-spacing.md`** and `DS-MKT-001` to `008` (new category `DS-MKT`). A type scale and spacing for marketing surfaces only: display face for display and h2, one display per page, `56ch` body, section gaps about 4x the heading-to-content gap, and section gaps above 96px. The ratios are the rules. The pixel values are starting points: they were estimated from one reference site and tuned by eye on one mockup.
- **A "Marketing surfaces" group** in the Pre-Submit Checklist, and a note in `DS-SLOP-003` that three blocks per row is a ceiling, not a target.
- Pointers from `typography.md` and `spacing.md` to the marketing file.

### Changed

- **`DS-SLOP-009` is now a blanket ban on em dashes in shipped copy.** Before, it allowed them in editorial text and flagged only high density. This now matches `righter`'s `no-em-dashes`. The `design-previews` page for this rule was rewritten to match.
- **Version bump:** `1.16.0` → `1.17.0`

---

## [1.16.0] - 2026-10-02

### Added

- **`table_sizes` tokens** in `data/tokens.json`: `--table-header-h` (2.5rem), `--table-row-h-dense` (2rem), `--table-row-h-regular` (2.75rem, matches `--hit-area-min`), `--table-row-h-comfortable` (3.5rem).

### Changed

- **`DS-TABLE-019`** now names only those four as tokens. `--table-offset` and `--app-header-h` were listed as tokens in 1.15.0, but each page sets them, so they are not tokens. The scrollbar thumb uses an existing neutral token instead of a new `--scrollbar-thumb` (`DS-TABLE-010`).
- **`DS-TABLE-006`** replaces the invented `--z-table-*` tokens with local z values (1, 2, 3) inside `isolation: isolate` on the scroll owner, so they cannot outrank an overlay.

### Notes

- `references/elevation.md` still points at a z-index scale in `css-architecture.md` that does not exist. Left as it was, and noted here so it gets fixed on its own.

---

## [1.15.0] - 2026-10-02

### Added

- **`references/data-tables.md`** and `DS-TABLE-001` to `019` (new category `DS-TABLE`, rule count 118 to 137). One scroll owner per table: the page for a simple table, the wrapper for a complex one. Sticky header and first column, scrollbar styling with `scrollbar-width` and `scrollbar-color`, `scrollbar-gutter`, one-axis wheel lock for tables that scroll both ways, container-query layout, scroll-region accessibility, virtualization threshold.
- **Detector rule `DS-TABLE-001`** (advisory). Flags `overflow: auto clip` and `overflow-x: auto` with `overflow-y: clip`, and a scroll wrapper with no bounded block size next to a sticky `thead` or `th` in the same file. Fixtures in `bad.tsx`, `bad.css`, `good.tsx`. Known gap, documented in `adversarial.tsx`: a wrapper and a sticky header in different files.
- Pre-Submit Checklist group "Data tables" and two Common Scenarios rows.

### Notes

- Two claims were checked in Chromium before they went in. `overflow: auto clip` computes to `auto / hidden`, so it does not make a header stick to the page. `border-collapse: collapse` borders do not travel with a sticky header, but `separate` borders do.
- `DS-TABLE-019` assumes tokens that `data/tokens.json` does not have yet: `--scrollbar-thumb`, `--table-offset`, `--table-header-h`, `--app-header-h`, `--z-table-header`, `--z-table-pinned`, `--z-table-corner`, and a row height per density. The rule says to propose them, not hardcode. Adding them is a separate change.

---

## [1.14.0] - 2026-10-01

### Added

- **Width tokens and rules.** `data/tokens.json` gains `widths` (`--width-form-max`, `--width-field-max`, `--width-field-narrow`, `--width-viewport-min`, `--width-dialog-sm`, `--width-dialog-lg`, `--hit-area-min`), all in `rem`. New `DS-LAYOUT-WIDTH-001` to `004` in `references/layout-and-responsive.md` and `data/vois-rules.json`.
- **Auto-growing text fields.** `data/tokens.json` gains `text_field_lines` (`--textarea-min-lines` 3, `--textarea-max-lines` 12, `--chat-input-min-lines` 1, `--chat-input-max-lines` 8). New `DS-LAYOUT-FIELD-001` to `004`: use `field-sizing: content`, always set an explicit `inline-size`, size min and max with the `lh` unit, and wrap in `@supports` with a `rows` fallback. Rule count 110 to 118.

### Changed

- **`DS-A11Y-001`** now uses `--hit-area-min` (2.75rem). It sets the click or tap area only, never the visible size of a control. The `inset: -10px` example in `references/accessibility.md` is replaced with one sized by the token. `touch_target_minimum` in `data/tokens.json` is updated to match.
- **`SKILL.md`** checklists and Quick Reference updated for the above.
- **Version bump:** `1.13.0` → `1.14.0`

### Known gaps

- `scripts/detect.mjs` does not flag raw widths or JavaScript autosizing.
- The autosize CSS was tested in Chromium 141 only. Firefox and Safari are untested, and `resize: none` while autosizing is untested.
- `field-sizing-content` as the Tailwind v4 utility name is not confirmed against this repo's Tailwind version.

---

## [1.13.0] — 2026-09-12

### Added

- **`references/layout-and-responsive.md`** gains a "Judgment Under Constraint" subsection under `[DS-RESPONSIVE]`: `DS-RESPONSIVE-006` (preserve task hierarchy — keep primary content full-size, let secondary content absorb the constraint first) and `DS-RESPONSIVE-007` (reflow, then collapse, then hide, then shrink — in that order, never below the `DS-RESPONSIVE-004` minimums). The existing `[DS-RESPONSIVE]` rules were purely mechanical (breakpoints, touch targets, container queries); nothing addressed what to actually do when content doesn't fit. Matching entries added to `data/vois-rules.json`, and the Pre-Submit Checklist / Quick Reference in `SKILL.md` gain corresponding rows.
- **Version bump:** `1.12.0` → `1.13.0`

---

## [1.12.0] — 2026-08-29

### Added

- **StyleX support alongside Tailwind v4.** This skill now covers two implementation engines for the same design system — a workspace uses one, not both. New `references/stylex.md` (`[DS-STYLEX]`, rules `001`–`006`) covers build-plugin setup, `defineVars`/`createTheme` tokens and theming, the `stylex.create()`/`stylex.props()` variant-composition pattern that replaces `cva`, why an inline `style={{}}` prop is unsafe under StyleX, and `defineConsts` for breakpoints. `data/vois-rules.json` gains a new optional `engines` field (`["tailwind"]` or `["stylex"]`) on the handful of rules that are genuinely engine-specific (all `DS-TAILWIND-*`, `DS-COLOR-002`, the six new `DS-STYLEX-*`) — every other rule has no field and applies under either engine unchanged. `SKILL.md`'s framing, reference table, Pre-Submit Checklist, and Quick Reference are all updated to route to the right engine's reference file; the "12 files" rule-source count is now 13.
- **`scripts/registry.mjs` detects StyleX object-literal syntax alongside the existing Tailwind/CSS-string checks** for `DS-SPACING-001` (arbitrary `padding`/`margin`/`gap` values), `DS-TAILWIND-005` (`transitionProperty: "all"`), `DS-ANIMATION-001` (`transitionDuration: "Nms"`/`"Ns"`), `DS-ANIMATION-008` (a `":active"` scale key), and `DS-ANIMATION-009` (`willChange: "..."`) — these rules were previously silent on StyleX files since their regexes only matched Tailwind/hand-authored-CSS syntax. New fixture `scripts/__fixtures__/bad-stylex.tsx` and five new tests in `detect.test.mjs` cover the added branches. `references/hooks.md`'s coverage table is updated to describe what's now checked per engine.
- **`figma-editions/vois-tokens.md`** gains a condensed StyleX section and topic-index/checklist entries, matching this repo's own StyleX additions.

### Changed

- **`references/components.md`** (`DS-COMPONENT-002`, `DS-COMPONENT-005`) and their `vois-rules.json` entries reworded to name both engines' variant/architecture pattern instead of assuming Tailwind + cva.
- **`references/css-architecture.md`, `color.md`, `spacing.md`, `animation.md`, `surfaces.md`, `layout-and-responsive.md`, `tailwind-v4.md`, `anti-slop.md`** each gain a StyleX-equivalent code sample or cross-reference next to their existing Tailwind-specific example, without changing the underlying rule.
- **Version bump:** `1.11.0` → `1.12.0`

---

## [1.11.0] — 2026-08-09

### Added

- **`severity` (`required`/`recommended`/`preferred`) and `enforcement` (`blocking`/`advisory`) fields on all 102 rules in `data/vois-rules.json`.** Previously this tiering only existed for the 18 rules `scripts/registry.mjs` covers, and only there — every other rule had no machine-readable weight at all. `enforcement: "blocking"` is set on exactly the two rules `references/hooks.md` already documented as blockable in Cursor (`DS-TAILWIND-004`, `DS-ANIMATION-005`) — this codifies current behavior, it doesn't invent new blocking. `severity` follows what each source file already asserts (e.g. all `DS-A11Y-*` — accessibility.md opens "These are not optional" — and all `DS-MODAL-*` are `required`; punctuation/selector-style rules are `preferred`; everything else defaults to `recommended`).
- **`applies_when`/`does_not_apply_when` on 7 rules with a real, already-documented condition**: `DS-MODAL-001/002/003`, `DS-ANIMATION-003`, `DS-ANIMATION-009`, `DS-A11Y-013`, `DS-SURFACE-002`. E.g. the `DS-MODAL-*` condition ("custom, non-Radix implementations only") already existed as logic in `registry.mjs`'s `usesRadix` check but wasn't visible to anyone reading just the rule data. Deliberately selective — most of the 102 rules have no real conditional scope and don't get this field.
- **`scripts/__fixtures__/adversarial.{tsx,css}` + two documenting tests in `detect.test.mjs`** for a known `DS-SLOP-002` gap: the same purple→blue AI gradient spelled with arbitrary hex values (`from-[#7c3aed]`) bypasses the named-hue regex. Documented in `references/hooks.md` as a known limitation rather than fixed — recognizing hue family from raw hex needs color-space math this zero-dependency detector doesn't do.
- **`scripts/check-rule-sync.mjs` (repo root, not skill-scoped)** — a cross-reference integrity checker confirming every `[DS-*]` tag cited in `references/*.md` resolves to a real `vois-rules.json` entry and vice versa. Exists because this exact bug already shipped once (see `[1.9.1]` below, `DS-CSS-008`) with nothing in place to catch a repeat. Wired into new repo-level CI (`.github/workflows/design-system-checks.yml`), which also now runs the existing `detect.test.mjs` regression suite automatically for the first time — it previously only ran by hand.

### Changed

- **Source-of-truth note added to `SKILL.md`**: `data/vois-rules.json` is canonical for rule statements/severity/enforcement; `references/*.md` may restate for readability but the JSON wins on conflict.
- **`scripts/registry.mjs`** gains a comment clarifying that its own `severity` field (`quality`/`slop`, a detector-blocking tier) is a different, narrower vocabulary from `vois-rules.json`'s new `severity`/`enforcement` fields — they answer different questions and aren't accidental duplication. `references/hooks.md` gets the same clarification plus a note on the `DS-SLOP-002` hex-gradient gap.
- **Version bump:** `1.10.0` → `1.11.0`

---

## [1.10.0] — 2026-07-24

### Added

- **`references/anti-slop.md` — `DS-SLOP-010` (card-ifying everything).** Wrapping every static section, list, or grouped field set in its own bordered-and-shadowed card is a default AI reach. Drop shadows are a cue for interactivity and belong on things a user picks up, hovers, or acts on — not on static page sections. Visual alignment and spacing rhythm alone are usually enough to signal grouping.
- **`references/anti-slop.md` — `DS-SLOP-011` (over-styled active/selected states).** A colored left border plus a corner radius on an active sidebar/nav item is a combination that gets uglier the more it's compounded (a border and drop shadow stacked on top makes it worse). Hover, selected, and active navigation states rarely need more than a subtle background- or text-color shift.
- Both rules added to the Pre-Submit Checklist in `SKILL.md` and `references/anti-slop.md`. Judgment-only, like the rest of the `DS-SLOP-*` family — not indexed in `data/vois-rules.json`.

### Changed

- **Version bump:** `1.9.1` → `1.10.0`

---

## [1.9.1] — 2026-07-23

### Fixed

- **`references/iconography.md` — removed a dangling cross-reference.** `DS-ICON-002` cited `[DS-CSS-008]` as "the same tolerance rule as spacing," but no `DS-CSS-008` rule exists (`css-architecture.md` tops out at `DS-CSS-007`), and `spacing.md`'s actual rule (`DS-SPACING-001`) states divisibility by 4/8 with "no exceptions" — not a rounding tolerance. The claim didn't match any real rule, in either the referenced file or the one it meant to point to, so the citation and the unsupported parallel were both removed. `DS-ICON-002`'s own instruction (round to the nearest icon size) is unaffected and stands on its own.

---

## [1.9.0] — 2026-07-23

### Added

- **`data/vois-rules.json`** — every numbered `[DS-XXX-NNN]` rule from 12 of the 14 reference files (102 rules), keyed by `id`/`category`/`source_file`, so a rule can be looked up without reading the whole reference file. Includes `DS-A11Y-*` (accessibility.md, 17 rules) and `DS-LAYOUT-COMP-*` (layout-and-responsive.md, 5 rules), which existed in source but weren't in any prior extraction. `references/anti-slop.md` (`DS-SLOP-*`) and `references/hooks.md` (`DS-HOOKS`) are intentionally excluded — judgment-only content and a tool doc, not rule data — and stay Markdown-only.
- **`data/tokens.json`** — actual token values (spacing scale, type scale, easing curves, elevation shadow tiers, icon sizes, breakpoints, contrast minimums, touch target minimum), kept separate from `vois-rules.json` since rules are constraints and this is values.

### Changed

- `SKILL.md`'s Reference Files section now points to the two structured JSON files for lookups by id/category/token, ahead of the full `references/*.md` files (still there for code examples and rationale). Added missing `references/elevation.md` and `references/iconography.md` rows to the table (their rules are now indexed but the files themselves were never listed).
- **Version bump:** `1.8.0` → `1.9.0`

---

## [1.8.0] — 2026-07-21

### Changed

- **Standalone-safe:** `vois_record_rule_usage` is now optional — call it if that MCP tool is available in your environment, otherwise skip and proceed. The no-silent-changes contract's greenfield/preserve/overhaul classification is now self-contained in this skill instead of pointing to `vois-router`. This skill no longer assumes an MCP server, `vois-router`, or `vois-loop` is present — the taste-dial fallback (mid defaults 5/4/5) already covered the no-router case.
- **Version bump:** `1.7.0` → `1.8.0`

---

## [1.7.0] — 2026-07-12

### Added

- **`references/anti-slop.md` — a `[DS-SLOP]` rule family** targeting generic "AI-looking" defaults that pass every token/a11y rule but still read as slop: centered-everything heroes (`DS-SLOP-001`), the purple/indigo→blue "AI gradient" (`DS-SLOP-002`), three-identical-feature-card grids (`DS-SLOP-003`), eyebrow overuse (`DS-SLOP-004`), emoji-as-iconography (`DS-SLOP-005`), zigzag repetition (`DS-SLOP-006`), spec-sheet marketing tables (`DS-SLOP-007`), and uniform-rhythm pages (`DS-SLOP-008`). Several are gated on the new `VARIANCE` taste dial.
- **`DS-SLOP-009` — a scoped, deliberate stance on the em-dash**: encouraged in typographic/editorial contexts, flagged only as an AI tell when it saturates generated prose. Not a blanket ban; righter owns the final call on copy.
- **`DS-SLOP-002` added to the deterministic detector** (`registry.mjs`), advisory-only, covering the Tailwind `from-*`/`to-*` and CSS `linear-gradient()` forms of the AI gradient, with a distinct-hue guard so monochrome ramps don't false-positive. New fixture violations + auto-generated tests (30 total, all passing).
- **Taste-dial consumption section** in `SKILL.md`: how the `VARIANCE`/`MOTION`/`DENSITY` dials (loaded by vois-router from VOIS.md) bias spacing, animation richness, and layout — always *within* the guardrails, never overriding a safety/a11y/hard-token rule.
- **No-silent-changes contract** in the "Reviewing Existing UI" section: URLs, form field names, analytics event names, and nav labels must never change as an invisible side effect of a restyle.

### Changed

- `SKILL.md` gains an `anti-slop.md` reference row, an Anti-slop checklist block, quick-reference rows, and anti-slop + redesign-safety items in the review checklist.
- `references/hooks.md` coverage table documents `DS-SLOP-002` as auto-checked/advisory and the rest of `DS-SLOP-*` as judgment-only.
- **Version bump:** `1.6.0` → `1.7.0`

---

## [1.6.0] — 2026-06-25

### Added

- **`scripts/` — a deterministic, zero-dependency detector for the mechanically-checkable subset of the Pre-Submit Checklist** (`registry.mjs`, `detect.mjs`), plus a per-edit hook (`hook.mjs` non-blocking for Claude Code/Codex, `hook-before-edit.mjs` blocking-for-slop-only for Cursor, `hook-lib.mjs` shared config/cache/dedup) and an admin CLI (`hook-admin.mjs`) for installing the hook into a consumer project and managing ignore lists. Covers 18 rules across color, accessibility, spacing, Tailwind, animation, layout, typography, CSS, and modal safeguards — see `references/hooks.md` for the full coverage table.
- **New `references/hooks.md`** — setup per harness, the ignore-management workflow, and an explicit mechanically-verified-vs-judgment-only breakdown of the checklist.
- Fixture tests (`scripts/__fixtures__/`, `scripts/detect.test.mjs`, Node's built-in test runner — no new dependency) asserting every covered rule fires on its violation and none false-positive on clean code.

### Changed

- `SKILL.md` reference-file table gets a `hooks.md` row; added an "Automated checks" callout near the top.
- **Version bump:** `1.4.0` → `1.6.0`, correcting drift where the frontmatter had been left at `1.4.0` after the `1.5.0` content (elevation.md/iconography.md) had already shipped.

### Non-goals (by design)

- This detector is strictly additive to the existing GitHub-integrated token-drift app: it never touches token source files, never calls GitHub, and never auto-applies a fix. `DS-COLOR-001`/`DS-COLOR-002` are tiered advisory-only here specifically so this hook never competes with that app's authority over raw-value-to-token reconciliation.
- Rules requiring layout/contrast computation or visual judgment (touch-target sizing, contrast ratios, optical alignment, 60/30/10 distribution, etc.) are intentionally not covered — they stay judgment-only, as documented in `references/hooks.md`.

---

## [1.5.0] — 2026-06-17

### Added

- **Two new reference files:** `references/elevation.md` (shadow/elevation scale, modal scrim guidance, `[DS-ELEVATION]`) and `references/iconography.md` (icon sizing tied to text context, stroke-width consistency, `[DS-ICON]`).
- **Decision frameworks ("When in doubt" subsections)** added to `spacing.md`, `color.md`, `css-architecture.md`, and `layout-and-responsive.md` to disambiguate previously behavior-only rules (smaller-token tie-breaker, 60/30/10 measured by surface area, off-token rounding tolerance, `svh`/`dvh` choice, `contain-intrinsic-size` estimation).
- **New token coverage:** opacity-step scale for disabled/secondary states (`color.md`, `[DS-COLOR-008]`), border-radius scale and named z-index scale (`css-architecture.md`, `[DS-CSS-009]`/`[DS-CSS-010]`), heading-to-body spacing composition table (`typography.md`, `[DS-TYPOGRAPHY-015]`).
- Cross-linked `components.md`'s modal section to the new elevation reference (`[DS-MODAL-004]`).

### Changed

- `SKILL.md` reference-file index and Quick Reference tables updated to list the two new files and the new decision points.
- **Version bump:** `1.4.0` → `1.5.0`

---

## [1.4.0] — 2026-06-17

### Changed

- **Renamed `vois-design-system` → `vois-tokens`.** Folder, `name:` frontmatter, and all cross-references in `vois-patterns`, `vois-components`, `vois-router`, `vois-loop`, and the top-level README updated to the new name. Rule IDs (`[DS-*]`) are unchanged — only the skill name moved.
- **Version bump:** `1.3.0` → `1.4.0`

---

## [1.3.0] — 2026-06-17

### Changed

- **Structural restructure:** `SKILL.md` split from a single 845-line file into a 141-line entry point plus nine `references/` files (`spacing.md`, `tailwind-v4.md`, `color.md`, `layout-and-responsive.md`, `typography.md`, `components.md`, `accessibility.md`, `css-architecture.md`, `animation.md`). No rule content was added, removed, or reworded — every `[DS-*]` rule ID is preserved. The Pre-Submit Checklist and Quick Reference table stay in `SKILL.md` since they're consulted on every job regardless of which reference file applies.
- This enables scoped loading from `vois-router`: on a COMPONENT-ONLY route, the router can now point the skill at just `references/components.md` (and `references/animation.md` for transitions) instead of loading the full skill.
- **Version bump:** `1.2.0` → `1.3.0`

---

## [1.2.0] — 2026-06-02

### Added

**Layout Composition (`[DS-LAYOUT-COMP]`)**

A new subsection under §1 Spacing covering structural layout decisions that AI models consistently get wrong. Six rules with IDs `DS-LAYOUT-COMP-001` through `DS-LAYOUT-COMP-006`:

- Sibling spacing always belongs to the parent container via `gap`, not directional padding on child elements
- No wrapper divs without a layout purpose (flex/grid context, overflow control, stacking context, or semantic grouping)
- `min-width: 0` on flex children containing text or overflow-prone content — prevents the default `min-width: auto` from causing invisible overflow bugs
- No `width: 100%` on flex/grid children when the parent is already controlling sizing
- `aspect-ratio` over the old padding-top percentage hack for ratio-constrained containers
- `object-fit` required on any image with explicit dimensions

**Expanded Semantic HTML (`[DS-A11Y-011]` through `[DS-A11Y-017]`)**

Seven new rules added to the Semantic HTML section under §8 Accessibility:

- `<ul>`/`<ol>` for lists — not stacked `<div>` siblings
- `<br>` only for intentional content line breaks (addresses, poetry) — never for layout spacing
- `loading="lazy"` on below-the-fold images; explicitly excluded from hero and above-the-fold content
- `<time datetime="...">` for all dates and times in content
- Heading elements (`<h1>`–`<h6>`) for document structure only — not for font size control
- `<fieldset>` and `<legend>` for grouped radio and checkbox controls, with before/after examples

**Selectors and Specificity (`[DS-CSS-002]` through `[DS-CSS-006]`)**

New subsection under §10 CSS Architecture:

- No `#id` selectors for styling
- Selectors capped at 2 levels of nesting before a new class is warranted
- `:is()` for grouping selectors without multiplying specificity, with example
- `:where()` for zero-specificity base styles that are easy to override
- Separation of layout concerns (sizing, position) from visual concerns (color, border, font) in hand-authored CSS

**Media Queries (`[DS-CSS-007]`)**

New subsection under §10 CSS Architecture:

- `em` over `px` for breakpoint values in hand-authored `@media` queries — respects user browser font size preferences and scales correctly on zoom
- Reference table of common breakpoints in `em` with `px` equivalents
- Scoped to hand-authored CSS; notes that Tailwind's built-in breakpoints use `px` internally

### Changed

- **Version bump:** `1.1.0` → `1.2.0`
- **Pre-Submit Checklist:** All existing checklist items now include their `[DS-*]` rule IDs. Nine new checklist items added across Accessibility, Layout, and a new CSS section
- **Quick Reference table:** Eight new rows covering the most common situations addressed by the new rules
- **Section headers:** All section headers now include their `[DS-*]` group tag for consistency with inline rules

### Fixed

- `[DS-A11Y]` rule numbering: the Color and Meaning rule was unnumbered in v1.1.0. Assigned `[DS-A11Y-017]`

---

## [1.1.0] — initial tracked version

Core skill covering spacing, typography, color tokens, component architecture (shadcn/ui + CVA), modals, accordions, layout viewport units, Tailwind v4 migration patterns, animation timing and easing, accessibility, responsive behavior, and CSS architecture with `@layer` and `@theme`.

# Changelog

All notable changes to the Vois Tokens skill are documented here.

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

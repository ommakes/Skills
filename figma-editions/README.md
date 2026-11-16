# Figma Community Editions

Flattened, single-file `.md` builds of select skills for upload to Figma's custom skills feature (single-file only — no `scripts/`, `references/`, `assets/`, or `data/` folders).

**GitHub stays the source of truth.** These are build outputs. If the source skill changes, regenerate the file here — don't hand-edit it separately.

**Design Rationale is out of scope** — it depends on `data/principles.json` and doesn't fit Figma's single-file format without permanent, un-synced curation.

## Status

Rebuilt 2026-10-06 from the sources on `main`. `righter` was rebuilt again on 2026-11-12 (1.10.0). The three Vois editions were rebuilt on 2026-11-15 (`vois-components` 1.26.0, `vois-patterns` 1.23.0, `vois-tokens` 1.39.0, then `vois-tokens` 1.40.0 for the shadcn `popover` mapping). Each edition's frontmatter `version` is the source version it was built from.

**Behind now:** `righter.md` is built from 1.10.0 and the source is 1.11.0, so it misses the nine questionnaire copy entries in `data/components.json`. `vois-tokens.md` is built from 1.40.0 and the source is 1.42.0, so it misses the icon-button rules `DS-ICON-003` to `DS-ICON-007` (sizes, touch step-up, gap, accessible name, placement, styles), the coarse-pointer hit area in `DS-A11Y-001`, and the frosted-glass rules `DS-GLASS-001` to `DS-GLASS-010`. `vois-components.md` is built from 1.26.0 and the source is 1.27.0, so it misses the icon-only branch of `JOB-TRIGGER-ACTION` (the `ghost` and `soft` styles). `vois-patterns.md` matches its source. The editions leave out what has no Figma equivalent: the per-edit checker hooks and detectors (`DS-ELEVATION-006` and `-007` are stated as rules only), the element-to-elevation map, the registry component sources and the long motion specs. The CHANGELOGs list every change.

| Edition | Built from | Before this rebuild |
|---|---|---|
| `gtm-positioning.md` | 1.0.0 | In sync, apart from one added sentence about page-fitting copy |
| `design-ask.md` | 1.0.0 | In sync |
| `metrics-tagging.md` | 1.1.0 | 1.0.0: missed the Properties column, task-level events, and the taxonomy-bloat rules |
| `righter.md` | 1.10.0 | 1.9.0: missed the label-pair gate for motion morphs and the page-title exception in `no-pii-in-copy` |
| `vois-components.md` | 1.26.0 | 1.18.0: missed the dialog side peek and Cancel-first focus, the three questionnaire jobs, the Button `loading` prop, the 36 / 48 / 32 heights, the Stepper colors and the registry pointers |
| `vois-patterns.md` | 1.23.0 | 1.20.0: missed the dialog ladder `PATH-D-1` to `D-5`, `PATH-H`, `PATH-DENSITY-PRODUCT`, the input-keyed touch density and the six `PATH-NATIVE-*` rules |
| `vois-tokens.md` | 1.40.0 | 1.28.2: missed the Figma token names (`DS-TOKEN-*`), `notice`, the five elevation tiers and `DS-ELEVATION-003` to `012`, the shape roles, the field heights, the focus ring, the dialog and questionnaire rules, the 4 to 128 spacing scale and the z-index layers |

There is still no build script, and the four Vois and Righter editions are condensed by hand, so they fall behind whenever a source changes. A rule worth keeping: rebuild an edition in the same pass as a source version bump, or note here that it's behind.

**What the 2026-11-12 rebuild leaves out.** The long motion specs (`vois-components/references/motion-morphs.md`, `motion-context.md` and the `motion-logic.md` helper code) are not inlined. `vois-patterns.md` carries the motion decision test, morph types, tiers and anti-patterns, and `vois-components.md` carries the Tray Spec. The Mobbin references on the page templates are dropped. The editions point to the full version for each.

**Frontmatter versions.** A `version:` in an edition's frontmatter is the source version it was built from, so it moves only when the edition is rebuilt. When a source bumps and the edition is not rebuilt in the same pass, leave the frontmatter alone and mark the edition as behind in the table above.

## Community listing taglines

Frontmatter `description` fields are written to trigger correctly for an agent. These taglines are for the Figma Community listing itself — what a person scrolling Community actually reads before installing.

**GTM Positioning**
> Position your product, choose a GTM strategy, and write website copy that converts — based on Anthony Pierri's Fletch framework.

**Design Ask**
> A skill for designers who are tired of spending half a sprint figuring out what a ticket is actually asking for.
(Pulled from `design-ask/README.md` — reads better than the frontmatter description.)

**Metrics Tagging**
> Turn any screen or mockup into a ready-to-build analytics tagging plan — event names, IDs, and the business KPI each one maps to.

**Righter**
> Turn any UI copy into clear, human-sounding text — active voice, fifth-grade reading level, and a checklist that catches hedging words before they ship. (This edition doesn't cover transactional email copy — see the full version for that module.)

**Vois Components**
> Stop guessing between Dialog and Drawer, Toast and Banner — a job-to-be-done rubric for picking the right UI component every time.

**Vois Patterns**
> Structural decision trees for settings pages, forms, tables, and dialogs — the page architecture calls to make before you touch a single component.

**Vois Tokens (Rules & Values Edition)**
> A full design system reference — spacing, type scale, color, elevation, motion, and accessibility rules — presented as an adoptable reference implementation, not a live code-lookup.

## Source files

| Flattened file | Source | Lines | Dependencies found |
|---|---|---|---|
| `gtm-positioning.md` | `gtm-positioning/SKILL.md` | 222 (source) | None. One sentence that named the reference files of `righter` and `vois-patterns` now names the skills only |
| `design-ask.md` | `design-ask/SKILL.md` | 155 (source) | None (`README.md` alongside it is human-facing only, not uploaded) |
| `metrics-tagging.md` | `metrics-tagging/SKILL.md` | 272 (source, v1.1.0) | None. The source points at a project-specific `event-registry.md` ledger that lives in the user's own workspace, not in this skill (`README` alongside it is human-facing only, not uploaded) |
| `righter.md` | `righter/SKILL.md` | 518 (source, v1.10.0) | `data/components.json` (8 entries, inlined as condensed rules), `data/weakeners.json` (11 categories, inlined as a table), `data/rhetorical-devices.json` (9 devices, inlined as a table), `data/marketing-limits.json` and `references/marketing-copy.md` (slot limits, puffery list and the `mkt-*` rules, inlined as a Marketing Copy section), `references/accessibility.md` (kept as the `accessible-copy` principle only), `data/phonaesthetics.json` (inline condensed fallback kept), `scripts/ari.mjs` and `scripts/check-slots.mjs` (cut: the ARI formula and slot limits are inline), `references/email.md` + `data/email-benchmarks.json` (cut: specialized sub-case, noted with a link back), `references/tone.md`, `references/voice-chart.md`, `references/figma.md` (cut: not needed in Figma), `evals/cases.json` (cut: maintainer-only regression corpus). Em dashes removed from the prose to match `no-em-dashes`. Since the 2026-11-12 rebuild this adds the Label Pairs for Motion Morphs section |
| `vois-components.md` | `vois-components/SKILL.md` | 171 (source, v1.26.0) | `data/components-rules.json` (the sole source for the 21-job decision tree, condensed to markdown by category), `references/stepper.md` (condensed into a Stepper Spec section), and the 11-row `lookalikes` table (inlined as two tables). `vois-dataviz` is referenced, not inlined. Since the 2026-11-12 rebuild this adds the Tray Spec (condensed from `references/motion-tray.md`) and the panel roles. The other motion references are not inlined. Since the 2026-11-15 rebuild this adds the Surveys and Questionnaires jobs, the side peek and the registry pointers |
| `vois-patterns.md` | `vois-patterns/SKILL.md` | 194 (source, v1.23.0) | 14 `references/*.md` files and `data/patterns-rules.json`, condensed. Since v1.9.0 this adds Settings interactions, Table interactions, Field groups, Dialog width, PATH G (marketing pages), and the PII rules. Mobbin links and `Basis` lines are dropped; rule IDs are kept. The routing to Righter is a graceful fallback with plain UI-copy conventions for when Righter isn't installed. Since the 2026-11-12 rebuild this adds Page Templates (the 21 entries in `data/page-templates.json`, generated from it, without the Mobbin links, plus `references/page-templates.md`) and Motion (`references/motion.md`, condensed). Since the 2026-11-15 rebuild this adds the dialog ladder, `PATH-H`, native phone behavior and the density settings, and condenses the marketing templates into one table |
| `vois-tokens.md` | `vois-tokens/SKILL.md` | 348 (source, v1.40.0) | 15 rule-bearing `references/*.md` files and `data/tokens.json`, condensed. Since v1.13.0 this adds the Data Tables and Marketing Type & Spacing sections, the width and `field-sizing` rules and tokens, and the status color roles. `references/hooks.md` and the `scripts/` folder (a live per-edit hook for Claude Code, Cursor, and Codex) are cut: no Figma equivalent. `data/vois-rules.json` is dropped as a file; its rules are restated in the sections. The "Reviewing Existing UI" section is cut. Since the 2026-11-12 rebuild this adds Motion Tokens (`DS-MOTION-001` to `007`, with the starter token file) and Grid and Panels (`references/grid.md`, `DS-GRID-*` and `DS-PANEL-*`, with the default token values and the `sm`, `md` and `lg` grid class names). The 2026-11-15 rebuild rewrote the Tokens, Elevation, Shape, Components, Accessibility and Layout sections to source 1.39.0 and condensed the checklist, grid, table and motion text to make room. All 216 rule IDs of the source are present |

`gtm-positioning`, `design-ask`, and `metrics-tagging` are self-contained with no `scripts/`, `references/`, `data/`, or environment-specific MCP tool calls, so each is a direct port of its `SKILL.md` plus one link line. The other four need real rework. See the Dependencies column above for what was cut, inlined, or rewritten in each.

## Validation checklist (per file)

- [x] At most ~500 lines. `righter.md` is 492, `vois-tokens.md` 368, `vois-patterns.md` 493, `vois-components.md` 401, `metrics-tagging.md` 274, and the rest are under 225. To get under 500, section separators before `##` headings were dropped, `righter.md` had its tool-argument block, new-copy format, grade table and review checklist condensed, and `vois-tokens.md` had its topic index and the data-table, marketing and anti-slop checklist blocks replaced by pointers to their sections. No rule ID or `id` was removed
- [x] No references to `references/`, `data/`, or `scripts/` paths in the body, except pointers that say what the full version has: the top-of-file link notes in `vois-components.md`, `vois-patterns.md` and `vois-tokens.md` (which also name the motion references and `data/page-templates.json`), the `data/tokens.json` pointer in the Grid and Panels section of `vois-tokens.md`, a pricing-pages pointer in `vois-patterns.md`, and a `stylex.md` pointer in `vois-tokens.md`. None is a live dependency
- [x] No MCP tool calls that a random Figma user won't have, except Righter's `vois_get_microcopy`, which already degrades gracefully ("if available... else apply the principles in this skill") and was kept as-is, matching how the skill was already built
- [x] Frontmatter description kept (agent-trigger language); human tagline drafted above for the Community listing
- [x] One line near the top pointing back to the GitHub repo for the full version

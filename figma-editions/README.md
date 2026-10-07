# Figma Community Editions

Flattened, single-file `.md` builds of select skills for upload to Figma's custom skills feature (single-file only — no `scripts/`, `references/`, `assets/`, or `data/` folders).

**GitHub stays the source of truth.** These are build outputs. If the source skill changes, regenerate the file here — don't hand-edit it separately.

**Design Rationale is out of scope** — it depends on `data/principles.json` and doesn't fit Figma's single-file format without permanent, un-synced curation.

## Status

Rebuilt 2026-10-06 from the sources on `main`, and `vois-components` and `vois-tokens` were bumped again on 2026-10-07. Each edition's frontmatter `version` is the source version it was built from.

| Edition | Built from | Before this rebuild |
|---|---|---|
| `gtm-positioning.md` | 1.0.0 | In sync, apart from one added sentence about page-fitting copy |
| `design-ask.md` | 1.0.0 | In sync |
| `metrics-tagging.md` | 1.1.0 | 1.0.0: missed the Properties column, task-level events, and the taxonomy-bloat rules |
| `righter.md` | 1.9.0 (behind: source is 1.9.1) | 1.4.0 |
| `vois-components.md` | 1.10.3 | 1.5.0 |
| `vois-patterns.md` | 1.14.1 (behind: source is 1.14.2) | 1.9.0 |
| `vois-tokens.md` | 1.20.1 | 1.13.0 |

There is still no build script, and the four Vois and Righter editions are condensed by hand, so they fall behind whenever a source changes. A rule worth keeping: rebuild an edition in the same pass as a source version bump, or note here that it's behind.

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
| `righter.md` | `righter/SKILL.md` | 484 (source, v1.9.0; the source is now 485 lines at v1.9.1) | `data/components.json` (8 entries, inlined as condensed rules), `data/weakeners.json` (11 categories, inlined as a table), `data/rhetorical-devices.json` (9 devices, inlined as a table), `data/marketing-limits.json` and `references/marketing-copy.md` (slot limits, puffery list and the `mkt-*` rules, inlined as a Marketing Copy section), `references/accessibility.md` (kept as the `accessible-copy` principle only), `data/phonaesthetics.json` (inline condensed fallback kept), `scripts/ari.mjs` and `scripts/check-slots.mjs` (cut: the ARI formula and slot limits are inline), `references/email.md` + `data/email-benchmarks.json` (cut: specialized sub-case, noted with a link back), `references/tone.md`, `references/voice-chart.md`, `references/figma.md` (cut: not needed in Figma), `evals/cases.json` (cut: maintainer-only regression corpus). Em dashes removed from the prose to match `no-em-dashes` |
| `vois-components.md` | `vois-components/SKILL.md` | 165 (source, v1.10.3) | `data/components-rules.json` (the sole source for the 21-job decision tree, condensed to markdown by category), `references/stepper.md` (condensed into a Stepper Spec section), and the 11-row `lookalikes` table (inlined as two tables). `vois-dataviz` is referenced, not inlined |
| `vois-patterns.md` | `vois-patterns/SKILL.md` | 181 (source, v1.14.1; the source is now v1.14.2) | 14 `references/*.md` files and `data/patterns-rules.json`, condensed. Since v1.9.0 this adds Settings interactions, Table interactions, Field groups, Dialog width, PATH G (marketing pages), and the PII rules. Mobbin links and `Basis` lines are dropped; rule IDs are kept. The routing to Righter is a graceful fallback with plain UI-copy conventions for when Righter isn't installed |
| `vois-tokens.md` | `vois-tokens/SKILL.md` | 333 (source, v1.20.1) | 15 rule-bearing `references/*.md` files and `data/tokens.json`, condensed. Since v1.13.0 this adds the Data Tables and Marketing Type & Spacing sections, the width and `field-sizing` rules and tokens, and the status color roles. `references/hooks.md` and the `scripts/` folder (a live per-edit hook for Claude Code, Cursor, and Codex) are cut: no Figma equivalent. `data/vois-rules.json` is dropped as a file; its rules are restated in the sections. The "Reviewing Existing UI" section is cut |

`gtm-positioning`, `design-ask`, and `metrics-tagging` are self-contained with no `scripts/`, `references/`, `data/`, or environment-specific MCP tool calls, so each is a direct port of its `SKILL.md` plus one link line. The other four need real rework. See the Dependencies column above for what was cut, inlined, or rewritten in each.

## Validation checklist (per file)

- [ ] Under ~500 lines. Not met by `righter.md` (567 lines) and close for `vois-tokens.md` (441). The target is a soft one with no stated Figma limit behind it, and the sources grew a lot. `vois-components.md` is 340, `metrics-tagging.md` 274, `vois-patterns.md` 302 (long lines), and the rest are under 225
- [x] No references to `references/`, `data/`, or `scripts/` paths in the body, except pointers that say what the full version has: the top-of-file link notes in `vois-components.md` and `vois-tokens.md`, a pricing-pages pointer in `vois-patterns.md`, and a `stylex.md` pointer in `vois-tokens.md`. None is a live dependency
- [x] No MCP tool calls that a random Figma user won't have, except Righter's `vois_get_microcopy`, which already degrades gracefully ("if available... else apply the principles in this skill") and was kept as-is, matching how the skill was already built
- [x] Frontmatter description kept (agent-trigger language); human tagline drafted above for the Community listing
- [x] One line near the top pointing back to the GitHub repo for the full version

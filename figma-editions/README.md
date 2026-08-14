# Figma Community Editions

Flattened, single-file `.md` builds of select skills for upload to Figma's custom skills feature (single-file only — no `scripts/`, `references/`, `assets/`, or `data/` folders).

**GitHub stays the source of truth.** These are build outputs. If the source skill changes, regenerate the file here — don't hand-edit it separately.

**Design Rationale is out of scope** — it depends on `data/principles.json` and doesn't fit Figma's single-file format without permanent, un-synced curation.

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
| `gtm-positioning.md` | `gtm-positioning/SKILL.md` | 220 (source) | None |
| `design-ask.md` | `design-ask/SKILL.md` | 155 (source) | None (`README.md` alongside it is human-facing only, not uploaded) |
| `metrics-tagging.md` | `metrics-tagging/SKILL.md` | 209 (source) | None (`README` alongside it is human-facing only, not uploaded) |
| `righter.md` | `righter/SKILL.md` | 385 (source) | `data/components.json` (6 entries, inlined as a table), `data/weakeners.json` (11 categories, inlined as a table), `data/phonaesthetics.json` (already had an inline condensed fallback — kept, pointer removed), `scripts/ari.mjs` (cut — manual ARI formula was already the documented fallback), `references/email.md` + `data/email-benchmarks.json` (cut — specialized sub-case, noted with a link back), `evals/cases.json` (cut — maintainer-only regression corpus, not relevant to an end user) |
| `vois-components.md` | `vois-components/SKILL.md` | 125 (source) | `data/components-rules.json` (387 lines, the sole source for the 20-job decision tree — converted from JSON to condensed markdown, grouped by the same 7 categories as the original reference files) |
| `vois-patterns.md` | `vois-patterns/SKILL.md` | 146 (source) | 7 `references/*.md` files (626 lines) inlined and compressed; `data/patterns-rules.json` dropped as a duplicate index (its content is restated in the reference files). Also rewrote the hard, fallback-free routing to the Righter skill (line 13 of the source: "Don't guess at words—follow the righter skill," no "if available" language) into a graceful fallback with plain UI-copy conventions for when Righter isn't installed |
| `vois-tokens.md` | `vois-tokens/SKILL.md` | 297 (source) | 13 of 14 `references/*.md` files (1,053 lines) inlined and compressed; `references/hooks.md` (86 lines) and the whole `scripts/` folder (a live per-edit hook system for Claude Code/Cursor/Codex) cut outright — no Figma equivalent. `data/vois-rules.json` (947 lines) and `data/tokens.json` (129 lines) dropped as files — spot-checked that their content already exists narratively in the reference files (confirmed: rule IDs like `DS-A11Y-010`, `DS-SPACING-001` and token values like the spacing/elevation scales all restate in the `.md` files, not just the JSON). The "Reviewing Existing UI" section (a code-diff review workflow) was also cut as code-specific with no Figma equivalent |

The first three were self-contained with zero `scripts/`, `references/`, `data/`, or environment-specific MCP tool calls, so each was a direct port. The other four required real rework — see the Dependencies column above for what was cut, inlined, or rewritten in each.

## Validation checklist (per file)

- [x] Under ~500 lines (`righter.md` 418, `vois-components.md` 272, `vois-patterns.md` 192, `vois-tokens.md` 351 — all others under 220)
- [x] No references to `references/`, `data/`, or `scripts/` paths anywhere in the body (the one exception — a `scripts/` mention in `vois-tokens.md`'s top-of-file link note — is describing what's cut from this edition, not a live dependency)
- [x] No MCP tool calls that a random Figma user won't have, except Righter's `vois_get_microcopy`, which already degrades gracefully ("if available... else apply the principles in this skill") and was kept as-is, matching how the skill was already built
- [x] Frontmatter description kept (agent-trigger language); human tagline drafted above for the Community listing
- [x] One line near the top pointing back to the GitHub repo for the full version

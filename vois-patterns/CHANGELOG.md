# Changelog: vois-patterns

All notable changes to the vois-patterns skill are documented here. This file tracks rule updates, new templates, and improvements based on usage data and feedback.

Format: **Version** | Date | Type | Summary

---

## [1.14.2] - 2026-10-06

**Fix** | `PATH-PERM-PII-MASK` said the full value appears only on a detail view, while `PATH-PERM-PII-REVEAL` puts a per-field reveal on the list, card, or header. Both now say the full value reaches only roles that need it, through the reveal control wherever the masked value appears or on a detail view, and a role that never needs it never receives it.

---

## [1.14.1] - 2026-10-06

**Fix** | `PATH-C-SIMPLE`, `PATH-C-MEDIUM` and `PATH-D` in `data/patterns-rules.json` still said `24px (spacing-md in vois-tokens)`, `40px` and `20px`. `spacing-md` doesn't exist, and the 1.9.0 fix to `forms.md` and `dialogs-and-action-sheets.md` never reached the JSON, which wins on conflict. They now name the scale step and the Tailwind class (`gap-6`, `gap-10`, `gap-5`), as the markdown does.

**Fix** | "Stepper" meant two things: the step indicator in `vois-components` and a plus and minus quantity control in the pricing rules. The pricing rules (`PATH-PRICE-S3`, `PATH-PRICE-T1`) and the action-sheet list now say "quantity control". Stepper means only the step indicator. `README.md` version corrected from 1.12.0.

---

## [1.14.0] - 2026-10-06

**Added** | Personal data rules in `references/permissions-and-conditional-logic.md`: `PATH-PERM-PII-MASK` (mask by default, on the server), `PATH-PERM-PII-REVEAL` (per-field reveal, re-mask, log high-risk reveals), and `PATH-PERM-PII-KEEP-OUT` (no personal data in URLs, titles, file names, or analytics). Marked `judgment`: the decision to add them is confirmed, the wording has not been reviewed and no Mobbin evidence was checked. Copy rules live in righter `no-pii-in-copy`.

---

## [1.13.1] - 2026-10-02

**Fix** | `references/form-field-groups.md` pointed to `data/tokens.additions.json`, which does not exist. It now points to the `widths` group in `vois-tokens/data/tokens.json`, where those four tokens live.

---

## [1.13.0] - 2026-10-02

**Add** | New `references/marketing-pages.md` and PATH G (`PATH-G` plus eight `PATH-G-*` rules in `data/patterns-rules.json`): one idea per section, three blocks max in a row or stack, detail behind a link, image tile first, no dividers, left-align by default, one primary button per view and at most two repeats, footer at heading scale. These are taste rules for marketing surfaces only. Type scale and spacing live in `vois-tokens` (`DS-MKT`), word limits in `righter`.

**Note** | The numbers behind these rules come from one reference site and one mockup. The rules say so in the file.

---

## [1.12.0] - 2026-10-02

**Add** | Three narrow-screen rules in `references/table-interactions.md`: `PATH-TABLE-NARROW-ROW` (stacked row anatomy), `PATH-TABLE-NARROW-OPEN` (full-width drawer with a back control), `PATH-TABLE-NARROW-SELECT` (selection as a mode, with a bottom bulk bar). From a Mobbin pass on iOS list and selection screens.

**Note** | The 4-column cutoff in `PATH-B-NARROW` is unchanged. Mobbin showed phone apps using list rows, not shrunken tables, and had no narrow web table to test the cutoff against. `PATH-TABLE-NARROW-OPEN` is judgment, not observed.

---

## [1.11.0] - 2026-10-02

**Add** | New `references/table-interactions.md` (companion to PATH-B): selection and bulk actions, sort, filters, columns, density, saved views, URL state, keyboard, inline edit and save model, loading, empty, and error states, partial failures. 32 `PATH-TABLE-*` rules.

**Add** | `PATH-B-SIMPLE`, `PATH-B-COMPLEX`, `PATH-B-ROW-OPEN`, and `PATH-B-EDIT` in `references/table-list.md`. Simple tables scroll vertically only and stick the header to the page. Complex tables own both scroll axes, scroll one axis per gesture, and get a density toggle.

**Change** | Row detail container. The `PATH-B` outcome used to say: quick edit uses a right sidebar, view-first uses a modal. Now: a drawer by default for both, with an Open action that escalates to a full page when the record has tabs, a timeline, related records, or a long form. A dialog is for confirmations only. Mobbin showed a side panel for row detail in every example found, including view-first ones. Set by Om. This changes existing guidance, which is why it is a minor version.

**Change** | `PATH-B-NARROW` is unchanged, but `table-list.md` now says a table in the narrow scroll layout follows the complex-table scroll rules.

**Change** | `design-previews/patterns/table-with-sidebar-detail.html` copy updated to match.

---

## [1.10.1] - 2026-10-01

**Change** | Relationship section points data screens (dashboards, analytics views, anything with charts or KPI tiles) to the new `vois-dataviz` skill after the page structure is decided. No rule changes.

---

## [1.10.0] - 2026-10-01

**Add** | New `references/settings-interactions.md` (companion to PATH-A): save model (instant vs explicit), preference rows, notification matrix, members, integrations, typed removal, danger zone, and the email-change flow with one-time-code verification. 23 `PATH-SET-*` rules.

**Add** | New `references/form-field-groups.md` (companion to PATH-C): field widths, columns and wrap, column gap, name, address, phone, email, one-time code, auto-growing textareas, and the AI chat input. 15 `PATH-FIELD-*` rules.

**Add** | Four sub-decisions on existing paths: `PATH-D-SIZE` (dialog size tier by layout need), `PATH-B-ROW-ACTIONS`, `PATH-B-ROW-ACTIONS-REVEAL` (always visible on touch, hover reveal only where hover exists), and `PATH-B-NARROW` (stack at 4 or fewer columns, scroll with a pinned first column above that). 42 new nodes in `data/patterns-rules.json`, each with a `Builds on` list and a `basis` tag. New optional node fields: `pattern_name`, `builds_on`, `basis`, `basis_note`, `evidence`.

**Change** | `forms.md`: raw px values and a reference to the nonexistent `spacing-md` replaced with scale steps and width tokens; type-scale numbers removed in favor of style names; error and confirmation copy examples replaced with pointers to righter; field errors aligned to righter's Helper Text. `settings-pages.md` view-then-edit now points to the new save rules. `table-list.md` quick actions are 2 preferred, 3 max, matching `JOB-EXPOSE-ACTIONS`. `PATH-C-MEDIUM` points to `PATH-FIELD-COLUMNS` and `PATH-FIELD-WRAP`. `microcopy-routing.md` gains a slot for verification-code copy.

**Change** | `SKILL.md`: PATH A and PATH C read their companion file, the "read only one file" sentence is replaced, and the Reference Files table has two new rows plus the new sub-decision IDs.

---

## [1.9.0] - 2026-09-30

**Add** | New template `references/pricing-pages.md` (PATH-F): decision tree for pricing pages by billing model (flat, seat, usage, hybrid, consumer) and tier count (1 to 4), plus 53 tagged rules (`PATH-PRICE-U1` to `PATH-PRICE-C11`, grouped U, T, S, X, H, C), a don'ts list, and a pre-implementation checklist. Based on pattern review of about 45 Mobbin screens (SaaS web, consumer web, iOS paywalls). Observational only, no conversion data; a few rules are marked as design judgment. Added matching entries to `data/patterns-rules.json` (1 top-level pattern, 10 sub-decisions, 53 `cross_cutting_rule` nodes). Paywall timing and placement routes to `conversion-patterns`.

**Change** | `SKILL.md` gains PATH F in the decision tree, a Reference Files row, a "pricing" option in the container-type checklist item, and a `conversion-patterns` entry under Relationship to Other Skills. `patterns-rules.json`'s top-level `description` now mentions `pricing-pages.md` and the `PATH-PRICE-U1` to `PATH-PRICE-C11` groups.

---

## [1.8.0] - 2026-09-12

**Add** | New `references/content-density.md`: a three-tier framework (dense / standard / spacious) for how much breathing room a screen should have, picked from who's using it and how often rather than defaulted to the mid-range spacing tokens everywhere. `PATH-DENSITY-DENSE` (admin grids, comparison-heavy scanning), `PATH-DENSITY-STANDARD` (the default — forms, settings, everyday detail views), `PATH-DENSITY-SPACIOUS` (onboarding, empty states, destructive confirmations, marketing) — added to `data/patterns-rules.json` as `cross_cutting_rule` nodes. Explicitly distinguished from `[DS-SLOP-010]` (card-ification is a container-choice anti-pattern; density is a spacing/information-per-screen decision, independent of it) and related to `vois-tokens`' `DENSITY` taste dial (the dial tunes within a tier, it doesn't pick the tier). `SKILL.md` gains a Reference Files row and checklist item.

**Why now** | Confirmed via the same gap-check as `composition.md` (1.7.0): `forms.md` and `table-list.md` set fixed thresholds for their own template, but nothing in the 7 reference files offered a reusable density framework independent of the card anti-pattern.

---

## [1.7.0] - 2026-09-12

**Add** | New `references/composition.md`: a cross-cutting rule set for briefs that name a product-specific feature ("approval queue", "impersonate a user") instead of one of the five container types. `PATH-COMPOSITION-CHECK-FIRST` (translate the brief into a job and re-check the decision tree), `PATH-COMPOSITION-COMBINE` (compose two existing paths before inventing a third, with worked examples), and `PATH-COMPOSITION-INVENT-LAST` (invent new structure only as a last resort, and say what didn't fit) — added to `data/patterns-rules.json` as `cross_cutting_rule` nodes, same shape as the existing permissions/conditional-logic rules. `SKILL.md` gains a pointer to this file right after the decision tree, a Reference Files row, and a checklist item.

**Why now** | Confirmed via a gap-check read of all 7 `references/*.md` files before writing anything: no existing file states a general "compose before inventing" principle. The closest analogue, `vois-components`' `JOB-CONTAIN-CONTENT` ("why not wrap everything in a Card?"), is narrower and component-level, not page-composition guidance — `composition.md` cross-references it rather than restating it.

---

## [1.6.1] - 2026-08-29

**Change** | The "For exact Tailwind class names and token values, see vois-tokens" pointer now reads "For exact class/style syntax (Tailwind or StyleX) and token values, see vois-tokens" — vois-tokens added StyleX as a second implementation engine alongside Tailwind v4 in its own `1.12.0`; this file's structural decision trees were already engine-agnostic and needed only this wording fix.

---

## [1.6.0] - 2026-08-09

**Add** | Tagged `references/permissions-and-conditional-logic.md`'s ~6 binary, checkable rules with stable IDs (`PATH-PERM-HIDE-BY-ROLE`, `PATH-PERM-DISABLE-BY-CONDITION`, `PATH-COND-PARENT-CHILD`, `PATH-COND-PRIMARY-BUTTON`, `PATH-COND-ACCORDION-EXCLUSIVE`, `PATH-COND-CALC-TABLE-ROWS`) and added matching entries to `data/patterns-rules.json`. This file previously carried no PATH- tags at all — rules like "never stack more than 4 rows" and "primary button disabled until all required fields are valid" existed only as prose, invisible to anything querying the corpus by ID. A new `node_type: "cross_cutting_rule"` distinguishes these from the per-template decision-tree nodes (`top_level_pattern`/`sub_decision`): they apply across templates rather than nesting under one PATH, so `parent` is `null`, same as a top-level pattern.

**Add** | Source-of-truth note in `SKILL.md`: `data/patterns-rules.json` is canonical for a path's condition/outcome, `references/*.md` may restate for readability, JSON wins on conflict — now enforced in CI by the new repo-level `scripts/check-rule-sync.mjs`.

**Change** | `patterns-rules.json`'s top-level `description` updated (previously said `permissions-and-conditional-logic.md` "carries no PATH- tags at all... not represented here" — no longer accurate). `microcopy-routing.md` stays untagged — it's a routing checklist to righter, not a testable requirement. `SKILL.md`'s reference-file table row for `permissions-and-conditional-logic.md` now lists its Path IDs instead of "— (cross-cutting)".

---

## [1.5.1] - 2026-07-23

**Fix** | Corrected `record_pattern_decision` → `vois_record_pattern_choice` and `report_pattern_gap` → `vois_report_pattern_gap` (the real registered MCP tool names) across SKILL.md, README.md, and references/microcopy-routing.md. Also fixed the example call's argument shape — the real tool takes `skillVersion`/`pathId`/`userGoal`/`thresholdInputs`, not `pathId`/`confidence`/`reasoning` (`confidence` doesn't exist on the real tool). The "optional if available" framing is unchanged.

---

## [1.5.0] - 2026-07-23

### Added

- **`data/patterns-rules.json`** — every `[PATH-X]`/`[PATH-X-Y]` tagged decision node (10 total) as `{ id, condition, outcome, source_file }`, for a quick lookup without reading a whole reference file. Only 10 of this skill's decision points carry an explicit tag (unlike vois-tokens' `DS-*` corpus, which tags nearly every rule) — the untagged IF/THEN branches, worked examples, and righter-routing call-outs stay in `references/*.md`.

### Changed

- `SKILL.md` notes the structured lookup alongside the existing decision tree and reference file table.
- **Version bump:** `1.4.0` → `1.5.0`

---

## [1.4.0] - 2026-07-21

### Changed

- **Standalone-safe:** `record_pattern_decision`, `report_pattern_gap`, and the reference to `record_component_choice` are now framed as optional — call them if that MCP tool is available in your environment, otherwise skip and proceed. This skill no longer assumes an MCP server, `vois-router`, or `vois-loop` is present.
- **Version bump:** `1.3.1` → `1.4.0`

---

## [1.3.1] - 2026-06-17

### Changed

- Updated cross-references from `vois-design-system` to its new name, `vois-tokens`.

---

## [1.3.0] - 2026-06-17

### Changed

- **Structural restructure:** `SKILL.md` split from a single 776-line file into a 137-line entry point plus seven `references/` files (`detail-pages.md`, `microcopy-routing.md`, `table-list.md`, `dialogs-and-action-sheets.md`, `permissions-and-conditional-logic.md`, `settings-pages.md`, `forms.md`). No path content was added, removed, or reworded — every path ID (`[PATH-A]` through `[PATH-E]` and their sub-paths) is preserved. `record_pattern_decision` still only ever gets called with the specific sub-path IDs that existed before.
- **Version bump:** `1.2.0` → `1.3.0`

---

## [1.0.0] - 2026-05-12

### Initial Release

First public version of vois-patterns skill. Consolidates structural decision trees and UI patterns used across Vois projects.

#### Added
- **5 core templates**
  - Settings Page template (sidebar nav and tabbed variants)
  - Table/List with Details template (sidebar vs modal selection)
  - Form (Create/Edit) template (view/edit states, complexity tiers)
  - Dialog/Action Sheet template (breakpoint-based behavior)
  - Detail Page template (read-only view)

- **Macro decision trees**
  - Container type selection (what should I build?)
  - Settings depth (sidebar vs tabs)
  - Form complexity (1-6 fields → 7-15 → 15+)
  - Table details container (sidebar vs modal)
  - Permissions rules (hide vs disable)
  - Form states (view vs edit)

- **Micro patterns**
  - Spacing tokens and rules (24px, 40px, 20px standards)
  - Typography/color tokens (text-primary, text-secondary, text-instruction)
  - Form validation and error messaging
  - Accordion/expandable item rules
  - Conditional logic (parent/child inputs)
  - Binary choice handling (radio vs dropdown)

- **Righter skill integration**
  - Every microcopy decision routes to righter skill
  - Explicit list of copy elements to write with righter
  - Examples of wrong → right copy patterns
  - Routing for: labels, helpers, errors, buttons, status, confirmations

- **Permission rules**
  - Hide elements user can't see (role-based)
  - Disable (but show) elements user can't edit (condition-based)
  - Visual cause/effect mapping for disabled states

- **Mobile & breakpoint rules**
  - Dialogs → action sheets on mobile
  - Dropdowns → action sheets on mobile
  - Sidebars → hamburger menus on mobile
  - Active input visibility on mobile keyboards

#### Documentation
- SKILL.md with full template details and decision trees
- README.md with quick start, examples, and FAQ
- CHANGELOG.md (this file)

#### Known Limitations
- Rules based on Vois/Personify experience; may need adjustment for other design systems
- Assumes shadcn/ui New York style components
- Assumes Next.js App Router patterns
- PostHog integration not yet implemented (planned for 1.1.0)

#### Breaking Changes
None (initial release)

---

## [1.1.0] - TBD (Planned)

### PostHog Integration & First Data-Driven Updates

Planned improvements based on agentic usage and QA validation.

#### Planned Additions
- PostHog event instrumentation (pattern_used, rule_deviations, qa_results)
- Weekly analysis loop (Claude analyzes build logs and suggests rule updates)
- Rule effectiveness dashboard
- A/B testing framework for rule changes
- Versioning support in agent loading

#### Planned Changes (TBD after data collection)
- Spacing rules for 10+ field forms (if data shows deviations)
- Clarification on "group related inputs" rule (if ambiguity persists)
- Additional section grouping examples
- Mobile action sheet edge cases documentation

#### Planned Removals
None yet

---

## How This Changelog Works

Each version documents:
1. **What changed** (Added, Changed, Removed, Fixed)
2. **Why it changed** (data, feedback, or new understanding)
3. **Evidence** (if data-driven)

### When Rules Are Updated

After 20-30 agent builds using vois-patterns, we:
1. Analyze PostHog data for deviations and failures
2. Ask Claude to identify patterns in the data
3. Document findings and proposed changes
4. Review and decide on updates
5. Implement changes in new version
6. Document the change here with evidence link

### Before You Use a New Version

Check this changelog to understand:
- Which rules were updated and why
- When the version was released
- What problems it solves

---

## Feedback & Contributions

If you notice:
- A rule that doesn't work → file an issue with evidence
- A pattern not covered → propose a new template
- Ambiguity in language → suggest clarification
- A rule that needs updating → suggest with reasoning

All feedback feeds into the analysis loop for the next version.

---

## Version Status

| Version | Status | Stability | Last Updated |
|---------|--------|-----------|--------------|
| 1.9.0 | Active | Stable | 2026-09-30 |

---

**Legend:**
- **Added** = new templates, rules, or guidance
- **Changed** = existing rules updated with rationale
- **Removed** = deprecated rules or templates
- **Fixed** = clarifications or corrections to existing rules
- **Planned** = upcoming improvements (not yet released)

---

**Last updated:** 2026-09-30  
**Current version:** 1.9.0

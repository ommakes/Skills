# Changelog: vois-patterns

All notable changes to the vois-patterns skill are documented here. This file tracks rule updates, new templates, and improvements based on usage data and feedback.

Format: **Version** | Date | Type | Summary

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
| 1.0.0 | Active | Stable | 2026-05-12 |
| 1.1.0 | Planned | N/A | TBD |

---

**Legend:**
- **Added** = new templates, rules, or guidance
- **Changed** = existing rules updated with rationale
- **Removed** = deprecated rules or templates
- **Fixed** = clarifications or corrections to existing rules
- **Planned** = upcoming improvements (not yet released)

---

**Last updated:** 2026-05-12  
**Current version:** 1.0.0

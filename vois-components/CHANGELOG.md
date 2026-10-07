# Changelog

All notable changes to the `vois-components` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.10.2] - 2026-10-06

### Fixed

- **`JOB-SWITCH-VIEWS` and `PATH-A` disagreed.** The job said Tabs for a settings page (Profile, Billing, Members), while `PATH-A-DEPTH-DEEP` in `vois-patterns` says 4 or more sections use a sidebar with sub-pages. A blind build of a four-section settings screen followed the pattern and missed the job's answer (EVAL-034). The Tabs branch now says a settings page with 4 or more sections uses sidebar navigation instead.

- **Breadcrumb or back link, decided.** `PATH-E` puts a breadcrumb above the title of a record page, while `JOB-NAVIGATION-POSITION` gave a back link for one level deep, so a detail page reached from its list could go either way (EVAL-038). The job now counts Home as the first level: 3 or more levels gets a Breadcrumb, and 2 levels (Home > Page) gets a back link. A record page opened from its list is 3 levels and gets a Breadcrumb. The tree, rationale and Quick Reference all say this now.

### Changed

- **Version bump:** `1.10.1` → `1.10.2`

---

## [1.10.1] - 2026-10-06

### Fixed

- **`references/stepper.md` forced the last step to be a result.** It said the last step is a result such as "Done" with no Next. That contradicted `PATH-SET-EMAIL-CHANGE`, whose last step is code entry with Verify, and it pushed five-step flows to six. It now says the last step ends the flow with its own primary button (Verify, Create, Finish), a closing "Done" step is optional, and a Done step counts toward the 5-step limit.

### Changed

- **Version bump:** `1.10.0` → `1.10.1`

---

## [1.10.0] - 2026-10-06

### Added

- **Lookalikes.** A table of shortcuts agents take when they build something that looks like a component but isn't one, each with the component to use instead. `data/components-rules.json` has the rows (`lookalikes`): 4 `observed` in 40 blind builds and 7 `watch` rows that an existing rule already forbids but were not seen. `SKILL.md` has a short two-table version.
- A line on prompts that describe a look: pick the component by its job, then style it.

### Fixed

- `data/components-rules.json` `source` pointed at `vois-components/references/*.md` for the job trees, which live in `SKILL.md`. It now names both.

### Changed

- **Version bump:** `1.9.0` → `1.10.0`

---

## [1.9.0] - 2026-10-06

### Added

- **`references/stepper.md`,** the Stepper spec: what it is and isn't, anatomy, the four states, behavior, layout, motion, and accessibility. shadcn/ui ships no Stepper, so agents were hand-building one with no spec. Marked `judgment`.
- **Two "why not" entries and one naming entry** on `JOB-MULTISTEP-GUIDE`: why not Tabs for steps, why the limit is 5 and 6, and that a plus and minus control is a quantity control, not a Stepper.

### Fixed

- **Stepper and Wizard overlapped at exactly 5 steps.** The tree said 2 to 5 for a Stepper and 5 or more for a Wizard. It now says 2 to 5 steps that fit a page container for a Stepper, and 6 or more, or any step that needs its own full page, for a Wizard.

### Changed

- **Version bump:** `1.8.1` → `1.9.0`

---

## [1.8.1] - 2026-10-02

### Fixed

- **`source_file` in `data/components-rules.json`** pointed 20 jobs at seven reference files (`references/overlays-and-containers.md` and others) that no longer exist. They now point to `SKILL.md`, where each `JOB-*` ID is tagged. `SKILL.md` now says the JSON is the only source for decision-tree content.

---

## [1.8.0] - 2026-10-02

### Changed

- **`JOB-OVERLAY-INTERACTION`** gains a branch for opening a record from a table row: Sheet for 8 or fewer fields and no related records, full page for big records, Dialog only for confirmations. Matches `PATH-B-ROW-OPEN` in vois-patterns 1.11.0.
- **`JOB-DISPLAY-DATA`** gains paging (pagination, virtualization only for thousands of rows) and in-table editing branches.
- **`JOB-LOADING-STATE`** gains a table branch: skeleton rows under real headers on first load, stale rows kept on refetch.
- **`JOB-EMPTY-CONTENT`** gains empty-by-nature, empty-by-permission, and plan-limit cases.
- Quick Reference gains two rows.

---

## [1.7.0] - 2026-10-01

### Added

- **`JOB-VISUALIZE-DATA`** (job 21): charts, KPI tiles, sparklines and dashboards. A single value is a stat tile in a Card; everything else hands the form choice to the new `vois-dataviz` skill; dashboard containers are Card, Tabs, one filter row, Skeleton and per-state empty and error handling. `SKILL.md` Quick Reference, Job Index and Relationship section updated; `data/components-rules.json` gains the entry.

---

## [1.6.0] - 2026-10-01

### Added

- **`JOB-ACCEPT-TEXT` gains an InputOTP branch** for a fixed-length one-time code (email or SMS verification, authenticator), with a "Why not a plain Input?" rationale. Check the exact component name against the workspace manifest. `SKILL.md`'s Quick Reference and `README.md` updated.

### Changed

- **`JOB-ACCEPT-TEXT`** textarea guidance now points to `field-sizing: content` (`DS-LAYOUT-FIELD-001`) and the line-count tokens instead of "set rows" and "auto-resize".
- **`JOB-EXPOSE-ACTIONS`** now says two visible actions is the target and three is the ceiling.
- **`JOB-TRIGGER-ACTION` rationale** no longer states 44×44px; it points to `var(--hit-area-min)`.

---

## [1.5.0] — 2026-09-12

### Added

- **`JOB-OVERLAY-INTERACTION` gains an explicit Popover branch** for editing exactly one field/value anchored to the specific row/item that triggered it (e.g. changing one row's status inline from a table). Previously, a single-field edit that also "related to an item in a list" satisfied both the Dialog branch's condition (1-4 fields, self-contained) and the Sheet branch's condition (relates to a list item) with nothing to disambiguate them — confirmed as a real gap by running `vois-eval`'s scenario set blind against a fresh agent, which reasoned its way to a defensible third answer (Popover, via `JOB-CONTEXTUAL-INFO` + `JOB-DATA-ENTRY`) that the decision tree never explicitly ruled in or out. Sheet's condition is now scoped to "a handful of fields or more" so the two branches no longer overlap. Two new rationale Q&As explain the Popover/Sheet boundary in both directions. `SKILL.md`'s Quick Reference table, `README.md`'s job-pairs table, and the Figma edition all updated to match.

---

## [1.4.2] — 2026-07-23

### Fixed

- **Tool name correction** — every reference to `record_component_choice` and `report_pattern_gap` updated to the real registered MCP tool names, `vois_record_component_choice` and `vois_report_pattern_gap`. The "optional if available" framing (added in the standalone rework) is unchanged — only the name was wrong, not the optionality. `vois_report_pattern_gap`'s example call also gains its real required arguments (`skillVersion`, `userGoal`, `attemptedFallback`, `reasoning` — not `description`/`closestPathId`/`gapDescription`).

---

## [1.4.1] — 2026-07-23

### Removed

- The seven `references/*.md` files (`feedback-and-confirmation.md`, `overlays-and-containers.md`, `navigation-and-switching.md`, `selection-and-input.md`, `contextual-info-and-actions.md`, `display-and-identity.md`, `forms-and-process.md`) are deleted — confirmed fully redundant with `data/components-rules.json` (every decision tree node and "why not X" rationale traced back 1:1) now that the JSON has been verified in use. `SKILL.md`'s Job Index no longer lists file paths; it maps Job ID → job name directly.
- **Version bump:** `1.4.0` → `1.4.1`

---

## [1.4.0] — 2026-07-23

### Added

- **`data/components-rules.json`** — all 20 `[JOB-...]` decision trees as structured `condition → recommendation` nodes (including nested sub-branches), with every "Why not X?" explanation preserved as a `rationale` entry — the reasoning is what makes a recommendation defensible, so it isn't dropped in the conversion.

### Changed

- `SKILL.md`'s Job Index now points to `data/components-rules.json` for programmatic lookup by `id`/`number`, alongside the existing per-file table for prose reading.
- **Version bump:** `1.3.0` → `1.4.0`

---

## [1.3.0] — 2026-07-21

### Changed

- **Standalone-safe:** `record_component_choice` and `report_pattern_gap` are now optional — call them if that MCP tool is available in your environment, otherwise proceed with your selection. Frontmatter `description` no longer states the MCP call as a requirement. This skill no longer assumes an MCP server, `vois-router`, or `vois-loop` is present.
- **Version bump:** `1.2.1` → `1.3.0`

---

## [1.2.1] — 2026-06-17

### Changed

- Updated cross-references from `vois-design-system` to its new name, `vois-tokens`.

---

## [1.2.0] — 2026-06-17

### Changed

- **Structural restructure:** `SKILL.md` split from a single 543-line file into a 107-line entry point plus seven `references/` files (`forms-and-process.md`, `navigation-and-switching.md`, `display-and-identity.md`, `selection-and-input.md`, `contextual-info-and-actions.md`, `overlays-and-containers.md`, `feedback-and-confirmation.md`), grouped by job. Only the Quick Reference table and job index remain in `SKILL.md`. No job content was added, removed, or reworded — every `[JOB-*]` ID is preserved.
- **Version bump:** `1.1.0` → `1.2.0`

---

## [1.0.0] — 2026-05-23

### Added

**Initial release of component selection skill.**

- 20 job-to-be-done rubrics covering the most ambiguous shadcn/ui component pairs
  - Dialog vs Drawer vs Sheet (overlay interactions)
  - Toast vs Banner vs Alert (transient feedback)
  - Select vs Combobox vs Command (selection surfaces)
  - Tooltip vs Popover vs HoverCard (contextual info)
  - Button vs IconButton vs LinkButton (actions)
  - And 15 more decision trees

- Decision tree format with max depth 3 for clarity
- "Why not X" explanations for each rubric to surface reasoning
- `record_component_choice` MCP tool integration — every selection is recorded
- Quick reference table mapping all 20 jobs at a glance
- Cross-references to `vois-patterns` (read before) and `vois-tokens` (read after)
- Workspace manifest guidance — handles custom or renamed components gracefully

### Architecture

- Job-first organization (not component-first)
- Semantic decision trees covering context and constraints
- Accessibility considerations surfaced where relevant (e.g., AlertDialog vs Dialog ARIA roles, Tooltip keyboard access)
- No tokens, spacing, or styling — pure selection logic
- Designed for quarterly review and refinement based on agent selection data

### Instrumentation

- Agents call `record_component_choice` after each selection
- Emits `COMPONENT_SELECTED` events to Prisma and PostHog
- Feeds the self-improving design system reconciler
- Powers quarterly rubric calibration cycles

### Related Work

- Part of the Vois self-improving design system (see [PRD 4](../self-improving-design-system/04-component-selection-layer-prd.md) for full context)
- Sits between `vois-patterns` (structure) and `vois-tokens` (implementation)
- Works alongside `righter` skill for all UI copy

### Known Limitations

- Covers shadcn/ui components in v1.0.0. Workspace extensions (custom components, renamed components) require mapping via manifest.
- No coverage of non-shadcn third-party components (future enhancement).
- Performance & Load Time bug type enum exists but has no corresponding rubric (detector planned for future release).

### Next Steps

- Quarterly review cycle starting 2026-08-23
  - Check component selection data for rubric accuracy
  - Identify unused jobs (candidates for removal)
  - Identify over-used alternatives (signal for rubric clarity improvement)
- Monitor `report_pattern_gap` submissions for component gaps not covered by the 20 jobs
- Workspace-specific overrides for component availability (if workspace has removed a shadcn component)

---

## Release Notes

### 1.0.0 Release (2026-05-23)

This is the first public release of the component selection skill. It focuses on the 20 most ambiguous shadcn/ui decisions and provides clear rubrics backed by job-based reasoning.

**What's working well:**
- Decision trees are clear and help agents make intentional choices
- "Why not X" reasoning prevents rubber-stamp decisions
- Instrumentation hook (`record_component_choice`) is seamlessly integrated

**What to watch:**
- Quarterly reviews will calibrate confidence in the rubrics based on real agent behavior
- Workspace manifests may differ from the base shadcn/ui names — readme covers this clearly, but we'll refine guidance as we see how workspaces extend

**Feedback and issues:** Submit `report_pattern_gap` events if a component decision doesn't fit any rubric, or open an issue on the [Skills repo](https://github.com/ommakes/Skills/issues).

---

## Future Versions (Planned)

### v1.1.0 (Planned: 2026-08-23)

- Quarterly calibration based on Q2 agent selection data
- Refinements to rubrics based on `report_pattern_gap` feedback
- Possible new jobs if gaps are identified

### v2.0.0 (Planned: 2027-Q1)

- Workspace-specific component overrides (if workspace has renamed or removed components)
- Integration with component deprecation workflow
- Extended coverage beyond shadcn/ui base components

---

## How to Report Issues

Found a rubric that's unclear or incomplete? Here are three ways to surface it:

1. **Call `report_pattern_gap`** while building — this is the primary feedback mechanism. The MCP tool logs it so reconcilers can aggregate the data.

2. **Open an issue** on the [Skills repo](https://github.com/ommakes/Skills/issues) with the label `skill/vois-components`.

3. **Share in Slack or email** — for qualitative feedback about the rubrics' clarity or relevance.

---

**Maintained by:** Om Suthar and the Vois team  
**Repository:** [github.com/ommakes/Skills](https://github.com/ommakes/Skills)  
**Last updated:** 2026-05-23

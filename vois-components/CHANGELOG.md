# Changelog

All notable changes to the `vois-components` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- Cross-references to `vois-patterns` (read before) and `vois-design-system` (read after)
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
- Sits between `vois-patterns` (structure) and `vois-design-system` (implementation)
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

# Vois Component Selection Skill

Component selection rubrics for agents building UI with shadcn/ui and design system components.

## What This Is

After `vois-patterns` determines the container type (settings page, form, table, dialog, etc.), agents read this skill to pick the right specific component for each job-to-be-done.

The skill covers 20 high-ambiguity component pairs organized by job, with decision trees and "why not X" explanations for each. Examples:

- Dialog vs Drawer vs Sheet
- Toast vs Banner vs Alert
- Select vs Combobox vs Command
- Button vs IconButton vs LinkButton
- Tooltip vs Popover vs HoverCard

## How to Use

1. After you've read `vois-patterns` and decided on a container type
2. For each component you need to pick, find the matching job section below
3. Walk the decision tree to a specific component name
4. Call `record_component_choice` MCP tool with your selection
5. Then read `vois-design-system` for implementation (tokens, spacing, accessibility)

**Do not skip the `record_component_choice` call.** This feeds the self-improving design system.

## The 20 Jobs Covered

| Job | Decision Point |
|-----|---|
| Confirm a destructive action | AlertDialog vs Dialog vs Toast with undo |
| Show transient feedback | Toast vs Banner vs Alert |
| Contain a focused overlay | Dialog vs Drawer vs Sheet |
| Contain a unit of content | Card vs Panel vs Surface |
| Switch between views | Tabs vs Segmented Control vs Pills |
| Choose from a list | Select vs Combobox vs Command |
| Provide contextual info | Tooltip vs Popover vs HoverCard |
| Trigger an action | Button vs IconButton vs LinkButton |
| Accept text | Input vs Textarea vs RichTextEditor |
| Capture binary choice | Checkbox vs Toggle vs Switch |
| Label or categorize | Badge vs Tag vs Chip |
| Represent a user | Avatar vs AvatarGroup vs Presence |
| Communicate loading state | Skeleton vs Spinner vs Progress |
| Handle empty content | EmptyState vs ZeroState vs Onboarding |
| Expose actions | Menu vs DropdownMenu vs ContextMenu |
| Guide through steps | Stepper vs Wizard vs Progress |
| Indicate position | Breadcrumb vs Back Link vs Navigation |
| Display data | List vs Table vs DataTable |
| Build a form | Form vs FormSection vs Field |
| Host secondary content | Sidebar vs Drawer vs Panel |

## Prerequisites

- Read `vois-patterns` first (you should know what container type you're building)
- Familiarity with shadcn/ui component names and patterns
- Access to the workspace component manifest (some workspaces extend or rename components)

## Workspace Manifests

These rubrics use standard shadcn/ui names. Your workspace may have custom or extended components.

**Important:** Use the rubric logic (the decision tree) to make your selection. Then record the workspace-specific component name if it differs from the shadcn base.

Example: your workspace has a `Banner` component instead of `Alert`. The job "Show transient feedback" still applies; you just record `Banner` instead of `Alert` when calling `record_component_choice`.

## Maintenance

This skill is reviewed quarterly. For each job, we check:
- Did agents actually use this job? (zero uses = candidate for removal)
- Did agents pick components outside the rubric? (>30% divergence = rubric needs update)

When a component is deprecated in your workspace manifest, any rubric mentioning it must be updated in the same PR. This is enforced via pre-merge checks.

## Instrumentation

Every component selection should emit a `record_component_choice` event. This data feeds:
- The self-improving design system reconciler
- Quarterly rubric reviews
- Component usage analytics

Without this event, your component selections are invisible to the system.

## Related Skills

- **`vois-patterns`** — Read first. Determines the container type and structure.
- **`vois-design-system`** — Read after. Applies tokens, spacing, and accessibility rules.
- **`righter`** — Consulted for all UI copy (labels, button text, error messages).

## Version

**v1.0.0** — Initial release. 20 jobs covering the most ambiguous shadcn/ui decisions.

## Questions?

If a job doesn't match what you're building, call `report_pattern_gap` with details. These reports feed future versions of this skill.

If you think a decision tree is ambiguous or incomplete, note it when you call `record_component_choice` with reasoning — that feedback helps calibrate the rubrics.

---

**Last updated:** 2026-05-23  
**Maintained by:** Om Suthar / Vois team  
**Repository:** [github.com/ommakes/Skills](https://github.com/ommakes/Skills)

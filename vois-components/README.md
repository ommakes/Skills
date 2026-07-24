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
4. If a `vois_record_component_choice` MCP tool is available in your environment, call it with your selection
5. Then read `vois-tokens` for implementation (tokens, spacing, accessibility)

**If the `vois_record_component_choice` tool is available, don't skip the call** — it feeds the self-improving design system. If the tool isn't available, just proceed with your selection.

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

Example: your workspace has a `Banner` component instead of `Alert`. The job "Show transient feedback" still applies; you just record `Banner` instead of `Alert` when calling `vois_record_component_choice` (if that tool is available).

## Maintenance

This skill is reviewed quarterly. For each job, we check:
- Did agents actually use this job? (zero uses = candidate for removal)
- Did agents pick components outside the rubric? (>30% divergence = rubric needs update)

When a component is deprecated in your workspace manifest, any rubric mentioning it must be updated in the same PR. This is enforced via pre-merge checks.

## Instrumentation (optional)

If a `vois_record_component_choice` MCP tool is available in your environment, every component selection should emit an event through it. This data feeds:
- The self-improving design system reconciler
- Quarterly rubric reviews
- Component usage analytics

If the tool isn't available, this skill still works standalone — just make the selection and move on.

## Related Skills

- **`vois-patterns`** — Read first. Determines the container type and structure.
- **`vois-tokens`** — Read after. Applies tokens, spacing, and accessibility rules.
- **`righter`** — Consulted for all UI copy (labels, button text, error messages).

## Version

**v1.3.0** — Works standalone; MCP telemetry calls (`vois_record_component_choice`, `vois_report_pattern_gap`) are optional.

## Questions?

If a job doesn't match what you're building and a `vois_report_pattern_gap` tool is available, call it with details — these reports feed future versions of this skill. If the tool isn't available, just note the gap yourself and proceed with the closest match.

If you think a decision tree is ambiguous or incomplete and `vois_record_component_choice` is available, note it when you call it with reasoning — that feedback helps calibrate the rubrics.

---

**Last updated:** 2026-07-21  
**Maintained by:** Om Suthar / Vois team  
**Repository:** [github.com/ommakes/Skills](https://github.com/ommakes/Skills)

---
name: vois-components
description: Component selection rubrics organized by job-to-be-done. Use after vois-patterns determines structure, before vois-tokens applies tokens. Optionally records each choice via the record_component_choice MCP tool if one is available. Use when deciding between similar components — Dialog vs Drawer, Toast vs Banner, Select vs Combobox, etc.
version: 1.3.0
---

# Vois Component Selection Skill

You are picking specific components from the workspace manifest. This skill answers **"which component for this job"** — not what structure (that's `vois-patterns`) and not how to style it (that's `vois-tokens`).

Read this skill after `vois-patterns` has determined the container type. If a `record_component_choice` tool is available in your environment, call it for every component you pick before moving to `vois-tokens`; if not, just make the selection and move on.

The Quick Reference table below resolves most cases on its own. When it doesn't — ambiguous case, need the full decision tree, or need to justify the choice — read the matching reference file.

---

## Before You Pick a Component

1. Identify the **job-to-be-done** — phrase it as a verb plus object: "confirm a destructive action", "show transient feedback", "group related controls"
2. Find the matching row in Quick Reference, or the matching job in the index below
3. If ambiguous, read the matching reference file and walk its decision tree
4. If a `record_component_choice` tool is available, call it with your selection:

   ```
   Tool: record_component_choice
   Arguments:
     job: <the job-to-be-done, one sentence>
     componentName: <exact component name from the manifest>
     alternativesConsidered: <array of component names you ruled out>
     reasoning: <one sentence on why you chose this over the alternatives>
   ```

   If that tool isn't available, this step is optional telemetry — proceed with your selection.

5. If no section matches your job and a `report_pattern_gap` tool is available, call it:

   ```
   Tool: report_pattern_gap
   Arguments:
     description: <what the UI needs to do>
     closestPathId: <closest job ID from this skill, e.g. JOB-OVERLAY-INTERACTION>
     gapDescription: <what the rubrics don't cover>
   ```

   If that tool isn't available, just note the gap in your own output and proceed with the closest match.

> **Note on workspace manifests.** These rubrics use standard shadcn/ui component names. Your workspace may extend or rename them — e.g. `Banner` instead of `Alert`, `DataTable` instead of `Table`. Check your workspace manifest for the exact name; use the rubric logic to make the selection, then record the workspace-specific name.

---

## Quick Reference

| Job | Use | Not |
|-----|-----|-----|
| Confirm destructive action | AlertDialog | Dialog, Toast |
| Transient feedback, no action needed | Toast | Alert, Banner |
| Transient feedback, action required | Alert (persistent) | Toast |
| Focused overlay, short task | Dialog | Drawer, Sheet |
| Focused overlay, contextual to a list item | Sheet | Dialog |
| Group content, interactive item | Card | div, Surface |
| Switch between major content areas | Tabs | Segmented Control |
| Filter a list, 2–4 options | Segmented Control | Tabs |
| Choose from short list | Select | Combobox |
| Choose from long list / search | Combobox | Select |
| Search + trigger actions | Command | Select, Combobox |
| Short label, no interaction | Tooltip | Popover |
| Rich content, triggered by click | Popover | Tooltip |
| Immediate-effect binary setting | Switch | Checkbox |
| Form field binary / consent | Checkbox | Switch |
| Page load or content fetch | Skeleton | Spinner |
| Action in progress | Spinner (inline) | Skeleton |
| Measurable long operation | Progress | Spinner |
| True zero state | EmptyState with CTA | Blank space |
| Filtered to zero results | Inline message + clear | EmptyState |
| Row-level actions | DropdownMenu | ContextMenu, Command |
| Right-click enhancement | ContextMenu | DropdownMenu |
| 2–5 sequential required steps | Stepper | Progress, Wizard |
| 5+ full-page sequential steps | Wizard | Stepper |
| 2+ levels deep in hierarchy | Breadcrumb | Back link |
| 1 level deep | Back link | Breadcrumb |
| Simple collection, no sorting | List | Table |
| Comparable attributes, < 100 rows | Table | DataTable |
| 100+ rows, sortable, bulk actions | DataTable | Table |
| Persistent app navigation | Sidebar | Drawer |
| Contextual tools for selected item | Sheet or Panel | Sidebar, Drawer |

---

## Job Index

Each reference file has the full decision tree (with thresholds and edge cases) plus "why not X" reasoning for every alternative ruled out.

| File | Jobs covered |
|---|---|
| `references/feedback-and-confirmation.md` | Job 1 Confirm destructive action · Job 2 Transient feedback · Job 13 Loading state · Job 14 Empty content |
| `references/overlays-and-containers.md` | Job 3 Focused overlay interaction · Job 4 Contain a unit of content · Job 20 Secondary content / persistent nav |
| `references/navigation-and-switching.md` | Job 5 Switch views / filter · Job 17 Position in a hierarchy |
| `references/selection-and-input.md` | Job 6 Choose from a list · Job 9 Accept text input · Job 10 Binary preference |
| `references/contextual-info-and-actions.md` | Job 7 Contextual info (tooltip/popover) · Job 8 Trigger an action · Job 15 Expose a set of actions |
| `references/display-and-identity.md` | Job 11 Label/categorize content · Job 12 Represent a user/group · Job 18 Display structured data |
| `references/forms-and-process.md` | Job 16 Multi-step process · Job 19 Data entry surface |

---

## Relationship to Other Skills

**Read `vois-patterns` first.** That skill determines the container type — settings page, form, table, dialog. Once you know the structure, come here to pick the specific components that fill it.

**Read `vois-tokens` after.** Once components are selected, `vois-tokens` handles tokens, spacing, animation, and accessibility implementation.

**Righter for all copy.** Component labels, empty state messages, button text, error copy — all of it goes through `righter` (which calls `get_microcopy` first). This skill says nothing about words.

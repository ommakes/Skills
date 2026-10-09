---
name: vois-components
description: Component selection rubrics organized by job-to-be-done. Use after vois-patterns determines structure, before vois-tokens applies tokens. Optionally records each choice via the vois_record_component_choice MCP tool if one is available. Use when deciding between similar components — Dialog vs Drawer, Toast vs Banner, Select vs Combobox, a chart vs a table, etc.
version: 1.12.0
---

# Vois Component Selection Skill

You are picking specific components from the workspace manifest. This skill answers **"which component for this job"** — not what structure (that's `vois-patterns`) and not how to style it (that's `vois-tokens`).

Read this skill after `vois-patterns` has determined the container type. If a `vois_record_component_choice` tool is available in your environment, call it for every component you pick before moving to `vois-tokens`; if not, just make the selection and move on.

The Quick Reference table below resolves most cases on its own. When it doesn't — ambiguous case, need the full decision tree, or need to justify the choice — read the matching reference file.

---

## Before You Pick a Component

1. Identify the **job-to-be-done** — phrase it as a verb plus object: "confirm a destructive action", "show transient feedback", "group related controls"
2. Find the matching row in Quick Reference, or the matching job in the index below
3. If ambiguous, read the matching reference file and walk its decision tree
4. If a `vois_record_component_choice` tool is available, call it with your selection:

   ```
   Tool: vois_record_component_choice
   Arguments:
     job: <the job-to-be-done, one sentence, e.g. "confirm destructive action">
     componentName: <exact component name from the manifest, e.g. "AlertDialog">
     alternativesConsidered: <optional array of component names you ruled out>
     reasoning: <optional one sentence on why you chose this over the alternatives>
   ```

   If that tool isn't available, this step is optional telemetry — proceed with your selection.

5. If no section matches your job and a `vois_report_pattern_gap` tool is available, call it:

   ```
   Tool: vois_report_pattern_gap
   Arguments:
     skillVersion: <this skill's version, from SKILL.md frontmatter>
     userGoal: <what the UI needs to do>
     attemptedFallback: <closest job ID from this skill, e.g. JOB-OVERLAY-INTERACTION>
     reasoning: <what the rubrics don't cover>
   ```

   There is no `description`/`closestPathId`/`gapDescription` argument shape on the real tool — use the fields above. If the tool isn't available, just note the gap in your own output and proceed with the closest match.

> **Note on workspace manifests.** These rubrics use standard shadcn/ui component names. Your workspace may extend or rename them — e.g. `Banner` instead of `Alert`, `DataTable` instead of `Table`. Check your workspace manifest for the exact name; use the rubric logic to make the selection, then record the workspace-specific name.

---

## Quick Reference

| Job | Use | Not |
|-----|-----|-----|
| Confirm destructive action | AlertDialog | Dialog, Toast |
| Fixed-length one-time code | InputOTP | Input |
| Transient feedback, no action needed | Toast | Alert, Banner |
| Transient feedback, action required | Alert (persistent) | Toast |
| Focused overlay, exactly one field anchored to a row/item | Popover | Sheet, Dialog |
| Focused overlay, short task | Dialog | Drawer, Sheet |
| Focused overlay, a handful of fields or more, contextual to a list item | Sheet | Dialog, Popover |
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
| 2–5 sequential required steps, each fits a page container | Stepper (`references/stepper.md`) | Progress, Tabs, Wizard |
| 6+ steps, or a step that needs its own full page | Wizard | Stepper |
| 3+ levels deep, counting Home | Breadcrumb | Back link |
| 2 levels deep, counting Home | Back link | Breadcrumb |
| Simple collection, no sorting | List | Table |
| Comparable attributes, < 100 rows | Table | DataTable |
| One headline number | Stat tile in a Card (see vois-dataviz) | A one-bar chart |
| Trend, comparison, share, distribution | Chart: walk the vois-dataviz decision tree | A table of raw rows |
| 100+ rows, sortable, bulk actions | DataTable | Table |
| Open a record from a table row | Sheet (full page if the record is big) | Dialog |
| Table first load | Skeleton rows under real headers | Spinner |
| Persistent app navigation | Sidebar | Drawer |
| Contextual tools for selected item | Sheet or Panel | Sidebar, Drawer |

---

## Lookalikes: Don't Hand-Build These

Agents often write markup that looks like a component but isn't one. A screen can follow every rule in this skill and still contain one. Before you write markup for any of these, use the component. The full rows (why, rule IDs, evidence, a signal a script can match) are in `data/components-rules.json` under `lookalikes`.

**Seen in blind builds** (`vois-eval/lookalike-pass`, 40 builds):

| If you are about to write | Use instead |
|---|---|
| A raw `<button>` with your own focus ring, as a text link, an icon in an input, or a Tooltip or Popover trigger | Button: `variant="link"` for text, `variant="ghost"` with an icon size and `aria-label` for icons, `asChild` as a trigger |
| `Loader2` with `animate-spin` | Spinner |
| Buttons with `role="radio"` | RadioGroup, or ToggleGroup (single) for a segmented control |
| Numbered circles joined by lines | The shared Stepper (`references/stepper.md`) |

**Not seen, but already forbidden by a rule:**

| If you are about to write | Use instead |
|---|---|
| `div` or `span` with `onClick` | Button, or a link for navigation |
| `fixed inset-0` backdrop and a centered box | Dialog, AlertDialog or Sheet |
| `setTimeout` that hides a message | Sonner toast |
| "x" or "×" text as a close | The Dialog or Sheet close, or a ghost icon Button with `aria-label` |
| `window.confirm`, `alert` or `prompt` | AlertDialog, or Sonner |
| A colored `border-l-4` box with an icon and text | Alert with a status role |
| `title="..."` as a tooltip | Tooltip |

When the prompt describes how something looks ("a red × in the corner", "a pill with a circle"), pick the component by its job, then style it. The look in a prompt is not the component.

## Job Index

`data/components-rules.json` has the full decision tree (condition → recommended component, including nested thresholds and edge cases) plus every "why not X" rationale, for all 21 jobs — query it by `id` or `number`. This is now the only source for this content; the prose reference files it was extracted from have been removed as fully redundant.

**Component specs:** when a pick has no shadcn component and agents hand-build it, the spec lives in `references/`. Today that is `references/stepper.md` (the Stepper that `JOB-MULTISTEP-GUIDE` picks) and `references/motion-morphs.md` (specs for seven morphs: label morph, shared element transfer, number ticker, icon morph, directional transition, grow-from-trigger, reorder motion). Pick the morph with `vois-patterns/references/motion.md` first.

**Source of truth:** `data/components-rules.json` is canonical and, since the prose reference files were removed, the only source for decision-tree content. The Job Index table above is the one place each `JOB-*` ID is tagged in prose, and each JSON entry's `source_file` points here.

| Job ID | Job |
|---|---|
| `JOB-CONFIRM-DESTRUCTIVE` | Job 1 Confirm destructive action |
| `JOB-TRANSIENT-FEEDBACK` | Job 2 Transient feedback |
| `JOB-OVERLAY-INTERACTION` | Job 3 Focused overlay interaction |
| `JOB-CONTAIN-CONTENT` | Job 4 Contain a unit of content |
| `JOB-SWITCH-VIEWS` | Job 5 Switch views / filter |
| `JOB-CHOOSE-FROM-LIST` | Job 6 Choose from a list |
| `JOB-CONTEXTUAL-INFO` | Job 7 Contextual info (tooltip/popover) |
| `JOB-TRIGGER-ACTION` | Job 8 Trigger an action |
| `JOB-ACCEPT-TEXT` | Job 9 Accept text input |
| `JOB-BINARY-PREFERENCE` | Job 10 Binary preference |
| `JOB-LABEL-CONTENT` | Job 11 Label/categorize content |
| `JOB-REPRESENT-USER` | Job 12 Represent a user/group |
| `JOB-LOADING-STATE` | Job 13 Loading state |
| `JOB-EMPTY-CONTENT` | Job 14 Empty content |
| `JOB-EXPOSE-ACTIONS` | Job 15 Expose a set of actions |
| `JOB-MULTISTEP-GUIDE` | Job 16 Multi-step process |
| `JOB-NAVIGATION-POSITION` | Job 17 Position in a hierarchy |
| `JOB-DISPLAY-DATA` | Job 18 Display structured data |
| `JOB-DATA-ENTRY` | Job 19 Data entry surface |
| `JOB-SECONDARY-CONTENT` | Job 20 Secondary content / persistent nav |
| `JOB-VISUALIZE-DATA` | Job 21 Visualize data (hands the form choice to vois-dataviz) |

---

## Relationship to Other Skills

**Read `vois-patterns` first.** That skill determines the container type — settings page, form, table, dialog. Once you know the structure, come here to pick the specific components that fill it.

**`vois-dataviz` for charts.** `JOB-VISUALIZE-DATA` picks the container (Card, Tabs, filter row, states). The chart form, chart colors, honesty rules and dashboard structure come from `vois-dataviz`.

**Read `vois-tokens` after.** Once components are selected, `vois-tokens` handles tokens, spacing, animation, and accessibility implementation.

**Righter for all copy.** Component labels, empty state messages, button text, error copy — all of it goes through `righter` (which calls `vois_get_microcopy` first when that tool is available). This skill says nothing about words.

---
name: vois-components
description: Component selection rubrics organized by job-to-be-done. Use after vois-patterns determines structure, before vois-tokens applies tokens. Optionally records each choice via the vois_record_component_choice MCP tool if one is available. Use when deciding between similar components — Dialog vs Drawer, Toast vs Banner, Select vs Combobox, a chart vs a table, etc.
version: 1.44.8
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
| Icon-only action | IconButton (required `label`) | Button with an icon size and no name, a bare icon |
| A few related actions as one control | ButtonGroup | Separate Buttons with gaps, SegmentedControl |
| Pick one color from a fixed set | SwatchPicker | Select with colored dots, a hex input |
| Content taller than a fixed region (panel, menu, list) | ScrollArea | `overflow: auto` with the browser scrollbar |
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
| Button opens a menu or navigates away | Button with trailing icon | Leading icon |
| Button with a familiar action symbol | Button with leading icon (approved list only) | Custom or unfamiliar icon |
| Button needs more input before it runs | Label ends with an ellipsis | Icon |

---

## Icons in Labeled Buttons (extends Job 8, Trigger an action)

Default: no icon. A button with a clear label does not need one. Add an icon only when a rule below says so. Icon-only buttons are a different case (see Job 8). Icon size and stroke live in vois-tokens.

Walk these in order. Stop at the first yes.

1. Does it open a menu or navigate away? Use a trailing icon. Chevron down for a menu, arrow for an external link. Example: Export with a chevron.
2. Is its symbol on the approved list? Use a leading icon. Approved list: plus (create), download, upload, share, trash (delete), copy (duplicate), edit, search, filter. Add to this list in one place only. If the symbol is not on the list, do not add an icon.
3. Otherwise: no icon. Example: Publish.

Rules that apply on top:

- **Group consistency.** Inside one group of actions, every button has an icon or none does. If one action has no good symbol, drop all the icons in that group. Do not force an icon onto a button just to match its neighbors.
- **One icon per button.** Never a leading and a trailing icon together.
- **Ellipsis is label punctuation, not an icon.** End the label with "..." when the action needs more input before it happens (a dialog, a name field, a choice). "Rename..." opens a prompt. A Delete that goes straight to a confirm dialog does not need one. Apply this rule on its own, whatever the icon decision was.
- **Loading.** While the action runs, show only a spinner. Hide the label and any icon, and keep the button width fixed so nothing jumps. Keep the label in the markup so the button keeps its name, and set `aria-busy`. The registry Button's `loading` prop does all of this.
- **Destructive buttons.** Trash icon is allowed. Color and variant come from vois-tokens, not from the icon.
- **Accessibility.** The label already names the action, so the icon is decorative. Give it `aria-hidden="true"`. This matches the existing decorative-icon rule in vois-tokens (`DS-A11Y-008`).
- **RTL.** Mirror directional icons (arrows, chevrons) and swap leading and trailing sides. Do not mirror symbols like plus or download.
- **Copy.** Label text goes through righter. This section says nothing about words.

Related vois-tokens rules, not changed here: `DS-ICON-001` (one stroke width), `DS-ICON-002` (icon sizes) and `DS-SURFACE-004` (less padding on the icon side of a text and icon button).

---

## What You Must Supply

Radix and native elements give roles and keyboard behavior. These parts are the caller's job. The rules are in `vois-tokens/references/accessibility.md`.

| Component | You supply | Rule |
|-----------|------------|------|
| Tooltip | A focusable trigger. Nothing essential only in the tooltip. Not on a disabled control | `DS-A11Y-029` |
| Select, Combobox, Command | A name from the visible label, not the chosen value | `DS-A11Y-030` |
| Input, Textarea | `aria-describedby` to helper and error text, `aria-invalid` on failure | `DS-A11Y-031` |
| Tabs | A text name per tab (`aria-label` if an icon). A name per tab list if there are several | `DS-A11Y-032` |
| Table | A caption or name. `<th>` with `scope` | `DS-A11Y-033` |
| Toast | A polite live region. No sole copy of a result or action | `DS-A11Y-034` |
| Switch, Checkbox, Radio | A tied visible label. A switch label names the setting | `DS-A11Y-035` |
| DropdownMenu, Popover | Radix, so Escape and focus return work | `DS-A11Y-036` |
| Spinner, Skeleton | A text name in a live region, or `aria-busy` | `DS-A11Y-037` |
| Icon Button, Dialog | `aria-label` (IconButton requires it as `label`, so it cannot be left out); a Dialog title | `DS-A11Y-007`, `DS-A11Y-019` |


---

## Lookalikes: Don't Hand-Build These

Agents often write markup that looks like a component but isn't one: a raw `<button>` with its own focus ring, `Loader2` with `animate-spin`, buttons with `role="radio"`, numbered circles joined by lines, a round `div` holding an `<img>` as a person's picture, a rounded `span` with padding as a tag or label chip, `title="..."` as a tooltip. Before you write markup for something that looks like a component, use the component. If the project doesn't have one yet, check the registry (`registry/registry.json`) for a Vois version before reaching for stock shadcn. The full rows (what to write instead, why, rule IDs, a signal a script can match) are in `data/components-rules.json` under `lookalikes`. `node vois-components/scripts/query.mjs <ComponentName>` prints the ones that name that component.

A raw `<button>` with your own focus ring, as a text link, an icon in an input, or a Tooltip or Popover trigger, is Button: `variant="link"` for text, `asChild` as a trigger. For an icon, IconButton with its required `label` (the registry's `vois-icon-button`); inside a field, InputGroupButton (vois-tokens `DS-ICON-006`). No project Button yet? Install the registry's `vois-button` item.

When the prompt describes how something looks ("a red × in the corner", "a pill with a circle"), pick the component by its job, then style it. The look in a prompt is not the component.

## Job Index

`data/components-rules.json` holds the decision tree (condition, recommended component, nested thresholds and edge cases) and every "why not X" rationale for all 24 jobs. Do not read it whole. Query it: `node vois-components/scripts/query.mjs --jobs` lists the jobs with a one-line summary, `--job` with a job id prints one job's tree, and a component name prints where each job puts it. It is the only source for this content. Each job's `source_file` points here.

**Component specs:** when a pick has no shadcn component and agents hand-build it, the spec lives in `references/`. `references/stepper.md` (the Stepper that `JOB-MULTISTEP-GUIDE` picks); `references/motion-morphs.md` (the core eight morphs), `references/motion-tray.md` (a tray and its lifecycle), `references/motion-context.md` (shared element context, chart range change, collapse to indicator, small state changes); `references/motion-logic.md` (the code for the parts that are easy to get wrong: reading motion tokens, reduced motion; copy it when you build a morph). Pick the morph with `vois-patterns/references/motion.md` first.

**Component names:** `data/component-names.json` maps every component in the UI SDK behavior inventory to its canonical name, its shadcn/ui source and its Vois registry item, with a status (`have`, `covered`, `build`, `compose`, `defer`, `skip`).

**Behavior cards (pilot):** After you pick a component, read its card if one exists: `behaviors/<id>.md` for Tabs, Dialog, Combobox, Popover, Accordion, Toggle group, Alert dialog, Menubar, Pagination, Toast, Navigation menu, Calendar, Progress, Separator, InputOTP, Carousel, Drawer and Resizable so far. A card lists how the component must behave (keyboard, focus, state, accessibility), each line with an ID like `BHV-TABS-004` and a support tag. `native` means the library does it, so do not undo it. `differs` means the library does something else, so read the note. `supply` means you build it. `decide` means a product or design choice is open, so ask. `unchecked` means nobody has checked the library yet, so test it before you rely on it. If there is no card, the component has no written behavior rules yet, so say so and do not invent them. `behaviors/<id>.json` is the source and the `.md` is generated. `node vois-components/scripts/behaviors.mjs` checks them, and `--write` rebuilds the `.md`.

---

## Relationship to Other Skills

**Read `vois-patterns` first.** That skill determines the container type — settings page, form, table, dialog. Once you know the structure, come here to pick the specific components that fill it.

**`vois-dataviz` for charts.** `JOB-VISUALIZE-DATA` picks the container (Card, Tabs, filter row, states). The chart form, chart colors, honesty rules and dashboard structure come from `vois-dataviz`.

**`vois-fields` for specialized inputs.** `JOB-ACCEPT-TEXT` picks the component (Input, Textarea, InputOTP). For an email, phone, URL, postal code, name, VIN, driver's license, SSN, money, percent, date or one-time code value, a prefilled value or a record picker, `vois-fields` gives the input type, keyboard, autofill, check timing and privacy handling. A one-time code input must take a pasted or autofilled whole code.

**Read `vois-tokens` after.** Once components are selected, `vois-tokens` handles tokens, spacing, animation, and accessibility implementation.

**Righter for all copy.** Component labels, empty state messages, button text, error copy — all of it goes through `righter` (which calls `vois_get_microcopy` first when that tool is available). This skill says nothing about words.

---
name: vois-components
description: Component selection rubrics organized by job-to-be-done. Use after vois-patterns determines structure, before vois-tokens applies tokens. Use when deciding between similar components — Dialog vs Drawer, Toast vs Banner, Select vs Combobox, etc.
version: 1.4.2
---

# Vois Component Selection Skill

> Full version & updates: https://github.com/ommakes/Skills/blob/main/vois-components/SKILL.md

You are picking specific components from the workspace manifest. This skill answers **"which component for this job"** — not what structure (that's `vois-patterns`) and not how to style it (that's `vois-tokens`).

Read this skill after `vois-patterns` has determined the container type.

The Quick Reference table below resolves most cases on its own. When it doesn't — ambiguous case, need the full decision tree, or need to justify the choice — read the matching Job Detail section.

---

## Before You Pick a Component

1. Identify the **job-to-be-done** — phrase it as a verb plus object: "confirm a destructive action", "show transient feedback", "group related controls"
2. Find the matching row in Quick Reference, or the matching job in Job Details below
3. If ambiguous, read the matching job's decision tree and rationale
4. If no job matches, note the gap in your own output and proceed with the closest match

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

## Job Details

### Feedback & Confirmation

**Job 1 — Confirm a destructive or consequential action** `JOB-CONFIRM-DESTRUCTIVE`
*The user is about to do something hard or impossible to undo.*
- Reversible, affects only current user (archive, move) → Toast with undo action
- Not reversible, affects only current user (delete, disconnect) → AlertDialog
- Affects other users (revoke access, cancel shared resource) → AlertDialog + post-action notification
- Has external consequences (publish, send email, charge) → AlertDialog with explicit consequence text in body

Why not Dialog? AlertDialog enforces `role="alertdialog"`, which screen readers announce with higher urgency — use it whenever consequences exist. Why not Toast for irreversible actions? Toasts auto-dismiss; if the user looks away, they miss confirmation. Reserve Toast-with-undo for actions with at least a 5-second undo window.

**Job 2 — Show transient feedback after a user action** `JOB-TRANSIENT-FEEDBACK`
*The user did something and the UI needs to acknowledge it.*
- Pure acknowledgment, no action required (saved, copied, sent) → Toast
- User needs to act before continuing → Alert (inline, persistent until dismissed)
- Error tied to a specific input/field/section → Alert inline, positioned adjacent to the source
- System-wide announcement (maintenance, outage) → Alert, sticky to top, not dismissible until resolved

Why not Toast for actionable messages? It can disappear before the user reads or acts. Why not Toast for field errors? It's far from the source — inline Alert removes the mapping step.

**Job 13 — Communicate loading state** `JOB-LOADING-STATE`
*Something is being fetched or processed.*
- Fetching content that fills a known layout (page/list/card load) → Skeleton matching the shape of incoming content
- Short in-place action (button submitting, search running) → Spinner inside/replacing the trigger, disable the trigger
- Long operation with measurable progress (upload, multi-step processing) → Progress bar with percentage/step count

Why not Spinner for page loads? No structure = no prediction of what's coming; Skeleton reduces perceived load time and prevents layout shift. Why not Skeleton for action feedback? Wrong location — Spinner keeps feedback local to the trigger. Why not Progress for unknown duration? An indeterminate bar is just a spinner in a different shape — use Progress only with a real percentage.

**Job 14 — Handle missing or empty content** `JOB-EMPTY-CONTENT`
*A list, table, or view has no data to show.*
- True zero state, user can create from this screen → EmptyState with primary CTA
- True zero state, user can't create from here → EmptyState with explanation, no CTA
- Filtered/searched to zero (not true zero) → Inline message + "clear filters" action, not a full EmptyState
- Feature not yet set up/unlocked → EmptyState with onboarding copy, no CTA if action lives elsewhere

Why not skip the empty state? A blank area with no explanation looks broken. Why not full EmptyState for filtered results? Disproportionate and feels like an error — use a lightweight inline message instead.

### Overlays & Containers

**Job 3 — Contain a focused overlay interaction** `JOB-OVERLAY-INTERACTION`
*The user needs to complete an interaction without leaving the current context.*
- Short, self-contained task, 1–4 fields or a single decision → Dialog
- Short, self-contained, destructive/consequential → AlertDialog (see Job 1)
- Longer task or relates to a list item, user will want to see the page behind it → Sheet (right-anchored, partial overlap)
- Longer task needing full attention → Drawer (full-height, slides from bottom on mobile)
- Simple contextual input on mobile (quick select, number entry) → Drawer (action sheet pattern)

Why not Dialog for longer tasks? Centered dialogs feel disconnected from the data they relate to — Sheet keeps spatial proximity. Why not Drawer on desktop for simple tasks? Takes up too much screen real estate; Dialog is faster to close.
*At a glance:* Dialog = task is self-contained. Sheet = task is contextual, user may want to reference the triggering item.

**Job 4 — Contain a unit of content** `JOB-CONTAIN-CONTENT`
*You need a surface to group related content into a discrete visual block.*
- Interactive, standard container for items → Card (header, body, optional footer)
- Interactive, whole card is the primary action target → make the whole Card clickable
- Named section of a larger page, not a standalone item → semantic HTML `section` + heading, not a Card
- Workspace panel, tool pane, persistent sidebar section → Surface / Panel (workspace-specific)

Why not wrap everything in a Card? It implies a discrete, interactive item — using it for every content group flattens visual hierarchy. Use semantic sections with headings instead.

**Job 20 — Host secondary content or persistent navigation** `JOB-SECONDARY-CONTENT`
*A surface for secondary content, tools, or navigation outside the main content area.*
- Persistent, always-visible app-level navigation → Sidebar (collapsible)
- Contextual detail/tools for a selected item, user triggered it explicitly → Sheet
- Contextual detail/tools, always visible when an item is selected → Panel (persistent secondary pane)
- Temporary overlay for a task (mobile nav, filters, multi-step task) → Drawer

Why not Drawer for persistent navigation? Drawer is temporary; navigation the user returns to shouldn't require reopening — use Sidebar. Why not Sidebar for contextual tools? Sidebar is structural/layout; Sheet or Panel is contextual to a selection.
*At a glance:* Sheet slides from the right edge with partial overlap; Drawer typically comes from the bottom on mobile and conveys a distinct task mode.

### Navigation & Switching

**Job 5 — Switch between views or filter to a subset** `JOB-SWITCH-VIEWS`
*Navigate between distinct views, or filter content into categories.*
- Switching between distinct pages/major content areas (Settings: Profile, Billing, Members) → Tabs
- Filtering to a category, 2–4 mutually exclusive options → Segmented Control (or pill-styled Tabs)
- Filtering, 5+ options or options that change dynamically → Select or Combobox (see Job 6)
- Applying non-exclusive labels/types (tagging, multi-select filter) → Checkbox group or Badge filters, not Tabs

Why not Segmented Control for major navigation? It communicates narrowing a view, not going somewhere new — use Tabs for distinct content areas. Why not Tabs/Pills for many options? Scrolling tabs are a bad pattern past 5–6 options — switch to Select/Combobox.

**Job 17 — Indicate position in a hierarchy and enable backtracking** `JOB-NAVIGATION-POSITION`
*The user has navigated into a nested view and needs to know where they are.*
- 2+ levels deep (Settings > Workspace > Members) → Breadcrumb, full path, every item a link
- 1 level deep, came from a specific list/context → Back link (arrow + parent page name)
- Top-level page with sibling pages → Navigation (sidebar/top nav) — no breadcrumb needed

Why not Breadcrumb for 1 level deep? "Home > Current Page" is almost always unnecessary noise — use only with 3+ meaningful levels. Why not browser back? The destination changes depending on navigation history — an explicit back link always goes to the correct parent.

### Selection & Input

**Job 6 — Let the user choose from a known list** `JOB-CHOOSE-FROM-LIST`
*Select one or more items from a predefined set.*
- Short list (under 8), no search needed, single select → Select (dropdown)
- Long list (8+) or user might not know the exact option name → Combobox (Select + search)
- User needs to search across data types or trigger actions, not just pick a value → Command (palette-style)
- Only 2 options → Radio buttons or Segmented Control, not Select

Why not Combobox for short lists? Adds a search affordance where none is needed — Select is simpler with less friction. Why not Command for standard selection? It's a power-user tool; using it for a plain form field pick adds cognitive overhead.

**Job 9 — Accept text input from the user** `JOB-ACCEPT-TEXT`
*The user needs to enter text as part of a form or interaction.*
- Single line (name, email, search, number, URL) → Input
- Multi-line, unformatted, 1–3 lines expected → Textarea (set `rows` to hint length)
- Multi-line, unformatted, 4+ lines expected → Textarea with auto-resize or fixed height + scroll
- Formatted text where formatting matters to the user → RichTextEditor (workspace-specific, typically Tiptap)

Why not Textarea for everything? Single-line inputs set a clear expectation — "Email address" in a Textarea implies more content than it needs. Why not RichTextEditor by default? Heavy, harder to validate, produces HTML/markdown to handle — only use when formatting is meaningful to the task.

**Job 10 — Capture a binary preference** `JOB-BINARY-PREFERENCE`
*Turn something on/off, or agree/disagree.*
- Takes effect immediately, no save button → Switch (or Toggle)
- Part of a form submitted later, one option in a group → Checkbox
- Part of a form submitted later, single standalone consent → Checkbox, not Switch
- Mutually exclusive choice between two options in a form → Radio buttons, not Checkbox

Why not Switch for form fields? Switch implies immediate effect; in a form with a submit button, nothing should change until submit. Why not Checkbox for settings toggles? Settings that apply in real time (dark mode, notifications) need the immediacy Switch communicates.

### Display & Identity

**Job 11 — Label or categorize a piece of content** `JOB-LABEL-CONTENT`
*Communicate metadata, status, or category attached to an item.*
- Status/category label, read-only, decorative → Badge (inline, non-interactive)
- User-created label that can be applied and removed (tags, labels on an issue) → Badge with dismiss (Chip/Tag)
- Selected filter or active facet in a search/filter UI → Badge with dismiss

Why not a Button for dismissible labels? A dismissible label says "this is an attribute you can remove"; a Button says "click me to do something" — different visual weight and meaning. Why not plain text? Can't carry color-coding, contrast, or truncation the way Badge can.

**Job 12 — Represent a user or group** `JOB-REPRESENT-USER`
*Show who's involved — who owns a record, who's in a conversation, who's online.*
- Single user with a profile photo → Avatar (image)
- Single user, no photo → Avatar (initials fallback)
- Multiple users where count matters → AvatarGroup (stacked, overflow shown as "+4")
- Real-time presence (online/offline/away) → Avatar + Presence indicator (workspace-specific)

Why not AvatarGroup when count doesn't matter? A single Avatar with initials or a "Team" label may be cleaner — AvatarGroup implies the count itself is meaningful.

**Job 18 — Display structured data** `JOB-DISPLAY-DATA`
*Show a collection of items with shared attributes.*
- Simple items, no sorting/filtering/bulk actions (notifications, activity feed) → List (semantic `ul`/`li`)
- Multiple comparable attributes, under 100 rows, no freezing/virtualization → Table
- Multiple comparable attributes, 100+ rows, sortable, bulk actions → DataTable (typically TanStack Table based)
- Cards in a grid (products, projects, media) → Grid of Cards, not a Table

Why not Table for simple lists? Table implies columns are meaningful for comparison — an activity feed isn't about comparison; List is lighter and more correct. Why not DataTable for small data sets? Pagination and bulk-action infrastructure is overhead for 20 rows — start with Table and add only what you need.

### Contextual Info & Actions

**Job 7 — Provide additional context without cluttering the UI** `JOB-CONTEXTUAL-INFO`
*Something on screen needs a label or explanation that shouldn't always be visible.*
- Short label for an icon/control/abbreviated text (≤25 words) → Tooltip (hover/focus, disappears on move)
- Rich content (links, images, interactive elements), triggered by click → Popover
- Rich content, triggered by hover (passive preview) → HoverCard
- Contextual preview of a linked entity (profile, link preview) → HoverCard

Why not Popover for tooltips? Requires a click to open/close — more friction than a passive label needs. Why not Tooltip for interactive content? WCAG requires tooltip content be keyboard-accessible; interactive elements inside a Tooltip aren't reliably reachable — use Popover instead.

**Job 8 — Trigger an action** `JOB-TRIGGER-ACTION`
*The user needs a target to tap or click.*
- Has a text label, primary/secondary/destructive/outline/ghost → Button (variant handles it)
- Has a text label, opens a menu of related choices → Button + DropdownMenu (see Job 15)
- Icon-only, single action → Button with icon + `aria-label`
- Icon-only, grouped with other icon actions → Toggle (on/off) or Button (one-shot)
- Removable selection or filter the user created → Badge with dismiss (Chip pattern), not a Button

Why not a custom div/span? Buttons handle keyboard focus, Enter/Space activation, disabled state, and `role="button"` automatically — never fake a button. Why Button for icon-only instead of a bare icon? Button provides the 44×44px minimum touch target, focus ring, and accessible label.

**Job 15 — Expose a set of actions** `JOB-EXPOSE-ACTIONS`
*Give access to multiple actions without cluttering the primary UI.*
- Item-specific actions (table row, selected card), triggered by button → DropdownMenu
- Item-specific actions, triggered by right-click → ContextMenu
- Global or page-level actions (header, toolbar) → DropdownMenu anchored to a trigger button
- Actions searched/navigated by keyboard (power users) → Command (see Job 6)

Why not a flat list of buttons? More than 3 visible actions overwhelms the UI — group secondary/destructive actions in a DropdownMenu. Why not ContextMenu as the primary interface? Only discoverable by users who know to right-click — it's an enhancement, not a primary surface. Why not Command for row-level actions? Command is global; row actions are local — DropdownMenu keeps scope clear.

### Forms & Process

**Job 16 — Guide through a multi-step process** `JOB-MULTISTEP-GUIDE`
*The user needs to complete multiple steps in sequence.*
- All required, in order, progress visible, 2–5 steps fitting one page → Stepper
- All required, in order, progress visible, 5+ steps each filling the screen → Wizard
- Phases of an ongoing process the user checks back on → Progress component (read-only tracker)
- Any order, none blocking → Checklist/task list, not a Stepper

Why not Progress for onboarding flows? Progress just displays how far along something is — it provides no navigation or form state. Stepper/Wizard provide that scaffolding; Progress can live inside it as a visual indicator.

**Job 19 — Build a data entry surface** `JOB-DATA-ENTRY`
*A structured container for form fields.*
- Simple form, all fields in one place, one submit action → Form (shadcn Form wrapper for validation)
- Complex form with grouped sections (billing vs. shipping address) → Form with multiple FormSection/Fieldset groups
- Single field outside a full form (inline edit, quick update) → Standalone Field with its own validation state

Why not FormProvider for everything? Excess infrastructure for a single controlled field — use it at 3+ fields with cross-field validation. Why not nested Forms? HTML doesn't allow nested `<form>` elements — use sibling forms for independent submission targets.

---

## Relationship to Other Skills

**Read `vois-patterns` first.** That skill determines the container type — settings page, form, table, dialog. Once you know the structure, come here to pick the specific components that fill it.

**Read `vois-tokens` after.** Once components are selected, `vois-tokens` handles tokens, spacing, animation, and accessibility implementation.

**Righter for all copy.** Component labels, empty state messages, button text, error copy — all of it goes through `righter`. This skill says nothing about words.

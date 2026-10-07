---
name: vois-components
description: Component selection rubrics organized by job-to-be-done. Use after vois-patterns determines structure, before vois-tokens applies tokens. Use when deciding between similar components — Dialog vs Drawer, Toast vs Banner, Select vs Combobox, a chart vs a table, etc.
version: 1.10.2
---

# Vois Component Selection Skill

> Full version & updates: https://github.com/ommakes/Skills/blob/main/vois-components/SKILL.md — the full version adds the machine-readable decision trees (`data/components-rules.json`) and the Stepper spec as its own file.

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
| Focused overlay, exactly one field anchored to a row/item | Popover | Sheet, Dialog |
| Focused overlay, short task | Dialog | Drawer, Sheet |
| Focused overlay, a handful of fields or more, contextual to a list item | Sheet | Dialog, Popover |
| Group content, interactive item | Card | div, Surface |
| Switch between major content areas | Tabs | Segmented Control |
| Filter a list, 2–4 options | Segmented Control | Tabs |
| Choose from short list | Select | Combobox |
| Choose from long list / search | Combobox | Select |
| Fixed-length one-time code | InputOTP | Input |
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
| Table first load | Skeleton rows under real headers | Spinner |
| Row-level actions | DropdownMenu | ContextMenu, Command |
| Right-click enhancement | ContextMenu | DropdownMenu |
| 2–5 sequential required steps, each fits a page container | Stepper (spec below) | Progress, Tabs, Wizard |
| 6+ steps, or a step that needs its own full page | Wizard | Stepper |
| 3+ levels deep, counting Home | Breadcrumb | Back link |
| 2 levels deep, counting Home | Back link | Breadcrumb |
| Simple collection, no sorting | List | Table |
| Comparable attributes, < 100 rows | Table | DataTable |
| 100+ rows, sortable, bulk actions | DataTable | Table |
| Open a record from a table row | Sheet (full page if the record is big) | Dialog |
| One headline number | Stat tile in a Card (see vois-dataviz) | A one-bar chart |
| Trend, comparison, share, distribution | Chart: walk the vois-dataviz decision tree | A table of raw rows |
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
- A table is loading: first load → Skeleton rows under the real column headers, matching the loaded column widths; filter, sort, or page change reloading data → keep the stale rows and show a small Spinner, don't blank the table

Why not Spinner for page loads? No structure = no prediction of what's coming; Skeleton reduces perceived load time and prevents layout shift. Why not Skeleton for action feedback? Wrong location — Spinner keeps feedback local to the trigger. Why not Progress for unknown duration? An indeterminate bar is just a spinner in a different shape — use Progress only with a real percentage.

**Job 14 — Handle missing or empty content** `JOB-EMPTY-CONTENT`
*A list, table, or view has no data to show.*
- True zero state, user can create from this screen → EmptyState with primary CTA
- True zero state, user can't create from here → EmptyState with explanation, no CTA
- Filtered/searched to zero (not true zero) → Inline message + "clear filters" action, not a full EmptyState
- Feature not yet set up/unlocked → EmptyState with onboarding copy, no CTA if action lives elsewhere
- Zero rows is normal and good (no live calls, no open issues) → plain statement, no CTA
- The user's role cannot see any rows → EmptyState that says access is the reason and who can grant it, no create CTA
- A plan limit hides some rows → Alert above the table with the upgrade action, not a footer note

Why not skip the empty state? A blank area with no explanation looks broken. Why not full EmptyState for filtered results? Disproportionate and feels like an error — use a lightweight inline message instead.

### Overlays & Containers

**Job 3 — Contain a focused overlay interaction** `JOB-OVERLAY-INTERACTION`
*The user needs to complete an interaction without leaving the current context.*
- Editing exactly one field/value, anchored to the specific row/item that triggered it → Popover (anchored to the trigger, no Dialog/Sheet/Drawer chrome)
- Short, self-contained task, 1–4 fields or a single decision → Dialog
- Short, self-contained, destructive/consequential → AlertDialog (see Job 1)
- Task touches a handful of fields or more, needs more screen space, or otherwise relates to a list item, user will want to see the page behind it → Sheet (right-anchored, partial overlap)
- Longer task needing full attention → Drawer (full-height, slides from bottom on mobile)
- Simple contextual input on mobile (quick select, number entry) → Drawer (action sheet pattern)
- The user opens a record from a table row: 8 or fewer fields and no related records → Sheet (right-anchored, table stays visible), view first with an Edit action or edit directly; tabs, a timeline, related records, or a long form → full page, reached from an Open action in the Sheet; only a confirmation, not a record → AlertDialog or Dialog

Why not Dialog for table row detail? A centered Dialog hides the table and breaks the sense that the record belongs to the row; a right-anchored Sheet keeps the list visible, lets users step to the next row, and can escalate to a full page. Why not Dialog for longer tasks? Centered dialogs feel disconnected from the data they relate to — Sheet keeps spatial proximity. Why not Drawer on desktop for simple tasks? Takes up too much screen real estate; Dialog is faster to close. Why not Sheet for a single-field inline edit (e.g. one row's status)? Sheet's own header/footer chrome is more than one field needs and visually detaches the edit from the exact cell it changes — anchor it as a Popover instead. Why not Popover once more than one field is involved? Labels, inputs, and validation for multiple fields don't fit a small anchored panel — move to Sheet.
*At a glance:* Popover = exactly one field, anchored to the trigger. Dialog = task is self-contained (1-4 fields). Sheet = a handful of fields or more, contextual, user may want to reference the triggering item.

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
- Switching between distinct pages/major content areas (Settings: Profile, Billing, Members) → Tabs. A settings page with 4 or more sections uses sidebar navigation instead
- Filtering to a category, 2–4 mutually exclusive options → Segmented Control (or pill-styled Tabs)
- Filtering, 5+ options or options that change dynamically → Select or Combobox (see Job 6)
- Applying non-exclusive labels/types (tagging, multi-select filter) → Checkbox group or Badge filters, not Tabs

Why not Segmented Control for major navigation? It communicates narrowing a view, not going somewhere new — use Tabs for distinct content areas. Why not Tabs/Pills for many options? Scrolling tabs are a bad pattern past 5–6 options — switch to Select/Combobox.

**Job 17 — Indicate position in a hierarchy and enable backtracking** `JOB-NAVIGATION-POSITION`
*The user has navigated into a nested view and needs to know where they are.*
- 3+ levels deep, counting Home (Home > Invoices > Invoice) → Breadcrumb, full path, every item a link
- 2 levels deep, counting Home (Home > Settings), came from a specific list/context → Back link (arrow + parent page name; just "Back" when the parent is Home)
- Top-level page with sibling pages → Navigation (sidebar/top nav) — no breadcrumb needed

Why not Breadcrumb for 2 levels deep? "Home > Current Page" is almost always unnecessary noise — use it with 3 or more levels, counting Home. A record page opened from its list is 3 levels, so it gets a Breadcrumb. Why not browser back? The destination changes depending on navigation history — an explicit back link always goes to the correct parent.

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
- Fixed-length one-time code (email or SMS verification code, authenticator code) → InputOTP (one cell per character, behaves as a single field)
- Multi-line, unformatted, 1–3 lines expected → Textarea sized with the line-count tokens; keep a `rows` attribute as the fallback for browsers without `field-sizing` support
- Multi-line, unformatted, 4+ lines expected → Textarea with `field-sizing: content`, or fixed height + scroll
- Formatted text where formatting matters to the user → RichTextEditor (workspace-specific, typically Tiptap)

Why not Textarea for everything? Single-line inputs set a clear expectation — "Email address" in a Textarea implies more content than it needs. Why not RichTextEditor by default? Heavy, harder to validate, produces HTML/markdown to handle — only use when formatting is meaningful to the task. Why not a plain Input for a one-time code? Cells show how many characters are expected, and paste or autofill fills every character at once; a plain Input hides the length and invites typos in the middle.

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
- Paging a DataTable → Pagination at 25, 50, or 100 per page; virtualize only for database-style grids with thousands of rows
- Editing values inside a table: one atomic, low-risk value → edit in the cell; a handful of fields → Sheet form; the same change on many rows → bulk action bar

Why not Table for simple lists? Table implies columns are meaningful for comparison — an activity feed isn't about comparison; List is lighter and more correct. Why not DataTable for small data sets? Pagination and bulk-action infrastructure is overhead for 20 rows — start with Table and add only what you need. Why not infinite scroll for a DataTable? Users lose their place, the footer count disappears, and a row's position stops being stable for stepping through records or sharing a link; pagination keeps all three.

**Job 21 — Visualize data: chart, KPI tile, sparkline, or dashboard** `JOB-VISUALIZE-DATA`
*The reader needs to see a number, a trend, a comparison, a share or a distribution, not read a list of records.*
- One current value, with or without a change → Card containing a stat tile: value, delta against a named period, optional sparkline. Not a chart.
- Shape over time, comparison, parts of a whole, relationship, distribution, or flow → hand off to `vois-dataviz` (full repo): walk its decision tree to pick the form, then build with the workspace chart primitives (typically shadcn Chart over Recharts)
- Exact lookup, or many attributes at once → Table or DataTable (Job 18), with inline sparklines for trend
- A dashboard of several visualizations → each widget a Card with a header (title, scope, actions), the plot, and a footer link; sections or secondary views in Tabs; date range, comparison and dimension filters in one filter row above the cards; Skeleton in the final geometry while loading, an EmptyState per empty case, an inline error with retry inside the card

Why not a Table for a trend? A table gives exact values but hides shape; use a chart and keep the table as its accessible twin. Why not a one-bar chart or a 2-slice pie for a single value? The number is the chart; a stat tile with a delta says it faster. Why hand off to `vois-dataviz`? Chart choice depends on the viewer's job, audience, series count and honesty rules (baseline, axes, partial periods) that this skill doesn't cover.

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

Why not a custom div/span? Buttons handle keyboard focus, Enter/Space activation, disabled state, and `role="button"` automatically — never fake a button. Why Button for icon-only instead of a bare icon? Button provides a hit area of at least the `--hit-area-min` token, a focus ring, and an accessible label.

**Job 15 — Expose a set of actions** `JOB-EXPOSE-ACTIONS`
*Give access to multiple actions without cluttering the primary UI.*
- Item-specific actions (table row, selected card), triggered by button → DropdownMenu
- Item-specific actions, triggered by right-click → ContextMenu
- Global or page-level actions (header, toolbar) → DropdownMenu anchored to a trigger button
- Actions searched/navigated by keyboard (power users) → Command (see Job 6)

Why not a flat list of buttons? Two visible actions is the target and three is the ceiling; group everything else, including secondary and destructive actions, in a DropdownMenu. Why not ContextMenu as the primary interface? Only discoverable by users who know to right-click — it's an enhancement, not a primary surface. Why not Command for row-level actions? Command is global; row actions are local — DropdownMenu keeps scope clear.

### Forms & Process

**Job 16 — Guide through a multi-step process** `JOB-MULTISTEP-GUIDE`
*The user needs to complete multiple steps in sequence.*
- All required, in order, progress visible, 2 to 5 steps, each step's content fits in a page container (a form, a short list) → Stepper (spec below)
- All required, in order, progress visible, 6 or more steps, or any number where a step needs its own full-screen layout → Wizard
- Phases of an ongoing process the user checks back on → Progress component (read-only tracker)
- Any order, none blocking → Checklist/task list, not a Stepper

Why not Progress for onboarding flows? Progress just displays how far along something is — it provides no navigation or form state. Stepper/Wizard provide that scaffolding; Progress can live inside it as a visual indicator. Why not Tabs for steps? Tabs let the user jump to any panel and gate nothing; steps are ordered and each validates before the next opens. Why 5 and 6 as the boundary? Past five markers the labels don't fit in one row at form width (judgment, not observed); the old wording said 2 to 5 and 5 or more, so exactly 5 fit both. Is a plus and minus control a Stepper? No, that is a quantity control. Stepper only means the step indicator.

**Job 19 — Build a data entry surface** `JOB-DATA-ENTRY`
*A structured container for form fields.*
- Simple form, all fields in one place, one submit action → Form (shadcn Form wrapper for validation)
- Complex form with grouped sections (billing vs. shipping address) → Form with multiple FormSection/Fieldset groups
- Single field outside a full form (inline edit, quick update) → Standalone Field with its own validation state

Why not FormProvider for everything? Excess infrastructure for a single controlled field — use it at 3+ fields with cross-field validation. Why not nested Forms? HTML doesn't allow nested `<form>` elements — use sibling forms for independent submission targets.

---

## Stepper Spec

shadcn/ui ships no Stepper. Build it once per workspace and reuse it; don't rebuild it per screen. Basis: judgment.

- **What it is:** a step indicator for a sequential, required flow of 2 to 5 steps, shown above the step content. Not a quantity control (minus, number, plus), not Tabs, not Progress, not a Breadcrumb. One step is not a flow.
- **Anatomy:** a `nav` with an `aria-label` that names the flow, holding an `ol`. Each `li` has a marker (a circle with the step number, or a check when complete), a one or two word noun label, and a connector line that fills when the step before it is complete. An optional one-line description shows on the current step only.
- **States** (each carries more than color): Upcoming = number, neutral border, muted label. Current = filled with the primary color, `aria-current="step"`. Complete = check icon, "Completed" in visually hidden text. Error = alert icon in the `negative` status role, "Needs attention" in visually hidden text.
- **Behavior:** Back and Next move between steps; the indicator is not in the tab order. A completed step is clickable only when going back loses nothing the user typed. Each step validates before the next opens. Back keeps what the user typed. On a step change, move focus to the new step's heading. The last step is a result ("Done") with no Next.
- **Layout:** top of the form container, above the step content. One Stepper per flow. Below the `sm` breakpoint, show only the current label and a line such as "Step 2 of 3: Team", and keep the markers. Markers are 32px; connectors are 1px lines.
- **Motion and contrast:** color changes take 200ms or less and respect `prefers-reduced-motion`. Label on its background is normal text (4.5:1); the marker border against the page is a UI component (3:1).

---

## Lookalikes: Don't Hand-Build These

Agents often write markup that looks like a component but isn't one. A screen can follow every rule above and still contain one. Before you write markup for any of these, use the component.

**Seen in blind builds** (40 builds):

| If you are about to write | Use instead |
|---|---|
| A raw `<button>` with your own focus ring, as a text link, an icon in an input, or a Tooltip or Popover trigger | Button: `variant="link"` for text, `variant="ghost"` with an icon size and `aria-label` for icons, `asChild` as a trigger |
| `Loader2` with `animate-spin` | Spinner |
| Buttons with `role="radio"` | RadioGroup, or ToggleGroup (single) for a segmented control |
| Numbered circles joined by lines | The shared Stepper (spec above) |

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

---

## Relationship to Other Skills

**Read `vois-patterns` first.** That skill determines the container type — settings page, form, table, dialog. Once you know the structure, come here to pick the specific components that fill it.

**Read `vois-tokens` after.** Once components are selected, `vois-tokens` handles tokens, spacing, animation, and accessibility implementation.

**`vois-dataviz` for charts.** `JOB-VISUALIZE-DATA` picks the container (Card, Tabs, filter row, states). The chart form, chart colors, honesty rules and dashboard structure come from `vois-dataviz` in the full repo.

**Righter for all copy.** Component labels, empty state messages, button text, error copy — all of it goes through `righter`. This skill says nothing about words.

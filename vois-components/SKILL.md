---
name: vois-components
description: Component selection rubrics organized by job-to-be-done. Use after vois-patterns determines structure, before vois-design-system applies tokens. For every component you pick, call the record_component_choice MCP tool. Use when deciding between similar components — Dialog vs Drawer, Toast vs Banner, Select vs Combobox, etc.
version: 1.0.0
---

# Vois Component Selection Skill

You are picking specific components from the workspace manifest. This skill answers **"which component for this job"** — not what structure (that's `vois-patterns`) and not how to style it (that's `vois-design-system`).

Read this skill after `vois-patterns` has determined the container type. For every component you pick, call `record_component_choice` before moving to `vois-design-system`.

---

## Before You Pick a Component

1. Identify the **job-to-be-done** — phrase it as a verb plus object: "confirm a destructive action", "show transient feedback", "group related controls"
2. Find the matching section below
3. Walk the decision tree to a specific component
4. Call `record_component_choice` with your selection:

   ```
   Tool: record_component_choice
   Arguments:
     job: <the job-to-be-done, one sentence>
     componentName: <exact component name from the manifest>
     alternativesConsidered: <array of component names you ruled out>
     reasoning: <one sentence on why you chose this over the alternatives>
   ```

5. If no section matches your job, call `report_pattern_gap`:

   ```
   Tool: report_pattern_gap
   Arguments:
     description: <what the UI needs to do>
     closestPathId: <closest job ID from this skill, e.g. JOB-OVERLAY-INTERACTION>
     gapDescription: <what the rubrics don't cover>
   ```

> **Note on workspace manifests.** These rubrics use standard shadcn/ui component names. Your workspace may extend or rename them — e.g. `Banner` instead of `Alert`, `DataTable` instead of `Table`. Check your workspace manifest for the exact name; use the rubric logic to make the selection, then record the workspace-specific name.

---

## Job 1: Confirm a destructive or consequential action `[JOB-CONFIRM-DESTRUCTIVE]`

The user is about to do something that's hard or impossible to undo.

```
├─ Action affects only current user, and undo is available (e.g. archive, move)
│  └─ Toast with undo action
│
├─ Action is not reversible, affects only current user (delete, disconnect)
│  └─ AlertDialog
│
├─ Action affects other users (revoke access, cancel shared resource)
│  └─ AlertDialog + post-action notification to affected users
│
└─ Action has external consequences (publish, send email, charge)
   └─ AlertDialog with explicit consequence text in body
```

**Why not Dialog?** Dialog is for any modal interaction. AlertDialog enforces `role="alertdialog"`, which screen readers announce with higher urgency. Any time consequences exist, use AlertDialog — it's not just convention, it's an ARIA distinction.

**Why not Toast for irreversible actions?** Toasts auto-dismiss. If the user looked away or the connection dropped, they miss confirmation. Reserve Toast-with-undo for genuinely reversible actions where the undo window is at least 5 seconds.

---

## Job 2: Show transient feedback after a user action `[JOB-TRANSIENT-FEEDBACK]`

The user did something and the UI needs to acknowledge it.

```
├─ Pure acknowledgment, no action required (saved, copied, sent)
│  └─ Toast
│
├─ User needs to act on the message before continuing
│  └─ Alert (inline, persistent until dismissed)
│
├─ Error tied to a specific input, field, or section
│  └─ Alert inline (positioned adjacent to the source — proximity = relationship)
│
└─ System-wide announcement (maintenance, outage, account issue)
   └─ Alert (sticky to top of page, not dismissible until resolved)
```

**Why not Toast for actionable messages?** If the toast disappears before the user reads or acts, the message is lost. Anything requiring action needs a persistent surface.

**Why not Toast for errors on inputs?** Toast places feedback far from the source. Users have to read the toast, track back to the form, and figure out which field the error belongs to. Inline Alert eliminates that mapping step.

---

## Job 3: Contain a focused overlay interaction `[JOB-OVERLAY-INTERACTION]`

The user needs to complete an interaction without leaving the current context.

```
├─ Short, self-contained task (confirm, quick form, select one thing)
│  ├─ 1–4 fields or a single decision      → Dialog
│  └─ Destructive or consequential         → AlertDialog (see Job 1)
│
├─ Longer task, needs more screen space, or relates to an item in a list
│  ├─ User will likely want to see the page behind it while working
│  │  └─ Sheet (right-anchored, partial overlap)
│  └─ User needs full attention on the task
│     └─ Drawer (full-height, slides from bottom on mobile)
│
└─ Simple contextual input on mobile (quick select, number entry, confirmation)
   └─ Drawer (action sheet pattern on mobile)
```

**Why not Dialog for longer tasks?** Dialogs are centered and feel disconnected from the data they relate to. A Sheet keeps spatial proximity to the list or item that triggered it.

**Why not Drawer on desktop for simple tasks?** Drawers take up significant screen real estate. A Dialog is faster to close and draws less visual weight for simple interactions.

**Dialog vs Sheet at a glance:**
- Dialog: task is self-contained, user doesn't need context from the page behind it
- Sheet: task is contextual, user may want to reference the list/item that triggered it

---

## Job 4: Contain a unit of content `[JOB-CONTAIN-CONTENT]`

You need a surface to group related content or data into a discrete visual block.

```
├─ Content is interactive (user can click, expand, or take action on it)
│  ├─ Card (has header, body, optional footer — standard container for items)
│  └─ If the card itself is the primary action target → make the whole card clickable
│
├─ Content is a named section of a larger page (not a standalone item)
│  └─ Use semantic HTML section + heading, not a Card
│
└─ Content is a workspace panel, tool pane, or persistent sidebar section
   └─ Surface / Panel (workspace-specific — check manifest)
```

**Why not wrap everything in a Card?** Card implies a discrete, potentially interactive item. Using it for every group of content on a page flattens the visual hierarchy. Named sections with headings use semantic structure to create the same grouping without a card border.

---

## Job 5: Switch between views or filter to a subset `[JOB-SWITCH-VIEWS]`

The user needs to navigate between distinct views or filter content into categories.

```
├─ Switching between distinct pages or major content areas (Settings: Profile, Billing, Members)
│  └─ Tabs (persistent selection, full content swap)
│
├─ Filtering a list or data set to a category (All / Active / Archived)
│  ├─ 2–4 options, mutually exclusive                → Segmented Control (or Tabs styled as pills)
│  └─ 5+ options or options that change dynamically  → Select or Combobox (see Job 6)
│
└─ Applying non-exclusive labels or types to items (tagging, multi-select filter)
   └─ Checkbox group or Badge filters (not Tabs — Tabs are always mutually exclusive)
```

**Why not Segmented Control for major navigation?** Segmented Control is for filtering, not navigation. It communicates "I'm narrowing this view" not "I'm going somewhere new." For content areas with meaningfully different layouts or enough content to warrant their own visual space, use Tabs.

**Why not Pills/Tabs for many options?** Tabs should be visible all at once — scrolling tabs are a bad pattern. If you have more than 5–6 options, switch to a Select or Combobox so the user can find their option without horizontal scrolling.

---

## Job 6: Let the user choose from a known list `[JOB-CHOOSE-FROM-LIST]`

The user needs to select one or more items from a predefined set.

```
├─ Short list (under 8 items), no search needed, single select
│  └─ Select (dropdown, keyboard navigable)
│
├─ Long list (8+ items) OR user might not know the exact option name
│  └─ Combobox (Select + search input, filters as user types)
│
├─ User needs to search across multiple data types or trigger actions (not just pick a value)
│  └─ Command (palette-style, supports search + sections + keyboard shortcuts)
│
└─ Only 2 options
   └─ Radio buttons or Segmented Control (see Job 5) — don't use Select for binary choices
```

**Why not Combobox for short lists?** Combobox adds a text input that implies searching. For short lists where all options are visible immediately, a Select is simpler and has less friction.

**Why not Command for standard selection?** Command is a power-user tool. It's appropriate for global search, action launchers, and complex filtering. Using it for a straightforward form field pick creates cognitive overhead for a task that doesn't warrant it.

---

## Job 7: Provide additional context without cluttering the UI `[JOB-CONTEXTUAL-INFO]`

Something on screen needs a label or explanation that shouldn't always be visible.

```
├─ Short label for an icon, control, or abbreviated text (25 words or under)
│  └─ Tooltip (appears on hover/focus, disappears when cursor moves)
│
├─ Rich content — links, images, longer text, interactive elements
│  ├─ Triggered by click (user controls when to see it)    → Popover
│  └─ Triggered by hover (passive preview)                 → HoverCard
│
└─ Contextual preview of a linked entity (user profile, link preview)
   └─ HoverCard
```

**Why not Popover for tooltips?** Popovers require a click to open and close, which is more friction than a label needs. Tooltips are passive — they inform, they don't require action. If the content requires a click to dismiss, it's a Popover, not a Tooltip.

**Why not Tooltip for interactive content?** WCAG requires that tooltip content be accessible via keyboard. Interactive elements (links, buttons) inside a Tooltip aren't reliably reachable by keyboard users. If the content is interactive, use a Popover.

---

## Job 8: Trigger an action `[JOB-TRIGGER-ACTION]`

The user needs a target to tap or click to make something happen.

```
├─ Action has a text label (most actions should)
│  ├─ Primary, secondary, destructive, outline, ghost → Button (variant handles it)
│  └─ Action opens a menu of related choices           → Button + DropdownMenu (see Job 15)
│
├─ Action is icon-only (constrained space, toolbar, well-understood symbol)
│  ├─ Single action                         → Button with icon and aria-label
│  └─ Grouped with other icon actions       → Toggle (for on/off) or Button (for one-shot)
│
└─ Action is a removable selection or filter (user created it, they can remove it)
   └─ Badge with dismiss (Chip pattern) — not a Button
```

**Why not a custom div or span?** Buttons handle keyboard focus, Enter/Space activation, disabled state, and `role="button"` automatically. A div with `onClick` doesn't. Never fake a button.

**Why use Button for icon-only instead of a bare icon?** The button element provides a 44×44px minimum touch target (when styled correctly), focus ring, and accessible label via `aria-label`. An icon on its own has none of that.

---

## Job 9: Accept text input from the user `[JOB-ACCEPT-TEXT]`

The user needs to enter text as part of a form or interaction.

```
├─ Single line of text (name, email, search, number, URL)
│  └─ Input
│
├─ Multi-line text without formatting (description, notes, feedback)
│  ├─ 1–3 lines expected      → Textarea (set rows attribute to hint at expected length)
│  └─ 4+ lines expected       → Textarea with auto-resize or fixed height + scroll
│
└─ Formatted text (bold, lists, links — where formatting matters to the user)
   └─ RichTextEditor (workspace-specific — check manifest; typically Tiptap or similar)
```

**Why not Textarea for everything?** Single-line inputs set a clear expectation for the user about what kind of response is expected. "Email address" in a Textarea is confusing — it implies more content is expected than an email address provides. Match the input shape to the expected content.

**Why not RichTextEditor by default?** Rich text editors are heavy, harder to validate, and produce HTML or markdown that your backend needs to handle. Only use them when the formatting itself is meaningful to the user's task — product descriptions, long-form notes, content creation.

---

## Job 10: Capture a binary preference `[JOB-BINARY-PREFERENCE]`

The user needs to turn something on or off, or agree or disagree.

```
├─ Setting takes effect immediately (no save button required)
│  └─ Switch (or Toggle — same semantic, check your manifest)
│
├─ Setting is part of a form submitted later
│  ├─ One option in a group of related options    → Checkbox
│  └─ Single standalone agree/consent             → Checkbox (not Switch — Switch implies immediate effect)
│
└─ Mutually exclusive choice between two options in a form
   └─ Radio buttons (not Checkbox — Checkbox implies multi-select is possible)
```

**Why not Switch for form fields?** Switch communicates immediate effect — the moment the user flips it, something changes. In a form with a submit button, the user expects nothing to change until they submit. Using a Switch in that context sends a mixed signal.

**Why not Checkbox for toggles in settings?** Checkbox requires submitting a form or clicking a button to apply. For settings that should apply in real time (dark mode, notifications, sidebar collapsed), Switch communicates immediacy correctly.

---

## Job 11: Label or categorize a piece of content `[JOB-LABEL-CONTENT]`

You need to communicate metadata, status, or category attached to an item.

```
├─ Status or category label, not interactive (read-only, decorative)
│  └─ Badge (inline, non-interactive)
│
├─ User-created label that can be applied and removed (tags in a CRM, labels on an issue)
│  └─ Badge with dismiss button (Chip/Tag pattern)
│
└─ Selected filter or active facet in a search or filter UI
   └─ Badge with dismiss (dismissing removes the filter)
```

**Why not a Button for dismissible labels?** A dismissible label communicates "this is an attribute of the item, and you can remove it." A Button communicates "click me to do something." The visual weight and shape differ. Use Badge-with-dismiss to keep the categorical meaning intact.

**Why not a plain text label?** Plain text can't carry visual weight, color-coding, or truncation behavior. When the label needs to be scannable at distance in a table or list, Badge handles it with appropriate contrast and padding.

---

## Job 12: Represent a user or group `[JOB-REPRESENT-USER]`

You need to show who is involved in something — who owns a record, who is in a conversation, who is online.

```
├─ Single user
│  ├─ User has a profile photo → Avatar (image)
│  └─ No photo available       → Avatar (initials fallback)
│
├─ Multiple users, count matters (showing all members of a team)
│  └─ AvatarGroup (stacks avatars with overflow count: "+4")
│
└─ Real-time presence (online/offline/away, active in document)
   └─ Avatar + Presence indicator (colored dot, workspace-specific — check manifest)
```

**Why not AvatarGroup when count doesn't matter?** If you're just showing that multiple people are associated with something (not how many), a single Avatar with initials or "Team" label may be cleaner. AvatarGroup implies the count is meaningful.

---

## Job 13: Communicate loading state `[JOB-LOADING-STATE]`

Something is being fetched or processed and the user needs to know.

```
├─ Fetching content that will fill a known layout (page load, list load, card content)
│  └─ Skeleton (placeholder that matches the shape of the content coming in)
│
├─ Short action in progress, result will appear in place (button submitting, search running)
│  └─ Spinner inside or replacing the trigger element (disable the trigger while loading)
│
└─ Long operation with measurable progress (file upload, multi-step processing)
   └─ Progress bar (with percentage or step count if deterministic)
```

**Why not Spinner for page loads?** A full-page spinner with no structure gives the user no prediction about what's coming. A skeleton shows the layout shape, which reduces perceived load time and prevents layout shift when content arrives.

**Why not Skeleton for action feedback?** Skeleton is for content that will fill a known area. For a button that's waiting on a response, a Skeleton would appear in the wrong place. A Spinner inside the button keeps the feedback local and immediate.

**Why not Progress for unknown-duration operations?** An indeterminate progress bar (animated fill with no percentage) is just a spinner in a different shape. If you don't know the duration, use a Spinner. Progress is for when you have a real percentage to show.

---

## Job 14: Handle missing or empty content `[JOB-EMPTY-CONTENT]`

A list, table, or view has no data to show.

```
├─ User has never created anything in this section (true zero state)
│  ├─ User can create from this screen    → EmptyState with primary CTA
│  └─ User can't create from here         → EmptyState with explanation (no CTA)
│
├─ Filters or search removed all results (filtered empty, not true zero)
│  └─ Inline message + "clear filters" action (not a full EmptyState component — too heavy)
│
└─ Feature hasn't been set up or unlocked yet (empty by design, not by absence of data)
   └─ EmptyState with onboarding copy explaining what this section will do (no CTA if action is elsewhere)
```

**Why not skip the empty state?** A blank area with no explanation looks broken. Users don't know if the data is loading, filtered away, or genuinely absent. Always acknowledge empty content.

**Why not a full EmptyState for filtered results?** EmptyState is a significant visual element. Using it every time a search returns zero results is disproportionate and feels like an error. A simple inline message with a "clear filters" link is appropriate and keeps the interaction lightweight.

---

## Job 15: Expose a set of actions `[JOB-EXPOSE-ACTIONS]`

You need to give the user access to multiple actions without cluttering the primary UI.

```
├─ Actions are specific to the item on screen (row in a table, selected card)
│  ├─ Triggered by a button click          → DropdownMenu
│  └─ Triggered by right-click             → ContextMenu
│
├─ Actions are global or page-level (header actions, toolbar)
│  └─ DropdownMenu (anchored to a trigger button)
│
└─ Actions are searched or navigated by keyboard (power users, complex apps)
   └─ Command (palette-style — see Job 6)
```

**Why not a flat list of buttons for everything?** More than 3 visible actions overwhelms the UI. Group secondary and destructive actions inside a DropdownMenu, keep only the most important 1–2 actions as visible Buttons.

**Why not ContextMenu as a primary interface?** ContextMenu is discoverable only by users who know to right-click. It's an enhancement for power users, not a primary action surface. The same actions should be available from a visible trigger.

**Why not Command for row-level actions?** Command is a global tool. It searches across everything. Row-level actions are local to one item — a DropdownMenu keeps that scope clear.

---

## Job 16: Guide through a multi-step process `[JOB-MULTISTEP-GUIDE]`

The user needs to complete multiple steps in sequence to accomplish a larger goal.

```
├─ Steps are all required, user must complete them in order, progress is visible
│  ├─ 2–5 steps, fits on one page with sections    → Stepper (inline step indicator)
│  └─ 5+ steps, each step fills the screen         → Wizard (full-page steps with own layout)
│
├─ Steps represent phases of an ongoing process the user checks back on
│  └─ Progress component (read-only status tracker, not a navigation element)
│
└─ Steps can be completed in any order, none are blocking
   └─ Checklist or task list (not a Stepper — Stepper implies sequential dependency)
```

**Why not Progress for onboarding flows?** Progress is a display component — it shows how far along something is. It doesn't provide navigation between steps or form state. A Stepper or Wizard provides the navigation scaffolding; Progress can be used inside it as a visual indicator.

---

## Job 17: Indicate position in a hierarchy and enable backtracking `[JOB-NAVIGATION-POSITION]`

The user has navigated into a nested view and needs to know where they are and how to get back.

```
├─ User is 2+ levels deep in a hierarchy (Settings > Workspace > Members)
│  └─ Breadcrumb (shows full path, every item is a link)
│
├─ User is 1 level deep, came from a specific list or context
│  └─ Back link (single arrow + parent page name — simpler than a breadcrumb)
│
└─ User is on a top-level page with sibling pages
   └─ Navigation (sidebar or top nav — breadcrumb isn't needed at the top level)
```

**Why not Breadcrumb for 1-level deep?** A breadcrumb showing "Home > Current Page" is almost always unnecessary. A single back link is cleaner. Only use Breadcrumb when there are 3+ meaningful levels to display.

**Why not a back button (browser back)?** Relying on browser history means the back destination changes depending on how the user got there. An explicit back link always goes to the correct parent, regardless of navigation history.

---

## Job 18: Display structured data `[JOB-DISPLAY-DATA]`

You need to show a collection of items with shared attributes.

```
├─ Items are simple, no sorting, filtering, or bulk actions needed (notifications, activity feed)
│  └─ List (semantic ul/li with consistent item layout)
│
├─ Items have multiple comparable attributes (users, orders, records)
│  ├─ Under 100 rows, no column freezing, no virtualization
│  │  └─ Table
│  └─ 100+ rows, sortable columns, bulk actions, column management
│     └─ DataTable (check workspace manifest — typically TanStack Table based)
│
└─ Items are cards in a grid (products, projects, media)
   └─ Grid of Cards (not a Table — tables communicate that attributes are comparable; cards communicate that items are browsable)
```

**Why not Table for simple lists?** Table implies the columns are meaningful for comparison. An activity feed or notification list has items but comparison between them isn't the point. A List is the correct semantic element and lighter visually.

**Why not DataTable for small data sets?** DataTable adds pagination, column visibility management, and bulk action infrastructure. For 20 rows with no sorting or bulk actions, that complexity is overhead. Use Table and add only the features you need.

---

## Job 19: Build a data entry surface `[JOB-DATA-ENTRY]`

You need a structured container for form fields.

```
├─ Simple form, all fields in one place, one submit action
│  └─ Form (standard HTML form element with shadcn Form wrapper for validation)
│
├─ Complex form with grouped sections (billing address, shipping address separately)
│  └─ Form with multiple FormSection/Fieldset groups inside it
│
└─ Single field used outside a full form (inline edit, quick update)
   └─ Standalone Field with its own validation state (no Form wrapper required)
```

**Why not FormProvider for everything?** FormProvider (or shadcn's Form) sets up a react-hook-form context. For a single field with basic controlled state, that's excess infrastructure. Use it when you have 3+ fields with cross-field validation.

**Why not nested Forms?** HTML doesn't allow nested `<form>` elements. If you need multiple independent submission targets on one page, use `<form>` elements that are siblings, not nested.

---

## Job 20: Host secondary content or persistent navigation `[JOB-SECONDARY-CONTENT]`

You need a surface to contain secondary content, tools, or navigation that doesn't belong in the main content area.

```
├─ Persistent navigation (app-level, always visible on desktop)
│  └─ Sidebar (navigation variant — always rendered, collapsible)
│
├─ Contextual detail or tools related to a selected item (inspector, properties)
│  ├─ User triggered it explicitly (clicked a button or item)   → Sheet (slides in from edge)
│  └─ Always visible when an item is selected                   → Panel (persistent secondary pane)
│
└─ Temporary overlay for a task (mobile nav, filters on mobile, multi-step task)
   └─ Drawer (full-height slide-in, closes when done)
```

**Why not Drawer for persistent navigation?** Drawer is temporary — it opens for a task and closes. Navigation that the user returns to repeatedly shouldn't require reopening every time. Use a collapsible Sidebar instead.

**Why not Sidebar for contextual tools?** A Sidebar is structural — it's part of the page layout. A Sheet or Panel is contextual — it's related to whatever the user selected. Mixing these makes the layout feel unstable, as the Sidebar width would change based on user actions.

**Sheet vs Drawer:**
- Sheet: slides in from the right edge, partial overlap, user can still see the page behind it
- Drawer: typically from the bottom on mobile, conveys a distinct task mode

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

## Relationship to Other Skills

**Read `vois-patterns` first.** That skill determines the container type — settings page, form, table, dialog. Once you know the structure, come here to pick the specific components that fill it.

**Read `vois-design-system` after.** Once components are selected, `vois-design-system` handles tokens, spacing, animation, and accessibility implementation.

**Righter for all copy.** Component labels, empty state messages, button text, error copy — all of it goes through `righter` (which calls `get_microcopy` first). This skill says nothing about words.

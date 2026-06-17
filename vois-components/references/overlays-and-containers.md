# Overlays and Containers

Decision trees and reasoning for Jobs 3, 4, 20.

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

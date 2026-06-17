# Contextual Info and Actions

Decision trees and reasoning for Jobs 7, 8, 15.

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

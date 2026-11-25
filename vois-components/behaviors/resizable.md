<!-- GENERATED from behaviors/resizable.json by scripts/behaviors.mjs. Edit the JSON, then run `node vois-components/scripts/behaviors.mjs --write`. Do not edit by hand. -->

# Resizable behavior

A split view with a divider that a person drags, or moves with the keyboard, to give one side more room.

**Use something else when:**

- PanelLayout: One side panel is placed beside the page by the panel rules, and the person does not drag the divider.
- Tabs: The views are alternatives, not parts of one screen.
- Accordion: The sections open and close; they do not share one box.

**Basis:** react-resizable-panels, checked 2026-11-25. Behaviors come from the vois-resizable source and its browser test (registry/scripts/resizable.test.mjs). The Notion UI SDK inventory page for Resizable was not read for this card. The support tag on each row was checked against version 4.24.2 on the checked date, and the rows marked unchecked were not. The shadcn component names the parts ResizablePanelGroup, ResizablePanel and ResizableHandle, and the library names them Group, Panel and Separator.

**Support tags**

- `native`: The library does this. Do not undo it.
- `differs`: The library does something else. Read the note.
- `supply`: The library does not do this. You build it.
- `decide`: This needs a product or design decision.
- `unchecked`: Not checked against the library yet.

## Anatomy

| Part | Required | Note |
|---|---|---|
| ResizablePanelGroup | yes | The row or column. Needs a height, and orientation says which way the panels sit. |
| ResizablePanel | yes | One pane. A number is pixels and a string without a unit is a percentage. |
| ResizableHandle | yes | The divider. A focusable separator. Pass aria-label. withHandle draws a grip. |

## Interaction

- **BHV-RESIZABLE-001** `native` Dragging the divider resizes the two panels beside it, and a drag starting a few pixels from the line works too.
- **BHV-RESIZABLE-002** `native` A panel stops at its minimum and maximum size, and the other panels never go under theirs. (DS-PANEL-005)
- **BHV-RESIZABLE-003** `unchecked` A double click on the divider resets the panels to their default sizes. The library has disableDoubleClick on the separator. The reset was not driven in a browser.
- **BHV-RESIZABLE-004** `unchecked` A collapsible panel collapses when it is dragged under its minimum and opens again past a threshold. The library has collapsible, collapsedSize and collapsedThreshold on the panel. vois-resizable passes them through and they were not tested.

## Keyboard

- **BHV-RESIZABLE-005** `native` The arrow keys along the split move the divider by 5, Home and End go to the ends of its range, and an arrow across the split does nothing.
- **BHV-RESIZABLE-006** `unchecked` Enter collapses or restores a collapsible panel next to the divider, and F6 moves focus to the next divider. Both are in the library's keydown handler. They were read there and not driven in a browser.

## Focus

- **BHV-RESIZABLE-007** `supply` The divider takes focus, and the ring shows for the keyboard only. The library gives the separator tabindex 0 and a data-separator state of focus. vois-resizable draws the ring with focus-visible and the shared ring tokens; the browser test checks that a pointer focus draws none.

## State

- **BHV-RESIZABLE-008** `native` A disabled divider does not move by pointer or key, and says so to assistive technology.
- **BHV-RESIZABLE-009** `supply` The divider shows hover and drag with a color change, and a disabled one shows a not-allowed cursor. The library sets data-separator to hover, active, focus, inactive or disabled. vois-resizable colors the line from it.
- **BHV-RESIZABLE-010** `unchecked` Sizes can be remembered between visits. The library has defaultLayout, onLayoutChanged and useDefaultLayout. Not wired or tested here.
- **BHV-RESIZABLE-014** `supply` Panel widths are token names, never a raw number in a template. A number is pixels in this library. Read the push panel tokens, or pass the same sizes as the tokens hold, and keep the main area over --main-min. (DS-PANEL-005, DS-PANEL-008)

## Accessibility

- **BHV-RESIZABLE-011** `native` The divider is a separator with its orientation, its value and the panel it controls. aria-orientation is the line's own direction: vertical for a divider between two columns.
- **BHV-RESIZABLE-012** `supply` The divider has an accessible name that says what it moves. The library adds no name. Pass aria-label such as Resize sidebar. (DS-A11Y-007)
- **BHV-RESIZABLE-013** `native` Dragging has an alternative: the arrow keys, and Home and End. (DS-A11Y-023)

## Common mistakes

- **BHV-RESIZABLE-015** `supply` Do not forget a height. A group is as tall as its parent, and a parent with no height collapses it.
- **BHV-RESIZABLE-016** `differs` Do not pass 30 for a 30 percent panel. A bare number is 30 pixels. Write "30%". Earlier versions of the library and the shadcn examples written for them read a number as a percentage.
- **BHV-RESIZABLE-017** `supply` Do not leave a divider without a name. (DS-A11Y-007)

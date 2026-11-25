<!-- GENERATED from behaviors/drawer.json by scripts/behaviors.mjs. Edit the JSON, then run `node vois-components/scripts/behaviors.mjs --write`. Do not edit by hand. -->

# Drawer behavior

A modal panel that slides in from the bottom, top, left or right of the screen, and can be dragged back toward its edge to dismiss it. On a phone it is the bottom sheet for a choice or a short task.

**Use something else when:**

- Dialog: The task is a short confirmation or a small form that belongs in the middle of the screen on a wide window.
- AlertDialog: The person must answer before anything else, such as a destructive confirmation.
- Panel: The pane stays beside the page while the person works (a push panel), with no scrim.
- Popover: The content is small, belongs to one control and does not block the page.

**Basis:** vaul, checked 2026-11-25. Behaviors come from the vois-drawer source and its browser test (registry/scripts/drawer.test.mjs). The Notion UI SDK inventory page for Drawer was not read for this card. The support tag on each row was checked against vaul 1.1.2 on the checked date, and the rows marked unchecked were not.

**Support tags**

- `native`: The library does this. Do not undo it.
- `differs`: The library does something else. Read the note.
- `supply`: The library does not do this. You build it.
- `decide`: This needs a product or design decision.
- `unchecked`: Not checked against the library yet.

## Anatomy

| Part | Required | Note |
|---|---|---|
| Drawer (root) | yes | Holds the open state and the direction. vois-drawer turns on autoFocus, which Vaul leaves off. |
| DrawerTrigger | no | The control that opens it. Focus returns to it when the drawer closes. |
| DrawerContent | yes | The surface. It is the drag target and the dialog. Takes size for a left or right drawer, and showCloseButton. |
| DrawerOverlay | yes | The scrim. DrawerContent draws it. |
| DrawerHeader, DrawerTitle, DrawerDescription | yes | The title names the dialog and the description describes it. A title is required. |
| DrawerBody | no | The middle. It scrolls and keeps the header and the footer in view. |
| DrawerFooter | no | The actions, right aligned. Stacked with the primary action on top below md. |
| DrawerClose | no | Closes the drawer. The ghost close button is one, and so is a Cancel in the footer. |

## Interaction

- **BHV-DRAWER-001** `native` Dragging the drawer toward its edge and letting go past a quarter of its height closes it. A shorter, slower drag snaps it back. A release faster than 0.4 px per ms closes it at any distance (VELOCITY_THRESHOLD). The whole drawer is the drag target, not only the handle.
- **BHV-DRAWER-002** `supply` A person who cannot drag has a visible way to close it: a close button, or a Cancel in the footer. Vaul draws no close control. vois-drawer adds a ghost icon button named Close, on by default (showCloseButton). (DS-A11Y-023, DS-RESPONSIVE-008)
- **BHV-DRAWER-003** `native` Escape and a click on the scrim close it. (DS-A11Y-022)
- **BHV-DRAWER-004** `unchecked` The drawer can refuse to be dismissed by drag, scrim or key while an action is in flight. Vaul has a dismissible prop. Whether it also stops Escape was not checked. (DS-A11Y-022)
- **BHV-DRAWER-005** `unchecked` The drawer can rest at several heights (snap points) and the person drags between them. Vaul has snapPoints. vois-drawer does not style or test them, and the slide motion override was not checked against them.

## Focus

- **BHV-DRAWER-006** `differs` When the drawer opens, focus moves into it. Tab stays inside, and when it closes focus goes back to the trigger. Out of the box a keyboard user who opens a Vaul drawer keeps focus on the trigger under the scrim. vois-drawer sets autoFocus to true. The trap and the return come from Radix Dialog. (DS-A11Y-020, DS-A11Y-021, DS-MODAL-001)

## State

- **BHV-DRAWER-009** `supply` The drawer docks to the bottom, top, left or right edge, and the surface follows it: the edge that faces the page, the rounded free corners, and a shadow that falls away from the dock. Vaul sets the direction as data-vaul-drawer-direction and draws nothing else. vois-drawer styles each edge. (DS-ELEVATION-006)
- **BHV-DRAWER-010** `supply` A left or right drawer takes a width tier (--panel-overlay-sm, -md or -lg), half the window at most and never under --panel-overlay-min. Below md it is the whole screen. Vaul sets no width. The tier is CSS, so it follows the window. (DS-PANEL-002, DS-PANEL-006)
- **BHV-DRAWER-011** `supply` A bottom or top drawer is at most 90dvh tall. Its body scrolls inside, with the header and footer in view, and the scroll never reaches the page. Put overscroll-behavior contain on the scrolling part. vois-drawer's DrawerBody does. A body with nothing focusable in it needs tabIndex 0 so a keyboard can scroll it. (DS-MODAL-002, DS-MODAL-004, DS-RESPONSIVE-008)
- **BHV-DRAWER-012** `differs` The slide and the scrim run on a motion token, and stop under reduced motion. Vaul's own timing is a literal. vois-drawer overrides it with !important on --motion-duration-slow and --motion-ease-emphasized, and removes the animation under reduced motion. A drag still follows the pointer. (DS-MOTION-001, DS-MOTION-002)
- **BHV-DRAWER-013** `supply` On a phone the footer stacks and the primary action is on top. Put the secondary action first in the markup. vois-drawer reverses the column below md. (DS-RESPONSIVE-008)
- **BHV-DRAWER-014** `supply` Safe areas: the edges that touch the screen pad by the safe-area insets. (DS-RESPONSIVE-010)

## Accessibility

- **BHV-DRAWER-007** `native` The page behind the drawer is hidden from assistive technology and takes no clicks. (DS-MODAL-001)
- **BHV-DRAWER-008** `native` The drawer is a dialog with a name and a description. Radix warns when there is no title. Do not pass an id to the title or the description. (DS-A11Y-019)

## Common mistakes

- **BHV-DRAWER-015** `supply` Do not open a drawer from a dialog, a sheet or another drawer. A second step replaces the content. (DS-MODAL-006)
- **BHV-DRAWER-016** `supply` Do not use a drawer for navigation. A list of places to go is a menu or a page. (DS-MODAL-007)
- **BHV-DRAWER-017** `supply` Do not leave out the title. Hide it with a visually hidden title if the design shows none. (DS-A11Y-019)
- **BHV-DRAWER-018** `supply` Do not make dragging the only way to close it. (DS-A11Y-023)

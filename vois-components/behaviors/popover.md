<!-- GENERATED from behaviors/popover.json by scripts/behaviors.mjs. Edit the JSON, then run `node vois-components/scripts/behaviors.mjs --write`. Do not edit by hand. -->

# Popover behavior

A small panel that opens beside its trigger to hold a short task, such as editing a profile or sharing a link, handling placement, focus and dismissal.

**Basis:** radix-ui, checked 2026-11-23. Behaviors come from the Notion UI SDK inventory (2026-11-21). The support tag on each one was checked against the Radix source on the checked date. The popper, dismissable-layer and focus-scope packages were read only for the lines cited.

**Support tags**

- `native`: The library does this. Do not undo it.
- `differs`: The library does something else. Read the note.
- `supply`: The library does not do this. You build it.
- `decide`: This needs a product or design decision.
- `unchecked`: Not checked against the library yet.

## Anatomy

| Part | Required | Note |
|---|---|---|
| Popover (root) | yes | Holds the open state. |
| PopoverTrigger | yes | The button that opens the popover. It can sit apart from the content. |
| PopoverContent | yes | The panel. It has the dialog role. |
| PopoverTitle | no | Names the popover. Radix has it. vois-popover does not export it yet. |
| PopoverDescription | no | Adds context. Radix has it. vois-popover does not export it yet. |
| PopoverArrow | no | In vois-popover this is the arrow prop on PopoverContent. It follows the side the panel lands on. |
| PopoverClose | no | Closes the popover. A popover can have several. |
| PopoverAnchor | no | Places the panel against something other than the trigger. |
| PopoverShortcut | no | Shows the keys for a shortcut. Radix has no such part. |

## Interaction

- **BHV-POPOVER-001** `native` Pressing the trigger opens the popover. It closes from a Close control, Escape or a press outside it. The Vois item keeps all of this. (DS-A11Y-036)
- **BHV-POPOVER-002** `supply` A form inside can save a value and then close. A form that submits as a dialog closes on submission and returns its submit button's value. Radix does not close on submit. Set open to false in your submit handler, or put a PopoverClose on the submit button.
- **BHV-POPOVER-003** `supply` Hovering the trigger can open it after a short pause. Moving the pointer across the gap into the panel keeps it open so its contents can be used. Radix Popover opens on press only. Opening on hover is the job of the hover card (vois-hover-card).
- **BHV-POPOVER-004** `supply` Opening another hover popover closes the current one, unless the new one is inside it, so a row of hover triggers shows one at a time. Same as the line above. Radix has no hover group.
- **BHV-POPOVER-005** `supply` A keyboard shortcut can toggle the popover, using Command on Apple platforms and Control elsewhere, and the trigger advertises the shortcut. Radix has no shortcut part. Add a key handler and show the keys yourself.
- **BHV-POPOVER-006** `native` The panel flips or shifts to stay visible when its requested position does not fit near a window edge. Its arrow follows the side it actually lands on. The Vois item sets collisionPadding to 8.
- **BHV-POPOVER-007** `supply` One controller can serve a whole list. Each trigger passes its own row of data, so one editor panel works for every row, and opening from another row updates the same panel. Radix has one trigger per root. For a list, keep one controlled Popover, move its anchor to the active row, and hold the row data in your own state.
- **BHV-POPOVER-008** `supply` As a sheet on small touch screens, it can be swiped down to dismiss. If dismissal is disabled, it springs back and reports the attempt. Radix has no sheet presentation. Use a Drawer or Sheet for small touch screens.

## Keyboard

- **BHV-POPOVER-009** `native` Escape closes the popover and returns focus to the trigger, unless dismissal has been turned off. Focus goes back to the trigger after Escape. After a press outside, focus stays where the press landed. (DS-A11Y-036)
- **BHV-POPOVER-010** `supply` The configured keyboard shortcut opens and closes it. See the shortcut line under Interaction.

## Focus

- **BHV-POPOVER-011** `native` Focus moves into the panel when it opens, starting on the first field or a chosen element, and returns to the trigger when it closes.
- **BHV-POPOVER-012** `differs` Focus leaving the panel closes it by default. A focus-trapping mode keeps Tab inside while the page can still scroll and receive clicks. A fully modal mode also makes the rest of the page inert and locks scrolling. Radix has two modes, not three. The modal mode hides the rest of the page from assistive tech with aria-hidden. It does not use the inert attribute. For a trap with no scroll lock, build it with FocusScope.
- **BHV-POPOVER-013** `supply` Opening on hover leaves focus alone. Opening by touch focuses the panel itself, so no on-screen keyboard appears. Radix focuses the first focusable element on open. Change it with onOpenAutoFocus.
- **BHV-POPOVER-014** `supply` Focus leaving is refused quietly while dismissal is turned off. The trigger, Close controls and controller can still close it. Radix has no dismissal flag. Call preventDefault in onFocusOutside, onInteractOutside and onEscapeKeyDown.

## State

- **BHV-POPOVER-015** `supply` Setting dismissal off keeps Escape and outside presses from closing it while there is unsaved work. It reports each refused dismissal so the app can ask whether to discard it. Same as above. Use the same three handlers, and ask your question from inside them.
- **BHV-POPOVER-016** `native` An open or close change can be rejected by the surrounding code.
- **BHV-POPOVER-017** `native` The panel stays mounted until its exit animation finishes. It can also be kept mounted while closed but hidden. The Vois item writes the exit keyframes (vois-popover-out).
- **BHV-POPOVER-018** `supply` A completion event fires after the open or close transition. Radix has no completion event. Listen for onAnimationEnd on the content.
- **BHV-POPOVER-019** `native` The panel can be positioned against another element, such as a search field. Its position is re-read as that anchor moves.
- **BHV-POPOVER-020** `unchecked` The panel can be positioned against a point on the page or a text range. PopoverAnchor takes an element. Whether it accepts a virtual reference for a point or a range is not checked.
- **BHV-POPOVER-021** `differs` The trigger is marked while its popover is open. With several triggers, only the active one is marked and receives focus back. Every trigger in one root shows as open. Use one Popover per trigger, or track the active trigger yourself.

## Accessibility

- **BHV-POPOVER-022** `native` The content has the dialog role. Its title names it, and its description adds context. vois-popover does not export PopoverTitle or PopoverDescription yet. Until it does, name the panel with aria-label on PopoverContent.
- **BHV-POPOVER-023** `native` The trigger is a button that opens a dialog, and focus inside follows the dialog pattern.

## Common mistakes

- **BHV-POPOVER-024** `supply` Do not hide overflow around an arrow that extends outside the panel. Keep overflow visible around it.
- **BHV-POPOVER-025** `supply` Do not move a sheet yourself. The sheet manages its own position, so leave its translation alone and avoid the floating panel's fixed width.

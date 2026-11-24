<!-- GENERATED from behaviors/dialog.json by scripts/behaviors.mjs. Edit the JSON, then run `node vois-components/scripts/behaviors.mjs --write`. Do not edit by hand. -->

# Dialog behavior

Open a focused task over the page.

**Use something else when:**

- AlertDialog: The question needs an explicit answer.
- Drawer: The task should show as a sheet from an edge of the screen, for example on small touch screens.

**Basis:** radix-ui, checked 2026-11-23. Behaviors come from the Notion UI SDK inventory (2026-11-21). The support tag on each one was checked against the Radix source on the checked date. Nested dialog code lives in the dismissable-layer package, which was not read.

**Support tags**

- `native`: The library does this. Do not undo it.
- `differs`: The library does something else. Read the note.
- `supply`: The library does not do this. You build it.
- `decide`: This needs a product or design decision.
- `unchecked`: Not checked against the library yet.

## Anatomy

| Part | Required | Note |
|---|---|---|
| Dialog (root) | yes | Holds the open state. |
| DialogTrigger | no | Opens the dialog from the page. Needed for focus to return on close. |
| DialogContent | yes | The dialog itself. |
| DialogTitle | yes | Names the dialog. Hide it visually if the design shows none. |
| DialogDescription | no | Gives context. It describes the dialog only while one is rendered. |
| DialogOverlay | no | Dims the page behind a modal dialog. |
| DialogClose | no | A dialog can have several Close parts. |

## Interaction

- **BHV-DIALOG-001** `native` Closing the dialog returns focus to where you started. Works only when a Trigger exists. See BHV-DIALOG-008 for a dialog opened from code. (DS-A11Y-021)
- **BHV-DIALOG-002** `unchecked` Either close button, Escape, or a press outside closes the dialog. A form inside that submits as a dialog closes it on a valid submission, and the pressed button's value is the result. Close button, Escape and outside press are Radix features. The form-as-dialog result is not part of Radix. Escape and outside press code sits in dismissable-layer, which was not read. (DS-A11Y-022)
- **BHV-DIALOG-003** `supply` An ordinary form stays open until you close the dialog yourself.
- **BHV-DIALOG-004** `supply` A keyboard shortcut on the trigger opens the dialog from anywhere on the page. It uses Command on Apple platforms and Control elsewhere, and the trigger shows the keys. Radix has no shortcut part.
- **BHV-DIALOG-005** `unchecked` The dialog stays mounted until its closing animation finishes. A callback runs after opening or closing has finished. Radix uses Presence for the exit animation. The completion callback was not found in the dialog source.
- **BHV-DIALOG-006** `decide` A dialog opened inside another dialog joins its stack. Closing the parent closes its children. The topmost dialog closes first. Not checked in Radix. The Vois rule says never nest modals. Replace the content of the same dialog, or use a page. (DS-MODAL-006)

## Keyboard

- **BHV-DIALOG-007** `native` Enter or Space on the trigger opens the dialog.

## Focus

- **BHV-DIALOG-008** `differs` Where focus starts and where it goes after closing can each be chosen. The default returns to the trigger, or to the element focused before a dialog was opened from code. Pass onOpenAutoFocus and onCloseAutoFocus to choose. With no Trigger, nothing receives focus on close unless you set it. (DS-A11Y-021)
- **BHV-DIALOG-009** `supply` Focusing the dialog itself makes reading start at the top. Keeping the header and actions outside the scrolling area keeps them in view while long content scrolls. (DS-MODAL-004)

## State

- **BHV-DIALOG-010** `native` In the default modal mode the page is blocked, scrolling locks, and Tab stays inside. Radix hides the page from screen readers and blocks pointer events. It does not use the inert attribute. DS-MODAL-001 asks for inert on custom dialogs. (DS-MODAL-001)
- **BHV-DIALOG-011** `unchecked` In focus-trap mode, Tab stays inside while the page can still scroll and receive clicks. A click on the page also closes the dialog unless closing on outside press is turned off. Radix has modal and non-modal. A separate focus-trap mode was not found. (DS-A11Y-022, DS-MODAL-001)
- **BHV-DIALOG-012** `native` In non-modal mode the dialog sits beside the page and focus can leave it. Escape closes it while focus is inside. Outside presses close it only when that is enabled. (DS-A11Y-022)
- **BHV-DIALOG-013** `native` Selected parts of the page, such as a chat launcher, can stay usable while a modal dialog is open. Which parts qualify is a product decision.
- **BHV-DIALOG-014** `native` When dismissal is turned off, Escape, an outside press or a back gesture keeps the dialog open and reports the attempt. Explicit close buttons and closing from code still work. Block dismissal only while closing would lose money, a delete or a legal step. (DS-A11Y-022)
- **BHV-DIALOG-015** `supply` One dialog can serve several triggers, each passing its own content. Opening it from code returns a promise that resolves when it closes, with how it closed and any result value.
- **BHV-DIALOG-016** `supply` As a sheet on small touch screens, a swipe down closes a dismissible sheet. A protected sheet springs back and reports the attempt. Radix Dialog has no sheet mode. Use a Drawer item for this. (DS-RESPONSIVE-008)

## Accessibility

- **BHV-DIALOG-017** `native` The dialog is labelled by its title. It is described by its description only while one is shown. It is marked as modal while it is modal. (DS-A11Y-019)
- **BHV-DIALOG-018** `supply` An icon-only close button needs an accessible name. (DS-A11Y-007, DS-A11Y-019)

## Common mistakes

- **BHV-DIALOG-019** `supply` Do not apply the centered dialog's translation to a sheet presentation. The sheet manages its own position and movement.
- **BHV-DIALOG-020** `supply` Do not put the header and actions inside the scrolling area. Keep them outside so they stay in view while long content scrolls. (DS-MODAL-004)

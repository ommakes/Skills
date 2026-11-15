# Overlays: dialogs, bottom sheets and full-screen forms `[DS-MODAL]` `[DS-RESPONSIVE]` `[DS-A11Y]`

Read this when you build or style a Dialog, AlertDialog, bottom sheet or a full-screen form. Which container to use is decided in `vois-patterns` (`[PATH-D]`, `[PATH-D-1]` to `[PATH-D-5]`) and `vois-components` (`JOB-OVERLAY-INTERACTION`, `JOB-CONFIRM-DESTRUCTIVE`). This file says how each one is built. Widths are in `layout-and-responsive.md` (`--width-dialog-sm`, `--width-dialog-lg`). Focus trap, scroll bleed and layout shift are in `components.md` (`[DS-MODAL-001]` to `[DS-MODAL-003]`).

All rules below are written from the gap plan of 14 Nov 2026 and common practice. They have not been tested on real phones or on real product screens yet. Treat them as proposed until they are.

## Structure

- **The body scrolls. The header and footer stay in view.** `[DS-MODAL-004]` A tall dialog scrolls inside its body. The title and the actions never scroll away. (The registry's `vois-dialog` does not do this yet: it scrolls the whole card and keeps only the close button fixed. See the registry CHANGELOG.)
- **At most two buttons in the footer.** `[DS-MODAL-005]` A primary action and a secondary action (Cancel). A third action is a link on the left (see `[PATH-D]`). Button order and gap: `[PATH-D]`.
- **Never nest modals.** `[DS-MODAL-006]` A second step replaces the content of the same dialog (push a view, with a Back control), or becomes a page. A destructive confirmation from inside a dialog or sheet replaces its content the same way. Never open a dialog from a dialog.
- **Never use a modal for navigation.** `[DS-MODAL-007]` A list of places to go is a menu or a page, not a dialog.

## On a phone

The breakpoint is `--breakpoint-md` (768).

- **A choice becomes a bottom sheet.** `[DS-RESPONSIVE-008]` Below `--breakpoint-md`, a dialog that holds a choice (confirm, select, stepper, slider) is a bottom sheet. It is at most `90dvh` tall. The footer stacks, with the primary button on top. It has a visible way to close (a Close or Cancel button), so a user who cannot drag can leave it. The sheet's own height and the full-screen form below use `dvh`, because they must follow the keyboard and the browser bars (`[DS-LAYOUT-001]`).
- **Any dialog with a text field is full screen.** `[DS-RESPONSIVE-009]` Below `--breakpoint-md`, a dialog that takes text is a full-screen form, not a bottom sheet. It has a 56 tall header (Close on the left, the title, a named commit on the right if the footer is not used), and the footer sits at the bottom of the scroll area, so the keyboard cannot cover it. Bottom sheets and the keyboard do not mix well on iOS, so this avoids the problem. (To test on a real iPhone and a real Android phone with the keyboard open.)
- **Respect the safe area.** `[DS-RESPONSIVE-010]` A bottom sheet and a full-screen form pad their edges with `env(safe-area-inset-bottom)`, `env(safe-area-inset-left)` and `env(safe-area-inset-right)`, so the home indicator and rounded corners never cover a button.

Short lists of choices that end with a separate Cancel are action sheets: the same bottom sheet, one row per choice.

## Accessibility

Radix gives most of this for free when you use its parts. Use them.

- **A name, and for an AlertDialog a description.** `[DS-A11Y-019]` Every dialog has a title (`DialogTitle` or `AlertDialogTitle`), visually hidden if the design shows none. An AlertDialog also has a description (`AlertDialogDescription`) that says what will happen. Do not pass your own `id` to these parts (see the registry README).
- **First focus.** `[DS-A11Y-020]` In a destructive AlertDialog, focus starts on Cancel, never on the destructive button (Radix does this when the Cancel part is `AlertDialogCancel`). In a form dialog, focus starts on the first field. In a confirmation that is not destructive, it starts on the primary action.
- **Return focus.** `[DS-A11Y-021]` When the dialog closes, focus goes back to what opened it. If that element is gone (a deleted row), focus goes to the nearest sensible place, such as the list heading, never to the top of the page.
- **Escape.** `[DS-A11Y-022]` Escape closes a dialog, and a click on the scrim closes a Dialog. (Radix does not let a click on the scrim close an AlertDialog: that is on purpose, so a stray click cannot dismiss a confirmation.) Block Escape and the scrim only while closing would lose money, a delete or a legal step in progress (a payment being sent, a delete running, a required consent). Keep a visible Cancel when you block them.
- **Dragging has an alternative.** `[DS-A11Y-023]` Anything the user can do by dragging (reorder, move a handle, dismiss a sheet) can also be done with a single tap or the arrow keys. This is WCAG 2.2 success criterion 2.5.7, Dragging Movements. (The wording of that criterion has been read from a summary: check it against the WCAG text before quoting it.)

## Not covered yet

Directional shadows for docked panels and the elevation tier for each overlay (see the elevation phase). The "peek" sheet, which has no scrim and does not trap focus, is in `vois-components` (`JOB-OVERLAY-INTERACTION`). Its modal rules (`inert`, scroll lock) do not apply to it.

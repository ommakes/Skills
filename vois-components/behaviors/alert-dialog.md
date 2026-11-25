<!-- GENERATED from behaviors/alert-dialog.json by scripts/behaviors.mjs. Edit the JSON, then run `node vois-components/scripts/behaviors.mjs --write`. Do not edit by hand. -->

# Alert dialog behavior

A question that needs an answer before the person can go on, such as confirming a delete. It traps focus and cannot be closed by clicking outside.

**Use something else when:**

- Dialog: The person can leave without answering, or the task is a form.
- Alert: The message is information only and nothing needs to block.

**Basis:** radix-ui, checked 2026-11-23. Behaviors come from the Notion UI SDK inventory (2026-11-21). The support tag on each one was checked against the Radix source on the checked date. The inventory words Action and Cancel as Close parts with a value; Radix has AlertDialogAction and AlertDialogCancel instead.

**Support tags**

- `native`: The library does this. Do not undo it.
- `differs`: The library does something else. Read the note.
- `supply`: The library does not do this. You build it.
- `decide`: This needs a product or design decision.
- `unchecked`: Not checked against the library yet.

## Anatomy

| Part | Required | Note |
|---|---|---|
| AlertDialog (root) | yes | Holds the open state. It is always modal. |
| AlertDialogTrigger | yes | The button that opens the dialog. It can sit apart from the content. |
| AlertDialogOverlay | no | Dims the page behind. vois-alert-dialog draws it with the content. |
| AlertDialogContent | yes | The dialog. It has the alertdialog role and traps focus. |
| AlertDialogTitle | yes | The question. It names the dialog. |
| AlertDialogDescription | yes | What happens if the person agrees. It describes the dialog. |
| AlertDialogCancel | yes | The safe answer. Radix focuses it when the dialog opens. |
| AlertDialogAction | yes | The agreeing answer. Pass variant destructive for a delete. |
| AlertDialogShortcut | no | Shows the keys for a shortcut. Radix has no such part. |

## Interaction

- **BHV-ALERT-DIALOG-001** `native` Clicking outside the dialog leaves it open. Only an answer or Escape closes it. The Vois item keeps this. Do not turn it off. (DS-A11Y-022)
- **BHV-ALERT-DIALOG-002** `native` Escape closes the dialog and returns focus to the control that opened it. Focus goes back to the trigger. If the trigger is gone, see the focus line below. (DS-A11Y-021, DS-A11Y-022)
- **BHV-ALERT-DIALOG-003** `native` A dialog opened inside another dialog joins a stack. Escape closes only the topmost one and returns focus to its trigger. Only the Escape part is checked. Radix does not mark the dialog underneath as having a nested dialog open. Put a data attribute on it yourself if you style for that. (DS-A11Y-021, DS-A11Y-022)
- **BHV-ALERT-DIALOG-004** `supply` A keyboard shortcut can open the dialog without clicking. Radix has no shortcut part. Add a key handler that sets open, and show the keys yourself.
- **BHV-ALERT-DIALOG-005** `supply` Choosing an answer can run work first. The dialog stays open until the work finishes. A success closes it, and a failure keeps it open so the person can try again. Radix closes as soon as Action is pressed. Control open yourself, call preventDefault on the Action click, then close when your work is done.
- **BHV-ALERT-DIALOG-006** `supply` While that work runs, the other answers cannot close the dialog and dismissals are refused. The app can still close it directly. Same as above. Disable Cancel while pending and call preventDefault in onEscapeKeyDown.
- **BHV-ALERT-DIALOG-007** `supply` A shared confirm helper can ask a question without dialog markup. It resolves to yes for the agreeing answer, and to no for Cancel, Escape or any other answer. Radix and vois-alert-dialog have no helper. Build one if the app asks many questions.
- **BHV-ALERT-DIALOG-008** `supply` If several confirmations are asked at once, they wait their turn and appear one after another. Part of the confirm helper above. Queue the questions there.

## Focus

- **BHV-ALERT-DIALOG-009** `differs` Tab stays inside the dialog while it is open, and the rest of the page cannot be reached. The page behind is hidden from assistive tech with aria-hidden. Radix does not use the inert attribute.
- **BHV-ALERT-DIALOG-010** `differs` Opening the dialog focuses its first answer, so the least destructive answer should come first. Radix focuses Cancel, not the first answer in the footer. Use AlertDialogCancel for the safe answer. If there is no AlertDialogCancel, focus lands on the content. If you pass your own onOpenAutoFocus and call preventDefault, Radix skips the Cancel focus. (DS-A11Y-020)
- **BHV-ALERT-DIALOG-011** `supply` Opening by touch focuses the dialog content instead, so no on-screen keyboard appears. Radix always focuses Cancel. Cancel is a button, so it does not raise a keyboard. Nothing to add unless you put a field in the dialog, which this component is not for.
- **BHV-ALERT-DIALOG-012** `supply` When the control that opened the dialog has been removed, focus goes to a useful nearby place. Radix returns focus to a trigger that is gone, so focus drops to the page body. Move focus yourself in onCloseAutoFocus. (DS-A11Y-021)

## State

- **BHV-ALERT-DIALOG-013** `differs` The dialog slides up and fades in as it opens, and slides down and fades out before it disappears. The Vois item fades and scales the card, as vois-dialog does. It does not slide. Both stop under reduced motion.
- **BHV-ALERT-DIALOG-014** `supply` While an answer's work is running, its button stays focusable and is marked busy and disabled, and the other answers are marked disabled. Set aria-busy and aria-disabled on the Action, and disabled on Cancel, from your own pending state. vois-button has a loading prop you can use for the Action.
- **BHV-ALERT-DIALOG-015** `supply` After a second of waiting, screen readers hear a waiting message. An error from a failed attempt clears on the next attempt or when the dialog opens again. Add a live region and a timer in your pending state.
- **BHV-ALERT-DIALOG-016** `native` A trigger can be disabled.
- **BHV-ALERT-DIALOG-017** `supply` The content is marked while the on-screen keyboard covers part of the page. Radix has no such flag. This only matters for a dialog with a field.

## Accessibility

- **BHV-ALERT-DIALOG-018** `native` The dialog uses the alert-dialog role. Screen readers announce its title and description. This Radix version does not warn when the Description is missing, so check for it yourself. Always include one. (DS-A11Y-019)
- **BHV-ALERT-DIALOG-019** `native` It is always modal, never closes on an outside press, and never presents as a sheet. vois-alert-dialog has no sheet presentation.

## Common mistakes

- **BHV-ALERT-DIALOG-020** `native` Do not put the destructive answer first. Opening focuses Cancel, so make the safe answer an AlertDialogCancel. (DS-A11Y-020)
- **BHV-ALERT-DIALOG-021** `native` Do not expect an outside press to close it. It is always modal and never closes on an outside press. (DS-A11Y-022)
- **BHV-ALERT-DIALOG-022** `supply` Do not present it as a sheet. On a small touch screen, keep the centered card.

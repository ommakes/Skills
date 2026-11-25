<!-- GENERATED from behaviors/toast.json by scripts/behaviors.mjs. Edit the JSON, then run `node vois-components/scripts/behaviors.mjs --write`. Do not edit by hand. -->

# Toast behavior

A short message about something that just happened, such as a save or an undo. It appears by itself and goes away.

**Use something else when:**

- Alert: The message is part of the page and must stay.
- AlertDialog: The person must answer before going on.

**Basis:** radix-ui, checked 2026-11-24. Behaviors come from the Notion UI SDK inventory (2026-11-21). The support tag on each one was checked against the source on the checked date. The skills say Sonner. The id is Toast and the library for this card is Radix Toast, which is what the Vois item uses.

**Support tags**

- `native`: The library does this. Do not undo it.
- `differs`: The library does something else. Read the note.
- `supply`: The library does not do this. You build it.
- `decide`: This needs a product or design decision.
- `unchecked`: Not checked against the library yet.

## Anatomy

| Part | Required | Note |
|---|---|---|
| ToastProvider | yes | Sets the duration, swipe direction and label. |
| ToastViewport | yes | The region where toasts show. It holds the hotkey. |
| Toast | yes | One message. |
| ToastTitle | yes | The short line. |
| ToastDescription | no | The detail. |
| ToastAction | no | A button with a required altText. |
| ToastClose | no | The close button. |

## Interaction

- **BHV-TOAST-001** `native` A toast closes by itself after five seconds. A toast with a duration of Infinity stays until someone closes it. A toast with an action should stay longer, or stay until it is closed. (DS-A11Y-034)
- **BHV-TOAST-002** `native` The timer pauses while the pointer is over the toasts or focus is inside them, and resumes after.
- **BHV-TOAST-003** `differs` The timer also pauses when the tab is hidden. A tab in the background can still run the timer if the window keeps focus.
- **BHV-TOAST-004** `differs` Swiping a toast away closes it. One direction for all toasts. A toast on the left of the screen should swipe left, so set it on the Provider.
- **BHV-TOAST-005** `supply` Several toasts stack, with a limit, and expand on hover. Radix draws no stack. Each toast is placed by your own CSS. Cap the queue in your own code.
- **BHV-TOAST-006** `supply` A toast can be updated or closed by id from anywhere in the app. Radix has no imperative API. Keep the toasts in your own state, or add a helper.
- **BHV-TOAST-007** `supply` A promise toast shows loading, then success or error. The Vois item has no loading variant. Add one with your own state.
- **BHV-TOAST-008** `native` A toast action such as Undo closes the toast and runs the action. ToastAction needs a non-empty altText or it throws.

## Keyboard

- **BHV-TOAST-009** `differs` F8 moves focus into the notifications. Tab then moves through them in order, and Escape closes the focused toast. F8 focuses the viewport, not the newest toast. Change hotkey on the Viewport if F8 clashes with the app. (DS-A11Y-034)

## Focus

- **BHV-TOAST-010** `differs` When focus was inside a toast that closes, focus moves to the viewport. It does not return to the control that opened the action. Move focus yourself if that matters. (DS-A11Y-021)
- **BHV-TOAST-011** `native` A toast never takes focus on its own.

## State

- **BHV-TOAST-012** `differs` A toast has types: neutral, success, warning and error, each with its own icon. Radix type and Vois variant are different things. There is no loading variant.

## Accessibility

- **BHV-TOAST-013** `native` Screen readers hear the toast without moving focus. An error interrupts, and the rest wait their turn. Use the foreground type for errors only. Everything else should be background. (DS-A11Y-009, DS-A11Y-034)
- **BHV-TOAST-014** `differs` The notification area is a labeled region. The label includes the hotkey. It only renders with toasts in it.
- **BHV-TOAST-015** `supply` A toast does not hold the only copy of something the person needs. A toast can disappear before it is read. Put anything that matters on the page as well. (DS-A11Y-034)

## Common mistakes

- **BHV-TOAST-016** `supply` Do not put critical content only in a toast. It can close before it is read. (DS-A11Y-034)
- **BHV-TOAST-017** `native` Do not give ToastAction an empty altText. It throws.
- **BHV-TOAST-018** `native` Do not set every toast to foreground. Each one would interrupt the screen reader. (DS-A11Y-009)

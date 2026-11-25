<!-- GENERATED from behaviors/input-otp.json by scripts/behaviors.mjs. Edit the JSON, then run `node vois-components/scripts/behaviors.mjs --write`. Do not edit by hand. -->

# InputOTP behavior

A field for a short one time code sent by text or email. Each character gets its own slot, and the whole code is one input underneath.

**Use something else when:**

- Text field: The value is not a short code of fixed length.
- Password field: The value is a secret the person chose, not a code they were sent.

**Basis:** input-otp, checked 2026-11-24. Behaviors come from the Notion UI SDK inventory (2026-11-21). The support tag on each one was checked against the source on the checked date. The Notion page gives no alternative component and lists one mistake; the others come from the source and the vois-fields paste rule.

**Support tags**

- `native`: The library does this. Do not undo it.
- `differs`: The library does something else. Read the note.
- `supply`: The library does not do this. You build it.
- `decide`: This needs a product or design decision.
- `unchecked`: Not checked against the library yet.

## Anatomy

| Part | Required | Note |
|---|---|---|
| InputOTP | yes | The one native input. Holds the code, the pattern and the length. |
| InputOTPGroup | yes | Lays out a run of slots. |
| InputOTPSlot | yes | Shows the character at its index. One per character. |
| InputOTPSeparator | no | Goes between groups when the code reads better in sections. Hidden from screen readers. |

## Interaction

- **BHV-INPUT-OTP-001** `native` Typing a character fills the next empty slot. When the code is full, typing replaces the selected slot.
- **BHV-INPUT-OTP-002** `native` Clicking a slot lets you edit that character.
- **BHV-INPUT-OTP-003** `differs` Pasting a whole code fills every slot at once and strips separators such as spaces and hyphens. Without the transformer a pasted '123-456' is rejected whole by the pattern. A whole code replaces what is there, a short paste is inserted at the caret, and a long one is cut to the length. (DS-A11Y-006)
- **BHV-INPUT-OTP-004** `native` Autofill from a browser or password manager can fill the whole code at once. (DS-A11Y-006)
- **BHV-INPUT-OTP-005** `differs` Characters that do not match the pattern are rejected. Touch devices get a keyboard that suits the pattern. A letters pattern still opens the numeric keyboard unless you set inputMode. Pass the pattern and inputMode together.
- **BHV-INPUT-OTP-006** `native` Undo and redo work with the usual shortcuts.
- **BHV-INPUT-OTP-007** `supply` An outside control can read, fill, clear or focus the input, and those writes go through the same filter as typing. Pass value and onChange, and a ref for focus. Writes made through value are not run through the pattern by the library, so filter them yourself.

## Keyboard

- **BHV-INPUT-OTP-008** `native` Arrow keys, Home and End move the selection between slots.
- **BHV-INPUT-OTP-009** `native` Backspace deletes the selected character.

## Focus

- **BHV-INPUT-OTP-010** `native` The slots are a visual display only. The group adds no tab stops beyond the one input.
- **BHV-INPUT-OTP-011** `differs` The active slot is marked only while the field is focused. An empty active slot shows a blinking caret. vois-input-otp draws the caret with a step keyframe that stops under reduced motion. (DS-ANIMATION-004)
- **BHV-INPUT-OTP-012** `supply` The active slot shows the focus ring as an external ring that keeps its offset in the error state. The library gives isActive. The ring, its width and its offset come from the focus tokens. Read-only slots show no ring on the slot. (DS-A11Y-002)

## State

- **BHV-INPUT-OTP-013** `native` The code length is set by maxLength and defaults to the number of slots you render. Render one slot per character. A mismatch leaves empty slots that can never fill.
- **BHV-INPUT-OTP-014** `differs` The completion event fires when the code becomes full by typing, pasting, autofill or an outside write. It does not fire again when a full code is replaced by another full code. The inventory says changing a full code fires it again. It does not. Select all and paste a new code and no event fires; handle the change event if you need it.
- **BHV-INPUT-OTP-015** `supply` A partial code fails length validation. A required field blocks an empty submit. A form reset restores the default value. The library sets no minLength. Validate the length yourself and show the error through the field.
- **BHV-INPUT-OTP-016** `supply` An invalid code shows an error message tied to the field and marks it invalid. Editing a digit clears the error. The library has no error state. vois-input-otp reads aria-invalid for the slot look. Connect the message with aria-describedby and clear it in onChange. (DS-A11Y-006)
- **BHV-INPUT-OTP-017** `differs` Disabled blocks focus, changes and submission. Read-only keeps the field focusable and in the form data but blocks changes. vois-input-otp blocks typing and paste in read-only itself and draws a flat look with no edge.

## Accessibility

- **BHV-INPUT-OTP-018** `native` A screen reader meets one input that holds the whole code. The slots, groups and separators are hidden from it.
- **BHV-INPUT-OTP-019** `supply` The field is named by its label and offers itself for one-time-code autofill. The library adds autocomplete one-time-code but no name. Pass aria-label or connect a visible label with id. (DS-A11Y-006)
- **BHV-INPUT-OTP-020** `supply` The field reports an error to assistive technology. The library sets no aria-invalid or aria-describedby. Pass both.

## Common mistakes

- **BHV-INPUT-OTP-021** `supply` Do not leave a slot without relative positioning. Keep position relative on each slot so its caret stays inside it. vois-input-otp already does this.
- **BHV-INPUT-OTP-022** `differs` Do not reject a pasted code because it has a space or a dash. Clean the value after it arrives. This is the vois-fields paste rule (FIELD-PASTE).
- **BHV-INPUT-OTP-023** `supply` Do not leave the field without a name. Nothing warns you.
- **BHV-INPUT-OTP-024** `differs` Do not rely on the completion event to submit a code that was replaced by another full code. Handle the change event when a replaced full code must submit again.

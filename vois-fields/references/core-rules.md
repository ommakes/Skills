# Core input rules

Read this before you write any field that takes typed text. It has the seven core rules, when to check a value, and how to handle sensitive data. The field table (`data/field-types.json`) gives the keyboard, format and privacy for each kind of field. These rules explain why.

Every rule has a tag such as `[FIELD-PASTE]`. The tags are the same as the `id` values in `data/fields-rules.json`.

## The seven core rules

1. **Never block paste or autofill.** `[FIELD-PASTE]` Let the user paste, and let the browser and the password manager fill the field. Do not cancel the paste event. Do not set `autocomplete="off"` on a field the browser can fill. Clean the value after it arrives: trim it and strip separators. A one-time code field must take a pasted or autofilled whole code. InputOTP (one cell per character, behaving as one field) is fine if it does. A row of boxes that rejects a pasted code is not.
2. **Keep the shown value and the stored value apart.** `[FIELD-VALUE-SPLIT]` The box shows text for people (a phone as `(202) 555-0123`). The system stores one canonical form (`+12025550123`). Never read the shown text back as the stored value.
3. **IDs and codes are text.** `[FIELD-TEXT-CODES]` A value you do not do arithmetic on is a string. That covers postal codes, VINs, license numbers, SSNs, phone numbers, one-time codes and policy numbers. Use `type="text"` with the right `inputmode`. Never use `type="number"`: it drops leading zeros, adds spinner arrows and changes the value when the user scrolls.
4. **Format on blur and keep the cursor.** `[FIELD-FORMAT-BLUR]` Apply grouping and separators when the user leaves the field. If you format while the user types, keep the caret where it was, also after a paste in the middle of the value.
5. **Incomplete is not invalid.** `[FIELD-INCOMPLETE]` A VIN with 14 of 17 characters is not finished, it is not wrong. Show a counter or a hint. Show no error until the user leaves the field or submits.
6. **Check on blur.** `[FIELD-CHECK-BLUR]` The default time to check a value is when the user leaves the field, and again on submit. After a field shows an error, check on every keystroke so the error clears as soon as it is fixed.
7. **A format check is not proof.** `[FIELD-FORMAT-NOT-PROOF]` A value with the right shape can still be wrong. A well formed email can bounce. A valid VIN can belong to another vehicle. Word the message as what the check did ("This does not look like a VIN"). When you need proof, use an explicit action: send a code, decode the VIN, ask the user to confirm.

## When to check a value

Walk the nodes in order. Take the first one that fits.

1. **The user is still typing.** `[FIELD-TIMING-TYPING]` Show help only: a counter, a hint, what is left. Never an error. Never block a key.
2. **The check calls a server or is slow.** `[FIELD-TIMING-PAUSE]` Wait 300 to 500 ms after the last keystroke. Ignore any answer for an older value.
3. **A local format check on one field.** `[FIELD-TIMING-BLUR]` Check on blur.
4. **The rule needs other fields, or the field was never visited.** `[FIELD-TIMING-SUBMIT]` Check on submit. Move focus to the first error. Never show a required error on a field the user has not reached.
5. **The check sends something, costs something or needs proof.** `[FIELD-TIMING-ACTION]` Put it behind a button: Verify code, Look up VIN, Check availability. Do not run it on blur.

## Sensitive and personal data

The privacy class of each field is in the table. The classes are `public`, `internal`, `personal` and `sensitive`.

- **Keep it out of URLs, logs, analytics and error reports.** `[FIELD-SENSITIVE-STORAGE]` Sensitive fields (SSN, driver's license number, one-time code) never go in a query string, a log line, an analytics event or an error report. Personal fields (name, email, phone, address, date of birth) stay out of URLs and analytics events. Strip them before any of those is written.
- **Mask after entry, with a reveal.** `[FIELD-SENSITIVE-MASK]` Once the user leaves a sensitive field, show it masked with the last four characters. Give a control to reveal it. Keep paste and password managers working. Do not mask while the user types.
- **No lookup per keystroke.** `[FIELD-SENSITIVE-LOOKUP]` Send a sensitive value to a server once, on an explicit action or on submit.
- **No suggestions.** `[FIELD-SENSITIVE-SUGGEST]` Turn off history and suggestion lists on sensitive fields. Never show earlier values in a dropdown.

## Never

- Cancel a paste event.
- Use `type="number"` for a code, an ID or a phone number.
- Show an error while the user is still typing.
- Put a sensitive value in a URL, a log, an analytics event or an error report.
- Reject a value for a check digit alone (a VIN from an older or non-North-American vehicle has no valid check digit). Warn, and let the user continue.

## Confidence

All rules in 1.0.0 are `proposed`. They come from the field-spec research and common practice, and have not been tested on real screens yet. The field table marks each row `standard` (HTML or a published spec), `convention` (common practice) or `proposed` (ours, with a `needsTest` note).

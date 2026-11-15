---
name: vois-fields
version: 1.0.0
description: >
  Rules for specialized input fields: which keyboard, autofill, stored format, check timing and privacy
  handling each kind of field needs. Use after vois-components has chosen an Input, Textarea, Select or
  Combobox, and before vois-tokens styles it, whenever a field takes an email, phone, URL, postal code,
  name, VIN, driver's license, SSN, money, percent, date or one-time code. Also covers prefilled values
  (show the source, let the user fix it), type-ahead pickers, and sensitive data. Works standalone, with
  no MCP server.
attribution: Personify Labs
license: CC-BY 4.0
---

# Vois Fields

You are deciding how one input field behaves. `vois-components` chose the component. `vois-tokens` will style it. This skill decides what the field means and what that implies: the keyboard, autofill, stored value, when to check it, and what must never leak.

## How to use it

1. **Find the row for what the field MEANS**, not what it looks like. Open `data/field-types.json`. A "Policy holder VIN" is a `vin`. A "Mobile" is a `phone`. If no row fits, use the closest one and say so. Do not invent attribute values.
2. **Copy the row.** Its `input` block gives `type`, `inputmode`, `autocomplete`, `autocapitalize`, `spellcheck` and `maxlength`. Its `stored` and `shown` blocks give the canonical value and what the box shows. Its `check` block gives when and how to check. Its `privacy` block gives the class and what is allowed.
3. **Apply the core rules** in `references/core-rules.md`. They hold for every field: never block paste, keep the shown and stored value apart, codes are text, format on blur, incomplete is not invalid, check on blur, a format check is not proof.
4. **If the value is filled in for the user**, read `references/prefill.md`. If the field picks a record from a large set, read `references/type-ahead.md`.
5. **Hand off to `vois-tokens`** for size, spacing, states and color. Field height, label and error text styling are there (`DS-COMPONENT-007`, forms).

## Decision tree: what does this field mean?

Take the first node that fits. Each ends in a row in `data/field-types.json`.

1. Holds an identifier or a government number (VIN, license, SSN)? Use `vin`, `drivers-license` or `ssn`. These have the strictest handling: see `[FIELD-SENSITIVE-STORAGE]`.
2. Holds a code sent to the user? Use `one-time-code`.
3. Holds contact details? Use `email`, `phone`, `url` or `postal-code-us`.
4. Holds an amount? Use `money` or `percent`.
5. Holds a calendar day? Use `date`.
6. Holds what a person is called? Use `person-name`.
7. Picks one record from a large set? Use `references/type-ahead.md`.
8. Nothing fits? Treat it as plain text, apply the core rules, and ask for a new row.

## Rules in this skill

All tagged IDs live in `data/fields-rules.json`.

- **Core:** `[FIELD-PASTE]`, `[FIELD-VALUE-SPLIT]`, `[FIELD-TEXT-CODES]`, `[FIELD-FORMAT-BLUR]`, `[FIELD-INCOMPLETE]`, `[FIELD-CHECK-BLUR]`, `[FIELD-FORMAT-NOT-PROOF]`
- **When to check:** `[FIELD-TIMING-TYPING]`, `[FIELD-TIMING-PAUSE]`, `[FIELD-TIMING-BLUR]`, `[FIELD-TIMING-SUBMIT]`, `[FIELD-TIMING-ACTION]`
- **Sensitive data:** `[FIELD-SENSITIVE-STORAGE]`, `[FIELD-SENSITIVE-MASK]`, `[FIELD-SENSITIVE-LOOKUP]`, `[FIELD-SENSITIVE-SUGGEST]`
- **Prefill:** `[FIELD-PREFILL-SOURCE]`, `[FIELD-PREFILL-FIX]`, `[FIELD-PREFILL-NOTME]`, `[FIELD-PREFILL-SUGGEST]`, `[FIELD-PREFILL-UNDO]`, `[FIELD-PREFILL-CONFLICT]`
- **Type-ahead:** `[FIELD-TYPEAHEAD-DEFAULTS]`

## Never

- Block paste or autofill.
- Use `type="number"` for a code, an ID or a phone number.
- Show an error while the user is still typing.
- Put a sensitive value in a URL, a log, an analytics event or an error report.
- Auto-select the first type-ahead result.
- Lock a prefilled value.
- Reject a VIN only because the check digit fails.
- Invent a keyboard or autofill value that is not in the field table.

## Checks

`node vois-fields/scripts/check-fields.mjs` checks the field table against `data/field-types.schema.json` and against rules a schema cannot say (no `type="number"`, sensitive fields masked and kept out of URLs, no check on every keystroke, every proposed row has a `needsTest` note). The tests are in `scripts/check-fields.test.mjs`. Every `[FIELD-...]` tag in these files must match an entry in `data/fields-rules.json`, and the reverse.

## Not covered yet

Date ranges, FEIN, USDOT and MC numbers, policy and claim numbers, file upload, and repeating rows such as a list of vehicles. Payment card fields are out of scope: use the payment provider's hosted fields and never build raw card inputs. No lint rule yet for blocked paste or `type="number"` in code: the table check covers the data, not the markup.

## Explainer

`docs/field-explainer.html` is an interactive page: pick a field type and see its keyboard, format, check timing and privacy handling.

## Confidence

Every rule is `proposed` in 1.0.0. See `references/core-rules.md`.

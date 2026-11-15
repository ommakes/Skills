# Prefilled values

Read this when a field is filled in for the user: from their profile, the last policy, a lookup or an imported document. A prefilled value helps only when the user can see where it came from and can fix it.

Every rule has a tag such as `[FIELD-PREFILL-SOURCE]`. The tags are the same as the `id` values in `data/fields-rules.json`.

## Walk these in order

1. **A value is filled in without the user typing it.** `[FIELD-PREFILL-SOURCE]` Show the value in the field, with a small source label next to it ("From your profile", "From your last policy", "From the VIN lookup"). Use a visible label, not a tooltip only. Make a prefilled value look different from a typed one.
2. **The user wants to change it.** `[FIELD-PREFILL-FIX]` A prefilled value is an ordinary editable value. Never lock it. When the user edits it, the source changes to "Entered by you".
3. **The value may belong to someone else.** `[FIELD-PREFILL-NOTME]` Offer "Not me" or "Clear". It removes the value and its source label together. Use it on shared devices and where a lookup can match the wrong record.
4. **The source is a guess or a partial match.** `[FIELD-PREFILL-SUGGEST]` Do not fill the field. Show the guess as a suggestion that the user accepts with one action.
5. **The user accepted a suggestion or a bulk prefill.** `[FIELD-PREFILL-UNDO]` Keep Undo available until the user leaves the page or submits.
6. **Two sources give different values.** `[FIELD-PREFILL-CONFLICT]` Show both, each with its source, and ask the user to choose. Never pick one silently.

## The origin of an answer

Each answer carries a `fieldType` (a row id from the field table), a `value`, an `origin` (`entered`, `profile`, `previous`, `lookup`, `import` or `suggestion`) and a `confidence` (`high` or `low`), and may carry a `sourceLabel`. `data/prefill-answer.schema.json` is the contract. High confidence fills the field. Low confidence becomes a suggestion (step 4). The label in step 1 is written from the origin, or from `sourceLabel` when it is given.

## Never

- Lock a prefilled field.
- Fill a low-confidence guess into the box.
- Replace a value the user typed with a prefilled one.
- Drop the source label after the user edits another field.

## Confidence

All rules here are `proposed`. Check the label wording ("Not me", "Clear") and the suggestion pattern on real screens.

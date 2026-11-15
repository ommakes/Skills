# Type-ahead and record pickers

Read this when a field picks one record from a large set: a customer, a vehicle, a policy, an address. For a short fixed list, use a Select (see vois-components, `JOB-CHOOSE-FROM-LIST`).

## Defaults `[FIELD-TYPEAHEAD-DEFAULTS]`

- **Start searching after a pause of 300 to 500 ms and 2 to 3 characters.** Not on every keystroke.
- **Show 3 to 6 results.** More than that is a list, not a suggestion.
- **Drop stale answers.** If a response arrives for an older query, ignore it. Tag each request and compare when the answer returns.
- **Never pick the first result for the user.** The user chooses. Pressing Enter or leaving the field with no choice leaves the field empty or unchanged. (Check that your component does not auto-select the first item: shadcn Command may. This has not been tested here.)
- **Keep the ID apart from the label.** The label is for people. Store the record's ID, not the label text.
- **Sensitive fields get no type-ahead.** See `[FIELD-SENSITIVE-LOOKUP]` and `[FIELD-SENSITIVE-SUGGEST]` in core-rules.md.

## Components

The picker is a combobox: an input plus a list. The registry has `vois-command` (a search input with a list) and `vois-select` (for a short list). It has no Popover item, so a combobox that opens from a button needs the project's own Popover.

## Confidence

`proposed`. Test the pause and character thresholds on real data.

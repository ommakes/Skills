<!-- GENERATED from behaviors/combobox.json by scripts/behaviors.mjs. Edit the JSON, then run `node vois-components/scripts/behaviors.mjs --write`. Do not edit by hand. -->

# Combobox behavior

Search a list of options and choose one or several values.

**Use something else when:**

- Autocomplete: The value is the text itself, such as a search box, an address or a free-form field where anything typed is valid and suggestions only help fill it in.

**Basis:** @base-ui/react (through the shadcn combobox), checked 2026-11-23. Radix has no combobox. The shadcn combobox, even in its radix base, imports Base UI. The Notion inventory behaviors were not checked against the Base UI source, so most tags here are unchecked on purpose. Check them before the registry item is built.

**Support tags**

- `native`: The library does this. Do not undo it.
- `differs`: The library does something else. Read the note.
- `supply`: The library does not do this. You build it.
- `decide`: This needs a product or design decision.
- `unchecked`: Not checked against the library yet.

## Anatomy

| Part | Required | Note |
|---|---|---|
| Combobox (root) | yes | Holds the value, the query and the open state. |
| ComboboxInput | yes | The text field that filters the list and shows the chosen label. Its label names it. |
| ComboboxList | yes | Holds the options inside the popup, with the listbox role. |
| ComboboxContent | no | The popup that holds the list. |
| ComboboxItem | yes | One option. Each needs a unique value. |
| ComboboxGroup and ComboboxGroupLabel | no | Name groups of options. |
| ComboboxTrigger | no | Opens and closes the list. Kept out of the tab order while the input sits beside it. |
| ComboboxClear | no | Clears the selection and the query, then keeps focus in the input. |
| ComboboxChips, ComboboxChip and ComboboxChipRemove | no | Multiple mode. Each chosen value is a chip with its own remove button. |
| ComboboxEmpty and ComboboxStatus | no | Loading, error and empty messages. |

## Interaction

- **BHV-COMBOBOX-001** `unchecked` Typing filters the options. Choosing one puts its label in the input.
- **BHV-COMBOBOX-002** `unchecked` Closing the list without choosing restores the label of the selected value. The form submits the value, not the typed text.
- **BHV-COMBOBOX-003** `unchecked` The clear button clears the selection and the typed text, keeps focus in the input, and shows only while either one has a value.
- **BHV-COMBOBOX-004** `unchecked` Deleting all the text clears a single selection right away. Escape while the list is still open brings the selection back. Closing any other way leaves it cleared.
- **BHV-COMBOBOX-005** `unchecked` Matching ignores case and accents for the current language. Each label keeps its original spelling. The matching letters are marked in the results.
- **BHV-COMBOBOX-006** `unchecked` Groups and their separators disappear when filtering leaves them empty.
- **BHV-COMBOBOX-007** `unchecked` When the options change while the list is open, the selection and highlight stay with their items. Removing the highlighted item clears the highlight.
- **BHV-COMBOBOX-008** `decide` With no text typed, the list can show suggestions such as recent items. Typing switches to searching the full collection. Which suggestions to show is a product choice.
- **BHV-COMBOBOX-009** `unchecked` In multiple mode, choosing an option toggles it, keeps the list open and clears the typed text. Each chosen value shows as a chip with its own remove button.
- **BHV-COMBOBOX-010** `unchecked` A select-all option toggles every matching enabled option, or only its own group inside a group. It shows a mixed state while only some options are chosen.
- **BHV-COMBOBOX-011** `unchecked` When chips no longer fit on one line, the extra ones hide behind a count. The selection can also show as a short text summary.
- **BHV-COMBOBOX-012** `decide` Once a maximum number of selections is reached, the other options become unavailable until one is removed. The maximum is a product choice.
- **BHV-COMBOBOX-013** `unchecked` A create option appears when the typed text matches no label exactly and is long enough. Saving it does not change the selection until the new item is added and chosen.
- **BHV-COMBOBOX-014** `decide` Unmatched text can become the value when you press Enter with nothing highlighted, or when the list closes. It does not create a new item in the collection. Use Autocomplete if free text should be the normal path.
- **BHV-COMBOBOX-015** `unchecked` The search field can live inside the popup behind a button that shows the current value. Closing the popup returns focus to that button.
- **BHV-COMBOBOX-016** `supply` Scrolling or moving the highlight to the last option loads another page of results, once per page and not while a page is already loading.
- **BHV-COMBOBOX-017** `supply` On small touch screens the list can open as a sheet with the search field in its header. Choosing an item closes it unless several values are allowed. Swiping down closes it. (DS-RESPONSIVE-008)

## Keyboard

- **BHV-COMBOBOX-018** `unchecked` Down Arrow highlights a match and Enter chooses it. Highlighting the first match while typing lets Enter choose it at once.
- **BHV-COMBOBOX-019** `unchecked` Keyboard navigation skips disabled options. A disabled option cannot be chosen.
- **BHV-COMBOBOX-020** `unchecked` Backspace in an empty input removes the last chip in one press. Arrow keys move between chips.
- **BHV-COMBOBOX-021** `unchecked` Focus leaving the input closes the popup, even when something else takes focus.

## Focus

- **BHV-COMBOBOX-022** `unchecked` A disabled combobox cannot be focused or changed and submits nothing.
- **BHV-COMBOBOX-023** `unchecked` A read-only combobox stays focusable and submits its value, but does not open or accept changes.

## State

- **BHV-COMBOBOX-024** `unchecked` While a new option is saving, it reports that it is busy and unavailable. A failed save makes its error available.
- **BHV-COMBOBOX-025** `unchecked` While server results load, the list reports that it is busy. Without a custom status message, the result count is announced once typing pauses.
- **BHV-COMBOBOX-026** `unchecked` The selection, the typed text and whether the popup is open are separate pieces of state. A proposed change to any of them can be rejected so the current value stays.
- **BHV-COMBOBOX-027** `unchecked` The page stays usable while the list is open. A modal mode can make an outside press only close the list, and another can also lock scrolling and block the rest of the page. The Notion page cited DS-MODAL-001 here. That rule covers custom modal dialogs, not a popup list, so the link was dropped.
- **BHV-COMBOBOX-028** `unchecked` The form submits the selected value, or separate entries for several values. Required blocks an empty submission. A reset restores the starting selection and its label.

## Accessibility

- **BHV-COMBOBOX-029** `supply` In a field, the field supplies the input's accessible name, description and error. Submitting a required field without a selection marks the input invalid. (DS-A11Y-030)
- **BHV-COMBOBOX-030** `supply` Decorative icons stay out of accessible names, filtering and match marks. An icon-only option still needs an accessible name. (DS-A11Y-007, DS-A11Y-008)
- **BHV-COMBOBOX-031** `supply` When only a few rows render from a very long list, each rendered item still carries its position in the full list for screen readers.

## Common mistakes

- **BHV-COMBOBOX-032** `supply` Do not leave an icon-only option without an accessible name. (DS-A11Y-007)
- **BHV-COMBOBOX-033** `supply` When virtualizing a long list, do not let the real row height drift from the virtualizer's measurement. Use the scroller's visible height when revealing a row.

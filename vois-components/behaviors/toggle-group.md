<!-- GENERATED from behaviors/toggle-group.json by scripts/behaviors.mjs. Edit the JSON, then run `node vois-components/scripts/behaviors.mjs --write`. Do not edit by hand. -->

# Toggle group behavior

Keep a button pressed until it is pressed again, such as turning on bold, in a group that shares one value.

**Use something else when:**

- RadioGroup: The arrow keys should select an option as they move, or it is one form choice.
- Checkbox: The user picks several choices in a form.

**Basis:** radix-ui, checked 2026-11-23. Behaviors come from the Notion UI SDK inventory (2026-11-21). The support tag on each one was checked against the Radix source on the checked date. The Notion Toggle page also covers a single Toggle. Those lines are left out, because there is no vois-toggle item yet.

**Support tags**

- `native`: The library does this. Do not undo it.
- `differs`: The library does something else. Read the note.
- `supply`: The library does not do this. You build it.
- `decide`: This needs a product or design decision.
- `unchecked`: Not checked against the library yet.

## Anatomy

| Part | Required | Note |
|---|---|---|
| ToggleGroup (root) | yes | Holds the value. type is single or multiple. |
| ToggleGroupItem | yes | One toggle. Give each a unique value. An icon-only item needs an aria-label. |
| ToggleIcon | no | Notion names it. Radix has no such part. Hide the icon from screen readers yourself. |

## Interaction

- **BHV-TOGGLE-GROUP-001** `native` Pressing a toggle switches it between pressed and unpressed. Its label stays the same in both states. Keeping the label fixed is up to the author.
- **BHV-TOGGLE-GROUP-002** `native` Pressing it never submits a form.
- **BHV-TOGGLE-GROUP-003** `native` In a group, pressing one toggle unpresses the others. Pressing the pressed one again clears the selection.
- **BHV-TOGGLE-GROUP-004** `supply` A group can be set to always keep one toggle pressed. Radix has no such prop. Ignore the empty value in onValueChange, as vois-segmented-control does.
- **BHV-TOGGLE-GROUP-005** `native` A group can allow several toggles to stay pressed at once.
- **BHV-TOGGLE-GROUP-006** `native` In a group, the toggles' own pressed state does not apply, because the group owns which ones are pressed.
- **BHV-TOGGLE-GROUP-007** `differs` A change can be cancelled from its callback, so the current state is kept. Use a controlled value and do not update it.
- **BHV-TOGGLE-GROUP-008** `native` A controller can change a group's value from anywhere, such as from a keyboard shortcut. Radix has no shortcut part. Add the key handler yourself.

## Keyboard

- **BHV-TOGGLE-GROUP-009** `native` Enter or Space presses or unpresses the focused toggle.
- **BHV-TOGGLE-GROUP-010** `native` In a group, Left and Right move focus in a horizontal group, and Up and Down move focus in a vertical group, without changing which toggles are pressed. vois-toggle-group draws a horizontal group only. A vertical group needs its own edge and corner rules.
- **BHV-TOGGLE-GROUP-011** `native` Home moves focus to the first toggle and End moves it to the last.
- **BHV-TOGGLE-GROUP-012** `native` Arrow keys wrap from the last toggle to the first by default, or can be set to stop at the ends.
- **BHV-TOGGLE-GROUP-013** `native` In right-to-left text, Left and Right swap. Pass dir for right-to-left pages. Whether the group reads the page's own direction is not checked.

## Focus

- **BHV-TOGGLE-GROUP-014** `native` A group has one tab stop. It enters on the first enabled pressed toggle, or the first enabled toggle, and later returns to the toggle focused last.

## State

- **BHV-TOGGLE-GROUP-015** `native` A toggle can start pressed.
- **BHV-TOGGLE-GROUP-016** `differs` In a group, disabled toggles stay reachable with the arrow keys, are reported as disabled, and ignore presses. Arrow keys skip disabled toggles. This is the same as Tabs. Decide if that is acceptable. If not, build the focus rule yourself.
- **BHV-TOGGLE-GROUP-017** `supply` A disabled toggle can be kept focusable, still ignoring presses, with an explanation of why it is unavailable. Radix does not support this. Use aria-disabled and block the press yourself.
- **BHV-TOGGLE-GROUP-018** `native` A disabled toggle can still start pressed, and a surrounding fieldset disables it too.
- **BHV-TOGGLE-GROUP-019** `supply` Toggles do not submit values, so a group kept in a form needs its value copied into hidden fields by hand. Radix has no form value for a toggle group.

## Accessibility

- **BHV-TOGGLE-GROUP-020** `native` A toggle is a native button that reports whether it is pressed, so screen readers announce the state while the label stays unchanged. True for type=multiple. A type=single group announces radios, not toggles. See the group role line.
- **BHV-TOGGLE-GROUP-021** `supply` An icon-only toggle needs an accessible label, and an icon inside a toggle is hidden from screen readers. vois-toggle-group sets neither. Add aria-label to the item and aria-hidden to the icon. (DS-A11Y-007)
- **BHV-TOGGLE-GROUP-022** `differs` A group has the group role rather than toolbar or radio group, so it can sit inside a toolbar, and its toggles remain buttons. Radix gives a single group radio roles and a multiple group the toolbar role. Listen to a screen reader before you ship. Decide if radio or toolbar is acceptable.

## Common mistakes

- **BHV-TOGGLE-GROUP-023** `supply` Do not change the label between pressed and unpressed. Keep the label the same in both states.
- **BHV-TOGGLE-GROUP-024** `supply` Do not use a toggle group where the arrow keys should select an option as they move. Use a radio group, because a toggle group moves focus first and waits for a press.
- **BHV-TOGGLE-GROUP-025** `supply` Do not rely on toggles to submit form values. Copy a toggle group's value into hidden inputs yourself if you keep it in a form.

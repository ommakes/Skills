<!-- GENERATED from behaviors/progress.json by scripts/behaviors.mjs. Edit the JSON, then run `node vois-components/scripts/behaviors.mjs --write`. Do not edit by hand. -->

# Progress behavior

A bar that shows how far a task has come, or an indeterminate state while the progress is unknown. It is display only.

**Use something else when:**

- Meter: The bar shows a reading, such as storage used, not a task that will finish.
- Spinner: The wait is short and has no measurable end.
- Stepper: The steps gate a flow and the person moves between them.

**Basis:** radix-ui, checked 2026-11-24. Behaviors come from the Notion UI SDK inventory (2026-11-21). The support tag on each one was checked against the source on the checked date. The Notion page lists no common mistakes; the three here come from the source and the vois-components rules.

**Support tags**

- `native`: The library does this. Do not undo it.
- `differs`: The library does something else. Read the note.
- `supply`: The library does not do this. You build it.
- `decide`: This needs a product or design decision.
- `unchecked`: Not checked against the library yet.

## Anatomy

| Part | Required | Note |
|---|---|---|
| Progress (root) | yes | Holds the value and the range. It has the progressbar role. |
| ProgressIndicator | yes | The fill. Radix passes it the state and the value as data attributes. |
| ProgressTrack | no | The bar's size. Radix has no such part; compose it. |
| ProgressLabel | no | A visible name. Radix has no such part; aria-label on the root also works. |
| ProgressValue | no | The visible number. Radix has no such part; hide it from screen readers. |

## Interaction

- **BHV-PROGRESS-008** `native` The bar is display only. It takes no clicks, typing or keyboard input, and it has no change callback.

## State

- **BHV-PROGRESS-001** `differs` Leaving out the value puts the bar in an indeterminate state: no percentage, no fill width, and a sweeping highlight (a still full-width fill when reduced motion is on). Radix gives the state and the attributes only. The sweep, the still fill and the reduced motion branch are yours to draw. (DS-ANIMATION-004)
- **BHV-PROGRESS-002** `native` While the value is below the maximum the bar is marked as progressing. At the maximum it is marked complete. Style with data-state. Radix names the state loading, not progressing.
- **BHV-PROGRESS-003** `differs` A value outside the range is clamped for the fill, the percentage and the announced value. Radix does not clamp. An out of range value turns the bar indeterminate. vois-progress clamps to 0 through max before it passes the value on; with Radix alone, clamp in your own code.
- **BHV-PROGRESS-004** `differs` The range defaults to 0 through 100. A custom range fills the track by position. There is no min prop, so a range that starts above 0 must be mapped to 0 through max by you.
- **BHV-PROGRESS-005** `supply` The fill width follows the value. Radix draws no width. Set it from data-value and data-max, or from your own math.
- **BHV-PROGRESS-006** `supply` The displayed value can be formatted with units, decimal places or custom text, in the locale's digits. Radix only formats the announced text, through getValueLabel (default whole percent). Format the visible value yourself, for example with Intl.NumberFormat.
- **BHV-PROGRESS-007** `supply` In right to left content the track fills from the right. Radix has no direction logic. Use a logical property or flip the fill with the document direction.

## Accessibility

- **BHV-PROGRESS-009** `native` The bar exposes its range and value through the progressbar role.
- **BHV-PROGRESS-010** `supply` The bar has an accessible name, from a visible label or aria-label. Radix adds no name and warns about none. Pass aria-label or aria-labelledby.
- **BHV-PROGRESS-011** `native` The announced value is a percentage by default and can say more, such as a count of files. An indeterminate bar announces no percentage.
- **BHV-PROGRESS-012** `supply` The visible value is hidden from screen readers so it is not read twice. Radix has no value part. Set aria-hidden on the visible text you draw.
- **BHV-PROGRESS-013** `supply` A separate label part names the bar, and a value part shows the number. Radix has only Progress and Progress Indicator. Compose the label, the value and the track from your own elements.

## Common mistakes

- **BHV-PROGRESS-014** `supply` Do not leave the bar without a name. Nothing warns you.
- **BHV-PROGRESS-015** `differs` Do not pass a value above the maximum and expect a full bar. Radix reads it as indeterminate and logs an error. Clamp first.
- **BHV-PROGRESS-016** `supply` Do not use it for a reading such as storage used. Use a meter.

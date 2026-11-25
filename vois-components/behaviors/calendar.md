<!-- GENERATED from behaviors/calendar.json by scripts/behaviors.mjs. Edit the JSON, then run `node vois-components/scripts/behaviors.mjs --write`. Do not edit by hand. -->

# Calendar behavior

A grid of days for picking a date or a range. It supports single, multiple and range selection.

**Use something else when:**

- DatePicker: The person wants a date in a form field, with a calendar that opens from it.
- Input: The person knows the date and can type it.

**Basis:** react-day-picker, checked 2026-11-24. Behaviors come from the Notion UI SDK inventory (2026-11-21). The support tag on each one was checked against the source on the checked date. The library is not Radix. Rows for a read only mode, a refusal and a controller were not found in the source and are tagged supply.

**Support tags**

- `native`: The library does this. Do not undo it.
- `differs`: The library does something else. Read the note.
- `supply`: The library does not do this. You build it.
- `decide`: This needs a product or design decision.
- `unchecked`: Not checked against the library yet.

## Anatomy

| Part | Required | Note |
|---|---|---|
| Calendar (root) | yes | The picker. It takes mode, selected and onSelect. |
| Month caption | yes | The month and year, or two selects. |
| Navigation | yes | Previous and Next buttons. |
| Weekday row | yes | The short day names. |
| CalendarDayButton | yes | One day. It is 44 square in vois-calendar. |
| Footer | no | Optional text under the grid. |

## Interaction

- **BHV-CALENDAR-005** `differs` Choosing a day selects it. In single mode, choosing it again clears it unless the picker is required. Set required when the field must have a date.
- **BHV-CALENDAR-006** `supply` In range mode, the days between the start and the hovered day are shown while the person picks. DayPicker draws no range preview. Track the hovered day and add a modifier.
- **BHV-CALENDAR-007** `differs` Multiple mode keeps the dates in order. Sort them in onSelect if order matters.
- **BHV-CALENDAR-008** `supply` A selection can be refused, with a reason. There is no cancel or reason. Use the disabled matcher and your own onSelect check.
- **BHV-CALENDAR-009** `supply` The calendar can be read only. DayPicker has no read only mode. Disable the days and keep the labels readable.
- **BHV-CALENDAR-010** `native` The visible month can be set by code, and a change is reported.
- **BHV-CALENDAR-011** `native` Previous and Next change the month. The year and month can come from native selects. The default year range is 100 years back to the end of this year. Set startMonth and endMonth to narrow it.

## Keyboard

- **BHV-CALENDAR-001** `native` One tab stop. Arrow Left and Right move a day, and Arrow Up and Down move a week. The tab stop is the selected day, then today, then the first day of the month.
- **BHV-CALENDAR-002** `native` Page Up and Page Down move a month. Shift with them moves a year. Shift with the arrows moves a month or a year.
- **BHV-CALENDAR-003** `native` Home and End go to the start and end of the week.
- **BHV-CALENDAR-004** `supply` Escape cancels a range that is half chosen. DayPicker has no Escape handling. Keep the draft range in your own state and drop it on Escape.

## State

- **BHV-CALENDAR-012** `differs` Days outside the allowed range cannot be reached. Disabled days cannot be focused. The inventory says a disabled day stays focusable. In this library it leaves the tab order, so screen reader users do not discover it.
- **BHV-CALENDAR-013** `native` Two or more months can show side by side, and paging can move one or all months. Outside days across a shared edge in a multi month view are unchecked.
- **BHV-CALENDAR-014** `native` Today is marked, and the week starts on the locale's first day. Six rows can be kept for a steady height. The library marks today with data-today only. vois-calendar adds aria-current date to that day.
- **BHV-CALENDAR-015** `native` Dates follow a chosen time zone. Dates are Date objects, not ISO strings. Convert at the edge of your form.

## Accessibility

- **BHV-CALENDAR-016** `native` The grid has a label, and each day has the full date as its name. Selected days are announced as selected.
- **BHV-CALENDAR-017** `differs` The month and year are announced when they change. It is not a heading, so screen reader users cannot jump to it with heading keys.
- **BHV-CALENDAR-018** `differs` Previous and Next have clear names. Set labelPrevious and labelNext to match your copy.
- **BHV-CALENDAR-019** `differs` Each target is large enough to press. The library has no size rule. The Vois item sets it. (DS-A11Y-001)

## Common mistakes

- **BHV-CALENDAR-020** `native` Do not sort out dates with strings. DayPicker uses Date objects, and a time zone shift can move a day.
- **BHV-CALENDAR-021** `differs` Do not rely on disabled days to explain why they are off. Say why in text near the calendar. Screen reader users cannot reach it to read a reason.
- **BHV-CALENDAR-022** `supply` Do not shrink the day buttons under the minimum hit area to fit a small space. Let the calendar scroll or use a drawer. (DS-A11Y-001)

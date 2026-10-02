# Table Interactions `[PATH-B]` extension

Extends `table-list.md`. That file says which kind of table to build and how a row opens. This file adds how the table behaves: selection, bulk actions, toolbar and view state, editing, loading, empty, and error states.

**Basis tags.** `observed` means seen in several shipped products on Mobbin (links given). `decision` means set by Om. `judgment` means Claude's call, so challenge it. Mobbin shows static screens, so keyboard and scroll behavior in these rules is judgment or standards-based, not observed.

**Builds on.** Every rule lists the existing Vois, righter, or vois-tokens rules it relies on, by ID. Those rules are not restated here. All copy (empty states, errors, toasts, labels, confirmations) comes from righter.

**CSS.** Scroll, sticky, and scrollbar rules are in `vois-tokens/references/data-tables.md` (`DS-TABLE-*`).

---


## Selection and bulk actions

### `[PATH-TABLE-SELECT-CHECKBOX]` Checkbox column
**When:** A table has bulk actions.
**Do:** Add a leading checkbox column. The header checkbox is tri-state (none, some, all on this page). Shift-click selects a range. Selected rows get a tint and a checked box, never tint alone. Simple tables have no checkbox column.
**Builds on:** JOB-BINARY-PREFERENCE, DS-A11Y-017
**Basis:** observed. Seen: [Hotjar](https://mobbin.com/screens/ff3024b1-5264-483e-afa7-460a0224ff89), [YNAB](https://mobbin.com/screens/f08c0bf3-14ab-437e-9c15-0475bebbe4fc), [Wrangle](https://mobbin.com/screens/b9d8a719-226b-4c7c-9268-45b0f1fa875e).

### `[PATH-TABLE-SELECT-ALL-PAGES]` Select across pages
**When:** A paginated table has a full page selected and more results exist.
**Do:** Offer a "select all N" control next to the selection count. Say how many rows an action will touch before the user confirms it.
**Builds on:** PATH-TABLE-SELECT-CHECKBOX
**Basis:** observed. Seen: [Hotjar](https://mobbin.com/screens/ff3024b1-5264-483e-afa7-460a0224ff89).

### `[PATH-TABLE-BULK-BAR]` Bulk action bar
**When:** One or more rows are selected.
**Do:** Show a bar anchored to the table with the selected count, 2 to 3 visible actions with the rest in a DropdownMenu, and a clear-selection control. The destructive action is last and visually distinct. A persistent bar with disabled actions at zero selected is fine when the table is mainly used for bulk work.
**Builds on:** JOB-EXPOSE-ACTIONS, PATH-B-ROW-ACTIONS
**Basis:** observed. Seen: [Hotjar](https://mobbin.com/screens/ff3024b1-5264-483e-afa7-460a0224ff89), [Wrangle](https://mobbin.com/screens/b9d8a719-226b-4c7c-9268-45b0f1fa875e), [YNAB](https://mobbin.com/screens/f08c0bf3-14ab-437e-9c15-0475bebbe4fc), [Xero](https://mobbin.com/screens/ccc39d99-73a0-4807-a839-132653162060), [ClickUp](https://mobbin.com/screens/e9639493-e0a6-46c9-93d1-d3189cbdc3c7).

### `[PATH-TABLE-BULK-DESTRUCTIVE]` Bulk destructive actions
**When:** A bulk action deletes, archives, or otherwise cannot be undone cheaply.
**Do:** Confirm first and state the count. Use a Dialog (see JOB-CONFIRM-DESTRUCTIVE). If the action can be undone, skip the dialog and offer undo in the confirmation toast instead.
**Builds on:** JOB-CONFIRM-DESTRUCTIVE, JOB-TRANSIENT-FEEDBACK
**Basis:** judgment.


## Toolbar, columns, and view state

### `[PATH-TABLE-SORT]` Sorting
**When:** A column can be sorted.
**Do:** Clicking its header cycles ascending, descending, none. The sorted header shows direction and carries aria-sort. One active sort unless the product genuinely needs more. Sort resets paging to page 1.
**Builds on:** PATH-B
**Basis:** observed. Seen: [Navattic](https://mobbin.com/screens/406b9908-584c-4f05-8432-abd77533bfa4), [DoorDash Merchant](https://mobbin.com/screens/5b7f8ac3-1059-401f-a3ee-88e553391166).

### `[PATH-TABLE-FILTER-SIMPLE]` Filters on a simple table
**When:** A simple table has one or two filter dimensions.
**Do:** Use a single Filter control that opens a Popover. Applied filters show as dismissible chips under the toolbar. Search sits beside it.
**Builds on:** PATH-B, JOB-OVERLAY-INTERACTION
**Basis:** observed. Seen: [Navattic](https://mobbin.com/screens/406b9908-584c-4f05-8432-abd77533bfa4), [DoorDash Merchant](https://mobbin.com/screens/5b7f8ac3-1059-401f-a3ee-88e553391166).

### `[PATH-TABLE-FILTER-BUILDER]` Filter builder on a complex table
**When:** A complex table has many filterable fields.
**Do:** Use rows of field, operator, value, with Add filter, Apply, and Clear filters. Keep applied filters visible as chips after the builder closes.
**Builds on:** PATH-TABLE-FILTER-SIMPLE
**Basis:** observed. Seen: [Neon filter builder](https://mobbin.com/screens/926541e1-1d12-4677-8faf-54193a709b17).

### `[PATH-TABLE-COLUMNS]` Column management
**When:** A complex table has more columns than most users need at once.
**Do:** Offer show or hide, reorder, and pin, plus a Reset to default. A column header menu holds per-column actions (sort, move, hide). The first column cannot be hidden.
**Builds on:** PATH-B-COMPLEX
**Basis:** observed. Seen: [Vanta](https://mobbin.com/screens/7f317ce6-2e6e-4fb2-929d-c8de5b2c2f75), [Attio](https://mobbin.com/screens/b1f51bfb-4b7f-4d77-a7ce-9a1568db223e), [Dovetail](https://mobbin.com/screens/832e5719-7133-4733-a7d2-87061364df60).

### `[PATH-TABLE-DENSITY]` Density toggle
**When:** A complex table has a density control.
**Do:** Offer Dense, Regular, and Comfortable. Row height and cell padding come from tokens. Simple tables have one density and no toggle. Remember the choice per user.
**Builds on:** PATH-DENSITY-DENSE, PATH-DENSITY-STANDARD, PATH-DENSITY-SPACIOUS, DS-TABLE-019
**Basis:** decision. Seen: [Vanta](https://mobbin.com/screens/7f317ce6-2e6e-4fb2-929d-c8de5b2c2f75).

### `[PATH-TABLE-SAVED-VIEWS]` Saved views
**When:** Users repeat the same combination of filters, sort, and columns.
**Do:** Offer named views as tabs or a view switcher above the toolbar. A view stores filters, sort, columns, and density. Show an unsaved-changes state when the current setup differs from the saved view.
**Builds on:** JOB-SWITCH-VIEWS
**Basis:** observed. Seen: [Attio](https://mobbin.com/screens/b1f51bfb-4b7f-4d77-a7ce-9a1568db223e), [Hotjar](https://mobbin.com/screens/ff3024b1-5264-483e-afa7-460a0224ff89).

### `[PATH-TABLE-URL-STATE]` State lives in the URL
**When:** A table has search, filters, sort, page, or an open row.
**Do:** Keep each of them in the URL. Reload, back, and a shared link restore the same view, including the open drawer.
**Builds on:** PATH-B-ROW-OPEN
**Basis:** judgment.

### `[PATH-TABLE-KEYBOARD]` Keyboard
**When:** A table has rows users act on repeatedly.
**Do:** Up and Down move row focus. Enter opens the row. Space toggles selection. Esc closes the drawer. Cmd or Ctrl plus Enter saves an edit. Show the shortcut hints where a drawer has them.
**Builds on:** DS-A11Y-002, DS-A11Y-005
**Basis:** observed. Seen: [Midday](https://mobbin.com/screens/19da6460-e187-41dc-b969-a5a8159f974b), [Supabase edit row](https://mobbin.com/screens/9d24497c-18be-490d-aace-3226d0214d1a).

### `[PATH-TABLE-DRAWER-STEP]` Step through rows from the drawer
**When:** A user reviews many rows one after another.
**Do:** Put previous and next controls in the drawer, bound to the Up and Down keys. The table row highlight follows. Stepping past the last row on a page loads the next page.
**Builds on:** PATH-B-ROW-OPEN
**Basis:** observed. Seen: [Midday](https://mobbin.com/screens/19da6460-e187-41dc-b969-a5a8159f974b).


## Editing and saving

### `[PATH-TABLE-COMMIT-INSTANT]` Instant save
**When:** A user edits one low-risk value in a cell.
**Do:** Save on commit (Enter or blur) and confirm with a toast that offers Undo. If the save fails, revert the cell, mark the row, and keep the typed value available to retry. Surface the failure as `PATH-TABLE-ERROR-ROW-ACTION` says.
**Builds on:** PATH-SET-SAVE-INSTANT, JOB-TRANSIENT-FEEDBACK, PATH-TABLE-ERROR-ROW-ACTION
**Basis:** judgment.

### `[PATH-TABLE-COMMIT-BATCH]` Batch save
**When:** A user edits several cells or rows, or one value's validity depends on another.
**Do:** Hold edits locally and show an unsaved-changes bar with Save and Discard. Edited cells are visibly marked. Save is blocked while any edit is invalid, with a summary of what to fix. Never drop valid edits because one is invalid. Leaving the page with unsaved edits asks first.
**Builds on:** PATH-SET-SAVE-EXPLICIT, PATH-TABLE-ERROR-CELL
**Basis:** observed. Seen: [Neon inline edit](https://mobbin.com/screens/98c2905e-c842-4895-b730-c35ce951eabf), [Shopify bulk edit](https://mobbin.com/screens/c72f7765-7966-4a1e-bf36-92b5f9cb90a2).

### `[PATH-TABLE-INLINE-EDIT]` Inline cell edit
**When:** A cell is editable in place.
**Do:** A single click or Enter on a focused cell enters edit mode. Esc cancels and restores the value. Enter commits. Show the cell's edit state with a visible border, not just a cursor. If the table is a grid with arrow-key cell navigation, use role="grid". Otherwise keep a plain table.
**Builds on:** DS-A11Y-002, JOB-DATA-ENTRY
**Basis:** observed. Seen: [Neon inline edit](https://mobbin.com/screens/98c2905e-c842-4895-b730-c35ce951eabf), [Shopify bulk edit](https://mobbin.com/screens/c72f7765-7966-4a1e-bf36-92b5f9cb90a2).


## Loading, empty, and error states

### `[PATH-TABLE-STATE-LOADING]` Initial load
**When:** A table is loading for the first time.
**Do:** Show the real column headers and skeleton rows that match the loaded column widths. Never a full-area spinner.
**Builds on:** JOB-LOADING-STATE
**Basis:** observed. Seen: [Neon skeleton](https://mobbin.com/screens/9b5b1374-c015-495b-abcb-9cce659c741b), [Square skeleton](https://mobbin.com/screens/09371ef3-f0d0-4fc9-8ab1-607ab3d0e4ab).

### `[PATH-TABLE-STATE-REFETCH]` Refetch
**When:** A filter, sort, or page change reloads data.
**Do:** Keep the stale rows on screen with a small busy indicator. Do not blank the table.
**Builds on:** JOB-LOADING-STATE
**Basis:** judgment.

### `[PATH-TABLE-STATE-EMPTY-FIRST]` Empty, first use
**When:** The user has never created anything here and can create from this screen.
**Do:** Show an EmptyState with the primary create action. Headers stay visible.
**Builds on:** JOB-EMPTY-CONTENT
**Basis:** observed. Seen: [Gusto empty](https://mobbin.com/screens/8cfa5755-0b2a-4648-9c58-987c2b039223), [Rox](https://mobbin.com/screens/9026e201-39d6-4640-b0f0-4e7c264c41b8).

### `[PATH-TABLE-STATE-EMPTY-FILTERED]` Empty, filtered
**When:** Search or filters removed every row.
**Do:** Say that filters caused it and offer Clear filters. Use an inline message, not a full EmptyState.
**Builds on:** JOB-EMPTY-CONTENT
**Basis:** observed. Seen: [Delphi](https://mobbin.com/screens/14f1556c-eba4-427e-aa8d-8bb7c20008c8).

### `[PATH-TABLE-STATE-EMPTY-NATURE]` Empty by nature
**When:** No rows is a normal, good state, such as no live calls or no open issues.
**Do:** Say so plainly. No call to action.
**Builds on:** JOB-EMPTY-CONTENT
**Basis:** observed. Seen: [Zendesk](https://mobbin.com/screens/159bdfb5-28a8-45ff-b5da-7236df48f6c2).

### `[PATH-TABLE-STATE-EMPTY-PERMISSION]` Empty by permission
**When:** The user cannot see any rows because of their role.
**Do:** Say that access is the reason and who can grant it. Do not show the first-use create action.
**Builds on:** PATH-PERM-HIDE-BY-ROLE, JOB-EMPTY-CONTENT
**Basis:** judgment.

### `[PATH-TABLE-STATE-TRUNCATED]` Results limited by plan
**When:** A plan limit hides some rows.
**Do:** Put a notice above the table that says so, with the upgrade action. Do not leave it to the footer.
**Builds on:** JOB-CONTEXTUAL-INFO
**Basis:** observed. Seen: [Zapier](https://mobbin.com/screens/9fb0b917-eff7-437a-9d16-24a27db70f4a).

### `[PATH-TABLE-STATE-LOAD-ERROR]` Table failed to load
**When:** The table's data request fails.
**Do:** Replace the rows with an inline panel in the table area: the cause when known and a Retry. Toolbar and headers stay, so filters survive. Not a full-screen modal.
**Builds on:** PATH-TABLE-ERROR-FOCUS, DS-A11Y-009
**Basis:** observed. Seen: [Supabase load error](https://mobbin.com/screens/4dc33031-a543-4dfe-aa1c-b185f2736222), [Asana](https://mobbin.com/screens/23aaaa8d-2bda-4cce-9bfb-23f3b7f1489e).

### `[PATH-TABLE-ROW-STATES]` Row states
**When:** Rows can change state.
**Do:** Support these: default, hover, focus-visible, selected, active (its drawer is open), editing, saving, error, just-added, and disabled or archived. Each has a distinct visual that does not rely on color alone.
**Builds on:** DS-A11Y-017, DS-A11Y-002, PATH-B
**Basis:** judgment.


## Errors

### `[PATH-TABLE-ERROR-ROW-ACTION]` A row action failed
**When:** A delete, archive, status change, or similar action on one row fails.
**Do:** If the UI updated optimistically, roll it back. Mark that row with an error state and offer Retry. Surface the failure with whichever component righter's error decision tree picks, anchored to the row where it can be. The row is the anchor for the error, not the page.
**Builds on:** JOB-TRANSIENT-FEEDBACK, error-decision-tree
**Basis:** judgment.

### `[PATH-TABLE-ERROR-CELL]` A cell or field is invalid
**When:** An edited cell fails validation.
**Do:** Show the message next to the field. In a drawer form it sits under the field. For a cell it opens in a tooltip or popover. Validate on commit or blur, not on every keystroke. Tint the cell and add an icon. Keep what the user typed.
**Builds on:** DS-A11Y-009, DS-A11Y-017, error-decision-tree
**Basis:** observed. Seen: [Remote](https://mobbin.com/screens/ab52924c-333f-42fb-bc19-659aa03720e0), [7shifts](https://mobbin.com/screens/6b45f042-7f89-46f1-b46f-8270604842b8).

### `[PATH-TABLE-ERROR-BULK-PARTIAL]` A bulk or import operation partly failed
**When:** Some rows in a bulk action or import succeed and some fail.
**Do:** Show an Inline Alert above the table with the counts. It is contextual to the table, so it is not an Alert Banner. Mark failed rows with an icon or count in the row gutter. Offer a "show only rows with errors" toggle and the choice to continue with the rows that are ready. When users cannot fix rows in place, offer an export of the failed rows. Name the real cause on each failure.
**Builds on:** JOB-CONTEXTUAL-INFO, error-decision-tree
**Basis:** observed. Seen: [Remote](https://mobbin.com/screens/ab52924c-333f-42fb-bc19-659aa03720e0), [7shifts](https://mobbin.com/screens/6b45f042-7f89-46f1-b46f-8270604842b8), [AutoSend](https://mobbin.com/screens/8d017614-92b0-4db5-ac52-be97356d42d1), [Gusto error](https://mobbin.com/screens/8adf1037-caef-4e73-8c29-7c97e34c1c0d).

### `[PATH-TABLE-ERROR-FOCUS]` Focus and announcement
**When:** A commit, save, or load fails.
**Do:** Move focus to the first error. Announce errors through an aria-live="polite" region. Never clear the user's data to show an error.
**Builds on:** DS-A11Y-009
**Basis:** judgment.


## Structure

### `[PATH-TABLE-SEMANTICS]` Table semantics
**When:** Rendering any table.
**Do:** Use a real table element with th and scope. Do not rebuild it from div elements. The sortable header is a button inside the th.
**Builds on:** DS-A11Y-005, DS-TABLE-015
**Basis:** judgment.

### `[PATH-TABLE-ROW-CLICK]` Row click target
**When:** A row opens a detail view when clicked.
**Do:** The first-column value is the real link or button, so keyboard, screen readers, and middle-click work. The row click is an enhancement on top. Clicks on checkboxes, action menus, and links inside the row do not open the drawer.
**Builds on:** DS-A11Y-005, PATH-B
**Basis:** judgment.

### `[PATH-TABLE-EXPAND-ROWS]` Expandable rows
**When:** A row has sub-rows or a short secondary detail.
**Do:** Use a leading chevron button that toggles aria-expanded. Expanded content stays inside the table. If the detail is a full record, use the drawer instead.
**Builds on:** PATH-B-ROW-OPEN
**Basis:** observed. Seen: [Mixpanel](https://mobbin.com/screens/52edddf8-c426-4ef0-b389-defb03472349).

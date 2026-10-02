# Table/List with Details `[PATH-B]`

This file is the decision tree and the structure. Behavior inside a table (selection, bulk actions, states, errors) lives in `table-interactions.md`. Scroll, sticky, and scrollbar CSS lives in `vois-tokens/references/data-tables.md`.

**Basis tags.** `observed` means seen in several shipped products on Mobbin (links given). `decision` means set by Om. `judgment` means Claude's call, so challenge it.

## When to use:

- User needs to browse, search, filter, and act on multiple items
- User occasionally dives into single item details
- Bulk actions might be needed

## Table or list

Use a table when users compare the same attributes across many items, or sort and filter by them. Use a list when there are about 7 items or fewer with 3 or fewer attributes, or when each item is mostly one block of text. See vois-components `JOB-DISPLAY-DATA`.

## Simple or complex `[PATH-B-SIMPLE]` `[PATH-B-COMPLEX]`

**Simple** when all of these are true: 6 or fewer columns, mostly read, no bulk actions, no inline edit, one or two filter dimensions.

**Complex** when any of these is true: more than 6 columns, user-chosen columns or saved views, bulk actions, inline edit, many filter dimensions, or thousands of rows.

|           | Simple                                              | Complex                                                                 |
| --------- | --------------------------------------------------- | ----------------------------------------------------------------------- |
| Toolbar   | Search, one filter, sort                            | Search, filter builder, columns, density, saved views                   |
| Columns   | Fixed                                               | Show or hide, reorder, pin, reset to default                            |
| Selection | None                                                | Checkbox column, tri-state header, floating bulk bar                    |
| Scroll    | Vertical only. Page scroll, header sticks to page.  | Wrapper owns both axes, bounded height, header and first column pinned. |
| Paging    | 25 per page                                         | 25, 50, or 100 per page, or virtualized for database-style grids        |
| Density   | One density                                         | Dense, Regular, Comfortable                                             |

Scroll rules and their CSS are in `vois-tokens` (`DS-TABLE-*`). A simple table never scrolls sideways. If its content stops fitting, either stack the rows (`[PATH-B-NARROW]`) or move it to complex.

## Row open: which container `[PATH-B-ROW-OPEN]`

**IF: the record has 8 or fewer fields and no related records**
→ Use: **Drawer** in this file's wording, which is the right-anchored **Sheet** in vois-components (`JOB-OVERLAY-INTERACTION`). The table stays visible. View state first with an Edit action, or edit state directly when nearly every open is an edit.
→ Close button top right. Esc closes it.

**IF: the record has tabs, a timeline, related records, or a long form**
→ Use: **Full page.** The drawer carries an "Open" action that escalates to it, so users can still peek first.
→ The full page has a breadcrumb above the title (Home > Items > [Item Name]) or a ghost close button top right. It returns to the table on close, with filters, sort, page, and scroll position kept.
→ **For breadcrumb labels, use righter skill**

**IF: it is only a confirmation, not a record** (delete, archive)
→ Use: **Dialog**, not a detail view. See vois-components `JOB-CONFIRM-DESTRUCTIVE`.

Rules for the drawer (Sheet):

- The active row stays highlighted while its drawer is open.
- The open row id goes in the URL, so reload, back, and sharing work.
- Previous and next controls inside the drawer let users review rows without closing it.
- Closing with unsaved edits asks first.
- The destructive action sits away from Save.

**Basis:** decision. Confirmed by Om. This replaces the earlier rule that view-first uses a modal. Mobbin shows a side panel for row detail in every example found, including view-first ones. Seen: [Navattic](https://mobbin.com/screens/79a31934-4ca2-4700-86a5-c180fa735404), [Square](https://mobbin.com/screens/af6a9d55-8c5c-41b5-b742-edea7495065c) (view first, Edit top right), [Midday](https://mobbin.com/screens/19da6460-e187-41dc-b969-a5a8159f974b) (step through rows), [Twenty](https://mobbin.com/screens/ddc70bb6-5a08-444c-8ef8-a12a0050a428) (drawer escalates to full page), [Squarespace](https://mobbin.com/screens/116c1238-3c3c-45e4-9034-20528b320a86) ("Full profile"), [Calendly](https://mobbin.com/screens/1348f031-6be2-40f2-8aee-96f5f0c76b04), [Supabase](https://mobbin.com/screens/9d24497c-18be-490d-aace-3226d0214d1a). The full-page threshold of 8 fields is judgment.

## Where editing happens `[PATH-B-EDIT]`

- **One atomic, low-risk value** (status, tag, price) → inline cell edit.
- **Several fields, or validation across fields** → the drawer form.
- **The same change on many rows** → a bulk bar action, or a bulk edit page. Never N drawers in a row.
- **Irreversible or high-impact** → the drawer form plus a confirmation dialog.

When edits are saved is covered by `[PATH-TABLE-COMMIT-INSTANT]` and `[PATH-TABLE-COMMIT-BATCH]` in `table-interactions.md`.

**Basis:** judgment. Seen: [Neon](https://mobbin.com/screens/98c2905e-c842-4895-b730-c35ce951eabf) (inline edit with a batch bar), [Shopify bulk edit](https://mobbin.com/screens/c72f7765-7966-4a1e-bf36-92b5f9cb90a2), [Supabase](https://mobbin.com/screens/9d24497c-18be-490d-aace-3226d0214d1a) (drawer form).

## Table Display Rules:

**Structure:**

- First column: bold text, pinned on horizontal scroll (complex tables, and tables in the narrow layout below)
- Header row: pinned. On a simple table it sticks to the page. On a complex table it sticks inside the table's own scroll area. See `vois-tokens/references/data-tables.md`.
- Row hover state → click opens the row's drawer. The first column is the real link, so keyboard and middle-click work.
- Quick action buttons `[PATH-B-ROW-ACTIONS]`: 2 visible is preferred and 3 is the maximum. Everything beyond that, including secondary and destructive actions, goes in a DropdownMenu (see vois-components `JOB-EXPOSE-ACTIONS`)
- Quick actions are right-aligned and float above content
- `[PATH-B-ROW-ACTIONS-REVEAL]`: reveal on hover only where the device supports hover. On touch devices the actions are always visible.

**Pagination:**

- 25 entries per page by default. Complex tables let the user choose 25, 50, or 100.
- Show the range and total ("1-25 of 240") in the footer.
- → **For pagination copy, use righter skill** ("Loading more…", "Next page", etc.)

**Filtering & Sorting:**

- Buttons anchored top right of table
- Active filters shown as dismissible chips
- Sort indicator shows which column + direction
- → **For filter/sort labels and chip copy, use righter skill**

**Columns:**

- Use date pickers for date-entry columns
- Bold the text in first column (table entry name)
- Numbers are right-aligned. Text is left-aligned. Headers align with their data.
- → **For column headers, use righter skill** (keep them short, clear)

**Row Actions:**

- If row is deleted/archived: dim the row visually and disable actions
- → **For action button labels ("Edit", "Delete", "Archive"), use righter skill**

## Narrow Layout `[PATH-B-NARROW]`

Below the `sm` container width (`40em`):

- **4 or fewer columns** (not counting the actions column): rows stack as list items, with the first column as the title and the remaining values beneath it
- **More than 4 columns:** the table scrolls horizontally with the first column and header row pinned, as above. A table in this state is a scroll owner, so it follows the complex-table scroll rules whether or not it counts as complex otherwise.

## States, errors, and interactions

Selection, bulk actions, columns, density, keyboard, URL state, loading, empty, error, and partial-failure handling are in `table-interactions.md` (the `PATH-TABLE-*` rules).

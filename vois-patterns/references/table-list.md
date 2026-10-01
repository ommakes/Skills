# Table/List with Details `[PATH-B]`

## When to use:

- User needs to browse, search, filter, and act on multiple items
- User occasionally dives into single item details
- Bulk actions might be needed

## Macro Decision: Details Container Type

**IF: Quick edit needed** (checkboxes, sliders, dropdowns, handful of fields)
→ Use: Right sidebar (edit-focused)
→ Show form inputs, conditional logic applies
→ Close button on sidebar top right

**IF: Viewing details first** (default view state, user might want to edit after)
→ Use: Modal (view-focused)
→ If user clicks "edit" in modal, navigate to dedicated form page
→ Modal has close button, optional "Edit" action

## Table Display Rules:

**Structure:**

- First column: bold text, pinned on horizontal scroll
- Header row: pinned on vertical scroll
- Row hover state → click opens sidebar or modal
- Quick action buttons `[PATH-B-ROW-ACTIONS]`: 2 visible is preferred and 3 is the maximum. Everything beyond that, including secondary and destructive actions, goes in a DropdownMenu (see vois-components `JOB-EXPOSE-ACTIONS`)
- Quick actions are right-aligned and float above content
- `[PATH-B-ROW-ACTIONS-REVEAL]`: reveal on hover only where the device supports hover. On touch devices the actions are always visible.

**Pagination:**

- 25 entries per page
- → **For pagination copy, use righter skill** ("Loading more…", "Next page", etc.)

**Filtering & Sorting:**

- Buttons anchored top right of table
- Active filters shown as dismissible chips
- Sort indicator shows which column + direction
- → **For filter/sort labels and chip copy, use righter skill**

**Columns:**

- Use date pickers for date-entry columns
- Bold the text in first column (table entry name)
- → **For column headers, use righter skill** (keep them short, clear)

**Row Actions:**

- If row is deleted/archived: dim the row visually and disable actions
- → **For action button labels ("Edit", "Delete", "Archive"), use righter skill**

## Narrow Layout `[PATH-B-NARROW]`

Below the `sm` container width (`40em`):

- **4 or fewer columns** (not counting the actions column): rows stack as list items, with the first column as the title and the remaining values beneath it
- **More than 4 columns:** the table scrolls horizontally with the first column and header row pinned, as above

## If User Edits from Modal:

Navigate to dedicated form page with:

- Breadcrumb above title (Home > Items > [Item Name] > Edit)
  - → **For breadcrumb labels, use righter skill**
- OR ghost close button top right
- Returns to table on close

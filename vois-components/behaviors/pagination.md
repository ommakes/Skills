<!-- GENERATED from behaviors/pagination.json by scripts/behaviors.mjs. Edit the JSON, then run `node vois-components/scripts/behaviors.mjs --write`. Do not edit by hand. -->

# Pagination behavior

Links that move between pages of a long list or table. It shows where the person is and lets them go back or forward.

**Use something else when:**

- Tabs: The pages are different views, not slices of one list.
- Stepper: The pages are steps in a flow with a start and an end.

**Basis:** shadcn, checked 2026-11-24. Behaviors come from the Notion UI SDK inventory (2026-11-21). The support tag on each one was checked against the source on the checked date. Pagination has no library behind it. The evidence is the Vois item file.

**Support tags**

- `native`: The library does this. Do not undo it.
- `differs`: The library does something else. Read the note.
- `supply`: The library does not do this. You build it.
- `decide`: This needs a product or design decision.
- `unchecked`: Not checked against the library yet.

## Anatomy

| Part | Required | Note |
|---|---|---|
| Pagination (root) | yes | The nav landmark. |
| PaginationContent | yes | The list. |
| PaginationItem | yes | One list entry. |
| PaginationLink | yes | A page link. It has no asChild. |
| PaginationPrevious | yes | The link to the previous page. |
| PaginationNext | yes | The link to the next page. |
| PaginationEllipsis | no | Dots for hidden pages. |

## Interaction

- **BHV-PAGINATION-001** `native` Each page is a real link. Modifier clicks and a middle click open it in a new tab. A router link must be rendered by hand with the same classes, because PaginationLink has no asChild.
- **BHV-PAGINATION-002** `supply` Pressing the current page does nothing. PaginationLink only marks the active one. Skip the navigation in your own handler.
- **BHV-PAGINATION-003** `native` Next on the last page and Previous on the first page are disabled. A disabled link leaves the tab order, so keyboard users skip it. (DS-A11Y-011)
- **BHV-PAGINATION-004** `supply` The bar works out its own page numbers from the total. Vois Pagination is plain markup. Do the count and the range in your own code.
- **BHV-PAGINATION-005** `supply` With many pages, the list shows the first, the last and a window around the current page, with an ellipsis for the gaps. The Ellipsis part only draws the dots. Choose the window in your own code.
- **BHV-PAGINATION-006** `supply` First and Last jump buttons are available. There are no PaginationFirst or PaginationLast parts. Add links with the same classes.
- **BHV-PAGINATION-007** `supply` Changing the page size resets to page one. Do this in your own page size handler.
- **BHV-PAGINATION-008** `supply` A page change can be refused, and the reason is reported. Nothing owns the page state. Check in your own handler before you navigate.

## Focus

- **BHV-PAGINATION-009** `native` Tab moves through the links in order. Enter follows the focused link.
- **BHV-PAGINATION-010** `supply` After the page changes, focus goes to a sensible place, such as the top of the results. Move focus yourself, or the screen reader user does not hear that the list changed. (DS-A11Y-021)

## State

- **BHV-PAGINATION-011** `native` The current page is marked. Style it with the data-active attribute.
- **BHV-PAGINATION-012** `native` The ellipsis is not read out as a page, and screen readers hear that more pages exist.

## Accessibility

- **BHV-PAGINATION-013** `native` The bar is a navigation landmark with a label. Previous and Next have labels that say where they go. If a page has two paginations, give each its own label.
- **BHV-PAGINATION-014** `differs` The list keeps its list role, so screen readers announce the number of pages. The shadcn markup has no explicit role. vois-pagination adds it so the role does not depend on the CSS. (DS-A11Y-011)

## Common mistakes

- **BHV-PAGINATION-015** `native` Do not make the current page a plain span. It must stay a link with aria-current so screen readers can find it.
- **BHV-PAGINATION-016** `native` Do not use a disabled button for Previous on page one. Use the disabled link so the layout stays the same.
- **BHV-PAGINATION-017** `supply` Do not use pagination for steps in a flow. Use a stepper.

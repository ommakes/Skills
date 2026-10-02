# Data Tables

Scroll, sticky, scrollbar, and responsive CSS for tables. Which kind of table to build, and how it behaves, is in `vois-patterns` (`references/table-list.md` and `table-interactions.md`). Everything here was checked in Chromium. Where a rule says "verified", that run is the source.

## 1. Pick one scroll owner

A `position: sticky` element sticks to its nearest ancestor that is a scroll container. Any `overflow` other than `visible` or `clip` creates one. So a table has exactly one scroll owner, chosen on purpose, and nothing between the sticky header and that owner changes it by accident. `[DS-TABLE-001]`

The three choices:

| Table | Scroll owner | Header sticks to | Sideways scroll |
| --- | --- | --- | --- |
| Simple | The page | The page | Never |
| Complex | The table wrapper | The wrapper | Yes, with a gesture lock |
| Narrow, more than 4 columns | The table wrapper | The wrapper | Yes, with a gesture lock |

CSS cannot make a header stick to the page while the table scrolls sideways. A wrapper with `overflow-x: auto` is a scroll container on both axes, so the header sticks to the wrapper. Verified in Chromium.

## 2. Complex table: the wrapper owns both axes `[DS-TABLE-002]`

```css
.table-wrap {
  overflow: auto;
  max-block-size: calc(100dvh - var(--table-offset)); /* must be bounded */
  scrollbar-gutter: stable;
  overscroll-behavior-x: contain;
  scroll-padding-block-start: var(--table-header-h);
}
.table-wrap thead th {
  position: sticky;
  inset-block-start: 0;
  z-index: var(--z-table-header);
}
```

The wrapper must have a bounded block size. Without one it grows to fit its rows, nothing scrolls inside it, and the page scrolls instead. In an app shell where the table fills the remaining height, give the wrapper `flex: 1` and its parents `min-block-size: 0`. See `[DS-TABLE-005]`.

## 3. Simple table: no overflow on the wrapper `[DS-TABLE-003]`

```css
.table-simple { /* no overflow set */ }
.table-simple thead th {
  position: sticky;
  inset-block-start: var(--app-header-h);
}
```

The header sticks to the page, offset by any fixed app header. A simple table never scrolls sideways. If its columns stop fitting, stack the rows below the `sm` container width (`PATH-B-NARROW`) or treat the table as complex.

## 4. `overflow: auto clip` does not fix sticky `[DS-TABLE-004]`

`clip` computes to `hidden` when the other axis is `auto`, and `hidden` is still a scroll container. Verified in Chromium: `overflow: auto clip` computes to `auto / hidden`, and the header does not stick to the page. The same is true of `overflow-x: auto; overflow-y: clip`. Only `overflow-x: clip` lets the header stick to the page, and then content past the edge is cut off with no way to reach it. Do not use any of these as a workaround.

## 5. Flex and grid parents need a minimum size `[DS-TABLE-005]`

A table inside a flex or grid layout sizes to its content unless the parents allow it to shrink. Put `min-inline-size: 0` and `min-block-size: 0` on every flex or grid ancestor between the app shell and the wrapper. This extends `[DS-LAYOUT-COMP-003]`. Without it the table pushes the page wider, or the wrapper stops being bounded.

## 6. Sticky first column `[DS-TABLE-006]`

```css
.table-wrap :is(th, td):first-child {
  position: sticky;
  inset-inline-start: 0;
  background: var(--color-background);   /* opaque, content scrolls under it */
  z-index: var(--z-table-pinned);
}
.table-wrap thead th:first-child {
  z-index: var(--z-table-corner);        /* above both */
}
```

Three layers, lowest to highest: body cells, pinned first column, header row, then the corner cell where the header and the pinned column meet. Take the values from the elevation tokens and keep them inside the sticky layer, below overlays (`[DS-ELEVATION-002]`). Do not invent numbers. Add `scroll-padding-inline-start` equal to the pinned column's width, so a focused cell is not hidden behind it.

## 7. Borders on sticky cells `[DS-TABLE-007]`

With `border-collapse: collapse`, borders belong to the table, not to the cells, so a sticky header's bottom border stays behind when the body scrolls under it. Verified in Chromium: the header border disappeared once rows scrolled, and stayed with `border-collapse: separate`.

```css
table { border-collapse: separate; border-spacing: 0; }
th { border-block-end: 1px solid var(--color-border); }
```

## 8. Responsive layout from the container `[DS-TABLE-008]`

```css
.table-region { container-type: inline-size; }
@container (width < 40em) {
  /* stack rows (4 or fewer columns), or switch to the scroll-owner layout */
}
```

`40em` is the `sm` container width from `PATH-B-NARROW`. Key table layout off the container, not the viewport (`[DS-RESPONSIVE-003]`). Put `container-type` on an element outside the scroll wrapper, so the wrapper's own overflow does not affect the query.

## 9. Column sizing and alignment `[DS-TABLE-009]`

- `table-layout: fixed` with explicit column widths, so columns do not jump as data loads.
- `text-overflow: ellipsis` on text cells, with the full value available in the drawer or on hover.
- Numbers right-aligned with `font-variant-numeric: tabular-nums`. Text left-aligned. Headers align with their data.

## 10. Scrollbar styling `[DS-TABLE-010]`

Style the scroll wrapper with the standard properties:

```css
.table-wrap {
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) transparent;
}
```

Do not use `::-webkit-scrollbar`. It switches off native behavior, defeats overlay scrollbars on macOS, and is easy to make inaccessible. Do not hide the scrollbar on a table that scrolls sideways. Verified in Chromium: `thin`, the thumb color, and the stable gutter all compute as written.

## 11. Reserve the scrollbar's space `[DS-TABLE-011]`

`scrollbar-gutter: stable` on the scroll owner keeps the header row and the body row the same width when a vertical scrollbar appears, so columns do not shift.

## 12. Horizontal overscroll `[DS-TABLE-012]`

`overscroll-behavior-x: contain` on the scroll owner, so a sideways swipe at the edge does not trigger browser back-navigation. Leave the vertical axis alone. Containing it can trap users who scroll the page past the table.

## 13. Keyboard focus under sticky headers `[DS-TABLE-013]`

`scroll-padding-block-start` equal to the header height on the scroll owner, so a row that takes focus scrolls into view below the header and is not hidden by it.

## 14. One axis at a time: the gesture lock `[DS-TABLE-014]`

A complex table scrolls on one axis per gesture. CSS has no property for this. `touch-action: pan-y` would block sideways touch scrolling entirely. A wheel handler scrolls only the dominant axis. Verified in Chromium: a diagonal wheel of `(90, 40)` moved x only and `(40, 90)` moved y only, while without the handler both axes moved.

```js
el.addEventListener('wheel', (e) => {
  if (e.ctrlKey) return;                        // pinch-zoom passes through
  e.preventDefault();
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) el.scrollLeft += e.deltaX;
  else el.scrollTop += e.deltaY;
}, { passive: false });
```

Ship it as one shared hook. It applies only to complex tables, and tables in the narrow scroll layout, that scroll on both axes. Simple tables never need it. Leave touch alone, because browsers already lock a touch pan to one axis after the first move. The handler replaces native wheel scrolling, so trackpad momentum feels slightly different. Offer an opt-out. Keyboard scrolling and dragging the scrollbar are unaffected.

## 15. Scroll regions are focusable and labeled `[DS-TABLE-015]`

- The scroll owner has `tabindex="0"`, `role="region"`, and an `aria-label`, so keyboard users can scroll it.
- Keep real `table`, `thead`, `th scope`, and `td` elements. Do not rebuild a table from `div` elements.
- Use `role="grid"` only when you implement arrow-key cell navigation.
- A sortable header is a `button` inside the `th`, and the sorted `th` has `aria-sort`.

## 16. Virtualization `[DS-TABLE-016]`

Paginate by default. Virtualize only for database-style grids with thousands of rows. Virtualization and sticky headers need a spacer-row approach, so test the header and the pinned column with a long scroll before shipping.

## 17. Reduced motion `[DS-TABLE-017]`

Highlights for just-added or just-saved rows, and any scroll shadow transition, respect `prefers-reduced-motion`. Under the reduce setting, change the state without animating it.

## 18. Show that there is more to scroll `[DS-TABLE-018]`

macOS overlay scrollbars are invisible until you scroll. Give sideways-scrolling tables a cue that more content exists: an edge shadow on the pinned column, or a column that is partly cut off at the edge. Treat a scroll-driven shadow as progressive enhancement and check browser support before using it.

## 19. Table dimensions come from tokens `[DS-TABLE-019]`

The scrollbar thumb color, row heights for each density, the offset above the table, the header height, and the sticky layers all come from tokens. Check the workspace token set before you write any of them (`vois_get_token`, or `tokens.json`). If one is missing, propose adding it. Do not hardcode the value.

Tokens this reference assumes: `--scrollbar-thumb`, `--table-offset`, `--table-header-h`, `--app-header-h`, `--z-table-header`, `--z-table-pinned`, `--z-table-corner`, and a row height per density.

## Detector

`scripts/detect.mjs` flags two shapes under `[DS-TABLE-001]`, as advisory findings:

1. A scroll wrapper that combines `overflow-x: auto` with `overflow-y: clip`, or uses `overflow: auto clip` (`[DS-TABLE-004]`).
2. A file that sets a scroll wrapper with no block-size bound and also makes `thead` or `th` sticky.

It reads one file at a time. If the wrapper and the sticky header are in different files, which is the case for a shared `Table` component, it cannot see the problem. Review those by hand against `[DS-TABLE-001]`.

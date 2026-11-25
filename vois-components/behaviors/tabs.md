<!-- GENERATED from behaviors/tabs.json by scripts/behaviors.mjs. Edit the JSON, then run `node vois-components/scripts/behaviors.mjs --write`. Do not edit by hand. -->

# Tabs behavior

Switch between related panels that share the same space, with one tab selected at a time.

**Basis:** radix-ui, checked 2026-11-23. Behaviors come from the Notion UI SDK inventory (2026-11-21). The support tag on each one was checked against the Radix source on the checked date.

**Support tags**

- `native`: The library does this. Do not undo it.
- `differs`: The library does something else. Read the note.
- `supply`: The library does not do this. You build it.
- `decide`: This needs a product or design decision.
- `unchecked`: Not checked against the library yet.

## Anatomy

| Part | Required | Note |
|---|---|---|
| Tabs (root) | yes | Holds the selected value. |
| TabsList | yes | The list of tabs. Give it an accessible name. |
| TabsTrigger | yes | One per panel. Give each tab and its panel the same unique value. |
| TabsContent | yes | The panel shown for the selected tab. |
| Indicator | no | Follows the selected tab. Radix does not ship one. |

## Interaction

- **BHV-TABS-001** `native` Choosing a tab shows the panel with the same value.
- **BHV-TABS-002** `differs` The first enabled tab is selected when no starting tab is given. Radix selects nothing. Always pass defaultValue or value. This also matters on server-rendered pages.
- **BHV-TABS-003** `differs` A disabled tab cannot be selected. Arrow keys can still focus it, so people can find it. Radix skips disabled tabs with arrow keys. Decide if that is acceptable. If not, build the focus rule yourself.
- **BHV-TABS-004** `native` In manual activation mode, arrow keys move focus only. Enter or Space selects the focused tab. Use it when a panel is slow to open, such as a view that fetches data.
- **BHV-TABS-005** `native` Arrow keys wrap around at either end by default. Turning wrapping off makes focus stop at the ends.
- **BHV-TABS-006** `supply` The indicator measures the selected tab and follows it. It measures again when a tab or the list changes size. It does not animate on its first placement. Radix has no indicator part.
- **BHV-TABS-007** `native` Panels unmount when another tab is selected by default. Keeping a panel mounted keeps its hidden content and local state, such as a draft.
- **BHV-TABS-008** `supply` A closed panel can stay available to the browser's Find command. A match in closed content selects its tab and keeps that panel mounted. Radix does not use hidden=until-found.
- **BHV-TABS-009** `native` The previous panel stays mounted through its exit animation, then unmounts or hides.
- **BHV-TABS-010** `supply` Panels can slide in the direction the selection moved. Radix gives no direction. Track the last selection yourself and set a data attribute.
- **BHV-TABS-011** `native` The app can own the selected tab. It can reject a requested change. The change callback does not run for the initial selection. Radix has no controller object. Another control selects a tab by setting the value.
- **BHV-TABS-012** `supply` A tab can render as a link so selection navigates. Arrow keys follow the link when they select it. A modified click such as Command-click keeps its normal browser behavior and does not select the tab. Radix selects on mouse down and does not check the Command key. Handle modified clicks yourself.
- **BHV-TABS-013** `supply` The selection can come from the URL, a hash or a route, and browser navigation stays in sync. A page that uses a hash needs an initial tab while it loads, because the server cannot read the hash.
- **BHV-TABS-014** `supply` When the tab list scrolls, selecting a tab scrolls it into view inside the list. This holds for a click, an arrow key, a controller or the URL.
- **BHV-TABS-015** `supply` Decorative icons stay out of a tab's spoken name. Directional icons flip in right-to-left text. An icon-only tab still needs a spoken label. (DS-A11Y-008, DS-A11Y-032)

## Keyboard

- **BHV-TABS-016** `native` Tab enters the list at the selected tab. The next Tab leaves the list.
- **BHV-TABS-017** `native` Left and Right arrows move between tabs and select them. In a vertical list, Up and Down do the same. In manual mode they only move focus.
- **BHV-TABS-018** `native` Home and End move to the first and last tabs.
- **BHV-TABS-019** `unchecked` Left and Right follow the page's reading direction with no extra setup. Radix takes a dir prop. Whether it reads the page direction by itself is not checked. Set dir on the root for right-to-left pages.

## Focus

- **BHV-TABS-020** `differs` A panel is a tab stop only when it has no focusable content. A panel that holds a field lets Tab go straight to that field. Radix makes every panel a tab stop. If the panel holds a field, pass tabIndex={-1} or accept the extra stop.

## Accessibility

- **BHV-TABS-021** `native` The list is a tab list. Each tab controls its panel. Each panel is labelled by its tab. Give each tab list its own aria-label when a page has more than one. (DS-A11Y-032)

## Common mistakes

- **BHV-TABS-022** `supply` Do not render panels before the list on a server-rendered page without a starting value or a controlled value. Panels do not know which tab is selected before hydration.
- **BHV-TABS-023** `supply` Do not leave an icon-only tab without a spoken label. (DS-A11Y-032)

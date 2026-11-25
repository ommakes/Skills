<!-- GENERATED from behaviors/navigation-menu.json by scripts/behaviors.mjs. Edit the JSON, then run `node vois-components/scripts/behaviors.mjs --write`. Do not edit by hand. -->

# Navigation menu behavior

The main site navigation, with panels that open from the top bar. Each item is a link or a trigger that opens a group of links.

**Use something else when:**

- Menubar: The items are commands, not links.
- Tabs: The items change a view on the same page.

**Basis:** radix-ui, checked 2026-11-24. Behaviors come from the Notion UI SDK inventory (2026-11-21). The support tag on each one was checked against the source on the checked date.

**Support tags**

- `native`: The library does this. Do not undo it.
- `differs`: The library does something else. Read the note.
- `supply`: The library does not do this. You build it.
- `decide`: This needs a product or design decision.
- `unchecked`: Not checked against the library yet.

## Anatomy

| Part | Required | Note |
|---|---|---|
| NavigationMenu (root) | yes | The nav landmark. It sets the delays and the direction. |
| NavigationMenuList | yes | The top-level list. |
| NavigationMenuItem | yes | One entry. |
| NavigationMenuTrigger | no | Opens a panel. |
| NavigationMenuContent | no | The panel with links. |
| NavigationMenuLink | yes | A link. Pass active for the current page. |
| NavigationMenuViewport | no | The shared panel frame. vois-navigation-menu renders it. |
| NavigationMenuIndicator | no | The marker under the hovered trigger. vois-navigation-menu does not use it. |

## Interaction

- **BHV-NAVIGATION-MENU-001** `native` Pointing at a trigger opens its panel after a short delay. Moving to the next trigger switches with no delay. Hover is always on. There is no click-only mode.
- **BHV-NAVIGATION-MENU-002** `native` Clicking a trigger toggles its panel, and a click closes a panel that hover opened.
- **BHV-NAVIGATION-MENU-003** `differs` The menu can be set to open on click only. Touch screens work because tap triggers click. Desktop users always get hover.
- **BHV-NAVIGATION-MENU-004** `differs` Choosing a link closes the panel. A modified click, such as Ctrl or Shift, leaves it open. Only the Cmd key keeps it open. Ctrl and Shift close it. Call preventDefault in onSelect to change that.
- **BHV-NAVIGATION-MENU-005** `differs` The panels do not move off screen near the edge of the window. A panel near the edge can overflow. Place the viewport yourself.
- **BHV-NAVIGATION-MENU-006** `native` Closed panels stay in the page for search and for find in page. Mount only what you need. A big hidden menu costs load time.

## Keyboard

- **BHV-NAVIGATION-MENU-007** `native` Arrow Down on a trigger opens its panel and moves focus into it. Escape closes it and returns focus to the trigger. (DS-A11Y-036)
- **BHV-NAVIGATION-MENU-008** `native` Arrow Left and Right move between triggers. Home and End go to the first and last. The arrows do not wrap. The Menubar wraps. This one stops at the ends.
- **BHV-NAVIGATION-MENU-009** `native` Tab moves from the trigger into its open panel, then on to the next trigger.
- **BHV-NAVIGATION-MENU-010** `native` A disabled trigger is skipped.

## State

- **BHV-NAVIGATION-MENU-011** `native` The link for the current page is marked and shown as current. The Indicator does not follow the current page. It shows only for the hovered or open trigger.
- **BHV-NAVIGATION-MENU-012** `native` The open item can be controlled.
- **BHV-NAVIGATION-MENU-013** `native` A sub menu nests inside a panel. This avoids a second navigation landmark.
- **BHV-NAVIGATION-MENU-014** `native` The panel opens in a direction that matches the move, so it slides from the side you came from. Style it with the data-motion attribute. It stops under reduced motion.

## Accessibility

- **BHV-NAVIGATION-MENU-015** `native` The menu is a navigation landmark with a label. The default label is Main. Change it when the page has more than one navigation.
- **BHV-NAVIGATION-MENU-016** `supply` An icon-only link has an accessible name. Radix gives no warning for an icon-only link. Add aria-label yourself.
- **BHV-NAVIGATION-MENU-017** `supply` Right to left languages swap the arrows, and chevrons and arrows flip. dir is passed down, but icons do not flip by themselves.

## Common mistakes

- **BHV-NAVIGATION-MENU-018** `supply` Do not make an icon-only link without a name. Nothing warns you.
- **BHV-NAVIGATION-MENU-019** `supply` Do not put padding on the Content for spacing. The viewport sizes to the content, so put it on an inner wrapper.
- **BHV-NAVIGATION-MENU-020** `supply` Do not use it for commands. It is for links. Use Menubar for commands.

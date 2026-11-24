<!-- GENERATED from behaviors/menubar.json by scripts/behaviors.mjs. Edit the JSON, then run `node vois-components/scripts/behaviors.mjs --write`. Do not edit by hand. -->

# Menubar behavior

A row of top-level menus for commands in a tool, such as File, Edit and View. It works like the menu bar of a desktop app.

**Use something else when:**

- DropdownMenu: One menu is enough, or the menu opens from a button rather than a bar.
- NavigationMenu: The items are links that change the page.

**Basis:** radix-ui, checked 2026-11-24. Behaviors come from the Notion UI SDK inventory (2026-11-21). The support tag on each one was checked against the source on the checked date. The Notion page lists no common mistakes; the three here come from the source.

**Support tags**

- `native`: The library does this. Do not undo it.
- `differs`: The library does something else. Read the note.
- `supply`: The library does not do this. You build it.
- `decide`: This needs a product or design decision.
- `unchecked`: Not checked against the library yet.

## Anatomy

| Part | Required | Note |
|---|---|---|
| Menubar (root) | yes | The bar. It holds the roving focus and the open menu. |
| MenubarMenu | yes | One menu with its trigger and content. |
| MenubarTrigger | yes | The top-level button. It has the menuitem role. |
| MenubarContent | yes | The open list. It is not modal. |
| MenubarItem | yes | A command. |
| MenubarCheckboxItem | no | A command that toggles. |
| MenubarRadioGroup | no | A group where one item is on. |
| MenubarSub | no | A submenu with MenubarSubTrigger and MenubarSubContent. |
| MenubarSeparator | no | A line between groups. |
| MenubarLabel | no | A heading inside a menu. |
| MenubarShortcut | no | Shows the keys for an item. Radix has no such part; vois-menubar adds it. |

## Interaction

- **BHV-MENUBAR-011** `differs` Pointing at a trigger while another menu is open switches to that menu. Pointing at one while the bar is closed does nothing. Radix has no safe-triangle check, so a diagonal move toward the open menu can switch menus by mistake. vois-menubar adds one: the triangle runs from where the pointer left to the near corners of the open menu. A move along the bar is outside it, so switching still works. Mouse only.
- **BHV-MENUBAR-012** `differs` Clicking an open trigger closes it. Clicking an outside element closes the menu and the click goes through to that element. Radix does not block the outside click. Do not rely on the first click being swallowed.
- **BHV-MENUBAR-013** `supply` The whole bar can be disabled in one prop. Radix Menubar has no disabled prop. Disable each trigger, or wrap the bar and set aria-disabled yourself.
- **BHV-MENUBAR-014** `native` The bar reports which menu is open, and it can be controlled. The value is the id of the open menu, or empty when none is open.
- **BHV-MENUBAR-015** `supply` A reason comes with every close: outside press, Escape, item chosen. onValueChange gives the new value only. Track the reason in your own handlers.

## Keyboard

- **BHV-MENUBAR-001** `native` Tab moves focus into the bar once. Arrow Left and Right then move between the top-level triggers, and Tab leaves the bar. The bar remembers the last trigger you were on and returns to it.
- **BHV-MENUBAR-002** `native` Home moves to the first trigger and End to the last. Arrow keys wrap from the last trigger to the first.
- **BHV-MENUBAR-003** `native` Enter, Space or Arrow Down on a trigger opens its menu and focuses the first item.
- **BHV-MENUBAR-004** `differs` Arrow Up on a trigger opens its menu on the last item. Radix does not open on Arrow Up. vois-menubar adds it.
- **BHV-MENUBAR-005** `native` With a menu open, Arrow Left and Right move to the neighbor menu and keep it open. Submenu triggers are skipped.
- **BHV-MENUBAR-006** `differs` Typing a letter jumps to the next item that starts with it. Typeahead does not search the top-level triggers.
- **BHV-MENUBAR-007** `differs` Tab inside an open menu closes it and moves focus to the next tab stop after the bar. Shift and Tab moves to the one before. Escape closes the menu and keeps focus on its trigger. Radix blocks Tab. vois-menubar closes the menu and moves on, as the ARIA menubar pattern says. (DS-A11Y-036)

## Focus

- **BHV-MENUBAR-008** `native` Escape closes the menu and returns focus to its trigger. If the close came from an outside press, focus stays where the person clicked. (DS-A11Y-021, DS-A11Y-036)
- **BHV-MENUBAR-009** `differs` A disabled trigger is skipped by Tab and by arrow keys. Radix drops it from the tab order. Screen reader users then cannot discover it. Use aria-disabled yourself if it must be found.
- **BHV-MENUBAR-010** `supply` Focus can enter the bar from a shortcut such as Alt plus M. Radix has no global shortcut. Add a key handler that focuses the first trigger.

## State

- **BHV-MENUBAR-016** `differs` The bar can run vertically. Use NavigationMenu or a different pattern for a vertical bar.

## Accessibility

- **BHV-MENUBAR-017** `native` The bar has the menubar role. Each trigger has the menuitem role, aria-haspopup and aria-expanded. The menu is named by its trigger.
- **BHV-MENUBAR-018** `native` Right to left languages swap Left and Right, and the submenu opens to the other side. Pass dir on the Root, or set it on the document.

## Common mistakes

- **BHV-MENUBAR-019** `supply` Do not use a menubar for site navigation. Links in a menubar are announced as menu commands, not as page links. Use NavigationMenu for links that change the page.
- **BHV-MENUBAR-020** `native` Do not rely on Tab to move between menus. Tab leaves the bar. Use the arrow keys.
- **BHV-MENUBAR-021** `differs` Do not disable a trigger and expect it to stay reachable. It leaves the tab order. Add your own message elsewhere if the reason matters.

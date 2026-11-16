# Iconography `[DS-ICON]`

## Sizes

| Size | Use |
|---|---|
| 16px | Inline with body/label text, inside inputs |
| 20px | Inline with H4/H5 text, default button icon, the default icon button |
| 24px | The large icon button, nav items |
| 32px | Empty states, feature callouts, large standalone icons |

```tsx
<Icon name="check" className="size-4" />   {/* 16px, inline with text-sm/base */}
<Icon name="check" className="size-5" />   {/* 20px, default button icon */}
<Icon name="check" className="size-6" />   {/* 24px, large icon button */}
<Icon name="check" className="size-8" />   {/* 32px, empty state */}
```

Tie icon size to the text size it sits beside — never eyeball it. An icon next to `text-sm` is 16px; next to `text-base`/button label is 20px.

## Stroke Width `[DS-ICON-001]`

Use a single stroke width across the icon set — `1.5px` for the default (lucide-react/Radix Icons default). Don't mix stroke weights within the same screen; it reads as a design system bug, not a deliberate choice.

## When in Doubt `[DS-ICON-002]`

If an icon's surrounding text size doesn't map cleanly to one of the four sizes above, round to the nearest one rather than introducing an arbitrary size. The Button sets one more size on its own: a 28px glyph for `icon-lg` on a coarse pointer (`DS-ICON-003`). Never set 28 by hand.

## Icon buttons `[DS-ICON-003]`

An icon button has three sizes: the visual (the box you draw), the target (the area you can tap or click) and the glyph (the icon inside). Keep them apart. The visual can be smaller than the target. The extra area is invisible (`DS-A11Y-001`).

| Button `size` | Visual / glyph, fine pointer | Visual / glyph, coarse pointer | Target, fine / coarse | Use for |
|---|---|---|---|---|
| `icon-sm` | 28 / 16 | 36 / 20 | 44 / 48 | Dense toolbars, table rows, a button inside a field |
| `icon` (default) | 36 / 20 | 48 / 24 | 44 / 48 | App bar actions, card actions, close |
| `icon-lg` | 48 / 24 | 56 / 28 | 48 / 56 | A primary on-screen action, media controls, a bottom nav item on touch |

- **The pointer picks the column, not the screen width.** Use `@media (any-pointer: coarse)`. In Tailwind, `[@media(any-pointer:coarse)]:` works on any version 4 (the named `any-pointer-coarse:` needs 4.1). A laptop with a touchscreen is coarse, so it gets the touch sizes. There is no tablet column.
- **The heights are the Button heights.** 28, 36 and 48 are `--size-action-medium`, `--size-action-large` and `--size-action-x-large`, so an icon button next to a text button or a field has the same height (`DS-COMPONENT-007`). On a coarse pointer, `icon-lg` is `--size-56`.
- **Never smaller than `icon-sm`.** No 24px or 20px icon button. Two exceptions, both in `DS-ICON-006`: a button inside a field, and a chip's remove control.
- **One size per row.** Do not mix icon-button sizes or glyph sizes in one toolbar or button group.
- **The 28 glyph comes from the Button only.** On a coarse pointer the Button sizes the `icon-lg` glyph to `--size-icon-large`. Do not size an icon to 28 by hand (`DS-ICON-002`).

The registry's `vois-button` does all of this through its `icon-sm`, `icon` and `icon-lg` sizes. The Figma Icon Button set has the same three fine-pointer sizes (Sm, Reg, Lg).

## Space between icon buttons `[DS-ICON-004]`

Targets can touch but must not overlap. An area that two targets share counts for neither of them (WCAG 2.5.8). So the gap between two visuals is at least the larger of 8px and the target minus the visual:

| Button `size` | Gap, fine pointer | Gap, coarse pointer |
|---|---|---|
| `icon-sm` | 16 (44 − 28) | 12 (48 − 36) |
| `icon` | 8 | 8 |
| `icon-lg` | 8 | 8 |

Use the spacing tokens (`--space-8`, `--space-12`, `--space-16`). If a row cannot fit a 16px gap between `icon-sm` buttons, move the extra actions into a "More actions" menu. Do not push the buttons closer.

## Name the action `[DS-ICON-005]`

- The accessible name says what the button does: `aria-label="Add to favorites"`, not "Heart". Use `aria-label`, `aria-labelledby`, or visually hidden text (`sr-only`) inside the button.
- Add a Tooltip with the same text. It shows on hover and on keyboard focus. It adds to the name. It never replaces it, because touch has no hover.
- Use an icon-only button only for actions that everyone knows: search, close, add, delete, more, favorite, play. For anything else, use a text button.

The detector flags a `<Button>` with a literal icon size and no accessible name: no non-empty `aria-label` or `aria-labelledby` on it or on a child, and no text among its children (`sr-only` text counts as text; a JSX comment does not). It does not read what it cannot see: a prop spread (`{...props}`), a computed `size`, or an expression child such as `{label}`. `references/hooks.md` lists the details.

## Where each size goes `[DS-ICON-006]`

| Place | Size | Rule |
|---|---|---|
| App bar or nav bar | `icon` | At most 4 actions. Put the rest in a "More actions" DropdownMenu. |
| Toolbar | `icon-sm` on a dense desktop toolbar, `icon` otherwise | One size per row. |
| Table row | `icon-sm` | At most 3 visible actions. Put the rest in a menu. |
| Close a dialog, sheet or panel | `icon` | Top end corner. `aria-label="Close"` and a "Close" tooltip. Never a bare × glyph (`LOOKALIKE-008`). |
| Inside a field (clear, show password) | InputGroupButton `icon-sm` (28) or `icon-xs` (24) | Never taller than the field. The target is still 44 (48 on a coarse pointer). Show a clear button only when the field has a value. |
| Bottom nav or tab bar, touch | `icon-lg` | A label under the glyph. Navigation only, never actions. |
| Primary on-screen action | `icon-lg` | Show emphasis with the variant, not a bigger size. |
| AI chat: actions under a message (copy, rate, retry) | `icon-sm`, no background | At most 4 in the row, 16px apart on a fine pointer, each with a tooltip. No 20px or 24px button: 28 with a 16px glyph reads as quiet. |
| AI chat: the composer | Send `icon`; attach and voice `icon` with no background or Soft | Buttons inside the text field are InputGroupButtons (see the field row). |
| Remove control in a chip | Smaller than `icon-sm` is allowed | Only inside a chip under 28px tall, only when the target reaches 24px with space around it (the WCAG 2.5.8 spacing exception), and never as the only way to do a destructive action. |

## Three styles by background `[DS-ICON-007]`

| Style | Button `variant` | Resting fill | Use for | Figma set |
|---|---|---|---|---|
| No background | `ghost` | none | Toolbars, app bars, table rows, actions under a chat message. The default. | Icon Button |
| Soft | `soft` | `--action-icon-soft-resting` (black 8% / white 8%) | A button that must read as a button at rest on a plain surface: a close on a card or an image, a composer's attach button | Icon Button Soft |
| Glass | `glass` | the glass subtle tier (`references/glass.md`) | An icon button floating over an image, video or map, and nowhere else (`DS-GLASS-001`). Counts toward the 3 glass surfaces per viewport | Icon Button Glass |

- Soft's hover and pressed fills (`--action-icon-soft-hover`, `-pressed`, 12% and 20%) are one step above the ghost's, so a resting Soft never looks like a hovered ghost. The fills are alpha, so Soft reads on a page, a card or an image.
- One style per row. Do not mix a ghost and a Soft button in one toolbar.
- Sizes, gaps and tap areas are the same for every style (`DS-ICON-003`, `DS-ICON-004`).


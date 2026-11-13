# Shape: corners as a behavior

Don't make every corner a number. Choose a shape role first, then let the role decide the CSS. The roles are tokens (`--shape-*`), and each one is a behavior: a fixed radius, a radius that grows with the surface, an elliptical corner, a capsule or a circle.

The registry's `vois-tokens` item ships them in `shape-tokens.css`, generated from `registry/source/shape.json`. The fixed roles point at the Figma radius roles (`--radius-*`), so they follow Figma. The others live in code, because Figma radius variables can only hold numbers.

## The roles `[DS-SHAPE-001]`

Pick the role before the number. Ask what the thing is, how big it gets, whether it is structural UI or visual content, and whether its curve should stay the same or scale with it. Then use, in this order:

1. The project's existing component, with the shape it already has.
2. An existing shape role.
3. A contextual adjustment within that role (for example, the concentric rule below).
4. A new value, only when nothing above fits. Then name the missing role instead of writing a one-off number `[DS-SHAPE-005]`.

| Role | Behavior | Default value | For |
|---|---|---|---|
| `--shape-sharp` | fixed | `0` | full-bleed media, table cells, edge-to-edge bars |
| `--shape-subtle` | fixed | `--radius-buttons-and-controls` (6) | buttons, inputs, selects, other controls |
| `--shape-rounded` | fixed | `--radius-small-container` (12) | menus, popovers, small cards |
| `--shape-soft` | fixed | `--radius-large-container` (24) | dialogs, sheets, large cards |
| `--shape-pill` | capsule | `9999px` | tags, chips, pill tabs, segmented controls, status dots |
| `--shape-circle` | circle | `50%` | avatars, radio dots, round icon buttons |
| `--shape-responsive-soft` | proportional | `clamp(16px, 4cqi, 40px)` | hero media, large image-led cards, editorial and promo tiles |
| `--shape-responsive-elliptical` | elliptical | `4% / 6%` | a distinctive media surface, where elliptical corners are intended |

These roles come from the registry (`shape-tokens.css`), not from Figma: the MCP serves Figma variables, so it has the `--radius-*` roles the fixed roles point at, but not the roles themselves.

## Controls stay fixed `[DS-SHAPE-002]`

Buttons, inputs and selects keep the library's control radius (`--shape-subtle`). Use `--shape-pill` for things whose height sets the curve: tags, chips, pill tabs, segmented controls and status indicators. Use `--shape-circle` for avatars and round icon buttons. Don't turn a button or input into a pill unless the project's component already is one.

## Large visual surfaces scale `[DS-SHAPE-003]`

A fixed radius that looks right on a 300 × 200 card looks under-rounded on a 1200 × 800 hero, and a large fixed radius makes a small component look cartoonish. For hero media, large image-led cards and editorial tiles whose size changes with the layout, use `--shape-responsive-soft`. Its corners stay round and grow with the width of the nearest container, between 16 and 40. Give the surface's wrapper `container-type: inline-size`, so the corner follows the surface and not the viewport.

```tsx
<div className="@container">
  <img className="w-full rounded-[var(--shape-responsive-soft)]" src={src} alt={alt} />
</div>
```

Structural UI (dialogs, menus, standard cards) keeps a fixed role, even when it is large.

## Elliptical only on purpose `[DS-SHAPE-004]`

`--shape-responsive-elliptical` is a percentage per axis: 4% of the width across, 6% of the height down. It is round on a 3:2 box and elliptical on any other shape. Use it only where an elliptical corner is the intent, on a distinctive media surface. For "round, but bigger on bigger things", use `--shape-responsive-soft`.

## No one-off radii `[DS-SHAPE-005]`

Never write a radius because it "looks right" (`rounded-[19px]`, `border-radius: 19px`). Use a role, or a `--radius-*` or `--radii-*` token inside a role. If no role fits, say which role is missing and why, rather than adding another number.

## Nesting `[DS-SHAPE-006]`

The concentric rule (`[DS-SURFACE-RADIUS]`, outer = inner + padding) applies between fixed roles. Inside a proportional, elliptical or capsule parent, there is no single number to subtract from, so pick the child's role on its own.

## Continuous corners `[DS-SHAPE-007]`

On the soft and responsive roles, add continuous (squircle) corners as an enhancement where the browser supports them: `supports-[corner-shape:squircle]:[corner-shape:squircle]` in Tailwind, or `@supports (corner-shape: squircle) { corner-shape: squircle; }` in CSS. Browsers without `corner-shape` keep the round corner, and the layout doesn't change. Don't add it to controls, pills or circles: on a capsule it changes the shape itself.

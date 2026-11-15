# Elevation `[DS-ELEVATION]`

Shadow shows stacking order and state. There are five tiers, from the Figma effect styles (`Elevation/*`), plus "no shadow". Don't invent a sixth, and don't hand-write a shadow: each tier is a token in the token file.

The map of which element sits at which tier, and how it moves with state, is `data/elevation-map.json`. `scripts/elevation-map.mjs` checks it against the schema and against the registry components. When a tier in this file and the map disagree, the map wins, because it is checked against the built components.

## The tiers

The ladder runs: none, Base, Small, Medium, Large, XLarge.

| Tier | Token | Built elements that use it |
|---|---|---|
| none | | Pressed Card and Choice Card, disabled elements, static sections that only group content |
| Base | `--shadow-base` | Card, Choice Card and the Segmented Control indicator at rest |
| Small | `--shadow-small` | Card and resting Choice Card on hover, the Switch knob, Hover Card |
| Medium | `--shadow-medium` | Dropdown menus and select lists |
| Large | `--shadow-large` | Dialog, Tooltip |
| XLarge | `--shadow-xlarge` | Nothing at rest. Only a dragged item or a full-screen surface |

Each tier is several stacked shadows of black at a low alpha, so it reads on any light surface. Dark mode needs more than that (`DS-ELEVATION-005`).

```css
.card { box-shadow: var(--shadow-base); }
.card:hover { box-shadow: var(--shadow-small); }
.menu { box-shadow: var(--shadow-medium); }
.dialog-content { box-shadow: var(--shadow-large); }
```

## Layers `[DS-ELEVATION-002]`

Each tier belongs to a layer. The layer sets the z-index token, and the tiers it may use.

| Layer | Token | Tiers allowed |
|---|---|---|
| page | none | none, Base, Small, Medium |
| dropdown | `--z-dropdown` | Medium |
| overlay | `--z-overlay` | Small, Medium, Large |
| modal | `--z-modal` | Large, XLarge |

Layers run in role order, and the heaviest tier a layer allows never drops below the layer before it. This is not z-index order. A popup opened from inside a dialog (a menu, select, hover card or tooltip) stacks above the modal and keeps its own lighter tier. The z-index order is modal 1300, dropdown 1400, overlay 1500.

## Modal scrim `[DS-ELEVATION-001]`

The backdrop behind a modal is separate from the modal's own shadow. Use the scrim token, not a darker shadow and not a literal color. The scrim stays at 20% (`--bg-overlay-dark`).

```css
.modal-backdrop { background: var(--bg-overlay-dark); }
```

Pair it with `references/components.md`'s modal section (`inert`, `overscroll-behavior`, `scrollbar-gutter`).

## State changes `[DS-ELEVATION-003]`

| State | Rule |
|---|---|
| Hover | Up one tier at most. Never down. The Card and the resting Choice Card go from Base to Small. |
| Pressed | Down one tier, or to none. Never up. A card may drop to none: the Card and the resting Choice Card do. |
| Dragged | A high tier (Large). Never lower than rest. |
| Disabled | None, or unchanged. |
| Focus | No change. The focus ring is the indicator (`DS-A11Y-018`). |

## Resting cards `[DS-ELEVATION-004]`

A resting card keeps a Base or Small shadow. A static section that only groups content stays flat, so a page does not turn into a stack of boxes (`DS-SLOP-010`). Choose by whether the thing is a separate object the user acts on, not by whether it has content.

## Dark mode `[DS-ELEVATION-005]`

A 4 to 5% black shadow is invisible on a dark surface, so dark mode does not use shadow alone.

| Tier | Dark rendering |
|---|---|
| none | No shadow |
| Base | No shadow. The `--bg-card` fill and the component's own edge |
| Small | No shadow. The `--elevation-surface-small` fill and the component's own edge |
| Medium, Large, XLarge | `--elevation-surface-raised` fill, a blacker shadow, and the component's own edge |

The tokens, all from Figma:

| Token | Light | Dark |
|---|---|---|
| `--elevation-surface-small` | white (same as `--bg-card`) | `--warm-gray-10` |
| `--elevation-surface-raised` | white | `--warm-gray-9` |
| `--elevation-surface-popup` | white | `--warm-gray-8` |
| `--elevation-hairline` | transparent | `--white-a3` |
| `--shadow-medium`, `-large`, `-xlarge` | as before | blacker, from the `Elevation/Dark/*` effect styles |
| `--shadow-base`, `--shadow-small` | as before | draw nothing |

A component that reads a tier token gets the dark shadow from `.dark` for free. The fill and the edge it sets itself: use `--elevation-surface-small`, `--elevation-surface-raised` or, for a popup, `--elevation-surface-popup` as the fill, and `--elevation-hairline` as the edge when it has none. A component that already has an edge (Card, menus, Dialog) keeps it, so it does not get two. Light does not change: the fills are the same white and the hairline is transparent. Two built components keep their own fill: the Tooltip is a dark fill in both themes, and the Switch knob is a light knob on a dark track, so its Small shadow disappearing in dark costs nothing.

Dark text (4.5:1) and control edges (3:1) are tested on every fill, and text on a menu item hover over the raised and popup fills (`DS-ELEVATION-012`). The decorative edge `--border-pretty` is not tested: on the raised fill it is nearly the same color, so a menu is outlined against the page by its edge and separated from a Dialog behind it by its shadow only.

**Popups sit one step above the Dialog.** A menu, select list or hover card can open from inside a Dialog (the z-index order is modal 1300, dropdown 1400, overlay 1500), so in dark it fills with `--elevation-surface-popup`, one step lighter than the Dialog's `--elevation-surface-raised`. The fill follows the layer, not the tier: page elements use Base and Small, the modal layer uses Raised, and the dropdown and overlay layers use Popup. The Tooltip is a dark fill in both themes and keeps its own. Light is unchanged: all of them are the card white. A stock shadcn Popover still maps to `--bg-card` (`DS-TOKEN-005`), so it is darker than the Vois menus; that is an open decision, not a rule.

## Docked panels `[DS-ELEVATION-006]`

A panel docked to an edge casts its shadow away from that edge, with a negative spread so it does not leak along the panel's sides.

| Dock | Token | Shadow offset |
|---|---|---|
| Right | `--shadow-large-right` | x negative |
| Left | `--shadow-large-left` | x positive |
| Bottom | `--shadow-large-bottom` | y negative |
| Top | `--shadow-large-top` | y positive |
| Centered | `--shadow-large` | x is 0 |

Each is the Large tier's layers (without the 1px ring) moved along one axis by the layer's depth, with the spread pulled in by half its blur (rounded down, so the 1px layer has none). Light and dark both exist (`Elevation/Large/<Side>` and `Elevation/Dark/Large/<Side>` in Figma). Only Large has directional tokens: a Sheet or Drawer is a modal-layer element. The map's `dock` field says which side, and `scripts/elevation-map.mjs` fails if a docked element names a tier with no token for its side. A tier other than Large would need its own styles first.

## Guardrails

- `[DS-ELEVATION-007]` No raw shadow literal with blur. A zero-blur spread-only ring is allowed. It is an edge, not a tier.
- `[DS-ELEVATION-008]` At most two distinct tiers at rest in one view.
- `[DS-ELEVATION-009]` Large and XLarge only on overlays, hover and a dragged item.
- `[DS-ELEVATION-010]` Inset only for a recessed or pressed element. A zero-blur inset ring used as a border or a checked ring is allowed.
- `[DS-ELEVATION-011]` Cross-fade the opacity of a pre-drawn layer to animate Medium and heavier tiers. Do not animate `box-shadow` on them.
- `[DS-ELEVATION-012]` Check contrast on every elevated fill: text 4.5:1, control edge 3:1.

`DS-ELEVATION-006` and `-007` have detectors (`scripts/elevation-checks.mjs`, listed in `references/hooks.md` with their gaps). The others are judgment.

## Checking the map

```
node vois-tokens/scripts/elevation-map.mjs
node vois-tokens/scripts/elevation-map.test.mjs
```

The check fails when the ladder changes, a state moves more than one tier, a tier is outside its layer, a dragged tier is below Large, a built row names a component that is not in the registry, or the component source (comments ignored) never uses a `--shadow-*` token the map names. It does not check which state uses the token. A `proposed` row names no component yet.

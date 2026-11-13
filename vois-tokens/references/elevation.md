# Elevation `[DS-ELEVATION]`

Shadow communicates stacking order and interactivity. There are five tiers, from the Figma effect styles (`Elevation/*`). Don't invent a sixth, and don't hand-write a shadow: each tier is a token in the token file.

| Tier | Token | Use it for (Figma) | Layer |
|---|---|---|---|
| Base | `--shadow-base` | Inputs, buttons and selectors, raised | In the page |
| Small | `--shadow-small` | A card at rest | In the page |
| Medium | `--shadow-medium` | A raised card (in the page), a dropdown menu (dropdown layer) | In the page, or `--z-dropdown` for a menu |
| Large | `--shadow-large` | A picker, a popover | `--z-overlay` |
| XLarge | `--shadow-xlarge` | Modals and dialogs | `--z-modal` |

Each tier is several stacked shadows of black at a low alpha, so it reads on any surface.

```css
.card { box-shadow: var(--shadow-small); }
.card:hover { box-shadow: var(--shadow-medium); }
.popover { box-shadow: var(--shadow-large); }
.dialog-content { box-shadow: var(--shadow-xlarge); }
```

## Modal Scrim `[DS-ELEVATION-001]`

The backdrop behind a modal is a separate concern from the modal's own shadow. Use the scrim token, not a darker shadow and not a literal color:

```css
.modal-backdrop {
  background: var(--bg-overlay-dark);
}
```

Pair with `references/components.md`'s modal section (`inert`, `overscroll-behavior`, `scrollbar-gutter`).

## When in Doubt `[DS-ELEVATION-002]`

Match the tier to the z-index layer it occupies: `--shadow-medium` goes with `--z-dropdown` when it is a menu (a raised card at Medium stays in the page), `--shadow-large` with `--z-overlay`, `--shadow-xlarge` with `--z-modal`. Don't put a heavier shadow on a lower-stacked element than a lighter one above it.

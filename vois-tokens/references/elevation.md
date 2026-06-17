# Elevation `[DS-ELEVATION]`

Shadow/elevation communicates stacking order and interactivity. Four tiers — don't invent a fifth.

| Tier | Token | Shadow | Layer |
|---|---|---|---|
| Flat | `--shadow-flat` | none | Inline content, cards at rest, table rows |
| Raised | `--shadow-raised` | `0 1px 2px oklch(0 0 0 / 0.08)` | Hovered cards, buttons, dropdown triggers |
| Overlay | `--shadow-overlay` | `0 4px 12px oklch(0 0 0 / 0.12)` | Popovers, tooltips, dropdown menus |
| Modal | `--shadow-modal` | `0 16px 48px oklch(0 0 0 / 0.20)` | Dialogs, drawers, sheets |

```css
.card { box-shadow: var(--shadow-flat); }
.card:hover { box-shadow: var(--shadow-raised); }
.dropdown-menu { box-shadow: var(--shadow-overlay); }
.dialog-content { box-shadow: var(--shadow-modal); }
```

## Modal Scrim `[DS-ELEVATION-001]`

The backdrop behind a modal is a separate concern from the modal's own shadow — use a scrim color, not a darker shadow:

```css
.modal-backdrop {
  background: oklch(0 0 0 / 0.4);
}
```

Pair with `references/components.md`'s modal section (`inert`, `overscroll-behavior`, `scrollbar-gutter`).

## When in Doubt `[DS-ELEVATION-002]`

Match the tier to the z-index layer it occupies (see `references/css-architecture.md`'s z-index scale) — `overlay` elevation goes with `--z-dropdown`/`--z-overlay`, `modal` elevation goes with `--z-modal`. Don't mix a heavier shadow on a lower-stacked element than a lighter one above it.

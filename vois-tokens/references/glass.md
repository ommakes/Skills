# Frosted glass `[DS-GLASS]`

Glass is a translucent surface that blurs what sits behind it. In Vois it is **opt-in**. An opaque surface is the default, and most surfaces stay opaque.

The values below are a labelled synthesis. Apple and Microsoft publish no numeric blur, saturation or tint values for their materials. Material 3 has no glass at all. The blur radii are Tailwind v4's published scale (8 / 16 / 24). The tints, edges and highlights are a first pass, snapped to the Vois White Alpha palette, and need a check on real screens.

## Where glass goes `[DS-GLASS-001]`

Only on chrome and floating layers:

- a sticky nav bar, tab bar or toolbar
- a menu, popover or dropdown
- a dialog, sheet or command palette
- an icon button floating over an image, video or map (`<Button variant="glass">`, the subtle tier; Figma Icon Button Glass)

Never on the content layer: body text, a data table, a form, or a card in a list. At most **3 glass surfaces in one viewport**. Glass on everything reads as fog, and glass on text over text is illegible.

## Three tiers `[DS-GLASS-002]`

| Tier | Use | Blur | Saturate | Tint, light / dark | Edge, light / dark | Highlight, light / dark | Shadow |
|---|---|---|---|---|---|---|---|
| Subtle | Chips, badges, a hover state | `--glass-blur-subtle` (8) | 150% | white 60% / 8% | white 20% / 12% | white 20% / 8% | `--glass-shadow-subtle` (0 2 8, black 8% / 16%) |
| Standard | A sticky nav or toolbar, menus | `--glass-blur-standard` (16) | 160% | white 70% / 12% | white 30% / 12% | white 30% / 12% | `--glass-shadow-standard` (0 8 32, black 12% / 20%) |
| Strong | A dialog, sheet or command palette, always over the scrim | `--glass-blur-strong` (24) | 180% | white 80% / 20% | white 30% / 20% | white 40% / 20% | `--glass-shadow-strong` (0 16 48, black 18% / 24%) |

- **Tokens.** `--glass-tint-*`, `--glass-stroke-*`, `--glass-highlight-*`, `--glass-blur-*` and `--glass-shadow-*` come from Figma (`Component/Glass/*`, `Glass/Blur-*` and the `Glass/*` effect styles). The colors alias the White Alpha palette, so they switch with `.dark`. Saturate has no Figma equivalent and lives in the registry's `vois-glass` item.
- **Dark tint is white at low alpha, never black.** A black fill over a dark page reads as mud.
- **Corners come from the shape roles** (`references/shape.md`), not from the tier. Do not mix a second radius scale in for glass.
- **Three tiers are the whole system.** Do not add a fourth or tune one per screen.

The registry's `vois-glass` item writes each tier as one Tailwind class string (`glass.subtle`, `glass.standard`, `glass.strong`). The Dropdown Menu takes `material="glass"` for the standard tier. The Dialog and the CommandDialog take it for the strong tier. The Button's `variant="glass"` is the subtle tier; its hover steps to the standard tint and its press to the strong one.

## The `-webkit-` twin `[DS-GLASS-003]`

Every `backdrop-filter` has a `-webkit-backdrop-filter` with the same value. Safari before 18 reads only the prefixed one. Tailwind's `backdrop-blur-*` utilities write both. In hand-written CSS, write both. In a React `style` object, set `WebkitBackdropFilter` next to `backdropFilter`.

## Blur from the tokens `[DS-GLASS-004]`

The blur radius is `var(--glass-blur-subtle)`, `-standard` or `-strong`. Never a literal (`blur(12px)`, `backdrop-blur-md`, `backdrop-blur-[20px]`). Never more than 24 on a panel: past that it reads as opaque fog and costs the most to paint. 40 and 64 are for a decorative wash only, and Vois has none.

## Never animate the blur `[DS-GLASS-005]`

Do not put `backdrop-filter` in a `transition` or a `@keyframes` block. The browser re-blurs every frame. Fade the surface's opacity instead, or show it at once.

## One glass layer at a time `[DS-GLASS-006]`

Never put a glass element inside another one. A backdrop filter blurs only up to the nearest **backdrop root**: an ancestor with opacity under 1, a `filter`, a `mask`, a `clip-path`, a `mix-blend-mode` or its own `backdrop-filter`. A glass child inside one blurs only what lies between them, not the page. This is the usual cause of "my blur does nothing".

## Fallback first `[DS-GLASS-007]`

1. The base style is an **opaque** fill: the elevation fill of the layer (`--elevation-surface-small`, `-popup` or `-raised`).
2. `@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))` lowers the fill to the tint and adds the blur.
3. `@media (prefers-reduced-transparency: reduce)` puts the opaque fill back and sets `backdrop-filter: none`.

Never the other way round: a surface that goes near-transparent where blur is not supported is broken. Browser support for `prefers-reduced-transparency` is partial, so it is an extra safeguard, not the only one.

```css
.nav-glass {
  background-color: var(--elevation-surface-popup);
  border: 1px solid var(--glass-stroke-standard);
  box-shadow: inset 0 1px 0 var(--glass-highlight-standard), var(--glass-shadow-standard);
}
@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .nav-glass {
    background-color: var(--glass-tint-standard);
    -webkit-backdrop-filter: blur(var(--glass-blur-standard)) saturate(1.6);
    backdrop-filter: blur(var(--glass-blur-standard)) saturate(1.6);
  }
}
@media (prefers-reduced-transparency: reduce) {
  .nav-glass { background-color: var(--elevation-surface-popup); -webkit-backdrop-filter: none; backdrop-filter: none; }
}
```

## Contrast at the worst case `[DS-GLASS-008]`

Text on glass has no single background color. Measure against the **lightest and the darkest patch** that can sit behind the panel, in both themes and at more than one scroll position: 4.5:1 for text, 3:1 for large text and controls (`DS-A11Y-004`). The same card can pass at 6.7:1 over a dark patch and fail at 1.3:1 over a light one.

If it fails, use a stronger tier, or put a black dimming layer at 35% between bright media and the glass. Do not lower the bar. No accent-colored text or links on glass.

## Shadows and the scrim `[DS-GLASS-009]`

A glass surface uses `--glass-shadow-*` for its float shadow, and an `inset 0 1px 0 var(--glass-highlight-*)` for the top highlight. The highlight has no blur, so it is an edge, not an elevation shadow (`DS-ELEVATION-010`). The glass shadow tokens count as tier tokens under `DS-ELEVATION-007`. They are separate from the elevation tiers, so they can drift apart; change both together.

The strong tier sits over the one modal scrim, `--bg-overlay-dark` (`DS-ELEVATION-001`). There is no second, darker scrim for glass.

## Glass in Figma `[DS-GLASS-010]`

- Fill the layer with `Component/Glass/Tint-*`. The background blur shows only while the fill is under 100% alpha.
- Stroke it 1px inside with `Component/Glass/Stroke-*`.
- Apply the `Glass/<Tier>` effect style: background blur bound to `Glass/Blur-*`, the top highlight, and the float shadow. Effect colors do not follow the variable mode, so a frame in Dark mode uses `Glass/Dark/<Tier>`.
- Do not combine Figma's Glass effect with Background blur on one layer. Only the first one renders.
- **Use the same blur numbers in Figma and CSS, then compare.** A third-party source says Figma's blur is about twice as strong as CSS. One check here did not bear that out: the specimen's busy stage, rebuilt in Chromium, looked close to the canvas at 8 / 16 / 24 and visibly sharper at half those values (2026-11-15, one visual comparison). Compare a browser screenshot with the canvas before you change either number. Background blur does not export to SVG.

The Elevation page has a specimen of each tier over a busy background and over plain UI, in Light and Dark ("Glass (registry)").

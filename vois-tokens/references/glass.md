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

## Edge fade `[DS-GLASS-011]` `[DS-GLASS-012]` `[DS-GLASS-013]` `[DS-GLASS-014]` `[DS-GLASS-015]`

An edge fade is a blur that tapers off toward the middle of the screen, so content scrolls under a bar or a dock and softens instead of being cut off. It is one glass surface, and it is the only place a mask belongs on glass.

- An edge fade (a blur that tapers off) goes only at the edge of a scroll area, under sticky chrome: below a top bar, or above a bottom bar, tab bar or floating dock. It is as tall as the chrome plus a short run-out. It counts as one glass surface in DS-GLASS-001. Never put one in the middle of content, and never use one as a scrim for text on a photo (use the dimming layer in DS-GLASS-008). `[DS-GLASS-011]`
- Build an edge fade from one element that holds both `backdrop-filter` and `mask-image`, each with its `-webkit-` twin, plus `pointer-events: none`. The mask is the eased stop list in `--glass-fade-mask`, not a two-stop linear gradient. Never put the mask, or an `opacity` under 1, on a parent: the blur then disappears (DS-GLASS-006). The blur is `var(--glass-blur-strong)` at most (DS-GLASS-004) and is never animated (DS-GLASS-005). `[DS-GLASS-012]`
- A layered fade is optional: up to 4 sibling layers with the same mask, anchored to the edge, at 100%, 75%, 50% and 25% of the fade height. Each radius is a share of `--glass-blur-strong`, kept in a custom property so the blur reads `var(...)`. Stacked blurs compound, so the radii add in quadrature: the square root of the sum of their squares at the edge must not exceed `--glass-blur-strong`. 4, 8, 12 and 18 give 23.4. The stack counts as one glass surface. Paint cost of a stack is not measured here: test it on a real phone. `[DS-GLASS-013]`
- An edge fade's base style is a gradient from `var(--bg-background)` to transparent over the same height. An `@supports` test for `backdrop-filter` or its `-webkit-` twin swaps it for the blur and the mask. Under `prefers-reduced-transparency: reduce` the gradient comes back and `backdrop-filter` is `none`. `[DS-GLASS-014]`
- Text or controls that sit on top of an edge fade follow DS-GLASS-008, checked over the sharpest and the blurriest patch behind them. Content that scrolls under the fade is allowed to blur; do not rely on a fade to hide content a person must read. `[DS-GLASS-015]`

The mask list is the output of a smooth-blur generator: nine stops from opaque to clear along an eased curve, stretched over the full height of the element. Keep all nine. Two stops show a hard line where the blur ends.

```css
:root {
  --glass-fade-mask: linear-gradient(to top, #000 0%, rgba(0, 0, 0, 0.992) 12.5%, rgba(0, 0, 0, 0.938) 25%, rgba(0, 0, 0, 0.789) 37.5%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.211) 62.5%, rgba(0, 0, 0, 0.063) 75%, rgba(0, 0, 0, 0.008) 87.5%, rgba(0, 0, 0, 0) 100%);
  --glass-fade-height: 120px;
  --glass-fade-r1: calc(var(--glass-blur-strong) / 6);
  --glass-fade-r2: calc(var(--glass-blur-strong) / 3);
  --glass-fade-r3: calc(var(--glass-blur-strong) / 2);
  --glass-fade-r4: calc(var(--glass-blur-strong) * 0.75);
}

/* One layer. For a top edge, use `to bottom` in the mask and `top: 0` here. */
.edge-fade {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: var(--glass-fade-height);
  pointer-events: none;
  background: linear-gradient(to top, var(--bg-background), transparent);
}
@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .edge-fade {
    background: none;
    -webkit-backdrop-filter: blur(var(--glass-blur-strong));
    backdrop-filter: blur(var(--glass-blur-strong));
    -webkit-mask-image: var(--glass-fade-mask);
    mask-image: var(--glass-fade-mask);
  }
}
@media (prefers-reduced-transparency: reduce) {
  .edge-fade {
    background: linear-gradient(to top, var(--bg-background), transparent);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    -webkit-mask-image: none;
    mask-image: none;
  }
}
```

A layered fade is a wrapper with the same fallback gradient and four child layers. Each layer has the same mask and its own height and radius:

```css
.edge-fade-stack { position: absolute; inset-inline: 0; bottom: 0; height: var(--glass-fade-height); pointer-events: none;
  background: linear-gradient(to top, var(--bg-background), transparent); }
.edge-fade-stack > span { position: absolute; inset-inline: 0; bottom: 0; }
@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .edge-fade-stack { background: none; }
  .edge-fade-stack > span { -webkit-mask-image: var(--glass-fade-mask); mask-image: var(--glass-fade-mask); }
  .edge-fade-stack > span:nth-child(1) { height: 100%; -webkit-backdrop-filter: blur(var(--glass-fade-r1)); backdrop-filter: blur(var(--glass-fade-r1)); }
  .edge-fade-stack > span:nth-child(2) { height: 75%; -webkit-backdrop-filter: blur(var(--glass-fade-r2)); backdrop-filter: blur(var(--glass-fade-r2)); }
  .edge-fade-stack > span:nth-child(3) { height: 50%; -webkit-backdrop-filter: blur(var(--glass-fade-r3)); backdrop-filter: blur(var(--glass-fade-r3)); }
  .edge-fade-stack > span:nth-child(4) { height: 25%; -webkit-backdrop-filter: blur(var(--glass-fade-r4)); backdrop-filter: blur(var(--glass-fade-r4)); }
}
@media (prefers-reduced-transparency: reduce) {
  .edge-fade-stack { background: linear-gradient(to top, var(--bg-background), transparent); }
  .edge-fade-stack > span { -webkit-backdrop-filter: none; backdrop-filter: none; -webkit-mask-image: none; mask-image: none; }
}
```

**What was checked.** In Chromium 153, a hard step edge behind one 24 layer stays about 60px wide for the first 80px, then thins out. Behind the 4-layer stack it is about 58px at the edge and narrows steadily to about 16px at 120px, which is a real progressive blur. Two stacked 8px layers gave an edge 28px wide; one 8px layer gave 20px, and the square-root rule predicts 29. A mask or an `opacity` of 0.99 on the parent removed the blur completely. Frame cost was **not** measured: headless Chromium here is capped at 60 fps and showed no difference. Safari and Firefox were not tested.

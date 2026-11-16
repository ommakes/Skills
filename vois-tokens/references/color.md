# Color `[DS-COLOR]`

## Rules

- **Never hardcode hex values.** Use CSS tokens. `[DS-COLOR-001]`
- **Never use Tailwind's built-in color palette** (`blue-500`, `red-400`, etc.) if a token exists for it. The token is always preferred. `[DS-COLOR-002]` (Tailwind-specific — StyleX has no built-in palette to reach for; the equivalent discipline is `[DS-STYLEX-002]`, never a literal color in `stylex.create()` where a token exists.)
- **Color cannot be the only signal.** Error states, success states, warnings — always pair color with an icon, label, or text. Never rely on color alone. `[DS-COLOR-003]`
- **60/30/10 distribution:** roughly 60% neutral, 30% complementary/secondary, 10% accent/brand. This prevents visual stress and keeps hierarchy clear. `[DS-COLOR-004]`
- Decorative icons that add no information get `aria-hidden="true"`. Don't let screen readers announce them. `[DS-COLOR-005]`

## Status Colors

Status color comes from four semantic roles, and each role has a token in the Base layer and in every System layer, named after the Figma variables (`references/figma-variables.md`). `[DS-COLOR-008]`

| Role | Use it for | Tokens |
|---|---|---|
| `info` | Neutral context or a tip | `--base-info`, `--bg-info`, `--text-info`, `--border-info`, `--icon-info` |
| `positive` | Success, completion, a healthy state | `--base-positive`, `--bg-positive`, `--text-positive`, `--border-positive`, `--icon-positive` |
| `negative` | An error, a failure, a blocked state, or a destructive action | `--base-negative`, `--bg-negative`, `--text-negative`, `--border-negative`, `--icon-negative` |
| `notice` | Caution, or something that needs attention before it becomes an error | `--base-notice`, `--bg-notice`, `--text-notice`, `--border-notice`, `--icon-notice` |

- **Pick by meaning, not hue.** `negative` covers errors, failures, and destructive actions. There is no separate `destructive` token: a destructive Button reads `--base-negative` (or the `--solid-negative-*` and `--soft-negative-*` action tokens for its states), and `destructive` is only the shadcn variant name. Older kits used `--color-destructive`, `--color-success`, `--color-warning` and `--color-{role}-surface`. Those become the tokens in the table: `warning` is `notice`, a surface is `--bg-{role}`. `[DS-COLOR-009]`
- **Use them everywhere status shows up.** Alert, Badge, Toast, inline validation and banners all read these tokens. If a component only ships stock variants (default, secondary, outline, destructive), add the role variants instead of settling for the stock ones.
- **Surface and border are for containers.** Use `--bg-{role}` and `--border-{role}` for an Alert or banner, with `--text-{role}` and `--icon-{role}` inside it. Use `--base-{role}` for a filled chip or a solid indicator.
- **Values come from Figma.** Each token has a light and a dark value (`[DS-COLOR-006]`). Check the pairs against the contrast minimums (`[DS-A11Y-004]`): `--text-{role}` on `--bg-{role}` is normal text at 4.5:1, and `--base-{role}` and `--border-{role}` against the page are UI components at 3:1.
- **Color is still never the only signal.** Every status carries an icon or a text label too. `[DS-COLOR-003]`
- **Missing a role?** Propose it in Figma for every layer. Don't borrow a palette color or invent a one-off token.

```css
:root {
  --bg-notice: var(--yellow-2);
  --text-notice: var(--yellow-11);
  --border-notice: var(--yellow-9);
}
.dark {
  --bg-notice: var(--yellow-a3);
  --text-notice: var(--yellow-7);
  --border-notice: var(--yellow-5);
}
```

## OKLCH

Use OKLCH for color definitions, regardless of styling engine — Tailwind v4 uses it natively for its own palette, and it's the right choice for hand-defined tokens either way.

```css
/* Tailwind v4: the token file, in :root (see [DS-TOKEN-003]). Illustrative values. */
:root {
  --blue-9: oklch(0.637 0.237 259.4);
  --white: oklch(1 0 0);
}
```

```ts
// StyleX — defineVars
export const colors = stylex.defineVars({
  blue9: "oklch(0.637 0.237 259.4)",
  white: "oklch(1 0 0)",
});
```

OKLCH produces perceptually uniform colors. Lighter values are actually lighter, not just numerically higher. This matters for building accessible color scales that hold up across light and dark mode.

## Gradients `[DS-COLOR-010]` `[DS-COLOR-011]`

### Interpolation space `[DS-COLOR-010]`

State the space in the gradient. Don't depend on the default, because the default follows the syntax of the colors: sRGB for hex, `rgb()`, `hsl()` and named colors, Oklab for `oklch()`, `lab()` and `color()`. Measured in Chromium 153 on one blue to yellow gradient, the midpoint of the same gradient differs by syntax:

| Colors written as | Default space | Chroma at 50% |
|---|---|---|
| `#0044ff` and `#ffd400` | sRGB | 0.024 (a dull gray-green) |
| `oklch()` values close to those colors | Oklab | 0.046 |
| Same colors, `in oklch` | OKLCH | 0.143 (a bright teal) |

```css
/* Prefer */
background: linear-gradient(to right in oklch, var(--a), var(--b));
/* Avoid: the result depends on how --a and --b are written */
background: linear-gradient(to right, var(--a), var(--b));
```

In Tailwind v4 the gradient utilities use Oklab by default. For OKLCH add the modifier: `bg-linear-to-r/oklch from-... to-...`.

**Hue path.** OKLCH keeps chroma through the middle by turning the hue, and it takes the shorter way round the wheel. Blue to yellow passes through green and teal. Red to blue passes through magenta. If that path is wrong for the brand, use `in oklch longer hue`, use `in oklab` (no hue turn, a calmer middle), or add a stop that sets the path.

**Gamut.** Two in-gamut colors can have a midpoint that sRGB cannot show. In a test of four saturated pairs, three had a midpoint outside sRGB. Chromium clips each channel, which pins one channel at 0 and shifts the hue and lightness. Keep chroma at the end stops lower, or add a stop with lower chroma, when the 25%, 50% or 75% point is out of gamut. Don't rely on the clip.

**Text on a gradient.** Check contrast at the lightest and darkest point under the text (`[DS-A11Y-004]`). The interpolation space changes the lightness of the middle: in the test above the midpoint is lighter in OKLCH (L 0.73) than in sRGB (L 0.63).

**Exceptions.** A gradient that is meant to look like RGB mixing, and a brand gradient that must keep its current look.

**Checks.** The space is written in the gradient. The middle has no unintended gray patch. The 25%, 50% and 75% points are inside the gamut. Contrast passes under the text.

### Eased stops `[DS-COLOR-011]`

For a simple skew, use a color hint. It moves the midpoint and needs no extra stops: `linear-gradient(to right in oklch, var(--a), 30%, var(--b))`.

For a smoother curve, sample an easing curve at even steps. Each stop sits at its even position, and its color is the mix at the eased amount. Smoothstep (`3t² - 2t³`) at 5 steps gives 0, 15.6, 50, 84.4 and 100%:

```css
background: linear-gradient(
  to right in oklch,
  var(--a) 0%,
  color-mix(in oklch, var(--b) 15.6%, var(--a)) 25%,
  color-mix(in oklch, var(--b) 50%, var(--a)) 50%,
  color-mix(in oklch, var(--b) 84.4%, var(--a)) 75%,
  var(--b) 100%
);
```

Stops are straight lines between points, so the count sets how close the gradient is to the curve. Against smoothstep, the largest error is 9.6% of the color range with 3 stops, 3.5% with 5, 1.7% with 7 and 1.0% with 9. Use 5 to 7. Past 9 there is almost no gain. Too few stops show a crease at each stop. Keep `in oklch` on the gradient so the mixes and the steps agree. Don't add stops by eye.

## Dark Mode with light-dark()

Under Tailwind, dark mode is implemented via `@custom-variant dark (&:is(.dark *))`. Under StyleX, use `stylex.createTheme()` to override the color `defineVars()` group instead (see `[DS-STYLEX-003]` in `references/stylex.md`). Every color token must have a dark mode value either way. `[DS-COLOR-006]`

Use the `light-dark()` CSS function for cleaner inline color switching:

```css
/* Requires color-scheme to be set on a parent */
html {
  color-scheme: light dark;
}

/* In the token file, a token can switch its own value */
:root {
  --bg-subtle: light-dark(var(--warm-gray-1), var(--warm-gray-11));
}
```

This is cleaner than repeating the token under `.dark` for a simple two-value swap. Component code still reads the token (`var(--bg-subtle)`), never the palette steps (`[DS-TOKEN-001]`). For complex component variants, stick with the dark: modifier.

Before shipping any component, verify both light and dark mode manually. `[DS-COLOR-007]`

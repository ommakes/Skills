# Color `[DS-COLOR]`

## Rules

- **Never hardcode hex values.** Use CSS tokens. `[DS-COLOR-001]`
- **Never use Tailwind's built-in color palette** (`blue-500`, `red-400`, etc.) if a token exists for it. The token is always preferred. `[DS-COLOR-002]` (Tailwind-specific — StyleX has no built-in palette to reach for; the equivalent discipline is `[DS-STYLEX-002]`, never a literal color in `stylex.create()` where a token exists.)
- **Color cannot be the only signal.** Error states, success states, warnings — always pair color with an icon, label, or text. Never rely on color alone. `[DS-COLOR-003]`
- **60/30/10 distribution:** roughly 60% neutral, 30% complementary/secondary, 10% accent/brand. This prevents visual stress and keeps hierarchy clear. `[DS-COLOR-004]`
- Decorative icons that add no information get `aria-hidden="true"`. Don't let screen readers announce them. `[DS-COLOR-005]`

## OKLCH

Use OKLCH for color definitions, regardless of styling engine — Tailwind v4 uses it natively for its own palette, and it's the right choice for hand-defined tokens either way.

```css
/* Tailwind v4 — @theme */
@theme {
  --color-primary: oklch(0.637 0.237 259.4);
  --color-primary-foreground: oklch(1 0 0);
}
```

```ts
// StyleX — defineVars
export const colors = stylex.defineVars({
  primary: "oklch(0.637 0.237 259.4)",
  primaryForeground: "oklch(1 0 0)",
});
```

OKLCH produces perceptually uniform colors. Lighter values are actually lighter, not just numerically higher. This matters for building accessible color scales that hold up across light and dark mode.

## Dark Mode with light-dark()

Under Tailwind, dark mode is implemented via `@custom-variant dark (&:is(.dark *))`. Under StyleX, use `stylex.createTheme()` to override the color `defineVars()` group instead (see `[DS-STYLEX-003]` in `references/stylex.md`). Every color token must have a dark mode value either way. `[DS-COLOR-006]`

Use the `light-dark()` CSS function for cleaner inline color switching:

```css
/* Requires color-scheme to be set on a parent */
html {
  color-scheme: light dark;
}

/* Then use light-dark() anywhere */
.element {
  color: light-dark(oklch(0.145 0 0), oklch(0.985 0 0));
  background: light-dark(var(--color-surface), var(--color-surface-dark));
}
```

This is cleaner than duplicating rules under a `.dark` selector for simple two-value swaps. For complex component variants, stick with the dark: modifier.

Before shipping any component, verify both light and dark mode manually. `[DS-COLOR-007]`

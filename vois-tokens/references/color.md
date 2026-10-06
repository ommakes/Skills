# Color `[DS-COLOR]`

## Rules

- **Never hardcode hex values.** Use CSS tokens. `[DS-COLOR-001]`
- **Never use Tailwind's built-in color palette** (`blue-500`, `red-400`, etc.) if a token exists for it. The token is always preferred. `[DS-COLOR-002]` (Tailwind-specific — StyleX has no built-in palette to reach for; the equivalent discipline is `[DS-STYLEX-002]`, never a literal color in `stylex.create()` where a token exists.)
- **Color cannot be the only signal.** Error states, success states, warnings — always pair color with an icon, label, or text. Never rely on color alone. `[DS-COLOR-003]`
- **60/30/10 distribution:** roughly 60% neutral, 30% complementary/secondary, 10% accent/brand. This prevents visual stress and keeps hierarchy clear. `[DS-COLOR-004]`
- Decorative icons that add no information get `aria-hidden="true"`. Don't let screen readers announce them. `[DS-COLOR-005]`

## Status Colors

Status color comes from four semantic roles, each with four tokens. `[DS-COLOR-008]`

| Role | Use it for | Tokens |
|---|---|---|
| `info` | Neutral context or a tip | `--color-info`, `--color-info-foreground`, `--color-info-surface`, `--color-info-border` |
| `positive` | Success, completion, a healthy state | `--color-positive`, `--color-positive-foreground`, `--color-positive-surface`, `--color-positive-border` |
| `negative` | An error, a failure, a blocked state, or a destructive action | `--color-negative`, `--color-negative-foreground`, `--color-negative-surface`, `--color-negative-border` |
| `warning` | Caution, or something that needs attention before it becomes an error | `--color-warning`, `--color-warning-foreground`, `--color-warning-surface`, `--color-warning-border` |

- **Pick by meaning, not hue.** `negative` covers errors, failures, and destructive actions. There is no separate `destructive` token: a destructive Button reads `--color-negative`, and `destructive` is only the shadcn variant name. Older kits used `--color-destructive` and `--color-success`. Those become `negative` and `positive`. `[DS-COLOR-009]`
- **Use them everywhere status shows up.** Alert, Badge, Toast, inline validation and banners all read these tokens. If a component only ships stock variants (default, secondary, outline, destructive), add the role variants instead of settling for the stock ones.
- **Surface and border are for containers.** Use `-surface` and `-border` for an Alert or banner. Use the base and `-foreground` pair for a Badge or a filled chip.
- **Values are per workspace.** This skill fixes the names, not the OKLCH values. Each workspace sets a light and a dark value for every token (`[DS-COLOR-006]`) and checks the pairs against the contrast minimums (`[DS-A11Y-004]`): `-foreground` on `-surface` is normal text at 4.5:1, and the base color and `-border` against the page are UI components at 3:1.
- **Color is still never the only signal.** Every status carries an icon or a text label too. `[DS-COLOR-003]`
- **Missing a role?** Propose the four tokens. Don't borrow a palette color or invent a one-off token.

```css
@theme {
  --color-warning: oklch(...);            /* values come from the workspace */
  --color-warning-foreground: oklch(...);
  --color-warning-surface: oklch(...);
  --color-warning-border: oklch(...);
}
```

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

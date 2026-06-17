# Color `[DS-COLOR]`

## Rules

- **Never hardcode hex values.** Use CSS tokens. `[DS-COLOR-001]`
- **Never use Tailwind's built-in color palette** (`blue-500`, `red-400`, etc.) if a token exists for it. The token is always preferred. `[DS-COLOR-002]`
- **Color cannot be the only signal.** Error states, success states, warnings — always pair color with an icon, label, or text. Never rely on color alone. `[DS-COLOR-003]`
- **60/30/10 distribution:** roughly 60% neutral, 30% complementary/secondary, 10% accent/brand. This prevents visual stress and keeps hierarchy clear. `[DS-COLOR-004]`
  - **When in doubt:** measure by rendered surface area (px² of background/fill), not element count. A single full-width accent banner can blow the 10% budget even though it's "one element." Eyeball the viewport as painted regions, not as a list of components.
- Decorative icons that add no information get `aria-hidden="true"`. Don't let screen readers announce them. `[DS-COLOR-005]`

## OKLCH

Tailwind v4 uses OKLCH for color definitions. Use it.

```css
@theme {
  --color-primary: oklch(0.637 0.237 259.4);
  --color-primary-foreground: oklch(1 0 0);
}
```

OKLCH produces perceptually uniform colors. Lighter values are actually lighter, not just numerically higher. This matters for building accessible color scales that hold up across light and dark mode.

## Dark Mode with light-dark()

Dark mode is implemented via `@custom-variant dark (&:is(.dark *))`. Every color token must have a dark mode value. `[DS-COLOR-006]`

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

## Opacity Steps `[DS-COLOR-008]`

Disabled and secondary states are expressed as opacity steps on the base color token, not as separate hardcoded colors:

| Step | Opacity | Use |
|------|---------|-----|
| `100` | 100% | Default, fully interactive |
| `60` | 60% | Secondary emphasis (placeholder text, inactive tab) |
| `38` | 38% | Disabled (matches WCAG-adjacent disabled-state convention) |

```css
.button[disabled] { opacity: 0.38; }
```

Never invent a one-off disabled color — apply an opacity step to the existing token instead.

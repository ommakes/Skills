# Spacing `[DS-SPACING]`

All spacing must be divisible by **4 or 8**. The only exception is `--grid-margin` and `--grid-gutter` between their end values, see `grid.md` (`DS-GRID-004`). `[DS-SPACING-001]`

**Allowed values:** 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 80, 88, 120, 128px. This is the scale of `--space-{px}` tokens, from the Figma Spacing variables.

**Semantic spacing.** Prefer the semantic token when one names the job. They alias the scale, so the value stays on it:

| Group | Tokens |
|---|---|
| Padding | `--space-padding-2x-small` (4) to `--space-padding-2x-large` (40) |
| Vertical | `--space-v-between-text` (8), `--space-v-between-inputs` (12), `--space-v-image-bottom` (24), `--space-v-display-text-bottom` (16), `--space-v-text-to-component` (20), `--space-v-content-to-button` (40), `--space-v-between-sections` (32), `--space-v-component-default` (16), `--space-v-between-items` (4), `--space-v-vertical-skinny` (4), `--space-v-vertical-regular` (8), `--space-v-vertical-relaxed` (12), `--space-v-vertical-baggy` (24) |
| Horizontal | `--space-h-between-cards` (12), `--space-h-between-actions` (16), `--space-h-between-inputs` (16), `--space-h-between-chips` (8), `--space-h-between-items` (12), `--space-h-component-default` (12), `--space-h-mobile-gutters` (24), `--space-h-tablet-gutters` (40), `--space-h-desktop-gutters` (64), `--space-h-horizontal-skinny` (4), `--space-h-horizontal-regular` (8), `--space-h-horizontal-relaxed` (12), `--space-h-horizontal-baggy` (24) |

Vertical and horizontal use different values for the same job (`--space-v-between-inputs` is 12, `--space-h-between-inputs` is 16), so pick the axis. Values in brackets are the current Figma values; read the token, not the number.

```
YES  p-4 (16px)   gap-6 (24px)   mt-8 (32px)
NO   p-[11px]     gap-[14px]     mt-[25px]
```

Use `gap` for layout spacing between elements. Use padding for internal component spacing. Avoid margin for layout — it's harder to reason about and doesn't compose well with flex/grid. `[DS-SPACING-002]`

**Tailwind v4 note:** Dynamic spacing utilities accept any value without arbitrary syntax. This makes it easy to accidentally use off-grid values. Don't. Stay on the scale. `[DS-SPACING-003]`

**StyleX note:** `stylex.create()` spacing properties (`padding`, `gap`, `marginTop`, etc.) are plain numbers or strings with no arbitrary-value guard at all — nothing stops you from writing `padding: 11`. The same discipline applies, just with less of a syntactic nudge to break it: reference a spacing token from `defineVars()` rather than a bare number.

Marketing surfaces may use section gaps above 128px. See `marketing-type-and-spacing.md` (`[DS-MKT-008]`).

Verify spacing holds at every responsive breakpoint before considering a component done. `[DS-SPACING-004]`

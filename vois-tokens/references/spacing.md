# Spacing `[DS-SPACING]`

All spacing must be divisible by **4 or 8**. No exceptions. `[DS-SPACING-001]`

**Allowed values:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px

```
YES  p-4 (16px)   gap-6 (24px)   mt-8 (32px)
NO   p-[11px]     gap-[14px]     mt-[25px]
```

Use `gap` for layout spacing between elements. Use padding for internal component spacing. Avoid margin for layout — it's harder to reason about and doesn't compose well with flex/grid. `[DS-SPACING-002]`

**Tailwind v4 note:** Dynamic spacing utilities accept any value without arbitrary syntax. This makes it easy to accidentally use off-grid values. Don't. Stay on the scale. `[DS-SPACING-003]`

**StyleX note:** `stylex.create()` spacing properties (`padding`, `gap`, `marginTop`, etc.) are plain numbers or strings with no arbitrary-value guard at all — nothing stops you from writing `padding: 11`. The same discipline applies, just with less of a syntactic nudge to break it: reference a spacing token from `defineVars()` rather than a bare number.

Verify spacing holds at every responsive breakpoint before considering a component done. `[DS-SPACING-004]`

# Spacing `[DS-SPACING]`

All spacing must be divisible by **4 or 8**. No exceptions. `[DS-SPACING-001]`

**Allowed values:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px

```
YES  p-4 (16px)   gap-6 (24px)   mt-8 (32px)
NO   p-[11px]     gap-[14px]     mt-[25px]
```

Use `gap` for layout spacing between elements. Use padding for internal component spacing. Avoid margin for layout — it's harder to reason about and doesn't compose well with flex/grid. `[DS-SPACING-002]`

**Tailwind v4 note:** Dynamic spacing utilities accept any value without arbitrary syntax. This makes it easy to accidentally use off-grid values. Don't. Stay on the scale. `[DS-SPACING-003]`

Verify spacing holds at every responsive breakpoint before considering a component done. `[DS-SPACING-004]`

## Token Naming Convention `[DS-SPACING-005]`

Spacing tokens follow `--space-*` in CSS and the Tailwind `gap-*`/`p-*`/`m-*` scale in JSX. Don't invent ad-hoc names — the scale step number matches the pixel value divided by 4 (e.g. `gap-6` = 24px = step 6).

## When in Doubt `[DS-SPACING-006]`

If two adjacent values on the allowed scale both look visually plausible for a given gap, default to the **smaller** one. Only move up a step if the smaller value causes visible crowding against an adjacent element (text touching an icon, cards feeling cramped). Don't size up "to be safe" — that's how spacing drifts inconsistently across a codebase.

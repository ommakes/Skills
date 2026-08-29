# Tailwind v4 `[DS-TAILWIND]`

Tailwind-specific implementation rules. If this project uses StyleX instead, see `references/stylex.md` — the value-level rules elsewhere in this skill (spacing, color, animation, accessibility) apply to both engines identically.

## Key Changes from v3

Replace `@layer base` with `@theme`: `[DS-TAILWIND-001]`

```css
/* v3 — don't do this */
@layer base {
  :root { --background: 0 0% 100%; }
}

/* v4 — do this */
@theme {
  --color-background: oklch(1 0 0);
}
```

Use `@import "tailwindcss"` instead of `@tailwind base / components / utilities`. `[DS-TAILWIND-002]`

## Rules

- Container queries are built in. No plugins needed. Use `@container` and `@min-` / `@max-` variants for component-level responsiveness.
- The `hover:` modifier in v4 only applies when the input device supports hover. You don't need to manually guard hover effects — but verify on touch devices.
- Arbitrary values (`w-[237px]`, `mt-[13px]`) are a smell. If you need an arbitrary value, either it belongs on the spacing scale or it's a missing token. Round it or flag it. `[DS-TAILWIND-003]`
- No `!important` except for utility overrides you explicitly own and document. `[DS-TAILWIND-004]`
- Never `transition: all`. List properties explicitly: `transition: background-color 150ms ease-out, transform 150ms ease-out`. `[DS-TAILWIND-005]`

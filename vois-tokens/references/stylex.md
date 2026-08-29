# StyleX `[DS-STYLEX]`

[StyleX](https://stylexjs.com/) is a compile-time CSS-in-JS system: styles are authored as typed JS objects and a Babel/SWC/bundler plugin extracts them into static, collision-free atomic CSS at build time. It's an alternative implementation engine to Tailwind v4 — a workspace uses one or the other, not both.

Everything else in this skill — the spacing scale, color tokens, typography, animation timing/easing, accessibility, layout units, and the anti-slop rules — applies identically regardless of styling engine. This file only covers the implementation-layer rules that differ, the same role `references/tailwind-v4.md` plays for Tailwind.

**Determine the engine before applying implementation rules.** Check `package.json` for `@stylexjs/stylex` vs `tailwindcss`, or look for existing `stylex.create()`/`.stylex.ts` usage in the codebase. Ask if genuinely ambiguous — don't guess and mix engines in one codebase.

---

## Setup `[DS-STYLEX-SETUP]`

StyleX styles do nothing at runtime without the compiler. Confirm the plugin is wired into the build before writing any StyleX code in a project: `[DS-STYLEX-001]`

```js
// babel.config.js (or the equivalent bundler/SWC plugin)
module.exports = {
  plugins: [
    [
      "@stylexjs/babel-plugin",
      {
        dev: process.env.NODE_ENV === "development",
        genConditionalClasses: true,
        unstable_moduleResolution: { type: "commonJS", rootDir: __dirname },
      },
    ],
  ],
};
```

Unlike Tailwind (near-zero config), this is a real setup step — expect it to take longer than wiring up Tailwind on a fresh project. Treat a missing plugin as a blocker before authoring styles, not something to notice after nothing renders.

## Tokens `[DS-STYLEX-TOKENS]`

Define tokens with `stylex.defineVars()` and reference them from `stylex.create()`. Never use a literal value where a defined token exists — this is the StyleX-side version of `[DS-CSS-001]`/`[DS-COLOR-001]`. `[DS-STYLEX-002]`

```ts
// tokens.stylex.ts
import * as stylex from "@stylexjs/stylex";

export const colors = stylex.defineVars({
  primary: "oklch(0.637 0.237 259.4)",
  primaryForeground: "oklch(1 0 0)",
  background: "oklch(1 0 0)",
});

export const space = stylex.defineVars({
  componentSm: "0.5rem",
  componentMd: "1rem",
});
```

```ts
// button.stylex.ts
import * as stylex from "@stylexjs/stylex";
import { colors, space } from "./tokens.stylex";

const styles = stylex.create({
  base: {
    backgroundColor: colors.primary, // good — references a token
    padding: space.componentMd,
  },
  bad: {
    backgroundColor: "oklch(0.637 0.237 259.4)", // bad — literal, same violation as DS-COLOR-001
  },
});
```

`defineVars()` generates deterministic CSS custom properties from the variable names and import path — this is the direct equivalent of Tailwind's `@theme` block in `references/css-architecture.md`.

## Theming `[DS-STYLEX-THEME]`

Use `stylex.createTheme()` to override a `defineVars()` group for theme variants (dark mode, brand variants). Don't hand-roll a second, parallel token set alongside it. `[DS-STYLEX-003]`

```ts
import * as stylex from "@stylexjs/stylex";
import { colors } from "./tokens.stylex";

export const darkTheme = stylex.createTheme(colors, {
  primary: "oklch(0.75 0.18 259.4)",
  primaryForeground: "oklch(0.145 0 0)",
  background: "oklch(0.145 0 0)",
});
```

Apply by spreading the theme's className onto a root element (`<div {...stylex.props(darkTheme)}>`) — every token consumer under that root repaints. This is StyleX's equivalent of the `light-dark()`/`.dark` mechanism in `references/color.md`; use whichever the app already standardizes on for the light/dark switch, not both at once.

## Variants — the StyleX replacement for cva `[DS-STYLEX-VARIANTS]`

Compose variant styling from multiple `stylex.create()` keys merged in `stylex.props()`, with the most specific override passed last. This is StyleX's equivalent of `[DS-COMPONENT-002]`'s variant-authorship requirement — a typed, centralized surface, not ad-hoc conditionals. `[DS-STYLEX-004]`

```tsx
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  base: { borderRadius: 6, fontWeight: 500 },
  variantDefault: { backgroundColor: "var(--color-primary)" },
  variantDestructive: { backgroundColor: "var(--color-destructive)" },
  variantOutline: { borderWidth: 1, borderStyle: "solid" },
  sizeDefault: { height: 36, paddingInline: 16 },
  sizeSm: { height: 32, paddingInline: 12 },
});

function Button({ variant = "default", size = "default", ...props }: ButtonProps) {
  return (
    <button
      {...stylex.props(
        styles.base,
        styles[`variant${capitalize(variant)}`],
        styles[`size${capitalize(size)}`],
      )}
      {...props}
    />
  );
}
```

`stylex.props()` merges left-to-right with the last conflicting property always winning, regardless of source order — the same discipline `cva`'s `compoundVariants` ordering enforces, just resolved deterministically by call-site order instead of by class-name specificity.

Components still use a 2-layer architecture — Radix UI (or another unstyled primitive library) for structure/behavior, StyleX for style — same as `[DS-COMPONENT-005]`. Don't collapse the two.

## No inline style objects `[DS-STYLEX-INLINE]`

Don't use an inline `style={{}}` prop where a `stylex.create()` key already covers the value. `[DS-STYLEX-005]`

```tsx
// bad — bypasses static extraction and the collision-free guarantee
<div style={{ padding: 16, color: "red" }} />

// good
<div {...stylex.props(styles.alert)} />
```

An inline `style` prop has higher specificity than any StyleX-generated class, so a stray one silently overrides intended variant styling with no warning. Reach for it only for a genuinely dynamic runtime value StyleX can't express statically (a measured pixel offset, a user-picked color) — keep the rest of that element's styling in `stylex.create()`.

## Shared constants and media queries `[DS-STYLEX-CONSTS]`

Use `stylex.defineConsts()` for breakpoints and other compile-time constants instead of repeating literal media-query strings across files. `[DS-STYLEX-006]`

```ts
// breakpoints.stylex.ts
import * as stylex from "@stylexjs/stylex";

export const breakpoints = stylex.defineConsts({
  md: "@media (min-width: 48em)",
  lg: "@media (min-width: 64em)",
});
```

```ts
const styles = stylex.create({
  container: {
    padding: 16,
    [breakpoints.md]: { padding: 24 },
  },
});
```

`defineConsts()` values are inlined at compile time rather than becoming CSS custom properties — the right tool for values that never need to change at runtime (breakpoints, easing-curve strings). Use `defineVars()` instead for anything a theme might override. Author breakpoint values in `em`, not `px` — same rule as `[DS-CSS-007]`.

## Rules filed under Tailwind that still apply

`[DS-TAILWIND-004]` (no `!important`) and `[DS-TAILWIND-005]` (never `transition: all` — list properties explicitly, e.g. `transitionProperty: "background-color, transform"`) are filed under the Tailwind reference for historical reasons, but the same discipline applies under StyleX. `scripts/registry.mjs`'s detector for both already checks StyleX's object-literal syntax alongside Tailwind's, not just Tailwind's — see `references/hooks.md`.

## What doesn't change under StyleX

Every value-level rule elsewhere in this skill — the 4/8 spacing scale, color contrast and the 60/30/10 distribution, animation timing/easing, accessibility minimums, `svh`/`dvh`/`lvh` viewport units — applies exactly as written. Nothing here relaxes or replaces the Pre-Submit Checklist; it only supplies the StyleX-syntax version of the implementation rules `tailwind-v4.md` supplies for Tailwind.

# CSS Architecture `[DS-CSS]`

```css
/* Import */
@import "tailwindcss";

/* Token definitions */
@theme {
  --color-primary: oklch(...);
  --color-background: oklch(...);
  --radius-md: 0.5rem;
  --space-component-sm: 0.5rem;
}

/* Global base */
html {
  color-scheme: light dark;       /* enables light-dark() function */
  scrollbar-gutter: stable;       /* prevents layout shift on modal open */
}

/* Dark mode variant */
@custom-variant dark (&:is(.dark *));

/* Component overrides */
@layer components {
  /* Only things that genuinely can't be done with utilities */
}
```

No inline styles for values that have token equivalents. `[DS-CSS-001]`

## Selectors and Specificity `[DS-CSS-SELECTORS]`

**Don't fight specificity — avoid creating it.**

- Never use `#id` selectors for styling. IDs have high specificity and make overrides painful. `[DS-CSS-002]`
- Keep selectors shallow. If your selector has more than 2 levels of nesting, you're coupling styles to DOM structure. Add a class instead. `[DS-CSS-003]`
- Use `:is()` to group selectors without multiplying specificity. `[DS-CSS-004]`

```css
/* bad — specificity stacks up */
.card .header h2,
.card .header h3,
.card .header h4 {
  color: var(--color-heading);
}

/* good — :is() takes the specificity of its most specific argument, but written once */
.card .header :is(h2, h3, h4) {
  color: var(--color-heading);
}
```

- Use `:where()` when you want zero-specificity base styles that are easy to override. `[DS-CSS-005]`

```css
/* zero specificity — anything can override this */
:where(h1, h2, h3, h4, h5, h6) {
  line-height: 1.2;
}
```

**Separate layout from visual concerns.** `[DS-CSS-006]`

Don't mix sizing/positioning properties with visual/brand properties in the same class. Layout classes control where things go. Visual classes control how things look.

```css
/* bad — layout and visual mixed */
.alert {
  padding: 1rem;
  margin-bottom: 1rem;
  background: var(--color-warning-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-warning-border);
}

/* good — keep them together when using utility classes (Tailwind handles this),
   but in hand-authored CSS, group by concern */
```

This matters more in hand-authored CSS than in Tailwind, where utilities are already atomic. The principle still applies: don't write a `.card` class that controls both margin-bottom (layout) and background-color (visual) if the layout might vary by context.

## Media Queries `[DS-CSS-MQ]`

Use `em` for breakpoints, not `px`. Breakpoints in `em` respect the user's browser font size preference and scale correctly when users zoom. `[DS-CSS-007]`

```css
/* bad */
@media (min-width: 768px) { ... }

/* good */
@media (min-width: 48em) { ... } /* 48em × 16px = 768px */
```

Common breakpoint values in `em`:

| Name | em | Equivalent px |
|------|----|---------------|
| sm | 40em | 640px |
| md | 48em | 768px |
| lg | 64em | 1024px |
| xl | 80em | 1280px |

Note: Tailwind's built-in breakpoints use `px` internally, so this rule applies primarily to any hand-authored `@media` queries outside Tailwind utilities.

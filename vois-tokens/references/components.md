# Components `[DS-COMPONENT]`

## Rules

- **Check the manifest first.** If `<Button>`, `<AlertBanner>`, or `<DataTable>` exists, use it. Don't rebuild it. `[DS-COMPONENT-001]`
- Use a typed, centralized variant-authorship mechanism for all variant styling — **Class Variance Authority (cva)** under Tailwind, composed `stylex.create()` keys under StyleX. No ad-hoc className/style ternaries. `[DS-COMPONENT-002]`
- Use `data-slot` attributes for styling component internals — don't reach into component children with arbitrary CSS selectors. `[DS-COMPONENT-003]`
- **New-York style** is the default for shadcn. The "default" style is deprecated. `[DS-COMPONENT-004]`
- Components use a 2-layer architecture: Radix UI (or another unstyled primitive library) for structure/behavior, the project's styling engine — Tailwind or StyleX — for style. Don't collapse these. `[DS-COMPONENT-005]`

## Component Variants

When using a component with variants, use the most semantically appropriate variant. Don't default to `default` when `destructive`, `ghost`, or `outline` is more correct. `[DS-COMPONENT-006]`

When building a new component (Tailwind + cva shown below — under StyleX, see the variant-composition pattern in `references/stylex.md`):

```tsx
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## Modals and Dialogs

Modals require specific patterns. Don't skip these.

**Trap focus using `inert`.** When a modal opens, add `inert` to all content outside the modal. This blocks keyboard and screen reader access to background content without manual focus trapping: `[DS-MODAL-001]`

```tsx
// When modal opens
document.getElementById('app-root').setAttribute('inert', '')

// When modal closes
document.getElementById('app-root').removeAttribute('inert')
```

Radix UI Dialog handles this automatically. If you're not using Radix, implement it manually.

**Prevent scroll bleed.** Add `overscroll-behavior: contain` to the modal's scrollable container so scrolling inside doesn't scroll the page behind it: `[DS-MODAL-002]`

```css
.modal-content {
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

**Prevent layout shift.** When a modal opens and the page scrollbar disappears, the layout jumps. Fix it with `scrollbar-gutter` on `html`: `[DS-MODAL-003]`

```css
html {
  scrollbar-gutter: stable;
}
```

This reserves space for the scrollbar even when it isn't visible.

## Accordions

Use `interpolate-size: allow-keywords` to animate height from `0` to `auto` without JavaScript measurement:

```css
.accordion-content {
  interpolate-size: allow-keywords;
  height: 0;
  overflow: hidden;
  transition: height 250ms var(--ease-out-quart);
}

.accordion-content[data-open] {
  height: auto;
}
```

This replaces the pattern of measuring scrollHeight in JavaScript and animating to a pixel value.

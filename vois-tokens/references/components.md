# Components `[DS-COMPONENT]`

## Rules

- **Check the manifest first.** If `<Button>`, `<AlertBanner>`, or `<DataTable>` exists, use it. Don't rebuild it. `[DS-COMPONENT-001]`
- Use a typed, centralized variant-authorship mechanism for all variant styling — **Class Variance Authority (cva)** under Tailwind, composed `stylex.create()` keys under StyleX. No ad-hoc className/style ternaries. `[DS-COMPONENT-002]`
- Use `data-slot` attributes for styling component internals — don't reach into component children with arbitrary CSS selectors. `[DS-COMPONENT-003]`
- **New-York style** is the default for shadcn. The "default" style is deprecated. `[DS-COMPONENT-004]`
- Components use a 2-layer architecture: Radix UI (or another unstyled primitive library) for structure/behavior, the project's styling engine — Tailwind or StyleX — for style. Don't collapse these. `[DS-COMPONENT-005]`
- **Control heights come from the size tokens.** Button heights are 28 (`--size-action-medium`), 36 (`--size-action-large`) and 48 (`--size-action-x-large`), and 36 is the default on web, 48 on native. The circular action is 56 (`--size-action-circular`) and no other action or control is 56 (an avatar can be). Input and Select are `--size-field-web` (36) on web and `--size-field-native` (48) on native. `--size-field-compact` (32) is only for an inline field nested in a table or a dense row. A Button next to a field matches the field's height. `[DS-COMPONENT-007]`

## Component Variants

When using a component with variants, use the most semantically appropriate variant. Don't default to `default` when `destructive`, `ghost`, or `outline` is more correct. `[DS-COMPONENT-006]`

When building a new component (Tailwind + cva shown below — under StyleX, see the variant-composition pattern in `references/stylex.md`):

```tsx
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-[var(--radius-buttons-and-controls)] text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-[var(--action-primary-resting)] text-[color:var(--text-on-dark)] hover:bg-[var(--action-primary-hover)]",
        destructive: "bg-[var(--solid-negative-resting)] text-[color:var(--text-on-dark)] hover:bg-[var(--solid-negative-hover)]",
        outline: "border border-[color:var(--border-default)] bg-[var(--action-secondary-resting)] hover:bg-[var(--action-secondary-hover)]",
        ghost: "text-[color:var(--action-ghost-resting)] hover:bg-[var(--action-icon-hover)]",
      },
      size: {
        sm: "h-[var(--size-action-medium)] px-[var(--space-padding-small)]",       // 28
        default: "h-[var(--size-action-large)] px-[var(--space-padding-medium)]",  // 36, the web default
        lg: "h-[var(--size-action-x-large)] px-[var(--space-padding-large)]",      // 48, the native default
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

`text-[color:...]` and `border-[color:...]` carry a type hint on purpose: shadcn's `cn()` runs `tailwind-merge`, which cannot tell `text-[var(--x)]` (a color) from `text-sm` (a size) and can drop one of them.

The full version is the registry's `vois-button` item (`registry/vois/button/button.tsx`): the Figma layout (a label frame with 4px on each side and centered text, `leadingIcon` and `trailingIcon`), the focus ring, hit area, press scale, a `loading` state with `vois-spinner`, and every state. Install it rather than writing a Button.



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

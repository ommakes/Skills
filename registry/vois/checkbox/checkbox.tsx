// Vois Checkbox. Replaces shadcn/ui's components/ui/checkbox.tsx (Radix Checkbox) with the same API,
// plus `variant`.
//
// From the Figma Checkbox set (Selectors page): a 24 box (--size-24, --radii-4) with a 2px
// --control-border inside border (3:1 or more on the page, WCAG 1.4.11). Checked and indeterminate
// fill with --control-on and show the mark in --icon-on-dark. Disabled fills with --control-disabled and the mark turns --icon-state-disabled. Focus
// is a 2px --control-focus ring (the same color as --border-state-focus) 2px outside the box, as in Figma's 32 frame. `variant="aux"` is the
// Figma Aux set (--border-aux, --control-aux, --icon-auxiliary), for a checkbox on a strong color.
// The hit area is at least --hit-area-min without changing the visible size (DS-A11Y-001).
//
// Which state wins: disabled, then checked or indeterminate, then resting. data-* variants are written
// after disabled, so the checked fill is guarded with not-disabled.
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const checkboxVariants = cva(
  [
    "group peer relative inline-flex size-[var(--size-24)] shrink-0 items-center justify-center rounded-[var(--radii-4)] bg-transparent",
    // The 2px border is an inset ring, like Figma's inside stroke, so the mark sits in the full 24 box.
    "after:absolute after:top-1/2 after:left-1/2 after:size-full after:min-h-[var(--hit-area-min)] after:min-w-[var(--hit-area-min)] after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']",
    "transition-[background-color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--control-focus)]",
    "data-[state=checked]:shadow-none data-[state=indeterminate]:shadow-none",
    "disabled:cursor-not-allowed disabled:shadow-none disabled:bg-[color:var(--control-disabled)] disabled:text-[color:var(--icon-state-disabled)]",
  ],
  {
    variants: {
      variant: {
        default: [
          "shadow-[inset_0_0_0_2px_var(--control-border)] text-[color:var(--icon-on-dark)]",
          "data-[state=checked]:not-disabled:bg-[color:var(--control-on)] data-[state=indeterminate]:not-disabled:bg-[color:var(--control-on)]",
        ],
        aux: [
          "shadow-[inset_0_0_0_2px_var(--border-aux)] text-[color:var(--icon-auxiliary)]",
          "data-[state=checked]:not-disabled:bg-[color:var(--control-aux)] data-[state=indeterminate]:not-disabled:bg-[color:var(--control-aux)]",
        ],
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Checkbox({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & VariantProps<typeof checkboxVariants>) {
  return (
    <CheckboxPrimitive.Root data-slot="checkbox" data-variant={variant} className={cn(checkboxVariants({ variant }), className)} {...props}>
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="flex size-full items-center justify-center text-current">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-full group-data-[state=indeterminate]:hidden">
          <path d="M19 7 9.5 16.5 5 12" />
        </svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="hidden size-full group-data-[state=indeterminate]:block">
          <path d="M6 12h12" />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox, checkboxVariants }

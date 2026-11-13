// Vois RadioGroup. Replaces shadcn/ui's components/ui/radio-group.tsx (Radix RadioGroup) with the same
// parts, plus `variant` on the item.
//
// From the Figma Radio set (Selectors page): a 22 circle. Unselected is a 3px --control-border ring
// (3:1 or more on the page, WCAG 1.4.11). Selected is a --control-on disc with a 6px hole, drawn as the
// same ring grown to 8px, so the change is one animated value. `variant="aux"` is the Figma Aux set
// (--control-aux), for a radio on a strong color. Disabled is --control-disabled. Focus is a 2px
// --border-state-focus ring 3px outside the circle, as in Figma's 32 frame. The hit area is at least
// --hit-area-min (DS-A11Y-001).
//
// Use a radio group for one choice among a few options in a form (vois-components
// JOB-BINARY-PREFERENCE), and instead of buttons given the radio role by hand (LOOKALIKE-003). Radix gives
// arrow-key movement and one tab stop for the group.
//
// Which state wins: disabled, then checked, then resting. The disabled rules are disabled: and
// data-[state=checked]:disabled:, which are more specific than the checked ring, so they win.
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn("grid gap-[var(--space-v-between-items)]", className)} {...props} />
}

const radioGroupItemVariants = cva(
  [
    "relative aspect-square size-[22px] shrink-0 rounded-[var(--shape-circle)] bg-transparent",
    "after:absolute after:top-1/2 after:left-1/2 after:size-full after:min-h-[var(--hit-area-min)] after:min-w-[var(--hit-area-min)] after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-[var(--shape-circle)] after:content-['']",
    "transition-[box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
    "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--border-state-focus)]",
    "disabled:cursor-not-allowed disabled:shadow-[inset_0_0_0_3px_var(--control-disabled)] data-[state=checked]:disabled:shadow-[inset_0_0_0_8px_var(--control-disabled)]",
  ],
  {
    variants: {
      variant: {
        default: "shadow-[inset_0_0_0_3px_var(--control-border)] data-[state=checked]:shadow-[inset_0_0_0_8px_var(--control-on)]",
        aux: "shadow-[inset_0_0_0_3px_var(--control-aux)] data-[state=checked]:shadow-[inset_0_0_0_8px_var(--control-aux)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function RadioGroupItem({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> & VariantProps<typeof radioGroupItemVariants>) {
  // No indicator element: the checked state is the ring's width on the item itself.
  return <RadioGroupPrimitive.Item data-slot="radio-group-item" data-variant={variant} className={cn(radioGroupItemVariants({ variant }), className)} {...props} />
}

export { RadioGroup, RadioGroupItem, radioGroupItemVariants }

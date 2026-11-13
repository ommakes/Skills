// Vois Switch. Replaces shadcn/ui's components/ui/switch.tsx (Radix Switch) with the same API, plus
// `size`.
//
// From the Figma Web Switch and iOS Switch sets (Selectors page):
//   default (web): a 32 x 20 track and a 14 knob, 3px in from the track's edge.
//   native: the iOS Switch, a 52 x 32 track and a 28 knob, 2px in.
// The track is --switch-off with a 1px --switch-outline inside edge, or --switch-on when on, with a
// faint --border-transparent edge. The knob is --switch-knob with a small shadow. Disabled: track
// --switch-disabled, knob --icon-state-disabled, no shadow. Focus is a 2px --border-state-focus ring
// 2px outside the track, as in Figma. The knob slides in --motion-duration-fast and stays still under
// reduced motion. The hit area
// is at least --hit-area-min (DS-A11Y-001).
//
// Use a Switch only for a setting that takes effect at once. In a form that is submitted later, use a
// Checkbox (vois-components JOB-BINARY-PREFERENCE).
//
// Which state wins: disabled, then on, then off. data-* variants are written after disabled, so the on
// color is guarded with not-disabled.
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// The track and knob sizes come from local properties per size, so the knob's travel is the track
// width minus its height and needs no number of its own. The inset (3px web, 2px iOS) is the one value
// with no token: it is Figma's gap between the knob and the track's edge.
const switchVariants = cva(
  [
    "group peer relative inline-flex shrink-0 items-center rounded-full p-[var(--switch-inset)]",
    "h-[var(--switch-h)] w-[var(--switch-w)] bg-[color:var(--switch-off)] shadow-[inset_0_0_0_1px_var(--border-transparent)]",
    "after:absolute after:top-1/2 after:left-1/2 after:size-full after:min-h-[var(--hit-area-min)] after:min-w-[var(--hit-area-min)] after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']",
    "transition-[background-color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)]",
    "data-[state=checked]:not-disabled:bg-[color:var(--switch-on)]",
    // Off and enabled: a 1px --switch-outline inside edge, so the track's boundary meets 3:1 on the page
    // (WCAG 1.4.11). The off fill alone is about 1.1:1 on white.
    "data-[state=unchecked]:not-disabled:shadow-[inset_0_0_0_1px_var(--switch-outline)]",
    "disabled:cursor-not-allowed disabled:bg-[color:var(--switch-disabled)]",
  ],
  {
    variants: {
      size: {
        default: "[--switch-h:var(--size-20)] [--switch-w:var(--size-32)] [--switch-inset:3px]",
        native: "[--switch-h:var(--size-32)] [--switch-w:calc(var(--size-48)+var(--space-4))] [--switch-inset:2px]",
      },
    },
    defaultVariants: { size: "default" },
  }
)

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & VariantProps<typeof switchVariants>) {
  return (
    <SwitchPrimitive.Root data-slot="switch" data-size={size} className={cn(switchVariants({ size }), className)} {...props}>
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-[calc(var(--switch-h)-2*var(--switch-inset))] rounded-full",
          "bg-[color:var(--switch-knob)] shadow-[var(--shadow-small)]",
          "translate-x-0 data-[state=checked]:translate-x-[calc(var(--switch-w)-var(--switch-h))]",
          "transition-[translate] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
          "group-disabled:bg-[color:var(--icon-state-disabled)] group-disabled:shadow-none"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch, switchVariants }

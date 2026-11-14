// Vois Tooltip. Replaces shadcn/ui's components/ui/tooltip.tsx (Radix Tooltip) with the same parts:
// TooltipProvider, Tooltip, TooltipTrigger, TooltipContent.
//
// From the Figma Tooltip (Components page, 3512:2948): --bg-always-dark with a 1px --border-on-light
// inside edge, 8px by 12px padding (--space-padding-x-small, --space-padding-small), 12/16 medium text
// in --text-on-dark, at most about 216 wide (Figma 214), and no arrow. The corner is --shape-subtle and
// the shadow --shadow-large, the tier that goes with the --z-overlay layer it sits on (Figma has an
// unbound 4px corner and an unbound shadow).
//
// It opens on hover and on keyboard focus, closes on Escape, pointer leave and blur, and has
// role="tooltip" with the trigger's aria-describedby pointing at it (Radix). It stays inside the
// viewport: Radix flips and shifts it, it keeps 8px from the edge, and its width never passes the
// space Radix reports. It fades and grows from the trigger in --motion-duration-fast and fades out in
// --motion-duration-instant; under reduced motion it appears and goes at once.
//
// Serves vois-components JOB-CONTEXTUAL-INFO: a short, passive label for a control. Never put a link or
// a button in it (use a Popover). It replaces a title="..." attribute (LOOKALIKE-011).
import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Radix waits for the close animation before it unmounts the content, so the fade needs keyframes.
// Tailwind ships none for a fade, and the motion tokens time these.
const tooltipKeyframes =
  "@keyframes vois-tooltip-in{from{opacity:0;transform:scale(0.96)}}@keyframes vois-tooltip-out{to{opacity:0;transform:scale(0.96)}}"

function TooltipProvider({ delayDuration = 0, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />
}

function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger(props: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 4,
  collisionPadding = 8,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          "z-[var(--z-overlay)] w-fit max-w-[min(var(--radix-tooltip-content-available-width),calc(3*var(--size-72)))] text-balance break-words",
          "rounded-[var(--shape-subtle)] bg-[color:var(--bg-always-dark)] shadow-[inset_0_0_0_1px_var(--border-on-light),var(--shadow-large)]",
          "px-[var(--space-padding-small)] py-[var(--space-padding-x-small)]",
          "text-[color:var(--text-on-dark)] text-[length:var(--font-size-tiny)] leading-[var(--line-height-tiny)] [font-weight:var(--font-weight-medium)]",
          "origin-(--radix-tooltip-content-transform-origin)",
          // motion-safe: guards each state's animation, because a data-* variant would win over
          // motion-reduce:animate-none. With no animation, Radix removes the content at once.
          "motion-safe:data-[state=delayed-open]:animate-[vois-tooltip-in_var(--motion-duration-fast)_var(--motion-ease-standard)]",
          "motion-safe:data-[state=instant-open]:animate-[vois-tooltip-in_var(--motion-duration-fast)_var(--motion-ease-standard)]",
          "motion-safe:data-[state=closed]:animate-[vois-tooltip-out_var(--motion-duration-instant)_var(--motion-ease-standard)_forwards]",
          "motion-reduce:animate-none",
          className
        )}
        {...props}
      >
        <style href="vois-tooltip-keyframes" precedence="default">
          {tooltipKeyframes}
        </style>
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

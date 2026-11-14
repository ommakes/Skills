// Vois ScrollArea. shadcn/ui's components/ui/scroll-area.tsx (Radix ScrollArea) with the same parts:
// ScrollArea and ScrollBar. A ScrollBar is added for you; add a second one for the other direction.
//
// From the Figma Scrollbar set (Selectors page, 8086:3446): a 16 wide track (--space-16) that is transparent,
// with an 8 wide thumb (--space-8) centered in it, so 4 on each side (--space-4), and a capsule end (--shape-pill). The
// thumb is --border-default at rest, so it reaches 3:1 on the page and on cards (WCAG 1.4.11), and
// --border-state-hover on hover and while it is dragged. A horizontal bar is the same turned 90 degrees.
// Radix shows the bar when the pointer is over the area, scrolls, or the area is in use (type="hover"). Pass
// type="always" to keep it on screen, which is better where the scrollbar is the only sign that there is more.
//
// The area is a region the keyboard can scroll: it takes focus when it has overflow and no focusable
// children, and shows a 2px inset --border-state-focus ring on the viewport. The thumb and track are for the
// pointer and touch. Keyboard and screen reader users scroll the viewport itself.
//
// Which state wins: dragging and hover (the same color), then resting.
import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function ScrollArea({ className, children, ...props }: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root data-slot="scroll-area" className={cn("relative", className)} {...props}>
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)]"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-[var(--space-4)] select-none",
        orientation === "vertical" && "h-full w-[var(--space-16)]",
        orientation === "horizontal" && "h-[var(--space-16)] w-full flex-col",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className={cn(
          "relative flex-1 rounded-[var(--shape-pill)] bg-[color:var(--border-default)]",
          "transition-[background-color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
          "hover:bg-[color:var(--border-state-hover)] active:bg-[color:var(--border-state-hover)]"
        )}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }

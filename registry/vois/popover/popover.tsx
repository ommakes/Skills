// Vois Popover. Replaces shadcn/ui's components/ui/popover.tsx (Radix Popover) with the same parts:
// Popover, PopoverTrigger, PopoverAnchor, PopoverContent. PopoverContent adds `arrow`, and there is a
// PopoverClose for a button inside the content that closes it.
//
// From the Figma Popover set (Indicators page, 5938:11483), the same surface as vois-hover-card:
// --elevation-surface-popup with a 1px --border-default edge, --shape-rounded corners, --shadow-small,
// 16 padding, 320 wide, and a 20 by 10 tail on the side that faces the trigger (`arrow={false}` removes
// it). Body text is 14/20 --text-secondary. Put a title (16/24 semibold --text-primary) first if there is one.
//
// It opens when the trigger is clicked (Enter or Space from the keyboard) and closes on Escape, on a press
// outside, or when focus leaves. Focus moves into the content when it opens and returns to the trigger when it
// closes, so it can hold fields and buttons. Radix keeps it on --z-overlay, flips and shifts it to stay 8px
// inside the viewport, and never makes it wider than the space it reports. It fades and grows from the trigger
// in --motion-duration-fast and fades out in --motion-duration-instant. Under reduced motion it appears and goes at once.
//
// Serves vois-components "Focused overlay, exactly one field anchored to a row/item": one field or one short
// choice next to the thing it changes. Not for a task with several fields (Sheet or Dialog), and not for a
// passive preview that opens on hover (HoverCard). A popover is not a modal: the page behind it stays usable.
// Give it a title, or an aria-label on PopoverContent, so a screen reader can name it (vois-tokens DS-A11Y-019).
import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const popoverKeyframes =
  "@keyframes vois-popover-in{from{opacity:0;transform:scale(0.96)}}@keyframes vois-popover-out{to{opacity:0;transform:scale(0.96)}}"

function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger(props: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverAnchor(props: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

function PopoverClose(props: React.ComponentProps<typeof PopoverPrimitive.Close>) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 8,
  collisionPadding = 8,
  arrow = true,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & { arrow?: boolean }) {
  return (
    <PopoverPrimitive.Portal data-slot="popover-portal">
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          "z-[var(--z-overlay)] w-80 max-w-[var(--radix-popover-content-available-width)] break-words p-[var(--space-padding-medium)]",
          "rounded-[var(--shape-rounded)] bg-[color:var(--elevation-surface-popup)] shadow-[inset_0_0_0_1px_var(--border-default),var(--shadow-small)]",
          "text-[color:var(--text-secondary)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-regular)]",
          "origin-(--radix-popover-content-transform-origin) outline-hidden",
          // motion-safe: guards each state's animation, because a data-* variant would win over motion-reduce:animate-none.
          "motion-safe:data-[state=open]:animate-[vois-popover-in_var(--motion-duration-fast)_var(--motion-ease-standard)]",
          "motion-safe:data-[state=closed]:animate-[vois-popover-out_var(--motion-duration-instant)_var(--motion-ease-standard)_forwards]",
          "motion-reduce:animate-none",
          className
        )}
        {...props}
      >
        <style href="vois-popover-keyframes" precedence="default">
          {popoverKeyframes}
        </style>
        {children}
        {arrow ? (
          // The tail, drawn the same way as the HoverCard's: its fill covers the card's edge where it joins
          // (it sits 1px into the card), and only the two slanted sides are stroked.
          <PopoverPrimitive.Arrow data-slot="popover-arrow" asChild width={20} height={10}>
            <svg viewBox="0 0 20 10" aria-hidden="true" focusable="false" className="-mt-px">
              <path d="M0 0 L10 10 L20 0 Z" className="fill-[color:var(--elevation-surface-popup)]" />
              <path d="M0 0 L10 10 L20 0" fill="none" strokeWidth="1" className="stroke-[color:var(--border-default)]" />
            </svg>
          </PopoverPrimitive.Arrow>
        ) : null}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

export { Popover, PopoverTrigger, PopoverAnchor, PopoverClose, PopoverContent }

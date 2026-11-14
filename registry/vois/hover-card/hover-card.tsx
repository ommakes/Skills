// Vois HoverCard. Replaces shadcn/ui's components/ui/hover-card.tsx (Radix HoverCard) with the same
// parts: HoverCard, HoverCardTrigger, HoverCardContent. HoverCardContent adds `arrow`.
//
// From the Figma Popover set (Indicators page, 5938:11483), which is the same surface: --bg-card with
// a 1px --border-default edge, --shape-rounded corners (--radius-small-container), --shadow-small
// (Figma's Elevation/Small), 16 padding, 320 wide, and a tail on the side that faces the trigger. Text
// inside follows the Popover: 14/20 --text-secondary for the body. Put a title (16/24 semibold
// --text-primary) first if there is one. The tail is 20 wide and 10 tall and is on by default
// (`arrow={false}` removes it).
//
// It opens when the pointer rests on the trigger (700ms, Radix's default) or the trigger gets keyboard
// focus, and closes after the pointer leaves (300ms) or focus leaves. It sits on --z-overlay, stays
// inside the viewport (Radix flips and shifts it, 8px from the edge) and is never wider than the space
// Radix reports. It fades and grows from the trigger in --motion-duration-fast and fades out in
// --motion-duration-instant. Under reduced motion it appears and goes at once.
//
// Serves vois-components JOB-CONTEXTUAL-INFO: a passive preview of a linked thing (a profile, a link
// preview). A hover card is not for touch, so everything in it must also be on the page the trigger
// leads to. For content the user must read or act on, use a Popover, which opens on click.
import * as React from "react"
import { HoverCard as HoverCardPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const hoverCardKeyframes =
  "@keyframes vois-hover-card-in{from{opacity:0;transform:scale(0.96)}}@keyframes vois-hover-card-out{to{opacity:0;transform:scale(0.96)}}"

function HoverCard(props: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger(props: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 8,
  collisionPadding = 8,
  arrow = true,
  children,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content> & { arrow?: boolean }) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          "z-[var(--z-overlay)] w-80 max-w-[var(--radix-hover-card-content-available-width)] break-words p-[var(--space-padding-medium)]",
          "rounded-[var(--shape-rounded)] bg-[color:var(--bg-card)] shadow-[inset_0_0_0_1px_var(--border-default),var(--shadow-small)]",
          "text-[color:var(--text-secondary)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-regular)]",
          "origin-(--radix-hover-card-content-transform-origin) outline-hidden",
          // motion-safe: guards each state's animation, because a data-* variant would win over motion-reduce:animate-none.
          "motion-safe:data-[state=open]:animate-[vois-hover-card-in_var(--motion-duration-fast)_var(--motion-ease-standard)]",
          "motion-safe:data-[state=closed]:animate-[vois-hover-card-out_var(--motion-duration-instant)_var(--motion-ease-standard)_forwards]",
          "motion-reduce:animate-none",
          className
        )}
        {...props}
      >
        <style href="vois-hover-card-keyframes" precedence="default">
          {hoverCardKeyframes}
        </style>
        {children}
        {arrow ? (
          // The tail: its fill covers the card's edge where it joins (it sits 1px into the card), and
          // only the two slanted sides are stroked, so the join has no line across it.
          <HoverCardPrimitive.Arrow data-slot="hover-card-arrow" asChild width={20} height={10}>
            <svg viewBox="0 0 20 10" aria-hidden="true" focusable="false" className="-mt-px">
              <path d="M0 0 L10 10 L20 0 Z" className="fill-[color:var(--bg-card)]" />
              <path d="M0 0 L10 10 L20 0" fill="none" strokeWidth="1" className="stroke-[color:var(--border-default)]" />
            </svg>
          </HoverCardPrimitive.Arrow>
        ) : null}
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }

// Vois Drawer. shadcn/ui's components/ui/drawer.tsx (Vaul, built on Radix Dialog) with the same parts: Drawer,
// DrawerTrigger, DrawerPortal, DrawerOverlay, DrawerContent, DrawerClose, DrawerHeader, DrawerFooter, DrawerTitle and
// DrawerDescription, plus DrawerBody (the middle that scrolls). `direction` is "bottom" (the default), "top", "left"
// or "right", and DrawerContent takes `showCloseButton` (on by default) and `size` for a left or right drawer.
//
// A Drawer is a modal that slides in from an edge and can be dragged away (a bottom sheet is the phone form of a
// Dialog). It serves vois-components JOB-OVERLAY-INTERACTION like Dialog does, and the modal rules apply (DS-MODAL):
//   - Vaul sits on Radix Dialog, so it gives the focus trap, the inert page behind, Escape and the focus return that
//     DS-MODAL-001 asks for. Focus moves into the drawer when it opens, Tab cycles inside, Escape or a tap on the
//     scrim closes it, and focus goes back to the trigger.
//   - DS-MODAL-002: the body scrolls inside the drawer with overscroll-behavior: contain, so a scroll never reaches
//     the page. The header and the footer stay in view (DS-MODAL-004).
//   - DS-MODAL-006: never open a Drawer from a Dialog, an AlertDialog, a Sheet or another Drawer. Vaul has a nested
//     root and this item does not export it. A second step replaces the content of the same drawer.
//   - Every drawer needs a DrawerTitle, even a visually hidden one. Do not pass your own `id` to DrawerTitle or
//     DrawerDescription: Radix points aria-labelledby and aria-describedby at its own ids.
//
// Surface: --elevation-surface-raised, a 1px --border-default edge on the side that faces the page, the Large shadow
// that falls away from the docked edge (--shadow-large-bottom, -top, -left or -right, DS-ELEVATION-006), on --z-modal
// over a --bg-overlay-dark scrim. The two corners on the free edge use --shape-rounded.
//   bottom, top   full width, at most 90dvh tall (DS-RESPONSIVE-008). A bottom drawer shows a drag handle and pads
//                 the safe area under its footer (DS-RESPONSIVE-010).
//   left, right   the width is the smallest of the size tier (--panel-overlay-sm, -md or -lg) and half the window
//                 rounded down to a multiple of 4, never under --panel-overlay-min (DS-PANEL-006). Below
//                 --breakpoint-md it is the whole screen (DS-PANEL-002), with no edge and no rounded corners.
// Header and body use the Dialog spacing: 16 at the sides, a 20/28 semibold title and a 14/20 --text-subtle
// description. The footer is right-aligned with 16 between actions, and below md it stacks with the primary action on
// top (put the secondary action first in the markup).
//
// Dragging has an alternative (DS-A11Y-023, WCAG 2.5.7). The close button is the visible way out for a person who
// cannot drag, so keep showCloseButton on, or give the drawer a Cancel in its footer.
//
// Motion: Vaul drives the slide with its own CSS (0.5s and its own curve) and, after a drag, with inline styles. This
// file takes both over with the motion tokens, since DS-MOTION-001 allows no literal duration or curve. The slide and
// the scrim fade run on --motion-duration-slow (a drawer is a large surface, DS-MOTION-002) and --motion-ease-emphasized.
// Vaul's rules are not in a layer, so they beat Tailwind unless the override is !important. Under reduced motion the
// drawer appears and goes at once, and a drag still follows the pointer (that is the input, not an animation).
//
// Vaul adds its own <style> to the page when the module loads. An app with a strict style CSP needs to allow it.
import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function X(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
}

// Vaul leaves autoFocus off, so a drawer opened by the keyboard would keep focus on the trigger under the scrim.
// Here it is on, as in a Dialog: focus moves into the drawer when it opens (DS-A11Y-020).
function Drawer({ autoFocus = true, ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" autoFocus={autoFocus} {...props} />
}

function DrawerTrigger(props: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal(props: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose(props: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

// Vaul's stylesheet sets animation-duration, animation-timing-function and a transform transition, and its release
// handler sets the same on the element inline. Each override is !important for that reason.
const motionTokens =
  "[animation-duration:var(--motion-duration-slow)]! [animation-timing-function:var(--motion-ease-emphasized)]! [transition-duration:var(--motion-duration-slow)]! [transition-timing-function:var(--motion-ease-emphasized)]!"
const motionReduced = "motion-reduce:animate-none! motion-reduce:transition-none!"

function DrawerOverlay({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn("fixed inset-0 z-[var(--z-modal)] bg-[color:var(--bg-overlay-dark)]", motionTokens, motionReduced, className)}
      {...props}
    />
  )
}

type DrawerSize = "sm" | "md" | "lg"

// DS-PANEL-006, the same expression as vois-panel-layout: the smallest of the tier and half the window rounded down to
// a multiple of 4, never under --panel-overlay-min. Below md the drawer is the whole screen (DS-PANEL-002).
const sideWidth: Record<DrawerSize, string> = {
  sm: "data-[vaul-drawer-direction=left]:w-[max(var(--panel-overlay-min),min(var(--panel-overlay-sm),round(down,50vw,4px)))] max-md:data-[vaul-drawer-direction=left]:w-full data-[vaul-drawer-direction=right]:w-[max(var(--panel-overlay-min),min(var(--panel-overlay-sm),round(down,50vw,4px)))] max-md:data-[vaul-drawer-direction=right]:w-full",
  md: "data-[vaul-drawer-direction=left]:w-[max(var(--panel-overlay-min),min(var(--panel-overlay-md),round(down,50vw,4px)))] max-md:data-[vaul-drawer-direction=left]:w-full data-[vaul-drawer-direction=right]:w-[max(var(--panel-overlay-min),min(var(--panel-overlay-md),round(down,50vw,4px)))] max-md:data-[vaul-drawer-direction=right]:w-full",
  lg: "data-[vaul-drawer-direction=left]:w-[max(var(--panel-overlay-min),min(var(--panel-overlay-lg),round(down,50vw,4px)))] max-md:data-[vaul-drawer-direction=left]:w-full data-[vaul-drawer-direction=right]:w-[max(var(--panel-overlay-min),min(var(--panel-overlay-lg),round(down,50vw,4px)))] max-md:data-[vaul-drawer-direction=right]:w-full",
}

function DrawerContent({
  className,
  children,
  showCloseButton = true,
  size = "sm",
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content> & {
  showCloseButton?: boolean
  /** The width tier of a left or right drawer. A top or bottom drawer is as wide as the screen. */
  size?: DrawerSize
}) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        data-size={size}
        className={cn(
          "group/drawer-content fixed z-[var(--z-modal)] flex flex-col overflow-hidden border-[color:var(--border-default)] bg-[color:var(--elevation-surface-raised)] text-[color:var(--text-primary)] outline-hidden",
          // Each edge: where it docks, the edge that faces the page, the rounded free corners, and the shadow that falls away from the dock.
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:max-h-[90dvh] data-[vaul-drawer-direction=bottom]:rounded-t-[var(--shape-rounded)] data-[vaul-drawer-direction=bottom]:border-t data-[vaul-drawer-direction=bottom]:shadow-[var(--shadow-large-bottom)] data-[vaul-drawer-direction=bottom]:pb-[env(safe-area-inset-bottom,0px)]",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:max-h-[90dvh] data-[vaul-drawer-direction=top]:rounded-b-[var(--shape-rounded)] data-[vaul-drawer-direction=top]:border-b data-[vaul-drawer-direction=top]:shadow-[var(--shadow-large-top)] data-[vaul-drawer-direction=top]:pt-[env(safe-area-inset-top,0px)]",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:rounded-l-[var(--shape-rounded)] data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:shadow-[var(--shadow-large-right)] data-[vaul-drawer-direction=right]:pt-[env(safe-area-inset-top,0px)] data-[vaul-drawer-direction=right]:pr-[env(safe-area-inset-right,0px)] data-[vaul-drawer-direction=right]:pb-[env(safe-area-inset-bottom,0px)]",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:rounded-r-[var(--shape-rounded)] data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:shadow-[var(--shadow-large-left)] data-[vaul-drawer-direction=left]:pt-[env(safe-area-inset-top,0px)] data-[vaul-drawer-direction=left]:pb-[env(safe-area-inset-bottom,0px)] data-[vaul-drawer-direction=left]:pl-[env(safe-area-inset-left,0px)]",
          sideWidth[size],
          // Below md a side drawer is the whole screen, with no edge, no corners and no pulled-out shadow.
          "max-md:data-[vaul-drawer-direction=left]:rounded-none max-md:data-[vaul-drawer-direction=left]:border-r-0 max-md:data-[vaul-drawer-direction=right]:rounded-none max-md:data-[vaul-drawer-direction=right]:border-l-0",
          motionTokens,
          motionReduced,
          className
        )}
        {...props}
      >
        {/* The handle only draws where the drawer is pulled up from the bottom. It is not the drag target, the whole drawer is. */}
        <div
          aria-hidden="true"
          data-slot="drawer-handle"
          className="mx-auto mt-[var(--space-8)] hidden h-[var(--space-4)] w-[var(--size-40)] shrink-0 rounded-full bg-[color:var(--icon-subtle)] group-data-[vaul-drawer-direction=bottom]/drawer-content:block"
        />
        <div data-slot="drawer-frame" data-close={showCloseButton ? "true" : "false"} className="flex min-h-0 flex-1 flex-col">
          {children}
        </div>
        {showCloseButton ? (
          <DrawerPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-[var(--space-padding-medium)] right-[var(--space-padding-small)] group-data-[vaul-drawer-direction=right]/drawer-content:right-[calc(var(--space-padding-small)+env(safe-area-inset-right,0px))]"
            >
              <X />
              <span className="sr-only">Close</span>
            </Button>
          </DrawerPrimitive.Close>
        ) : null}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        // 48 on the right keeps the title clear of the close button (12 + 36), and only when there is one. On a coarse
        // pointer the close is 48 (DS-ICON-003), so it is 60 (12 + 48).
        "flex shrink-0 flex-col gap-[var(--space-v-between-text)] pt-[var(--space-padding-medium)] pr-[var(--space-padding-small)] pb-[var(--space-padding-x-small)] pl-[var(--space-padding-medium)] in-data-[close=true]:pr-[var(--space-48)] [@media(any-pointer:coarse)]:in-data-[close=true]:pr-[calc(var(--space-12)+var(--size-action-x-large))]",
        className
      )}
      {...props}
    />
  )
}

// The middle takes the free height and scrolls inside. overscroll-behavior: contain keeps the scroll from reaching the page (DS-MODAL-002).
// A scroll area needs a way in for a keyboard: if the body has nothing focusable in it, pass tabIndex={0}.
function DrawerBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-body"
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-contain px-[var(--space-padding-medium)] py-[var(--space-padding-small)] text-[color:var(--text-primary)] text-[length:var(--font-size-small)] leading-[var(--line-height-small)] [font-weight:var(--font-weight-regular)]",
        className
      )}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        // Below md the actions stack and the primary one, which comes last in the markup, goes on top (DS-RESPONSIVE-008).
        "flex shrink-0 flex-wrap items-center justify-end gap-[var(--space-h-between-actions)] p-[var(--space-padding-medium)] max-md:flex-col-reverse max-md:items-stretch",
        className
      )}
      {...props}
    />
  )
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn(
        "text-[color:var(--text-primary)] text-[length:var(--font-size-large)] leading-[var(--line-height-large)] [font-weight:var(--font-weight-semi-bold)]",
        className
      )}
      {...props}
    />
  )
}

function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn(
        "text-[color:var(--text-subtle)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-regular)]",
        className
      )}
      {...props}
    />
  )
}

export { Drawer, DrawerTrigger, DrawerPortal, DrawerOverlay, DrawerContent, DrawerClose, DrawerHeader, DrawerBody, DrawerFooter, DrawerTitle, DrawerDescription }

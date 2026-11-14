// Vois Dialog. shadcn/ui's components/ui/dialog.tsx (Radix Dialog) with the same parts: Dialog, DialogTrigger,
// DialogPortal, DialogOverlay, DialogContent, DialogClose, DialogHeader, DialogFooter, DialogTitle and
// DialogDescription. DialogContent takes `showCloseButton` (on by default).
//
// From the Figma Dialog (Molecules page, 3613:6593):
//   Surface: --bg-card, a 1px --border-default edge, --shape-rounded corners (Figma binds --radius-small-container, 12),
//     --shadow-large, 344 wide (never wider than the screen minus 16 each side). It sits in the middle of the screen on
//     --z-modal, over a --bg-overlay-dark scrim.
//   Header: 24 padding, a 20/28 semibold --text-primary title, and an optional 14/20 --text-secondary description under it.
//   Close: a 40 by 40 ghost icon Button at the top right, 8 from the edges. Its accessible name is the visually hidden
//     "Close" text in the Button; Radix adds no name of its own, so keep that text, or give a custom DialogClose a label.
//     It stays put when tall content scrolls: the content scrolls inside it, and the button sits outside the scroller.
//   Footer: actions at the end, 16 apart, 16 above and below and 24 at the sides.
// Content goes between the header and the footer; give it its own 24 side padding.
// Motion: the scrim fades and the card fades and grows in --motion-duration-fast, and both fade out in
// --motion-duration-instant. Under reduced motion they appear and go at once.
//
// Focus: Radix moves focus into the dialog when it opens, keeps it there (Tab cycles inside), closes on Escape, and
// puts focus back on the trigger. Every dialog needs a DialogTitle, even a visually hidden one (Radix warns if it
// is missing). This is a modal: the page behind is inert.
//
// Do not pass your own `id` to DialogTitle or DialogDescription: Radix points the dialog's aria-labelledby and
// aria-describedby at its own generated ids, so a custom id breaks the link and the dialog loses its name.
//
// Serves vois-components JOB-OVERLAY-INTERACTION. A confirmation of a destructive action is an AlertDialog
// (JOB-CONFIRM-DESTRUCTIVE), which is not in the registry yet; do not use a Dialog for it.
import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function X(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
}

// Radix waits for the close animation before it unmounts the dialog, so the fade needs keyframes.
const dialogKeyframes =
  "@keyframes vois-dialog-overlay-in{from{opacity:0}}@keyframes vois-dialog-overlay-out{to{opacity:0}}@keyframes vois-dialog-in{from{opacity:0;transform:scale(0.96)}}@keyframes vois-dialog-out{to{opacity:0;transform:scale(0.96)}}"

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-[var(--z-modal)] bg-[color:var(--bg-overlay-dark)]",
        "motion-safe:data-[state=open]:animate-[vois-dialog-overlay-in_var(--motion-duration-fast)_var(--motion-ease-standard)]",
        "motion-safe:data-[state=closed]:animate-[vois-dialog-overlay-out_var(--motion-duration-instant)_var(--motion-ease-standard)_forwards]",
        "motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { showCloseButton?: boolean }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "group/dialog fixed top-1/2 left-1/2 z-[var(--z-modal)] w-[344px] max-w-[calc(100vw-var(--space-32))] -translate-x-1/2 -translate-y-1/2 overflow-hidden",
          "rounded-[var(--shape-rounded)] border border-[color:var(--border-default)] bg-[color:var(--bg-card)] text-[color:var(--text-primary)] shadow-[var(--shadow-large)]",
          "outline-hidden",
          "motion-safe:data-[state=open]:animate-[vois-dialog-in_var(--motion-duration-fast)_var(--motion-ease-standard)]",
          "motion-safe:data-[state=closed]:animate-[vois-dialog-out_var(--motion-duration-instant)_var(--motion-ease-standard)_forwards]",
          "motion-reduce:animate-none",
          className
        )}
        {...props}
      >
        <style href="vois-dialog-keyframes" precedence="default">
          {dialogKeyframes}
        </style>
        <div data-slot="dialog-scroll" data-close={showCloseButton ? "true" : "false"} className="grid max-h-[calc(100dvh-var(--space-36))] gap-0 overflow-y-auto">
          {children}
        </div>
        {showCloseButton ? (
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-[var(--space-8)] right-[var(--space-8)] size-[var(--size-40)]"
            >
              <X />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        // 48 on the right keeps the title clear of the close button, and only when there is one.
        "flex flex-col gap-[var(--space-v-between-text)] pt-[var(--space-padding-large)] pr-[var(--space-padding-large)] pb-[var(--space-padding-small)] pl-[var(--space-padding-large)] in-data-[close=true]:pr-[var(--space-48)]",
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex items-center justify-end gap-[var(--space-h-between-actions)] px-[var(--space-padding-large)] py-[var(--space-padding-medium)]",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-[color:var(--text-primary)] text-[length:var(--font-size-large)] leading-[var(--line-height-large)] [font-weight:var(--font-weight-semi-bold)]",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-[color:var(--text-secondary)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-regular)]",
        className
      )}
      {...props}
    />
  )
}

export { Dialog, DialogTrigger, DialogPortal, DialogOverlay, DialogContent, DialogClose, DialogHeader, DialogFooter, DialogTitle, DialogDescription }

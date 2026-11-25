// Vois Alert Dialog. shadcn/ui's components/ui/alert-dialog.tsx (Radix AlertDialog) with the same parts:
// AlertDialog, AlertDialogTrigger, AlertDialogPortal, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader,
// AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction and AlertDialogCancel.
//
// It uses the Figma Dialog frames (8305:27515), the same as vois-dialog, because Figma has no separate alert
// dialog. The "Required" frame (no close button) is the one it follows:
//   Surface: --elevation-surface-raised, a 1px --border-default edge, --shape-rounded corners, --shadow-large,
//     --width-dialog-sm wide (344; never wider than the screen minus 16 each side), in the middle of the screen
//     on --z-modal, over a --bg-overlay-dark scrim. There is one width: an alert asks one question.
//   Header: 16 top and left, 12 right, 8 bottom, around the 20/28 semibold --text-primary title.
//   Description: the message, 16/24 --text-primary, 16 at the sides and 12 above and below. Put it after the
//     Header, not inside it (Figma has the message in the body, not in the header).
//   Footer: actions at the end, 16 apart, 16 padding on every side, and it wraps when the buttons do not fit.
// What differs from Dialog: no close button (the answer is the way out), no `size` and no glass material, the
// content has the alertdialog role, and a press on the scrim does nothing. Escape still closes it.
//
// AlertDialogAction is a Button (default variant) and AlertDialogCancel is a secondary Button. Pass
// `variant="destructive-soft"` to the Action for a destructive confirmation, which is what Figma draws, or
// `variant="destructive"` for a solid one (vois-components JOB-CONFIRM-DESTRUCTIVE).
// Both take the Button's `variant` and `size`.
//
// Focus: Radix focuses AlertDialogCancel when the dialog opens, wherever it sits in the markup, never the
// Action (DS-A11Y-020). Put Cancel first in the footer anyway, so the visual and the tab order agree. Tab stays
// inside, Escape closes, and focus goes back to the trigger. Give every dialog an AlertDialogTitle and an
// AlertDialogDescription. Do not pass your own `id` to either: Radix points aria-labelledby and
// aria-describedby at its own generated ids.
//
// Use it for a question that needs an explicit answer, usually a destructive one. For a form or a task, use
// Dialog.
import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Radix waits for the close animation before it unmounts the dialog, so the fade needs keyframes.
const alertDialogKeyframes =
  "@keyframes vois-alert-dialog-overlay-in{from{opacity:0}}@keyframes vois-alert-dialog-overlay-out{to{opacity:0}}@keyframes vois-alert-dialog-in{from{opacity:0;transform:scale(0.96)}}@keyframes vois-alert-dialog-out{to{opacity:0;transform:scale(0.96)}}"

function AlertDialog(props: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger(props: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogPortal(props: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
}

function AlertDialogOverlay({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 z-[var(--z-modal)] bg-[color:var(--bg-overlay-dark)]",
        "motion-safe:data-[state=open]:animate-[vois-alert-dialog-overlay-in_var(--motion-duration-fast)_var(--motion-ease-standard)]",
        "motion-safe:data-[state=closed]:animate-[vois-alert-dialog-overlay-out_var(--motion-duration-instant)_var(--motion-ease-standard)_forwards]",
        "motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({ className, children, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-[var(--z-modal)] w-[var(--width-dialog-sm)] max-w-[calc(100vw-var(--space-32))] -translate-x-1/2 -translate-y-1/2 overflow-hidden",
          "rounded-[var(--shape-rounded)] border border-[color:var(--border-default)] bg-[color:var(--elevation-surface-raised)] text-[color:var(--text-primary)] shadow-[var(--shadow-large)]",
          "outline-hidden",
          "motion-safe:data-[state=open]:animate-[vois-alert-dialog-in_var(--motion-duration-fast)_var(--motion-ease-standard)]",
          "motion-safe:data-[state=closed]:animate-[vois-alert-dialog-out_var(--motion-duration-instant)_var(--motion-ease-standard)_forwards]",
          "motion-reduce:animate-none",
          className
        )}
        {...props}
      >
        <style href="vois-alert-dialog-keyframes" precedence="default">
          {alertDialogKeyframes}
        </style>
        <div data-slot="alert-dialog-scroll" className="grid max-h-[calc(100dvh-var(--space-36))] gap-0 overflow-y-auto">
          {children}
        </div>
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        "flex flex-col gap-[var(--space-v-between-text)] pt-[var(--space-padding-medium)] pr-[var(--space-padding-small)] pb-[var(--space-padding-x-small)] pl-[var(--space-padding-medium)]",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-wrap items-center justify-end gap-[var(--space-h-between-actions)] p-[var(--space-padding-medium)]",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        "text-[color:var(--text-primary)] text-[length:var(--font-size-large)] leading-[var(--line-height-large)] [font-weight:var(--font-weight-semi-bold)]",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogDescription({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(
        "px-[var(--space-padding-medium)] py-[var(--space-padding-small)] text-[color:var(--text-primary)] text-[length:var(--font-size-small)] leading-[var(--line-height-small)] [font-weight:var(--font-weight-regular)]",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  variant = "default",
  size,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> & Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Action data-slot="alert-dialog-action" className={className} {...props} />
    </Button>
  )
}

function AlertDialogCancel({
  className,
  variant = "secondary",
  size,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> & Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Cancel data-slot="alert-dialog-cancel" className={className} {...props} />
    </Button>
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}

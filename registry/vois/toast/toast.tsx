// Vois Toast. Radix Toast (radix-ui) with these parts: ToastProvider, ToastViewport, Toast, ToastTitle,
// ToastDescription, ToastAction and ToastClose. Drawn as the Figma Toast Notification set (`1281:1962` in
// the Vois Figma file), five states: Default, Notice, Negative, Positive and Info.
//
// Why Radix Toast and not Sonner (what current shadcn ships): it needs no new package, since `radix-ui` is
// already a dependency of every Vois item, and it has the toast behavior this repo's card lists (pause on
// hover and focus, a hotkey to reach the stack, swipe to dismiss, a screen reader announcement). It does
// not have an imperative `toast()` call. Own the list of open toasts in state and render a <Toast> for
// each, or add a small store on top. The trade is written in CHANGELOG 0.28.0.
//
// From Figma, per toast:
//   Box: at least 312 wide, 12 padding, 12 between the icon, the message and the close button, a 1px edge,
//     --shape-subtle corners, the --shadow-large stack. The message is 14/20 semibold.
//   Default: --bg-aux fill, --border-on-light edge, --text-auxiliary text (a dark toast).
//   Notice:   --bg-notice,   --border-notice,   --text-notice.
//   Negative: --bg-negative, --border-negative, --text-negative.
//   Positive: --bg-positive, --border-positive, --text-positive.
//   Info:     --bg-info,     --border-info,     --text-info.
//   Icon before (24): info outline, warning triangle, alert circle, check circle, info filled, in the same order.
//   Icon after (16): a close X. Both icons can be turned off in Figma (`iconBefore` and `iconAfter`), and are
//     here too: `icon={false}` and `closeButton={false}` on Toast.
// Not in Figma, chosen here: a title above the message and an action button (ToastTitle, ToastAction), a
// 2px --border-state-focus outline on the close button and the action, and a slide-and-fade entrance.
//
// Behavior (Radix): a toast closes after `duration` (5000 ms by default). Hovering or focusing the stack
// pauses the timer. F8 moves focus to the stack (`hotkey` on the provider changes the key). A swipe toward
// the edge dismisses it. A toast with type="foreground" is announced at once (assertive), a "background"
// one when the reader is idle (polite). Negative is foreground here and the rest are background. Pass
// `type` to change it. A toast with an action needs an `altText` on ToastAction, which tells a screen
// reader how to do the action without seeing the toast. The close button is named "Close".
//
// Use it for a short confirmation or a problem the person did not cause with a press they just made ("Saved",
// "Could not send"). Do not put a decision in a toast: use an AlertDialog. For a message that must stay on the
// page, use an inline alert.
import * as React from "react"
import { Toast as ToastPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

type ToastVariant = "default" | "notice" | "negative" | "positive" | "info"

const variantClasses: Record<ToastVariant, string> = {
  default: "bg-[color:var(--bg-aux)] border-[color:var(--border-on-light)] text-[color:var(--text-auxiliary)]",
  notice: "bg-[color:var(--bg-notice)] border-[color:var(--border-notice)] text-[color:var(--text-notice)]",
  negative: "bg-[color:var(--bg-negative)] border-[color:var(--border-negative)] text-[color:var(--text-negative)]",
  positive: "bg-[color:var(--bg-positive)] border-[color:var(--border-positive)] text-[color:var(--text-positive)]",
  info: "bg-[color:var(--bg-info)] border-[color:var(--border-info)] text-[color:var(--text-info)]",
}

function Svg(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props} />
}
const icons: Record<ToastVariant, React.ReactNode> = {
  default: <Svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></Svg>,
  notice: <Svg fill="currentColor"><path d="M10.3 3.9 2.4 17.6A2 2 0 0 0 4.1 20.6h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0ZM11 9h2v5h-2V9Zm0 7h2v2h-2v-2Z" /></Svg>,
  negative: <Svg fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 5h2v6h-2V7Zm0 8h2v2h-2v-2Z" /></Svg>,
  positive: <Svg fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.3 14.3-3.6-3.6 1.4-1.4 2.2 2.2 5.2-5.2 1.4 1.4-6.6 6.6Z" /></Svg>,
  info: <Svg fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 9h2v6h-2v-6Zm0-3h2v2h-2V8Z" /></Svg>,
}

// Radix unmounts a closed toast after its exit animation, so the slide needs keyframes.
const toastKeyframes =
  "@keyframes vois-toast-in{from{opacity:0;transform:translateY(8px)}}@keyframes vois-toast-out{to{opacity:0}}"

function ToastProvider(props: React.ComponentProps<typeof ToastPrimitive.Provider>) {
  return <ToastPrimitive.Provider {...props} />
}

function ToastViewport({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "fixed right-0 bottom-0 z-[var(--z-overlay)] m-0 flex max-h-dvh w-full max-w-[calc(100vw-var(--space-32))] list-none flex-col gap-[var(--space-8)] p-[var(--space-16)] outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)] sm:max-w-[calc(var(--size-72)*5+var(--space-32))]",
        className,
      )}
      {...props}
    />
  )
}

type ToastProps = React.ComponentProps<typeof ToastPrimitive.Root> & {
  variant?: ToastVariant
  /** The 24 icon before the message. `false` removes it. A node replaces the one for the variant. */
  icon?: boolean | React.ReactNode
  /** The 16 close button after the message. Default true. Pass false for a toast that only an action or the timer ends. */
  closeButton?: boolean
}

function Toast({ className, variant = "default", icon = true, closeButton = true, type, children, ...props }: ToastProps) {
  const glyph = icon === true ? icons[variant] : icon === false ? null : icon
  return (
    <>
      <style href="vois-toast-keyframes" precedence="default">
        {toastKeyframes}
      </style>
      <ToastPrimitive.Root
        data-slot="toast"
        data-variant={variant}
        type={type ?? (variant === "negative" ? "foreground" : "background")}
        className={cn(
          "relative flex min-w-[312px] items-center gap-[var(--space-12)] overflow-hidden border border-solid p-[var(--space-12)]",
          "rounded-[var(--shape-subtle)] shadow-[var(--shadow-large)]",
          "text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-semi-bold)]",
          "data-[state=open]:animate-[vois-toast-in_var(--motion-duration-base)_var(--motion-ease-emphasized)] data-[state=closed]:animate-[vois-toast-out_var(--motion-duration-instant)_var(--motion-ease-standard)_forwards]",
          "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:animate-[vois-toast-out_var(--motion-duration-instant)_var(--motion-ease-standard)_forwards]",
          "motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none",
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        {glyph ? <span className="shrink-0 [&_svg]:size-6" aria-hidden="true">{glyph}</span> : null}
        <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-4)]">{children}</div>
        {closeButton ? <ToastClose /> : null}
      </ToastPrimitive.Root>
    </>
  )
}

function ToastTitle({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Title>) {
  return <ToastPrimitive.Title data-slot="toast-title" className={cn("min-w-0", className)} {...props} />
}

function ToastDescription({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Description>) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("min-w-0 [font-weight:var(--font-weight-medium)]", className)}
      {...props}
    />
  )
}

function ToastAction({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Action>) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      className={cn(
        "relative mt-[var(--space-4)] inline-flex shrink-0 cursor-pointer items-center justify-center self-start rounded-[var(--shape-subtle)] border border-current px-[var(--space-padding-x-small)] py-[var(--space-4)] text-[inherit]",
        "[font:inherit] hover:bg-[color:var(--bg-hover)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)]",
        "after:absolute after:top-1/2 after:left-0 after:h-full after:min-h-[var(--hit-area-min)] after:w-full after:-translate-y-1/2 after:content-['']",
        className,
      )}
      {...props}
    />
  )
}

function ToastClose({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Close>) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close"
      className={cn(
        "relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[var(--shape-subtle)] text-[inherit]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)]",
        "after:absolute after:top-1/2 after:left-1/2 after:size-[var(--hit-area-min)] after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']",
        className,
      )}
      {...props}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="size-4"><path d="M18 6 6 18M6 6l12 12" /></svg>
    </ToastPrimitive.Close>
  )
}

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastAction, ToastClose }
export type { ToastVariant }

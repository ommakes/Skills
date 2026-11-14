// Vois Card. Replaces shadcn/ui's components/ui/card.tsx with the same parts: Card, CardHeader,
// CardTitle, CardDescription, CardAction, CardContent, CardFooter. It adds `interactive` and
// `disabled` on Card, and CardLink, for a card that is itself the action target.
//
// From the Figma Card set (Components page, 8080:2089). All states share the surface: --bg-card,
// --shape-rounded corners (--radius-small-container, 12), 16 padding and 16 between sections, and the
// 1px --border-default edge drawn inside, with --shadow-base (Figma's Elevation/Base).
//   Static (the default): a container that is not clickable. Nothing changes on hover.
//   interactive, resting: the same look, and a pointer cursor.
//   Hover: the edge becomes --border-state-hover and the shadow --shadow-small.
//   Pressed: the edge stays --border-state-hover and the shadow goes, so the card sits flatter.
//   Focus (CardLink has keyboard focus): a 2px --border-state-focus edge inside, with --shadow-base.
//   Disabled: a --border-state-disabled edge, no shadow, --text-state-disabled text.
// Type: title 16/24 semibold --text-primary; description, content and footer 14/20 regular
// --text-secondary, the same pairing as the Figma Popover.
//
// A clickable card (vois-components JOB-CONTAIN-CONTENT, "the card itself is the primary action
// target") puts ONE link or button in it, usually around the title, and stretches its hit area over the
// whole card with an ::after layer. The card is not an <a> itself, so a screen reader reads one link
// named by the title, not a link around a block of text. CardAction sits above that layer, so its
// controls work on their own. Anything else clickable inside the card needs `relative z-10`. Keyboard focus goes to the link, and the card draws the
// focus ring, so the ring is the card's edge, not the title's.
//
// Which state wins: disabled, then focus, then pressed, then hover, then resting.
import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const CardContext = React.createContext<{ disabled: boolean }>({ disabled: false })

function Card({
  className,
  interactive = false,
  disabled = false,
  ...props
}: React.ComponentProps<"div"> & { interactive?: boolean; disabled?: boolean }) {
  return (
    <CardContext.Provider value={{ disabled }}>
      <div
        data-slot="card"
        data-interactive={interactive ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        className={cn(
          "relative flex flex-col gap-[var(--space-padding-medium)] rounded-[var(--shape-rounded)] p-[var(--space-padding-medium)]",
          "bg-[color:var(--bg-card)] text-[color:var(--text-primary)]",
          "shadow-[inset_0_0_0_1px_var(--border-default),var(--shadow-base)]",
          "transition-[box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
          // interactive states. data-* and has-* come after hover and active, and each is guarded so
          // that disabled wins over focus, and focus wins over pressed and hover. The focus ring needs
          // no `interactive`: any CardLink in the card hides its own outline, so the card must draw it.
          "data-[interactive]:not-data-[disabled]:cursor-pointer",
          "data-[interactive]:not-data-[disabled]:hover:shadow-[inset_0_0_0_1px_var(--border-state-hover),var(--shadow-small)]",
          "data-[interactive]:not-data-[disabled]:active:shadow-[inset_0_0_0_1px_var(--border-state-hover)]",
          "not-data-[disabled]:has-[[data-slot=card-link]:focus-visible]:shadow-[inset_0_0_0_2px_var(--border-state-focus),var(--shadow-base)]",
          "data-[disabled]:cursor-not-allowed data-[disabled]:text-[color:var(--text-state-disabled)] data-[disabled]:shadow-[inset_0_0_0_1px_var(--border-state-disabled)]",
          className
        )}
        {...props}
      />
    </CardContext.Provider>
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-y-[var(--space-padding-2x-small)] has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-[length:var(--font-size-small)] leading-[var(--line-height-small)] [font-weight:var(--font-weight-semi-bold)] text-inherit",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-[color:var(--text-secondary)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-regular)]",
        "in-data-[disabled]:text-[color:var(--text-state-disabled)]",
        className
      )}
      {...props}
    />
  )
}

// CardAction holds the secondary controls (a menu, a button). It sits above the CardLink layer (z-10),
// so its clicks are its own and do not follow the card's link.
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-action" className={cn("relative z-10 col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)} {...props} />
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "text-[color:var(--text-secondary)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-regular)]",
        "in-data-[disabled]:text-[color:var(--text-state-disabled)]",
        className
      )}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-[var(--space-h-between-actions)] text-[color:var(--text-secondary)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)]",
        "in-data-[disabled]:text-[color:var(--text-state-disabled)]",
        className
      )}
      {...props}
    />
  )
}

// The one link or button that makes the whole card the target. It renders an <a> by default, and
// `asChild` lets it wrap a router Link or a <button>. Its ::after layer covers the card.
//
// A disabled card makes the link inert: an <a> loses its href (so middle-click and "open in a new tab"
// do nothing too), and with `asChild` the child gets the real `disabled` attribute, which stops its own
// onClick. aria-disabled and tabIndex -1 take it out of the tab order. The cursor is set on the link,
// because its ::after layer is what the pointer is over: a pointer, or not-allowed when disabled.
function CardLink({
  className,
  asChild = false,
  onClick,
  tabIndex,
  href,
  ...props
}: React.ComponentProps<"a"> & { asChild?: boolean }) {
  const { disabled } = React.useContext(CardContext)
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="card-link"
      aria-disabled={disabled ? true : undefined}
      tabIndex={disabled ? -1 : tabIndex}
      {...(asChild ? { disabled: disabled || undefined } : {})}
      href={disabled ? undefined : href}
      onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
        if (disabled) event.preventDefault()
        else onClick?.(event)
      }}
      className={cn(
        "after:absolute after:inset-0 after:rounded-[var(--shape-rounded)] after:content-['']",
        "focus-visible:outline-hidden",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className
      )}
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter, CardLink }

// Vois Pagination. shadcn/ui's components/ui/pagination.tsx parts (Pagination, PaginationContent,
// PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis), drawn as the
// Figma Pagination (`3723:4093` in the Vois Figma file) and its Pagination Numbers set (`3723:4041`).
// There is no Radix part under it: it is a nav landmark with a list of links, as in shadcn.
//
// From Figma:
//   Row: 12 between Previous, the numbers and Next, with 8 side padding.
//   Number (PaginationLink): 32 by 32, --shape-subtle corners, 14/20 semibold.
//     Resting --text-state-resting. Hover (Soft Hover) --action-icon-hover fill with --text-state-hover.
//     Active has a filled square with --text-on-dark. Disabled --text-state-disabled.
//   Previous and Next: 28 tall, 8 side padding, 8 between a 16 chevron and the label (4 padding around
//     it), the same text as a number, and the same hover.
//   Ellipsis: the same 32 by 32 box with "...", not a link.
//
// Gaps in Figma, with the choice made here:
//   - The Active fill is --action-icon-selected (#398aee), which gives white text about 3.4:1, under the
//     4.5:1 that 14px text needs (DS-A11Y-002). The code uses --select-solid-active, the same blue the
//     Calendar uses for its selected day. This is listed in FIGMA-TODO.md.
//   - Figma has no focus state. A 2px --border-state-focus outline is drawn outside the item.
//   - Previous and Next have no disabled look. They take the number's disabled text.
//
// Behavior: the active link gets aria-current="page". A disabled link gets aria-disabled, leaves the tab
// order, and a press on it does nothing (the click is stopped). These are plain anchors, so pass `href` or
// an `onClick`. To use a router's Link, render the router's own anchor with the same classes: this file
// does not offer an asChild prop. The nav has aria-label="pagination". Override it when a page has two.
// The page numbers and the gaps ("1 2 3 ... 100") come from the caller: this file draws what it is given.
//
// Use it to move between pages of a list or table the person can count. For infinite lists use a
// "Load more" Button. For steps in a flow use Stepper.
import * as React from "react"

import { cn } from "@/lib/utils"

function ChevronLeft(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="m15 18-6-6 6-6" /></svg>
}
function ChevronRight(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="m9 18 6-6-6-6" /></svg>
}

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      // role="list" keeps the list announced when CSS removes the bullets.
      role="list"
      data-slot="pagination-content"
      className={cn("flex flex-row flex-wrap items-center justify-center gap-[var(--space-12)] px-[var(--space-padding-x-small)]", className)}
      {...props}
    />
  )
}

function PaginationItem(props: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
  disabled?: boolean
} & React.ComponentProps<"a">

const itemClasses = [
  "relative inline-flex cursor-pointer items-center justify-center whitespace-nowrap select-none",
  "text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-semi-bold)]",
  "rounded-[var(--shape-subtle)] text-[color:var(--text-state-resting)]",
  "transition-[background-color,color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
  "hover:bg-[color:var(--action-icon-hover)] hover:text-[color:var(--text-state-hover)]",
  "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[color:var(--border-state-focus)]",
  // A taller pointer target without a taller item.
  "after:absolute after:top-1/2 after:left-0 after:h-full after:min-h-[var(--hit-area-min)] after:w-full after:-translate-y-1/2 after:content-['']",
  "aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:bg-transparent aria-disabled:text-[color:var(--text-state-disabled)]",
]

function stopWhenDisabled(disabled: boolean | undefined, onClick: React.MouseEventHandler<HTMLAnchorElement> | undefined) {
  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }
}

function PaginationLink({ className, isActive, disabled, onClick, ...props }: PaginationLinkProps) {
  return (
    <a
      data-slot="pagination-link"
      data-active={isActive ? "true" : undefined}
      aria-current={isActive ? "page" : undefined}
      aria-disabled={disabled ? true : undefined}
      tabIndex={disabled ? -1 : props.tabIndex}
      onClick={stopWhenDisabled(disabled, onClick)}
      className={cn(
        itemClasses,
        "size-[var(--size-32)]",
        "data-[active=true]:bg-[color:var(--select-solid-active)] data-[active=true]:text-[color:var(--text-on-dark)] data-[active=true]:hover:bg-[color:var(--select-solid-active)] data-[active=true]:hover:text-[color:var(--text-on-dark)]",
        className,
      )}
      {...props}
    />
  )
}

function PaginationPrevious({ className, children, disabled, onClick, ...props }: PaginationLinkProps) {
  return (
    <a
      data-slot="pagination-previous"
      aria-label="Go to previous page"
      aria-disabled={disabled ? true : undefined}
      tabIndex={disabled ? -1 : props.tabIndex}
      onClick={stopWhenDisabled(disabled, onClick)}
      className={cn(itemClasses, "h-7 gap-[var(--space-8)] px-[var(--space-padding-x-small)]", className)}
      {...props}
    >
      <ChevronLeft className="size-4 shrink-0" />
      <span className="px-[var(--space-padding-2x-small)]">{children ?? "Previous"}</span>
    </a>
  )
}

function PaginationNext({ className, children, disabled, onClick, ...props }: PaginationLinkProps) {
  return (
    <a
      data-slot="pagination-next"
      aria-label="Go to next page"
      aria-disabled={disabled ? true : undefined}
      tabIndex={disabled ? -1 : props.tabIndex}
      onClick={stopWhenDisabled(disabled, onClick)}
      className={cn(itemClasses, "h-7 gap-[var(--space-8)] px-[var(--space-padding-x-small)]", className)}
      {...props}
    >
      <span className="px-[var(--space-padding-2x-small)]">{children ?? "Next"}</span>
      <ChevronRight className="size-4 shrink-0" />
    </a>
  )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="pagination-ellipsis"
      className={cn(
        "inline-flex size-[var(--size-32)] items-center justify-center text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-semi-bold)] text-[color:var(--text-state-resting)]",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true">...</span>
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}

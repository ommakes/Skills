// Vois Resizable. shadcn/ui's components/ui/resizable.tsx (react-resizable-panels) with its parts: ResizablePanelGroup,
// ResizablePanel and ResizableHandle (`withHandle` adds a grip). The library is version 4, so the parts wrap its Group,
// Panel and Separator. This is a split view whose divider a person drags or moves with the keyboard. It is not
// vois-panel-layout, which places one side panel by the DS-PANEL rules and has no divider to drag.
//
// Sizes. A number is pixels and a string with no unit is a percentage: `defaultSize="30%"` is a third of the group,
// `minSize={200}` is 200 px. Keep a push panel between --panel-push-min and --panel-push-max, and never let the main
// area go under --main-min (DS-PANEL-005, DS-PANEL-008): the numbers belong in token names, so read them from the token
// variables where the app can, or pass the same sizes as the tokens hold. The group needs a height (`h-full` of a parent
// with a height, or a class on the group): it is as tall as its parent.
//
// Keyboard and name. The handle is a separator that takes focus (role="separator", aria-valuenow, aria-controls). The
// arrow keys along the split move it, Home and End go to the ends of its range, Enter collapses or restores a collapsible
// panel next to it, and a double click resets it. Give each handle an `aria-label` ("Resize sidebar") so a screen reader
// says what it moves. A disabled handle (`disabled`) is not movable, reads as aria-disabled and shows the library's not-allowed cursor.
//
// Look. The line is 1px --border-default. Its hit area is wider than the line: the library grows it to 10 px with a fine
// pointer and 20 px with a coarse one (resizeTargetMinimumSize), and the ring draws on the line. The line turns
// --border-state-active while it is hovered or dragged. A focused handle gets the shared focus ring (--focus-ring-width and
// -offset, --border-state-focus), drawn from the keyboard only. The grip is a 12 by 16 --bg-card chip with a --border-default
// edge and two columns of dots in --icon-subtle.
//
// Motion. Nothing animates here: a panel follows the pointer or the key press at once, so reduced motion has nothing to
// remove. The color change on the line is not animated either.
import * as React from "react"
import { Group, Panel, Separator } from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({ className, ...props }: React.ComponentProps<typeof Group>) {
  return <Group data-slot="resizable-panel-group" className={cn("h-full w-full", className)} {...props} />
}

function ResizablePanel({ ...props }: React.ComponentProps<typeof Panel>) {
  return <Panel data-slot="resizable-panel" {...props} />
}

function Grip(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 8 12" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="2" cy="2" r="1" />
      <circle cx="6" cy="2" r="1" />
      <circle cx="2" cy="6" r="1" />
      <circle cx="6" cy="6" r="1" />
      <circle cx="2" cy="10" r="1" />
      <circle cx="6" cy="10" r="1" />
    </svg>
  )
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  /** Draw a grip on the line. */
  withHandle?: boolean
}) {
  return (
    <Separator
      data-slot="resizable-handle"
      className={cn(
        // The library names the pointer and focus state in data-separator: inactive, hover, active, focus, disabled.
        "group/handle relative flex shrink-0 items-center justify-center bg-[color:var(--border-default)] outline-hidden",
        // aria-orientation is the line's own direction: vertical is a line between two columns.
        "aria-[orientation=vertical]:w-px aria-[orientation=horizontal]:h-px",
        "data-[separator=hover]:bg-[color:var(--border-state-active)] data-[separator=active]:bg-[color:var(--border-state-active)]",
        "focus-visible:outline-solid focus-visible:outline-[length:var(--focus-ring-width)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:outline-[color:var(--border-state-focus)]",
        className
      )}
      {...props}
    >
      {withHandle ? (
        <div
          data-slot="resizable-grip"
          className="z-10 flex h-[var(--size-16)] w-[var(--size-12)] items-center justify-center rounded-[var(--radius-buttons-and-controls)] border border-[color:var(--border-default)] bg-[color:var(--bg-card)] text-[color:var(--icon-subtle)] group-aria-[orientation=horizontal]/handle:rotate-90"
        >
          <Grip className="size-[var(--size-12)]" />
        </div>
      ) : null}
    </Separator>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }

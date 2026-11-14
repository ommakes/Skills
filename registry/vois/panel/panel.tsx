// Vois Panel. shadcn/ui has no Panel; this is the persistent secondary pane that vois-components
// JOB-SECONDARY-CONTENT picks for contextual detail that is always visible while an item is selected (an
// inspector, a properties pane). A pane that opens on a click is a Sheet, and one that holds app
// navigation is a Sidebar. Parts: Panel, PanelHeader, PanelTitle, PanelDescription, PanelContent,
// PanelFooter.
//
// From the Figma Panel set (Components page, 8080:2138):
//   Panel: --bg-card, full height of its column, one 1px --border-default edge on the side that faces
//     the main area. `side` says where the panel sits: "right" (the default) puts the edge on its left,
//     "left" puts it on its right. `width` is the push-panel tokens: "min" --panel-push-min (280),
//     "default" --panel-push-default (320), "max" --panel-push-max (400). The width does not shrink in a
//     flex row.
//   PanelHeader: 16 padding, a 1px --border-pretty line under it. PanelTitle is 16/24 semibold
//     --text-primary and PanelDescription is 14/20 regular --text-secondary.
//   PanelContent: 16 padding, takes the free height and scrolls inside. It is a scroll area, so a
//     keyboard needs a way in: if the content has no focusable item, pass tabIndex={0}.
//   PanelFooter: 16 padding, a 1px --border-pretty line above it, actions spaced by --space-h-between-actions
//     and aligned to the end.
//
// Panel renders an <aside>, which is a complementary landmark. Give it an aria-label (or
// aria-labelledby the title), so a screen reader can tell it from other landmarks.
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const panelVariants = cva(
  "flex h-full shrink-0 flex-col overflow-hidden bg-[color:var(--bg-card)] text-[color:var(--text-primary)]",
  {
    variants: {
      side: {
        right: "border-l border-[color:var(--border-default)]",
        left: "border-r border-[color:var(--border-default)]",
      },
      width: {
        min: "w-[var(--panel-push-min)]",
        default: "w-[var(--panel-push-default)]",
        max: "w-[var(--panel-push-max)]",
      },
    },
    defaultVariants: { side: "right", width: "default" },
  }
)

function Panel({
  className,
  side = "right",
  width = "default",
  ...props
}: React.ComponentProps<"aside"> & VariantProps<typeof panelVariants>) {
  return <aside data-slot="panel" data-side={side} data-width={width} className={cn(panelVariants({ side, width }), className)} {...props} />
}

function PanelHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-header"
      className={cn(
        "flex flex-col gap-[var(--space-padding-2x-small)] border-b border-[color:var(--border-pretty)] p-[var(--space-padding-medium)]",
        className
      )}
      {...props}
    />
  )
}

function PanelTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="panel-title"
      className={cn(
        "text-[length:var(--font-size-small)] leading-[var(--line-height-small)] [font-weight:var(--font-weight-semi-bold)] text-[color:var(--text-primary)]",
        className
      )}
      {...props}
    />
  )
}

function PanelDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="panel-description"
      className={cn(
        "text-[color:var(--text-secondary)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-regular)]",
        className
      )}
      {...props}
    />
  )
}

function PanelContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-content"
      className={cn(
        "min-h-0 flex-1 overflow-y-auto p-[var(--space-padding-medium)]",
        "text-[color:var(--text-secondary)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-regular)]",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)]",
        className
      )}
      {...props}
    />
  )
}

function PanelFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-footer"
      className={cn(
        "flex items-center justify-end gap-[var(--space-h-between-actions)] border-t border-[color:var(--border-pretty)] p-[var(--space-padding-medium)]",
        className
      )}
      {...props}
    />
  )
}

export { Panel, PanelHeader, PanelTitle, PanelDescription, PanelContent, PanelFooter, panelVariants }

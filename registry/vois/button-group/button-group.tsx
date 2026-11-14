// Vois ButtonGroup. shadcn/ui's components/ui/button-group.tsx parts on Vois tokens: ButtonGroup,
// ButtonGroupSeparator and ButtonGroupText. Put Buttons inside (the Vois Button, variant "outline" or
// "secondary"). The group joins them into one control and does not restyle their colors.
//
// From the Figma Button Group set (Components page, 3480:3839: Position Left, Middle and Right, and the
// states Active, Hover, Focus, Pressed, Disabled):
//   Joined edges: the first Button keeps its left corners and the last keeps its right corners
//     (--radius-buttons-and-controls, 6). Every corner between two Buttons is square. Each Button keeps its 1px
//     border and the next one overlaps it by 1px (a negative margin), so two neighbors show one line, not two,
//     and the group works for any number of Buttons, where Figma draws only three positions.
//   Focus: Figma draws the focus edge inside the segment, 2px, so the group moves the Button's focus ring to
//     -2px (inside) and lifts the focused Button above its neighbors, so no part of the ring is covered.
//   Colors, press, hover and disabled come from the Button's own variant, which uses the same tokens as the
//     Figma states (--action-secondary-hover, --action-secondary-pressed, --border-state-disabled).
//   `orientation="vertical"` stacks the group and joins the top and bottom edges the same way.
// ButtonGroupText is a label segment (a count, a unit) with the Button's edge. ButtonGroupSeparator is a 1px
// --border-default line between two groups of Buttons that should read as one control, such as a split button.
//
// Serves vois-components JOB-TRIGGER-ACTION and JOB-SWITCH-VIEWS: a few related actions that read as one
// control. For a choice of one view or mode, use the SegmentedControl; this is for actions.
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonGroupVariants = cva(
  [
    "isolate flex w-fit items-stretch",
    // A focused Button sits above its neighbors, and its ring moves inside the Button (Figma).
    "[&>*:focus-visible]:relative [&>*:focus-visible]:z-10",
    "[&>[data-slot=button]:focus-visible]:outline-offset-[-2px]",
  ],
  {
    variants: {
      orientation: {
        horizontal: [
          "flex-row",
          "[&>*:not(:first-child)]:-ml-px",
          "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none",
        ],
        vertical: [
          "flex-col",
          "[&>*:not(:first-child)]:-mt-px",
          "[&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none",
        ],
      },
    },
    defaultVariants: { orientation: "horizontal" },
  }
)

function ButtonGroup({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

function ButtonGroupText({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="button-group-text"
      className={cn(
        "inline-flex items-center gap-[var(--space-padding-x-small)] rounded-[var(--radius-buttons-and-controls)] border border-[color:var(--border-default)] bg-[color:var(--bg-subtle)] px-[var(--space-padding-small)]",
        "text-[color:var(--text-secondary)] text-[length:var(--font-size-small)] leading-[var(--line-height-small)] [font-weight:var(--font-weight-medium)]",
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[var(--size-20)]",
        className
      )}
      {...props}
    />
  )
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & { orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      data-slot="button-group-separator"
      className={cn(
        "self-stretch bg-[color:var(--border-default)]",
        orientation === "vertical" ? "w-px" : "h-px",
        className
      )}
      {...props}
    />
  )
}

export { ButtonGroup, ButtonGroupText, ButtonGroupSeparator, buttonGroupVariants }

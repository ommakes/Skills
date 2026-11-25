// Vois Toggle Group. shadcn/ui's ToggleGroup parts (ToggleGroup, ToggleGroupItem) on Radix ToggleGroup,
// drawn as the Figma Toggle Group Button set (`3488:2898` in the Vois Figma file): joined outline buttons
// with one shared edge, a 1px --border-default line, and a fill that marks the pressed items.
//
// From Figma, per button (Position Left, Middle, Right by State):
//   Size: 12 / 8 padding (--space-padding-small, --space-padding-x-small) around a 16 glyph, so an icon-only
//     button is 40 by 32. Outer corners --shape-subtle (Figma binds --radius-buttons-and-controls, 6px).
//   Unselected: --toggle-group-unselected fill, 1px --border-default, glyph --icon-state-resting.
//   Hover: --toggle-group-hover fill, glyph --icon-primary.
//   Selected: --toggle-group-selected fill, glyph --icon-primary.
//   Focus: 2px --border-state-focus edge. Unselected keeps --select-resting as its fill. A chosen item
//     fills with --select-pressed. (Figma names that state Focus-Pressed. A toggle stays pressed while it is
//     on, so it is read here as focused and on.)
//   Disabled: --toggle-group-disabled fill, 1px --border-state-disabled, glyph --icon-state-disabled.
// The Left and Right buttons have no inner edge in Figma and the Middle has both, which draws one line
// between neighbours. Here every item has a full edge and each one after the first overlaps its neighbour
// by 1px, which draws the same single line for any number of items (2 or more).
//
// Not in Figma, chosen here: the label text of an item takes the glyph color of its state, and a label sets
// the item at 16/24 medium. The group runs horizontally only: Figma has no vertical set.
//
// Keyboard (Radix roving focus): one tab stop for the group, arrow keys move between items and skip
// disabled ones, Space or Enter presses. `type="single"` lets one item be on (pressing it again turns it
// off), `type="multiple"` lets any number be on. Items are at least --hit-area-min tall to the pointer
// (DS-A11Y-001). An icon-only item needs an aria-label.
//
// Which state wins: disabled, then focus, then selected, then hover, then unselected.
//
// Use it for a few formatting or view options that act at once (bold, italic, align left and right, or a
// list and grid view), where one or more can be on. For 2 to 5 views where exactly one is always chosen,
// use SegmentedControl. For a choice inside a form, use RadioGroup.
import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function ToggleGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn("inline-flex w-fit items-stretch", className)}
      {...props}
    />
  )
}

const toggleGroupItemClasses = [
  "relative inline-flex min-h-[var(--size-32)] min-w-0 cursor-pointer items-center justify-center gap-[var(--space-8)] whitespace-nowrap select-none",
  "px-[var(--space-padding-small)] py-[var(--space-padding-x-small)]",
  "border border-[color:var(--border-default)] bg-[color:var(--toggle-group-unselected)]",
  "text-[length:var(--font-size-small)] leading-[var(--line-height-small)] [font-weight:var(--font-weight-medium)] text-[color:var(--icon-state-resting)]",
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  // One shared line: each item after the first sits 1px over its neighbour.
  "not-first:-ml-px first:rounded-l-[var(--shape-subtle)] last:rounded-r-[var(--shape-subtle)]",
  // A taller pointer target without a taller button (the same trick as Segmented Control).
  "after:absolute after:top-1/2 after:left-0 after:h-full after:min-h-[var(--hit-area-min)] after:w-full after:-translate-y-1/2 after:content-['']",
  "transition-[background-color,color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
  "hover:not-disabled:bg-[color:var(--toggle-group-hover)] hover:not-disabled:text-[color:var(--icon-primary)]",
  "data-[state=on]:not-disabled:bg-[color:var(--toggle-group-selected)] data-[state=on]:not-disabled:text-[color:var(--icon-primary)]",
  // Focus: a 2px ring drawn inside the edge, so the item does not grow. It rises over the neighbour's edge.
  "focus-visible:z-10 focus-visible:bg-[color:var(--select-resting)] focus-visible:text-[color:var(--icon-primary)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)]",
  "focus-visible:data-[state=on]:bg-[color:var(--select-pressed)]",
  "disabled:cursor-not-allowed disabled:border-[color:var(--border-state-disabled)] disabled:bg-[color:var(--toggle-group-disabled)] disabled:text-[color:var(--icon-state-disabled)]",
]

function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(toggleGroupItemClasses, className)}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }

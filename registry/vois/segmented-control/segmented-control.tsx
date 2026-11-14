// Vois Segmented Control. shadcn/ui's ToggleGroup parts (ToggleGroup, ToggleGroupItem) on Radix ToggleGroup,
// fixed to one choice: there is no `type` prop, the group is always type="single". SegmentedControl and
// SegmentedControlItem are the same parts under the name the vois-components jobs use.
//
// From the Figma Segments set (Selectors page):
//   Track: 32 tall (--size-32), --segment-inactive, outer corners --shape-subtle (Figma binds
//     --radius-buttons-and-controls, 6px; the set is not a capsule).
//   Inactive: label --text-state-resting, 16/24 medium.
//   Active: a 28 tall indicator (--size-28) inset 2px in the cell (half of 32 minus 28), --radii-6 corners, --segment-active fill,
//     1px --border-default edge, --shadow-base (Figma's Elevation/Base style), label --text-on-light.
//   Active focus: the indicator edge becomes 2px --segment-focus-ring.
//   Inactive focus: the cell fills with --segment-focus-inactive and gets a 2px --segment-focus-ring ring
//     inside it.
//   Disabled: the cell fills with --segment-disabled, label --text-state-disabled.
// Every item uses the active layout (2px inset, 12px label padding), so the control does not change
// width when the choice moves. Items are at least --hit-area-min tall to the pointer (DS-A11Y-001).
//
// Keyboard: one tab stop for the group, arrow keys move between items (Radix roving focus), Space or
// Enter chooses. Once a value is chosen it cannot be cleared: pressing the chosen item again does
// nothing, because Radix single ToggleGroup would otherwise send "" and leave no selection.
//
// Use it for 2 to 5 short, mutually exclusive views or modes shown side by side (vois-components Job 5,
// and the ToggleGroup answer to LOOKALIKE-003). For a choice inside a form, use RadioGroup. For panels
// of content, use Tabs.
//
// Which state wins: disabled, then focus, then active, then inactive. Figma has no disabled active
// state: a disabled chosen item drops the white indicator and keeps a 1px --border-state-disabled edge,
// so the choice stays visible. The active rules are guarded with not-disabled.
import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

type ToggleGroupProps = Omit<
  React.ComponentProps<typeof ToggleGroupPrimitive.Root>,
  "type" | "value" | "defaultValue" | "onValueChange"
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

function ToggleGroup({ className, value: valueProp, defaultValue, onValueChange, ...props }: ToggleGroupProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "")
  const controlled = valueProp !== undefined
  const value = controlled ? valueProp : uncontrolled
  const handleValueChange = React.useCallback(
    (next: string) => {
      // Radix sends "" when the chosen item is pressed again. Ignore it: a segmented control always
      // keeps a choice once one is made.
      if (!next) return
      if (!controlled) setUncontrolled(next)
      onValueChange?.(next)
    },
    [controlled, onValueChange]
  )
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      type="single"
      value={value}
      onValueChange={handleValueChange}
      className={cn(
        "group/segments inline-flex h-[var(--size-32)] w-fit items-stretch rounded-[var(--shape-subtle)] bg-[color:var(--segment-inactive)]",
        className
      )}
      {...props}
    />
  )
}

const toggleGroupItemClasses = [
  "group/segment relative inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center px-[calc((var(--size-32)-var(--size-28))/2)] whitespace-nowrap select-none",
  "first:rounded-l-[var(--shape-subtle)] last:rounded-r-[var(--shape-subtle)]",
  "text-[length:var(--font-size-small)] leading-[var(--line-height-small)] [font-weight:var(--font-weight-medium)] text-[color:var(--text-state-resting)]",
  "after:absolute after:top-1/2 after:left-0 after:h-full after:min-h-[var(--hit-area-min)] after:w-full after:-translate-y-1/2 after:content-['']",
  "transition-[background-color,color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
  // Inactive focus: the ring sits inside the cell. On the chosen item the ring moves to the indicator.
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[color:var(--segment-focus-ring)] focus-visible:bg-[color:var(--segment-focus-inactive)]",
  "data-[state=on]:not-disabled:text-[color:var(--text-on-light)] data-[state=on]:focus-visible:outline-transparent",
  "disabled:cursor-not-allowed disabled:bg-[color:var(--segment-disabled)] disabled:text-[color:var(--text-state-disabled)]",
]

const toggleGroupIndicatorClasses = [
  "inline-flex h-[var(--size-28)] w-full items-center justify-center gap-[var(--space-8)] rounded-[var(--radii-6)] px-[var(--space-12)]",
  "transition-[background-color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
  "group-data-[state=on]/segment:group-enabled/segment:bg-[color:var(--segment-active)] group-data-[state=on]/segment:group-enabled/segment:shadow-[inset_0_0_0_1px_var(--border-default),var(--shadow-base)]",
  "group-data-[state=on]/segment:group-enabled/segment:group-focus-visible/segment:shadow-[inset_0_0_0_2px_var(--segment-focus-ring),var(--shadow-base)]",
  "group-data-[state=on]/segment:group-disabled/segment:shadow-[inset_0_0_0_1px_var(--border-state-disabled)]",
]

function ToggleGroupItem({ className, children, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item data-slot="toggle-group-item" className={cn(toggleGroupItemClasses, className)} {...props}>
      <span data-slot="toggle-group-indicator" className={cn(toggleGroupIndicatorClasses)}>
        {children}
      </span>
    </ToggleGroupPrimitive.Item>
  )
}

const SegmentedControl = ToggleGroup
const SegmentedControlItem = ToggleGroupItem

export { ToggleGroup, ToggleGroupItem, SegmentedControl, SegmentedControlItem }

// Vois Calendar. shadcn/ui's components/ui/calendar.tsx (react-day-picker) with the same parts: Calendar and
// CalendarDayButton. It takes DayPicker's props (mode, selected, onSelect, disabled, and the rest). Drawn as the
// Figma Calendar Picker (`4646:6331`) and its Date Picker Dates set (`2719:4635`) in the Vois Figma file.
//
// From Figma:
//   Card: --bg-card fill, 1px --border-default edge, --shape-subtle corners, 12 padding, 8 between the header,
//     the weekday row and the dates, --shadow-medium.
//   Header: the month and year on the left, a previous and a next chevron on the right.
//   Weekday row: two letters ("Su"), medium, one cell wide each.
//   Date cell: --shape-subtle corners, medium text.
//     Resting --text-state-resting. Hover --bg-hover fill with --text-state-active. Selected --select-solid-active
//     fill with --text-on-dark. Disabled --text-state-disabled. A day from the next or last month looks disabled
//     but can still be chosen.
//
// Gaps in Figma, with the choice made here:
//   - Today has no look in Figma. It gets a 1px --border-default edge, so it is not told apart by color alone.
//   - Focus has no look. A 2px --border-state-focus outline is drawn inside the cell.
//   - Range start, middle and end have no look. A selected range uses the Selected look on its ends and
//     --select-soft-active with --text-accent in the middle.
//   - Figma draws a small caret after the month. Here the month is a label. For month and year menus pass
//     `captionLayout="dropdown"` (they are the plain browser selects, unstyled beyond color).
//
// Sized up from Figma on purpose. Figma draws 19 by 24 cells with 10px text, which fails DS-A11Y-001 (hit area under
// 44) and is too small to read. Here every date and both nav buttons are --hit-area-min (44) square with no gap, so
// the hit areas never overlap (48 on a coarse pointer, --hit-area-coarse). The visible fill is a 36 square inside the
// hit area, text is 14/20. The
// card is 7 cells plus padding wide (332). Figma's own sizes are listed in FIGMA-TODO.md.
//
// Keyboard (react-day-picker): one tab stop on the grid (the selected day, or today, or the first day). Arrow keys
// move a day or a week, Home and End go to the start and end of the week, PageUp and PageDown change the month
// (with Shift, the year), Enter and Space choose the day.
//
// Use it to choose a date or a range on its own, or inside a Popover for a date field. A date field the person
// can type in is a DateField, not a Calendar.
import * as React from "react"
import { DayPicker, type DayButton } from "react-day-picker"

import { cn } from "@/lib/utils"

function Chevron({ orientation = "left", className, ...props }: { orientation?: string; className?: string } & Omit<React.ComponentProps<"svg">, "orientation" | "className">) {
  const paths: Record<string, string> = { left: "m15 18-6-6 6-6", right: "m9 18 6-6-6-6", up: "m18 15-6-6-6 6", down: "m6 9 6 6 6-6" }
  const d = paths[orientation] ?? paths.left
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cn("size-4", className)} {...props}>
      <path d={d} />
    </svg>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      formatters={formatters}
      data-slot="calendar"
      className={cn(
        "relative w-fit [--cal-cell:var(--hit-area-min)] [@media(any-pointer:coarse)]:[--cal-cell:var(--hit-area-coarse)] rounded-[var(--shape-subtle)] border border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-[var(--space-12)] shadow-[var(--shadow-medium)]",
        className,
      )}
      classNames={{
        root: "w-fit",
        months: "flex flex-col gap-[var(--space-8)]",
        month: "flex flex-col gap-[var(--space-8)]",
        nav: "absolute top-[var(--space-12)] right-[var(--space-12)] flex items-center",
        button_previous: "relative inline-flex size-[var(--cal-cell)] cursor-pointer items-center justify-center rounded-[var(--shape-subtle)] text-[color:var(--text-state-resting)] hover:text-[color:var(--text-state-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)] aria-disabled:pointer-events-none aria-disabled:text-[color:var(--text-state-disabled)]",
        button_next: "relative inline-flex size-[var(--cal-cell)] cursor-pointer items-center justify-center rounded-[var(--shape-subtle)] text-[color:var(--text-state-resting)] hover:text-[color:var(--text-state-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)] aria-disabled:pointer-events-none aria-disabled:text-[color:var(--text-state-disabled)]",
        month_caption: "flex h-[var(--cal-cell)] items-center",
        dropdowns: "flex items-center gap-[var(--space-4)]",
        dropdown_root: "relative",
        dropdown: "absolute inset-0 cursor-pointer opacity-0",
        caption_label: "text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-semi-bold)] text-[color:var(--text-primary)]",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "flex w-[var(--cal-cell)] items-center justify-center text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-medium)] text-[color:var(--text-state-disabled)]",
        weeks: "mt-[var(--space-8)] flex flex-col",
        week: "flex",
        day: "group/day relative w-[var(--cal-cell)] p-0 text-center select-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className }) => <Chevron orientation={orientation} className={className} />,
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({ className, day, modifiers, ...props }: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const rangeMiddle = Boolean((modifiers as Record<string, boolean>).range_middle)
  const rangeEdge = Boolean((modifiers as Record<string, boolean>).range_start || (modifiers as Record<string, boolean>).range_end)
  const selectedSingle = modifiers.selected && !rangeMiddle

  return (
    <button
      ref={ref}
      type="button"
      data-slot="calendar-day"
      aria-current={modifiers.today ? "date" : undefined}
      data-day={day.date.toLocaleDateString()}
      data-selected-single={selectedSingle && !rangeEdge ? "true" : undefined}
      data-range-edge={rangeEdge ? "true" : undefined}
      data-range-middle={rangeMiddle ? "true" : undefined}
      className={cn(
        "group/btn flex h-[var(--cal-cell)] w-full min-w-0 cursor-pointer items-center justify-center rounded-[var(--shape-subtle)] bg-transparent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)]",
        "disabled:pointer-events-none",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none flex h-9 w-9 items-center justify-center rounded-[var(--shape-subtle)]",
          "text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-medium)] text-[color:var(--text-state-resting)]",
          "transition-[background-color,color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
          "group-hover/btn:bg-[color:var(--bg-hover)] group-hover/btn:text-[color:var(--text-state-active)]",
          "group-data-[today]/day:border group-data-[today]/day:border-[color:var(--border-default)]",
          "group-data-[outside]/day:text-[color:var(--text-state-disabled)]",
          "group-data-[range-middle=true]/btn:bg-[color:var(--select-soft-active)] group-data-[range-middle=true]/btn:text-[color:var(--text-accent)]",
          "group-data-[selected-single=true]/btn:bg-[color:var(--select-solid-active)] group-data-[selected-single=true]/btn:text-[color:var(--text-on-dark)]",
          "group-data-[range-edge=true]/btn:bg-[color:var(--select-solid-active)] group-data-[range-edge=true]/btn:text-[color:var(--text-on-dark)]",
          "group-disabled/btn:text-[color:var(--text-state-disabled)]",
        )}
      >
        {props.children}
      </span>
    </button>
  )
}

export { Calendar, CalendarDayButton }

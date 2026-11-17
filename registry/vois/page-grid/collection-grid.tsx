// Vois CollectionGrid. There is no shadcn/ui equivalent. It is a grid of equal cards, tiles or logos, whose
// column count is the collection formula of vois-tokens references/grid.md (DS-GRID-007), written in CSS:
//
//   count = max(1, min(cap, floor((inner + gutter) / (itemMin + gutter))))
//
// `itemMin` is one of the item tokens: "icon-tile" --item-min-icon-tile, "logo" --item-min-logo, "card"
// --item-min-card (the default), "plan" --item-min-plan or "story" --item-min-story. Pick it from the
// page template's `collections` entry. The width of an item sets the count, so it never hard-codes
// a fixed number of columns, and a tile never drops below `itemMin` unless the count is already 1.
//
// `cap` is the most columns at each grid class of the region (DS-GRID-001): narrow, sm, md and lg, from
// the template. A class you leave out takes the one before it, and `narrow` starts at 1. A value that is not
// a whole number of 1 or more is read as 1, which is the safe direction: fewer, wider columns.
// The cap is the second term inside max(): the width of one column when exactly `cap` columns fill the
// row. So the count can't go above the cap and the cards still fill the row.
//
// The gap is --grid-gutter (DS-GRID-004). Like the cap, it measures the region: put the grid inside a
// PageFrame, or inside any element with `@container`. A container query cannot read a token, so the class
// starts below repeat --breakpoint-sm, --breakpoint-md and --breakpoint-lg (600, 768, 1024). If those
// tokens change, change them here.
//
// Larger text raises `itemMin`, never the margins or the gutter (DS-GRID-008). The grid is a list (ul and
// li), because a collection is a set of like items (DS-A11Y-011).
import * as React from "react"

import { cn } from "@/lib/utils"

type GridClass = "narrow" | "sm" | "md" | "lg"
type ItemMin = "icon-tile" | "logo" | "card" | "plan" | "story"
type Cap = Partial<Record<GridClass, number>>

const ITEM_MIN: Record<ItemMin, string> = {
  "icon-tile": "var(--item-min-icon-tile)",
  logo: "var(--item-min-logo)",
  card: "var(--item-min-card)",
  plan: "var(--item-min-plan)",
  story: "var(--item-min-story)",
}

const whole = (n: unknown): number | undefined => (typeof n === "number" && Number.isInteger(n) && n >= 1 ? n : undefined)

// A class you leave out takes the one before it. A bad value is read as 1, not as "no cap".
function resolveCap(cap: Cap | undefined): Record<GridClass, number> {
  const out = {} as Record<GridClass, number>
  let prev = 1
  for (const id of ["narrow", "sm", "md", "lg"] as const) {
    const given = cap?.[id]
    prev = given === undefined ? prev : (whole(given) ?? 1)
    out[id] = prev
  }
  return out
}

const COLUMNS =
  "repeat(auto-fill, minmax(max(min(100%, var(--item-min)), calc((100% - (var(--cap) - 1) * var(--grid-gutter)) / var(--cap))), 1fr))"

function CollectionGrid({
  className,
  style,
  itemMin = "card",
  cap,
  ...props
}: React.ComponentProps<"ul"> & { itemMin?: ItemMin; cap?: Cap }) {
  const caps = resolveCap(cap)
  const min = Object.hasOwn(ITEM_MIN, itemMin) ? ITEM_MIN[itemMin] : ITEM_MIN.card
  return (
    <ul
      data-slot="collection-grid"
      data-item-min={itemMin}
      className={cn(
        "m-0 grid list-none gap-[var(--grid-gutter)] p-0",
        "[--cap:var(--cap-narrow)] @min-[600px]:[--cap:var(--cap-sm)] @min-[768px]:[--cap:var(--cap-md)] @min-[1024px]:[--cap:var(--cap-lg)]",
        className
      )}
      style={
        {
          "--item-min": min,
          "--cap-narrow": caps.narrow,
          "--cap-sm": caps.sm,
          "--cap-md": caps.md,
          "--cap-lg": caps.lg,
          gridTemplateColumns: COLUMNS,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

function CollectionGridItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="collection-grid-item" className={cn("min-w-0", className)} {...props} />
}

export { CollectionGrid, CollectionGridItem }
export type { Cap as CollectionCap, GridClass, ItemMin }

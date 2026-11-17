// Vois PageFrame. There is no shadcn/ui equivalent. It is the page region of vois-tokens references/grid.md
// (DS-GRID-003 to DS-GRID-006): it makes the space the page is given a size container, holds the content at
// --grid-content-max, and pads each side by the margin.
//
//   PageFrame: the region. `container-type: inline-size`, so the margin and gutter tokens, which are
//     written in container units (100cqi), measure this region and not the window (DS-GRID-006). Put it
//     where the page area starts, after any side navigation, so its width is the region width.
//     `fill` is a page whose template says frame "fill" (a dashboard, data grid, report or split view):
//     no content max, the content fills the region (DS-GRID-003).
//
// The side padding is the larger of --grid-margin and the safe-area inset on that side (DS-GRID-005). It uses
// the start and end sides, so a right-to-left page puts the larger inset on the right. The content max
// holds the content, not the margins: the padding sits outside it (a content box), the same sum as
// `frame()` in vois-tokens scripts/grid-logic.mjs.
//
// Children that lay out a collection (CollectionGrid) read the width of this region with a container query, so
// put them inside a PageFrame, or inside any element with `@container`.
import * as React from "react"

import { cn } from "@/lib/utils"

function PageFrame({
  className,
  fill = false,
  children,
  ...props
}: React.ComponentProps<"div"> & { fill?: boolean }) {
  return (
    <div data-slot="page-frame" data-frame={fill ? "fill" : "content"} className={cn("@container w-full", className)} {...props}>
      <div
        data-slot="page-frame-content"
        className={cn(
          "box-content ps-[max(var(--grid-margin),var(--safe-start))] pe-[max(var(--grid-margin),var(--safe-end))]",
          "[--safe-start:env(safe-area-inset-left,0px)] [--safe-end:env(safe-area-inset-right,0px)]",
          "rtl:[--safe-start:env(safe-area-inset-right,0px)] rtl:[--safe-end:env(safe-area-inset-left,0px)]",
          !fill && "mx-auto max-w-[var(--grid-content-max)]"
        )}
      >
        {children}
      </div>
    </div>
  )
}

export { PageFrame }

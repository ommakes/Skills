// Vois Separator: shadcn/ui's Separator (Radix) on Vois tokens. A 1px line that divides groups a reader should take
// as separate. Use it sparingly, mainly in lists and menus. The vois-patterns marketing rules say no dividers on a
// marketing page; for air between groups use spacing, and for separate surfaces use vois-card.
//
// Horizontal is the default. A vertical one takes the height of its row (self-stretch in a flex row), or set a
// height. `decorative` is on by default here, as in shadcn: the line has no role and screen readers skip it. Set
// decorative={false} when the line is the only thing that shows a division, and the reader needs to hear it.
// Color is --border-default.
import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-[color:var(--border-default)] data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }

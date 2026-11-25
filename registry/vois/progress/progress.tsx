// Vois Progress: shadcn/ui's Progress (Radix) on Vois tokens. A bar that shows how far a task has come, or an
// indeterminate sweep while the length is unknown. It is display only. For a reading such as storage used, it is
// the wrong part (a meter); for a short wait with no end, use vois-spinner.
//
// Parts: Progress (the track and the progressbar role) and the fill inside it.
//   Track: --space-8 tall, --shape-pill, --control-off. The fill is --control-on.
//   Value: the fill moves with a transform, eased on --motion-duration-base. Reduced motion jumps with no ease.
//   Indeterminate (no value): a fill 40% wide sweeps across on --motion-duration-spin. Under reduced motion the
//     fill is still and full width (DS-ANIMATION-004).
//
// Where this differs from Radix (see vois-components/behaviors/progress.md):
//   Radix does not clamp. A value below 0 or above max turns the bar indeterminate and logs console.error. This
//   item clamps to 0 through max first. A value that is not a finite number is indeterminate.
//   Radix has no min. The range is 0 through max.
//
// You supply the name: pass aria-label or aria-labelledby. Nothing warns you if it is missing. The visible number,
// if you show one, needs aria-hidden so it is not read twice. Use aria-valuetext through getValueLabel for
// text such as "3 of 8 files".
import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const sweepKeyframes = "@keyframes vois-progress-sweep{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}"

function Progress({
  className,
  value,
  max = 100,
  ...props
}: Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "value" | "max"> & {
  /** 0 through max. Leave it out, or pass null, for the indeterminate state. */
  value?: number | null
  max?: number
}) {
  const safeMax = typeof max === "number" && Number.isFinite(max) && max > 0 ? max : 100
  const safeValue = typeof value === "number" && Number.isFinite(value) ? Math.min(Math.max(value, 0), safeMax) : null
  const percent = safeValue === null ? 0 : (safeValue / safeMax) * 100
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={safeValue}
      max={safeMax}
      className={cn(
        "relative h-[var(--space-8)] w-full overflow-hidden rounded-[var(--shape-pill)] bg-[color:var(--control-off)]",
        className
      )}
      {...props}
    >
      <style>{sweepKeyframes}</style>
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full rounded-[var(--shape-pill)] bg-[color:var(--control-on)]",
          "transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
          "data-[state=indeterminate]:w-2/5 data-[state=indeterminate]:transition-none",
          "data-[state=indeterminate]:motion-safe:animate-[vois-progress-sweep_var(--motion-duration-spin)_linear_infinite]",
          "data-[state=indeterminate]:motion-reduce:w-full"
        )}
        style={safeValue === null ? undefined : { transform: `translateX(-${100 - percent}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }

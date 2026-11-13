// Vois Spinner: one open arc turning in a circle. Use it instead of a hand-rolled spinning icon
// (vois-components LOOKALIKE-002). The Button's `loading` prop uses it.
//
// One turn takes --motion-duration-spin (vois-tokens DS-MOTION-001). Under reduced motion the arc stays
// still (DS-ANIMATION-004). The color is currentColor; sizes use the size tokens.
//
// The arc's geometry is from "Arc" in loading-dev (https://loading.dev/spinners/arc):
//   MIT License. Copyright (c) 2026 Jakub Krehel.
//   Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
//   associated documentation files (the "Software"), to deal in the Software without restriction,
//   including without limitation the rights to use, copy, modify, merge, publish, distribute,
//   sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
//   furnished to do so, subject to the following conditions: The above copyright notice and this
//   permission notice shall be included in all copies or substantial portions of the Software.
//   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
//   NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
//   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
//   OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
//   CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const spinnerVariants = cva(
  "shrink-0 animate-[spin_var(--motion-duration-spin)_linear_infinite] motion-reduce:animate-none",
  {
    variants: {
      size: {
        sm: "size-[var(--size-icon-small)]",
        default: "size-[var(--size-20)]",
        lg: "size-[var(--size-icon-medium)]",
      },
    },
    defaultVariants: { size: "default" },
  }
)

type SpinnerProps = Omit<React.ComponentProps<"svg">, "children"> &
  VariantProps<typeof spinnerVariants> & {
    /** Text for screen readers when the spinner stands alone. Ignored when aria-hidden is set. */
    label?: string
  }

function Spinner({ className, size, label = "Loading", ...props }: SpinnerProps) {
  const hidden = props["aria-hidden"] === true || props["aria-hidden"] === "true"
  const svg = (
    <svg
      data-slot="spinner"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(spinnerVariants({ size }), className)}
      {...props}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="18 44.8" strokeLinecap="round" />
    </svg>
  )
  if (hidden) return svg
  // Standalone: a status region with real text, which screen readers read more reliably than a label on
  // the svg. A region mounted already filled may still not be announced: for a guaranteed announcement,
  // keep a role="status" element mounted and change its text.
  return (
    <span data-slot="spinner-status" role="status" className="inline-flex">
      {svg}
      <span className="sr-only">{label}</span>
    </span>
  )
}

export { Spinner, spinnerVariants }

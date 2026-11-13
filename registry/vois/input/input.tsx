// Vois Input. Replaces shadcn/ui's components/ui/input.tsx with the same API, plus `size`.
//
// Heights (vois-tokens DS-COMPONENT-007): default 36 (--size-field-web, web), native 48
// (--size-field-native), compact 32 (--size-field-compact, only for an inline field in a table or a
// dense row). States follow the Figma Input Field: resting, hover, focus (2px --border-state-focus),
// error (aria-invalid), disabled, read-only (no box) and prefill (data-prefill="true").
// Colors carry a `color:` type hint so tailwind-merge in cn() merges caller overrides.
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// The field box and its states. vois-select imports these for its trigger, so the two fields can't drift.
//
// Which state wins when two apply: disabled, then read-only, then error, then focus, then prefill, then
// hover. Tailwind v4 writes variants in a fixed order (hover, focus-visible, disabled, aria-*, data-*,
// then arbitrary variants), and at equal specificity the later rule wins. That order puts disabled over
// focus and hover, and error over focus and hover. Error (aria-*) and prefill (data-*) come after
// disabled, so they are guarded with not-disabled, and prefill with not-aria-invalid as well.
const fieldClasses = [
  "w-full min-w-0 rounded-[var(--radius-input)] border border-[color:var(--border-default)] bg-[color:var(--input-resting)]",
  "px-[var(--space-padding-small)] text-[color:var(--text-primary)] text-[length:var(--font-size-small)] leading-[var(--line-height-small)]",
  "transition-[color,background-color,border-color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
  "hover:border-[color:var(--border-state-hover)] hover:bg-[color:var(--input-hover)]",
  // Focus: the 2px Figma border, drawn as the border plus a 1px inset ring so the size never changes.
  "outline-none focus-visible:border-[color:var(--border-state-focus)] focus-visible:bg-[color:var(--input-focus)] focus-visible:shadow-[inset_0_0_0_1px_var(--border-state-focus)]",
  "data-[prefill=true]:not-aria-invalid:not-disabled:border-[color:var(--border-info)] data-[prefill=true]:not-aria-invalid:not-disabled:bg-[color:var(--input-prefill)]",
  "aria-invalid:not-disabled:border-[color:var(--border-negative)] aria-invalid:not-disabled:bg-[color:var(--input-negative)] aria-invalid:not-disabled:text-[color:var(--text-negative)]",
  "aria-invalid:focus-visible:shadow-[inset_0_0_0_1px_var(--border-negative)]",
  "disabled:cursor-not-allowed disabled:border-[color:var(--border-state-disabled)] disabled:bg-[color:var(--input-disabled)] disabled:text-[color:var(--text-state-disabled)]",
]

const inputVariants = cva(
  [
    ...fieldClasses,
    "placeholder:text-[color:var(--text-state-instruction)]",
    // Read-only shows the value as plain text, like the Figma Read-only state. :read-only also matches a
    // disabled input, so disabled is excluded.
    "[&:read-only:not(:disabled)]:border-transparent [&:read-only:not(:disabled)]:bg-transparent [&:read-only:not(:disabled)]:px-0 [&:read-only:not(:disabled)]:text-[color:var(--text-state-active)]",
    "file:border-0 file:bg-transparent file:text-[color:var(--text-primary)]",
  ],
  {
    variants: {
      size: {
        default: "h-[var(--size-field-web)]",
        native: "h-[var(--size-field-native)]",
        compact: "h-[var(--size-field-compact)]",
      },
    },
    defaultVariants: { size: "default" },
  }
)

type InputProps = Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants> & {
    /** Marks a value filled in for the user (autofill or a suggestion), as in the Figma Prefill state. */
    prefill?: boolean
  }

function Input({ className, type, size = "default", prefill = false, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      data-size={size}
      data-prefill={prefill ? "true" : undefined}
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  )
}

export { Input, inputVariants, fieldClasses }

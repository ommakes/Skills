// Vois Textarea. Replaces shadcn/ui's components/ui/textarea.tsx with the same API, plus `size`.
//
// The box and its states are the Vois Input's (fieldClasses), so the two fields can't drift. Which
// state wins when two apply is the Input's order: disabled, then read-only, then error, then focus, then
// prefill, then hover. Text is 16/24 like the Input and the Figma Text Box (Inputs page, 4739:3554),
// with --radius-input. Sizes: default uses the Input's 12px inline padding and 8px block padding, so
// its text lines up with the Inputs in the same form; native uses the Figma Text Box padding, 16 on
// every side.
//
// It grows with what the user types (vois-tokens DS-LAYOUT-FIELD-001 to 004): field-sizing: content
// with an explicit inline size (w-full), a minimum and maximum height in lines (1lh) plus the block
// padding and the 1px border on each side, and it scrolls inside once it reaches the maximum. The line
// counts default to 3 and 12 (vois-patterns PATH-FIELD-TEXTAREA-AUTOSIZE) and are set on the element,
// so a caller can change them with a class such as [--textarea-max-lines:8]. Browsers without
// field-sizing get the fallback: the rows attribute (3 unless given) and resize: vertical.
//
// It serves vois-components JOB-ACCEPT-TEXT (multi-line text: notes, a description, feedback).
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { fieldClasses } from "@/components/ui/input"

const textareaVariants = cva(
  [
    ...fieldClasses,
    "block py-[var(--textarea-pad)] placeholder:text-[color:var(--text-state-instruction)]",
    "[--textarea-min-lines:3] [--textarea-max-lines:12]",
    // Fallback for browsers without field-sizing: rows sets the height and the user can drag it taller.
    "resize-y",
    // DS-LAYOUT-FIELD-003: lines in lh, plus the block padding, plus the 1px top and bottom border
    // (border-box sizing counts the border in the height).
    "supports-[field-sizing:content]:field-sizing-content supports-[field-sizing:content]:resize-none supports-[field-sizing:content]:overflow-y-auto",
    "supports-[field-sizing:content]:min-h-[calc(var(--textarea-min-lines)*1lh+var(--textarea-pad)*2+2px)]",
    "supports-[field-sizing:content]:max-h-[calc(var(--textarea-max-lines)*1lh+var(--textarea-pad)*2+2px)]",
    // Read-only shows the value as plain text, like the Input. :read-only also matches a disabled
    // textarea, so disabled is excluded.
    "[&:read-only:not(:disabled)]:resize-none [&:read-only:not(:disabled)]:border-transparent [&:read-only:not(:disabled)]:bg-transparent [&:read-only:not(:disabled)]:px-0 [&:read-only:not(:disabled)]:text-[color:var(--text-state-active)]",
    "disabled:resize-none",
  ],
  {
    variants: {
      size: {
        default: "[--textarea-pad:var(--space-padding-x-small)]",
        native: "[--textarea-pad:var(--space-padding-medium)] px-[var(--space-padding-medium)]",
      },
    },
    defaultVariants: { size: "default" },
  }
)

type TextareaProps = React.ComponentProps<"textarea"> &
  VariantProps<typeof textareaVariants> & {
    /** Marks a value filled in for the user (autofill or a suggestion), as in the Input's Prefill state. */
    prefill?: boolean
  }

function Textarea({ className, size = "default", prefill = false, rows = 3, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      data-size={size}
      data-prefill={prefill ? "true" : undefined}
      rows={rows}
      className={cn(textareaVariants({ size }), className)}
      {...props}
    />
  )
}

export { Textarea, textareaVariants }

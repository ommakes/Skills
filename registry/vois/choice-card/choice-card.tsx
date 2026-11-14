// Vois ChoiceCard. A card with a label, a description and a radio or checkbox on the right, for a
// choice that reads better as a tile (a plan, a delivery speed). It uses the groups from
// vois-choice-list (ChoiceRadioGroup, ChoiceCheckboxGroup), which compose vois-radio-group and
// vois-checkbox.
//
// From the Figma Radio Card and Checkbox Card sets (Selectors page):
//   Size: 20 top and bottom padding, 16 left and right, --radius-selectors corners, the control in a 32
//     box on the right with 8 between it and the text. Width fills the container.
//   Surface: --bg-card with the --shadow-base elevation (the Figma Elevation/Base style).
//   Text: label 16/24 semibold --text-primary; optional description 14/20 medium --text-state-resting, right under it
//     (no gap, as in the Radio Card: 84 tall with both lines).
//   Body: optional children, shown under the label row. Keep it non-interactive: it sits inside the label.
//   Resting: 1px --border-default inside edge. Hover: 1px --border-state-hover.
//   Active (checked): 2px --border-state-active.
//   Focus (the control has keyboard focus): 2px --border-state-focus on the card, as in Figma, and the
//     control keeps its own ring.
//   Not in Figma, added with the nearest tokens: negative (`invalid` on the group) is a --border-negative
//     edge (2px when checked); disabled is a --border-state-disabled edge with --text-state-disabled text.
//
// The whole card is the click target: it is a <label> around the control. The control is named by the
// label and described by the description.
//
// Which state wins: disabled, then focus, then negative, then checked, then hover, then resting. The
// state is worked out in React (useChoiceItem) and picks one set of classes; hover exists only on the
// resting card, and the focus edge is a :has(:focus-visible) rule that a disabled control can never meet.
//
// vois-components: a selectable card group (LOOKALIKE-003), built on real radios and checkboxes.
import * as React from "react"
import { cva } from "class-variance-authority"

import { ChoiceControl, negativeControlClass, useChoiceItem } from "@/components/ui/choice-list"
import { cn } from "@/lib/utils"

const choiceCardVariants = cva(
  [
    "flex w-full flex-col rounded-[var(--radius-selectors)] bg-[color:var(--bg-card)] px-[var(--space-16)] py-[var(--space-20)] text-left",
    "transition-[box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
  ],
  {
    variants: {
      state: {
        resting:
          "cursor-pointer shadow-[inset_0_0_0_1px_var(--border-default),var(--shadow-base)] hover:shadow-[inset_0_0_0_1px_var(--border-state-hover),var(--shadow-base)] has-[[data-choice-control]:focus-visible]:shadow-[inset_0_0_0_2px_var(--border-state-focus),var(--shadow-base)]",
        checked:
          "cursor-pointer shadow-[inset_0_0_0_2px_var(--border-state-active),var(--shadow-base)] has-[[data-choice-control]:focus-visible]:shadow-[inset_0_0_0_2px_var(--border-state-focus),var(--shadow-base)]",
        invalid:
          "cursor-pointer shadow-[inset_0_0_0_1px_var(--border-negative),var(--shadow-base)] has-[[data-choice-control]:focus-visible]:shadow-[inset_0_0_0_2px_var(--border-state-focus),var(--shadow-base)]",
        disabled: "cursor-not-allowed shadow-[inset_0_0_0_1px_var(--border-state-disabled),var(--shadow-base)]",
      },
    },
    defaultVariants: { state: "resting" },
  }
)

function ChoiceCardItem({
  value,
  label,
  description,
  disabled: itemDisabled,
  className,
  children,
  ...props
}: React.ComponentProps<"label"> & {
  value: string
  label: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
}) {
  const { ctx, checked, disabled, state } = useChoiceItem(value, itemDisabled)
  const id = React.useId()
  const labelId = `${id}-label`
  const descriptionId = description ? `${id}-description` : undefined
  const controlClass = state === "invalid" ? negativeControlClass(ctx.kind) : undefined
  return (
    <label
      data-slot="choice-card"
      data-state={checked ? "checked" : "unchecked"}
      data-disabled={disabled ? "" : undefined}
      data-invalid={ctx.invalid ? "" : undefined}
      className={cn(choiceCardVariants({ state }), state === "invalid" && checked && "shadow-[inset_0_0_0_2px_var(--border-negative),var(--shadow-base)]", className)}
      {...props}
    >
      <span className="flex items-center gap-[var(--space-8)]">
        <span className="flex min-w-0 flex-1 flex-col">
          <span
            id={labelId}
            data-slot="choice-card-label"
            className={cn(
              "text-[length:var(--font-size-small)] leading-[var(--line-height-small)] [font-weight:var(--font-weight-semi-bold)]",
              disabled ? "text-[color:var(--text-state-disabled)]" : "text-[color:var(--text-primary)]"
            )}
          >
            {label}
          </span>
          {description ? (
            <span
              id={descriptionId}
              data-slot="choice-card-description"
              className={cn(
                "text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-medium)]",
                disabled ? "text-[color:var(--text-state-disabled)]" : "text-[color:var(--text-state-resting)]"
              )}
            >
              {description}
            </span>
          ) : null}
        </span>
        <span className="flex size-[var(--size-32)] shrink-0 items-center justify-center">
          <ChoiceControl ctx={ctx} value={value} checked={checked} disabled={disabled} labelId={labelId} descriptionId={descriptionId} className={controlClass} />
        </span>
      </span>
      {children ? (
        <span data-slot="choice-card-body" className="mt-[var(--space-8)] block">
          {children}
        </span>
      ) : null}
    </label>
  )
}

export { ChoiceCardItem, choiceCardVariants }

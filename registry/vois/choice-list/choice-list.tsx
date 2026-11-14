// Vois ChoiceList. A list of full-width rows, each a label with a radio or a checkbox on the left. It
// composes vois-radio-group and vois-checkbox and does not restyle them beyond the states below.
//
// From the Figma Radio Select and Checkbox Select sets (Selectors page). One row style for both:
//   Size: at least 56 tall (--size-56), 8 padding, a 32 box for the control, 12 gap
//     (--space-padding-small), --radius-buttons-and-controls corners. Long labels wrap and the row grows.
//   Text: label 16/24 medium; optional description 12/16 medium --text-state-resting (--text-auxiliary on the aux rows).
//   Resting: --select-resting, label --text-state-resting.
//   Hover: --select-hover, label --text-state-hover. Pressed: --select-pressed, label --text-state-hover.
//   Active (checked): --select-soft-active with a 2px --border-accent inside edge, label --text-state-hover.
//   Negative (`invalid` on the group): --select-negative, label --text-negative, and the unchecked
//     control's edge turns --border-negative (the checkbox also fills with --bg-negative).
//   Disabled: no fill, label and description --text-state-disabled, the control's own disabled look.
//   `variant="aux"`: the Figma Hover-Aux and Active-Aux rows. Hover and checked fill with --select-aux,
//     label --text-auxiliary, the control turns --control-oncolor (the checkbox mark --control-aux), and
//     checked adds a 2px --border-aux edge. At rest it is the default row.
// Figma has no focus row: keyboard focus goes to the control and shows the control's own ring.
//
// The whole row is the click target: the row is a <label> around the control, so a click anywhere on
// it toggles the control. The control is named by the label text and described by the description.
//
// Which state wins: disabled, then negative, then checked, then pressed, then hover, then resting. The
// state is worked out in React from the group's value and written to the row as data-state,
// data-disabled and data-invalid; each state picks one set of classes, and hover and pressed classes
// exist only on the resting row, so no two states compete in CSS.
//
// Use ChoiceRadioGroup for one choice among options that each need a line of explanation, and
// ChoiceCheckboxGroup for several (vois-components JOB-BINARY-PREFERENCE, and instead of hand-built
// selectable rows, LOOKALIKE-003). For a choice that reads better as a tile, use vois-choice-card with
// the same groups.
import * as React from "react"
import { cva } from "class-variance-authority"

import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

type ChoiceVariant = "default" | "aux"

type ChoiceGroupContextValue =
  | { kind: "radio"; value: string; disabled: boolean; invalid: boolean; variant: ChoiceVariant }
  | {
      kind: "checkbox"
      value: string[]
      toggle: (item: string, checked: boolean) => void
      disabled: boolean
      invalid: boolean
      variant: ChoiceVariant
      name?: string
    }

const ChoiceGroupContext = React.createContext<ChoiceGroupContextValue | null>(null)

function useControllable<T>(prop: T | undefined, defaultProp: T, onChange?: (value: T) => void) {
  const [inner, setInner] = React.useState(defaultProp)
  const controlled = prop !== undefined
  const value = controlled ? prop : inner
  const set = React.useCallback(
    (next: T) => {
      if (!controlled) setInner(next)
      onChange?.(next)
    },
    [controlled, onChange]
  )
  return [value, set] as const
}

// One choice: Radix RadioGroup, so it keeps arrow keys and one tab stop.
function ChoiceRadioGroup({
  value: valueProp,
  defaultValue,
  onValueChange,
  disabled = false,
  invalid = false,
  variant = "default",
  className,
  ...props
}: React.ComponentProps<typeof RadioGroup> & { invalid?: boolean; variant?: ChoiceVariant }) {
  const [value, setValue] = useControllable(valueProp, defaultValue ?? "", onValueChange)
  const ctx = React.useMemo<ChoiceGroupContextValue>(() => ({ kind: "radio", value, disabled, invalid, variant }), [value, disabled, invalid, variant])
  return (
    <ChoiceGroupContext.Provider value={ctx}>
      <RadioGroup
        data-slot="choice-radio-group"
        value={value}
        onValueChange={setValue}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={className}
        {...props}
      />
    </ChoiceGroupContext.Provider>
  )
}

// Several choices: a role="group" holding checkboxes, with the checked values as an array. Order follows
// the order of checking; compare it as a set.
function ChoiceCheckboxGroup({
  value: valueProp,
  defaultValue,
  onValueChange,
  disabled = false,
  invalid = false,
  variant = "default",
  name,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  disabled?: boolean
  invalid?: boolean
  variant?: ChoiceVariant
  name?: string
}) {
  const [value, setValue] = useControllable(valueProp, defaultValue ?? [], onValueChange)
  const toggle = React.useCallback(
    (item: string, checked: boolean) => {
      const rest = value.filter((v) => v !== item)
      setValue(checked ? [...rest, item] : rest)
    },
    [value, setValue]
  )
  const ctx = React.useMemo<ChoiceGroupContextValue>(
    () => ({ kind: "checkbox", value, toggle, disabled, invalid, variant, name }),
    [value, toggle, disabled, invalid, variant, name]
  )
  return (
    <ChoiceGroupContext.Provider value={ctx}>
      <div role="group" data-slot="choice-checkbox-group" className={cn("grid gap-[var(--space-v-between-items)]", className)} {...props} />
    </ChoiceGroupContext.Provider>
  )
}

type ChoiceState = "resting" | "checked" | "invalid" | "disabled"

// The state of one item, in the order that wins, and the control to render. Shared by vois-choice-card.
function useChoiceItem(value: string, itemDisabled: boolean | undefined) {
  const ctx = React.useContext(ChoiceGroupContext)
  if (!ctx) throw new Error("A choice item must be inside ChoiceRadioGroup or ChoiceCheckboxGroup.")
  const checked = ctx.kind === "radio" ? ctx.value === value : ctx.value.includes(value)
  const disabled = ctx.disabled || !!itemDisabled
  const state: ChoiceState = disabled ? "disabled" : ctx.invalid ? "invalid" : checked ? "checked" : "resting"
  return { ctx, checked, disabled, state }
}

type ChoiceControlProps = {
  ctx: ChoiceGroupContextValue
  value: string
  checked: boolean
  disabled: boolean
  labelId: string
  descriptionId?: string
  className?: string
}

// The radio or checkbox, named by the item's label. className carries the per-state overrides.
function ChoiceControl({ ctx, value, checked, disabled, labelId, descriptionId, className }: ChoiceControlProps) {
  const a11y = { "aria-labelledby": labelId, "aria-describedby": descriptionId }
  if (ctx.kind === "radio") {
    return <RadioGroupItem data-choice-control="" value={value} disabled={disabled} className={className} {...a11y} />
  }
  return (
    <Checkbox
      data-choice-control=""
      name={ctx.name}
      value={value}
      checked={checked}
      onCheckedChange={(c) => ctx.toggle(value, c === true)}
      disabled={disabled}
      aria-invalid={ctx.invalid || undefined}
      className={className}
      {...a11y}
    />
  )
}

// The negative edge for an unchecked, enabled control in an invalid group (Figma Negative rows).
function negativeControlClass(kind: "radio" | "checkbox") {
  return kind === "radio"
    ? "shadow-[inset_0_0_0_3px_var(--border-negative)]"
    : "shadow-[inset_0_0_0_2px_var(--border-negative)] bg-[color:var(--bg-negative)]"
}

const choiceRowVariants = cva(
  [
    "group/choice flex min-h-[var(--size-56)] w-full items-center gap-[var(--space-padding-small)] rounded-[var(--radius-buttons-and-controls)] p-[var(--space-padding-x-small)] text-left",
    "transition-[background-color,box-shadow,color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
  ],
  {
    variants: {
      state: {
        resting:
          "cursor-pointer bg-[color:var(--select-resting)] text-[color:var(--text-state-resting)] active:bg-[color:var(--select-pressed)] active:text-[color:var(--text-state-hover)]",
        checked:
          "cursor-pointer bg-[color:var(--select-soft-active)] text-[color:var(--text-state-hover)] shadow-[inset_0_0_0_2px_var(--border-accent)]",
        invalid: "cursor-pointer bg-[color:var(--select-negative)] text-[color:var(--text-negative)]",
        disabled: "cursor-not-allowed bg-transparent text-[color:var(--text-state-disabled)]",
      },
      variant: { default: "", aux: "" },
    },
    compoundVariants: [
      { state: "resting", variant: "default", className: "hover:bg-[color:var(--select-hover)] hover:text-[color:var(--text-state-hover)]" },
      { state: "resting", variant: "aux", className: "hover:bg-[color:var(--select-aux)] hover:text-[color:var(--text-auxiliary)] active:bg-[color:var(--select-aux)] active:text-[color:var(--text-auxiliary)]" },
      { state: "checked", variant: "aux", className: "bg-[color:var(--select-aux)] text-[color:var(--text-auxiliary)] shadow-[inset_0_0_0_2px_var(--border-aux)]" },
    ],
    defaultVariants: { state: "resting", variant: "default" },
  }
)

// The control's look in an aux row: --control-oncolor on hover (unchecked) and when checked. A disabled
// control keeps its disabled look: the control's own disabled: and :not(:disabled) rules win in CSS.
function auxControlClass(kind: "radio" | "checkbox", checked: boolean) {
  if (kind === "radio") {
    return checked ? "data-[state=checked]:shadow-[inset_0_0_0_8px_var(--control-oncolor)]" : "group-hover/choice:shadow-[inset_0_0_0_3px_var(--control-oncolor)]"
  }
  return checked
    ? "data-[state=checked]:not-disabled:bg-[color:var(--control-oncolor)] text-[color:var(--control-aux)]"
    : "group-hover/choice:shadow-[inset_0_0_0_2px_var(--control-oncolor)]"
}

function ChoiceListItem({
  value,
  label,
  description,
  disabled: itemDisabled,
  className,
  ...props
}: Omit<React.ComponentProps<"label">, "children"> & {
  value: string
  label: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
}) {
  const { ctx, checked, disabled, state } = useChoiceItem(value, itemDisabled)
  const id = React.useId()
  const labelId = `${id}-label`
  const descriptionId = description ? `${id}-description` : undefined
  const controlClass =
    state === "invalid" ? negativeControlClass(ctx.kind) : ctx.variant === "aux" ? auxControlClass(ctx.kind, checked) : undefined
  return (
    <label
      data-slot="choice-list-item"
      data-state={checked ? "checked" : "unchecked"}
      data-disabled={disabled ? "" : undefined}
      data-invalid={ctx.invalid ? "" : undefined}
      data-variant={ctx.variant}
      className={cn(choiceRowVariants({ state, variant: ctx.variant }), className)}
      {...props}
    >
      <span className="flex size-[var(--size-32)] shrink-0 items-center justify-center">
        <ChoiceControl ctx={ctx} value={value} checked={checked} disabled={disabled} labelId={labelId} descriptionId={descriptionId} className={controlClass} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span id={labelId} data-slot="choice-list-label" className="text-[length:var(--font-size-small)] leading-[var(--line-height-small)] [font-weight:var(--font-weight-medium)]">
          {label}
        </span>
        {description ? (
          <span
            id={descriptionId}
            data-slot="choice-list-description"
            className={cn(
              "text-[length:var(--font-size-tiny)] leading-[var(--line-height-tiny)] [font-weight:var(--font-weight-medium)]",
              disabled
                ? "text-[color:var(--text-state-disabled)]"
                : [
                    "text-[color:var(--text-state-resting)]",
                    "group-data-[variant=aux]/choice:group-data-[state=checked]/choice:text-[color:var(--text-auxiliary)]",
                    "group-data-[variant=aux]/choice:group-not-data-[invalid]/choice:group-hover/choice:text-[color:var(--text-auxiliary)]",
                    "group-data-[variant=aux]/choice:group-not-data-[invalid]/choice:group-active/choice:text-[color:var(--text-auxiliary)]",
                  ]
            )}
          >
            {description}
          </span>
        ) : null}
      </span>
    </label>
  )
}

export { ChoiceRadioGroup, ChoiceCheckboxGroup, ChoiceListItem, ChoiceControl, choiceRowVariants, negativeControlClass, useChoiceItem }
export type { ChoiceState, ChoiceVariant }

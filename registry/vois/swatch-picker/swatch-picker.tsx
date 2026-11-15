// Vois SwatchPicker. Picks one color from a fixed set (a theme's palette, neutrals and status colors), with
// an optional None. shadcn/ui has no color picker. This is not a free color picker: there is no hue wheel and
// no hex input, because a design system's surfaces take a token, not any color.
//
// Trigger: a field like the Vois Select (fieldClasses from vois-input), compact by default (32, for an
//   inspector row) or `size="default"` (36). It shows a 16 swatch (--size-16, --shape-circle, a 1px
//   --border-overlap edge so a white swatch shows on a white field), the color's name and a chevron. Open
//   gets the field focus ring, as the Select does.
// Popup: a Radix Popover on --elevation-surface-popup with a --border-pretty edge, --radius-small-container,
//   --shadow-medium and --space-padding-small padding, on --z-dropdown (vois-tokens elevation.md). Each group
//   has a 14/20 medium --text-secondary heading. Swatches are 32 squares (--size-32, --radii-6) in rows of
//   `columns` (5 by default), --space-8 apart, each with the same 1px --border-overlap edge.
//   Chosen: a 2px ring in --text-primary outside a 2px gap in the popup fill. Focus: a 2px --control-focus
//   ring 2px outside the chosen ring, so the two never sit on the same pixels.
//   None: a full-width row under the swatches, a slashed circle and the word.
//
// It is one Radix RadioGroup, so the whole set is one tab stop and the arrow keys move through every swatch
// in reading order, choosing as they go (WAI-ARIA radio group). The popup stays open while you move, so the
// selection previews live; a pointer click, Enter or Escape closes it. Each swatch is named by its label (aria-label),
// so a screen reader hears "Neutral 10, radio button, 15 of 20". The visible name of the color is in the
// trigger, so nobody has to tell colors apart by hue alone (WCAG 1.4.1).
//
// Pass colors as any CSS color (a token reference, oklch, hex); the picker paints them and does not read
// them. Value is the swatch's `value` string, or "" for None.
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Popover as PopoverPrimitive, RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { fieldClasses } from "@/components/ui/input"

function ChevronDown(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="m6 9 6 6 6-6" /></svg>
}
function NoneIcon(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" {...props}><circle cx="12" cy="12" r="9" /><path d="m5.6 5.6 12.8 12.8" /></svg>
}

type Swatch = { value: string; label: string; color: string }
type SwatchGroup = { label: string; swatches: Swatch[] }

const triggerVariants = cva(
  [
    ...fieldClasses,
    "flex cursor-pointer items-center gap-[var(--space-8)] text-left whitespace-nowrap",
    "data-[state=open]:outline-[length:var(--focus-ring-width)] data-[state=open]:outline-offset-[var(--focus-ring-offset)] data-[state=open]:outline-[color:var(--border-state-focus)]",
  ],
  {
    variants: {
      size: {
        compact: "h-[var(--size-field-compact)]",
        default: "h-[var(--size-field-web)]",
      },
    },
    defaultVariants: { size: "compact" },
  }
)

const swatchEdge = "shadow-[inset_0_0_0_1px_var(--border-overlap)]"

type SwatchPickerProps = Omit<React.ComponentProps<"button">, "value" | "defaultValue" | "onChange" | "children"> &
  VariantProps<typeof triggerVariants> & {
    groups: SwatchGroup[]
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    /** Label for the None choice. Leave it out to offer no None. */
    noneLabel?: string
    columns?: number
  }

function SwatchPicker({
  className,
  size,
  groups,
  value: valueProp,
  defaultValue,
  onValueChange,
  noneLabel,
  columns = 5,
  disabled,
  ...props
}: SwatchPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "")
  const controlled = valueProp !== undefined
  const value = controlled ? valueProp : uncontrolled
  const setValue = (next: string) => {
    if (!controlled) setUncontrolled(next)
    onValueChange?.(next)
  }
  const all = groups.flatMap((g) => g.swatches)
  const chosen = all.find((s) => s.value === value)
  const baseId = React.useId()

  const item = (v: string, label: string, color?: string) => (
    <RadioGroupPrimitive.Item
      key={v || "none"}
      value={v}
      aria-label={label}
      title={color ? label : undefined}
      // Radix chooses a radio on arrow keys with a programmatic click (detail 0). Only a pointer click
      // (detail 1 or more) closes the popup, so moving with the arrows previews without closing.
      onClick={(e) => {
        if (e.detail > 0) setOpen(false)
      }}
      className={cn(
        "relative cursor-pointer rounded-[var(--radii-6)]",
        "focus-visible:outline-2 focus-visible:outline-offset-[calc(var(--focus-ring-offset)+4px)] focus-visible:outline-[color:var(--control-focus)]",
        "data-[state=checked]:shadow-[0_0_0_2px_var(--elevation-surface-popup),0_0_0_4px_var(--text-primary)]",
        color
          ? cn("size-[var(--size-32)]", swatchEdge)
          : cn(
              "col-span-full flex h-[var(--size-32)] items-center gap-[var(--space-8)] px-[var(--space-8)] text-[color:var(--text-primary)] hover:bg-[color:var(--bg-hover)]",
              "text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-medium)]"
            )
      )}
      style={color ? { background: color } : undefined}
    >
      {color ? null : (
        <>
          <NoneIcon className="size-[var(--size-20)] text-[color:var(--icon-secondary)]" />
          <span>{label}</span>
        </>
      )}
    </RadioGroupPrimitive.Item>
  )

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        data-slot="swatch-picker-trigger"
        disabled={disabled}
        className={cn(triggerVariants({ size }), className)}
        {...props}
      >
        {chosen ? (
          <span aria-hidden="true" className={cn("size-[var(--size-16)] shrink-0 rounded-[var(--shape-circle)]", swatchEdge)} style={{ background: chosen.color }} />
        ) : (
          <NoneIcon className="size-[var(--size-16)] shrink-0 text-[color:var(--icon-secondary)]" />
        )}
        <span className="min-w-0 flex-1 truncate">{chosen?.label ?? noneLabel ?? ""}</span>
        <ChevronDown className="size-[var(--size-icon-small)] shrink-0 text-[color:var(--icon-secondary)]" />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-slot="swatch-picker-content"
          align="start"
          sideOffset={8}
          collisionPadding={8}
          className="z-[var(--z-dropdown)] rounded-[var(--radius-small-container)] border border-[color:var(--border-pretty)] bg-[color:var(--elevation-surface-popup)] p-[var(--space-padding-small)] shadow-[var(--shadow-medium)]"
        >
          <RadioGroupPrimitive.Root
            value={value}
            onValueChange={setValue}
            // Enter chooses the focused swatch and closes. It is handled here because Radix RadioGroupItem
            // sets its own onKeyDown (which ignores Enter, as WAI-ARIA asks) and drops one passed to it.
            onKeyDown={(e) => {
              const v = e.target instanceof HTMLButtonElement ? e.target.value : null
              if (e.key === "Enter" && v !== null) {
                e.preventDefault()
                setValue(v)
                setOpen(false)
              }
            }}
            aria-label={typeof props["aria-label"] === "string" ? props["aria-label"] : undefined}
            className="flex flex-col gap-[var(--space-12)]"
          >
            {groups.map((g, gi) => (
              <div key={g.label} role="group" aria-labelledby={`${baseId}-g${gi}`} className="flex flex-col gap-[var(--space-8)]">
                <div
                  id={`${baseId}-g${gi}`}
                  className="text-[color:var(--text-secondary)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-medium)]"
                >
                  {g.label}
                </div>
                <div className="grid gap-[var(--space-8)]" style={{ gridTemplateColumns: `repeat(${columns}, max-content)` }}>
                  {g.swatches.map((s) => item(s.value, s.label, s.color))}
                </div>
              </div>
            ))}
            {noneLabel ? <div className="grid">{item("", noneLabel)}</div> : null}
          </RadioGroupPrimitive.Root>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

export { SwatchPicker }
export type { SwatchPickerProps, Swatch, SwatchGroup }

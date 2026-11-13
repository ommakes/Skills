// Vois Select. Replaces shadcn/ui's components/ui/select.tsx (Radix Select) with the same parts.
//
// The trigger is a field like the Vois Input: the same heights (default 36 web, native 48, compact 32
// for an inline field in a table, vois-tokens DS-COMPONENT-007) and the same --input-* states as the
// Figma Dropdown Field. The list follows the Figma Dropdown Menu and Menu Item: --bg-card, a
// --border-pretty border, --radius-small-container, --shadow-medium; items at least 40 tall with
// --select-* states, and the selected item in --select-soft-active with --text-accent.
// z-50 is shadcn's layer: the Vois file has no z-index variables yet (registry/FIGMA-TODO.md).
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Select as SelectPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { fieldClasses } from "@/components/ui/input"

function ChevronDown(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="m6 9 6 6 6-6" /></svg>
}
function ChevronUp(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="m18 15-6-6-6 6" /></svg>
}
function Check(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="M20 6 9 17l-5-5" /></svg>
}

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

const selectTriggerVariants = cva(
  [
    // The same box and states as the Vois Input, in the same order of which state wins.
    ...fieldClasses,
    "flex items-center justify-between gap-[var(--space-padding-x-small)] whitespace-nowrap",
    // data-* variants are written after disabled and aria-*, so each one here is guarded so that disabled
    // and error still win: the placeholder color skips a disabled trigger, and open skips an invalid one.
    "data-[placeholder]:not-disabled:text-[color:var(--text-state-instruction)]",
    "data-[state=open]:not-aria-invalid:border-[color:var(--border-state-focus)] data-[state=open]:not-aria-invalid:shadow-[inset_0_0_0_1px_var(--border-state-focus)]",
    "aria-invalid:data-[state=open]:shadow-[inset_0_0_0_1px_var(--border-negative)]",
    "[&>span]:truncate [&_svg]:pointer-events-none [&_svg]:shrink-0",
    "[&:disabled_[data-slot=select-icon]]:text-[color:var(--icon-state-disabled)]",
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

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & VariantProps<typeof selectTriggerVariants>) {
  return (
    <SelectPrimitive.Trigger data-slot="select-trigger" data-size={size} className={cn(selectTriggerVariants({ size }), className)} {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown data-slot="select-icon" className="size-[var(--size-20)] text-[color:var(--icon-secondary)]" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({ className, children, position = "popper", ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        className={cn(
          "relative z-50 max-h-(--radix-select-content-available-height) max-w-(--radix-select-content-available-width) min-w-[8rem] overflow-x-hidden overflow-y-auto",
          "rounded-[var(--radius-small-container)] border border-[color:var(--border-pretty)] bg-[color:var(--bg-card)] text-[color:var(--text-primary)] shadow-[var(--shadow-medium)]",
          position === "popper" && "w-full min-w-(--radix-select-trigger-width) data-[side=bottom]:translate-y-[var(--space-4)] data-[side=top]:-translate-y-[var(--space-4)]",
          className
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport className="p-[var(--space-padding-x-small)]">{children}</SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-[var(--space-padding-small)] py-[var(--space-padding-2x-small)] text-[color:var(--text-secondary)] text-[length:var(--font-size-tiny)] leading-[var(--line-height-tiny)]", className)}
      {...props}
    />
  )
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        // 40 tall like the Figma Menu Item. A long label wraps and the row grows, instead of spilling over.
        "relative flex min-h-[var(--size-40)] w-full cursor-default items-center gap-[var(--space-padding-x-small)] rounded-[var(--radius-buttons-and-controls)] select-none",
        // Keyboard focus is the highlighted state: Radix moves focus and highlight together.
        "py-[var(--space-padding-2x-small)] pr-[var(--space-padding-x-small)] pl-[var(--space-padding-small)] outline-none focus-visible:bg-[color:var(--select-hover)]",
        "bg-[color:var(--select-resting)] text-[color:var(--text-state-resting)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)]",
        // Highlighted always gets the hover fill, so focus shows on the selected item too. The selected item
        // keeps its accent text and check mark, and gets its soft fill when it isn't highlighted.
        "data-[highlighted]:bg-[color:var(--select-hover)] data-[highlighted]:not-data-[state=checked]:text-[color:var(--text-state-hover)]",
        "data-[state=checked]:not-data-[highlighted]:bg-[color:var(--select-soft-active)] data-[state=checked]:text-[color:var(--text-accent)]",
        "data-[disabled]:pointer-events-none data-[disabled]:bg-transparent data-[disabled]:text-[color:var(--text-state-disabled)]",
        className
      )}
      {...props}
    >
      <span className="min-w-0 flex-1">
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </span>
      <span className="ml-auto flex size-[var(--size-icon-small)] items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-[var(--size-icon-small)]" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator data-slot="select-separator" className={cn("my-[var(--space-padding-2x-small)] h-px bg-[color:var(--border-pretty)]", className)} {...props} />
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton data-slot="select-scroll-up-button" className={cn("flex cursor-default items-center justify-center py-[var(--space-padding-2x-small)]", className)} {...props}>
      <ChevronUp className="size-[var(--size-icon-small)]" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton data-slot="select-scroll-down-button" className={cn("flex cursor-default items-center justify-center py-[var(--space-padding-2x-small)]", className)} {...props}>
      <ChevronDown className="size-[var(--size-icon-small)]" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  selectTriggerVariants,
}

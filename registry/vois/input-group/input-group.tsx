// Vois InputGroup. shadcn/ui's InputGroup (InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton,
// InputGroupText) on Vois tokens, built on the Vois Input. It covers the Figma Inputs page sets Search
// Field, Email Address Field, Password, URL Input Field and Input Field with Button (with Inline Input
// Button). It serves the vois-components field jobs where a field needs an icon, a prefix or a button
// inside its box, so nobody hand-builds an input with an absolutely placed icon.
//
// The box is the Vois Input's box: InputGroup imports fieldClasses from components/ui/input, so it has the
// same border, fill, radius, padding, hover and transition. The states live on the inner input, so the
// group mirrors them onto its box with :has() (not focus-within):
// - focus: the inner input matches :focus-visible. A focused InputGroupButton does not light the group;
//   it draws its own 2px --border-state-focus outline, 2px out.
// - error: the inner input has aria-invalid="true".
// - disabled: the inner input is disabled.
// - prefill: InputGroupInput takes `prefill`, as the Input does.
// Which state wins, as in the Input: disabled, then error, then focus, then prefill, then hover. Prefill
// and error exclude the states above them with :not(:has()), and error's rule outranks focus on
// specificity, so the result never depends on how Tailwind sorts the rules. All of them beat hover.
//
// Heights follow the Input (vois-tokens DS-COMPONENT-007): default 36 (--size-field-web), native 48
// (--size-field-native), compact 32 (--size-field-compact, only inline in a table or a dense row).
// From Figma: 12px side padding (--space-padding-small) and an 8px gap (--space-8); icons 20
// (--size-20). Addon icons are --icon-state-resting, --icon-primary on hover, focus and prefill,
// --icon-negative on error and --icon-state-disabled when disabled. `shape="pill"` is the Search Field:
// --shape-pill corners and 16px (--space-padding-medium) on the right.
// The Inline Input Button (InputGroupButton size="segment") fills the box's height at the end edge,
// with a 1px --border-default divider and the Secondary button colors. InputGroupText with `segment` is
// the URL Input Field's "https://" prefix, with the divider on its right.
// Every icon is decorative (aria-hidden) and never takes focus. Icon buttons need an aria-label.
// InputGroupPasswordToggle is a real button whose name says what it does next ("Show password" or
// "Hide password"). It has no aria-pressed: a changing name plus a pressed state would read as "Hide
// password, pressed" while the password is visible.
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { fieldClasses } from "@/components/ui/input"

type IconProps = React.ComponentProps<"svg">
const iconBase = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, focusable: false } as const

function InputGroupSearchIcon(props: IconProps) {
  return <svg {...iconBase} {...props}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
}
function InputGroupEmailIcon(props: IconProps) {
  return <svg {...iconBase} {...props}><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" /></svg>
}
function InputGroupLinkIcon(props: IconProps) {
  return <svg {...iconBase} {...props}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
}
function InputGroupClearIcon(props: IconProps) {
  return <svg {...iconBase} {...props}><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
}
function EyeIcon(props: IconProps) {
  return <svg {...iconBase} {...props}><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
}
function EyeOffIcon(props: IconProps) {
  return <svg {...iconBase} {...props}><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" /><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" /><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" /><path d="m2 2 20 20" /></svg>
}

const inputGroupVariants = cva(
  [
    // The Vois Input's box, unchanged. Its focus-visible, aria-invalid, disabled and prefill rules never match
    // a div, so the :has() rules below carry those states.
    ...fieldClasses,
    "relative flex items-center gap-[var(--space-8)]",
    // Focus: the 2px Figma border, a 1px border plus a 1px inset ring. Error needs no exclusion here: its
    // rule below is more specific (two :has() parts), so a focused invalid field keeps its red border.
    "[&:has([data-slot=input-group-control]:focus-visible)]:border-[color:var(--border-state-focus)] [&:has([data-slot=input-group-control]:focus-visible)]:bg-[color:var(--input-focus)] [&:has([data-slot=input-group-control]:focus-visible)]:shadow-[inset_0_0_0_1px_var(--border-state-focus)]",
    // Prefill: loses to disabled, error and focus.
    "[&:has([data-slot=input-group-control][data-prefill=true]):not(:has([data-slot=input-group-control]:disabled,[data-slot=input-group-control][aria-invalid=true],[data-slot=input-group-control]:focus-visible))]:border-[color:var(--border-info)] [&:has([data-slot=input-group-control][data-prefill=true]):not(:has([data-slot=input-group-control]:disabled,[data-slot=input-group-control][aria-invalid=true],[data-slot=input-group-control]:focus-visible))]:bg-[color:var(--input-prefill)]",
    // Error: loses only to disabled. Focused with an error keeps the red border, with a red inner ring.
    "[&:has([data-slot=input-group-control][aria-invalid=true]):not(:has([data-slot=input-group-control]:disabled))]:border-[color:var(--border-negative)] [&:has([data-slot=input-group-control][aria-invalid=true]):not(:has([data-slot=input-group-control]:disabled))]:bg-[color:var(--input-negative)]",
    "[&:has([data-slot=input-group-control][aria-invalid=true]:focus-visible)]:shadow-[inset_0_0_0_1px_var(--border-negative)]",
    // Disabled wins over everything.
    "[&:has([data-slot=input-group-control]:disabled)]:cursor-not-allowed [&:has([data-slot=input-group-control]:disabled)]:border-[color:var(--border-state-disabled)] [&:has([data-slot=input-group-control]:disabled)]:bg-[color:var(--input-disabled)]",
    // A segment at an edge (Inline Input Button, URL prefix) sits flush with the border: no padding there.
    "has-[>[data-align=inline-end]>[data-segment=true]]:pr-0 has-[>[data-align=inline-start]>[data-segment=true]]:pl-0",
  ],
  {
    variants: {
      size: {
        default: "h-[var(--size-field-web)]",
        native: "h-[var(--size-field-native)]",
        compact: "h-[var(--size-field-compact)]",
      },
      shape: {
        default: "",
        pill: "rounded-[var(--shape-pill)] pr-[var(--space-padding-medium)]",
      },
    },
    defaultVariants: { size: "default", shape: "default" },
  }
)

function InputGroup({ className, size = "default", shape = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof inputGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group"
      data-size={size}
      className={cn(inputGroupVariants({ size, shape }), className)}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  [
    "flex shrink-0 items-center gap-[var(--space-8)] self-stretch select-none",
    "text-[color:var(--icon-state-resting)] [&>svg]:pointer-events-none [&>svg:not([class*='size-'])]:size-[var(--size-20)]",
    // Icon color per state, mirrored from the inner input like the box. Mutually exclusive, so order is moot.
    "[[data-slot=input-group]:is(:hover,:has([data-slot=input-group-control]:focus-visible),:has([data-slot=input-group-control][data-prefill=true])):not(:has([data-slot=input-group-control]:disabled,[data-slot=input-group-control][aria-invalid=true]))_&]:text-[color:var(--icon-primary)]",
    "[[data-slot=input-group]:has([data-slot=input-group-control][aria-invalid=true]):not(:has([data-slot=input-group-control]:disabled))_&]:text-[color:var(--icon-negative)]",
    "[[data-slot=input-group]:has([data-slot=input-group-control]:disabled)_&]:text-[color:var(--icon-state-disabled)]",
  ],
  {
    variants: {
      align: {
        // The outer corners pass through to a segment child, so its fill follows the box's radius.
        "inline-start": "order-first rounded-l-[inherit]",
        "inline-end": "order-last rounded-r-[inherit]",
      },
    },
    defaultVariants: { align: "inline-start" },
  }
)

// Unlike shadcn, a click on an addon does not move focus to the input: a div with a click handler is a
// clickable non-button (vois-components LOOKALIKE-005). Icons are pointer-events-none and the input
// fills the rest of the box, so a click on the field almost always lands on the input itself.
function InputGroupAddon({ className, align = "inline-start", ...props }: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return <div data-slot="input-group-addon" data-align={align} className={cn(inputGroupAddonVariants({ align }), className)} {...props} />
}

const inputGroupButtonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-[var(--space-4)] whitespace-nowrap select-none cursor-pointer",
    "transition-[color,background-color,border-color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
    // Focus ring (DS-A11Y-002): the button's own, never the group's.
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)]",
    // Hit area at least --hit-area-min in both directions, without changing the visible size (DS-A11Y-001).
    "after:absolute after:top-1/2 after:left-1/2 after:size-full after:min-h-[var(--hit-area-min)] after:min-w-[var(--hit-area-min)] after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']",
    "disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[var(--size-20)]",
  ],
  {
    variants: {
      size: {
        // Ghost buttons inside the box. Icon buttons take the addon's icon color, so they follow its states.
        xs: "h-[var(--size-24)] rounded-[var(--radius-buttons-and-controls)] px-[var(--space-padding-x-small)] text-[color:var(--text-state-resting)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-medium)] hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--text-state-hover)] active:bg-[color:var(--action-ghost-pressed)] disabled:bg-transparent disabled:text-[color:var(--text-state-disabled)]",
        "icon-xs": "size-[var(--size-24)] rounded-[var(--radius-buttons-and-controls)] hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--icon-state-hover)] active:bg-[color:var(--action-ghost-pressed)] disabled:bg-transparent disabled:text-[color:var(--icon-state-disabled)]",
        "icon-sm": "size-[var(--size-28)] rounded-[var(--radius-buttons-and-controls)] hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--icon-state-hover)] active:bg-[color:var(--action-ghost-pressed)] disabled:bg-transparent disabled:text-[color:var(--icon-state-disabled)]",
        // The Figma Inline Input Button: full height at the box's edge, Secondary colors, 14px medium text.
        segment: [
          "self-stretch rounded-[inherit] px-[var(--space-padding-small)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-medium)]",
          "border-l border-[color:var(--border-default)] bg-[color:var(--action-secondary-resting)] text-[color:var(--text-primary)]",
          "hover:bg-[color:var(--action-secondary-hover)] hover:text-[color:var(--text-state-hover)] active:border-[color:var(--border-transparent)] active:bg-[color:var(--action-secondary-pressed)]",
          "disabled:border-[color:var(--border-state-disabled)] disabled:bg-[color:var(--action-secondary-disabled)] disabled:text-[color:var(--text-state-disabled)]",
        ],
      },
    },
    defaultVariants: { size: "xs" },
  }
)

function InputGroupButton({ className, size = "xs", type = "button", ...props }: React.ComponentProps<"button"> & VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <button
      type={type}
      data-slot="input-group-button"
      data-size={size}
      data-segment={size === "segment" ? "true" : undefined}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, segment = false, ...props }: React.ComponentProps<"span"> & { segment?: boolean }) {
  return (
    <span
      data-slot="input-group-text"
      data-segment={segment ? "true" : undefined}
      className={cn(
        "flex items-center gap-[var(--space-8)] text-[color:var(--text-state-resting)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-medium)] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[var(--size-20)]",
        // The URL Input Field's prefix: full height, a divider on the right, padding as in Figma.
        segment && "self-stretch border-r border-[color:var(--border-default)] pr-[var(--space-padding-small)] pl-[var(--space-padding-x-small)]",
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({ className, prefill = false, ...props }: React.ComponentProps<"input"> & { prefill?: boolean }) {
  return (
    <input
      data-slot="input-group-control"
      data-prefill={prefill ? "true" : undefined}
      className={cn(
        // The group draws the box and the focus ring, so the input itself has none (outline-none is paired
        // with the group's :has(:focus-visible) ring above).
        "h-full min-w-0 flex-1 border-0 bg-transparent p-0 outline-none",
        "text-[color:var(--text-primary)] text-[length:var(--font-size-small)] leading-[var(--line-height-small)] placeholder:text-[color:var(--text-state-instruction)]",
        // The browser's own clear button on type="search" would sit beside the Figma clear button.
        "[&::-webkit-search-cancel-button]:appearance-none",
        "aria-invalid:not-disabled:text-[color:var(--text-negative)] disabled:cursor-not-allowed disabled:text-[color:var(--text-state-disabled)]",
        className
      )}
      {...props}
    />
  )
}

type PasswordToggleProps = Omit<React.ComponentProps<"button">, "children" | "aria-pressed"> & {
  /** Whether the password is shown. Pass type={visible ? "text" : "password"} to the InputGroupInput. */
  visible: boolean
  onVisibleChange: (visible: boolean) => void
}

// The Figma Password eye. Hidden shows eye-off (as Figma's eye-no); shown shows the eye.
function InputGroupPasswordToggle({ visible, onVisibleChange, onClick, ...props }: PasswordToggleProps) {
  return (
    <InputGroupButton
      size="icon-xs"
      aria-label={visible ? "Hide password" : "Show password"}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) onVisibleChange(!visible)
      }}
      {...props}
    >
      {visible ? <EyeIcon /> : <EyeOffIcon />}
    </InputGroupButton>
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupPasswordToggle,
  InputGroupSearchIcon,
  InputGroupEmailIcon,
  InputGroupLinkIcon,
  InputGroupClearIcon,
  inputGroupVariants,
}

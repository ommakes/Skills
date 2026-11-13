// Vois Button. Replaces shadcn/ui's components/ui/button.tsx and keeps its variant and size names, so
// shadcn components that call buttonVariants({ variant: "outline" }) or size "icon" keep working.
//
// Colors carry a `color:` type hint (bg-, text-, border-, outline-) so tailwind-merge in cn() merges
// them correctly, and a className override such as bg-[color:var(--bg-card)] replaces the variant's.
//
// Every value is a Vois token from vois-tokens (registry item vois-tokens). Heights: sm 28, default 36
// (the web default), lg 48 (the native default), circular 56 (vois-tokens DS-COMPONENT-007).
// Press: scale 0.96 for a pointer press only, never a keyboard press or under reduced motion, timed by the
// motion tokens (DS-ANIMATION-008, DS-ANIMATION-003, DS-ANIMATION-004, DS-MOTION-001). `static` turns it off.
// Layout follows the Figma Primary Button: container padding, then a label frame with 4px on each side
// (--space-padding-2x-small) holding centered text, with optional leading and trailing icons.
// `loading` shows the Spinner over the content without changing the width.
// registry/FIGMA-TODO.md lists the choices still to check against Figma.
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-0 whitespace-nowrap select-none",
    // Label weight from the Figma Typography variables. The font family is inherited from the page, like
    // stock shadcn, so a Button never switches font on its own.
    "[font-weight:var(--font-weight-semi-bold)]",
    "rounded-[var(--radius-buttons-and-controls)]",
    // Color and press motion come from the motion tokens. A keyboard press does not animate.
    "transition-[scale,color,background-color,border-color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)]",
    "focus-visible:transition-none motion-reduce:transition-none",
    // Focus ring (DS-A11Y-002): the browser outline is replaced, never removed without one.
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    // Hit area at least --hit-area-min in both directions, without changing the visible size (DS-A11Y-001).
    "after:absolute after:top-1/2 after:left-1/2 after:size-full after:min-h-[var(--hit-area-min)] after:min-w-[var(--hit-area-min)] after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']",
    "disabled:pointer-events-none aria-disabled:pointer-events-none",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    // Loading: everything but the spinner turns transparent and keeps its space, so the width holds.
    "data-[loading=true]:[&>:not([data-slot=button-spinner])]:opacity-0",
  ],
  {
    variants: {
      // Colors follow the Figma button sets. Each variant sets its own focus ring color (the base sets only
      // the width and offset), so the color never depends on tailwind-merge. Disabled text is
      // --text-state-disabled, as in Figma.
      variant: {
        default: [
          "bg-[color:var(--action-primary-resting)] text-[color:var(--action-primary-text)] focus-visible:outline-[color:var(--action-primary-focus)]",
          "hover:bg-[color:var(--action-primary-hover)] active:bg-[color:var(--action-primary-pressed)]",
          "disabled:bg-[color:var(--action-primary-disabled)] disabled:text-[color:var(--text-state-disabled)]",
        ],
        destructive: [
          "bg-[color:var(--solid-negative-resting)] text-[color:var(--text-on-dark)] focus-visible:outline-[color:var(--solid-negative-focus)]",
          "hover:bg-[color:var(--solid-negative-hover)] active:bg-[color:var(--solid-negative-pressed)]",
          "disabled:bg-[color:var(--action-secondary-disabled)] disabled:text-[color:var(--text-state-disabled)]",
        ],
        "destructive-soft": [
          "bg-[color:var(--soft-negative-resting)] text-[color:var(--text-negative)] focus-visible:outline-[color:var(--soft-negative-focus)]",
          "hover:bg-[color:var(--soft-negative-hover)] active:bg-[color:var(--soft-negative-pressed)]",
          "disabled:bg-[color:var(--soft-negative-disabled)] disabled:text-[color:var(--soft-negative-disabled-text)]",
        ],
        secondary: [
          "border border-[color:var(--border-default)] bg-[color:var(--action-secondary-resting)] text-[color:var(--text-primary)] focus-visible:outline-[color:var(--border-state-focus)]",
          "hover:bg-[color:var(--action-secondary-hover)] active:border-[color:var(--border-transparent)] active:bg-[color:var(--action-secondary-pressed)]",
          "disabled:border-[color:var(--border-state-disabled)] disabled:bg-[color:var(--action-secondary-disabled)] disabled:text-[color:var(--text-state-disabled)]",
        ],
        // Vois has no separate outline component: outline is the Secondary look, so shadcn components that
        // ask for outline get it.
        outline: [
          "border border-[color:var(--border-default)] bg-[color:var(--action-secondary-resting)] text-[color:var(--text-primary)] focus-visible:outline-[color:var(--border-state-focus)]",
          "hover:bg-[color:var(--action-secondary-hover)] active:border-[color:var(--border-transparent)] active:bg-[color:var(--action-secondary-pressed)]",
          "disabled:border-[color:var(--border-state-disabled)] disabled:bg-[color:var(--action-secondary-disabled)] disabled:text-[color:var(--text-state-disabled)]",
        ],
        auxiliary: [
          "bg-[color:var(--action-auxiliary-resting)] text-[color:var(--text-auxiliary)] focus-visible:outline-[color:var(--action-auxiliary-focus)]",
          "hover:bg-[color:var(--action-auxiliary-hover)] active:bg-[color:var(--action-auxiliary-pressed)]",
          "disabled:bg-[color:var(--action-auxiliary-disabled)] disabled:text-[color:var(--text-state-disabled)]",
        ],
        ghost: [
          "bg-transparent text-[color:var(--text-state-resting)] focus-visible:outline-[color:var(--border-state-focus)]",
          "hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--text-state-hover)] active:bg-[color:var(--action-ghost-pressed)] active:text-[color:var(--text-primary)]",
          "disabled:text-[color:var(--text-state-disabled)]",
        ],
        link: [
          "text-[color:var(--action-link-active)] underline-offset-4 focus-visible:outline-[color:var(--border-state-focus)]",
          "hover:text-[color:var(--action-link-hover)] hover:underline focus-visible:text-[color:var(--action-link-focus)]",
          "disabled:text-[color:var(--action-text-disabled)]",
        ],
      },
      size: {
        // Container padding, then the label's own 4px: text sits 12 / 16 / 16 from the edge, as in Figma.
        sm: "h-[var(--size-action-medium)] px-[var(--space-padding-x-small)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [&_svg:not([class*='size-'])]:size-[var(--size-icon-small)]",
        default: "h-[var(--size-action-large)] px-[var(--space-padding-small)] text-[length:var(--font-size-small)] leading-[var(--line-height-small)] [&_svg:not([class*='size-'])]:size-[var(--size-20)]",
        lg: "h-[var(--size-action-x-large)] px-[var(--space-padding-small)] text-[length:var(--font-size-medium)] leading-[var(--line-height-medium)] [&_svg:not([class*='size-'])]:size-[var(--size-20)]",
        "icon-sm": "size-[var(--size-action-medium)] [&_svg:not([class*='size-'])]:size-[var(--size-icon-small)]",
        icon: "size-[var(--size-action-large)] [&_svg:not([class*='size-'])]:size-[var(--size-20)]",
        "icon-lg": "size-[var(--size-action-x-large)] [&_svg:not([class*='size-'])]:size-[var(--size-icon-medium)]",
        circular: "size-[var(--size-action-circular)] rounded-full [&_svg:not([class*='size-'])]:size-[var(--size-icon-medium)]",
      },
      // The press scale. The Button's `static` prop sets this to false.
      press: {
        true: "motion-safe:[&:active:not(:focus-visible)]:scale-[0.96]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      press: true,
    },
  }
)

const ICON_ONLY = new Set(["icon-sm", "icon", "icon-lg", "circular"])
const SPINNER_SIZE = { sm: "sm", "icon-sm": "sm", "icon-lg": "lg", circular: "lg" } as const

type ButtonProps = React.ComponentProps<"button"> &
  Omit<VariantProps<typeof buttonVariants>, "press"> & {
    asChild?: boolean
    /** Turns off the press scale, for buttons in a dense list (DS-ANIMATION-008). */
    static?: boolean
    /** An icon before the label. Sized by the Button; decorative (aria-hidden). */
    leadingIcon?: React.ReactNode
    /** An icon after the label, such as a chevron. Sized by the Button; decorative (aria-hidden). */
    trailingIcon?: React.ReactNode
    /** Shows the Spinner over the content, keeps the width, and ignores clicks (aria-busy, aria-disabled). */
    loading?: boolean
  }

function Button({
  className,
  variant = "default",
  size = "default",
  static: isStatic = false,
  asChild = false,
  leadingIcon,
  trailingIcon,
  loading = false,
  onClick,
  children,
  ...props
}: ButtonProps) {
  const iconOnly = ICON_ONLY.has(size ?? "default")
  // A loading or aria-disabled Button ignores activation. aria-disabled alone only blocks the pointer, so
  // a keyboard press, a form submit and an asChild child's own handler are stopped here too.
  const inert = loading || props["aria-disabled"] === true || props["aria-disabled"] === "true"
  const stop = (event: React.SyntheticEvent) => { event.preventDefault(); event.stopPropagation() }

  // Icon-only sizes hold just their icon. Every other size gets the label frame and the icon slots.
  const content = (inner: React.ReactNode) =>
    iconOnly ? (
      inner
    ) : (
      <>
        {/* The label frame lays out its children in a row with Figma's 8px gap, so an icon passed as a child
            (shadcn style) still sits beside the text. leadingIcon and trailingIcon are the Vois way. */}
        {leadingIcon ? <span data-slot="button-icon" data-position="leading" aria-hidden="true" className="inline-flex">{leadingIcon}</span> : null}
        <span data-slot="button-label" className="inline-flex items-center justify-center gap-[var(--space-padding-x-small)] px-[var(--space-padding-2x-small)] text-center">{inner}</span>
        {trailingIcon ? <span data-slot="button-icon" data-position="trailing" aria-hidden="true" className="inline-flex">{trailingIcon}</span> : null}
      </>
    )

  const spinner = loading ? (
    <span data-slot="button-spinner" className="absolute inset-0 grid place-items-center">
      <Spinner aria-hidden="true" size={SPINNER_SIZE[size as keyof typeof SPINNER_SIZE] ?? "default"} />
    </span>
  ) : null

  const shared = {
    "data-slot": "button",
    "data-variant": variant,
    "data-size": size,
    "data-loading": loading ? "true" : undefined,
    "aria-busy": loading || undefined,
    "aria-disabled": loading || props["aria-disabled"] || undefined,
    className: cn(buttonVariants({ variant, size, press: !isStatic && !loading, className })),
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      if (inert) return stop(event)
      onClick?.(event)
    },
  }

  if (asChild && React.isValidElement<{ children?: React.ReactNode; onClick?: React.MouseEventHandler }>(children)) {
    // Slot runs the child's own onClick before the Button's, so the child's handler is guarded here.
    const childClick = children.props.onClick
    return (
      <Slot.Root {...props} {...shared}>
        {React.cloneElement(
          children,
          { onClick: (event: React.MouseEvent) => (inert ? stop(event) : childClick?.(event)) },
          <>{content(children.props.children)}{spinner}</>
        )}
      </Slot.Root>
    )
  }

  return (
    <button {...props} {...shared}>
      {content(children)}
      {spinner}
    </button>
  )
}

export { Button, buttonVariants }

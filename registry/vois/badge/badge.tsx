// Vois Badge. Replaces shadcn/ui's components/ui/badge.tsx with the same API (variant, asChild),
// plus `color` and `size`.
//
// From the Figma Labels set and Status Labels set (Indicators page).
//   variant: solid | soft | outline, Figma's Solid Fill, Soft Fill and Outline styles.
//     solid: --label-solid-<hue> with the on-solid text Figma picks for that hue.
//     soft: --label-soft-<hue> with --label-text-<hue>.
//     outline: a 1px --label-outline-<hue> inside edge, no fill, --label-text-<hue>.
//   shadcn's names still work: default is solid accent, secondary is soft gray, destructive is soft
//   negative, outline is outline gray (each unless `color` says otherwise).
//   color: the 16 Figma hues (aqua ... yellow), or a status: info, positive, warning, negative, neutral,
//     accent, aux. A status follows the Figma Status Label: soft is --label-<status> with
//     --text-<status>, outline is a --border-<status> edge, solid is --base-<status>. aux is
//     --label-aux, black on light pages and white on dark, for a badge on a strong color.
//   size: default is the Figma Label, 20 tall with 12/16 medium text; lg is the Figma Status Label,
//     24 tall with 14/20 semibold text.
// The shape is --shape-pill (Figma binds --radii-24 on a 20 tall label, the same capsule). Icons are
// 12 (16 at lg) in --label-icon-<hue>, or the on-solid icon color on solid.
//
// A badge as a link or button (asChild with an a or button) gets the interactive states: hover lays
// --label-resting over the fill (Figma's Status Label hover), press lays --label-pressed, focus is the
// Vois focus ring, disabled is --label-disabled with --text-state-disabled. Which state wins:
// disabled, then pressed, then hover. Its hit area is at least --hit-area-min.
//
// Serves vois-components JOB-LABEL-CONTENT: a non-interactive label on a piece of content. A badge with
// a dismiss control is a chip; use a Button with an aria-label for the dismiss.
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "relative inline-flex w-fit shrink-0 items-center justify-center gap-[var(--space-4)] overflow-hidden whitespace-nowrap rounded-[var(--shape-pill)]",
    "px-[var(--space-padding-x-small)] [&>svg]:pointer-events-none [&>svg]:shrink-0",
    "transition-[background-color,background-image,color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
    // Interactive only when it is a link or a button.
    "[a&]:cursor-pointer [button&]:cursor-pointer",
    "[a&]:overflow-visible [button&]:overflow-visible",
    "[a&]:after:absolute [a&]:after:top-1/2 [a&]:after:left-1/2 [a&]:after:size-full [a&]:after:min-h-[var(--hit-area-min)] [a&]:after:min-w-[var(--hit-area-min)] [a&]:after:-translate-x-1/2 [a&]:after:-translate-y-1/2 [a&]:after:content-['']",
    "[button&]:after:absolute [button&]:after:top-1/2 [button&]:after:left-1/2 [button&]:after:size-full [button&]:after:min-h-[var(--hit-area-min)] [button&]:after:min-w-[var(--hit-area-min)] [button&]:after:-translate-x-1/2 [button&]:after:-translate-y-1/2 [button&]:after:content-['']",
    "[a&]:hover:bg-[image:linear-gradient(var(--label-resting),var(--label-resting))] [button&]:hover:bg-[image:linear-gradient(var(--label-resting),var(--label-resting))]",
    "[a&]:active:bg-[image:linear-gradient(var(--label-pressed),var(--label-pressed))] [button&]:active:bg-[image:linear-gradient(var(--label-pressed),var(--label-pressed))]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)]",
    // Disabled wins: it is written last and clears the overlay and the edge.
    "[button&]:disabled:cursor-not-allowed [button&]:disabled:bg-none [button&]:disabled:shadow-none [button&]:disabled:bg-[color:var(--label-disabled)] [button&]:disabled:text-[color:var(--text-state-disabled)]",
    "aria-disabled:pointer-events-none aria-disabled:bg-none aria-disabled:shadow-none aria-disabled:bg-[color:var(--label-disabled)] aria-disabled:text-[color:var(--text-state-disabled)]",
  ],
  {
    variants: {
      variant: {
        solid: "bg-[color:var(--badge-solid)] text-[color:var(--badge-on-solid)] [&>svg]:text-[color:var(--badge-on-solid-icon)]",
        soft: "bg-[color:var(--badge-soft)] text-[color:var(--badge-text)] [&>svg]:text-[color:var(--badge-icon)]",
        outline: "bg-transparent shadow-[inset_0_0_0_1px_var(--badge-outline)] text-[color:var(--badge-text)] [&>svg]:text-[color:var(--badge-icon)]",
      },
      // Each color sets the same local properties; the variant picks which ones it reads.
      color: {
        aqua: "[--badge-solid:var(--label-solid-aqua)] [--badge-on-solid:var(--label-on-solid-text-on-dark)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-dark)] [--badge-soft:var(--label-soft-aqua)] [--badge-outline:var(--label-outline-aqua)] [--badge-text:var(--label-text-aqua)] [--badge-icon:var(--label-icon-aqua)]",
        blue: "[--badge-solid:var(--label-solid-blue)] [--badge-on-solid:var(--label-on-solid-text-on-dark)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-dark)] [--badge-soft:var(--label-soft-blue)] [--badge-outline:var(--label-outline-blue)] [--badge-text:var(--label-text-blue)] [--badge-icon:var(--label-icon-blue)]",
        blurple: "[--badge-solid:var(--label-solid-blurple)] [--badge-on-solid:var(--label-on-solid-text-on-dark)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-dark)] [--badge-soft:var(--label-soft-blurple)] [--badge-outline:var(--label-outline-blurple)] [--badge-text:var(--label-text-blurple)] [--badge-icon:var(--label-icon-blurple)]",
        cyan: "[--badge-solid:var(--label-solid-cyan)] [--badge-on-solid:var(--label-on-solid-text-on-dark)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-dark)] [--badge-soft:var(--label-soft-cyan)] [--badge-outline:var(--label-outline-cyan)] [--badge-text:var(--label-text-cyan)] [--badge-icon:var(--label-icon-cyan)]",
        goldie: "[--badge-solid:var(--label-solid-goldie)] [--badge-on-solid:var(--label-on-solid-text-secondary)] [--badge-on-solid-icon:var(--label-on-solid-text-secondary)] [--badge-soft:var(--label-soft-goldie)] [--badge-outline:var(--label-outline-goldie)] [--badge-text:var(--label-text-goldie)] [--badge-icon:var(--label-icon-goldie)]",
        gray: "[--badge-solid:var(--label-solid-gray)] [--badge-on-solid:var(--label-on-solid-text-on-dark)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-dark)] [--badge-soft:var(--label-soft-gray)] [--badge-outline:var(--label-outline-gray)] [--badge-text:var(--label-text-gray)] [--badge-icon:var(--label-icon-gray)]",
        green: "[--badge-solid:var(--label-solid-green)] [--badge-on-solid:var(--label-on-solid-text-on-light)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-light)] [--badge-soft:var(--label-soft-green)] [--badge-outline:var(--label-outline-green)] [--badge-text:var(--label-text-green)] [--badge-icon:var(--label-icon-green)]",
        lawn: "[--badge-solid:var(--label-solid-lawn)] [--badge-on-solid:var(--label-on-solid-text-on-light)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-light)] [--badge-soft:var(--label-soft-lawn)] [--badge-outline:var(--label-outline-lawn)] [--badge-text:var(--label-text-lawn)] [--badge-icon:var(--label-icon-lawn)]",
        lipstick: "[--badge-solid:var(--label-solid-lipstick)] [--badge-on-solid:var(--label-on-solid-text-on-dark)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-dark)] [--badge-soft:var(--label-soft-lipstick)] [--badge-outline:var(--label-outline-lipstick)] [--badge-text:var(--label-text-lipstick)] [--badge-icon:var(--label-icon-lipstick)]",
        nude: "[--badge-solid:var(--label-solid-nude)] [--badge-on-solid:var(--label-on-solid-text-on-dark)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-dark)] [--badge-soft:var(--label-soft-nude)] [--badge-outline:var(--label-outline-nude)] [--badge-text:var(--label-text-nude)] [--badge-icon:var(--label-icon-nude)]",
        orange: "[--badge-solid:var(--label-solid-orange)] [--badge-on-solid:var(--label-on-solid-text-on-dark)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-dark)] [--badge-soft:var(--label-soft-orange)] [--badge-outline:var(--label-outline-orange)] [--badge-text:var(--label-text-orange)] [--badge-icon:var(--label-icon-orange)]",
        rose: "[--badge-solid:var(--label-solid-rose)] [--badge-on-solid:var(--label-on-solid-text-on-dark)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-dark)] [--badge-soft:var(--label-soft-rose)] [--badge-outline:var(--label-outline-rose)] [--badge-text:var(--label-text-rose)] [--badge-icon:var(--label-icon-rose)]",
        smurf: "[--badge-solid:var(--label-solid-smurf)] [--badge-on-solid:var(--label-on-solid-text-on-dark)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-dark)] [--badge-soft:var(--label-soft-smurf)] [--badge-outline:var(--label-outline-smurf)] [--badge-text:var(--label-text-smurf)] [--badge-icon:var(--label-icon-smurf)]",
        tomato: "[--badge-solid:var(--label-solid-tomato)] [--badge-on-solid:var(--label-on-solid-text-on-dark)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-dark)] [--badge-soft:var(--label-soft-tomato)] [--badge-outline:var(--label-outline-tomato)] [--badge-text:var(--label-text-tomato)] [--badge-icon:var(--label-icon-tomato)]",
        violet: "[--badge-solid:var(--label-solid-violet)] [--badge-on-solid:var(--label-on-solid-text-on-dark)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-dark)] [--badge-soft:var(--label-soft-violet)] [--badge-outline:var(--label-outline-violet)] [--badge-text:var(--label-text-violet)] [--badge-icon:var(--label-icon-violet)]",
        yellow: "[--badge-solid:var(--label-solid-yellow)] [--badge-on-solid:var(--label-on-solid-text-on-light)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-light)] [--badge-soft:var(--label-soft-yellow)] [--badge-outline:var(--label-outline-yellow)] [--badge-text:var(--label-text-yellow)] [--badge-icon:var(--label-icon-yellow)]",
        info: "[--badge-solid:var(--label-solid-blue)] [--badge-on-solid:var(--label-on-solid-text-on-dark)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-dark)] [--badge-soft:var(--label-info)] [--badge-outline:var(--border-info)] [--badge-text:var(--text-info)] [--badge-icon:var(--text-info)]",
        positive: "[--badge-solid:var(--base-positive)] [--badge-on-solid:var(--label-on-solid-text-on-dark)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-dark)] [--badge-soft:var(--label-positive)] [--badge-outline:var(--border-positive)] [--badge-text:var(--text-positive)] [--badge-icon:var(--text-positive)]",
        warning: "[--badge-solid:var(--base-notice)] [--badge-on-solid:var(--label-on-solid-text-on-light)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-light)] [--badge-soft:var(--label-warning)] [--badge-outline:var(--border-notice)] [--badge-text:var(--text-notice)] [--badge-icon:var(--text-notice)]",
        negative: "[--badge-solid:var(--base-negative)] [--badge-on-solid:var(--label-on-solid-text-on-dark)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-dark)] [--badge-soft:var(--label-negative)] [--badge-outline:var(--border-negative)] [--badge-text:var(--text-negative)] [--badge-icon:var(--text-negative)]",
        neutral: "[--badge-solid:var(--label-solid-gray)] [--badge-on-solid:var(--label-on-solid-text-on-dark)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-dark)] [--badge-soft:var(--label-neutral)] [--badge-outline:var(--label-outline-gray)] [--badge-text:var(--text-state-resting)] [--badge-icon:var(--text-state-resting)]",
        accent: "[--badge-solid:var(--base-accent-solid)] [--badge-on-solid:var(--label-on-solid-text-on-dark)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-dark)] [--badge-soft:var(--label-accent)] [--badge-outline:var(--border-accent)] [--badge-text:var(--text-accent)] [--badge-icon:var(--icon-accent)]",
        aux: "[--badge-solid:var(--label-aux)] [--badge-on-solid:var(--label-on-solid-text-on-dark)] [--badge-on-solid-icon:var(--label-on-solid-icon-on-dark)] [--badge-soft:var(--label-aux)] [--badge-outline:var(--label-aux)] [--badge-text:var(--label-on-solid-text-on-dark)] [--badge-icon:var(--label-on-solid-icon-on-dark)]",
      },
      size: {
        default: "h-[var(--size-20)] text-[length:var(--font-size-tiny)] leading-[var(--line-height-tiny)] [font-weight:var(--font-weight-medium)] [&>svg]:size-[var(--size-12)]",
        lg: "h-[var(--size-24)] gap-[var(--space-padding-2x-small)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-semi-bold)] [&>svg]:size-[var(--size-16)]",
      },
    },
    compoundVariants: [
      // aux outline reads as text on the page, so its text is the aux color itself.
      { variant: "outline", color: "aux", className: "text-[color:var(--label-aux)] [&>svg]:text-[color:var(--label-aux)]" },
    ],
    defaultVariants: { variant: "solid", color: "accent", size: "default" },
  }
)

type BadgeColor = NonNullable<VariantProps<typeof badgeVariants>["color"]>
type BadgeStyle = NonNullable<VariantProps<typeof badgeVariants>["variant"]>
type ShadcnVariant = "default" | "secondary" | "destructive"

// shadcn's variant names, each as a style and a default color.
const shadcnVariants: Record<ShadcnVariant, { variant: BadgeStyle; color: BadgeColor }> = {
  default: { variant: "solid", color: "accent" },
  secondary: { variant: "soft", color: "gray" },
  destructive: { variant: "soft", color: "negative" },
}

type BadgeProps = Omit<React.ComponentProps<"span">, "color"> &
  Omit<VariantProps<typeof badgeVariants>, "variant"> & {
    variant?: BadgeStyle | ShadcnVariant | null
    asChild?: boolean
  }

function resolveBadge(variant: BadgeProps["variant"], color: BadgeProps["color"]): { variant: BadgeStyle; color: BadgeColor } {
  const v = variant ?? "solid"
  if (v === "default" || v === "secondary" || v === "destructive") {
    const mapped = shadcnVariants[v]
    return { variant: mapped.variant, color: color ?? mapped.color }
  }
  // shadcn's outline is a quiet gray edge unless a color is given.
  return { variant: v, color: color ?? (v === "outline" ? "gray" : "accent") }
}

function Badge({ className, variant, color, size = "default", asChild = false, ...props }: BadgeProps) {
  const resolved = resolveBadge(variant, color)
  const Comp = asChild ? Slot.Root : "span"
  return (
    <Comp
      data-slot="badge"
      data-variant={resolved.variant}
      data-color={resolved.color}
      className={cn(badgeVariants({ variant: resolved.variant, color: resolved.color, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

// Vois Avatar. Replaces shadcn/ui's components/ui/avatar.tsx (Radix Avatar) with the same parts
// (Avatar, AvatarImage, AvatarFallback), plus `size` on Avatar and `variant` on AvatarFallback.
//
// From the Figma Avatar set (Indicators page). A circle (--shape-circle) with a 2px --border-overlap
// ring outside it, so stacked avatars stay apart; the ring does not change the size.
// Sizes come from the --size-avatar-* tokens: xs 24, sm 28, md 40 (the default), lg 56, xl 72.
// The initials follow Figma's type for that size: 12/16 medium at 24, 14/20 semibold at 28, 16/24
// semibold at 40, 20/28 semibold at 56, 24/32 semibold at 72, in --text-secondary.
// Fallback variants:
//   initials (default): --avatar-initials fill.
//   generic: --avatar-generic fill and a person glyph in --icon-subtle, for no name and no photo.
//   invite: --avatar-invite fill (Goldie) with a 1px --avatar-invite-edge inside edge (Goldie-10, 3:1 or more on the page), for someone invited who has
//   not joined yet. Put a short glyph or "+" in it as the child.
// The fallback shows while the image loads and stays if it fails (Radix Avatar), so always pass
// initials or the generic variant. AvatarImage needs an alt; use alt="" when a name sits next to it.
//
// Serves vois-components JOB-REPRESENT-USER: a profile photo with an initials fallback. A rounded-full
// div with an img or two letters, written by hand, is the lookalike this replaces.
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Avatar as AvatarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const avatarVariants = cva(
  [
    "relative flex shrink-0 overflow-hidden rounded-[var(--shape-circle)] select-none",
    "size-[var(--avatar-size)] shadow-[0_0_0_2px_var(--border-overlap)]",
  ],
  {
    variants: {
      size: {
        xs: "[--avatar-size:var(--size-avatar-x-small)] [--avatar-font-size:var(--font-size-tiny)] [--avatar-line-height:var(--line-height-tiny)] [--avatar-font-weight:var(--font-weight-medium)]",
        sm: "[--avatar-size:var(--size-avatar-small)] [--avatar-font-size:var(--font-size-xsmall)] [--avatar-line-height:var(--line-height-xsmall)] [--avatar-font-weight:var(--font-weight-semi-bold)]",
        md: "[--avatar-size:var(--size-avatar-medium)] [--avatar-font-size:var(--font-size-small)] [--avatar-line-height:var(--line-height-small)] [--avatar-font-weight:var(--font-weight-semi-bold)]",
        lg: "[--avatar-size:var(--size-avatar-large)] [--avatar-font-size:var(--font-size-large)] [--avatar-line-height:var(--line-height-large)] [--avatar-font-weight:var(--font-weight-semi-bold)]",
        xl: "[--avatar-size:var(--size-avatar-x-large)] [--avatar-font-size:var(--font-size-xlarge)] [--avatar-line-height:var(--line-height-xlarge)] [--avatar-font-weight:var(--font-weight-semi-bold)]",
      },
    },
    defaultVariants: { size: "md" },
  }
)

function Avatar({
  className,
  size = "md",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & VariantProps<typeof avatarVariants>) {
  return <AvatarPrimitive.Root data-slot="avatar" data-size={size} className={cn(avatarVariants({ size }), className)} {...props} />
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image data-slot="avatar-image" className={cn("aspect-square size-full object-cover", className)} {...props} />
}

const avatarFallbackVariants = cva(
  [
    "flex size-full items-center justify-center rounded-[var(--shape-circle)] uppercase",
    "text-[color:var(--text-secondary)] text-[length:var(--avatar-font-size)] leading-[var(--avatar-line-height)] [font-weight:var(--avatar-font-weight)]",
  ],
  {
    variants: {
      variant: {
        initials: "bg-[color:var(--avatar-initials)]",
        generic: "bg-[color:var(--avatar-generic)] text-[color:var(--icon-subtle)]",
        invite: "bg-[color:var(--avatar-invite)] text-[color:var(--text-accent)] shadow-[inset_0_0_0_1px_var(--avatar-invite-edge)]",
      },
    },
    defaultVariants: { variant: "initials" },
  }
)

function PersonGlyph(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="12" cy="8" r="4.5" />
      <path d="M3.5 20.5c0-4.2 3.8-7 8.5-7s8.5 2.8 8.5 7c0 .3-.2.5-.5.5H4c-.3 0-.5-.2-.5-.5Z" />
    </svg>
  )
}

function AvatarFallback({
  className,
  variant = "initials",
  children,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback> & VariantProps<typeof avatarFallbackVariants>) {
  return (
    <AvatarPrimitive.Fallback data-slot="avatar-fallback" data-variant={variant} className={cn(avatarFallbackVariants({ variant }), className)} {...props}>
      {children ?? (variant === "generic" ? <PersonGlyph className="size-[60%]" /> : null)}
    </AvatarPrimitive.Fallback>
  )
}

export { Avatar, AvatarImage, AvatarFallback, avatarVariants, avatarFallbackVariants }

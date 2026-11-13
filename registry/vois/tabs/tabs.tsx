// Vois Tabs. Replaces shadcn/ui's components/ui/tabs.tsx (Radix Tabs) with the same parts, plus "variant"
// and "size" on TabsList.
//
// Two styles from the Figma Selectors page, chosen on the list and read by each trigger:
//   pill (default), the Figma Tab set: --shape-pill capsules (vois-tokens DS-SHAPE-002). Resting --tab-resting with a
//     --border-default border, hover --tab-hover with --border-state-hover, active --tab-selected with
//     --text-auxiliary text, disabled --tab-disabled with --text-state-disabled. size "default" is 28
//     tall (1px border, 14/20), size "lg" is 40 tall (2px border, 16/24).
//   underline, the Figma Tab Nav set: 48 tall, with a 32 tall label box inside. Text is --text-subtle
//     at rest and --text-primary on hover or when active. The bottom edge is 2px --border-accent when
//     active, 1px --border-state-hover on hover, 1px --border-state-disabled when disabled. The edge is
//     an inset shadow, so the height never changes.
// Focus is a 2px --border-state-focus ring: around the pill, 2px out, or around the underline label box.
//
// Use Tabs for a few content areas the user moves between freely (vois-components Job 5), all visible
// at once. For more than 5 or 6, use a Select. Tabs are always mutually exclusive.
//
// Which state wins: disabled, then active, then hover, then resting. data-* variants are written after
// hover and disabled, so active is guarded with not-disabled.
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-[var(--space-v-between-text)]", className)} {...props} />
}

const tabsListVariants = cva("group/tabs-list flex items-center", {
  variants: {
    variant: {
      pill: "flex-wrap gap-[var(--space-h-between-chips)]",
      underline: "gap-0",
    },
    size: { default: "", lg: "" },
  },
  defaultVariants: { variant: "pill", size: "default" },
})

function TabsList({
  className,
  variant = "pill",
  size = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return <TabsPrimitive.List data-slot="tabs-list" data-variant={variant} data-size={size} className={cn(tabsListVariants({ variant, size }), className)} {...props} />
}

// Each class is scoped to the list's variant (and size), so one trigger works in either style. The
// prefixes are written out in full because Tailwind finds classes only as literal text.

const tabsTriggerClasses = [
  "group/tab relative inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap select-none [font-weight:var(--font-weight-semi-bold)]",
  "text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)]",
  "transition-[color,background-color,border-color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
  "disabled:cursor-not-allowed",
  // pill
  "group-data-[variant=pill]/tabs-list:h-[var(--size-28)] group-data-[variant=pill]/tabs-list:gap-[var(--space-4)] group-data-[variant=pill]/tabs-list:rounded-[var(--shape-pill)] group-data-[variant=pill]/tabs-list:border group-data-[variant=pill]/tabs-list:px-[var(--space-padding-small)]",
  "group-data-[variant=pill]/tabs-list:border-[color:var(--border-default)] group-data-[variant=pill]/tabs-list:bg-[color:var(--tab-resting)] group-data-[variant=pill]/tabs-list:text-[color:var(--text-primary)]",
  "group-data-[variant=pill]/tabs-list:hover:border-[color:var(--border-state-hover)] group-data-[variant=pill]/tabs-list:hover:bg-[color:var(--tab-hover)]",
  "group-data-[variant=pill]/tabs-list:data-[state=active]:not-disabled:border-transparent group-data-[variant=pill]/tabs-list:data-[state=active]:not-disabled:bg-[color:var(--tab-selected)] group-data-[variant=pill]/tabs-list:data-[state=active]:not-disabled:text-[color:var(--text-auxiliary)]",
  "group-data-[variant=pill]/tabs-list:disabled:border-transparent group-data-[variant=pill]/tabs-list:disabled:bg-[color:var(--tab-disabled)] group-data-[variant=pill]/tabs-list:disabled:text-[color:var(--text-state-disabled)]",
  "group-data-[variant=pill]/tabs-list:focus-visible:outline-2 group-data-[variant=pill]/tabs-list:focus-visible:outline-offset-2 group-data-[variant=pill]/tabs-list:focus-visible:outline-[color:var(--border-state-focus)]",
  "group-data-[variant=pill]/tabs-list:group-data-[size=lg]/tabs-list:h-[var(--size-40)] group-data-[variant=pill]/tabs-list:group-data-[size=lg]/tabs-list:border-2 group-data-[variant=pill]/tabs-list:group-data-[size=lg]/tabs-list:px-[var(--space-padding-medium)] group-data-[variant=pill]/tabs-list:group-data-[size=lg]/tabs-list:text-[length:var(--font-size-small)] group-data-[variant=pill]/tabs-list:group-data-[size=lg]/tabs-list:leading-[var(--line-height-small)]",
  // underline
  "group-data-[variant=underline]/tabs-list:h-[var(--size-48)] group-data-[variant=underline]/tabs-list:p-[var(--space-padding-x-small)] group-data-[variant=underline]/tabs-list:text-[color:var(--text-subtle)] group-data-[variant=underline]/tabs-list:outline-none",
  "group-data-[variant=underline]/tabs-list:hover:text-[color:var(--text-primary)] group-data-[variant=underline]/tabs-list:hover:shadow-[inset_0_-1px_0_0_var(--border-state-hover)]",
  "group-data-[variant=underline]/tabs-list:data-[state=active]:not-disabled:text-[color:var(--text-primary)] group-data-[variant=underline]/tabs-list:data-[state=active]:not-disabled:shadow-[inset_0_-2px_0_0_var(--border-accent)]",
  "group-data-[variant=underline]/tabs-list:disabled:text-[color:var(--text-state-disabled)] group-data-[variant=underline]/tabs-list:disabled:shadow-[inset_0_-1px_0_0_var(--border-state-disabled)]",
]

// The label box: plain in a pill, the 32 tall focus target in the underline style.
const tabsLabelClasses = [
  "inline-flex items-center gap-[var(--space-padding-x-small)]",
  "group-data-[variant=underline]/tabs-list:h-[var(--size-32)] group-data-[variant=underline]/tabs-list:rounded-[var(--radius-selectors)] group-data-[variant=underline]/tabs-list:px-[var(--space-padding-small)]",
  "group-data-[variant=underline]/tabs-list:group-focus-visible/tab:outline-2 group-data-[variant=underline]/tabs-list:group-focus-visible/tab:outline-offset-0 group-data-[variant=underline]/tabs-list:group-focus-visible/tab:outline-[color:var(--border-state-focus)]",
]

function TabsTrigger({ className, children, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger data-slot="tabs-trigger" className={cn(tabsTriggerClasses, className)} {...props}>
      <span data-slot="tabs-trigger-label" className={cn(tabsLabelClasses)}>
        {children}
      </span>
    </TabsPrimitive.Trigger>
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 rounded-[var(--radius-selectors)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)]", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }

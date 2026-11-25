// Vois Accordion. Replaces shadcn/ui's components/ui/accordion.tsx (Radix Accordion) with the same parts:
// Accordion, AccordionItem, AccordionTrigger, AccordionContent.
//
// From the Figma Accordian set (Components, 4508:6933): each item is its own card, with no divider between
// items. Resting is --bg-default, hover is --bg-subtle (on the whole item, open or closed), --shape-rounded
// corners, 24 padding (--space-padding-large), and 16 between the header and the content. The title is 20/28
// semibold --text-primary. The content is 16/24 --text-subtle. A 24 icon sits at the end of the header: a plus
// when the item is closed, a close (X) when it is open. The icon is decorative (aria-hidden); the open or
// closed state is carried by aria-expanded, which Radix sets. The gap between items (--space-v-between-items)
// is not in Figma, which draws each item alone. Focus is a 2px --border-state-focus outline on the header.
// A disabled item (not in Figma) uses --text-state-disabled and the not-allowed cursor.
//
// The content opens and closes by height in --motion-duration-base, using the height Radix measures
// (--radix-accordion-content-height). Under reduced motion it opens and closes at once. The keyframes ship as a
// React 19 <style href precedence>, because Radix waits for the close animation before it hides the content.
//
// Keyboard: Tab reaches each header, Enter or Space toggles it, and Up, Down, Home and End move between headers
// (Radix). type="single" opens one item at a time; add `collapsible` so the open one can be closed.
// type="multiple" lets several be open. Use an Accordion for a set of short, related answers or sections the
// reader scans and opens one by one (a FAQ). For one lone block of optional detail, use a Collapsible. For
// panels the reader switches between and wants side by side, use Tabs. Do not hide content people must read
// to finish the task. Each header needs a text title: the trigger's name is its text (vois-tokens DS-A11Y-029).
import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const accordionKeyframes =
  "@keyframes vois-accordion-down{from{height:0}to{height:var(--radix-accordion-content-height)}}@keyframes vois-accordion-up{from{height:var(--radix-accordion-content-height)}to{height:0}}"

function Accordion({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" className={cn("flex w-full flex-col gap-[var(--space-v-between-items)]", className)} {...props} />
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "rounded-[var(--shape-rounded)] bg-[color:var(--bg-default)] p-[var(--space-padding-large)]",
        "transition-[background-color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
        "hover:bg-[color:var(--bg-subtle)] data-[disabled]:hover:bg-[color:var(--bg-default)]",
        className
      )}
      {...props}
    />
  )
}

function PlusIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" focusable="false" {...props}>
      <path d="M3 12h18" />
      <path d="M12 3v18" />
    </svg>
  )
}

function CloseIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" focusable="false" {...props}>
      <path d="M5 5l14 14" />
      <path d="M19 5L5 19" />
    </svg>
  )
}

function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger flex flex-1 cursor-pointer items-center justify-between gap-[var(--space-padding-medium)] rounded-[var(--shape-rounded)] text-left",
          "text-[color:var(--text-primary)] text-[length:var(--font-size-large)] leading-[var(--line-height-large)] [font-weight:var(--font-weight-semi-bold)]",
          "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)]",
          "disabled:cursor-not-allowed disabled:text-[color:var(--text-state-disabled)]",
          className
        )}
        {...props}
      >
        {children}
        <span className="relative size-6 shrink-0" aria-hidden="true">
          <PlusIcon className="absolute inset-0 size-6 group-data-[state=open]/accordion-trigger:hidden" />
          <CloseIcon className="absolute inset-0 hidden size-6 group-data-[state=open]/accordion-trigger:block" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={cn(
        "overflow-hidden text-[color:var(--text-subtle)] text-[length:var(--font-size-small)] leading-[var(--line-height-small)] [font-weight:var(--font-weight-regular)]",
        // motion-safe: guards each state's animation, because a data-* variant would win over motion-reduce:animate-none.
        // With no animation, Radix shows and hides the content at once.
        "motion-safe:data-[state=open]:animate-[vois-accordion-down_var(--motion-duration-base)_var(--motion-ease-standard)]",
        "motion-safe:data-[state=closed]:animate-[vois-accordion-up_var(--motion-duration-base)_var(--motion-ease-standard)]",
        "motion-reduce:animate-none",
        className
      )}
      {...props}
    >
      <style href="vois-accordion-keyframes" precedence="default">
        {accordionKeyframes}
      </style>
      <div className="pt-[var(--space-padding-medium)]">{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

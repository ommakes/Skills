// Vois Collapsible. shadcn/ui's components/ui/collapsible.tsx (Radix Collapsible) with the same parts:
// Collapsible, CollapsibleTrigger, CollapsibleContent.
//
// Radix Collapsible has no look of its own, and neither does this: the trigger is whatever you pass, usually
// a Button or a row with `asChild`, so it takes the Vois focus ring from that component. The Vois part is the
// motion. The content opens and closes by height in --motion-duration-base with --motion-ease-standard, and
// under reduced motion it opens and closes at once. Radix waits for the close animation before it hides the
// content, so the animation needs keyframes, which ship as a React 19 <style href precedence> and use the
// height Radix measures (--radix-collapsible-content-height).
//
// Use it to tuck away secondary detail that most readers skip: a reasoning trace, a tool call's arguments, an
// "advanced options" block. The trigger must say what it opens, and Radix sets aria-expanded and aria-controls.
// vois-components has no job for a standalone disclosure yet; the AI parts (reasoning, tool call) build on it.
// Do not pass your own `id` to CollapsibleContent: Radix points the trigger's aria-controls at its own generated id,
// so a custom id breaks the link between the trigger and what it opens.
// For a set of panels where one opens at a time, use an Accordion (not in the registry yet).
import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const collapsibleKeyframes =
  "@keyframes vois-collapsible-down{from{height:0}to{height:var(--radix-collapsible-content-height)}}@keyframes vois-collapsible-up{from{height:var(--radix-collapsible-content-height)}to{height:0}}"

function Collapsible(props: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger(props: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
}

function CollapsibleContent({ className, children, ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  return (
    <CollapsiblePrimitive.Content
      data-slot="collapsible-content"
      className={cn(
        "overflow-hidden",
        // motion-safe: guards each state's animation, because a data-* variant would win over motion-reduce:animate-none.
        // With no animation, Radix shows and hides the content at once.
        "motion-safe:data-[state=open]:animate-[vois-collapsible-down_var(--motion-duration-base)_var(--motion-ease-standard)]",
        "motion-safe:data-[state=closed]:animate-[vois-collapsible-up_var(--motion-duration-base)_var(--motion-ease-standard)]",
        "motion-reduce:animate-none",
        className
      )}
      {...props}
    >
      <style href="vois-collapsible-keyframes" precedence="default">
        {collapsibleKeyframes}
      </style>
      {children}
    </CollapsiblePrimitive.Content>
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

// Vois Inspector. The inside of a properties pane: the controls that edit the selected thing, in collapsible
// sections of label and control rows. Put it in a Panel (vois-panel, JOB-SECONDARY-CONTENT: "an inspector,
// a properties pane"). shadcn/ui has no inspector. Parts: InspectorSection, InspectorSectionTrigger,
// InspectorSectionContent, InspectorRow, InspectorLabel, InspectorControlGroup and InspectorToggle.
//
// Layout:
//   InspectorSection: a Collapsible (vois-collapsible), open by default, a 1px --border-pretty line under it
//     (none under the last one).
//   InspectorSectionTrigger: a heading (h3 unless `level` says otherwise) around a full-width button, at least
//     --hit-area-min tall, title 16/24 semibold --text-primary, a chevron in --icon-secondary that turns when
//     the section closes. Focus is a 2px --border-state-focus ring inside the row.
//   InspectorSectionContent: the rows, --space-8 apart, --space-16 under the last one. Its clip box reaches
//     8px past the rows, so a focus ring at a row's edge is not cut off by the Collapsible.
//   InspectorRow: a two-column grid, label one part and control two parts, --space-12 between them, so every
//     control in the pane starts on the same line. `stacked` puts the label over the control, for a control
//     that needs the full width (a gradient, a long Select).
//   InspectorLabel: a <label>, 14/20 medium --text-secondary (the FieldLabel text). Point htmlFor at the
//     control's id. For a control that is not labelable (a group of toggles), give the label an id and the
//     control aria-labelledby.
//   InspectorControlGroup: two or more controls that edit one property and read as one (a fill and its
//     opacity, a padding slider and its per-side toggle). --space-4 apart, the outer corners as each control
//     draws them, the corners that face each other --radii-2. The first control takes the free width.
//   InspectorToggle: a Radix Toggle, a 32 square (--size-field-compact) so it matches the fields beside it
//     (DS-COMPONENT-007: a button next to a field matches its height). --input-resting fill like a field,
//     --input-hover on hover, --bg-pressed and --icon-state-active when on, the field focus ring. It needs an
//     aria-label, and aria-expanded plus aria-controls when it shows more rows (individual sides).
//
// Controls in an inspector are the dense size: Select and Input `size="compact"` (32), the StepSlider (32),
// the SwatchPicker (32). The pane is a dense row in DS-COMPONENT-007's sense; the main form of a page is not.
//
// Every edit applies at once, so there is no Save button in the rows. If edits need confirming (copying them
// out, publishing), put that one action in the PanelFooter.
import * as React from "react"
import { Toggle as TogglePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

function ChevronDown(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="m6 9 6 6 6-6" /></svg>
}

function InspectorSection({ className, defaultOpen = true, ...props }: React.ComponentProps<typeof Collapsible>) {
  return (
    <Collapsible
      data-slot="inspector-section"
      defaultOpen={defaultOpen}
      className={cn("border-b border-[color:var(--border-pretty)] last:border-b-0", className)}
      {...props}
    />
  )
}

type InspectorSectionTriggerProps = React.ComponentProps<typeof CollapsibleTrigger> & { level?: 2 | 3 | 4 }

function InspectorSectionTrigger({ className, children, level = 3, ...props }: InspectorSectionTriggerProps) {
  const Heading = `h${level}` as "h2" | "h3" | "h4"
  return (
    <Heading data-slot="inspector-section-heading" className="m-0">
      <CollapsibleTrigger
        data-slot="inspector-section-trigger"
        className={cn(
          "group/trigger flex min-h-[var(--hit-area-min)] w-full cursor-pointer items-center justify-between gap-[var(--space-8)] rounded-[var(--radii-6)] bg-transparent text-left",
          "text-[length:var(--font-size-small)] leading-[var(--line-height-small)] [font-weight:var(--font-weight-semi-bold)] text-[color:var(--text-primary)]",
          "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)]",
          className
        )}
        {...props}
      >
        <span className="min-w-0 truncate">{children}</span>
        <ChevronDown
          className={cn(
            "size-[var(--size-icon-small)] shrink-0 text-[color:var(--icon-secondary)] group-hover/trigger:text-[color:var(--icon-state-hover)]",
            "transition-transform duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
            "group-data-[state=closed]/trigger:-rotate-90"
          )}
        />
      </CollapsibleTrigger>
    </Heading>
  )
}

function InspectorSectionContent({ className, children, ...props }: React.ComponentProps<typeof CollapsibleContent>) {
  return (
    // The Collapsible clips its content (overflow hidden, for the height animation), which would cut off the
    // focus rings of controls at the row edges. The clip box is 8px bigger than the rows on each side and
    // pulled back by the same, so the rows stay where they are and the rings show.
    <CollapsibleContent
      data-slot="inspector-section-content"
      className="-mx-[var(--space-8)] -mt-[var(--space-8)] px-[var(--space-8)] pt-[var(--space-8)]"
      {...props}
    >
      <div className={cn("flex flex-col gap-[var(--space-8)] pb-[var(--space-16)]", className)}>{children}</div>
    </CollapsibleContent>
  )
}

function InspectorRow({ className, stacked = false, ...props }: React.ComponentProps<"div"> & { stacked?: boolean }) {
  return (
    <div
      data-slot="inspector-row"
      data-stacked={stacked ? "" : undefined}
      className={cn(
        stacked
          ? "flex flex-col gap-[var(--space-4)]"
          : "grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-center gap-[var(--space-12)]",
        className
      )}
      {...props}
    />
  )
}

function InspectorLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="inspector-label"
      className={cn(
        "min-w-0 truncate text-[color:var(--text-secondary)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-medium)]",
        className
      )}
      {...props}
    />
  )
}

function InspectorControlGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="inspector-control-group"
      role="group"
      className={cn(
        "flex min-w-0 items-stretch gap-[var(--space-4)]",
        "[&>*]:min-w-0 [&>*:first-child]:flex-1 [&>*:not(:first-child)]:shrink-0",
        "[&>*:not(:first-child)]:rounded-l-[var(--radii-2)] [&>*:not(:last-child)]:rounded-r-[var(--radii-2)]",
        className
      )}
      {...props}
    />
  )
}

function InspectorToggle({ className, ...props }: React.ComponentProps<typeof TogglePrimitive.Root>) {
  return (
    <TogglePrimitive.Root
      data-slot="inspector-toggle"
      className={cn(
        "relative inline-flex size-[var(--size-field-compact)] shrink-0 cursor-pointer items-center justify-center rounded-[var(--shape-subtle)]",
        "bg-[color:var(--input-resting)] text-[color:var(--icon-state-resting)] [&_svg]:size-[var(--size-icon-small)] [&_svg]:shrink-0",
        "after:absolute after:top-1/2 after:left-1/2 after:size-full after:min-h-[var(--hit-area-min)] after:min-w-[var(--hit-area-min)] after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']",
        "transition-[background-color,color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
        "hover:bg-[color:var(--input-hover)] hover:text-[color:var(--icon-state-hover)]",
        "data-[state=on]:bg-[color:var(--bg-pressed)] data-[state=on]:text-[color:var(--icon-state-active)]",
        "focus-visible:outline-[length:var(--focus-ring-width)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:outline-[color:var(--border-state-focus)]",
        "disabled:cursor-not-allowed disabled:bg-[color:var(--input-disabled)] disabled:text-[color:var(--icon-state-disabled)]",
        className
      )}
      {...props}
    />
  )
}

export {
  InspectorSection,
  InspectorSectionTrigger,
  InspectorSectionContent,
  InspectorRow,
  InspectorLabel,
  InspectorControlGroup,
  InspectorToggle,
}

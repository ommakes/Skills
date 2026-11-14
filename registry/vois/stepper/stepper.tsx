// Vois Stepper. shadcn/ui ships no Stepper; this is the one vois-components references/stepper.md
// specifies, for JOB-MULTISTEP-GUIDE: a step indicator above a sequential, required flow of 2 to 5 steps.
// It shows where the user is. Back and Next buttons in the form move between steps, not the indicator.
//
// Markers follow the Figma Stepper Dots set (Components page, Progress), drawn at 32 (--size-32) for every
// state, as the spec asks, so they line up:
//   current:  --base-positive fill, the number 18/26 semibold (Figma Number Dot, Active).
//   complete: --base-positive fill, a check (Figma Check Dot, Active; Figma draws it at 24).
//   The number and check use --label-on-solid-text-on-dark, not Figma's --text-on-dark: that is white in both
//   themes, and dark --base-positive is a light green (1.2:1). The label token is white in light, near
//   black in dark (5.2:1 and 14.4:1).
//   upcoming: no fill, a 2px --control-border ring, the number in --text-subtle. Figma's Inactive dot is
//             --icon-state-disabled with a white number, which is under 3:1, so the spec's neutral ring is used.
//   error:    no fill, a 2px --icon-negative ring and an alert mark in --icon-negative.
// Connectors follow the Figma Stepper Line set: 2px, --border-state-focus after a complete step, otherwise
// --border-default (Figma's Border-Opaque has no Web code syntax).
// Labels are 16/24: current --text-primary medium, complete and error --text-primary, upcoming
// --text-subtle. The optional description is one line, --text-subtle 14/20, shown on the current step only.
//
// Every state carries more than color (DS-COLOR-003): a number, a check or an alert mark, plus visually
// hidden text ("Step 2", "Completed", "Needs attention") and aria-current="step" on the current step.
// It is a nav with an aria-label that names the flow, holding an ordered list.
//
// orientation "horizontal" (default): markers and labels in a row with connectors between. Below the sm
// breakpoint the labels are hidden (still read by screen readers) and one line under the markers reads
// "Step 2 of 3: Team". orientation "vertical": a column, connectors run down from each marker.
//
// The indicator is not in the tab order. The one exception: a complete step given onSelect becomes a
// button, for flows where going back loses nothing the user typed. Other states ignore onSelect.
//
// Color changes take --motion-duration-fast and stop under prefers-reduced-motion (DS-ANIMATION-004).
import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

type StepStatus = "upcoming" | "current" | "complete" | "error"

type StepperItemProps = Omit<React.ComponentProps<"li">, "onSelect"> & {
  step: number
  status: StepStatus
  label: React.ReactNode
  description?: React.ReactNode
  onSelect?: () => void
}

const StepperContext = React.createContext<{ orientation: "horizontal" | "vertical"; total: number }>({
  orientation: "horizontal",
  total: 0,
})

type StepperProps = Omit<React.ComponentProps<"nav">, "aria-label"> & {
  "aria-label": string
  orientation?: "horizontal" | "vertical"
}

function Stepper({ className, orientation = "horizontal", children, ...props }: StepperProps) {
  const items = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<StepperItemProps>[]
  const current = items.find((item) => item.props.status === "current")
  return (
    <StepperContext.Provider value={{ orientation, total: items.length }}>
      <nav data-slot="stepper" data-orientation={orientation} className={cn("group/stepper w-full", className)} {...props}>
        <ol
          data-slot="stepper-list"
          className={cn(
            "flex",
            orientation === "horizontal" ? "flex-row items-center gap-[var(--space-8)]" : "flex-col"
          )}
        >
          {children}
        </ol>
        {orientation === "horizontal" && current ? (
          <p
            data-slot="stepper-summary"
            aria-hidden="true"
            className="mt-[var(--space-8)] text-[length:var(--font-size-small)] leading-[var(--line-height-small)] [font-weight:var(--font-weight-medium)] text-[color:var(--text-primary)] sm:hidden"
          >
            Step {current.props.step} of {items.length}: {current.props.label}
          </p>
        ) : null}
      </nav>
    </StepperContext.Provider>
  )
}

const markerVariants = cva(
  [
    "relative inline-flex size-[var(--size-32)] shrink-0 items-center justify-center rounded-[var(--shape-circle)]",
    "text-[length:var(--font-size-medium)] leading-[var(--line-height-medium)] [font-weight:var(--font-weight-semi-bold)]",
    "transition-[background-color,box-shadow,color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
  ],
  {
    variants: {
      status: {
        upcoming: "bg-transparent shadow-[inset_0_0_0_2px_var(--control-border)] text-[color:var(--text-subtle)]",
        current: "bg-[color:var(--base-positive)] text-[color:var(--label-on-solid-text-on-dark)]",
        complete: "bg-[color:var(--base-positive)] text-[color:var(--label-on-solid-text-on-dark)]",
        error: "bg-transparent shadow-[inset_0_0_0_2px_var(--icon-negative)] text-[color:var(--icon-negative)]",
      },
    },
    defaultVariants: { status: "upcoming" },
  }
)

const labelVariants = cva("text-[length:var(--font-size-small)] leading-[var(--line-height-small)] transition-[color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none", {
  variants: {
    status: {
      upcoming: "[font-weight:var(--font-weight-regular)] text-[color:var(--text-subtle)]",
      current: "[font-weight:var(--font-weight-medium)] text-[color:var(--text-primary)]",
      complete: "[font-weight:var(--font-weight-regular)] text-[color:var(--text-primary)]",
      error: "[font-weight:var(--font-weight-regular)] text-[color:var(--text-primary)]",
    },
  },
  defaultVariants: { status: "upcoming" },
})

const connectorClasses = [
  "transition-[background-color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
  "bg-[color:var(--border-default)] data-[filled=true]:bg-[color:var(--border-state-focus)]",
]

const hiddenStatus: Record<StepStatus, string | null> = {
  upcoming: null,
  current: null,
  complete: "Completed",
  error: "Needs attention",
}

function StepMark({ status, step }: { status: StepStatus; step: number }) {
  if (status === "complete")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-[var(--size-20)]">
        <path d="M19 7 9.5 16.5 5 12" />
      </svg>
    )
  if (status === "error")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" className="size-[var(--size-20)]">
        <path d="M12 6v8M12 18h.01" />
      </svg>
    )
  return <span aria-hidden="true">{step}</span>
}

function StepperItem({ className, step, status, label, description, onSelect, ...props }: StepperItemProps) {
  const { orientation, total } = React.useContext(StepperContext)
  const last = step >= total
  const vertical = orientation === "vertical"
  const clickable = status === "complete" && typeof onSelect === "function"
  const hidden = hiddenStatus[status]

  const body = (
    <>
      <span data-slot="stepper-marker" data-status={status} className={cn(markerVariants({ status }))}>
        <StepMark status={status} step={step} />
      </span>
      <span data-slot="stepper-text" className={cn("flex min-w-0 flex-col text-left", vertical ? "pt-[var(--space-4)]" : "max-sm:sr-only")}>
        <span data-slot="stepper-label" className={cn(labelVariants({ status }), clickable ? "group-hover/step-trigger:underline" : "")}>
          <span className="sr-only">Step {step}, </span>
          {label}
          {hidden ? <span className="sr-only">, {hidden}</span> : null}
        </span>
        {description && status === "current" ? (
          <span data-slot="stepper-description" className="text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] text-[color:var(--text-subtle)]">
            {description}
          </span>
        ) : null}
      </span>
    </>
  )

  const rowClasses = cn("flex items-start gap-[var(--space-12)]", vertical ? "" : "items-center")

  return (
    <li
      data-slot="stepper-item"
      data-status={status}
      aria-current={status === "current" ? "step" : undefined}
      className={cn(
        "relative flex",
        vertical ? "flex-col pb-[var(--space-24)] last:pb-0" : "min-w-0 flex-row items-center gap-[var(--space-8)]",
        !vertical && !last ? "flex-1" : "",
        className
      )}
      {...props}
    >
      {clickable ? (
        <button
          type="button"
          data-slot="stepper-trigger"
          onClick={onSelect}
          // This file installs as components/ui/stepper.tsx, a primitive, so the raw button is the base element.
          className={cn(rowClasses, "group/step-trigger cursor-pointer rounded-[var(--shape-subtle)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)]")}
        >
          {body}
        </button>
      ) : (
        <div className={rowClasses}>{body}</div>
      )}
      {!last ? (
        <span
          data-slot="stepper-connector"
          data-filled={status === "complete" ? "true" : "false"}
          aria-hidden="true"
          className={cn(
            connectorClasses,
            vertical
              ? "absolute top-[calc(var(--size-32)+var(--space-4))] bottom-[var(--space-4)] left-[calc(var(--size-32)/2-1px)] w-[2px]"
              : "h-[2px] min-w-[var(--space-16)] flex-1"
          )}
        />
      ) : null}
    </li>
  )
}

export { Stepper, StepperItem, type StepStatus }

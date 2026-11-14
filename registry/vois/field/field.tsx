// Vois Field. shadcn/ui's components/ui/field.tsx parts (Field, FieldLabel, FieldDescription,
// FieldError, FieldGroup, FieldSet, FieldLegend, FieldContent, FieldTitle) on Vois tokens, plus
// FieldControl, which wires the ids so the caller doesn't have to.
//
// Wiring: Field makes one id for its control (or takes `controlId`). FieldLabel gets htmlFor, so a
// click on the label focuses the control. FieldControl puts on its one child: the id,
// aria-describedby listing every FieldDescription and the FieldError that are rendered (descriptions
// first, error last), aria-invalid="true" while the field is invalid, and aria-required when the Field
// is `required`. The field is invalid when Field has `invalid` or a FieldError has something to show.
// FieldControl's values win over the child's own id and aria-invalid, so the label and the error can't
// point at nothing. Use useFieldControl() for a control that can't take the props through a child.
//
// Text, from the Figma Input Label (7614:25930) inside the Input Field (1199:2043) and Dropdown Field
// (3414:6634): the label is 14/20 medium --text-secondary; the description sits right under it (no gap),
// 14/20 regular --text-state-resting (4.5:1 or more on every field fill; --text-subtle has the same value now); the control is 8 below the label block; helper text and the error are
// 8 below the control, 12/16, --text-hint for helper text and --text-negative for the error. Required
// shows the Figma asterisk (16, --base-negative) after the label, hidden from screen readers, which get
// aria-required on the control instead. Figma has no "optional" marker, so there is none here.
//
// The error is announced with role="alert" (shadcn's choice too). FieldError renders nothing while there
// is no error, so the alert element appears with its text and screen readers read it once, at that
// moment, without the user moving focus. A polite live region would wait until the reader is idle, and
// a region inserted together with its text is often not read at all. The error id is also in the
// control's aria-describedby, so it is read again whenever the control gets focus. Validate on blur or
// submit, not on each keystroke, or the alert repeats while the user types.
//
// It serves vois-components JOB-ACCEPT-TEXT and every form job: one label, helper and error per control.
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

type FieldContextValue = {
  controlId: string
  invalid: boolean
  required: boolean
  describedBy: string | undefined
  register: (kind: "description" | "error", id: string) => () => void
}

const FieldContext = React.createContext<FieldContextValue | null>(null)

const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn("flex min-w-0 flex-col gap-[var(--space-v-component-default)] border-0 p-0 m-0", className)}
      {...props}
    />
  )
}

const fieldLegendVariants = cva("mb-[var(--space-v-between-text)] text-[color:var(--text-primary)]", {
  variants: {
    variant: {
      legend: "text-[length:var(--font-size-small)] leading-[var(--line-height-small)] [font-weight:var(--font-weight-semi-bold)]",
      label: "text-[color:var(--text-secondary)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-medium)]",
    },
  },
  defaultVariants: { variant: "legend" },
})

function FieldLegend({ className, variant = "legend", ...props }: React.ComponentProps<"legend"> & VariantProps<typeof fieldLegendVariants>) {
  return <legend data-slot="field-legend" data-variant={variant} className={cn(fieldLegendVariants({ variant }), className)} {...props} />
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("@container/field-group flex w-full flex-col gap-[var(--space-v-between-inputs)]", className)}
      {...props}
    />
  )
}

const fieldVariants = cva("group/field flex w-full", {
  variants: {
    orientation: {
      // Label block, then 8, then the control, then 8, then helper text or the error (Figma Input Field).
      vertical: "flex-col gap-[var(--space-8)]",
      // A checkbox or switch beside its label: control first or last, label and description in FieldContent.
      horizontal: "flex-row items-start gap-[var(--space-h-horizontal-relaxed)]",
      // Stacked in a narrow FieldGroup, side by side once the group is wide (a container query).
      responsive: "flex-col gap-[var(--space-8)] @md/field-group:flex-row @md/field-group:items-start @md/field-group:gap-[var(--space-h-horizontal-relaxed)]",
    },
  },
  defaultVariants: { orientation: "vertical" },
})

type FieldProps = React.ComponentProps<"div"> &
  VariantProps<typeof fieldVariants> & {
    /** The id the control gets. Defaults to a generated one. Put the id here, not on the control. */
    controlId?: string
    /** Marks the control invalid even when no FieldError is rendered. */
    invalid?: boolean
    /** Shows the required asterisk and sets aria-required on the control. */
    required?: boolean
  }

function Field({ className, orientation = "vertical", controlId, invalid = false, required = false, ...props }: FieldProps) {
  const generated = React.useId()
  const id = controlId ?? generated
  const [parts, setParts] = React.useState<{ descriptions: string[]; error: string | null }>({ descriptions: [], error: null })

  const register = React.useCallback((kind: "description" | "error", partId: string) => {
    setParts((p) =>
      kind === "error" ? { ...p, error: partId } : p.descriptions.includes(partId) ? p : { ...p, descriptions: [...p.descriptions, partId] }
    )
    return () =>
      setParts((p) =>
        kind === "error" ? (p.error === partId ? { ...p, error: null } : p) : { ...p, descriptions: p.descriptions.filter((d) => d !== partId) }
      )
  }, [])

  const isInvalid = invalid || parts.error !== null
  const ids = [...parts.descriptions, ...(parts.error ? [parts.error] : [])]
  const value = React.useMemo<FieldContextValue>(
    () => ({ controlId: id, invalid: isInvalid, required, describedBy: ids.length ? ids.join(" ") : undefined, register }),
    // ids is derived from parts; join keeps the memo stable while the list is unchanged.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, isInvalid, required, ids.join(" "), register]
  )

  return (
    <FieldContext.Provider value={value}>
      <div
        role="group"
        data-slot="field"
        data-orientation={orientation}
        data-invalid={isInvalid ? "true" : undefined}
        className={cn(fieldVariants({ orientation }), className)}
        {...props}
      />
    </FieldContext.Provider>
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field-content" className={cn("flex min-w-0 flex-1 flex-col", className)} {...props} />
}

function Asterisk(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" {...props}>
      <path d="M12 6v12M6.8 9l10.4 6M17.2 9 6.8 15" />
    </svg>
  )
}

const labelText =
  "text-[color:var(--text-secondary)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-medium)]"

function FieldLabel({ className, children, htmlFor, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const ctx = React.useContext(FieldContext)
  return (
    <LabelPrimitive.Root
      data-slot="field-label"
      htmlFor={htmlFor ?? ctx?.controlId}
      className={cn("inline-flex w-fit items-center select-none", labelText, className)}
      {...props}
    >
      {children}
      {ctx?.required ? <Asterisk data-slot="field-required" className="size-[var(--size-16)] shrink-0 text-[color:var(--base-negative)]" /> : null}
    </LabelPrimitive.Root>
  )
}

// A label-styled title for content that is not one labelable control (a group of choices).
function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field-title" className={cn("flex w-fit items-center", labelText, className)} {...props} />
}

function usePartId(kind: "description" | "error", active: boolean, explicitId: string | undefined) {
  const ctx = React.useContext(FieldContext)
  const generated = React.useId()
  const id = explicitId ?? generated
  const register = ctx?.register
  useIsoLayoutEffect(() => {
    if (!register || !active) return
    return register(kind, id)
  }, [register, kind, id, active])
  return id
}

const fieldDescriptionVariants = cva("text-pretty", {
  variants: {
    variant: {
      // The Figma Description, right under the label: the Field's 8 gap is taken back when it follows one.
      description:
        "text-[color:var(--text-state-resting)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-regular)] [[data-slot=field-label]+&]:-mt-[var(--space-8)]",
      // The Figma Helper Text, under the control.
      helper: "text-[color:var(--text-hint)] text-[length:var(--font-size-tiny)] leading-[var(--line-height-tiny)] [font-weight:var(--font-weight-regular)]",
    },
  },
  defaultVariants: { variant: "description" },
})

function FieldDescription({ className, variant = "description", id, ...props }: React.ComponentProps<"p"> & VariantProps<typeof fieldDescriptionVariants>) {
  const partId = usePartId("description", true, id)
  return <p id={partId} data-slot="field-description" data-variant={variant} className={cn(fieldDescriptionVariants({ variant }), className)} {...props} />
}

type FieldErrorProps = React.ComponentProps<"div"> & {
  /** Messages in the shape most form libraries give (react-hook-form, TanStack Form, Zod issues). */
  errors?: Array<{ message?: string } | undefined>
}

function FieldError({ className, children, errors, id, ...props }: FieldErrorProps) {
  let content: React.ReactNode = children
  if (!content && errors?.length) {
    const messages = [...new Set(errors.map((e) => e?.message).filter((m): m is string => !!m))]
    if (messages.length === 1) content = messages[0]
    else if (messages.length > 1)
      content = (
        <ul className="ml-[var(--space-16)] flex list-disc flex-col gap-[var(--space-4)]">
          {messages.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )
  }
  const has = content !== null && content !== undefined && content !== false && content !== ""
  const partId = usePartId("error", has, id)
  if (!has) return null
  return (
    <div
      id={partId}
      role="alert"
      data-slot="field-error"
      className={cn(
        "text-[color:var(--text-negative)] text-[length:var(--font-size-tiny)] leading-[var(--line-height-tiny)] [font-weight:var(--font-weight-regular)]",
        className
      )}
      {...props}
    >
      {content}
    </div>
  )
}

/** The props FieldControl puts on its child, for a control that can't be its direct child. */
function useFieldControl(own?: { "aria-describedby"?: string }) {
  const ctx = React.useContext(FieldContext)
  if (!ctx) return {}
  const describedBy = [own?.["aria-describedby"], ctx.describedBy].filter(Boolean).join(" ") || undefined
  return {
    id: ctx.controlId,
    "aria-describedby": describedBy,
    ...(ctx.invalid ? { "aria-invalid": true as const } : {}),
    ...(ctx.required ? { "aria-required": true as const } : {}),
  }
}

function FieldControl({ children }: { children: React.ReactElement<Record<string, unknown>> }) {
  const child = React.Children.only(children)
  const wired = useFieldControl({ "aria-describedby": child.props["aria-describedby"] as string | undefined })
  return React.cloneElement(child, wired)
}

export {
  Field,
  FieldContent,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
  useFieldControl,
  fieldVariants,
}

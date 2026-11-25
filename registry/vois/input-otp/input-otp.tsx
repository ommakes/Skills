// Vois InputOTP. shadcn/ui's components/ui/input-otp.tsx (InputOTP, InputOTPGroup, InputOTPSlot,
// InputOTPSeparator, built on the input-otp library) on Vois tokens, from the Figma Pin Code Input Cell
// (1826:2365) and Pin Code (2263:3248).
//
// One real <input> sits under the slots and owns the value, so paste, autofill from SMS, the
// password manager and screen readers all work on a single text field. The slots only draw it. The library
// sets autocomplete="one-time-code", inputMode="numeric" and spellCheck off, and calls onComplete when the
// value reaches maxLength. Pass `pattern` (for example REGEXP_ONLY_DIGITS from "input-otp") to limit the
// characters.
//
// Paste (vois-fields FIELD-PASTE: a one-time code field takes a pasted whole code). The library alone drops a
// paste that breaks the pattern, so "986 354" or "986-354" enters nothing, and it adds a paste after the caret,
// so a whole code pasted into a half-filled field overflows. InputOTP fixes both: `pasteTransformer` defaults to
// stripping spaces and dashes, and a paste that is at least `maxLength` long first selects the whole value, so it
// replaces what is there. A shorter paste goes in at the caret. A read-only or disabled field ignores paste.
//
// A slot is 40 x 40 (--size-40) with the --radius-input corners on the outer edges of a group only. Slots in
// a group share one edge, so a group reads as one box. Its look comes from one state, picked in this order:
// disabled, read-only, error (aria-invalid), active, filled, resting.
//   resting   --input-resting fill, --input-border edge
//   filled    --input-active (white) fill, --border-state-filled edge, --shadow-base   (Figma "Success" cell)
//   active    white fill, --border-state-active edge, --shadow-base, and a fake caret on an empty slot
//   error     --input-negative fill, --border-negative edge, --shadow-base
//   disabled  --input-disabled fill, --border-state-disabled edge, --text-state-disabled
//   read-only no edge, --input-resting fill, --text-state-instruction, one pixel between slots
// The active slot also gets the shared focus ring (--focus-ring-width and -offset, DS-FOCUS rule), which the
// Figma cell does not draw; it stays on in the error and read-only states. The caret blinks only where motion is allowed. It loops on the spin duration, since a blink is a loop and the tokens have no other one.
//
// The label, the status icon beside it and the Resend link in the Figma Pin Code are not part of this
// item. Compose them with Field (vois-field) and Button: the label and the error text come from Field, and
// aria-invalid reaches the input through FieldControl.
import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"

import { cn } from "@/lib/utils"

// Spaces and dashes (hyphen, en dash, em dash) in a pasted code: "986 354", "986-354", " 986354 ".
const stripSeparators = (pasted: string) => pasted.replace(/[\s\-\u2013\u2014]/g, "")

const caretKeyframes = "@keyframes vois-otp-caret{0%,49%{opacity:1}50%,100%{opacity:0}}"

type OtpState = { disabled: boolean; readOnly: boolean; invalid: boolean }

const OtpStateContext = React.createContext<OtpState>({ disabled: false, readOnly: false, invalid: false })

type InputOTPProps = Omit<React.ComponentProps<typeof OTPInput>, "render" | "children"> & {
  children: React.ReactNode
}

function InputOTP({
  className,
  containerClassName,
  children,
  disabled,
  readOnly,
  maxLength,
  pasteTransformer = stripSeparators,
  onPasteCapture,
  ...props
}: InputOTPProps) {
  const invalid = props["aria-invalid"] === true || props["aria-invalid"] === "true"
  const state = React.useMemo<OtpState>(
    () => ({ disabled: !!disabled, readOnly: !!readOnly && !disabled, invalid }),
    [disabled, readOnly, invalid]
  )
  return (
    <OtpStateContext.Provider value={state}>
      <style>{caretKeyframes}</style>
      <OTPInput
        data-slot="input-otp"
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        pasteTransformer={pasteTransformer}
        onPasteCapture={(e) => {
          onPasteCapture?.(e)
          if (e.defaultPrevented) return
          if (readOnly || disabled) {
            // The library writes a paste into the value itself, so a read-only code must stop it here.
            e.preventDefault()
            e.stopPropagation()
            return
          }
          // A whole code replaces the value: select it all first, and the library's paste then replaces the selection.
          if (pasteTransformer(e.clipboardData.getData("text/plain")).length >= maxLength) e.currentTarget.select()
        }}
        containerClassName={cn("flex items-center gap-[var(--space-12)]", disabled && "cursor-not-allowed", containerClassName)}
        className={cn("disabled:cursor-not-allowed", className)}
        {...props}
      >
        {children}
      </OTPInput>
    </OtpStateContext.Provider>
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="input-otp-group" className={cn("flex items-center", className)} {...props} />
}

const slotBase =
  "relative flex size-[var(--size-40)] shrink-0 items-center justify-center text-[color:var(--text-primary)] text-[length:var(--font-size-medium)] leading-[var(--line-height-large)] [font-weight:var(--font-weight-medium)] transition-[color,background-color,border-color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none"

// Shared edge: every slot draws top, bottom and left, and the last slot of a group also draws right, so two
// slots never double their edge. The corners round on the outer slots only.
const slotEdge =
  "border-y border-l first:rounded-l-[var(--radius-input)] last:rounded-r-[var(--radius-input)] last:border-r"

const slotLooks = {
  resting: `${slotEdge} border-[color:var(--input-border)] bg-[color:var(--input-resting)]`,
  filled: `${slotEdge} border-[color:var(--border-state-filled)] bg-[color:var(--input-active)] shadow-[var(--shadow-base)]`,
  active: `${slotEdge} border-[color:var(--border-state-active)] bg-[color:var(--input-active)] shadow-[var(--shadow-base)]`,
  invalid: `${slotEdge} border-[color:var(--border-negative)] bg-[color:var(--input-negative)] shadow-[var(--shadow-base)]`,
  disabled: `${slotEdge} border-[color:var(--border-state-disabled)] bg-[color:var(--input-disabled)] text-[color:var(--text-state-disabled)]`,
  // No edge, and a one pixel gap between slots, as in the Figma Read-only state.
  readOnly:
    "first:rounded-l-[var(--radius-input)] last:rounded-r-[var(--radius-input)] not-first:ml-px bg-[color:var(--input-resting)] text-[color:var(--text-state-instruction)]",
} as const

type SlotLook = keyof typeof slotLooks

function InputOTPSlot({ index, className, ...props }: React.ComponentProps<"div"> & { index: number }) {
  const { slots } = React.useContext(OTPInputContext)
  const { disabled, readOnly, invalid } = React.useContext(OtpStateContext)
  const { char, hasFakeCaret, isActive } = slots[index] ?? { char: null, hasFakeCaret: false, isActive: false }

  const look: SlotLook = disabled
    ? "disabled"
    : readOnly
      ? "readOnly"
      : invalid
        ? "invalid"
        : isActive
          ? "active"
          : char
            ? "filled"
            : "resting"
  // A read-only code can still take focus (to select and copy it), so it keeps the ring: nothing else shows where focus is.
  const ring = isActive && !disabled

  return (
    <div
      data-slot="input-otp-slot"
      data-look={look}
      data-active={isActive ? "true" : undefined}
      className={cn(
        slotBase,
        slotLooks[look],
        // The ring draws over the neighbor slots, so the active slot sits above them.
        ring &&
          "z-10 outline-[length:var(--focus-ring-width)] outline-offset-[var(--focus-ring-offset)] outline-[color:var(--border-state-focus)]",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret ? (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-5 w-px bg-[color:var(--text-primary)] motion-safe:animate-[vois-otp-caret_var(--motion-duration-spin)_step-end_infinite]" />
        </span>
      ) : null}
    </div>
  )
}

// The dot between two groups in the Figma Pin Code: 4 x 4, round. The slots are one text field, so a screen
// reader never meets the groups and the dot would only be noise: it is hidden from assistive technology.
function InputOTPSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      aria-hidden="true"
      className={cn("size-1 shrink-0 rounded-full bg-[color:var(--icon-state-disabled)]", className)}
      {...props}
    />
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }

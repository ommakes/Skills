import * as React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { Row, type Story } from "../frame"

export const input: Story = {
  title: "Input",
  items: ["vois-input", "vois-field"],
  render: ({ id }) => (
    <div className="flex max-w-md flex-col gap-4">
      <Field controlId={id("name")}>
        <FieldLabel>Full name</FieldLabel>
        <FieldControl><Input placeholder="Ada Lovelace" /></FieldControl>
        <FieldDescription>As it appears on your passport.</FieldDescription>
      </Field>
      <Field controlId={id("email")} required>
        <FieldLabel>Email</FieldLabel>
        <FieldControl><Input type="email" defaultValue="ada@example" /></FieldControl>
        <FieldError>Enter an email address with a domain, like ada@example.com.</FieldError>
      </Field>
      <Field controlId={id("city")}>
        <FieldLabel>City (disabled)</FieldLabel>
        <FieldControl><Input disabled defaultValue="London" /></FieldControl>
      </Field>
      <Field controlId={id("ref")}>
        <FieldLabel>Reference (read-only)</FieldLabel>
        <FieldControl><Input readOnly defaultValue="REF-20931" /></FieldControl>
      </Field>
      <Field controlId={id("prefill")}>
        <FieldLabel>Company (filled in for you)</FieldLabel>
        <FieldControl><Input prefill defaultValue="Analytical Engines Ltd" /></FieldControl>
      </Field>
      <Row label="Sizes">
        <Input aria-label="Default size" placeholder="Default" />
        <Input size="native" aria-label="Native size" placeholder="Native" />
        <Input size="compact" aria-label="Compact size" placeholder="Compact" />
      </Row>
    </div>
  ),
}

export const textarea: Story = {
  title: "Textarea",
  items: ["vois-textarea", "vois-field"],
  render: ({ id }) => (
    <div className="flex max-w-md flex-col gap-4">
      <Field controlId={id("notes")}>
        <FieldLabel>Notes</FieldLabel>
        <FieldControl><Textarea placeholder="Anything we should know?" /></FieldControl>
        <FieldDescription>It grows as you type.</FieldDescription>
      </Field>
      <Field controlId={id("bio")}>
        <FieldLabel>Bio</FieldLabel>
        <FieldControl><Textarea defaultValue="Wrote the first program." /></FieldControl>
        <FieldError>Keep it under 20 characters.</FieldError>
      </Field>
      <Field controlId={id("locked")}>
        <FieldLabel>Locked</FieldLabel>
        <FieldControl><Textarea disabled defaultValue="Cannot edit." /></FieldControl>
      </Field>
    </div>
  ),
}

const AlertCircleIcon = (props: React.ComponentProps<"svg">) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5M12 16.2v.01" />
  </svg>
)

const CheckIcon = (props: React.ComponentProps<"svg">) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)

/** The Figma Pin Code: a label with a status icon, two groups of three, and a Resend link. */
function Pin({
  controlId,
  initial = "",
  status,
  error,
  disabled,
  readOnly,
  autoFocus,
  resendDisabled,
}: {
  controlId: string
  initial?: string
  status?: "success" | "error"
  error?: string
  disabled?: boolean
  readOnly?: boolean
  autoFocus?: boolean
  resendDisabled?: boolean
}) {
  const [value, setValue] = React.useState(initial)
  return (
    <Field controlId={controlId} invalid={status === "error"}>
      <div className="flex items-center justify-between">
        <FieldLabel>Verification code</FieldLabel>
        {status === "success" ? <CheckIcon className="size-6 text-[color:var(--icon-positive)]" /> : null}
        {status === "error" ? <AlertCircleIcon className="size-6 text-[color:var(--icon-negative)]" /> : null}
      </div>
      <FieldControl>
        <InputOTP
          maxLength={6}
          value={value}
          onChange={setValue}
          disabled={disabled}
          readOnly={readOnly}
          autoFocus={autoFocus}
          pattern={status === "error" ? undefined : REGEXP_ONLY_DIGITS}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </FieldControl>
      {error ? <FieldError>{error}</FieldError> : null}
      {readOnly || disabled ? null : (
        <div className="flex justify-end">
          <Button variant="link" size="sm" disabled={resendDisabled}>Resend</Button>
        </div>
      )}
    </Field>
  )
}

export const inputOtp: Story = {
  title: "Input OTP",
  items: ["vois-input-otp", "vois-field", "vois-button"],
  render: ({ id, state }) => (
    <div className="flex max-w-xs flex-col gap-6">
      <Pin controlId={id("empty")} autoFocus={state === "active"} />
      <Pin controlId={id("filling")} initial="98" />
      <Pin controlId={id("complete")} initial="986354" status="success" resendDisabled />
      <Pin controlId={id("error")} initial="98635!" status="error" error="That code is not right. Check it and try again." />
      <Pin controlId={id("readonly")} initial="986354" readOnly />
      <Pin controlId={id("disabled")} initial="986354" disabled />
    </div>
  ),
  states: { active: { expect: "[data-slot=input-otp-slot][data-active=true]" } },
}

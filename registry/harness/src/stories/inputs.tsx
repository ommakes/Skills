import * as React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
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

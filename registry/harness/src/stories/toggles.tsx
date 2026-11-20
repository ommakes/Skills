import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Field, FieldContent, FieldControl, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Row, type Story } from "../frame"

export const checkbox: Story = {
  title: "Checkbox",
  items: ["vois-checkbox", "vois-field"],
  render: ({ id }) => (
    <div className="flex max-w-md flex-col gap-4">
      <Field orientation="horizontal" controlId={id("news")}>
        <FieldControl><Checkbox /></FieldControl>
        <FieldContent>
          <FieldLabel>Send me the newsletter</FieldLabel>
          <FieldDescription>One email a month.</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal" controlId={id("terms")}>
        <FieldControl><Checkbox defaultChecked /></FieldControl>
        <FieldContent><FieldLabel>I accept the terms</FieldLabel></FieldContent>
      </Field>
      <Field orientation="horizontal" controlId={id("some")}>
        <FieldControl><Checkbox checked="indeterminate" /></FieldControl>
        <FieldContent><FieldLabel>Some items selected</FieldLabel></FieldContent>
      </Field>
      <Field orientation="horizontal" controlId={id("off")}>
        <FieldControl><Checkbox disabled /></FieldControl>
        <FieldContent><FieldLabel>Unavailable</FieldLabel></FieldContent>
      </Field>
      <Field orientation="horizontal" controlId={id("off-on")}>
        <FieldControl><Checkbox disabled defaultChecked /></FieldControl>
        <FieldContent><FieldLabel>Unavailable and checked</FieldLabel></FieldContent>
      </Field>
    </div>
  ),
}

export const switchStory: Story = {
  title: "Switch",
  items: ["vois-switch", "vois-field"],
  render: ({ id }) => (
    <div className="flex max-w-md flex-col gap-4">
      <Field orientation="horizontal" controlId={id("wifi")}>
        <FieldControl><Switch /></FieldControl>
        <FieldContent><FieldLabel>Wi-Fi</FieldLabel></FieldContent>
      </Field>
      <Field orientation="horizontal" controlId={id("sync")}>
        <FieldControl><Switch defaultChecked /></FieldControl>
        <FieldContent>
          <FieldLabel>Sync across devices</FieldLabel>
          <FieldDescription>Uses mobile data when Wi-Fi is off.</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal" controlId={id("beta")}>
        <FieldControl><Switch disabled /></FieldControl>
        <FieldContent><FieldLabel>Beta features (disabled)</FieldLabel></FieldContent>
      </Field>
      <Row label="Sizes">
        <Switch aria-label="Default size" />
        <Switch size="sm" aria-label="Small size" />
      </Row>
    </div>
  ),
}

export const radioGroup: Story = {
  title: "Radio group",
  items: ["vois-radio-group", "vois-field"],
  render: ({ id }) => (
    <RadioGroup defaultValue="monthly" aria-label="Billing period" className="max-w-md">
      <Field orientation="horizontal" controlId={id("monthly")}>
        <FieldControl><RadioGroupItem value="monthly" /></FieldControl>
        <FieldContent><FieldLabel>Monthly</FieldLabel></FieldContent>
      </Field>
      <Field orientation="horizontal" controlId={id("yearly")}>
        <FieldControl><RadioGroupItem value="yearly" /></FieldControl>
        <FieldContent>
          <FieldLabel>Yearly</FieldLabel>
          <FieldDescription>Two months free.</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal" controlId={id("never")}>
        <FieldControl><RadioGroupItem value="never" disabled /></FieldControl>
        <FieldContent><FieldLabel>Never (disabled)</FieldLabel></FieldContent>
      </Field>
    </RadioGroup>
  ),
}

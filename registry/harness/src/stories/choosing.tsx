import * as React from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { Stepper, StepperItem } from "@/components/ui/stepper"
import { ChoiceCheckboxGroup, ChoiceListItem, ChoiceRadioGroup } from "@/components/ui/choice-list"
import { ChoiceCardItem } from "@/components/ui/choice-card"
import { Field, FieldControl, FieldError, FieldLabel } from "@/components/ui/field"
import { Row, type Story } from "../frame"

export const select: Story = {
  title: "Select",
  items: ["vois-select", "vois-field"],
  render: ({ id, state }) => (
    <div className="flex max-w-sm flex-col gap-4">
      <Field controlId={id("country")}>
        <FieldLabel>Country</FieldLabel>
        <Select defaultOpen={state === "open"} defaultValue="uk">
          <FieldControl>
            <SelectTrigger className="w-full"><SelectValue placeholder="Choose a country" /></SelectTrigger>
          </FieldControl>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Europe</SelectLabel>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="fr">France</SelectItem>
              <SelectItem value="de" disabled>Germany (unavailable)</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field controlId={id("plan")} required>
        <FieldLabel>Plan</FieldLabel>
        <Select defaultValue="free">
          <FieldControl>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          </FieldControl>
          <SelectContent>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
          </SelectContent>
        </Select>
        <FieldError>Plan changes take effect next month.</FieldError>
      </Field>
      <Field controlId={id("off")}>
        <FieldLabel>Region (disabled)</FieldLabel>
        <Select disabled defaultValue="eu">
          <FieldControl>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          </FieldControl>
          <SelectContent><SelectItem value="eu">Europe</SelectItem></SelectContent>
        </Select>
      </Field>
    </div>
  ),
  states: { open: { expect: "[data-slot=select-content]" } },
}

export const tabs: Story = {
  title: "Tabs",
  items: ["vois-tabs"],
  render: () => (
    <div className="flex flex-col gap-8">
      <Tabs defaultValue="overview">
        <TabsList aria-label="Account sections, pill style">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="old" disabled>Archive</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Your account at a glance.</TabsContent>
        <TabsContent value="billing">Invoices and payment methods.</TabsContent>
        <TabsContent value="team">People with access.</TabsContent>
      </Tabs>
      <Tabs defaultValue="activity">
        <TabsList variant="underline" aria-label="Project sections, underline style">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="activity">Recent changes.</TabsContent>
        <TabsContent value="files">Everything uploaded.</TabsContent>
        <TabsContent value="settings">Project options.</TabsContent>
      </Tabs>
      <Tabs defaultValue="a">
        <TabsList size="lg" aria-label="Large size">
          <TabsTrigger value="a">Large A</TabsTrigger>
          <TabsTrigger value="b">Large B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Large tab A.</TabsContent>
        <TabsContent value="b">Large tab B.</TabsContent>
      </Tabs>
    </div>
  ),
}

export const segmentedControl: Story = {
  title: "Segmented control",
  items: ["vois-segmented-control"],
  render: () => (
    <div className="flex flex-col gap-4">
      <SegmentedControl aria-label="View" defaultValue="list">
        <SegmentedControlItem value="list">List</SegmentedControlItem>
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
        <SegmentedControlItem value="board">Board</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl aria-label="Period, one segment unavailable" defaultValue="week">
        <SegmentedControlItem value="day">Day</SegmentedControlItem>
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
        <SegmentedControlItem value="month" disabled>Month</SegmentedControlItem>
      </SegmentedControl>
    </div>
  ),
}

export const stepper: Story = {
  title: "Stepper",
  items: ["vois-stepper"],
  render: () => (
    <div className="flex flex-col gap-8">
      <Stepper aria-label="Checkout progress">
        <StepperItem step={1} status="complete" label="Cart" />
        <StepperItem step={2} status="current" label="Address" />
        <StepperItem step={3} status="upcoming" label="Payment" />
      </Stepper>
      <Stepper aria-label="Import progress, vertical" orientation="vertical">
        <StepperItem step={1} status="complete" label="Upload" description="customers.csv, 2.1 MB" />
        <StepperItem step={2} status="error" label="Validate" description="3 rows need fixing" />
        <StepperItem step={3} status="upcoming" label="Import" />
      </Stepper>
    </div>
  ),
}

export const choiceList: Story = {
  title: "Choice list",
  items: ["vois-choice-list"],
  render: () => (
    <div className="flex max-w-md flex-col gap-6">
      <ChoiceRadioGroup aria-label="Delivery speed" defaultValue="standard">
        <ChoiceListItem value="standard" label="Standard" description="3 to 5 days" />
        <ChoiceListItem value="express" label="Express" description="Next day" />
        <ChoiceListItem value="pickup" label="Pickup" disabled />
      </ChoiceRadioGroup>
      <ChoiceCheckboxGroup aria-label="Extras" defaultValue={["gift"]}>
        <ChoiceListItem value="gift" label="Gift wrap" />
        <ChoiceListItem value="note" label="Add a note" description="Printed on the packing slip" />
      </ChoiceCheckboxGroup>
      <ChoiceRadioGroup aria-label="Invalid example, choose one" invalid>
        <ChoiceListItem value="a" label="Option A" />
        <ChoiceListItem value="b" label="Option B" />
      </ChoiceRadioGroup>
      <ChoiceRadioGroup aria-label="Auxiliary style" variant="aux" defaultValue="x">
        <ChoiceListItem value="x" label="Auxiliary X" />
        <ChoiceListItem value="y" label="Auxiliary Y" />
      </ChoiceRadioGroup>
    </div>
  ),
}

export const choiceCard: Story = {
  title: "Choice card",
  items: ["vois-choice-card", "vois-choice-list"],
  render: () => (
    <div className="flex max-w-md flex-col gap-6">
      <ChoiceRadioGroup aria-label="Plan" defaultValue="pro" className="gap-3">
        <ChoiceCardItem value="free" label="Free" description="For trying things out" />
        <ChoiceCardItem value="pro" label="Pro" description="For small teams">
          <p className="mt-2 text-[length:var(--font-size-xsmall)]">Includes everything in Free.</p>
        </ChoiceCardItem>
      </ChoiceRadioGroup>
      <ChoiceCheckboxGroup aria-label="Add-ons" className="gap-3">
        <ChoiceCardItem value="sso" label="Single sign-on" description="SAML and OIDC" />
        <ChoiceCardItem value="audit" label="Audit log" description="90 days" />
      </ChoiceCheckboxGroup>
    </div>
  ),
}

/** A disabled choice card. Same reason as cardDisabled: its description is the disabled text color, which axe cannot know is exempt. */
export const choiceCardDisabled: Story = {
  title: "Choice card, disabled",
  items: ["vois-choice-card", "vois-choice-list"],
  render: () => (
    <div className="max-w-md">
      <ChoiceRadioGroup aria-label="Plan, one choice unavailable" defaultValue="free" className="gap-3">
        <ChoiceCardItem value="free" label="Free" description="For trying things out" />
        <ChoiceCardItem value="ent" label="Enterprise" description="Contact sales" disabled />
      </ChoiceRadioGroup>
    </div>
  ),
}

/**
 * Selects that show their placeholder. The placeholder is #7e7e7e: 4.05:1 on white and 3.84:1 on the error fill in the default
 * tokens, under 4.5:1, so this page is in the baseline. It is its own page so the entry covers nothing else.
 */
export const selectPlaceholder: Story = {
  title: "Select, placeholder",
  items: ["vois-select", "vois-field"],
  render: ({ id }) => (
    <div className="flex max-w-sm flex-col gap-4">
      <Field controlId={id("size")}>
        <FieldLabel>Size</FieldLabel>
        <Select>
          <FieldControl>
            <SelectTrigger className="w-full"><SelectValue placeholder="Choose a size" /></SelectTrigger>
          </FieldControl>
          <SelectContent><SelectItem value="s">Small</SelectItem></SelectContent>
        </Select>
      </Field>
      <Field controlId={id("plan")} required>
        <FieldLabel>Plan</FieldLabel>
        <Select>
          <FieldControl>
            <SelectTrigger className="w-full"><SelectValue placeholder="Choose a plan" /></SelectTrigger>
          </FieldControl>
          <SelectContent><SelectItem value="free">Free</SelectItem></SelectContent>
        </Select>
        <FieldError>Choose a plan to continue.</FieldError>
      </Field>
    </div>
  ),
}

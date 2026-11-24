import * as React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardLink, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  InputGroup, InputGroupAddon, InputGroupButton, InputGroupClearIcon, InputGroupEmailIcon, InputGroupInput,
  InputGroupPasswordToggle, InputGroupSearchIcon, InputGroupText,
} from "@/components/ui/input-group"
import { Row, type Story } from "../frame"

export const card: Story = {
  title: "Card",
  items: ["vois-card"],
  render: () => (
    <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Static card</CardTitle>
          <CardDescription>Nothing changes on hover.</CardDescription>
        </CardHeader>
        <CardContent>Three drafts are waiting for review.</CardContent>
        <CardFooter><Button variant="secondary" size="sm">Review</Button></CardFooter>
      </Card>
      <Card interactive>
        <CardHeader>
          <CardTitle><CardLink href="#project">Project Atlas</CardLink></CardTitle>
          <CardDescription>The whole card is the link.</CardDescription>
          <CardAction><Button size="icon-sm" variant="ghost" aria-label="More actions">...</Button></CardAction>
        </CardHeader>
        <CardContent>Updated 2 hours ago.</CardContent>
      </Card>
    </div>
  ),
}

/**
 * A disabled card. Its description is --text-state-disabled (4.05:1 light, 3.78:1 dark). WCAG 1.4.3 exempts text in an inactive
 * component, but axe cannot see that this div is one, so it reports it. The page is in the baseline for that reason, on its own so
 * the entry covers nothing else.
 */
export const cardDisabled: Story = {
  title: "Card, disabled",
  items: ["vois-card"],
  render: () => (
    <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
      <Card interactive disabled>
        <CardHeader>
          <CardTitle><CardLink href="#archived">Archived project</CardLink></CardTitle>
          <CardDescription>Disabled card.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  ),
}

export const buttonGroup: Story = {
  title: "Button group",
  items: ["vois-button-group"],
  render: () => (
    <div className="flex flex-col gap-6">
      <Row label="Joined buttons">
        <ButtonGroup aria-label="Text alignment">
          <Button variant="outline">Left</Button>
          <Button variant="outline">Center</Button>
          <Button variant="outline">Right</Button>
        </ButtonGroup>
      </Row>
      <Row label="With a separator and text">
        <ButtonGroup aria-label="Pagination">
          <ButtonGroupText>Page 2 of 9</ButtonGroupText>
          <ButtonGroupSeparator />
          <Button variant="outline">Previous</Button>
          <Button variant="outline">Next</Button>
        </ButtonGroup>
      </Row>
      <Row label="Vertical">
        <ButtonGroup orientation="vertical" aria-label="Zoom">
          <Button variant="outline" size="icon" aria-label="Zoom in">+</Button>
          <Button variant="outline" size="icon" aria-label="Zoom out">-</Button>
        </ButtonGroup>
      </Row>
    </div>
  ),
}

export const collapsible: Story = {
  title: "Collapsible",
  items: ["vois-collapsible"],
  render: ({ state }) => (
    <Collapsible defaultOpen={state === "open"} className="max-w-md">
      <CollapsibleTrigger asChild><Button variant="secondary">Advanced options</Button></CollapsibleTrigger>
      <CollapsibleContent>
        <p className="pt-3">Retry failed uploads up to three times, then stop.</p>
      </CollapsibleContent>
    </Collapsible>
  ),
  states: { open: { expect: "[data-slot=collapsible-content][data-state=open]" } },
}

export const scrollArea: Story = {
  title: "Scroll area",
  items: ["vois-scroll-area"],
  render: () => (
    <div className="flex flex-wrap gap-6">
      <ScrollArea type="always" className="h-40 w-64 rounded-[var(--radius-buttons-and-controls)] border border-[color:var(--border-default)]">
        <ul className="p-3">
          {Array.from({ length: 24 }, (_, i) => (
            <li key={i} className="py-1">Row number {i + 1}</li>
          ))}
        </ul>
      </ScrollArea>
      <ScrollArea type="always" className="w-64 whitespace-nowrap rounded-[var(--radius-buttons-and-controls)] border border-[color:var(--border-default)]">
        <p className="p-3">A line of text that is wider than the area it sits in, so the horizontal bar shows.</p>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  ),
}

function InputGroupDemo() {
  const [shown, setShown] = React.useState(false)
  return (
    <div className="flex max-w-md flex-col gap-4">
      <InputGroup>
        <InputGroupAddon><InputGroupSearchIcon /></InputGroupAddon>
        <InputGroupInput aria-label="Search" placeholder="Search" defaultValue="invoices" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label="Clear search"><InputGroupClearIcon /></InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon><InputGroupEmailIcon /></InputGroupAddon>
        <InputGroupInput aria-label="Email" type="email" placeholder="you@example.com" />
      </InputGroup>
      <InputGroup>
        <InputGroupAddon><InputGroupText>https://</InputGroupText></InputGroupAddon>
        <InputGroupInput aria-label="Website" placeholder="example.com" />
      </InputGroup>
      <InputGroup>
        <InputGroupInput aria-label="Password" type={shown ? "text" : "password"} defaultValue="hunter2hunter2" />
        <InputGroupAddon align="inline-end">
          <InputGroupPasswordToggle visible={shown} onVisibleChange={setShown} />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup shape="pill">
        <InputGroupInput aria-label="Pill search" placeholder="Pill shape" />
      </InputGroup>
      <InputGroup>
        <InputGroupInput aria-label="Disabled" disabled defaultValue="Disabled" />
      </InputGroup>
    </div>
  )
}

export const inputGroup: Story = {
  title: "Input group",
  items: ["vois-input-group"],
  render: () => <InputGroupDemo />,
}

export const accordion: Story = {
  title: "Accordion",
  items: ["vois-accordion"],
  render: ({ state }) => (
    <Accordion type="single" collapsible defaultValue={state === "open" ? "returns" : undefined} className="max-w-xl">
      <AccordionItem value="returns">
        <AccordionTrigger>Can I return an item?</AccordionTrigger>
        <AccordionContent>Yes. You have 30 days from delivery to return it for a full refund.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="shipping">
        <AccordionTrigger>How long does shipping take?</AccordionTrigger>
        <AccordionContent>Most orders arrive in 3 to 5 working days.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="gift" disabled>
        <AccordionTrigger>Gift wrapping</AccordionTrigger>
        <AccordionContent>Not available right now.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  states: { open: { expect: "[data-slot=accordion-content][data-state=open]" } },
}

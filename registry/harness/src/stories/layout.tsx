import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Panel, PanelContent, PanelDescription, PanelFooter, PanelHeader, PanelTitle } from "@/components/ui/panel"
import { PageFrame } from "@/components/ui/page-frame"
import { CollectionGrid, CollectionGridItem } from "@/components/ui/collection-grid"
import { PanelLayout, PanelLayoutMain, PanelLayoutPanel } from "@/components/ui/panel-layout"
import type { Story } from "../frame"

export const panel: Story = {
  title: "Panel",
  items: ["vois-panel"],
  render: () => (
    <div className="flex flex-wrap gap-6">
      {(["right", "left"] as const).map((side) => (
        <Panel key={side} side={side} aria-label={`Properties, ${side} side`} className="h-72">
          <PanelHeader>
            <PanelTitle>Properties</PanelTitle>
            <PanelDescription>Settings for the selected item.</PanelDescription>
          </PanelHeader>
          <PanelContent>Width, height and position.</PanelContent>
          <PanelFooter><Button size="sm" variant="secondary">Reset</Button></PanelFooter>
        </Panel>
      ))}
    </div>
  ),
}

export const pageGrid: Story = {
  title: "Page grid",
  items: ["vois-page-grid"],
  render: () => (
    <PageFrame>
      <CollectionGrid aria-label="Projects">
        {Array.from({ length: 6 }, (_, i) => (
          <CollectionGridItem key={i}>
            <Card>
              <CardHeader>
                <CardTitle>Project {i + 1}</CardTitle>
                <CardDescription>Edited {i + 1} days ago</CardDescription>
              </CardHeader>
              <CardContent>Cards fill the columns the page grid gives them.</CardContent>
            </Card>
          </CollectionGridItem>
        ))}
      </CollectionGrid>
    </PageFrame>
  ),
}

function PanelLayoutDemo({ initiallyOpen }: { initiallyOpen: boolean }) {
  const [open, setOpen] = React.useState(initiallyOpen)
  return (
    <PanelLayout open={open} onOpenChange={setOpen} className="min-h-80">
      <PanelLayoutMain>
        <h2 className="[font-weight:var(--font-weight-semi-bold)]">Canvas</h2>
        <p className="my-2">The panel pushes this area over when it fits, or sits over it when it does not.</p>
        <Button variant="secondary" onClick={() => setOpen(!open)}>{open ? "Hide properties" : "Show properties"}</Button>
      </PanelLayoutMain>
      <PanelLayoutPanel aria-label="Properties">
        <PanelHeader>
          <PanelTitle>Properties</PanelTitle>
        </PanelHeader>
        <PanelContent>
          <p>Width, height and position.</p>
          <Button size="sm" variant="secondary" className="mt-3" onClick={() => setOpen(false)}>Close</Button>
        </PanelContent>
      </PanelLayoutPanel>
    </PanelLayout>
  )
}

export const panelLayout: Story = {
  title: "Panel layout",
  items: ["vois-panel-layout", "vois-panel"],
  render: ({ state }) => <PanelLayoutDemo initiallyOpen={state === "open"} />,
  states: { open: { expect: "[data-slot=panel]" } },
}

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Panel, PanelContent, PanelDescription, PanelFooter, PanelHeader, PanelTitle } from "@/components/ui/panel"
import { PageFrame } from "@/components/ui/page-frame"
import { CollectionGrid, CollectionGridItem } from "@/components/ui/collection-grid"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
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

function Pane({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full items-center justify-center p-4 text-[color:var(--text-primary)]">{children}</div>
}

export const resizable: Story = {
  title: "Resizable",
  items: ["vois-resizable"],
  render: ({ id }) => (
    <div className="flex flex-col gap-6">
      <div className="h-64 rounded-[var(--shape-rounded)] border border-[color:var(--border-default)]">
        <ResizablePanelGroup orientation="horizontal" id={id("split")}>
          <ResizablePanel id={id("list")} defaultSize="30%" minSize="20%"><Pane>Inbox</Pane></ResizablePanel>
          <ResizableHandle id={id("handle")} withHandle aria-label="Resize inbox" />
          <ResizablePanel id={id("detail")} defaultSize="70%" minSize="30%">
            <ResizablePanelGroup orientation="vertical" id={id("nested")}>
              <ResizablePanel id={id("top")} defaultSize="60%"><Pane>Message</Pane></ResizablePanel>
              <ResizableHandle id={id("nested-handle")} aria-label="Resize message" />
              <ResizablePanel id={id("bottom")} defaultSize="40%"><Pane>Reply</Pane></ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <div className="h-24 rounded-[var(--shape-rounded)] border border-[color:var(--border-default)]">
        <ResizablePanelGroup orientation="horizontal" id={id("locked")}>
          <ResizablePanel id={id("a")} defaultSize="50%"><Pane>Fixed</Pane></ResizablePanel>
          <ResizableHandle id={id("locked-handle")} disabled aria-label="Resize fixed split" />
          <ResizablePanel id={id("b")} defaultSize="50%"><Pane>Fixed</Pane></ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  ),
}

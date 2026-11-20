import * as React from "react"
import { Slider, StepSlider } from "@/components/ui/slider"
import { SwatchPicker } from "@/components/ui/swatch-picker"
import {
  InspectorControlGroup, InspectorLabel, InspectorRow, InspectorSection, InspectorSectionContent, InspectorSectionTrigger, InspectorToggle,
} from "@/components/ui/inspector"
import { Input } from "@/components/ui/input"
import { PlusIcon, Row, type Story } from "../frame"

export const slider: Story = {
  title: "Slider",
  items: ["vois-slider"],
  render: ({ id }) => (
    <div className="flex max-w-md flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor={id("volume")}>Volume</label>
        <Slider id={id("volume")} defaultValue={40} getValueText={(v) => `${v} percent`} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={id("muted")}>Disabled</label>
        <Slider id={id("muted")} defaultValue={70} disabled />
      </div>
    </div>
  ),
}

/**
 * The StepSlider. Its focus ring is drawn around the thumb, on an element the checker does not compare, so it reports
 * focus-visible although the ring shows (checked by eye in Chromium). The page is in the baseline, on its own.
 */
export const stepSlider: Story = {
  title: "Step slider",
  items: ["vois-slider"],
  render: ({ id }) => (
    <div className="flex max-w-md flex-col gap-2">
      <label htmlFor={id("quality")}>Quality</label>
      <StepSlider
        id={id("quality")}
        defaultValue="medium"
        steps={[
          { value: "low", label: "Low", description: "Smallest file" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High", description: "Best look" },
        ]}
      />
    </div>
  ),
}

export const swatchPicker: Story = {
  title: "Swatch picker",
  items: ["vois-swatch-picker"],
  render: ({ id }) => (
    <Row label="Colors, with a None choice">
      <span id={id("fill-label")}>Fill color</span>
      <SwatchPicker
        // The trigger shows the chosen color's name, so its accessible name must contain it: the label, then its own text.
        aria-labelledby={`${id("fill-label")} ${id("fill")}`}
        id={id("fill")}
        defaultValue="blue"
        noneLabel="None"
        groups={[
          { label: "Brand", swatches: [{ value: "blue", label: "Blue", color: "#1f6feb" }, { value: "navy", label: "Navy", color: "#0b2a5b" }] },
          { label: "Status", swatches: [{ value: "green", label: "Green", color: "#1a7f37" }, { value: "red", label: "Red", color: "#cf222e" }, { value: "amber", label: "Amber", color: "#bf8700" }] },
        ]}
      />
    </Row>
  ),
}

export const inspector: Story = {
  title: "Inspector",
  items: ["vois-inspector", "vois-collapsible"],
  render: ({ id }) => (
    <div className="max-w-xs">
      <InspectorSection>
        <InspectorSectionTrigger>Layout</InspectorSectionTrigger>
        <InspectorSectionContent>
          <div className="flex flex-col gap-3 py-3">
            <InspectorRow>
              <InspectorLabel htmlFor={id("w")}>Width</InspectorLabel>
              <Input id={id("w")} size="compact" defaultValue="320" />
            </InspectorRow>
            <InspectorRow>
              <InspectorLabel htmlFor={id("h")}>Height</InspectorLabel>
              <Input id={id("h")} size="compact" defaultValue="240" />
            </InspectorRow>
            <InspectorRow>
              <InspectorLabel htmlFor={id("clip")}>Clip content</InspectorLabel>
              <InspectorControlGroup>
                <InspectorToggle id={id("clip")} aria-label="Clip content" defaultPressed><PlusIcon /></InspectorToggle>
              </InspectorControlGroup>
            </InspectorRow>
          </div>
        </InspectorSectionContent>
      </InspectorSection>
      <InspectorSection defaultOpen={false}>
        <InspectorSectionTrigger>Effects</InspectorSectionTrigger>
        <InspectorSectionContent>
          <p className="py-3">No effects yet.</p>
        </InspectorSectionContent>
      </InspectorSection>
    </div>
  ),
}

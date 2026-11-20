import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { PlusIcon, Row, type Story } from "../frame"

export const button: Story = {
  title: "Button",
  items: ["vois-button", "vois-spinner"],
  render: () => (
    <div className="flex flex-col gap-6">
      <Row label="Variants">
        <Button>Save</Button>
        <Button variant="secondary">Cancel</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive-soft">Remove</Button>
        <Button variant="link">Learn more</Button>
      </Row>
      <Row label="Sizes">
        <Button size="sm">Small</Button>
        <Button>Default</Button>
        <Button size="lg">Large</Button>
      </Row>
      <Row label="With icons">
        <Button leadingIcon={<PlusIcon />}>New item</Button>
        <Button trailingIcon={<PlusIcon />} variant="secondary">Add</Button>
      </Row>
      <Row label="Icon only (names come from aria-label)">
        <Button size="icon-sm" aria-label="Add small"><PlusIcon /></Button>
        <Button size="icon" aria-label="Add"><PlusIcon /></Button>
        <Button size="icon-lg" aria-label="Add large"><PlusIcon /></Button>
      </Row>
      <Row label="States">
        <Button disabled>Disabled</Button>
        <Button variant="secondary" disabled>Disabled</Button>
        <Button loading>Saving</Button>
      </Row>
    </div>
  ),
}

/**
 * The solid destructive Button on its own page. White on --solid-negative-resting was 4.16:1, under the 4.5:1 that 14px text
 * needs, until registry 0.21.3 moved the ladder one step darker. The page stays so a regression fails the check.
 */
export const buttonDestructive: Story = {
  title: "Button, solid destructive",
  items: ["vois-button"],
  render: () => (
    <Row label="Solid destructive, by size">
      <Button variant="destructive" size="sm">Delete</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="destructive" size="lg">Delete</Button>
    </Row>
  ),
}

/** IconButton: the label is the accessible name and the tooltip. A disabled one has no tooltip (DS-A11Y-029). */
export const iconButton: Story = {
  title: "Icon Button",
  items: ["vois-icon-button", "vois-tooltip"],
  render: () => (
    <div className="flex flex-col gap-6">
      <Row label="Sizes (ghost, the default)">
        <IconButton size="icon-sm" label="Add a row" icon={<PlusIcon />} />
        <IconButton label="Add a row" icon={<PlusIcon />} />
        <IconButton size="icon-lg" label="Add a row" icon={<PlusIcon />} />
        <IconButton size="circular" variant="default" label="Compose" icon={<PlusIcon />} />
      </Row>
      <Row label="Styles">
        <IconButton variant="soft" label="Add a row" icon={<PlusIcon />} />
        <IconButton variant="secondary" label="Add a row" icon={<PlusIcon />} />
      </Row>
      <Row label="States">
        <IconButton disabled label="Add a row" icon={<PlusIcon />} />
        <IconButton loading label="Adding a row" icon={<PlusIcon />} />
        <IconButton tooltip={false} label="Add a row" icon={<PlusIcon />} />
      </Row>
    </div>
  ),
}

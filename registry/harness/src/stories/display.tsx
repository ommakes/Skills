import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Row, type Story } from "../frame"

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const
const COLORS = ["aqua", "blue", "blurple", "cyan", "goldie", "gray", "green", "lawn", "lipstick", "nude", "orange", "rose", "smurf", "tomato"] as const

export const avatar: Story = {
  title: "Avatar",
  items: ["vois-avatar"],
  render: () => (
    <div className="flex flex-col gap-6">
      <Row label="Initials, by size">
        {SIZES.map((s) => (
          <Avatar key={s} size={s}><AvatarFallback>AL</AvatarFallback></Avatar>
        ))}
      </Row>
      <Row label="Generic person">
        {SIZES.map((s) => (
          <Avatar key={s} size={s}><AvatarFallback variant="generic" /></Avatar>
        ))}
      </Row>
      <Row label="Image that fails to load shows the fallback">
        <Avatar><AvatarImage src="/missing.png" alt="Grace Hopper" /><AvatarFallback>GH</AvatarFallback></Avatar>
      </Row>
    </div>
  ),
}

export const badge: Story = {
  title: "Badge",
  items: ["vois-badge"],
  render: () => (
    <div className="flex flex-col gap-6">
      {(["solid", "soft", "outline"] as const).map((v) => (
        <Row key={v} label={`${v}, every color`}>
          {COLORS.map((c) => (
            <Badge key={c} variant={v} color={c}>{c}</Badge>
          ))}
        </Row>
      ))}
      <Row label="shadcn names">
        <Badge>default</Badge>
        <Badge variant="secondary">secondary</Badge>
        <Badge variant="destructive">destructive</Badge>
        <Badge variant="outline">outline</Badge>
      </Row>
    </div>
  ),
}

export const spinner: Story = {
  title: "Spinner",
  items: ["vois-spinner"],
  render: () => (
    <Row label="Sizes. Each one is a status with a text name.">
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" label="Loading results" />
    </Row>
  ),
}

export const tooltip: Story = {
  title: "Tooltip",
  items: ["vois-tooltip"],
  render: ({ state }) => (
    <TooltipProvider>
      <Tooltip open={state === "open" ? true : undefined}>
        <TooltipTrigger asChild><Button variant="secondary">Hover or focus me</Button></TooltipTrigger>
        <TooltipContent>Saves a draft you can finish later.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  states: { open: { expect: "[data-slot=tooltip-content]" } },
}

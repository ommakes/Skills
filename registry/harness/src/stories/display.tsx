import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
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

function ProgressRow({ id, label, value, text }: { id: string; label: string; value?: number | null; text?: string }) {
  return (
    <div className="flex w-80 flex-col gap-2">
      <div className="flex items-center justify-between text-[length:var(--font-size-small)]">
        <span id={id}>{label}</span>
        {text ? <span aria-hidden="true" className="text-[color:var(--text-secondary)]">{text}</span> : null}
      </div>
      <Progress aria-labelledby={id} value={value} />
    </div>
  )
}

export const progress: Story = {
  title: "Progress",
  items: ["vois-progress"],
  render: ({ id }) => (
    <div className="flex flex-col gap-6">
      <ProgressRow id={id("p-empty")} label="Not started" value={0} text="0%" />
      <ProgressRow id={id("p-half")} label="Uploading photos" value={40} text="40%" />
      <ProgressRow id={id("p-full")} label="Upload complete" value={100} text="100%" />
      <ProgressRow id={id("p-over")} label="A value past the maximum is clamped to full" value={140} text="100%" />
      <ProgressRow id={id("p-indet")} label="Working, length unknown" />
    </div>
  ),
}

export const separator: Story = {
  title: "Separator",
  items: ["vois-separator"],
  render: () => (
    <div className="flex flex-col gap-6">
      <Row label="Horizontal, between two groups of text">
        <div className="w-80">
          <p className="font-[number:var(--font-weight-medium)]">Billing</p>
          <p className="text-[color:var(--text-secondary)]">Plans, invoices and payment methods.</p>
          <Separator className="my-3" />
          <p className="font-[number:var(--font-weight-medium)]">Team</p>
          <p className="text-[color:var(--text-secondary)]">Members and roles.</p>
        </div>
      </Row>
      <Row label="Vertical, in a row of links">
        <div className="flex h-5 items-center gap-3">
          <span>Docs</span>
          <Separator orientation="vertical" />
          <span>Blog</span>
          <Separator orientation="vertical" />
          <span>Changelog</span>
        </div>
      </Row>
    </div>
  ),
}

const SLIDES = ["Front", "Rear", "Left side", "Right side", "Interior"]

function Slide({ label, index, total, tall }: { label: string; index: number; total: number; tall?: boolean }) {
  return (
    <CarouselItem aria-label={`${index + 1} of ${total}`}>
      <div className={`flex ${tall ? "h-full" : "h-40"} items-center justify-center rounded-[var(--shape-rounded)] border border-[color:var(--border-default)] bg-[color:var(--bg-card)] text-[length:var(--font-size-medium)] text-[color:var(--text-primary)]`}>
        {label}
      </div>
    </CarouselItem>
  )
}

export const carousel: Story = {
  title: "Carousel",
  items: ["vois-carousel", "vois-button"],
  render: ({ id }) => (
    <div className="flex flex-col gap-12 px-12 py-4">
      <Carousel aria-label="Vehicle photos" id={id("horizontal")}>
        <CarouselContent>
          {SLIDES.map((s, i) => <Slide key={s} label={s} index={i} total={SLIDES.length} />)}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <Carousel aria-label="Damage notes" orientation="vertical" id={id("vertical")} className="mx-auto w-64 py-12">
        <CarouselContent className="h-40">
          {SLIDES.slice(0, 3).map((s, i) => <Slide key={s} label={s} index={i} total={3} tall />)}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
}

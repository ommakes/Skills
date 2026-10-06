import { useRef, useState } from "react"
import { Check, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

type Billing = "monthly" | "yearly"

type Plan = {
  id: string
  name: string
  description: string
  /** Per-seat price per month, or null for a sales-led plan. */
  monthly: number | null
  /** Per-seat price per month when billed yearly. */
  yearly: number | null
  seats: string
  inherits?: string
  features: string[]
  cta: string
  highlighted?: boolean
}

const SAVINGS_LABEL = "Save 20%"

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For small teams getting set up.",
    monthly: 12,
    yearly: 10,
    seats: "Up to 5 seats",
    features: ["3 active projects", "10 GB file storage", "30-day activity history", "Email support"],
    cta: "Start free trial",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For teams that ship every week.",
    monthly: 24,
    yearly: 20,
    seats: "Up to 50 seats",
    inherits: "Starter",
    features: ["Unlimited projects", "1 TB file storage", "1-year activity history", "Priority support"],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For companies with security needs.",
    monthly: null,
    yearly: null,
    seats: "More than 50 seats",
    inherits: "Pro",
    features: ["SSO and SCIM", "Audit logs", "Dedicated account manager", "Volume discounts"],
    cta: "Talk to sales",
  },
]

function SeatsInfo() {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Hover opens it for mouse users. Tap and keyboard use the popover's own click toggle.
  const openOnHover = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }
  const closeOnLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="About seat limits"
          onPointerEnter={openOnHover}
          onPointerLeave={closeOnLeave}
          className="relative inline-flex size-5 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring after:absolute after:-inset-3 after:content-['']"
        >
          <Info className="size-4" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-64 text-sm"
        onPointerEnter={openOnHover}
        onPointerLeave={closeOnLeave}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <p className="font-medium text-foreground">Seat limits</p>
        <p className="mt-1 text-muted-foreground">
          A seat is anyone who can edit. Viewers are free and don&apos;t count. Each plan has a
          maximum number of seats. Need more? Move up a plan.
        </p>
      </PopoverContent>
    </Popover>
  )
}

function formatPrice(plan: Plan, billing: Billing) {
  const value = billing === "yearly" ? plan.yearly : plan.monthly
  return value === null ? null : `$${value}`
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("yearly")

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Pick a plan for your team
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Every paid plan starts with a 14-day free trial. No credit card required.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <ToggleGroup
            type="single"
            value={billing}
            onValueChange={(v) => v && setBilling(v as Billing)}
            aria-label="Billing period"
            className="rounded-full bg-muted p-1"
          >
            <ToggleGroupItem
              value="monthly"
              className="h-9 rounded-full px-4 text-sm data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
            >
              Monthly
            </ToggleGroupItem>
            <ToggleGroupItem
              value="yearly"
              className="h-9 rounded-full px-4 text-sm data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
            >
              Yearly
            </ToggleGroupItem>
          </ToggleGroup>
          <span className="text-sm font-medium text-foreground">{SAVINGS_LABEL}</span>
        </div>
      </header>

      <section
        aria-label="Plans"
        className="mt-12 grid items-stretch gap-6 md:grid-cols-3 md:gap-4 lg:gap-6"
      >
        {PLANS.map((plan) => {
          const price = formatPrice(plan, billing)
          const yearlyTotal = plan.yearly !== null ? plan.yearly * 12 : null
          return (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col gap-0 py-0",
                plan.highlighted
                  ? "border-2 border-primary shadow-md max-md:order-first md:-my-3"
                  : "border"
              )}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-3 text-primary-foreground">
                  Most popular
                </Badge>
              )}

              <CardHeader className="gap-1 p-6 pb-0">
                <CardTitle className="text-lg font-semibold">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col gap-6 p-6">
                <div className="min-h-[5.5rem]">
                  {price ? (
                    <>
                      <p className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-semibold tracking-tight text-foreground tabular-nums">
                          {price}
                        </span>
                        <span className="text-sm text-muted-foreground">per seat / month</span>
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {billing === "yearly" && yearlyTotal !== null
                          ? `Billed $${yearlyTotal} per seat yearly`
                          : "Billed monthly"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-4xl font-semibold tracking-tight text-foreground">Custom</p>
                      <p className="mt-1 text-sm text-muted-foreground">Priced by seats and terms</p>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1.5 border-y py-3 text-sm">
                  <span className="font-medium text-foreground">Seats</span>
                  <SeatsInfo />
                  <span className="ml-auto text-muted-foreground">{plan.seats}</span>
                </div>

                <div>
                  {plan.inherits && (
                    <p className="mb-3 text-sm font-medium text-foreground">
                      Everything in {plan.inherits}, plus:
                    </p>
                  )}
                  <ul className="flex flex-col gap-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden="true" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Button
                  className="h-11 w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  aria-label={`${plan.cta}, ${plan.name} plan`}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </section>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        Prices in USD, excluding taxes. Cancel anytime.
      </p>
    </main>
  )
}

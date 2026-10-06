import * as React from "react";
import { Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Billing = "monthly" | "yearly";

type Plan = {
  id: string;
  name: string;
  description: string;
  monthly: number;
  yearly: number; // per month, billed annually
  seats: string;
  features: string[];
  cta: string;
  popular?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For individuals and small side projects.",
    monthly: 12,
    yearly: 10,
    seats: "Up to 3",
    features: ["5 active projects", "Basic analytics", "Community support"],
    cta: "Start free trial",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing teams that need more power.",
    monthly: 36,
    yearly: 30,
    seats: "Up to 15",
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Priority email support",
      "Custom domains",
    ],
    cta: "Get Pro",
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    description: "For organizations with advanced needs.",
    monthly: 89,
    yearly: 74,
    seats: "Up to 100",
    features: [
      "Everything in Pro",
      "SSO and audit logs",
      "Dedicated success manager",
      "99.9% uptime SLA",
    ],
    cta: "Contact sales",
  },
];

function SeatsInfo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="About seat limits"
          className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Info className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 text-sm" side="top">
        <p className="font-medium">Seat limits</p>
        <p className="mt-1 text-muted-foreground">
          A seat is one person with a login. Each plan caps the number of seats
          included. You can add extra seats on any plan for a per-seat fee.
        </p>
      </PopoverContent>
    </Popover>
  );
}

export default function PricingPage() {
  const [billing, setBilling] = React.useState<Billing>("monthly");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight">
          Simple, transparent pricing
        </h1>
        <p className="mt-3 text-muted-foreground">
          Pick the plan that fits your team. Change or cancel any time.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <ToggleGroup
            type="single"
            value={billing}
            onValueChange={(v) => v && setBilling(v as Billing)}
            aria-label="Billing period"
            className="rounded-full border bg-muted p-1"
          >
            <ToggleGroupItem
              value="monthly"
              className="rounded-full px-5 data-[state=on]:bg-background data-[state=on]:shadow-sm"
            >
              Monthly
            </ToggleGroupItem>
            <ToggleGroupItem
              value="yearly"
              className="rounded-full px-5 data-[state=on]:bg-background data-[state=on]:shadow-sm"
            >
              Yearly
            </ToggleGroupItem>
          </ToggleGroup>
          <Badge variant="secondary">Save up to 17%</Badge>
        </div>
      </header>

      <section className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:items-stretch">
        {PLANS.map((plan) => {
          const price = billing === "monthly" ? plan.monthly : plan.yearly;
          return (
            <Card
              key={plan.id}
              className={
                "relative flex flex-col " +
                (plan.popular ? "border-primary shadow-lg md:-my-4" : "")
              }
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-6">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight">
                      ${price}
                    </span>
                    <span className="text-muted-foreground">/ month</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {billing === "yearly"
                      ? `Billed $${price * 12} yearly`
                      : "Billed monthly"}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span className="flex items-center gap-1.5">
                    Seats
                    <SeatsInfo />
                  </span>
                  <span className="font-medium">{plan.seats}</span>
                </div>

                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </section>
    </main>
  );
}

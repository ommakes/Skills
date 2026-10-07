import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type PlanId = "free" | "pro" | "team";

const PLANS: { id: PlanId; name: string; price: string; blurb: string }[] = [
  { id: "free", name: "Free", price: "$0", blurb: "For trying things out" },
  { id: "pro", name: "Pro", price: "$12/mo", blurb: "For individuals" },
  { id: "team", name: "Team", price: "$40/mo", blurb: "For small teams" },
];

type Errors = Partial<Record<"email" | "password" | "plan" | "terms", string>>;

// Mock server: fails for a specific email to demo the banner.
async function mockSignup(email: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 800));
  if (email.toLowerCase().startsWith("fail")) {
    throw new Error("We couldn't create your account right now. Please try again in a few minutes.");
  }
}

export default function SignupForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [plan, setPlan] = React.useState<PlanId | "">("");
  const [terms, setTerms] = React.useState(false);
  const [news, setNews] = React.useState(false);
  const [errors, setErrors] = React.useState<Errors>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  function validate(): Errors {
    const e: Errors = {};
    if (!email.trim()) e.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address.";
    if (!password) e.password = "Enter a password.";
    else if (password.length < 8) e.password = "Password must be at least 8 characters.";
    if (!plan) e.plan = "Choose a plan.";
    if (!terms) e.terms = "You must accept the terms to continue.";
    return e;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerError(null);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    try {
      await mockSignup(email);
      setDone(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto w-full max-w-xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>You're in</CardTitle>
            <CardDescription>
              Account created for {email} on the {PLANS.find((p) => p.id === plan)?.name} plan.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Pick a plan and get started.</CardDescription>
        </CardHeader>
        <CardContent>
          {serverError && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={onSubmit} noValidate className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Plan</legend>
              <RadioGroup
                value={plan}
                onValueChange={(v) => setPlan(v as PlanId)}
                className="grid grid-cols-3 gap-3"
                aria-invalid={!!errors.plan}
                aria-describedby={errors.plan ? "plan-error" : undefined}
              >
                {PLANS.map((p) => (
                  <Label
                    key={p.id}
                    htmlFor={`plan-${p.id}`}
                    className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-4 transition-colors hover:bg-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${
                      plan === p.id ? "border-primary bg-accent" : "border-border"
                    }`}
                  >
                    <RadioGroupItem id={`plan-${p.id}`} value={p.id} className="sr-only" />
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-lg">{p.price}</span>
                    <span className="text-xs font-normal text-muted-foreground">{p.blurb}</span>
                  </Label>
                ))}
              </RadioGroup>
              {errors.plan && (
                <p id="plan-error" className="text-sm text-red-600">
                  {errors.plan}
                </p>
              )}
            </fieldset>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="terms"
                  checked={terms}
                  onCheckedChange={(c) => setTerms(c === true)}
                  aria-invalid={!!errors.terms}
                  aria-describedby={errors.terms ? "terms-error" : undefined}
                />
                <Label htmlFor="terms" className="font-normal">
                  I agree to the Terms of Service and Privacy Policy
                </Label>
              </div>
              {errors.terms && (
                <p id="terms-error" className="text-sm text-red-600">
                  {errors.terms}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="news" className="font-normal">
                Send me product news
              </Label>
              <Switch id="news" checked={news} onCheckedChange={setNews} />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

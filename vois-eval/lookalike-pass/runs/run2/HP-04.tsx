import { useId, useState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

/* ---------- Inline mock data ---------- */

type PlanId = "free" | "pro" | "team";

const PLANS: { id: PlanId; name: string; price: string; blurb: string }[] = [
  { id: "free", name: "Free", price: "$0", blurb: "For trying things out" },
  { id: "pro", name: "Pro", price: "$12/mo", blurb: "For individuals" },
  { id: "team", name: "Team", price: "$40/mo", blurb: "For small teams" },
];

// Mock server: any email containing "taken" is rejected, one containing "down" simulates an outage.
function mockSignup(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email.includes("down")) reject(new Error("server"));
      else if (email.includes("taken")) reject(new Error("taken"));
      else resolve();
    }, 800);
  });
}

/* ---------- Validation ---------- */

type Errors = Partial<Record<"email" | "password" | "plan" | "terms", string>>;

function validate(v: {
  email: string;
  password: string;
  plan: PlanId | "";
  terms: boolean;
}): Errors {
  const e: Errors = {};
  if (!v.email.trim()) e.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
    e.email = "Enter an email like name@company.com.";
  if (!v.password) e.password = "Create a password.";
  else if (v.password.length < 8)
    e.password = "Use at least 8 characters for your password.";
  if (!v.plan) e.plan = "Choose a plan to continue.";
  if (!v.terms) e.terms = "Accept the terms to create your account.";
  return e;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p
      id={id}
      role={message ? "alert" : undefined}
      className="flex min-h-5 items-center gap-1 text-sm text-destructive"
    >
      {message && (
        <>
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
          <span>{message}</span>
        </>
      )}
    </p>
  );
}

/* ---------- Screen ---------- */

export default function SignupForm() {
  const uid = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState<PlanId | "">("");
  const [terms, setTerms] = useState(false);
  const [news, setNews] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerError(null);
    const found = validate({ email, password, plan, terms });
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      await mockSignup(email);
      setDone(true);
    } catch (err) {
      if (err instanceof Error && err.message === "taken") {
        setErrors({ email: "That email already has an account. Sign in or use another." });
      } else {
        setServerError("We couldn't create your account. Check your connection and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const ids = {
    email: `${uid}-email`,
    password: `${uid}-password`,
    plan: `${uid}-plan`,
    terms: `${uid}-terms`,
    news: `${uid}-news`,
  };

  if (done) {
    return (
      <main className="min-h-svh bg-background px-4 py-10 text-foreground">
        <div className="mx-auto flex max-w-[var(--width-form-max)] flex-col gap-4">
          <Alert>
            <CircleCheck className="size-4" aria-hidden="true" />
            <AlertTitle>Account created</AlertTitle>
            <AlertDescription>
              We sent a confirmation link to {email}. Open it to finish setting up.
            </AlertDescription>
          </Alert>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-background px-4 py-10 text-foreground">
      <form
        onSubmit={onSubmit}
        noValidate
        className="mx-auto flex max-w-[var(--width-form-max)] flex-col gap-6"
      >
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-balance">Create your account</h1>
          <p className="text-sm text-muted-foreground text-pretty">
            Pick a plan now. You can change it any time.
          </p>
        </header>

        {serverError && (
          <Alert variant="destructive" role="alert">
            <CircleAlert className="size-4" aria-hidden="true" />
            <AlertTitle>Account not created</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        {/* Email */}
        <div className="flex flex-col gap-2">
          <Label htmlFor={ids.email}>Email address</Label>
          <Input
            id={ids.email}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={`${ids.email}-msg`}
            className="max-w-[var(--width-field-max)]"
          />
          <FieldError id={`${ids.email}-msg`} message={errors.email} />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <Label htmlFor={ids.password}>Password</Label>
          <Input
            id={ids.password}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            aria-describedby={`${ids.password}-hint ${ids.password}-msg`}
            className="max-w-[var(--width-field-max)]"
          />
          <p id={`${ids.password}-hint`} className="text-sm text-muted-foreground">
            Password must be at least 8 characters.
          </p>
          <FieldError id={`${ids.password}-msg`} message={errors.password} />
        </div>

        {/* Plan */}
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">Plan</legend>
          <RadioGroup
            value={plan}
            onValueChange={(v) => setPlan(v as PlanId)}
            aria-describedby={`${ids.plan}-msg`}
            aria-invalid={!!errors.plan}
            className="grid grid-cols-3 gap-2"
          >
            {PLANS.map((p) => (
              <Label
                key={p.id}
                htmlFor={`${ids.plan}-${p.id}`}
                className="flex cursor-pointer flex-col items-start gap-2 rounded-lg border border-input bg-card p-3 text-card-foreground transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent has-focus-visible:ring-2 has-focus-visible:ring-ring"
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="text-base font-semibold">{p.name}</span>
                  <RadioGroupItem id={`${ids.plan}-${p.id}`} value={p.id} />
                </span>
                <span className="font-mono text-sm tabular-nums">{p.price}</span>
                <span className="text-xs font-normal text-muted-foreground">{p.blurb}</span>
              </Label>
            ))}
          </RadioGroup>
          <FieldError id={`${ids.plan}-msg`} message={errors.plan} />
        </fieldset>

        {/* Terms */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-3">
            <Checkbox
              id={ids.terms}
              checked={terms}
              onCheckedChange={(c) => setTerms(c === true)}
              aria-invalid={!!errors.terms}
              aria-describedby={`${ids.terms}-msg`}
              className="mt-0.5"
            />
            <Label htmlFor={ids.terms} className="font-normal leading-5">
              I agree to the terms of service and privacy policy
            </Label>
          </div>
          <FieldError id={`${ids.terms}-msg`} message={errors.terms} />
        </div>

        {/* Product news (immediate-effect preference) */}
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
          <Label htmlFor={ids.news} className="font-normal">
            Send me product news
          </Label>
          <Switch id={ids.news} checked={news} onCheckedChange={setNews} />
        </div>

        <Button type="submit" disabled={submitting} className="w-full sm:w-auto sm:self-start">
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </main>
  );
}

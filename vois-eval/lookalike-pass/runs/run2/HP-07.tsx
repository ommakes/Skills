import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const STEPS = [
  { id: 1, label: "Account" },
  { id: 2, label: "Team" },
  { id: 3, label: "Done" },
] as const;

const TEAM_SIZES = ["Just me", "2 to 10", "11 to 50", "51 or more"];

type Values = {
  name: string;
  email: string;
  teamName: string;
  teamSize: string;
  invites: string;
};

type Errors = Partial<Record<keyof Values, string>>;

const INITIAL: Values = {
  name: "Priya Raman",
  email: "",
  teamName: "",
  teamSize: "2 to 10",
  invites: "",
};

function validate(step: number, v: Values): Errors {
  const errors: Errors = {};
  if (step === 1) {
    if (!v.name.trim()) errors.name = "Enter your full name.";
    if (!v.email.trim()) errors.email = "Enter your work email.";
    else if (!/^\S+@\S+\.\S+$/.test(v.email))
      errors.email = "Enter an email like name@company.com.";
  }
  if (step === 2) {
    if (!v.teamName.trim()) errors.teamName = "Enter a team name.";
  }
  return errors;
}

function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Onboarding progress">
      <ol className="flex items-start">
        {STEPS.map((step, i) => {
          const isCurrent = step.id === current;
          const isComplete = step.id < current;
          const isLast = i === STEPS.length - 1;
          return (
            <li
              key={step.id}
              className={isLast ? "flex flex-none flex-col items-center gap-2" : "flex flex-1 items-start"}
              aria-current={isCurrent ? "step" : undefined}
            >
              <div
                className={
                  isLast ? "flex flex-col items-center gap-2" : "flex flex-col items-center gap-2"
                }
              >
                <span
                  className={[
                    "flex size-8 items-center justify-center rounded-full border text-sm font-medium tabular-nums transition-colors duration-200",
                    isCurrent
                      ? "border-primary bg-primary text-primary-foreground"
                      : isComplete
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground",
                  ].join(" ")}
                >
                  {isComplete ? (
                    <Check className="size-4" strokeWidth={2} aria-hidden="true" />
                  ) : (
                    step.id
                  )}
                  <span className="sr-only">
                    {isComplete ? " completed" : isCurrent ? " current" : ""}
                  </span>
                </span>
                <span
                  className={
                    isCurrent
                      ? "text-sm font-medium text-foreground"
                      : "text-sm text-muted-foreground"
                  }
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={[
                    "mx-3 mt-4 h-px flex-1 transition-colors duration-200",
                    isComplete ? "bg-primary" : "bg-border",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<Values>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});

  const progress = (step / STEPS.length) * 100;

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function next(e?: React.FormEvent) {
    e?.preventDefault();
    const found = validate(step, values);
    setErrors(found);
    if (Object.keys(found).length === 0) setStep((s) => Math.min(s + 1, STEPS.length));
  }

  function back() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  }

  const inviteCount = values.invites
    .split(/[\s,;]+/)
    .filter((x) => /^\S+@\S+\.\S+$/.test(x)).length;

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header>
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <span className="text-base font-semibold">Northwind</span>
          <span className="text-sm text-muted-foreground tabular-nums">
            Step {step} of {STEPS.length}
          </span>
        </div>
        <Progress
          value={progress}
          aria-label="Overall onboarding progress"
          className="h-1 rounded-none"
        />
      </header>

      <main className="flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto flex w-full max-w-[var(--width-form-max)] flex-col gap-12">
          <StepIndicator current={step} />

          <form onSubmit={next} noValidate className="flex flex-col gap-10">
            {step === 1 && (
              <section className="flex flex-col gap-6" aria-labelledby="step-title">
                <div className="flex flex-col gap-2">
                  <h1 id="step-title" className="text-2xl font-semibold text-balance">
                    Create your account
                  </h1>
                  <p className="max-w-[65ch] text-muted-foreground text-pretty">
                    We use these details to set up your workspace.
                  </p>
                </div>
                <div className="flex max-w-[var(--width-field-max)] flex-col gap-6">
                  <Field id="name" label="Full name" error={errors.name}>
                    <Input
                      id="name"
                      autoComplete="name"
                      value={values.name}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </Field>
                  <Field
                    id="email"
                    label="Work email"
                    error={errors.email}
                    hint="We'll send a confirmation link here."
                  >
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@company.com"
                      value={values.email}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : "email-hint"}
                      onChange={(e) => set("email", e.target.value)}
                    />
                  </Field>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="flex flex-col gap-6" aria-labelledby="step-title">
                <div className="flex flex-col gap-2">
                  <h1 id="step-title" className="text-2xl font-semibold text-balance">
                    Set up your team
                  </h1>
                  <p className="max-w-[65ch] text-muted-foreground text-pretty">
                    You can change any of this later in settings.
                  </p>
                </div>
                <div className="flex max-w-[var(--width-field-max)] flex-col gap-6">
                  <Field id="teamName" label="Team name" error={errors.teamName}>
                    <Input
                      id="teamName"
                      placeholder="Design"
                      value={values.teamName}
                      aria-invalid={!!errors.teamName}
                      aria-describedby={errors.teamName ? "teamName-error" : undefined}
                      onChange={(e) => set("teamName", e.target.value)}
                    />
                  </Field>

                  <fieldset className="flex flex-col gap-2">
                    <legend className="mb-2 text-sm font-medium">Team size</legend>
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Team size">
                      {TEAM_SIZES.map((size) => {
                        const selected = values.teamSize === size;
                        return (
                          <Button
                            key={size}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            variant={selected ? "default" : "outline"}
                            onClick={() => set("teamSize", size)}
                          >
                            {size}
                          </Button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <Field
                    id="invites"
                    label="Invite teammates (optional)"
                    hint="Separate emails with commas."
                  >
                    <Input
                      id="invites"
                      placeholder="sam@company.com, lee@company.com"
                      value={values.invites}
                      aria-describedby="invites-hint"
                      onChange={(e) => set("invites", e.target.value)}
                    />
                  </Field>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="flex flex-col gap-6" aria-labelledby="step-title">
                <div className="flex flex-col gap-2">
                  <h1 id="step-title" className="text-2xl font-semibold text-balance">
                    You're all set
                  </h1>
                  <p className="max-w-[65ch] text-muted-foreground text-pretty">
                    {values.teamName || "Your team"} is ready. Here's what we set up.
                  </p>
                </div>
                <dl className="grid max-w-[var(--width-field-max)] grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd>{values.name}</dd>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="break-all">{values.email}</dd>
                  <dt className="text-muted-foreground">Team</dt>
                  <dd>{values.teamName}</dd>
                  <dt className="text-muted-foreground">Team size</dt>
                  <dd>{values.teamSize}</dd>
                  <dt className="text-muted-foreground">Invites</dt>
                  <dd className="tabular-nums">
                    {inviteCount === 0
                      ? "None yet"
                      : `${inviteCount} ${inviteCount === 1 ? "invite" : "invites"} sent`}
                  </dd>
                </dl>
              </section>
            )}

            <div className="flex items-center justify-end gap-5">
              {step > 1 && step < STEPS.length && (
                <Button type="button" variant="outline" onClick={back}>
                  Back
                </Button>
              )}
              {step === STEPS.length && (
                <Button type="button" variant="outline" onClick={back}>
                  Back
                </Button>
              )}
              {step < STEPS.length ? (
                <Button type="submit">Next</Button>
              ) : (
                <Button type="button">Go to dashboard</Button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

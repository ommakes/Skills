import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = [
  { id: 1, label: "Account" },
  { id: 2, label: "Team" },
  { id: 3, label: "Done" },
] as const;

const MOCK = {
  account: { name: "Ada Lovelace", email: "ada@example.com" },
  team: { name: "Analytical Engines", invites: "charles@example.com, grace@example.com" },
};

export default function OnboardingScreen() {
  const [step, setStep] = React.useState(1);
  const [account, setAccount] = React.useState(MOCK.account);
  const [team, setTeam] = React.useState(MOCK.team);

  const progress = (step / STEPS.length) * 100;
  const isFirst = step === 1;
  const isLast = step === STEPS.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4">
          <span className="text-sm font-semibold">Welcome aboard</span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label="Overall onboarding progress"
          className="h-1 w-full bg-muted"
        >
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        <nav aria-label="Onboarding steps" className="mb-10">
          <ol className="flex items-center">
            {STEPS.map((s, i) => {
              const complete = s.id < step;
              const current = s.id === step;
              return (
                <React.Fragment key={s.id}>
                  <li className="flex flex-col items-center gap-2" aria-current={current ? "step" : undefined}>
                    <span
                      className={[
                        "flex size-9 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                        current || complete
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground",
                      ].join(" ")}
                    >
                      {complete ? <Check className="size-4" aria-hidden /> : s.id}
                    </span>
                    <span className={current ? "text-sm font-medium" : "text-sm text-muted-foreground"}>{s.label}</span>
                  </li>
                  {i < STEPS.length - 1 && (
                    <div
                      aria-hidden
                      className={[
                        "mx-3 mb-6 h-0.5 flex-1 transition-colors",
                        s.id < step ? "bg-primary" : "bg-border",
                      ].join(" ")}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </ol>
        </nav>

        <Card>
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Create your account</CardTitle>
                <CardDescription>Tell us who you are.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Full name</label>
                  <Input id="name" value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input id="email" type="email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} />
                </div>
              </CardContent>
            </>
          )}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Set up your team</CardTitle>
                <CardDescription>Name your team and invite collaborators.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="team" className="text-sm font-medium">Team name</label>
                  <Input id="team" value={team.name} onChange={(e) => setTeam({ ...team, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="invites" className="text-sm font-medium">Invite by email</label>
                  <Input id="invites" value={team.invites} onChange={(e) => setTeam({ ...team, invites: e.target.value })} />
                </div>
              </CardContent>
            </>
          )}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>You're all set</CardTitle>
                <CardDescription>Here is a summary of what you created.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Account:</span> {account.name} ({account.email})</p>
                <p><span className="text-muted-foreground">Team:</span> {team.name}</p>
                <p><span className="text-muted-foreground">Invites:</span> {team.invites}</p>
              </CardContent>
            </>
          )}
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={isFirst}>
              Back
            </Button>
            <Button onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))} disabled={isLast}>
              {step === STEPS.length - 1 ? "Finish" : "Next"}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

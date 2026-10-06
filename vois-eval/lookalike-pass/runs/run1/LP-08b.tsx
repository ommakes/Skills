import * as React from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";

type PrefId = "mentions" | "assigned" | "comments" | "invites" | "billing";

type Pref = {
  id: PrefId;
  label: string;
  description: string;
  group: "Activity" | "Workspace";
};

const PREFS: Pref[] = [
  {
    id: "mentions",
    label: "Mentions",
    description: "Someone mentions you in a comment or document.",
    group: "Activity",
  },
  {
    id: "assigned",
    label: "Assignments",
    description: "A task is assigned to you or reassigned.",
    group: "Activity",
  },
  {
    id: "comments",
    label: "Replies",
    description: "Someone replies to a thread you started or joined.",
    group: "Activity",
  },
  {
    id: "invites",
    label: "Member changes",
    description: "A member joins, leaves, or changes role.",
    group: "Workspace",
  },
  {
    id: "billing",
    label: "Billing",
    description: "Invoices, failed payments, and plan changes.",
    group: "Workspace",
  },
];

const ACCOUNT_EMAIL = "om@personifyhq.com";

// Mock save. Rejects for "billing" when forced, to show the revert path.
function savePreference(_key: string, _value: unknown): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 300));
}

function PreferenceRow({
  id,
  label,
  description,
  control,
}: {
  id: string;
  label: string;
  description?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex min-w-0 flex-col gap-0.5">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {description ? (
          <p id={`${id}-desc`} className="text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

export default function NotificationSettings() {
  const [emailOn, setEmailOn] = React.useState(true);
  const [digestOn, setDigestOn] = React.useState(false);
  const [digestFreq, setDigestFreq] = React.useState("weekly");
  const [prefs, setPrefs] = React.useState<Record<PrefId, boolean>>({
    mentions: true,
    assigned: true,
    comments: false,
    invites: true,
    billing: true,
  });

  // Instant save: apply optimistically, revert and tell the user on failure.
  async function persist<T>(
    key: string,
    next: T,
    prev: T,
    apply: (v: T) => void,
    successMessage: string,
  ) {
    apply(next);
    try {
      await savePreference(key, next);
      toast.success(successMessage);
    } catch {
      apply(prev);
      toast.error("Couldn't save that change. Try again.");
    }
  }

  const groups: Pref["group"][] = ["Activity", "Workspace"];

  return (
    <main className="mx-auto w-full max-w-[var(--width-form-max,40rem)] px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-balance">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Choose which updates reach your inbox.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-10">
        <section aria-labelledby="email-heading" className="flex flex-col">
          <h2 id="email-heading" className="text-lg font-semibold">
            Email
          </h2>
          <div className="mt-2 flex flex-col">
            <PreferenceRow
              id="email-master"
              label="Email notifications"
              description="Turn off to stop all notification emails. Security and account emails still send."
              control={
                <Switch
                  id="email-master"
                  aria-describedby="email-master-desc"
                  checked={emailOn}
                  onCheckedChange={(v) =>
                    persist(
                      "email.enabled",
                      v,
                      emailOn,
                      setEmailOn,
                      v ? "Email notifications on" : "Email notifications off",
                    )
                  }
                />
              }
            />
            <div className="flex flex-col gap-2 border-b py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-medium">Sent to</span>
                <p className="text-sm text-muted-foreground">{ACCOUNT_EMAIL}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge variant="secondary">Verified</Badge>
                <Button variant="outline" size="sm">
                  Change email
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="digest-heading" className="flex flex-col">
          <h2 id="digest-heading" className="text-lg font-semibold">
            Digest
          </h2>
          <div className="mt-2 flex flex-col">
            <PreferenceRow
              id="digest-switch"
              label="Email digest"
              description="One summary instead of separate emails for lower-priority updates."
              control={
                <Switch
                  id="digest-switch"
                  checked={digestOn}
                  disabled={!emailOn}
                  onCheckedChange={(v) =>
                    persist(
                      "email.digest",
                      v,
                      digestOn,
                      setDigestOn,
                      v ? "Digest on" : "Digest off",
                    )
                  }
                />
              }
            />
            {digestOn ? (
              <PreferenceRow
                id="digest-frequency"
                label="Frequency"
                control={
                  <Select
                    value={digestFreq}
                    disabled={!emailOn}
                    onValueChange={(v) =>
                      persist(
                        "email.digestFrequency",
                        v,
                        digestFreq,
                        setDigestFreq,
                        "Digest frequency updated",
                      )
                    }
                  >
                    <SelectTrigger id="digest-frequency" className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                }
              />
            ) : null}
          </div>
        </section>

        {groups.map((group) => (
          <section
            key={group}
            aria-labelledby={`${group}-heading`}
            className="flex flex-col"
          >
            <h2 id={`${group}-heading`} className="text-lg font-semibold">
              {group}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Email me when:
            </p>
            <div className="mt-2 flex flex-col">
              {PREFS.filter((p) => p.group === group).map((p) => (
                <PreferenceRow
                  key={p.id}
                  id={`pref-${p.id}`}
                  label={p.label}
                  description={p.description}
                  control={
                    <Switch
                      id={`pref-${p.id}`}
                      aria-describedby={`pref-${p.id}-desc`}
                      checked={prefs[p.id]}
                      disabled={!emailOn}
                      onCheckedChange={(v) =>
                        persist(
                          `email.${p.id}`,
                          v,
                          prefs[p.id],
                          (val) => setPrefs((s) => ({ ...s, [p.id]: val })),
                          `${p.label} emails ${v ? "on" : "off"}`,
                        )
                      }
                    />
                  }
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <Toaster />
    </main>
  );
}

import * as React from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock persistence. Resolves after a short delay; rejects when the value is "fail".
function saveToServer(_payload: Record<string, unknown>, shouldFail = false) {
  return new Promise<void>((resolve, reject) =>
    setTimeout(() => (shouldFail ? reject(new Error("save failed")) : resolve()), 700),
  );
}

const initialProfile = { name: "Priya Raman", displayEmail: "priya@northwind.example" };

const initialPrefs = [
  { id: "digest", label: "Weekly digest", help: "A summary of activity every Monday.", on: true },
  { id: "mentions", label: "Mention alerts", help: "Email me when someone mentions me.", on: true },
  { id: "product", label: "Product updates", help: "News about new features.", on: false },
];

export default function SettingsSaved() {
  // Explicit-save block (text field): Save is disabled until changed and valid.
  const [saved, setSaved] = React.useState(initialProfile);
  const [name, setName] = React.useState(saved.name);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState(false);

  const trimmed = name.trim();
  const dirty = trimmed !== saved.name;
  const valid = trimmed.length > 0;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty || !valid || saving) return;
    setSaving(true);
    setSaveError(false);
    try {
      await saveToServer({ name: trimmed }, trimmed.toLowerCase() === "fail");
      setSaved((s) => ({ ...s, name: trimmed }));
      setName(trimmed);
      toast.success("Profile updated");
    } catch {
      // Error tied to a section stays inline, next to the source; the form keeps the typed value.
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setName(saved.name);
    setSaveError(false);
  }

  // Instant-save block (switches): persist on change, confirm with a toast, revert on failure.
  const [prefs, setPrefs] = React.useState(initialPrefs);
  const [pending, setPending] = React.useState<Record<string, boolean>>({});

  async function handleToggle(id: string, next: boolean) {
    const item = prefs.find((p) => p.id === id)!;
    setPrefs((ps) => ps.map((p) => (p.id === id ? { ...p, on: next } : p)));
    setPending((p) => ({ ...p, [id]: true }));
    try {
      await saveToServer({ [id]: next }, id === "product" && next);
      toast.success(`${item.label} ${next ? "turned on" : "turned off"}`);
    } catch {
      setPrefs((ps) => ps.map((p) => (p.id === id ? { ...p, on: !next } : p)));
      toast.error(`${item.label} not saved`, {
        action: { label: "Try again", onClick: () => handleToggle(id, next) },
      });
    } finally {
      setPending((p) => ({ ...p, [id]: false }));
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-10 sm:px-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Account settings</h1>
          <p className="text-sm text-muted-foreground">Manage your profile and email preferences.</p>
        </header>

        <section aria-labelledby="profile-heading" className="flex flex-col gap-4">
          <h2 id="profile-heading" className="text-lg font-medium">
            Profile
          </h2>
          <form onSubmit={handleSave} className="flex flex-col gap-4" noValidate>
            {saveError && (
              <Alert variant="destructive" role="alert">
                <AlertTitle>Profile not saved</AlertTitle>
                <AlertDescription>
                  Check your connection and try again. Your changes are still here.
                </AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!valid}
                aria-describedby={!valid ? "name-help" : undefined}
                autoComplete="name"
              />
              {!valid && (
                <p id="name-help" className="text-sm text-destructive">
                  Enter your full name.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={saved.displayEmail} readOnly disabled />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={!dirty || !valid || saving}>
                {saving && <Spinner data-icon="inline-start" />}
                {saving ? "Saving" : "Save changes"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={!dirty || saving}>
                Cancel
              </Button>
            </div>
          </form>
        </section>

        <section aria-labelledby="notif-heading" className="flex flex-col gap-2">
          <h2 id="notif-heading" className="text-lg font-medium">
            Email notifications
          </h2>
          <p className="text-sm text-muted-foreground">Changes here save as you make them.</p>
          <ul className="divide-y">
            {prefs.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 py-4">
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor={p.id}>{p.label}</Label>
                  <span id={`${p.id}-help`} className="text-sm text-muted-foreground">
                    {p.help}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {pending[p.id] && <Spinner aria-label="Saving" />}
                  <Switch
                    id={p.id}
                    checked={p.on}
                    disabled={pending[p.id]}
                    aria-describedby={`${p.id}-help`}
                    onCheckedChange={(v) => handleToggle(p.id, v)}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Toaster />
    </div>
  );
}

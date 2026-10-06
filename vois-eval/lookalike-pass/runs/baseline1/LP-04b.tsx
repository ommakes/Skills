import * as React from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Status = "idle" | "dirty" | "saving" | "saved" | "error";

const initial = { name: "Acme Inc.", email: "billing@acme.test", website: "https://acme.test" };

function fakeSave(_values: typeof initial): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 900));
}

export default function SaveProfileScreen() {
  const [values, setValues] = React.useState(initial);
  const [saved, setSaved] = React.useState(initial);
  const [status, setStatus] = React.useState<Status>("idle");
  const [savedAt, setSavedAt] = React.useState<Date | null>(null);

  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  const onChange = (key: keyof typeof initial) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setStatus("dirty");
  };

  const onSave = async () => {
    setStatus("saving");
    try {
      await fakeSave(values);
      setSaved(values);
      setSavedAt(new Date());
      setStatus("saved");
      toast.success("Changes saved");
    } catch {
      setStatus("error");
      toast.error("Could not save changes", {
        action: { label: "Retry", onClick: onSave },
      });
    }
  };

  return (
    <div className="mx-auto max-w-xl p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Company profile</CardTitle>
            <div role="status" aria-live="polite">
              {status === "saving" && (
                <Badge variant="secondary" className="gap-1">
                  <Spinner className="size-3" /> Saving
                </Badge>
              )}
              {status === "saved" && !dirty && (
                <Badge variant="secondary">
                  Saved{savedAt ? ` at ${savedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}
                </Badge>
              )}
              {dirty && status !== "saving" && <Badge variant="outline">Unsaved changes</Badge>}
            </div>
          </div>
          <CardDescription>Update how your company appears to customers.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (dirty) onSave();
            }}
          >
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Company name
              <Input value={values.name} onChange={onChange("name")} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Billing email
              <Input type="email" value={values.email} onChange={onChange("email")} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Website
              <Input value={values.website} onChange={onChange("website")} />
            </label>
            <div className="flex justify-end">
              <Button type="submit" disabled={!dirty || status === "saving"}>
                {status === "saving" && <Spinner />}
                {status === "saving" ? "Saving" : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}

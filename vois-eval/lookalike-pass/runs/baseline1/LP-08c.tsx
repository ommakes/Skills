import * as React from "react";
import { Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Pref = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

const initialPrefs: Pref[] = [
  {
    id: "email-all",
    label: "Email notifications",
    description: "Receive email updates about activity in your workspace.",
    enabled: true,
  },
];

export default function EmailNotificationsScreen() {
  const [prefs, setPrefs] = React.useState<Pref[]>(initialPrefs);

  const handleChange = (id: string, checked: boolean) => {
    setPrefs((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: checked } : p)));
    toast.success(checked ? "Email notifications turned on" : "Email notifications turned off");
  };

  return (
    <div className="mx-auto w-full max-w-xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose how you want to be kept in the loop.</CardDescription>
        </CardHeader>
        <CardContent>
          {prefs.map((pref) => (
            <div key={pref.id} className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Mail className="size-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <label htmlFor={pref.id} className="text-sm font-medium leading-none">
                      {pref.label}
                    </label>
                    <Badge variant={pref.enabled ? "default" : "secondary"}>
                      {pref.enabled ? "On" : "Off"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{pref.description}</p>
                </div>
              </div>
              <Switch
                id={pref.id}
                checked={pref.enabled}
                onCheckedChange={(c) => handleChange(pref.id, c)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

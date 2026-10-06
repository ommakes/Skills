import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Category = { id: string; label: string; description: string; enabled: boolean };

const initialCategories: Category[] = [
  { id: "mentions", label: "Mentions and replies", description: "When someone mentions you or replies to your comment.", enabled: true },
  { id: "assignments", label: "Assignments", description: "When a task or item is assigned to you.", enabled: true },
  { id: "billing", label: "Billing and invoices", description: "Receipts, failed payments and plan changes.", enabled: true },
  { id: "product", label: "Product updates", description: "News about new features and improvements.", enabled: false },
];

export default function SettingsEmailNotifications() {
  const [emailEnabled, setEmailEnabled] = React.useState(true);
  const [address, setAddress] = React.useState("om@example.com");
  const [frequency, setFrequency] = React.useState("instant");
  const [categories, setCategories] = React.useState(initialCategories);
  const [saving, setSaving] = React.useState(false);

  const toggleCategory = (id: string, value: boolean) =>
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: value } : c)));

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success("Notification settings saved");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage how and when you hear from us.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Email notifications</CardTitle>
              <CardDescription>Receive notifications by email.</CardDescription>
            </div>
            <Switch
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
              aria-label="Email notifications"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">Send to</label>
            <Input
              id="email"
              type="email"
              value={address}
              disabled={!emailEnabled}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="frequency" className="text-sm font-medium">Frequency</label>
            <Select value={frequency} onValueChange={setFrequency} disabled={!emailEnabled}>
              <SelectTrigger id="frequency" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">Instantly</SelectItem>
                <SelectItem value="daily">Daily digest</SelectItem>
                <SelectItem value="weekly">Weekly digest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <fieldset className="space-y-4" disabled={!emailEnabled}>
            <legend className="text-sm font-medium">Send me emails about</legend>
            {categories.map((c) => (
              <div key={c.id} className="flex items-start gap-3">
                <Checkbox
                  id={c.id}
                  checked={c.enabled}
                  disabled={!emailEnabled}
                  onCheckedChange={(v) => toggleCategory(c.id, v === true)}
                />
                <div className="grid gap-0.5">
                  <label htmlFor={c.id} className="text-sm font-medium leading-none">{c.label}</label>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                </div>
              </div>
            ))}
          </fieldset>

          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

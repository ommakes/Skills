import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Pref = { id: string; label: string; enabled: boolean };

const INITIAL_PREFS: Pref[] = [
  { id: "product-updates", label: "Product updates", enabled: true },
  { id: "comments", label: "Comments and mentions", enabled: true },
  { id: "security", label: "Security alerts", enabled: true },
  { id: "marketing", label: "Marketing emails", enabled: false },
];

const MAX_CHARS = 280;

export default function NotificationPreferences() {
  const [prefs, setPrefs] = React.useState<Pref[]>(INITIAL_PREFS);
  const [frequency, setFrequency] = React.useState("daily");
  const [notes, setNotes] = React.useState("");

  const toggle = (id: string, enabled: boolean) =>
    setPrefs((prev) => prev.map((p) => (p.id === id ? { ...p, enabled } : p)));

  return (
    <div className="mx-auto w-full max-w-xl space-y-8 p-6">
      <div>
        <h1 className="text-xl font-semibold">Notification preferences</h1>
        <p className="text-sm text-muted-foreground">
          Choose what you hear about and how often.
        </p>
      </div>

      <ul className="divide-y rounded-lg border">
        {prefs.map((p) => (
          <li key={p.id} className="flex items-center justify-between px-4 py-3">
            <Label htmlFor={p.id} className="cursor-pointer">
              {p.label}
            </Label>
            <Switch
              id={p.id}
              checked={p.enabled}
              onCheckedChange={(v) => toggle(p.id, v)}
            />
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <Label htmlFor="digest-frequency">Digest frequency</Label>
        <Select value={frequency} onValueChange={setFrequency}>
          <SelectTrigger id="digest-frequency" className="w-full">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          maxLength={MAX_CHARS}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything else we should know?"
          rows={4}
        />
        <p className="text-right text-xs text-muted-foreground" aria-live="polite">
          {notes.length}/{MAX_CHARS}
        </p>
      </div>
    </div>
  );
}

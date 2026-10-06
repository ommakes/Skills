import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const NOTE_LIMIT = 200;

const INITIAL_PREFS = [
  { id: "mentions", label: "Mentions", description: "When someone mentions you in a comment.", enabled: true },
  { id: "assigned", label: "Assigned to you", description: "When a task is assigned to you.", enabled: true },
  { id: "due", label: "Due date reminders", description: "The day before a task is due.", enabled: false },
  { id: "product", label: "Product updates", description: "New features and improvements.", enabled: false },
];

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState(INITIAL_PREFS);
  const [frequency, setFrequency] = useState("daily");
  const [savedNote, setSavedNote] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");

  const dirty = note !== savedNote;
  const remaining = NOTE_LIMIT - note.length;

  function toggle(id: string, next: boolean) {
    setPrefs((p) => p.map((x) => (x.id === id ? { ...x, enabled: next } : x)));
    setStatus("Preference saved.");
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose what we email you about.
        </p>
      </header>

      <div className="flex flex-col gap-10">
        <section aria-labelledby="events-heading">
          <h2 id="events-heading" className="mb-2 text-base font-medium">
            Email me when
          </h2>
          <ul className="divide-y divide-border border-y border-border">
            {prefs.map((pref) => (
              <li
                key={pref.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor={`pref-${pref.id}`} className="text-sm font-medium">
                    {pref.label}
                  </Label>
                  <p id={`pref-${pref.id}-desc`} className="text-sm text-muted-foreground">
                    {pref.description}
                  </p>
                </div>
                <Switch
                  id={`pref-${pref.id}`}
                  aria-describedby={`pref-${pref.id}-desc`}
                  checked={pref.enabled}
                  onCheckedChange={(v) => toggle(pref.id, v)}
                />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="digest-heading" className="flex flex-col gap-6">
          <h2 id="digest-heading" className="text-base font-medium">
            Digest
          </h2>

          <div className="flex flex-col gap-2">
            <Label htmlFor="digest-frequency">Digest frequency</Label>
            <Select
              value={frequency}
              onValueChange={(v) => {
                setFrequency(v);
                setStatus("Preference saved.");
              }}
            >
              <SelectTrigger id="digest-frequency" className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="digest-note">Note for your digest</Label>
            <Textarea
              id="digest-note"
              value={note}
              maxLength={NOTE_LIMIT}
              onChange={(e) => setNote(e.target.value)}
              aria-describedby="digest-note-help digest-note-count"
              rows={3}
              className="w-full field-sizing-content min-h-[calc(3lh+1rem)] max-h-[calc(12lh+1rem)] resize-y"
            />
            <div className="flex items-start justify-between gap-4 text-sm text-muted-foreground">
              <p id="digest-note-help">Added to the top of each digest email.</p>
              <p
                id="digest-note-count"
                aria-live="polite"
                className={`shrink-0 tabular-nums ${remaining <= 20 ? "text-foreground" : ""}`}
              >
                {note.length}/{NOTE_LIMIT}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              disabled={!dirty}
              onClick={() => {
                setSavedNote(note);
                setStatus("Note saved.");
              }}
            >
              Save note
            </Button>
            <Button variant="outline" disabled={!dirty} onClick={() => setNote(savedNote)}>
              Cancel
            </Button>
          </div>
        </section>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>
    </main>
  );
}

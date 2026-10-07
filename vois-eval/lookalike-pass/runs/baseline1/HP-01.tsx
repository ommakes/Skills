import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Toaster } from "@/components/ui/sonner";

const MOCK_SETTINGS = {
  displayName: "Avery Morgan",
  email: "avery@example.com",
  emailUpdates: true,
};

export default function SettingsPage() {
  const [visible, setVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(MOCK_SETTINGS.displayName);
  const [email, setEmail] = useState(MOCK_SETTINGS.email);
  const [emailUpdates, setEmailUpdates] = useState(MOCK_SETTINGS.emailUpdates);

  function handleSave() {
    setSaving(true);
    // Mock save
    window.setTimeout(() => {
      setSaving(false);
      toast.success("Changes saved", {
        duration: 2500,
        className: "!bg-green-600 !text-white !border-green-700",
      });
    }, 400);
  }

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      {/* Slides in from the top of the screen and auto-dismisses */}
      <Toaster position="top-center" />

      {visible ? (
        <Card className="relative mx-auto w-full max-w-md">
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="Dismiss settings card"
            className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-red-950"
          >
            <X className="size-5" aria-hidden="true" />
          </button>

          <CardHeader className="pr-12">
            <div className="flex items-center gap-2">
              <CardTitle>Settings</CardTitle>
              <Badge className="rounded-full border-transparent bg-orange-500 text-white hover:bg-orange-500">
                Beta
              </Badge>
            </div>
            <CardDescription>
              Manage your profile and notification preferences.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="display-name" className="text-sm font-medium">
                Display name
              </label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="email-updates" className="text-sm font-medium">
                Email me product updates
              </label>
              <Switch
                id="email-updates"
                checked={emailUpdates}
                onCheckedChange={setEmailUpdates}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md"
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="mx-auto max-w-md text-center">
          <Button variant="outline" onClick={() => setVisible(true)}>
            Show settings
          </Button>
        </div>
      )}
    </main>
  );
}

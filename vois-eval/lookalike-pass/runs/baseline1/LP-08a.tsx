import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";

const mockUser = { email: "alex.morgan@example.com", emailNotifications: true };

export default function NotificationSettings() {
  const [enabled, setEnabled] = useState(mockUser.emailNotifications);
  const [saving, setSaving] = useState(false);

  async function handleChange(next: boolean) {
    const previous = enabled;
    setEnabled(next);
    setSaving(true);
    try {
      // Mock save call; replace with real API request.
      await new Promise((resolve) => setTimeout(resolve, 400));
      toast.success(next ? "Email notifications turned on" : "Email notifications turned off");
    } catch {
      setEnabled(previous);
      toast.error("Couldn't update email notifications. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification settings</CardTitle>
          <CardDescription>Choose how you hear about activity in your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="email-notifications">Email notifications</Label>
              <p id="email-notifications-desc" className="text-sm text-muted-foreground">
                Sent to {mockUser.email}
              </p>
            </div>
            <Switch
              id="email-notifications"
              aria-describedby="email-notifications-desc"
              checked={enabled}
              disabled={saving}
              onCheckedChange={handleChange}
            />
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}

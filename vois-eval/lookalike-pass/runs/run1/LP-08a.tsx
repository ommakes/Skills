import { useRef, useState } from "react"
import { toast, Toaster } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Mock save call. Replace with the real API request.
function saveEmailNotifications(enabled: boolean): Promise<{ enabled: boolean }> {
  return new Promise((resolve) => setTimeout(() => resolve({ enabled }), 400))
}

export default function NotificationSettings() {
  const [emailOn, setEmailOn] = useState(true)
  const latest = useRef(0)

  async function handleChange(next: boolean) {
    const request = ++latest.current
    const previous = emailOn
    setEmailOn(next) // apply immediately
    try {
      await saveEmailNotifications(next)
      if (request === latest.current) {
        toast.success(next ? "Email notifications turned on" : "Email notifications turned off")
      }
    } catch {
      if (request === latest.current) {
        setEmailOn(previous) // revert on failure
        toast.error("Couldn't update email notifications. Try again.")
      }
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Choose how you hear about activity in your workspace.
          </p>
        </header>

        <section aria-labelledby="email-heading" className="flex flex-col gap-4">
          <h2 id="email-heading" className="text-base font-semibold">
            Email
          </h2>
          <div className="flex flex-col gap-3 border-y py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="flex flex-col gap-1">
              <Label htmlFor="email-notifications" className="text-sm font-medium">
                Email notifications
              </Label>
              <p id="email-notifications-help" className="text-sm text-muted-foreground">
                Get emails about comments, mentions, and assignments at alex@example.com.
              </p>
            </div>
            <Switch
              id="email-notifications"
              aria-describedby="email-notifications-help"
              checked={emailOn}
              onCheckedChange={handleChange}
            />
          </div>
        </section>
      </div>
      <Toaster />
    </main>
  )
}

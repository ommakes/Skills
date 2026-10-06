import { useId, useRef, useState } from "react"
import { toast } from "sonner"

import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Toaster } from "@/components/ui/sonner"

type PrefKey = "email" | "mentions" | "assigned" | "weekly"

type Pref = {
  key: PrefKey
  label: string
  description: string
  enabled: boolean
}

// Mock data
const ACCOUNT_EMAIL = "om@personifyhq.com"

const INITIAL: Record<PrefKey, boolean> = {
  email: true,
  mentions: true,
  assigned: true,
  weekly: false,
}

const DETAIL_ROWS: Omit<Pref, "enabled">[] = [
  {
    key: "mentions",
    label: "Mentions and replies",
    description: "When someone mentions you or replies to your comment.",
  },
  {
    key: "assigned",
    label: "Assignments",
    description: "When a task or review is assigned to you.",
  },
  {
    key: "weekly",
    label: "Weekly summary",
    description: "A Monday recap of what changed in your projects.",
  },
]

// Mock save: resolves after a short delay.
function savePreference(_key: PrefKey, _value: boolean): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 600))
}

type RowProps = {
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  pending?: boolean
  emphasis?: boolean
  onCheckedChange: (value: boolean) => void
}

function PreferenceRow({
  label,
  description,
  checked,
  disabled,
  pending,
  emphasis,
  onCheckedChange,
}: RowProps) {
  const labelId = useId()
  const descId = useId()
  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex min-w-0 flex-col gap-1">
        <span
          id={labelId}
          className={
            emphasis
              ? "text-base font-medium text-foreground"
              : "text-sm font-medium text-foreground"
          }
        >
          {label}
        </span>
        <span
          id={descId}
          className="max-w-prose text-sm text-muted-foreground text-pretty"
        >
          {description}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {pending ? (
          <Spinner className="size-4 text-muted-foreground" aria-label="Saving" />
        ) : null}
        <Switch
          checked={checked}
          disabled={disabled}
          onCheckedChange={onCheckedChange}
          aria-labelledby={labelId}
          aria-describedby={descId}
        />
      </div>
    </li>
  )
}

export default function EmailNotificationSettings() {
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>(INITIAL)
  const [pending, setPending] = useState<Partial<Record<PrefKey, boolean>>>({})
  const failNext = useRef(false) // flip to true to preview the failure path

  async function update(key: PrefKey, value: boolean, successMessage: string) {
    const previous = prefs[key]
    setPrefs((p) => ({ ...p, [key]: value }))
    setPending((p) => ({ ...p, [key]: true }))
    try {
      await savePreference(key, value)
      if (failNext.current) {
        failNext.current = false
        throw new Error("save failed")
      }
      toast.success(successMessage)
    } catch {
      setPrefs((p) => ({ ...p, [key]: previous }))
      toast.error("Couldn't update your notification settings. Try again.")
    } finally {
      setPending((p) => ({ ...p, [key]: false }))
    }
  }

  const emailOn = prefs.email

  return (
    <div className="min-h-svh bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-(--width-form-max) flex-col gap-10 px-4 py-10 sm:px-6 sm:py-16">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground text-pretty">
            Choose what reaches your inbox. Changes save as you make them.
          </p>
        </header>

        <section aria-labelledby="email-heading" className="flex flex-col gap-1">
          <h2
            id="email-heading"
            className="text-sm font-medium text-muted-foreground"
          >
            Email
          </h2>
          <ul className="flex flex-col divide-y divide-border border-y border-border">
            <PreferenceRow
              emphasis
              label="Email notifications"
              description={`Send updates to ${ACCOUNT_EMAIL}.`}
              checked={emailOn}
              pending={pending.email}
              onCheckedChange={(v) =>
                update(
                  "email",
                  v,
                  v ? "Email notifications turned on" : "Email notifications turned off"
                )
              }
            />
            {DETAIL_ROWS.map((row) => (
              <PreferenceRow
                key={row.key}
                label={row.label}
                description={row.description}
                checked={emailOn && prefs[row.key]}
                disabled={!emailOn}
                pending={pending[row.key]}
                onCheckedChange={(v) =>
                  update(
                    row.key,
                    v,
                    v ? `${row.label} emails turned on` : `${row.label} emails turned off`
                  )
                }
              />
            ))}
          </ul>
          {!emailOn ? (
            <p className="pt-2 text-sm text-muted-foreground text-pretty">
              Email notifications are off. Turn them on to choose which emails you get.
            </p>
          ) : null}
        </section>
      </main>
      <Toaster />
    </div>
  )
}

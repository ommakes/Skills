import { useEffect, useState } from "react"
import { MailIcon, CircleAlertIcon, PenSquareIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

type InboxStatus = "loading" | "error" | "empty"

// Inline mock: the fetch resolves to an empty inbox, or fails when `shouldFail` is set.
const mockFetchMessages = (shouldFail: boolean) =>
  new Promise<never[]>((resolve, reject) =>
    setTimeout(() => (shouldFail ? reject(new Error("network")) : resolve([])), 1200),
  )

export default function InboxScreen() {
  const [status, setStatus] = useState<InboxStatus>("loading")
  const [shouldFail, setShouldFail] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus("loading")
    mockFetchMessages(shouldFail)
      .then(() => !cancelled && setStatus("empty"))
      .catch(() => !cancelled && setStatus("error"))
    return () => {
      cancelled = true
    }
  }, [attempt, shouldFail])

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-balance">Inbox</h1>

      {status === "loading" && (
        <div role="status" aria-busy="true" className="flex flex-col gap-4">
          <span className="sr-only">Loading messages…</span>
          <ul className="flex flex-col gap-4" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex items-center gap-4">
                <Skeleton className="size-10 shrink-0 rounded-full motion-reduce:animate-none" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-1/3 motion-reduce:animate-none" />
                  <Skeleton className="h-4 w-full motion-reduce:animate-none" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {status === "error" && (
        <Alert variant="destructive">
          <CircleAlertIcon aria-hidden="true" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            <p>We couldn’t load your messages.</p>
            <Button
              variant="link"
              className="h-auto p-0 text-destructive underline"
              onClick={() => setAttempt((n) => n + 1)}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {status === "empty" && (
        <section className="flex flex-col items-center gap-6 py-16 text-center">
          <MailIcon className="size-8 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-balance">No messages yet</h2>
            <p className="max-w-[65ch] text-sm text-pretty text-muted-foreground">
              Messages you receive show up here.
            </p>
          </div>
          <Button>
            <PenSquareIcon aria-hidden="true" />
            Compose
          </Button>
        </section>
      )}

      {/* Mock-only control to preview the failure state */}
      <div className="mt-auto flex items-center gap-2 border-t pt-4 text-sm text-muted-foreground">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={shouldFail}
            onChange={(e) => setShouldFail(e.target.checked)}
          />
          Simulate a failed load
        </label>
      </div>
    </main>
  )
}

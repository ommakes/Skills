import { useState } from "react"
import { Loader2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const account = {
  name: "Maya Okafor",
  email: "maya@northwind.example",
  projects: 12,
  files: 248,
  teammates: 4,
  recoveryDays: 30,
}

export default function AccountPage() {
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleted, setDeleted] = useState(false)

  const matches = confirmation === account.email

  function handleOpenChange(next: boolean) {
    if (deleting) return
    setOpen(next)
    if (!next) setConfirmation("")
  }

  async function handleDelete() {
    if (!matches) return
    setDeleting(true)
    await new Promise((resolve) => setTimeout(resolve, 900)) // mock request
    setDeleting(false)
    setDeleted(true)
    setOpen(false)
    setConfirmation("")
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-balance">Account</h1>
        <p className="text-muted-foreground max-w-prose text-pretty">
          Manage your profile and what happens to your data.
        </p>
      </header>

      <section aria-labelledby="profile-heading" className="flex flex-col gap-4">
        <h2 id="profile-heading" className="text-lg font-semibold">
          Profile
        </h2>
        <dl className="divide-border border-border divide-y rounded-lg border">
          <div className="flex flex-col gap-1 p-4 sm:flex-row sm:justify-between">
            <dt className="text-muted-foreground text-sm">Name</dt>
            <dd className="text-sm">{account.name}</dd>
          </div>
          <div className="flex flex-col gap-1 p-4 sm:flex-row sm:justify-between">
            <dt className="text-muted-foreground text-sm">Email address</dt>
            <dd className="text-sm">{account.email}</dd>
          </div>
        </dl>
      </section>

      {deleted && (
        <p role="status" className="text-sm">
          Your account is scheduled for deletion. You can restore it for {account.recoveryDays} days.
        </p>
      )}

      <section aria-labelledby="danger-heading" className="flex flex-col gap-4">
        <h2 id="danger-heading" className="text-destructive text-lg font-semibold">
          Danger zone
        </h2>
        <div className="border-destructive/40 flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Delete account</p>
            <p className="text-muted-foreground max-w-prose text-sm text-pretty">
              Permanently remove your account and everything in it. You have {account.recoveryDays} days to
              restore it.
            </p>
          </div>
          <Button variant="destructive" size="lg" onClick={() => setOpen(true)}>
            Delete account
          </Button>
        </div>
      </section>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-3 text-pretty">
                <p>
                  This deletes your profile and removes you from every workspace. You can restore it within{" "}
                  {account.recoveryDays} days. After that, it’s gone for good.
                </p>
                <ul className="list-disc pl-5">
                  <li>{account.projects} projects</li>
                  <li>{account.files} files</li>
                  <li>Access for {account.teammates} teammates</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-email">
              Type <span className="font-mono">{account.email}</span> to confirm
            </Label>
            <Input
              id="confirm-email"
              autoComplete="off"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && matches) handleDelete()
              }}
            />
          </div>

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <Button variant="destructive" disabled={!matches || deleting} onClick={handleDelete}>
              {deleting && <Loader2 className="animate-spin" aria-hidden="true" />}
              Delete account
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

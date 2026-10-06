import { useMemo, useState } from "react"
import { DownloadIcon, XIcon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type User = {
  id: string
  name: string
  role: string
  /** ISO timestamp, or null when the user is online right now. */
  lastSeen: string | null
  lastSeenLabel?: string
}

const INITIAL_USERS: User[] = [
  { id: "u1", name: "Amara Okafor", role: "Owner", lastSeen: null },
  { id: "u2", name: "Daniel Reyes", role: "Admin", lastSeen: null },
  { id: "u3", name: "Mei Tanaka", role: "Editor", lastSeen: "2026-10-06T09:12:00Z", lastSeenLabel: "3 hours ago" },
  { id: "u4", name: "Lucas Berg", role: "Editor", lastSeen: "2026-10-05T16:40:00Z", lastSeenLabel: "Yesterday" },
  { id: "u5", name: "Priya Nair", role: "Viewer", lastSeen: "2026-10-03T11:05:00Z", lastSeenLabel: "3 days ago" },
  { id: "u6", name: "Tomás Herrera", role: "Viewer", lastSeen: "2026-09-29T08:30:00Z", lastSeenLabel: "Sep 29" },
]

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function LastSeen({ user }: { user: User }) {
  if (!user.lastSeen) {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-foreground">
        <span
          aria-hidden="true"
          className="size-2 rounded-full bg-[var(--color-success,oklch(0.65_0.17_150))]"
        />
        Active now
      </span>
    )
  }
  return (
    <time dateTime={user.lastSeen} className="text-sm text-muted-foreground">
      {user.lastSeenLabel}
    </time>
  )
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)

  const count = selected.size
  const allSelected = users.length > 0 && count === users.length
  const headerState: boolean | "indeterminate" = allSelected
    ? true
    : count > 0
      ? "indeterminate"
      : false

  const selectedNames = useMemo(
    () => users.filter((u) => selected.has(u.id)).map((u) => u.name),
    [users, selected],
  )

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(users.map((u) => u.id)) : new Set())
  }

  function removeSelected() {
    setUsers((prev) => prev.filter((u) => !selected.has(u.id)))
    setSelected(new Set())
    setConfirmOpen(false)
  }

  function exportSelected() {
    const rows = users.filter((u) => selected.has(u.id))
    const csv = [
      "name,role,last_seen",
      ...rows.map(
        (u) => `${u.name},${u.role},${u.lastSeen ?? "active now"}`,
      ),
    ].join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    const a = document.createElement("a")
    a.href = url
    a.download = "users.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const barVisible = count > 0

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:py-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-balance text-foreground">
          Users
        </h1>
        <p className="text-sm text-muted-foreground">
          People with access to this workspace.
        </p>
      </header>

      <div className="overflow-hidden rounded-xl shadow-[var(--shadow-border)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 pl-4">
                <Checkbox
                  checked={headerState}
                  onCheckedChange={(v) => toggleAll(v === true)}
                  aria-label="Select all users"
                  className="after:absolute after:-inset-3 relative"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Role</TableHead>
              <TableHead>Last seen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelected = selected.has(user.id)
              return (
                <TableRow
                  key={user.id}
                  data-state={isSelected ? "selected" : undefined}
                  className="h-14 data-[state=selected]:bg-muted"
                >
                  <TableCell className="pl-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(v) => toggleOne(user.id, v === true)}
                      aria-label={`Select ${user.name}`}
                      className="after:absolute after:-inset-3 relative"
                    />
                  </TableCell>
                  <TableCell className="min-w-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback
                          aria-hidden="true"
                          className="text-xs font-medium"
                        >
                          {initials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-semibold text-foreground">
                          {user.name}
                        </span>
                        <span className="text-xs text-muted-foreground sm:hidden">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                    {user.role}
                  </TableCell>
                  <TableCell>
                    <LastSeen user={user} />
                  </TableCell>
                </TableRow>
              )
            })}
            {users.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  No users left.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bulk action bar: slides up from the bottom when rows are selected. */}
      <div
        role="region"
        aria-label="Bulk actions"
        inert={!barVisible}
        className={[
          "fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center gap-3 rounded-xl bg-popover p-3 text-popover-foreground",
          "shadow-[var(--shadow-modal)]",
          "transition-[transform,opacity] duration-300 ease-[cubic-bezier(.23,1,.32,1)] motion-reduce:transition-none",
          barVisible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-[calc(100%+16px)] opacity-0",
        ].join(" ")}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelected(new Set())}
          aria-label="Clear selection"
        >
          <XIcon className="size-4" aria-hidden="true" />
        </Button>
        <p
          className="min-w-0 flex-1 truncate text-sm font-medium tabular-nums"
          aria-live="polite"
        >
          {count} selected
        </p>
        <Button variant="outline" onClick={exportSelected}>
          <DownloadIcon className="size-4" aria-hidden="true" />
          Export
        </Button>
        <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
          Remove
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {count} {count === 1 ? "user" : "users"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {count === 1
                ? `${selectedNames[0]} loses access right away.`
                : "They lose access right away."}{" "}
              You can add them back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Keep {count === 1 ? "user" : "users"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={removeSelected}>
              Remove {count === 1 ? "user" : "users"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

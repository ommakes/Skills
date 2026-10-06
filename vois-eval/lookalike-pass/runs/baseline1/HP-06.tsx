import * as React from "react"

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
import { cn } from "@/lib/utils"

type User = {
  id: string
  name: string
  role: string
  lastSeen: string
  active: boolean
}

const INITIAL_USERS: User[] = [
  { id: "u1", name: "Amara Okafor", role: "Owner", lastSeen: "Active now", active: true },
  { id: "u2", name: "Liam Chen", role: "Admin", lastSeen: "Active now", active: true },
  { id: "u3", name: "Sofia Martinez", role: "Editor", lastSeen: "12 minutes ago", active: false },
  { id: "u4", name: "Noah Williams", role: "Editor", lastSeen: "3 hours ago", active: false },
  { id: "u5", name: "Priya Raman", role: "Viewer", lastSeen: "Active now", active: true },
  { id: "u6", name: "Jonas Becker", role: "Viewer", lastSeen: "Yesterday", active: false },
  { id: "u7", name: "Mei Tanaka", role: "Admin", lastSeen: "2 days ago", active: false },
]

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export default function UsersTable() {
  const [users, setUsers] = React.useState<User[]>(INITIAL_USERS)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  const count = selected.size
  const allSelected = users.length > 0 && count === users.length
  const someSelected = count > 0 && !allSelected

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

  function handleRemove() {
    setUsers((prev) => prev.filter((u) => !selected.has(u.id)))
    setSelected(new Set())
    setConfirmOpen(false)
  }

  function handleExport() {
    const rows = users.filter((u) => selected.has(u.id))
    const csv = [
      "Name,Role,Last seen",
      ...rows.map((u) => `"${u.name}","${u.role}","${u.lastSeen}"`),
    ].join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    const a = document.createElement("a")
    a.href = url
    a.download = "users.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 pb-28">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          Select people to remove them or export their details.
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={(v) => toggleAll(v === true)}
                  aria-label="Select all users"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last seen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No users left.
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => {
              const isSelected = selected.has(user.id)
              return (
                <TableRow key={user.id} data-state={isSelected ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(v) => toggleOne(user.id, v === true)}
                      aria-label={`Select ${user.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        aria-hidden="true"
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
                      >
                        {initials(user.name)}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.role}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2 text-sm">
                      {user.active && (
                        <span
                          aria-hidden="true"
                          className="size-2 shrink-0 rounded-full bg-green-500"
                        />
                      )}
                      <span className={user.active ? "" : "text-muted-foreground"}>
                        {user.lastSeen}
                      </span>
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Selection bar, slides up from the bottom when rows are selected */}
      <div
        role="region"
        aria-label="Selection actions"
        aria-hidden={count === 0}
        inert={count === 0}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4 transition-transform duration-300 ease-out motion-reduce:transition-none",
          count > 0 ? "translate-y-0" : "pointer-events-none translate-y-full"
        )}
      >
        <div className="flex w-full max-w-xl items-center justify-between gap-4 rounded-lg border bg-background px-4 py-3 shadow-lg">
          <p className="text-sm font-medium" aria-live="polite">
            {count} selected
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
              Export
            </Button>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              Remove
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {count} {count === 1 ? "user" : "users"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              They will lose access right away. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

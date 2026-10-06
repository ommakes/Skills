import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Member = {
  id: string
  name: string
  email: string
  role: "Owner" | "Admin" | "Member"
  lastActive: string
}

const MEMBERS: Member[] = [
  { id: "1", name: "Priya Raman", email: "priya@acme.com", role: "Owner", lastActive: "Today" },
  { id: "2", name: "Marcus Lee", email: "marcus@acme.com", role: "Admin", lastActive: "Yesterday" },
  { id: "3", name: "Sofia Alvarez", email: "sofia@acme.com", role: "Member", lastActive: "3 days ago" },
  { id: "4", name: "Tom Becker", email: "tom@acme.com", role: "Member", lastActive: "Last week" },
]

const SKELETON_ROWS = 6

// Skeleton widths vary per row so the placeholder reads as real content, not a grid of identical bars.
const NAME_WIDTHS = ["w-32", "w-28", "w-36", "w-24", "w-32", "w-28"]
const EMAIL_WIDTHS = ["w-44", "w-40", "w-48", "w-36", "w-44", "w-40"]

function MemberTable({ loading, members }: { loading: boolean; members: Member[] }) {
  return (
    <div className="rounded-lg border">
      <Table aria-busy={loading}>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[45%]">Member</TableHead>
            <TableHead className="w-[20%]">Role</TableHead>
            <TableHead className="w-[20%]">Last active</TableHead>
            <TableHead className="w-[15%]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-9 rounded-full motion-reduce:animate-none" />
                      <div className="flex flex-col gap-2">
                        <Skeleton className={`h-4 ${NAME_WIDTHS[i % NAME_WIDTHS.length]} motion-reduce:animate-none`} />
                        <Skeleton className={`h-3 ${EMAIL_WIDTHS[i % EMAIL_WIDTHS.length]} motion-reduce:animate-none`} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full motion-reduce:animate-none" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20 motion-reduce:animate-none" />
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))
            : members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                        {m.name.split(" ").map((p) => p[0]).join("")}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{m.name}</span>
                        <span className="text-sm text-muted-foreground">{m.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{m.role}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.lastActive}</TableCell>
                  <TableCell />
                </TableRow>
              ))}
        </TableBody>
      </Table>
      {/* Announce loading and completion to screen readers; skeletons themselves are not announced. */}
      <p role="status" className="sr-only">
        {loading ? "Loading team members" : `${members.length} team members loaded`}
      </p>
    </div>
  )
}

export default function TeamMembersPage() {
  const [loading, setLoading] = React.useState(true)
  const [members, setMembers] = React.useState<Member[]>([])

  const load = React.useCallback(() => {
    setLoading(true)
    const t = setTimeout(() => {
      setMembers(MEMBERS)
      setLoading(false)
    }, 1500)
    return () => clearTimeout(t)
  }, [])

  React.useEffect(() => load(), [load])

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Team members</h1>
          <p className="text-sm text-muted-foreground">Manage who has access to this workspace.</p>
        </div>
        {/* Page chrome renders immediately; only the data region waits. */}
        <Button>Invite member</Button>
      </header>

      <Input
        type="search"
        placeholder="Search members"
        aria-label="Search members"
        className="max-w-sm"
        disabled={loading}
      />

      <MemberTable loading={loading} members={members} />
    </div>
  )
}

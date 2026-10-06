import * as React from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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
  role: string
}

const MEMBERS: Member[] = [
  { id: "1", name: "Amara Okafor", email: "amara@example.com", role: "Admin" },
  { id: "2", name: "Ben Carter", email: "ben@example.com", role: "Editor" },
  { id: "3", name: "Chen Wei", email: "chen@example.com", role: "Viewer" },
  { id: "4", name: "Dana Silva", email: "dana@example.com", role: "Editor" },
]

const SKELETON_ROWS = 5

export default function MembersList() {
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
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Members</h1>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Table aria-busy={loading}>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                </TableRow>
              ))
            : members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {m.email}
                  </TableCell>
                  <TableCell>{m.role}</TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
      <span className="sr-only" role="status">
        {loading ? "Loading members…" : ""}
      </span>
    </div>
  )
}

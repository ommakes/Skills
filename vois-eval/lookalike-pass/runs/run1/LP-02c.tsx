import { useState } from "react"
import { Archive, Copy, ExternalLink, Link2, MoreHorizontal, Trash2 } from "lucide-react"
import { toast } from "sonner"

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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Toaster } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Project = {
  id: string
  name: string
  owner: string
  status: "Active" | "Archived"
  updated: string
}

const INITIAL: Project[] = [
  { id: "p1", name: "Website redesign", owner: "Priya Nair", status: "Active", updated: "Today" },
  { id: "p2", name: "Mobile onboarding", owner: "Jonas Weber", status: "Active", updated: "Yesterday" },
  { id: "p3", name: "Q3 pricing experiment", owner: "Amara Okafor", status: "Active", updated: "Oct 1" },
  { id: "p4", name: "Billing migration", owner: "Lee Chen", status: "Archived", updated: "Sep 18" },
]

export default function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>(INITIAL)
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null)

  const setStatus = (id: string, status: Project["status"]) =>
    setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, status } : p)))

  const duplicate = (p: Project) => {
    const copy: Project = { ...p, id: crypto.randomUUID(), name: `${p.name} (copy)`, updated: "Just now" }
    setProjects((ps) => {
      const i = ps.findIndex((x) => x.id === p.id)
      return [...ps.slice(0, i + 1), copy, ...ps.slice(i + 1)]
    })
    toast.success("Project duplicated")
  }

  const archive = (p: Project) => {
    setStatus(p.id, "Archived")
    toast("Project archived", {
      description: p.name,
      action: { label: "Undo", onClick: () => setStatus(p.id, "Active") },
    })
  }

  const copyLink = async (p: Project) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/projects/${p.id}`)
      toast.success("Link copied")
    } catch {
      toast.error("Couldn't copy the link. Try again.")
    }
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    setProjects((ps) => ps.filter((p) => p.id !== pendingDelete.id))
    toast.success("Project deleted")
    setPendingDelete(null)
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Projects</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell className="text-muted-foreground">{p.owner}</TableCell>
              <TableCell>
                <Badge variant={p.status === "Active" ? "secondary" : "outline"}>{p.status}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{p.updated}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`Actions for ${p.name}`}>
                      <MoreHorizontal className="size-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => toast(`Opening ${p.name}`)}>
                      <ExternalLink aria-hidden="true" /> Open
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => duplicate(p)}>
                      <Copy aria-hidden="true" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => copyLink(p)}>
                      <Link2 aria-hidden="true" /> Copy link
                    </DropdownMenuItem>
                    {p.status === "Active" && (
                      <DropdownMenuItem onSelect={() => archive(p)}>
                        <Archive aria-hidden="true" /> Archive
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={() => setPendingDelete(p)}>
                      <Trash2 aria-hidden="true" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Rendered outside the menu so it survives the menu closing. */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the project and its files. You can't undo this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  )
}

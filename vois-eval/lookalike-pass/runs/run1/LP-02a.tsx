import { useState } from "react"
import { toast } from "sonner"
import { Copy, Ellipsis, Archive, Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  updated: string
  archived: boolean
}

const INITIAL: Project[] = [
  { id: "p1", name: "Website redesign", owner: "Amara Okafor", updated: "Oct 2, 2026", archived: false },
  { id: "p2", name: "Mobile onboarding", owner: "Jonas Weber", updated: "Sep 28, 2026", archived: false },
  { id: "p3", name: "Billing migration", owner: "Priya Nair", updated: "Sep 19, 2026", archived: false },
  { id: "p4", name: "Q3 research synthesis", owner: "Lena Fischer", updated: "Aug 30, 2026", archived: true },
  { id: "p5", name: "Partner portal", owner: "Diego Ramos", updated: "Aug 14, 2026", archived: false },
]

export default function ProjectsTable() {
  const [projects, setProjects] = useState<Project[]>(INITIAL)
  const [renaming, setRenaming] = useState<Project | null>(null)
  const [draftName, setDraftName] = useState("")
  const [deleting, setDeleting] = useState<Project | null>(null)

  const setArchived = (id: string, archived: boolean) =>
    setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, archived } : p)))

  const startRename = (p: Project) => {
    setDraftName(p.name)
    setRenaming(p)
  }

  const saveRename = () => {
    const name = draftName.trim()
    if (!renaming || !name) return
    setProjects((ps) => ps.map((p) => (p.id === renaming.id ? { ...p, name } : p)))
    toast.success(`Renamed to “${name}”`)
    setRenaming(null)
  }

  const duplicate = (p: Project) => {
    const copy: Project = {
      ...p,
      id: `${p.id}-copy-${Date.now()}`,
      name: `${p.name} (copy)`,
      archived: false,
    }
    setProjects((ps) => {
      const i = ps.findIndex((x) => x.id === p.id)
      return [...ps.slice(0, i + 1), copy, ...ps.slice(i + 1)]
    })
    toast.success(`Duplicated “${p.name}”`)
  }

  const archive = (p: Project) => {
    setArchived(p.id, true)
    toast(`Archived “${p.name}”`, {
      action: { label: "Undo", onClick: () => setArchived(p.id, false) },
    })
  }

  const confirmDelete = () => {
    if (!deleting) return
    const { id, name } = deleting
    setProjects((ps) => ps.filter((p) => p.id !== id))
    setDeleting(null)
    toast.success(`Deleted “${name}”`)
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {projects.length} projects in this workspace.
      </p>

      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Last updated</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.id} className={p.archived ? "opacity-60" : undefined}>
                <TableCell className="font-semibold">
                  {p.name}
                  {p.archived && (
                    <Badge variant="secondary" className="ml-2 font-normal">
                      Archived
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{p.owner}</TableCell>
                <TableCell className="text-muted-foreground">{p.updated}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={p.archived}
                        aria-label={`Actions for ${p.name}`}
                      >
                        <Ellipsis className="size-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => startRename(p)}>
                        <Pencil aria-hidden="true" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => duplicate(p)}>
                        <Copy aria-hidden="true" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => archive(p)}>
                        <Archive aria-hidden="true" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(p)}>
                        <Trash2 aria-hidden="true" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs live outside the menu so they survive it closing. */}
      <Dialog open={!!renaming} onOpenChange={(o) => !o && setRenaming(null)}>
        <DialogContent className="sm:max-w-md">
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault()
              saveRename()
            }}
          >
            <DialogHeader>
              <DialogTitle>Rename project</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRenaming(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!draftName.trim()}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleting?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the project and everything in it. You can’t undo this.
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

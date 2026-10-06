import * as React from "react"
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  CopyIcon,
  LinkIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Toaster } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Status = "Active" | "On hold" | "Completed"

type Project = {
  id: string
  name: string
  owner: string
  status: Status
  updated: string
  archived: boolean
}

const INITIAL_PROJECTS: Project[] = [
  { id: "p1", name: "Website redesign", owner: "Amara Okafor", status: "Active", updated: "Oct 2, 2026", archived: false },
  { id: "p2", name: "Mobile app v2", owner: "Liam Chen", status: "Active", updated: "Oct 1, 2026", archived: false },
  { id: "p3", name: "Billing migration", owner: "Sofia Reyes", status: "On hold", updated: "Sep 28, 2026", archived: false },
  { id: "p4", name: "Q3 research synthesis", owner: "Noah Patel", status: "Completed", updated: "Sep 22, 2026", archived: false },
  { id: "p5", name: "Onboarding emails", owner: "Amara Okafor", status: "Completed", updated: "Sep 10, 2026", archived: true },
]

const STATUS_VARIANT: Record<Status, "default" | "secondary" | "outline"> = {
  Active: "default",
  "On hold": "secondary",
  Completed: "outline",
}

export default function ProjectsTable() {
  const [projects, setProjects] = React.useState<Project[]>(INITIAL_PROJECTS)
  const [editing, setEditing] = React.useState<Project | null>(null)
  const [editName, setEditName] = React.useState("")
  const [deleting, setDeleting] = React.useState<Project | null>(null)

  const patch = (id: string, changes: Partial<Project>) =>
    setProjects((rows) => rows.map((p) => (p.id === id ? { ...p, ...changes } : p)))

  const openEdit = (project: Project) => {
    setEditing(project)
    setEditName(project.name)
  }

  const saveEdit = () => {
    if (!editing || !editName.trim()) return
    patch(editing.id, { name: editName.trim() })
    setEditing(null)
    toast.success("Project updated")
  }

  const duplicate = (project: Project) => {
    const copy: Project = {
      ...project,
      id: `${project.id}-copy-${Date.now()}`,
      name: `${project.name} (copy)`,
      archived: false,
    }
    setProjects((rows) => {
      const index = rows.findIndex((p) => p.id === project.id)
      return [...rows.slice(0, index + 1), copy, ...rows.slice(index + 1)]
    })
    toast.success("Project duplicated")
  }

  const copyLink = async (project: Project) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/projects/${project.id}`)
      toast.success("Link copied")
    } catch {
      toast.error("Couldn't copy link. Try again.")
    }
  }

  // Archive is reversible, so no confirmation dialog: toast with undo.
  const archive = (project: Project) => {
    patch(project.id, { archived: true })
    toast(`${project.name} archived`, {
      action: { label: "Undo", onClick: () => patch(project.id, { archived: false }) },
    })
  }

  const restore = (project: Project) => {
    patch(project.id, { archived: false })
    toast.success("Project restored")
  }

  const confirmDelete = () => {
    if (!deleting) return
    const name = deleting.name
    setProjects((rows) => rows.filter((p) => p.id !== deleting.id))
    setDeleting(null)
    toast.success(`${name} deleted`)
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-sm text-muted-foreground">
          {projects.length} projects in this workspace.
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Last updated</TableHead>
              <TableHead className="w-28">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow
                key={project.id}
                className={`group ${project.archived ? "opacity-60" : ""}`}
              >
                <TableCell className="font-semibold">{project.name}</TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {project.owner}
                </TableCell>
                <TableCell>
                  {project.archived ? (
                    <Badge variant="outline">Archived</Badge>
                  ) : (
                    <Badge variant={STATUS_VARIANT[project.status]}>{project.status}</Badge>
                  )}
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {project.updated}
                </TableCell>
                <TableCell>
                  {/* Two visible quick actions; the rest live in the menu.
                      Revealed on hover only where hover exists; always visible on touch. */}
                  <div className="flex items-center justify-end gap-1 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:has-[[data-state=open]]:opacity-100">
                    {project.archived ? (
                      <Button variant="ghost" size="sm" onClick={() => restore(project)}>
                        <ArchiveRestoreIcon />
                        Restore
                      </Button>
                    ) : (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Edit ${project.name}`}
                              onClick={() => openEdit(project)}
                            >
                              <PencilIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Duplicate ${project.name}`}
                              onClick={() => duplicate(project)}
                            >
                              <CopyIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Duplicate</TooltipContent>
                        </Tooltip>
                      </>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`More actions for ${project.name}`}
                        >
                          <MoreHorizontalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => copyLink(project)}>
                          <LinkIcon />
                          Copy link
                        </DropdownMenuItem>
                        {!project.archived && (
                          <DropdownMenuItem onSelect={() => archive(project)}>
                            <ArchiveIcon />
                            Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(project)}>
                          <Trash2Icon />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit project</SheetTitle>
            <SheetDescription>Change the details for this project.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <SheetFooter>
            <Button onClick={saveEdit} disabled={!editName.trim()}>
              Save changes
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the project and its files. You can't undo this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmDelete}
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

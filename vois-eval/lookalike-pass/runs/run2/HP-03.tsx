import * as React from "react"
import { MoreHorizontal, Pencil, Copy, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type StatusKey = "active" | "at-risk" | "paused" | "done"

const STATUS: Record<StatusKey, { label: string; dot: string; help: string }> = {
  active: {
    label: "Active",
    dot: "bg-primary",
    help: "Work is in progress and on schedule.",
  },
  "at-risk": {
    label: "At risk",
    dot: "bg-destructive",
    help: "One or more milestones are late or blocked.",
  },
  paused: {
    label: "Paused",
    dot: "bg-muted-foreground",
    help: "No work is planned until someone resumes it.",
  },
  done: {
    label: "Done",
    dot: "bg-foreground",
    help: "All milestones are complete.",
  },
}

type Project = {
  id: string
  name: string
  description: string
  status: StatusKey
  updated: string
}

const INITIAL: Project[] = [
  { id: "p1", name: "Atlas redesign", description: "New navigation and dashboard for the web app.", status: "active", updated: "Updated 2 hours ago" },
  { id: "p2", name: "Billing migration", description: "Move invoices to the new payments provider.", status: "at-risk", updated: "Updated yesterday" },
  { id: "p3", name: "Mobile onboarding", description: "Shorter first-run flow for iOS and Android.", status: "paused", updated: "Updated 3 weeks ago" },
  { id: "p4", name: "Help center refresh", description: "Rewrite top 40 articles and update screenshots.", status: "done", updated: "Updated last month" },
  { id: "p5", name: "Usage analytics", description: "Track feature adoption across plans.", status: "active", updated: "Updated 4 days ago" },
  { id: "p6", name: "Partner API", description: "Public endpoints for integration partners.", status: "active", updated: "Updated 1 week ago" },
]

function StatusLabel({ status }: { status: StatusKey }) {
  const s = STATUS[status]
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-sm text-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span aria-hidden="true" className={`size-2 rounded-full ${s.dot}`} />
          {s.label}
        </button>
      </TooltipTrigger>
      <TooltipContent>{s.help}</TooltipContent>
    </Tooltip>
  )
}

export default function ProjectCardsGrid() {
  const [projects, setProjects] = React.useState<Project[]>(INITIAL)
  const [pendingDelete, setPendingDelete] = React.useState<Project | null>(null)

  const duplicate = (p: Project) =>
    setProjects((list) => {
      const i = list.findIndex((x) => x.id === p.id)
      const copy: Project = {
        ...p,
        id: `${p.id}-copy-${Date.now()}`,
        name: `${p.name} (copy)`,
        updated: "Updated just now",
      }
      return [...list.slice(0, i + 1), copy, ...list.slice(i + 1)]
    })

  const confirmDelete = () => {
    if (!pendingDelete) return
    setProjects((list) => list.filter((x) => x.id !== pendingDelete.id))
    setPendingDelete(null)
  }

  return (
    <TooltipProvider delayDuration={200}>
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="mb-6 text-2xl font-semibold text-balance">Projects</h1>

        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No projects yet.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <li key={p.id}>
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <CardDescription className="text-pretty">
                        {p.description}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="-mt-1 -mr-2 shrink-0"
                          aria-label={`Actions for ${p.name}`}
                        >
                          <MoreHorizontal className="size-4" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => { /* open edit flow */ }}>
                          <Pencil className="size-4" aria-hidden="true" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => duplicate(p)}>
                          <Copy className="size-4" aria-hidden="true" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => setPendingDelete(p)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-2">
                    <StatusLabel status={p.status} />
                    <span className="text-xs text-muted-foreground">{p.updated}</span>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}

        <AlertDialog
          open={pendingDelete !== null}
          onOpenChange={(open) => { if (!open) setPendingDelete(null) }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes the project and its files. You can't undo this.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Delete project</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </TooltipProvider>
  )
}

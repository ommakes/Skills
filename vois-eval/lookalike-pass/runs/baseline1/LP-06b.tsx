import * as React from "react"
import { PencilIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Toaster } from "@/components/ui/sonner"

type Status = "todo" | "in_progress" | "done"
type Priority = "low" | "medium" | "high"

interface Task {
  id: string
  title: string
  assignee: string
  status: Status
  priority: Priority
  due: string
}

const STATUS_LABEL: Record<Status, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
}

const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
}

const INITIAL_TASKS: Task[] = [
  { id: "t1", title: "Draft Q4 roadmap", assignee: "Priya Shah", status: "in_progress", priority: "high", due: "2026-10-14" },
  { id: "t2", title: "Review onboarding copy", assignee: "Marcus Lee", status: "todo", priority: "medium", due: "2026-10-18" },
  { id: "t3", title: "Fix invoice export bug", assignee: "Ana Ruiz", status: "todo", priority: "high", due: "2026-10-09" },
  { id: "t4", title: "Update billing FAQ", assignee: "Tom Becker", status: "done", priority: "low", due: "2026-10-02" },
  { id: "t5", title: "Schedule customer interviews", assignee: "Priya Shah", status: "in_progress", priority: "medium", due: "2026-10-21" },
]

function priorityVariant(p: Priority): "destructive" | "secondary" | "outline" {
  if (p === "high") return "destructive"
  if (p === "medium") return "secondary"
  return "outline"
}

export default function TaskListScreen() {
  const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState<Task | null>(null)

  const openEditor = (task: Task) => {
    setEditingId(task.id)
    setDraft({ ...task })
  }

  const closeEditor = () => {
    setEditingId(null)
    setDraft(null)
  }

  const updateTask = (id: string, patch: Partial<Task>) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))

  const toggleDone = (task: Task, checked: boolean) => {
    updateTask(task.id, { status: checked ? "done" : "todo" })
    toast(checked ? "Task marked done" : "Task reopened")
  }

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft || !draft.title.trim()) return
    updateTask(draft.id, { ...draft, title: draft.title.trim() })
    toast.success("Task updated")
    closeEditor()
  }

  const titleInvalid = draft !== null && draft.title.trim() === ""

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">
          Change a status or priority right in the list, or open a task to edit all of its details.
        </p>
      </header>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <span className="sr-only">Done</span>
              </TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead className="w-40">Status</TableHead>
              <TableHead className="w-28">Priority</TableHead>
              <TableHead className="w-28">Due</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Edit</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} data-state={editingId === task.id ? "selected" : undefined}>
                <TableCell>
                  <Checkbox
                    checked={task.status === "done"}
                    onCheckedChange={(v) => toggleDone(task, v === true)}
                    aria-label={`Mark "${task.title}" as done`}
                  />
                </TableCell>
                <TableCell
                  className={task.status === "done" ? "font-medium text-muted-foreground line-through" : "font-medium"}
                >
                  {task.title}
                </TableCell>
                <TableCell className="text-muted-foreground">{task.assignee}</TableCell>
                <TableCell>
                  <Select
                    value={task.status}
                    onValueChange={(v) => updateTask(task.id, { status: v as Status })}
                  >
                    <SelectTrigger size="sm" className="w-full" aria-label={`Status for ${task.title}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge variant={priorityVariant(task.priority)}>{PRIORITY_LABEL[task.priority]}</Badge>
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">{task.due}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditor(task)}
                    aria-label={`Edit ${task.title}`}
                  >
                    <PencilIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={draft !== null} onOpenChange={(open) => !open && closeEditor()}>
        <SheetContent className="sm:max-w-md">
          <form onSubmit={save} className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle>Edit task</SheetTitle>
              <SheetDescription>Changes apply to the list when you save.</SheetDescription>
            </SheetHeader>

            {draft && (
              <div className="grid flex-1 gap-4 px-4">
                <div className="grid gap-2">
                  <label htmlFor="task-title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="task-title"
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    aria-invalid={titleInvalid}
                    autoFocus
                  />
                  {titleInvalid && <p className="text-sm text-destructive">Enter a title.</p>}
                </div>

                <div className="grid gap-2">
                  <label htmlFor="task-assignee" className="text-sm font-medium">
                    Assignee
                  </label>
                  <Input
                    id="task-assignee"
                    value={draft.assignee}
                    onChange={(e) => setDraft({ ...draft, assignee: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="task-status" className="text-sm font-medium">
                      Status
                    </label>
                    <Select
                      value={draft.status}
                      onValueChange={(v) => setDraft({ ...draft, status: v as Status })}
                    >
                      <SelectTrigger id="task-status" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                          <SelectItem key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="task-priority" className="text-sm font-medium">
                      Priority
                    </label>
                    <Select
                      value={draft.priority}
                      onValueChange={(v) => setDraft({ ...draft, priority: v as Priority })}
                    >
                      <SelectTrigger id="task-priority" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
                          <SelectItem key={p} value={p}>
                            {PRIORITY_LABEL[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="task-due" className="text-sm font-medium">
                    Due date
                  </label>
                  <Input
                    id="task-due"
                    type="date"
                    value={draft.due}
                    onChange={(e) => setDraft({ ...draft, due: e.target.value })}
                  />
                </div>
              </div>
            )}

            <SheetFooter className="flex-row justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeEditor}>
                Cancel
              </Button>
              <Button type="submit" disabled={titleInvalid}>
                Save changes
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Toaster />
    </main>
  )
}

import * as React from "react"
import { PencilIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Toaster } from "@/components/ui/sonner"
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

type Status = "todo" | "in_progress" | "done"
type Priority = "low" | "medium" | "high"

interface Task {
  id: string
  title: string
  status: Status
  priority: Priority
  assignee: string
  due: string // yyyy-mm-dd
  notes: string
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

const STATUS_VARIANT: Record<Status, "outline" | "secondary" | "default"> = {
  todo: "outline",
  in_progress: "secondary",
  done: "default",
}

const ASSIGNEES = ["Ava Chen", "Marcus Reid", "Priya Nair", "Tomás Silva"]

const INITIAL_TASKS: Task[] = [
  {
    id: "t1",
    title: "Draft Q4 launch plan",
    status: "in_progress",
    priority: "high",
    assignee: "Ava Chen",
    due: "2026-10-14",
    notes: "Share with design and sales before the Friday sync.",
  },
  {
    id: "t2",
    title: "Review onboarding emails",
    status: "todo",
    priority: "medium",
    assignee: "Marcus Reid",
    due: "2026-10-18",
    notes: "",
  },
  {
    id: "t3",
    title: "Fix invoice export bug",
    status: "todo",
    priority: "high",
    assignee: "Priya Nair",
    due: "2026-10-09",
    notes: "CSV drops the tax column when a discount is applied.",
  },
  {
    id: "t4",
    title: "Update billing help articles",
    status: "done",
    priority: "low",
    assignee: "Tomás Silva",
    due: "2026-10-02",
    notes: "",
  },
  {
    id: "t5",
    title: "Plan customer interview round",
    status: "in_progress",
    priority: "medium",
    assignee: "Ava Chen",
    due: "2026-10-21",
    notes: "Aim for six interviews across two segments.",
  },
]

function formatDue(iso: string) {
  if (!iso) return "No date"
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function isDirty(a: Task, b: Task) {
  return (
    a.title !== b.title ||
    a.status !== b.status ||
    a.priority !== b.priority ||
    a.assignee !== b.assignee ||
    a.due !== b.due ||
    a.notes !== b.notes
  )
}

export default function TaskListScreen() {
  const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState<Task | null>(null)
  const [showTitleError, setShowTitleError] = React.useState(false)
  const [confirmDiscard, setConfirmDiscard] = React.useState(false)

  const original = tasks.find((t) => t.id === editingId) ?? null
  const dirty = original && draft ? isDirty(original, draft) : false

  function openEditor(task: Task) {
    setEditingId(task.id)
    setDraft({ ...task })
    setShowTitleError(false)
  }

  function closeEditor() {
    setEditingId(null)
    setDraft(null)
    setShowTitleError(false)
    setConfirmDiscard(false)
  }

  function requestClose() {
    if (dirty) setConfirmDiscard(true)
    else closeEditor()
  }

  function update<K extends keyof Task>(key: K, value: Task[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d))
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!draft) return
    if (!draft.title.trim()) {
      setShowTitleError(true)
      return
    }
    const saved = { ...draft, title: draft.title.trim() }
    setTasks((list) => list.map((t) => (t.id === saved.id ? saved : t)))
    toast.success("Task updated")
    closeEditor()
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground text-balance">
          Tasks
        </h1>
        <p className="max-w-[65ch] text-sm text-muted-foreground text-pretty">
          {tasks.length} tasks. Select a task to change it without leaving the
          list.
        </p>
      </header>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Priority</TableHead>
            <TableHead className="hidden md:table-cell">Assignee</TableHead>
            <TableHead className="hidden sm:table-cell text-right">
              Due
            </TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow
              key={task.id}
              data-state={task.id === editingId ? "selected" : undefined}
            >
              <TableCell className="font-semibold">
                <button
                  type="button"
                  onClick={() => openEditor(task)}
                  className="rounded-sm text-left hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {task.title}
                </button>
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[task.status]}>
                  {STATUS_LABEL[task.status]}
                </Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {PRIORITY_LABEL[task.priority]}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {task.assignee}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-right font-mono tabular-nums">
                {formatDue(task.due)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${task.title}`}
                  onClick={() => openEditor(task)}
                >
                  <PencilIcon className="size-4" aria-hidden="true" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Sheet
        open={editingId !== null}
        onOpenChange={(open) => {
          if (!open) requestClose()
        }}
      >
        <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
          {draft && (
            <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
              <SheetHeader>
                <SheetTitle>Edit task</SheetTitle>
                <SheetDescription>
                  Changes apply to this task only.
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-4 py-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="task-title">Task name</Label>
                  <Input
                    id="task-title"
                    value={draft.title}
                    aria-invalid={showTitleError}
                    aria-describedby={
                      showTitleError ? "task-title-error" : undefined
                    }
                    onChange={(e) => {
                      update("title", e.target.value)
                      if (showTitleError) setShowTitleError(false)
                    }}
                  />
                  {showTitleError && (
                    <p
                      id="task-title-error"
                      className="text-sm text-destructive"
                    >
                      Enter a task name.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="task-status">Status</Label>
                  <Select
                    value={draft.status}
                    onValueChange={(v) => update("status", v as Status)}
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

                <div className="flex flex-col gap-2">
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select
                    value={draft.priority}
                    onValueChange={(v) => update("priority", v as Priority)}
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

                <div className="flex flex-col gap-2">
                  <Label htmlFor="task-assignee">Assignee</Label>
                  <Select
                    value={draft.assignee}
                    onValueChange={(v) => update("assignee", v)}
                  >
                    <SelectTrigger id="task-assignee" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSIGNEES.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="task-due">Due date</Label>
                  <Input
                    id="task-due"
                    type="date"
                    value={draft.due}
                    className="font-mono tabular-nums"
                    onChange={(e) => update("due", e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="task-notes">Notes</Label>
                  <Textarea
                    id="task-notes"
                    value={draft.notes}
                    className="min-h-24 field-sizing-content"
                    onChange={(e) => update("notes", e.target.value)}
                  />
                </div>
              </div>

              <SheetFooter className="flex-row justify-end gap-4">
                <Button type="button" variant="outline" onClick={requestClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!dirty}>
                  Save changes
                </Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard your changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You've edited this task. If you close it now, those changes are
              lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={closeEditor}>
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </main>
  )
}

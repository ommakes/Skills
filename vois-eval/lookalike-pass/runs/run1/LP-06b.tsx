import * as React from "react";
import { PencilIcon, ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Status = "todo" | "in-progress" | "in-review" | "done";
type Priority = "low" | "medium" | "high";

interface Task {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  assignee: string;
  due: string; // yyyy-mm-dd
  notes: string;
}

const STATUS_LABEL: Record<Status, string> = {
  todo: "To do",
  "in-progress": "In progress",
  "in-review": "In review",
  done: "Done",
};
const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};
const ASSIGNEES = ["Amara Okafor", "Diego Ramos", "Priya Nair", "Sam Whitfield"];

const INITIAL_TASKS: Task[] = [
  { id: "t1", title: "Draft Q4 onboarding checklist", status: "in-progress", priority: "high", assignee: "Priya Nair", due: "2026-10-09", notes: "Cover workspace setup, invites, and first project." },
  { id: "t2", title: "Review pricing page copy", status: "in-review", priority: "medium", assignee: "Sam Whitfield", due: "2026-10-12", notes: "" },
  { id: "t3", title: "Fix export timeout on large projects", status: "todo", priority: "high", assignee: "Diego Ramos", due: "2026-10-08", notes: "Repro: projects with more than 5,000 tasks." },
  { id: "t4", title: "Update billing FAQ", status: "done", priority: "low", assignee: "Amara Okafor", due: "2026-10-02", notes: "" },
  { id: "t5", title: "Plan customer interview rounds", status: "todo", priority: "medium", assignee: "Priya Nair", due: "2026-10-15", notes: "Aim for 8 interviews across two segments." },
  { id: "t6", title: "Audit keyboard navigation in settings", status: "in-progress", priority: "medium", assignee: "Diego Ramos", due: "2026-10-14", notes: "" },
];

const priorityVariant = (p: Priority) =>
  p === "high" ? "destructive" : p === "medium" ? "secondary" : "outline";

const formatDue = (iso: string) =>
  iso
    ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "No date";

export default function TaskList() {
  const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS);
  const [openId, setOpenId] = React.useState<string | null>(() => {
    try {
      return new URLSearchParams(window.location.search).get("task");
    } catch {
      return null;
    }
  });
  const [draft, setDraft] = React.useState<Task | null>(null);
  const [confirmClose, setConfirmClose] = React.useState(false);
  const [pendingNav, setPendingNav] = React.useState<string | null | undefined>(undefined);

  const openTask = tasks.find((t) => t.id === openId) ?? null;
  const index = openTask ? tasks.findIndex((t) => t.id === openTask.id) : -1;
  const dirty = !!openTask && !!draft && JSON.stringify(openTask) !== JSON.stringify(draft);
  const titleInvalid = !!draft && draft.title.trim() === "";

  // Keep the open task in the URL so reload and sharing work.
  React.useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (openId) url.searchParams.set("task", openId);
      else url.searchParams.delete("task");
      window.history.replaceState(null, "", url);
    } catch {
      /* no-op */
    }
  }, [openId]);

  React.useEffect(() => {
    setDraft(openTask ? { ...openTask } : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  const goTo = (id: string | null) => {
    if (dirty) {
      setPendingNav(id);
      setConfirmClose(true);
    } else {
      setOpenId(id);
    }
  };

  const updateTask = (id: string, patch: Partial<Task>) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  // Inline edit: one low-risk value, saved on commit with Undo.
  const changeStatus = (task: Task, next: Status) => {
    if (next === task.status) return;
    const prev = task.status;
    updateTask(task.id, { status: next });
    toast.success(`Status changed to ${STATUS_LABEL[next]}`, {
      description: task.title,
      action: { label: "Undo", onClick: () => updateTask(task.id, { status: prev }) },
    });
  };

  const save = () => {
    if (!draft || titleInvalid) return;
    updateTask(draft.id, { ...draft, title: draft.title.trim() });
    toast.success("Task updated");
    setOpenId(null);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      save();
    }
  };

  const step = (dir: -1 | 1) => {
    const next = tasks[index + dir];
    if (next) goTo(next.id);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-balance">Tasks</h1>
        <p className="max-w-[65ch] text-sm text-muted-foreground text-pretty">
          Change a status right in the list, or open a task to edit everything else.
        </p>
      </header>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Task</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col">Priority</TableHead>
              <TableHead scope="col">Assignee</TableHead>
              <TableHead scope="col" className="text-right">Due</TableHead>
              <TableHead scope="col" className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task.id}
                data-state={task.id === openId ? "selected" : undefined}
                className="group cursor-pointer"
                onClick={() => goTo(task.id)}
              >
                <TableCell className="max-w-72 font-medium">
                  <button
                    type="button"
                    className="block w-full min-w-0 truncate rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    onClick={(e) => {
                      e.stopPropagation();
                      goTo(task.id);
                    }}
                  >
                    {task.title}
                  </button>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Select value={task.status} onValueChange={(v) => changeStatus(task, v as Status)}>
                    <SelectTrigger size="sm" className="w-36" aria-label={`Status for ${task.title}`}>
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
                <TableCell className="text-muted-foreground">{task.assignee}</TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  <time dateTime={task.due}>{formatDue(task.due)}</time>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${task.title}`}
                    className="opacity-100 transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100"
                    onClick={() => goTo(task.id)}
                  >
                    <PencilIcon aria-hidden="true" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet
        open={!!openTask}
        onOpenChange={(open) => {
          if (!open) goTo(null);
        }}
      >
        <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md" onKeyDown={onKeyDown}>
          {openTask && draft && (
            <>
              <SheetHeader className="gap-1 pr-12">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Previous task"
                    disabled={index <= 0}
                    onClick={() => step(-1)}
                  >
                    <ChevronUpIcon aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Next task"
                    disabled={index >= tasks.length - 1}
                    onClick={() => step(1)}
                  >
                    <ChevronDownIcon aria-hidden="true" />
                  </Button>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {index + 1} of {tasks.length}
                  </span>
                </div>
                <SheetTitle>Edit task</SheetTitle>
                <SheetDescription>Changes apply when you save.</SheetDescription>
              </SheetHeader>

              <form
                id="task-form"
                className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  save();
                }}
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="task-title">Title</Label>
                  <Input
                    id="task-title"
                    value={draft.title}
                    aria-invalid={titleInvalid}
                    aria-describedby={titleInvalid ? "task-title-error" : undefined}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  />
                  {titleInvalid && (
                    <p id="task-title-error" className="text-sm text-destructive">
                      Enter a title for this task.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="task-status">Status</Label>
                    <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as Status })}>
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
                    <Select value={draft.priority} onValueChange={(v) => setDraft({ ...draft, priority: v as Priority })}>
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

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="task-assignee">Assignee</Label>
                    <Select value={draft.assignee} onValueChange={(v) => setDraft({ ...draft, assignee: v })}>
                      <SelectTrigger id="task-assignee" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSIGNEES.map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
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
                      onChange={(e) => setDraft({ ...draft, due: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="task-notes">Notes</Label>
                  <Textarea
                    id="task-notes"
                    rows={4}
                    value={draft.notes}
                    onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                  />
                </div>
              </form>

              <SheetFooter className="flex-row justify-end gap-5 border-t">
                <Button type="button" variant="outline" onClick={() => goTo(null)}>
                  Cancel
                </Button>
                <Button type="submit" form="task-form" disabled={!dirty || titleInvalid}>
                  Save changes
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard your changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved edits to this task. If you leave now, they will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setOpenId(pendingNav ?? null);
                setPendingNav(undefined);
              }}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
}

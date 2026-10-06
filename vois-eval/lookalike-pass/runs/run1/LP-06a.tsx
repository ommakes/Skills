import * as React from "react";
import { CalendarIcon, PencilIcon } from "lucide-react";
import { toast, Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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

/* ------------------------------------------------------------------ */
/* Types and mock data                                                 */
/* ------------------------------------------------------------------ */

type Priority = "low" | "medium" | "high";

type Task = {
  id: string;
  title: string;
  assignee: string;
  due: string; // YYYY-MM-DD
  priority: Priority;
};

const TODAY = "2026-10-06";

const ASSIGNEES = [
  "Amara Okafor",
  "Daniel Reyes",
  "Priya Nair",
  "Tomas Lindqvist",
  "Yuki Tanaka",
];

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const INITIAL_TASKS: Task[] = [
  { id: "t1", title: "Draft Q4 launch announcement", assignee: "Amara Okafor", due: "2026-10-09", priority: "high" },
  { id: "t2", title: "Review onboarding survey results", assignee: "Priya Nair", due: "2026-10-14", priority: "medium" },
  { id: "t3", title: "Update billing page screenshots", assignee: "Daniel Reyes", due: "2026-10-05", priority: "low" },
  { id: "t4", title: "Fix timezone bug in reminders", assignee: "Tomas Lindqvist", due: "2026-10-08", priority: "high" },
  { id: "t5", title: "Interview three design candidates", assignee: "Yuki Tanaka", due: "2026-10-20", priority: "medium" },
  { id: "t6", title: "Archive stale support tags", assignee: "Priya Nair", due: "2026-10-30", priority: "low" },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toIso(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(iso: string): string {
  return dateFmt.format(parseDate(iso));
}

const priorityLabel = (p: Priority) => PRIORITIES.find((x) => x.value === p)!.label;

function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge variant={priority === "high" ? "default" : priority === "medium" ? "secondary" : "outline"}>
      {priorityLabel(priority)}
    </Badge>
  );
}

function DueText({ due }: { due: string }) {
  const overdue = due < TODAY;
  return (
    <span className={overdue ? "text-destructive" : undefined}>
      <time dateTime={due} className="tabular-nums">
        {formatDate(due)}
      </time>
      {overdue ? <span className="ml-2 text-xs font-medium">Overdue</span> : null}
    </span>
  );
}

/* Open row id lives in the URL so reload, back and shared links work. */
function readTaskParam(): string | null {
  try {
    return new URLSearchParams(window.location.search).get("task");
  } catch {
    return null;
  }
}

function writeTaskParam(id: string | null) {
  try {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("task", id);
    else url.searchParams.delete("task");
    window.history.pushState({}, "", url);
  } catch {
    /* previews can block history changes */
  }
}

/* ------------------------------------------------------------------ */
/* Edit drawer                                                         */
/* ------------------------------------------------------------------ */

type Draft = { title: string; assignee: string; due: string; priority: Priority };

function EditTaskSheet({
  task,
  onClose,
  onSave,
}: {
  task: Task | null;
  onClose: () => void;
  onSave: (id: string, draft: Draft) => Promise<void>;
}) {
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [titleError, setTitleError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [confirmDiscard, setConfirmDiscard] = React.useState(false);
  const [dateOpen, setDateOpen] = React.useState(false);
  const titleRef = React.useRef<HTMLInputElement>(null);

  // Reset the draft whenever a different task opens.
  React.useEffect(() => {
    if (task) {
      setDraft({ title: task.title, assignee: task.assignee, due: task.due, priority: task.priority });
      setTitleError(null);
    }
  }, [task]);

  const dirty =
    !!task &&
    !!draft &&
    (draft.title !== task.title ||
      draft.assignee !== task.assignee ||
      draft.due !== task.due ||
      draft.priority !== task.priority);

  function requestClose() {
    if (saving) return;
    if (dirty) setConfirmDiscard(true);
    else onClose();
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!task || !draft || !dirty || saving) return;
    const trimmed = draft.title.trim();
    if (!trimmed) {
      setTitleError("Enter a title for this task.");
      titleRef.current?.focus();
      return;
    }
    setSaving(true);
    try {
      await onSave(task.id, { ...draft, title: trimmed });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Sheet open={!!task} onOpenChange={(open) => (!open ? requestClose() : undefined)}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 sm:max-w-md"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void handleSubmit();
          }}
        >
          <SheetHeader className="gap-2">
            <SheetTitle>Edit task</SheetTitle>
            <SheetDescription>Changes appear in the list when you save.</SheetDescription>
          </SheetHeader>

          {draft ? (
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6" noValidate>
              <div className="flex flex-col gap-2">
                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  ref={titleRef}
                  value={draft.title}
                  aria-invalid={!!titleError}
                  aria-describedby={titleError ? "task-title-error" : undefined}
                  onChange={(e) => {
                    setDraft({ ...draft, title: e.target.value });
                    if (titleError) setTitleError(null);
                  }}
                  onBlur={() => {
                    if (!draft.title.trim()) setTitleError("Enter a title for this task.");
                  }}
                />
                {titleError ? (
                  <p id="task-title-error" role="alert" className="text-sm text-destructive">
                    {titleError}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="task-assignee">Assignee</Label>
                <Select value={draft.assignee} onValueChange={(v) => setDraft({ ...draft, assignee: v })}>
                  <SelectTrigger id="task-assignee" className="w-full">
                    <SelectValue placeholder="Choose an assignee" />
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
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="task-due"
                      type="button"
                      variant="outline"
                      className="w-full justify-start font-normal tabular-nums"
                    >
                      <CalendarIcon aria-hidden="true" />
                      {formatDate(draft.due)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={parseDate(draft.due)}
                      defaultMonth={parseDate(draft.due)}
                      onSelect={(d) => {
                        if (d) {
                          setDraft({ ...draft, due: toIso(d) });
                          setDateOpen(false);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-2">
                <Label id="task-priority-label">Priority</Label>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  aria-labelledby="task-priority-label"
                  value={draft.priority}
                  onValueChange={(v) => {
                    if (v) setDraft({ ...draft, priority: v as Priority });
                  }}
                  className="w-full"
                >
                  {PRIORITIES.map((p) => (
                    <ToggleGroupItem key={p.value} value={p.value} className="flex-1">
                      {p.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </form>
          ) : null}

          <SheetFooter className="flex-row justify-end gap-3 border-t">
            <Button type="button" variant="outline" onClick={requestClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleSubmit()} disabled={!dirty || saving}>
              {saving ? <Spinner aria-hidden="true" /> : null}
              Save changes
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard your changes?</AlertDialogTitle>
            <AlertDialogDescription>This task will keep its last saved details.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmDiscard(false);
                onClose();
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

export default function TaskList() {
  const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS);
  const [loading, setLoading] = React.useState(true);
  const [openId, setOpenId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Restore the open row from the URL, and follow back/forward.
  React.useEffect(() => {
    setOpenId(readTaskParam());
    const onPop = () => setOpenId(readTaskParam());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const openTask = tasks.find((t) => t.id === openId) ?? null;

  function open(id: string) {
    setOpenId(id);
    writeTaskParam(id);
  }

  function close() {
    setOpenId(null);
    writeTaskParam(null);
  }

  async function save(id: string, draft: Draft) {
    const previous = tasks.find((t) => t.id === id)!;
    await new Promise((r) => setTimeout(r, 500));
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...draft } : t)));
    close();
    toast.success("Task updated", {
      action: {
        label: "Undo",
        onClick: () => setTasks((prev) => prev.map((t) => (t.id === id ? previous : t))),
      },
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-balance">Tasks</h1>
        <p className="max-w-prose text-sm text-muted-foreground text-pretty">
          Select a task to edit its title, assignee, due date or priority.
        </p>
      </header>

      {/* Wide layout: real table */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Title</TableHead>
              <TableHead scope="col">Assignee</TableHead>
              <TableHead scope="col">Due date</TableHead>
              <TableHead scope="col">Priority</TableHead>
              <TableHead scope="col" className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-56" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="size-8" /></TableCell>
                  </TableRow>
                ))
              : tasks.map((task) => (
                  <TableRow
                    key={task.id}
                    data-state={task.id === openId ? "selected" : undefined}
                    className="cursor-pointer"
                    onClick={() => open(task.id)}
                  >
                    <TableCell className="font-semibold">
                      <button
                        type="button"
                        className="rounded-sm text-left hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        aria-current={task.id === openId ? "true" : undefined}
                        onClick={(e) => {
                          e.stopPropagation();
                          open(task.id);
                        }}
                      >
                        {task.title}
                      </button>
                    </TableCell>
                    <TableCell>{task.assignee}</TableCell>
                    <TableCell>
                      <DueText due={task.due} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={task.priority} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${task.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          open(task.id);
                        }}
                      >
                        <PencilIcon aria-hidden="true" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Narrow layout: stacked rows, whole row opens the task */}
      <ul className="flex flex-col divide-y rounded-lg border sm:hidden">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex flex-col gap-2 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </li>
            ))
          : tasks.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => open(task.id)}
                  aria-current={task.id === openId ? "true" : undefined}
                  className="flex w-full items-start justify-between gap-4 p-4 text-left aria-[current=true]:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                >
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="font-semibold">{task.title}</span>
                    <span className="text-sm text-muted-foreground">{task.assignee}</span>
                    <span className="text-sm text-muted-foreground">
                      <DueText due={task.due} />
                    </span>
                  </span>
                  <PriorityBadge priority={task.priority} />
                </button>
              </li>
            ))}
      </ul>

      <EditTaskSheet task={openTask} onClose={close} onSave={save} />
      <Toaster />
    </main>
  );
}

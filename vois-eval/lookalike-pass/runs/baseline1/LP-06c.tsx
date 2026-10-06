import * as React from "react";
import { PencilIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

type Priority = "low" | "medium" | "high";

interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: Priority;
  due: string;
  done: boolean;
}

const ASSIGNEES = ["Ava Chen", "Marcus Lee", "Priya Patel", "Sam Okafor"];

const INITIAL_TASKS: Task[] = [
  { id: "t1", title: "Draft Q3 roadmap", assignee: "Ava Chen", priority: "high", due: "2026-10-12", done: false },
  { id: "t2", title: "Review onboarding copy", assignee: "Marcus Lee", priority: "medium", due: "2026-10-15", done: false },
  { id: "t3", title: "Fix billing page bug", assignee: "Priya Patel", priority: "high", due: "2026-10-09", done: false },
  { id: "t4", title: "Update team handbook", assignee: "Sam Okafor", priority: "low", due: "2026-10-30", done: true },
];

const PRIORITY_VARIANT: Record<Priority, "default" | "secondary" | "destructive"> = {
  low: "secondary",
  medium: "default",
  high: "destructive",
};

function QuickEditPopover({
  task,
  onSave,
}: {
  task: Task;
  onSave: (next: Task) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Task>(task);

  React.useEffect(() => {
    if (open) setDraft(task);
  }, [open, task]);

  const titleInvalid = draft.title.trim().length === 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (titleInvalid) return;
    onSave({ ...draft, title: draft.title.trim() });
    setOpen(false);
    toast.success("Task updated");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Quick edit ${task.title}`}>
          <PencilIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium">Quick edit</h3>
            <p className="text-sm text-muted-foreground">
              Change the basics without leaving the list.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`title-${task.id}`}>Title</Label>
            <Input
              id={`title-${task.id}`}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              aria-invalid={titleInvalid}
              autoFocus
            />
            {titleInvalid && (
              <p className="text-sm text-destructive">Enter a title.</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`assignee-${task.id}`}>Assignee</Label>
            <Select
              value={draft.assignee}
              onValueChange={(v) => setDraft({ ...draft, assignee: v })}
            >
              <SelectTrigger id={`assignee-${task.id}`} className="w-full">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`priority-${task.id}`}>Priority</Label>
              <Select
                value={draft.priority}
                onValueChange={(v) =>
                  setDraft({ ...draft, priority: v as Priority })
                }
              >
                <SelectTrigger id={`priority-${task.id}`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`due-${task.id}`}>Due date</Label>
              <Input
                id={`due-${task.id}`}
                type="date"
                value={draft.due}
                onChange={(e) => setDraft({ ...draft, due: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id={`done-${task.id}`}
              checked={draft.done}
              onCheckedChange={(c) => setDraft({ ...draft, done: c === true })}
            />
            <Label htmlFor={`done-${task.id}`}>Mark as done</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={titleInvalid}>
              Save
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

export default function TaskListScreen() {
  const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS);

  function updateTask(next: Task) {
    setTasks((prev) => prev.map((t) => (t.id === next.id ? next : t)));
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">
          {tasks.filter((t) => !t.done).length} open of {tasks.length}
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell
                className={task.done ? "text-muted-foreground line-through" : "font-medium"}
              >
                {task.title}
              </TableCell>
              <TableCell>{task.assignee}</TableCell>
              <TableCell>
                <Badge variant={PRIORITY_VARIANT[task.priority]} className="capitalize">
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell>{task.due}</TableCell>
              <TableCell>
                <QuickEditPopover task={task} onSave={updateTask} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

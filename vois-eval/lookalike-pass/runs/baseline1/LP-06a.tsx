import * as React from "react";
import { CheckIcon, PencilIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";

type Priority = "low" | "medium" | "high";

interface Task {
  id: string;
  title: string;
  assignee: string;
  due: string; // yyyy-mm-dd
  priority: Priority;
}

const ASSIGNEES = ["Amara Okafor", "Ben Hartley", "Chloe Nguyen", "Diego Ramos", "Unassigned"];
const PRIORITIES: Priority[] = ["low", "medium", "high"];

const INITIAL_TASKS: Task[] = [
  { id: "t1", title: "Draft Q4 roadmap", assignee: "Amara Okafor", due: "2026-10-14", priority: "high" },
  { id: "t2", title: "Review onboarding copy", assignee: "Ben Hartley", due: "2026-10-09", priority: "medium" },
  { id: "t3", title: "Fix invoice export bug", assignee: "Diego Ramos", due: "2026-10-08", priority: "high" },
  { id: "t4", title: "Update team handbook", assignee: "Unassigned", due: "2026-10-30", priority: "low" },
  { id: "t5", title: "Schedule customer interviews", assignee: "Chloe Nguyen", due: "2026-10-20", priority: "medium" },
];

const priorityVariant: Record<Priority, "default" | "secondary" | "destructive" | "outline"> = {
  low: "outline",
  medium: "secondary",
  high: "destructive",
};

function formatDate(iso: string) {
  if (!iso) return "No date";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TaskListScreen() {
  const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<Task | null>(null);

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setDraft({ ...task });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = () => {
    if (!draft) return;
    if (!draft.title.trim()) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === draft.id ? { ...draft, title: draft.title.trim() } : t)),
    );
    toast.success("Task updated");
    cancelEdit();
  };

  const titleInvalid = draft !== null && draft.title.trim() === "";

  const onRowKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !(e.target as HTMLElement).closest("[role=combobox]")) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  return (
    <main className="mx-auto w-full max-w-4xl p-4 sm:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>Edit a task in place. Press Enter to save or Escape to cancel.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="w-24 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const isEditing = editingId === task.id && draft !== null;
                return (
                  <TableRow key={task.id} onKeyDown={isEditing ? onRowKeyDown : undefined}>
                    <TableCell className="font-medium">
                      {isEditing ? (
                        <Input
                          autoFocus
                          aria-label="Title"
                          aria-invalid={titleInvalid}
                          value={draft.title}
                          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                        />
                      ) : (
                        task.title
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={draft.assignee}
                          onValueChange={(v) => setDraft({ ...draft, assignee: v })}
                        >
                          <SelectTrigger aria-label="Assignee" className="w-full">
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
                      ) : (
                        task.assignee
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="date"
                          aria-label="Due date"
                          value={draft.due}
                          onChange={(e) => setDraft({ ...draft, due: e.target.value })}
                        />
                      ) : (
                        formatDate(task.due)
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={draft.priority}
                          onValueChange={(v) => setDraft({ ...draft, priority: v as Priority })}
                        >
                          <SelectTrigger aria-label="Priority" className="w-full capitalize">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORITIES.map((p) => (
                              <SelectItem key={p} value={p} className="capitalize">
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={priorityVariant[task.priority]} className="capitalize">
                          {task.priority}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            aria-label="Save changes"
                            disabled={titleInvalid}
                            onClick={saveEdit}
                          >
                            <CheckIcon />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            aria-label="Cancel editing"
                            onClick={cancelEdit}
                          >
                            <XIcon />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Edit ${task.title}`}
                          onClick={() => startEdit(task)}
                        >
                          <PencilIcon />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Toaster />
    </main>
  );
}

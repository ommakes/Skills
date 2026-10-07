import * as React from "react";
import { MoreHorizontal, Pencil, Copy, Archive, Trash2, ExternalLink } from "lucide-react";
import { toast, Toaster } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Status = "active" | "on-hold" | "archived";

interface Project {
  id: string;
  name: string;
  owner: string;
  status: Status;
  updated: string;
}

const INITIAL_PROJECTS: Project[] = [
  { id: "p1", name: "Website redesign", owner: "Ana Silva", status: "active", updated: "Oct 2, 2026" },
  { id: "p2", name: "Mobile app v2", owner: "Ben Carter", status: "active", updated: "Oct 1, 2026" },
  { id: "p3", name: "Billing migration", owner: "Chloe Park", status: "on-hold", updated: "Sep 24, 2026" },
  { id: "p4", name: "Q3 research study", owner: "Dev Patel", status: "archived", updated: "Sep 12, 2026" },
  { id: "p5", name: "Partner portal", owner: "Elena Rossi", status: "active", updated: "Aug 30, 2026" },
];

const STATUS_LABEL: Record<Status, string> = {
  active: "Active",
  "on-hold": "On hold",
  archived: "Archived",
};

const STATUS_VARIANT: Record<Status, "default" | "secondary" | "outline"> = {
  active: "default",
  "on-hold": "secondary",
  archived: "outline",
};

export default function ProjectsTableScreen() {
  const [projects, setProjects] = React.useState<Project[]>(INITIAL_PROJECTS);
  const [pendingDelete, setPendingDelete] = React.useState<Project | null>(null);

  function handleOpen(project: Project) {
    toast(`Opening ${project.name}`);
  }

  function handleEdit(project: Project) {
    toast(`Editing ${project.name}`);
  }

  function handleDuplicate(project: Project) {
    const copy: Project = {
      ...project,
      id: `${project.id}-copy-${Date.now()}`,
      name: `${project.name} (copy)`,
      status: "active",
    };
    setProjects((prev) => {
      const index = prev.findIndex((p) => p.id === project.id);
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
    toast.success(`Duplicated ${project.name}`);
  }

  function handleArchive(project: Project) {
    const previous = project.status;
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, status: "archived" } : p)),
    );
    toast.success(`Archived ${project.name}`, {
      action: {
        label: "Undo",
        onClick: () =>
          setProjects((prev) =>
            prev.map((p) => (p.id === project.id ? { ...p, status: previous } : p)),
          ),
      },
    });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setProjects((prev) => prev.filter((p) => p.id !== target.id));
    setPendingDelete(null);
    toast.success(`Deleted ${target.name}`);
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>
            Open, edit, duplicate, archive, or delete a project from its row menu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last updated</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No projects yet.
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.owner}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[project.status]}>
                        {STATUS_LABEL[project.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{project.updated}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Actions for ${project.name}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => handleOpen(project)}>
                            <ExternalLink className="size-4" />
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleEdit(project)}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleDuplicate(project)}>
                            <Copy className="size-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={project.status === "archived"}
                            onSelect={() => handleArchive(project)}
                          >
                            <Archive className="size-4" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setPendingDelete(project)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the project and its data. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete project</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
}

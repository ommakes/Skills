import * as React from "react";
import { MoreHorizontal, Pencil, Copy, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

type Project = {
  id: string;
  name: string;
  owner: string;
  status: "Active" | "Archived";
  updated: string;
};

const initialProjects: Project[] = [
  { id: "p1", name: "Website redesign", owner: "Ava Chen", status: "Active", updated: "2 hours ago" },
  { id: "p2", name: "Mobile app v2", owner: "Marcus Lee", status: "Active", updated: "Yesterday" },
  { id: "p3", name: "Q3 marketing campaign", owner: "Priya Nair", status: "Archived", updated: "3 weeks ago" },
  { id: "p4", name: "Billing migration", owner: "Tomas Silva", status: "Active", updated: "5 days ago" },
];

export default function ProjectsTable() {
  const [projects, setProjects] = React.useState(initialProjects);
  const [toDelete, setToDelete] = React.useState<Project | null>(null);

  const duplicate = (p: Project) =>
    setProjects((prev) => [
      ...prev,
      { ...p, id: crypto.randomUUID(), name: `${p.name} (copy)`, updated: "Just now" },
    ]);

  const archive = (p: Project) =>
    setProjects((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, status: "Archived" } : x))
    );

  const rename = (p: Project) => {
    const name = window.prompt("Rename project", p.name);
    if (name && name.trim())
      setProjects((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, name: name.trim() } : x))
      );
  };

  return (
    <div className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-10">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>{p.owner}</TableCell>
              <TableCell>
                <Badge variant={p.status === "Active" ? "default" : "secondary"}>
                  {p.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{p.updated}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`Actions for ${p.name}`}>
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => rename(p)}>
                      <Pencil /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => duplicate(p)}>
                      <Copy /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={p.status === "Archived"}
                      onSelect={() => archive(p)}
                    >
                      <Archive /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={() => setToDelete(p)}>
                      <Trash2 /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the project and can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toDelete)
                  setProjects((prev) => prev.filter((x) => x.id !== toDelete.id));
                setToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

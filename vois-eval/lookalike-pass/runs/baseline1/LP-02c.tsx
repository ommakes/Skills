import { useState } from "react";
import { MoreHorizontal, Pencil, Copy, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";

type Project = { id: string; name: string; owner: string; updated: string };

const INITIAL: Project[] = [
  { id: "p1", name: "Website redesign", owner: "Ava Chen", updated: "2 days ago" },
  { id: "p2", name: "Mobile app v2", owner: "Liam Ortiz", updated: "5 days ago" },
  { id: "p3", name: "Q3 marketing launch", owner: "Noor Haddad", updated: "1 week ago" },
  { id: "p4", name: "Billing migration", owner: "Sam Patel", updated: "3 weeks ago" },
];

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>(INITIAL);
  const [toDelete, setToDelete] = useState<Project | null>(null);

  const rename = (p: Project) => toast(`Rename "${p.name}"`);

  const duplicate = (p: Project) => {
    setProjects((prev) => [
      ...prev,
      { ...p, id: crypto.randomUUID(), name: `${p.name} (copy)`, updated: "Just now" },
    ]);
    toast.success(`Duplicated "${p.name}"`);
  };

  const archive = (p: Project) => {
    setProjects((prev) => prev.filter((x) => x.id !== p.id));
    toast.success(`Archived "${p.name}"`);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    setProjects((prev) => prev.filter((x) => x.id !== toDelete.id));
    toast.success(`Deleted "${toDelete.name}"`);
    setToDelete(null);
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-xl font-semibold">Projects</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Owner</TableHead>
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
              <TableCell>{p.updated}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Actions for ${p.name}`}
                    >
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
                    <DropdownMenuItem onSelect={() => archive(p)}>
                      <Archive /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => setToDelete(p)}
                    >
                      <Trash2 /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {toDelete?.name}?</AlertDialogTitle>
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
    </div>
  );
}

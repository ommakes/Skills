import * as React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

type Project = { id: string; name: string };
type Workspace = { id: string; name: string; members: number; projects: Project[] };

const WORKSPACE: Workspace = {
  id: "ws_01",
  name: "Acme Design",
  members: 12,
  projects: [
    { id: "p1", name: "Marketing site" },
    { id: "p2", name: "Mobile app" },
    { id: "p3", name: "Brand refresh" },
    { id: "p4", name: "Design system" },
    { id: "p5", name: "Customer portal" },
  ],
};

function deleteWorkspace(_id: string): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1200));
}

export default function DeleteWorkspaceScreen() {
  const [deleted, setDeleted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [typed, setTyped] = React.useState("");
  const [acknowledged, setAcknowledged] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const matches = typed === WORKSPACE.name;
  const canDelete = matches && acknowledged && !pending;

  function handleOpenChange(next: boolean) {
    if (pending) return;
    setOpen(next);
    if (!next) {
      setTyped("");
      setAcknowledged(false);
      setError(null);
    }
  }

  async function handleDelete() {
    if (!canDelete) return;
    setPending(true);
    setError(null);
    try {
      await deleteWorkspace(WORKSPACE.id);
      setOpen(false);
      setDeleted(true);
      toast.success(`Workspace "${WORKSPACE.name}" deleted`);
    } catch {
      setError("We couldn't delete this workspace. Try again.");
    } finally {
      setPending(false);
    }
  }

  if (deleted) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Workspace deleted</CardTitle>
            <CardDescription>
              {WORKSPACE.name} and its {WORKSPACE.projects.length} projects were permanently deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Back to workspaces</Button>
          </CardContent>
        </Card>
        <Toaster />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Workspace settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">{WORKSPACE.name}</p>

      <Card className="mt-6 border-destructive/50">
        <CardHeader>
          <CardTitle>Delete workspace</CardTitle>
          <CardDescription>
            Permanently delete this workspace and all of its projects. This can't be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setOpen(true)}>
            Delete workspace
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {WORKSPACE.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the workspace and everything in it. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">
                These {WORKSPACE.projects.length} projects will be deleted
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {WORKSPACE.projects.map((p) => (
                  <li key={p.id}>
                    <Badge variant="secondary">{p.name}</Badge>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-muted-foreground">
                {WORKSPACE.members} members will lose access.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-name">
                Type <span className="font-mono font-semibold">{WORKSPACE.name}</span> to confirm
              </Label>
              <Input
                id="confirm-name"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                disabled={pending}
                aria-invalid={typed.length > 0 && !matches}
              />
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="ack"
                checked={acknowledged}
                onCheckedChange={(v) => setAcknowledged(v === true)}
                disabled={pending}
              />
              <Label htmlFor="ack" className="text-sm font-normal leading-snug">
                I understand this can't be undone.
              </Label>
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button variant="destructive" disabled={!canDelete} onClick={handleDelete}>
              {pending && <Spinner className="mr-2" />}
              {pending ? "Deleting..." : "Delete workspace"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster />
    </main>
  );
}

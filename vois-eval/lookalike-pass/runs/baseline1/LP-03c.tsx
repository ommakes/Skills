import * as React from "react";
import { Trash2, TriangleAlert } from "lucide-react";
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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const workspace = {
  name: "Acme Design",
  slug: "acme-design",
  members: 14,
  projects: 23,
  files: 1284,
  role: "Owner" as const,
};

function deleteWorkspace(_slug: string): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1200));
}

function DeleteWorkspaceDialog({
  open,
  onOpenChange,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  const [confirmText, setConfirmText] = React.useState("");
  const [acknowledged, setAcknowledged] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setConfirmText("");
      setAcknowledged(false);
      setPending(false);
    }
  }, [open]);

  const canDelete = confirmText === workspace.name && acknowledged && !pending;

  async function handleDelete() {
    if (!canDelete) return;
    setPending(true);
    try {
      await deleteWorkspace(workspace.slug);
      toast.success(`Workspace "${workspace.name}" was deleted`);
      onOpenChange(false);
      onDeleted();
    } catch {
      toast.error("Couldn't delete the workspace. Try again.");
      setPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(o) => !pending && onOpenChange(o)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {workspace.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the workspace, its {workspace.projects}{" "}
            projects, {workspace.files.toLocaleString()} files and all member
            access. This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleDelete();
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="confirm-name">
              Type <span className="font-semibold">{workspace.name}</span> to
              confirm
            </Label>
            <Input
              id="confirm-name"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              disabled={pending}
              aria-invalid={confirmText.length > 0 && !canDelete && acknowledged}
            />
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="ack"
              checked={acknowledged}
              onCheckedChange={(v) => setAcknowledged(v === true)}
              disabled={pending}
              className="mt-0.5"
            />
            <Label htmlFor="ack" className="font-normal leading-snug">
              I understand that {workspace.members} members will lose access
              and the data can't be recovered.
            </Label>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending} autoFocus>
              Cancel
            </AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={!canDelete}>
              {pending ? (
                <>
                  <Spinner /> Deleting
                </>
              ) : (
                "Delete workspace"
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function WorkspaceSettings() {
  const [open, setOpen] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);

  if (deleted) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-muted-foreground text-sm">
          The workspace was deleted. Redirecting to your workspaces.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Workspace settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage {workspace.name} ({workspace.slug}).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            Name and URL for your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ws-name">Workspace name</Label>
            <Input id="ws-name" defaultValue={workspace.name} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ws-slug">URL slug</Label>
            <Input id="ws-slug" defaultValue={workspace.slug} />
          </div>
          <div>
            <Button>Save changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <TriangleAlert className="size-4" aria-hidden />
            Danger zone
          </CardTitle>
          <CardDescription>
            Actions here are permanent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Delete this workspace</span>
                <Badge variant="outline">{workspace.role} only</Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Removes {workspace.projects} projects and{" "}
                {workspace.files.toLocaleString()} files for all{" "}
                {workspace.members} members.
              </p>
            </div>
            <Button variant="destructive" onClick={() => setOpen(true)}>
              <Trash2 /> Delete workspace
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteWorkspaceDialog
        open={open}
        onOpenChange={setOpen}
        onDeleted={() => setDeleted(true)}
      />
    </div>
  );
}

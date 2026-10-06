import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { toast, Toaster } from "sonner";

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

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const workspace = {
  name: "Acme Studio",
  slug: "acme-studio",
  projects: 14,
  members: 9,
  files: 1280,
  recoveryDays: 30,
};

// Only owners see the danger zone (PATH-PERM-HIDE-BY-ROLE).
const currentUserRole: "owner" | "admin" | "member" = "owner";

function deleteWorkspaceRequest(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1200));
}

// ---------------------------------------------------------------------------
// Delete workspace: typed confirmation in an AlertDialog [PATH-SET-REMOVE-TYPED]
// ---------------------------------------------------------------------------

function DeleteWorkspaceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [typed, setTyped] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);
  const matches = typed === workspace.name;

  React.useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  async function handleDelete() {
    setDeleting(true);
    await deleteWorkspaceRequest();
    setDeleting(false);
    onOpenChange(false);
    toast.success("Workspace deleted");
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !deleting && onOpenChange(next)}>
      <AlertDialogContent className="sm:max-w-[var(--width-dialog-sm)]">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {workspace.name}</AlertDialogTitle>
          <AlertDialogDescription>
            This removes {workspace.projects} projects, {workspace.files.toLocaleString()} files, and
            access for {workspace.members} members. You can restore it within {workspace.recoveryDays} days.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm-workspace-name">
            Type <span className="font-semibold">{workspace.name}</span> to confirm
          </Label>
          <Input
            id="confirm-workspace-name"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            disabled={deleting}
          />
        </div>

        <AlertDialogFooter className="gap-5">
          <AlertDialogCancel disabled={deleting}>Keep workspace</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={!matches || deleting}
            onClick={handleDelete}
          >
            {deleting && <Loader2Icon className="animate-spin" aria-hidden="true" />}
            Delete workspace
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---------------------------------------------------------------------------
// Workspace settings page
// ---------------------------------------------------------------------------

export default function WorkspaceSettings() {
  const [savedName, setSavedName] = React.useState(workspace.name);
  const [name, setName] = React.useState(workspace.name);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const dirty = name.trim() !== savedName && name.trim().length > 0;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSavedName(name.trim());
    toast.success("Settings saved");
  }

  return (
    <div className="mx-auto flex w-full max-w-[var(--width-form-max)] flex-col gap-10 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Workspace</h1>
        <p className="text-sm text-muted-foreground">Manage how {savedName} appears to your team.</p>
      </header>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="flex max-w-[var(--width-field-max)] flex-col gap-2">
          <Label htmlFor="workspace-name">Workspace name</Label>
          <Input
            id="workspace-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex gap-5">
          <Button type="submit" disabled={!dirty}>
            Save changes
          </Button>
          <Button type="button" variant="ghost" disabled={!dirty} onClick={() => setName(savedName)}>
            Cancel
          </Button>
        </div>
      </form>

      {currentUserRole === "owner" && (
        <section aria-labelledby="danger-zone-heading" className="flex flex-col gap-6">
          <h2 id="danger-zone-heading" className="text-lg font-semibold text-foreground">
            Danger zone
          </h2>
          <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">Delete workspace</p>
              <p className="text-sm text-muted-foreground">
                Removes all projects, files, and member access. Only owners can do this.
              </p>
            </div>
            <Button variant="destructive" className="self-start" onClick={() => setConfirmOpen(true)}>
              Delete workspace
            </Button>
          </div>
        </section>
      )}

      <DeleteWorkspaceDialog open={confirmOpen} onOpenChange={setConfirmOpen} />
      <Toaster />
    </div>
  );
}

import { useState } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

// Mock data
const workspace = {
  name: "Northwind Studio",
  slug: "northwind",
  currentUserRole: "Owner" as "Owner" | "Admin" | "Member",
  counts: { projects: 14, members: 9, files: 2381 },
  recoveryDays: 30,
};

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b py-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
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
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const matches = typed === workspace.name;

  function handleOpenChange(next: boolean) {
    if (pending) return; // don't allow dismissing mid-request
    if (!next) setTyped("");
    onOpenChange(next);
  }

  async function handleDelete() {
    if (!matches || pending) return;
    setPending(true);
    try {
      await new Promise((r) => setTimeout(r, 1200)); // mock request
      toast.success("Workspace deleted");
      setTyped("");
      onOpenChange(false);
      onDeleted();
    } catch {
      toast.error("Couldn't delete workspace. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-[var(--width-dialog-sm,28rem)]">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {workspace.name}</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the workspace for everyone in it. You can restore it
            within {workspace.recoveryDays} days. After that it's gone for good.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">What you'll lose</p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              <li>{workspace.counts.projects} projects</li>
              <li>{workspace.counts.files.toLocaleString()} files</li>
              <li>
                Access for {workspace.counts.members} members, who are notified
              </li>
            </ul>
          </div>

          <form
            id="delete-workspace-form"
            className="flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleDelete();
            }}
          >
            <Label htmlFor="confirm-name">
              Type <span className="font-semibold">{workspace.name}</span> to
              confirm
            </Label>
            <Input
              id="confirm-name"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              disabled={pending}
            />
          </form>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Keep workspace</AlertDialogCancel>
          <Button
            type="submit"
            form="delete-workspace-form"
            variant="destructive"
            disabled={!matches || pending}
          >
            {pending && <Spinner />}
            Delete workspace
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function WorkspaceSettings() {
  const [open, setOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const canDelete = workspace.currentUserRole === "Owner";

  if (deleted) {
    return (
      <main className="mx-auto flex w-full max-w-[var(--width-form-max,40rem)] flex-col gap-4 px-4 py-16">
        <h1 className="text-2xl font-semibold">Workspace deleted</h1>
        <p className="text-muted-foreground">
          {workspace.name} is scheduled for removal. Restore it within{" "}
          {workspace.recoveryDays} days from your account.
        </p>
        <div>
          <Button variant="outline" onClick={() => setDeleted(false)}>
            Back to settings
          </Button>
        </div>
        <Toaster />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-[var(--width-form-max,40rem)] flex-col gap-10 px-4 py-10">
      <h1 className="text-2xl font-semibold">Workspace settings</h1>

      <section className="flex flex-col">
        <h2 className="text-lg font-semibold">General</h2>
        <Row title="Workspace name" description="Shown to everyone in the workspace.">
          <span className="text-sm">{workspace.name}</span>
        </Row>
        <Row title="Workspace URL" description="Used in links you share.">
          <span className="text-sm text-muted-foreground">
            app.example.com/{workspace.slug}
          </span>
        </Row>
      </section>

      {canDelete && (
        <section className="flex flex-col">
          <h2 className="text-lg font-semibold text-destructive">Danger zone</h2>
          <Row
            title="Delete workspace"
            description={`Removes all projects, files, and member access. Restorable for ${workspace.recoveryDays} days.`}
          >
            <Button variant="destructive" onClick={() => setOpen(true)}>
              Delete workspace
            </Button>
          </Row>
        </section>
      )}

      <DeleteWorkspaceDialog
        open={open}
        onOpenChange={setOpen}
        onDeleted={() => setDeleted(true)}
      />
      <Toaster />
    </main>
  );
}

import * as React from "react";
import { TriangleAlert } from "lucide-react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Toaster } from "@/components/ui/sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

type Workspace = {
  id: string;
  name: string;
  role: "owner" | "admin" | "member";
  projectCount: number;
  memberCount: number;
  fileCount: number;
};

const WORKSPACE: Workspace = {
  id: "ws_01",
  name: "Acme Design",
  role: "owner",
  projectCount: 14,
  memberCount: 8,
  fileCount: 312,
};

const OTHER_WORKSPACES = ["Acme Engineering", "Personal"];

// Stand-in for the real API call.
function deleteWorkspace(_id: string): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1400));
}

/* ------------------------------------------------------------------ */
/* Delete confirmation (PATH-D + PATH-SET-REMOVE-TYPED)                */
/* ------------------------------------------------------------------ */

function DeleteWorkspaceDialog({
  workspace,
  open,
  onOpenChange,
  onDeleted,
}: {
  workspace: Workspace;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  const [typed, setTyped] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const inputId = React.useId();
  const errorId = React.useId();
  const matches = typed === workspace.name;

  // Reset every time the dialog closes so a reopen starts clean.
  React.useEffect(() => {
    if (!open) {
      setTyped("");
      setError(null);
      setPending(false);
    }
  }, [open]);

  async function handleDelete(event: React.MouseEvent) {
    // Keep the dialog open until the request finishes.
    event.preventDefault();
    if (!matches || pending) return;
    setPending(true);
    setError(null);
    try {
      await deleteWorkspace(workspace.id);
      onOpenChange(false);
      onDeleted();
    } catch {
      setError("We couldn't delete this workspace. Check your connection and try again.");
      setPending(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      // Block dismissal while the request is in flight.
      onOpenChange={(next) => {
        if (!pending) onOpenChange(next);
      }}
    >
      <AlertDialogContent className="max-w-[min(var(--width-dialog-sm),calc(100%-2rem))] gap-6">
        <AlertDialogHeader className="gap-3">
          <AlertDialogTitle className="text-balance">
            Delete {workspace.name}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-pretty">
            This deletes the workspace and everything in it right away. You
            can't undo this.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">
            You'll lose permanently
          </p>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
            <li>
              <span className="tabular-nums">{workspace.projectCount}</span>{" "}
              projects
            </li>
            <li>
              <span className="tabular-nums">{workspace.fileCount}</span> files
            </li>
            <li>
              Access for{" "}
              <span className="tabular-nums">{workspace.memberCount}</span>{" "}
              members
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            We can't restore a deleted workspace.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={inputId}>
            Type <span className="font-mono font-semibold">{workspace.name}</span>{" "}
            to confirm
          </Label>
          <Input
            id={inputId}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={pending}
            aria-describedby={error ? errorId : undefined}
            className="max-w-[var(--width-field-max)] max-sm:max-w-none"
          />
          {error && (
            <p
              id={errorId}
              role="alert"
              className="flex items-start gap-2 text-sm text-destructive"
            >
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0"
              />
              <span>Error: {error}</span>
            </p>
          )}
        </div>

        <AlertDialogFooter className="gap-5 max-sm:flex-col-reverse">
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!matches || pending}
            className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/40"
          >
            {pending && <Spinner aria-hidden="true" />}
            {pending ? "Deleting workspace…" : "Delete workspace"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ------------------------------------------------------------------ */
/* Settings page with Danger zone (PATH-A + PATH-SET-DANGER-ZONE)      */
/* ------------------------------------------------------------------ */

function WorkspaceSettings({
  workspace,
  onDeleted,
}: {
  workspace: Workspace;
  onDeleted: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const isOwner = workspace.role === "owner";

  return (
    <main className="mx-auto flex w-full max-w-[var(--width-form-max)] flex-col gap-10 px-4 py-10">
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{workspace.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-semibold text-balance">
          Workspace settings
        </h1>
      </div>

      <section aria-labelledby="general-heading" className="flex flex-col gap-6">
        <h2 id="general-heading" className="text-lg font-semibold">
          General
        </h2>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ws-name">Workspace name</Label>
          <Input
            id="ws-name"
            defaultValue={workspace.name}
            className="max-w-[var(--width-field-max)] max-sm:max-w-none"
          />
        </div>
      </section>

      {/* Hidden from non-owners: they have no path to this action. */}
      {isOwner && (
        <section
          aria-labelledby="danger-heading"
          className="flex flex-col gap-6"
        >
          <h2
            id="danger-heading"
            className="text-lg font-semibold text-destructive"
          >
            Danger zone
          </h2>
          <div className="flex items-center justify-between gap-6 border-t border-border pt-6 max-sm:flex-col max-sm:items-start">
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-sm font-medium">Delete this workspace</p>
              <p className="max-w-[65ch] text-sm text-muted-foreground text-pretty">
                Permanently removes the workspace and all{" "}
                <span className="tabular-nums">{workspace.projectCount}</span>{" "}
                of its projects. You can't undo this.
              </p>
            </div>
            <Button
              variant="destructive"
              className="shrink-0"
              onClick={() => setOpen(true)}
            >
              Delete workspace
            </Button>
          </div>
        </section>
      )}

      <DeleteWorkspaceDialog
        workspace={workspace}
        open={open}
        onOpenChange={setOpen}
        onDeleted={onDeleted}
      />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Screen shown after deletion                                         */
/* ------------------------------------------------------------------ */

function AfterDelete({ onReset }: { onReset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-[var(--width-form-max)] flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold text-balance">Your workspaces</h1>
      <ul className="flex flex-col divide-y divide-border border-y border-border">
        {OTHER_WORKSPACES.map((name) => (
          <li key={name} className="py-3 text-sm">
            {name}
          </li>
        ))}
      </ul>
      {/* Prototype helper only. */}
      <div>
        <Button variant="outline" onClick={onReset}>
          Restore demo
        </Button>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

export default function DeleteWorkspaceScreen() {
  const [deleted, setDeleted] = React.useState(false);

  function handleDeleted() {
    setDeleted(true);
    toast.success(`${WORKSPACE.name} deleted`);
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      {deleted ? (
        <AfterDelete onReset={() => setDeleted(false)} />
      ) : (
        <WorkspaceSettings workspace={WORKSPACE} onDeleted={handleDeleted} />
      )}
      <Toaster />
    </div>
  );
}

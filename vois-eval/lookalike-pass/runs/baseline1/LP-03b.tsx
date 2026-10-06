import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

const workspace = {
  name: "Acme Design",
  slug: "acme-design",
  plan: "Team",
  members: 14,
  projects: 38,
  createdAt: "Mar 12, 2024",
}

export default function WorkspaceSettings() {
  const [open, setOpen] = React.useState(false)
  const [confirmText, setConfirmText] = React.useState("")
  const [deleting, setDeleting] = React.useState(false)

  const matches = confirmText === workspace.slug

  async function handleDelete() {
    if (!matches) return
    setDeleting(true)
    await new Promise((r) => setTimeout(r, 1200))
    setDeleting(false)
    setOpen(false)
    setConfirmText("")
    toast.success(`Workspace "${workspace.name}" was deleted.`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your workspace preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Basic details about this workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ws-name">Workspace name</Label>
            <Input id="ws-name" defaultValue={workspace.name} />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{workspace.plan}</Badge>
            <span>Created {workspace.createdAt}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => toast.success("Settings saved.")}>Save changes</Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Delete workspace</CardTitle>
          <CardDescription>
            Permanently delete this workspace, including its {workspace.projects}{" "}
            projects and data for {workspace.members} members. This action cannot
            be undone.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="destructive" onClick={() => setOpen(true)}>
            Delete workspace
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog
        open={open}
        onOpenChange={(o) => {
          if (deleting) return
          setOpen(o)
          if (!o) setConfirmText("")
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {workspace.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the workspace, all projects, and remove
              access for every member. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="confirm">
              Type <span className="font-mono font-semibold">{workspace.slug}</span>{" "}
              to confirm
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={!matches || deleting}
              onClick={handleDelete}
            >
              {deleting && <Spinner />}
              Delete workspace
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

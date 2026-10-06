import { useState } from "react"
import { CheckIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toaster } from "@/components/ui/sonner"

// Inline mock data
const initialSettings = {
  workspaceName: "Northwind Studio",
  supportEmail: "support@northwind.example",
}

export default function SettingsPage() {
  const [saved, setSaved] = useState(initialSettings)
  const [values, setValues] = useState(initialSettings)
  const [cardOpen, setCardOpen] = useState(true)

  // [PATH-SET-SAVE-EXPLICIT] Save stays disabled until something changed and values are valid.
  const isDirty =
    values.workspaceName !== saved.workspaceName ||
    values.supportEmail !== saved.supportEmail
  const isValid =
    values.workspaceName.trim().length > 0 &&
    /^\S+@\S+\.\S+$/.test(values.supportEmail)

  function handleSave() {
    setSaved(values)
    // Toast: sentence case, past participle, no period. Auto-dismisses after 3s.
    toast.success("Settings saved", { duration: 3000 })
  }

  return (
    <main className="mx-auto w-full max-w-(--width-form-max) px-4 py-10 sm:px-6">
      {/* Transient confirmation at the top of the screen, announced politely */}
      <Toaster position="top-center" />

      {cardOpen ? (
        <Card className="relative">
          <CardHeader>
            <div className="flex items-center gap-2 pr-10">
              <CardTitle asChild>
                <h1>Workspace settings</h1>
              </CardTitle>
              {/* Status label, non-interactive: neutral Badge, text carries the meaning */}
              <Badge variant="secondary">Beta</Badge>
            </div>
            <CardDescription>
              Basic details your team sees across the workspace.
            </CardDescription>

            {/* Dismiss is a quiet icon Button, not red: red would read as destructive. */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Dismiss settings card"
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              onClick={() => setCardOpen(false)}
            >
              <XIcon aria-hidden="true" />
            </Button>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="workspace-name">Workspace name</Label>
              <Input
                id="workspace-name"
                value={values.workspaceName}
                onChange={(e) =>
                  setValues((v) => ({ ...v, workspaceName: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="support-email">Support email</Label>
              <Input
                id="support-email"
                type="email"
                value={values.supportEmail}
                onChange={(e) =>
                  setValues((v) => ({ ...v, supportEmail: e.target.value }))
                }
              />
            </div>
          </CardContent>

          <CardFooter className="justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={!isDirty}
              onClick={() => setValues(saved)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!isDirty || !isValid}
              onClick={handleSave}
            >
              <CheckIcon aria-hidden="true" />
              Save changes
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted-foreground">
            The settings card is hidden.
          </p>
          <Button variant="outline" onClick={() => setCardOpen(true)}>
            Show settings
          </Button>
        </div>
      )}
    </main>
  )
}

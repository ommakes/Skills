import * as React from "react"
import { Toaster, toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const MOCK_PROFILE = {
  name: "Avery Chen",
  email: "avery.chen@example.com",
  role: "Product Designer",
}

export default function ProfileScreen() {
  const [profile, setProfile] = React.useState(MOCK_PROFILE)
  const [saving, setSaving] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    toast.success("Profile saved", { duration: 4000 })
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium">
              Name
              <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Email
              <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Role
              <Input value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} />
            </label>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
      <Toaster />
    </div>
  )
}

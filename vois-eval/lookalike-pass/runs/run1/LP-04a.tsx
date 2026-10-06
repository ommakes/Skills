import * as React from "react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

const initialProfile = {
  name: "Maya Okafor",
  email: "maya@example.com",
  role: "Product designer",
}

export default function ProfileScreen() {
  const [profile, setProfile] = React.useState(initialProfile)
  const [saving, setSaving] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800)) // mock save
    setSaving(false)
    // Transient, no response needed: toast that auto-dismisses.
    toast.success("Profile updated", { duration: 4000 })
  }

  const update =
    (key: keyof typeof initialProfile) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setProfile((p) => ({ ...p, [key]: e.target.value }))

  return (
    <main className="mx-auto w-full max-w-lg p-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={profile.name} onChange={update("name")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={profile.email} onChange={update("email")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="role">Role</Label>
          <Input id="role" value={profile.role} onChange={update("role")} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving && <Spinner />}
            Save changes
          </Button>
        </div>
      </form>
      <Toaster />
    </main>
  )
}

import * as React from "react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

const initialProfile = {
  name: "Priya Raman",
  email: "priya@example.com",
  title: "Product designer",
}

export default function ProfileForm() {
  const [values, setValues] = React.useState(initialProfile)
  const [saving, setSaving] = React.useState(false)

  const onChange =
    (key: keyof typeof initialProfile) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 600)) // mock save
      toast.success("Profile saved")
    } catch {
      toast.error("Couldn't save your profile. Try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md p-6">
      <h1 className="text-xl font-semibold text-foreground">Profile</h1>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={values.name} onChange={onChange("name")} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={values.email} onChange={onChange("email")} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Job title</Label>
          <Input id="title" value={values.title} onChange={onChange("title")} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving && <Spinner />}
            Save changes
          </Button>
        </div>
      </form>
      <Toaster />
    </div>
  )
}

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const account = {
  name: "Jordan Lee",
  email: "jordan.lee@example.com",
  plan: "Pro",
  memberSince: "March 2023",
};

export default function AccountPage() {
  const [open, setOpen] = React.useState(false);

  function handleDelete() {
    // Mock deletion
    toast.success("Account deleted");
    setOpen(false);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and account settings.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{account.name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{account.email}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span>{account.plan}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Member since</span><span>{account.memberSince}</span></div>
        </CardContent>
      </Card>

      <section aria-labelledby="danger-zone" className="mt-auto">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle id="danger-zone" className="text-destructive">Danger zone</CardTitle>
            <CardDescription>
              Deleting your account permanently removes your data. This cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="lg" className="w-full">
                  Delete account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure? This will permanently delete your account and all associated
                    data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Member = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member" | "Viewer";
  status: "Active" | "Invited";
};

const MEMBERS: Member[] = [
  { id: "1", name: "Ada Lovelace", email: "ada@example.com", role: "Owner", status: "Active" },
  { id: "2", name: "Grace Hopper", email: "grace@example.com", role: "Admin", status: "Active" },
  { id: "3", name: "Alan Turing", email: "alan@example.com", role: "Member", status: "Active" },
  { id: "4", name: "Margaret Hamilton", email: "margaret@example.com", role: "Member", status: "Invited" },
  { id: "5", name: "Linus Torvalds", email: "linus@example.com", role: "Viewer", status: "Active" },
  { id: "6", name: "Barbara Liskov", email: "barbara@example.com", role: "Member", status: "Active" },
];

const SKELETON_ROWS = 6;

function useMembers() {
  const [members, setMembers] = React.useState<Member[] | null>(null);
  React.useEffect(() => {
    const t = setTimeout(() => setMembers(MEMBERS), 1500);
    return () => clearTimeout(t);
  }, []);
  return members;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

function RowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="ml-auto h-8 w-16" />
      </TableCell>
    </TableRow>
  );
}

export default function MembersPage() {
  const members = useMembers();
  const loading = members === null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
          <p className="text-sm text-muted-foreground">
            Manage who has access to this workspace.
          </p>
        </div>
        <Button disabled={loading}>Invite member</Button>
      </header>

      <Input
        placeholder="Search members"
        aria-label="Search members"
        disabled={loading}
        className="max-w-sm"
      />

      <div
        className="rounded-lg border"
        aria-busy={loading}
        aria-live="polite"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead className="w-28">Role</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-24 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                <span className="sr-only">Loading members</span>
                {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <RowSkeleton key={i} />
                ))}
              </>
            ) : (
              members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback>{initials(m.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{m.role}</TableCell>
                  <TableCell>
                    <Badge variant={m.status === "Active" ? "secondary" : "outline"}>
                      {m.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

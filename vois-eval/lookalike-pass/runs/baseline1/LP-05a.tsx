import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  role: string;
  status: "Active" | "Invited";
};

const MOCK_MEMBERS: Member[] = [
  { id: "1", name: "Ava Thompson", email: "ava@example.com", role: "Owner", status: "Active" },
  { id: "2", name: "Liam Chen", email: "liam@example.com", role: "Admin", status: "Active" },
  { id: "3", name: "Sofia Alvarez", email: "sofia@example.com", role: "Editor", status: "Invited" },
  { id: "4", name: "Noah Patel", email: "noah@example.com", role: "Viewer", status: "Active" },
];

function useMembers() {
  const [members, setMembers] = React.useState<Member[] | null>(null);
  React.useEffect(() => {
    const t = setTimeout(() => setMembers(MOCK_MEMBERS), 1500);
    return () => clearTimeout(t);
  }, []);
  return { members, isLoading: members === null };
}

function MemberListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading team members</span>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-full" />
                  <div className="space-y-2">
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MemberTable({ members }: { members: Member[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((m) => (
          <TableRow key={m.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {m.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </div>
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-sm text-muted-foreground">{m.email}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>{m.role}</TableCell>
            <TableCell>
              <Badge variant={m.status === "Active" ? "default" : "secondary"}>{m.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function TeamMembersPage() {
  const { members, isLoading } = useMembers();

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>Team members</CardTitle>
            <CardDescription>Manage who has access to this workspace.</CardDescription>
          </div>
          <Button disabled={isLoading}>Invite member</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search members"
            aria-label="Search members"
            disabled={isLoading}
            className="max-w-sm"
          />
          {isLoading ? <MemberListSkeleton /> : <MemberTable members={members} />}
        </CardContent>
      </Card>
    </div>
  );
}

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Member = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Member" | "Viewer";
  status: "Active" | "Pending";
};

const MEMBERS: Member[] = [
  { id: "1", name: "Priya Raman", email: "priya@acme.co", role: "Admin", status: "Active" },
  { id: "2", name: "Tomas Berg", email: "tomas@acme.co", role: "Member", status: "Active" },
  { id: "3", name: "Aisha Okafor", email: "aisha@acme.co", role: "Member", status: "Pending" },
  { id: "4", name: "Lena Fischer", email: "lena@acme.co", role: "Viewer", status: "Active" },
  { id: "5", name: "Marco Silva", email: "marco@acme.co", role: "Member", status: "Active" },
  { id: "6", name: "Hana Kim", email: "hana@acme.co", role: "Admin", status: "Active" },
  { id: "7", name: "Jonas Weber", email: "jonas@acme.co", role: "Viewer", status: "Pending" },
];

type LoadState = "loading" | "ready" | "error";

// Mock request. The first call can fail so the error state is reachable.
function fetchMembers(role: string, query: string, ms = 1200): Promise<Member[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        MEMBERS.filter(
          (m) =>
            (role === "all" || m.role === role) &&
            (m.name + m.email).toLowerCase().includes(query.toLowerCase()),
        ),
      );
    }, ms);
  });
}

// Column widths are shared by the loaded rows and the skeleton rows,
// so nothing shifts when data arrives.
const COLS = {
  name: "w-[28%]",
  email: "w-[34%]",
  role: "w-[16%]",
  status: "w-[14%]",
  actions: "w-[8%]",
};

function SkeletonRows({ count }: { count: number }) {
  // Vary bar widths a little so it reads as content, not a grid.
  const nameW = ["w-32", "w-28", "w-36", "w-24", "w-32"];
  const emailW = ["w-44", "w-40", "w-48", "w-36", "w-44"];
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent">
          <TableCell className={COLS.name}>
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className={`h-4 ${nameW[i % nameW.length]}`} />
            </div>
          </TableCell>
          <TableCell className={COLS.email}>
            <Skeleton className={`h-4 ${emailW[i % emailW.length]}`} />
          </TableCell>
          <TableCell className={COLS.role}>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell className={COLS.status}>
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell className={COLS.actions} />
        </TableRow>
      ))}
    </>
  );
}

export default function MembersPage() {
  const [state, setState] = React.useState<LoadState>("loading");
  const [members, setMembers] = React.useState<Member[]>([]);
  const [refetching, setRefetching] = React.useState(false);
  const [role, setRole] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [attempt, setAttempt] = React.useState(0);
  const hasLoaded = React.useRef(false);

  React.useEffect(() => {
    const t = setTimeout(() => setQuery(debounced), 250);
    return () => clearTimeout(t);
  }, [debounced]);

  React.useEffect(() => {
    let cancelled = false;
    if (hasLoaded.current) setRefetching(true);
    else setState("loading");

    fetchMembers(role, query, hasLoaded.current ? 500 : 1400).then((rows) => {
      if (cancelled) return;
      // Simulate a failed first request so Retry is demonstrable.
      if (!hasLoaded.current && attempt === 0) {
        setState("error");
        return;
      }
      setMembers(rows);
      setState("ready");
      setRefetching(false);
      hasLoaded.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, [role, query, attempt]);

  const showSkeleton = state === "loading";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Members</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            People who can access this workspace.
          </p>
        </div>
        <Button>Invite member</Button>
      </header>

      {/* Toolbar stays mounted in every state so filters survive a failed load. */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Input
          type="search"
          aria-label="Search members"
          placeholder="Search by name or email"
          className="w-full sm:max-w-xs"
          value={debounced}
          onChange={(e) => setDebounced(e.target.value)}
        />
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-full sm:w-40" aria-label="Filter by role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Member">Member</SelectItem>
            <SelectItem value="Viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <div
          className="flex h-5 items-center gap-2 text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          {refetching && (
            <>
              <Spinner className="size-4" />
              <span>Updating…</span>
            </>
          )}
        </div>
      </div>

      <div
        className="mt-4 overflow-hidden rounded-lg border"
        aria-busy={showSkeleton || refetching}
      >
        <Table className="table-fixed">
          {/* Real headers render immediately, even while loading. */}
          <TableHeader>
            <TableRow>
              <TableHead className={COLS.name}>Name</TableHead>
              <TableHead className={COLS.email}>Email</TableHead>
              <TableHead className={COLS.role}>Role</TableHead>
              <TableHead className={COLS.status}>Status</TableHead>
              <TableHead className={COLS.actions}>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody
            className={
              refetching
                ? "opacity-60 transition-opacity duration-200 motion-reduce:transition-none"
                : "transition-opacity duration-200 motion-reduce:transition-none"
            }
          >
            {showSkeleton && (
              <>
                <SkeletonRows count={6} />
              </>
            )}

            {state === "ready" &&
              members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className={COLS.name}>
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium"
                      >
                        {m.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")}
                      </span>
                      <span className="truncate font-medium">{m.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className={`${COLS.email} truncate text-muted-foreground`}>
                    {m.email}
                  </TableCell>
                  <TableCell className={COLS.role}>{m.role}</TableCell>
                  <TableCell className={COLS.status}>
                    <Badge variant={m.status === "Active" ? "secondary" : "outline"}>
                      {m.status}
                    </Badge>
                  </TableCell>
                  <TableCell className={`${COLS.actions} text-right`}>
                    <Button variant="ghost" size="sm" aria-label={`Actions for ${m.name}`}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

            {state === "ready" && members.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="h-40 text-center">
                  <p className="font-medium">No members match these filters.</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setRole("all");
                      setDebounced("");
                    }}
                  >
                    Clear filters
                  </Button>
                </TableCell>
              </TableRow>
            )}

            {state === "error" && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="h-56 text-center">
                  <p role="alert" className="font-medium">
                    We couldn’t load your members.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Check your connection and try again.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setState("loading");
                      setAttempt((a) => a + 1);
                    }}
                  >
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showSkeleton && <span className="sr-only">Loading members…</span>}
    </main>
  );
}

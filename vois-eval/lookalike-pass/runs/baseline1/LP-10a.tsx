import * as React from "react";
import { Folder, File as FileIcon, ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Node = {
  id: string;
  name: string;
  kind: "folder" | "file";
  size?: string;
  modified: string;
  children?: Node[];
};

const ROOT: Node = {
  id: "root",
  name: "Drive",
  kind: "folder",
  modified: "Today",
  children: [
    {
      id: "projects",
      name: "Projects",
      kind: "folder",
      modified: "Oct 4",
      children: [
        {
          id: "apollo",
          name: "Apollo",
          kind: "folder",
          modified: "Oct 3",
          children: [
            {
              id: "design",
              name: "Design",
              kind: "folder",
              modified: "Oct 2",
              children: [
                {
                  id: "exports",
                  name: "Exports",
                  kind: "folder",
                  modified: "Oct 1",
                  children: [
                    {
                      id: "final",
                      name: "Final",
                      kind: "folder",
                      modified: "Sep 30",
                      children: [
                        { id: "f1", name: "hero.png", kind: "file", size: "2.4 MB", modified: "Sep 30" },
                        { id: "f2", name: "logo.svg", kind: "file", size: "12 KB", modified: "Sep 29" },
                      ],
                    },
                    { id: "f3", name: "draft.png", kind: "file", size: "1.8 MB", modified: "Sep 28" },
                  ],
                },
                { id: "f4", name: "wireframes.fig", kind: "file", size: "8.1 MB", modified: "Oct 2" },
              ],
            },
            { id: "f5", name: "brief.pdf", kind: "file", size: "420 KB", modified: "Oct 1" },
          ],
        },
        { id: "f6", name: "roadmap.xlsx", kind: "file", size: "96 KB", modified: "Oct 4" },
      ],
    },
    {
      id: "personal",
      name: "Personal",
      kind: "folder",
      modified: "Sep 12",
      children: [{ id: "f7", name: "notes.txt", kind: "file", size: "3 KB", modified: "Sep 12" }],
    },
    { id: "f8", name: "readme.md", kind: "file", size: "1 KB", modified: "Aug 20" },
  ],
};

function findPath(node: Node, id: string, trail: Node[] = []): Node[] | null {
  const next = [...trail, node];
  if (node.id === id) return next;
  for (const c of node.children ?? []) {
    const r = findPath(c, id, next);
    if (r) return r;
  }
  return null;
}

export default function FileBrowser() {
  const [currentId, setCurrentId] = React.useState("final");
  const path = findPath(ROOT, currentId) ?? [ROOT];
  const current = path[path.length - 1];

  // Collapse middle crumbs into an ellipsis menu when the path is deep.
  const MAX_VISIBLE = 4;
  const collapsed = path.length > MAX_VISIBLE;
  const head = collapsed ? [path[0]] : path.slice(0, -1);
  const hidden = collapsed ? path.slice(1, path.length - (MAX_VISIBLE - 2)) : [];
  const tail = collapsed ? path.slice(path.length - (MAX_VISIBLE - 2), -1) : [];

  const crumb = (n: Node) => (
    <React.Fragment key={n.id}>
      <BreadcrumbItem>
        <BreadcrumbLink asChild>
          <button type="button" onClick={() => setCurrentId(n.id)}>
            {n.name}
          </button>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
    </React.Fragment>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <nav aria-label="Folder path">
        <Breadcrumb>
          <BreadcrumbList>
            {head.map(crumb)}
            {collapsed && (
              <>
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger aria-label="Show hidden folders">
                      <BreadcrumbEllipsis />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {hidden.map((n) => (
                        <DropdownMenuItem key={n.id} onSelect={() => setCurrentId(n.id)}>
                          {n.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {tail.map(crumb)}
            <BreadcrumbItem>
              <BreadcrumbPage>{current.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </nav>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Modified</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(current.children ?? []).map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                {c.kind === "folder" ? (
                  <button
                    type="button"
                    className="flex items-center gap-2 hover:underline"
                    onClick={() => setCurrentId(c.id)}
                  >
                    <Folder className="size-4" aria-hidden />
                    {c.name}
                    <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
                  </button>
                ) : (
                  <span className="flex items-center gap-2">
                    <FileIcon className="size-4" aria-hidden />
                    {c.name}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">{c.size ?? "--"}</TableCell>
              <TableCell className="text-muted-foreground">{c.modified}</TableCell>
            </TableRow>
          ))}
          {(current.children ?? []).length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                This folder is empty.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

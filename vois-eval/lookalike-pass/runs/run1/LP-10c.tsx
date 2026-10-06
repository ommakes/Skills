import * as React from "react";
import { FileText, Folder } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
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

type Crumb = { id: string; name: string };
type Entry = { id: string; name: string; kind: "folder" | "file"; modified: string };

const rootPath: Crumb[] = [
  { id: "root", name: "All files" },
  { id: "marketing", name: "Marketing" },
  { id: "campaigns", name: "Campaigns" },
  { id: "2026", name: "2026" },
  { id: "q4-launch", name: "Q4 launch" },
];

const entries: Entry[] = [
  { id: "1", name: "Creative", kind: "folder", modified: "Oct 2, 2026" },
  { id: "2", name: "Press", kind: "folder", modified: "Sep 28, 2026" },
  { id: "3", name: "Launch brief.docx", kind: "file", modified: "Oct 1, 2026" },
  { id: "4", name: "Budget.xlsx", kind: "file", modified: "Sep 24, 2026" },
];

const MAX_VISIBLE = 4;

export default function FolderView() {
  const [path, setPath] = React.useState<Crumb[]>(rootPath);

  const goTo = (index: number) => setPath((p) => p.slice(0, index + 1));

  const current = path[path.length - 1];
  const collapsed = path.length > MAX_VISIBLE;
  // When long: first crumb, ellipsis menu for the middle, then the last two.
  const hidden = collapsed ? path.slice(1, path.length - 2) : [];
  const tail = collapsed ? path.slice(path.length - 2) : path.slice(1);
  const first = path[0];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              {path.length === 1 ? (
                <BreadcrumbPage>{first.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(0);
                  }}
                >
                  {first.name}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>

            {hidden.length > 0 && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="flex items-center gap-1"
                      aria-label="Show hidden folders"
                    >
                      <BreadcrumbEllipsis />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {hidden.map((c, i) => (
                        <DropdownMenuItem key={c.id} onSelect={() => goTo(i + 1)}>
                          {c.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
              </>
            )}

            {tail.map((c) => {
              const index = path.findIndex((p) => p.id === c.id);
              const isLast = index === path.length - 1;
              return (
                <React.Fragment key={c.id}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{c.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          goTo(index);
                        }}
                      >
                        {c.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-balance text-2xl font-semibold text-foreground">
          {current.name}
        </h1>
      </header>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="w-48">Modified</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((e) => (
            <TableRow key={e.id}>
              <TableCell>
                <span className="flex items-center gap-2">
                  {e.kind === "folder" ? (
                    <Folder className="size-4 text-muted-foreground" aria-hidden />
                  ) : (
                    <FileText className="size-4 text-muted-foreground" aria-hidden />
                  )}
                  {e.name}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{e.modified}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import * as React from "react"
import { FileText, Folder, FolderOpen, Search } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Node = {
  id: string
  name: string
  kind: "folder" | "file"
  parentId: string | null
  modified: string
  size?: string
}

const ROOT = "root"

const NODES: Node[] = [
  { id: ROOT, name: "All files", kind: "folder", parentId: null, modified: "" },
  { id: "f-clients", name: "Clients", kind: "folder", parentId: ROOT, modified: "Sep 28, 2026" },
  { id: "f-internal", name: "Internal", kind: "folder", parentId: ROOT, modified: "Oct 2, 2026" },
  { id: "f-acme", name: "Acme Corp", kind: "folder", parentId: "f-clients", modified: "Sep 30, 2026" },
  { id: "f-globex", name: "Globex", kind: "folder", parentId: "f-clients", modified: "Sep 12, 2026" },
  { id: "f-2026", name: "2026 renewal", kind: "folder", parentId: "f-acme", modified: "Oct 1, 2026" },
  { id: "f-2025", name: "2025", kind: "folder", parentId: "f-acme", modified: "Jan 14, 2026" },
  { id: "f-contracts", name: "Contracts", kind: "folder", parentId: "f-2026", modified: "Oct 1, 2026" },
  { id: "f-drafts", name: "Drafts", kind: "folder", parentId: "f-contracts", modified: "Sep 29, 2026" },
  { id: "f-signed", name: "Signed", kind: "folder", parentId: "f-contracts", modified: "Sep 25, 2026" },
  { id: "d1", name: "Master services agreement v3.pdf", kind: "file", parentId: "f-drafts", modified: "Sep 29, 2026", size: "412 KB" },
  { id: "d2", name: "Pricing addendum.docx", kind: "file", parentId: "f-drafts", modified: "Sep 27, 2026", size: "88 KB" },
  { id: "d3", name: "Order form 2026.pdf", kind: "file", parentId: "f-signed", modified: "Sep 25, 2026", size: "230 KB" },
  { id: "d4", name: "Renewal brief.docx", kind: "file", parentId: "f-2026", modified: "Oct 1, 2026", size: "64 KB" },
  { id: "d5", name: "Kickoff notes.md", kind: "file", parentId: "f-2025", modified: "Jan 14, 2026", size: "9 KB" },
  { id: "d6", name: "Brand guidelines.pdf", kind: "file", parentId: "f-internal", modified: "Oct 2, 2026", size: "3.1 MB" },
]

const byId = new Map(NODES.map((n) => [n.id, n]))

function pathTo(id: string): Node[] {
  const out: Node[] = []
  let cur: Node | undefined = byId.get(id)
  while (cur) {
    out.unshift(cur)
    cur = cur.parentId ? byId.get(cur.parentId) : undefined
  }
  return out
}

function childrenOf(id: string) {
  return NODES.filter((n) => n.parentId === id).sort((a, b) =>
    a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === "folder" ? -1 : 1,
  )
}

function countLabel(id: string) {
  const n = childrenOf(id).length
  return n === 1 ? "1 item" : `${n} items`
}

export default function FolderBrowser() {
  const [currentId, setCurrentId] = React.useState("f-drafts")
  const [query, setQuery] = React.useState("")

  const path = pathTo(currentId)
  const current = path[path.length - 1]
  const parent = path.length > 1 ? path[path.length - 2] : null

  const open = (id: string) => {
    setCurrentId(id)
    setQuery("")
  }

  const all = childrenOf(currentId)
  const rows = all.filter((n) => n.name.toLowerCase().includes(query.trim().toLowerCase()))

  // Keep the root, the parent and the current folder visible. Collapse the rest.
  const MAX_VISIBLE = 4
  const collapsed = path.length > MAX_VISIBLE
  const hidden = collapsed ? path.slice(1, path.length - 2) : []
  const shown = collapsed ? [path[0], ...path.slice(path.length - 2)] : path

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 bg-background p-4 text-foreground sm:p-6">
      <header className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList className="flex-nowrap">
            {shown.map((node, i) => {
              const isLast = i === shown.length - 1
              return (
                <React.Fragment key={node.id}>
                  <BreadcrumbItem className="min-w-0">
                    {isLast ? (
                      <BreadcrumbPage className="truncate">{node.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <button type="button" className="truncate" onClick={() => open(node.id)}>
                          {node.name}
                        </button>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {i === 0 && collapsed && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="flex size-8 items-center justify-center rounded-md hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label={`Show ${hidden.length} more folders in this path`}
                          >
                            <BreadcrumbEllipsis />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {hidden.map((h) => (
                              <DropdownMenuItem key={h.id} onSelect={() => open(h.id)}>
                                {h.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </BreadcrumbItem>
                    </>
                  )}
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-balance">
              <FolderOpen className="size-6 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="truncate">{current.name}</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {countLabel(currentId)}
              {parent ? ` in ${current.name}, inside ${parent.name}` : ""}
            </p>
          </div>
          {parent && (
            <Button variant="outline" onClick={() => open(parent.id)}>
              Back to {parent.name}
            </Button>
          )}
        </div>

        <div className="relative max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search in ${current.name}`}
            aria-label={`Search in ${current.name}`}
            className="pl-9"
          />
        </div>
      </header>

      <section aria-label={`Contents of ${current.name}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Modified</TableHead>
              <TableHead className="text-right">Size</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((n) => (
              <TableRow key={n.id}>
                <TableCell className="font-semibold">
                  {n.kind === "folder" ? (
                    <button
                      type="button"
                      onClick={() => open(n.id)}
                      className="flex min-h-11 w-full items-center gap-3 text-left hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Folder className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="truncate">{n.name}</span>
                    </button>
                  ) : (
                    <span className="flex min-h-11 items-center gap-3">
                      <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="truncate">{n.name}</span>
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">{n.modified}</TableCell>
                <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                  {n.kind === "folder" ? countLabel(n.id) : n.size}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {rows.length === 0 && (
          <div className="flex flex-col items-start gap-3 py-10" role="status">
            {all.length === 0 ? (
              <p className="text-sm text-muted-foreground">This folder is empty.</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  No results for “{query}” in {current.name}.
                </p>
                <Button variant="outline" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              </>
            )}
          </div>
        )}
      </section>
    </main>
  )
}

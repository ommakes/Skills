import * as React from "react"
import { ChevronRight, Folder, FileText, Search, ArrowUp, Home } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  type: "folder" | "file"
  modified: string
  children?: Node[]
}

const ROOT: Node = {
  id: "root",
  name: "All files",
  type: "folder",
  modified: "Today",
  children: [
    {
      id: "projects",
      name: "Projects",
      type: "folder",
      modified: "Oct 4, 2026",
      children: [
        {
          id: "apollo",
          name: "Apollo",
          type: "folder",
          modified: "Oct 3, 2026",
          children: [
            {
              id: "designs",
              name: "Designs",
              type: "folder",
              modified: "Oct 2, 2026",
              children: [
                { id: "f1", name: "Homepage-v3.fig", type: "file", modified: "Oct 2, 2026" },
                { id: "f2", name: "Onboarding-flow.fig", type: "file", modified: "Sep 29, 2026" },
              ],
            },
            { id: "f3", name: "Brief.pdf", type: "file", modified: "Sep 20, 2026" },
          ],
        },
        { id: "f4", name: "Roadmap.xlsx", type: "file", modified: "Oct 1, 2026" },
      ],
    },
    {
      id: "finance",
      name: "Finance",
      type: "folder",
      modified: "Sep 30, 2026",
      children: [{ id: "f5", name: "Q3-report.pdf", type: "file", modified: "Sep 30, 2026" }],
    },
    { id: "f6", name: "Notes.md", type: "file", modified: "Oct 5, 2026" },
  ],
}

function findPath(node: Node, id: string, trail: Node[] = []): Node[] | null {
  const next = [...trail, node]
  if (node.id === id) return next
  for (const c of node.children ?? []) {
    const r = findPath(c, id, next)
    if (r) return r
  }
  return null
}

export default function FolderBrowser() {
  const [currentId, setCurrentId] = React.useState("root")
  const [query, setQuery] = React.useState("")

  const path = findPath(ROOT, currentId) ?? [ROOT]
  const current = path[path.length - 1]
  const parent = path.length > 1 ? path[path.length - 2] : null

  const items = (current.children ?? []).filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase())
  )

  const open = (id: string) => {
    setCurrentId(id)
    setQuery("")
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 p-6">
      <header className="space-y-3">
        <Breadcrumb>
          <BreadcrumbList>
            {path.map((n, i) => {
              const last = i === path.length - 1
              return (
                <React.Fragment key={n.id}>
                  <BreadcrumbItem>
                    {last ? (
                      <BreadcrumbPage>{n.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <button type="button" onClick={() => open(n.id)}>
                          {i === 0 ? (
                            <span className="inline-flex items-center gap-1">
                              <Home className="size-3.5" aria-hidden />
                              {n.name}
                            </span>
                          ) : (
                            n.name
                          )}
                        </button>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!last && <BreadcrumbSeparator />}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!parent}
              onClick={() => parent && open(parent.id)}
            >
              <ArrowUp className="size-4" aria-hidden />
              {parent ? `Up to ${parent.name}` : "Up"}
            </Button>
            <h1 className="text-xl font-semibold">{current.name}</h1>
            <Badge variant="secondary">{current.children?.length ?? 0} items</Badge>
          </div>
          <div className="relative w-full sm:w-64">
            <Search
              className="text-muted-foreground absolute left-2.5 top-2.5 size-4"
              aria-hidden
            />
            <Input
              className="pl-8"
              placeholder={`Search in ${current.name}`}
              aria-label={`Search in ${current.name}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-40">Modified</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground h-24 text-center">
                  {query ? `No matches for "${query}".` : "This folder is empty."}
                </TableCell>
              </TableRow>
            ) : (
              items.map((n) => (
                <TableRow key={n.id}>
                  <TableCell>
                    {n.type === "folder" ? (
                      <button
                        type="button"
                        className="flex items-center gap-2 font-medium hover:underline"
                        onClick={() => open(n.id)}
                      >
                        <Folder className="size-4" aria-hidden />
                        {n.name}
                      </button>
                    ) : (
                      <span className="flex items-center gap-2">
                        <FileText className="text-muted-foreground size-4" aria-hidden />
                        {n.name}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{n.modified}</TableCell>
                  <TableCell>
                    {n.type === "folder" && (
                      <ChevronRight className="text-muted-foreground size-4" aria-hidden />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

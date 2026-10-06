import * as React from "react"
import { FileText, Folder } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Entry = { name: string; kind: "folder" | "file"; size?: string }

// Keyed by path ("Files/Projects/..."). Six levels deep at most.
const TREE: Record<string, Entry[]> = {
  "Files": [
    { name: "Projects", kind: "folder" },
    { name: "Archive", kind: "folder" },
    { name: "Welcome.pdf", kind: "file", size: "212 KB" },
  ],
  "Files/Projects": [
    { name: "Website redesign", kind: "folder" },
    { name: "Roadmap.xlsx", kind: "file", size: "88 KB" },
  ],
  "Files/Projects/Website redesign": [
    { name: "Design", kind: "folder" },
    { name: "Brief.docx", kind: "file", size: "41 KB" },
  ],
  "Files/Projects/Website redesign/Design": [
    { name: "Exports", kind: "folder" },
    { name: "Moodboard.png", kind: "file", size: "3.2 MB" },
  ],
  "Files/Projects/Website redesign/Design/Exports": [
    { name: "Final", kind: "folder" },
    { name: "Draft-v1.png", kind: "file", size: "1.1 MB" },
  ],
  "Files/Projects/Website redesign/Design/Exports/Final": [
    { name: "Homepage.png", kind: "file", size: "2.4 MB" },
    { name: "Pricing.png", kind: "file", size: "2.1 MB" },
  ],
  "Files/Archive": [{ name: "2024-report.pdf", kind: "file", size: "1.8 MB" }],
}

const MAX_VISIBLE = 4 // collapse the middle once the trail is longer than this

export default function FileBrowserBreadcrumb() {
  const [path, setPath] = React.useState<string[]>([
    "Files",
    "Projects",
    "Website redesign",
    "Design",
    "Exports",
    "Final",
  ])

  const go = (depth: number) => setPath((p) => p.slice(0, depth + 1))
  const open = (name: string) => setPath((p) => [...p, name])

  const entries = TREE[path.join("/")] ?? []
  const collapsed = path.length > MAX_VISIBLE
  // Keep root, then the last two; everything between goes in the menu.
  const hidden = collapsed ? path.slice(1, path.length - 2) : []
  const tail = collapsed ? path.slice(path.length - 2) : path.slice(1)
  const tailOffset = path.length - tail.length

  const crumb = (name: string, index: number) => {
    const isCurrent = index === path.length - 1
    return (
      <React.Fragment key={index}>
        <BreadcrumbItem>
          {isCurrent ? (
            <BreadcrumbPage>{name}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <button type="button" onClick={() => go(index)}>
                {name}
              </button>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {!isCurrent && <BreadcrumbSeparator />}
      </React.Fragment>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            {crumb(path[0], 0)}
            {collapsed && (
              <>
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="flex items-center gap-1"
                      aria-label={`Show ${hidden.length} hidden folders`}
                    >
                      <BreadcrumbEllipsis />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {hidden.map((name, i) => (
                        <DropdownMenuItem key={i} onSelect={() => go(i + 1)}>
                          {name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {tail.map((name, i) => crumb(name, tailOffset + i))}
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-semibold text-foreground">
          {path[path.length - 1]}
        </h1>
      </div>

      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        {entries.length === 0 && (
          <li className="p-4 text-sm text-muted-foreground">This folder is empty.</li>
        )}
        {entries.map((e) => {
          const Icon = e.kind === "folder" ? Folder : FileText
          const row = (
            <>
              <Icon className="size-4 text-muted-foreground" aria-hidden />
              <span className="flex-1 truncate text-sm text-foreground">{e.name}</span>
              {e.size && <span className="text-sm text-muted-foreground">{e.size}</span>}
            </>
          )
          return (
            <li key={e.name}>
              {e.kind === "folder" ? (
                <button
                  type="button"
                  onClick={() => open(e.name)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {row}
                </button>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3">{row}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

import * as React from "react"
import { FolderIcon, FileTextIcon, ImageIcon, MoreHorizontalIcon } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Crumb = { id: string; name: string }
type Item = {
  id: string
  name: string
  kind: "folder" | "document" | "image"
  modified: string
  size: string
}

const path: Crumb[] = [
  { id: "root", name: "All files" },
  { id: "projects", name: "Projects" },
  { id: "2026", name: "2026" },
  { id: "brand", name: "Brand refresh" },
  { id: "assets", name: "Assets" },
]

const items: Item[] = [
  { id: "1", name: "Logos", kind: "folder", modified: "Oct 2, 2026", size: "12 items" },
  { id: "2", name: "Photography", kind: "folder", modified: "Sep 28, 2026", size: "48 items" },
  { id: "3", name: "Brand guidelines.pdf", kind: "document", modified: "Sep 30, 2026", size: "4.2 MB" },
  { id: "4", name: "Hero banner.png", kind: "image", modified: "Oct 1, 2026", size: "1.8 MB" },
]

const icons = {
  folder: FolderIcon,
  document: FileTextIcon,
  image: ImageIcon,
}

export default function FolderView() {
  const [currentPath, setCurrentPath] = React.useState<Crumb[]>(path)

  // Collapse middle segments when the path is deep.
  const collapsed = currentPath.length > 4
  const first = currentPath[0]
  const hidden = collapsed ? currentPath.slice(1, currentPath.length - 2) : []
  const tail = collapsed ? currentPath.slice(-2) : currentPath.slice(1)
  const goTo = (id: string) => {
    const idx = currentPath.findIndex((c) => c.id === id)
    if (idx >= 0) setCurrentPath(currentPath.slice(0, idx + 1))
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-6">
      <nav aria-label="Folder path">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  goTo(first.id)
                }}
              >
                {first.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {collapsed && (
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
                      {hidden.map((c) => (
                        <DropdownMenuItem key={c.id} onSelect={() => goTo(c.id)}>
                          {c.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
              </>
            )}
            {tail.map((c, i) => {
              const isLast = i === tail.length - 1
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
                          e.preventDefault()
                          goTo(c.id)
                        }}
                      >
                        {c.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </nav>

      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {currentPath[currentPath.length - 1].name}
        </h1>
        <Badge variant="secondary">{items.length} items</Badge>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead className="text-right">Size</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const Icon = icons[item.kind]
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-muted-foreground" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.modified}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.size}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger aria-label={`Actions for ${item.name}`}>
                        <MoreHorizontalIcon className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Open</DropdownMenuItem>
                        <DropdownMenuItem>Rename</DropdownMenuItem>
                        <DropdownMenuItem>Move</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

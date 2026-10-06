import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Status = "active" | "paused" | "archived" | "at-risk";

interface Project {
  id: string;
  name: string;
  description: string;
  status: Status;
}

const STATUS_META: Record<Status, { label: string; dot: string; help: string }> = {
  active: { label: "Active", dot: "bg-green-500", help: "Work is in progress and on track." },
  paused: { label: "Paused", dot: "bg-yellow-500", help: "Temporarily on hold. No work is being done." },
  archived: { label: "Archived", dot: "bg-gray-400", help: "Finished or retired. Read-only." },
  "at-risk": { label: "At risk", dot: "bg-red-500", help: "Behind schedule or blocked and needs attention." },
};

const INITIAL_PROJECTS: Project[] = [
  { id: "1", name: "Website Redesign", description: "Refresh the marketing site.", status: "active" },
  { id: "2", name: "Mobile App", description: "iOS and Android client.", status: "at-risk" },
  { id: "3", name: "Billing Migration", description: "Move to the new payments provider.", status: "paused" },
  { id: "4", name: "Docs Portal", description: "Public developer documentation.", status: "active" },
  { id: "5", name: "Legacy API", description: "Sunset of v1 endpoints.", status: "archived" },
  { id: "6", name: "Analytics Pipeline", description: "Event ingestion rebuild.", status: "active" },
];

export default function ProjectCardsGrid() {
  const [projects, setProjects] = React.useState<Project[]>(INITIAL_PROJECTS);

  const handleEdit = (p: Project) => console.log("edit", p.id);
  const handleDuplicate = (p: Project) =>
    setProjects((prev) => [...prev, { ...p, id: crypto.randomUUID(), name: `${p.name} (copy)` }]);
  const handleDelete = (p: Project) => setProjects((prev) => prev.filter((x) => x.id !== p.id));

  return (
    <TooltipProvider>
      <div className="p-6">
        <h1 className="mb-6 text-2xl font-semibold">Projects</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const s = STATUS_META[p.status];
            return (
              <Card key={p.id} className="relative">
                <CardHeader>
                  <CardTitle>{p.name}</CardTitle>
                  <CardDescription>{p.description}</CardDescription>
                  <div className="absolute right-3 top-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Actions for ${p.name}`}>
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleEdit(p)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDuplicate(p)}>Duplicate</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onSelect={() => handleDelete(p)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-2 text-sm">
                        <span className={`size-2 rounded-full ${s.dot}`} aria-hidden="true" />
                        {s.label}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{s.help}</TooltipContent>
                  </Tooltip>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}

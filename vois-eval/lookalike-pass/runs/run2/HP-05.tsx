import { useState } from "react";
import { Search, X } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Mock data
const trail = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Acme", href: "/projects/acme" },
  { label: "Settings" }, // current page
];

const ranges = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
] as const;

type Range = (typeof ranges)[number]["value"];

export default function DashboardHeader() {
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<Range>("week");

  return (
    <header className="flex flex-col gap-4 border-b border-border bg-background px-4 py-4 md:px-6">
      {/* Path: 2+ levels deep, so Breadcrumb. Last item is the current page. */}
      <Breadcrumb>
        <BreadcrumbList>
          {trail.map((item, i) => {
            const isLast = i === trail.length - 1;
            return (
              <BreadcrumbItem key={item.label}>
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search with a clear control that only appears once there is text. */}
        <div className="relative w-full sm:max-w-sm" role="search">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("");
            }}
            placeholder="Search projects"
            aria-label="Search projects"
            className="px-9 [&::-webkit-search-cancel-button]:hidden"
          />
          {query !== "" && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring after:absolute after:left-1/2 after:top-1/2 after:size-full after:min-h-[var(--hit-area-min)] after:min-w-[var(--hit-area-min)] after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']"
            >
              <X aria-hidden="true" className="size-4" strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Day / Week / Month: 3 mutually exclusive options that narrow the view,
            so a segmented control (single-select toggle group), not tabs. */}
        <ToggleGroup
          type="single"
          variant="outline"
          value={range}
          onValueChange={(v) => {
            if (v) setRange(v as Range); // never allow deselecting
          }}
          aria-label="Time range"
        >
          {ranges.map((r) => (
            <ToggleGroupItem key={r.value} value={r.value} className="px-4">
              {r.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </header>
  );
}

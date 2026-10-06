import { useState } from "react";
import { X, Search } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CRUMBS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Acme", href: "/projects/acme" },
  { label: "Settings" },
];

const RANGES = ["Day", "Week", "Month"] as const;
type Range = (typeof RANGES)[number];

export default function DashboardHeader() {
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<Range>("Week");

  return (
    <header className="flex flex-col gap-4 border-b p-6">
      <Breadcrumb>
        <BreadcrumbList>
          {CRUMBS.map((c, i) => {
            const last = i === CRUMBS.length - 1;
            return (
              <span key={c.label} className="contents">
                <BreadcrumbItem>
                  {last ? (
                    <BreadcrumbPage>{c.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={c.href}>{c.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!last && <BreadcrumbSeparator />}
              </span>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search"
            className="pl-8 pr-8"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-0.5 top-1/2 size-7 -translate-y-1/2"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <Button
              key={r}
              type="button"
              variant="link"
              aria-pressed={range === r}
              onClick={() => setRange(r)}
              className={
                range === r
                  ? "h-auto p-0 underline"
                  : "h-auto p-0 text-muted-foreground no-underline"
              }
            >
              {r}
            </Button>
          ))}
        </div>
      </div>
    </header>
  );
}

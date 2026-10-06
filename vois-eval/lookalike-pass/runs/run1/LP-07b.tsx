import * as React from "react"
import { ArrowDownRight, ArrowUpRight, Download, Minus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

type Range = "7d" | "30d" | "90d"

const RANGE_LABEL: Record<Range, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
}
const BASELINE: Record<Range, string> = {
  "7d": "previous 7 days",
  "30d": "previous 30 days",
  "90d": "previous 90 days",
}

const KPIS = [
  { id: "visitors", label: "Visitors", value: "48.2K", delta: 12.4, upIsGood: true },
  { id: "signups", label: "Sign-ups", value: "3,184", delta: 8.1, upIsGood: true },
  { id: "conv", label: "Conversion rate", value: "6.6%", delta: 0, upIsGood: true },
  { id: "bounce", label: "Bounce rate", value: "41.3%", delta: -2.7, upIsGood: false },
]

const TREND = [
  3120, 3340, 3210, 3560, 3890, 3720, 3980, 4210, 4050, 4390, 4620, 4480, 4710, 4930,
]

const CHANNELS = [
  { name: "Organic search", visitors: 18400, signups: 1320, rate: 7.2 },
  { name: "Direct", visitors: 11250, signups: 802, rate: 7.1 },
  { name: "Referral", visitors: 7600, signups: 455, rate: 6.0 },
  { name: "Social", visitors: 6100, signups: 331, rate: 5.4 },
  { name: "Paid search", visitors: 3300, signups: 176, rate: 5.3 },
  { name: "Email", visitors: 1550, signups: 100, rate: 6.5 },
]

const PAGES = [
  { path: "/pricing", views: 14200, time: "2m 41s", exit: 32.4 },
  { path: "/features", views: 11800, time: "1m 58s", exit: 38.9 },
  { path: "/docs/getting-started", views: 9400, time: "4m 12s", exit: 21.7 },
  { path: "/blog/launch-notes", views: 6900, time: "3m 05s", exit: 44.1 },
  { path: "/signup", views: 5200, time: "1m 12s", exit: 27.5 },
]

const FUNNEL = [
  { step: "Visited site", count: 48200 },
  { step: "Viewed pricing", count: 14200 },
  { step: "Started sign-up", count: 5200 },
  { step: "Completed sign-up", count: 3184 },
]

const COUNTRIES = [
  { name: "United States", visitors: 19800 },
  { name: "United Kingdom", visitors: 6400 },
  { name: "Germany", visitors: 4900 },
  { name: "India", visitors: 4100 },
  { name: "Canada", visitors: 3300 },
]

const nf = new Intl.NumberFormat("en-US")

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function Delta({ value, upIsGood, baseline }: { value: number; upIsGood: boolean; baseline: string }) {
  const flat = value === 0
  const good = flat ? null : value > 0 === upIsGood
  const Icon = flat ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight
  const sign = value > 0 ? "+" : value < 0 ? "−" : ""
  return (
    <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
      <span
        className={
          "inline-flex items-center gap-1 font-medium tabular-nums " +
          (good === null ? "text-muted-foreground" : good ? "text-success" : "text-destructive")
        }
      >
        <Icon className="size-4" aria-hidden="true" />
        {sign}
        {Math.abs(value).toFixed(1)}%
        <span className="sr-only">{good === null ? ", no change" : good ? ", improvement" : ", decline"}</span>
      </span>
      <span>vs {baseline}</span>
    </p>
  )
}

function KpiTile({ kpi, baseline }: { kpi: (typeof KPIS)[number]; baseline: string }) {
  return (
    <Card>
      <CardHeader className="gap-2">
        <CardDescription>{kpi.label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">{kpi.value}</CardTitle>
        <Delta value={kpi.delta} upIsGood={kpi.upIsGood} baseline={baseline} />
      </CardHeader>
    </Card>
  )
}

function TrendChart({ data, label }: { data: number[]; label: string }) {
  const w = 640
  const h = 220
  const pad = { t: 12, r: 12, b: 24, l: 40 }
  const max = Math.ceil(Math.max(...data) / 1000) * 1000
  const x = (i: number) => pad.l + (i * (w - pad.l - pad.r)) / (data.length - 1)
  const y = (v: number) => pad.t + (1 - v / max) * (h - pad.t - pad.b)
  const path = data.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ")
  const ticks = [0, max / 2, max]
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} className="h-auto w-full min-w-[320px]">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="var(--border)" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted-foreground)">
              {t === 0 ? "0" : `${t / 1000}K`}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke="var(--chart-1)" strokeWidth="2" strokeLinejoin="round" />
        <circle cx={x(data.length - 1)} cy={y(data[data.length - 1])} r="4" fill="var(--chart-1)" />
        <text x={pad.l} y={h - 6} fontSize="11" fill="var(--muted-foreground)">
          Start of range
        </text>
        <text x={w - pad.r} y={h - 6} textAnchor="end" fontSize="11" fill="var(--muted-foreground)">
          Today
        </text>
      </svg>
      <figcaption className="sr-only">{label}</figcaption>
    </figure>
  )
}

function BarList({ rows, unit }: { rows: { name: string; value: number }[]; unit: string }) {
  const max = Math.max(...rows.map((r) => r.value))
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((r) => (
        <li key={r.name} className="grid grid-cols-[minmax(0,10rem)_1fr_auto] items-center gap-3 text-sm">
          <span className="truncate">{r.name}</span>
          <span className="h-2 rounded-full bg-muted" aria-hidden="true">
            <span className="block h-2 rounded-full bg-chart-1" style={{ width: `${(r.value / max) * 100}%` }} />
          </span>
          <span className="tabular-nums text-muted-foreground">
            {nf.format(r.value)} <span className="sr-only">{unit}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

function Panel({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Tab panels                                                          */
/* ------------------------------------------------------------------ */

function Overview({ range }: { range: Range }) {
  const [view, setView] = React.useState<"chart" | "table">("chart")
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-base">Visitors over time</CardTitle>
            <CardDescription>{RANGE_LABEL[range]}, daily</CardDescription>
          </div>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={view}
            onValueChange={(v) => v && setView(v as "chart" | "table")}
            aria-label="Visitors view"
          >
            <ToggleGroupItem value="chart">Chart</ToggleGroupItem>
            <ToggleGroupItem value="table">Table</ToggleGroupItem>
          </ToggleGroup>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {view === "chart" ? (
            <TrendChart data={TREND} label="Daily visitors rose from 3,120 to 4,930 over the period." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead className="text-right">Visitors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TREND.map((v, i) => (
                  <TableRow key={i}>
                    <TableCell>Day {i + 1}</TableCell>
                    <TableCell className="text-right tabular-nums">{nf.format(v)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Top channels" description="Visitors by source">
          <BarList rows={CHANNELS.slice(0, 5).map((c) => ({ name: c.name, value: c.visitors }))} unit="visitors" />
        </Panel>
        <Panel title="Top countries" description="Visitors by location">
          <BarList rows={COUNTRIES.map((c) => ({ name: c.name, value: c.visitors }))} unit="visitors" />
        </Panel>
      </div>
    </div>
  )
}

function Acquisition() {
  return (
    <Panel title="Channels" description="Where visitors come from and how well they convert">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Channel</TableHead>
              <TableHead className="text-right">Visitors</TableHead>
              <TableHead className="text-right">Sign-ups</TableHead>
              <TableHead className="text-right">Conversion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CHANNELS.map((c) => (
              <TableRow key={c.name}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-right tabular-nums">{nf.format(c.visitors)}</TableCell>
                <TableCell className="text-right tabular-nums">{nf.format(c.signups)}</TableCell>
                <TableCell className="text-right tabular-nums">{c.rate.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Panel>
  )
}

function Engagement() {
  return (
    <Panel title="Top pages" description="Most viewed pages in this range">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Avg. time</TableHead>
              <TableHead className="text-right">Exit rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PAGES.map((p) => (
              <TableRow key={p.path}>
                <TableCell className="font-medium">{p.path}</TableCell>
                <TableCell className="text-right tabular-nums">{nf.format(p.views)}</TableCell>
                <TableCell className="text-right tabular-nums">{p.time}</TableCell>
                <TableCell className="text-right tabular-nums">{p.exit.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Panel>
  )
}

function Conversion() {
  const top = FUNNEL[0].count
  return (
    <Panel title="Sign-up funnel" description="Share of visitors reaching each step">
      <ol className="flex flex-col gap-4">
        {FUNNEL.map((f, i) => {
          const step = i === 0 ? null : (f.count / FUNNEL[i - 1].count) * 100
          return (
            <li key={f.step} className="flex flex-col gap-1.5 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <span>{f.step}</span>
                <span className="tabular-nums text-muted-foreground">
                  {nf.format(f.count)}
                  {step !== null ? <> · {step.toFixed(1)}% of previous step</> : null}
                </span>
              </div>
              <span className="h-3 rounded-full bg-muted" aria-hidden="true">
                <span className="block h-3 rounded-full bg-chart-1" style={{ width: `${(f.count / top) * 100}%` }} />
              </span>
            </li>
          )
        })}
      </ol>
    </Panel>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AnalyticsPage() {
  const [range, setRange] = React.useState<Range>("30d")
  const [site, setSite] = React.useState("all")
  const [tab, setTab] = React.useState("overview")

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-balance">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            {RANGE_LABEL[range]}, compared with the {BASELINE[range]}. Times in UTC.
          </p>
        </div>
        <Button variant="outline">
          <Download className="size-4" aria-hidden="true" />
          Export CSV
        </Button>
      </header>

      {/* Filters scope everything below, including every tab */}
      <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Filters">
        <ToggleGroup
          type="single"
          variant="outline"
          value={range}
          onValueChange={(v) => v && setRange(v as Range)}
          aria-label="Date range"
        >
          <ToggleGroupItem value="7d">7 days</ToggleGroupItem>
          <ToggleGroupItem value="30d">30 days</ToggleGroupItem>
          <ToggleGroupItem value="90d">90 days</ToggleGroupItem>
        </ToggleGroup>
        <Select value={site} onValueChange={setSite}>
          <SelectTrigger className="w-48" aria-label="Site">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sites</SelectItem>
            <SelectItem value="marketing">Marketing site</SelectItem>
            <SelectItem value="docs">Docs</SelectItem>
            <SelectItem value="app">Web app</SelectItem>
          </SelectContent>
        </Select>
        {site !== "all" ? <Badge variant="secondary">Filtered</Badge> : null}
      </div>

      <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((k) => (
          <KpiTile key={k.id} kpi={k} baseline={BASELINE[range]} />
        ))}
      </section>

      <Tabs value={tab} onValueChange={setTab} className="gap-6">
        <TabsList className="h-auto max-w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Overview range={range} />
        </TabsContent>
        <TabsContent value="acquisition">
          <Acquisition />
        </TabsContent>
        <TabsContent value="engagement">
          <Engagement />
        </TabsContent>
        <TabsContent value="conversion">
          <Conversion />
        </TabsContent>
      </Tabs>
    </main>
  )
}

import * as React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const kpis = [
  { label: "Visitors", value: "48,210", delta: "+6.2%", up: true },
  { label: "Signups", value: "3,482", delta: "+3.1%", up: true },
  { label: "Conversion", value: "7.2%", delta: "-0.4%", up: false },
  { label: "Revenue", value: "$92.4k", delta: "+9.8%", up: true },
];

const trend = [
  { day: "Mon", visitors: 6100, signups: 410 },
  { day: "Tue", visitors: 6900, signups: 480 },
  { day: "Wed", visitors: 7200, signups: 520 },
  { day: "Thu", visitors: 6800, signups: 470 },
  { day: "Fri", visitors: 7600, signups: 560 },
  { day: "Sat", visitors: 6700, signups: 520 },
  { day: "Sun", visitors: 6910, signups: 522 },
];

const sources = [
  { source: "Organic search", visitors: 18240, conv: "8.1%" },
  { source: "Direct", visitors: 11030, conv: "6.4%" },
  { source: "Referral", visitors: 8120, conv: "7.9%" },
  { source: "Paid", visitors: 6820, conv: "5.2%" },
  { source: "Social", visitors: 4000, conv: "3.8%" },
];

const pages = [
  { path: "/pricing", views: 12400, bounce: "32%" },
  { path: "/", views: 11800, bounce: "41%" },
  { path: "/features", views: 7300, bounce: "37%" },
  { path: "/blog/launch", views: 5100, bounce: "58%" },
  { path: "/signup", views: 4900, bounce: "22%" },
];

const funnel = [
  { step: "Visited site", count: 48210 },
  { step: "Viewed pricing", count: 12400 },
  { step: "Started signup", count: 4900 },
  { step: "Completed signup", count: 3482 },
];

export default function AnalyticsPage() {
  const [range, setRange] = React.useState("7d");

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Start with the summary, then dig into a topic.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-40" aria-label="Date range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export</Button>
        </div>
      </header>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => (
              <Card key={k.label}>
                <CardHeader className="pb-2">
                  <CardDescription>{k.label}</CardDescription>
                  <CardTitle className="text-2xl">{k.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={k.up ? "secondary" : "destructive"}>{k.delta}</Badge>
                  <span className="ml-2 text-xs text-muted-foreground">vs previous period</span>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Visitors over time</CardTitle>
              <CardDescription>Daily visitors for the selected range</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={48} />
                  <Tooltip />
                  <Area type="monotone" dataKey="visitors" stroke="currentColor" fillOpacity={0.15} fill="currentColor" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle>Traffic sources</CardTitle>
              <CardDescription>Where visitors come from</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Visitors</TableHead>
                    <TableHead className="text-right">Conversion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sources.map((s) => (
                    <TableRow key={s.source}>
                      <TableCell>{s.source}</TableCell>
                      <TableCell className="text-right">{s.visitors.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{s.conv}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Top pages</CardTitle>
              <CardDescription>Most viewed pages and their bounce rate</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Bounce rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((p) => (
                    <TableRow key={p.path}>
                      <TableCell className="font-mono text-sm">{p.path}</TableCell>
                      <TableCell className="text-right">{p.views.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{p.bounce}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <CardTitle>Signup funnel</CardTitle>
              <CardDescription>How visitors progress to a completed signup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {funnel.map((f) => {
                const pct = (f.count / funnel[0].count) * 100;
                return (
                  <div key={f.step} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{f.step}</span>
                      <span className="text-muted-foreground">
                        {f.count.toLocaleString()} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

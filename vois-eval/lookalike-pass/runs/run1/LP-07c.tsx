import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type View = "overview" | "traffic" | "conversions";

const VIEWS: { value: View; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "traffic", label: "Traffic" },
  { value: "conversions", label: "Conversions" },
];

const overviewStats = [
  { label: "Visitors", value: "48,210", change: "+6.2% vs previous 30 days" },
  { label: "Signups", value: "1,964", change: "+3.8% vs previous 30 days" },
  { label: "Conversion rate", value: "4.07%", change: "-0.2 pts vs previous 30 days" },
  { label: "Revenue", value: "$32,480", change: "+9.1% vs previous 30 days" },
];

const trafficSources = [
  { source: "Organic search", visitors: 19840, share: "41.2%" },
  { source: "Direct", visitors: 12105, share: "25.1%" },
  { source: "Referral", visitors: 7320, share: "15.2%" },
  { source: "Social", visitors: 5410, share: "11.2%" },
  { source: "Email", visitors: 3535, share: "7.3%" },
];

const funnel = [
  { step: "Visited pricing", users: 9420, rate: "19.5%" },
  { step: "Started trial", users: 3180, rate: "33.8%" },
  { step: "Invited a teammate", users: 2260, rate: "71.1%" },
  { step: "Subscribed", users: 1964, rate: "86.9%" },
];

const nf = new Intl.NumberFormat("en-US");

function StatGrid() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {overviewStats.map((s) => (
        <li key={s.label}>
          <Card className="h-full">
            <CardHeader>
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="font-mono text-2xl tabular-nums">{s.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{s.change}</p>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function TrafficTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Visitors by source</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Visitors</TableHead>
              <TableHead className="text-right">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trafficSources.map((r) => (
              <TableRow key={r.source}>
                <TableCell>{r.source}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{nf.format(r.visitors)}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{r.share}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function FunnelTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Signup funnel</CardTitle>
        <CardDescription>Share of users who moved on from the previous step</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Step</TableHead>
              <TableHead className="text-right">Users</TableHead>
              <TableHead className="text-right">Moved on</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {funnel.map((r) => (
              <TableRow key={r.step}>
                <TableCell>{r.step}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{nf.format(r.users)}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{r.rate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsScreen() {
  const [view, setView] = useState<View>("overview");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 bg-background p-4 text-foreground sm:p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-balance">Analytics</h1>
        <p className="max-w-[65ch] text-muted-foreground text-pretty">
          How people find and use your product over the last 30 days.
        </p>
      </header>

      <Tabs value={view} onValueChange={(v) => setView(v as View)} className="gap-6">
        <TabsList aria-label="Analytics views">
          {VIEWS.map((v) => (
            <TabsTrigger key={v.value} value={v.value}>
              {v.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-6">
          <StatGrid />
        </TabsContent>
        <TabsContent value="traffic" className="flex flex-col gap-6">
          <TrafficTable />
        </TabsContent>
        <TabsContent value="conversions" className="flex flex-col gap-6">
          <FunnelTable />
        </TabsContent>
      </Tabs>
    </main>
  );
}

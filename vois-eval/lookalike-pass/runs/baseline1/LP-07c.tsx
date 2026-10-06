import * as React from "react";
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
import { Badge } from "@/components/ui/badge";

type View = "overview" | "traffic" | "conversions";

const VIEWS: { value: View; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "traffic", label: "Traffic" },
  { value: "conversions", label: "Conversions" },
];

const overviewStats = [
  { label: "Visitors", value: "48,210", change: "+6.2%" },
  { label: "Signups", value: "1,942", change: "+3.1%" },
  { label: "Revenue", value: "$32,480", change: "+8.4%" },
  { label: "Bounce rate", value: "41.7%", change: "-1.9%" },
];

const trafficRows = [
  { source: "Organic search", visits: 18420, share: "38%" },
  { source: "Direct", visits: 11930, share: "25%" },
  { source: "Referral", visits: 8115, share: "17%" },
  { source: "Social", visits: 6240, share: "13%" },
  { source: "Email", visits: 3505, share: "7%" },
];

const conversionRows = [
  { step: "Landing page view", users: 48210, rate: "100%" },
  { step: "Pricing page view", users: 14380, rate: "29.8%" },
  { step: "Started signup", users: 3860, rate: "8.0%" },
  { step: "Completed signup", users: 1942, rate: "4.0%" },
];

export default function AnalyticsScreen() {
  const [view, setView] = React.useState<View>("overview");

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Last 30 days</p>
      </header>

      <Tabs value={view} onValueChange={(v) => setView(v as View)} className="w-full">
        <TabsList>
          {VIEWS.map((v) => (
            <TabsTrigger key={v.value} value={v.value}>
              {v.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {overviewStats.map((s) => (
              <Card key={s.label}>
                <CardHeader className="pb-2">
                  <CardDescription>{s.label}</CardDescription>
                  <CardTitle className="text-2xl">{s.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">{s.change} vs. prior period</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic sources</CardTitle>
              <CardDescription>Where visitors came from</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Visits</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trafficRows.map((r) => (
                    <TableRow key={r.source}>
                      <TableCell className="font-medium">{r.source}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.visits.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{r.share}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Signup funnel</CardTitle>
              <CardDescription>Drop-off at each step</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Step</TableHead>
                    <TableHead className="text-right">Users</TableHead>
                    <TableHead className="text-right">Of total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversionRows.map((r) => (
                    <TableRow key={r.step}>
                      <TableCell className="font-medium">{r.step}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.users.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{r.rate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

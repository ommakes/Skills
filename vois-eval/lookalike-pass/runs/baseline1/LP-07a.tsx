import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const overviewStats = [
  { label: "Visitors", value: "48,210", change: "+8.2%" },
  { label: "Page views", value: "132,904", change: "+5.1%" },
  { label: "Avg. session", value: "3m 42s", change: "-1.4%" },
  { label: "Bounce rate", value: "41.3%", change: "-2.0%" },
]

const trafficSources = [
  { source: "Organic search", visits: 18420, share: "38.2%" },
  { source: "Direct", visits: 12950, share: "26.9%" },
  { source: "Referral", visits: 7310, share: "15.2%" },
  { source: "Social", visits: 5890, share: "12.2%" },
  { source: "Email", visits: 3640, share: "7.5%" },
]

const conversions = [
  { goal: "Sign up", completions: 2140, rate: "4.4%", status: "On track" },
  { goal: "Start trial", completions: 1260, rate: "2.6%", status: "On track" },
  { goal: "Book demo", completions: 380, rate: "0.8%", status: "Below target" },
  { goal: "Purchase", completions: 214, rate: "0.4%", status: "Below target" },
]

export default function AnalyticsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Last 30 days</p>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {overviewStats.map((s) => (
              <Card key={s.label}>
                <CardHeader>
                  <CardDescription>{s.label}</CardDescription>
                  <CardTitle className="text-2xl">{s.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-muted-foreground">{s.change} vs. previous period</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="mt-4">
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
                    <TableHead className="text-right">Visits</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trafficSources.map((row) => (
                    <TableRow key={row.source}>
                      <TableCell className="font-medium">{row.source}</TableCell>
                      <TableCell className="text-right">{row.visits.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{row.share}</TableCell>
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
              <CardTitle>Conversion goals</CardTitle>
              <CardDescription>Completions and rate by goal</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Goal</TableHead>
                    <TableHead className="text-right">Completions</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversions.map((row) => (
                    <TableRow key={row.goal}>
                      <TableCell className="font-medium">{row.goal}</TableCell>
                      <TableCell className="text-right">{row.completions.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{row.rate}</TableCell>
                      <TableCell>
                        <Badge variant={row.status === "On track" ? "secondary" : "outline"}>
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

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

const overview = [
  { label: "Visitors", value: "48,210", change: "+6.2%" },
  { label: "Page views", value: "132,904", change: "+3.8%" },
  { label: "Conversion rate", value: "3.4%", change: "+0.3 pts" },
  { label: "Avg. session", value: "2m 41s", change: "-4s" },
]

const traffic = [
  { source: "Organic search", visits: "19,430", share: "40.3%" },
  { source: "Direct", visits: "11,872", share: "24.6%" },
  { source: "Referral", visits: "7,015", share: "14.6%" },
  { source: "Social", visits: "6,104", share: "12.7%" },
  { source: "Email", visits: "3,789", share: "7.9%" },
]

const conversions = [
  { goal: "Sign up", completions: "1,126", rate: "2.3%" },
  { goal: "Start trial", completions: "684", rate: "1.4%" },
  { goal: "Book demo", completions: "212", rate: "0.4%" },
  { goal: "Upgrade plan", completions: "148", rate: "0.3%" },
]

export default function AnalyticsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Last 30 days</p>
      </header>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {overview.map((m) => (
              <Card key={m.label}>
                <CardHeader>
                  <CardDescription>{m.label}</CardDescription>
                  <CardTitle className="text-2xl">{m.value}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {m.change} vs. previous period
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle>Traffic sources</CardTitle>
              <CardDescription>Where your visitors come from</CardDescription>
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
                  {traffic.map((r) => (
                    <TableRow key={r.source}>
                      <TableCell>{r.source}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.visits}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.share}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions">
          <Card>
            <CardHeader>
              <CardTitle>Goal conversions</CardTitle>
              <CardDescription>Completions by goal</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Goal</TableHead>
                    <TableHead className="text-right">Completions</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversions.map((r) => (
                    <TableRow key={r.goal}>
                      <TableCell>{r.goal}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.completions}</TableCell>
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
  )
}

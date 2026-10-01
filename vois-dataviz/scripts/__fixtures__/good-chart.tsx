import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const config = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  costs: { label: "Costs", color: "var(--chart-2)" },
} satisfies ChartConfig;

type Row = { month: string; revenue: number; costs: number };

export function RevenueVsCosts({ data }: { data: Row[] }) {
  return (
    <figure>
      <figcaption>Revenue and costs by month</figcaption>
      <ChartContainer config={config} className="min-h-[240px] w-full">
        <LineChart data={data} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line dataKey="revenue" type="monotone" stroke="var(--color-revenue)" animationDuration={300} />
          <Line dataKey="costs" type="monotone" stroke="var(--color-costs)" animationDuration={300} />
        </LineChart>
      </ChartContainer>
    </figure>
  );
}

// A Pareto chart: the one sanctioned two-scale chart (DV-HONEST-002).
export function ParetoCauses({ data }: { data: { cause: string; count: number; cumulative: number }[] }) {
  return (
    <ChartContainer config={config} className="min-h-[240px] w-full">
      <LineChart data={data} accessibilityLayer>
        <YAxis yAxisId="count" />
        {/* dataviz-allow: dual-axis */}
        <YAxis yAxisId="cumulative" orientation="right" domain={[0, 100]} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line yAxisId="count" dataKey="count" stroke="var(--color-revenue)" />
      </LineChart>
    </ChartContainer>
  );
}

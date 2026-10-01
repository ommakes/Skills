import { Bar, BarChart, CartesianGrid, Line, LineChart, LabelList, XAxis, YAxis, Area, AreaChart } from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#dc2626"];

const data = [
  { month: "Jan", users: 10, sessions: 100 },
  { month: "Feb", users: 12, sessions: 120 },
  { month: "Mar", users: 14, sessions: 150 },
  { month: "Apr", users: 15, sessions: 160 },
  { month: "May", users: 18, sessions: 210 },
  { month: "Jun", users: 20, sessions: 230 },
  { month: "Jul", users: 21, sessions: 250 },
  { month: "Aug", users: 25, sessions: 300 },
  { month: "Sep", users: 27, sessions: 340 },
];

export function DualAxisAdoption() {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis yAxisId="left" />
      <YAxis yAxisId="right" orientation="right" />
      <Line yAxisId="left" type="natural" dataKey="users" stroke="#2563eb" animationDuration={1500}>
        <LabelList dataKey="users" position="top" />
      </Line>
      <Line yAxisId="right" type="monotone" dataKey="sessions" stroke={COLORS[0 % COLORS.length]} />
    </LineChart>
  );
}

export function TruncatedBars() {
  return (
    <BarChart data={data} accessibilityLayer>
      <XAxis dataKey="month" />
      <YAxis domain={[90, 100]} />
      <Bar dataKey="users" fill="var(--chart-1)" />
    </BarChart>
  );
}

export function FilledArea() {
  return (
    <AreaChart data={data} accessibilityLayer>
      <Area dataKey="users" type="monotone" />
    </AreaChart>
  );
}

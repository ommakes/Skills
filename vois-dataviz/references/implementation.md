# Implementation in the Vois stack

How to turn a chosen form into code that follows the rules. The stack is shadcn/ui `Chart` (Recharts under the hood), Tailwind v4 or StyleX, and Motion. Check the workspace manifest for real component names before you copy anything. Rule ids are in `data/dataviz-rules.json`.

## Order of work

1. Fill in a chart spec (`data/chart-spec.schema.json`) and run `node scripts/check-spec.mjs spec.json`. Fix FAILs before writing code.
2. Resolve chart tokens from the workspace tokens (`vois_get_tokens` if available; roles below). Never write a color value.
3. Build the chart from one typed config `[DV-SUSTAIN-001]` `[DV-IMPL-002]`.
4. Build the states `[DV-STATE-001]` `[DV-STATE-002]` `[DV-STATE-003]`.
5. Run `node scripts/detect.mjs <files>` and fix findings.
6. Look at the render at 320, 640 and 1280px, in light and dark, with the keyboard.

## Chart token roles

Token values are live, not stored here. Ask for these roles. If the workspace lacks one, report the gap (`vois_report_pattern_gap` if available) and stop short of inventing a value `[DV-IMPL-004]`.

| Role | Used for | Rule |
|---|---|---|
| chart-1 to chart-8 | Categorical series, in this order, never cycled | `[DV-COLOR-003]` |
| chart-seq-100 to chart-seq-700 | One hue light to dark: magnitude, heatmap, ordinal stages | `[DV-COLOR-005]` |
| chart-div-a, chart-div-mid, chart-div-b | Two opposing hues and a neutral midpoint | `[DV-COLOR-005]` |
| chart-status-good, -warning, -serious, -critical | State only, always with icon, sign or label | `[DV-COLOR-006]` |
| chart-muted | De-emphasis gray, "Other", previous period, sparkline body | `[DV-COLOR-009]` |
| chart-grid, chart-axis, chart-label | Furniture: solid 1px hairlines and text | `[DV-CLARITY-002]` |
| chart-surface | The color the plot sits on, for 2px gaps and marker rings | `[DV-CLARITY-006]` |

Dark mode is its own selection of steps from the same ramps, checked against the dark surface `[DV-COLOR-008]`. If the environment has the `dataviz` skill, run its `validate_palette.js` on the resolved categorical palette once per mode. Contrast targets: marks 3:1, text 4.5:1 `[DV-A11Y-002]`.

## The config is the contract

```tsx
import type { ChartConfig } from "@/components/ui/chart";

export const trafficConfig = {
  visitors: { label: "Visitors", color: "var(--chart-1)" },
  signups: { label: "Signups", color: "var(--chart-2)" },
} satisfies ChartConfig;

// One formatter per metric, used by tiles, axes, tooltips, tables and exports. DV-CONSIST-001
export const trafficFormat = {
  visitors: (v: number) => new Intl.NumberFormat(undefined, { notation: "compact" }).format(v),
  signups: (v: number) => v.toLocaleString(),
} satisfies Record<keyof typeof trafficConfig, (v: number) => string>;
```

The same config and formatters feed the plot, the tooltip, the legend, the table view and the CSV export. Colors are keyed by series key, so filtering never repaints a survivor `[DV-COLOR-004]`.

## A line chart that passes

```tsx
<figure>
  <figcaption className="sr-only">Visitors and signups, Jun 11 to Jun 17. Visitors peaked on Jun 15.</figcaption>
  <ChartContainer config={trafficConfig} className="min-h-[240px] w-full">
    <LineChart data={data} accessibilityLayer>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="date" tickLine={false} axisLine={false} tickFormatter={formatDay} />
      <YAxis width={44} tickLine={false} axisLine={false} tickFormatter={compact} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
      <Line dataKey="visitors" type="monotone" stroke="var(--color-visitors)" strokeWidth={2} dot={false} animationDuration={300} />
      <Line dataKey="signups" type="monotone" stroke="var(--color-signups)" strokeWidth={2} dot={false} animationDuration={300} />
    </LineChart>
  </ChartContainer>
</figure>
```

Points that carry rules: `accessibilityLayer` `[DV-IMPL-003]`, a responsive container with a min height `[DV-IMPL-007]`, solid horizontal grid only `[DV-CLARITY-002]`, `monotone` not `natural` `[DV-HONEST-005]`, 2px lines `[DV-CLARITY-006]`, a legend because there are two series `[DV-CLARITY-004]`, 300ms or less `[DV-A11Y-008]`.

## Partial periods and forecasts

```tsx
{/* Hatched fill for the in-progress bucket. DV-HONEST-004 */}
<defs>
  <pattern id="partial" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="6" height="6" fill="var(--color-visitors)" fillOpacity={0.15} />
    <line x1="0" y1="0" x2="0" y2="6" stroke="var(--color-visitors)" strokeWidth={2} />
  </pattern>
</defs>
<Bar dataKey="visitors" radius={[4, 4, 0, 0]} maxBarSize={24}>
  {data.map((d) => <Cell key={d.date} fill={d.partial ? "url(#partial)" : "var(--color-visitors)"} />)}
</Bar>

{/* Forecast: split the series. Solid actual, dashed forecast, both labeled in the legend. */}
<Line dataKey="actual" stroke="var(--color-actual)" strokeWidth={2} />
<Line dataKey="forecast" stroke="var(--color-actual)" strokeWidth={2} strokeDasharray="4 4" />
```

Dashing the data line is meaningful (it says "not yet real"). Dashing the grid is not `[DV-CLARITY-002]`.

## The card and its states

```tsx
type CardState = "loading" | "ready" | "empty-not-set-up" | "empty-collecting" | "empty-filtered" | "error";

export function ChartCard({ title, scope, state, isRefetching, onRetry, onClearFilters, children }: Props) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{scope /* "Jun 11 to Jun 17, 2026 (UTC)" */}</CardDescription>
        </div>
        <ChartCardMenu /> {/* expand, view as table, export CSV, edit. One place, every card. DV-INTERACT-006 */}
      </CardHeader>
      <CardContent className="min-h-[240px]" aria-busy={isRefetching}>
        {state === "loading" && <ChartSkeleton />}                       {/* final geometry. DV-STATE-001 */}
        {state === "empty-not-set-up" && <EmptyNotSetUp />}               {/* explain + connect action */}
        {state === "empty-collecting" && <EmptyCollecting />}             {/* threshold + when to check back */}
        {state === "empty-filtered" && <EmptyFiltered onClear={onClearFilters} />}
        {state === "error" && <CardError onRetry={onRetry} />}            {/* stays inside the card. DV-STATE-003 */}
        {state === "ready" && (
          <div className={cn("transition-opacity", isRefetching && "opacity-60")}> {/* hold the frame. DV-FILTER-008 */}
            {children}
          </div>
        )}
      </CardContent>
      <CardFooter>{/* scope disclosure and a See all link. DV-CONTEXT-007, DV-PURPOSE-004 */}</CardFooter>
    </Card>
  );
}
```

Copy for each state goes through `righter`. Empty and error copy examples are in `references/dashboard-patterns.md` under `DASH-STATE-MATRIX`.

## Table view twin

```tsx
export function ChartTable<T extends Record<string, unknown>>({ config, format, data, xKey }: { config: ChartConfig; format: Record<string, (v: number) => string>; data: T[]; xKey: keyof T & string }) {
  const keys = Object.keys(config);
  return (
    <Table>
      <TableCaption className="sr-only">Same data as the chart</TableCaption>
      <TableHeader><TableRow>
        <TableHead scope="col">{xKey}</TableHead>
        {keys.map((k) => <TableHead key={k} scope="col" className="text-right">{config[k].label}</TableHead>)}
      </TableRow></TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={String(row[xKey])}>
            <TableCell>{String(row[xKey])}</TableCell>
            {keys.map((k) => <TableCell key={k} className="text-right tabular-nums">{format[k](row[k] as number)}</TableCell>)}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

Put a `Chart | Table` `ToggleGroup` in the card header `[DV-A11Y-004]`. Use `tabular-nums` in table cells, proportional figures on tiles `[DV-CLARITY-009]`.

## Stat tile and delta

```tsx
function Delta({ value, baseline, goodDirection = "up" }: { value: number | null; baseline: string; goodDirection?: "up" | "down" }) {
  if (value === null) return <span className="text-muted-foreground">New</span>;          // zero base. DV-HONEST-010
  const up = value > 0, flat = value === 0;
  const good = flat ? null : (up && goodDirection === "up") || (!up && goodDirection === "down");
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", good === true && "text-[var(--chart-status-good)]", good === false && "text-[var(--chart-status-critical)]")}>
      {flat ? <MinusIcon aria-hidden /> : up ? <ArrowUpIcon aria-hidden /> : <ArrowDownIcon aria-hidden />}
      <span>{value > 0 ? "+" : ""}{value.toFixed(1)}%</span>
      <span className="text-muted-foreground">vs {baseline}</span>
    </span>
  );
}
```

Arrow, sign, number and baseline are all text or icon, so color is a second channel `[DV-A11Y-001]` `[DV-CONTEXT-002]`. A flat zero gets a neutral dash, not a green arrow.

## Sparkline

```tsx
<ChartContainer config={cfg} className="h-8 w-24">
  <LineChart data={points} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
    <Line dataKey="v" dot={false} strokeWidth={2} stroke="var(--chart-muted)" isAnimationActive={false} />
  </LineChart>
</ChartContainer>
```

No axes, no grid, a numeric value beside it, `aria-hidden` when that value and delta carry the meaning `[DV-FORM-008]`.

## Heatmap, which Recharts does not have

```tsx
<div role="img" aria-label="Sessions by hour and weekday, busiest Tuesday 14:00" className="grid gap-0.5"
     style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
  {cells.map((c) => (
    <div key={c.id} title={`${c.label}: ${c.value}`}
         style={{ background: `color-mix(in oklab, var(--chart-seq-700) ${c.pct}%, var(--chart-surface))` }}
         className="aspect-square rounded-[2px]" />
  ))}
</div>
{/* Add a scale legend: min, mid, max. DV-COLOR-011. Make cells focusable if they are interactive. */}
```

## Motion

Animate on first mount only, 300ms or less, off under `prefers-reduced-motion`, never on refetch `[DV-A11Y-008]` `[DV-IMPL-005]`:

```tsx
const reduce = useReducedMotion();
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
<Line isAnimationActive={!reduce && !mounted} animationDuration={300} />
```

## Responsive

Use container queries on the card so it adapts to its slot, not just the viewport. Below 640px: one column, KPI tiles two up, tooltips become tap to pin, wide tables become cards or scroll with a sticky first column, plot at least 200px tall including the axis band `[DV-LAYOUT-006]` `[DV-STATE-007]`.

## Optional MCP calls

Every call below is optional. If the tool isn't available in your environment, skip it and carry on.

| When | Call |
|---|---|
| Form chosen | `vois_record_component_choice` with `job` (the viewer's question), `componentName` (for example `ChartContainer + LineChart`), `alternativesConsidered` (the other forms from the tree), `reasoning` (the tree result id, such as `CHART-R-LINE-MULTI`) |
| Need chart colors | `vois_get_tokens` for the chart roles above |
| No form, token or pattern fits | `vois_report_pattern_gap` with the closest tree result as `attemptedFallback` |
| Done | `vois_record_rule_usage` with the `DV-*` ids applied, and `violated` or `ambiguous` for any you couldn't satisfy |

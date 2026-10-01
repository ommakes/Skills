<!-- GENERATED from data/chart-catalog.json by scripts/build-reference.mjs. Edit the JSON, then run `node vois-dataviz/scripts/build-reference.mjs`. Do not edit by hand. -->

# Chart catalog

Every form, with its job, when to use it, when not to, baseline, limits, color job, audience, dashboard fit, and a build hint for shadcn Chart over Recharts. **Fit:** `core` is the default toolkit, `situational` is right for a specific job, `rare` is specialist and needs an analyst audience plus a how-to-read note.

| Form | Name | Job | Fit | Audience | Baseline | Color job |
|---|---|---|---|---|---|---|
| `[FORM-STAT-TILE]` | Stat tile | Show one current value with its change | core | general | n/a | status |
| `[FORM-METER]` | Meter or progress bar | Show one ratio against a limit | core | general | zero_required | status |
| `[FORM-SPARKLINE]` | Sparkline | Trend at a glance inside a table row or tile | core | general | zero_optional | single |
| `[FORM-TABLE]` | Table (with pivot variant) | Look up exact values or compare many attributes | core | general | n/a | none |
| `[FORM-BAR-V]` | Column chart (vertical bar) | Compare values across a few categories or discrete periods | core | general | zero_required | single |
| `[FORM-BAR-H]` | Bar chart (horizontal) | Rank or compare categories with long labels | core | general | zero_required | single |
| `[FORM-BAR-GROUPED]` | Grouped bar chart | Compare 2 to 3 series within each category | core | general | zero_required | categorical |
| `[FORM-BAR-STACKED]` | Stacked bar chart | Show a total and its parts | core | general | zero_required | categorical |
| `[FORM-BAR-STACKED-PCT]` | 100% stacked bar | Compare shares of a whole across groups | core | general | zero_required | categorical |
| `[FORM-BAR-DIVERGING]` | Diverging (positive and negative) bar | Show performance above or below a baseline | core | general | zero_required | diverging |
| `[FORM-BAR-DIVERGING-STACKED]` | Diverging stacked bar | Show shares on an ordered scale such as Likert | situational | analyst | n/a | diverging |
| `[FORM-WATERFALL]` | Waterfall chart | Show how increases and decreases build to a total | situational | general | zero_required | diverging |
| `[FORM-PARETO]` | Pareto chart | Prioritize the vital few causes | situational | analyst | zero_required | single |
| `[FORM-DUMBBELL]` | Dumbbell (before and after) | Show change per item between two states | situational | analyst | zero_optional | single |
| `[FORM-BULLET]` | Bullet graph | Compare actual to target across several metrics | situational | general | zero_required | sequential |
| `[FORM-LINE]` | Line chart | Show a trend over time for one series | core | general | zero_optional | single |
| `[FORM-LINE-MULTI]` | Multi-line chart | Compare 2 to 4 series over time on one scale | core | general | zero_optional | categorical |
| `[FORM-STEP-LINE]` | Step line | Show a value that holds between events | situational | general | zero_optional | single |
| `[FORM-AREA]` | Area chart | Show cumulative volume over time for one series | core | general | zero_required | single |
| `[FORM-AREA-STACKED]` | Stacked area chart | Show a total and its parts over many periods | situational | general | zero_required | categorical |
| `[FORM-AREA-PCT]` | 100% stacked area | Show how shares change over time | situational | general | zero_required | categorical |
| `[FORM-AREA-DIVERGING]` | Positive and negative area | Show above and below a baseline over time | situational | analyst | zero_required | diverging |
| `[FORM-CANDLESTICK]` | Candlestick or OHLC | Show open, high, low and close per session | situational | analyst | zero_optional | diverging |
| `[FORM-SMALL-MULTIPLES]` | Small multiples | Compare many series or measures without a second axis | core | general | zero_optional | single |
| `[FORM-EMPHASIS]` | Emphasis (one accent, rest gray) | Make one series the story among many | core | general | zero_optional | single |
| `[FORM-DONUT]` | Donut chart | Part-to-whole glance with a total | core | general | n/a | categorical |
| `[FORM-PIE]` | Pie chart | Part-to-whole glance | situational | general | n/a | categorical |
| `[FORM-WAFFLE]` | Waffle or square chart | Read a share in single percentage points | situational | general | n/a | categorical |
| `[FORM-TREEMAP]` | Treemap | Show proportion within nested categories | situational | analyst | n/a | sequential |
| `[FORM-SUNBURST]` | Sunburst | Show proportion within nested rings | rare | analyst | n/a | categorical |
| `[FORM-TREE]` | Tree layout | Show structure and parent-child relationships | situational | general | n/a | categorical |
| `[FORM-RADAR]` | Radar or radial chart | Profile an entity across 5 or more dimensions | rare | analyst | zero_required | categorical |
| `[FORM-HISTOGRAM]` | Histogram | Show how often values fall in ranges | situational | general | zero_required | single |
| `[FORM-BOX]` | Box plot | Compare spread across groups | rare | analyst | zero_optional | single |
| `[FORM-VIOLIN]` | Violin plot | Show distribution shape and density per group | rare | analyst | zero_optional | single |
| `[FORM-KDE]` | KDE (density) plot | Show a smooth distribution to compare several | rare | analyst | zero_required | categorical |
| `[FORM-SCATTER]` | Scatter plot | Show correlation and outliers between two measures | situational | analyst | zero_optional | categorical |
| `[FORM-BUBBLE]` | Bubble chart | Show a third measure as size on a scatter | rare | analyst | zero_optional | categorical |
| `[FORM-PAIRPLOT]` | Pairplot | Find correlations across many variables | rare | analyst | zero_optional | single |
| `[FORM-HEATMAP]` | Heatmap | Scan a value across two categorical dimensions | core | general | n/a | sequential |
| `[FORM-GANTT]` | Timeline or Gantt chart | Show tasks across a time range | situational | general | n/a | categorical |
| `[FORM-FUNNEL]` | Funnel (bars with step conversion) | Show drop-off through ordered stages | core | general | zero_required | ordinal |
| `[FORM-SANKEY]` | Sankey diagram | Show flows of a conserved quantity between categories | situational | analyst | n/a | categorical |
| `[FORM-FLOWCHART]` | Flowchart | Document a process or decision logic | situational | general | n/a | none |
| `[FORM-NETWORK]` | Network or force-directed graph | Show who connects to whom | rare | analyst | n/a | categorical |
| `[FORM-CHORD]` | Chord diagram | Show pairwise flows among a few groups | rare | analyst | n/a | categorical |
| `[FORM-CHOROPLETH]` | Choropleth map | Show a rate by region | situational | general | n/a | sequential |
| `[FORM-CARTOGRAM]` | Cartogram | Show a value by distorting region size | rare | analyst | n/a | sequential |

## Figure

### `[FORM-STAT-TILE]` Stat tile

- **Job:** Show one current value with its change
- **Use when:** One headline number; a KPI row of 3 to 6 numbers; the number is the answer.
- **Avoid when:** You need to see shape over time (add a sparkline) or compare many categories.
- **Baseline:** n/a
- **Limits:** Label, value, delta vs a named period, optional 12-point sparkline. One hero per view at 48px or more.
- **Color job:** status · **Audience:** general · **Fit:** core
- **Build:** Card with a value and an optional tiny AreaChart or LineChart with no axes; not a chart library job.
- **Accessibility:** Value, delta and period are real text. The arrow and sign carry direction, not just color.

### `[FORM-METER]` Meter or progress bar

- **Job:** Show one ratio against a limit
- **Use when:** Quota used, goal progress, capacity.
- **Avoid when:** Two-slice pie; more than one measure (use a bullet graph).
- **Baseline:** zero_required
- **Limits:** Fill carries severity (accent, warning, danger); the unfilled track is a lighter step of the same ramp.
- **Color job:** status · **Audience:** general · **Fit:** core
- **Build:** Progress component, or RadialBarChart for a ring.
- **Accessibility:** role progressbar or meter with aria-valuenow, valuemin, valuemax and a text value.
- **Playbook section:** 9

### `[FORM-SPARKLINE]` Sparkline

- **Job:** Trend at a glance inside a table row or tile
- **Use when:** Tables and stat tiles where the number matters and the trend is context.
- **Avoid when:** The reader needs exact values or to compare across rows precisely.
- **Baseline:** zero_optional
- **Limits:** No axes or grid. Muted line, accent end-dot. About 12 to 30 points. Links to the full chart.
- **Color job:** single · **Audience:** general · **Fit:** core
- **Build:** Tiny LineChart or AreaChart in a fixed-height cell, no axes, no tooltip unless on hover.
- **Accessibility:** aria-hidden when the adjacent value and delta carry the meaning, else a text summary.
- **Playbook section:** 3

### `[FORM-TABLE]` Table (with pivot variant)

- **Job:** Look up exact values or compare many attributes
- **Use when:** Exact lookup, many columns, more than about 7 meaningful classes, or the table twin of any chart. Pivot tables let analysts regroup rows, columns and values.
- **Avoid when:** The reader needs the shape, not the numbers.
- **Baseline:** n/a
- **Limits:** Right-align numbers, tabular-nums, sort and search past about 25 rows, sticky header. Inline bars or sparklines are welcome.
- **Color job:** none · **Audience:** general · **Fit:** core
- **Build:** Table or DataTable (see vois-components JOB-DISPLAY-DATA).
- **Accessibility:** Real table semantics: th scope, caption.
- **Playbook section:** 1

## Compare

### `[FORM-BAR-V]` Column chart (vertical bar)

- **Job:** Compare values across a few categories or discrete periods
- **Use when:** Up to about 12 categories with short labels, or a natural order such as months.
- **Avoid when:** Long labels, rankings of many items (use horizontal), a continuous trend (use a line).
- **Baseline:** zero_required
- **Limits:** Bars at most 24px thick, 4px rounded data end, 2px gap. Value on the cap when labels fit.
- **Color job:** single · **Audience:** general · **Fit:** core
- **Build:** BarChart, Bar radius top, CartesianGrid vertical false.
- **Accessibility:** Per-bar tooltip on hover and focus; table view.
- **Playbook section:** 4.1

### `[FORM-BAR-H]` Bar chart (horizontal)

- **Job:** Rank or compare categories with long labels
- **Use when:** Top N lists, long category names, 6 to 25 items.
- **Avoid when:** Time series.
- **Baseline:** zero_required
- **Limits:** Sort descending unless ordered. Label at the bar end. Top 10 plus Other.
- **Color job:** single · **Audience:** general · **Fit:** core
- **Build:** BarChart layout='vertical' with XAxis type number and YAxis type category.
- **Accessibility:** Labels are real text; tooltip on focus; table view.
- **Playbook section:** 4.2

### `[FORM-BAR-GROUPED]` Grouped bar chart

- **Job:** Compare 2 to 3 series within each category
- **Use when:** This year vs last year per quarter; a handful of categories.
- **Avoid when:** More than 3 series per group or more than about 6 groups.
- **Baseline:** zero_required
- **Limits:** Up to 3 series. Legend required.
- **Color job:** categorical · **Audience:** general · **Fit:** core
- **Build:** BarChart with several Bar and no stackId.
- **Accessibility:** Legend plus tooltip listing all series; table view.
- **Playbook section:** 4.4

### `[FORM-BAR-STACKED]` Stacked bar chart

- **Job:** Show a total and its parts
- **Use when:** Totals matter and there are 5 or fewer parts, such as sales by region per quarter.
- **Avoid when:** Reading exact middle segments is the task (only the baseline segment shares an origin).
- **Baseline:** zero_required
- **Limits:** 5 or fewer segments, 2px surface gaps, order matches legend. Label only segments that fit.
- **Color job:** categorical · **Audience:** general · **Fit:** core
- **Build:** BarChart with Bar stackId.
- **Accessibility:** Tooltip lists every segment; table view.
- **Playbook section:** 4.3

### `[FORM-BAR-STACKED-PCT]` 100% stacked bar

- **Job:** Compare shares of a whole across groups
- **Use when:** Shares matter, totals don't.
- **Avoid when:** Totals matter; more than 5 parts.
- **Baseline:** zero_required
- **Limits:** Axis 0 to 100 percent. Show totals in the table.
- **Color job:** categorical · **Audience:** general · **Fit:** core
- **Build:** BarChart with Bar stackId and stackOffset expand.
- **Accessibility:** Tooltip shows the percent and the count.
- **Playbook section:** 4.5

### `[FORM-BAR-DIVERGING]` Diverging (positive and negative) bar

- **Job:** Show performance above or below a baseline
- **Use when:** Variance to target, profit and loss, sentiment, change vs last period.
- **Avoid when:** All values are the same sign.
- **Baseline:** zero_required
- **Limits:** Centered on the baseline. Two opposing hues or one accent plus gray. Never red and green alone.
- **Color job:** diverging · **Audience:** general · **Fit:** core
- **Build:** BarChart with negative values, ReferenceLine y 0, Cell fill by sign.
- **Accessibility:** Sign in the label and tooltip; color is a second channel.
- **Playbook section:** 4.6

### `[FORM-BAR-DIVERGING-STACKED]` Diverging stacked bar

- **Job:** Show shares on an ordered scale such as Likert
- **Use when:** Strongly disagree to strongly agree.
- **Avoid when:** Unordered categories.
- **Baseline:** n/a
- **Limits:** Centered on the neutral midpoint. Ordered ramp from one pole to the other.
- **Color job:** diverging · **Audience:** analyst · **Fit:** situational
- **Build:** BarChart layout vertical with offset stacks (custom data shift).
- **Accessibility:** Labels at the bar ends and in the table view.

### `[FORM-WATERFALL]` Waterfall chart

- **Job:** Show how increases and decreases build to a total
- **Use when:** Revenue to profit bridges, cash movement, variance explanations.
- **Avoid when:** No running total.
- **Baseline:** zero_required
- **Limits:** Start, steps, end. Increase and decrease use a status or diverging pair plus sign labels.
- **Color job:** diverging · **Audience:** general · **Fit:** situational
- **Build:** BarChart with a transparent offset Bar and a visible delta Bar.
- **Accessibility:** Sign and value in the label, table view with step and running total.
- **Playbook section:** 4.7

### `[FORM-PARETO]` Pareto chart

- **Job:** Prioritize the vital few causes
- **Use when:** Issue triage where about 20 percent of causes drive 80 percent of effects.
- **Avoid when:** No cumulative question.
- **Baseline:** zero_required
- **Limits:** Bars descending, cumulative-percent line. The right scale is fixed at 0 to 100 percent, labeled, and is the only sanctioned two-scale chart (see DV-HONEST-002). Mark it with a dataviz-allow comment. If in doubt, show cumulative percent as a table column.
- **Color job:** single · **Audience:** analyst · **Fit:** situational
- **Build:** ComposedChart with Bar and Line.
- **Accessibility:** Table view with cumulative percent.
- **Playbook section:** 4.8

### `[FORM-DUMBBELL]` Dumbbell (before and after)

- **Job:** Show change per item between two states
- **Use when:** Before and after per team, this year vs last per region.
- **Avoid when:** More than about 15 items or more than two states.
- **Baseline:** zero_optional
- **Limits:** Two dots joined by a line, one hue in two shades. Sorted by change.
- **Color job:** single · **Audience:** analyst · **Fit:** situational
- **Build:** Custom SVG or ScatterChart with ErrorBar.
- **Accessibility:** Table view with both values and the delta.

### `[FORM-BULLET]` Bullet graph

- **Job:** Compare actual to target across several metrics
- **Use when:** Scorecards: actual, target and poor, average, good bands in a compact bar.
- **Avoid when:** One metric (use a meter).
- **Baseline:** zero_required
- **Limits:** Actual bar, target tick, 3 muted bands from one ramp. Include a text value.
- **Color job:** sequential · **Audience:** general · **Fit:** situational
- **Build:** Custom SVG, or stacked Bar plus ReferenceLine.
- **Accessibility:** Text for actual, target and status.
- **Playbook section:** 9

### `[FORM-RADAR]` Radar or radial chart

- **Job:** Profile an entity across 5 or more dimensions
- **Use when:** Skill mapping, performance evaluation for 1 to 3 entities on the same scale.
- **Avoid when:** General audiences; precise comparison; unordered axes where area misleads.
- **Baseline:** zero_required
- **Limits:** Same scale on every axis, 6 axes or fewer for readability, 3 series or fewer.
- **Color job:** categorical · **Audience:** analyst · **Fit:** rare
- **Build:** RadarChart, RadialBarChart.
- **Accessibility:** Table view with every axis value.
- **Playbook section:** 7

## Time

### `[FORM-LINE]` Line chart

- **Job:** Show a trend over time for one series
- **Use when:** Continuous time series, rate of change matters, many points.
- **Avoid when:** Few discrete periods whose magnitudes matter (columns); parts of a whole.
- **Baseline:** zero_optional
- **Limits:** 2px line, linear or monotone, end-dot of at least 8px, solid hairline grid. State a non-zero axis.
- **Color job:** single · **Audience:** general · **Fit:** core
- **Build:** LineChart, Line type monotone, dot false, activeDot.
- **Accessibility:** Crosshair tooltip on hover and focus; table view; accessibilityLayer.
- **Playbook section:** 5.1

### `[FORM-LINE-MULTI]` Multi-line chart

- **Job:** Compare 2 to 4 series over time on one scale
- **Use when:** Same unit, same scale, 2 to 4 series, optionally the previous period as a muted dotted line.
- **Avoid when:** Different scales (never dual axis); more than 5 series (emphasis or small multiples).
- **Baseline:** zero_optional
- **Limits:** Legend always, direct end-labels for up to 4. One tooltip listing all series.
- **Color job:** categorical · **Audience:** general · **Fit:** core
- **Build:** LineChart with several Line, ChartLegend, shared ChartTooltip.
- **Accessibility:** Legend as buttons, tooltip on focus, table view.
- **Playbook section:** 5.2

### `[FORM-STEP-LINE]` Step line

- **Job:** Show a value that holds between events
- **Use when:** Plan tier, stock level, provisioned resources, cumulative options.
- **Avoid when:** Continuous measurements.
- **Baseline:** zero_optional
- **Limits:** Line type step or stepAfter.
- **Color job:** single · **Audience:** general · **Fit:** situational
- **Build:** Line type stepAfter.
- **Accessibility:** Tooltip at each change; table view.

### `[FORM-AREA]` Area chart

- **Job:** Show cumulative volume over time for one series
- **Use when:** Volume is the message and zero is meaningful.
- **Avoid when:** Several overlapping series.
- **Baseline:** zero_required
- **Limits:** Fill is the series hue at about 10 percent; the edge is a 2px line.
- **Color job:** single · **Audience:** general · **Fit:** core
- **Build:** AreaChart, Area type monotone, fillOpacity about 0.1.
- **Accessibility:** Same as line.
- **Playbook section:** 6.1

### `[FORM-AREA-STACKED]` Stacked area chart

- **Job:** Show a total and its parts over many periods
- **Use when:** Parts of a whole across many time points; totals matter; 5 or fewer parts.
- **Avoid when:** Reading an inner part's trend precisely; more than 5 parts.
- **Baseline:** zero_required
- **Limits:** Order so the most important part sits at the baseline.
- **Color job:** categorical · **Audience:** general · **Fit:** situational
- **Build:** AreaChart with Area stackId.
- **Accessibility:** Tooltip lists all; table view.
- **Playbook section:** 6.1

### `[FORM-AREA-PCT]` 100% stacked area

- **Job:** Show how shares change over time
- **Use when:** Mix shifts matter, totals don't.
- **Avoid when:** Totals matter.
- **Baseline:** zero_required
- **Limits:** Axis 0 to 100 percent.
- **Color job:** categorical · **Audience:** general · **Fit:** situational
- **Build:** AreaChart with stackOffset expand.
- **Accessibility:** Tooltip shows percent and count.
- **Playbook section:** 6.3

### `[FORM-AREA-DIVERGING]` Positive and negative area

- **Job:** Show above and below a baseline over time
- **Use when:** Net flows, variance to a target over time.
- **Avoid when:** All values are the same sign.
- **Baseline:** zero_required
- **Limits:** Centered on zero, two opposing hues.
- **Color job:** diverging · **Audience:** analyst · **Fit:** situational
- **Build:** AreaChart with split gradient at 0.
- **Accessibility:** Sign in the tooltip.
- **Playbook section:** 6.2

### `[FORM-CANDLESTICK]` Candlestick or OHLC

- **Job:** Show open, high, low and close per session
- **Use when:** Prices for stocks, commodities, currencies.
- **Avoid when:** Anything that is not OHLC data.
- **Baseline:** zero_optional
- **Limits:** Net gain and loss use a diverging pair plus fill versus hollow.
- **Color job:** diverging · **Audience:** analyst · **Fit:** situational
- **Build:** ComposedChart with custom shape.
- **Accessibility:** Tooltip with O, H, L, C; table view.
- **Playbook section:** 17

## Technique

### `[FORM-SMALL-MULTIPLES]` Small multiples

- **Job:** Compare many series or measures without a second axis
- **Use when:** Different scales, more than about 5 series, or a 9th series.
- **Avoid when:** Two series that share a scale (use a multi-line).
- **Baseline:** zero_optional
- **Limits:** Same chart repeated, shared scales or stated otherwise, shared crosshair, one legend.
- **Color job:** single · **Audience:** general · **Fit:** core
- **Build:** One ChartContainer per panel in a CSS grid.
- **Accessibility:** Each panel has a title and a text alternative.

### `[FORM-EMPHASIS]` Emphasis (one accent, rest gray)

- **Job:** Make one series the story among many
- **Use when:** The title names one series and the rest are context.
- **Avoid when:** Every series is the point.
- **Baseline:** zero_optional
- **Limits:** One accent hue, de-emphasis gray for the rest. Label the accent series.
- **Color job:** single · **Audience:** general · **Fit:** core
- **Build:** Line or Bar with per-series stroke from tokens.
- **Accessibility:** Direct label on the accent series; table view.

## Part

### `[FORM-DONUT]` Donut chart

- **Job:** Part-to-whole glance with a total
- **Use when:** 3 to 6 segments that sum to 100 percent, with the total in the hole.
- **Avoid when:** Comparing close values; more than 6 segments; more than one whole.
- **Baseline:** n/a
- **Limits:** Sort descending from 12 o'clock. Values in the legend.
- **Color job:** categorical · **Audience:** general · **Fit:** core
- **Build:** PieChart, Pie innerRadius, Label in the center.
- **Accessibility:** Legend with values; table view.
- **Playbook section:** 2.2

### `[FORM-PIE]` Pie chart

- **Job:** Part-to-whole glance
- **Use when:** 3 to 6 segments when the donut hole is not needed.
- **Avoid when:** Close values; more than 6 segments; 2 segments (use a stat).
- **Baseline:** n/a
- **Limits:** Prefer the donut.
- **Color job:** categorical · **Audience:** general · **Fit:** situational
- **Build:** PieChart, Pie.
- **Accessibility:** As donut.
- **Playbook section:** 2.1

### `[FORM-WAFFLE]` Waffle or square chart

- **Job:** Read a share in single percentage points
- **Use when:** A 10 by 10 grid where each square is 1 percent.
- **Avoid when:** Many categories.
- **Baseline:** n/a
- **Limits:** 100 cells, 1 to 4 categories, one hue ramp or categorical.
- **Color job:** categorical · **Audience:** general · **Fit:** situational
- **Build:** Custom grid of divs or SVG rects.
- **Accessibility:** Text value and legend; table view.
- **Playbook section:** 2.3

## Hierarchy

### `[FORM-TREEMAP]` Treemap

- **Job:** Show proportion within nested categories
- **Use when:** Many items with a hierarchy and a size measure, such as a portfolio by sector.
- **Avoid when:** Precise comparison; more than 2 levels.
- **Baseline:** n/a
- **Limits:** Size is the measure, color is a second measure on a sequential or diverging ramp with a scale key.
- **Color job:** sequential · **Audience:** analyst · **Fit:** situational
- **Build:** Treemap.
- **Accessibility:** Labels inside tiles when they fit; table view.
- **Playbook section:** 20

### `[FORM-SUNBURST]` Sunburst

- **Job:** Show proportion within nested rings
- **Use when:** Budget allocation or navigation paths with 2 to 4 levels.
- **Avoid when:** General audience.
- **Baseline:** n/a
- **Limits:** Concentric rings, one per level.
- **Color job:** categorical · **Audience:** analyst · **Fit:** rare
- **Build:** Custom SVG or d3.
- **Accessibility:** Table view with path.
- **Playbook section:** 20.2

### `[FORM-TREE]` Tree layout

- **Job:** Show structure and parent-child relationships
- **Use when:** Org charts, file trees, genealogy.
- **Avoid when:** You need proportion.
- **Baseline:** n/a
- **Limits:** Nodes and edges; color for team or type.
- **Color job:** categorical · **Audience:** general · **Fit:** situational
- **Build:** Custom, or a nested list with expand.
- **Accessibility:** Use tree semantics (role tree) or nested lists.
- **Playbook section:** 20.1

## Distribution

### `[FORM-HISTOGRAM]` Histogram

- **Job:** Show how often values fall in ranges
- **Use when:** Duration, latency or amount distributions for a general audience.
- **Avoid when:** Categories (use a bar chart).
- **Baseline:** zero_required
- **Limits:** Equal-width adjacent bars, a stated bucket size, annotate modes.
- **Color job:** single · **Audience:** general · **Fit:** situational
- **Build:** BarChart with barCategoryGap 0 on pre-bucketed data.
- **Accessibility:** Table view of bucket and count.
- **Playbook section:** 8

### `[FORM-BOX]` Box plot

- **Job:** Compare spread across groups
- **Use when:** Min, quartiles, median, max across groups or periods; outliers matter.
- **Avoid when:** General audience without a legend explaining the box.
- **Baseline:** zero_optional
- **Limits:** Five-number summary, outlier dots, a one-line how-to-read.
- **Color job:** single · **Audience:** analyst · **Fit:** rare
- **Build:** ComposedChart with custom shape.
- **Accessibility:** Table view with five numbers per group.
- **Playbook section:** 14

### `[FORM-VIOLIN]` Violin plot

- **Job:** Show distribution shape and density per group
- **Use when:** Analyst comparing multimodal distributions.
- **Avoid when:** Anyone unfamiliar; use a histogram or box plot.
- **Baseline:** zero_optional
- **Limits:** Outer shape is density, inner marks are quartiles and the median.
- **Color job:** single · **Audience:** analyst · **Fit:** rare
- **Build:** Custom SVG or d3.
- **Accessibility:** Table view.
- **Playbook section:** 15

### `[FORM-KDE]` KDE (density) plot

- **Job:** Show a smooth distribution to compare several
- **Use when:** Comparing 2 to 3 distributions without binning artifacts.
- **Avoid when:** General audience; small samples where the smooth curve implies more than the data supports.
- **Baseline:** zero_required
- **Limits:** 3 curves or fewer, state the bandwidth.
- **Color job:** categorical · **Audience:** analyst · **Fit:** rare
- **Build:** AreaChart on precomputed density.
- **Accessibility:** Table view.
- **Playbook section:** 16

## Relationship

### `[FORM-SCATTER]` Scatter plot

- **Job:** Show correlation and outliers between two measures
- **Use when:** Two numeric measures across many items.
- **Avoid when:** One point over time (line).
- **Baseline:** zero_optional
- **Limits:** 3 series or fewer when grouped (all pairs can be neighbors). Hit areas of at least 24px or a nearest-point layer.
- **Color job:** categorical · **Audience:** analyst · **Fit:** situational
- **Build:** ScatterChart.
- **Accessibility:** Table view; nearest-point keyboard navigation.
- **Playbook section:** 10

### `[FORM-BUBBLE]` Bubble chart

- **Job:** Show a third measure as size on a scatter
- **Use when:** Three numeric measures where size is meaningful.
- **Avoid when:** Size differences are small or precise.
- **Baseline:** zero_optional
- **Limits:** Size by area, not radius. Cap overlap, use transparency.
- **Color job:** categorical · **Audience:** analyst · **Fit:** rare
- **Build:** ScatterChart with ZAxis.
- **Accessibility:** Table view.
- **Playbook section:** 11

### `[FORM-PAIRPLOT]` Pairplot

- **Job:** Find correlations across many variables
- **Use when:** Data scientists screening 4 to 6 variables.
- **Avoid when:** Dashboards for a business audience.
- **Baseline:** zero_optional
- **Limits:** Grid of scatters off the diagonal, distributions on it.
- **Color job:** single · **Audience:** analyst · **Fit:** rare
- **Build:** Custom grid of small multiples.
- **Accessibility:** Table of correlation coefficients.
- **Playbook section:** 12

### `[FORM-HEATMAP]` Heatmap

- **Job:** Scan a value across two categorical dimensions
- **Use when:** Time of day by day of week, survey criteria by participant, correlation matrices.
- **Avoid when:** Fewer than about 12 cells (use a table).
- **Baseline:** n/a
- **Limits:** Sequential single hue, or diverging around a meaningful center. Always a scale legend. Print the value in cells when they fit.
- **Color job:** sequential · **Audience:** general · **Fit:** core
- **Build:** Not in Recharts: a CSS grid of divs or custom SVG rects with tokens.
- **Accessibility:** Cell values in the table view; each cell focusable if interactive.
- **Playbook section:** 13

## Schedule

### `[FORM-GANTT]` Timeline or Gantt chart

- **Job:** Show tasks across a time range
- **Use when:** Project plans with swim lanes, milestones, dependencies.
- **Avoid when:** No scheduling question.
- **Baseline:** n/a
- **Limits:** Rows for tasks, bars for duration. Today line, milestones as markers.
- **Color job:** categorical · **Audience:** general · **Fit:** situational
- **Build:** Custom, or a Gantt component from the workspace manifest.
- **Accessibility:** A list or table of tasks with start and end dates.
- **Playbook section:** 18

## Flow

### `[FORM-FUNNEL]` Funnel (bars with step conversion)

- **Job:** Show drop-off through ordered stages
- **Use when:** Conversion, onboarding, checkout, routing.
- **Avoid when:** Stages that aren't strictly sequential.
- **Baseline:** zero_required
- **Limits:** Aligned bars, one-hue ordinal ramp, step conversion and abandonment between stages, guard counts under the threshold.
- **Color job:** ordinal · **Audience:** general · **Fit:** core
- **Build:** BarChart with Funnel-like layout, or Recharts FunnelChart styled as bars.
- **Accessibility:** Table with step, count, conversion and abandonment.

### `[FORM-SANKEY]` Sankey diagram

- **Job:** Show flows of a conserved quantity between categories
- **Use when:** Money, traffic or users moving between about 15 or fewer nodes.
- **Avoid when:** More than about 15 nodes (use a table); non-conserved flows.
- **Baseline:** n/a
- **Limits:** Link width equals quantity. Highlight a path to isolate it.
- **Color job:** categorical · **Audience:** analyst · **Fit:** situational
- **Build:** Sankey.
- **Accessibility:** Table of source, target, value.
- **Playbook section:** 22

### `[FORM-FLOWCHART]` Flowchart

- **Job:** Document a process or decision logic
- **Use when:** Steps and yes or no branches.
- **Avoid when:** Quantities.
- **Baseline:** n/a
- **Limits:** Diagram, not a chart. Boxes for steps, diamonds for decisions.
- **Color job:** none · **Audience:** general · **Fit:** situational
- **Build:** Not a chart: use a diagram component or a figure.
- **Accessibility:** Ordered list alternative.
- **Playbook section:** 21

### `[FORM-NETWORK]` Network or force-directed graph

- **Job:** Show who connects to whom
- **Use when:** Connectivity itself is the question and nodes number under about 100.
- **Avoid when:** Anything a table or bar chart answers.
- **Baseline:** n/a
- **Limits:** Cluster by color, size by degree, label the hubs only.
- **Color job:** categorical · **Audience:** analyst · **Fit:** rare
- **Build:** Custom (d3-force).
- **Accessibility:** An adjacency table or list.
- **Playbook section:** 23.1

### `[FORM-CHORD]` Chord diagram

- **Job:** Show pairwise flows among a few groups
- **Use when:** Trade or resource flows among about 12 or fewer groups.
- **Avoid when:** General audience.
- **Baseline:** n/a
- **Limits:** Arcs for groups, ribbons for flows.
- **Color job:** categorical · **Audience:** analyst · **Fit:** rare
- **Build:** Custom (d3-chord).
- **Accessibility:** Matrix table.
- **Playbook section:** 23.2

## Geo

### `[FORM-CHOROPLETH]` Choropleth map

- **Job:** Show a rate by region
- **Use when:** Normalized values (per capita, rate) across regions the audience can place.
- **Avoid when:** Raw counts (big regions look important by area alone).
- **Baseline:** n/a
- **Limits:** Sequential ramp, scale legend, a ranked bar list beside it.
- **Color job:** sequential · **Audience:** general · **Fit:** situational
- **Build:** Not in Recharts: a map component from the workspace manifest.
- **Accessibility:** Ranked table of regions.
- **Playbook section:** 19.1

### `[FORM-CARTOGRAM]` Cartogram

- **Job:** Show a value by distorting region size
- **Use when:** The audience knows the geography well and area should equal the value.
- **Avoid when:** Almost always; the distortion becomes unreadable.
- **Baseline:** n/a
- **Limits:** Pair with a ranked table.
- **Color job:** sequential · **Audience:** analyst · **Fit:** rare
- **Build:** Custom.
- **Accessibility:** Ranked table.
- **Playbook section:** 19.2


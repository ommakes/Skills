<!-- GENERATED from data/dashboard-patterns.json by scripts/build-reference.mjs. Edit the JSON, then run `node vois-dataviz/scripts/build-reference.mjs`. Do not edit by hand. -->

# Dashboard patterns

## `[DASH-Q-TYPE]` Which dashboard template?

**Who reads it, how often, and what do they do next?**

- A leader scans it in under 30 seconds to know if things are OK → `[DASH-EXEC]` (Executive summary)
- An operator watches live state and reacts to thresholds → `[DASH-MONITOR]` (Operational monitor)
- An analyst asks new questions of the data each visit → `[DASH-EXPLORER]` (Analyst explorer)
- It is a weekly or monthly narrative that gets exported or emailed → `[DASH-REPORT]` (Narrative report)
- Users assemble their own set of widgets → `[DASH-BUILDER]` (Customizable widget board)
- The reader opened one metric and wants its full story → `[DASH-METRIC-DETAIL]` (Single metric detail)

## Page templates

### `[DASH-EXEC]` Executive summary

**When:** Audience is a leader; the question is 'are we on track?'; read in seconds; low interactivity.

**Structure, in order**

1. Filter row: date range with presets and a comparison control
2. Hero KPI row: 3 to 6 stat tiles with deltas, one hero
3. Primary trend: one wide line or area chart, KPI tabs optional
4. Breakdowns: two to four cards (top N bars, one donut, one table with sparklines)
5. Footer links: See all and Export

- **Build from:** Card, Tabs, Select, Popover, Calendar, Table, Button
- **Must follow:** `[DV-PURPOSE-002]`, `[DV-PURPOSE-003]`, `[DV-LAYOUT-001]`, `[DV-LAYOUT-004]`, `[DV-LAYOUT-005]`, `[DV-CONTEXT-002]`, `[DV-FILTER-004]`
- **Avoid:** Twelve equal-weight cards; Specialist forms such as violin or pairplot; Per-chart date pickers
- **Seen in:** [MOB-08](https://mobbin.com/screens/f8548434-b4ef-4e67-a360-72feb07a9003) Semrush, [MOB-47](https://mobbin.com/screens/5ff3c997-7159-4bd2-aff3-368075eef01b) Ghost, [MOB-05](https://mobbin.com/screens/0bb8b25f-0c3d-47c3-b20a-1447e7dbab9e) Whop, [MOB-03](https://mobbin.com/screens/205aefea-2dfc-4668-9af7-bc4921da1762) Mintlify

### `[DASH-MONITOR]` Operational monitor

**When:** Audience is an operator; values are live or near live; thresholds and alerts matter; short windows (an hour to a week).

**Structure, in order**

1. Filter row: range (short presets), group by, source, refresh control, freshness stamp
2. Status strip: current state tiles with thresholds and status icons
3. Small multiples: one chart per signal, shared x-axis and crosshair
4. Breakdown table with sparkline columns and a column menu to show or hide them
5. Alerts or events list linked to chart annotations

- **Build from:** Card, ToggleGroup, Select, Table, Badge, Skeleton, Tooltip
- **Must follow:** `[DV-CONTEXT-004]`, `[DV-CONSIST-004]`, `[DV-SUSTAIN-003]`, `[DV-STATE-005]`, `[DV-STATE-006]`, `[DV-HONEST-008]`, `[DV-COLOR-006]`, `[DV-FILTER-008]`
- **Avoid:** Re-animating on every poll; Flat zero charts for signals that aren't collected; Red and green with no icon or label
- **Seen in:** [MOB-02](https://mobbin.com/screens/b43a980d-6a77-48d5-b764-d697475a157c) LangChain, [MOB-14](https://mobbin.com/screens/9eda3ce4-e6c6-420b-8aa0-a339abb8bb20) Coda, [MOB-32](https://mobbin.com/screens/ef455d28-04ea-46f4-a289-cb6c283ea929) PlanetScale, [MOB-48](https://mobbin.com/screens/a9510b9f-8dc6-45d7-a9b3-61af96191e4f) Railway, [MOB-21](https://mobbin.com/screens/4180dd3e-e182-432a-9042-8dee319000d2) Basedash

### `[DASH-EXPLORER]` Analyst explorer

**When:** Audience is an analyst; the question changes each visit; builds queries; compares segments and periods.

**Structure, in order**

1. Toolbar row: range, comparison, granularity, chart type (5 or fewer), anomaly or forecast toggle, data freshness
2. Query panel (side): metrics, filter, breakdown, compare
3. Primary chart with legend chips that toggle series
4. Breakdown table beneath with visibility checkboxes, min, average, max, change and a sparkline column
5. Save, share and export in the header

- **Build from:** Card, Tabs, ToggleGroup, Select, Popover, Calendar, Checkbox, Table, Sheet, DropdownMenu
- **Must follow:** `[DV-INTERACT-003]`, `[DV-INTERACT-005]`, `[DV-INTERACT-008]`, `[DV-INTERACT-010]`, `[DV-LAYOUT-007]`, `[DV-FILTER-006]`, `[DV-FILTER-007]`, `[DV-A11Y-004]`, `[DV-CONTEXT-004]`
- **Avoid:** A 22-type chart picker; A group-by that produces 16 hues; Filters that reset on reload
- **Seen in:** [MOB-42](https://mobbin.com/screens/2018e7b8-e4b1-4231-ab91-c66557122a98) Amplitude, [MOB-40](https://mobbin.com/screens/b6e8320c-6bfb-461b-aeff-a331e28061c9) Steep, [MOB-15](https://mobbin.com/screens/4ee5bf3f-d6ba-4724-88c8-f9bc8d74cfd9) Fey, [MOB-38](https://mobbin.com/screens/84735c71-690d-4cf0-87e1-d6df98e442df) Notion, [MOB-39](https://mobbin.com/screens/fe4fee7b-86cb-4916-934f-2ea0ce6de346) Hex, [MOB-57](https://mobbin.com/screens/5c9722dd-e8e6-4ed8-b06c-687ac8d20b05) Amplitude

### `[DASH-REPORT]` Narrative report

**When:** Output is read weekly or monthly, exported, emailed or printed; the 'so what' matters more than exploration.

**Structure, in order**

1. Title, period and scope, locked filters stated in text
2. One-sentence takeaway per section
3. Charts with annotations on anomalies and explained dips
4. Text card for definitions and methodology
5. Export CSV and PDF; print styles

- **Build from:** Card, Table, Button, Separator
- **Must follow:** `[DV-CONTEXT-001]`, `[DV-CONTEXT-003]`, `[DV-CONTEXT-005]`, `[DV-CONTEXT-006]`, `[DV-SUSTAIN-004]`, `[DV-A11Y-009]`, `[DV-COLOR-008]`
- **Avoid:** Color-only encoding that dies in a greyscale print; Charts with no caption
- **Seen in:** [MOB-13](https://mobbin.com/screens/bef56b40-0756-4135-a99c-72692615331b) Mixpanel, [MOB-19](https://mobbin.com/screens/a3c353b2-54c2-4451-88f3-d3fe328bae27) Linktree, [MOB-45](https://mobbin.com/screens/5b991815-9b72-4371-81fb-b43cd626bec6) Churnkey

### `[DASH-BUILDER]` Customizable widget board

**When:** Users compose their own dashboard from widgets and may share it.

**Structure, in order**

1. View mode: the finished board, filters row, auto-refresh and freshness
2. Edit mode: Add widget, drag handles, grid drop slots, dashboard variables panel, Done editing
3. Widget configuration panel: type (5 or fewer valid), axes, sort, color, legend and tooltip toggles
4. Empty board: dashed 'Add your first chart' slot

- **Build from:** Card, Sheet, Select, Switch, Button, Popover, Dialog
- **Must follow:** `[DV-LAYOUT-008]`, `[DV-STATE-002]`, `[DV-STATE-004]`, `[DV-INTERACT-008]`, `[DV-FILTER-001]`, `[DV-SUSTAIN-001]`
- **Avoid:** Edit controls visible in view mode; A blank card when a widget is misconfigured
- **Seen in:** [MOB-29](https://mobbin.com/screens/a5dd163e-dbcd-4ca2-90be-f35f7a09dd72) Twenty, [MOB-27](https://mobbin.com/screens/3dd361a6-4db4-4de0-9ab2-ea1e64c2123a) Supabase, [MOB-25](https://mobbin.com/screens/b3c6ee02-54cd-4d44-8940-db582022836d) Plane, [MOB-21](https://mobbin.com/screens/4180dd3e-e182-432a-9042-8dee319000d2) Basedash, [MOB-37](https://mobbin.com/screens/8f15ac15-37aa-4376-b9c1-d7dafee29930) Zendesk

### `[DASH-METRIC-DETAIL]` Single metric detail

**When:** The reader drilled into one metric from a card or a table row.

**Structure, in order**

1. Header: metric name, definition tooltip, current value and delta
2. Range and grain controls beneath the header
3. Primary chart with target or benchmark lines and annotations
4. Data table of record beneath, also the table twin, with export
5. Optional edit surface for manual data points

- **Build from:** Sheet, Card, Table, Tooltip, Tabs, Button
- **Must follow:** `[DV-CONTEXT-003]`, `[DV-CONTEXT-005]`, `[DV-A11Y-004]`, `[DV-FILTER-005]`, `[DV-INTERACT-004]`
- **Avoid:** A chart with no way to see the numbers
- **Seen in:** [MOB-36](https://mobbin.com/screens/1173ea6b-a88a-4dcf-ab36-484121c41600) TheyDo, [MOB-40](https://mobbin.com/screens/b6e8320c-6bfb-461b-aeff-a331e28061c9) Steep, [MOB-11](https://mobbin.com/screens/f4f2cebe-5496-4959-9fbb-fe37fe2a5dd6) Google Analytics, [MOB-04](https://mobbin.com/screens/8e9ffe26-ef22-4540-b5e4-101f78abf96a) Asana

## Reusable pieces

### `[DASH-KPI-TILE]` KPI tile

**When:** Any headline number.

**Structure, in order**

1. Label (sentence case, no trailing colon), with an info icon if derived
2. Value (compact: 1,284 / 12.9K / $4.2M), proportional figures
3. Delta chip: arrow, signed percent, named baseline, color by direction times whether up is good
4. Optional 12-point sparkline in the de-emphasis hue, current point in the accent
5. As a selector: selected tile outlined with aria-selected and the chart title follows

- **Build from:** Card, Badge, Tooltip, Tabs
- **Must follow:** `[DV-CONTEXT-002]`, `[DV-CLARITY-009]`, `[DV-FORM-008]`, `[DV-A11Y-001]`, `[DV-HONEST-010]`, `[DV-INTERACT-007]`
- **Avoid:** A green up-arrow on a flat zero; Bare percent with no period; Color-only delta
- **Seen in:** [MOB-05](https://mobbin.com/screens/0bb8b25f-0c3d-47c3-b20a-1447e7dbab9e) Whop, [MOB-08](https://mobbin.com/screens/f8548434-b4ef-4e67-a360-72feb07a9003) Semrush, [MOB-51](https://mobbin.com/screens/f9423573-e4eb-4e70-8968-f545da183ce5) Profound, [MOB-46](https://mobbin.com/screens/d5b2ad2a-dd83-4d6b-86fa-6edeee1991cd) Adaline, [MOB-55](https://mobbin.com/screens/4ca7b81a-9cb8-497c-a728-e66ae0487f5e) Klaviyo

### `[DASH-CHART-CARD]` Chart card

**When:** Any chart on a dashboard.

**Structure, in order**

1. Header: title (with a chevron if it drills in) and scope subtitle on the left; actions menu on the right (expand, view as table, export, edit)
2. Optional KPI value with delta above the plot
3. Plot, in a figure with a caption and accessibilityLayer
4. Legend (always for 2 or more series)
5. Footer: scope disclosure ('1 filter') and a See all link

- **Build from:** Card, DropdownMenu, ToggleGroup, Tooltip, Skeleton, Button
- **Must follow:** `[DV-LAYOUT-002]`, `[DV-INTERACT-006]`, `[DV-CONTEXT-001]`, `[DV-CONTEXT-007]`, `[DV-A11Y-003]`, `[DV-A11Y-004]`, `[DV-STATE-001]`, `[DV-STATE-003]`, `[DV-CONSIST-005]`
- **Avoid:** Hand-built cards with different action placement; A chart in a div with no accessible name
- **Seen in:** [MOB-04](https://mobbin.com/screens/8e9ffe26-ef22-4540-b5e4-101f78abf96a) Asana, [MOB-06](https://mobbin.com/screens/54de3e8b-7efb-40a8-b743-9b385558fc6b) Revolut Business, [MOB-12](https://mobbin.com/screens/8439f27d-0396-4236-96e2-ce595af04b98) Exa, [MOB-39](https://mobbin.com/screens/fe4fee7b-86cb-4916-934f-2ea0ce6de346) Hex

### `[DASH-FILTER-BAR]` Filter bar

**When:** Any dashboard with more than one card.

**Structure, in order**

1. One left-aligned row above the cards
2. Date range first (button showing the resolved range), comparison control next to it, then dimension filters, then group by
3. Active filters as removable chips with Clear all
4. Right side: freshness stamp, refresh, export

- **Build from:** Popover, Calendar, Select, Badge, Button, ToggleGroup
- **Must follow:** `[DV-FILTER-001]`, `[DV-FILTER-002]`, `[DV-FILTER-003]`, `[DV-FILTER-004]`, `[DV-FILTER-006]`, `[DV-FILTER-008]`, `[DV-CONSIST-002]`
- **Avoid:** Filters inside cards with no marker; A calendar with no presets
- **Seen in:** [MOB-05](https://mobbin.com/screens/0bb8b25f-0c3d-47c3-b20a-1447e7dbab9e) Whop, [MOB-30](https://mobbin.com/screens/7ec1f61d-bfbe-4481-9ced-eafac4916bbc) Cloudflare, [MOB-52](https://mobbin.com/screens/3768d5f8-15d6-4c56-8ecb-ec8d437914f6) Customer.io, [MOB-07](https://mobbin.com/screens/e6bc47ca-58cf-4238-88bd-ddd99bb35e4c) Revolut Business, [MOB-55](https://mobbin.com/screens/4ca7b81a-9cb8-497c-a728-e66ae0487f5e) Klaviyo

### `[DASH-DATE-RANGE]` Date range picker

**When:** The date range control inside the filter bar.

**Structure, in order**

1. Trigger shows the resolved range, plus the timezone
2. Popover: presets as rows or chips (Today, Yesterday, 7, 14, 30, 90 days, This month, Year to date, All time)
3. Two-month calendar with the range highlighted
4. Footer: custom start and end fields, Cancel, Apply
5. Comparison select beside it, 'vs previous period' by default

- **Build from:** Popover, Calendar, Select, Button, Input
- **Must follow:** `[DV-FILTER-002]`, `[DV-FILTER-003]`, `[DV-FILTER-005]`, `[DV-CONSIST-006]`, `[DV-A11Y-005]`
- **Avoid:** Making users click two dates for 'last 30 days'
- **Seen in:** [MOB-03](https://mobbin.com/screens/205aefea-2dfc-4668-9af7-bc4921da1762) Mintlify, [MOB-53](https://mobbin.com/screens/4487d391-95c4-46c2-aea5-21a8e8397c57) Kajabi, [MOB-56](https://mobbin.com/screens/3de2cbeb-e6c0-42c4-a0c9-9123a6147b0c) Vimeo, [MOB-57](https://mobbin.com/screens/5c9722dd-e8e6-4ed8-b06c-687ac8d20b05) Amplitude, [MOB-54](https://mobbin.com/screens/1d417c2e-234a-4bf0-a87e-dc65703c2b64) Calendly

### `[DASH-STATE-MATRIX]` State matrix

**When:** Every card, every dashboard.

**Structure, in order**

1. First load: skeleton in the final geometry
2. Refetch: hold the previous render at reduced opacity with an inline indicator
3. Not set up: explain what it will show and give the connect action
4. Collecting data: say what's missing, the threshold and when to check back
5. Filtered to zero: 'No results for these filters' and Clear filters
6. Real zero: draw the chart with zero
7. Error: message and Retry inside the card, others unaffected
8. Misconfigured: name what's missing and open the fix
9. Stale or partial: badge with timestamp, hatch the incomplete period

- **Build from:** Skeleton, Card, Button, Alert
- **Must follow:** `[DV-STATE-001]`, `[DV-STATE-002]`, `[DV-STATE-003]`, `[DV-STATE-004]`, `[DV-STATE-005]`, `[DV-STATE-006]`, `[DV-STATE-007]`, `[DV-FILTER-008]`, `[DV-HONEST-004]`, `[DV-HONEST-008]`
- **Avoid:** A full-page spinner; One generic 'No data' for four different situations; Six flat zero charts in a row
- **Seen in:** [MOB-22](https://mobbin.com/screens/09371ef3-f0d0-4fc9-8ab1-607ab3d0e4ab) Square, [MOB-23](https://mobbin.com/screens/db7bd952-2556-4cf4-a74d-d98ee47aebec) Gorgias, [MOB-24](https://mobbin.com/screens/e42b6c72-0dcf-49b5-9a77-af71bf04c022) Zoho CRM, [MOB-25](https://mobbin.com/screens/b3c6ee02-54cd-4d44-8940-db582022836d) Plane, [MOB-26](https://mobbin.com/screens/c331abde-5e53-4dfe-bd6e-024f07f5feb1) Sentry, [MOB-27](https://mobbin.com/screens/3dd361a6-4db4-4de0-9ab2-ea1e64c2123a) Supabase, [MOB-28](https://mobbin.com/screens/73ce6686-1274-49a3-9c1d-30a8ebf3bdc3) Visitors, [MOB-30](https://mobbin.com/screens/7ec1f61d-bfbe-4481-9ced-eafac4916bbc) Cloudflare, [MOB-31](https://mobbin.com/screens/affb78a1-d595-4bba-9884-4115ae538fe6) 15Five

### `[DASH-TABLE-SPARK]` Table with sparklines and deltas

**When:** A ranked list where each row also has a trend.

**Structure, in order**

1. Sortable header; numbers right-aligned with tabular-nums
2. Value column, delta column (arrow, sign, color), then a sparkline column at the right
3. Sparklines axisless and muted; a column menu can hide them
4. Row click or arrow opens the detail view; row actions in a menu

- **Build from:** Table, DataTable, Badge, DropdownMenu
- **Must follow:** `[DV-FORM-008]`, `[DV-A11Y-001]`, `[DV-CLARITY-009]`, `[DV-INTERACT-006]`, `[DV-INTERACT-004]`
- **Avoid:** Sparklines with their own axes and legends
- **Seen in:** [MOB-32](https://mobbin.com/screens/ef455d28-04ea-46f4-a289-cb6c283ea929) PlanetScale, [MOB-33](https://mobbin.com/screens/e39f0d0f-bed1-49ff-92e0-c53d36d34de6) Uniswap, [MOB-34](https://mobbin.com/screens/17e0d812-e07e-4fe5-98b2-dd25f65acd21) Pinterest, [MOB-35](https://mobbin.com/screens/c1c85e79-bd6a-4577-a7c4-ffa4ff67dfda) Kraken

### `[DASH-DRILLDOWN]` Drill-down

**When:** A summary links to detail.

**Structure, in order**

1. Visible affordance: chevron in the title, See all link, or on-card hint ('Click a bar to view details')
2. Click lands on a filtered table or the metric detail with the same range and filters
3. Breadcrumb or back link restores the dashboard state

- **Build from:** Button, Breadcrumb, Sheet
- **Must follow:** `[DV-INTERACT-004]`, `[DV-PURPOSE-004]`, `[DV-FILTER-006]`
- **Avoid:** A hidden click handler; A drill-down that drops the filters
- **Seen in:** [MOB-04](https://mobbin.com/screens/8e9ffe26-ef22-4540-b5e4-101f78abf96a) Asana, [MOB-06](https://mobbin.com/screens/54de3e8b-7efb-40a8-b743-9b385558fc6b) Revolut Business, [MOB-11](https://mobbin.com/screens/f4f2cebe-5496-4959-9fbb-fe37fe2a5dd6) Google Analytics, [MOB-54](https://mobbin.com/screens/1d417c2e-234a-4bf0-a87e-dc65703c2b64) Calendly

### `[DASH-TOOLTIP]` Chart tooltip

**When:** Every interactive chart.

**Structure, in order**

1. Header: the full x label
2. One row per series: line-key, name, value (emphasized); at most 6 rows then '+N more'
3. Optional delta versus previous
4. Surface, elevation and text tokens; textContent for data labels
5. Same content on keyboard focus; Esc dismisses; hoverable and persistent

- **Build from:** Tooltip, ChartTooltipContent
- **Must follow:** `[DV-INTERACT-001]`, `[DV-INTERACT-002]`, `[DV-A11Y-006]`, `[DV-IMPL-006]`
- **Avoid:** Tooltip as the only place a value appears
- **Seen in:** [MOB-01](https://mobbin.com/screens/2f7a876a-0cb0-4ec2-b47b-e2c6f119f566) Cofounder, [MOB-14](https://mobbin.com/screens/9eda3ce4-e6c6-420b-8aa0-a339abb8bb20) Coda, [MOB-18](https://mobbin.com/screens/5f186488-9c1c-4065-ab67-22e4fe9e6a2e) Xero


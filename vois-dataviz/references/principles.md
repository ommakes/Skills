<!-- GENERATED from data/dataviz-rules.json by scripts/build-reference.mjs. Edit the JSON, then run `node vois-dataviz/scripts/build-reference.mjs`. Do not edit by hand. -->

# Principles, do's and don'ts, and rules

Fourteen principles. Each has a headline do and don't list, then the checkable rules under it. **Severity:** `required` is a FAIL in review, `recommended` is a WARN. **Enforcement:** `auto` means `scripts/detect.mjs` finds it in code, `spec` means `scripts/check-spec.mjs` finds it in a chart spec, `judgment` means you look at the render.

| Principle | Rules | Required | Auto or spec checked |
|---|---|---|---|
| [Start with the question and the audience](#dv-purpose) | 4 | 2 | 2 |
| [Pick the simplest form that tells the story](#dv-form) | 10 | 5 | 5 |
| [Show the data truthfully](#dv-honest) | 10 | 7 | 3 |
| [Maximize data, minimize ink](#dv-clarity) | 9 | 5 | 3 |
| [Color is assigned by the job it does](#dv-color) | 11 | 9 | 3 |
| [Stay consistent](#dv-consist) | 6 | 3 | 0 |
| [Give the number a frame](#dv-context) | 7 | 4 | 0 |
| [Accessible by construction](#dv-a11y) | 11 | 8 | 2 |
| [Interactive by default](#dv-interact) | 10 | 3 | 1 |
| [One set of filters, one slice of truth](#dv-filter) | 8 | 4 | 0 |
| [Design every state](#dv-state) | 7 | 4 | 0 |
| [Compose the dashboard as a hierarchy](#dv-layout) | 8 | 3 | 0 |
| [Build it to be fed live data](#dv-sustain) | 6 | 3 | 2 |
| [Use the Vois stack](#dv-impl) | 7 | 4 | 3 |

## DV-PURPOSE

### Start with the question and the audience

**Every chart exists to answer one question for one kind of reader. If you can't write the question, delete the chart.**

Executives want a few simple headline visuals, analysts want granular views, operators want live state. The same data needs a different design for each.

**Do**

- Write the one question the chart answers before choosing a form
- Name the audience: executive, analyst, operator, or general
- Lead the page with the answer (hero number or takeaway), details beneath
- Link each summary to a deeper view instead of cramming detail in

**Don't**

- Don't add a chart because the data exists
- Don't give executives a scatter plot or analysts a single donut
- Don't build one dashboard for every audience

#### Rules

##### `[DV-PURPOSE-001]` required, spec

Every chart has a written question it answers, stated in the spec and reflected in its title or subtitle.

- **Do:** Title as the takeaway or the metric plus a one-line description of what it shows.
- **Don't:** A chart whose only reason to exist is that the column was available.
- **Check:** spec.question is non-empty; the rendered title or subtitle makes the question obvious.
- **Sources:** article, dataviz-skill
- **Seen in:** [MOB-04](https://mobbin.com/screens/8e9ffe26-ef22-4540-b5e4-101f78abf96a) Asana

##### `[DV-PURPOSE-002]` required, spec

Name the audience and set density to match: executive (3 to 6 headline numbers, simple forms), analyst (granular forms, exploration), operator (live state, thresholds). When literacy is unknown, stay with line, bar and table.

- **Do:** Set spec.audience and pick forms with fit 'core' unless the audience is analyst.
- **Don't:** A violin plot on an executive overview.
- **Check:** spec.audience is set; forms with audience 'analyst' or 'specialist' in the catalog only appear when spec.audience is analyst.
- **Sources:** article
- **Seen in:** [MOB-13](https://mobbin.com/screens/bef56b40-0756-4135-a99c-72692615331b) Mixpanel, [MOB-37](https://mobbin.com/screens/8f15ac15-37aa-4376-b9c1-d7dafee29930) Zendesk

##### `[DV-PURPOSE-003]` recommended, judgment

Lead with the answer: one hero number or takeaway above the fold, supporting detail beneath.

- **Do:** KPI row first, primary trend second.
- **Don't:** Open with a filter bar and a wall of equal-weight charts.
- **Check:** The first visual a reader meets states the headline.
- **Sources:** article
- **Seen in:** [MOB-08](https://mobbin.com/screens/f8548434-b4ef-4e67-a360-72feb07a9003) Semrush, [MOB-47](https://mobbin.com/screens/5ff3c997-7159-4bd2-aff3-368075eef01b) Ghost

##### `[DV-PURPOSE-004]` recommended, judgment

Summaries link to detail. A card shows the glance; a visible link or click-through opens the full view.

- **Do:** 'See all', an arrow in the card title, or click a bar to open the filtered detail.
- **Don't:** Cram every breakdown into the summary card.
- **Check:** Each summary card has a visible path to its detail view.
- **Sources:** article, mobbin
- **Seen in:** [MOB-04](https://mobbin.com/screens/8e9ffe26-ef22-4540-b5e4-101f78abf96a) Asana, [MOB-11](https://mobbin.com/screens/f4f2cebe-5496-4959-9fbb-fe37fe2a5dd6) Google Analytics

## DV-FORM

### Pick the simplest form that tells the story

**The viewer's job picks the form. Choose the simplest, most compact format that does the job, and sometimes the right answer is not a chart.**

Most bad charts are the wrong form for the job, not bad styling. Pies for comparison, one-bar bar charts and 22-type pickers are the usual symptoms.

**Do**

- Walk the decision tree and record the chosen form
- Use a stat tile for a single value, a table for exact lookup
- Default to line, bar, stacked bar, area, table, sparkline for unknown data literacy
- Cap categories at about 12, fold the tail into Other

**Don't**

- Don't use a pie or donut to compare close values
- Don't use 3D, radar for a general audience, or specialist forms without a reader who can use them
- Don't offer a chart-type picker with more than 5 options

#### Rules

##### `[DV-FORM-001]` required, spec

Choose the form by walking the decision tree from the viewer's job. Record the job, the form and any alternatives considered.

- **Do:** Start at CHART-Q-ROOT, record the result node and the FORM id.
- **Don't:** Pick a chart type by habit or by what the library demos.
- **Check:** spec.form is reachable from spec.job in data/decision-tree.json.
- **Sources:** article, dataviz-skill
- **Seen in:** [MOB-37](https://mobbin.com/screens/8f15ac15-37aa-4376-b9c1-d7dafee29930) Zendesk, [MOB-38](https://mobbin.com/screens/84735c71-690d-4cf0-87e1-d6df98e442df) Notion

##### `[DV-FORM-002]` required, judgment

Use the simplest, most compact form that tells the story and escalate to a more complex form only when the simpler one fails the job.

- **Do:** Bar before bubble, line before streamgraph, table before pivot.
- **Don't:** A Sankey where a sorted bar answers the question.
- **Check:** A simpler catalog form with the same job would not lose information the reader needs.
- **Sources:** article

##### `[DV-FORM-003]` required, spec

A single current value is a stat tile or meter, not a chart. No one-bar bar charts, no 2-slice pies.

- **Do:** Value, delta, optional sparkline.
- **Don't:** A donut with one filled arc and a percent in the middle when the number alone says it.
- **Check:** spec.categories is greater than 1 for any bar, column or pie form.
- **Sources:** dataviz-skill
- **Seen in:** [MOB-05](https://mobbin.com/screens/0bb8b25f-0c3d-47c3-b20a-1447e7dbab9e) Whop

##### `[DV-FORM-004]` required, spec

Pie and donut are for a part-to-whole glance with 3 to 6 segments that sum to 100 percent. Never use them to compare close values. Above 6 parts, use a sorted horizontal bar.

- **Do:** Sort descending from 12 o'clock, put the total in the donut hole, list values in the legend.
- **Don't:** A 9-slice pie where two slices are 11 and 12 percent.
- **Check:** spec.categories is between 3 and 6 for FORM-PIE and FORM-DONUT.
- **Sources:** article, mobbin
- **Seen in:** [MOB-09](https://mobbin.com/screens/0dbdb488-1169-4df7-8f8f-95c45a428225) Trello, [MOB-21](https://mobbin.com/screens/4180dd3e-e182-432a-9042-8dee319000d2) Basedash

##### `[DV-FORM-005]` recommended, spec

Specialist forms (violin, KDE, pairplot, force-directed network, cartogram, chord, radar) need an analyst audience and a one-line 'how to read this' next to them.

- **Do:** Offer a simpler twin (histogram, table) alongside.
- **Don't:** Ship a force-directed graph to a general audience.
- **Check:** Catalog entries with fit 'rare' only appear with spec.audience analyst.
- **Sources:** article
- **Seen in:** [MOB-37](https://mobbin.com/screens/8f15ac15-37aa-4376-b9c1-d7dafee29930) Zendesk

##### `[DV-FORM-006]` recommended, judgment

Rank and long labels go horizontal; sort by value unless the categories have a natural order.

- **Do:** Horizontal bars sorted descending for 'top pages'.
- **Don't:** Rotate 12 long labels 45 degrees under vertical columns.
- **Check:** No rotated or truncated category labels; sort order is deliberate.
- **Sources:** article, dataviz-skill

##### `[DV-FORM-007]` recommended, spec

Cap visible categories at about 12. Show top N plus Other, with the full list in the table view.

- **Do:** Top 10 plus 'Other (37)' with a link to the table.
- **Don't:** Thirty bars no one can read.
- **Check:** spec.categories is 12 or fewer for bar-type forms, otherwise spec.top_n is set.
- **Sources:** dataviz-skill, mobbin
- **Seen in:** [MOB-41](https://mobbin.com/screens/1d042f08-1868-4567-bbb5-35ed5e51e9b0) Attio

##### `[DV-FORM-008]` recommended, judgment

Use sparklines inside tables and stat tiles for trend at a glance. No axes, current point emphasized, and a link to the full chart.

- **Do:** A muted line with an accent end-dot in a table column.
- **Don't:** A sparkline with axes, gridlines and a legend.
- **Check:** Sparkline cells have no axis chrome and a nearby numeric value.
- **Sources:** article, mobbin
- **Seen in:** [MOB-05](https://mobbin.com/screens/0bb8b25f-0c3d-47c3-b20a-1447e7dbab9e) Whop, [MOB-32](https://mobbin.com/screens/ef455d28-04ea-46f4-a289-cb6c283ea929) PlanetScale, [MOB-33](https://mobbin.com/screens/e39f0d0f-bed1-49ff-92e0-c53d36d34de6) Uniswap, [MOB-34](https://mobbin.com/screens/17e0d812-e07e-4fe5-98b2-dd25f65acd21) Pinterest

##### `[DV-FORM-009]` required, judgment

No 3D, no skeuomorphic effects, no gradients that encode nothing.

- **Do:** Flat marks with a wash fill at about 10 percent opacity for areas.
- **Don't:** Extruded bars or a glossy donut.
- **Check:** Marks are flat; any gradient is a fade to surface, not a data channel.
- **Sources:** article, dataviz-skill
- **Seen in:** [MOB-46](https://mobbin.com/screens/d5b2ad2a-dd83-4d6b-86fa-6edeee1991cd) Adaline

##### `[DV-FORM-010]` recommended, judgment

Render funnels as aligned bars with the step conversion and drop-off between stages, not as tapering shapes that distort width. Color stages with one-hue ordinal steps.

- **Do:** Bars plus a '66.7%' connector and an abandonment column.
- **Don't:** A different hue per stage.
- **Check:** Stage marks share one hue; step conversion is a number, not inferred from taper.
- **Sources:** mobbin
- **Seen in:** [MOB-43](https://mobbin.com/screens/fb9ccefe-4ae1-4997-a2fc-562b34b502db) Google Analytics, [MOB-44](https://mobbin.com/screens/1fb0830e-e657-4cba-bcdd-6c8bf12b51d7) Squarespace

## DV-HONEST

### Show the data truthfully

**Compare like with like on a single honest axis, and mark anything that is partial, projected, missing or too small to trust.**

Truncated bars, dual axes, spline overshoot and flat zeros for missing data all manufacture a story the data doesn't contain.

**Do**

- Start bars, columns and areas at zero
- Use one y-axis per chart
- Mark partial periods and forecasts with hatching or dashes plus a label
- Normalize (per user, per capita, rate) when denominators differ
- Show missing data as missing

**Don't**

- Don't use dual axes
- Don't use natural or cardinal spline smoothing on real data
- Don't plot a partial period as if it were complete
- Don't show a percentage built on a handful of events without the counts
- Don't let NaN, Infinity or a step over 100 percent reach the screen

#### Rules

##### `[DV-HONEST-001]` required, auto, detector `non-zero-bar-domain`

Bars, columns and areas start at zero. Lines may zoom, but a non-zero axis is stated.

- **Do:** domain starting at 0 for bar and area; axis note when a line is zoomed.
- **Don't:** A bar axis that starts at 90 so a 2 percent change looks like a collapse.
- **Check:** No YAxis domain with a non-zero lower bound on a chart containing Bar or Area.
- **Sources:** article

##### `[DV-HONEST-002]` required, auto, detector `dual-axis`

One y-axis per chart. Never dual-axis. Two measures on different scales become two charts, small multiples, or both indexed to a common base. The one sanctioned exception is a Pareto chart's cumulative share on a fixed, labeled 0 to 100 percent scale, marked with a dataviz-allow comment.

- **Do:** Two aligned charts sharing the x-axis, or index both series to 100 at the first period.
- **Don't:** Users on the left axis and sessions on the right, which invents a correlation.
- **Check:** At most one YAxis per chart; no orientation right second axis.
- **Sources:** dataviz-skill, article
- **Seen in:** [MOB-06](https://mobbin.com/screens/54de3e8b-7efb-40a8-b743-9b385558fc6b) Revolut Business

##### `[DV-HONEST-003]` required, judgment

Compare like with like: same period length, same units, normalized when denominators differ. Annotate any remaining difference.

- **Do:** Per-user, per-capita or rate when group sizes differ; same-length periods for deltas.
- **Don't:** A 31-day month against a 28-day month in gross totals with no note.
- **Check:** Every comparison has matched units, period lengths and denominators, or a visible note.
- **Sources:** article
- **Seen in:** [MOB-55](https://mobbin.com/screens/4ca7b81a-9cb8-497c-a728-e66ae0487f5e) Klaviyo

##### `[DV-HONEST-004]` required, judgment

Mark partial periods and projections distinctly: hatched fill or dashed line, plus a label. Never plot an incomplete period as complete.

- **Do:** Hatched bar for 'today so far'; dashed line labeled 'Forecast'; shaded band for a range.
- **Don't:** A last-bucket cliff that is just a day not finished.
- **Check:** The current period and any forecast are visually and textually distinct.
- **Sources:** mobbin, dataviz-skill
- **Seen in:** [MOB-03](https://mobbin.com/screens/205aefea-2dfc-4668-9af7-bc4921da1762) Mintlify, [MOB-06](https://mobbin.com/screens/54de3e8b-7efb-40a8-b743-9b385558fc6b) Revolut Business, [MOB-08](https://mobbin.com/screens/f8548434-b4ef-4e67-a360-72feb07a9003) Semrush

##### `[DV-HONEST-005]` required, auto, detector `spline-curve`

No spline interpolation that invents values between points. Use linear or monotone; use step for values that hold between events. Show point markers when data is sparse.

- **Do:** type monotone or linear; step for plan tier, stock level, resource usage.
- **Don't:** type natural or basis, which overshoots below zero between real points.
- **Check:** No curve type natural, basis, cardinal or catmullRom on Line or Area.
- **Sources:** mobbin, article
- **Seen in:** [MOB-01](https://mobbin.com/screens/2f7a876a-0cb0-4ec2-b47b-e2c6f119f566) Cofounder, [MOB-48](https://mobbin.com/screens/a9510b9f-8dc6-45d7-a9b3-61af96191e4f) Railway

##### `[DV-HONEST-006]` required, judgment

Guard small samples and ratios. Under the minimum sample, show raw counts or a 'low sample' flag. A step conversion over 100 percent, NaN or Infinity is a data error to investigate, never a value to print.

- **Do:** '4 of 5 sessions' next to 80 percent; suppress a percent when the denominator is under the threshold.
- **Don't:** Print '125%' between two funnel stages.
- **Check:** Percentages carry or can reach their counts; no value outside 0 to 100 for a share or conversion.
- **Sources:** article, mobbin
- **Seen in:** [MOB-44](https://mobbin.com/screens/1fb0830e-e657-4cba-bcdd-6c8bf12b51d7) Squarespace

##### `[DV-HONEST-007]` recommended, judgment

Don't invent precision. Compact large numbers on tiles and axes (12.9K, $4.2M); show exact values in the tooltip and table.

- **Do:** 1,284 on a tile, 1,284.37 in the table.
- **Don't:** $10,923.4417 on a headline.
- **Check:** Display precision matches the decision the number supports.
- **Sources:** dataviz-skill

##### `[DV-HONEST-008]` required, judgment

Missing data is not zero. Break the line or show 'No data'; reserve a flat zero line for a real measured zero.

- **Do:** A gap in the line for the hours the collector was down.
- **Don't:** Six charts of flat zeros for a metric that has never been collected.
- **Check:** Null and zero render differently; unmeasured periods are not drawn as 0.
- **Sources:** mobbin
- **Seen in:** [MOB-02](https://mobbin.com/screens/b43a980d-6a77-48d5-b764-d697475a157c) LangChain, [MOB-46](https://mobbin.com/screens/d5b2ad2a-dd83-4d6b-86fa-6edeee1991cd) Adaline

##### `[DV-HONEST-009]` recommended, judgment

Use a log scale only for ratio data spanning orders of magnitude, and say so on the axis.

- **Do:** Axis title 'Requests (log scale)'.
- **Don't:** A silent log axis on a general-audience chart.
- **Check:** Any non-linear scale is labeled.
- **Sources:** article

##### `[DV-HONEST-010]` recommended, judgment

Make delta math explicit: name the comparison period, and show growth from a zero base as 'new' or a dash, never infinity or 100 percent.

- **Do:** +12.4% vs previous 7 days; 'New' when the prior value was 0.
- **Don't:** +Infinity%.
- **Check:** Every delta names its baseline; zero baselines are handled.
- **Sources:** article, mobbin
- **Seen in:** [MOB-03](https://mobbin.com/screens/205aefea-2dfc-4668-9af7-bc4921da1762) Mintlify, [MOB-55](https://mobbin.com/screens/4ca7b81a-9cb8-497c-a728-e66ae0487f5e) Klaviyo

## DV-CLARITY

### Maximize data, minimize ink

**Everything on the chart is either data or something that helps read data. Remove the rest.**

Clutter competes with the signal. The grid, axes and legend exist to be read once and forgotten.

**Do**

- Make gridlines and axes hairline and recessive
- Label selectively: the end point, the extreme, the series that matters
- Use direct labels for up to 4 series and always a legend for 2 or more
- Title axes with units and keep tick labels whole and horizontal
- Use text tokens for text, series color only for marks

**Don't**

- Don't put a number on every point
- Don't truncate or rotate axis labels to fit
- Don't paint text in a series color
- Don't use heavy borders, gradients as data, or fat saturated blocks

#### Rules

##### `[DV-CLARITY-001]` required, judgment

Remove anything that doesn't help read the data: heavy borders, background fills inside the plot, redundant legends and labels, decorative gradients.

- **Do:** Ask of each element: what does the reader lose if this goes?
- **Don't:** A boxed plot area inside a boxed card inside a boxed section.
- **Check:** Deleting any non-data element would not reduce understanding.
- **Sources:** article, dataviz-skill

##### `[DV-CLARITY-002]` recommended, auto, detector `dashed-grid`

Gridlines and axes are solid 1px hairlines, one step off the surface, recessive. Horizontal gridlines only unless reading across is the task.

- **Do:** CartesianGrid vertical={false} with a token stroke.
- **Don't:** Dashed or dark gridlines at the same weight as the data.
- **Check:** No strokeDasharray on the grid; grid color is a chart-grid token.
- **Sources:** dataviz-skill
- **Seen in:** [MOB-49](https://mobbin.com/screens/1dfc1ac5-3d51-4fcf-82d4-7a2109087afd) GitBook

##### `[DV-CLARITY-003]` required, auto, detector `label-every-point`

Label selectively: the end point, the extreme, the series the story is about. Never a number on every point. The axis, tooltip and table carry the rest.

- **Do:** One end-label per line; a value on the peak.
- **Don't:** A LabelList on every point of a line.
- **Check:** No LabelList on Line or Area; bar labels only when each fits inside or beyond its mark.
- **Sources:** dataviz-skill, article
- **Seen in:** [MOB-16](https://mobbin.com/screens/3ab607e6-95a5-412e-9a95-6f6a2de9fb96) Rows, [MOB-10](https://mobbin.com/screens/bc8707aa-636a-4d38-bee0-6e328a9c78f9) Squarespace

##### `[DV-CLARITY-004]` required, auto, detector `missing-legend`

Two or more series always get a legend; up to four are also direct-labeled. A single series gets no legend box because the title names it.

- **Do:** ChartLegend for 2+ series; end-labels for up to 4.
- **Don't:** A one-swatch legend that restates the title, or no legend on a 3-line chart.
- **Check:** Multi-series charts include a legend component; single-series ones don't.
- **Sources:** dataviz-skill, article
- **Seen in:** [MOB-15](https://mobbin.com/screens/4ee5bf3f-d6ba-4724-88c8-f9bc8d74cfd9) Fey

##### `[DV-CLARITY-005]` required, judgment

Axes carry a unit (in the title or the axis label), clean round ticks, about 5 or fewer y-ticks, and tick and axis labels that are whole and horizontal.

- **Do:** 'Tokens' on the y-axis, ticks at 0 / 20K / 40K.
- **Don't:** An axis title cut to 'Task count, in numb...' or ticks rotated 60 degrees.
- **Check:** No truncated axis text; no rotation beyond 45 degrees; units present.
- **Sources:** article
- **Seen in:** [MOB-04](https://mobbin.com/screens/8e9ffe26-ef22-4540-b5e4-101f78abf96a) Asana

##### `[DV-CLARITY-006]` recommended, judgment

Mark specs: bars at most 24px thick with a 4px rounded data end and a square baseline, lines 2px, markers at least 8px, a 2px surface-colored gap between touching fills and a 2px surface ring on overlapping dots. No stroke around marks to separate them.

- **Do:** Cap bar thickness and let the band's leftover be air.
- **Don't:** Slot-filling fat blocks, or an outline drawn around every segment.
- **Check:** Bar thickness is capped; stacks use a gap not a border.
- **Sources:** dataviz-skill
- **Seen in:** [MOB-17](https://mobbin.com/screens/465aeb37-a153-449d-b3d3-c81ed1756333) Snowflake, [MOB-50](https://mobbin.com/screens/1d40ccee-b335-4a85-b25a-007cbc2731db) YNAB

##### `[DV-CLARITY-007]` recommended, judgment

Order deliberately: sort by value unless the categories have a natural order, and make legend order match the visual order of the series.

- **Do:** Top stack segment is the first legend item.
- **Don't:** Alphabetical bars when the reader wants a ranking.
- **Check:** Sort and legend order are intentional and consistent.
- **Sources:** article

##### `[DV-CLARITY-008]` required, judgment

Text never wears the series color. Values, labels, legends and axis text use text tokens; a colored swatch, dot or line-key beside the text carries identity.

- **Do:** Dot in the series color, label in text-muted.
- **Don't:** Yellow text for the yellow series.
- **Check:** Text color tokens only, except labels inside a fill, which pick ink or white by the fill's luminance.
- **Sources:** dataviz-skill

##### `[DV-CLARITY-009]` recommended, judgment

One hero figure per view. KPI hierarchy: value, then label, then delta. Large standalone numbers use proportional figures; tabular-nums only where numbers align in a column.

- **Do:** 48px or larger hero in the same sans as the rest; tabular-nums in table cells and axis ticks.
- **Don't:** A serif display face on the hero, or tabular-nums on a 48px number.
- **Check:** Exactly one hero per view; figure style matches the context.
- **Sources:** dataviz-skill
- **Seen in:** [MOB-12](https://mobbin.com/screens/8439f27d-0396-4236-96e2-ce595af04b98) Exa

## DV-COLOR

### Color is assigned by the job it does

**Each color encodes exactly one thing: identity, magnitude, polarity or status. Pick the job first, then the palette, then check it.**

Color is the easiest channel to misuse and the one most readers can't fully see. A palette is a computed set with checks, not a taste call.

**Do**

- Use chart tokens in fixed order, never cycled
- Keep one entity on one color across the whole product
- Use one hue light to dark for magnitude, two opposing hues plus neutral for polarity
- Use one accent plus gray when one series is the story
- Select dark mode steps and check them against the dark surface

**Don't**

- Don't use hex values or raw palette classes in chart code
- Don't give every bar of one series its own color
- Don't reuse status colors for series 4
- Don't pair red and green as the only distinction
- Don't generate a 9th hue

#### Rules

##### `[DV-COLOR-001]` required, auto, detector `hardcoded-chart-color`

Chart code uses chart tokens (var(--chart-N) and friends), never hex values or raw palette classes. Extends DS-COLOR-001 to charts.

- **Do:** color: 'var(--chart-1)' in the chart config.
- **Don't:** stroke='#8884d8'.
- **Check:** No hex or rgb literal in stroke, fill or color of chart code.
- **Sources:** vois

##### `[DV-COLOR-002]` required, spec

Assign color by the job it does: categorical (identity), ordinal (ordered buckets, one hue ramp), sequential (magnitude, one hue), diverging (polarity, two hues plus neutral), status (reserved meaning). State the job in the spec.

- **Do:** spec.color_job set from the catalog's color_job for the form.
- **Don't:** Pick colors first and decide what they mean later.
- **Check:** spec.color_job is one of the five jobs and matches the form.
- **Sources:** dataviz-skill

##### `[DV-COLOR-003]` required, auto, detector `cycled-colors`

Categorical hues are assigned in fixed order and never cycled. Eight is the ceiling and five is comfortable. A ninth series folds into Other, becomes small multiples, or uses composite encoding. Series count above 8 is never solved by generating a hue.

- **Do:** Use the chart-1 to chart-8 order as given.
- **Don't:** COLORS[index % COLORS.length].
- **Check:** No modulo cycling of a color array; spec.series is 8 or fewer.
- **Sources:** dataviz-skill, mobbin
- **Seen in:** [MOB-35](https://mobbin.com/screens/c1c85e79-bd6a-4577-a7c4-ffa4ff67dfda) Kraken, [MOB-41](https://mobbin.com/screens/1d042f08-1868-4567-bbb5-35ed5e51e9b0) Attio, [MOB-49](https://mobbin.com/screens/1dfc1ac5-3d51-4fcf-82d4-7a2109087afd) GitBook

##### `[DV-COLOR-004]` required, judgment

Color follows the entity, not its rank or row index. Filtering or re-sorting never repaints a surviving series, and the same entity keeps its color across cards and pages.

- **Do:** Map series key to color token once, in the config.
- **Don't:** Color by array index so removing series 2 turns series 3 blue.
- **Check:** Series colors are keyed by entity id, not position.
- **Sources:** dataviz-skill, article
- **Seen in:** [MOB-15](https://mobbin.com/screens/4ee5bf3f-d6ba-4724-88c8-f9bc8d74cfd9) Fey

##### `[DV-COLOR-005]` required, judgment

Sequential is one hue light to dark. Diverging is two opposing hues with a neutral gray midpoint. Never a rainbow, and never a hue at the midpoint.

- **Do:** Blue ramp for volume; blue-to-orange around zero.
- **Don't:** A jet rainbow heatmap.
- **Check:** Ramp is monotone in lightness; midpoint is neutral.
- **Sources:** dataviz-skill
- **Seen in:** [MOB-20](https://mobbin.com/screens/6334e233-7651-4be1-a9e9-eb7b29563b98) Perplexity

##### `[DV-COLOR-006]` required, judgment

Status colors (good, warning, serious, critical) are reserved for state. They are never reused for 'series 4', and always ship with an icon, sign or label. Don't make red versus green the only distinction.

- **Do:** Arrow, sign and color on a delta chip; a down-arrow on churn that's green because down is good.
- **Don't:** Red and green bars with no other cue.
- **Check:** Every status color has a non-color companion; status tokens aren't used for identity.
- **Sources:** dataviz-skill, wcag
- **Seen in:** [MOB-09](https://mobbin.com/screens/0dbdb488-1169-4df7-8f8f-95c45a428225) Trello, [MOB-20](https://mobbin.com/screens/6334e233-7651-4be1-a9e9-eb7b29563b98) Perplexity, [MOB-33](https://mobbin.com/screens/e39f0d0f-bed1-49ff-92e0-c53d36d34de6) Uniswap

##### `[DV-COLOR-007]` required, judgment

A single series of nominal categories uses one color for every bar. Don't ramp or rainbow by value, and don't give each bar its own hue. Ordered stages (funnel, tiers) use a one-hue ordinal ramp.

- **Do:** Same chart-1 on every bar; one hue stepping dark for later funnel stages.
- **Don't:** Five bars in five hues when the categories have no meaning in the color.
- **Check:** One series maps to one color; ordinal buckets use a ramp.
- **Sources:** dataviz-skill, mobbin
- **Seen in:** [MOB-09](https://mobbin.com/screens/0dbdb488-1169-4df7-8f8f-95c45a428225) Trello, [MOB-44](https://mobbin.com/screens/1fb0830e-e657-4cba-bcdd-6c8bf12b51d7) Squarespace

##### `[DV-COLOR-008]` required, judgment

Dark mode is selected, not inverted: its own steps from the same ramps, checked against the dark surface so marks stay at least 3:1 and text at least 4.5:1.

- **Do:** Verify the dark palette on the dark card surface.
- **Don't:** Auto-invert, or reuse the light palette on near-black.
- **Check:** Contrast is verified per mode.
- **Sources:** dataviz-skill, wcag
- **Seen in:** [MOB-06](https://mobbin.com/screens/54de3e8b-7efb-40a8-b743-9b385558fc6b) Revolut Business, [MOB-47](https://mobbin.com/screens/5ff3c997-7159-4bd2-aff3-368075eef01b) Ghost

##### `[DV-COLOR-009]` recommended, judgment

When one series is the story, use emphasis: one accent hue and neutral gray for the rest.

- **Do:** Highlight 'Checkout' in the accent, gray the other eight funnels.
- **Don't:** Eight hues competing for attention.
- **Check:** If the title names one series, only that series is saturated.
- **Sources:** dataviz-skill

##### `[DV-COLOR-010]` required, judgment

Overlapping areas use a wash of about 10 to 15 percent opacity, or aren't overlapped at all (stack or facet). Multiple translucent hues over each other create new muddy colors that read as extra series.

- **Do:** Stacked area, or small multiples.
- **Don't:** Four translucent orange, pink, purple and red areas on top of each other.
- **Check:** No more than two overlapping filled areas on one plot.
- **Sources:** mobbin, dataviz-skill
- **Seen in:** [MOB-49](https://mobbin.com/screens/1dfc1ac5-3d51-4fcf-82d4-7a2109087afd) GitBook

##### `[DV-COLOR-011]` recommended, judgment

Heatmaps and choropleths use a sequential single hue unless a meaningful center exists, then diverging. Always include a scale legend with minimum, midpoint and maximum.

- **Do:** A ramp key reading -3% / 0 / +3%.
- **Don't:** Unlabeled shades of red and green.
- **Check:** Scale legend present; ramp type matches the data.
- **Sources:** article, mobbin
- **Seen in:** [MOB-20](https://mobbin.com/screens/6334e233-7651-4be1-a9e9-eb7b29563b98) Perplexity

## DV-CONSIST

### Stay consistent

**A metric looks and reads the same everywhere. Random changes in format, period or color imply meaning that isn't there.**

Readers learn the system in the first card and apply it to the rest. Every inconsistency costs a re-learn or a wrong conclusion.

**Do**

- Use one unit, format and precision per metric everywhere
- Use the same period and granularity under one filter
- Reuse the same KPI tile and card anatomy
- Share scales and crosshair across small multiples
- Format with Intl and state the timezone

**Don't**

- Don't show revenue as $1.2M in one card and 1,200,000 in the next
- Don't change a series color between cards
- Don't mix periods under one date filter

#### Rules

##### `[DV-CONSIST-001]` required, judgment

One metric, one unit, one format, one precision everywhere it appears: tile, axis, tooltip, table, export.

- **Do:** A shared formatter per metric.
- **Don't:** $1.2M on the tile and 1,200,000 in the table with no reason.
- **Check:** Formatters are shared; unit appears wherever the number does.
- **Sources:** article

##### `[DV-CONSIST-002]` required, judgment

Everything under one filter uses the same period and granularity, and the resolved scope is visible.

- **Do:** Show 'Jun 11 to Jun 17, 2026 (UTC)' once, near the filter.
- **Don't:** Last 7 days in one card and month to date in the next with no label.
- **Check:** All cards reconcile to the same date scope.
- **Sources:** article, mobbin
- **Seen in:** [MOB-02](https://mobbin.com/screens/b43a980d-6a77-48d5-b764-d697475a157c) LangChain, [MOB-07](https://mobbin.com/screens/e6bc47ca-58cf-4238-88bd-ddd99bb35e4c) Revolut Business

##### `[DV-CONSIST-003]` required, judgment

The same entity keeps the same color across the whole dashboard and across pages.

- **Do:** Single source of truth for entity color.
- **Don't:** 'Mobile' is blue in one card and orange in the next.
- **Check:** Cross-card entity colors match.
- **Sources:** article, dataviz-skill

##### `[DV-CONSIST-004]` recommended, judgment

Small multiples share scales and axes, or state clearly that they don't, and they share a crosshair.

- **Do:** Hover on one chart moves the crosshair on all of them.
- **Don't:** Three stacked charts with independent unlabeled y-ranges.
- **Check:** Shared domain or an explicit note; synchronized hover.
- **Sources:** mobbin
- **Seen in:** [MOB-14](https://mobbin.com/screens/9eda3ce4-e6c6-420b-8aa0-a339abb8bb20) Coda

##### `[DV-CONSIST-005]` recommended, judgment

The same job uses the same component. All KPI tiles share one anatomy; all chart cards share one header, action placement and footer.

- **Do:** One StatTile and one ChartCard component.
- **Don't:** Each card hand-built with different paddings and action positions.
- **Check:** Cards are instances of shared components.
- **Sources:** article, vois
- **Seen in:** [MOB-12](https://mobbin.com/screens/8439f27d-0396-4236-96e2-ce595af04b98) Exa

##### `[DV-CONSIST-006]` recommended, judgment

Format dates, numbers and currency with Intl in the user's locale, and state the timezone wherever dates are bucketed.

- **Do:** 'All analytics are based on UTC' near the filter.
- **Don't:** Hardcoded en-US formatting and an unstated timezone.
- **Check:** Intl formatters; timezone stated.
- **Sources:** mobbin
- **Seen in:** [MOB-12](https://mobbin.com/screens/8439f27d-0396-4236-96e2-ce595af04b98) Exa

## DV-CONTEXT

### Give the number a frame

**A number without a comparison, a scope or a date is trivia. Say what it is, what it's compared to, and how fresh it is.**

Context turns data into a decision. It's also where statistics get twisted when it's missing.

**Do**

- Pair every KPI with a delta against a named period
- Draw targets and benchmarks as labeled reference lines
- Annotate anomalies and launches
- Show data freshness on live views
- Disclose any filter that makes a chart narrower than the page

**Don't**

- Don't show a bare delta with no period
- Don't leave a dip unexplained when the cause is known
- Don't hide a chart-level filter

#### Rules

##### `[DV-CONTEXT-001]` required, judgment

The title says what, the subtitle says the scope: metric, filter and period.

- **Do:** 'Daily activity' / 'Jun 11 to Jun 17, 2026'.
- **Don't:** A title that is only a column name with no scope.
- **Check:** Each card states its metric and period.
- **Sources:** article, mobbin
- **Seen in:** [MOB-01](https://mobbin.com/screens/2f7a876a-0cb0-4ec2-b47b-e2c6f119f566) Cofounder, [MOB-04](https://mobbin.com/screens/8e9ffe26-ef22-4540-b5e4-101f78abf96a) Asana

##### `[DV-CONTEXT-002]` required, judgment

Every KPI has a comparison: a delta against a named period, signed, with direction (arrow) separate from meaning (good or bad).

- **Do:** '12.4% vs previous 7 days' with an up arrow; churn down is shown as good.
- **Don't:** A bare number, or a bare percent with no baseline.
- **Check:** Each tile has a delta and a baseline name.
- **Sources:** article, mobbin
- **Seen in:** [MOB-03](https://mobbin.com/screens/205aefea-2dfc-4668-9af7-bc4921da1762) Mintlify, [MOB-05](https://mobbin.com/screens/0bb8b25f-0c3d-47c3-b20a-1447e7dbab9e) Whop, [MOB-08](https://mobbin.com/screens/f8548434-b4ef-4e67-a360-72feb07a9003) Semrush, [MOB-55](https://mobbin.com/screens/4ca7b81a-9cb8-497c-a728-e66ae0487f5e) Klaviyo

##### `[DV-CONTEXT-003]` recommended, judgment

Draw targets, benchmarks and averages as labeled reference lines, and annotate anomalies, launches and outages.

- **Do:** A thin line labeled 'Target: 15' or 'Your average'.
- **Don't:** An unexplained spike the team already knows the cause of.
- **Check:** Reference lines are labeled directly; known events are annotated.
- **Sources:** article, mobbin
- **Seen in:** [MOB-19](https://mobbin.com/screens/a3c353b2-54c2-4451-88f3-d3fe328bae27) Linktree, [MOB-36](https://mobbin.com/screens/1173ea6b-a88a-4dcf-ab36-484121c41600) TheyDo

##### `[DV-CONTEXT-004]` required, judgment

Live and near-live views show freshness ('Updated 2 minutes ago') and offer a manual refresh.

- **Do:** A timestamp near the filters and a refresh button.
- **Don't:** A dashboard that might be an hour stale and doesn't say.
- **Check:** Freshness text and refresh control present on live views.
- **Sources:** article, mobbin
- **Seen in:** [MOB-21](https://mobbin.com/screens/4180dd3e-e182-432a-9042-8dee319000d2) Basedash, [MOB-57](https://mobbin.com/screens/5c9722dd-e8e6-4ed8-b06c-687ac8d20b05) Amplitude, [MOB-13](https://mobbin.com/screens/bef56b40-0756-4135-a99c-72692615331b) Mixpanel

##### `[DV-CONTEXT-005]` recommended, judgment

Derived or ambiguous metrics get a definition: an info tooltip or a link to the methodology.

- **Do:** An 'i' icon next to 'Experience score' with the formula.
- **Don't:** Unexplained acronyms.
- **Check:** Each derived metric has a definition within one interaction.
- **Sources:** article, mobbin
- **Seen in:** [MOB-13](https://mobbin.com/screens/bef56b40-0756-4135-a99c-72692615331b) Mixpanel, [MOB-28](https://mobbin.com/screens/73ce6686-1274-49a3-9c1d-30a8ebf3bdc3) Visitors

##### `[DV-CONTEXT-006]` recommended, judgment

Report-style views add one sentence of insight where the cause or consequence is known, written in plain language.

- **Do:** 'Seasonal decline' next to a dip.
- **Don't:** Make the reader guess.
- **Check:** Notable shifts are explained or flagged as unexplained.
- **Sources:** article
- **Seen in:** [MOB-13](https://mobbin.com/screens/bef56b40-0756-4135-a99c-72692615331b) Mixpanel

##### `[DV-CONTEXT-007]` required, judgment

If a chart is narrower than the page scope (its own filter, a different source), say so on the card.

- **Do:** '1 filter, tasks in 1 project' in the card footer.
- **Don't:** A chart that silently excludes archived items while its neighbor includes them.
- **Check:** Any chart-level scope is disclosed on the card.
- **Sources:** mobbin
- **Seen in:** [MOB-04](https://mobbin.com/screens/8e9ffe26-ef22-4540-b5e4-101f78abf96a) Asana

## DV-A11Y

### Accessible by construction

**Every chart works without color, without a mouse, without sight and without motion. The table view is the equivalent, not an afterthought.**

WCAG applies to charts: contrast for marks and text, a text alternative, keyboard access, no color-only meaning, reduced motion. Roughly 1 in 12 men can't separate some hues.

**Do**

- Give every chart a text alternative and a table view
- Make marks at least 3:1 and text at least 4.5:1 against their surface
- Add arrows, signs, labels or patterns next to color
- Make points, legend items and card actions keyboard reachable with visible focus
- Keep hit targets at least var(--hit-area-min)
- Respect prefers-reduced-motion

**Don't**

- Don't make a tooltip the only way to read a value
- Don't convey good or bad with color alone
- Don't rely on hover for anything critical on touch
- Don't autoplay or loop chart animation

#### Rules

##### `[DV-A11Y-001]` required, judgment

Never rely on color alone. Identity comes from a legend or direct label, state from an icon, sign or text, and where needed a pattern or shape.

- **Do:** Arrow plus sign plus color on deltas; dashed versus solid for forecast.
- **Don't:** Green and red bars as the only cue.
- **Check:** Greyscale screenshot still reads.
- **Sources:** wcag
- **Seen in:** [MOB-33](https://mobbin.com/screens/e39f0d0f-bed1-49ff-92e0-c53d36d34de6) Uniswap

##### `[DV-A11Y-002]` required, judgment

Marks reach at least 3:1 against their surface and adjacent marks (WCAG 1.4.11). Text, including text inside fills and in tooltips, reaches at least 4.5:1 (WCAG 1.4.3).

- **Do:** Verify each mode; pick ink or white for in-fill labels by luminance.
- **Don't:** A pale yellow bar on white with no label and no table.
- **Check:** Measured contrast per mode.
- **Sources:** wcag

##### `[DV-A11Y-003]` required, auto, detector `missing-accessibility-layer`

Every chart has a text alternative: a role img container with an aria-label that states the takeaway, plus the library's accessibility layer, plus a visible or screen-reader-only summary of the trend or statistic.

- **Do:** figure with figcaption; accessibilityLayer on the chart.
- **Don't:** An unlabeled SVG.
- **Check:** Recharts chart elements carry accessibilityLayer.
- **Sources:** wcag

##### `[DV-A11Y-004]` required, judgment

Every chart has a table-view twin, reachable by keyboard, in the same order, with the same numbers. This is the WCAG-clean equivalent.

- **Do:** A Chart | Table toggle in the card header.
- **Don't:** A chart whose values exist only in pixels.
- **Check:** A table view exists and matches the chart.
- **Sources:** dataviz-skill, mobbin
- **Seen in:** [MOB-36](https://mobbin.com/screens/1173ea6b-a88a-4dcf-ab36-484121c41600) TheyDo, [MOB-39](https://mobbin.com/screens/fe4fee7b-86cb-4916-934f-2ea0ce6de346) Hex, [MOB-42](https://mobbin.com/screens/2018e7b8-e4b1-4231-ab91-c66557122a98) Amplitude, [MOB-52](https://mobbin.com/screens/3768d5f8-15d6-4c56-8ecb-ec8d437914f6) Customer.io

##### `[DV-A11Y-005]` required, judgment

Everything interactive is keyboard reachable and operable: data points or groups, legend items (real buttons with aria-pressed), the card menu, the date picker. Focus is visible (DS-A11Y-002).

- **Do:** Arrow keys step through points; Esc dismisses a pinned tooltip.
- **Don't:** Hover-only controls, or divs with click handlers.
- **Check:** Tab and arrow-key walkthrough works end to end.
- **Sources:** wcag

##### `[DV-A11Y-006]` required, judgment

Tooltips enhance and never gate. Every value is also reachable by a direct label or the table view. Content on hover or focus is dismissible, hoverable and persistent (WCAG 1.4.13). On touch, tap pins the tooltip.

- **Do:** Same details on focus as on hover; Esc to dismiss.
- **Don't:** Make a tooltip the only way to learn a number.
- **Check:** Values are reachable without hover.
- **Sources:** dataviz-skill, wcag

##### `[DV-A11Y-007]` required, judgment

Hit targets are bigger than the marks: at least var(--hit-area-min) (DS-A11Y-001), with a transparent hit area of at least 24px on dots, or a nearest-point layer for dense scatter. The hit area includes the gap.

- **Do:** Crosshair that snaps to the nearest x.
- **Don't:** An 8px dot you have to land on dead center.
- **Check:** Marks can be hit within 24px of their center.
- **Sources:** dataviz-skill, vois

##### `[DV-A11Y-008]` required, auto, detector `slow-chart-animation`

Chart animation is at most 300ms (DS-ANIMATION-001) and off under prefers-reduced-motion (DS-ANIMATION-004). It runs on first mount and when the user changes the range, filter or series. It never replays on a refetch, a poll or a live update.

- **Do:** isAnimationActive on first mount and on a range the user chose, 300ms or less.
- **Don't:** animationDuration 1500 on every data update, or any animation on a background refetch.
- **Check:** No animationDuration above 300.
- **Sources:** vois, wcag

##### `[DV-A11Y-009]` recommended, judgment

A pattern or texture channel is available for color-vision deficiency, print and forced-colors. Opt-in, not the default.

- **Do:** 45 and 135 degree hatch, ordered on value scales.
- **Don't:** Dense texture on by default.
- **Check:** Chart stays legible in greyscale and forced-colors.
- **Sources:** dataviz-skill
- **Seen in:** [MOB-03](https://mobbin.com/screens/205aefea-2dfc-4668-9af7-bc4921da1762) Mintlify

##### `[DV-A11Y-010]` recommended, judgment

Charts work at 200 percent zoom and 320px width. Text is at least 12px. Nothing depends on hover on touch.

- **Do:** Test at 320px and 200 percent.
- **Don't:** Sub-10px axis labels.
- **Check:** Reflow test passes.
- **Sources:** wcag

##### `[DV-A11Y-011]` recommended, judgment

Announce meaningful changes only: user-triggered updates get a polite live region, and background refreshes don't announce.

- **Do:** 'Chart updated: 30 days' after a range change.
- **Don't:** Announce every poll.
- **Check:** Live region used only for user-initiated changes.
- **Sources:** wcag

## DV-INTERACT

### Interactive by default

**A web chart is interactive. Ship the hover layer, the legend toggle and the drill-down with the same care as the static render.**

Readers aim at a date, not a 2px line. A crosshair, a shared tooltip and a clear click-through make dense charts usable.

**Do**

- Line and area: crosshair that snaps to the nearest x, one tooltip listing every series
- Bar, dot, cell: per-mark tooltip and a lift on hover
- Let the legend isolate or hide a series
- Show a visible affordance on anything clickable
- Offer view as table, expand and export in one consistent card menu

**Don't**

- Don't require the pointer to land on a thin line
- Don't offer chart types the data can't support
- Don't put critical info only in hover

#### Rules

##### `[DV-INTERACT-001]` required, auto, detector `missing-tooltip`

Charts are interactive by default. Line and area: a crosshair that snaps to the nearest x and one tooltip listing every series. Bar, dot, cell: a per-mark tooltip and a lift on hover. Only a bare stat tile skips it.

- **Do:** ChartTooltip with ChartTooltipContent.
- **Don't:** A static SVG with no readout.
- **Check:** Each chart includes a Tooltip component.
- **Sources:** dataviz-skill, mobbin
- **Seen in:** [MOB-14](https://mobbin.com/screens/9eda3ce4-e6c6-420b-8aa0-a339abb8bb20) Coda, [MOB-47](https://mobbin.com/screens/5ff3c997-7159-4bd2-aff3-368075eef01b) Ghost, [MOB-12](https://mobbin.com/screens/8439f27d-0396-4236-96e2-ce595af04b98) Exa

##### `[DV-INTERACT-002]` required, judgment

Tooltip anatomy: header is the x label in full (weekday and year if ambiguous); one row per series with a short line-key, the series name and the value, value emphasized; at most 6 rows then '+N more'. Insert untrusted labels with textContent, never innerHTML.

- **Do:** 'Mon, Jun 15 / 76,065 tokens'.
- **Don't:** Header 'x', boxes as keys, or dangerouslySetInnerHTML with a CSV header.
- **Check:** Tooltip content matches the anatomy; no innerHTML of data labels.
- **Sources:** dataviz-skill, mobbin
- **Seen in:** [MOB-01](https://mobbin.com/screens/2f7a876a-0cb0-4ec2-b47b-e2c6f119f566) Cofounder, [MOB-14](https://mobbin.com/screens/9eda3ce4-e6c6-420b-8aa0-a339abb8bb20) Coda, [MOB-18](https://mobbin.com/screens/5f186488-9c1c-4065-ab67-22e4fe9e6a2e) Xero

##### `[DV-INTERACT-003]` recommended, judgment

The legend toggles series: click to hide or isolate, shown with aria-pressed, hidden series keep their color, and one action restores all.

- **Do:** Legend items as buttons.
- **Don't:** A legend that is only decoration on a 6-series chart.
- **Check:** Legend items are real buttons with state.
- **Sources:** dataviz-skill, mobbin
- **Seen in:** [MOB-35](https://mobbin.com/screens/c1c85e79-bd6a-4577-a7c4-ffa4ff67dfda) Kraken, [MOB-15](https://mobbin.com/screens/4ee5bf3f-d6ba-4724-88c8-f9bc8d74cfd9) Fey

##### `[DV-INTERACT-004]` recommended, judgment

Clickable means visibly clickable: an arrow in the card title, a 'See all' link, hover affordance, or on-card hint text ('Click a bar to view details'). Click drills into a filtered detail view.

- **Do:** 'Net cashflow >' title link.
- **Don't:** A hidden click handler.
- **Check:** Every drill-down has a visible affordance.
- **Sources:** mobbin
- **Seen in:** [MOB-04](https://mobbin.com/screens/8e9ffe26-ef22-4540-b5e4-101f78abf96a) Asana, [MOB-06](https://mobbin.com/screens/54de3e8b-7efb-40a8-b743-9b385558fc6b) Revolut Business, [MOB-11](https://mobbin.com/screens/f4f2cebe-5496-4959-9fbb-fe37fe2a5dd6) Google Analytics, [MOB-54](https://mobbin.com/screens/1d417c2e-234a-4bf0-a87e-dc65703c2b64) Calendly

##### `[DV-INTERACT-005]` recommended, judgment

Long series (over about 90 points) get zoom or brush, a reset control, and the selection kept in the URL.

- **Do:** Range slider plus 'Reset zoom'.
- **Don't:** Make the reader squint at 400 daily points.
- **Check:** Zoom with reset for dense series.
- **Sources:** mobbin
- **Seen in:** [MOB-40](https://mobbin.com/screens/b6e8320c-6bfb-461b-aeff-a331e28061c9) Steep

##### `[DV-INTERACT-006]` recommended, judgment

Card actions (expand, view as table, export CSV or PNG, edit, delete) live in one consistent place in the card header, revealed on hover but always reachable by focus.

- **Do:** A '...' menu or a toolbar at the top right.
- **Don't:** Actions that appear in a different spot on each card.
- **Check:** Same actions in the same place on every card.
- **Sources:** mobbin
- **Seen in:** [MOB-02](https://mobbin.com/screens/b43a980d-6a77-48d5-b764-d697475a157c) LangChain, [MOB-03](https://mobbin.com/screens/205aefea-2dfc-4668-9af7-bc4921da1762) Mintlify, [MOB-09](https://mobbin.com/screens/0dbdb488-1169-4df7-8f8f-95c45a428225) Trello, [MOB-32](https://mobbin.com/screens/ef455d28-04ea-46f4-a289-cb6c283ea929) PlanetScale, [MOB-39](https://mobbin.com/screens/fe4fee7b-86cb-4916-934f-2ea0ce6de346) Hex

##### `[DV-INTERACT-007]` recommended, judgment

When the KPI row doubles as the chart selector, the selected tile shows state (outline, aria-selected) and the chart title changes with it.

- **Do:** Tabs styled as KPI tiles above the primary chart.
- **Don't:** A tab strip that looks identical selected and not.
- **Check:** Selected state is visible and announced.
- **Sources:** mobbin
- **Seen in:** [MOB-08](https://mobbin.com/screens/f8548434-b4ef-4e67-a360-72feb07a9003) Semrush, [MOB-10](https://mobbin.com/screens/bc8707aa-636a-4d38-bee0-6e328a9c78f9) Squarespace, [MOB-51](https://mobbin.com/screens/f9423573-e4eb-4e70-8968-f545da183ce5) Profound

##### `[DV-INTERACT-008]` recommended, judgment

A chart-type switcher offers at most 5 types, all valid for the data shape. Disable the others with a reason.

- **Do:** Vertical bar, horizontal bar, line, donut, number.
- **Don't:** A 22-tile picker with sunburst, word cloud and pictograph.
- **Check:** Switcher options are valid for the shape and 5 or fewer.
- **Sources:** mobbin
- **Seen in:** [MOB-37](https://mobbin.com/screens/8f15ac15-37aa-4376-b9c1-d7dafee29930) Zendesk, [MOB-38](https://mobbin.com/screens/84735c71-690d-4cf0-87e1-d6df98e442df) Notion

##### `[DV-INTERACT-009]` required, judgment

Marks respond on hover and focus (lift, outline or lighten), and the crosshair snaps to the nearest x. Nothing critical is hover-only on touch.

- **Do:** The hovered bar lifts; the same on focus.
- **Don't:** A tooltip with no change in the chart.
- **Check:** Hover and focus feedback exist and match.
- **Sources:** dataviz-skill, mobbin
- **Seen in:** [MOB-12](https://mobbin.com/screens/8439f27d-0396-4236-96e2-ce595af04b98) Exa

##### `[DV-INTERACT-010]` recommended, judgment

For analyst views, allow pinning a tooltip or comparing two points. Keep it out of executive views.

- **Do:** Click to pin, shift-click to compare.
- **Don't:** Compare tools on a 5-second overview.
- **Check:** Pin or compare only where the audience is analyst.
- **Sources:** mobbin
- **Seen in:** [MOB-15](https://mobbin.com/screens/4ee5bf3f-d6ba-4724-88c8-f9bc8d74cfd9) Fey

## DV-FILTER

### One set of filters, one slice of truth

**Dashboard filters sit in one row above what they scope, and every chart, tile and table under them re-renders on the same slice.**

When cards disagree because they answer different filters, readers stop trusting all of them.

**Do**

- Put date range first, with presets before the calendar
- Put the comparison control next to the range
- Reflect filters in the URL and as removable chips
- Cap group-by at 8 and fold the tail into Other
- Hold the previous render at reduced opacity while refetching

**Don't**

- Don't scatter per-chart filters unmarked
- Don't flash a skeleton on every refetch
- Don't offer granularity that the range can't support

#### Rules

##### `[DV-FILTER-001]` required, judgment

Dashboard-scope filters sit in one row above everything they scope. A chart-local override is allowed only if it is visibly marked as overridden and resettable.

- **Do:** One left-aligned row: date range, comparison, dimension filters.
- **Don't:** A different date picker inside each card with no indication.
- **Check:** One filter row; any local override is badged and has reset.
- **Sources:** dataviz-skill, mobbin
- **Seen in:** [MOB-07](https://mobbin.com/screens/e6bc47ca-58cf-4238-88bd-ddd99bb35e4c) Revolut Business, [MOB-52](https://mobbin.com/screens/3768d5f8-15d6-4c56-8ecb-ec8d437914f6) Customer.io

##### `[DV-FILTER-002]` required, judgment

Date range is the first filter. Presets (Today, 7 days, 30 days, 90 days, This month, Year to date) come before a calendar, the custom range sits behind them, and the resolved dates and timezone are shown.

- **Do:** Presets as rows on the left, two-month calendar on the right, Apply and Cancel.
- **Don't:** Make the reader click start and end dates for 'last 30 days'.
- **Check:** Presets exist; resolved dates visible.
- **Sources:** dataviz-skill, mobbin
- **Seen in:** [MOB-03](https://mobbin.com/screens/205aefea-2dfc-4668-9af7-bc4921da1762) Mintlify, [MOB-53](https://mobbin.com/screens/4487d391-95c4-46c2-aea5-21a8e8397c57) Kajabi, [MOB-56](https://mobbin.com/screens/3de2cbeb-e6c0-42c4-a0c9-9123a6147b0c) Vimeo

##### `[DV-FILTER-003]` recommended, judgment

Put a comparison control next to the range: previous period, same period last year, custom. Overlay the comparison as a muted dotted series and carry the delta into the KPIs.

- **Do:** 'vs Previous period' selector, dotted prior line labeled 'Preceding period'.
- **Don't:** Compare periods of different lengths.
- **Check:** Comparison control present; overlay is muted and labeled.
- **Sources:** mobbin
- **Seen in:** [MOB-05](https://mobbin.com/screens/0bb8b25f-0c3d-47c3-b20a-1447e7dbab9e) Whop, [MOB-11](https://mobbin.com/screens/f4f2cebe-5496-4959-9fbb-fe37fe2a5dd6) Google Analytics, [MOB-51](https://mobbin.com/screens/f9423573-e4eb-4e70-8968-f545da183ce5) Profound, [MOB-55](https://mobbin.com/screens/4ca7b81a-9cb8-497c-a728-e66ae0487f5e) Klaviyo

##### `[DV-FILTER-004]` required, judgment

Filters scope everything beneath them. Every chart, tile and table re-renders on the same slice, so the numbers reconcile.

- **Do:** One query context shared by the cards.
- **Don't:** A KPI that ignores the segment filter its chart obeys.
- **Check:** Tiles sum to charts under any filter.
- **Sources:** dataviz-skill, mobbin
- **Seen in:** [MOB-02](https://mobbin.com/screens/b43a980d-6a77-48d5-b764-d697475a157c) LangChain, [MOB-07](https://mobbin.com/screens/e6bc47ca-58cf-4238-88bd-ddd99bb35e4c) Revolut Business

##### `[DV-FILTER-005]` recommended, judgment

Offer granularity (hour, day, week, month) only where the range supports it, default it automatically, and keep prev and next range arrows beside the range.

- **Do:** Disable 'Hourly' on a 12-month range.
- **Don't:** Let a 2-year hourly request render 17,000 points.
- **Check:** Grain options track the range.
- **Sources:** mobbin
- **Seen in:** [MOB-10](https://mobbin.com/screens/bc8707aa-636a-4d38-bee0-6e328a9c78f9) Squarespace, [MOB-40](https://mobbin.com/screens/b6e8320c-6bfb-461b-aeff-a331e28061c9) Steep, [MOB-57](https://mobbin.com/screens/5c9722dd-e8e6-4ed8-b06c-687ac8d20b05) Amplitude

##### `[DV-FILTER-006]` recommended, judgment

Filter state lives in the URL and is shareable, shows as removable chips with a count, and has a Clear all.

- **Do:** 'Exclude bots equals Yes' chip with an x.
- **Don't:** Filters that reset on reload.
- **Check:** Reload and share keep the slice.
- **Sources:** mobbin
- **Seen in:** [MOB-30](https://mobbin.com/screens/7ec1f61d-bfbe-4481-9ced-eafac4916bbc) Cloudflare

##### `[DV-FILTER-007]` recommended, judgment

Group-by and breakdown cap at 8 groups with Top N plus Other, and warn before producing more.

- **Do:** 'Showing top 8 of 37. Other (29).'
- **Don't:** A stacked bar with 16 hues and a '+11 more' legend.
- **Check:** Group-by output is 8 or fewer series.
- **Sources:** mobbin, dataviz-skill
- **Seen in:** [MOB-41](https://mobbin.com/screens/1d042f08-1868-4567-bbb5-35ed5e51e9b0) Attio

##### `[DV-FILTER-008]` required, judgment

Refetch keeps the frame. While data reloads, hold the previous render at reduced opacity with a small inline progress indicator. No skeleton flash, no layout jump. Cancel stale requests.

- **Do:** opacity 0.6 on the chart while loading.
- **Don't:** Swap the chart for a skeleton on every filter change.
- **Check:** Filter change doesn't remount the chart.
- **Sources:** dataviz-skill

## DV-STATE

### Design every state

**Loading, empty, collecting, filtered-to-zero, error, stale and misconfigured are different states with different messages and actions.**

Dashboards spend much of their life in non-happy states. A wall of flat zero charts or a full-page spinner makes a working product look broken.

**Do**

- Use a skeleton that matches the final chart geometry
- Write four distinct empty cases: not set up, collecting data, filtered to zero, real zero
- Isolate errors to the card with a retry
- Say exactly what's missing in a misconfigured widget and give the fix
- Collapse many empty charts into one explanation

**Don't**

- Don't use a full-page spinner
- Don't show a flat zero line for data that hasn't been collected
- Don't blank the dashboard because one query failed

#### Rules

##### `[DV-STATE-001]` required, judgment

First load uses a skeleton that matches the final geometry (title, value, plot block, table rows). No full-page spinner.

- **Do:** Grey blocks in the exact card layout.
- **Don't:** A centered logo spinner over the whole app.
- **Check:** Skeleton and loaded states share geometry.
- **Sources:** mobbin, vois
- **Seen in:** [MOB-22](https://mobbin.com/screens/09371ef3-f0d0-4fc9-8ab1-607ab3d0e4ab) Square, [MOB-24](https://mobbin.com/screens/e42b6c72-0dcf-49b5-9a77-af71bf04c022) Zoho CRM, [MOB-26](https://mobbin.com/screens/c331abde-5e53-4dfe-bd6e-024f07f5feb1) Sentry

##### `[DV-STATE-002]` required, judgment

Four different empty cases, four different messages: (a) not set up: explain and offer the connect action, (b) collecting: say what's missing and when to check back, (c) filters returned nothing: say so and offer Clear filters, (d) the real value is zero: draw the chart with zero.

- **Do:** 'Not enough data yet. Check back after more visitors have visited.' with the threshold.
- **Don't:** One generic 'No data' for all four.
- **Check:** Each empty case has distinct copy and the right action.
- **Sources:** mobbin
- **Seen in:** [MOB-23](https://mobbin.com/screens/db7bd952-2556-4cf4-a74d-d98ee47aebec) Gorgias, [MOB-27](https://mobbin.com/screens/3dd361a6-4db4-4de0-9ab2-ea1e64c2123a) Supabase, [MOB-28](https://mobbin.com/screens/73ce6686-1274-49a3-9c1d-30a8ebf3bdc3) Visitors, [MOB-30](https://mobbin.com/screens/7ec1f61d-bfbe-4481-9ced-eafac4916bbc) Cloudflare, [MOB-31](https://mobbin.com/screens/affb78a1-d595-4bba-9884-4115ae538fe6) 15Five

##### `[DV-STATE-003]` required, judgment

Errors are isolated to the card with a message and a retry. One failing query never blanks the dashboard. Keep the last good render with a stale badge where possible.

- **Do:** 'Couldn't load revenue. Retry.' in the card, rest of the page intact.
- **Don't:** A full-page error for one failed card.
- **Check:** Simulate one failed query; the others still render.
- **Sources:** vois

##### `[DV-STATE-004]` required, judgment

A misconfigured widget says exactly what is missing and offers the fix in place.

- **Do:** 'The x-axis is missing a value. Configure widget.'
- **Don't:** A blank card.
- **Check:** Missing config produces a named message and an action.
- **Sources:** mobbin
- **Seen in:** [MOB-25](https://mobbin.com/screens/b3c6ee02-54cd-4d44-8940-db582022836d) Plane

##### `[DV-STATE-005]` recommended, judgment

Stale or partial data is badged with a timestamp. Partial periods follow DV-HONEST-004.

- **Do:** 'Last synced 1 day ago' with a refresh link.
- **Don't:** Quiet staleness.
- **Check:** Stale state is visible.
- **Sources:** mobbin
- **Seen in:** [MOB-57](https://mobbin.com/screens/5c9722dd-e8e6-4ed8-b06c-687ac8d20b05) Amplitude

##### `[DV-STATE-006]` recommended, judgment

Sparse data (fewer than about 3 points) shows markers, a stat or a table instead of a lonely line. A grid of mostly flat-zero charts collapses into one explanation.

- **Do:** One 'No activity in this range' state for six empty cards.
- **Don't:** Six flat zero charts side by side.
- **Check:** Sparse data has a purpose-built view.
- **Sources:** mobbin
- **Seen in:** [MOB-02](https://mobbin.com/screens/b43a980d-6a77-48d5-b764-d697475a157c) LangChain, [MOB-46](https://mobbin.com/screens/d5b2ad2a-dd83-4d6b-86fa-6edeee1991cd) Adaline

##### `[DV-STATE-007]` recommended, judgment

No layout shift between skeleton, loaded, empty and error. Reserve the container height including the x-axis band.

- **Do:** min-height on the card body.
- **Don't:** A fixed plot height with no room for axis labels, which makes a nested scrollbar.
- **Check:** Heights match across states.
- **Sources:** dataviz-skill

## DV-LAYOUT

### Compose the dashboard as a hierarchy

**Reading order follows importance: filters, hero KPIs, the primary trend, breakdowns, detail table. Every card has the same anatomy.**

A dashboard is read in seconds. The layout has to tell the reader where to look first and where to go for more.

**Do**

- Use 3 to 6 KPI tiles and one hero
- Keep to about 6 to 8 visualizations before scroll or tabs
- Use one card anatomy: title and scope left, actions right, value, plot, legend, footer link
- Pair a chart with its breakdown table
- Collapse to one column on small screens

**Don't**

- Don't fill a grid with equal-weight cards
- Don't decorate with hero illustrations
- Don't put 12 charts on one screen

#### Rules

##### `[DV-LAYOUT-001]` required, judgment

Page hierarchy: (1) filter row, (2) hero or KPI row, (3) primary trend, (4) breakdowns, (5) detail table. Reading order equals importance.

- **Do:** KPI row, then a wide trend, then 2-up breakdowns, then the table.
- **Don't:** Put the most important chart bottom-right.
- **Check:** Visual weight and order follow importance.
- **Sources:** article, mobbin
- **Seen in:** [MOB-08](https://mobbin.com/screens/f8548434-b4ef-4e67-a360-72feb07a9003) Semrush, [MOB-47](https://mobbin.com/screens/5ff3c997-7159-4bd2-aff3-368075eef01b) Ghost

##### `[DV-LAYOUT-002]` required, judgment

One card anatomy: title and scope on the left, actions on the right, then KPI value with delta, the plot, the legend, and a footer link. Padding and gaps come from spacing tokens (DS-SPACING-001).

- **Do:** The same ChartCard everywhere.
- **Don't:** Hand-built card layouts.
- **Check:** Every card matches the anatomy.
- **Sources:** mobbin, vois
- **Seen in:** [MOB-06](https://mobbin.com/screens/54de3e8b-7efb-40a8-b743-9b385558fc6b) Revolut Business, [MOB-12](https://mobbin.com/screens/8439f27d-0396-4236-96e2-ce595af04b98) Exa, [MOB-04](https://mobbin.com/screens/8e9ffe26-ef22-4540-b5e4-101f78abf96a) Asana

##### `[DV-LAYOUT-003]` recommended, judgment

Use a consistent grid (12-column or auto-fit minmax) with equal gaps and equal-height rows. Give charts a minimum readable size: lines about 320px wide, horizontal bars about 280px, plots at least 200px tall.

- **Do:** Container queries for the card, not just viewport breakpoints.
- **Don't:** An orphan card in a half-empty row.
- **Check:** No orphan cards; no card below its minimum size.
- **Sources:** vois

##### `[DV-LAYOUT-004]` recommended, judgment

KPI rows have 3 to 6 tiles. Each tile has a label, value, delta, and an optional 12-point sparkline. More than 6 means grouping under section headings.

- **Do:** Four tiles with deltas.
- **Don't:** A strip of 12 undifferentiated numbers.
- **Check:** KPI count and tile anatomy.
- **Sources:** article, mobbin, dataviz-skill
- **Seen in:** [MOB-05](https://mobbin.com/screens/0bb8b25f-0c3d-47c3-b20a-1447e7dbab9e) Whop, [MOB-08](https://mobbin.com/screens/f8548434-b4ef-4e67-a360-72feb07a9003) Semrush, [MOB-47](https://mobbin.com/screens/5ff3c997-7159-4bd2-aff3-368075eef01b) Ghost

##### `[DV-LAYOUT-005]` recommended, judgment

At most about 6 to 8 visualizations before scroll or tabs. Group under section headings and put secondary views in tabs.

- **Do:** Overview, Traffic, Sales tabs.
- **Don't:** One endless page of 20 cards.
- **Check:** Count per view; grouped.
- **Sources:** article
- **Seen in:** [MOB-13](https://mobbin.com/screens/bef56b40-0756-4135-a99c-72692615331b) Mixpanel

##### `[DV-LAYOUT-006]` required, judgment

Responsive: below 640px, one column; KPI tiles 2-up; wide tables become cards or scroll with a sticky first column; tooltips become tap to pin; chart height at least 200px.

- **Do:** Container queries and an explicit mobile layout for each card.
- **Don't:** Shrink a desktop chart until labels collide.
- **Check:** Checked at 320, 640 and 1280.
- **Sources:** vois, wcag

##### `[DV-LAYOUT-007]` recommended, judgment

Pair a chart with its breakdown table beneath it: rows with visibility checkboxes, color keys, min, average, max, change and a sparkline column.

- **Do:** Checkbox toggles a series in the chart and the table.
- **Don't:** A chart and a table that don't share state.
- **Check:** Table rows toggle chart series.
- **Sources:** mobbin
- **Seen in:** [MOB-15](https://mobbin.com/screens/4ee5bf3f-d6ba-4724-88c8-f9bc8d74cfd9) Fey, [MOB-42](https://mobbin.com/screens/2018e7b8-e4b1-4231-ab91-c66557122a98) Amplitude, [MOB-50](https://mobbin.com/screens/1d40ccee-b335-4a85-b25a-007cbc2731db) YNAB

##### `[DV-LAYOUT-008]` recommended, judgment

Customizable dashboards have an explicit edit mode: Add widget, drag handles, drop slots, dashboard variables and auto-refresh in a side panel. View mode hides all of it.

- **Do:** 'Add your first chart' as a dashed placeholder; Done editing.
- **Don't:** Edit controls mixed into view mode.
- **Check:** Edit and view modes are distinct.
- **Sources:** mobbin
- **Seen in:** [MOB-21](https://mobbin.com/screens/4180dd3e-e182-432a-9042-8dee319000d2) Basedash, [MOB-27](https://mobbin.com/screens/3dd361a6-4db4-4de0-9ab2-ea1e64c2123a) Supabase, [MOB-29](https://mobbin.com/screens/a5dd163e-dbcd-4ca2-90be-f35f7a09dd72) Twenty

## DV-SUSTAIN

### Build it to be fed live data

**Charts are driven by a typed config and real data, handle the ugly cases, and stay fast.**

A dashboard that works with the demo fixture and breaks with a 40-character label, a null, or 20,000 points isn't finished.

**Do**

- Drive chart, table view, tooltip, legend and export from one config
- Test with long labels, nulls, negatives, tiny and huge numbers
- Downsample past about 500 points per series
- Choose an update cadence by need and don't re-animate on refresh

**Don't**

- Don't hardcode data in a chart component
- Don't ship a chart that only works on the happy-path fixture

#### Rules

##### `[DV-SUSTAIN-001]` required, spec

Charts are driven by a typed config: data keys, labels, units, color tokens, formatter. The same config drives the chart, the table view, the tooltip, the legend and the export.

- **Do:** One ChartConfig, many consumers.
- **Don't:** Copy-pasted chart code per card.
- **Check:** spec.config_driven is true.
- **Sources:** article, vois

##### `[DV-SUSTAIN-002]` required, judgment

Handle extremes: long labels (middle truncation with the full text in a tooltip), huge and tiny numbers, negatives, nulls, one point, 10,000 points, many series. Downsample past about 500 points per series.

- **Do:** Test fixtures for each extreme.
- **Don't:** Ship after seeing only the demo data.
- **Check:** Fixtures exist and render.
- **Sources:** article

##### `[DV-SUSTAIN-003]` recommended, judgment

Choose update cadence by need: static, on-demand, polled, pushed. Real-time appends without replaying animation and pauses while the pointer is on a chart.

- **Do:** Auto-refresh setting (5 min) and a freshness stamp.
- **Don't:** Re-render the whole chart every second.
- **Check:** Cadence is documented; no re-animation.
- **Sources:** article, mobbin
- **Seen in:** [MOB-21](https://mobbin.com/screens/4180dd3e-e182-432a-9042-8dee319000d2) Basedash

##### `[DV-SUSTAIN-004]` recommended, judgment

Outputs leave the app: CSV export honors the current filters, PNG or PDF export is greyscale-safe, and print styles exist for report views.

- **Do:** 'Export CSV' beside the table.
- **Don't:** An export that ignores the filters on screen.
- **Check:** Export matches the view.
- **Sources:** article, mobbin
- **Seen in:** [MOB-03](https://mobbin.com/screens/205aefea-2dfc-4668-9af7-bc4921da1762) Mintlify, [MOB-08](https://mobbin.com/screens/f8548434-b4ef-4e67-a360-72feb07a9003) Semrush, [MOB-45](https://mobbin.com/screens/5b991815-9b72-4371-81fb-b43cd626bec6) Churnkey

##### `[DV-SUSTAIN-005]` required, auto, detector `inline-data`

Never hardcode data in a chart component. Data arrives as typed props or from a query. Fixtures live in stories and tests and are labeled.

- **Do:** chartData as a prop.
- **Don't:** A 12-row const inside the component that ships.
- **Check:** No large inline data array in non-test, non-story chart files.
- **Sources:** vois

##### `[DV-SUSTAIN-006]` recommended, judgment

Performance: SVG up to about 2,000 marks, canvas or aggregation beyond; memoize series; debounce resize; lazy-load charts below the fold.

- **Do:** LTTB downsampling for long series.
- **Don't:** Render 50,000 SVG nodes.
- **Check:** Profile with the largest realistic dataset.
- **Sources:** article

## DV-IMPL

### Use the Vois stack

**Build on the workspace's chart primitives, tokens and accessibility defaults before reaching for anything custom.**

Consistency and accessibility come free from shared primitives. Custom SVG should be the exception for forms the primitives lack.

**Do**

- Use shadcn Chart over Recharts: ChartContainer, ChartTooltip, ChartLegend
- Map each series key to a label and a chart token in the chart config
- Turn on accessibilityLayer
- Resolve chart tokens with vois_get_tokens

**Don't**

- Don't inline color strings in JSX
- Don't set fixed pixel widths on charts
- Don't invent token values: report a gap instead

#### Rules

##### `[DV-IMPL-001]` required, judgment

Use the workspace's chart primitives first: shadcn Chart over Recharts (ChartContainer, ChartTooltip, ChartLegend). Reach for custom SVG or d3 only for forms the primitives lack, such as heatmaps. Check the workspace manifest for the real names.

- **Do:** ChartContainer with a config.
- **Don't:** Bring in a second chart library for a bar chart.
- **Check:** Primitives used or the gap reported.
- **Sources:** vois

##### `[DV-IMPL-002]` required, judgment

The chart config maps each series key to a label and a chart token. Color strings never appear inline in JSX.

- **Do:** { revenue: { label: 'Revenue', color: 'var(--chart-1)' } }.
- **Don't:** stroke='#2563eb' on a Line.
- **Check:** Colors only in the config, only as tokens.
- **Sources:** vois

##### `[DV-IMPL-003]` required, auto, detector `missing-accessibility-layer`

Wrap each chart in a figure with a caption or title, set accessibilityLayer on Recharts charts, and give the container an accessible name.

- **Do:** <BarChart accessibilityLayer>.
- **Don't:** A bare chart in a div.
- **Check:** accessibilityLayer present.
- **Sources:** vois

##### `[DV-IMPL-004]` recommended, judgment

Chart token roles: chart-1 to chart-8 categorical, a one-hue sequential ramp, a diverging pair with a neutral, four status roles, and grid, axis, label and surface furniture. Resolve values from the workspace tokens (vois_get_tokens when available). If a role is missing, report a gap rather than inventing a value.

- **Do:** Get the chart token values before writing the config.
- **Don't:** Hardcode a palette 'for now'.
- **Check:** Every color traces to a token.
- **Sources:** vois, dataviz-skill

##### `[DV-IMPL-005]` recommended, auto, detector `slow-chart-animation`

Animate on first mount and when the user changes the range, filter or series, 300ms or less, off under reduced motion, never on refresh.

- **Do:** isAnimationActive={false} on refetch and live updates. A range the user picked may animate.
- **Don't:** Animate every refetch.
- **Check:** animationDuration at most 300.
- **Sources:** vois

##### `[DV-IMPL-006]` recommended, judgment

Tooltip and legend are separate components that use surface, elevation and text tokens.

- **Do:** ChartTooltipContent with the popover surface token.
- **Don't:** Inline styles on the tooltip.
- **Check:** Tooltip and legend use tokens.
- **Sources:** vois

##### `[DV-IMPL-007]` required, auto, detector `fixed-chart-width`

Charts are responsive: ChartContainer or ResponsiveContainer with an explicit min height or aspect ratio that includes the x-axis band. No fixed pixel width on the chart element.

- **Do:** className='min-h-[200px] w-full'.
- **Don't:** <LineChart width={600} height={300}>.
- **Check:** No numeric width on a chart element.
- **Sources:** vois, dataviz-skill


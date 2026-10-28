# Page Templates `[PATH-PAGE]`

Whole-page skeletons for consumer and SaaS web products, in five levels. This is the layer above the container patterns: `PATH-A` to `PATH-G` say how one container behaves, a page template says which containers a page holds, in what order, and what happens to them at each width.

The structured version is `data/page-templates.json`. Read the entry for your page there: purpose, navigation, what changes at phone, tablet and desktop, the overlays and states, the density tier, and the Mobbin screens the layout came from. This file holds the rules and the index.

## What a template is, and is not

A template is a skeleton. It decides regions, order, and responsive behavior. It does not decide content, words, or token values.

- Content rules come from the path each template routes to (`routes_to` in the JSON). Where a template and a routed rule disagree, the routed rule wins. A pricing page follows `PATH-F` for its plans, a marketing page follows `PATH-G` for its sections.
- Words go to righter. Spacing, row heights and hit areas come from `vois-tokens`, by token name. This skill never ships a pixel value.
- A template is not a design. Pick the skeleton, then apply `vois-components` and `vois-tokens`.

## Using it

1. Decide the level and product type (the table below).
2. Read that template's entry in `data/page-templates.json`.
3. Follow its `routes_to` paths for content, and the cross-cutting rules below for width, navigation, density, overlays and buttons.
4. Check the page at phone, tablet and desktop (`[PATH-PAGE-BREAKPOINTS]`).

## Levels `[PATH-PAGE-LEVELS]`

| Level | Name | Meaning |
|---|---|---|
| 0 | Entry | Front door. Explains the product and gets a signup. |
| 1 | Hub | Where people land after signing in, or a page that sells one thing. |
| 2 | Index | A list of things in one section. |
| 3 | Detail | One thing in full. |
| 4 | Utility | A page people visit rarely: settings, team, invoices, contact. |

Each page knows its parent. Back goes up exactly one level. Desktop shows the trail (Dashboard, Section, Item). Phone shows a back control to the parent and the page title.

## Template index

| Template | Level | Type | Density | Routes to |
|---|---|---|---|---|
| `[PATH-PAGE-MARKETING-HOME]` Marketing home | 0 | both | Spacious | `PATH-G` |
| `[PATH-PAGE-DASHBOARD]` Dashboard | 1 | saas | Dense | none |
| `[PATH-PAGE-FEATURE]` Feature page | 1 | marketing | Spacious | `PATH-G` |
| `[PATH-PAGE-FEED]` Feed home | 1 | consumer | Standard | none |
| `[PATH-PAGE-PRICING]` Pricing | 1 | marketing | Standard | `PATH-F` |
| `[PATH-PAGE-BLOG-INDEX]` Blog index | 2 | marketing | Spacious | `PATH-G` |
| `[PATH-PAGE-BROWSE]` Browse grid | 2 | consumer | Standard | none |
| `[PATH-PAGE-COLLECTION]` Collection table | 2 | saas | Standard | `PATH-B`, `PATH-B-SIMPLE`, `PATH-B-NARROW`, `PATH-B-ROW-OPEN` |
| `[PATH-PAGE-CUSTOMERS]` Customer stories | 2 | marketing | Spacious | `PATH-G` |
| `[PATH-PAGE-DATAGRID]` Data grid | 2 | saas | Dense | `PATH-B-COMPLEX`, `PATH-B-NARROW`, `PATH-TABLE-DENSITY` |
| `[PATH-PAGE-ARTICLE]` Blog article | 3 | marketing | Spacious | `PATH-G` |
| `[PATH-PAGE-CASE-STUDY]` Case study | 3 | marketing | Spacious | `PATH-G` |
| `[PATH-PAGE-PRODUCT]` Product detail | 3 | consumer | Standard | none |
| `[PATH-PAGE-RECORD]` Record detail | 3 | saas | Standard | `PATH-E`, `PATH-SET-VIEW-EDIT-BLOCK` |
| `[PATH-PAGE-REPORT]` Report table | 3 | saas | Dense | `PATH-B-NARROW`, `PATH-TABLE-DENSITY` |
| `[PATH-PAGE-SPLIT]` List with detail pane | 3 | saas | Dense | `PATH-B-ROW-OPEN` |
| `[PATH-PAGE-CONTACT]` Contact sales | 4 | marketing | Standard | `PATH-G`, `PATH-C-SIMPLE` |
| `[PATH-PAGE-INVOICES]` Invoices and billing | 4 | saas | Standard | `PATH-B-SIMPLE`, `PATH-B-NARROW` |
| `[PATH-PAGE-SETTINGS]` Settings | 4 | both | Standard | `PATH-A`, `PATH-A-DEPTH-DEEP`, `PATH-SET-VIEW-EDIT-BLOCK` |
| `[PATH-PAGE-TEAM]` Members table | 4 | saas | Standard | `PATH-B-SIMPLE`, `PATH-B-NARROW`, `PATH-D` |

## Cross-cutting rules

### Page widths `[PATH-PAGE-BREAKPOINTS]`

Phone is below md (768px). Tablet is md up to lg (768px to 1023px). Desktop is lg and up (1024px). Check every template at all three.

### Page levels and drill down `[PATH-PAGE-LEVELS]`

Number the pages by level: 0 Entry, 1 Hub, 2 Index, 3 Detail, 4 Utility. Each page knows its parent. Back goes up exactly one level. Desktop shows the trail (Dashboard, Section, Item). Phone shows a back control to the parent and the page title.

### App shell navigation by width `[PATH-PAGE-NAV]`

Desktop: labeled sidebar. Tablet: icon rail. Phone: bottom tab bar with at most five slots, the last being More. The settings section menu is separate and follows PATH-A. A marketing top bar shows its links at lg and up and folds them into one menu control below that. The signup button stays visible at every width.

### Density tier by page `[PATH-PAGE-DENSITY-MAP]`

Marketing and landing pages, for consumer apps and SaaS products alike: Spacious, and always looser than the product itself. Pricing, contact, consumer app screens, forms, settings and everyday lists: Standard. Dashboards, analytics tables, data grids, inboxes: Dense on desktop.

### Dense is for pointers only `[PATH-PAGE-DENSITY-TOUCH]`

Rows go back to --table-row-h-regular. Targets reach --hit-area-min. Gaps between blocks go up one step. Fewer rows fit on screen, and that is accepted. A SaaS screen is tighter on desktop than on a phone, never the other way round.

### Which overlay opens `[PATH-PAGE-OVERLAY]`

A yes or no, or a pick: modal on desktop, action sheet on phone. Any text field: modal on desktop, full screen on phone, never an action sheet. Editing or previewing a row, or filters: right panel on tablet and desktop, full screen on phone. Notifications: right panel. Always keep a visible way back, and Escape or the scrim closes it on desktop.

### Button order `[PATH-PAGE-BUTTON-ORDER]`

Primary is rightmost. Secondary sits to its left, then tertiary or ghost to the left of that. When buttons stack on phone, primary is on top. One primary per group.

### View to edit on the same page `[PATH-PAGE-VIEW-EDIT]`

Open in view state. Edit is an explicit action that swaps the same fields to inputs in place. Save and Cancel replace Edit. Leaving with unsaved changes opens a Discard confirmation (action sheet on phone). On phone Save sits in a sticky bar.

### Tables at narrow widths `[PATH-PAGE-TABLE-WIDTH]`

Do not hide columns. Follow PATH-B-NARROW: four columns or fewer stack as list rows, more scroll sideways inside the table with the first column and header pinned. The page itself never scrolls sideways.

## Density at each width

Density tiers are defined in `content-density.md` (`[PATH-DENSITY-DENSE]`, `[PATH-DENSITY-STANDARD]`, `[PATH-DENSITY-SPACIOUS]`). Templates add one thing: the tier changes with width.

| Tier | Desktop | Phone and tablet |
|---|---|---|
| Dense | Table rows `--table-row-h-dense`. Tight gap steps. | Rows `--table-row-h-regular`. Targets `--hit-area-min`. Gaps up one step. |
| Standard | Rows `--table-row-h-regular`. Mid gap steps. | Same rows and gaps. Side gutter drops to the phone gutter. |
| Spacious | Far apart sections, large type. | Gaps step down one notch, still looser than Standard. Targets `--hit-area-min`. |

Token values come from the token source, not from this table. Do not copy values from it into code.

## What this is built from

The templates were drawn as an interactive, responsive wireframe set, then checked against these rules. The wireframe set is a review aid. The JSON is the source an agent should read.

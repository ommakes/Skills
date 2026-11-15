---
name: vois-tokens
description: Rules and patterns for building UI with shadcn/ui, Tailwind v4 or StyleX, and Motion against a Vois design token set. Use when building components, pages, or any UI that should conform to the workspace design system. Covers spacing, typography, color tokens, elevation, shape, component architecture, overlays, animation, accessibility, and modern CSS/StyleX patterns.
version: 1.40.0
---

# Vois Tokens Skill (Rules & Values Edition)

> Full version & updates: https://github.com/ommakes/Skills/blob/main/vois-tokens/SKILL.md. The full version adds a live per-edit checker hook (`scripts/`) for Claude Code, Cursor, and Codex (including the elevation and shadow detectors), a "Reviewing Existing UI" workflow, an element-to-elevation map, and the registry's `vois-theme.css`. Those are code-editing features with no Figma equivalent, so this edition gives the design rules and token values as a reference. Vois's Figma plugin syncs the tokens into your file as real variables.

You are building UI for a design system that uses **shadcn/ui**, **Tailwind v4 or StyleX**, and **Motion**. Deviation produces inconsistent, unmaintainable UI. Find out which styling engine the project uses (`tailwindcss` or `@stylexjs/stylex` in `package.json`, or ask) before applying the Tailwind- or StyleX-specific sections. Everything else applies either way.

## Taste dials

If your workspace defines **VARIANCE** (layout asymmetry), **MOTION** (animation richness) and **DENSITY** (information per screen) as 1 to 10 dials, use them to tune default choices. DENSITY biases spacing tighter or looser. MOTION biases how much animation to add. VARIANCE biases layout symmetry and gates `DS-SLOP-001`. **Dials never override hard rules**: animation caps, reduced motion, contrast, touch targets and the spacing scale hold at any dial value. With no dials, assume 5/4/5.

## Before You Write Anything

1. Check the component manifest. If a component exists, use it.
2. Check the token tables below (spacing, type, color, elevation, shape, icon size, breakpoints). If a token exists, use it.
3. If neither exists, flag it. Don't invent values or components.

## Tokens `[DS-TOKEN]`

Four layers: Global palettes, Base, System, Component. Use the most specific layer that fits, and never name a Global palette step in component code `[DS-TOKEN-001]`. A token's CSS name is its Web code syntax in Figma. Don't derive one by hand; if a variable has none, flag it `[DS-TOKEN-002]`. Define tokens in `:root` (light) and `.dark`, not in `@theme`, because Tailwind v4 reads `--text-*` in `@theme` as font sizes. Expose the names a utility or component library needs through `@theme inline` aliases `[DS-TOKEN-003]`.

The Base layer sets the brand: `--base-brand`, `--base-accent-solid`, `--base-accent-soft`. Because the primary action states and the accent System tokens point at palette steps, 13 color tokens carry the brand (those three, `--action-primary-resting|hover|focus|pressed|disabled|text`, `--bg-accent`, `--text-accent`, `--icon-accent`, `--border-accent`), plus four font families (`--font-family-brand|system|written|mono`). A brand theme overrides these 17 and nothing else `[DS-TOKEN-004]`.

**shadcn/ui mapping** `[DS-TOKEN-005]`: `background` is `--bg-background`. `foreground`, `card-foreground`, `popover-foreground`, `secondary-foreground` and `accent-foreground` are `--text-primary`. `card` is `--bg-card`. `popover` is `--elevation-surface-popup`, the popup fill, so a stock Popover matches the Vois menus (it needs the project's `@theme inline { --color-popover: var(--popover) }` alias). `primary` is `--action-primary-resting`, `primary-foreground` is `--action-primary-text`, `secondary` is `--action-secondary-resting`. `muted` is `--bg-subtle`, `muted-foreground` is `--text-secondary`, `accent` is `--bg-hover`. `destructive` is `--base-negative`. `border` is `--border-pretty`, `input` is `--input-border`, `ring` is `--border-state-focus`. `radius` is `--radii-8`, so shadcn's derived steps land on 6 (`md`), 8 (`lg`) and 12 (`xl`).

## Pre-Submit Checklist

Run this before calling anything done. Each ID is the rule in the section named by its prefix.

- **Spacing:** values divisible by 4 or 8, no arbitrary values, consistent at every tested breakpoint `[DS-SPACING-001]` `[DS-SPACING-003]` `[DS-SPACING-004]`.
- **Typography:** at most 3 text styles per component `[DS-TYPOGRAPHY-001]`; sequential headings `[DS-TYPOGRAPHY-002]`; numbers in mono with `tabular-nums` `[DS-TYPOGRAPHY-003]`; `text-wrap: balance` on headings and `pretty` on body `[DS-TYPOGRAPHY-006]` `[DS-TYPOGRAPHY-007]`; `65ch` text cap `[DS-TYPOGRAPHY-008]`; `…` not `...` `[DS-TYPOGRAPHY-009]`; curly quotes `[DS-TYPOGRAPHY-010]`.
- **Color:** no hex `[DS-COLOR-001]`, no raw palette classes `[DS-COLOR-002]`; status uses the four role tokens `[DS-COLOR-008]`; color is never the only signal `[DS-COLOR-003]`; decorative icons `aria-hidden` `[DS-COLOR-005]`; both modes checked `[DS-COLOR-007]`.
- **Components:** manifest checked first `[DS-COMPONENT-001]`; cva for variants `[DS-COMPONENT-002]`; semantic variants `[DS-COMPONENT-006]`; control heights from size tokens `[DS-COMPONENT-007]`; modals use `inert`, `overscroll-behavior: contain`, `scrollbar-gutter: stable` `[DS-MODAL-001]` `[DS-MODAL-002]` `[DS-MODAL-003]`; dialog body scrolls, at most two footer buttons, no nested modals, no modal for navigation `[DS-MODAL-004]` `[DS-MODAL-005]` `[DS-MODAL-006]` `[DS-MODAL-007]`.
- **Surfaces:** concentric radius `[DS-SURFACE-001]`; optical alignment `[DS-SURFACE-003]`; shadows for depth, borders for dividers `[DS-SURFACE-007]`; black/white 0.1 image outlines `[DS-SURFACE-010]`; staged enters `[DS-SURFACE-011]`; softer exits `[DS-SURFACE-013]`; icon swaps scale 0.25 to 1 with blur `[DS-SURFACE-014]`.
- **Elevation and shape:** the five tiers only, no raw shadows `[DS-ELEVATION-002]` `[DS-ELEVATION-007]`; dark mode never shadow alone `[DS-ELEVATION-005]`; docked panels use the directional token `[DS-ELEVATION-006]`; a shape role before a number `[DS-SHAPE-001]` `[DS-SHAPE-005]`.
- **Animation:** under 300ms (500ms for large elements) `[DS-ANIMATION-001]` `[DS-ANIMATION-002]`; none keyboard-triggered `[DS-ANIMATION-003]`; reduced motion `[DS-ANIMATION-004]`; no `scale(0)` `[DS-ANIMATION-005]`; `transform-origin` at the trigger `[DS-ANIMATION-006]`; hover guarded for touch `[DS-ANIMATION-007]`; `will-change` only when stutter is seen `[DS-ANIMATION-009]`; no `transition: all` `[DS-TAILWIND-005]`; durations and curves from motion tokens `[DS-MOTION-001]`; morphs inside one token, trays stay mounted, blur capped, springs at `bounce: 0`, delight never gates the task `[DS-MOTION-003]` `[DS-MOTION-004]` `[DS-MOTION-005]` `[DS-MOTION-006]` `[DS-MOTION-007]`.
- **Accessibility:** `:focus-visible` rings that follow the ring rule `[DS-A11Y-002]` `[DS-A11Y-003]` `[DS-A11Y-018]`; 44px hit area `[DS-A11Y-001]`; AA contrast `[DS-A11Y-004]`; real buttons and links `[DS-A11Y-005]`; `alt` on images `[DS-A11Y-010]`; `fieldset`/`legend` for groups `[DS-A11Y-016]`; lists as lists `[DS-A11Y-011]`; dialog rules `[DS-A11Y-019]` to `[DS-A11Y-023]`.
- **Layout:** `svh`/`lvh`/`dvh`, never `vh` `[DS-LAYOUT-001]`; tested at 360, 600, 768 and 1024 `[DS-RESPONSIVE-002]`; primary content stays full size, secondary reflows first `[DS-RESPONSIVE-006]` `[DS-RESPONSIVE-007]`; grid class from region width, margins and gutters from tokens `[DS-GRID-001]` `[DS-GRID-004]` `[DS-GRID-007]`; panels follow the width rules `[DS-PANEL-002]` `[DS-PANEL-003]` `[DS-PANEL-006]` `[DS-PANEL-008]`; `gap` not sibling margins `[DS-LAYOUT-COMP-001]`; `min-width: 0` on text flex children `[DS-LAYOUT-COMP-003]`; `aspect-ratio` `[DS-LAYOUT-COMP-005]`; width tokens `[DS-LAYOUT-WIDTH-001]` to `[DS-LAYOUT-WIDTH-004]`; auto-growing textareas `[DS-LAYOUT-FIELD-001]` to `[DS-LAYOUT-FIELD-004]`.
- **CSS:** no `#id` selectors `[DS-CSS-002]`; max 2 selector levels `[DS-CSS-003]`; `em` media queries `[DS-CSS-007]`; StyleX: plugin wired, tokens from `defineVars()` `[DS-STYLEX-001]` `[DS-STYLEX-002]`.
- **Data tables, marketing surfaces, questionnaires:** every rule in those sections is part of this checklist when the work touches them. So is every `[DS-SLOP-001]` to `[DS-SLOP-011]` rule.


## Spacing `[DS-SPACING]`

All spacing is divisible by **4 or 8**. The one exception is `--grid-margin` and `--grid-gutter` between their end values (see Grid and Panels) `[DS-SPACING-001]`.

**Scale** (`--space-{px}`): 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 80, 88, 120, 128px. Use `gap` for layout spacing, padding for internal spacing, and avoid margin for layout `[DS-SPACING-002]`. Tailwind v4 accepts any spacing value without arbitrary syntax. Stay on the scale anyway `[DS-SPACING-003]`. Check spacing at every responsive breakpoint `[DS-SPACING-004]`.

## Typography `[DS-TYPOGRAPHY]`

- No more than 3 text styles per component/section `[DS-TYPOGRAPHY-001]`. Never skip heading levels (h1→h2→h3, never h1→h3) `[DS-TYPOGRAPHY-002]`.
- Monospace + `tabular-nums` for all numeric data (prices, counts, timestamps) `[DS-TYPOGRAPHY-003]`.
- Font size communicates hierarchy, if two things feel equally important, deprioritize one `[DS-TYPOGRAPHY-004]`.

**Type scale:**

| Level | Class | Size | Line height | Weight | Use |
|---|---|---|---|---|---|
| Page Heading | H0 | 52px desktop / 40px mobile | 64px / 56px | bold | Page title, once per screen |
| Section Heading | H1 | 36px desktop / 32px mobile | 44px / 40px | semibold | Page sections |
| Feature Heading | H2 | 24px | 32px | semibold | Named items, modal titles, core actions |
| Item Heading | H3 | 18px | 26px | semibold | Key data points, nav labels |
| Body Heading | H4 | 16px | 24px | semibold | Highlighted inline text, button labels |
| Label Heading | H5 | 14px | 20px | medium | Input labels, short descriptions (max 2 lines) |
| Caption | H6 | 12px | 16px | medium | Fine print, secondary metadata |
| Body | Body | 16px | 24px | normal | Long-form content, input field content |
| Description | Description | 14px | 20px | normal | Toasts, alerts, dialogs, popovers |

Fonts are workspace-specific via `--font-heading`, `--font-body`, `--font-mono`, reference the token, never a font name directly `[DS-TYPOGRAPHY-005]`. For headings that scale across viewports (hero/marketing), use `clamp(1rem, 2vw + 0.5rem, 2rem)` instead of fixed sizes; don't use it for application body text.

**Text wrapping:** `text-wrap: balance` on all headings H0–H3 `[DS-TYPOGRAPHY-006]`; `text-wrap: pretty` on body copy `[DS-TYPOGRAPHY-007]`; cap text containers at `max-width: 65ch` (not a fixed px width) `[DS-TYPOGRAPHY-008]`.

**Copy details:** ellipsis is `…` not `...` `[DS-TYPOGRAPHY-009]`; curly quotes not straight `[DS-TYPOGRAPHY-010]`; non-breaking spaces for units/brand names (`10&nbsp;MB`); "Loading…" not "Loading..." `[DS-TYPOGRAPHY-011]`; active voice, "Save changes" not "Changes will be saved" `[DS-TYPOGRAPHY-012]`; specific button labels, "Delete project" not "Confirm"/"OK" `[DS-TYPOGRAPHY-013]`; errors tell the user what to do next `[DS-TYPOGRAPHY-014]`.

## Color `[DS-COLOR]`

- Never hardcode hex values `[DS-COLOR-001]`. Never use Tailwind's built-in palette where a token exists `[DS-COLOR-002]`.
- Color is never the only signal. Pair error, success and notice states with an icon or label `[DS-COLOR-003]`.
- **60/30/10:** about 60% neutral, 30% secondary, 10% accent or brand `[DS-COLOR-004]`. Decorative icons get `aria-hidden="true"` `[DS-COLOR-005]`.

**Status colors** are four semantic roles: `info`, `positive`, `negative` and `notice`. Each has five tokens, named after the Figma variables: `--base-{role}`, `--bg-{role}`, `--text-{role}`, `--border-{role}`, `--icon-{role}`. Alert, Badge, Toast, inline validation and banners read these tokens, never a palette class, a literal color or a one-off token `[DS-COLOR-008]`. The role is `notice`, not `warning`. Pick the role by meaning: `info` is neutral context, `positive` is success or completion, `negative` is an error, a failure or a destructive action, `notice` is caution before it becomes an error. There is no `destructive` token. A destructive Button reads `--base-negative`, and `destructive` is only the shadcn variant name `[DS-COLOR-009]`. Older kits' `--color-destructive`, `--color-success` and `--color-warning` become `negative`, `positive` and `notice`. Every token has a light and a dark value. Text on `--bg-{role}` needs 4.5:1. The base color and border against the page need 3:1.

Tailwind v4 uses **OKLCH**, for example `--color-primary: oklch(0.637 0.237 259.4)`. Palette values are per project.

**Dark mode:** every color token has a dark value `[DS-COLOR-006]`, set with `@custom-variant dark (&:is(.dark *))`. Use `light-dark()` for simple two-value swaps, with `color-scheme: light dark` on `html`. Use the `dark:` modifier for complex variants. Check both modes before shipping `[DS-COLOR-007]`.

## Components `[DS-COMPONENT]`

- Check the manifest first. If `<Button>`, `<AlertBanner>` or `<DataTable>` exists, use it `[DS-COMPONENT-001]`.
- Use **cva** for variants, no className ternaries `[DS-COMPONENT-002]`. Style internals with `data-slot`, not arbitrary child selectors `[DS-COMPONENT-003]`.
- **New-York style** is the shadcn default `[DS-COMPONENT-004]`. Radix for structure and behavior, Tailwind for style. Don't collapse them `[DS-COMPONENT-005]`.
- Pick the most semantic variant (`destructive`, `ghost`, `outline`) over `default` `[DS-COMPONENT-006]`.
- **Control heights** come from size tokens. Button: 28 `--size-action-medium`, 36 `--size-action-large` (web default), 48 `--size-action-x-large` (native default). The circular action is 56 `--size-action-circular`, and no other control is 56. Input and Select are `--size-field-web` (36) or `--size-field-native` (48). `--size-field-compact` (32) is only for an inline field in a table or dense row. A Button next to a field matches its height `[DS-COMPONENT-007]`.

```tsx
const buttonVariants = cva("inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors", {
  variants: {
    variant: { default: "bg-primary text-primary-foreground hover:bg-primary/90", destructive: "bg-negative text-negative-foreground hover:bg-negative/90", outline: "border border-input bg-background hover:bg-accent", ghost: "hover:bg-accent hover:text-accent-foreground" },
    size: { default: "h-9 px-4 py-2", sm: "h-8 px-3 text-xs", lg: "h-12 px-8" },
  },
  defaultVariants: { variant: "default", size: "default" },
})
```

**Modals and dialogs:** use `inert` on background content (Radix Dialog does this) `[DS-MODAL-001]`, `overscroll-behavior: contain` on the scrollable container `[DS-MODAL-002]`, and `scrollbar-gutter: stable` on `html` `[DS-MODAL-003]`. The dialog body scrolls while the header and footer stay in view `[DS-MODAL-004]`. A footer has at most two buttons, a primary and a Cancel. A third action is a link on the left `[DS-MODAL-005]`. Never nest modals: a second step replaces the content of the same dialog (a pushed view with Back) or becomes a page, and a destructive confirmation from inside a dialog does the same `[DS-MODAL-006]`. Never use a modal for navigation. A list of places is a menu or a page `[DS-MODAL-007]`. Dialog accessibility: every dialog has an accessible name (visually hidden if needed), and an AlertDialog also says what will happen `[DS-A11Y-019]`. First focus goes to Cancel in a destructive AlertDialog, the first field in a form dialog, or the primary action in a non-destructive confirmation `[DS-A11Y-020]`. Closing returns focus to the opener `[DS-A11Y-021]`. Escape closes a dialog, and a scrim click closes a Dialog but not an AlertDialog. Block them only while closing would lose money, data or a legal step, and keep a visible Cancel `[DS-A11Y-022]`. Anything done by dragging also works with a tap or the arrow keys `[DS-A11Y-023]`.

**Accordions:** `interpolate-size: allow-keywords` animates height `0` to `auto` without JS measuring.

## Surfaces `[DS-SURFACE]`

Detail-level rules for nested surfaces, optical alignment, image treatment, and animation choreography, the things that separate "functional" from "feels considered."

**Concentric border radius:** when nesting rounded elements, `outerRadius = innerRadius + padding` `[DS-SURFACE-001]`. Mismatched radii on nested elements is one of the most common things that makes UI feel off. If the padding between two surfaces exceeds 24px, treat them as independent and pick each radius on its own `[DS-SURFACE-002]`. Example: `rounded-2xl p-2` (16px radius, 8px padding) outer → `rounded-lg` (8px = 16-8 ✓) inner.

**Optical over geometric alignment**, when geometric centering looks wrong, align optically `[DS-SURFACE-003]`. Buttons with text + icon: icon-side padding = text-side padding − 2px `[DS-SURFACE-004]`. Play-button triangles: shift right ~2px, their geometric center isn't their visual center `[DS-SURFACE-005]`. Asymmetric icons (stars, arrows): fix the SVG viewBox/path directly if possible `[DS-SURFACE-006]`.

**Shadows over borders for depth:** cards/containers/bordered buttons that need depth should use a layered `box-shadow`, not a solid `border`, shadows adapt to any background, border colors don't `[DS-SURFACE-007]`. Don't apply this to dividers or layout-separation borders, those stay borders `[DS-SURFACE-008]`. Use shadows for: cards with depth, bordered buttons, elevated elements (dropdowns/modals), elements on varied/image backgrounds. Use borders for: list dividers, table cell boundaries, form input outlines, hairline separators.

**Image outlines:** subtle 1px outline for consistent depth `[DS-SURFACE-009]`. Color is non-negotiable, light mode `rgba(0,0,0,0.1)`, dark mode `rgba(255,255,255,0.1)`; never a tinted near-black/near-white from the palette, it reads as dirt on the image edge `[DS-SURFACE-010]`. Use `outline` not `border` (doesn't affect layout) with `-outline-offset-1`.

**Enter animations:** split into semantic chunks (title, description, actions) and stagger ~100ms between groups, rather than animating one large container `[DS-SURFACE-011]`. Combine `opacity` + `blur` + `translateY`, not opacity alone. Use `initial={false}` on `AnimatePresence` to skip enter animations on first load for elements already in their default state, but not on staged hero entrances that depend on `initial` firing `[DS-SURFACE-012]`.

**Exit animations** should be softer/shorter than enters `[DS-SURFACE-013]`: small fixed `translateY` (e.g. -12px) not full container height; ~150ms vs ~300ms enter; keep a little directional movement so it doesn't just vanish; full slide-out only when spatial context matters (a card returning to a list).

**Icon state transitions** (play→pause, like→liked): animate `opacity` + `scale` + `blur`, not visibility toggling `[DS-SURFACE-014]`. Exact values: scale `0.25`→`1` (never 0.5/0.6), opacity `0`→`1`, blur `4px`→`0px`, transition `motionSpring.standard` (`bounce` is always 0 and the duration is the base motion token, `[DS-MOTION-006]`). Without a Motion dependency, keep both icons in the DOM (one absolutely positioned) and cross-fade with CSS over `var(--motion-duration-base)` using `var(--motion-ease-standard)`. Animate icons appearing on hover, state-change icons, and contextual toolbar icons, not static navigation or decorative icons.

## Elevation `[DS-ELEVATION]`

Five tiers plus "no shadow". Don't invent a sixth, and don't hand-write a shadow. Each tier is a token, a stack of low-alpha black layers made in Figma.

| Tier | Token | Used by |
|---|---|---|
| none | | Pressed cards, disabled elements, static sections that only group content |
| Base | `--shadow-base` | Card, Choice Card and the segmented indicator at rest |
| Small | `--shadow-small` | Card and Choice Card on hover, Switch knob, Hover Card |
| Medium | `--shadow-medium` | Dropdown menus and select lists |
| Large | `--shadow-large` | Dialog, Tooltip |
| XLarge | `--shadow-xlarge` | Only a dragged item or a full-screen surface |

- **Layers** `[DS-ELEVATION-002]`: page (none to Medium), dropdown `--z-dropdown` (Medium), overlay `--z-overlay` (Small to Large), modal `--z-modal` (Large, XLarge). Z-index order is modal 1300, dropdown 1400, overlay 1500, so a popup opened from a dialog shows above it and keeps its own lighter tier. Otherwise don't put a heavier shadow on a lower layer.
- **Scrim** `[DS-ELEVATION-001]`: the backdrop is `--bg-overlay-dark` (20%), never a darker shadow or a literal color.
- **State** `[DS-ELEVATION-003]`: hover goes up at most one tier, pressed goes down one tier or to none, a dragged item goes high, a disabled element is flat. Focus never changes elevation. The focus ring is the indicator.
- **Resting cards** keep Base or Small. A section that only groups content stays flat `[DS-ELEVATION-004]`.
- **Dark mode** `[DS-ELEVATION-005]`: never shadow alone, because a 4 to 5% black shadow is invisible on a dark surface. Base and Small carry no shadow. A lighter fill and a 1px hairline carry them. Fill follows the layer: page Base `--bg-card`, Small `--elevation-surface-small`, a modal layer `--elevation-surface-raised`, a dropdown or overlay layer (menu, select, hover card) `--elevation-surface-popup`, one step above a Dialog. `--elevation-hairline` is transparent in light. `.dark` redefines `--shadow-base` to `--shadow-xlarge`, so a component that reads a tier token gets the dark shadow. Set the fill and edge from the tokens, never hand-written values.
- **Docked panels** `[DS-ELEVATION-006]`: a panel docked to an edge casts its shadow away from it (right-docked negative x, left positive x, bottom negative y, top positive y, centered x is 0) with a negative spread. Use `--shadow-large-right|left|bottom|top`.
- **Raw shadows** `[DS-ELEVATION-007]`: no `box-shadow` literal with blur, no `shadow-[...]`, no Tailwind `shadow-md`. A zero-blur ring (spread only) is not a tier and is allowed.
- At most two shadow tiers at rest in one view `[DS-ELEVATION-008]`. Large and XLarge only on overlays, hover and a dragged item `[DS-ELEVATION-009]`. Inset shadow only for recessed or pressed elements. A zero-blur inset ring used as an edge or focus ring is fine `[DS-ELEVATION-010]`. Between Medium or heavier tiers, cross-fade a pre-drawn layer instead of animating `box-shadow`. A 1 to 2px ring may animate `[DS-ELEVATION-011]`. Check text (4.5:1) and control edge (3:1) contrast on every elevated fill, not only the page `[DS-ELEVATION-012]`.

## Shape `[DS-SHAPE]`

Choose a shape role before a number: `--shape-sharp`, `--shape-subtle`, `--shape-rounded`, `--shape-soft`, `--shape-pill`, `--shape-circle`, `--shape-responsive-soft`, `--shape-responsive-elliptical`. Decide from size, aspect ratio, prominence and content. Prefer the project's existing component, then a role, then a `--radius-*` token `[DS-SHAPE-001]`.

- Controls keep the fixed control radius `--shape-subtle`. Tags, chips, pill tabs, segmented controls and status indicators are `--shape-pill`. Avatars and round icon buttons are `--shape-circle`. Don't pill a button or input unless the project's component already is one `[DS-SHAPE-002]`.
- Large visual surfaces that change size with the layout (hero media, image-led cards, promo tiles) use `--shape-responsive-soft`. The wrapper declares `container-type: inline-size`. Dialogs, menus and standard cards keep fixed radii `[DS-SHAPE-003]`. `--shape-responsive-elliptical` is for distinctive media only, and is round only on a 3:2 box `[DS-SHAPE-004]`.
- Never write a one-off radius (`rounded-[19px]`). Use a role or a `--radius-*` token, or name the missing role `[DS-SHAPE-005]`. The concentric rule applies between fixed roles only `[DS-SHAPE-006]`. Squircle corners are an enhancement on soft and responsive roles only, behind `@supports (corner-shape: squircle)`, never on controls, pills or circles `[DS-SHAPE-007]`.

## Iconography `[DS-ICON]`

| Size | Class | Use |
|---|---|---|
| 16px | `size-4` | Inline with body/label text, inside inputs |
| 20px | `size-5` | Inline with H4/H5 text, default button icon |
| 24px | `size-6` | Standalone icon buttons, nav items |
| 32px | `size-8` | Empty states, feature callouts, large standalone icons |

Tie icon size to the adjacent text size, never eyeball it. Single stroke width across the icon set, `1.5px` default (lucide-react/Radix Icons), don't mix weights on the same screen `[DS-ICON-001]`. If the surrounding text size doesn't map cleanly to a size above, round to the nearest one `[DS-ICON-002]`.

## Layout & Responsive `[DS-LAYOUT]` `[DS-RESPONSIVE]`

Stop using `vh`, mobile browser chrome changes available height as you scroll `[DS-LAYOUT-001]`. Use `svh` (small viewport, max chrome assumed, hero sections, modals, first-load fit), `lvh` (large viewport, min chrome, full-screen backgrounds), or `dvh` (dynamic, updates live, interfaces resizing with the mobile keyboard). Default to `svh`; reach for `dvh` only when layout must respond to chrome changes live.

For long pages, use `content-visibility: auto` with `contain-intrinsic-size` on sections far below the fold to skip rendering until they approach the viewport `[DS-LAYOUT-002]`, not on anything visible on initial load.
**Responsive:** mobile-first, no prefix = baseline, `md:`/`lg:` are enhancements `[DS-RESPONSIVE-001]`. Test at the start of each grid class: narrow (360px), sm (600px), md (768px) and lg (1024px), before calling a component done `[DS-RESPONSIVE-002]`. Container queries for component-level responsiveness, breakpoints for layout-level `[DS-RESPONSIVE-003]`. Touch targets, font sizes, contrast must meet minimums at every breakpoint `[DS-RESPONSIVE-004]`. Don't build desktop-first and assume mobile will work `[DS-RESPONSIVE-005]`.

**Judgment under constraint:** when content doesn't fit, the default move of shrinking everything proportionally is usually wrong. Preserve task hierarchy first, keep the primary content/task at a comfortable, legible size at every breakpoint, and let secondary/tertiary content (metadata, supporting stats, decorative elements) absorb the constraint `[DS-RESPONSIVE-006]`. When something doesn't fit, prefer reflow (grid to single column), then collapse (a filter bar into a "Filters" button + sheet), then hide (a column or hint that only matters at a glance on larger screens), shrinking text or spacing to cram the same layout into less room is the last resort, and never overrides the `[DS-RESPONSIVE-004]` minimums `[DS-RESPONSIVE-007]`.

**Component-level:** no `padding-bottom`/`margin-top` for sibling spacing, use `gap` on the parent `[DS-LAYOUT-COMP-001]`. No purposeless wrapper divs `[DS-LAYOUT-COMP-002]`. `min-width: 0` on flex children with text/overflow-prone content `[DS-LAYOUT-COMP-003]`. `object-fit` on images with set dimensions `[DS-LAYOUT-COMP-006]`. `aspect-ratio` instead of the padding-top percentage hack `[DS-LAYOUT-COMP-005]`.

**Responsive dialogs:** below `--breakpoint-md` (768) a dialog that holds a choice (confirm, select, stepper, slider) is a bottom sheet: at most 90dvh, a stacked footer with the primary button on top, a visible Close or Cancel `[DS-RESPONSIVE-008]`. A dialog that takes text is a full-screen form: a 56px header, with the footer at the bottom of the scroll area so the keyboard cannot cover it `[DS-RESPONSIVE-009]`. Both pad their edges with `env(safe-area-inset-*)` `[DS-RESPONSIVE-010]`.

**Widths:** form, field and dialog widths are tokens, never hardcoded. Forms use `max-width: var(--width-form-max)` `[DS-LAYOUT-WIDTH-001]`. Single-line fields use `--width-field-max`, short fixed-format values use `--width-field-narrow`, and only textareas reach `--width-form-max` `[DS-LAYOUT-WIDTH-002]`. Layouts hold at `--width-viewport-min` with no horizontal scroll `[DS-LAYOUT-WIDTH-003]`. Desktop dialogs use `--width-dialog-sm` or `--width-dialog-lg`, chosen in `vois-patterns` (`PATH-D-SIZE`), and never exceed the viewport minus 16px each side `[DS-LAYOUT-WIDTH-004]`.

| Token | Value | Use |
|---|---|---|
| `--width-form-max` | 48rem (768px) | Form container, and the ceiling for textareas |
| `--width-field-max` | 25rem (400px) | Default ceiling for a single-line field |
| `--width-field-narrow` | 15rem (240px) | Postal code, state code, expiry, security code |
| `--width-viewport-min` | 22.5rem (360px) | Narrowest supported viewport |
| `--width-dialog-sm` | 21.5rem (344px) | The standard Dialog: confirmations, AlertDialogs, single-column content |
| `--width-dialog-lg` | 35rem (560px) | A textarea or content that needs the width. Proposed value, confirm on real screens. Always one column |
| `--hit-area-min` | 2.75rem (44px) | Minimum click or tap area. Never sets visual size |

Widths are in `rem` so they follow the browser font size.


**Auto-growing textareas**, use `field-sizing: content` (Tailwind v4: `field-sizing-content`), never JavaScript autosizing (no `scrollHeight` measuring, `ResizeObserver`, or autosize libraries) `[DS-LAYOUT-FIELD-001]`. Always set an explicit `inline-size`, because content sizing also shrinks the width and an unset width collapses to a sliver `[DS-LAYOUT-FIELD-002]`. Set `min-block-size` and `max-block-size` from the line-count tokens using the `lh` unit plus the field's block padding; don't rely on `rows` for the minimum, because browsers ignore it under `field-sizing: content`; scroll inside with `overflow-y: auto` at the maximum `[DS-LAYOUT-FIELD-003]`. Wrap the styles in `@supports (field-sizing: content)` and keep `rows` and `resize: vertical` as the fallback `[DS-LAYOUT-FIELD-004]`. Line tokens (unitless, multiplied by `1lh`): `--textarea-min-lines` 3, `--textarea-max-lines` 12, `--chat-input-min-lines` 1, `--chat-input-max-lines` 8.

## Grid and Panels `[DS-GRID]` `[DS-PANEL]`

How a page splits into columns, how a card grid decides its count, and how side panels behave. It works on web, Flutter and native. Every size is a token name, never a raw value. Default values are below. If your token source differs, use yours.

**Two widths.** Window width picks the navigation and the most columns a collection may have. Region width (window minus side navigation) picks the grid class.

**Grid classes** `[DS-GRID-001]`, picked from region width: `narrow` from `--width-viewport-min` (360) with 4 columns, `sm` from `--breakpoint-sm` (600) with 8, `md` from `--breakpoint-md` (768) with 8, `lg` from `--breakpoint-lg` (1024) with 12. The names mean nothing on other platforms on purpose. `--breakpoint-expanded` (840) is the Android expanded window class, not a grid class.

- **Navigation shell** `[DS-GRID-002]`: window width picks it. Below `--breakpoint-md` a bottom bar. From `md` to below `lg` a rail (`--nav-rail`). From `lg` a sidebar (`--nav-sidebar`). The site shell has a top bar only.
- **Content max** `[DS-GRID-003]`: content stops at `--grid-content-max` and centers. A dense page opts out with `frame: fill`.
- **Margin and gutter** `[DS-GRID-004]`: `--grid-margin` and `--grid-gutter` are lines between two anchor points on region width, flat outside them, generated from four numbers each (`-min`, `-max`, `-min-at`, `-max-at`) as one `clamp()` on web. The end values sit on the spacing scale. The values between do not, so `DS-SPACING-001` does not apply.
- **Safe areas and direction** `[DS-GRID-005]`: the real margin is the larger of `--grid-margin` and the safe-area inset. Use start and end sides, never left and right.
- **Measure the parent** `[DS-GRID-006]`: a component measures the space it is given, with a container query, `LayoutBuilder`, `BoxWithConstraints` or `GeometryReader`. Never branch on device, model or orientation.
- **Collections** `[DS-GRID-007]`: `count = max(1, min(cap[windowClass], floor((inner + gutter) / (itemMin + gutter))))`. `cap` is from the page template, `inner` is region width minus both margins (held at content max), `gutter` is `--grid-gutter`, `itemMin` is `--item-min-icon-tile`, `-logo`, `-card`, `-plan` or `-story`. Never hard-code `grid-cols-3`.
- **Text size** `[DS-GRID-008]`: larger text raises `itemMin`, so the count drops. It never changes the grid, margins or gutters.
- **Regions** `[DS-GRID-009]`: a region is `fluid`, a fraction, `auto` or a token. Splits fit the class's columns: 8 columns split 4/4 or 5/3, never 6/6. A region that doesn't fit stacks or folds.
- **Units** `[DS-GRID-010]`: one token unit is one CSS pixel, dp or point.

**Panels** (a surface that opens at the side of a page)

- **Push or overlay** `[DS-PANEL-001]`: push moves the content over, for looking at page and panel together. Overlay floats, for a task that ends.
- Below `--breakpoint-md` every panel is full screen `[DS-PANEL-002]`. From `md`, a panel pushes only if window width minus `--nav-rail` minus panel width leaves `--main-min`. Otherwise it overlays `[DS-PANEL-003]`. The sidebar shows as the rail before a panel turns into an overlay `[DS-PANEL-004]`.
- Push width is `--panel-push-default`, resizable between `--panel-push-min` and `--panel-push-max` `[DS-PANEL-005]`. Overlay width is a tier (`--panel-overlay-sm|md|lg`): the smallest of the tier and half the window rounded down to a multiple of 4, never under `--panel-overlay-min` `[DS-PANEL-006]`.
- A list with a detail pane goes side by side only if each pane gets `--pane-min`. Otherwise the detail is its own screen with Back `[DS-PANEL-007]`. Panel and pane widths are token names, never raw numbers `[DS-PANEL-008]`.

Generate CSS, Dart, Swift and Kotlin constants from one token source. Never copy numbers by hand.

## Data Tables `[DS-TABLE]`

- **One scroll owner, chosen on purpose** `[DS-TABLE-001]`: a sticky header sticks to its nearest scroll container, and any `overflow` other than `visible` or `clip` makes one.
- **Complex table:** the wrapper owns both axes (`overflow: auto`, bounded height, sticky header inside, `scrollbar-gutter: stable`, `overscroll-behavior-x: contain`, `scroll-padding-block-start` equal to the header height) `[DS-TABLE-002]`. **Simple table:** no overflow on the wrapper, the header sticks to the page, no sideways scroll `[DS-TABLE-003]`.
- Don't use `overflow: auto clip` to keep a header sticky: `clip` computes to `hidden` beside `auto` `[DS-TABLE-004]`. Every flex or grid ancestor up to the app shell has `min-inline-size: 0` and `min-block-size: 0` `[DS-TABLE-005]`.
- **Pinned first column:** `position: sticky`, `inset-inline-start: 0`, opaque background, local z-index (column 1, header 2, corner 3) inside `isolation: isolate`, plus `scroll-padding-inline-start` `[DS-TABLE-006]`. Sticky cells need `border-collapse: separate` and `border-spacing: 0` `[DS-TABLE-007]`.
- Layout keys off the container: `container-type: inline-size` outside the wrapper, `@container (width < 37.5em)` for narrow `[DS-TABLE-008]`. Use `table-layout: fixed`, explicit widths, ellipsis, right-aligned `tabular-nums` numbers `[DS-TABLE-009]`.
- **Scrollbars:** `scrollbar-width: thin`, a neutral `scrollbar-color`, no `::-webkit-scrollbar`, never hidden on a table that scrolls sideways `[DS-TABLE-010]`; `scrollbar-gutter: stable` `[DS-TABLE-011]`; `overscroll-behavior-x: contain` only `[DS-TABLE-012]`; `scroll-padding-block-start` so focused rows aren't hidden `[DS-TABLE-013]`.
- **Wheel lock:** a complex table scrolls one axis per gesture (a non-passive wheel handler, `ctrlKey` passes through, one shared hook with an opt-out). Simple tables skip it. Leave touch alone `[DS-TABLE-014]`.
- **Accessibility:** the scroll owner has `tabindex="0"`, `role="region"` and an `aria-label`. Keep real table elements, a button in a sortable `th`, `aria-sort`. `role="grid"` only with arrow-key navigation `[DS-TABLE-015]`.
- Paginate by default. Virtualize only for thousands of rows `[DS-TABLE-016]`. Row highlights and scroll shadows respect reduced motion `[DS-TABLE-017]`. A sideways-scrolling table shows a cue `[DS-TABLE-018]`.
- **Sizes** `[DS-TABLE-019]`: `--table-header-h` 2.5rem (40), `--table-row-h-dense` 2rem (32, pointer devices only), `--table-row-h-regular` 2.75rem (44), `--table-row-h-comfortable` 3.5rem (56). If a size is missing, propose it.


## Marketing Type & Spacing `[DS-MKT]`

Marketing surfaces only (landing pages, product marketing, public site pages). Product UI keeps the Typography and Spacing rules as written `[DS-MKT-001]`.

- The display face (`--font-heading`) carries display and h2 only and is never used below 28px; the text face (`--font-body`) carries everything else. Both roles can be one family at different weights `[DS-MKT-002]`. One display headline per page and one h2 per section `[DS-MKT-003]`.
- **Scale (a starting point; values are estimates, keep the ratios):** display 40/44 mobile and 72/76 desktop; h2 28/34 and 44/50; h3 20/26 and 24/30; lead 18/26 and 20/30; body 16/24 and 17/26; small 14/20 and 15/22 `[DS-MKT-004]`.
- Cap marketing body text at `56ch`, replacing the 65ch cap on marketing surfaces. Headings may run narrower `[DS-MKT-005]`.
- The gap between sections is about 4x the gap between a section heading and its content, and 12 to 15x the gap between a heading and its body text. If the page feels cramped, widen the section gap first, then cut content; don't add dividers to compensate `[DS-MKT-006]`. Keep the gap inside a block smaller than the gap between blocks, or the page reads as one pile `[DS-MKT-007]`.
- Section-to-section gaps may exceed 128px, up to 240px, in steps of 8, using a spacing token. This is an exception to the allowed-values list; divisible by 4 or 8 still holds `[DS-MKT-008]`.

## Tailwind v4 `[DS-TAILWIND]`

Replace `@layer base` with `@theme` for the names Tailwind makes utilities from. The Vois tokens themselves live in `:root` and `.dark`, with `@theme inline` aliases `[DS-TAILWIND-001]`; use `@import "tailwindcss"` instead of the separate base/components/utilities imports `[DS-TAILWIND-002]`. Container queries are built in, use `@container` and `@min-`/`@max-` variants. `hover:` only applies on hover-capable devices in v4, but verify on touch anyway. Arbitrary values (`w-[237px]`) are a smell, round to the scale or flag a missing token `[DS-TAILWIND-003]`. No `!important` except explicitly-owned, documented overrides `[DS-TAILWIND-004]`. Never `transition: all`, list properties explicitly `[DS-TAILWIND-005]`.

## StyleX `[DS-STYLEX]`

Alternative to Tailwind: a compile-time CSS-in-JS system, styles authored as typed JS objects and compiled by a Babel/SWC/bundler plugin into static atomic CSS. A workspace uses one engine or the other, not both. Everything above except the Tailwind v4 section applies identically under StyleX.

Confirm the build plugin is wired in before writing any StyleX styles, they're inert without it `[DS-STYLEX-001]`. Define tokens with `stylex.defineVars()` and reference them from `stylex.create()`; never a literal value where a token exists `[DS-STYLEX-002]`. Use `stylex.createTheme()` to override a `defineVars()` group for theme variants (dark mode, brand variants) rather than a second token set `[DS-STYLEX-003]`. Compose variants from multiple `stylex.create()` keys merged in `stylex.props()`, most-specific override last, the StyleX equivalent of `cva` `[DS-STYLEX-004]`. Don't use an inline `style={{}}` prop where a `stylex.create()` key already covers the value, inline styles win the cascade over any StyleX class `[DS-STYLEX-005]`. Use `stylex.defineConsts()` for breakpoints and other compile-time constants, in `em` not `px` `[DS-STYLEX-006]`.

```ts
import * as stylex from "@stylexjs/stylex";
const colors = stylex.defineVars({ primary: "oklch(0.637 0.237 259.4)" });
const styles = stylex.create({ button: { backgroundColor: colors.primary, borderRadius: 6 } });
```

Full version and code examples: `references/stylex.md` in the main skill.

## Animation and Motion `[DS-ANIMATION]` `[DS-MOTION]`

UI animations stay under 300ms `[DS-ANIMATION-001]`. Large elements (drawers, bottom sheets, modals entering) may run up to 500ms `[DS-ANIMATION-002]`. Never animate keyboard-triggered interactions `[DS-ANIMATION-003]`. Always respect `prefers-reduced-motion`, with `useReducedMotion()` in Motion `[DS-ANIMATION-004]`. Never animate from `scale(0)`: start at 0.9 or higher. The one exception is an icon swap, which follows `DS-SURFACE-014` `[DS-ANIMATION-005]`. Set `transform-origin` to the trigger point, not center `[DS-ANIMATION-006]`. Guard hover with `@media (hover: hover) and (pointer: fine)` `[DS-ANIMATION-007]`. Button press is `scale(0.96)` on `:active`, never below 0.95, with a `static` prop to turn it off `[DS-ANIMATION-008]`. `will-change` helps only `transform`, `opacity`, `filter` and `clip-path`. Add it only after you see first-frame stutter `[DS-ANIMATION-009]`.

**Easing:** `ease-out` for taps and interactions, `ease-in-out` for on-screen state changes, `linear` only for constant loops, `ease` for subtle ambient motion.

**Tokens:** timing and easing come from motion tokens. Component code never holds a literal duration, `cubic-bezier(...)` or numeric easing array `[DS-MOTION-001]`. Names: `--motion-duration-instant` (100ms), `-fast` (150), `-base` (250), `-slow` (400, large elements only), `-spin` (loops), `--motion-ease-standard` (`cubic-bezier(.165,.84,.44,1)`), `--motion-ease-emphasized` (`cubic-bezier(.23,1,.32,1)`), `--motion-distance-short` (12px, how far a morph travels; use one value per project, 8 to 16px). Starting values to tune. They may be literal only in `motion-tokens.css`, `.scss`, `.ts` or `.js`. Use `transition-duration: var(--motion-duration-fast)` in CSS, `duration-[var(--motion-duration-fast)]` in Tailwind (there is no `duration-*` namespace, and `duration-fast` silently generates nothing), and `"var(--motion-duration-fast)"` in StyleX. In Motion JS, keep a `motion-tokens.ts` with the same values in seconds, and a spring `{ type: "spring", bounce: 0, duration: motionDuration.base }`.

- The slow token is for large elements only. Everything else stays under 300ms `[DS-MOTION-002]`.
- A morph runs inside one duration token. Old content leaves while new arrives, never out then in `[DS-MOTION-003]`.
- A tray (a persistent container showing one step at a time) is one element. Steps swap inside it and it never unmounts between steps `[DS-MOTION-004]`.
- When a shared element travels, the content it leaves may dim and blur, never more than the `DS-SURFACE-014` value, and the traveller is never blurred. Under reduced motion there is no blur or dim ramp `[DS-MOTION-005]`.
- Springs are allowed only at `bounce: 0` with a token duration, and no bounce, ever. A transition retargeted mid-flight continues from its current position and velocity `[DS-MOTION-006]`.
- Delight (easter eggs, particle bursts, looping shimmer) never gates the task or carries meaning alone. Loops pause under reduced motion and while the page is hidden. Nothing flashes more than three times a second. One-off effects play once and can be skipped. Humor never appears in an error `[DS-MOTION-007]`.

## Accessibility `[DS-A11Y]`

These are not optional.

- Every interactive element has a hit area of at least `var(--hit-area-min)` (44px) both ways. The token never sets visual size. If the visible element is smaller, extend the hit area with a centered pseudo-element `[DS-A11Y-001]`.
- **Focus:** `:focus-visible` for rings (keyboard and assistive tech, not mouse) `[DS-A11Y-002]`. Never remove `outline` without a `:focus-visible` replacement `[DS-A11Y-003]`.
- **Focus ring geometry** `[DS-A11Y-018]`: the ring is an external outline, `outline: var(--focus-ring-width) solid var(--border-state-focus)` with `outline-offset: var(--focus-ring-offset)` (2px and 2px). Keep the control's own 1px border and its size. Never swap the border for a thicker one, and never set `border-radius` on focus, because the browser draws the outline at the control's radius plus the offset. Where a ring would be clipped (an item in a scrolling or `overflow` container), draw it inside with a negative offset in the same color. Keep the ring when the field is in error. `--border-state-focus` is Blue-10 in light and Blue-8 in dark, and meets 3:1 on every surface in both themes.
- **Contrast:** normal text 4.5:1, large text (18px+ regular or 14px+ bold) 3:1, UI components and graphics 3:1 `[DS-A11Y-004]`.
- **Semantics:** `<button>` for actions, `<a>` for navigation `[DS-A11Y-005]`. Labeled inputs, not placeholder-only `[DS-A11Y-006]`. `aria-label` on icon-only buttons `[DS-A11Y-007]`. `aria-hidden` on decorative icons `[DS-A11Y-008]`. `aria-live="polite"` or `role="alert"` on errors `[DS-A11Y-009]`. `alt` on all images, `alt=""` if decorative `[DS-A11Y-010]`. `ul`/`ol` for lists `[DS-A11Y-011]`. `<br>` only for in-content breaks `[DS-A11Y-012]`. `loading="lazy"` below the fold only `[DS-A11Y-013]`. `<time datetime>` for dates `[DS-A11Y-014]`. Heading elements for structure, not size `[DS-A11Y-015]`. `fieldset`/`legend` for radio and checkbox groups `[DS-A11Y-016]`. Color is never the only state signal `[DS-A11Y-017]`.
- **Dialogs** follow `DS-A11Y-019` to `DS-A11Y-023` under Components.

**Questionnaires** (one-question-per-screen flows, polls, quizzes; the pattern is `PATH-H` in `vois-patterns`):

- Mark every question Required or Optional in words, not an asterisk alone. Set `aria-required`. After a failed check set `aria-invalid`, put a specific error under the question and move focus to the first error `[DS-A11Y-024]`. Moving between questions moves focus to the new title and announces it, for Next and for Back `[DS-A11Y-025]`.
- Honour `prefers-reduced-motion` and also offer a visible Reduce motion control. Between questions use no slide or scale. An instant swap or a fade of 150ms or less is fine `[DS-A11Y-026]`.
- Poll and quiz results never rely on color alone. The correct option has a check icon and the words "Correct answer". The respondent's pick has "Your answer". Each row reads as text (label, percent, count). Bars are `aria-hidden` and the fill has 3:1 against its track `[DS-A11Y-027]`. Announce one short summary in a polite live region and move focus to the results heading. Bars may animate up to 400ms, and not at all with reduced motion `[DS-A11Y-028]`.
- Primary action in a sticky bar inside the scrolling container, never `position: fixed`, because the keyboard covers it. Add `padding-bottom: calc(12px + env(safe-area-inset-bottom))`. Errors go above the input `[DS-RESPONSIVE-011]`. Below 360px a 5-point Likert goes vertical if a point is under 44px, rank keeps 44px drag handles and arrow buttons, text stays 16px, and nothing scrolls sideways at 320px `[DS-RESPONSIVE-012]`. Option rows (radio, checkbox, poll results) are 56px minimum at every width, an accepted exception to compact density that applies inside `PATH-H` only `[DS-RESPONSIVE-013]`.

## CSS Architecture `[DS-CSS]`

```css
@import "tailwindcss";
:root { /* Vois tokens live here, and in .dark (DS-TOKEN-003) */ }
@theme inline { --color-popover: var(--popover); /* aliases for names utilities need */ }
html { color-scheme: light dark; scrollbar-gutter: stable; }
@custom-variant dark (&:is(.dark *));
```

An alias is needed in `@theme inline` for a shadcn color class (such as `bg-popover`) to resolve to the token `[DS-TAILWIND-001]`. No inline styles where a token equivalent exists `[DS-CSS-001]`.

**Selectors:** never `#id` for styling `[DS-CSS-002]`. At most 2 levels of nesting `[DS-CSS-003]`. `:is()` groups without raising specificity `[DS-CSS-004]`. `:where()` for zero-specificity base styles `[DS-CSS-005]`. Keep layout properties apart from visual ones in hand-authored CSS `[DS-CSS-006]`.

**Media queries:** use `em`, not `px`, so they follow browser font size and zoom `[DS-CSS-007]` (Tailwind's built-in breakpoints use px internally and are unaffected): `sm` 37.5em (600), `md` 48em (768), `lg` 64em (1024), `expanded` 52.5em (840), `xl` 80em (1280). `sm`, `md` and `lg` are the grid window classes. `sm` is also the container width for narrow tables and forms. `expanded` and `xl` are not grid classes.


## Anti-Slop `[DS-SLOP]`

The rest of this skill checks whether UI is *correct*. This section checks whether it's *generic* . the layout and styling defaults that make AI-generated work instantly recognizable even when every token rule passes. A centered hero over a purple-to-blue gradient with three identical feature cards violates no spacing or color token. It violates taste.

Several rules are dial-gated . read VARIANCE before flagging; a deliberately symmetric low-variance product UI isn't slop, a marketing page that *defaults* to centered-everything is. Most of these are judgment calls, not mechanically detectable.

- **`[DS-SLOP-001]` Centered-everything as a default** . above VARIANCE 4, a centered hero (centered headline + subtext + single CTA) is the most common AI layout default. Reach for split-screen, asymmetric, or offset structures instead; centered should be a deliberate choice, not the thing you land on by default.
- **`[DS-SLOP-002]` The AI gradient** . purple/violet/indigo → blue/cyan gradients (backgrounds, gradient text, `linear-gradient()`) are template-output's visual signature. Use the workspace's own accent tokens instead.
- **`[DS-SLOP-003]` Three equal feature cards** . the identical `grid-cols-3` card row is a tell. Vary sizes, promote the primary one, or use an asymmetric/bento grid. On marketing pages a row or stack has at most three blocks: three is the ceiling, not the target, and the blocks should still differ in size, emphasis, or content.
- **`[DS-SLOP-004]` Eyebrow overuse** . the uppercase label above a heading is fine once; cap it at roughly 1 per 3 sections.
- **`[DS-SLOP-005]` Emoji as UI iconography** . use the real icon set for interface chrome; emoji in user-authored content is fine.
- **`[DS-SLOP-006]` Zigzag repetition** . alternating image-left/image-right sections are fine up to 2 in a row; a third must break the pattern.
- **`[DS-SLOP-007]` Spec-sheet tables for marketing** . a label/value table for features or plans on a marketing surface is boilerplate; use grouped cards or clustered stats instead (genuine product data tables are unaffected).
- **`[DS-SLOP-008]` Symmetry as the only rhythm** . even at low VARIANCE, a page needs some change in pace, not identical width/padding/alignment top to bottom.
- **`[DS-SLOP-009]` No em dashes in copy** . a well-known AI writing tell that reads as a hedge in short copy. Don't use them in UI copy, marketing copy, or any text the product or page ships; use a period, comma, or colon, and rewrite a sentence that needs a dash to hold together. Judgment-only (the detector doesn't check it); route copy through Righter (`no-em-dashes`).
- **`[DS-SLOP-010]` Card-ifying everything** . wrapping every static section in a bordered/shadowed card is unearned structure. Reserve drop shadows for things a user picks up, hovers, or acts on.
- **`[DS-SLOP-011]` Over-styled active states** . a colored left border plus corner radius (worse with a shadow on top) on active nav/sidebar items gets uglier as it compounds. A subtle background or text-color shift usually reads clearly enough on its own.
## Quick Reference

| Situation | What to do |
|-----------|------------|
| Nesting rounded elements | `outerRadius = innerRadius + padding` |
| Icon or button looks off-center | Align optically, not geometrically |
| Card needs depth | A tier token (`--shadow-base` to `--shadow-xlarge`), not a border or a raw shadow |
| Dark mode depth | Lighter fill step plus `--elevation-hairline`, not shadow alone |
| Panel docked to an edge | `--shadow-large-right|left|bottom|top` |
| Radius you want to hand-write | Pick a shape role, or name the missing one |
| Image needs a subtle edge | 1px outline, pure black or white at 0.1 opacity |
| Icon swapping state | scale 0.25 to 1 + opacity + blur |
| Full-screen height | `svh`, not `vh` |
| Two colors switching with theme | `light-dark()` |
| Focus ring | 2px outline, 2px offset, `--border-state-focus`, no `border-radius` change |
| Status color | `info`, `positive`, `negative` or `notice` tokens |
| Building a modal | `inert` + `overscroll-behavior` + `scrollbar-gutter`, one level only |
| Popup opened from a dialog | Its own layer and fill (`--elevation-surface-popup`), above the modal |
| Value not in tokens | Flag it, don't invent it |
| Hover on touch | `@media (hover: hover) and (pointer: fine)` |
| Space between siblings | `gap` on the parent |
| Flex text not truncating | `min-width: 0` on the flex child |
| Group of radio or checkbox inputs | `<fieldset>` with `<legend>` |
| Textarea that grows | `field-sizing: content`, explicit width, `lh` min and max |
| Control smaller than its click area | Extend the hit area to `var(--hit-area-min)` |
| Form, field or dialog width | Width tokens |
| Sticky table header doesn't stick | One scroll owner. Bound the wrapper height or remove its overflow |
| Table scrolls diagonally | Wheel lock on complex tables |
| Layout keeps landing on a centered hero | Above VARIANCE 4, go split, asymmetric or offset |
| Purple to blue gradient | Use accent tokens instead |

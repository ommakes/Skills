---
name: vois-tokens
description: Rules and patterns for building UI with shadcn/ui, Tailwind v4 or StyleX, and Motion against a Vois design token set. Use when building components, pages, or any UI that should conform to the workspace design system. Covers spacing, typography, color tokens, component architecture, animation, accessibility, and modern CSS/StyleX patterns.
version: 1.28.2
---

# Vois Tokens Skill (Rules & Values Edition)

> Full version & updates: https://github.com/ommakes/Skills/blob/main/vois-tokens/SKILL.md — the full version adds a live per-edit checker hook (`scripts/`) for Claude Code, Cursor, and Codex, and a "Reviewing Existing UI" workflow for auditing code diffs. Both are code-editing features with no Figma equivalent, so this edition presents the design rules and token values as an adoptable reference implementation instead. Vois's Figma plugin syncs these tokens into your file as real variables if you want to adopt the system rather than just read about it.

You are building UI for a design system that uses **shadcn/ui**, **Tailwind v4 or StyleX**, and **Motion**. This skill defines the rules, constraints, and patterns to follow. Deviation produces inconsistent, unmaintainable UI. Determine which styling engine the project uses (check `package.json` for `tailwindcss` vs `@stylexjs/stylex`, or ask) before applying the Tailwind- or StyleX-specific sections below — everything else applies either way.

## Taste dials

If your workspace defines **VARIANCE** (layout asymmetry), **MOTION** (animation richness), and **DENSITY** (information per screen) as 1–10 dials, use them to tune choices you'd otherwise make by default: DENSITY biases spacing toward the tighter or looser end of the scale below; MOTION biases how much animation to add (low = essential feedback only, high = richer entrance/transition choreography); VARIANCE biases layout symmetry (low = symmetric grids, high = asymmetry welcome — also gates the centered-hero anti-slop rule below).

**Dials never override hard rules.** Animations stay under the 300/500ms caps and honor `prefers-reduced-motion` even at MOTION 10; contrast, touch targets, and the 4/8 spacing scale hold even at DENSITY 10. Dials choose *within* the allowed range, never widen it. If no dials are defined, assume mid defaults (5/4/5).

## Before You Write Anything

1. Check the component manifest. If a component exists for what you need, use it — don't build a new one.
2. Check the token tables in the relevant section below (spacing, type scale, color, elevation, icon size, breakpoints). If a token exists, use it — don't hardcode.
3. If neither exists, flag it — don't invent values or components.

## Topic Index

Each section below is headed by its rule prefix, from `[DS-SPACING]` to `[DS-SLOP]`. Find a rule by that prefix. Modal rules `[DS-MODAL]` sit under Components. Width rules `[DS-LAYOUT-WIDTH]` and textarea rules `[DS-LAYOUT-FIELD]` sit under Layout & Responsive.

## Pre-Submit Checklist

Run this before calling anything done.

**Spacing**
- [ ] All spacing values divisible by 4 or 8 `[DS-SPACING-001]`
- [ ] No arbitrary spacing values `[DS-SPACING-003]`
- [ ] Consistent at all tested breakpoints `[DS-SPACING-004]`

**Typography**
- [ ] No more than 3 text styles in any component `[DS-TYPOGRAPHY-001]`
- [ ] Heading levels sequential, none skipped `[DS-TYPOGRAPHY-002]`
- [ ] Numeric data uses monospace with `tabular-nums` `[DS-TYPOGRAPHY-003]`
- [ ] Headings have `text-wrap: balance` `[DS-TYPOGRAPHY-006]`
- [ ] Body copy has `text-wrap: pretty` `[DS-TYPOGRAPHY-007]`
- [ ] Text containers have `max-width: 65ch` `[DS-TYPOGRAPHY-008]`
- [ ] Ellipsis is `…` not `...` `[DS-TYPOGRAPHY-009]`
- [ ] Quotes are curly, not straight `[DS-TYPOGRAPHY-010]`

**Color**
- [ ] No hardcoded hex values `[DS-COLOR-001]`
- [ ] No raw Tailwind palette classes where tokens exist `[DS-COLOR-002]`
- [ ] Status uses the `info`/`positive`/`negative`/`warning` role tokens, never a palette class or stock variant `[DS-COLOR-008]`
- [ ] Both light and dark mode verified manually `[DS-COLOR-007]`
- [ ] Color is not the only signal for error/success/warning `[DS-COLOR-003]`
- [ ] Decorative icons have `aria-hidden="true"` `[DS-COLOR-005]`

**Components**
- [ ] Checked component manifest before building anything new `[DS-COMPONENT-001]`
- [ ] Variants used semantically, not just defaulted `[DS-COMPONENT-006]`
- [ ] cva used for variant logic `[DS-COMPONENT-002]`
- [ ] Modals use `inert` on background content `[DS-MODAL-001]`
- [ ] Modals have `overscroll-behavior: contain` `[DS-MODAL-002]`
- [ ] `scrollbar-gutter: stable` on `html` `[DS-MODAL-003]`

**Surfaces**
- [ ] Nested rounded elements use concentric radius (`outer = inner + padding`) `[DS-SURFACE-001]`
- [ ] Icons/buttons optically aligned, not just geometrically centered `[DS-SURFACE-003]`
- [ ] Shadows used instead of borders for depth (not for dividers) `[DS-SURFACE-007]`
- [ ] Image outlines are pure black/white at 0.1 opacity, never tinted `[DS-SURFACE-010]`
- [ ] Enter animations split into chunks and staggered, not one big container `[DS-SURFACE-011]`
- [ ] Exit animations are subtler/shorter than enters `[DS-SURFACE-013]`
- [ ] Icon state transitions use scale 0.25→1, opacity, blur — not visibility toggling `[DS-SURFACE-014]`

**Animation**
- [ ] UI animations under 300ms (large elements under 500ms) `[DS-ANIMATION-001]` `[DS-ANIMATION-002]`
- [ ] No keyboard-triggered animations `[DS-ANIMATION-003]`
- [ ] `transform-origin` set to trigger point, not center `[DS-ANIMATION-006]`
- [ ] Timing and easing from motion tokens, no literal durations or curves `[DS-MOTION-001]`
- [ ] A morph runs inside one duration token: old out and new in overlap, never in sequence `[DS-MOTION-003]`
- [ ] A multi-step tray is one container that stays mounted between steps `[DS-MOTION-004]`
- [ ] Content left behind by a travelling element blurs at most the `[DS-SURFACE-014]` value, and the traveller is never blurred `[DS-MOTION-005]`
- [ ] Springs use `motionSpring` with `bounce: 0`, and a retargeted transition continues from its current velocity `[DS-MOTION-006]`
- [ ] Delight never gates the task, loops pause under reduced motion, one-off effects play once `[DS-MOTION-007]`
- [ ] No animations from `scale(0)`, and enter animations start at 0.9 or higher (icon swaps follow `[DS-SURFACE-014]`) `[DS-ANIMATION-005]`
- [ ] `prefers-reduced-motion` handled `[DS-ANIMATION-004]`
- [ ] No `transition: all` `[DS-TAILWIND-005]`
- [ ] Hover effects guarded on touch devices `[DS-ANIMATION-007]`
- [ ] `will-change` only when stutter is actually observed, only on transform/opacity/filter `[DS-ANIMATION-009]`

**Accessibility**
- [ ] All interactive elements have `:focus-visible` styles `[DS-A11Y-002]`
- [ ] No `outline: none` without a replacement `[DS-A11Y-003]`
- [ ] Interactive elements have a hit area of at least `var(--hit-area-min)`. The token never sets the visible size `[DS-A11Y-001]`
- [ ] Contrast passes WCAG AA `[DS-A11Y-004]`
- [ ] No `div`/`span` as interactive elements without ARIA `[DS-A11Y-005]`
- [ ] All images have `alt` `[DS-A11Y-010]`
- [ ] `<fieldset>`/`<legend>` used for radio/checkbox groups `[DS-A11Y-016]`
- [ ] `<ul>`/`<ol>` used for lists, not stacked divs `[DS-A11Y-011]`

**Layout**
- [ ] Using `svh`/`lvh`/`dvh` not `vh` for viewport-height layouts `[DS-LAYOUT-001]`
- [ ] Tested at 360, 600, 768 and 1024px (narrow, sm, md, lg) `[DS-RESPONSIVE-002]`
- [ ] At the tightest breakpoint, primary content stayed full-size and secondary content reflowed/collapsed/hid first — not shrunk to fit `[DS-RESPONSIVE-006]` `[DS-RESPONSIVE-007]`
- [ ] Grid class comes from the region width. Margins and gutters are `--grid-*` tokens. Card grids use the column formula, not fixed counts `[DS-GRID-001]` `[DS-GRID-004]` `[DS-GRID-007]`
- [ ] Side panels push or overlay by the width rules, and are full screen below `--breakpoint-md`. Panel widths are tokens `[DS-PANEL-002]` `[DS-PANEL-003]` `[DS-PANEL-006]` `[DS-PANEL-008]`
- [ ] No `padding-bottom`/`margin-top` used to space siblings — use `gap` on parent `[DS-LAYOUT-COMP-001]`
- [ ] `min-width: 0` on flex children containing text or overflow-prone content `[DS-LAYOUT-COMP-003]`
- [ ] `aspect-ratio` used instead of padding-top percentage hack `[DS-LAYOUT-COMP-005]`
- [ ] Form, field, and dialog widths use width tokens `[DS-LAYOUT-WIDTH-001]` `[DS-LAYOUT-WIDTH-002]` `[DS-LAYOUT-WIDTH-003]` `[DS-LAYOUT-WIDTH-004]`
- [ ] Auto-growing textareas use `field-sizing: content` with an explicit `inline-size`, `lh` min and max, and an `@supports` fallback `[DS-LAYOUT-FIELD-001]` `[DS-LAYOUT-FIELD-002]` `[DS-LAYOUT-FIELD-003]` `[DS-LAYOUT-FIELD-004]`

**Data tables and marketing surfaces:** every rule in the Data Tables and Marketing Type & Spacing sections is part of this checklist. Run them when the work touches a table or a marketing page.

**CSS**
- [ ] No `#id` selectors used for styling `[DS-CSS-002]`
- [ ] Selectors no deeper than 2 levels without a class `[DS-CSS-003]`
- [ ] Hand-authored `@media` queries use `em` not `px` `[DS-CSS-007]`
- [ ] StyleX projects only: build plugin wired up `[DS-STYLEX-001]`, tokens from `defineVars()` not literals `[DS-STYLEX-002]`

**Anti-slop:** every `[DS-SLOP-001]` to `[DS-SLOP-011]` rule in the Anti-Slop section is part of this checklist. Several are dial-gated.

## Spacing `[DS-SPACING]`

All spacing must be divisible by **4 or 8**. The only exception is `--grid-margin` and `--grid-gutter` between their end values (see Grid and Panels). The end values stay on the scale. `[DS-SPACING-001]`

**Allowed values:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px. Use `gap` for layout spacing between elements; padding for internal component spacing; avoid margin for layout. `[DS-SPACING-002]` Tailwind v4's dynamic spacing utilities accept any value without arbitrary syntax — stay on the scale anyway. `[DS-SPACING-003]` Verify spacing holds at every responsive breakpoint. `[DS-SPACING-004]`

## Typography `[DS-TYPOGRAPHY]`

- No more than 3 text styles per component/section `[DS-TYPOGRAPHY-001]`. Never skip heading levels (h1→h2→h3, never h1→h3) `[DS-TYPOGRAPHY-002]`.
- Monospace + `tabular-nums` for all numeric data (prices, counts, timestamps) `[DS-TYPOGRAPHY-003]`.
- Font size communicates hierarchy — if two things feel equally important, deprioritize one `[DS-TYPOGRAPHY-004]`.

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

Fonts are workspace-specific via `--font-heading`, `--font-body`, `--font-mono` — reference the token, never a font name directly `[DS-TYPOGRAPHY-005]`. For headings that scale across viewports (hero/marketing), use `clamp(1rem, 2vw + 0.5rem, 2rem)` instead of fixed sizes; don't use it for application body text.

**Text wrapping:** `text-wrap: balance` on all headings H0–H3 `[DS-TYPOGRAPHY-006]`; `text-wrap: pretty` on body copy `[DS-TYPOGRAPHY-007]`; cap text containers at `max-width: 65ch` (not a fixed px width) `[DS-TYPOGRAPHY-008]`.

**Copy details:** ellipsis is `…` not `...` `[DS-TYPOGRAPHY-009]`; curly quotes not straight `[DS-TYPOGRAPHY-010]`; non-breaking spaces for units/brand names (`10&nbsp;MB`); "Loading…" not "Loading..." `[DS-TYPOGRAPHY-011]`; active voice, "Save changes" not "Changes will be saved" `[DS-TYPOGRAPHY-012]`; specific button labels, "Delete project" not "Confirm"/"OK" `[DS-TYPOGRAPHY-013]`; errors tell the user what to do next `[DS-TYPOGRAPHY-014]`.

## Color `[DS-COLOR]`

- Never hardcode hex values — use CSS tokens `[DS-COLOR-001]`. Never use Tailwind's built-in palette (`blue-500`, etc.) where a token exists `[DS-COLOR-002]`.
- Color is never the only signal — pair error/success/warning states with an icon or label `[DS-COLOR-003]`.
- **60/30/10 distribution:** ~60% neutral, 30% complementary/secondary, 10% accent/brand `[DS-COLOR-004]`.
- Decorative icons get `aria-hidden="true"` `[DS-COLOR-005]`.

**Status colors** — four semantic roles, `info`, `positive`, `negative`, and `warning`, each with four tokens: `--color-{role}`, `--color-{role}-foreground`, `--color-{role}-surface`, `--color-{role}-border` `[DS-COLOR-008]`. Alert, Badge, Toast, inline validation, and banners read these tokens; never a palette class, a literal color, or a one-off token for status. Pick the role by meaning, not hue: `info` is neutral context, `positive` is success or completion, `negative` is an error, a failure, or a destructive action, `warning` is caution or something that needs attention before it becomes an error `[DS-COLOR-009]`. There is no separate `destructive` token: a destructive Button reads `--color-negative`, and `destructive` is only the shadcn variant name. Older kits used `--color-destructive` and `--color-success`; those become `negative` and `positive`. The names are fixed and the values are defined per workspace, each with a light and a dark value. `-foreground` on `-surface` is normal text (4.5:1); the base color and `-border` against the page are UI components (3:1). If a role is missing, propose the four tokens; don't borrow a palette color.

Tailwind v4 uses **OKLCH** for color definitions — perceptually uniform, so lighter values are actually lighter. Example: `--color-primary: oklch(0.637 0.237 259.4)`. The full workspace palette is defined per-project via `@theme`; these are illustrative examples, not the complete set.

**Dark mode** — every color token must have a dark value `[DS-COLOR-006]`, implemented via `@custom-variant dark (&:is(.dark *))`. Use `light-dark()` for simple two-value swaps (`color: light-dark(oklch(0.145 0 0), oklch(0.985 0 0))`, with `color-scheme: light dark` set on `html`); stick with the `dark:` modifier for complex variants. Verify both modes manually before shipping `[DS-COLOR-007]`.

## Components `[DS-COMPONENT]`

- Check the manifest first — if `<Button>`, `<AlertBanner>`, `<DataTable>` exists, use it `[DS-COMPONENT-001]`.
- Use **cva** (Class Variance Authority) for all variant styling — no ad-hoc className ternaries `[DS-COMPONENT-002]`. Use `data-slot` attributes to style internals, not arbitrary child selectors `[DS-COMPONENT-003]`.
- **New-York style** is the shadcn default; "default" style is deprecated `[DS-COMPONENT-004]`. 2-layer architecture: Radix UI for structure/behavior, Tailwind for style — don't collapse them `[DS-COMPONENT-005]`.
- Use the most semantically correct variant — don't default to `default` when `destructive`/`ghost`/`outline` fits better `[DS-COMPONENT-006]`.

```tsx
const buttonVariants = cva("inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors", {
  variants: {
    variant: { default: "bg-primary text-primary-foreground hover:bg-primary/90", destructive: "bg-negative text-negative-foreground hover:bg-negative/90", outline: "border border-input bg-background hover:bg-accent", ghost: "hover:bg-accent hover:text-accent-foreground" },
    size: { default: "h-9 px-4 py-2", sm: "h-8 px-3 text-xs", lg: "h-10 px-8" },
  },
  defaultVariants: { variant: "default", size: "default" },
})
```

**Modals:** trap focus with `inert` on background content when the modal opens — Radix Dialog does this automatically `[DS-MODAL-001]`. Add `overscroll-behavior: contain` on the scrollable modal container to stop scroll bleed `[DS-MODAL-002]`. Add `scrollbar-gutter: stable` on `html` to prevent layout shift when the page scrollbar disappears `[DS-MODAL-003]`.

**Accordions:** use `interpolate-size: allow-keywords` to animate height `0`→`auto` without JS measurement, instead of measuring `scrollHeight` and animating to a pixel value.

## Surfaces `[DS-SURFACE]`

Detail-level rules for nested surfaces, optical alignment, image treatment, and animation choreography — the things that separate "functional" from "feels considered."

**Concentric border radius:** when nesting rounded elements, `outerRadius = innerRadius + padding` `[DS-SURFACE-001]`. Mismatched radii on nested elements is one of the most common things that makes UI feel off. If the padding between two surfaces exceeds 24px, treat them as independent and pick each radius on its own `[DS-SURFACE-002]`. Example: `rounded-2xl p-2` (16px radius, 8px padding) outer → `rounded-lg` (8px = 16-8 ✓) inner.

**Optical over geometric alignment** — when geometric centering looks wrong, align optically `[DS-SURFACE-003]`. Buttons with text + icon: icon-side padding = text-side padding − 2px `[DS-SURFACE-004]`. Play-button triangles: shift right ~2px, their geometric center isn't their visual center `[DS-SURFACE-005]`. Asymmetric icons (stars, arrows): fix the SVG viewBox/path directly if possible `[DS-SURFACE-006]`.

**Shadows over borders for depth:** cards/containers/bordered buttons that need depth should use a layered `box-shadow`, not a solid `border` — shadows adapt to any background, border colors don't `[DS-SURFACE-007]`. Don't apply this to dividers or layout-separation borders — those stay borders `[DS-SURFACE-008]`. Use shadows for: cards with depth, bordered buttons, elevated elements (dropdowns/modals), elements on varied/image backgrounds. Use borders for: list dividers, table cell boundaries, form input outlines, hairline separators.

**Image outlines:** subtle 1px outline for consistent depth `[DS-SURFACE-009]`. Color is non-negotiable — light mode `rgba(0,0,0,0.1)`, dark mode `rgba(255,255,255,0.1)`; never a tinted near-black/near-white from the palette, it reads as dirt on the image edge `[DS-SURFACE-010]`. Use `outline` not `border` (doesn't affect layout) with `-outline-offset-1`.

**Enter animations:** split into semantic chunks (title, description, actions) and stagger ~100ms between groups, rather than animating one large container `[DS-SURFACE-011]`. Combine `opacity` + `blur` + `translateY`, not opacity alone. Use `initial={false}` on `AnimatePresence` to skip enter animations on first load for elements already in their default state — but not on staged hero entrances that depend on `initial` firing `[DS-SURFACE-012]`.

**Exit animations** should be softer/shorter than enters `[DS-SURFACE-013]`: small fixed `translateY` (e.g. -12px) not full container height; ~150ms vs ~300ms enter; keep a little directional movement so it doesn't just vanish; full slide-out only when spatial context matters (a card returning to a list).

**Icon state transitions** (play→pause, like→liked): animate `opacity` + `scale` + `blur`, not visibility toggling `[DS-SURFACE-014]`. Exact values: scale `0.25`→`1` (never 0.5/0.6), opacity `0`→`1`, blur `4px`→`0px`, transition `motionSpring.standard` (`bounce` is always 0 and the duration is the base motion token, `[DS-MOTION-006]`). Without a Motion dependency, keep both icons in the DOM (one absolutely positioned) and cross-fade with CSS over `var(--motion-duration-base)` using `var(--motion-ease-standard)`. Animate icons appearing on hover, state-change icons, and contextual toolbar icons — not static navigation or decorative icons.

## Elevation `[DS-ELEVATION]`

Four tiers — don't invent a fifth.

| Tier | Token | Shadow | Layer |
|---|---|---|---|
| Flat | `--shadow-flat` | none | Inline content, cards at rest, table rows |
| Raised | `--shadow-raised` | `0 1px 2px oklch(0 0 0 / 0.08)` | Hovered cards, buttons, dropdown triggers |
| Overlay | `--shadow-overlay` | `0 4px 12px oklch(0 0 0 / 0.12)` | Popovers, tooltips, dropdown menus |
| Modal | `--shadow-modal` | `0 16px 48px oklch(0 0 0 / 0.20)` | Dialogs, drawers, sheets |

Modal scrim is a separate concern from the modal's own shadow — use a backdrop color, `oklch(0 0 0 / 0.4)`, not a darker shadow `[DS-ELEVATION-001]`. Match the elevation tier to its z-index layer — overlay elevation with the dropdown/overlay z-index, modal elevation with the modal z-index; don't put a heavier shadow on a lower-stacked element than a lighter one above it `[DS-ELEVATION-002]`.

## Iconography `[DS-ICON]`

| Size | Class | Use |
|---|---|---|
| 16px | `size-4` | Inline with body/label text, inside inputs |
| 20px | `size-5` | Inline with H4/H5 text, default button icon |
| 24px | `size-6` | Standalone icon buttons, nav items |
| 32px | `size-8` | Empty states, feature callouts, large standalone icons |

Tie icon size to the adjacent text size — never eyeball it. Single stroke width across the icon set, `1.5px` default (lucide-react/Radix Icons) — don't mix weights on the same screen `[DS-ICON-001]`. If the surrounding text size doesn't map cleanly to a size above, round to the nearest one `[DS-ICON-002]`.

## Layout & Responsive `[DS-LAYOUT]` `[DS-RESPONSIVE]`

Stop using `vh` — mobile browser chrome changes available height as you scroll `[DS-LAYOUT-001]`. Use `svh` (small viewport, max chrome assumed — hero sections, modals, first-load fit), `lvh` (large viewport, min chrome — full-screen backgrounds), or `dvh` (dynamic, updates live — interfaces resizing with the mobile keyboard). Default to `svh`; reach for `dvh` only when layout must respond to chrome changes live.

For long pages, use `content-visibility: auto` with `contain-intrinsic-size` on sections far below the fold to skip rendering until they approach the viewport `[DS-LAYOUT-002]` — not on anything visible on initial load.

**Responsive:** mobile-first, no prefix = baseline, `md:`/`lg:` are enhancements `[DS-RESPONSIVE-001]`. Test at the start of each grid class: narrow (360px), sm (600px), md (768px) and lg (1024px), before calling a component done `[DS-RESPONSIVE-002]`. Container queries for component-level responsiveness, breakpoints for layout-level `[DS-RESPONSIVE-003]`. Touch targets, font sizes, contrast must meet minimums at every breakpoint `[DS-RESPONSIVE-004]`. Don't build desktop-first and assume mobile will work `[DS-RESPONSIVE-005]`.

**Judgment under constraint:** when content doesn't fit, the default move of shrinking everything proportionally is usually wrong. Preserve task hierarchy first — keep the primary content/task at a comfortable, legible size at every breakpoint, and let secondary/tertiary content (metadata, supporting stats, decorative elements) absorb the constraint `[DS-RESPONSIVE-006]`. When something doesn't fit, prefer reflow (grid to single column), then collapse (a filter bar into a "Filters" button + sheet), then hide (a column or hint that only matters at a glance on larger screens) — shrinking text or spacing to cram the same layout into less room is the last resort, and never overrides the `[DS-RESPONSIVE-004]` minimums `[DS-RESPONSIVE-007]`.

**Component-level:** no `padding-bottom`/`margin-top` for sibling spacing — use `gap` on the parent `[DS-LAYOUT-COMP-001]`. No purposeless wrapper divs `[DS-LAYOUT-COMP-002]`. `min-width: 0` on flex children with text/overflow-prone content `[DS-LAYOUT-COMP-003]`. `object-fit` on images with set dimensions `[DS-LAYOUT-COMP-006]`. `aspect-ratio` instead of the padding-top percentage hack `[DS-LAYOUT-COMP-005]`.

**Widths** — form, field, and dialog widths come from tokens, never hardcoded. Form containers use `max-width: var(--width-form-max)` `[DS-LAYOUT-WIDTH-001]`. Single-line fields use `var(--width-field-max)` by default and short fixed-format values use `var(--width-field-narrow)`; only textareas may extend to `--width-form-max` `[DS-LAYOUT-WIDTH-002]`. Layouts hold at `var(--width-viewport-min)` with no horizontal scroll `[DS-LAYOUT-WIDTH-003]`. Desktop dialogs use `--width-dialog-sm` or `--width-dialog-lg`; which tier applies is decided in `vois-patterns` (`PATH-D-SIZE`) `[DS-LAYOUT-WIDTH-004]`.

| Token | Value | Use |
|---|---|---|
| `--width-form-max` | 48rem (768px) | Form container ceiling, and the ceiling for textareas |
| `--width-field-max` | 25rem (400px) | Default ceiling for a single-line field |
| `--width-field-narrow` | 15rem (240px) | Postal code, state code, expiry, security code |
| `--width-viewport-min` | 22.5rem (360px) | Narrowest viewport a layout must support without horizontal scroll |
| `--width-dialog-sm` | 32.5rem (520px) | Confirmations, AlertDialogs, typed confirmation, single-column content |
| `--width-dialog-lg` | 45rem (720px) | A textarea or content that needs the extra width. Dialogs are always one column |
| `--hit-area-min` | 2.75rem (44px) | Minimum click or tap area. Never sets visual size |

Widths are in `rem` so they respect the user's browser font size.

**Auto-growing textareas** — use `field-sizing: content` (Tailwind v4: `field-sizing-content`), never JavaScript autosizing (no `scrollHeight` measuring, `ResizeObserver`, or autosize libraries) `[DS-LAYOUT-FIELD-001]`. Always set an explicit `inline-size`, because content sizing also shrinks the width and an unset width collapses to a sliver `[DS-LAYOUT-FIELD-002]`. Set `min-block-size` and `max-block-size` from the line-count tokens using the `lh` unit plus the field's block padding; don't rely on `rows` for the minimum, because browsers ignore it under `field-sizing: content`; scroll inside with `overflow-y: auto` at the maximum `[DS-LAYOUT-FIELD-003]`. Wrap the styles in `@supports (field-sizing: content)` and keep `rows` and `resize: vertical` as the fallback `[DS-LAYOUT-FIELD-004]`. Line tokens (unitless, multiplied by `1lh`): `--textarea-min-lines` 3, `--textarea-max-lines` 12, `--chat-input-min-lines` 1, `--chat-input-max-lines` 8.

## Grid and Panels `[DS-GRID]` `[DS-PANEL]`

How a page is split into columns, how a grid of cards decides how many it holds, and how side panels behave. It works the same on web (React), Flutter and native iOS and Android. Every size is a token name. Never write a raw value. Token values live in your token source. The default Vois values are in `data/tokens.json` under `grid_and_panels` in the full version. If your token source defines different values, use those.

**Two widths.** Window width is the width of the screen or app window. It picks the navigation and the most columns a collection may have. Region width is the width left for the page after the side navigation. It picks the grid class. On the site shell there is no side navigation, so the two are the same.

**Grid classes** `[DS-GRID-001]`: pick the class from the region width. The names mean nothing on other platforms on purpose, so they never get mixed up with Tailwind's `sm` or Android's `medium`.

| Class | Starts at | Columns |
|---|---|---|
| `narrow` | `--width-viewport-min` (360) | 4 |
| `sm` | `--breakpoint-sm` (600) | 8 |
| `md` | `--breakpoint-md` (768) | 8 |
| `lg` | `--breakpoint-lg` (1024) | 12 |

`md` and `lg` start where the tablet and desktop tiers start. `sm` splits the phone tier in two. Columns flex. Margins and gutters do not come from the class.

- **Navigation shell** `[DS-GRID-002]`: for the app shell, window width picks it. Below `--breakpoint-md` a bottom bar. From `--breakpoint-md` to below `--breakpoint-lg` a rail, `--nav-rail` wide. From `--breakpoint-lg` a sidebar, `--nav-sidebar` wide. The site shell has a top bar and no side navigation. Region width is the window width minus the navigation width.
- **Content max** `[DS-GRID-003]`: content stops growing at `--grid-content-max` and centers. A dense page (dashboard, data grid, report, split view) opts out with `frame: fill` and fills the region.
- **Margin and gutter** `[DS-GRID-004]`: they come from `--grid-margin` and `--grid-gutter`, never a raw value. Each is a line between two anchor points on region width, held flat outside them. The token source stores four plain numbers for each (`-min`, `-max`, `-min-at`, `-max-at`), and `--grid-margin` and `--grid-gutter` are generated from them. On the web the output is one `clamp()`. On native it is the same line computed in code. The two end values sit on the spacing scale. The values between them do not, so `DS-SPACING-001` does not apply to these two tokens.
- **Safe areas and direction** `[DS-GRID-005]`: the real margin is the larger of `--grid-margin` and the safe-area inset on that side. Use start and end sides (`padding-inline`, `EdgeInsetsDirectional`, leading and trailing), never left and right.
- **Measure the parent** `[DS-GRID-006]`: a component measures the space it is given, not the screen. On the web use a container query on the region. On native use `LayoutBuilder` (Flutter), `BoxWithConstraints` (Compose) or `GeometryReader` (SwiftUI). Never branch on device type, model or orientation: an iPad in a split window is narrow and a phone in landscape is wide.
- **Collections** `[DS-GRID-007]`: a collection is a grid of equal cards, tiles or logos. `count = max(1, min(cap[windowClass], floor((inner + gutter) / (itemMin + gutter))))`. `cap` is the most columns for the window class, from the page template's `collections` entry. `inner` is the region width minus both margins, held at `--grid-content-max` (a `fill` page has no hold, and a container narrower than the region uses its own width with no page margins). `gutter` is `--grid-gutter` at the region width. `itemMin` is the item token the template names: `--item-min-icon-tile`, `--item-min-logo`, `--item-min-card`, `--item-min-plan` or `--item-min-story`. The cap sets how the page looks at each class. The fit stops cards from getting too small. A tile never drops below `itemMin` unless the count is already 1. Do not hard-code a column count (`grid-cols-3`).
- **Text size** `[DS-GRID-008]`: larger text raises `itemMin`, so the count drops. It never changes the grid, margins or gutters.
- **Regions** `[DS-GRID-009]`: a region is a track: `fluid`, a fraction such as `2fr`, `auto`, or a token name. Splits must fit the columns of the current class. An 8 column class splits 4 and 4, or 5 and 3, never 6 and 6. A region that is not side by side at a class stacks or folds.
- **Units** `[DS-GRID-010]`: one token unit is one CSS pixel, one dp on Android and one point on iOS.

**Panels** (a surface that opens at the side of a page)

- **Push or overlay** `[DS-PANEL-001]`: push sits inline and moves the main content over. Use it when people need to look at the page and the panel together (a preview, a properties list). Overlay floats over the page. Use it for a task that ends (an edit form, a filter set, a notification list).
- **Phones** `[DS-PANEL-002]`: below `--breakpoint-md` every panel is full screen. No push, no half-width overlay.
- **When a push panel fits** `[DS-PANEL-003]`: from `--breakpoint-md`, a panel pushes only if the window width, minus `--nav-rail`, minus the panel width leaves at least `--main-min`. The rail is assumed so the answer never flips back when the window grows. If it does not fit, the panel is an overlay.
- **The sidebar gives way first** `[DS-PANEL-004]`: while a push panel is open, the app shell keeps the full sidebar only if the window width, minus `--nav-sidebar`, minus the panel width still leaves `--main-min`. If not, the sidebar shows as the rail until the panel closes. Do this before turning the panel into an overlay.
- **Push panel width** `[DS-PANEL-005]`: `--panel-push-default` wide. If people can resize it, keep it between `--panel-push-min` and `--panel-push-max`. The main content never goes below `--main-min`.
- **Overlay width** `[DS-PANEL-006]`: a size tier (`--panel-overlay-sm`, `--panel-overlay-md` or `--panel-overlay-lg`). Its width is the smallest of the tier, half the window width rounded down to a multiple of 4, and never under `--panel-overlay-min`. Part of the page always stays visible behind it.
- **Two panes** `[DS-PANEL-007]`: a list with a detail pane shows both side by side only if each pane gets at least `--pane-min`. Otherwise it behaves like a phone: the list alone, and the detail opens as its own screen with a back control.
- **Tokens only** `[DS-PANEL-008]`: panel and pane widths are token names. Never a raw number in code, in a template or in a design spec.

**Example with the default values** (an example, not a source): a 320 push panel fits from a window of 880 and a 400 one from 960. With a 320 panel the sidebar shows as the rail from 1024 to 1039 and as the full sidebar from 1040. At a window of 768 the `md` and `lg` overlays are both 384. The `md` overlay reaches its full width at 960 and `lg` at 1280. Two panes start at a window of 800.

| Platform | Measure the parent | Safe area |
|---|---|---|
| Web | Container query on the region | `env(safe-area-inset-*)` |
| Flutter | `LayoutBuilder`, or `MediaQuery.sizeOf` for the window | `MediaQuery` padding |
| SwiftUI | `GeometryReader` | Safe area insets |
| Compose | `BoxWithConstraints` | Window insets |

Generate the CSS, Dart, Swift and Kotlin constants from one token source. Do not copy numbers by hand into any of them.

## Data Tables `[DS-TABLE]`

- **One scroll owner, chosen on purpose** `[DS-TABLE-001]`. A sticky header sticks to its nearest scroll-container ancestor, and any `overflow` other than `visible` or `clip` creates one, so nothing between the header and the intended owner may change that by accident.
- **Complex table:** the wrapper owns both axes: `overflow: auto` with a bounded block size, a sticky header inside, `scrollbar-gutter: stable`, `overscroll-behavior-x: contain`, and `scroll-padding-block-start` equal to the header height `[DS-TABLE-002]`. **Simple table:** no overflow on the wrapper, so the header sticks to the page (offset by any fixed app header), and it never scrolls sideways `[DS-TABLE-003]`.
- Don't use `overflow: auto clip`, or `overflow-x: auto` with `overflow-y: clip`, to keep a header sticky to the page: `clip` computes to `hidden` next to `auto`, which is still a scroll container `[DS-TABLE-004]`. Every flex or grid ancestor between the app shell and the wrapper has `min-inline-size: 0` and `min-block-size: 0` `[DS-TABLE-005]`.
- **Pinned first column:** `position: sticky`, `inset-inline-start: 0`, an opaque background, and small local z-index values (column 1, header row 2, corner cell 3) inside `isolation: isolate` on the scroll owner so they never outrank an overlay; add `scroll-padding-inline-start` equal to the column width `[DS-TABLE-006]`. Tables with sticky cells use `border-collapse: separate` with `border-spacing: 0` `[DS-TABLE-007]`.
- Layout changes key off the container, not the viewport: `container-type: inline-size` on an element outside the scroll wrapper and `@container (width < 37.5em)` for the narrow layout `[DS-TABLE-008]`. Use `table-layout: fixed` with explicit column widths, `text-overflow: ellipsis`, right-aligned numbers with `tabular-nums`, and left-aligned text `[DS-TABLE-009]`.
- **Scrollbars:** `scrollbar-width: thin` and `scrollbar-color` from a neutral token, no `::-webkit-scrollbar`, and don't hide the scrollbar on a table that scrolls sideways `[DS-TABLE-010]`; `scrollbar-gutter: stable` so columns stay aligned `[DS-TABLE-011]`; `overscroll-behavior-x: contain`, not the vertical axis `[DS-TABLE-012]`; `scroll-padding-block-start` equal to the header height so focused rows aren't hidden `[DS-TABLE-013]`.
- **Wheel lock:** a complex table that scrolls both ways scrolls one axis per gesture: a wheel handler (`passive: false`, `ctrlKey` passes through) that scrolls only the dominant axis, shared as one hook with an opt-out. Simple tables don't use it. Leave touch alone `[DS-TABLE-014]`.
- **Accessibility:** the scroll owner has `tabindex="0"`, `role="region"`, and an `aria-label`; keep real table elements, a button inside a sortable `th`, and `aria-sort` on the sorted `th`; use `role="grid"` only with arrow-key cell navigation `[DS-TABLE-015]`.
- Paginate by default; virtualize only for database-style grids with thousands of rows, and test the sticky header and pinned column with a long scroll `[DS-TABLE-016]`. Highlights for just-added rows and scroll-shadow transitions respect `prefers-reduced-motion` `[DS-TABLE-017]`. A table that scrolls sideways shows a cue that more content exists, such as an edge shadow on the pinned column or a partly visible column `[DS-TABLE-018]`.
- **Sizes come from tokens** `[DS-TABLE-019]`: `--table-header-h` 2.5rem (40px, also the sticky offset), `--table-row-h-dense` 2rem (32px, pointer devices only), `--table-row-h-regular` 2.75rem (44px, matches `--hit-area-min` so rows are tappable), `--table-row-h-comfortable` 3.5rem (56px). The space above a complex table and a fixed app header's height are set by the page, not tokens, and the component supplies a fallback. Check the workspace token set first; if a size is missing, propose it, never hardcode.

## Marketing Type & Spacing `[DS-MKT]`

Marketing surfaces only (landing pages, product marketing, public site pages). Product UI keeps the Typography and Spacing rules as written `[DS-MKT-001]`.

- The display face (`--font-heading`) carries display and h2 only and is never used below 28px; the text face (`--font-body`) carries everything else. Both roles can be one family at different weights `[DS-MKT-002]`. One display headline per page and one h2 per section `[DS-MKT-003]`.
- **Scale (a starting point; values are estimates, keep the ratios):** display 40/44 mobile and 72/76 desktop; h2 28/34 and 44/50; h3 20/26 and 24/30; lead 18/26 and 20/30; body 16/24 and 17/26; small 14/20 and 15/22 `[DS-MKT-004]`.
- Cap marketing body text at `56ch`, replacing the 65ch cap on marketing surfaces. Headings may run narrower `[DS-MKT-005]`.
- The gap between sections is about 4x the gap between a section heading and its content, and 12 to 15x the gap between a heading and its body text. If the page feels cramped, widen the section gap first, then cut content; don't add dividers to compensate `[DS-MKT-006]`. Keep the gap inside a block smaller than the gap between blocks, or the page reads as one pile `[DS-MKT-007]`.
- Section-to-section gaps may exceed 96px, up to 240px, in steps of 8, using a spacing token. This is an exception to the allowed-values list; divisible by 4 or 8 still holds `[DS-MKT-008]`.

## Tailwind v4 `[DS-TAILWIND]`

Replace `@layer base` with `@theme` `[DS-TAILWIND-001]`; use `@import "tailwindcss"` instead of the separate base/components/utilities imports `[DS-TAILWIND-002]`. Container queries are built in — use `@container` and `@min-`/`@max-` variants. `hover:` only applies on hover-capable devices in v4, but verify on touch anyway. Arbitrary values (`w-[237px]`) are a smell — round to the scale or flag a missing token `[DS-TAILWIND-003]`. No `!important` except explicitly-owned, documented overrides `[DS-TAILWIND-004]`. Never `transition: all` — list properties explicitly `[DS-TAILWIND-005]`.

## StyleX `[DS-STYLEX]`

Alternative to Tailwind: a compile-time CSS-in-JS system, styles authored as typed JS objects and compiled by a Babel/SWC/bundler plugin into static atomic CSS. A workspace uses one engine or the other, not both. Everything above except the Tailwind v4 section applies identically under StyleX.

Confirm the build plugin is wired in before writing any StyleX styles — they're inert without it `[DS-STYLEX-001]`. Define tokens with `stylex.defineVars()` and reference them from `stylex.create()`; never a literal value where a token exists `[DS-STYLEX-002]`. Use `stylex.createTheme()` to override a `defineVars()` group for theme variants (dark mode, brand variants) rather than a second token set `[DS-STYLEX-003]`. Compose variants from multiple `stylex.create()` keys merged in `stylex.props()`, most-specific override last — the StyleX equivalent of `cva` `[DS-STYLEX-004]`. Don't use an inline `style={{}}` prop where a `stylex.create()` key already covers the value — inline styles win the cascade over any StyleX class `[DS-STYLEX-005]`. Use `stylex.defineConsts()` for breakpoints and other compile-time constants, in `em` not `px` `[DS-STYLEX-006]`.

```ts
import * as stylex from "@stylexjs/stylex";

const colors = stylex.defineVars({ primary: "oklch(0.637 0.237 259.4)" });
const styles = stylex.create({
  button: { backgroundColor: colors.primary, borderRadius: 6 },
});
```

Full version & code examples: `references/stylex.md` in the main skill.

## Animation `[DS-ANIMATION]`

UI animations under 300ms by default `[DS-ANIMATION-001]`; large elements (drawers, action sheets, modals entering) up to 500ms `[DS-ANIMATION-002]`. Never animate keyboard-triggered interactions — repeated actions feel slower animated `[DS-ANIMATION-003]`.

Always respect `prefers-reduced-motion` `[DS-ANIMATION-004]` — real reasons include vestibular disorders and motion sensitivity. In Motion, use `useReducedMotion()` to zero out duration/movement conditionally.

**Easing:** `ease-out` for clicks/taps/interactions. `ease-in-out` for on-screen state changes (progress bars, toggles). `linear` for constant-speed loops only (marquees, spinners). `ease` for subtle ambient animation (toasts). Custom curves (Benjamin De Cock / Linear): `--ease-out-quart: cubic-bezier(.165,.84,.44,1)`, `--ease-out-quint: cubic-bezier(.23,1,.32,1)`, `--ease-out-expo: cubic-bezier(.19,1,.22,1)`, `--ease-in-out-quart: cubic-bezier(.77,0,.175,1)`, `--ease-in-out-quint: cubic-bezier(.86,0,.07,1)`, `--ease-in-out-expo: cubic-bezier(1,0,0,1)`.

Never animate from `scale(0)` — start at 0.9 or higher `[DS-ANIMATION-005]`. The one exception is an icon swap, which follows `DS-SURFACE-014` (start at 0.25 with a blur). Set `transform-origin` to the trigger point (a dropdown expands from its button), not `center` `[DS-ANIMATION-006]`. Guard hover with `@media (hover: hover) and (pointer: fine)` in raw CSS `[DS-ANIMATION-007]`.

**Button press:** `scale(0.96)` on `:active`, never below 0.95 or it reads exaggerated `[DS-ANIMATION-008]`; not every button needs this — add a `static` prop to disable it where distracting (lists with frequent clicks).

**GPU hints:** `will-change` only helps `transform`, `opacity`, `filter`, `clip-path` — it does nothing for `width`/`height`/`top`/`left`/`background`/`border`/`color`. Add it only when you actually observe first-frame stutter, not preemptively `[DS-ANIMATION-009]`.

Springs are allowed in Motion only at `bounce: 0` with a token duration `[DS-MOTION-006]`. No bounce, ever.

## Motion Tokens `[DS-MOTION]`

Timing and easing come from motion tokens. Component code never holds a literal duration, `cubic-bezier(...)` curve or numeric easing array `[DS-MOTION-001]`.

- **Token names:** `--motion-duration-instant`, `--motion-duration-fast`, `--motion-duration-base`, `--motion-duration-slow`, `--motion-ease-standard`, `--motion-ease-emphasized`, `--motion-distance-short`. Values live in your project's token file. If the project has none, start from the file below.
- **CSS:** `transition-duration: var(--motion-duration-fast);`. **Tailwind:** `duration-[var(--motion-duration-fast)]`. **StyleX:** `transitionDuration: "var(--motion-duration-fast)"`. **Motion (JS):** import durations and easings from `motion-tokens.ts`.
- **The token file is the only place literal values may be defined:** `motion-tokens.css`, `.scss`, `.ts` or `.js`. Named keywords (`ease-out`, `linear`) follow the Easing rules above.

Starter token file (starting points to tune in your own product):

```css
:root {
  --motion-duration-instant: 100ms; /* micro feedback */
  --motion-duration-fast: 150ms;    /* icon morph, number ticker, small crossfades */
  --motion-duration-base: 250ms;    /* label morph, directional, grow-from-trigger */
  --motion-duration-slow: 400ms;    /* large elements only */
  --motion-ease-standard: cubic-bezier(.165, .84, .44, 1);  /* ease-out-quart */
  --motion-ease-emphasized: cubic-bezier(.23, 1, .32, 1);   /* ease-out-quint */
  --motion-distance-short: 12px;    /* label rise and directional slide */
}
```

```ts
// motion-tokens.ts (seconds, to match Motion's API). Keep values identical to the CSS file.
export const motionDuration = { instant: 0.1, fast: 0.15, base: 0.25, slow: 0.4 } as const;
type Bezier = [number, number, number, number]; // mutable, so every version of Motion accepts it as `ease`
export const motionEase: { standard: Bezier; emphasized: Bezier } = {
  standard: [0.165, 0.84, 0.44, 1],
  emphasized: [0.23, 1, 0.32, 1],
};
export const motionDistance = { short: 12 } as const; // px, same as --motion-distance-short
export const motionSpring = {
  standard: { type: "spring", bounce: 0, duration: motionDuration.base },
} as const;
```

`--motion-distance-short` is how far a morph travels. Use one value across the project (8px to 16px suits most UIs) and keep it small next to the element that moves. If the token is missing, the element does not travel.

**Tailwind v4:** `--ease-*`, `--default-transition-duration` and `--default-transition-timing-function` are theme variables, so set them in `@theme`. There is no `--duration-*` namespace: a class such as `duration-fast` generates no CSS and raises no error. Write `duration-[var(--motion-duration-fast)]` and check the computed `transition-duration` after a build.

- **Slow duration** is for large elements only (drawers, sheets, modals entering) and can run up to 500ms. Every other UI animation stays under 300ms, whichever token it uses `[DS-MOTION-002]`.
- **A morph runs inside one duration token.** Old content leaves while new content arrives, so the morph takes one token, never two added together. Out then in doubles the time and breaks `[DS-ANIMATION-001]` `[DS-MOTION-003]`.
- **A tray** (a persistent bottom container that shows one step at a time) is one element. Steps swap inside it and its height follows the new step. It never unmounts between steps `[DS-MOTION-004]`.
- **Context treatment:** when a shared element travels between views, the content it leaves behind may dim and blur. The blur never exceeds the `[DS-SURFACE-014]` value, and the travelling element is never blurred. Under reduced motion there is no blur and no dim ramp `[DS-MOTION-005]`.
- **Springs** are allowed on the web when `bounce` is `0` and the duration comes from a motion token (`motionSpring.standard`). The CSS side keeps `--motion-ease-standard`. A transition retargeted while it runs, such as a tray dismissed halfway through opening, continues from its current position and velocity, not from the start `[DS-MOTION-006]`.
- **Delight** (an easter egg, a particle burst, a looping shimmer) never gates the task and never carries meaning alone. A loop pauses under `prefers-reduced-motion` and while the page is hidden. Nothing flashes more than three times a second. A one-off occasion effect plays once and can be skipped. Text inside an easter egg goes through Righter, and humor never appears in an error `[DS-MOTION-007]`.

## Accessibility `[DS-A11Y]`

These are not optional.

Every interactive element has a hit area of at least `var(--hit-area-min)` (44px) in both dimensions. The token sets the click or tap area only, never the visual size of the control. If the visible element is smaller, extend the hit area with a pseudo-element centered on it, sized `width: 100%; height: 100%` with `min-width` and `min-height` of `var(--hit-area-min)` `[DS-A11Y-001]`.

**Focus:** `:focus-visible` for visual focus rings (keyboard/assistive tech, not mouse clicks) `[DS-A11Y-002]`; `:focus-within` to style a whole form section when a child is focused; `:focus` only when you need to respond to all focus events regardless of input method. Never remove `outline` without a `:focus-visible` replacement `[DS-A11Y-003]`.

**Contrast:** normal text (under 18px regular / 14px bold) 4.5:1 minimum; large text (18px+ regular / 14px+ bold) 3:1; UI components and graphical objects 3:1 `[DS-A11Y-004]`.

**Semantic HTML:** `<button>` for actions, `<a>` for navigation — never `<div onClick>` `[DS-A11Y-005]`. Labeled form inputs, not placeholder-only `[DS-A11Y-006]`. `aria-label` on icon-only buttons `[DS-A11Y-007]`; `aria-hidden="true"` on decorative icons `[DS-A11Y-008]`. `aria-live="polite"` or `role="alert"` on error messages `[DS-A11Y-009]`. `alt` on all images (`alt=""` for decorative, never missing) `[DS-A11Y-010]`. `<ul>`/`<ol>` for lists, not stacked divs `[DS-A11Y-011]`. `<br>` only for intentional in-content breaks, never for visual spacing `[DS-A11Y-012]`. `loading="lazy"` on below-the-fold images only `[DS-A11Y-013]`. `<time datetime="...">` for dates `[DS-A11Y-014]`. Heading elements for document structure, not font size `[DS-A11Y-015]`. `<fieldset>`/`<legend>` for radio/checkbox groups — screen readers announce the group label with each input `[DS-A11Y-016]`.

Never use color as the only signal for state — error/success/warning always need an icon or text label too `[DS-A11Y-017]`.

## CSS Architecture `[DS-CSS]`

```css
@import "tailwindcss";
@theme { --color-primary: oklch(...); --radius-md: 0.5rem; }
html { color-scheme: light dark; scrollbar-gutter: stable; }
@custom-variant dark (&:is(.dark *));
```

No inline styles where a token equivalent exists `[DS-CSS-001]`.

**Selectors:** never `#id` selectors for styling `[DS-CSS-002]`. Keep selectors to 2 levels of nesting max — add a class instead of going deeper `[DS-CSS-003]`. Use `:is()` to group selectors without multiplying specificity `[DS-CSS-004]`; `:where()` for zero-specificity base styles that should be easy to override `[DS-CSS-005]`. Separate layout properties from visual/brand properties in hand-authored CSS `[DS-CSS-006]`.

**Media queries:** use `em` not `px` for hand-authored breakpoints, so they respect browser font-size/zoom `[DS-CSS-007]` (Tailwind's built-in breakpoints use px internally and are unaffected):

| Name | em | px equivalent |
|---|---|---|
| sm | 37.5em | 600px |
| md | 48em | 768px |
| lg | 64em | 1024px |
| xl | 80em | 1280px |

`sm`, `md` and `lg` are the grid window classes. `sm` is also the container width for narrow tables and forms. `xl` is not a grid class.

## Anti-Slop `[DS-SLOP]`

The rest of this skill checks whether UI is *correct*. This section checks whether it's *generic* — the layout and styling defaults that make AI-generated work instantly recognizable even when every token rule passes. A centered hero over a purple-to-blue gradient with three identical feature cards violates no spacing or color token. It violates taste.

Several rules are dial-gated — read VARIANCE before flagging; a deliberately symmetric low-variance product UI isn't slop, a marketing page that *defaults* to centered-everything is. Most of these are judgment calls, not mechanically detectable.

- **`[DS-SLOP-001]` Centered-everything as a default** — above VARIANCE 4, a centered hero (centered headline + subtext + single CTA) is the most common AI layout default. Reach for split-screen, asymmetric, or offset structures instead; centered should be a deliberate choice, not the thing you land on by default.
- **`[DS-SLOP-002]` The AI gradient** — purple/violet/indigo → blue/cyan gradients (backgrounds, gradient text, `linear-gradient()`) are template-output's visual signature. Use the workspace's own accent tokens instead.
- **`[DS-SLOP-003]` Three equal feature cards** — the identical `grid-cols-3` card row is a tell. Vary sizes, promote the primary one, or use an asymmetric/bento grid. On marketing pages a row or stack has at most three blocks: three is the ceiling, not the target, and the blocks should still differ in size, emphasis, or content.
- **`[DS-SLOP-004]` Eyebrow overuse** — the uppercase label above a heading is fine once; cap it at roughly 1 per 3 sections.
- **`[DS-SLOP-005]` Emoji as UI iconography** — use the real icon set for interface chrome; emoji in user-authored content is fine.
- **`[DS-SLOP-006]` Zigzag repetition** — alternating image-left/image-right sections are fine up to 2 in a row; a third must break the pattern.
- **`[DS-SLOP-007]` Spec-sheet tables for marketing** — a label/value table for features or plans on a marketing surface is boilerplate; use grouped cards or clustered stats instead (genuine product data tables are unaffected).
- **`[DS-SLOP-008]` Symmetry as the only rhythm** — even at low VARIANCE, a page needs some change in pace, not identical width/padding/alignment top to bottom.
- **`[DS-SLOP-009]` No em dashes in copy** — a well-known AI writing tell that reads as a hedge in short copy. Don't use them in UI copy, marketing copy, or any text the product or page ships; use a period, comma, or colon, and rewrite a sentence that needs a dash to hold together. Judgment-only (the detector doesn't check it); route copy through Righter (`no-em-dashes`).
- **`[DS-SLOP-010]` Card-ifying everything** — wrapping every static section in a bordered/shadowed card is unearned structure. Reserve drop shadows for things a user picks up, hovers, or acts on.
- **`[DS-SLOP-011]` Over-styled active states** — a colored left border plus corner radius (worse with a shadow on top) on active nav/sidebar items gets uglier as it compounds. A subtle background or text-color shift usually reads clearly enough on its own.

## Quick Reference

| Situation | What to do |
|-----------|------------|
| Nesting rounded elements | `outerRadius = innerRadius + padding` |
| Icon or button looks off-center | Align optically, not geometrically |
| Card/container needs depth | Layered `box-shadow`, not a border |
| Image needs a subtle edge | 1px outline, pure black/white at 0.1 opacity |
| Page or section entering | Split into chunks, stagger ~100ms |
| Icon swapping state (play/pause, like) | scale 0.25→1 + opacity + blur, exact values above |
| Need full-screen height | `svh` not `vh` |
| Two colors switching with theme | `light-dark()` |
| Animating accordion height | `interpolate-size: allow-keywords` |
| Building a modal | `inert` + `overscroll-behavior` + `scrollbar-gutter` |
| Value doesn't exist in tokens | Flag it, don't invent it |
| Animation feels off | Check `transform-origin` and slow it down |
| Hover on mobile | Guard with `@media (hover: hover) and (pointer: fine)` |
| Space between two adjacent elements | `gap` on the parent, not `padding-bottom` on the first child |
| Flex child text overflowing or not truncating | Add `min-width: 0` to the flex child |
| Fixed-size image looks stretched | `object-fit: cover` or `contain` |
| 16:9 or other ratio container | `aspect-ratio: 16 / 9`, not the padding-top hack |
| Group of radio or checkbox inputs | Wrap in `<fieldset>` with `<legend>` |
| Textarea that grows with content | `field-sizing: content`, explicit width, `lh` min and max |
| Control smaller than its click area | Extend the hit area to `var(--hit-area-min)` |
| Form, field, or dialog width | Use the width tokens |
| Sticky table header does not stick | A table has one scroll owner. `overflow-x: auto` on the wrapper makes it the owner. Bound its height or remove the overflow |
| Table scrolls diagonally | Wheel lock on complex tables: scroll only the dominant axis |
| Layout keeps landing on a centered hero | Above VARIANCE 4, break it — split/asymmetric/offset |
| Reaching for a purple→blue gradient | Stop — use accent tokens instead |
| Three identical feature cards in a row | Vary sizes or use a bento/asymmetric grid |

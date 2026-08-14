---
name: vois-tokens
description: Rules and patterns for building UI with shadcn/ui, Tailwind v4, and Motion against a Vois design token set. Use when building components, pages, or any UI that should conform to the workspace design system. Covers spacing, typography, color tokens, component architecture, animation, accessibility, and modern CSS patterns.
version: 1.11.0
---

# Vois Tokens Skill (Rules & Values Edition)

> Full version & updates: https://github.com/ommakes/Skills/blob/main/vois-tokens/SKILL.md — the full version adds a live per-edit checker hook (`scripts/`) for Claude Code, Cursor, and Codex, and a "Reviewing Existing UI" workflow for auditing code diffs. Both are code-editing features with no Figma equivalent, so this edition presents the design rules and token values as an adoptable reference implementation instead. Vois's Figma plugin syncs these tokens into your file as real variables if you want to adopt the system rather than just read about it.

You are building UI for a design system that uses **shadcn/ui**, **Tailwind v4**, and **Motion**. This skill defines the rules, constraints, and patterns to follow. Deviation produces inconsistent, unmaintainable UI.

## Taste dials

If your workspace defines **VARIANCE** (layout asymmetry), **MOTION** (animation richness), and **DENSITY** (information per screen) as 1–10 dials, use them to tune choices you'd otherwise make by default: DENSITY biases spacing toward the tighter or looser end of the scale below; MOTION biases how much animation to add (low = essential feedback only, high = richer entrance/transition choreography); VARIANCE biases layout symmetry (low = symmetric grids, high = asymmetry welcome — also gates the centered-hero anti-slop rule below).

**Dials never override hard rules.** Animations stay under the 300/500ms caps and honor `prefers-reduced-motion` even at MOTION 10; contrast, touch targets, and the 4/8 spacing scale hold even at DENSITY 10. Dials choose *within* the allowed range, never widen it. If no dials are defined, assume mid defaults (5/4/5).

## Before You Write Anything

1. Check the component manifest. If a component exists for what you need, use it — don't build a new one.
2. Check the token tables in the relevant section below (spacing, type scale, color, elevation, icon size, breakpoints). If a token exists, use it — don't hardcode.
3. If neither exists, flag it — don't invent values or components.

## Topic Index

| Topic | Rule prefix |
|---|---|
| Spacing | `[DS-SPACING]` |
| Typography | `[DS-TYPOGRAPHY]` |
| Color | `[DS-COLOR]` |
| Components (variants, modals, accordions) | `[DS-COMPONENT]` `[DS-MODAL]` |
| Surfaces (radius, alignment, shadows, motion polish) | `[DS-SURFACE]` |
| Elevation | `[DS-ELEVATION]` |
| Iconography | `[DS-ICON]` |
| Layout & responsive | `[DS-LAYOUT]` `[DS-RESPONSIVE]` |
| Tailwind v4 | `[DS-TAILWIND]` |
| Animation | `[DS-ANIMATION]` |
| Accessibility | `[DS-A11Y]` |
| CSS architecture | `[DS-CSS]` |
| Anti-slop (generic "AI-looking" defaults) | `[DS-SLOP]` |

---

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
- [ ] No animations from `scale(0)` `[DS-ANIMATION-005]`
- [ ] `prefers-reduced-motion` handled `[DS-ANIMATION-004]`
- [ ] No `transition: all` `[DS-TAILWIND-005]`
- [ ] Hover effects guarded on touch devices `[DS-ANIMATION-007]`
- [ ] `will-change` only when stutter is actually observed, only on transform/opacity/filter `[DS-ANIMATION-009]`

**Accessibility**
- [ ] All interactive elements have `:focus-visible` styles `[DS-A11Y-002]`
- [ ] No `outline: none` without a replacement `[DS-A11Y-003]`
- [ ] Touch targets minimum 44×44px `[DS-A11Y-001]`
- [ ] Contrast passes WCAG AA `[DS-A11Y-004]`
- [ ] No `div`/`span` as interactive elements without ARIA `[DS-A11Y-005]`
- [ ] All images have `alt` `[DS-A11Y-010]`
- [ ] `<fieldset>`/`<legend>` used for radio/checkbox groups `[DS-A11Y-016]`
- [ ] `<ul>`/`<ol>` used for lists, not stacked divs `[DS-A11Y-011]`

**Layout**
- [ ] Using `svh`/`lvh`/`dvh` not `vh` for viewport-height layouts `[DS-LAYOUT-001]`
- [ ] Tested at sm, md, lg breakpoints `[DS-RESPONSIVE-002]`
- [ ] No `padding-bottom`/`margin-top` used to space siblings — use `gap` on parent `[DS-LAYOUT-COMP-001]`
- [ ] `min-width: 0` on flex children containing text or overflow-prone content `[DS-LAYOUT-COMP-003]`
- [ ] `aspect-ratio` used instead of padding-top percentage hack `[DS-LAYOUT-COMP-005]`

**CSS**
- [ ] No `#id` selectors used for styling `[DS-CSS-002]`
- [ ] Selectors no deeper than 2 levels without a class `[DS-CSS-003]`
- [ ] Hand-authored `@media` queries use `em` not `px` `[DS-CSS-007]`

**Anti-slop** (see Anti-Slop section — several are dial-gated)
- [ ] No centered-everything default above `VARIANCE 4` `[DS-SLOP-001]`
- [ ] No purple/indigo→blue "AI gradient" as a default `[DS-SLOP-002]`
- [ ] Feature groups aren't three identical cards in a row `[DS-SLOP-003]`
- [ ] Eyebrows capped at ~1 per 3 sections `[DS-SLOP-004]`
- [ ] No emoji standing in for real icons `[DS-SLOP-005]`
- [ ] No more than 2 consecutive zigzag sections `[DS-SLOP-006]`
- [ ] No spec-sheet table on a marketing surface `[DS-SLOP-007]`
- [ ] Page has some change in pace, not uniform top to bottom `[DS-SLOP-008]`
- [ ] Em-dash density appropriate to context — Righter owns prose `[DS-SLOP-009]`
- [ ] No default card-ifying of static sections; drop shadow reserved for interactive elements `[DS-SLOP-010]`
- [ ] No left-border + corner-radius combo on active nav/sidebar items; use a subtle color shift instead `[DS-SLOP-011]`

---

## Spacing `[DS-SPACING]`

All spacing must be divisible by **4 or 8**. No exceptions. `[DS-SPACING-001]`

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
    variant: { default: "bg-primary text-primary-foreground hover:bg-primary/90", destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90", outline: "border border-input bg-background hover:bg-accent", ghost: "hover:bg-accent hover:text-accent-foreground" },
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

**Icon state transitions** (play→pause, like→liked): animate `opacity` + `scale` + `blur`, not visibility toggling `[DS-SURFACE-014]`. Exact values: scale `0.25`→`1` (never 0.5/0.6), opacity `0`→`1`, blur `4px`→`0px`, transition `{ type: "spring", duration: 0.3, bounce: 0 }` — bounce always 0. Without a Motion dependency, keep both icons in the DOM (one absolutely positioned) and cross-fade with CSS `cubic-bezier(0.2, 0, 0, 1)`. Animate icons appearing on hover, state-change icons, and contextual toolbar icons — not static navigation or decorative icons.

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

**Responsive:** mobile-first, no prefix = baseline, `md:`/`lg:` are enhancements `[DS-RESPONSIVE-001]`. Test at sm (640px), md (768px), lg (1024px) `[DS-RESPONSIVE-002]`. Container queries for component-level responsiveness, breakpoints for layout-level `[DS-RESPONSIVE-003]`. Touch targets, font sizes, contrast must meet minimums at every breakpoint `[DS-RESPONSIVE-004]`. Don't build desktop-first and assume mobile will work `[DS-RESPONSIVE-005]`.

**Component-level:** no `padding-bottom`/`margin-top` for sibling spacing — use `gap` on the parent `[DS-LAYOUT-COMP-001]`. No purposeless wrapper divs `[DS-LAYOUT-COMP-002]`. `min-width: 0` on flex children with text/overflow-prone content `[DS-LAYOUT-COMP-003]`. `object-fit` on images with set dimensions `[DS-LAYOUT-COMP-006]`. `aspect-ratio` instead of the padding-top percentage hack `[DS-LAYOUT-COMP-005]`.

## Tailwind v4 `[DS-TAILWIND]`

Replace `@layer base` with `@theme` `[DS-TAILWIND-001]`; use `@import "tailwindcss"` instead of the separate base/components/utilities imports `[DS-TAILWIND-002]`. Container queries are built in — use `@container` and `@min-`/`@max-` variants. `hover:` only applies on hover-capable devices in v4, but verify on touch anyway. Arbitrary values (`w-[237px]`) are a smell — round to the scale or flag a missing token `[DS-TAILWIND-003]`. No `!important` except explicitly-owned, documented overrides `[DS-TAILWIND-004]`. Never `transition: all` — list properties explicitly `[DS-TAILWIND-005]`.

## Animation `[DS-ANIMATION]`

UI animations under 300ms by default `[DS-ANIMATION-001]`; large elements (drawers, action sheets, modals entering) up to 500ms `[DS-ANIMATION-002]`. Never animate keyboard-triggered interactions — repeated actions feel slower animated `[DS-ANIMATION-003]`.

Always respect `prefers-reduced-motion` `[DS-ANIMATION-004]` — real reasons include vestibular disorders and motion sensitivity. In Motion, use `useReducedMotion()` to zero out duration/movement conditionally.

**Easing:** `ease-out` for clicks/taps/interactions. `ease-in-out` for on-screen state changes (progress bars, toggles). `linear` for constant-speed loops only (marquees, spinners). `ease` for subtle ambient animation (toasts). Custom curves (Benjamin De Cock / Linear): `--ease-out-quart: cubic-bezier(.165,.84,.44,1)`, `--ease-out-quint: cubic-bezier(.23,1,.32,1)`, `--ease-out-expo: cubic-bezier(.19,1,.22,1)`, `--ease-in-out-quart: cubic-bezier(.77,0,.175,1)`, `--ease-in-out-quint: cubic-bezier(.86,0,.07,1)`, `--ease-in-out-expo: cubic-bezier(1,0,0,1)`.

Never animate from `scale(0)` — start at 0.9 or higher `[DS-ANIMATION-005]`. Set `transform-origin` to the trigger point (a dropdown expands from its button), not `center` `[DS-ANIMATION-006]`. Guard hover with `@media (hover: hover) and (pointer: fine)` in raw CSS `[DS-ANIMATION-007]`.

**Button press:** `scale(0.96)` on `:active`, never below 0.95 or it reads exaggerated `[DS-ANIMATION-008]`; not every button needs this — add a `static` prop to disable it where distracting (lists with frequent clicks).

**GPU hints:** `will-change` only helps `transform`, `opacity`, `filter`, `clip-path` — it does nothing for `width`/`height`/`top`/`left`/`background`/`border`/`color`. Add it only when you actually observe first-frame stutter, not preemptively `[DS-ANIMATION-009]`.

No bounce by default in Motion — spring animations are a native-iOS pattern, not standard web UI.

## Accessibility `[DS-A11Y]`

These are not optional.

Minimum touch target **44×44px** — expand the hit area with a pseudo-element if the visual element is smaller `[DS-A11Y-001]`.

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
| sm | 40em | 640px |
| md | 48em | 768px |
| lg | 64em | 1024px |
| xl | 80em | 1280px |

## Anti-Slop `[DS-SLOP]`

The rest of this skill checks whether UI is *correct*. This section checks whether it's *generic* — the layout and styling defaults that make AI-generated work instantly recognizable even when every token rule passes. A centered hero over a purple-to-blue gradient with three identical feature cards violates no spacing or color token. It violates taste.

Several rules are dial-gated — read VARIANCE before flagging; a deliberately symmetric low-variance product UI isn't slop, a marketing page that *defaults* to centered-everything is. Most of these are judgment calls, not mechanically detectable.

- **`[DS-SLOP-001]` Centered-everything as a default** — above VARIANCE 4, a centered hero (centered headline + subtext + single CTA) is the most common AI layout default. Reach for split-screen, asymmetric, or offset structures instead; centered should be a deliberate choice, not the thing you land on by default.
- **`[DS-SLOP-002]` The AI gradient** — purple/violet/indigo → blue/cyan gradients (backgrounds, gradient text, `linear-gradient()`) are template-output's visual signature. Use the workspace's own accent tokens instead.
- **`[DS-SLOP-003]` Three equal feature cards** — the identical `grid-cols-3` card row is a tell. Vary sizes, promote the primary one, or use an asymmetric/bento grid.
- **`[DS-SLOP-004]` Eyebrow overuse** — the uppercase label above a heading is fine once; cap it at roughly 1 per 3 sections.
- **`[DS-SLOP-005]` Emoji as UI iconography** — use the real icon set for interface chrome; emoji in user-authored content is fine.
- **`[DS-SLOP-006]` Zigzag repetition** — alternating image-left/image-right sections are fine up to 2 in a row; a third must break the pattern.
- **`[DS-SLOP-007]` Spec-sheet tables for marketing** — a label/value table for features or plans on a marketing surface is boilerplate; use grouped cards or clustered stats instead (genuine product data tables are unaffected).
- **`[DS-SLOP-008]` Symmetry as the only rhythm** — even at low VARIANCE, a page needs some change in pace, not identical width/padding/alignment top to bottom.
- **`[DS-SLOP-009]` Em-dash as an AI tell** — scoped, not a ban: fine in careful editorial/typographic prose, a tell when it's the default connector for every clause in generated marketing copy. Route through Righter, which owns the final call on prose.
- **`[DS-SLOP-010]` Card-ifying everything** — wrapping every static section in a bordered/shadowed card is unearned structure. Reserve drop shadows for things a user picks up, hovers, or acts on.
- **`[DS-SLOP-011]` Over-styled active states** — a colored left border plus corner radius (worse with a shadow on top) on active nav/sidebar items gets uglier as it compounds. A subtle background or text-color shift usually reads clearly enough on its own.

---

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
| Layout keeps landing on a centered hero | Above VARIANCE 4, break it — split/asymmetric/offset |
| Reaching for a purple→blue gradient | Stop — use accent tokens instead |
| Three identical feature cards in a row | Vary sizes or use a bento/asymmetric grid |

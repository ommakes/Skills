---
name: vois-tokens
description: Rules and patterns for building UI with shadcn/ui, Tailwind v4, and Motion against a Vois design token set. Use when building components, pages, or any UI that should conform to the workspace design system. Covers spacing, typography, color tokens, component architecture, animation, accessibility, and modern CSS patterns.
version: 1.9.1
---

# Vois Tokens Skill

You are building UI for a design system that uses **shadcn/ui**, **Tailwind v4**, and **Motion**. This skill defines the rules, constraints, and patterns you must follow. Deviation from these rules produces inconsistent, unmaintainable UI.

This SKILL.md is the entry point. Detailed rules for each topic live in `references/` — read only the file(s) relevant to what you're building, not all of them every time.

**Automated checks:** a deterministic detector (`scripts/detect.mjs`) covers the mechanically-verifiable subset of the Pre-Submit Checklist below and can run as a per-edit hook in Claude Code, Cursor, or Codex. See `references/hooks.md` for setup and which rules are covered.

---

## Taste dials

If vois-router loaded `VOIS.md`, you'll be handed three 1-10 dials —
**VARIANCE** (layout asymmetry), **MOTION** (animation richness), **DENSITY**
(information per screen). They tune choices you'd otherwise make by default:

- **DENSITY** biases spacing scale and default paddings/gaps — high density
  reaches for the tighter end of the 4/8 scale, low density the looser end.
- **MOTION** biases how much animation to add — low motion means essential
  feedback only; high motion means richer entrance/transition choreography.
- **VARIANCE** biases layout — low means symmetric grids, high means asymmetry
  is welcome. VARIANCE also gates `DS-SLOP-001` (centered-hero default fires
  above 4).

**Dials never override hard rules.** Every guardrail still applies at every dial
value: animations stay under the 300/500ms caps and honor `prefers-reduced-motion`
even at MOTION 10; contrast, touch targets, and spacing-on-the-4/8-scale hold
even at DENSITY 10. Dials choose *within* the allowed range; they never widen it.
If no dials were passed, assume the mid defaults (V/M/D = 5/4/5).

---

## Before You Write Anything

1. Check the component manifest. If a component exists for what you need, use it. Do not build a new one.
2. Check `data/tokens.json` for the value you need (spacing, type scale, color, elevation, icon size, breakpoints). If a token exists, use it. Do not hardcode anything.
3. If neither exists, flag it — don't invent values or components.
4. If a `vois_record_rule_usage` tool is available, call it after completing any UI work with the rule IDs you applied — this feeds the self-improving design system. If you violated a rule or found a rule unclear, include it with `violated: true` or `ambiguous: true`. If the tool isn't available, this step is optional telemetry — skip it and move on.

---

## Reference Files

**Structured lookups — query these instead of scanning a whole reference file
when you already know the rule ID, category, or token you need:**
- `data/vois-rules.json` — every numbered `[DS-XXX-NNN]` rule from the 12 files
  below, keyed by `id`, with `category` for filtering. Covers spacing,
  typography, color, components/modals, css-architecture, elevation,
  iconography, layout/responsive, surfaces, tailwind-v4, accessibility, and
  animation. Query by `id` for a specific rule or by `category` for a whole
  topic — don't read a references/*.md file just to re-derive a rule statement
  that's already indexed here.
- `data/tokens.json` — the actual token *values* (spacing scale, type scale,
  easing curves, elevation shadow tiers, icon sizes, breakpoints, contrast
  minimums, touch target minimum). Rules are constraints; this file is values
  — they're deliberately separate.

**Full reference files — read these when you need the accompanying code
examples, `tsx`/CSS snippets, and "why" explanation for a topic you're
building fresh, not just the bare rule text:**

| File | Read this when you're working on... | Rule prefix |
|---|---|---|
| `references/spacing.md` | Any padding, margin, or gap value | `[DS-SPACING]` |
| `references/typography.md` | Headings, body text, type scale, fonts, copy punctuation | `[DS-TYPOGRAPHY]` |
| `references/color.md` | Color tokens, OKLCH, dark mode, light-dark() | `[DS-COLOR]` |
| `references/components.md` | Component variants, cva, modals/dialogs, accordions | `[DS-COMPONENT]` `[DS-MODAL]` |
| `references/surfaces.md` | Border radius, optical alignment, shadows vs. borders, image outlines, enter/exit choreography, icon transitions | `[DS-SURFACE]` |
| `references/elevation.md` | Shadow/elevation tiers, modal scrim, z-index pairing | `[DS-ELEVATION]` |
| `references/iconography.md` | Icon sizing, stroke width | `[DS-ICON]` |
| `references/layout-and-responsive.md` | Viewport height units, content-visibility, breakpoints | `[DS-LAYOUT]` `[DS-RESPONSIVE]` |
| `references/tailwind-v4.md` | Tailwind v3→v4 migration, container queries, arbitrary values | `[DS-TAILWIND]` |
| `references/animation.md` | Timing, easing, reduced motion, Motion library usage | `[DS-ANIMATION]` |
| `references/accessibility.md` | Touch targets, focus states, contrast, semantic HTML | `[DS-A11Y]` |
| `references/css-architecture.md` | @theme setup, selector specificity, media queries | `[DS-CSS]` |
| `references/anti-slop.md` | Generic "AI-looking" layout/styling defaults (centered hero, AI gradient, three-card grids, eyebrow overuse) — judgment-only, not indexed in `data/vois-rules.json` by design; read the file | `[DS-SLOP]` |
| `references/hooks.md` | Setting up the automated per-edit checker, managing ignores | `[DS-HOOKS]` |

**Scoped loading:** if you only need one or two rules (e.g. vois-router sent you here for a single component decision), query `data/vois-rules.json` for those rule IDs, or read only the matching reference file plus this SKILL.md if you need the examples too. You don't need the full set for a scoped task.

---

## Pre-Submit Checklist

Run this regardless of which reference files you read — it's the universal gate before calling anything done.

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
- [ ] `will-change` only set when stutter is actually observed, only on transform/opacity/filter `[DS-ANIMATION-009]`

**Accessibility**
- [ ] All interactive elements have `:focus-visible` styles `[DS-A11Y-002]`
- [ ] No `outline: none` without a replacement `[DS-A11Y-003]`
- [ ] Touch targets minimum 44x44px `[DS-A11Y-001]`
- [ ] Contrast passes WCAG AA `[DS-A11Y-004]`
- [ ] No `div` or `span` as interactive elements without ARIA `[DS-A11Y-005]`
- [ ] All images have `alt` `[DS-A11Y-010]`
- [ ] `<fieldset>` and `<legend>` used for radio/checkbox groups `[DS-A11Y-016]`
- [ ] `<br>` not used for spacing `[DS-A11Y-012]`
- [ ] `<ul>`/`<ol>` used for lists, not stacked divs `[DS-A11Y-011]`
- [ ] `loading="lazy"` on below-the-fold images `[DS-A11Y-013]`

**Layout**
- [ ] Using `svh`/`lvh`/`dvh` not `vh` for viewport-height layouts `[DS-LAYOUT-001]`
- [ ] Long pages use `content-visibility: auto` on off-screen sections `[DS-LAYOUT-002]`
- [ ] Tested at sm, md, lg breakpoints `[DS-RESPONSIVE-002]`
- [ ] No `padding-bottom`/`margin-top` used to space siblings — use `gap` on parent `[DS-LAYOUT-COMP-001]`
- [ ] No wrapper divs that serve no layout purpose `[DS-LAYOUT-COMP-002]`
- [ ] `min-width: 0` on flex children containing text or overflow-prone content `[DS-LAYOUT-COMP-003]`
- [ ] Images with set dimensions have `object-fit` `[DS-LAYOUT-COMP-006]`
- [ ] `aspect-ratio` used instead of padding-top percentage hack `[DS-LAYOUT-COMP-005]`

**CSS**
- [ ] No `#id` selectors used for styling `[DS-CSS-002]`
- [ ] Selectors no deeper than 2 levels without a class `[DS-CSS-003]`
- [ ] Hand-authored `@media` queries use `em` not `px` `[DS-CSS-007]`

**Anti-slop** (see `references/anti-slop.md` — read it before flagging; several are dial-gated)
- [ ] No centered-everything default above `VARIANCE 4` `[DS-SLOP-001]`
- [ ] No purple/indigo→blue "AI gradient" as a default `[DS-SLOP-002]`
- [ ] Feature groups aren't three identical cards in a row `[DS-SLOP-003]`
- [ ] Eyebrows capped at ~1 per 3 sections `[DS-SLOP-004]`
- [ ] No emoji standing in for real icons `[DS-SLOP-005]`
- [ ] No more than 2 consecutive zigzag sections `[DS-SLOP-006]`
- [ ] No spec-sheet table on a marketing surface `[DS-SLOP-007]`
- [ ] Page has some change in pace, not uniform top to bottom `[DS-SLOP-008]`
- [ ] Em-dash density appropriate to context — righter owns prose `[DS-SLOP-009]`

---

## Quick Reference

| Situation | What to do | Full detail |
|-----------|------------|---|
| Need a component | Check manifest first | `references/components.md` |
| Nesting rounded elements | `outerRadius = innerRadius + padding` | `references/surfaces.md` |
| Icon or button looks off-center | Align optically, not geometrically | `references/surfaces.md` |
| Card/container needs depth | Layered `box-shadow`, not a border | `references/surfaces.md` |
| Image needs a subtle edge | 1px outline, pure black/white at 0.1 opacity | `references/surfaces.md` |
| Page or section entering | Split into chunks, stagger ~100ms | `references/surfaces.md` |
| Icon swapping state (play/pause, like) | scale 0.25→1 + opacity + blur, exact values | `references/surfaces.md` |
| Need a color value | Check `data/tokens.json` (`color`) first | `references/color.md` |
| Need a spacing value | Round to nearest 4 or 8 — see `data/tokens.json` (`spacing_scale`) | `references/spacing.md` |
| Need a font size | Use the type scale in `data/tokens.json` (`type_scale`) | `references/typography.md` |
| Need full-screen height | `svh` not `vh` | `references/layout-and-responsive.md` |
| Text container width | `max-width: 65ch` (`DS-TYPOGRAPHY-008`) | `references/typography.md` |
| Two colors switching with theme | `light-dark()` | `references/color.md` |
| Animating accordion height | `interpolate-size: allow-keywords` | `references/components.md` |
| Building a modal | `inert` + `overscroll-behavior` + `scrollbar-gutter` | `references/components.md` |
| Value doesn't exist in tokens | Flag it, don't invent it | — |
| Animation feels off | Check `transform-origin` and slow it down | `references/animation.md` |
| Hover on mobile | Guard with `@media (hover: hover) and (pointer: fine)` | `references/animation.md` |
| Unsure about contrast | Measure it. 4.5:1 minimum for normal text — see `data/tokens.json` (`contrast_minimums`) | `references/accessibility.md` |
| Space between two adjacent elements | `gap` on the parent, not `padding-bottom` on the first child | `references/layout-and-responsive.md` |
| Flex child text overflowing or not truncating | Add `min-width: 0` to the flex child | `references/layout-and-responsive.md` |
| Fixed-size image looks stretched | Add `object-fit: cover` or `object-fit: contain` | `references/layout-and-responsive.md` |
| 16:9 or other ratio container | `aspect-ratio: 16 / 9`, not padding-top hack | `references/layout-and-responsive.md` |
| Group of radio or checkbox inputs | Wrap in `<fieldset>` with `<legend>` | `references/accessibility.md` |
| Date or time in content | `<time datetime="...">` | `references/accessibility.md` |
| Hand-authoring a media query | Use `em` not `px` for the breakpoint value | `references/css-architecture.md` |
| Selector getting hard to override | You've gone too deep — add a class instead | `references/css-architecture.md` |
| Layout keeps landing on a centered hero | Above `VARIANCE 4`, break it — split/asymmetric/offset | `references/anti-slop.md` |
| Reaching for a purple→blue gradient | Stop — that's the AI-slop signature; use accent tokens | `references/anti-slop.md` |
| Three identical feature cards in a row | Vary sizes or use a bento/asymmetric grid | `references/anti-slop.md` |
| Every section has an uppercase eyebrow | Cap at ~1 per 3 sections | `references/anti-slop.md` |
| Done with UI work | Call `vois_record_rule_usage` with rule IDs applied, if that tool is available | — |

---

## Reviewing Existing UI

This section applies only when the task is **reviewing, auditing, or polishing existing code** against this design system — not when building something new from scratch. If you're asked to "review this component," "make this feel better," or "audit this screen for design system alignment," follow this output format.

### No-silent-changes contract

When you're editing existing UI (a redesign, refactor, or polish pass — not a
greenfield build), some things are **load-bearing outside the visual layer** and
must never be changed silently as a side effect of restyling:

- URL / route paths
- Form field `name` and `id` attributes, and API request/response field names
- Analytics event names, `data-*` tracking hooks, and test selectors (`data-testid`)
- Primary navigation labels and their destinations

These carry meaning that other systems (bookmarks, backends, dashboards, tests,
muscle memory) depend on. If a redesign *needs* to change one, surface it as an
explicit proposed change with the reason — don't fold it into a styling diff.
Restyle freely; rewrite these only on purpose and out loud.

Before editing, classify the scope of change you're making:
- **Greenfield** — no existing UI to preserve; the contract above doesn't apply yet, but starts applying to whatever you ship.
- **Preserve** — restyle/refactor only; every load-bearing identifier above must stay identical.
- **Overhaul** — structural change is in scope; load-bearing identifiers may change, but only as an explicit, called-out decision — never a silent side effect of a styling pass.

### Output Format

Present every change as a markdown table with **Before** and **After** columns, grouped under a heading per rule or category. Don't list findings as loose "Before:" / "After:" prose lines outside a table — they're harder to scan and easy to skim past.

- Include every change made, not a representative subset.
- One diff per row. Don't bundle two unrelated changes into a single row.
- Cite the specific file and property when it isn't obvious from the snippet.
- If a category was checked but nothing needed to change, omit that table entirely. Empty tables are noise, not reassurance.

### Example

```markdown
#### Concentric border radius `[DS-SURFACE-001]`
| Before | After |
| --- | --- |
| `rounded-xl` on card + `rounded-xl` on inner button (`p-2`) | `rounded-2xl` on card (`12 + 8`), `rounded-lg` on inner button |

#### Tabular numbers `[DS-TYPOGRAPHY-003]`
| Before | After |
| --- | --- |
| `<span>{count}</span>` on animated counter | `<span className="tabular-nums">{count}</span>` |

#### Scale on press `[DS-ANIMATION-008]`
| Before | After |
| --- | --- |
| `scale(0.9)` on button press | Raised to `scale(0.96)` — below `0.95` reads as exaggerated |
```

### Review Checklist

Run this for any review/audit task, regardless of which reference files the underlying build touched:

- [ ] Spacing divisible by 4 or 8, no arbitrary values
- [ ] Color uses tokens, not hardcoded hex or raw Tailwind palette
- [ ] Nested rounded elements use concentric radius
- [ ] Icons/buttons optically aligned, not just geometrically centered
- [ ] Shadows used instead of borders for depth (not dividers)
- [ ] Component manifest checked before any custom-built equivalent
- [ ] Modals have `inert`, `overscroll-behavior: contain`, `scrollbar-gutter: stable`
- [ ] Enter animations split/staggered; exits are subtler and shorter
- [ ] No `transition: all`; `will-change` only where stutter was actually observed
- [ ] Touch targets at least 44×44px; focus-visible styles present
- [ ] Headings use `text-wrap: balance`; body copy uses `text-wrap: pretty`
- [ ] Dynamic numbers use `tabular-nums`
- [ ] No AI-slop defaults — centered-everything hero, purple→blue gradient, three identical cards, eyebrow on every section (`references/anti-slop.md`)
- [ ] No load-bearing identifiers (URLs, field names, event names, nav labels) changed silently by the restyle

This checklist is deliberately a cross-section of the full pre-submit checklist above — it's what's most likely to be wrong in code that predates this design system, not an exhaustive re-walk of every rule. For a from-scratch build, use the full pre-submit checklist instead.

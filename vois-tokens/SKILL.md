---
name: vois-tokens
description: Rules and patterns for building UI with shadcn/ui, Tailwind v4, and Motion against a Vois design token set. Use when building components, pages, or any UI that should conform to the workspace design system. Covers spacing, typography, color tokens, component architecture, animation, accessibility, and modern CSS patterns.
version: 1.4.0
---

# Vois Tokens Skill

You are building UI for a design system that uses **shadcn/ui**, **Tailwind v4**, and **Motion**. This skill defines the rules, constraints, and patterns you must follow. Deviation from these rules produces inconsistent, unmaintainable UI.

This SKILL.md is the entry point. Detailed rules for each topic live in `references/` — read only the file(s) relevant to what you're building, not all of them every time.

---

## Before You Write Anything

1. Check the component manifest. If a component exists for what you need, use it. Do not build a new one.
2. Check the token reference. If a token exists for the value you need, use it. Do not hardcode anything.
3. If neither exists, flag it — don't invent values or components.
4. After completing any UI work, call `vois_record_rule_usage` with the rule IDs you applied. This feeds the self-improving design system. If you violated a rule or found a rule unclear, include it with `violated: true` or `ambiguous: true`.

---

## Reference Files

Read the file(s) that match what you're building. Each file is self-contained — you don't need to read the others to use one.

| File | Read this when you're working on... | Rule prefix |
|---|---|---|
| `references/spacing.md` | Any padding, margin, or gap value | `[DS-SPACING]` |
| `references/typography.md` | Headings, body text, type scale, fonts, copy punctuation | `[DS-TYPOGRAPHY]` |
| `references/color.md` | Color tokens, OKLCH, dark mode, light-dark() | `[DS-COLOR]` |
| `references/components.md` | Component variants, cva, modals/dialogs, accordions | `[DS-COMPONENT]` `[DS-MODAL]` |
| `references/layout-and-responsive.md` | Viewport height units, content-visibility, breakpoints | `[DS-LAYOUT]` `[DS-RESPONSIVE]` |
| `references/tailwind-v4.md` | Tailwind v3→v4 migration, container queries, arbitrary values | `[DS-TAILWIND]` |
| `references/animation.md` | Timing, easing, reduced motion, Motion library usage | `[DS-ANIMATION]` |
| `references/accessibility.md` | Touch targets, focus states, contrast, semantic HTML | `[DS-A11Y]` |
| `references/css-architecture.md` | @theme setup, selector specificity, media queries | `[DS-CSS]` |

**Scoped loading:** if you only need one or two rules (e.g. vois-router sent you here for a single component decision), read only the matching reference file plus this SKILL.md. You don't need the full set for a scoped task.

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

**Animation**
- [ ] UI animations under 300ms (large elements under 500ms) `[DS-ANIMATION-001]` `[DS-ANIMATION-002]`
- [ ] No keyboard-triggered animations `[DS-ANIMATION-003]`
- [ ] `transform-origin` set to trigger point, not center `[DS-ANIMATION-006]`
- [ ] No animations from `scale(0)` `[DS-ANIMATION-005]`
- [ ] `prefers-reduced-motion` handled `[DS-ANIMATION-004]`
- [ ] No `transition: all` `[DS-TAILWIND-005]`
- [ ] Hover effects guarded on touch devices `[DS-ANIMATION-007]`

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

---

## Quick Reference

| Situation | What to do | Full detail |
|-----------|------------|---|
| Need a component | Check manifest first | `references/components.md` |
| Need a color value | Check token list first | `references/color.md` |
| Need a spacing value | Round to nearest 4 or 8 | `references/spacing.md` |
| Need a font size | Use the type scale | `references/typography.md` |
| Need full-screen height | `svh` not `vh` | `references/layout-and-responsive.md` |
| Text container width | `max-width: 65ch` | `references/typography.md` |
| Two colors switching with theme | `light-dark()` | `references/color.md` |
| Animating accordion height | `interpolate-size: allow-keywords` | `references/components.md` |
| Building a modal | `inert` + `overscroll-behavior` + `scrollbar-gutter` | `references/components.md` |
| Value doesn't exist in tokens | Flag it, don't invent it | — |
| Animation feels off | Check `transform-origin` and slow it down | `references/animation.md` |
| Hover on mobile | Guard with `@media (hover: hover) and (pointer: fine)` | `references/animation.md` |
| Unsure about contrast | Measure it. 4.5:1 minimum for normal text | `references/accessibility.md` |
| Space between two adjacent elements | `gap` on the parent, not `padding-bottom` on the first child | `references/layout-and-responsive.md` |
| Flex child text overflowing or not truncating | Add `min-width: 0` to the flex child | `references/layout-and-responsive.md` |
| Fixed-size image looks stretched | Add `object-fit: cover` or `object-fit: contain` | `references/layout-and-responsive.md` |
| 16:9 or other ratio container | `aspect-ratio: 16 / 9`, not padding-top hack | `references/layout-and-responsive.md` |
| Group of radio or checkbox inputs | Wrap in `<fieldset>` with `<legend>` | `references/accessibility.md` |
| Date or time in content | `<time datetime="...">` | `references/accessibility.md` |
| Hand-authoring a media query | Use `em` not `px` for the breakpoint value | `references/css-architecture.md` |
| Selector getting hard to override | You've gone too deep — add a class instead | `references/css-architecture.md` |
| Done with UI work | Call `vois_record_rule_usage` with rule IDs applied | — |

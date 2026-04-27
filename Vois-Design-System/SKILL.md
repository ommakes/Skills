---
name: vois-design-system
description: Rules and patterns for building UI with shadcn/ui, Tailwind v4, and Motion against a Vois design token set. Use when building components, pages, or any UI that should conform to the workspace design system. Covers spacing, typography, color tokens, component architecture, animation, accessibility, and modern CSS patterns.
version: 1.0.0
---

# Vois Design System Skill

You are building UI for a design system that uses **shadcn/ui**, **Tailwind v4**, and **Motion**. This skill defines the rules, constraints, and patterns you must follow. Deviation from these rules produces inconsistent, unmaintainable UI.

Read this entire skill before writing any code. Do not skim it.

---

## Before You Write Anything

1. Check the component manifest. If a component exists for what you need, use it. Do not build a new one.
2. Check the token reference. If a token exists for the value you need, use it. Do not hardcode anything.
3. If neither exists, flag it — don't invent values or components.

---

## 1. Spacing

All spacing must be divisible by **4 or 8**. No exceptions.

**Allowed values:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px

```
YES  p-4 (16px)   gap-6 (24px)   mt-8 (32px)
NO   p-[11px]     gap-[14px]     mt-[25px]
```

Use `gap` for layout spacing between elements. Use padding for internal component spacing. Avoid margin for layout — it's harder to reason about and doesn't compose well with flex/grid.

**Tailwind v4 note:** Dynamic spacing utilities accept any value without arbitrary syntax. This makes it easy to accidentally use off-grid values. Don't. Stay on the scale.

Verify spacing holds at every responsive breakpoint before considering a component done.

---

## 2. Typography

### Rules

- Use **no more than 3 text styles** in any single component or section.
- Never skip heading levels. `h1` then `h2` then `h3`. Never `h1` directly to `h3`.
- Use the **monospace variant** (Geist Mono) for all numeric data — prices, counts, measurements, timestamps. Add `font-variant-numeric: tabular-nums` when numbers appear in columns or need to align.
- Font size communicates hierarchy. If two things feel equally important, one of them should be deprioritized.

### Type Scale

| Level | Class | Size | Line Height | Weight | Use |
|-------|-------|------|-------------|--------|-----|
| Page Heading | H0 | 52px desktop / 40px mobile | 64px / 56px | bold | Page title. Once per screen only. |
| Section Heading | H1 | 36px desktop / 32px mobile | 44px / 40px | semibold | Page sections |
| Feature Heading | H2 | 24px | 32px | semibold | Named items, modal titles, core actions |
| Item Heading | H3 | 18px | 26px | semibold | Key data points, navigation labels |
| Body Heading | H4 | 16px | 24px | semibold | Highlighted inline text, button labels |
| Label Heading | H5 | 14px | 20px | medium | Input labels, short descriptions (max 2 lines) |
| Caption | H6 | 12px | 16px | medium | Fine print, secondary metadata |
| Body | Body | 16px | 24px | normal | Long-form content, input field content |
| Description | Description | 14px | 20px | normal | Short descriptions in toasts, alerts, dialogs, popovers |

### Fonts

These are the default fonts. Your workspace may define different ones via typography tokens — check the token reference before assuming these apply.

| Role | Default | Token |
|------|---------|-------|
| Headings and display | Host Grotesk | `--font-heading` |
| Body and labels | Inter Tight | `--font-body` |
| Numeric and monospace | Geist Mono | `--font-mono` |

Always reference the token (`font-[var(--font-heading)]`) rather than the font name directly. If the workspace swaps the font, components update automatically without code changes.

### Fluid Type

For headings that need to scale across viewport widths — hero headings, marketing copy, page titles — use `clamp()` instead of fixed sizes with breakpoint overrides:

```css
/* Scales smoothly from 1rem minimum to 2rem maximum */
font-size: clamp(1rem, 2vw + 0.5rem, 2rem);
```

Use this for H0 and H1 in hero sections or anywhere text needs to adapt to screen size. Don't use it for body text in application UI — fixed sizes with responsive breakpoints are more predictable there.

### Text Wrapping

```css
/* Headings: prevents uneven line breaks and short last lines */
text-wrap: balance;

/* Body text in articles and long-form content: prevents orphaned single words */
text-wrap: pretty;
```

Apply `text-wrap: balance` to all headings (H0 through H3) by default. Apply `text-wrap: pretty` to body copy in articles, descriptions, and anywhere text wraps across multiple lines.

### Readable Line Length

Cap text containers at `65ch`. The `ch` unit is relative to the current font's character width, so this stays readable at any font size:

```css
.prose,
.description,
.body-text {
  max-width: 65ch;
}
```

Do not use `max-width: 600px` or similar fixed widths for text containers — they break at different font sizes.

### Text Truncation

Use `line-clamp` to cap text to a fixed number of lines without JavaScript measurement or manual character counting:

```css
.card-description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

The `-webkit-` prefix is still required for cross-browser support. The un-prefixed `line-clamp` property is not yet universally supported — use the `-webkit-box` pattern above.

Never truncate with JavaScript `substring` or character limits — they break at different font sizes, languages, and zoom levels.

### Copy and Punctuation

These details matter. Agents get them wrong by default.

- Use `…` (the ellipsis character), not `...` (three periods)
- Use curly quotes `"` `"` not straight `"`
- Use non-breaking spaces for units and brand names: `10&nbsp;MB`, `5&nbsp;GB`, `⌘&nbsp;K`
- Loading states end with ellipsis character: `"Loading…"` not `"Loading..."`
- Active voice: "Save changes" not "Changes will be saved"
- Specific button labels: "Delete project" not "Confirm" or "OK"
- Error messages tell the user what to do next, not just what went wrong

---

## 3. Color

### Rules

- **Never hardcode hex values.** Use CSS tokens.
- **Never use Tailwind's built-in color palette** (`blue-500`, `red-400`, etc.) if a token exists for it. The token is always preferred.
- **Color cannot be the only signal.** Error states, success states, warnings — always pair color with an icon, label, or text. Never rely on color alone.
- **60/30/10 distribution:** roughly 60% neutral, 30% complementary/secondary, 10% accent/brand. This prevents visual stress and keeps hierarchy clear.
- Decorative icons that add no information get `aria-hidden="true"`. Don't let screen readers announce them.

### OKLCH

Tailwind v4 uses OKLCH for color definitions. Use it.

```css
@theme {
  --color-primary: oklch(0.637 0.237 259.4);
  --color-primary-foreground: oklch(1 0 0);
}
```

OKLCH produces perceptually uniform colors. Lighter values are actually lighter, not just numerically higher. This matters for building accessible color scales that hold up across light and dark mode.

### Dark Mode with light-dark()

Dark mode is implemented via `@custom-variant dark (&:is(.dark *))`. Every color token must have a dark mode value.

Use the `light-dark()` CSS function for cleaner inline color switching:

```css
/* Requires color-scheme to be set on a parent */
html {
  color-scheme: light dark;
}

/* Then use light-dark() anywhere */
.element {
  color: light-dark(oklch(0.145 0 0), oklch(0.985 0 0));
  background: light-dark(var(--color-surface), var(--color-surface-dark));
}
```

This is cleaner than duplicating rules under a `.dark` selector for simple two-value swaps. For complex component variants, stick with the dark: modifier.

Before shipping any component, verify both light and dark mode manually.

---

## 4. Components

### Rules

- **Check the manifest first.** If `<Button>`, `<AlertBanner>`, or `<DataTable>` exists, use it. Don't rebuild it.
- Use **Class Variance Authority (cva)** for all variant styling. No ad-hoc className ternaries.
- Use `data-slot` attributes for styling component internals — don't reach into component children with arbitrary CSS selectors.
- **New-York style** is the default for shadcn. The "default" style is deprecated.
- Components use a 2-layer architecture: Radix UI for structure/behavior, Tailwind for style. Don't collapse these.

### Component Variants

When using a component with variants, use the most semantically appropriate variant. Don't default to `default` when `destructive`, `ghost`, or `outline` is more correct.

When building a new component:

```tsx
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### Modals and Dialogs

Modals require specific patterns. Don't skip these.

**Trap focus using `inert`.** When a modal opens, add `inert` to all content outside the modal. This blocks keyboard and screen reader access to background content without manual focus trapping:

```tsx
// When modal opens
document.getElementById('app-root').setAttribute('inert', '')

// When modal closes
document.getElementById('app-root').removeAttribute('inert')
```

Radix UI Dialog handles this automatically. If you're not using Radix, implement it manually.

**Prevent scroll bleed.** Add `overscroll-behavior: contain` to the modal's scrollable container so scrolling inside doesn't scroll the page behind it:

```css
.modal-content {
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

**Prevent layout shift.** When a modal opens and the page scrollbar disappears, the layout jumps. Fix it with `scrollbar-gutter` on `html`:

```css
html {
  scrollbar-gutter: stable;
}
```

This reserves space for the scrollbar even when it isn't visible.

### Accordions

Use `interpolate-size: allow-keywords` to animate height from `0` to `auto` without JavaScript measurement:

```css
.accordion-content {
  interpolate-size: allow-keywords;
  height: 0;
  overflow: hidden;
  transition: height 250ms var(--ease-out-quart);
}

.accordion-content[data-open] {
  height: auto;
}
```

This replaces the pattern of measuring scrollHeight in JavaScript and animating to a pixel value.

### Images

Use `object-view-box` for native CSS image cropping instead of `overflow: hidden` wrapper hacks or `clip-path`:

```css
.avatar {
  width: 80px;
  height: 80px;
  object-fit: cover;
  /* Crop to the center-top of the image — values are fractions of the image */
  object-view-box: inset(0% 10% 20% 10%);
}
```

The `inset()` values follow the same top/right/bottom/left shorthand as `margin`. This is especially useful for headshots and product images that need consistent framing without asking authors to pre-crop assets.

### Textareas

Use `field-sizing: content` on `<textarea>` elements to make them grow with the user's input without JavaScript resize listeners:

```css
textarea {
  field-sizing: content;
  min-height: 2.5rem;   /* prevents collapse when empty */
  max-height: 20rem;    /* optional cap to prevent infinite growth */
  resize: none;         /* no manual resize handle needed */
}
```

**Browser support:** Chrome 123+, Edge 123+. Firefox and Safari do not yet support this. Provide a JS fallback or accept the fixed-height behavior as a progressive enhancement.

---

## 5. Layout and Viewport

### Viewport Height Units

Stop using `vh`. It breaks on mobile because browser chrome changes the available height as you scroll. Use the right unit for the context:

| Unit | What it means | Use for |
|------|--------------|---------|
| `svh` | Small viewport height — assumes maximum browser chrome visible | Hero sections, modals, anything that must fit on first load |
| `lvh` | Large viewport height — assumes minimum browser chrome | Full-screen backgrounds, decorative elements that can extend under chrome |
| `dvh` | Dynamic viewport height — updates as chrome appears/disappears | Interfaces that should resize as mobile keyboard or nav appears |

```css
/* Hero that fits even with address bar showing */
.hero { min-height: 100svh; }

/* Background that fills generously */
.bg-cover { height: 100lvh; }

/* Chat interface that resizes as mobile keyboard appears */
.chat-container { height: 100dvh; }
```

Default to `svh` for anything that needs to fit on screen. Only reach for `dvh` when you specifically need the layout to respond to browser chrome changes.

### Performance on Long Pages

For pages with significant vertical scroll, use `content-visibility: auto` on sections that are far below the fold to skip rendering them until they approach the viewport:

```css
.page-section {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px; /* estimated height prevents scroll jump */
}
```

Don't apply this to sections visible on initial load.

---

## 6. Tailwind v4

### Key Changes from v3

Replace `@layer base` with `@theme`:

```css
/* v3 — don't do this */
@layer base {
  :root { --background: 0 0% 100%; }
}

/* v4 — do this */
@theme {
  --color-background: oklch(1 0 0);
}
```

Use `@import "tailwindcss"` instead of `@tailwind base / components / utilities`.

### Rules

- Container queries are built in. No plugins needed. Use `@container` and `@min-` / `@max-` variants for component-level responsiveness.
- The `hover:` modifier in v4 only applies when the input device supports hover. You don't need to manually guard hover effects — but verify on touch devices.
- Arbitrary values (`w-[237px]`, `mt-[13px]`) are a smell. If you need an arbitrary value, either it belongs on the spacing scale or it's a missing token. Round it or flag it.
- No `!important` except for utility overrides you explicitly own and document.
- Never `transition: all`. List properties explicitly: `transition: background-color 150ms ease-out, transform 150ms ease-out`.

---

## 7. Animation

### Timing Rules

- **UI animations:** under `300ms` as a default.
- **Large elements** (drawers, action sheets, modals entering): up to `500ms`.
- **Never animate keyboard-triggered interactions.** Repeated actions feel slower when animated. Keyboard users feel this.

### Reduced Motion

Always respect `prefers-reduced-motion`. Users who set this have real reasons — vestibular disorders, epilepsy, motion sensitivity.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

In Motion:

```tsx
import { useReducedMotion } from "motion/react"

const shouldReduce = useReducedMotion()

<motion.div
  animate={{ opacity: 1, y: shouldReduce ? 0 : -10 }}
  transition={{ duration: shouldReduce ? 0 : 0.3 }}
/>
```

### Easing Rules

| Easing | When to use |
|--------|-------------|
| `ease-out` | Button clicks, taps, component interactions |
| `ease-in-out` | Elements that change state while staying on screen (progress bars, toggles) |
| `linear` | Constant-speed loops only — marquees, spinners, hold-to-delete |
| `ease` | Subtle ambient animations — toasts, notifications |

Custom easing curves (Benjamin De Cock, used in Linear):

```css
:root {
  --ease-out-quart: cubic-bezier(.165, .84, .44, 1);
  --ease-out-quint: cubic-bezier(.23, 1, .32, 1);
  --ease-out-expo: cubic-bezier(.19, 1, .22, 1);
  --ease-in-out-quart: cubic-bezier(.77, 0, .175, 1);
  --ease-in-out-quint: cubic-bezier(.86, 0, .07, 1);
  --ease-in-out-expo: cubic-bezier(1, 0, 0, 1);
}
```

### Scale and Origin

- **Never animate from `scale(0)`.** Start at `0.9` or higher. Zero-scale animations feel mechanical.
- **Set `transform-origin` to the trigger point.** A dropdown expands from the button that opened it. A tooltip appears from the element it describes. The default `center` is wrong in most cases.

```css
.dropdown {
  transform-origin: top center;
  animation: expand 200ms var(--ease-out-quint);
}
```

### Touch and Hover

Tailwind v4's `hover:` only fires on devices that support hover. If writing raw CSS:

```css
@media (hover: hover) and (pointer: fine) {
  .card:hover { transform: scale(1.02); }
}
```

### Tooltips

- First appearance: slight delay before showing (prevents accidental activation).
- Moving between tooltips: no delay, no animation.

### Button Press

```css
button:active {
  transform: scale(0.97);
  transition: transform 150ms ease-out;
}
```

### Using Motion

```tsx
import { motion } from "motion/react"

<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.2, ease: [0.165, 0.84, 0.44, 1] }}
>
  {children}
</motion.div>
```

No bounce by default. Spring animations are native iOS patterns, not standard web UI.

---

## 8. Accessibility

These are not optional.

### Touch Targets

Minimum touch target: **44x44px**. If the visual element is smaller, expand the hit area with a pseudo-element:

```css
.icon-button {
  position: relative;
}

.icon-button::after {
  content: '';
  position: absolute;
  inset: -10px;
}
```

### Focus States

Three focus pseudo-classes. Know when to use each one.

**`:focus-visible`** — triggers only when the browser determines a visible focus indicator is needed. This covers keyboard navigation and assistive technology, but not mouse clicks. Use this for focus rings on buttons and links:

```css
:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
```

**`:focus-within`** — triggers when an element or any of its children has focus. Use this to style entire form sections when a user focuses on an input inside:

```css
.form-field:focus-within {
  border-color: var(--color-border-focus);
}
```

**`:focus`** — triggers on any focus, including mouse clicks. Avoid using this for visual rings. Only reach for it when you need to respond to all focus events regardless of input method.

Never remove `outline` without providing a `:focus-visible` replacement.

### Contrast

| Text type | Minimum ratio |
|-----------|---------------|
| Normal text (under 18px regular, under 14px bold) | 4.5:1 |
| Large text (18px+ regular, 14px+ bold) | 3:1 |
| UI components and graphical objects | 3:1 |

### Semantic HTML

- `<button>` for actions. `<a>` for navigation. Not `<div onClick>`.
- Form inputs need associated `<label>` elements, not just placeholder text.
- Icon-only buttons need `aria-label`.
- Decorative icons need `aria-hidden="true"`.
- Error messages need `aria-live="polite"` or `role="alert"`.
- Images need `alt`. Decorative images get `alt=""`, not a missing alt attribute.

### Color and Meaning

Never use color as the only signal for state. Error, success, and warning states always need a secondary indicator — an icon, a text label, or both.

---

## 9. Responsive Behavior

- **Mobile-first.** No prefix = mobile baseline. `md:`, `lg:` are progressive enhancements.
- Test at `sm` (640px), `md` (768px), `lg` (1024px) before considering a component done.
- Use **container queries** for component-level responsiveness. Use **breakpoints** for layout-level responsiveness.
- Touch targets, font sizes, and contrast ratios must meet minimums at every breakpoint.
- Don't build desktop-first and assume it'll work on mobile. It won't.

---

## 10. CSS Architecture

```css
/* Import */
@import "tailwindcss";

/* Token definitions */
@theme {
  --color-primary: oklch(...);
  --color-background: oklch(...);
  --radius-md: 0.5rem;
  --space-component-sm: 0.5rem;
}

/* Global base */
html {
  color-scheme: light dark;       /* enables light-dark() function */
  scrollbar-gutter: stable;       /* prevents layout shift on modal open */
}

/* Dark mode variant */
@custom-variant dark (&:is(.dark *));

/* Component overrides */
@layer components {
  /* Only things that genuinely can't be done with utilities */
}
```

No inline styles for values that have token equivalents.

### Selector Patterns

Use `:has()` to style a parent or sibling based on its descendants — the "parent selector" CSS never had until now. This replaces most patterns that previously required JavaScript class toggling:

```css
/* Style a form field wrapper when its input is invalid */
.form-field:has(input:invalid) {
  border-color: var(--color-destructive);
}

/* Style a card differently when it contains a checked radio */
.option-card:has(input[type="radio"]:checked) {
  background: var(--color-surface-selected);
  border-color: var(--color-primary);
}

/* Show a label only when a sibling input has a value */
.input-wrapper:has(input:not(:placeholder-shown)) .floating-label {
  transform: translateY(-100%);
  font-size: 0.75rem;
}

/* Target the next sibling of an element with :has() + combinators */
.nav-item:has(> .active) + .nav-item {
  border-left: 2px solid var(--color-border);
}
```

Prefer `:has()` over JavaScript class manipulation for state-driven style changes. It keeps styling in CSS where it belongs and avoids layout thrash from JS-driven class toggling.

---

## 11. Pre-Submit Checklist

**Spacing**
- [ ] All spacing values divisible by 4 or 8
- [ ] No arbitrary spacing values
- [ ] Consistent at all tested breakpoints

**Typography**
- [ ] No more than 3 text styles in any component
- [ ] Heading levels sequential, none skipped
- [ ] Numeric data uses monospace with `tabular-nums`
- [ ] Headings have `text-wrap: balance`
- [ ] Body copy has `text-wrap: pretty`
- [ ] Text containers have `max-width: 65ch`
- [ ] Ellipsis is `…` not `...`
- [ ] Quotes are curly, not straight

**Color**
- [ ] No hardcoded hex values
- [ ] No raw Tailwind palette classes where tokens exist
- [ ] Both light and dark mode verified manually
- [ ] Color is not the only signal for error/success/warning
- [ ] Decorative icons have `aria-hidden="true"`

**Components**
- [ ] Checked component manifest before building anything new
- [ ] Variants used semantically, not just defaulted
- [ ] cva used for variant logic
- [ ] Modals use `inert` on background content
- [ ] Modals have `overscroll-behavior: contain`
- [ ] `scrollbar-gutter: stable` on `html`
- [ ] Image crops use `object-view-box`, not `overflow: hidden` wrapper hacks
- [ ] Auto-growing textareas use `field-sizing: content` (with fallback awareness)
- [ ] Text truncation uses `line-clamp`, not JavaScript substring
- [ ] Parent/sibling state styling uses `:has()`, not JS class toggling

**Animation**
- [ ] UI animations under 300ms (large elements under 500ms)
- [ ] No keyboard-triggered animations
- [ ] `transform-origin` set to trigger point, not center
- [ ] No animations from `scale(0)`
- [ ] `prefers-reduced-motion` handled
- [ ] No `transition: all`
- [ ] Hover effects guarded on touch devices

**Accessibility**
- [ ] All interactive elements have `:focus-visible` styles
- [ ] No `outline: none` without a replacement
- [ ] Touch targets minimum 44x44px
- [ ] Contrast passes WCAG AA
- [ ] No `div` or `span` as interactive elements without ARIA
- [ ] All images have `alt`

**Layout**
- [ ] Using `svh`/`lvh`/`dvh` not `vh` for viewport-height layouts
- [ ] Long pages use `content-visibility: auto` on off-screen sections
- [ ] Tested at sm, md, lg breakpoints

---

## Quick Reference

| Situation | What to do |
|-----------|------------|
| Need a component | Check manifest first |
| Need a color value | Check token list first |
| Need a spacing value | Round to nearest 4 or 8 |
| Need a font size | Use the type scale |
| Need full-screen height | `svh` not `vh` |
| Text container width | `max-width: 65ch` |
| Two colors switching with theme | `light-dark()` |
| Animating accordion height | `interpolate-size: allow-keywords` |
| Building a modal | `inert` + `overscroll-behavior` + `scrollbar-gutter` |
| Value doesn't exist in tokens | Flag it, don't invent it |
| Animation feels off | Check `transform-origin` and slow it down |
| Hover on mobile | Guard with `@media (hover: hover) and (pointer: fine)` |
| Unsure about contrast | Measure it. 4.5:1 minimum for normal text |
| Truncate text to N lines | `line-clamp` — not JS substring |
| Crop an image without wrappers | `object-view-box: inset(...)` |
| Style parent based on child state | `:has()` selector |
| Auto-growing textarea | `field-sizing: content` |

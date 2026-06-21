# Surfaces and Motion Polish `[DS-SURFACE]`

Detail-level rules for nested surfaces, optical alignment, image treatment, and animation choreography. These are the things that separate "functional" from "feels considered." Read this alongside `animation.md` — that file owns timing/easing, this file owns the visual and structural rules.

---

## Concentric Border Radius `[DS-SURFACE-RADIUS]`

When nesting rounded elements, the outer radius must equal the inner radius plus the padding between them:

```
outerRadius = innerRadius + padding
```

Mismatched radii on nested elements is one of the most common things that makes UI feel off. `[DS-SURFACE-001]`

If padding between the two surfaces is larger than `24px`, treat them as independent surfaces and pick each radius on its own — forcing strict concentric math at that distance looks over-engineered, not intentional. `[DS-SURFACE-002]`

```css
/* Good — concentric */
.card { border-radius: 20px; padding: 8px; }   /* 12 + 8 */
.card-inner { border-radius: 12px; }

/* Bad — same radius on both */
.card { border-radius: 12px; padding: 8px; }
.card-inner { border-radius: 12px; }
```

```tsx
// Tailwind
<div className="rounded-2xl p-2">      {/* 16px radius, 8px padding */}
  <div className="rounded-lg">         {/* 8px = 16 - 8 ✓ */}
    ...
  </div>
</div>
```

---

## Optical Over Geometric Alignment `[DS-SURFACE-ALIGN]`

When geometric centering looks wrong, align optically instead. `[DS-SURFACE-003]`

**Buttons with text + icon:** use slightly less padding on the icon side. Rule of thumb: `icon-side padding = text-side padding - 2px`. `[DS-SURFACE-004]`

```tsx
<button className="pl-4 pr-3.5 flex items-center gap-2">
  <span>Continue</span>
  <ArrowRightIcon />
</button>
```

**Play button triangles:** the geometric center of a triangle is not its visual center. Shift right ~2px. `[DS-SURFACE-005]`

**Asymmetric icons** (stars, arrows, carets): fix the SVG's `viewBox`/path directly if possible, so no compensating margin is needed in component code. Fall back to a small margin only if you can't touch the SVG. `[DS-SURFACE-006]`

---

## Shadows Over Borders for Depth `[DS-SURFACE-SHADOW]`

For cards, containers, and bordered buttons that exist to show **depth or elevation**, prefer a layered `box-shadow` over a solid `border`. Shadows use transparency so they adapt to any background color or image; solid border colors only look right on the background they were tuned for. `[DS-SURFACE-007]`

**Do not apply this to dividers** (`border-b`, `border-t`, list separators) or anything whose job is layout separation, not depth. Those stay as borders. `[DS-SURFACE-008]`

```css
/* Light mode — three-layer shadow acting as a 1px border + lift + ambient depth */
:root {
  --shadow-border:
    0px 0px 0px 1px rgba(0, 0, 0, 0.06),
    0px 1px 2px -1px rgba(0, 0, 0, 0.06),
    0px 2px 4px 0px rgba(0, 0, 0, 0.04);
  --shadow-border-hover:
    0px 0px 0px 1px rgba(0, 0, 0, 0.08),
    0px 1px 2px -1px rgba(0, 0, 0, 0.08),
    0px 2px 4px 0px rgba(0, 0, 0, 0.06);
}

/* Dark mode — simplify to one ring, layered depth isn't visible on dark backgrounds */
.dark {
  --shadow-border: 0 0 0 1px rgba(255, 255, 255, 0.08);
  --shadow-border-hover: 0 0 0 1px rgba(255, 255, 255, 0.13);
}
```

```css
.card {
  box-shadow: var(--shadow-border);
  transition-property: box-shadow;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}
.card:hover { box-shadow: var(--shadow-border-hover); }
```

| Use shadows | Use borders |
|---|---|
| Cards, containers with depth | Dividers between list items |
| Buttons with bordered styles | Table cell boundaries |
| Elevated elements (dropdowns, modals) | Form input outlines (accessibility) |
| Elements sitting on varied/image backgrounds | Hairline separators in dense UI |

---

## Image Outlines `[DS-SURFACE-IMAGE]`

Add a subtle `1px` outline to images for consistent depth, especially in systems that already use borders/shadows elsewhere. `[DS-SURFACE-009]`

Color is non-negotiable:
- Light mode: pure black, `rgba(0, 0, 0, 0.1)`
- Dark mode: pure white, `rgba(255, 255, 255, 0.1)`
- Never use a near-black/near-white from the palette (slate-900, zinc-900, `#0a0a0a`, etc.) and never match it to the accent/ink color. A tinted outline picks up the surface color underneath and reads as dirt on the image edge. `[DS-SURFACE-010]`

```tsx
<img
  className="outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
  src={src}
  alt={alt}
/>
```

Use `outline` (not `border`) — it doesn't affect layout, and `-outline-offset-1` keeps it inset so the image stays its intended size.

---

## Enter Animations: Split and Stagger `[DS-SURFACE-ENTER]`

Don't animate one large container on enter. Split into semantic chunks (title, description, actions) and stagger with ~100ms delay between groups. For titles, splitting into individual words with ~80ms stagger reads even better, but isn't required for routine UI. `[DS-SURFACE-011]`

Combine `opacity`, `blur`, and `translateY` for the enter effect — not just opacity alone.

```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
>
  <motion.h1 variants={{
    hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  }}>
    Welcome
  </motion.h1>
  {/* repeat per chunk */}
</motion.div>
```

Use `initial={false}` on `AnimatePresence` to skip enter animations on first page load for elements already in their default state (icon swaps, tabs, toggles). Don't apply it to staged page-hero entrances that depend on the `initial` prop to fire at all — verify on a hard refresh. `[DS-SURFACE-012]`

---

## Exit Animations: Stay Subtle `[DS-SURFACE-EXIT]`

Exits should be softer than enters — the user's attention is already moving to the next thing. `[DS-SURFACE-013]`

- Use a small fixed `translateY` (e.g. `-12px`), not the full container height.
- Exit duration should be shorter than enter duration (roughly 150ms vs 300ms).
- Keep a little directional movement so it doesn't just vanish — `display: none` with no animation feels broken.
- Only use a full slide-out (`x: "-100%"`) when spatial context actually matters, like a card returning to a list.

```tsx
<motion.div
  exit={{ opacity: 0, y: -12, filter: "blur(4px)", transition: { duration: 0.15, ease: "easeIn" } }}
>
  {content}
</motion.div>
```

---

## Contextual Icon Transitions `[DS-SURFACE-ICON]`

When an icon swaps state (play→pause, like→liked, hover-revealed actions), animate `opacity` + `scale` + `blur` instead of toggling visibility. Use exactly these values — don't deviate: `[DS-SURFACE-014]`

- `scale`: `0.25` → `1` (never `0.5` or `0.6`)
- `opacity`: `0` → `1`
- `filter`: `blur(4px)` → `blur(0px)`
- Motion transition: `{ type: "spring", duration: 0.3, bounce: 0 }` — bounce is always `0`

```tsx
// Motion — check package.json for motion/framer-motion first
<AnimatePresence mode="popLayout" initial={false}>
  <motion.span
    key={isActive ? "active" : "inactive"}
    initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
    exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
    transition={{ type: "spring", duration: 0.3, bounce: 0 }}
  >
    <Icon />
  </motion.span>
</AnimatePresence>
```

If the project has no Motion dependency, don't add one just for this. Keep both icons in the DOM (one absolutely positioned over the other) and cross-fade with CSS using `cubic-bezier(0.2, 0, 0, 1)` as the spring approximation — this still gets enter and exit since neither icon ever unmounts.

| Animate | Don't animate |
|---|---|
| Icons appearing on hover (action buttons) | Static navigation icons |
| State-change icons | Decorative icons |
| Icons in contextual toolbars | Icons that are always visible |

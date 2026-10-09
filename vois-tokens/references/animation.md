# Animation `[DS-ANIMATION]`

## Timing Rules

- **UI animations:** under `300ms` as a default. `[DS-ANIMATION-001]`
- **Large elements** (drawers, action sheets, modals entering): up to `500ms`. `[DS-ANIMATION-002]`
- **Never animate keyboard-triggered interactions.** Repeated actions feel slower when animated. Keyboard users feel this. `[DS-ANIMATION-003]`

## Motion Tokens `[DS-MOTION-001]`

Timing and easing come from motion tokens. Component code never holds a literal duration, `cubic-bezier(...)` curve, or numeric easing array. `[DS-MOTION-001]`

- **Token names:** `--motion-duration-instant`, `--motion-duration-fast`, `--motion-duration-base`, `--motion-duration-slow`, `--motion-ease-standard`, `--motion-ease-emphasized`, `--motion-distance-short`. Values live in your project's token file. If the project has none, start from the file below.
- **CSS:** `transition-duration: var(--motion-duration-fast);`
- **Tailwind:** `duration-[var(--motion-duration-fast)]`
- **StyleX:** `transitionDuration: "var(--motion-duration-fast)"`
- **Motion (JS):** import durations and easings from `motion-tokens.ts`.
- **The token file is the only place literal values may be defined.** A file named `motion-tokens.css`, `.scss`, `.ts`, or `.js` (or `_motion-tokens.scss`) may define `--motion-*` values and duration or easing objects. Usage in that file, such as a `transition` declaration, is still checked, and a file with a `transition={{...}}` JSX prop is treated as a component. `tokens.css` or `my-motion-tokens.ts` are checked like any other file.
- **Named keywords are allowed.** `ease-out` and `linear` follow the Easing Rules table below. The detector checks numbers and `cubic-bezier(...)` only.

### Starter token file

Starting points, to tune side by side in your own product. Token files are the one place literal values may be defined, so copy this to `motion-tokens.css`.

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

`--motion-distance-short` is how far a morph travels. Use one value across the project so travel feels the same everywhere. Start at 12px; 8px to 16px suits most UIs. It stays small next to the element that moves, never the full width. If the token is missing, the element does not travel.

### Tailwind v4 notes

- `--ease-*`, `--default-transition-duration` and `--default-transition-timing-function` are theme variables. Set them in `@theme` and a plain `transition`, `ease-out` and `ease-in-out` use your tokens.
- There is no `--duration-*` theme namespace. A class such as `duration-fast` generates no CSS and raises no error, so the element falls back to the default duration. Write `duration-[var(--motion-duration-fast)]`.
- Do not trust a class name. After a build, read the element's computed `transition-duration` in a browser.

## Slow Duration `[DS-MOTION-002]`

The slow duration token is for large elements only: drawers, sheets, and modals entering. It can run up to 500ms `[DS-ANIMATION-002]`. Every other UI animation stays under 300ms `[DS-ANIMATION-001]`, whichever token it uses. No detector checks this; it is a judgment call.

## Reduced Motion

Always respect `prefers-reduced-motion`. Users who set this have real reasons — vestibular disorders, epilepsy, motion sensitivity. `[DS-ANIMATION-004]`

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

## Easing Rules

| Easing | When to use |
|--------|-------------|
| `ease-out` | Button clicks, taps, component interactions |
| `ease-in-out` | Elements that change state while staying on screen (progress bars, toggles) |
| `linear` | Constant-speed loops only — marquees, spinners, hold-to-delete |
| `ease` | Subtle ambient animations — toasts, notifications |

Custom easing curves (Benjamin De Cock, used in Linear). Define these once in your motion token file, and have components reference them by name:

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

## Scale and Origin

- **Never animate from `scale(0)`.** Start at `0.9` or higher. Zero-scale animations feel mechanical. `[DS-ANIMATION-005]`
- **Set `transform-origin` to the trigger point.** A dropdown expands from the button that opened it. A tooltip appears from the element it describes. The default `center` is wrong in most cases. `[DS-ANIMATION-006]`

```css
.dropdown {
  transform-origin: top center;
  animation: expand var(--motion-duration-fast) var(--ease-out-quint);
}
```

## Touch and Hover

Guard hover effects so they don't stick on touch devices. `[DS-ANIMATION-007]`

Tailwind v4's `hover:` modifier does this automatically — it only fires on devices that support hover, no manual guard needed. If writing raw CSS, or a StyleX `:hover` pseudo-key (which has no built-in hover-capability gate), wrap it explicitly:

```css
@media (hover: hover) and (pointer: fine) {
  .card:hover { transform: scale(1.02); }
}
```

```ts
// StyleX — same guard, expressed as a pseudo-key nested inside a media condition
const styles = stylex.create({
  card: {
    "@media (hover: hover) and (pointer: fine)": {
      ":hover": { transform: "scale(1.02)" },
    },
  },
});
```

## Tooltips

- First appearance: slight delay before showing (prevents accidental activation).
- Moving between tooltips: no delay, no animation.

## Button Press `[DS-ANIMATION-008]`

Use `scale(0.96)` on press. Never go below `0.95` — anything smaller reads as exaggerated rather than tactile.

```css
button:active {
  scale: 0.96;
  transition-property: scale;
  transition-duration: var(--motion-duration-fast);
  transition-timing-function: ease-out;
}
```

```tsx
<button className="transition-transform duration-[var(--motion-duration-fast)] ease-out active:scale-[0.96]">
  Click me
</button>
```

```ts
// StyleX
const styles = stylex.create({
  button: {
    transitionProperty: "scale",
    transitionDuration: "var(--motion-duration-fast)",
    transitionTimingFunction: "ease-out",
    ":active": { scale: 0.96 },
  },
});
```

Not every button needs this. Add a `static` prop to disable it on buttons where the motion would be distracting (e.g. inside a list with frequent clicks).

## Using Motion

```tsx
import { motion } from "motion/react"

<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: motionDuration.base, ease: motionEase.standard }}
>
  {children}
</motion.div>
```

`motionDuration` and `motionEase` come from `motion-tokens.ts`. No bounce by default. Spring animations are native iOS patterns, not standard web UI.

## GPU Compositing Hints `[DS-ANIMATION-009]`

`will-change` pre-promotes an element to its own GPU layer. Without it, the browser only promotes on first animation, which can cause a one-frame stutter (most visible in Safari).

Only worth it for properties the GPU can actually composite: `transform`, `opacity`, `filter`, `clip-path`. It does nothing for `width`, `height`, `top`, `left`, `background`, `border`, `color` — those aren't GPU-compositable regardless.

```css
/* Good */
.animated-card { will-change: transform, opacity; }

/* Bad — never */
.animated-card { will-change: all; }
.animated-card { will-change: background-color, padding; } /* doesn't help */
```

Add it only when you actually notice first-frame stutter, not preemptively on every animated element — each layer costs memory.

# Animation `[DS-ANIMATION]`

## Timing Rules

- **UI animations:** under `300ms` as a default. `[DS-ANIMATION-001]`
- **Large elements** (drawers, action sheets, modals entering): up to `500ms`. `[DS-ANIMATION-002]`
- **Never animate keyboard-triggered interactions.** Repeated actions feel slower when animated. Keyboard users feel this. `[DS-ANIMATION-003]`

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

## Scale and Origin

- **Never animate from `scale(0)`.** Start at `0.9` or higher. Zero-scale animations feel mechanical. `[DS-ANIMATION-005]`
- **Set `transform-origin` to the trigger point.** A dropdown expands from the button that opened it. A tooltip appears from the element it describes. The default `center` is wrong in most cases. `[DS-ANIMATION-006]`

```css
.dropdown {
  transform-origin: top center;
  animation: expand 200ms var(--ease-out-quint);
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
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}
```

```tsx
<button className="transition-transform duration-150 ease-out active:scale-[0.96]">
  Click me
</button>
```

```ts
// StyleX
const styles = stylex.create({
  button: {
    transitionProperty: "scale",
    transitionDuration: "150ms",
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
  transition={{ duration: 0.2, ease: [0.165, 0.84, 0.44, 1] }}
>
  {children}
</motion.div>
```

No bounce by default. Spring animations are native iOS patterns, not standard web UI.

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

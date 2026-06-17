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

Tailwind v4's `hover:` only fires on devices that support hover. If writing raw CSS: `[DS-ANIMATION-007]`

```css
@media (hover: hover) and (pointer: fine) {
  .card:hover { transform: scale(1.02); }
}
```

## Tooltips

- First appearance: slight delay before showing (prevents accidental activation).
- Moving between tooltips: no delay, no animation.

## Button Press

```css
button:active {
  transform: scale(0.97);
  transition: transform 150ms ease-out;
}
```

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

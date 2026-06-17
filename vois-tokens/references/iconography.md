# Iconography `[DS-ICON]`

## Sizes

| Size | Use |
|---|---|
| 16px | Inline with body/label text, inside inputs |
| 20px | Inline with H4/H5 text, default button icon |
| 24px | Standalone icon buttons, nav items |
| 32px | Empty states, feature callouts, large standalone icons |

```tsx
<Icon name="check" className="size-4" />   {/* 16px, inline with text-sm/base */}
<Icon name="check" className="size-5" />   {/* 20px, default button icon */}
<Icon name="check" className="size-6" />   {/* 24px, standalone icon button */}
<Icon name="check" className="size-8" />   {/* 32px, empty state */}
```

Tie icon size to the text size it sits beside — never eyeball it. An icon next to `text-sm` is 16px; next to `text-base`/button label is 20px.

## Stroke Width `[DS-ICON-001]`

Use a single stroke width across the icon set — `1.5px` for the default (lucide-react/Radix Icons default). Don't mix stroke weights within the same screen; it reads as a design system bug, not a deliberate choice.

## When in Doubt `[DS-ICON-002]`

If an icon's surrounding text size doesn't map cleanly to one of the four sizes above, round to the nearest one rather than introducing an arbitrary size — same tolerance rule as spacing (`[DS-CSS-008]`).

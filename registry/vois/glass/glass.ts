// Vois frosted glass (vois-tokens DS-GLASS-001 to DS-GLASS-010). Opt-in: an opaque surface is the default.
// Class strings for three tiers, on the --glass-* tokens (Figma variables Component/Glass/* and Glass/Blur-*,
// effect styles Glass/*), from the vois-tokens item:
//   subtle    chips, badges, a hover state
//   standard  a sticky nav or toolbar, menus
//   strong    a dialog, sheet or command palette, always over the scrim
// Each one:
//   1. starts from an opaque surface (the elevation fill of its layer, with the --border-default edge), so it
//      reads with no backdrop-filter;
//   2. switches to the glass tint and edge, and adds blur and saturate, only where @supports finds backdrop-filter or its
//      -webkit- twin (Tailwind writes both properties);
//   3. goes back to the opaque fill and edge with no blur under prefers-reduced-transparency.
// Use one of these on an element that has a border width (border) and no backdrop-filter ancestor: a glass
// element inside another one blurs only what is between them (DS-GLASS-006).
// Saturate has no Figma equivalent (Figma's background blur has no saturation), so its three values live here.

// The class strings are written out in full so Tailwind's scanner finds every one. The Dropdown Menu, Dialog and
// Button carry their own copy, so they install without this file; check-registry.test.mjs keeps the copies equal.
export const glass = {
  subtle: [
    "border-[color:var(--border-default)] bg-[color:var(--elevation-surface-small)] shadow-[inset_0_1px_0_var(--glass-highlight-subtle),var(--glass-shadow-subtle)]",
    "supports-[(backdrop-filter:blur(1px))_or_(-webkit-backdrop-filter:blur(1px))]:border-[color:var(--glass-stroke-subtle)] supports-[(backdrop-filter:blur(1px))_or_(-webkit-backdrop-filter:blur(1px))]:bg-[color:var(--glass-tint-subtle)] supports-[(backdrop-filter:blur(1px))_or_(-webkit-backdrop-filter:blur(1px))]:backdrop-blur-[var(--glass-blur-subtle)] supports-[(backdrop-filter:blur(1px))_or_(-webkit-backdrop-filter:blur(1px))]:backdrop-saturate-150",
    "[@media(prefers-reduced-transparency:reduce)]:border-[color:var(--border-default)] [@media(prefers-reduced-transparency:reduce)]:bg-[color:var(--elevation-surface-small)] [@media(prefers-reduced-transparency:reduce)]:backdrop-filter-none",
  ].join(" "),
  standard: [
    "border-[color:var(--border-default)] bg-[color:var(--elevation-surface-popup)] shadow-[inset_0_1px_0_var(--glass-highlight-standard),var(--glass-shadow-standard)]",
    "supports-[(backdrop-filter:blur(1px))_or_(-webkit-backdrop-filter:blur(1px))]:border-[color:var(--glass-stroke-standard)] supports-[(backdrop-filter:blur(1px))_or_(-webkit-backdrop-filter:blur(1px))]:bg-[color:var(--glass-tint-standard)] supports-[(backdrop-filter:blur(1px))_or_(-webkit-backdrop-filter:blur(1px))]:backdrop-blur-[var(--glass-blur-standard)] supports-[(backdrop-filter:blur(1px))_or_(-webkit-backdrop-filter:blur(1px))]:backdrop-saturate-[1.6]",
    "[@media(prefers-reduced-transparency:reduce)]:border-[color:var(--border-default)] [@media(prefers-reduced-transparency:reduce)]:bg-[color:var(--elevation-surface-popup)] [@media(prefers-reduced-transparency:reduce)]:backdrop-filter-none",
  ].join(" "),
  strong: [
    "border-[color:var(--border-default)] bg-[color:var(--elevation-surface-raised)] shadow-[inset_0_1px_0_var(--glass-highlight-strong),var(--glass-shadow-strong)]",
    "supports-[(backdrop-filter:blur(1px))_or_(-webkit-backdrop-filter:blur(1px))]:border-[color:var(--glass-stroke-strong)] supports-[(backdrop-filter:blur(1px))_or_(-webkit-backdrop-filter:blur(1px))]:bg-[color:var(--glass-tint-strong)] supports-[(backdrop-filter:blur(1px))_or_(-webkit-backdrop-filter:blur(1px))]:backdrop-blur-[var(--glass-blur-strong)] supports-[(backdrop-filter:blur(1px))_or_(-webkit-backdrop-filter:blur(1px))]:backdrop-saturate-[1.8]",
    "[@media(prefers-reduced-transparency:reduce)]:border-[color:var(--border-default)] [@media(prefers-reduced-transparency:reduce)]:bg-[color:var(--elevation-surface-raised)] [@media(prefers-reduced-transparency:reduce)]:backdrop-filter-none",
  ].join(" "),
} as const

export type GlassTier = keyof typeof glass

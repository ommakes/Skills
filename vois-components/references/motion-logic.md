# Motion Logic

The specs in `motion-morphs.md` are enough to build from. This file holds the small pieces that are easy to get subtly wrong, as plain TypeScript with no dependencies. Copy it into your project and adapt it. No timing value appears in this code. Values come from the motion tokens in `vois-tokens/references/animation.md`.

## 1. Reading tokens

A missing or unreadable token means no motion (0), never an invented default. Reduced motion also means 0.

```ts
const TIME = /^(-?(?:\d+(?:\.\d+)?(?:e[+-]?\d+)?|\.\d+))(ms|s)$/i;
const CURVE = /^cubic-bezier\(\s*([^)]+)\)$/i;

export function parseCssTimeToMs(value: string): number | null {
  const m = TIME.exec(value.trim());
  if (!m) return null;
  const ms = Number(m[1]) * (m[2].toLowerCase() === "s" ? 1000 : 1);
  return Number.isFinite(ms) ? ms : null;
}

export type CubicBezier = [number, number, number, number];
export function parseCubicBezier(value: string): CubicBezier | null {
  const m = CURVE.exec(value.trim());
  if (!m) return null;
  const p = m[1].split(",").map((s) => Number(s.trim()));
  return p.length === 4 && p.every(Number.isFinite) ? (p as CubicBezier) : null;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function readToken(name: string): string | null {
  if (typeof document === "undefined") return null;
  const v = getComputedStyle(document.documentElement).getPropertyValue(`--motion-${name}`).trim();
  return v === "" ? null : v;
}

export function readMotionMs(name: string): number { // "duration-base"
  if (prefersReducedMotion()) return 0;
  const v = readToken(name);
  return v === null ? 0 : (parseCssTimeToMs(v) ?? 0);
}

export function readMotionEase(name: string): CubicBezier | null { // "ease-standard"
  const v = readToken(name);
  return v === null ? null : parseCubicBezier(v);
}
```

`--motion-distance-short` is only used in CSS (`translateY(var(--motion-distance-short))`). If it is missing the declaration is invalid and the element does not travel.

## 2. Label split (label morph)

Compare grapheme clusters, not code units. The suffix is capped by what the prefix left over, so the two never overlap.

```ts
const seg = typeof Intl !== "undefined" && "Segmenter" in Intl
  ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
const graphemes = (t: string) => seg ? Array.from(seg.segment(t), (p) => p.segment) : Array.from(t);

export function splitLabel(from: string, to: string) {
  const a = graphemes(from), b = graphemes(to);
  let prefix = 0;
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix++;
  let suffix = 0;
  while (suffix < a.length - prefix && suffix < b.length - prefix &&
         a[a.length - 1 - suffix] === b[b.length - 1 - suffix]) suffix++;
  return {
    prefix: a.slice(0, prefix).join(""),
    from: a.slice(prefix, a.length - suffix).join(""),
    to: b.slice(prefix, b.length - suffix).join(""),
    suffix: a.slice(a.length - suffix).join(""),
    morphs: prefix + suffix > 0, // false: nothing shared, so crossfade
  };
}
```

Check your port: `Save`→`Saved` gives prefix `Save`, from ``, to `d`. `Review order`→`Submit order` gives from `Review`, to `Submit`, suffix ` order`. `Continue`→`Pay $42` gives `morphs: false`. `aa`→`aaa` gives prefix `aa`, to `a`, suffix `` (no overlap).

## 3. Digit keys (number ticker)

Key each character by place value so only changed digits roll. Integer characters count from the right, fraction characters from the decimal point.

```ts
export type NumberChar = { key: string; char: string; digit: boolean };

export function keyedNumberChars(value: number, locale?: string, options?: Intl.NumberFormatOptions): NumberChar[] {
  const parts = new Intl.NumberFormat(locale, options).formatToParts(value);
  let total = 0;
  for (const p of parts) if (p.type === "integer" || p.type === "group") total += p.value.length;
  const out: NumberChar[] = [];
  let seen = 0, frac = 0;
  for (const p of parts) {
    if (p.type === "integer" || p.type === "group") {
      for (const char of p.value) {
        seen++;
        out.push({ key: `int:${total - seen}`, char, digit: p.type === "integer" });
      }
    } else if (p.type === "fraction") {
      for (const char of p.value) out.push({ key: `frac:${frac++}`, char, digit: true });
    } else {
      out.push({ key: p.type, char: p.value, digit: false }); // currency, sign, decimal: never roll
    }
  }
  return out;
}

export function changedKeys(prev: NumberChar[], next: NumberChar[]): Set<string> {
  const before = new Map(prev.map((c) => [c.key, c.char]));
  const changed = new Set<string>();
  for (const c of next) if (before.get(c.key) !== c.char) changed.add(c.key);
  return changed;
}

// Updates in the last second, including this one, are within the limit.
export const withinRateLimit = (times: number[], now: number, max: number) =>
  times.filter((t) => now - t < 1000).length <= max;
```

Check your port: `$1,240.00` has keys `currency`, `int:4`..`int:0`, `decimal`, `frac:0`, `frac:1`. Going to `$1,310.00` changes only `int:2` and `int:1`. Going from `999` to `1,000` changes all five integer keys, because the digits line up by place.

## 4. Input source (keyboard or pointer)

`directionFor` needs to know what caused the change. Track the last input once, when the module loads. Installing it on the first read misses the first keypress.

```ts
export type InputSource = "pointer" | "keyboard";

let lastInput: InputSource = "pointer";
if (typeof window !== "undefined") {
  window.addEventListener("keydown", () => { lastInput = "keyboard"; }, { capture: true, passive: true });
  window.addEventListener("pointerdown", () => { lastInput = "pointer"; }, { capture: true, passive: true });
}

// Read it at the moment the change starts: directionFor(prev, next, inputSource())
export const inputSource = (): InputSource => lastInput;
```

Check your port: before any input it is `pointer`. A click gives `pointer`. Enter in a text field gives `keyboard`, so a form submitted that way does not slide. Space on a focused button gives `keyboard`. A key press followed by a click gives `pointer`.

## 5. Plans (icon, direction, grow origin)

```ts
export function planIconChange(from: string, to: string,
    morphs: ReadonlyArray<readonly [string, string]>, reduced: boolean) {
  if (from === to || reduced) return "none" as const;
  const declared = morphs.some(([a, b]) => (a === from && b === to) || (a === to && b === from));
  return declared ? ("rotate" as const) : ("crossfade" as const);
}

// 1: later peer, enters from the right. -1: earlier peer. 0: no slide (keyboard, or no change).
export function directionFor(prev: number, next: number, source: "pointer" | "keyboard"): -1 | 0 | 1 {
  if (source === "keyboard" || prev === next) return 0;
  return next > prev ? 1 : -1;
}

type Rect = { left: number; top: number; width: number; height: number };
// Anchor centre relative to the panel's top-left, clamped inside the panel. Measure the panel
// before it is scaled, or the origin is wrong.
export function transformOriginFor(anchor: Rect, panel: Rect): string {
  const c = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
  const r = (v: number) => Math.round(v * 100) / 100;
  const x = c(anchor.left + anchor.width / 2 - panel.left, 0, panel.width);
  const y = c(anchor.top + anchor.height / 2 - panel.top, 0, panel.height);
  return `${r(x)}px ${r(y)}px`;
}
```

Check your port: `menu`↔`close` declared gives `rotate` both ways, an undeclared pair gives `crossfade`, reduced gives `none`. Direction `0→1` by pointer is `1`, `2→1` is `-1`, any keyboard move is `0`. An anchor at left 100, top 200, 40x20, over a panel at left 50, top 150, 300x120 gives `70px 60px`.

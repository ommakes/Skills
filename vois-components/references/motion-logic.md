# Motion Logic

The specs in `motion-morphs.md` are enough to build from. This file holds the small pieces that are easy to get subtly wrong, as plain TypeScript with no dependencies. `scripts/motion-logic.test.mjs` runs every code block here and checks each "Check your port" line. Copy and adapt it. No timing value appears in this code. Values come from the motion tokens in `vois-tokens/references/animation.md`.

## 1. Reading tokens

A missing or unreadable token means no motion (0), never an invented default. Reduced motion also means 0.

```ts
const TIME = /^((?:\d+(?:\.\d+)?(?:e[+-]?\d+)?|\.\d+))(ms|s)$/i;
const CURVE = /^cubic-bezier\(\s*([^)]+)\)$/i;
const NUMBER = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?$/i;

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
  const parts = m[1].split(",").map((s) => s.trim());
  // An empty segment is not 0, and x1 and x2 stay in 0 to 1, as in CSS.
  if (parts.length !== 4 || !parts.every((s) => NUMBER.test(s))) return null;
  const p = parts.map(Number);
  return p.every(Number.isFinite) && p[0] >= 0 && p[0] <= 1 && p[2] >= 0 && p[2] <= 1 ? (p as CubicBezier) : null;
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

`--motion-distance-short` is only used in CSS (`translateY(var(--motion-distance-short))`). If missing, the declaration is invalid and the element does not travel.

## 2. Label split (label morph)

Compare grapheme clusters, not code units. The suffix is capped by what the prefix left, so the two never overlap.

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

`splitLabel` is the cheap prefix and suffix check. Use `alignLabels` (section 6) to decide a morph.

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

// `times` are earlier updates, not this one. True while fewer than `max` fell in the last second.
export const withinRateLimit = (times: number[], now: number, max: number) =>
  times.filter((t) => now - t < 1000).length < max;
```

Check your port: earlier updates at 0, 400 and 900 ms: an update at 950 ms is allowed for a `max` of 4, skipped for 3. At 5000 ms it is allowed. `$1,240.00` has keys `currency`, `int:4`..`int:0`, `decimal`, `frac:0`, `frac:1`. Going to `$1,310.00` changes only `int:2` and `int:1`. Going from `999` to `1,000` changes all five integer keys, because the digits line up by place.

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

## 6. Label alignment (label morph)

Longest common subsequence of graphemes: each stays, leaves or enters. Over 48 graphemes it crossfades, because the table is quadratic and a long label should not morph anyway.

```ts
export type LabelOp = { char: string; kind: "stay" | "leave" | "enter"; from: number | null; to: number | null };
export const MAX_LABEL_GRAPHEMES = 48;

export function alignLabels(from: string, to: string): { ops: LabelOp[]; morphs: boolean } {
  const a = graphemes(from), b = graphemes(to);
  if (!a.length || !b.length || a.length > MAX_LABEL_GRAPHEMES || b.length > MAX_LABEL_GRAPHEMES) {
    return { ops: [], morphs: false };
  }
  // Same text: all stays, nothing to morph.
  if (from === to) return { ops: a.map((char, i) => ({ char, kind: "stay" as const, from: i, to: i })), morphs: false };
  const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ops: LabelOp[] = [];
  let i = 0, j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) { ops.push({ char: a[i], kind: "stay", from: i, to: j }); i++; j++; }
    else if (j >= b.length || (i < a.length && dp[i + 1][j] >= dp[i][j + 1])) { ops.push({ char: a[i], kind: "leave", from: i, to: null }); i++; }
    else { ops.push({ char: b[j], kind: "enter", from: null, to: j }); j++; }
  }
  const stays = ops.filter((o) => o.kind === "stay");
  // Two stays that are neighbours in both texts. Without one the match is scattered and reads as noise.
  const hasRun = stays.some((o, k) => k > 0 && o.from === stays[k - 1].from! + 1 && o.to === stays[k - 1].to! + 1);
  return { ops, morphs: hasRun && stays.length * 2 >= Math.min(a.length, b.length) };
}
```

Check your port: `Save`→`Saved` stays S, a, v, e and enters `d`. `Craft`→`Creative` stays C, r, a, t and morphs. `Confirm`↔`Confirm Slippage` morphs. `Continue`→`Pay $42` crossfades (nothing shared), and so does `Cancel`→`Confirm` (only `C` and `n` match, and they are not neighbours). `aa`→`aaa` stays twice and enters one `a`. An empty string or a label over 48 graphemes crossfades. Identical text gives all stays and `morphs: false` (`A` to `A` too). `👍🏽`→`👍` crossfades without splitting the modifier off the emoji.

## 7. Typed input keys

Key the integer digits of a typed number by the order they were typed, from the left, so appending a digit adds one key. The ticker's place-from-the-decimal keys would roll every digit on every keypress. Separators are keyed by group from the right, so one keeps its identity as digits arrive. The currency symbol is the caller's static prefix.

```ts
export function keyedTypedChars(raw: string, locale?: string): NumberChar[] | null {
  const m = /^(\d*)(\.(\d*))?$/.exec(raw);
  if (!m) return null; // not a number being typed: show the raw text and animate nothing
  const intDigits = m[1].replace(/^0+(?=\d)/, "") || "0";
  const parts = new Intl.NumberFormat(locale, { useGrouping: true }).formatToParts(BigInt(intDigits));
  const groups = parts.filter((p) => p.type === "group").length;
  const out: NumberChar[] = [];
  let digit = 0, group = 0;
  for (const p of parts) {
    if (p.type === "integer") for (const char of p.value) out.push({ key: `d:${digit++}`, char, digit: true });
    else if (p.type === "group") out.push({ key: `g:${groups - group++}`, char: p.value, digit: false });
  }
  if (m[2] !== undefined) {
    const point = new Intl.NumberFormat(locale).formatToParts(1.5).find((p) => p.type === "decimal")?.value ?? ".";
    out.push({ key: "decimal", char: point, digit: false });
    [...m[3]].forEach((char, i) => out.push({ key: `f:${i}`, char, digit: true }));
  }
  return out;
}

export function enterLeaveKeys(prev: NumberChar[] | null, next: NumberChar[] | null) {
  if (!prev || !next) return { entering: [], leaving: [], replaced: [] }; // unknown input animates nothing
  const before = new Map(prev.map((c) => [c.key, c.char])), after = new Map(next.map((c) => [c.key, c.char]));
  return {
    entering: next.filter((c) => !before.has(c.key)).map((c) => c.key),
    leaving: prev.filter((c) => !after.has(c.key)).map((c) => c.key),
    replaced: next.filter((c) => before.has(c.key) && before.get(c.key) !== c.char).map((c) => c.key),
  };
}
```

Check your port: in `en-US`, `1000`→`10000` enters only `d:4` and keeps `g:1`. `100`→`1000` enters `d:3` and `g:1`. Deleting reverses both. A digit changed at the same key swaps: `0`→`5` replaces `d:0`, and deleting the `2` from `1234` replaces `d:1` and `d:2` and removes `d:3` and `g:1`. `de-DE` swaps `.` and `,`. `en-IN` `1234567` is `12,34,567`. `1a` returns `null`, and a `null` side in `enterLeaveKeys` animates nothing. A 200-digit string works through `BigInt`.

## 8. Fit to width

Bad input means no scaling.

```ts
export function fitScale(contentWidth: number, containerWidth: number, min = 0.5): number {
  if (![contentWidth, containerWidth].every((n) => Number.isFinite(n) && n > 0)) return 1;
  const floor = Number.isFinite(min) && min > 0 && min <= 1 ? min : 0.5;
  return Math.min(1, Math.max(floor, containerWidth / contentWidth));
}
```

Check your port: content 200 in a container of 100 gives `0.5`, content 50 in 100 gives `1`, and a floor of `0.8` holds at `0.8`. Zero, `NaN` or negative widths give `1`. A floor of `0` or `2` falls back to `0.5`.

## 9. Series morph (chart range change)

Resample both series to the same number of points and blend between real points. A linear blend never goes outside its two points, so the morph never overshoots the data. It returns `null` when it cannot morph, and the caller crossfades.

```ts
export function resampleSeries(ys: number[], n: number): number[] {
  if (!Array.isArray(ys) || ys.length < 2 || !ys.every(Number.isFinite) || !Number.isInteger(n) || n < 2) return [];
  return Array.from({ length: n }, (_, k) => {
    const x = (k * (ys.length - 1)) / (n - 1);
    const lo = Math.floor(x), hi = Math.min(lo + 1, ys.length - 1);
    return ys[lo] + (ys[hi] - ys[lo]) * (x - lo);
  });
}

export function morphSeries(from: number[], to: number[], t: number): number[] | null {
  if (!Array.isArray(from) || !Array.isArray(to) || !Number.isFinite(t)) return null;
  const n = Math.max(from.length, to.length);
  const a = resampleSeries(from, n), b = resampleSeries(to, n);
  if (!a.length || !b.length) return null;
  const k = Math.min(1, Math.max(0, t));
  return a.map((y, i) => y + (b[i] - y) * k);
}
```

Check your port: `resampleSeries([0, 10], 3)` is `[0, 5, 10]`. At `t = 0` the morph equals the old series resampled, and at `t = 1` it equals the new one. Every value at every `t` stays between the lowest and highest value of the two series. One point, an empty series, or `NaN` returns `null`. `t` is clamped to 0 to 1.

## 10. Tray plan

Chooses how a tray changes height (the order is in `motion-tray.md`). Equal heights return `none`. Anything it cannot trust becomes an instant resize.

```ts
export type TrayPlan =
  | { approach: "none" }
  | { approach: "instant"; to: number | null } // null: use auto
  | { approach: "clip"; hold: number; clipFrom: number; clipTo: number }
  | { approach: "transform"; ratio: number };

export function trayPlan(fromHeight: number, toHeight: number, opts: { reduced: boolean; motionLayout?: boolean }): TrayPlan {
  const usable = (h: number) => Number.isFinite(h) && h > 0;
  if (!usable(fromHeight) || !usable(toHeight)) return { approach: "instant", to: usable(toHeight) ? toHeight : null };
  if (fromHeight === toHeight) return { approach: "none" };
  if (opts.reduced) return { approach: "instant", to: toHeight };
  if (opts.motionLayout) return { approach: "transform", ratio: fromHeight / toHeight }; // scaleY(ratio) to 1, content counter-scaled
  const hold = Math.max(fromHeight, toHeight);
  return { approach: "clip", hold, clipFrom: hold - fromHeight, clipTo: hold - toHeight }; // inset top, in px
}
```

Check your port: 200 to 300 gives `clip` with `hold` 300, `clipFrom` 100, `clipTo` 0, and 300 to 200 gives 0 and 100. With `motionLayout`, 200 to 300 gives a ratio near 0.667 and 300 to 200 gives 1.5. Equal heights give `none`. Reduced motion or a bad start height gives `instant` with the target. A bad target gives `instant` with `to: null`: set `height: auto`.


// Run with: node vois-components/scripts/motion-logic.test.mjs
// Runs every TypeScript block in references/motion-logic.md and checks each
// "Check your port" line. A doc edit that breaks a helper, or a claim that no
// longer matches the code, fails here. Needs Node 22.13 or newer for
// module.stripTypeScriptTypes. No other dependency.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DOC = readFileSync(join(HERE, "..", "references", "motion-logic.md"), "utf8");

// A bare window, so the input-source tracker installs its listeners the way it does in a browser.
globalThis.window = new EventTarget();

if (typeof stripTypeScriptTypes !== "function") {
  throw new Error("This test needs Node 22.13 or newer: module.stripTypeScriptTypes is missing on " + process.version);
}

const blocks = [...DOC.matchAll(/```ts\n([\s\S]*?)```/g)].map((m) => m[1]);
// Each block is stripped on its own first, so a syntax slip names its block, not the whole file.
const stripped = blocks.map((code, i) => {
  try {
    return stripTypeScriptTypes(code, { mode: "strip" });
  } catch (error) {
    throw new Error(`motion-logic.md block ${i + 1} does not strip: ${error.message}\n${code.split("\n")[0]}`);
  }
});
const source = stripped.join("\n");
const lib = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));

test("the blocks do not redeclare each other", () => {
  // Joining the blocks into one module hides a duplicate name behind a confusing import error.
  const seen = new Map();
  for (const [index, code] of blocks.entries()) {
    for (const m of code.matchAll(/^(?:export )?(?:async )?(?:function|const|let|class|type|interface)\s+([A-Za-z_$][\w$]*)/gm)) {
      if (seen.has(m[1])) assert.fail(`${m[1]} is declared in block ${seen.get(m[1])} and again in block ${index + 1}`);
      seen.set(m[1], index + 1);
    }
  }
  assert.ok(seen.size >= 30, `expected to read at least 30 declarations, read ${seen.size}`);
});

test("every exported helper in the doc reaches the module, so an export cannot be dropped silently", () => {
  const exported = [...DOC.matchAll(/^export (?:async )?(?:function|const)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
  assert.ok(exported.length >= 20, `expected at least 20 exported helpers, found ${exported.length}`);
  for (const name of exported) assert.ok(name in lib, `${name} is exported in motion-logic.md but missing from the module`);
});

test("the doc still holds every helper the specs name", () => {
  assert.ok(blocks.length >= 10, `expected at least 10 code blocks, found ${blocks.length}`);
  for (const name of [
    "parseCssTimeToMs", "parseCubicBezier", "readMotionMs", "readMotionEase", "splitLabel", "keyedNumberChars",
    "changedKeys", "withinRateLimit", "inputSource", "planIconChange", "directionFor", "transformOriginFor",
    "alignLabels", "keyedTypedChars", "enterLeaveKeys", "fitScale", "resampleSeries", "morphSeries", "trayPlan", "heightFor",
  ]) assert.equal(typeof lib[name], "function", `${name} is missing from motion-logic.md`);
});

// ---- 1. reading tokens ----

test("tokens: a missing or unreadable token means no motion", () => {
  assert.equal(lib.parseCssTimeToMs("250ms"), 250);
  assert.equal(lib.parseCssTimeToMs("0.25s"), 250);
  assert.equal(lib.parseCssTimeToMs("fast"), null);
  assert.equal(lib.parseCssTimeToMs(""), null);
  assert.deepEqual(lib.parseCubicBezier("cubic-bezier(.165, .84, .44, 1)"), [0.165, 0.84, 0.44, 1]);
  assert.equal(lib.parseCubicBezier("cubic-bezier(1, 2, 3)"), null);
  assert.equal(lib.parseCubicBezier("ease-out"), null);
  assert.equal(lib.readMotionMs("duration-base"), 0, "no document means no motion");
  assert.equal(lib.readMotionEase("ease-standard"), null);
});

test("tokens: a malformed value is unreadable, never a different value", () => {
  // An empty segment is not 0. These stay inside 0 to 1, so only the number check can reject them.
  assert.equal(lib.parseCubicBezier("cubic-bezier(.1,,.2,1)"), null);
  assert.equal(lib.parseCubicBezier("cubic-bezier(,.1,.2,.3)"), null);
  assert.equal(lib.parseCubicBezier("cubic-bezier(.1,.2,.3,)"), null);
  assert.equal(lib.parseCubicBezier("cubic-bezier(.1,.2, ,1)"), null);
  assert.equal(lib.parseCubicBezier("cubic-bezier(1,,3,4)"), null);
  assert.equal(lib.parseCubicBezier("cubic-bezier(,1,2,3)"), null);
  assert.equal(lib.parseCubicBezier("cubic-bezier(1,2,3,)"), null);
  assert.equal(lib.parseCubicBezier("cubic-bezier(1,2,3,4,)"), null);
  assert.equal(lib.parseCubicBezier("cubic-bezier(1,2,3,4,5)"), null);
  assert.equal(lib.parseCubicBezier("cubic-bezier(a,2,3,4)"), null);
  // x1 and x2 must be in 0 to 1, as in CSS. y1 and y2 may leave it.
  assert.equal(lib.parseCubicBezier("cubic-bezier(2,0,0,1)"), null);
  assert.equal(lib.parseCubicBezier("cubic-bezier(-0.1,0,0,1)"), null);
  assert.equal(lib.parseCubicBezier("cubic-bezier(0,0,1.5,1)"), null);
  assert.deepEqual(lib.parseCubicBezier("cubic-bezier(0, 0, 1, 1)"), [0, 0, 1, 1]);
  assert.deepEqual(lib.parseCubicBezier("cubic-bezier(.4, -0.5, .2, 1.5)"), [0.4, -0.5, 0.2, 1.5]);
  // A negative duration is unreadable.
  assert.equal(lib.parseCssTimeToMs("-250ms"), null);
  assert.equal(lib.parseCssTimeToMs("-0.25s"), null);
  assert.equal(lib.parseCssTimeToMs("0ms"), 0);
});

test("tokens: reduced motion and bad tokens give 0, a good token gives its value", () => {
  const saved = { matchMedia: window.matchMedia, document: globalThis.document, getComputedStyle: globalThis.getComputedStyle };
  const tokens = {
    "--motion-duration-base": "250ms",
    "--motion-duration-bad": "fast",
    "--motion-duration-negative": "-250ms",
    "--motion-ease-standard": "cubic-bezier(.165, .84, .44, 1)",
    "--motion-ease-bad": "cubic-bezier(1,,3,4)",
  };
  let reduce = false;
  window.matchMedia = () => ({ matches: reduce });
  globalThis.document = { documentElement: {} };
  globalThis.getComputedStyle = () => ({ getPropertyValue: (name) => tokens[name] ?? "" });
  try {
    assert.equal(lib.prefersReducedMotion(), false);
    assert.equal(lib.readMotionMs("duration-base"), 250);
    assert.equal(lib.readMotionMs("duration-missing"), 0);
    assert.equal(lib.readMotionMs("duration-bad"), 0);
    assert.equal(lib.readMotionMs("duration-negative"), 0);
    assert.deepEqual(lib.readMotionEase("ease-standard"), [0.165, 0.84, 0.44, 1]);
    assert.equal(lib.readMotionEase("ease-bad"), null);
    assert.equal(lib.readMotionEase("ease-missing"), null);
    reduce = true;
    assert.equal(lib.prefersReducedMotion(), true);
    assert.equal(lib.readMotionMs("duration-base"), 0, "reduced motion wins over a good token");
  } finally {
    // Put back what was there, and delete what was not, so no stub leaves an undefined property behind.
    window.matchMedia = saved.matchMedia;
    globalThis.document = saved.document;
    globalThis.getComputedStyle = saved.getComputedStyle;
    if (saved.matchMedia === undefined) delete window.matchMedia;
    if (saved.document === undefined) delete globalThis.document;
    if (saved.getComputedStyle === undefined) delete globalThis.getComputedStyle;
  }
});

// ---- 2. label split ----

test("label split: the documented cases", () => {
  assert.deepEqual(lib.splitLabel("Save", "Saved"), { prefix: "Save", from: "", to: "d", suffix: "", morphs: true });
  const r = lib.splitLabel("Review order", "Submit order");
  assert.deepEqual([r.from, r.to, r.suffix], ["Review", "Submit", " order"]);
  assert.equal(lib.splitLabel("Continue", "Pay $42").morphs, false);
  const aa = lib.splitLabel("aa", "aaa");
  assert.deepEqual([aa.prefix, aa.to, aa.suffix], ["aa", "a", ""]);
});

// ---- 3. digit keys ----

test("digit keys: the documented cases", () => {
  const usd = { style: "currency", currency: "USD" };
  const a = lib.keyedNumberChars(1240, "en-US", usd);
  assert.deepEqual(a.map((c) => c.key), ["currency", "int:4", "int:3", "int:2", "int:1", "int:0", "decimal", "frac:0", "frac:1"]);
  const b = lib.keyedNumberChars(1310, "en-US", usd);
  assert.deepEqual([...lib.changedKeys(a, b)].sort(), ["int:1", "int:2"]);
  const nine = lib.keyedNumberChars(999, "en-US");
  const thousand = lib.keyedNumberChars(1000, "en-US");
  assert.equal(lib.changedKeys(nine, thousand).size, 5, "999 to 1,000 changes all five integer keys");
  // `times` are the earlier updates. This one is the `max`th at most, so `max` earlier ones is too many.
  assert.equal(lib.withinRateLimit([0, 400, 900], 950, 2), false);
  assert.equal(lib.withinRateLimit([0, 400, 900], 950, 3), false);
  assert.equal(lib.withinRateLimit([0, 400, 900], 950, 4), true);
  assert.equal(lib.withinRateLimit([], 950, 2), true, "the first update is always allowed");
  assert.equal(lib.withinRateLimit([900], 950, 2), true, "this would be the second in the second");
  assert.equal(lib.withinRateLimit([400, 900], 950, 2), false, "this would be the third in the second");
  assert.equal(lib.withinRateLimit([0], 1000, 1), true, "an update exactly one second old is outside the window");
  assert.equal(lib.withinRateLimit([0], 5000, 2), true, "old updates fall out of the window");
});

// ---- 4. input source ----

test("input source: the documented cases", () => {
  assert.equal(lib.inputSource(), "pointer", "before any input it is pointer");
  window.dispatchEvent(new Event("keydown"));
  assert.equal(lib.inputSource(), "keyboard", "a key press, including Enter in a field, is keyboard");
  window.dispatchEvent(new Event("pointerdown"));
  assert.equal(lib.inputSource(), "pointer", "a click after a key press is pointer");
});

// ---- 5. plans ----

test("plans: icon, direction, grow origin", () => {
  const pairs = [["menu", "close"]];
  assert.equal(lib.planIconChange("menu", "close", pairs, false), "rotate");
  assert.equal(lib.planIconChange("close", "menu", pairs, false), "rotate");
  assert.equal(lib.planIconChange("menu", "play", pairs, false), "crossfade");
  assert.equal(lib.planIconChange("menu", "close", pairs, true), "none");
  assert.equal(lib.planIconChange("menu", "menu", pairs, false), "none");
  assert.equal(lib.directionFor(0, 1, "pointer"), 1);
  assert.equal(lib.directionFor(2, 1, "pointer"), -1);
  assert.equal(lib.directionFor(0, 3, "keyboard"), 0);
  assert.equal(lib.directionFor(2, 2, "pointer"), 0);
  const anchor = { left: 100, top: 200, width: 40, height: 20 };
  const panel = { left: 50, top: 150, width: 300, height: 120 };
  assert.equal(lib.transformOriginFor(anchor, panel), "70px 60px");
});

// ---- 6. label alignment ----

const graphemeCount = (t) => Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(t)).length;
const kinds = (r) => r.ops.map((o) => `${o.kind[0]}${o.char}`).join(" ");
const stays = (r) => r.ops.filter((o) => o.kind === "stay").map((o) => o.char).join("");

test("alignLabels: the documented cases", () => {
  const save = lib.alignLabels("Save", "Saved");
  assert.equal(stays(save), "Save");
  assert.deepEqual(save.ops.filter((o) => o.kind === "enter").map((o) => o.char), ["d"]);
  assert.equal(save.morphs, true);

  const craft = lib.alignLabels("Craft", "Creative");
  assert.equal(stays(craft), "Crat", "shared letters inside the word stay, not only a prefix and suffix");
  assert.equal(craft.morphs, true);

  assert.equal(lib.alignLabels("Confirm", "Confirm Slippage").morphs, true);
  assert.equal(lib.alignLabels("Confirm Slippage", "Confirm").morphs, true);
  assert.equal(lib.alignLabels("Continue", "Pay $42").morphs, false);
  assert.equal(lib.alignLabels("Cancel", "Confirm").morphs, false, "scattered matches read as noise");

  const aa = lib.alignLabels("aa", "aaa");
  assert.equal(kinds(aa), "sa sa ea");
  assert.equal(aa.morphs, true);
});

test("alignLabels: each noise guard is caught by a case only it can catch", () => {
  // Plenty of letters match, but none are neighbours in both texts. Only the run rule stops this.
  const scattered = lib.alignLabels("abc", "aXbXc");
  assert.equal(stays(scattered), "abc");
  assert.equal(scattered.morphs, false, "scattered matches crossfade even when most letters match");
  // A real run, but a tiny share of the text. Only the half rule stops this.
  const thin = lib.alignLabels("Xyabcdefgh", "Xyijklmnop");
  assert.equal(stays(thin), "Xy");
  assert.equal(thin.morphs, false, "a short shared run in long, different text crossfades");
  // And the same run in short text is a morph.
  assert.equal(lib.alignLabels("Xyab", "Xyij").morphs, true);
});

test("alignLabels: guards from the other side", () => {
  assert.equal(lib.alignLabels("", "Save").morphs, false);
  assert.equal(lib.alignLabels("Save", "").morphs, false);
  assert.equal(lib.alignLabels("a".repeat(49), "a".repeat(49)).morphs, false, "over 48 graphemes crossfades");
  assert.equal(lib.alignLabels("a".repeat(48), "a".repeat(48) + "b").morphs, false);
  // The cap is a count, not a stopwatch: 48 graphemes align, 49 do not.
  const at48 = lib.alignLabels("a".repeat(47) + "b", "a".repeat(47) + "c");
  assert.equal(at48.ops.length, 49, "48 graphemes still align");
  assert.equal(at48.morphs, true);
  const at49 = lib.alignLabels("a".repeat(48) + "b", "a".repeat(48) + "c");
  assert.deepEqual(at49, { ops: [], morphs: false }, "49 graphemes skip the table and crossfade");
  // A skin-tone emoji is one grapheme: it must never be split into its parts.
  const emoji = lib.alignLabels("👍🏽", "👍");
  assert.equal(emoji.morphs, false);
  assert.ok(emoji.ops.every((o) => o.kind !== "stay"));
  // Right-to-left text works on logical order.
  const ar = lib.alignLabels("حفظ", "حفظت");
  assert.equal(ar.morphs, true);
  assert.equal(stays(ar), "حفظ");
  // Identical text is all stays and nothing to morph, at every length. One grapheme must agree with two.
  for (const text of ["A", "Go", "Save", "a".repeat(48), "a".repeat(49), "Review the order before you pay, then confirm it"]) {
    const same = lib.alignLabels(text, text);
    assert.equal(same.ops.length, graphemeCount(text), `${text.slice(0, 6)}: one op per grapheme`);
    assert.ok(same.ops.every((o) => o.kind === "stay" && o.from === o.to), `${text.slice(0, 6)}: all stays`);
    assert.equal(same.morphs, false, `${text.slice(0, 6)}: identical text does not morph`);
  }
});

// ---- 7. typed input keys ----

const typed = (raw, loc = "en-US") => lib.keyedTypedChars(raw, loc);

test("alignLabels: a tie never lands on a scattered alignment when a contiguous one is as long", () => {
  // Both alignments keep two characters. One pairs a(0,0) with b(1,3), which are not neighbours.
  // The other pairs a(0,2) with b(1,3), a run. The run wins.
  const r = lib.alignLabels("ab", "aXab");
  assert.equal(r.morphs, true);
  assert.deepEqual(r.ops.filter((o) => o.kind === "stay").map((o) => [o.from, o.to]), [[0, 2], [1, 3]]);
  const longer = lib.alignLabels("abc", "aXabc");
  assert.equal(longer.morphs, true);
  assert.deepEqual(longer.ops.filter((o) => o.kind === "stay").map((o) => [o.from, o.to]), [[0, 2], [1, 3], [2, 4]]);
});

test("alignLabels: for any pair, the ops rebuild both texts and keep a longest common subsequence", () => {
  // A small alphabet makes ties and repeats common, which is where a greedy walk goes wrong.
  const lcs = (x, y) => {
    const t = Array.from({ length: x.length + 1 }, () => new Array(y.length + 1).fill(0));
    for (let i = x.length - 1; i >= 0; i--)
      for (let j = y.length - 1; j >= 0; j--) t[i][j] = x[i] === y[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
    return t[0][0];
  };
  let seed = 12345;
  const rand = (n) => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff), seed % n);
  const word = () => Array.from({ length: 1 + rand(9) }, () => "abc"[rand(3)]).join("");
  for (let k = 0; k < 400; k++) {
    const from = word(), to = word();
    const { ops } = lib.alignLabels(from, to);
    if (from === to) continue;
    assert.equal(ops.filter((o) => o.kind !== "enter").map((o) => o.char).join(""), from, `${from} -> ${to}: old text`);
    assert.equal(ops.filter((o) => o.kind !== "leave").map((o) => o.char).join(""), to, `${from} -> ${to}: new text`);
    assert.equal(ops.filter((o) => o.kind === "stay").length, lcs(from, to), `${from} -> ${to}: stays are a longest common subsequence`);
    // No alignment of the same length has a run that this one lacks.
    const s = ops.filter((o) => o.kind === "stay");
    const hasRun = s.some((o, i) => i > 0 && o.from === s[i - 1].from + 1 && o.to === s[i - 1].to + 1);
    const best = (() => {
      const x = [...from], y = [...to], want = lcs(from, to);
      // Try every alignment: pick which positions of each text stay. Small words keep this cheap.
      const walk = (i, j, count, prev) => {
        if (count + Math.min(x.length - i, y.length - j) < want) return false;
        if (i === x.length || j === y.length) return count === want && prev.run;
        for (let a = i; a < x.length; a++)
          for (let b = j; b < y.length; b++)
            if (x[a] === y[b] && walk(a + 1, b + 1, count + 1, { run: prev.run || (prev.a === a - 1 && prev.b === b - 1 && count > 0), a, b })) return true;
        return count === want && prev.run;
      };
      return walk(0, 0, 0, { run: false, a: -2, b: -2 });
    })();
    assert.equal(hasRun, best, `${from} -> ${to}: ${best ? "a run exists and must be found" : "no run exists"}`);
  }
});

test("keyedTypedChars: the documented cases", () => {
  const a = typed("1000"), b = typed("10000");
  assert.deepEqual(a.map((c) => c.key), ["d:0", "g:1", "d:1", "d:2", "d:3"]);
  assert.deepEqual(lib.enterLeaveKeys(a, b), { entering: ["d:4"], leaving: [], replaced: [] }, "typing a digit adds one key");
  assert.deepEqual(lib.changedKeys(lib.keyedNumberChars(1, "en-US"), lib.keyedNumberChars(1, "en-US")).size, 0);

  const c = typed("100"), d = typed("1000");
  assert.deepEqual(lib.enterLeaveKeys(c, d), { entering: ["g:1", "d:3"], leaving: [], replaced: [] }, "a new group adds its separator");
  assert.deepEqual(lib.enterLeaveKeys(d, c), { entering: [], leaving: ["g:1", "d:3"], replaced: [] }, "deleting reverses both");

  // A digit that changes at the same key must still animate. Keys alone would call it unchanged.
  assert.deepEqual(lib.enterLeaveKeys(typed("0"), typed("5")), { entering: [], leaving: [], replaced: ["d:0"] }, "0 then 5 replaces the zero");
  const mid = lib.enterLeaveKeys(typed("1234"), typed("134"));
  assert.deepEqual([mid.replaced, mid.leaving.sort()], [["d:1", "d:2"], ["d:3", "g:1"]], "deleting a middle digit replaces the ones after it, and 134 has no separator");

  const de = typed("1000.5", "de-DE");
  assert.equal(de.find((x) => x.key === "g:1").char, ".");
  assert.equal(de.find((x) => x.key === "decimal").char, ",");

  const inr = typed("1234567", "en-IN");
  assert.equal(inr.map((x) => x.char).join(""), "12,34,567");
  assert.equal(inr.filter((x) => x.key.startsWith("g:")).length, 2);

  assert.equal(typed("1a"), null);
  assert.equal(typed("1.2.3"), null);
  assert.equal(typed("-5"), null);
  assert.deepEqual(lib.enterLeaveKeys(null, typed("5")), { entering: [], leaving: [], replaced: [] }, "an unknown side animates nothing");
  assert.deepEqual(lib.enterLeaveKeys(typed("5"), null), { entering: [], leaving: [], replaced: [] });
  assert.equal(typed("").map((x) => x.char).join(""), "0");
  assert.equal(typed("1.").map((x) => x.key).join(" "), "d:0 decimal", "a trailing decimal point is shown");
  assert.equal(typed("007").map((x) => x.char).join(""), "7", "leading zeros are dropped");
  const big = typed("9".repeat(200));
  assert.equal(big.filter((x) => x.digit).length, 200);
});

// ---- 8. fit to width ----

test("fitScale: the documented cases", () => {
  assert.equal(lib.fitScale(200, 100), 0.5);
  assert.equal(lib.fitScale(50, 100), 1);
  assert.equal(lib.fitScale(1000, 100, 0.8), 0.8);
  for (const bad of [[0, 100], [100, 0], [NaN, 100], [100, NaN], [-5, 100], [100, -5], [Infinity, 100]]) {
    assert.equal(lib.fitScale(bad[0], bad[1]), 1, `bad input ${bad} means no scaling`);
  }
  assert.equal(lib.fitScale(1000, 100, 0), 0.5);
  assert.equal(lib.fitScale(1000, 100, 2), 0.5);
  assert.equal(lib.fitScale(1000, 100, NaN), 0.5);
});

// ---- 9. series morph ----

test("series morph: the documented cases", () => {
  assert.deepEqual(lib.resampleSeries([0, 10], 3), [0, 5, 10]);
  const from = [1, 5, 2, 8], to = [3, 3, 9];
  const n = 4;
  assert.deepEqual(lib.morphSeries(from, to, 0), lib.resampleSeries(from, n));
  assert.deepEqual(lib.morphSeries(from, to, 1), lib.resampleSeries(to, n));
  for (const bad of [[[1], [1, 2]], [[], [1, 2]], [[1, NaN, 3], [1, 2]], [[1, 2], [1, Infinity]]]) {
    assert.equal(lib.morphSeries(bad[0], bad[1], 0.5), null, `${JSON.stringify(bad)} crossfades`);
  }
  assert.equal(lib.morphSeries(from, to, NaN), null);
  assert.deepEqual(lib.morphSeries(from, to, -3), lib.morphSeries(from, to, 0), "t is clamped");
  assert.deepEqual(lib.morphSeries(from, to, 9), lib.morphSeries(from, to, 1), "t is clamped");
  assert.equal(lib.morphSeries(null, [1, 2], 0.5), null);
  assert.equal(lib.morphSeries("ab", [1, 2], 0.5), null);
});

test("series morph never overshoots the data", () => {
  let seed = 7;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  for (let trial = 0; trial < 300; trial++) {
    const make = () => Array.from({ length: 2 + Math.floor(rnd() * 40) }, () => rnd() * 200 - 100);
    const a = make(), b = make();
    const all = a.concat(b), lo = Math.min(...all), hi = Math.max(...all);
    for (const t of [0, 0.13, 0.5, 0.87, 1]) {
      for (const y of lib.morphSeries(a, b, t)) assert.ok(y >= lo - 1e-9 && y <= hi + 1e-9, `overshoot at t=${t}`);
    }
  }
});

// ---- 10. tray plan ----

test("trayPlan: the documented cases", () => {
  assert.deepEqual(lib.trayPlan(200, 300, { reduced: false }), { approach: "clip", hold: 300, clipFrom: 100, clipTo: 0 });
  assert.deepEqual(lib.trayPlan(300, 200, { reduced: false }), { approach: "clip", hold: 300, clipFrom: 0, clipTo: 100 });
  const grow = lib.trayPlan(200, 300, { reduced: false, motionLayout: true });
  assert.equal(grow.approach, "transform");
  assert.ok(Math.abs(grow.ratio - 2 / 3) < 1e-9);
  assert.equal(lib.trayPlan(300, 200, { reduced: false, motionLayout: true }).ratio, 1.5);
  assert.deepEqual(lib.trayPlan(250, 250, { reduced: false }), { approach: "none" });
  assert.deepEqual(lib.trayPlan(200, 300, { reduced: true }), { approach: "instant", to: 300 });
  assert.deepEqual(lib.trayPlan(0, 300, { reduced: false }), { approach: "instant", to: 300 });
  assert.deepEqual(lib.trayPlan(NaN, 300, { reduced: false }), { approach: "instant", to: 300 });
  // A target we cannot trust is never handed back as a height.
  for (const bad of [NaN, -1, 0, Infinity]) {
    assert.deepEqual(lib.trayPlan(200, bad, { reduced: false }), { approach: "instant", to: null }, `target ${bad}`);
  }
  assert.deepEqual(lib.trayPlan(NaN, NaN, { reduced: false }), { approach: "instant", to: null });
  assert.equal(lib.trayPlan(200, 300, { reduced: true, motionLayout: true }).approach, "instant", "reduced motion wins over a library");
  // `to: null` must reach the page as `auto`, never as the string "nullpx".
  assert.equal(lib.heightFor(null), "auto");
  assert.equal(lib.heightFor(250), "250px");
  assert.equal(lib.heightFor(lib.trayPlan(200, NaN, { reduced: false }).to), "auto");
  assert.equal(lib.heightFor(lib.trayPlan(200, 300, { reduced: true }).to), "300px");
});

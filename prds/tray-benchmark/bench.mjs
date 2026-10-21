// Tray resize benchmark. Runs four ways of animating a bottom container whose height
// changes between steps, under CPU throttling, in headless Chromium.
//
// Usage: node prds/tray-benchmark/bench.mjs [runsPerCell] [rows, e.g. 3,8,5] [throttles, e.g. 1,4,6]
// Needs: playwright (the global install is fine) and Chromium.
//
// It reports what a desktop Chromium can tell us: how much layout work each approach
// causes and how many frames take longer than 1.5 frames at 60 Hz. It cannot tell us how
// a mid-range phone feels. CPU throttling is a proxy, not a device.
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); }
catch { // fall back to a global install
  const globalRoot = execSync("npm root -g", { encoding: "utf8" }).trim();
  ({ chromium } = require(path.join(globalRoot, "playwright")));
}

const RUNS = Number(process.argv[2] ?? 24);
const APPROACHES = ["A-transform", "B-clip", "C-height", "D-instant"];
const ROWS = process.argv[3] ?? "3,8,5";
// The step heights come from `rows`, so the number of steps does too. One step has nothing to swap to.
const STEPS = ROWS.split(",").filter((n) => Number.isInteger(Number(n)) && Number(n) > 0).length;
if (STEPS < 2 || STEPS !== ROWS.split(",").length) {
  console.error(`rows must be two or more positive whole numbers, like 3,8,5. Got "${ROWS}".`);
  process.exit(1);
}
if (!Number.isInteger(RUNS) || RUNS < 1) {
  console.error(`runsPerCell must be a whole number of 1 or more. Got "${process.argv[2]}".`);
  process.exit(1);
}
const THROTTLES = (process.argv[4] ?? "1,4,6").split(",").map(Number);
const FRAME_BUDGET = 1000 / 60;
const here = path.dirname(fileURLToPath(import.meta.url));

const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const metric = (m, name) => m.metrics.find((x) => x.name === name)?.value ?? 0;

const browser = await chromium.launch();
const results = [];
for (const throttle of THROTTLES) {
  for (const approach of APPROACHES) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto("file://" + path.join(here, "tray.html") + "?rows=" + ROWS);
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Performance.enable");
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle });

    const layoutCounts = [], layoutMs = [], maxDelta = [], missed = [], frames = [];
    let skipped = 0;
    for (let i = 0; i < RUNS; i++) {
      const to = await page.evaluate((count) => (window.currentStep() + 1) % count, STEPS);
      const before = await cdp.send("Performance.getMetrics");
      const r = await page.evaluate(([a, t]) => window.measure(a, t), [approach, to]);
      const after = await cdp.send("Performance.getMetrics");
      layoutCounts.push(metric(after, "LayoutCount") - metric(before, "LayoutCount"));
      layoutMs.push((metric(after, "LayoutDuration") - metric(before, "LayoutDuration")) * 1000);
      const d = r.deltas.slice(2);                       // drop the first frames, they include setup
      if (d.length === 0) { skipped++; continue; }       // too short to measure: leave it out, never score it as 0 ms
      maxDelta.push(Math.max(...d));
      missed.push(d.filter((x) => x > FRAME_BUDGET * 1.5).length);
      frames.push(d.length);
    }
    results.push({
      throttle, approach,
      layouts: median(layoutCounts),
      layoutMs: +median(layoutMs).toFixed(2),
      worstFrameMs: +median(maxDelta).toFixed(1),
      missedFrames: missed.length ? +median(missed).toFixed(2) : NaN, // a median like the other columns, not a mean
      skipped,
    });
    await ctx.close();
  }
}
await browser.close();

console.log(`runs per cell: ${RUNS}, step heights differ (rows: ${ROWS}), 250 ms, 390x844 @2x, medians`);
const skippedTotal = results.reduce((n, r) => n + r.skipped, 0);
if (skippedTotal) console.log(`${skippedTotal} run(s) were too short to measure and are left out.`);
console.log("throttle  approach      layouts/swap  layout ms/swap  worst frame ms  missed frames/swap");
for (const r of results) {
  console.log(`${String(r.throttle + "x").padEnd(9)} ${r.approach.padEnd(13)} ${String(r.layouts).padEnd(13)} ${String(r.layoutMs).padEnd(15)} ${String(r.worstFrameMs).padEnd(15)} ${r.missedFrames}`);
}

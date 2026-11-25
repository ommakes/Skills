// Drives the vois-menubar story in a real browser and checks the three behaviors the item adds to Radix: Arrow Up
// opens a menu on its last item, Tab leaves the bar, and a safe triangle keeps the pointer from switching menus on
// its way to the open one. Needs the `playwright` package and a Chromium; without them the tests are skipped,
// not passed, as in vois-loop/scripts/render-check.test.mjs. It builds harness/dist, serves it on a free port, and
// stops the server at the end.
// Run: node registry/scripts/menubar.test.mjs
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const registryDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const require = createRequire(import.meta.url);
const playwright = (() => {
  for (const from of [import.meta.url, resolve(registryDir, "..", "package.json")]) {
    try { return createRequire(from)("playwright"); } catch { /* try the next place */ }
  }
  return null;
})();
const browserOk = (() => {
  if (!playwright) return false;
  const r = spawnSync(process.execPath, ["-e", "const p=require('playwright');p.chromium.launch().then(b=>b.close()).then(()=>process.exit(0),()=>process.exit(1))"], { stdio: "ignore", cwd: registryDir });
  return r.status === 0 || spawnSync(process.execPath, ["-e", "process.exit(0)"]).status === 0 && false;
})();
const skip = browserOk ? false : "playwright or its Chromium is not installed here, so the real-browser tests did not run";

let server, browser, base;

function freePort() {
  return new Promise((ok, fail) => {
    const s = createServer();
    s.once("error", fail);
    s.listen(0, "127.0.0.1", () => { const { port } = s.address(); s.close(() => ok(port)); });
  });
}

before(async () => {
  if (skip) return;
  const built = spawnSync(process.execPath, ["harness/build.mjs"], { cwd: registryDir, encoding: "utf8" });
  assert.equal(built.status, 0, built.stderr || built.stdout);
  const port = await freePort();
  server = spawn(process.execPath, ["harness/serve.mjs"], { cwd: registryDir, env: { ...process.env, PORT: String(port) }, stdio: "ignore" });
  base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  browser = await playwright.chromium.launch();
});

after(async () => {
  await browser?.close();
  server?.kill();
});

async function open() {
  const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
  await page.goto(`${base}/menubar`);
  const bar = page.locator('[data-slot="menubar"]').first();
  await bar.locator('[data-slot="menubar-trigger"]').first().waitFor();
  return { page, bar, triggers: bar.locator('[data-slot="menubar-trigger"]') };
}

test("Arrow Up on a trigger opens the menu on its last enabled item", { skip }, async () => {
  const { page, triggers } = await open();
  await triggers.nth(0).focus();
  await page.keyboard.press("ArrowUp");
  await page.waitForFunction(() => document.activeElement?.getAttribute("data-slot") === "menubar-item");
  assert.equal(await triggers.nth(0).getAttribute("data-state"), "open");
  assert.equal(await page.evaluate(() => document.activeElement?.textContent), "Close all windows");
  // Arrow Down still opens it on the first item's side, so the new key did not replace the old one.
  await page.keyboard.press("Escape");
  await triggers.nth(0).focus();
  await page.keyboard.press("ArrowDown");
  await page.waitForFunction(() => document.querySelector('[data-slot="menubar-content"]') !== null);
  assert.equal(await triggers.nth(0).getAttribute("data-state"), "open");
  await page.close();
});

test("Tab in an open menu closes it and leaves the bar, forward and back", { skip }, async () => {
  const { page, bar, triggers } = await open();
  // Open with Arrow Up so focus is inside the menu. (The File story sets onOpenAutoFocus, so Arrow Down leaves focus
  // on the trigger, and Tab there is the browser's own move, not the menu's.)
  await triggers.nth(0).focus();
  await page.keyboard.press("ArrowUp");
  await page.waitForFunction(() => document.activeElement?.getAttribute("data-slot") === "menubar-item");
  await page.keyboard.press("Tab");
  await page.waitForFunction(() => document.querySelector('[data-slot="menubar-content"]') === null);
  const inFirstBar = () => bar.evaluate((el) => el.contains(document.activeElement));
  assert.equal(await inFirstBar(), false, "focus left the bar");
  assert.equal(await page.locator('[data-slot="menubar"]').nth(1).evaluate((el) => el.contains(document.activeElement)), true, "focus went to the next tab stop, the second bar");

  // Shift+Tab from a menu in the second bar goes back before that bar, which is the first bar's trigger.
  const second = page.locator('[data-slot="menubar"]').nth(1);
  await second.locator('[data-slot="menubar-trigger"]').first().focus();
  await page.keyboard.press("ArrowUp");
  await page.waitForFunction(() => document.activeElement?.getAttribute("data-slot") === "menubar-item");
  await page.keyboard.press("Shift+Tab");
  await page.waitForFunction(() => document.querySelector('[data-slot="menubar-content"]') === null);
  assert.equal(await second.evaluate((el) => el.contains(document.activeElement)), false);
  assert.equal(await inFirstBar(), true, "Shift+Tab went to the stop before the second bar");
  await page.close();
});

// React builds "pointer enter" from the browser's pointerout on the element the pointer left (or pointerover when it
// comes from outside the window), so the page watches both and records whether a handler called preventDefault on
// any event that enters the Edit trigger. That is what the safe triangle does, and it does not depend on whether the
// menu then switches.
async function firstEditEnter(page, path) {
  await page.evaluate(() => {
    window.__over = false;
    const edit = (n) => (n instanceof Element ? n.closest('[data-slot="menubar-trigger"]') : null)?.textContent === "Edit";
    for (const type of ["pointerover", "pointerout"]) {
      document.addEventListener(type, (e) => {
        const entering = type === "pointerover" ? edit(e.target) : edit(e.relatedTarget);
        if (entering && e.defaultPrevented) window.__over = true;
      });
    }
  });
  await path();
  return page.evaluate(() => window.__over);
}

test("safe triangle: crossing the next trigger on the way to the open menu is held, a move along the bar is not", { skip }, async () => {
  const { page, triggers } = await open();
  const file = await triggers.nth(0).boundingBox();
  const edit = await triggers.nth(1).boundingBox();
  await page.mouse.move(file.x + 10, file.y + 16);
  await page.mouse.down();
  await page.mouse.up();
  await page.waitForSelector('[data-slot="menubar-content"]');
  const menu = await page.locator('[data-slot="menubar-content"]').first().boundingBox();

  const toward = await firstEditEnter(page, async () => {
    await page.mouse.move(file.x + file.width - 6, file.y + file.height - 4);
    await page.mouse.move(edit.x + 6, edit.y + edit.height - 2, { steps: 2 });
    await page.mouse.move(edit.x + 10, menu.y + 40, { steps: 6 });
  });
  assert.equal(toward, true, "heading for the menu, the enter on Edit is prevented");
  assert.equal(await triggers.nth(0).getAttribute("data-state"), "open", "the open menu stays open");
  assert.equal(await triggers.nth(1).getAttribute("data-state"), "closed", "Edit did not take over");
  await page.close();

  const again = await open();
  const f = await again.triggers.nth(0).boundingBox();
  const e = await again.triggers.nth(1).boundingBox();
  await again.page.mouse.move(f.x + 10, f.y + 16);
  await again.page.mouse.down();
  await again.page.mouse.up();
  await again.page.waitForSelector('[data-slot="menubar-content"]');
  const along = await firstEditEnter(again.page, async () => {
    await again.page.mouse.move(f.x + f.width - 2, f.y + f.height / 2);
    await again.page.mouse.move(e.x + e.width / 2, e.y + e.height / 2, { steps: 6 });
  });
  assert.equal(along, false, "a move along the bar is not held");
  await again.page.close();
});

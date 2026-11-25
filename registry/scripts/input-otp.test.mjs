// Drives the vois-input-otp story in a real browser and checks what the item adds to the input-otp library, which
// is vois-fields FIELD-PASTE ("a one-time code field must take a pasted whole code"): separators in a paste are
// stripped, a whole code replaces what is typed, a shorter paste goes in at the caret, and a read-only code ignores
// paste. It also checks the states the story shows. Needs the `playwright` package and a Chromium; without them the
// tests are skipped, not passed. It builds harness/dist, serves it on a free port, and stops the server at the end.
// Run: node registry/scripts/input-otp.test.mjs
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
  const context = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"], viewport: { width: 900, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${base}/input-otp`);
  await page.locator("input[data-input-otp]").first().waitFor();
  const input = (name) => page.locator(`input[id^="${name}-"]`).first();
  // The characters in the slots, with a "*" after the active one, and the input's own value.
  const read = async (name) => {
    await page.waitForTimeout(120); // the active slot follows a selectionchange event
    return input(name).evaluate((el) => {
      const slots = [...el.closest("[data-input-otp-container]").querySelectorAll('[data-slot="input-otp-slot"]')];
      return { slots: slots.map((s) => (s.textContent || "").trim() + (s.dataset.active ? "*" : "")).join("|"), value: el.value };
    });
  };
  const paste = async (text) => {
    await page.evaluate((t) => navigator.clipboard.writeText(t), text);
    await page.keyboard.press("Control+V");
  };
  const clear = async () => { await page.keyboard.press("Control+A"); await page.keyboard.press("Backspace"); };
  return { page, input, read, paste, clear };
}

test("typing fills the slots, and a character the pattern rejects enters nothing", { skip }, async () => {
  const { page, input, read } = await open();
  await input("empty").click();
  assert.deepEqual(await read("empty"), { slots: "*|||||", value: "" }, "slot 1 is active on focus");
  await page.keyboard.type("98");
  assert.deepEqual(await read("empty"), { slots: "9|8|*|||", value: "98" });
  await page.keyboard.type("x");
  assert.equal((await read("empty")).value, "98", "a letter is not a digit");
  await page.close();
});

test("a pasted code with spaces or dashes is taken whole", { skip }, async () => {
  const { page, input, read, paste, clear } = await open();
  await input("empty").click();
  await paste("986 354");
  assert.equal((await read("empty")).value, "986354", "spaces are stripped");
  await clear();
  await paste("986-354");
  assert.equal((await read("empty")).value, "986354", "a dash is stripped");
  await clear();
  await paste(" 986354 ");
  assert.equal((await read("empty")).value, "986354", "the ends are trimmed");
  await page.close();
});

test("a whole code pasted over a half-filled field replaces it, and a short paste goes in at the caret", { skip }, async () => {
  const { page, input, read, paste, clear } = await open();
  await input("empty").click();
  await page.keyboard.type("98");
  await paste("354123");
  assert.equal((await read("empty")).value, "354123", "the typed 98 is replaced, not kept in front");
  await clear();
  await page.keyboard.type("98");
  await paste("76");
  assert.equal((await read("empty")).value, "9876", "a paste shorter than the code is added after the caret");
  await clear();
  await paste("98635412");
  assert.equal((await read("empty")).value, "986354", "a paste longer than the code is cut at its length");
  await page.close();
});

test("a read-only code takes focus and ignores typing and paste, and a disabled one cannot be focused", { skip }, async () => {
  const { page, input, read, paste } = await open();
  await input("readonly").click();
  assert.match((await read("readonly")).slots, /\*$/, "focus shows on the last slot, so a read-only code still shows where focus is");
  await page.keyboard.type("1");
  await paste("111111");
  assert.equal((await read("readonly")).value, "986354", "the value did not change");
  const focused = await input("disabled").evaluate((el) => { el.focus(); return document.activeElement === el; });
  assert.equal(focused, false);
  await page.close();
});

test("each state has its own look, and the error look follows aria-invalid", { skip }, async () => {
  const { page, input } = await open();
  const looks = (name) => input(name).evaluate((el) => [...el.closest("[data-input-otp-container]").querySelectorAll('[data-slot="input-otp-slot"]')].map((s) => s.dataset.look));
  assert.deepEqual(await looks("empty"), Array(6).fill("resting"));
  assert.deepEqual(await looks("filling"), ["filled", "filled", "resting", "resting", "resting", "resting"]);
  assert.deepEqual(await looks("error"), Array(6).fill("invalid"));
  assert.deepEqual(await looks("readonly"), Array(6).fill("readOnly"));
  assert.deepEqual(await looks("disabled"), Array(6).fill("disabled"));
  assert.equal(await input("error").getAttribute("aria-invalid"), "true");
  await page.close();
});

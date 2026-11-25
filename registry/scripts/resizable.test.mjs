// Drives the vois-resizable story in a real browser and checks what the item adds to react-resizable-panels: the handle as a
// named, focusable separator, dragging and the arrow keys, the minimum a panel keeps, a disabled handle that does not
// move, and the look (hover color, a focus ring from the keyboard only, the grip). Needs the `playwright` package and a
// Chromium; without them the tests are skipped, not passed.
// Run: node registry/scripts/resizable.test.mjs
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { skip, start } from "./harness-browser.mjs";

let env;
before(async () => { if (!skip) env = await start(); });
after(async () => { await env?.stop(); });

async function open() {
  const context = await env.browser.newContext({ viewport: { width: 1000, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${env.base}/resizable?theme=light`);
  const inbox = page.getByRole("separator", { name: "Resize inbox" });
  await inbox.waitFor();
  const message = page.getByRole("separator", { name: "Resize message" });
  const locked = page.getByRole("separator", { name: "Resize fixed split" });
  const width = (id) => page.locator(`[data-panel][id="${id}"]`).evaluate((el) => Math.round(el.getBoundingClientRect().width));
  const height = (id) => page.locator(`[data-panel][id="${id}"]`).evaluate((el) => Math.round(el.getBoundingClientRect().height));
  const now = (sep) => sep.evaluate((el) => Number(el.getAttribute("aria-valuenow")));
  const centre = async (sep) => { const b = await sep.boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
  return { page, inbox, message, locked, width, height, now, centre };
}

test("a handle is a named separator that takes focus and reports its value", { skip }, async () => {
  const { page, inbox, message, now } = await open();
  assert.equal(await inbox.getAttribute("aria-orientation"), "vertical", "the line between two columns is vertical");
  assert.equal(await message.getAttribute("aria-orientation"), "horizontal");
  assert.equal(await now(inbox), 30);
  assert.ok(await inbox.getAttribute("aria-controls"), "it says which panel it controls");
  await page.keyboard.press("Tab");
  assert.equal(await inbox.evaluate((el) => el === document.activeElement), true, "the first Tab reaches it");
  await page.close();
});

test("dragging moves the split, from a few pixels off the line too, and stops at the minimum", { skip }, async () => {
  const { page, inbox, width, centre } = await open();
  const before = await width("list-light");
  const at = await centre(inbox);
  await page.mouse.move(at.x + 4, at.y); // beside the 1px line, in its wider hit area
  await page.mouse.down();
  await page.mouse.move(at.x + 4 + 120, at.y, { steps: 8 });
  await page.mouse.up();
  const grown = await width("list-light");
  assert.ok(Math.abs(grown - (before + 120)) <= 2, `the panel grew by the drag (${before} to ${grown})`);
  const now = await centre(inbox);
  await page.mouse.move(now.x, now.y);
  await page.mouse.down();
  await page.mouse.move(0, now.y, { steps: 10 });
  await page.mouse.up();
  const group = await page.locator("[data-group]").first().evaluate((el) => el.getBoundingClientRect().width);
  const min = await width("list-light");
  assert.ok(Math.abs(min - group * 0.2) <= 2, `minSize 20% holds (${min} of ${group})`);
  await page.close();
});

test("the arrow keys, Home and End move a focused handle, along its own direction only", { skip }, async () => {
  const { page, inbox, message, now } = await open();
  await inbox.focus();
  const start = await now(inbox);
  await page.keyboard.press("ArrowRight");
  const right = await now(inbox);
  assert.ok(right > start, "ArrowRight grows the left panel");
  await page.keyboard.press("ArrowLeft");
  assert.equal(await now(inbox), start, "ArrowLeft takes it back");
  await page.keyboard.press("ArrowDown");
  assert.equal(await now(inbox), start, "Up and Down do nothing to a vertical line");
  await page.keyboard.press("End");
  assert.equal(await now(inbox), 70, "End goes to the largest the panel may be (the other panel keeps 30%)");
  await page.keyboard.press("Home");
  assert.equal(await now(inbox), 20, "Home goes to minSize");
  await message.focus();
  const m = await now(message);
  await page.keyboard.press("ArrowDown");
  assert.ok((await now(message)) > m, "the horizontal line answers Up and Down");
  await page.close();
});

test("a disabled handle is aria-disabled and does not move by pointer or key", { skip }, async () => {
  const { page, locked, width, now, centre } = await open();
  assert.equal(await locked.getAttribute("aria-disabled"), "true");
  const before = await width("a-light");
  const at = await centre(locked);
  await page.mouse.move(at.x, at.y);
  await page.mouse.down();
  await page.mouse.move(at.x + 80, at.y, { steps: 6 });
  await page.mouse.up();
  assert.equal(await width("a-light"), before, "the drag did nothing");
  await locked.focus();
  const v = await now(locked);
  await page.keyboard.press("ArrowRight");
  assert.equal(await now(locked), v, "and so did the key");
  assert.equal(await locked.evaluate((el) => getComputedStyle(el).cursor), "not-allowed");
  await page.close();
});

test("the line turns the active color on hover, and the ring shows from the keyboard only", { skip }, async () => {
  const { page, inbox, centre } = await open();
  const read = () => inbox.evaluate((el) => { const cs = getComputedStyle(el); return { bg: cs.backgroundColor, outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, state: el.dataset.separator }; });
  const colors = await page.evaluate(() => {
    const probe = (v) => { const d = document.createElement("div"); d.style.color = `var(${v})`; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; };
    return { rest: probe("--border-default"), active: probe("--border-state-active"), focus: probe("--border-state-focus") };
  });
  const rest = await read();
  assert.equal(rest.bg, colors.rest, "at rest the line is --border-default");
  assert.equal(rest.outlineStyle, "none");
  const at = await centre(inbox);
  await page.mouse.move(at.x, at.y);
  await page.waitForFunction(() => document.querySelector('[role=separator]').dataset.separator === "hover");
  assert.equal((await read()).bg, colors.active, "hover is --border-state-active");
  await page.mouse.click(at.x, at.y);
  assert.equal((await read()).outlineStyle, "none", "a pointer focus draws no ring");
  await page.mouse.move(5, 5);
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  const ring = await read();
  assert.equal(ring.outlineStyle, "solid", "keyboard focus draws the ring");
  assert.equal(ring.outlineWidth, "2px");
  await page.close();
});

test("withHandle draws a grip, and a handle without it draws none", { skip }, async () => {
  const { inbox, message, page } = await open();
  assert.equal(await inbox.locator("[data-slot=resizable-grip]").count(), 1);
  assert.equal(await message.locator("[data-slot=resizable-grip]").count(), 0);
  const box = await inbox.locator("[data-slot=resizable-grip]").boundingBox();
  assert.deepEqual([box.width, box.height], [12, 16]);
  await page.close();
});

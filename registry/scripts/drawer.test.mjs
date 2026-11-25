// Drives the vois-drawer story in a real browser and checks what the item adds to Vaul and Radix: the keyboard and focus
// (open, trap, Escape, focus back), a visible way out that is not a drag, drag to dismiss and snap back, the slide and the
// scrim running on the motion tokens (Vaul's own 0.5s and curve are overridden), reduced motion, a scrolling body that
// keeps its header and footer, and the side widths (DS-PANEL-006, full screen below md). Needs the `playwright` package
// and a Chromium; without them the tests are skipped, not passed.
// Run: node registry/scripts/drawer.test.mjs
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { skip, start } from "./harness-browser.mjs";

let env;
before(async () => { if (!skip) env = await start(); });
after(async () => { await env?.stop(); });

async function open({ reducedMotion = "no-preference", width = 1200, height = 800 } = {}) {
  const context = await env.browser.newContext({ viewport: { width, height }, reducedMotion });
  const page = await context.newPage();
  await page.goto(`${env.base}/drawer?theme=light`);
  await page.getByRole("button", { name: "Open bottom" }).waitFor();
  const content = page.locator("[data-slot=drawer-content]");
  const settled = async () => { await page.waitForFunction(() => document.getAnimations().length === 0, null, { timeout: 3000 }); };
  const show = async (name) => { await page.getByRole("button", { name }).click(); await content.waitFor(); await settled(); };
  return { context, page, content, show, settled };
}

test("opens from the keyboard, names itself, traps Tab, closes on Escape and gives focus back", { skip }, async () => {
  const { page, content } = await open();
  const trigger = page.getByRole("button", { name: "Open bottom" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await content.waitFor();
  const dialog = page.getByRole("dialog", { name: "Move 3 projects" });
  assert.equal(await dialog.count(), 1, "the drawer is a dialog named by its title");
  assert.ok(await dialog.getAttribute("aria-describedby"), "and described by its description");
  const inside = () => page.evaluate(() => !!document.activeElement?.closest("[data-slot=drawer-content]"));
  assert.equal(await inside(), true, "focus moved into the drawer when it opened (Vaul's autoFocus is off by default)");
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    assert.equal(await inside(), true, `Tab ${i + 1} stays inside the drawer`);
  }
  await page.keyboard.press("Escape");
  await content.waitFor({ state: "detached" });
  assert.equal(await trigger.evaluate((el) => el === document.activeElement), true, "focus is back on the trigger");
  await page.close();
});

test("the page behind is hidden from assistive technology and cannot be clicked while it is open", { skip }, async () => {
  const { page, show } = await open();
  await show("Open bottom");
  const hidden = await page.evaluate(() => {
    const trigger = [...document.querySelectorAll("button")].find((b) => b.textContent === "Open top");
    let el = trigger, ariaHidden = false;
    while (el) { if (el.getAttribute?.("aria-hidden") === "true" || el.inert) ariaHidden = true; el = el.parentElement; }
    return { ariaHidden, pointer: getComputedStyle(document.body).pointerEvents };
  });
  assert.equal(hidden.ariaHidden, true, "the trigger is aria-hidden or inert");
  assert.equal(hidden.pointer, "none", "the body takes no pointer events");
  await page.close();
});

test("the close button and a click on the scrim both close it, so dragging is never the only way out", { skip }, async () => {
  const { page, content, show } = await open();
  await show("Open bottom");
  await page.getByRole("button", { name: "Close" }).click();
  await content.waitFor({ state: "detached" });
  await show("Open bottom");
  await page.mouse.click(600, 40);
  await content.waitFor({ state: "detached" });
  await page.close();
});

test("a slow drag past a quarter of its height closes it, a slow short drag snaps back, and a quick flick closes it", { skip }, async () => {
  const { page, content, show } = await open();
  await show("Open bottom");
  const box = await content.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + 24; // the handle and header, away from the scrolling body
  const home = box.y;
  // Vaul closes on a release past 25% of the height, or a fast one (over 0.4 px per ms), so the drags below are slow
  // (under 0.4 px/ms) to test the distance alone, and the flick is fast to test the speed alone.
  const drag = async (distance, steps, pause) => {
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let i = 1; i <= steps; i++) { await page.mouse.move(x, y + (distance * i) / steps); if (pause) await page.waitForTimeout(pause); }
    await page.mouse.up();
  };
  await drag(box.height * 0.1, 10, 40);
  await page.waitForFunction((h) => Math.abs(document.querySelector("[data-slot=drawer-content]").getBoundingClientRect().y - h) < 2, home, { timeout: 3000 });
  assert.equal(await content.count(), 1, "a tenth of its height, slowly, snaps back");
  await drag(box.height * 0.1, 3, 0);
  await content.waitFor({ state: "detached", timeout: 3000 });
  await show("Open bottom");
  await drag(box.height * 0.4, 20, 40);
  await content.waitFor({ state: "detached", timeout: 3000 });
  await page.close();
});

test("the slide and the scrim use the motion tokens, not Vaul's own 0.5s", { skip }, async () => {
  const { page, content, show } = await open();
  const tokens = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return { slow: cs.getPropertyValue("--motion-duration-slow").trim(), ease: cs.getPropertyValue("--motion-ease-emphasized").trim() };
  });
  assert.equal(tokens.slow, "400ms");
  await page.getByRole("button", { name: "Open bottom" }).click();
  await content.waitFor();
  const read = () => page.evaluate(() => {
    const pick = (el) => { const cs = getComputedStyle(el); return { name: cs.animationName, duration: cs.animationDuration, timing: cs.animationTimingFunction, transition: cs.transitionDuration }; };
    return { content: pick(document.querySelector("[data-slot=drawer-content]")), overlay: pick(document.querySelector("[data-slot=drawer-overlay]")) };
  });
  const got = await read();
  assert.equal(got.content.name, "slideFromBottom", "Vaul's slide still runs");
  for (const part of [got.content, got.overlay]) {
    assert.equal(part.duration, "0.4s", "the animation lasts --motion-duration-slow");
    assert.equal(part.transition, "0.4s", "and so does the transition a drag release uses");
    assert.match(part.timing, /cubic-bezier\(0\.23, 1, 0\.32, 1\)/, "on --motion-ease-emphasized");
  }
  await page.close();
});

test("under reduced motion it appears and goes at once", { skip }, async () => {
  const { page, content } = await open({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Open bottom" }).click();
  await content.waitFor();
  const names = await page.evaluate(() => [document.querySelector("[data-slot=drawer-content]"), document.querySelector("[data-slot=drawer-overlay]")].map((el) => getComputedStyle(el).animationName));
  assert.deepEqual(names, ["none", "none"]);
  assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
  await page.keyboard.press("Escape");
  await content.waitFor({ state: "detached", timeout: 300 });
  await page.close();
});

test("a tall body scrolls inside the drawer and keeps the header and footer in view", { skip }, async () => {
  const { page, content, show } = await open({ height: 500 });
  await show("Open bottom");
  const body = page.locator("[data-slot=drawer-body]");
  const css = await body.evaluate((el) => { const cs = getComputedStyle(el); return { overflowY: cs.overflowY, overscroll: cs.overscrollBehaviorY, scrolls: el.scrollHeight > el.clientHeight }; });
  assert.deepEqual(css, { overflowY: "auto", overscroll: "contain", scrolls: true });
  const before = { header: await page.locator("[data-slot=drawer-header]").boundingBox(), footer: await page.locator("[data-slot=drawer-footer]").boundingBox() };
  await body.evaluate((el) => { el.scrollTop = el.scrollHeight; });
  const after = { header: await page.locator("[data-slot=drawer-header]").boundingBox(), footer: await page.locator("[data-slot=drawer-footer]").boundingBox() };
  assert.deepEqual(after, before, "header and footer did not move");
  const box = await content.boundingBox();
  assert.ok(box.height <= 500 * 0.9 + 1, "a bottom drawer is at most 90dvh tall");
  assert.ok(after.footer.y + after.footer.height <= 500, "the footer is on screen");
  assert.equal(await page.evaluate(() => document.scrollingElement.scrollTop), 0, "the page did not scroll");
  await page.close();
});

test("a side drawer takes the tier width, docks to its edge, and is the whole screen below md", { skip }, async () => {
  const wide = await open();
  await wide.show("Open right");
  let box = await wide.content.boundingBox();
  assert.equal(box.width, 360, "--panel-overlay-sm at 1200 wide");
  assert.equal(box.x + box.width, 1200, "docked to the right edge");
  assert.equal(await wide.content.evaluate((el) => getComputedStyle(el).borderLeftWidth), "1px");
  await wide.page.keyboard.press("Escape");
  await wide.content.waitFor({ state: "detached" });
  await wide.show("Open left");
  box = await wide.content.boundingBox();
  assert.equal(box.x, 0, "left drawer docks left");
  assert.equal(box.width, 360);
  await wide.page.close();

  const narrow = await open({ width: 700 }); // under --breakpoint-md (768)
  await narrow.show("Open right");
  box = await narrow.content.boundingBox();
  assert.equal(box.width, 700, "full screen below md");
  assert.equal(await narrow.content.evaluate((el) => getComputedStyle(el).borderLeftWidth), "0px", "with no edge");
  const footer = await narrow.page.locator("[data-slot=drawer-footer]").evaluate((el) => getComputedStyle(el).flexDirection);
  assert.equal(footer, "column-reverse", "the footer stacks with the primary action on top");
  await narrow.page.close();

  const small = await open({ width: 900 }); // half the window (450) is over the sm tier, so the tier wins
  await small.show("Open right");
  assert.equal((await small.content.boundingBox()).width, 360);
  await small.page.close();
});

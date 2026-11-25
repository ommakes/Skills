// Drives the vois-carousel story in a real browser and checks what the item adds to Embla: the roles and names, the arrow
// keys (and the places they must not act), the end buttons that stay focusable, a vertical carousel, and reduced motion.
// Needs the `playwright` package and a Chromium; without them the tests are skipped, not passed.
// Run: node registry/scripts/carousel.test.mjs
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { skip, start } from "./harness-browser.mjs";

let env;
before(async () => { if (!skip) env = await start(); });
after(async () => { await env?.stop(); });

async function open({ reducedMotion = "no-preference" } = {}) {
  const context = await env.browser.newContext({ viewport: { width: 900, height: 900 }, reducedMotion });
  const page = await context.newPage();
  await page.goto(`${env.base}/carousel?theme=light`);
  const horizontal = page.getByRole("region", { name: "Vehicle photos" });
  const vertical = page.getByRole("region", { name: "Damage notes" });
  await horizontal.waitFor();
  // The offset of slide 0 from the start of its viewport, in px: 0 on the first slide, about -(slide + gap) on the second.
  const offset = (region) => region.evaluate((el) => {
    const view = el.querySelector("[data-slot=carousel-content]").getBoundingClientRect();
    const first = el.querySelector("[data-slot=carousel-item]").firstElementChild.getBoundingClientRect(); // the slide card, inside the gap
    return el.dataset.orientation === "vertical" ? Math.round(first.top - view.top) : Math.round(first.left - view.left);
  });
  // The index of the slide at the start of the viewport, once Embla has stopped moving.
  const current = async (region) => {
    let last = NaN;
    for (let i = 0; i < 40; i++) {
      const now = await offset(region);
      if (now === last) break;
      last = now;
      await page.waitForTimeout(80);
    }
    return region.evaluate((el) => {
      const view = el.querySelector("[data-slot=carousel-content]").getBoundingClientRect();
      const vertical = el.dataset.orientation === "vertical";
      const slides = [...el.querySelectorAll("[data-slot=carousel-item]")];
      return slides.findIndex((s) => { const r = s.firstElementChild.getBoundingClientRect(); return Math.abs((vertical ? r.top - view.top : r.left - view.left)) < 2; });
    });
  };
  return { page, horizontal, vertical, offset, current };
}

test("is a named carousel region of named slides, and its buttons have names", { skip }, async () => {
  const { page, horizontal } = await open();
  assert.equal(await horizontal.getAttribute("aria-roledescription"), "carousel");
  const slides = horizontal.getByRole("group");
  assert.equal(await slides.count(), 5);
  assert.equal(await slides.first().getAttribute("aria-roledescription"), "slide");
  assert.equal(await slides.first().getAttribute("aria-label"), "1 of 5");
  assert.equal(await horizontal.getByRole("button", { name: "Previous slide" }).count(), 1);
  assert.equal(await horizontal.getByRole("button", { name: "Next slide" }).count(), 1);
  const size = await horizontal.getByRole("button", { name: "Next slide" }).boundingBox();
  assert.equal(size.width, 36, "36 icon button on a fine pointer");
  await page.close();
});

test("the arrow keys move between slides while focus is in the carousel", { skip }, async () => {
  const { page, horizontal, current } = await open();
  await horizontal.getByRole("button", { name: "Next slide" }).focus();
  assert.equal(await current(horizontal), 0);
  await page.keyboard.press("ArrowRight");
  assert.equal(await current(horizontal), 1);
  await page.keyboard.press("ArrowRight");
  assert.equal(await current(horizontal), 2);
  await page.keyboard.press("ArrowLeft");
  assert.equal(await current(horizontal), 1);
  await page.keyboard.press("ArrowDown");
  assert.equal(await current(horizontal), 1, "a horizontal carousel ignores Up and Down");
  await page.keyboard.press("Shift+ArrowRight");
  assert.equal(await current(horizontal), 1, "a held modifier leaves the key to the browser");
  await page.close();
});

test("the arrow keys are left alone in a text field, a select and an editable area, and still work in a checkbox", { skip }, async () => {
  const { page, horizontal, current } = await open();
  await horizontal.evaluate((el) => {
    const slide = el.querySelector("[data-slot=carousel-item]");
    slide.insertAdjacentHTML("beforeend", '<input id="t" aria-label="Note"><select id="s" aria-label="Pick"><option>a</option></select><div id="e" contenteditable="true" aria-label="Edit">x</div><input id="c" type="checkbox" aria-label="Tick">');
  });
  for (const id of ["t", "s", "e"]) {
    await page.locator(`#${id}`).focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await current(horizontal), 0, `#${id} keeps its arrow keys`);
  }
  await page.locator("#c").focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await current(horizontal), 1, "a checkbox has no arrow keys of its own");
  await page.close();
});

test("a button at the end of the run is aria-disabled, ignores presses, and keeps focus", { skip }, async () => {
  const { page, horizontal, current } = await open();
  const prev = horizontal.getByRole("button", { name: "Previous slide" });
  const next = horizontal.getByRole("button", { name: "Next slide" });
  assert.equal(await prev.getAttribute("aria-disabled"), "true", "Previous is disabled on the first slide");
  assert.equal(await prev.evaluate((el) => el.disabled), false, "but not `disabled`, so it can still take focus");
  assert.equal(await next.getAttribute("aria-disabled"), null);
  await prev.focus();
  await page.keyboard.press("Enter");
  assert.equal(await current(horizontal), 0, "a press on a disabled button does nothing");
  await next.focus();
  for (let i = 0; i < 4; i++) { await page.keyboard.press("Enter"); await current(horizontal); }
  assert.equal(await current(horizontal), 4);
  assert.equal(await next.getAttribute("aria-disabled"), "true", "Next is disabled on the last slide");
  assert.equal(await next.evaluate((el) => el === document.activeElement), true, "and the keyboard is still on it");
  await page.keyboard.press("Enter");
  assert.equal(await current(horizontal), 4);
  await page.close();
});

test("a vertical carousel answers Up and Down, and not Left and Right", { skip }, async () => {
  const { page, vertical, current } = await open();
  await vertical.getByRole("button", { name: "Next slide" }).focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await current(vertical), 0);
  await page.keyboard.press("ArrowDown");
  assert.equal(await current(vertical), 1);
  await page.keyboard.press("ArrowUp");
  assert.equal(await current(vertical), 0);
  await page.close();
});

test("a button press moves at once under reduced motion, and glides otherwise", { skip }, async () => {
  const frames = async (page) => { await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))); };
  const reduced = await open({ reducedMotion: "reduce" });
  const settledAt = await (async () => {
    await reduced.horizontal.getByRole("button", { name: "Next slide" }).click();
    await frames(reduced.page);
    return reduced.offset(reduced.horizontal);
  })();
  const finalOffset = await (async () => { await reduced.current(reduced.horizontal); return reduced.offset(reduced.horizontal); })();
  assert.ok(finalOffset < -100, "the carousel moved one slide");
  assert.equal(settledAt, finalOffset, "and it was already there two frames after the press");
  await reduced.page.close();

  const normal = await open();
  await normal.horizontal.getByRole("button", { name: "Next slide" }).click();
  await frames(normal.page);
  const early = await normal.offset(normal.horizontal);
  const final = await (async () => { await normal.current(normal.horizontal); return normal.offset(normal.horizontal); })();
  assert.notEqual(early, final, "with motion allowed it is still on its way two frames after the press");
  await normal.page.close();
});

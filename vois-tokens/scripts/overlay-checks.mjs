// Regex-level checks for two dialog rules. No parser, no dependency, same as registry.mjs.
//   DS-MODAL-005  more than two buttons in a dialog footer
//   DS-MODAL-006  a dialog, sheet or drawer opened inside another one
//
// Both read JSX in one file and stay quiet on anything they cannot read. A pass is not proof the rule is met.
// Known gaps are listed in references/hooks.md and pinned by tests in detect.test.mjs.

import { finding, uncomment } from "./check-utils.mjs";
import { openingTags } from "./jsx-tags.mjs";

const MAX_SCAN = 400_000; // a minified bundle is not worth reading

const FOOTERS = ["DialogFooter", "AlertDialogFooter"];
// A footer button: Button, an AlertDialog action or cancel, or a DialogClose that is not a wrapper.
const BUTTONS = ["Button", "AlertDialogAction", "AlertDialogCancel", "DialogClose"];
const LEFT_VARIANT = /\bvariant\s*=\s*(?:"(?:link|ghost)"|'(?:link|ghost)'|\{\s*["'](?:link|ghost)["']\s*\})/;
const AS_CHILD = /\basChild\b/;

/**
 * Buttons in a footer, split in two: `left` is a ghost or link button (the allowed third action, on the left), `right` is every other
 * button. A `<DialogClose asChild>` wrapper is not a button, because the Button inside it is counted on its own.
 */
function footerButtonCounts(body) {
  let left = 0;
  let right = 0;
  for (const tag of openingTags(body, BUTTONS)) {
    if (tag.name === "DialogClose" && AS_CHILD.test(tag.attrs)) continue;
    if (LEFT_VARIANT.test(tag.attrs)) left++;
    else right++;
  }
  return { left, right };
}

/** DS-MODAL-005: a dialog footer with more than two buttons. */
export function footerButtons({ content, lines, filePath }) {
  if (content.length > MAX_SCAN) return [];
  const text = uncomment(content, filePath);
  const findings = [];
  // Every close tag, once, by name. Openings come in order, so one pointer per name walks each list a single time.
  const closes = Object.fromEntries(FOOTERS.map((n) => [n, []]));
  const closeRe = new RegExp(`</(${FOOTERS.join("|")})>`, "g");
  let c;
  while ((c = closeRe.exec(text)) !== null) closes[c[1]].push(c.index);
  const at = Object.fromEntries(FOOTERS.map((n) => [n, 0]));
  for (const open of openingTags(text, FOOTERS)) {
    if (/\/\s*$/.test(open.attrs)) continue; // <DialogFooter /> holds nothing
    const list = closes[open.name];
    while (at[open.name] < list.length && list[at[open.name]] < open.index) at[open.name]++;
    const close = list[at[open.name]] ?? -1;
    if (close === -1) continue; // never closes: not read
    const { left, right } = footerButtonCounts(text.slice(open.index, close));
    if (right > 2 || left + right > 3) {
      findings.push(finding(content, lines, open.index, `${open.name} has ${left + right} buttons${right > 2 ? `, ${right} of them not ghost or link` : ""}. Keep a primary action and Cancel on the right. A third action is one ghost or link button on the left (variant="ghost" or "link"), and only when the dialog is wider than 400px.`));
    }
  }
  return findings;
}

const ROOTS = ["Dialog", "AlertDialog", "Sheet", "Drawer"];

/**
 * DS-MODAL-006: a root (`Dialog`, `AlertDialog`, `Sheet`, `Drawer`) opened between the open and close tags of another root.
 * A nested root is reported only when the outer root closes in the same file, so a file that is cut off or unbalanced stays quiet.
 */
export function nestedModal({ content, lines, filePath }) {
  if (content.length > MAX_SCAN) return [];
  const text = uncomment(content, filePath);
  const events = [];
  for (const tag of openingTags(text, ROOTS)) {
    if (/\/\s*$/.test(tag.attrs)) continue; // self-closing: opens nothing
    events.push({ index: tag.index, name: tag.name, open: true });
  }
  if (events.length === 0) return [];
  const close = new RegExp(`</(${ROOTS.join("|")})\\s*>`, "g");
  let m;
  while ((m = close.exec(text)) !== null) events.push({ index: m.index, name: m[1], open: false });
  events.sort((a, b) => a.index - b.index);

  const findings = [];
  const stack = []; // { index, name, pending: [nested entries], closed }
  const openCount = Object.fromEntries(ROOTS.map((n) => [n, 0])); // how many entries of each name are on the stack
  for (const ev of events) {
    if (ev.open) {
      const entry = { index: ev.index, name: ev.name, pending: [], closed: false };
      if (stack.length > 0) stack[stack.length - 1].pending.push(entry);
      stack.push(entry);
      openCount[ev.name]++;
      continue;
    }
    // A close tag ends the nearest open root with that name. If there is none, it is ignored.
    if (openCount[ev.name] === 0) continue;
    let at = stack.length - 1;
    while (stack[at].name !== ev.name) at--;
    const dropped = stack.splice(at); // anything left open above it was never closed, so it is dropped
    for (const d of dropped) openCount[d.name]--;
    const closed = dropped[0];
    closed.closed = true;
    for (const nested of closed.pending) {
      if (!nested.closed) continue; // a nested root that never closed is not read
      findings.push(finding(content, lines, nested.index, `${nested.name} is opened inside a ${closed.name}. Never nest modals: replace the content of the same dialog with a second view and a Back control, or make it a page.`));
    }
  }
  return findings;
}

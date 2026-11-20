// Renders vois-icon-button on the server and checks the name, the tooltip and the disabled rule.
// The component is bundled with esbuild, its @/ imports resolved from the registry install targets (the harness's
// aliasMap), so the test renders the file the registry ships.
// Run: node registry/scripts/icon-button.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { aliasMap } from "../harness/build.mjs";

const registryDir = resolve(fileURLToPath(new URL("..", import.meta.url)));

// A stand-in for vois-tooltip whose trigger always injects aria-describedby, the way Radix's does while the tooltip
// is open. A server render never opens the real one, so this is how the test sees whether IconButton removes it.
const OPEN_TOOLTIP_STUB = `import * as React from "react"
export const Tooltip = ({ children }) => children
export const TooltipContent = () => null
export const TooltipTrigger = ({ children }) => React.cloneElement(children, { "aria-describedby": "tooltip-content", "data-state": "delayed-open" })
`;

async function load({ openTooltip = false } = {}) {
  const aliases = aliasMap(JSON.parse(readFileSync(join(registryDir, "registry.json"), "utf8")));
  const dir = mkdtempSync(join(registryDir, ".icon-button-test-"));
  try {
    const out = join(dir, "bundle.mjs");
    await build({
      stdin: {
        contents: 'export { IconButton, tooltipOpen } from "@/components/ui/icon-button"; export { renderToStaticMarkup } from "react-dom/server"; export { createElement } from "react";',
        resolveDir: registryDir,
        loader: "ts",
      },
      bundle: true,
      format: "esm",
      platform: "node",
      outfile: out,
      jsx: "automatic",
      external: ["react", "react-dom", "react/*", "react-dom/*"], // one React, loaded from registry/node_modules
      logLevel: "silent",
      plugins: [{
        name: "vois-alias",
        setup(b) {
          if (openTooltip) {
            b.onResolve({ filter: /^@\/components\/ui\/tooltip$/ }, () => ({ path: "tooltip-stub", namespace: "stub" }));
            b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: OPEN_TOOLTIP_STUB, loader: "jsx", resolveDir: registryDir }));
          }
          b.onResolve({ filter: /^@\// }, (args) => {
            const path = aliases.get(args.path);
            return path ? { path } : { errors: [{ text: `${args.path} is not a registry install target` }] };
          });
        },
      }],
    });
    return await import(pathToFileURL(out).href);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const m = await load();
const open = await load({ openTooltip: true });
const html = (props) => m.renderToStaticMarkup(m.createElement(m.IconButton, { icon: m.createElement("svg"), ...props }));
const buttonTag = (s) => s.match(/<button[^>]*>/)[0];

test("the label is the accessible name, and the icon is hidden", () => {
  const s = html({ label: "Close" });
  assert.match(buttonTag(s), /aria-label="Close"/);
  assert.match(s, /<span aria-hidden="true" class="inline-flex"><svg><\/svg><\/span>/);
});

test("a caller's aria-label or aria-labelledby cannot replace the label", () => {
  const s = buttonTag(html({ label: "Close", "aria-label": "X", "aria-labelledby": "elsewhere" }));
  assert.match(s, /aria-label="Close"/);
  assert.doesNotMatch(s, /aria-label="X"/);
  assert.doesNotMatch(s, /aria-labelledby/);
});

test("defaults: ghost variant, the 36 icon size, type button, and a tooltip trigger", () => {
  const s = buttonTag(html({ label: "Close" }));
  assert.match(s, /data-variant="ghost"/);
  assert.match(s, /data-size="icon"/);
  assert.match(s, /type="button"/, "an icon action in a form does not submit it");
  assert.match(buttonTag(html({ label: "Send", type: "submit" })), /type="submit"/, "a caller can still ask for submit");
  assert.match(s, /data-state="closed"/, "wrapped in a Radix tooltip trigger");
});

test("the tooltip never opens while disabled or turned off, and the element tree does not change", () => {
  assert.equal(m.tooltipOpen({ tooltip: true, disabled: false }), undefined, "Radix opens it on hover and focus");
  assert.equal(m.tooltipOpen({ tooltip: true }), undefined);
  assert.equal(m.tooltipOpen({ tooltip: true, disabled: true }), false, "DS-A11Y-029");
  assert.equal(m.tooltipOpen({ tooltip: false, disabled: false }), false);
  // Toggling disabled or tooltip changes attributes only, never the element structure, so React keeps the node.
  const shape = (str) => str.replace(/ (?:disabled|data-disabled)(?:="[^"]*")?/g, "");
  assert.equal(shape(html({ label: "Save", disabled: true })), shape(html({ label: "Save" })));
  assert.equal(html({ label: "Save", tooltip: false }), html({ label: "Save" }));
});

test("the tooltip is not announced as a description: a caller's aria-describedby is kept, nothing else is added", () => {
  const openHtml = (props) => buttonTag(open.renderToStaticMarkup(open.createElement(open.IconButton, { icon: open.createElement("svg"), ...props })));
  assert.match(openHtml({ label: "Close" }), /data-state="delayed-open"/, "the stub trigger did inject its props");
  assert.doesNotMatch(openHtml({ label: "Close" }), /aria-describedby/, "an open tooltip does not describe the button");
  assert.match(openHtml({ label: "Delete", "aria-describedby": "why" }), /aria-describedby="why"/, "the caller's description stays");
  assert.match(openHtml({ label: "Close", "aria-label": "X" }), /aria-label="Close"/, "the label still wins under an open tooltip");
});

test("an empty, missing or non-string label is reported and never throws", () => {
  for (const label of ["  ", "", undefined, null, 42]) {
    const seen = [];
    const original = console.error;
    console.error = (msg) => seen.push(String(msg));
    try {
      assert.doesNotThrow(() => html({ label }), String(label));
    } finally {
      console.error = original;
    }
    assert.ok(seen.some((s) => /label` is missing or empty/.test(s)), String(label));
  }
  const quiet = [];
  const original = console.error;
  console.error = (msg) => quiet.push(String(msg));
  try { html({ label: "Close" }); } finally { console.error = original; }
  assert.equal(quiet.filter((s) => /IconButton/.test(s)).length, 0, "a real label logs nothing");
});

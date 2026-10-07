#!/usr/bin/env node
// Scans TSX outputs from a lookalike run for markup that does a component's job
// without using the component. Heuristic: it flags candidates
// for a human to read, it does not decide anything.
//
// Usage: node scan.mjs runs/<run-name> [prompts-file]   (default: loads prompts.json and prompts-hard.json)
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { detectFile } from "../../vois-tokens/scripts/detect.mjs";
import { openingTags } from "../../vois-tokens/scripts/jsx-tags.mjs";

// The lookalike checks that also run as the vois-tokens hook come from the hook's registry, so the
// scanner and the hook cannot drift apart. The rest are scanner-only.
const viaHook = (ruleId) => (s) => detectFile("scan.tsx", s).some((f) => f.ruleId === ruleId);

// An import of the component from any path whose last part is its name ("@/components/ui/x", "~/components/ui/x", "./ui/x", "react-x").
const imp = (src, name) => new RegExp(`from\\s+["'](?:[^"']*/)?(?:react-)?${name}["']`).test(src);

// Whether any opening tag with one of these names has attribute text that passes `keep`. Tags are read
// with the hook's scanner, so a ">" inside an arrow function or a comparison does not end the tag.
const tagHas = (src, names, keep) => openingTags(src, names).some((t) => keep(t.attrs));

// Each signal: id, what the agent built, the real component, test(src) -> bool
const SIGNALS = [
  ["fake-button", "div/span/li/p with onClick, no role", "Button",
    viaHook("LOOKALIKE-005")],
  ["fake-close", "× / ✕ / ✖ glyph as a close control (a plain letter x is not detected)", "Dialog/Sheet close (labelled)",
    viaHook("LOOKALIKE-008")],
  ["fake-overlay", "fixed inset-0 backdrop built by hand", "Dialog / Sheet / AlertDialog",
    (s) => /["'`][^"'`]*\b(?:fixed\b[^"'`]*\binset-0|inset-0\b[^"'`]*\bfixed)\b[^"'`]*["'`]|position:\s*["']?fixed/.test(s) && !/(dialog|sheet|alert-dialog)["']/.test(s.match(/from\s+["']@\/components\/ui\/[a-z-]+["']/g)?.join(" ") ?? "")],
  ["fake-toast", "setTimeout (1.5s or more) that hides a message held in state", "Sonner toast",
    viaHook("LOOKALIKE-007")],
  ["fake-skeleton", "animate-pulse blocks without Skeleton", "Skeleton",
    // A pulsing placeholder block: animate-pulse on an element with a muted or gray fill. A live or presence dot (bg-primary, bg-green-*) is not a skeleton.
    (s) => tagHas(s, ["[a-z]+"], (a) => /\banimate-pulse\b/.test(a) && /\bbg-(?:muted|secondary|accent|gray|slate|zinc|neutral|stone)\b/.test(a)) && !imp(s, "skeleton")],
  ["fake-spinner", "hand-rolled animate-spin element", "Spinner",
    viaHook("LOOKALIKE-002")],
  ["fake-switch", "translate-x knob or styled checkbox as a toggle", "Switch",
    (s) => (/(checked|isOn|enabled)[^\n]{0,80}(?<![-\w])translate-x-\d+(?![\d/])/.test(s) || /role=["']switch["']/.test(s)) && !imp(s, "switch")],
  ["fake-badge", "rounded-full px-* span as a status label", "Badge",
    // A kbd-style chip (font-mono) is not a badge.
    (s) => tagHas(s, ["span"], (a) => /rounded-(?:full|md|lg)\b/.test(a) && /\bpx-\d/.test(a) && !/\bfont-mono\b/.test(a)) && !imp(s, "badge")],
  ["fake-tabs", "buttons that swap a state variable as tabs", "Tabs / ToggleGroup",
    (s) => /onClick=\{\(\)\s*=>\s*(?:set(?:Active)?(?:Tab|View|Section|Page)\w*|setActive)\(/.test(s) && !imp(s, "tabs") && !imp(s, "toggle-group")],
  ["fake-dropdown", "absolute menu shown from useState open flag", "DropdownMenu",
    // A flag named open, isOpen, menuOpen... that gates an element with "absolute" close behind it.
    (s) => /\{\s*\w*[oO]pen\w*\s*&&[\s\S]{0,400}?\babsolute\b/.test(s) && !imp(s, "dropdown-menu") && !imp(s, "popover")],
  ["fake-breadcrumb", "path joined with / or > in plain markup", "Breadcrumb",
    // A separator rendered between elements. A bare "/" string is mock data (a URL path), not a separator.
    // The word has to stand alone or end a camelCase name: "pathname" and an SVG <path> do not count.
    (s) => /(\{\s*["']\s*[>/]\s*["']\s*\}|>\s*[>/]\s*<|ChevronRight)/.test(s) && /(?<![<\w])(?:path|crumb|folder)s?\b|[a-z](?:Path|Crumb|Folder)s?\b/i.test(s.replace(/\bpathname\b/gi, "")) && !imp(s, "breadcrumb")],
  ["native-select", "native <select>", "Select",
    (s) => /<select\b/.test(s) && !imp(s, "select")],
  ["native-checkbox", "native checkbox input", "Checkbox",
    (s) => tagHas(s, ["input"], (a) => /\btype=["']checkbox["']/.test(a)) && !imp(s, "checkbox")],
  ["native-radio", "native radio input", "RadioGroup",
    (s) => tagHas(s, ["input"], (a) => /\btype=["']radio["']/.test(a)) && !imp(s, "radio-group")],
  ["title-tooltip", "title attribute as tooltip", "Tooltip",
    viaHook("LOOKALIKE-011")],
  ["fake-progress", "div with role progressbar", "Progress",
    // Needs the role: a width-styled bar can be a data bar in a chart or funnel, which is not a progress indicator.
    (s) => tagHas(s, ["div"], (a) => /\brole=["']progressbar["']/.test(a)) && !imp(s, "progress")],
  ["fake-alert", "colored box with role alert on the same element, not Alert", "Alert",
    viaHook("LOOKALIKE-010")],
  ["fake-avatar", "rounded-full div with initials", "Avatar",
    (s) => /<div\b(?:=>|[^>])*rounded-full(?:=>|[^>])*>\s*\{?[^<]{0,12}(initials|\.charAt|\[0\])/i.test(s) && !imp(s, "avatar")],
  ["raw-palette-color", "Tailwind palette color class (bg-red-500, text-green-700) instead of a system token", "Status color tokens (DS-COLOR-008)",
    (s) => /\b(?:bg|text|border|ring|fill|stroke)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/.test(s)],
  ["raw-button-focus-ring", "raw <button> carrying a copy-pasted focus ring", "Button (a variant, so focus styles stay shared)",
    viaHook("LOOKALIKE-001")],
  ["native-dialog", "window.confirm / alert / prompt", "AlertDialog / Sonner",
    viaHook("LOOKALIKE-009")],
];

export function scan(src, expected) {
  const hits = SIGNALS.filter(([, , , t]) => t(src)).map(([id]) => id);
  // Sonner's toast() is normally imported from the "sonner" package itself, not from the ui wrapper.
  const usedExpected = expected.filter((e) => imp(src, e) || (e === "sonner" && /from\s+["']sonner["']/.test(src)));
  return { hits, usedExpected, missingExpected: usedExpected.length === 0 };
}

if (process.argv[1] && process.argv[1].endsWith("scan.mjs")) {
  const dir = process.argv[2];
  if (!dir) { console.error("usage: node scan.mjs <run-dir> [prompts-file]"); process.exit(1); }
  // Load every prompts file unless one is named, so run1 (LP-*) and run2 (HP-*) both resolve.
  const promptFiles = process.argv[3] ? [process.argv[3]] : ["./prompts.json", "./prompts-hard.json"];
  const prompts = promptFiles.flatMap((f) => JSON.parse(readFileSync(new URL(f, import.meta.url))).scenarios);
  const byId = Object.fromEntries(prompts.map((p) => [p.id, p]));
  const rows = [];
  const skipped = [];
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".tsx"))) {
    const id = f.replace(/\.tsx$/, "");
    const p = byId[id];
    if (!p) { skipped.push(f); continue; }
    rows.push({ id, job: p.source_job, style: p.style, ...scan(readFileSync(join(dir, f), "utf8"), p.expected_imports) });
  }
  if (skipped.length) {
    console.error(`WARNING: skipped ${skipped.length} file(s) with no matching prompt id (${promptFiles.join(", ")}): ${skipped.join(", ")}`);
    process.exitCode = 2;
  }
  rows.sort((a, b) => a.id.localeCompare(b.id));
  console.log("file    job                         style       hits / expected-used");
  for (const r of rows)
    console.log(`${r.id.padEnd(8)}${r.job.padEnd(28)}${r.style.padEnd(12)}${r.hits.join(",") || "-"}  /  ${r.usedExpected.join(",") || "NONE (read this one)"}`);
  const counts = {};
  for (const r of rows) for (const h of r.hits) counts[h] = (counts[h] ?? 0) + 1;
  console.log("\nSignal counts (keep a row in the table only if it repeats, count >= 2):");
  for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(2)}  ${k}`);
  console.log(`\n${rows.length} files, ${rows.filter((r) => r.missingExpected).length} used none of the expected components.`);
}

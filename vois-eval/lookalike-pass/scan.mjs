#!/usr/bin/env node
// Scans TSX outputs from a lookalike run for markup that does a component's job
// without using the component. Zero dependencies. Heuristic: it flags candidates
// for a human to read, it does not decide anything.
//
// Usage: node scan.mjs runs/<run-name> [prompts-file]   (default: loads prompts.json and prompts-hard.json)
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const imp = (src, name) => new RegExp(`from\\s+["']@/components/ui/${name}["']`).test(src);

// Each signal: id, what the agent built, the real component, test(src) -> bool
const SIGNALS = [
  ["fake-button", "div/span/li/a with onClick, no role", "Button",
    (s) => /<(div|span|li|p|a)\b(?![^>]*\brole=)(?![^>]*\bhref=)[^>]*\bonClick=/.test(s)],
  ["fake-close", "plain x / times text as a close control", "Dialog/Sheet close (labelled)",
    (s) => />\s*(×|✕|✖|x|X)\s*<|&times;/.test(s)],
  ["fake-overlay", "fixed inset-0 backdrop built by hand", "Dialog / Sheet / AlertDialog",
    (s) => /fixed\s+inset-0|position:\s*["']?fixed/.test(s) && !/(dialog|sheet|alert-dialog)["']/.test(s.match(/from\s+["']@\/components\/ui\/[a-z-]+["']/g)?.join(" ") ?? "")],
  ["fake-toast", "setTimeout (1.5s or more) that hides a message held in state", "Sonner toast",
    (s) => {
      // () => setX(false) as the first argument, then the delay. Loading and hover-close delays are not toasts.
      const re = /setTimeout\(\s*(?:\(\s*\)\s*=>|function\s*\(\s*\))\s*\{?\s*(set[A-Z]\w*)\(\s*(?:false|null|""|'')\s*\)\s*;?\s*\}?\s*,\s*(\d+)/g;
      const usesSonner = /from\s+["'](?:@\/components\/ui\/)?sonner["']/.test(s);
      for (const m of s.matchAll(re)) {
        if (!/load|pending|busy|saving|fetch|submit/i.test(m[1]) && Number(m[2]) >= 1500 && !usesSonner) return true;
      }
      return false;
    }],
  ["fake-skeleton", "animate-pulse blocks without Skeleton", "Skeleton",
    (s) => /animate-pulse/.test(s) && !imp(s, "skeleton")],
  ["fake-spinner", "hand-rolled animate-spin element", "Spinner",
    (s) => /animate-spin/.test(s) && !imp(s, "spinner")],
  ["fake-switch", "translate-x knob or styled checkbox as a toggle", "Switch",
    (s) => (/(checked|isOn|enabled)[^\n]{0,80}\btranslate-x-\d/.test(s) || /role=["']switch["']/.test(s)) && !imp(s, "switch")],
  ["fake-badge", "rounded-full px-* span as a status label", "Badge",
    (s) => /<span\b[^>]*className=["'{`][^>]*rounded-(full|md|lg)[^>]*\bpx-\d/.test(s) && !imp(s, "badge")],
  ["fake-tabs", "buttons that swap a state variable as tabs", "Tabs / ToggleGroup",
    (s) => /onClick=\{\(\)\s*=>\s*set(Tab|Active|View|Section)\w*\(/.test(s) && !imp(s, "tabs") && !imp(s, "toggle-group")],
  ["fake-dropdown", "absolute menu shown from useState open flag", "DropdownMenu",
    (s) => /\{\s*open\w*\s*&&/.test(s) && /\babsolute\b/.test(s) && !imp(s, "dropdown-menu") && !imp(s, "popover")],
  ["fake-breadcrumb", "path joined with / or > in plain markup", "Breadcrumb",
    // A separator rendered between elements. A bare "/" string is mock data (a URL path), not a separator.
    (s) => /(\{\s*["']\s*[>/]\s*["']\s*\}|>\s*[>/]\s*<|ChevronRight)/.test(s) && /path|crumb|folder/i.test(s) && !imp(s, "breadcrumb")],
  ["native-select", "native <select>", "Select",
    (s) => /<select\b/.test(s) && !imp(s, "select")],
  ["native-checkbox", "native checkbox input", "Checkbox",
    (s) => /<input\b[^>]*type=["']checkbox["']/.test(s) && !imp(s, "checkbox")],
  ["native-radio", "native radio input", "RadioGroup",
    (s) => /<input\b[^>]*type=["']radio["']/.test(s) && !imp(s, "radio-group")],
  ["title-tooltip", "title attribute as tooltip", "Tooltip",
    (s) => /<(?:div|span|button|a|svg|img|td|th|p|i|abbr)\b[^>]*\btitle=["'{]/.test(s) && !imp(s, "tooltip")],
  ["fake-progress", "div with role progressbar", "Progress",
    // Needs the role: a width-styled bar can be a data bar in a chart or funnel, which is not a progress indicator.
    (s) => /<div\b[^>]*role=["']progressbar["']/.test(s) && !imp(s, "progress")],
  ["fake-alert", "colored box with role alert on the same element, not Alert", "Alert",
    (s) => !imp(s, "alert") && /<(?:div|p|section|span)\b[^>]*role=["']alert["'][^>]*>/g.test(s) &&
      [...s.matchAll(/<(?:div|p|section|span)\b[^>]*role=["']alert["'][^>]*>/g)].some((m) => /border-l-4|\bbg-red-|(?<![:\w-])bg-destructive\/\d/.test(m[0]))],
  ["fake-avatar", "rounded-full div with initials", "Avatar",
    (s) => /<div\b[^>]*rounded-full[^>]*>\s*\{?[^<]{0,12}(initials|\.charAt|\[0\])/i.test(s) && !imp(s, "avatar")],
  ["raw-palette-color", "Tailwind palette color class (bg-red-500, text-green-700) instead of a system token", "Status color tokens (DS-COLOR-008)",
    (s) => /\b(?:bg|text|border|ring|fill|stroke)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/.test(s)],
  ["raw-button-focus-ring", "raw <button> carrying a copy-pasted focus ring", "Button (a variant, so focus styles stay shared)",
    // "=>" in an onClick would end the [^>]* early, so hide arrows first.
    (s) => /<button\b[^>]*focus-visible:(?:ring|outline)/.test(s.replace(/=>/g, "=_"))],
  ["native-dialog", "window.confirm / alert / prompt", "AlertDialog / Sonner",
    (s) => /\b(window\.)?(confirm|alert|prompt)\(/.test(s)],
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
  console.log("file    job                         style     hits / expected-used");
  for (const r of rows)
    console.log(`${r.id.padEnd(8)}${r.job.padEnd(28)}${r.style.padEnd(10)}${r.hits.join(",") || "-"}  /  ${r.usedExpected.join(",") || "NONE (read this one)"}`);
  const counts = {};
  for (const r of rows) for (const h of r.hits) counts[h] = (counts[h] ?? 0) + 1;
  console.log("\nSignal counts (keep a row in the table only if it repeats, count >= 2):");
  for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(2)}  ${k}`);
  console.log(`\n${rows.length} files, ${rows.filter((r) => r.missingExpected).length} used none of the expected components.`);
}

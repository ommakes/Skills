// Run with: node scan.test.mjs
// Pins what each fixture in fixtures/ must hit, so a change to a signal (or to the hook rules the
// scanner borrows) that stops it matching fails here instead of going unnoticed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { scan } from "./scan.mjs";

const EXPECTED = {
  "LP-01a": ["fake-button"],
  "LP-03a": ["fake-close", "fake-overlay", "native-dialog"],
  "LP-04a": ["fake-toast"],
  "LP-05a": ["fake-alert", "raw-palette-color"],
  "LP-06a": ["raw-button-focus-ring"],
  "LP-07b": [], // a funnel bar, the word "progress" and a "/" path string must hit nothing
  "LP-09a": [],
  "LP-09b": ["raw-palette-color"],
  "HP-07": ["fake-progress"],
};

for (const [id, hits] of Object.entries(EXPECTED)) {
  test(`fixture ${id} hits ${hits.join(", ") || "nothing"}`, () => {
    const src = readFileSync(new URL(`./fixtures/${id}.tsx`, import.meta.url), "utf8");
    assert.deepEqual(scan(src, []).hits.sort(), [...hits].sort());
  });
}

// Inputs from an independent review of the scanner. Each one used to give the wrong answer.
const hits = (src, expected = []) => scan(src, expected).hits;
const CASES = [
  ["checkbox with an arrow handler before type", '<input onChange={(e) => setOn(e.target.checked)} type="checkbox" />', ["native-checkbox"]],
  ["radio with an arrow handler before type", '<input onChange={() => pick(1)} type="radio" />', ["native-radio"]],
  ["progressbar after an arrow handler", '<div onClick={() => go()} role="progressbar" />', ["fake-progress"]],
  ["menu flag named isOpen", "{isOpen && <ul className=\"absolute right-0\" />}", ["fake-dropdown"]],
  ["an unrelated open flag and a far away absolute", "{openFaq && <p>a</p>}\n" + "x\n".repeat(400) + '<i className="absolute" />', []],
  ["a chevron icon in a pathname file", 'import { ChevronRight } from "lucide-react"\nconst pathname = usePathname()\n<li>Settings <ChevronRight /></li>', []],
  ["a chevron in a button next to an svg path", '<svg><path d="" /></svg><button>Next <ChevronRight /></button>', []],
  ["a live dot", '<span className="size-2 rounded-full bg-primary animate-pulse" aria-label="Live" />', []],
  ["a muted pulse block", '<div className="h-4 w-24 animate-pulse rounded bg-muted" />', ["fake-skeleton"]],
  ["a centered knob", '<div className={enabled ? "a" : "b"}><span className="absolute left-1/2 -translate-x-1/2" /></div>', []],
  ["a real knob", '<span className={checked ? "translate-x-4" : "translate-x-0"} />', ["fake-switch"]],
  ["overlay classes in the other order", '<div className="inset-0 fixed bg-black/50" />', ["fake-overlay"]],
  ["badge classes in the other order", '<span className="px-2 py-0.5 rounded-full">New</span>', ["fake-badge"]],
  ["a kbd chip", '<span className="rounded-md px-1.5 font-mono">⌘K</span>', []],
  ["a setter for a selected row", "<TableRow onClick={() => setActiveRow(row.id)} />", []],
  ["a real tab", "<button onClick={() => setActiveTab('a')}>A</button>", ["fake-tabs"]],
  ["prose that says confirm", "<p>Please confirm (this cannot be undone)</p>", []],
  ["an amber alert box", '<div role="alert" className="border border-amber-300 bg-amber-50">x</div>', ["fake-alert", "raw-palette-color"]],
  ["a delay written 3_000", "setTimeout(() => setShowSaved(false), 3_000)", ["fake-toast"]],
  ["a flag whose name contains load", "setTimeout(() => setUploadMessage(null), 3000)", ["fake-toast"]],
];
for (const [name, src, want] of CASES) {
  test(`scanner: ${name}`, () => assert.deepEqual(hits(src).sort(), want.sort()));
}

test("scanner: an import from ~/components/ui counts as using the component", () => {
  assert.deepEqual(scan('import { Switch } from "~/components/ui/switch"', ["switch"]).usedExpected, ["switch"]);
  assert.deepEqual(scan('import { Spinner } from "./ui/spinner"', ["spinner"]).usedExpected, ["spinner"]);
});

test("scanner: pagination is not tabs, and a modal close button is not a dropdown", () => {
  assert.deepEqual(hits("<Button onClick={() => setPage(page + 1)}>Next</Button>"), []);
  assert.deepEqual(hits("<button onClick={() => setActiveIndex(1)}>One</button>"), ["fake-tabs"]);
  const modal = '{isOpen && (<div className="fixed inset-0 bg-black/50"><div className="absolute right-4 top-4">x</div></div>)}';
  assert.deepEqual(hits(modal), ["fake-overlay"]);
  assert.deepEqual(hits('{isOpen && <ul className="absolute right-0" />}'), ["fake-dropdown"]);
});

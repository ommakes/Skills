// Run with: node validate.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadBase, validateRanges, validateOverride, validateProposal, validateTeams, validatePaths, RANGES_FILE } from "./lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const baseRules = loadBase();
const ranges = JSON.parse(readFileSync(RANGES_FILE, "utf8"));
const ctx = { baseRules, ranges };

const file = (overrides, extra = {}) => ({ schema: "vois-team-override/1", team: "payments", overrides, ...extra });
const restrict = (rule, param, value, id = "payments-001") => ({ id, op: "restrict", rule, param, value, reason: "Because the team needs it here." });
const check = (data) => validateOverride(data, ctx);
const errorsOf = (data) => check(data).errors.join("\n");

test("ranges.json is valid against the base rules", () => {
  assert.deepEqual(validateRanges(ranges, baseRules), []);
});

test("every range's match text is still in its base rule", () => {
  const reworded = new Map(baseRules);
  reworded.set("DS-ANIMATION-001", "UI animations: under `250ms` as a default.");
  assert.match(validateRanges(ranges, reworded).join("\n"), /DS-ANIMATION-001 max_duration_ms: match text/);
});

test("ranges.json catches an entry whose base and bound disagree", () => {
  const bad = { ...ranges, ranges: [{ ...ranges.ranges[0], max: 400 }] };
  assert.match(validateRanges(bad, baseRules).join("\n"), /stricter is lower, so max must equal base/);
});

test("the examples and proposals folders validate together", () => {
  const r = validatePaths([join(HERE, "..", "examples"), join(HERE, "..", "proposals")], ctx, { optional: [join(HERE, "..", "proposals")] });
  assert.deepEqual(r.errors, []);
  assert.ok(r.checked >= 3);
});

for (const op of ["relax", "disable", "ignore", "exempt", "waive", "remove"]) {
  test(`op "${op}" is rejected and points at the proposal flow`, () => {
    assert.match(errorsOf(file([{ id: "payments-001", op, rule: "DS-ANIMATION-001", reason: "Because the team needs it here." }])), /base-change proposal/);
  });
}

test("restrict past the base is rejected as loosening", () => {
  assert.match(errorsOf(file([restrict("DS-ANIMATION-001", "max_duration_ms", 400)])), /outside the allowed 100 to 300/);
  assert.match(errorsOf(file([restrict("DS-ANIMATION-008", "min_press_scale", 0.9)])), /outside the allowed 0.95 to 1/);
  assert.match(errorsOf(file([restrict("JOB-EXPOSE-ACTIONS", "max_visible_actions", 4)])), /outside the allowed 2 to 3/);
  assert.match(errorsOf(file([restrict("JOB-EXPOSE-ACTIONS", "max_visible_actions", 1)])), /outside the allowed 2 to 3/);
});

test("restrict below the range floor is rejected", () => {
  assert.match(errorsOf(file([restrict("DS-ANIMATION-001", "max_duration_ms", 50)])), /outside the allowed 100 to 300/);
});

test("a stricter value is accepted, and an unchanged value only warns", () => {
  assert.deepEqual(check(file([restrict("DS-ANIMATION-001", "max_duration_ms", 200)])).errors, []);
  assert.deepEqual(check(file([restrict("DS-A11Y-004", "min_contrast_normal_text", 7)])).errors, []);
  const same = check(file([restrict("DS-ANIMATION-001", "max_duration_ms", 300)]));
  assert.deepEqual(same.errors, []);
  assert.equal(same.warnings.length, 1);
});

test("restrict needs a direction and refine needs there to be none", () => {
  assert.match(errorsOf(file([restrict("DS-ICON-001", "stroke_width_px", 2)])), /Use refine/);
  assert.match(errorsOf(file([{ ...restrict("DS-ANIMATION-001", "max_duration_ms", 200), op: "refine" }])), /must be a restrict/);
  assert.deepEqual(check(file([{ ...restrict("DS-ICON-001", "stroke_width_px", 2), op: "refine" }])).errors, []);
  assert.match(errorsOf(file([{ ...restrict("DS-ICON-001", "stroke_width_px", 3), op: "refine" }])), /outside the allowed 1 to 2/);
});

test("only limits listed in ranges.json can be changed", () => {
  assert.match(errorsOf(file([restrict("DS-A11Y-001", "min_hit_area", 48)])), /no tunable "min_hit_area"/);
  assert.match(errorsOf(file([restrict("DS-NOPE-001", "x", 1)])), /is not a base rule/);
  assert.match(errorsOf(file([restrict("DS-ANIMATION-001", "min_duration_ms", 1)])), /no tunable "min_duration_ms"/);
});

test("set limits: a subset tightens, a superset widens the checks, dropping part of the base loosens", () => {
  assert.deepEqual(check(file([restrict("DS-SPACING-001", "spacing_divisors", [8])])).errors, []);
  assert.match(errorsOf(file([restrict("DS-SPACING-001", "spacing_divisors", [4, 8, 12])])), /outside the allowed/);
  assert.match(errorsOf(file([restrict("DS-SPACING-001", "spacing_divisors", [])])), /non-empty list/);
  assert.deepEqual(check(file([restrict("DS-RESPONSIVE-002", "test_breakpoints_px", [640, 768, 1024, 1280])])).errors, []);
  assert.match(errorsOf(file([restrict("DS-RESPONSIVE-002", "test_breakpoints_px", [768, 1024, 1280])])), /drops part of the base/);
});

test("add: id, text, severity and extends are checked", () => {
  const add = (over) => ({ id: "payments-001", op: "add", rule: "TEAM-PAYMENTS-001", severity: "required", text: "Amounts use tabular numerals.", reason: "Columns of amounts must line up.", ...over });
  assert.deepEqual(check(file([add({})])).errors, []);
  assert.match(errorsOf(file([add({ rule: "TEAM-OTHER-001" })])), /new id like TEAM-PAYMENTS-001/);
  assert.match(errorsOf(file([add({ rule: "DS-ANIMATION-001" })])), /new id like/);
  assert.match(errorsOf(file([add({ severity: "optional" })])), /severity must be/);
  assert.match(errorsOf(file([add({ extends: "DS-NOPE-001" })])), /not a base rule/);
  assert.match(errorsOf(file([add({ text: "short" })])), /text is required/);
  assert.match(errorsOf(file([add({ enforcement: "off" })])), /enforcement must be/);
});

test("ids, targets, keys, file name and team are checked", () => {
  assert.match(errorsOf(file([restrict("DS-ANIMATION-001", "max_duration_ms", 200), restrict("DS-TYPOGRAPHY-001", "max_text_styles", 2)])), /duplicate id/);
  assert.match(errorsOf(file([restrict("DS-ANIMATION-001", "max_duration_ms", 200), restrict("DS-ANIMATION-001", "max_duration_ms", 150, "payments-002")])), /overridden twice/);
  assert.match(errorsOf(file([{ ...restrict("DS-ANIMATION-001", "max_duration_ms", 200), severity: "required" }])), /unknown key "severity"/);
  assert.match(errorsOf(file([{ ...restrict("DS-ANIMATION-001", "max_duration_ms", 200), reason: "no" }])), /reason is required/);
  assert.match(errorsOf(file([restrict("DS-ANIMATION-001", "max_duration_ms", 200, "other-001")])), /id must look like payments-001/);
  assert.match(validateOverride(file([restrict("DS-ANIMATION-001", "max_duration_ms", 200)]), { ...ctx, file: "teams/growth.json" }).errors.join("\n"), /file name must be payments.json/);
  assert.match(errorsOf(file([restrict("DS-ANIMATION-001", "max_duration_ms", 200)], { team: "Pay (ments" })), /team must be/);
  assert.match(errorsOf({ ...file([]), overrides: [] }), /non-empty list/);
});

test("teams: two overlapping teams cannot set one limit differently", () => {
  const a = { file: "a.json", data: file([restrict("DS-ANIMATION-001", "max_duration_ms", 200)]) };
  const b = { file: "b.json", data: file([restrict("DS-ANIMATION-001", "max_duration_ms", 250, "growth-001")], { team: "growth" }) };
  assert.match(validateTeams([a, b]).join("\n"), /overlapping paths/);
  b.data.overrides[0].value = 200;
  assert.deepEqual(validateTeams([a, b]), []);
});

test("teams: disjoint scopes may differ, nested scopes may not, duplicate team ids are caught", () => {
  const mk = (team, paths, value) => ({ file: `${team}.json`, data: file([restrict("DS-ANIMATION-001", "max_duration_ms", value, `${team}-001`)], { team, scope: { paths } }) });
  assert.deepEqual(validateTeams([mk("payments", ["apps/payments/**"], 200), mk("growth", ["apps/growth/**"], 250)]), []);
  assert.match(validateTeams([mk("payments", ["apps/payments/**"], 200), mk("growth", ["apps/payments/checkout/**"], 250)]).join("\n"), /overlapping paths/);
  assert.match(validateTeams([mk("payments", ["a/**"], 200), { file: "x.json", data: mk("payments", ["b/**"], 200).data }]).join("\n"), /is also defined in/);
});

const proposal = (over = {}) => ({
  schema: "vois-base-proposal/1", id: "BCP-001", from_team: "payments", created: "2026-10-06", status: "open",
  rule: "DS-ANIMATION-001", change: { kind: "value", param: "max_duration_ms", from: 300, to: 250 },
  reason: "Three teams already restrict this limit to 250ms or less.",
  why_everyone: "Every product team ships the same slow-device paths.", ...over,
});
const pErrors = (data) => validateProposal(data, ctx).errors.join("\n");

test("proposals: a good one passes, and a stale from value is caught while it is open", () => {
  assert.deepEqual(validateProposal(proposal(), ctx).errors, []);
  assert.match(pErrors(proposal({ change: { kind: "value", param: "max_duration_ms", from: 350, to: 250 } })), /the base is now 300/);
  assert.deepEqual(validateProposal(proposal({ status: "rejected", decision_note: "Too short for drawers.", change: { kind: "value", param: "max_duration_ms", from: 350, to: 250 } }), ctx).errors, []);
});

test("proposals: why_everyone, status follow-ups and ids are required", () => {
  assert.match(pErrors(proposal({ why_everyone: "" })), /why_everyone is required/);
  assert.match(pErrors(proposal({ status: "accepted" })), /resolved_in/);
  assert.match(pErrors(proposal({ status: "rejected" })), /decision_note/);
  assert.match(pErrors(proposal({ status: "maybe" })), /status must be/);
  assert.match(pErrors(proposal({ id: "1" })), /id must look like BCP-001/);
});

test("proposals: each kind checks what it needs", () => {
  assert.match(pErrors(proposal({ rule: "DS-NOPE-001" })), /not a base rule/);
  assert.match(pErrors(proposal({ change: { kind: "value", param: "nope", from: 1, to: 2 } })), /no "nope" in ranges.json/);
  assert.match(pErrors(proposal({ change: { kind: "text", from: "not in the rule", to: "new words go here" } })), /not in the base rule any more/);
  assert.deepEqual(validateProposal(proposal({ change: { kind: "text", from: "under `300ms`", to: "under `250ms`" } }), ctx).errors, []);
  assert.match(pErrors(proposal({ change: { kind: "relax", summary: "Allow longer animations for drawers" } })), /evidence is required/);
  assert.deepEqual(validateProposal(proposal({ change: { kind: "relax", summary: "Allow longer animations for drawers" }, evidence: ["EVAL-006 run notes"] }), ctx).errors, []);
  assert.deepEqual(validateProposal(proposal({ rule: undefined, change: { kind: "new-rule", text: "Amounts use tabular numerals everywhere.", severity: "recommended" } }), ctx).errors, []);
  assert.match(pErrors(proposal({ rule: "DS-ANIMATION-001", change: { kind: "new-rule", text: "Amounts use tabular numerals everywhere.", severity: "recommended" } })), /already a base rule/);
});

test("the README lists every tunable range, and no rule that was dropped", () => {
  const readme = readFileSync(join(HERE, "..", "README.md"), "utf8");
  for (const r of ranges.ranges) {
    assert.ok(readme.includes(`| \`${r.rule}\` | \`${r.param}\` |`), `README table is missing ${r.rule} ${r.param}`);
  }
  const rows = readme.split("\n").filter((l) => /^\| `[A-Z]+-[A-Z0-9-]+` \| `[a-z_]+` \|/.test(l));
  assert.equal(rows.length, ranges.ranges.length, "README table has a row that is not in ranges.json");
});

test("a limit with at_least cannot end up below the limit it depends on", () => {
  const large = (v, id = "payments-001") => restrict("DS-ANIMATION-002", "max_duration_ms", v, id);
  const small = (v, id = "payments-002") => restrict("DS-ANIMATION-001", "max_duration_ms", v, id);
  assert.match(errorsOf(file([large(250)])), /cannot be below DS-ANIMATION-001 max_duration_ms \(300\)/);
  assert.deepEqual(check(file([large(250), small(200)])).errors, []);
  assert.deepEqual(check(file([large(300)])).errors, []);
  assert.deepEqual(check(file([large(250), small(250)])).errors, []);
});

test("ranges.json rejects an at_least that points nowhere", () => {
  const bad = { ...ranges, ranges: ranges.ranges.map((r) => (r.rule === "DS-ANIMATION-002" ? { ...r, at_least: { rule: "DS-NOPE-001", param: "x" } } : r)) };
  assert.match(validateRanges(bad, baseRules).join("\n"), /at_least must name another number range/);
});

test("the JSON examples in the README are valid", () => {
  const readme = readFileSync(join(HERE, "..", "README.md"), "utf8");
  const blocks = [...readme.matchAll(/```json\n([\s\S]*?)```/g)].map((m) => JSON.parse(m[1]));
  assert.equal(blocks.length, 2);
  assert.deepEqual(validateOverride(blocks[0], ctx).errors, []);
  assert.deepEqual(validateProposal(blocks[1], ctx).errors, []);
});

test("a set limit is the same set in any order", () => {
  const a = { file: "a.json", data: file([restrict("DS-SPACING-001", "spacing_divisors", [4, 8])]) };
  const b = { file: "b.json", data: file([restrict("DS-SPACING-001", "spacing_divisors", [8, 4], "growth-001")], { team: "growth" }) };
  assert.deepEqual(validateTeams([a, b]), []);
  b.data.overrides[0].value = [8];
  assert.match(validateTeams([a, b]).join("\n"), /overlapping paths/);
  // A proposal's from value may list the base in a different order, but from and to may not be the same set.
  const setProposal = (from, to) => proposal({ rule: "DS-SPACING-001", change: { kind: "value", param: "spacing_divisors", from, to } });
  assert.deepEqual(validateProposal(setProposal([8, 4], [8]), ctx).errors, []);
  assert.match(pErrors(setProposal([4, 8], [8, 4])), /from and to are the same/);
});

test("the same added rule id twice in one file is rejected", () => {
  const add = (id, text) => ({ id, op: "add", rule: "TEAM-PAYMENTS-001", severity: "required", text, reason: "Columns of amounts must line up." });
  assert.match(errorsOf(file([add("payments-001", "Amounts use tabular numerals."), add("payments-002", "Amounts always show the currency.")])), /added twice/);
});

test("a match that appears more than once in the base rule is rejected", () => {
  const doubled = new Map(baseRules);
  doubled.set("DS-ANIMATION-001", `${baseRules.get("DS-ANIMATION-001")} Also: under \`300ms\` for exits.`);
  assert.match(validateRanges(ranges, doubled).join("\n"), /DS-ANIMATION-001 max_duration_ms: match text .* appears 2 times/);
});

// ---------------------------------------------------------------------------
// Findings from an independent review of the validator.
// ---------------------------------------------------------------------------

const scoped = (name, paths, value) => ({ file: `${name}.json`, data: file([restrict("DS-ANIMATION-001", "max_duration_ms", value, `${name}-001`)], { team: name, scope: { paths } }) });

test("scopes that cover the same files overlap whatever the spelling", () => {
  for (const other of ["./apps/payments/**", "/apps/payments/**", "apps\\payments\\**", "Apps/Payments/**", "apps/@(payments|growth)/**", ".//apps/payments/**"]) {
    assert.match(validateTeams([scoped("payments", [other], 200), scoped("growth", ["apps/payments/**"], 250)]).join("\n"), /overlapping paths/, other);
  }
  assert.deepEqual(validateTeams([scoped("payments", ["apps/payments/**"], 200), scoped("growth", ["apps/growth/**"], 250)]), []);
  assert.deepEqual(validateTeams([scoped("payments", ["./apps/payments/**"], 200), scoped("growth", ["/apps/growth/**"], 250)]), []);
});

function folder(files) {
  const dir = mkdtempSync(join(tmpdir(), "vois-teams-test-"));
  for (const [name, body] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, name)), { recursive: true });
    writeFileSync(join(dir, name), typeof body === "string" ? body : JSON.stringify(body));
  }
  return dir;
}
const validPayments = () => file([restrict("DS-ANIMATION-001", "max_duration_ms", 200)]);

test("the same proposal id in two folders is rejected", () => {
  const a = folder({ "BCP-001.json": proposal() });
  const b = folder({ "BCP-001.json": proposal() });
  assert.match(validatePaths([a, b], ctx).errors.join("\n"), /proposal id BCP-001 is also used by/);
});

test("a file given twice, in different path shapes, is checked once", () => {
  const dir = folder({ "payments.json": validPayments() });
  const r = validatePaths([join(dir, "payments.json"), join(dir, ".", "payments.json"), dir], ctx);
  assert.deepEqual(r.errors, []);
  assert.equal(r.checked, 1);
});

test("a folder with nothing to check is an error, and a missing path is an error not a crash", () => {
  assert.match(validatePaths([folder({ "sub/payments.json": validPayments() })], ctx).errors.join("\n"), /no \.json files in this folder/);
  const empty = folder({ "README.md": "hello" });
  assert.match(validatePaths([empty], ctx).errors.join("\n"), /no \.json files/);
  assert.deepEqual(validatePaths([empty], ctx, { optional: [empty] }).errors, []);
  assert.match(validatePaths([join(empty, "nope.json")], ctx).errors.join("\n"), /nope\.json: not found/);
});

test("an upper case .JSON extension is read", () => {
  const dir = folder({ "payments.JSON": validPayments() });
  const r = validatePaths([dir], ctx);
  assert.equal(r.checked, 1);
  assert.deepEqual(r.errors, []);
});

test("a match glued to more digits is not a match", () => {
  const renumbered = new Map(baseRules);
  for (const [rule, from, to] of [["JOB-CHOOSE-FROM-LIST", "under 8", "under 80"], ["JOB-DISPLAY-DATA", "Under 100", "Under 1000"], ["JOB-CONTEXTUAL-INFO", "25 words", "125 words"]]) {
    const copy = new Map(baseRules);
    copy.set(rule, baseRules.get(rule).replace(from, to));
    assert.match(validateRanges(ranges, copy).join("\n"), new RegExp(`${rule} \\w+: match text .* is not in the base rule`), `${from} -> ${to}`);
  }
  assert.deepEqual(validateRanges(ranges, renumbered), []);
});

test("a set proposal needs a real list, and warns when it leaves the current range", () => {
  const setProposal = (to) => proposal({ rule: "DS-SPACING-001", change: { kind: "value", param: "spacing_divisors", from: [4, 8], to } });
  for (const bad of [[], [8, 8], ["8"], "8"]) assert.match(pErrors(setProposal(bad)), /non-empty list of unique numbers/, JSON.stringify(bad));
  const outside = validateProposal(setProposal([12]), ctx);
  assert.deepEqual(outside.errors, []);
  assert.match(outside.warnings.join("\n"), /outside the current/);
});

test("a text proposal must quote words that appear once, from the rule wording and not its id", () => {
  const textProposal = (rule, from) => proposal({ rule, change: { kind: "text", from, to: "replacement words go here" } });
  assert.match(pErrors(textProposal("DS-A11Y-004", "under")), /appears 2 times/);
  assert.match(pErrors(textProposal("JOB-CHOOSE-FROM-LIST", "JOB-CHOOSE-FROM-LIST")), /not in the base rule/);
  assert.deepEqual(validateProposal(textProposal("DS-ANIMATION-001", "under `300ms`"), ctx).errors, []);
});

test("PATH rules include their other wording, such as rule_name", () => {
  const found = [];
  const walk = (o) => {
    if (Array.isArray(o)) return o.forEach(walk);
    if (o && typeof o === "object") {
      if (typeof o.id === "string" && o.id.startsWith("PATH-") && typeof o.rule_name === "string") found.push(o);
      Object.values(o).forEach(walk);
    }
  };
  walk(JSON.parse(readFileSync(join(HERE, "..", "..", "vois-patterns", "data", "patterns-rules.json"), "utf8")));
  assert.ok(found.length > 0);
  for (const node of found.slice(0, 5)) assert.ok(baseRules.get(node.id).includes(node.rule_name), node.id);
});

test("created must be a real calendar date", () => {
  for (const bad of ["2026-13-45", "2026-02-30", "2026-00-10", "26-10-06", ""]) assert.match(pErrors(proposal({ created: bad })), /real date/, bad);
  assert.deepEqual(validateProposal(proposal({ created: "2028-02-29" }), ctx).errors, []);
});


test("scope paths with an extglob are rejected, plain wildcards and braces are fine", () => {
  assert.match(errorsOf(file([restrict("DS-ANIMATION-001", "max_duration_ms", 200)], { scope: { paths: ["apps/@(payments|growth)/**"] } })), /extglob/);
  assert.deepEqual(check(file([restrict("DS-ANIMATION-001", "max_duration_ms", 200)], { scope: { paths: ["apps/{payments,growth}/**", "lib/**/*.tsx"] } })).errors, []);
});

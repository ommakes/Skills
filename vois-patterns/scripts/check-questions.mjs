#!/usr/bin/env node
// Checks the questionnaire data. Run from the repo root: npm i --no-save ajv && node vois-patterns/scripts/check-questions.mjs
//   1. Tags in the reference files match the JSON, both ways.
//   2. examples/survey-good.json passes question.schema.json.
//   3. Bad surveys fail the schema (each lint rule is enforced).
//   4. The question engine picks the right component (PATH-H-2).
//   5. tokens.questionnaire.json thresholds match the engine.
//   6. Righter copy entries have the right shape and point at real rule ids.
//   7. Jobs 22 to 24 are present and complete.
//   8. The registry copy of the engine is byte for byte this folder's engine.
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pickQuestionComponent, pollResultRows } from "./question-engine.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const readText = (p) => readFileSync(join(root, p), "utf8");
const readJson = (p) => JSON.parse(readText(p));
let failed = false;
const fail = (m) => { failed = true; console.error("FAIL  " + m); };
// A copy entry field must have the right type and hold something. A wrong type fails (never passes).
// Blank means empty after removing whitespace and zero-width characters. NaN, [], {} and "" are empty.
const blank = (v) => typeof v !== "string" || v.replace(/[\s\u200B-\u200D\u2060\uFEFF]/g, "") === "";
const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const FIELD_KINDS = { id: "string", name: "string", when_to_use: "string", golden_rule: "string", rules: "strings", variants: "array", examples: "object", path_ids: "strings" };
const fieldOk = (v, kind) => kind === "string" ? !blank(v)
  : kind === "strings" ? Array.isArray(v) && v.length > 0 && v.every((x) => !blank(x))
  : kind === "array" ? Array.isArray(v) && v.length > 0
  : isPlainObject(v) && Object.keys(v).length > 0;
for (const [v, kind, want] of [[[], "strings", false], [{}, "object", false], ["  ", "string", false], ["\u200B", "string", false], [null, "string", false], [undefined, "array", false], [NaN, "string", false], [5, "strings", false], [true, "strings", false], ["text", "strings", false], [[""], "strings", false], [[" "], "strings", false], [["x"], "strings", true], [[{ a: 1 }], "array", true], [{ a: 1 }, "object", true], [[1], "object", false], ["x", "string", true]]) {
  if (fieldOk(v, kind) !== want) fail(`self-test: fieldOk(${JSON.stringify(v)}, ${kind}) should be ${want}`);
}
const clone = (o) => JSON.parse(JSON.stringify(o));

// 1. Tag sync
const nodes = readJson("vois-patterns/data/patterns-rules.json").nodes.filter((n) => /^PATH-H(-\d)?$/.test(n.id));
const nodeIds = new Set(nodes.map((n) => n.id));
if (nodeIds.size !== nodes.length) fail("duplicate PATH-H ids in patterns-rules.json");
const pathMd = readText("vois-patterns/references/questionnaires.md");
const pathTags = new Set([...pathMd.matchAll(/`\[(PATH-H(?:-\d)?)\]`/g)].map((m) => m[1]));
for (const t of pathTags) if (!nodeIds.has(t)) fail(`questionnaires.md cites ${t}, which has no node`);
for (const i of nodeIds) if (!pathTags.has(i)) fail(`${i} is a node but is not tagged in questionnaires.md`);
for (const n of nodes) if (n.id !== "PATH-H" && n.parent === undefined) fail(`${n.id} has no parent`);

const rules = readJson("vois-tokens/data/vois-rules.json").rules.filter((r) => r.source_file === "vois-tokens/references/questionnaire-ui.md");
const ruleIds = new Set(rules.map((r) => r.id));
if (ruleIds.size !== rules.length) fail("duplicate ids in vois-rules.json");
const uiMd = readText("vois-tokens/references/questionnaire-ui.md");
const uiTags = new Set([...uiMd.matchAll(/\[(DS-(?:A11Y|RESPONSIVE)-0[0-9]+)\]/g)].map((m) => m[1]));
for (const t of uiTags) if (!ruleIds.has(t)) fail(`questionnaire-ui.md cites ${t}, which has no JSON entry`);
for (const i of ruleIds) if (!uiTags.has(i)) fail(`${i} is in JSON but is not tagged in questionnaire-ui.md`);
for (const r of rules) if (!["required", "recommended", "preferred"].includes(r.severity)) fail(`${r.id} has bad severity`);

// 2 and 3. Schema
let validate;
try {
  const { default: Ajv2020 } = await import("ajv/dist/2020.js");
  validate = new Ajv2020({ allErrors: true, strict: false }).compile(readJson("vois-patterns/data/question.schema.json"));
} catch (e) { fail("could not load ajv. Run: npm i -D ajv  (" + e.message + ")"); }
const good = readJson("vois-patterns/examples/survey-good.json");
const q = (s, id) => s.questions.find((x) => x.id === id);
if (validate) {
  if (!validate(good)) for (const e of validate.errors) fail(`survey-good.json ${e.instancePath || "/"} ${e.message}`);
  const battery = { id: "battery", type: "likert_battery", title: "Rate each part", required: true, requirement_label: "Required",
    statements: ["Speed", "Price", "Support"], scale: { points: 5, labels_mode: "full", direction: "negative_to_positive", labels: ["Very poor", "Poor", "Okay", "Good", "Very good"] }, render: "accordion" };
  const withBattery = clone(good); withBattery.questions.push(battery);
  if (!validate(withBattery)) for (const e of validate.errors) fail(`good battery ${e.instancePath || "/"} ${e.message}`);

  const bad = {
    "7 point scale shown horizontal": (s) => { q(s, "support-quality").orientation_sm = "horizontal"; },
    "7 point scale with endpoint labels only": (s) => { q(s, "support-quality").scale.labels_mode = "endpoints"; },
    "rank all with 7 options": (s) => { const r = q(s, "priorities").rank; r.mode = "rank_all"; delete r.top_n; },
    "rank without drag": (s) => { q(s, "priorities").rank.drag = false; },
    "rank without move buttons": (s) => { q(s, "priorities").rank.move_buttons = false; },
    "AI suggestion shown as prefilled": (s) => { q(s, "company").prefill = { source: "ai_suggestion", confidence: "high", show_as: "prefilled" }; },
    "long text without rows_max": (s) => { delete q(s, "comments").text.rows_max; },
    "long text where Enter submits": (s) => { q(s, "comments").text.enter_submits = true; },
    "required label does not match": (s) => { q(s, "role").requirement_label = "Optional"; },
    "max_select without helper": (s) => { q(s, "features").helper = null; },
    "branching with question progress": (s) => { q(s, "support-quality").showIf = "ease <= 2"; },
    "battery with 6 statements": (s) => { const b = clone(battery); b.statements = ["a", "b", "c", "d", "e", "f"]; s.questions.push(b); },
    "battery rendered as grid": (s) => { const b = clone(battery); b.render = "grid"; s.questions.push(b); },
    "NPS with 7 points": (s) => { q(s, "recommend").scale.points = 7; },
    "quiz without correct ids": (s) => { delete q(s, "leap-year").reveal.correct_option_ids; },
    "poll with correct ids": (s) => { q(s, "role").reveal.correct_option_ids = ["design"]; },
    "results shown before the answer": (s) => { q(s, "role").reveal.show = "before_answer"; },
    "results re-sorted by votes": (s) => { q(s, "role").reveal.order = "by_votes"; },
    "min votes below 10": (s) => { q(s, "role").reveal.min_votes_for_percent = 3; },
    "reveal on a likert question": (s) => { q(s, "ease").reveal = { ...q(s, "role").reveal }; },
    "two correct ids on single choice": (s) => { q(s, "leap-year").reveal.correct_option_ids = ["d366", "d365"]; },
    "correct marker by color only": (s) => { q(s, "leap-year").reveal.correct_marker = "color"; },
    "rank with 13 options": (s) => { const o = q(s, "priorities").options; for (let i = 0; i < 6; i++) o.push({ id: "x" + i, label: "Item " + i }); },
  };
  let caught = 0;
  for (const [name, mutate] of Object.entries(bad)) {
    const s = clone(good); mutate(s);
    if (validate(s)) fail(`bad survey passed the schema: ${name}`); else caught++;
  }
  // branching is fine when progress is by section
  const ok = clone(good); q(ok, "support-quality").showIf = "ease <= 2"; ok.progress.mode = "section";
  if (!validate(ok)) fail("branching with section progress should pass: " + JSON.stringify(validate.errors));
  console.log(`      ${caught}/${Object.keys(bad).length} bad surveys rejected`);
}

// 4. Engine
const cases = [
  [{ textLength: "long" }, "LongTextbox"],
  [{ textLength: "short" }, "OpenText"],
  [{ textLength: "short", typedValue: true }, "OpenText", (r) => r.fieldsSkill === true],
  [{ battery: true, scalePoints: 5 }, "LikertAccordion"],
  [{ battery: true, scalePoints: 7 }, "LikertAccordion"],
  [{ scalePoints: 11 }, "Slider"],
  [{ scalePoints: 5 }, "LikertHorizontal"],
  [{ scalePoints: 7 }, "LikertVertical"],
  [{ ordered: true, optionCount: 5 }, "TapToRank", (r) => r.mode === "rank_all"],
  [{ ordered: true, optionCount: 6 }, "TapToRank", (r) => r.mode === "rank_all"],
  [{ ordered: true, optionCount: 7 }, "TapToRank", (r) => r.mode === "top_n" && r.topN === 3],
  [{ ordered: true, optionCount: 13 }, null, (r) => !!r.error],
  [{ cardinality: "multiple", optionCount: 6 }, "CheckboxCard"],
  [{ cardinality: "multiple", optionCount: 20 }, "SearchableCheckboxList"],
  [{ cardinality: "single", optionCount: 4 }, "RadioCard"],
  [{ cardinality: "single", optionCount: 9 }, "RadioListRow"],
  [{ cardinality: "single", optionCount: 30 }, "SearchableList"],
  [{ battery: true, scalePoints: 11 }, null, (r) => !!r.error],
  [{ grouping: true }, null, (r) => r.rule === 0],
  [{}, null, (r) => !!r.error],
];
for (const [props, want, extra] of cases) {
  const r = pickQuestionComponent(props);
  if (r.component !== want) fail(`engine ${JSON.stringify(props)} gave ${r.component}, wanted ${want}`);
  else if (extra && !extra(r)) fail(`engine ${JSON.stringify(props)} failed its extra check`);
}
console.log(`      ${cases.length} engine cases checked`);

// 4a. The registry ships the engine as a copy (registry/vois/questionnaire/question-engine.js).
// It must be identical to this folder's engine. A missing file or any difference fails.
{
  const copyPath = join(root, "registry/vois/questionnaire/question-engine.js");
  const srcPath = join(root, "vois-patterns/scripts/question-engine.mjs");
  if (!existsSync(copyPath)) fail("registry/vois/questionnaire/question-engine.js is missing");
  else if (!readFileSync(copyPath).equals(readFileSync(srcPath))) fail("registry/vois/questionnaire/question-engine.js differs from vois-patterns/scripts/question-engine.mjs; copy the engine over, do not edit the registry copy");
}

// 4b. Poll results: correct ids must be options, and the rows must behave
for (const x of good.questions.filter((z) => z.reveal?.correct_option_ids)) {
  const ids = new Set(x.options.map((o) => o.id));
  for (const c of x.reveal.correct_option_ids) if (!ids.has(c)) fail(`${x.id} marks ${c} correct, but it is not an option`);
}
{
  const o = [{ id: "a", label: "A" }, { id: "b", label: "B" }, { id: "c", label: "C" }];
  const t = (name, ok) => { if (!ok) fail("poll rows: " + name); };
  let r = pollResultRows({ options: o, votes: { a: 10, b: 10, c: 10 }, selected: ["a"], correct: ["b"] });
  t("single choice sums to 100", r.rows.reduce((a, x) => a + x.percent, 0) === 100);
  t("keeps option order", r.rows.map((x) => x.id).join("") === "abc");
  t("flags correct and yours", r.rows[1].isCorrect && r.rows[0].isYours && r.yourAnswerCorrect === false);
  r = pollResultRows({ options: o, votes: { a: 1, b: 1, c: 1 }, selected: ["a"], correct: ["a"] });
  t("under 10 votes hides numbers", !r.showNumbers && r.rows.every((x) => x.percent === null && x.count === null));
  t("correct is still marked under 10 votes", r.rows[0].isCorrect && r.yourAnswerCorrect === true);
  r = pollResultRows({ options: o, votes: { a: 1, b: 1, c: 1 }, selected: [], minVotes: 2 });
  t("min votes cannot go below 10", !r.showNumbers);
  r = pollResultRows({ options: o, votes: { a: 7, b: 3, c: 1 }, selected: [] });
  t("single choice with 11 votes sums to 100", r.rows.reduce((a, x) => a + x.percent, 0) === 100);
  r = pollResultRows({ options: o, votes: { a: 80, b: 60, c: 40 }, respondents: 100, multi: true, selected: ["a", "c"], correct: ["a", "b"] });
  t("multi-select is a share of respondents", r.rows[0].percent === 80 && r.rows[1].percent === 60 && !r.sumsTo100);
  t("multi-select needs all correct options", r.yourAnswerCorrect === false);
  r = pollResultRows({ options: o, votes: { a: 0, b: 0, c: 12 }, selected: ["c"] });
  t("leading row", r.rows[2].isLeading && !r.rows[0].isLeading);
  t("poll has no correct answer", r.quiz === false && r.yourAnswerCorrect === null);
}
console.log("      poll result rows checked");

// 5. Tokens against the engine
const t = readJson("vois-tokens/data/tokens.questionnaire.json").questionnaire;
if (t.rank_all_max !== 6 || pickQuestionComponent({ ordered: true, optionCount: t.rank_all_max }).mode !== "rank_all") fail("rank_all_max does not match the engine");
if (pickQuestionComponent({ ordered: true, optionCount: t.rank_all_max + 1 }).mode !== "top_n") fail("engine should switch to top_n above rank_all_max");
if (pickQuestionComponent({ ordered: true, optionCount: t.rank_top_n_max_items + 1 }).component !== null) fail("engine should refuse ranking above rank_top_n_max_items");
if (pickQuestionComponent({ cardinality: "single", optionCount: t.options_before_scroll }).component !== "RadioCard") fail("options_before_scroll mismatch");
if (pickQuestionComponent({ cardinality: "single", optionCount: t.options_before_scroll + 1 }).component !== "RadioListRow") fail("options_before_scroll mismatch");
if (pickQuestionComponent({ cardinality: "single", optionCount: t.options_before_search + 1 }).component !== "SearchableList") fail("options_before_search mismatch");
const sch = readJson("vois-patterns/data/question.schema.json");
if (!JSON.stringify(sch).includes(`"maxItems":${t.battery_max_statements}`)) fail("battery_max_statements is not in the schema");
if (t.option_row_min_px !== 56) fail("option rows are 56px at every width (DS-RESPONSIVE-013)");
if (!t.accepted?.option_row_min_px) fail("option_row_min_px should be recorded as an accepted exception");
if (t.poll.min_votes_for_percent < 10) fail("poll min votes must be 10 or more");
if (!JSON.stringify(sch).includes('"minimum":' + t.poll.min_votes_for_percent)) fail("poll min_votes_for_percent is not enforced by the schema");
if (t.poll.row_min_px !== t.option_row_min_px) fail("poll rows should match option rows");
if (t.font_min_px < 16) fail("font_min_px must be 16 or more");
if (t.target_px.normal < 44) fail("normal target must be 44 or more");

// 6. Righter copy
const COPY_IDS = ["prefill-badge", "selection-limit", "availability-check", "resend-cooldown", "draft-and-saved-state", "questionnaire-errors", "questionnaire-progress", "rank-prompts", "poll-results"];
const copy = readJson("vois-patterns/data/questionnaire-copy.json").components.filter((c) => COPY_IDS.includes(c.id));
if (copy.length !== COPY_IDS.length) fail(`vois-patterns/data/questionnaire-copy.json should hold ${COPY_IDS.length} questionnaire copy entries, found ${copy.length}`);
const fieldsPath = process.env.FIELDS_RULES || join(root, "vois-fields/data/fields-rules.json");
const fieldIds = new Set(existsSync(fieldsPath) ? (JSON.parse(readFileSync(fieldsPath, "utf8")).rules ?? []).map((n) => n.id) : []);
const copyIds = new Set();
for (const c of copy) {
  if (copyIds.has(c.id)) fail(`duplicate copy id ${c.id}`); copyIds.add(c.id);
  for (const [k, kind] of Object.entries(FIELD_KINDS)) if (!fieldOk(c[k], kind)) fail(`copy ${c.id}: ${k} is missing, empty or the wrong type (wanted ${kind})`);
  for (const p of c.path_ids || []) if (!nodeIds.has(p) && !fieldIds.has(p) && !(!existsSync(fieldsPath) && p.startsWith("FIELD-"))) fail(`copy ${c.id} cites ${p}, which is not a known id`);
  for (const v of c.variants || []) if (!v.name || !v.sentence_construction) fail(`copy ${c.id} has a variant without name or sentence_construction`);
  if (!c.examples?.good?.length || !c.examples?.bad?.length) fail(`copy ${c.id} needs good and bad examples`);
  if (JSON.stringify(c).includes("\u2014")) fail(`copy ${c.id} contains an em dash`);
}
if (fieldIds.size === 0) console.log("      note: fields-rules.json not found, FIELD ids were not checked");

// 7. Jobs
const jobs = readJson("vois-components/data/components-rules.json").jobs;
for (const [id, n] of [["JOB-ANSWER-CHOICE-QUESTION", 22], ["JOB-ANSWER-SCALE-OR-RANK", 23], ["JOB-SHOW-POLL-RESULTS", 24]]) {
  const j = jobs.find((x) => x.id === id);
  if (!j) { fail(`missing job ${id}`); continue; }
  if (j.number !== n) fail(`${id} should be Job ${n}`);
  for (const k of ["title", "decision_tree", "rationale"]) if (!j[k]) fail(`${id} is missing ${k}`);
}

if (failed) { console.error("\nQuestionnaire check FAILED"); process.exit(1); }
console.log(`OK  ${nodes.length} PATH-H nodes and ${rules.length} DS rules in sync, example valid, engine and tokens agree, ${copy.length} copy entries valid, jobs present`);

// Loads and validates eval tasks. A task is a user prompt plus deterministic expectations.
// Bad input throws: a task with a broken regex or an unknown field must stop the run, not
// quietly score as "nothing to check".
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = (rel) => fileURLToPath(new URL(rel, import.meta.url));

export const DEFAULT_TASK_FILES = [
  here("../lookalike-pass/prompts.json"),
  here("../lookalike-pass/prompts-hard.json"),
  here("../tasks/design-tasks.json"),
];

const KNOWN = new Set([
  "id", "source_job", "source_rules", "style", "user_prompt", "expected_imports",
  "forbidden_imports", "required_patterns", "forbidden_patterns", "review", "notes",
]);
const COMPONENT = /^[a-z0-9-]+$/;

function checkList(task, key, itemOk, what) {
  const v = task[key];
  if (v === undefined) return;
  if (!Array.isArray(v) || !v.every(itemOk)) throw new Error(`${task.id}: ${key} must be ${what}`);
}

export function validateTask(task, file = "task file") {
  if (!task || typeof task !== "object") throw new Error(`${file}: a task is not an object`);
  if (typeof task.id !== "string" || !task.id) throw new Error(`${file}: a task has no id`);
  if (typeof task.user_prompt !== "string" || !task.user_prompt.trim()) throw new Error(`${task.id}: user_prompt is empty`);
  for (const k of Object.keys(task)) if (!KNOWN.has(k)) throw new Error(`${task.id}: unknown field "${k}"`);
  const names = (x) => typeof x === "string" && COMPONENT.test(x);
  checkList(task, "expected_imports", names, "a list of component file names like \"alert-dialog\"");
  checkList(task, "forbidden_imports", names, "a list of component file names like \"alert-dialog\"");
  for (const key of ["required_patterns", "forbidden_patterns"]) {
    checkList(task, key, (p) => p && typeof p.id === "string" && typeof p.regex === "string", "a list of { id, regex, flags? }");
    for (const p of task[key] ?? []) {
      try { new RegExp(p.regex, p.flags ?? ""); } catch (e) { throw new Error(`${task.id}: pattern "${p.id}" is not a valid regex: ${e.message}`); }
    }
    const ids = (task[key] ?? []).map((p) => p.id);
    if (new Set(ids).size !== ids.length) throw new Error(`${task.id}: duplicate pattern id in ${key}`);
  }
  const expects = (task.expected_imports?.length ?? 0) + (task.required_patterns?.length ?? 0) + (task.forbidden_imports?.length ?? 0) + (task.forbidden_patterns?.length ?? 0);
  if (!expects) throw new Error(`${task.id}: no expectations (expected_imports, forbidden_imports, required_patterns or forbidden_patterns)`);
  return task;
}

export function loadTasks(files = DEFAULT_TASK_FILES) {
  const tasks = [];
  for (const f of files) {
    const data = JSON.parse(readFileSync(f, "utf8"));
    if (!Array.isArray(data.scenarios)) throw new Error(`${f}: no "scenarios" list`);
    for (const t of data.scenarios) tasks.push(validateTask(t, f));
  }
  const seen = new Set();
  for (const t of tasks) {
    if (seen.has(t.id)) throw new Error(`duplicate task id ${t.id} across task files`);
    seen.add(t.id);
  }
  return tasks;
}

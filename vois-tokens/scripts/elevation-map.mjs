// Checks vois-tokens/data/elevation-map.json: against its JSON Schema, then against rules a schema cannot say,
// then against the registry components it describes. Run: node vois-tokens/scripts/elevation-map.mjs
//
// The schema validator is a small subset on purpose (type, enum, required, properties, additionalProperties, items,
// minItems, minLength, pattern, $ref to #/$defs). It fails closed: a schema keyword it does not know is an error,
// so a schema can never ask for a check that is skipped. (vois-fields/scripts/check-fields.mjs has a copy of this
// validator without the `type` arrays. They are separate on purpose: vois-fields is premium and not in the public repo.)
import { readFileSync, existsSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const SKILL = join(here, "..");
const REPO = join(here, "..", "..");
const LADDER = ["none", "base", "small", "medium", "large", "xlarge"];
const LAYERS = ["page", "dropdown", "overlay", "modal"];
const KNOWN = new Set(["$schema", "$id", "$defs", "$ref", "title", "description", "type", "enum", "required", "properties", "additionalProperties", "items", "minItems", "minLength", "pattern"]);

const typeOf = (v) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v);

export function validate(schema, value, root = schema, path = "$") {
  const out = [];
  for (const k of Object.keys(schema)) if (!KNOWN.has(k)) out.push(`${path}: the schema uses "${k}", which the checker does not support`);
  if (schema.additionalProperties !== undefined && typeof schema.additionalProperties !== "boolean") out.push(`${path}: additionalProperties must be true or false here`);
  if (schema.$ref) {
    const sib = Object.keys(schema).filter((k) => !["$ref", "$schema", "$id", "$defs", "title", "description"].includes(k));
    if (sib.length) out.push(`${path}: $ref cannot sit beside ${sib.join(", ")}, because the checker would skip them`);
    const m = /^#\/\$defs\/(.+)$/.exec(schema.$ref);
    const target = m && root.$defs && root.$defs[m[1]];
    if (!target) return [...out, `${path}: unknown $ref ${schema.$ref}`];
    return [...out, ...validate(target, value, root, path)];
  }
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.includes(typeOf(value))) return [...out, `${path}: expected ${types.join(" or ")}, got ${typeOf(value)}`];
  }
  if (schema.enum && !schema.enum.includes(value)) out.push(`${path}: ${JSON.stringify(value)} is not one of ${schema.enum.join(", ")}`);
  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) out.push(`${path}: empty or too short`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) out.push(`${path}: ${JSON.stringify(value)} does not match ${schema.pattern}`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) out.push(`${path}: needs at least ${schema.minItems} item(s)`);
    if (schema.items) value.forEach((v, i) => out.push(...validate(schema.items, v, root, `${path}[${i}]`)));
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const r of schema.required ?? []) if (!Object.hasOwn(value, r)) out.push(`${path}: missing "${r}"`);
    const props = schema.properties ?? {};
    for (const [k, v] of Object.entries(value)) {
      if (Object.hasOwn(props, k)) out.push(...validate(props[k], v, root, `${path}.${k}`));
      else if (schema.additionalProperties === false) out.push(`${path}: "${k}" is not a known property`);
    }
  }
  return out;
}

const idx = (t) => LADDER.indexOf(t);

// Rules a schema cannot say. `readComponent(name)` returns a registry component's source, or null.
export function semanticProblems(data, { readComponent = () => null, registryItems = null } = {}) {
  const out = [];
  if (!data || typeof data !== "object" || Array.isArray(data)) return out; // the schema reports it
  // The ladder is the tier order every other rule leans on. Changing it changes what "one step up" means.
  if (JSON.stringify(data.ladder) !== JSON.stringify(LADDER)) out.push(`ladder must be exactly ${LADDER.join(", ")}`);
  const layers = data.layers && typeof data.layers === "object" ? data.layers : {};
  let prevMax = -1;
  for (const name of LAYERS) {
    const l = layers[name];
    if (!l || !Array.isArray(l.tiers)) continue;
    for (const t of l.tiers) if (idx(t) < 0) out.push(`layers.${name}: "${t}" is not a tier`);
    const max = Math.max(...l.tiers.map(idx));
    // Layers run in role order: page, dropdown, overlay, modal. This is not z-index order (a popup opened from a dialog stacks above it), so DS-ELEVATION-002 states the exception.
    if (max < prevMax) out.push(`layers.${name}: its heaviest tier is lighter than the layer below it`);
    prevMax = Math.max(prevMax, max);
  }
  if (!Array.isArray(data.elements)) return out;
  const ids = new Set();
  for (const e of data.elements) {
    if (!e || typeof e !== "object") continue;
    const at = `elements[${e.id}]`;
    if (ids.has(e.id)) out.push(`${at}: duplicate id`);
    ids.add(e.id);
    for (const k of ["rest", "hover", "pressed", "disabled"]) if (idx(e[k]) < 0) out.push(`${at}.${k}: "${e[k]}" is not a tier`);
    if (e.dragged !== null && e.dragged !== undefined && idx(e.dragged) < 0) out.push(`${at}.dragged: "${e.dragged}" is not a tier or null`);
    if ([e.rest, e.hover, e.pressed, e.disabled].some((t) => idx(t) < 0)) continue;
    // States (DS-ELEVATION-003): hover goes up at most one tier and never down, pressed goes down at most one tier and never up.
    if (idx(e.hover) < idx(e.rest) || idx(e.hover) > idx(e.rest) + 1) out.push(`${at}: hover is ${e.hover}, but it may only stay at ${e.rest} or go up one tier`);
    if (idx(e.pressed) > idx(e.rest) || idx(e.pressed) < idx(e.rest) - 1) {
      // A pressed surface may also drop to flat (none) in one step: a card whose shadow is replaced by an edge.
      if (e.pressed !== "none") out.push(`${at}: pressed is ${e.pressed}, but it may only stay at ${e.rest}, go down one tier or go flat`);
    }
    if (e.disabled !== "none" && e.disabled !== e.rest) out.push(`${at}: disabled is ${e.disabled}, but it must be flat (none) or unchanged from rest`);
    // Tier against layer (DS-ELEVATION-002).
    const layer = layers[e.layer];
    if (!LAYERS.includes(e.layer)) out.push(`${at}: layer "${e.layer}" is not one of ${LAYERS.join(", ")}`);
    else if (layer && Array.isArray(layer.tiers)) {
      if (e.rest !== "none" && !layer.tiers.includes(e.rest)) out.push(`${at}: rest tier ${e.rest} is not allowed on the ${e.layer} layer (${layer.tiers.join(", ")})`);
    }
    // A dragged item jumps up, never down (DS-ELEVATION-003).
    // A dragged item lifts out of its layer, so its tier is not limited by the layer. It must be a high tier.
    if (e.dragged && idx(e.dragged) < idx("large")) out.push(`${at}: dragged is ${e.dragged}, but a dragged item must be large or xlarge`);
    if (e.dragged && idx(e.dragged) < idx(e.rest)) out.push(`${at}: a dragged item cannot sit lower than rest`);
    // A docked element lives on an overlay or modal layer, where the directional shadow applies (DS-ELEVATION-006).
    if (e.dock && e.dock !== "none" && !["overlay", "modal"].includes(e.layer)) out.push(`${at}: dock ${e.dock} is only for an overlay or modal element`);
    // Built rows name a real registry component, proposed rows do not.
    if (e.status === "built") {
      if (!e.component) out.push(`${at}: a built element must name its registry component`);
      else {
        if (registryItems && !registryItems.has(e.component)) out.push(`${at}: ${e.component} is not an item in registry/registry.json`);
        const raw = readComponent(e.component);
        // Comments name tiers too. Only code counts.
        const src = raw === null ? null : raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
        if (src === null) { if (registryItems) out.push(`${at}: could not read the source of ${e.component}`); }
        else {
          // The source must use the token for every non-flat tier the map names (comments ignored). It does not check which state uses it.
          for (const k of ["rest", "hover", "pressed", "dragged"]) {
            const t = e[k];
            if (t && t !== "none" && !new RegExp(`--shadow-${t}(?![\\w-])`).test(src)) out.push(`${at}.${k}: ${e.component} never uses --shadow-${t}`);
          }
        }
      }
    } else if (e.status === "proposed" && e.component) out.push(`${at}: a proposed element has no component yet`);
  }
  return out;
}

export function loadAll(skill = SKILL, repo = REPO) {
  const schema = JSON.parse(readFileSync(join(skill, "data", "elevation-map.schema.json"), "utf8"));
  const data = JSON.parse(readFileSync(join(skill, "data", "elevation-map.json"), "utf8"));
  const regPath = join(repo, "registry", "registry.json");
  const registryItems = existsSync(regPath) ? new Set(JSON.parse(readFileSync(regPath, "utf8")).items.map((i) => i.name)) : null;
  const readComponent = (name) => {
    const short = name.replace(/^vois-/, "");
    const p = join(repo, "registry", "vois", short, `${short}.tsx`);
    return existsSync(p) ? readFileSync(p, "utf8") : null;
  };
  return { schema, data, registryItems, readComponent };
}

export function checkAll(opts) {
  const { schema, data, registryItems, readComponent } = loadAll(opts?.skill, opts?.repo);
  const s = validate(schema, data);
  // Fail closed: without the registry the map cannot be checked against the components it describes.
  const missing = registryItems ? [] : ["registry/registry.json is missing, so the map cannot be checked against the components"];
  return [...s, ...missing, ...semanticProblems(data, { registryItems, readComponent })];
}

const isEntry = (() => { try { return !!process.argv[1] && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]); } catch { return true; } })();
if (isEntry) {
  const problems = checkAll();
  if (problems.length) { console.error(problems.map((p) => "  " + p).join("\n")); console.error(`elevation-map: ${problems.length} problem(s)`); process.exit(1); }
  console.log("elevation-map: OK");
}

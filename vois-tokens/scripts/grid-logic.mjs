// Grid and panel maths for DS-GRID-* and DS-PANEL-* (vois-tokens/references/grid.md).
//
// Every function takes a `tokens` object. This file holds no token values: they come
// from your token source (or `vois_get_tokens`, if that tool is available) and the test passes a fixture. If you
// change a rule in grid.md, change the matching function here and the test.
//
// Shape of `tokens`:
//   grid.classes   [{ id, min, cols }]  sorted by min, lowest first
//   grid.margin    { from: {w, v}, to: {w, v} }  interpolated by region width, held at both ends
//   grid.gutter    { from: {w, v}, to: {w, v} }  same
//   grid.contentMax
//   nav            { rail, sidebar }
//   panel          { pushMin, pushDefault, pushMax, mainMin, overlayMin, overlay: {sm, md, lg}, paneMin }

const CLASS_IDS = ['narrow', 'sm', 'md', 'lg'];
const SHELLS = ['app', 'site'];
const TIERS = ['sm', 'md', 'lg'];
const fail = (msg) => { throw new Error(`grid-logic: ${msg}`); };
const num = (x, name) => { if (typeof x !== 'number' || !Number.isFinite(x)) fail(`${name} must be a finite number, got ${x}`); return x; };

/** Fails closed: a token set that is not the four classes in order, or has a bad anchor, throws. Called by every entry point. */
export function checkTokens(tokens) {
  const cs = tokens?.grid?.classes;
  if (!Array.isArray(cs) || cs.length !== CLASS_IDS.length) fail(`grid.classes must list ${CLASS_IDS.join(', ')}`);
  cs.forEach((c, i) => {
    if (c.id !== CLASS_IDS[i]) fail(`grid.classes[${i}] must be ${CLASS_IDS[i]}, got ${c.id}`);
    num(c.min, `${c.id}.min`); num(c.cols, `${c.id}.cols`);
    if (i > 0 && c.min <= cs[i - 1].min) fail(`${c.id}.min must be above ${cs[i - 1].id}.min`);
  });
  for (const k of ['margin', 'gutter']) {
    const a = tokens.grid[k];
    for (const e of ['from', 'to']) { num(a?.[e]?.w, `${k}.${e}.w`); num(a?.[e]?.v, `${k}.${e}.v`); }
    if (a.to.w <= a.from.w) fail(`${k}.to.w must be above ${k}.from.w`);
  }
  num(tokens.grid.contentMax, 'grid.contentMax'); num(tokens.nav?.rail, 'nav.rail'); num(tokens.nav?.sidebar, 'nav.sidebar');
  for (const k of ['pushMin', 'pushDefault', 'pushMax', 'mainMin', 'overlayMin', 'paneMin']) num(tokens.panel?.[k], `panel.${k}`);
  for (const t of TIERS) num(tokens.panel?.overlay?.[t], `panel.overlay.${t}`);
}

/** One segment of `clamp(from.v, from.v + (100cqi - from.w) * slope, to.v)`. Native code uses the same line. */
export function interpolate(anchor, w) {
  num(w, 'width');
  const { from, to } = anchor;
  if (w <= from.w) return from.v;
  if (w >= to.w) return to.v;
  return from.v + ((w - from.w) * (to.v - from.v)) / (to.w - from.w);
}

/** Highest grid class whose min is at or below `regionW`. Below the lowest min, the lowest class. */
export function classOf(tokens, regionW) {
  checkTokens(tokens);
  num(regionW, 'width');
  const cs = tokens.grid.classes;
  let hit = cs[0];
  for (const c of cs) if (regionW >= c.min) hit = c;
  return hit;
}

/** DS-GRID-001, DS-GRID-003, DS-GRID-004. `fill` is a page whose template says frame "fill": no content max. */
export function frame(tokens, regionW, { fill = false } = {}) {
  const c = classOf(tokens, regionW);
  const margin = interpolate(tokens.grid.margin, regionW);
  const gutter = interpolate(tokens.grid.gutter, regionW);
  const room = regionW - 2 * margin;
  const inner = fill ? room : Math.min(room, tokens.grid.contentMax);
  const col = (inner - (c.cols - 1) * gutter) / c.cols;
  return { id: c.id, cols: c.cols, margin, gutter, inner, col };
}

const classes = (t) => t.grid.classes;
const minOf = (t, id) => classes(t).find((c) => c.id === id).min;
const mdMin = (t) => minOf(t, 'md'); // first class with a rail
const lgMin = (t) => minOf(t, 'lg'); // first class with a sidebar

/** DS-GRID-002: nav width for the window. The app shell has a bottom bar, a rail, then a sidebar. */
export function navFor(tokens, windowW, shell) {
  checkTokens(tokens);
  num(windowW, 'windowW');
  if (!SHELLS.includes(shell)) fail(`shell must be app or site, got ${shell}`);
  if (shell !== 'app') return 0;
  if (windowW < mdMin(tokens)) return 0;
  if (windowW < lgMin(tokens)) return tokens.nav.rail;
  return tokens.nav.sidebar;
}

/** DS-GRID-002: the width the grid class is picked from. */
export function regionWidth(tokens, windowW, shell) {
  return windowW - navFor(tokens, windowW, shell);
}

/**
 * DS-GRID-007. count = max(1, min(cap[windowClass], floor((inner + gutter) / (itemMin + gutter)))).
 * `cap` is keyed by class id. The cap uses the window class. The fit uses the region.
 * Pass `containerW` to measure a container that is not the page region (a card area beside a sidebar,
 * say). Its own width is `inner`: page margins do not apply to it. The gutter is still the page's.
 * Pass `fill: true` for a page whose template says frame "fill".
 */
export function collectionCols(tokens, windowW, shell, cap, itemMin, containerW, { fill = false } = {}) {
  num(itemMin, 'itemMin');
  const cls = classOf(tokens, windowW).id;
  if (typeof cap?.[cls] !== 'number' || !Number.isInteger(cap[cls]) || cap[cls] < 1) fail(`cap must have a whole number of 1 or more for ${cls}`);
  const rw = regionWidth(tokens, windowW, shell);
  const f = frame(tokens, rw, { fill });
  const inner = containerW === undefined ? f.inner : num(containerW, 'containerW');
  const fit = Math.floor((inner + f.gutter) / (itemMin + f.gutter));
  return Math.max(1, Math.min(cap[cls], fit));
}

/** DS-PANEL-002 and DS-PANEL-003. The rail is assumed, so the answer never flips back as the window grows. */
export function pushFits(tokens, windowW, panel = tokens.panel.pushDefault) {
  checkTokens(tokens); num(windowW, 'windowW'); num(panel, 'panel');
  if (windowW < mdMin(tokens)) return false;
  return windowW - tokens.nav.rail - panel >= tokens.panel.mainMin;
}

/** DS-PANEL-004: the sidebar stays only if the main area still holds mainMin. Otherwise the rail. */
export function navWhilePushOpen(tokens, windowW, panel = tokens.panel.pushDefault) {
  checkTokens(tokens); num(windowW, 'windowW'); num(panel, 'panel');
  if (windowW < mdMin(tokens)) return 0;
  const full = tokens.nav.sidebar;
  if (windowW >= lgMin(tokens) && windowW - full - panel >= tokens.panel.mainMin) return full;
  return tokens.nav.rail;
}

/** DS-PANEL-006: min(tier, half the window, rounded down to a multiple of 4), never under overlayMin. Phones: full width. */
export function overlayWidth(tokens, windowW, tier) {
  checkTokens(tokens); num(windowW, 'windowW');
  if (!TIERS.includes(tier)) fail(`tier must be sm, md or lg, got ${tier}`);
  if (windowW < mdMin(tokens)) return windowW;
  const half = Math.floor(windowW / 2 / 4) * 4;
  return Math.max(tokens.panel.overlayMin, Math.min(tokens.panel.overlay[tier], half));
}

/** DS-PANEL-007: two panes of at least paneMin each, next to the nav. */
export function twoPaneFits(tokens, windowW) {
  checkTokens(tokens); num(windowW, 'windowW');
  if (windowW < mdMin(tokens)) return false;
  return windowW - navFor(tokens, windowW, 'app') >= 2 * tokens.panel.paneMin;
}

// The push-or-overlay decision of vois-tokens references/grid.md (DS-PANEL-002 to DS-PANEL-004), as plain
// functions. They are the same arithmetic as vois-tokens scripts/grid-logic.mjs (pushFits, navWhilePushOpen),
// and that file is the reference: change a rule there, change it here.
//
// No token value is written in this file. `readPanelTokens` reads them from the page's CSS variables, so a
// brand or workspace that overrides a token changes the answer. If any variable is missing, it returns null,
// and `panelMode` then answers "full": a full-screen panel needs no width to be right, so a missing token
// never lets a panel push the page off the screen.

type PanelTokens = {
  md: number
  lg: number
  rail: number
  sidebar: number
  mainMin: number
  push: { min: number; default: number; max: number }
}

type PanelMode = "push" | "overlay" | "full"
type NavMode = "bottom" | "rail" | "sidebar"
type PushWidth = "min" | "default" | "max"

const NAMES = {
  md: "--breakpoint-md",
  lg: "--breakpoint-lg",
  rail: "--nav-rail",
  sidebar: "--nav-sidebar",
  mainMin: "--main-min",
  pushMin: "--panel-push-min",
  pushDefault: "--panel-push-default",
  pushMax: "--panel-push-max",
} as const

/** The tokens, in pixels, as the page's CSS gives them. null if any one is missing or is not a plain length in px (no sign, no other unit). */
function readPanelTokens(el: Element): PanelTokens | null {
  const cs = getComputedStyle(el)
  const v: Record<string, number> = {}
  for (const [k, name] of Object.entries(NAMES)) {
    const raw = cs.getPropertyValue(name).trim()
    if (!/^(?:\d+\.?\d*|\.\d+)px$/.test(raw)) return null
    v[k] = parseFloat(raw)
  }
  return {
    md: v.md,
    lg: v.lg,
    rail: v.rail,
    sidebar: v.sidebar,
    mainMin: v.mainMin,
    push: { min: v.pushMin, default: v.pushDefault, max: v.pushMax },
  }
}

const finite = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n)

/** DS-PANEL-002 and DS-PANEL-003. Below md every panel is full screen. From md a panel pushes only if the
 * window, minus the rail, minus the panel, still leaves mainMin. The rail is assumed so the answer never flips
 * back as the window grows. Otherwise it overlays. Anything that cannot be read answers "full". */
function panelMode(t: PanelTokens | null, windowWidth: number | null, panelWidth: PushWidth = "default"): PanelMode {
  if (!t || !finite(windowWidth) || !Object.hasOwn(t.push, panelWidth)) return "full"
  if (windowWidth < t.md) return "full"
  return windowWidth - t.rail - t.push[panelWidth] >= t.mainMin ? "push" : "overlay"
}

/** DS-GRID-002 and DS-PANEL-004. The navigation the app shell should show. While a push panel is open the
 * sidebar stays only if the window, minus the sidebar, minus the panel, still leaves mainMin. Otherwise it is
 * the rail until the panel closes. `pushOpen` is true only for an open panel in push mode. */
function navMode(t: PanelTokens | null, windowWidth: number | null, pushOpen: boolean, panelWidth: PushWidth = "default"): NavMode {
  if (!t || !finite(windowWidth)) return "bottom"
  if (windowWidth < t.md) return "bottom"
  if (windowWidth < t.lg) return "rail"
  if (pushOpen && Object.hasOwn(t.push, panelWidth) && windowWidth - t.sidebar - t.push[panelWidth] < t.mainMin) return "rail"
  return "sidebar"
}

export { readPanelTokens, panelMode, navMode }
export type { PanelTokens, PanelMode, NavMode, PushWidth }

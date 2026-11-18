// Vois PanelLayout. There is no shadcn/ui equivalent. It places a vois-panel beside the main area of a page
// by the panel rules of vois-tokens references/grid.md (DS-PANEL-001 to DS-PANEL-006):
//
//   push    the panel sits inline and moves the main area over. Chosen from md up when the window, minus the
//           rail, minus the panel, still leaves --main-min (DS-PANEL-003).
//   overlay the panel floats over the page at the edge, NOT modal: no scrim, no focus trap, the page behind
//           stays usable. It is docked, so its shadow falls away from the edge, --shadow-large-right or
//           --shadow-large-left (DS-ELEVATION-006), on the modal layer (--z-modal), so a menu or hover card
//           opened from inside it stacks above it. Its width is the smallest of the tier (--panel-overlay-sm,
//           -md or -lg), half the window rounded down to a multiple of 4, never under --panel-overlay-min
//           (DS-PANEL-006). The width is CSS, so it follows the window while you drag it.
//   full    below md the panel is the whole screen (DS-PANEL-002) and the main area is inert behind it.
//
// The window width picks the mode, and the numbers come from the token variables (panel-logic.ts reads them),
// so a theme that overrides a token changes the answer. If a token is missing the panel is full screen.
// Pick the mode a panel is for in the template (DS-PANEL-001): push to look at the page and the panel together,
// overlay for a task that ends. This component only decides whether a push panel fits.
//
// Parts
//   PanelLayout       the row. `open`, `onOpenChange`, `side` ("right", the default, or "left"), `width` (the
//                     push width: "min", "default" or "max") and `overlay` (the overlay tier: "sm", "md" or
//                     "lg"). Give it a height: the panel takes the full height of its row in push mode.
//   PanelLayoutMain   the main area. It takes the rest of the row, and may shrink.
//   PanelLayoutPanel  a vois-panel that shows only when `open`. Pass the Panel parts as children, and an
//                     aria-label (or aria-labelledby): a panel is a landmark.
//   usePanelLayout    { mode, navMode, close }. `navMode` is what the app shell should show: "bottom" below
//                     md, a "rail" from md, a "sidebar" from lg, except that a sidebar folds to the rail while
//                     a push panel is open and would leave the main area under --main-min (DS-PANEL-004). The
//                     navigation is not part of this item. It reads `navMode` (or `data-nav-mode` on the row).
//
// Safe areas. A panel over the page (overlay or full) pads its edges by the safe-area insets, so its content stays
// clear of a notch, a rounded corner and the home bar (DS-RESPONSIVE-010).
//
// Focus. In overlay and full mode the panel takes focus when it opens and returns it to what had focus when it
// closes, and Escape closes it (DS-A11Y-021). In push mode the panel is part of the page: focus stays where it
// is and Escape does nothing, so close it with a button that calls `onOpenChange(false)` or `close()`.
//
// Two panes (a list beside a detail, DS-PANEL-007) is not here. It is a different decision: each pane needs
// --pane-min, and otherwise the detail is its own screen.
import * as React from "react"

import { cn } from "@/lib/utils"
import { Panel } from "@/components/ui/panel"
import { navMode as navModeOf, panelMode, readPanelTokens, type NavMode, type PanelMode, type PushWidth } from "@/lib/panel-logic"

type OverlayTier = "sm" | "md" | "lg"
type Side = "right" | "left"

type PanelLayoutContext = {
  measured: boolean
  mode: PanelMode
  navMode: NavMode
  side: Side
  width: PushWidth
  overlay: OverlayTier
  open: boolean
  close: () => void
}

const Context = React.createContext<PanelLayoutContext | null>(null)

function usePanelLayout(): PanelLayoutContext {
  const ctx = React.useContext(Context)
  if (!ctx) throw new Error("usePanelLayout: use it inside a <PanelLayout>")
  return ctx
}

// The window width, measured on the client. On the server it is null: nothing is guessed, and the panel waits.
function subscribeWidth(notify: () => void) {
  window.addEventListener("resize", notify)
  return () => window.removeEventListener("resize", notify)
}
const useWindowWidth = (): number | null =>
  React.useSyncExternalStore(subscribeWidth, () => document.documentElement.clientWidth, () => null)

const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

const OVERLAY_WIDTH: Record<OverlayTier, string> = {
  sm: "w-[max(var(--panel-overlay-min),min(var(--panel-overlay-sm),round(down,50vw,4px)))]",
  md: "w-[max(var(--panel-overlay-min),min(var(--panel-overlay-md),round(down,50vw,4px)))]",
  lg: "w-[max(var(--panel-overlay-min),min(var(--panel-overlay-lg),round(down,50vw,4px)))]",
}

function PanelLayout({
  open = false,
  onOpenChange,
  side = "right",
  width = "default",
  overlay = "md",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: Side
  width?: PushWidth
  overlay?: OverlayTier
}) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const windowWidth = useWindowWidth()
  const [tokens, setTokens] = React.useState<ReturnType<typeof readPanelTokens>>(null)
  // Tokens are read on the client once the row is in the page, and again when the window resizes (a media-query
  // theme may change them). Until then `tokens` is null and the answer is "full", which is why nothing shows on the server.
  useIsoLayoutEffect(() => {
    if (rootRef.current) setTokens(readPanelTokens(rootRef.current))
  }, [windowWidth])

  const mode = panelMode(tokens, windowWidth, width)
  const nav = navModeOf(tokens, windowWidth, open && mode === "push", width)
  const onOpenChangeRef = React.useRef(onOpenChange)
  onOpenChangeRef.current = onOpenChange
  const close = React.useCallback(() => onOpenChangeRef.current?.(false), [])
  const measured = windowWidth !== null
  const ctx = React.useMemo<PanelLayoutContext>(() => ({ measured, mode, navMode: nav, side, width, overlay, open, close }), [measured, mode, nav, side, width, overlay, open, close])

  return (
    <Context.Provider value={ctx}>
      <div
        ref={rootRef}
        data-slot="panel-layout"
        data-mode={measured ? mode : "unmeasured"}
        data-nav-mode={nav}
        data-open={open ? "true" : "false"}
        className={cn("relative flex min-h-0 w-full", className)}
        {...props}
      >
        {children}
      </div>
    </Context.Provider>
  )
}

function PanelLayoutMain({ className, ...props }: React.ComponentProps<"div">) {
  const { mode, open } = usePanelLayout()
  const ref = React.useRef<HTMLDivElement>(null)
  // A full-screen panel covers the main area, so it is inert (not reachable by keyboard or screen reader).
  // Set as a property: React 18 does not know the attribute.
  const covered = open && mode === "full"
  React.useEffect(() => {
    if (ref.current) ref.current.inert = covered
  }, [covered])
  return <div ref={ref} data-slot="panel-layout-main" className={cn("min-w-0 flex-1", className)} {...props} />
}

function PanelLayoutPanel({
  className,
  onKeyDown,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Panel>, "side" | "width">) {
  const { measured, mode, side, width, overlay, open, close } = usePanelLayout()
  // The window is not measured yet (the server, or the first client pass): draw nothing rather than guess a mode.
  const shown = open && measured
  const ref = React.useRef<HTMLElement | null>(null)
  const modeRef = React.useRef(mode)
  modeRef.current = mode

  // Focus moves in when an overlay or full panel opens, and back to where it was when it closes. A push panel is
  // part of the page, so it leaves focus alone. This runs when the panel appears and goes, not when a resize changes the mode.
  // A layout effect, so it runs before PanelLayoutMain makes the main area inert, which would drop focus first.
  useIsoLayoutEffect(() => {
    if (!shown || modeRef.current === "push") return
    const before = document.activeElement instanceof HTMLElement ? document.activeElement : null
    ref.current?.focus({ preventScroll: true })
    return () => {
      if (!before) return
      const restore = () => {
        if (before.isConnected) before.focus({ preventScroll: true })
      }
      restore()
      // Closing a full screen panel also lifts the inert on the main area, which is applied just after this runs,
      // so the first try can miss. Try once more next frame, and only if nothing else has taken focus meanwhile.
      if (document.activeElement !== before) {
        requestAnimationFrame(() => {
          if (document.activeElement === document.body || document.activeElement === null) restore()
        })
      }
    }
  }, [shown])

  if (!shown) return null
  const floating = mode !== "push"

  return (
    <Panel
      ref={ref as React.Ref<HTMLElement>}
      tabIndex={-1}
      side={side}
      width={width}
      data-mode={mode}
      onKeyDown={(e) => {
        onKeyDown?.(e)
        if (e.defaultPrevented || e.key !== "Escape" || mode === "push") return
        e.stopPropagation()
        close()
      }}
      className={cn(
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)]",
        // Beside the main area: it keeps its own width (the push-panel token) and sits at its side of the row.
        !floating && (side === "right" ? "order-last" : "order-first"),
        // Over the page: docked to its edge, on the modal layer, the Large shadow that falls away from that edge,
        // and the raised fill (the same fill a Dialog has in dark, and the card fill in light).
        floating && "fixed inset-y-0 z-[var(--z-modal)] bg-[color:var(--elevation-surface-raised)]",
        mode === "overlay" && OVERLAY_WIDTH[overlay],
        mode === "full" && "inset-x-0 w-full border-0 pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]",
        // A panel at the edge of the screen keeps its content clear of a notch, a rounded corner or the home bar.
        floating && "pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]",
        floating && side === "right" && "right-0 shadow-[var(--shadow-large-right)]",
        floating && side === "left" && "left-0 shadow-[var(--shadow-large-left)]",
        mode === "overlay" && (side === "right" ? "pr-[env(safe-area-inset-right,0px)]" : "pl-[env(safe-area-inset-left,0px)]"),
        className
      )}
      {...props}
    >
      {children}
    </Panel>
  )
}

export { PanelLayout, PanelLayoutMain, PanelLayoutPanel, usePanelLayout }
export type { PanelMode, NavMode, OverlayTier }

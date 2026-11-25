// Vois Menubar. shadcn/ui's components/ui/menubar.tsx (Radix Menubar) with the same parts: Menubar, MenubarMenu,
// MenubarTrigger, MenubarContent, MenubarItem, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem,
// MenubarLabel, MenubarSeparator, MenubarShortcut, MenubarGroup, MenubarSub, MenubarSubTrigger,
// MenubarSubContent and MenubarPortal.
//
// From the Figma Menubar (`5188:14596`), Menubar Item (`5188:14584`) and Menubar Menu (`5188:15143`) in the
// Vois Figma file:
//   Bar: --bg-card fill, 1px --border-default edge, --shape-subtle corners, 4 padding, 4 between triggers (Figma has 2, which is not on the 4 grid).
//   Trigger: 12 by 6 padding, 14/20 medium, --shape-subtle corners, --text-secondary.
//     Active (its menu is open) --bg-hover fill with --text-state-hover. Focus a 2px --border-state-focus
//     edge. Disabled --text-state-disabled.
//   Menu: 196 wide at least, 1px --border-default edge, --shape-subtle corners, --shadow-large. Items sit in groups with
//     6 padding, and a full-width 1px --border-pretty line between groups.
//   Item: 40 tall, 12 left and 8 right padding, 8 between parts, --shape-subtle corners, 14/20 medium. Resting
//     --select-resting with --text-state-resting. A shortcut is 12/16 medium at the end. A sub menu item
//     ends in a 20 chevron. Disabled is --text-state-disabled.
//
// Gaps in Figma, with the choice made here:
//   - The menu has no highlighted, checked or destructive item look. They take the Dropdown Menu's:
//     --select-hover when highlighted, --select-soft-active with --text-accent and a mark when checked, and
//     --text-negative on --select-negative for variant="destructive".
//   - The shortcut is bound to --text-state-instruction, which was gray-6 (under 4.5:1) until the change in
//     source/figma-pending.json, so it uses --text-hint, as the Dropdown Menu does.
//   - The menu padding is 6 in Figma and there is no 6 token, so it is written as 4 plus 2.
//
// Keyboard (Radix): one tab stop for the bar. Left and Right move between triggers and, when a menu is open,
// open the neighbour menu. Enter, Space and Down open a menu, Up and Down move inside it, Right opens a sub
// menu and Left closes it, Escape closes it and returns focus to its trigger. Typing a letter jumps to an item.
// Home and End go to the first and last item.
//
// Added here, because Radix does not do them:
//   - Up on a trigger opens its menu on the last item.
//   - Tab inside an open menu closes it and moves focus to the next tab stop after the bar (Shift+Tab, the one
//     before it). Radix blocks Tab in a menu.
//   - A safe triangle for hover. While a menu is open, moving the mouse from its trigger toward the menu does not
//     switch to a trigger the pointer crosses on the way. The triangle runs from where the pointer left to the
//     near corners of the open menu. A move along the bar is outside it, so switching still works.
//
// Use it for a row of command menus at the top of an app or editor (File, Edit, View). For one menu behind one
// button use DropdownMenu. For links to pages use NavigationMenu.
import * as React from "react"
import { Menubar as MenubarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Check(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="M20 6 9 17l-5-5" /></svg>
}
function Dot(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><circle cx="12" cy="12" r="5" /></svg>
}
function ChevronRight(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="m9 18 6-6-6-6" /></svg>
}

// Radix waits for the close animation before it unmounts the menu, so the fade needs keyframes.
const menuKeyframes =
  "@keyframes vois-menu-in{from{opacity:0;transform:scale(0.96)}}@keyframes vois-menu-out{to{opacity:0;transform:scale(0.96)}}"

const surface = [
  "z-[var(--z-dropdown)] min-w-[196px] overflow-x-hidden overflow-y-auto p-[calc(var(--space-4)+2px)]",
  "rounded-[var(--shape-subtle)] border border-[color:var(--border-default)] bg-[color:var(--elevation-surface-popup)] text-[color:var(--text-primary)] shadow-[var(--shadow-large)]",
  "motion-safe:data-[state=open]:animate-[vois-menu-in_var(--motion-duration-fast)_var(--motion-ease-standard)]",
  "motion-safe:data-[state=closed]:animate-[vois-menu-out_var(--motion-duration-instant)_var(--motion-ease-standard)_forwards]",
  "motion-reduce:animate-none",
]

const itemBase = [
  "relative flex w-full min-h-[var(--size-40)] cursor-default items-center gap-[var(--space-padding-x-small)] rounded-[var(--shape-subtle)] select-none",
  "py-[var(--space-padding-2x-small)] pr-[var(--space-padding-x-small)] pl-[var(--space-padding-small)]",
  "bg-[color:var(--select-resting)] text-[color:var(--text-state-resting)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-medium)]",
  "outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)]",
  "data-[highlighted]:bg-[color:var(--select-hover)] data-[highlighted]:text-[color:var(--text-state-hover)]",
  "data-[disabled]:pointer-events-none data-[disabled]:bg-transparent data-[disabled]:text-[color:var(--text-state-disabled)]",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[var(--size-20)]",
]

const checkedItem =
  "data-[state=checked]:not-data-[highlighted]:not-data-[disabled]:bg-[color:var(--select-soft-active)] data-[state=checked]:not-data-[disabled]:text-[color:var(--text-accent)]"

// Shared by the bar, its triggers and its menus.
type MenubarIntent = {
  setValue: (value: string) => void
  lastPoint: React.MutableRefObject<{ x: number; y: number } | null>
  entry: React.MutableRefObject<"first" | "last">
}
const IntentContext = React.createContext<MenubarIntent | null>(null)
const MenuValueContext = React.createContext<string>("")

type Point = { x: number; y: number }
function cross(a: Point, b: Point, c: Point) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
}
// True when p is inside the triangle a, b, c (edges count as inside).
function inTriangle(p: Point, a: Point, b: Point, c: Point) {
  const d1 = cross(a, b, p)
  const d2 = cross(b, c, p)
  const d3 = cross(c, a, p)
  const neg = d1 < 0 || d2 < 0 || d3 < 0
  const pos = d1 > 0 || d2 > 0 || d3 > 0
  return !(neg && pos)
}
// The open menu of this bar, found through the trigger it is labelled by.
function openContentFor(bar: Element | null): HTMLElement | null {
  if (!bar) return null
  const open = bar.querySelector<HTMLElement>('[data-slot="menubar-trigger"][data-state="open"]')
  if (!open?.id) return null
  return document.querySelector<HTMLElement>(`[data-slot="menubar-content"][aria-labelledby="${CSS.escape(open.id)}"]`)
}

const TABBABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
// The tab stop after the bar (or before it, for Shift+Tab), skipping everything inside the bar.
function tabStopOutside(bar: Element, backwards: boolean): HTMLElement | null {
  const all = Array.from(document.querySelectorAll<HTMLElement>(TABBABLE)).filter(
    (el) => !bar.contains(el) && !el.closest('[data-slot="menubar-content"]') && el.getClientRects().length > 0,
  )
  const before = all.filter((el) => bar.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING)
  const after = all.filter((el) => bar.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)
  return backwards ? (before[before.length - 1] ?? null) : (after[0] ?? null)
}

function Menubar({
  className,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onPointerMove,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  // The bar owns the open value so a trigger can open its own menu from a key Radix does not handle.
  const [inner, setInner] = React.useState(defaultValue)
  const value = valueProp ?? inner
  const setValue = React.useCallback(
    (next: string) => {
      if (valueProp === undefined) setInner(next)
      onValueChange?.(next)
    },
    [valueProp, onValueChange],
  )
  const lastPoint = React.useRef<Point | null>(null)
  const entry = React.useRef<"first" | "last">("first")
  const intent = React.useMemo(() => ({ setValue, lastPoint, entry }), [setValue])
  return (
    <IntentContext.Provider value={intent}>
      <MenubarPrimitive.Root
        data-slot="menubar"
        value={value}
        onValueChange={setValue}
        // The point before the pointer entered a trigger is the tip of the safe triangle.
        onPointerMove={(event) => {
          onPointerMove?.(event)
          if (event.pointerType === "mouse") lastPoint.current = { x: event.clientX, y: event.clientY }
        }}
        className={cn(
          "flex w-fit items-center justify-center gap-[var(--space-4)] rounded-[var(--shape-subtle)] border border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-[var(--space-4)]",
          className,
        )}
        {...props}
      />
    </IntentContext.Provider>
  )
}

function MenubarMenu({ value, ...props }: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  // Radix makes up an id when there is none. The trigger needs the value to open its own menu.
  const generated = React.useId()
  const menuValue = value ?? generated
  return (
    <MenuValueContext.Provider value={menuValue}>
      <MenubarPrimitive.Menu data-slot="menubar-menu" value={menuValue} {...props} />
    </MenuValueContext.Provider>
  )
}

function MenubarGroup(props: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />
}

function MenubarPortal(props: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />
}

function MenubarRadioGroup(props: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
}

function MenubarTrigger({
  className,
  onPointerEnter,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  const intent = React.useContext(IntentContext)
  const menuValue = React.useContext(MenuValueContext)
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      onPointerEnter={(event) => {
        onPointerEnter?.(event)
        if (event.defaultPrevented || event.pointerType !== "mouse" || !intent?.lastPoint.current) return
        // Entering a trigger while another menu is open: if the pointer is heading for that menu, stay put.
        const bar = event.currentTarget.closest('[data-slot="menubar"]')
        const content = openContentFor(bar)
        if (!content || content.dataset.state !== "open") return
        const from = intent.lastPoint.current
        const rect = content.getBoundingClientRect()
        const edgeY = rect.top >= from.y ? rect.top : rect.bottom
        const here = { x: event.clientX, y: event.clientY }
        if (inTriangle(here, from, { x: rect.left, y: edgeY }, { x: rect.right, y: edgeY })) event.preventDefault()
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented || props.disabled) return
        // Up opens the menu on its last item. Radix opens on Down only.
        if (event.key === "ArrowUp" && intent) {
          event.preventDefault()
          intent.entry.current = "last"
          intent.setValue(menuValue)
        }
      }}
      className={cn(
        "relative flex cursor-default items-center justify-center rounded-[var(--shape-subtle)] px-[var(--space-padding-small)] py-[calc(var(--space-4)+2px)] outline-none select-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)]",
        "text-center text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-medium)] text-[color:var(--text-secondary)]",
        "transition-[background-color,color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
        "hover:not-data-[disabled]:bg-[color:var(--bg-hover)] hover:not-data-[disabled]:text-[color:var(--text-state-hover)]",
        "data-[state=open]:bg-[color:var(--bg-hover)] data-[state=open]:text-[color:var(--text-state-hover)]",
        "data-[disabled]:pointer-events-none data-[disabled]:text-[color:var(--text-state-disabled)]",
        // A taller pointer target without a taller trigger.
        "after:absolute after:top-1/2 after:left-0 after:h-full after:min-h-[var(--hit-area-min)] after:w-full after:-translate-y-1/2 after:content-['']",
        className,
      )}
      {...props}
    />
  )
}

// Mounts only while a menu is open. When Up opened the menu, Radix leaves focus on the menu itself (it was not
// a key Radix knows), and Up from there goes to the last item.
function LastItemEntry() {
  const intent = React.useContext(IntentContext)
  React.useEffect(() => {
    if (intent?.entry.current !== "last") return
    const frame = requestAnimationFrame(() => {
      intent.entry.current = "first"
      const trigger = document.querySelector('[data-slot="menubar-trigger"][data-state="open"]')
      const id = trigger?.getAttribute("aria-controls")
      const el = id ? document.getElementById(id) : null
      if (el) {
        el.focus({ preventScroll: true })
        el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true }))
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [intent])
  return null
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = 0,
  sideOffset = 8,
  collisionPadding = 8,
  children,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  const intent = React.useContext(IntentContext)
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented || event.key !== "Tab" || !intent) return
          // Tab leaves the bar. Close the menu and move on, as the ARIA menubar pattern says.
          event.preventDefault()
          const labelledBy = event.currentTarget.getAttribute("aria-labelledby")
          const trigger = labelledBy ? document.getElementById(labelledBy) : null
          const root = trigger?.closest('[data-slot="menubar"]') ?? null
          intent.setValue("")
          const next = root ? tabStopOutside(root, event.shiftKey) : null
          requestAnimationFrame(() => next?.focus())
        }}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(surface, "max-h-(--radix-menubar-content-available-height) origin-(--radix-menubar-content-transform-origin)", className)}
        {...props}
      >
        <style href="vois-menu-keyframes" precedence="default">
          {menuKeyframes}
        </style>
        <LastItemEntry />
        {children}
      </MenubarPrimitive.Content>
    </MenubarPrimitive.Portal>
  )
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & { inset?: boolean; variant?: "default" | "destructive" }) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset ? "" : undefined}
      data-variant={variant}
      className={cn(
        itemBase,
        inset && "pl-[var(--space-40)]",
        variant === "destructive" &&
          "text-[color:var(--text-negative)] data-[highlighted]:bg-[color:var(--select-negative)] data-[highlighted]:text-[color:var(--text-negative)] data-[disabled]:text-[color:var(--text-state-disabled)]",
        className,
      )}
      {...props}
    />
  )
}

function MenubarCheckboxItem({ className, children, checked, ...props }: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      checked={checked}
      className={cn(itemBase, checkedItem, className)}
      {...props}
    >
      <span className="flex size-[var(--size-20)] items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <Check />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  )
}

function MenubarRadioItem({ className, children, ...props }: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
  return (
    <MenubarPrimitive.RadioItem data-slot="menubar-radio-item" className={cn(itemBase, checkedItem, className)} {...props}>
      <span className="flex size-[var(--size-20)] items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <Dot />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  )
}

function MenubarLabel({ className, inset, ...props }: React.ComponentProps<typeof MenubarPrimitive.Label> & { inset?: boolean }) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset ? "" : undefined}
      className={cn(
        "px-[var(--space-padding-small)] py-[var(--space-padding-2x-small)] text-[color:var(--text-hint)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-semi-bold)]",
        inset && "pl-[var(--space-40)]",
        className,
      )}
      {...props}
    />
  )
}

// The Figma line between groups runs edge to edge, so it cancels the menu's padding.
function MenubarSeparator({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn("-mx-[calc(var(--space-4)+2px)] my-[calc(var(--space-4)+2px)] h-px bg-[color:var(--border-pretty)]", className)}
      {...props}
    />
  )
}

function MenubarShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn("ml-auto text-[color:var(--text-hint)] text-[length:var(--font-size-tiny)] leading-[var(--line-height-tiny)] [font-weight:var(--font-weight-medium)]", className)}
      {...props}
    />
  )
}

function MenubarSub(props: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
}

function MenubarSubTrigger({ className, inset, children, ...props }: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & { inset?: boolean }) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset ? "" : undefined}
      className={cn(itemBase, "data-[state=open]:bg-[color:var(--select-hover)]", inset && "pl-[var(--space-40)]", className)}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto" />
    </MenubarPrimitive.SubTrigger>
  )
}

function MenubarSubContent({ className, collisionPadding = 8, children, ...props }: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      collisionPadding={collisionPadding}
      className={cn(surface, "origin-(--radix-menubar-content-transform-origin)", className)}
      {...props}
    >
      <style href="vois-menu-keyframes" precedence="default">
        {menuKeyframes}
      </style>
      {children}
    </MenubarPrimitive.SubContent>
  )
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}

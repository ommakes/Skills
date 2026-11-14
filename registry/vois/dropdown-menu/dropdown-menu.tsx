// Vois DropdownMenu. shadcn/ui's components/ui/dropdown-menu.tsx (Radix DropdownMenu) with the same parts:
// DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel,
// DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem,
// DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger,
// DropdownMenuSubContent and DropdownMenuPortal.
//
// From the Figma Dropdown Menu (Selectors page, 6609:8499) and Menu Item (2812:5192) sets, the same list as the
// Vois Select:
//   Surface: --bg-card, a 1px --border-pretty edge, --shape-rounded corners, --shadow-medium, 8 padding, on
//     --z-dropdown. It fades and grows from the trigger in --motion-duration-fast, and fades out in
//     --motion-duration-instant; under reduced motion it appears and goes at once.
//   Item: 40 tall (size="sm" is 32), 12 padding on the left and 8 on the right, 8 between parts, --shape-subtle
//     corners, 14/20 text. A leading icon is 20. A DropdownMenuShortcut is 12/16 medium at the end.
//   States: resting --select-resting with --text-state-resting. Highlighted (pointer hover or arrow keys) is
//     --select-hover. Keyboard focus adds a 2px inside --border-state-focus ring. A checked item is
//     --select-soft-active with --text-accent and a check mark. Disabled has no fill and --text-state-disabled.
//     variant="destructive" is the Figma Error state: --text-negative, and --select-negative when highlighted.
//   Label: 14/20 semibold, the Figma section helper text. Separator: the Figma Menu List Divider, a 1px
//     --border-default line inset 24 with 12 above and below.
// Gaps in Figma, with the choice made here: the shortcut and the label are bound to --text-state-instruction (gray-6),
// which is under 4.5:1 on a card, so they use --text-hint, which reaches it. Figma's Solid Active and Aux item
// states are not built: nothing in a menu needs them yet.
//
// Which state wins: disabled, then highlighted, then checked, then resting. A checked item that is also highlighted
// shows the hover fill and keeps its accent text and check mark.
//
// Known gap: a menu opened from inside a Dialog renders behind it, because --z-dropdown (1000) is under --z-modal
// (1300) and Radix portals the menu to the page. The z-index ladder has the same problem for the Select, the
// HoverCard and the Tooltip. The fix is a token decision (see registry/FIGMA-TODO.md), not a change here.
//
// Serves vois-components JOB-EXPOSE-ACTIONS (a set of actions behind one trigger). For choosing a value for a field,
// use the Select.
import * as React from "react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"

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
  "z-[var(--z-dropdown)] min-w-[8rem] overflow-x-hidden overflow-y-auto p-[var(--space-padding-x-small)]",
  "rounded-[var(--shape-rounded)] border border-[color:var(--border-pretty)] bg-[color:var(--bg-card)] text-[color:var(--text-primary)] shadow-[var(--shadow-medium)]",
  "motion-safe:data-[state=open]:animate-[vois-menu-in_var(--motion-duration-fast)_var(--motion-ease-standard)]",
  "motion-safe:data-[state=closed]:animate-[vois-menu-out_var(--motion-duration-instant)_var(--motion-ease-standard)_forwards]",
  "motion-reduce:animate-none",
]

// Every item shares this. data-* variants come after hover and focus, so each is guarded.
const itemBase = [
  "relative flex w-full cursor-default items-center gap-[var(--space-padding-x-small)] rounded-[var(--shape-subtle)] select-none",
  "py-[var(--space-padding-2x-small)] pr-[var(--space-padding-x-small)] pl-[var(--space-padding-small)]",
  "bg-[color:var(--select-resting)] text-[color:var(--text-state-resting)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)]",
  "outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)]",
  "data-[highlighted]:bg-[color:var(--select-hover)] data-[highlighted]:text-[color:var(--text-state-hover)]",
  "data-[disabled]:pointer-events-none data-[disabled]:bg-transparent data-[disabled]:text-[color:var(--text-state-disabled)]",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[var(--size-20)]",
]

function DropdownMenu(props: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal(props: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

function DropdownMenuTrigger(props: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  collisionPadding = 8,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          surface,
          "max-h-(--radix-dropdown-menu-content-available-height) origin-(--radix-dropdown-menu-content-transform-origin)",
          className
        )}
        {...props}
      >
        <style href="vois-menu-keyframes" precedence="default">
          {menuKeyframes}
        </style>
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup(props: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuItem({
  className,
  inset,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & { inset?: boolean; size?: "default" | "sm"; variant?: "default" | "destructive" }) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset ? "" : undefined}
      data-variant={variant}
      data-size={size}
      className={cn(
        itemBase,
        size === "sm" ? "min-h-[var(--size-32)]" : "min-h-[var(--size-40)]",
        inset && "pl-[var(--space-40)]",
        variant === "destructive" &&
          "text-[color:var(--text-negative)] data-[highlighted]:bg-[color:var(--select-negative)] data-[highlighted]:text-[color:var(--text-negative)] data-[disabled]:text-[color:var(--text-state-disabled)]",
        className
      )}
      {...props}
    />
  )
}

// Checked items show their mark at the start, in a 20 box, so labels line up with plain items that have an icon.
function DropdownMenuCheckboxItem({ className, children, checked, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      checked={checked}
      className={cn(
        itemBase,
        "min-h-[var(--size-40)]",
        "data-[state=checked]:not-data-[highlighted]:not-data-[disabled]:bg-[color:var(--select-soft-active)] data-[state=checked]:not-data-[disabled]:text-[color:var(--text-accent)]",
        className
      )}
      {...props}
    >
      <span className="flex size-[var(--size-20)] items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup(props: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

function DropdownMenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        itemBase,
        "min-h-[var(--size-40)]",
        "data-[state=checked]:not-data-[highlighted]:not-data-[disabled]:bg-[color:var(--select-soft-active)] data-[state=checked]:not-data-[disabled]:text-[color:var(--text-accent)]",
        className
      )}
      {...props}
    >
      <span className="flex size-[var(--size-20)] items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Dot />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({ className, inset, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset ? "" : undefined}
      className={cn(
        "px-[var(--space-padding-small)] py-[var(--space-padding-2x-small)] text-[color:var(--text-hint)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-semi-bold)]",
        inset && "pl-[var(--space-40)]",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("mx-[var(--space-24)] my-[var(--space-12)] h-px bg-[color:var(--border-default)]", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn("ml-auto text-[color:var(--text-hint)] text-[length:var(--font-size-tiny)] leading-[var(--line-height-tiny)] [font-weight:var(--font-weight-medium)]", className)}
      {...props}
    />
  )
}

function DropdownMenuSub(props: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({ className, inset, children, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & { inset?: boolean }) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset ? "" : undefined}
      className={cn(itemBase, "min-h-[var(--size-40)]", "data-[state=open]:bg-[color:var(--select-hover)]", inset && "pl-[var(--space-40)]", className)}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({ className, collisionPadding = 8, children, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      collisionPadding={collisionPadding}
      className={cn(surface, "origin-(--radix-dropdown-menu-content-transform-origin)", className)}
      {...props}
    >
      <style href="vois-menu-keyframes" precedence="default">
        {menuKeyframes}
      </style>
      {children}
    </DropdownMenuPrimitive.SubContent>
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}

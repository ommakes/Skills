// Vois NavigationMenu. shadcn/ui's components/ui/navigation-menu.tsx (Radix NavigationMenu) with these parts:
// NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent,
// NavigationMenuLink, NavigationMenuViewport, plus three that the Figma set needs: NavigationMenuTitle,
// NavigationMenuDescription and NavigationMenuHero. `navigationMenuTriggerStyle` gives a plain top-level link
// (one with no panel) the same look as a trigger. Drawn from the Figma Nav Menu Button (`6609:8647`), Nav Menu
// Content Block (`6609:8518`) and Nav Menu (`6609:8580`) sets in the Vois Figma file.
//
// From Figma:
//   Trigger: 40 tall, 12 by 8 padding, 4 between the label and a 24 chevron (Figma has 5, which is not on the 4 grid), --radius-selectors corners, 16/24
//     semibold. Default is --text-state-resting with a chevron down. Hover is --bg-hover with --text-state-hover
//     and a chevron up. Pressed (the panel is open) is --bg-pressed with --text-state-active and a chevron up.
//   Panel: --bg-subtle fill, 1px --border-default edge, --radius-small-container corners, 24 padding
//     (--space-padding-large), 40 between columns, each column 286 wide with 24 between blocks.
//   Block (NavigationMenuLink with a Title and a Description): 12 padding, 4 between the lines,
//     --radius-small-container corners. Title 16/24 semibold --text-primary. Description 16/24 medium
//     --text-subtle. Hover is --bg-hover.
//   Hero (NavigationMenuHero): the "2 Column w Hero" layout. A 286 wide column, 16 by 24 padding, a gradient
//     from --bg-subtle at the top to --bg-default at the bottom, content at the bottom, a 40 icon above the title.
//
// Gaps in Figma, with the choice made here:
//   - Figma draws the panel as one box and does not say how it opens. Radix puts every panel in one shared
//     viewport under the list, which resizes between panels, and the surface is drawn on that viewport.
//   - There is no focus look. A 2px --border-state-focus outline is drawn inside the trigger and the block.
//   - The panel's shadow is not drawn. It uses --shadow-large, the same as the Menubar's menu.
//   - The Radix indicator (the little arrow under the active trigger) is not drawn in Figma and is not exported.
//
// Keyboard (Radix): Left and Right move between triggers, Enter, Space and Down open a panel, Tab goes into it and
// through its links, Escape closes it and returns focus to its trigger. Up and Down move inside a panel's links
// when the list is vertical. A link's `active` prop sets aria-current="page".
//
// Use it for the main links of a site, where some entries open a panel of described links. For a row of
// command menus use Menubar. For one short list of actions use DropdownMenu. For a list of 4 or fewer
// plain links, a row of links is enough.
import * as React from "react"
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function ChevronDown(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="m6 9 6 6 6-6" /></svg>
}

// Radix unmounts a closed panel after its exit animation, so the fade needs keyframes.
const navKeyframes =
  "@keyframes vois-nav-in{from{opacity:0;transform:translateY(-4px)}}@keyframes vois-nav-out{to{opacity:0;transform:translateY(-4px)}}"

function NavigationMenu({ className, children, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Root>) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn("relative z-[var(--z-dropdown)] flex max-w-max flex-1 items-center justify-center", className)}
      {...props}
    >
      <style href="vois-nav-keyframes" precedence="default">
        {navKeyframes}
      </style>
      {children}
      <NavigationMenuViewport />
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn("group flex flex-1 list-none items-center justify-center gap-[var(--space-4)]", className)}
      {...props}
    />
  )
}

function NavigationMenuItem({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" className={cn("relative", className)} {...props} />
}

const navigationMenuTriggerStyle = [
  "relative inline-flex h-[var(--size-40)] w-max cursor-pointer items-center justify-center gap-[var(--space-4)] whitespace-nowrap select-none",
  "rounded-[var(--radius-selectors)] bg-transparent px-[var(--space-padding-small)] py-[var(--space-padding-x-small)]",
  "text-[length:var(--font-size-small)] leading-[var(--line-height-small)] [font-weight:var(--font-weight-semi-bold)] text-[color:var(--text-state-resting)]",
  "transition-[background-color,color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
  "hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--text-state-hover)]",
  "data-[state=open]:bg-[color:var(--bg-pressed)] data-[state=open]:text-[color:var(--text-state-active)]",
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)]",
  "disabled:pointer-events-none disabled:text-[color:var(--text-state-disabled)]",
  "after:absolute after:top-1/2 after:left-0 after:h-full after:min-h-[var(--hit-area-min)] after:w-full after:-translate-y-1/2 after:content-['']",
].join(" ")

function NavigationMenuTrigger({ className, children, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger data-slot="navigation-menu-trigger" className={cn(navigationMenuTriggerStyle, "group/trigger", className)} {...props}>
      {children}
      <ChevronDown
        className="size-6 shrink-0 transition-transform duration-[var(--motion-duration-fast)] motion-reduce:transition-none group-hover/trigger:rotate-180 group-data-[state=open]/trigger:rotate-180"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "top-0 left-0 w-full p-[var(--space-padding-large)] md:absolute md:w-auto",
        "motion-safe:data-[state=open]:animate-[vois-nav-in_var(--motion-duration-fast)_var(--motion-ease-standard)]",
        "motion-safe:data-[state=closed]:animate-[vois-nav-out_var(--motion-duration-instant)_var(--motion-ease-standard)_forwards]",
        "motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  )
}

function NavigationMenuViewport({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div className="absolute top-full left-0 isolate z-[var(--z-dropdown)] flex justify-center">
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "relative mt-[var(--space-8)] h-[var(--radix-navigation-menu-viewport-height)] w-full origin-top overflow-hidden md:w-[var(--radix-navigation-menu-viewport-width)]",
          "rounded-[var(--radius-small-container)] border border-[color:var(--border-default)] bg-[color:var(--bg-subtle)] shadow-[var(--shadow-large)]",
          "transition-[width,height] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
          "data-[state=closed]:hidden",
          className,
        )}
        {...props}
      />
    </div>
  )
}

function NavigationMenuLink({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "flex flex-col gap-[var(--space-padding-2x-small)] rounded-[var(--radius-small-container)] p-[var(--space-padding-small)] no-underline outline-none",
        "text-[length:var(--font-size-small)] leading-[var(--line-height-small)] text-[color:var(--text-primary)]",
        "transition-[background-color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
        "hover:bg-[color:var(--bg-hover)] focus-visible:bg-[color:var(--bg-hover)]",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[color:var(--border-state-focus)]",
        "data-[active]:bg-[color:var(--bg-hover)]",
        className,
      )}
      {...props}
    />
  )
}

function NavigationMenuTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="navigation-menu-title"
      className={cn("block text-[length:var(--font-size-small)] leading-[var(--line-height-small)] [font-weight:var(--font-weight-semi-bold)] text-[color:var(--text-primary)]", className)}
      {...props}
    />
  )
}

function NavigationMenuDescription({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="navigation-menu-description"
      className={cn("block text-[length:var(--font-size-small)] leading-[var(--line-height-small)] [font-weight:var(--font-weight-medium)] text-[color:var(--text-subtle)]", className)}
      {...props}
    />
  )
}

// The "2 Column w Hero" column. Put a NavigationMenuLink inside it, with a 40 icon, a Title and a Description.
function NavigationMenuHero({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="navigation-menu-hero"
      className={cn(
        "flex w-[286px] flex-col justify-end self-stretch rounded-[var(--radius-small-container)] bg-gradient-to-t from-[color:var(--bg-default)] to-[color:var(--bg-subtle)]",
        "px-[var(--space-padding-medium)] py-[var(--space-padding-large)] [&_svg]:size-10",
        className,
      )}
      {...props}
    />
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuTitle,
  NavigationMenuDescription,
  NavigationMenuHero,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
}

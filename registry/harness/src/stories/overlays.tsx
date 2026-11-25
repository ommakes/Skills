import * as React from "react"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Story } from "../frame"

// A modal overlay (dialog, command palette) hides the rest of the page from assistive technology, so the open pages
// leave the trigger out. A focusable control under an aria-hidden page is what axe reports as aria-hidden-focus.

export const dialog: Story = {
  title: "Dialog",
  items: ["vois-dialog"],
  render: ({ state }) => (
    <Dialog open={state === "open" ? true : undefined}>
      {state === "open" ? null : <DialogTrigger asChild><Button>Delete project</Button></DialogTrigger>}
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Delete project Atlas?</DialogTitle>
          <DialogDescription>You cannot undo this.</DialogDescription>
        </DialogHeader>
        <DialogBody>This removes its 14 files for everyone on the team.</DialogBody>
        <DialogFooter>
          <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
          <Button variant="destructive-soft">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  states: { open: { expect: "[role=dialog]" } },
}

export const alertDialog: Story = {
  title: "Alert dialog",
  items: ["vois-alert-dialog"],
  render: ({ state }) => (
    <AlertDialog open={state === "open" ? true : undefined}>
      {state === "open" ? null : <AlertDialogTrigger asChild><Button variant="destructive-soft">Delete project</Button></AlertDialogTrigger>}
      <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete project Atlas?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>This removes its 14 files for everyone on the team. You cannot undo it.</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive-soft">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  states: { open: { expect: "[role=alertdialog]" } },
}

export const dropdownMenu: Story = {
  title: "Dropdown menu",
  items: ["vois-dropdown-menu"],
  render: ({ state }) => {
    return (
      <DropdownMenu open={state === "open" ? true : undefined}>
        <DropdownMenuTrigger asChild><Button variant="secondary">Options</Button></DropdownMenuTrigger>
        <DropdownMenuContent className="w-60" align="start">
          <DropdownMenuLabel>Document</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem>Rename<DropdownMenuShortcut>F2</DropdownMenuShortcut></DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem disabled>Move (unavailable)</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked>Show comments</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>Show ruler</DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value="list">
            <DropdownMenuRadioItem value="list">List view</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="grid">Grid view</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
              <DropdownMenuItem>Email</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
  states: { open: { expect: "[data-slot=dropdown-menu-content]" } },
}

export const command: Story = {
  title: "Command",
  items: ["vois-command", "vois-dialog"],
  render: ({ state }) => (
    <div className="flex max-w-md flex-col gap-6">
      <Command className="rounded-[var(--shape-rounded)] border border-[color:var(--border-default)]">
        <CommandInput placeholder="Type a command or search" aria-label="Search commands" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Search emoji</CommandItem>
            <CommandItem disabled>Calculator (unavailable)</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Settings">
            <CommandItem>Profile<CommandShortcut>Ctrl P</CommandShortcut></CommandItem>
            <CommandItem>Billing<CommandShortcut>Ctrl B</CommandShortcut></CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
      <CommandDialog open={state === "open" ? true : undefined}>
        <CommandInput placeholder="Jump to" aria-label="Jump to" />
        <CommandList>
          <CommandGroup heading="Pages">
            <CommandItem>Dashboard</CommandItem>
            <CommandItem>Reports</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  ),
  states: { open: { expect: "[role=dialog]" } },
}

export const hoverCard: Story = {
  title: "Hover card",
  items: ["vois-hover-card"],
  render: ({ state }) => (
    <HoverCard open={state === "open" ? true : undefined}>
      <HoverCardTrigger asChild><a href="#ada" className="underline">@ada</a></HoverCardTrigger>
      <HoverCardContent>
        <div className="flex gap-3">
          <Avatar><AvatarFallback>AL</AvatarFallback></Avatar>
          <div>
            <p className="[font-weight:var(--font-weight-semi-bold)]">Ada Lovelace</p>
            <p className="text-[length:var(--font-size-xsmall)]">Mathematician. Joined in March.</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
  states: { open: { expect: "[data-slot=hover-card-content]" } },
}

export const popover: Story = {
  title: "Popover",
  items: ["vois-popover"],
  render: ({ state }) => (
    <Popover open={state === "open" ? true : undefined}>
      <PopoverTrigger asChild><Button variant="secondary">Change status</Button></PopoverTrigger>
      <PopoverContent aria-label="Change status" onOpenAutoFocus={(e) => e.preventDefault()}>
        <p className="[font-weight:var(--font-weight-semi-bold)] text-[color:var(--text-primary)] text-[length:var(--font-size-small)] leading-[var(--line-height-small)]">Change status</p>
        <p>Pick the status for this row. It saves when you choose one.</p>
        <div className="mt-3 flex justify-end">
          <PopoverClose asChild><Button variant="secondary">Done</Button></PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  ),
  states: { open: { expect: "[data-slot=popover-content]" } },
}

/**
 * A CommandSeparator inside the list. cmdk's own separator has role="separator", which a listbox may not own, so axe reported
 * aria-required-children until registry 0.21.3 drew the divider itself. The page stays so a regression fails the check.
 */
export const commandSeparator: Story = {
  title: "Command, with a separator",
  items: ["vois-command"],
  render: () => (
    <Command className="max-w-md rounded-[var(--shape-rounded)] border border-[color:var(--border-default)]">
      <CommandInput placeholder="Type a command" aria-label="Search commands" />
      <CommandList>
        <CommandGroup heading="Files"><CommandItem>Open</CommandItem></CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings"><CommandItem>Profile</CommandItem></CommandGroup>
      </CommandList>
    </Command>
  ),
}

const LINES = ["Atlas", "Borealis", "Cinder", "Delta", "Ember", "Fjord", "Gale", "Harbor", "Isle", "Juniper", "Kestrel", "Lumen"]

type Edge = "bottom" | "top" | "left" | "right"

function DrawerExample({ direction, open, size }: { direction: Edge; open: boolean; size?: "sm" | "md" | "lg" }) {
  return (
    <Drawer direction={direction} open={open ? true : undefined}>
      {open ? null : <DrawerTrigger asChild><Button variant="secondary">Open {direction}</Button></DrawerTrigger>}
      <DrawerContent size={size} onOpenAutoFocus={open ? (e) => e.preventDefault() : undefined}>
        <DrawerHeader>
          <DrawerTitle>Move 3 projects</DrawerTitle>
          <DrawerDescription>Pick where they go. You can move them back later.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody tabIndex={0}>
          <ul className="flex flex-col gap-2">
            {LINES.map((n) => <li key={n}>Project {n}</li>)}
          </ul>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild><Button variant="secondary">Cancel</Button></DrawerClose>
          <Button>Move</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export const drawer: Story = {
  title: "Drawer",
  items: ["vois-drawer", "vois-button"],
  render: ({ state }) => {
    if (state === "open") return <DrawerExample direction="bottom" open />
    if (state === "right") return <DrawerExample direction="right" open />
    return (
      <div className="flex flex-wrap gap-3">
        {(["bottom", "top", "left", "right"] as const).map((d) => <DrawerExample key={d} direction={d} open={false} />)}
      </div>
    )
  },
  states: { open: { expect: "[data-slot=drawer-content][data-vaul-drawer-direction=bottom]" }, right: { expect: "[data-slot=drawer-content][data-vaul-drawer-direction=right]" } },
}

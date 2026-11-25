import * as React from "react"
import type { Story } from "../frame"
import { Row } from "../frame"
import { Calendar } from "@/components/ui/calendar"
import { Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar"
import { NavigationMenu, NavigationMenuContent, NavigationMenuDescription, NavigationMenuHero, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTitle, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

export const pagination: Story = {
  title: "Pagination",
  items: ["vois-pagination"],
  render: () => (
    <div className="flex flex-col gap-6">
      <Row label="Middle page">
        <Pagination>
          <PaginationContent>
            <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
            <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
            <PaginationItem><PaginationEllipsis /></PaginationItem>
            <PaginationItem><PaginationLink href="#">100</PaginationLink></PaginationItem>
            <PaginationItem><PaginationNext href="#" /></PaginationItem>
          </PaginationContent>
        </Pagination>
      </Row>
      <Row label="First page, Previous disabled">
        <Pagination aria-label="pagination, first page">
          <PaginationContent>
            <PaginationItem><PaginationPrevious href="#" disabled /></PaginationItem>
            <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink href="#" disabled>3</PaginationLink></PaginationItem>
            <PaginationItem><PaginationNext href="#" /></PaginationItem>
          </PaginationContent>
        </Pagination>
      </Row>
    </div>
  ),
}

export const menubar: Story = {
  title: "Menubar",
  items: ["vois-menubar"],
  render: ({ state }) => (
    <Menubar value={state === "open" ? "file" : undefined} aria-label="Application menu">
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <MenubarItem>New Tab <MenubarShortcut>⌘T</MenubarShortcut></MenubarItem>
          <MenubarItem>New Window <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
          <MenubarItem disabled>New Incognito Window</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Email link</MenubarItem>
              <MenubarItem>Copy link</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarCheckboxItem checked>Always show bookmarks <MenubarShortcut>⌘B</MenubarShortcut></MenubarCheckboxItem>
          <MenubarItem variant="destructive">Close all windows</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="edit">
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent><MenubarItem>Undo</MenubarItem></MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="view">
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent><MenubarItem>Zoom in</MenubarItem></MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="share">
        <MenubarTrigger disabled>Share</MenubarTrigger>
        <MenubarContent><MenubarItem>Email link</MenubarItem></MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
  states: { open: { expect: "[role=menu]" } },
}

const SmileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><path d="M8.5 14a4 4 0 0 0 7 0M9 9.5h.01M15 9.5h.01" />
  </svg>
)

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li>
      <NavigationMenuLink href="#">
        <NavigationMenuTitle>{title}</NavigationMenuTitle>
        <NavigationMenuDescription>{children}</NavigationMenuDescription>
      </NavigationMenuLink>
    </li>
  )
}

export const navigationMenu: Story = {
  title: "Navigation menu",
  items: ["vois-navigation-menu"],
  render: ({ state }) => (
    <div className="min-h-[520px]">
      <NavigationMenu value={state === "open" ? "start" : undefined} aria-label="Main">
        <NavigationMenuList>
          <NavigationMenuItem value="start">
            <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="flex flex-col gap-[var(--space-24)] md:flex-row md:gap-[var(--space-40)]">
                <NavigationMenuHero className="hidden md:flex">
                  <NavigationMenuLink href="#">
                    <SmileIcon />
                    <NavigationMenuTitle>Section title</NavigationMenuTitle>
                    <NavigationMenuDescription>Write a simple sentence that fits into maximum two lines of words.</NavigationMenuDescription>
                  </NavigationMenuLink>
                </NavigationMenuHero>
                <ul className="flex w-[286px] max-w-full flex-col gap-[var(--space-24)]">
                  <Block title="Section title">Write a simple sentence that fits into maximum two lines of words.</Block>
                  <Block title="Another section">Write a simple sentence that fits into maximum two lines of words.</Block>
                  <Block title="Third section">Write a simple sentence that fits into maximum two lines of words.</Block>
                </ul>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="guides">
            <NavigationMenuTrigger>Guides</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="flex w-[286px] max-w-full flex-col gap-[var(--space-24)]">
                <Block title="Guide one">Write a simple sentence that fits into maximum two lines of words.</Block>
                <Block title="Guide two">Write a simple sentence that fits into maximum two lines of words.</Block>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#" className={navigationMenuTriggerStyle}>Pricing</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  ),
  states: { open: { expect: "[data-slot=navigation-menu-viewport][data-state=open]" } },
}

export const calendar: Story = {
  title: "Calendar",
  items: ["vois-calendar"],
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      <Calendar mode="single" month={new Date(2024, 5, 1)} selected={new Date(2024, 5, 7)} defaultMonth={new Date(2024, 5, 1)} />
      <Calendar
        mode="range"
        month={new Date(2024, 5, 1)}
        defaultMonth={new Date(2024, 5, 1)}
        selected={{ from: new Date(2024, 5, 10), to: new Date(2024, 5, 14) }}
        disabled={[{ before: new Date(2024, 5, 3) }, new Date(2024, 5, 20)]}
      />
    </div>
  ),
}

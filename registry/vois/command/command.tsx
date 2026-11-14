// Vois Command. shadcn/ui's components/ui/command.tsx (cmdk) with the same parts: Command, CommandDialog,
// CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut and CommandSeparator.
//
// From the Figma Command Menu (Molecules page, 5256:7993), Cmd Menu Search and Cmd Menu List:
//   Surface: --bg-card, --shape-rounded corners. Command itself has no edge or shadow, so it can sit in a Popover
//     or a Dialog. CommandDialog is the Figma menu: a 460 wide Dialog (--border-default edge, --shadow-large).
//   Search row: 56 tall, 16 above and below and 24 at the sides, a 20 search icon in --icon-state-resting, 16/24
//     --text-primary text, --text-hint placeholder, and a 1px --border-default line under it.
//   List: 12 padding, up to 320 tall, scrolling inside. A group heading is 14/20 semibold --text-hint (the Figma section
//     helper text, which binds --text-state-instruction, gray-6, under 4.5:1; --text-hint reaches it).
//   Item: 40 tall (Figma has 36 and 40), 6 above and below and 16 at the sides, 12 between parts, --shape-subtle
//     corners, 14/20 medium text. cmdk keeps keyboard focus in the input and marks one item selected, so selected is
//     the Figma Hover look: --bg-hover. Pressed is --bg-pressed. Disabled is --text-state-disabled with no fill.
//   Keyboard: the selected item also gets a 2px inside --border-state-focus ring while the input has keyboard focus,
//     because --bg-hover alone is about 1.1:1 and a keyboard user needs a clearer sign of where they are.
// Figma's Active state (--select-soft-active, the current choice) is not built: a command list has no current value.
//
// cmdk sets its own ids on the input, the list and the items, so a custom `id` on them is ignored. Select them by
// their data-slot, or by the `value` you gave an item (cmdk writes it to data-value).
//
// Serves vois-components JOB-EXPOSE-ACTIONS (a searchable list of actions, a command palette) and JOB-CHOOSE-FROM-LIST
// for a long list. cmdk does the filtering and the arrow keys, Home and End, and Enter. Install vois-dialog with it.
import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

function SearchIcon(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
}

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "group/command flex h-full w-full flex-col overflow-hidden rounded-[var(--shape-rounded)] bg-[color:var(--bg-card)] text-[color:var(--text-primary)]",
        className
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = "Command palette",
  description = "Search for a command to run",
  children,
  className,
  ...props
}: React.ComponentProps<typeof Dialog> & { title?: string; description?: string; className?: string }) {
  return (
    <Dialog {...props}>
      <DialogContent showCloseButton={false} className={cn("w-[460px] max-w-[calc(100vw-var(--space-32))] overflow-hidden p-0", className)}>
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-[var(--size-56)] items-center gap-[var(--space-padding-x-small)] border-b border-[color:var(--border-default)] px-[var(--space-padding-large)] has-[[cmdk-input]:focus-visible]:outline-2 has-[[cmdk-input]:focus-visible]:-outline-offset-2 has-[[cmdk-input]:focus-visible]:outline-[color:var(--border-state-focus)]"
    >
      <SearchIcon className="size-[var(--size-20)] shrink-0 text-[color:var(--icon-state-resting)]" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "flex h-full w-full bg-transparent text-[color:var(--text-primary)] text-[length:var(--font-size-small)] leading-[var(--line-height-small)] outline-hidden",
          "placeholder:text-[color:var(--text-hint)] disabled:cursor-not-allowed disabled:text-[color:var(--text-state-disabled)]",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn("max-h-[320px] scroll-py-[var(--space-padding-small)] overflow-x-hidden overflow-y-auto p-[var(--space-padding-small)]", className)}
      {...props}
    />
  )
}

function CommandEmpty(props: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-[var(--space-padding-large)] text-center text-[color:var(--text-secondary)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)]"
      {...props}
    />
  )
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "overflow-hidden text-[color:var(--text-primary)]",
        "[&_[cmdk-group-heading]]:px-[var(--space-padding-medium)] [&_[cmdk-group-heading]]:py-[var(--space-padding-x-small)] [&_[cmdk-group-heading]]:text-[color:var(--text-hint)] [&_[cmdk-group-heading]]:text-[length:var(--font-size-xsmall)] [&_[cmdk-group-heading]]:leading-[var(--line-height-xsmall)] [&_[cmdk-group-heading]]:[font-weight:var(--font-weight-semi-bold)]",
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return <CommandPrimitive.Separator data-slot="command-separator" className={cn("-mx-[var(--space-padding-small)] my-[var(--space-padding-x-small)] h-px bg-[color:var(--border-default)]", className)} {...props} />
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "relative flex min-h-[var(--size-40)] cursor-default items-center gap-[var(--space-padding-small)] rounded-[var(--shape-subtle)] px-[var(--space-padding-medium)] py-[var(--space-padding-2x-small)] select-none",
        "text-[color:var(--text-primary)] text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-medium)]",
        // data-* comes after active in the stylesheet, so pressed is written with both, to win over selected.
        "data-[selected=true]:bg-[color:var(--bg-hover)] active:bg-[color:var(--bg-pressed)] data-[selected=true]:active:bg-[color:var(--bg-pressed)]",
        // The input keeps keyboard focus, so the selected item shows where the keyboard is with a ring.
        "group-has-[[cmdk-input]:focus-visible]/command:data-[selected=true]:outline-2 group-has-[[cmdk-input]:focus-visible]/command:data-[selected=true]:-outline-offset-2 group-has-[[cmdk-input]:focus-visible]/command:data-[selected=true]:outline-[color:var(--border-state-focus)]",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:text-[color:var(--text-state-disabled)]",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[var(--size-20)]",
        className
      )}
      {...props}
    />
  )
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn("ml-auto text-[color:var(--text-hint)] text-[length:var(--font-size-tiny)] leading-[var(--line-height-tiny)] [font-weight:var(--font-weight-medium)]", className)}
      {...props}
    />
  )
}

export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator }

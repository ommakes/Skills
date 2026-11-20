// Vois IconButton. An icon-only Button whose accessible name is a required prop, so it cannot be left out
// (vois-tokens DS-A11Y-007, DS-ICON-005). Use it for every icon-only action instead of <Button size="icon">.
//
// - `label` says what the button does ("Add to favorites", not "Heart"). It becomes aria-label and the tooltip text.
//   A missing, non-string or empty label is reported in the console, never thrown, because TypeScript cannot rule out
//   "" and a JavaScript caller or a translation lookup can pass undefined. A caller's aria-label or aria-labelledby is
//   dropped (TypeScript lets hyphenated attributes through), so the name is always the label.
// - `icon` is the glyph. It is hidden from assistive tech, and the Button sizes it.
// - Sizes are the Button's icon sizes: icon-sm 28, icon 36 (the default), icon-lg 48, each one step up on a coarse
//   pointer, and circular 56, which stays 56. The hit area comes from vois-button (DS-ICON-003).
// - `type` defaults to "button", so an icon action inside a form (add a row, clear) does not submit it.
// - The variant defaults to ghost, the icon-button default (DS-ICON-007). soft and glass are the other icon styles.
// - The label shows as a Tooltip on hover and focus and never replaces the name (DS-ICON-005). It is visual only: the
//   trigger does not point aria-describedby at it, so a screen reader does not hear the name twice (a caller's own
//   aria-describedby is kept). A disabled button's tooltip never opens, because it cannot take focus (DS-A11Y-029).
//   `tooltip={false}` turns it off, for a button whose label is already visible nearby. The element tree is the same
//   either way, so toggling `disabled` (while saving, say) does not replace the button and lose focus.
//
// Button's own types stay loose on purpose: shadcn components (Sidebar, Carousel) name their icon buttons with
// sr-only text, which TypeScript cannot see, and a stricter Button would stop them compiling. vois-tokens DS-ICON-005
// still flags an unnamed <Button size="icon"> in the hook and the CI gate.
//
// Needs vois-button and vois-tooltip (it imports both).
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type IconButtonSize = "icon-sm" | "icon" | "icon-lg" | "circular"

type IconButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "size" | "children" | "leadingIcon" | "trailingIcon" | "asChild" | "aria-label" | "aria-labelledby"
> & {
  /** What the button does, in words a person would say. Becomes the accessible name and the tooltip. */
  label: string
  /** The glyph, such as a lucide icon. Hidden from assistive tech and sized by the Button. */
  icon: React.ReactNode
  size?: IconButtonSize
  /** Show the label as a tooltip on hover and focus. Default true; never shown while disabled. */
  tooltip?: boolean
  /** Which side the tooltip opens on. */
  tooltipSide?: React.ComponentProps<typeof TooltipContent>["side"]
}

/** Whether the tooltip may open: undefined lets Radix open it on hover and focus, false keeps it closed. */
export function tooltipOpen({ tooltip, disabled }: { tooltip: boolean; disabled?: boolean }): false | undefined {
  return tooltip && !disabled ? undefined : false
}

// The Button under the tooltip trigger. Radix's Slot merges the trigger's props into these, including an
// aria-describedby that points at the tooltip, and an explicit undefined does not override it there. So the name and
// description are set here, after everything else: aria-label is always the label (TypeScript does not check
// hyphenated attributes, so an aria-label or aria-labelledby could arrive in props), and aria-describedby is the
// caller's or none, never the tooltip's, which repeats the name.
function NamedButton({
  label,
  describedBy,
  ...props
}: React.ComponentProps<typeof Button> & { label: string; describedBy?: string }) {
  return <Button {...props} aria-label={label} aria-labelledby={undefined} aria-describedby={describedBy} />
}

function IconButton({ label, icon, size = "icon", variant = "ghost", type = "button", tooltip = true, tooltipSide, disabled, ...props }: IconButtonProps) {
  if (typeof label !== "string" || label.trim() === "") {
    console.error("IconButton: `label` is missing or empty, so the button has no accessible name (DS-A11Y-007).")
  }
  return (
    // One tree whatever `tooltip` and `disabled` are, so the button is never remounted.
    <Tooltip open={tooltipOpen({ tooltip, disabled })}>
      <TooltipTrigger asChild>
        <NamedButton
          size={size}
          variant={variant}
          type={type}
          disabled={disabled}
          {...props}
          label={label}
          describedBy={props["aria-describedby"]}
        >
          {/* inline-flex, not contents: Button fades its direct children while loading, and opacity does nothing on a
              display: contents box. */}
          <span aria-hidden="true" className="inline-flex">
            {icon}
          </span>
        </NamedButton>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>{label}</TooltipContent>
    </Tooltip>
  )
}

export { IconButton }
export type { IconButtonProps, IconButtonSize }

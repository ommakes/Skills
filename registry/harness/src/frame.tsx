import * as React from "react"

/** What a story gets. `id` makes an element id unique per theme, because each story renders once in light and once in dark. */
export type StoryProps = { theme: "light" | "dark"; state: string | null; id: (name: string) => string }

/**
 * One page of the harness. `states` lists the extra states the story can show (`/<id>?state=<name>`), each one a
 * state in vois-render.json with the selector that must exist on that page.
 */
export type Story = {
  title: string
  /** The registry items this page exercises. scripts/check-harness.mjs fails when a registry:ui item is on no page. */
  items: string[]
  render: (props: StoryProps) => React.ReactNode
  states?: Record<string, { expect: string }>
}

/** A row of examples with a caption, so a page reads as a list of variants. */
export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const id = React.useId()
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-2">
      <p id={id} className="text-[length:var(--font-size-tiny)] text-[color:var(--text-secondary)]">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

export const PlusIcon = (props: React.ComponentProps<"svg">) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

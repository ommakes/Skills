import * as React from "react"
import { createRoot } from "react-dom/client"
import { cn } from "@/lib/utils"
import { STORIES } from "./stories"

const THEMES = ["light", "dark"] as const

function Index() {
  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="text-[length:var(--font-size-large)] [font-weight:var(--font-weight-semi-bold)]">Vois registry harness</h1>
      <p className="mt-2">One page per registry component. The rendered accessibility check opens each of them.</p>
      <ul className="mt-4 flex flex-col gap-1">
        {Object.entries(STORIES).map(([id, s]) => (
          <li key={id}>
            <a className="underline" href={`/${id}`}>{s.title}</a>
          </li>
        ))}
      </ul>
    </main>
  )
}

function Page({ id, state, only }: { id: string; state: string | null; only: "light" | "dark" | null }) {
  // Own properties only: STORIES["constructor"] and the like are inherited and must read as "not found".
  const story = Object.hasOwn(STORIES, id) ? STORIES[id] : undefined
  if (!story) {
    return (
      <main className="p-4">
        <h1>Not found</h1>
        <p>No story called {id}.</p>
      </main>
    )
  }
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-4 p-4">
      <h1 className="text-[length:var(--font-size-large)] [font-weight:var(--font-weight-semi-bold)]">{story.title}</h1>
      {THEMES.filter((t) => only === null || t === only).map((theme) => (
        <section
          key={theme}
          aria-label={`${story.title} in the ${theme} theme`}
          className={cn(theme === "dark" && "dark", "rounded-[var(--radius-card)] border border-[color:var(--border-default)] bg-[color:var(--bg-background)] p-4 text-[color:var(--text-primary)]")}
        >
          {story.render({ theme, state, id: (name) => `${name}-${theme}` })}
        </section>
      ))}
    </main>
  )
}

const path = window.location.pathname.replace(/^\/+|\/+$/g, "")
const query = new URLSearchParams(window.location.search)
const state = query.get("state")
// A page with ?theme=dark or ?theme=light shows that theme alone, and dark goes on <html> so overlays that render in a
// portal (select, dialog, menus) are dark too. A page with a ?state= and no theme shows light alone, because two open
// overlays at once would fight over focus. Any other page shows both themes, one after the other.
const only = query.get("theme") === "dark" ? "dark" : query.get("theme") === "light" ? "light" : state !== null ? "light" : null
if (only === "dark") document.documentElement.classList.add("dark")
createRoot(document.getElementById("root")!).render(path === "" ? <Index /> : <Page id={path} state={state} only={only} />)

# Accessibility harness

A small app that renders every registry component and its states, one page each, so the rendered accessibility check has something to open. It is a dev tool for this repo's CI. It is not a registry item, and nothing in this folder reaches a consumer.

The check itself is `vois-loop/scripts/render-check.mjs` (axe, focus rings, reduced motion, sideways scrolling) with `vois-loop/scripts/a11y-baseline.mjs`. The workflows are `.github/workflows/a11y.yml` (every pull request), `a11y-release.yml` (releases) and `a11y-reusable.yml` (the shared job). A pull request fails on a FAIL finding that `registry/a11y-baseline.json` does not list.

## Run it

```bash
cd registry
npm ci --ignore-scripts
npm run harness                    # builds harness/dist and serves it on http://localhost:3000 (PORT changes the port)
```

Then, from `registry/` in a second terminal (it needs `playwright` with Chromium, and `axe-core`; without `axe-core` the run says axe was skipped):

```bash
npm i --no-save --no-package-lock --ignore-scripts playwright axe-core
node ../vois-loop/scripts/render-check.mjs --manifest vois-render.json --out .vois/render
node ../vois-loop/scripts/a11y-baseline.mjs --report .vois/render/report.json --baseline a11y-baseline.json
```

`.vois/render` holds `report.json` and a screenshot per page. Open `http://localhost:3000/` for a list of the pages.

## How it is built

- `build.mjs` bundles `src/main.tsx` with esbuild and compiles `src/app.css` with Tailwind. The components import `@/components/ui/<name>` and `@/lib/<name>`, which resolve only inside an app. The build resolves them from the install targets in `registry.json`, so the harness renders the files the registry ships. `@/lib/utils` (shadcn's `cn`) is the one file that is not a registry file: `src/lib/utils.ts`.
- `src/app.css` wires the items the way the registry README tells an app to: tokens first, then the theme.
- A page shows the **light and the dark theme one after the other**, each in its own region. A `?theme=dark` or `?theme=light` page shows one theme, and dark also goes on `<html>`, so overlays that render in a portal (select, menus, dialog) are dark too. A page with a `?state=` and no theme shows light alone, because two open overlays at once would fight over focus.
- `serve.mjs` answers `app.js` and `app.css` by name and every other path with the page. It is for CI and local checks only.

## Add a component

1. Add a story in `src/stories/` and register it in `src/stories/index.ts`. The id is the page path and the surface id, so it is lowercase with dashes.
2. List the registry items it shows in `items`. `scripts/check-harness.mjs` fails when a `registry:ui` item is on no page.
3. Give each overlay or open state a `states` entry (`/<id>?state=<name>`, with the selector that must exist). Overlay pages render the open state in both themes: `<name>` and `<name>-dark`.
4. Run `node harness/build.mjs --manifest` to rewrite `vois-render.json`. The check fails if it is not what the stories give.
5. Run the rendered check. A new FAIL is either a real problem to fix, or (rarely) a known limit of the tools, which goes in the baseline with its reason in the table below.

Keep **one known problem per page**. The baseline key is the check, the page, the state and the viewport, so an entry also hides a second, different problem of the same kind on that page. That is why the solid destructive Button, the disabled Card and the other cases below each have a page of their own.

## What the baseline holds, and why

Each row is a page and state with its known problem, on both viewports. Fixing one means removing its entries from `a11y-baseline.json` (the run lists fixed ones).

| Page | Check | What it is |
|---|---|---|
| `button-destructive` | `axe:color-contrast` | **Real.** White text on `--solid-negative-resting` is 4.16:1 in the default tokens, in both themes, under 4.5:1 for 14px text. |
| `select-placeholder` | `axe:color-contrast` | **Real.** The Select placeholder is #7e7e7e: 4.05:1 on white and 3.84:1 on the error fill, under 4.5:1. |
| `questionnaire-nps` | `axe:label` | **Real.** The NPS range input has no accessible name. The question title is the fieldset legend, which names the group, not the input. |
| `command-separator` | `axe:aria-required-children` | **Real by axe's rule.** A `CommandSeparator` inside the list puts a `separator` in a `listbox`, which may hold options and groups only. |
| `card-disabled`, `choice-card-disabled` | `axe:color-contrast` | **Exempt, but axe cannot tell.** The text is the disabled color (4.05:1 light, 3.78:1 dark). WCAG 1.4.3 exempts text in an inactive component, and these are `div`s, not disabled controls. |
| `scroll-area` | `axe:scrollable-region-focusable` | **Tool limit.** The viewport has no `tabindex`. Chromium (checked on 157) makes a scroll container with no focusable child focusable, so the keyboard works there. axe cannot know that. The component relies on the browser doing it. |
| `select`, `dropdown-menu`: `open`, `open-dark` | `axe:aria-hidden-focus` | **Tool limit.** An open Radix select or menu is modal: it hides the page with `aria-hidden` and traps focus, and the trigger is still focusable under it. This is the usual axe report for Radix modals. |
| `command`: `open`, `open-dark` | `focus-visible` | **Tool limit.** Radix focuses the input when the palette opens, so the checker's "before focus" look is already the focused look and it sees no change. The Dialog page avoids this with `onOpenAutoFocus`; `CommandDialog` does not pass that prop through. |
| `step-slider` | `focus-visible` | **Tool limit.** The ring is drawn around the thumb, on an element the checker does not compare. The ring shows (checked by eye in Chromium). |

## What it does not check

These are limits of the run, not findings. `report.json` lists them under `not_checked`.

- **Focus rings on roving-focus widgets are not verified.** For a radio group, tabs, a segmented control or a choice list, the checker marks the group's wrapper as the tab stop, but Tab lands on the item inside it, so it never reads the item's focus style. The run reports "Tab reached 0 of 2" (or part of the controls) for those pages.
- Hover, press and touch behaviour, hit area size, and anything behind a click.
- How a page looks. Screenshots are saved for a person to look at; nothing is compared pixel by pixel.
- Whether an animation is decorative. Every one that survives reduced motion is a WARN for a person to judge.
- It tests each component as this harness arranges it. A product page that composes them another way can still fail.

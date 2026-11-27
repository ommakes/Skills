# Accessibility harness

A small app that renders every registry component and its states, one page each, so the rendered accessibility check has something to open. It is a dev tool for this repo's CI. It is not a registry item, and nothing in this folder reaches a consumer.

The check itself is `vois-loop/scripts/render-check.mjs` (axe, focus rings, reduced motion, sideways scrolling) with `vois-loop/scripts/a11y-baseline.mjs`, both in the private repo only. The workflows, also private only, are `.github/workflows/a11y.yml` (every pull request), `a11y-release.yml` (releases) and `a11y-reusable.yml` (the shared job). A pull request fails on a FAIL finding that `registry/a11y-baseline.json` does not list.

## Run it

```bash
cd registry
npm ci --ignore-scripts
npm run harness                    # builds harness/dist and serves it on http://localhost:3000 (PORT changes the port)
```

Then, from `registry/` in a second terminal (private repo only, where `vois-loop` lives; it needs `playwright` with Chromium, and `axe-core`; without `axe-core` the run says axe was skipped):

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

Keep **one known problem per page**. The baseline key is the check, the page, the state and the viewport, so an entry also hides a second, different problem of the same kind on that page. That is why the disabled Card, the open select and the other cases below each have a page of their own. Four pages still exist only because they once held a real problem (`button-destructive`, `select-placeholder`, `questionnaire-nps`, `command-separator`, fixed in registry 0.22.1). They now guard the fix: any finding on them fails the check.

## What the baseline holds, and why

Each row is a page and state with its known problem, on both viewports. None of them is a bug to fix in the registry: each is a case axe or the checker cannot judge. Fixing one means removing its entries from `a11y-baseline.json` (the run lists fixed ones).

| Page | Check | What it is |
|---|---|---|
| `card-disabled`, `choice-card-disabled` | `axe:color-contrast` | **Exempt, but axe cannot tell.** The text is the disabled color (4.05:1 light, 3.78:1 dark). WCAG 1.4.3 exempts text in an inactive component, and these are `div`s, not disabled controls. |
| `scroll-area` | `axe:scrollable-region-focusable` | **Tool limit.** The viewport has no `tabindex`. Chromium (checked on 157) makes a scroll container with no focusable child focusable, so the keyboard works there. axe cannot know that. The component relies on the browser doing it. |
| `select`, `dropdown-menu`: `open`, `open-dark` | `axe:aria-hidden-focus` | **Tool limit.** An open Radix select or menu is modal: it hides the page with `aria-hidden` and traps focus, and the trigger is still focusable under it. This is the usual axe report for Radix modals. |
| `step-slider` | `focus-visible` | **Tool limit.** The ring is drawn around the thumb, on an element the checker does not compare. The ring shows (checked by eye in Chromium). |

## What it does not check

These are limits of the run, not findings. `report.json` lists them under `not_checked`.

- **Only one item per roving-focus group is read.** In a radio group, tabs, a segmented control or a choice list, one item is the tab stop (in Radix, the checked one), so Tab reaches that item and the checker reads its focus ring. The other items need the arrow keys, which the walk does not press, so the run lists them under `not_checked` ("Tab reached 2 of 4") and their rings are not verified.
- Hover, press and touch behaviour, hit area size, and anything behind a click.
- How a page looks. Screenshots are saved for a person to look at; nothing is compared pixel by pixel.
- Whether an animation is decorative. Every one that survives reduced motion is a WARN for a person to judge.
- It tests each component as this harness arranges it. A product page that composes them another way can still fail.

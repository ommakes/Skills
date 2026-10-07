# Lookalike pass 1: findings

30 blind builds (10 jobs x concrete, vague, hurried). Vois skills active, shadcn/ui stated as installed.
Method: `scan.mjs` on all 30, plus targeted greps for raw interactive elements, clickable non-buttons, close glyphs and inline status markup. I did not read every file line by line.

## Headline
No classic lookalikes. Across 30 files there was no `div`/`span` with `onClick`, no hand-built overlay, no `setTimeout` toast, no "x" close glyph, no `confirm()`, no fake switch, badge, tabs or breadcrumb. Every file used the expected component. Vague and hurried phrasing did not change that.

## Weak signals (what is left)
| Signal | Files | Meets 2+ rule? | Notes |
|---|---|---|---|
| Raw `<button>` styled as a text link (row title, folder row) with hand-written focus classes | LP-06a, 06b, 06c, 10a, 10b | Yes | Semantic and accessible, but it skips the Button link variant, so focus styling drifts. Low harm. |
| Hand-rolled spinner (`Loader2Icon` + `animate-spin`) instead of Spinner | LP-03b | No (1 of 11 spinner uses) | The other 10 used the Spinner component. |
| Failure panel built as `<p role="alert">` inside a custom block, not Alert | LP-05b | No | Field-level error `<p role="alert">` in LP-03a and LP-06a is fine. Only LP-04b used Alert. |
| Custom `<div role="status">` empty state | LP-10b | Unverified | Check against JOB-EMPTY-CONTENT before counting it. |

## Gaps found that are not lookalikes
- No success or warning color tokens. LP-09c fell back to stock Badge variants. This is a real token gap.
- Agents imported shadcn pieces outside the stated list (label, textarea, calendar, tooltip). Harmless, but the runner prompt's list should be complete.
- `vois-router` is not in the public Skills repo, so agents skipped it. Expected, but it means this pass tested the public chain, not the premium one.

## What this does and does not show
- It does not support a big lookalike table as the top priority. With the skills loaded, agents already avoid the classic fakes.
- It does not show what happens without the skills, or with a weaker model or harness. That is where a table would earn its place.
- One run per prompt, and prompts that say "shadcn is installed" make the right answer easy.

## Next options
1. Baseline run: same 30 prompts with the skills off, to see what the rules are preventing.
2. Harder prompts: no component hints, a codebase with no shadcn, or tasks mixing 3+ jobs.
3. Skip the table and fix what this pass found: link-variant Button guidance, Alert for failure panels, success and warning tokens.

---

# Pass 2: harder prompts (run2)

10 blind builds. Each prompt describes the screen by how it looks ("a red × in the corner", "a pill with a circle", "a box in the middle with a dark overlay") and mixes 3 to 5 jobs. Same method as pass 1: `scan.mjs` (now with 7 more signals) plus targeted greps and reading the flagged spots. I did not read every file line by line.

## Headline
Still no classic fakes. Across the 10 builds there was no `div` with `onClick`, no hand-built overlay, no `setTimeout` toast, no `title=` tooltip, no native `<select>` or checkbox in product UI, and no hand-built alert box. Agents often overrode the look in the prompt to follow the Vois rules: a red × became a neutral ghost icon Button, an orange pill became a secondary Badge, a "green message" became a Sonner toast, underlined labels became a ToggleGroup, and a "big" empty-state icon was capped at the Vois size.

## What repeated (pass 1 and pass 2 together, 40 files)
| Shortcut | Files | Notes |
|---|---|---|
| Raw `<button>` with a copy-pasted focus ring (`focus-visible:ring-2 ...`) | 8: LP-06a/b/c, LP-10a/b, HP-03, HP-05, HP-10 | Three kinds: a link-style row title, an icon inside an input (clear x), and a Tooltip or Popover trigger. All accessible. The cost is drifting focus styles and no shared Button variant. |
| `Loader2` + `animate-spin` instead of the Spinner component | 2: LP-03b, HP-02 | Both inside a "deleting..." button. 10 other builds used Spinner. |
| `role="radio"` on Buttons instead of RadioGroup | 1: HP-07 | The agent added a team-size picker the prompt didn't ask for. HP-04 used RadioGroup correctly. |

## Not agent mistakes
- **Scanner false positives.** The `fake-switch` signal matched `-translate-x-1/2` used for positioning in HP-05 and HP-10. I tightened it. HP-08's native checkbox is a "simulate failed load" demo control the agent added.
- **Stepper.** Vois says to use a Stepper for 2 to 5 steps, but shadcn ships none, so HP-07's hand-built stepper is expected. That's a Vois gap: no spec or source for the Stepper.

## What to do with this
- A big lookalike table isn't supported by the evidence. A short one is. Three rows would cover what repeated: icon or text trigger (Button ghost icon, or link variant), spinner (Spinner component), and radio-style choice (RadioGroup or ToggleGroup).
- Add a Stepper spec to `vois-components`, or say where it comes from.
- Still untested: skills off, and non-shadcn codebases.

---

# Scanner corrections after review

A code review found three bugs in `scan.mjs`, and fixing them showed two more:
- The `fake-toast` pattern could never match `setTimeout(() => setX(false), n)`, because `[^)]*` stopped at the first `)`. It now needs a delay of 1.5s or more and ignores loading setters, so a mock-load delay or a hover-close delay is not a toast.
- Files whose id had no matching prompt were skipped silently, so `node scan.mjs runs/run2` reported zero files. It now loads both prompt files and warns.
- Found while testing: `title=` matched component props such as `<Panel title=...>`, `fake-progress` matched the word "step" in a funnel chart, and `fake-alert` matched a `hover:bg-destructive/90` button elsewhere in the file. Each is now scoped to the element it describes.

I re-scanned both runs with the corrected scanner. The result is unchanged: `fake-spinner` in LP-03b and HP-02, and the `native-checkbox` demo control in HP-08. No hand-built toast in any of the 40 builds, so the findings above stand.

---

# Pass 3: skills-off baseline (baseline1)

The same 40 prompts (30 from pass 1, 10 from pass 2), built again with the Vois line removed from the runner prompt and an instruction not to invoke or read any skill (`runner-prompt-baseline.md`). One fresh agent per prompt. Every agent that mentioned it said it read no skill or design-system file.

Limits that matter: the harness can't truly turn skills off, I can't confirm the model matched the earlier runs, and it's one build per prompt. Treat a gap of 1 file as an anecdote.

## Headline
Without the skills, agents still don't build the classic fakes. Across 40 builds: no `div` with `onClick`, no hand-built overlay, no `setTimeout` toast, no "x" close glyph, no `title=` tooltip, no native select or checkbox. The top rows of the lookalike table (005 to 008, 011) guard against things this model doesn't do even with no guidance. They are cheap insurance for weaker models, not evidence.

What the skills do change is color, alerts and a few smaller components.

## Skills on vs skills off (same 40 prompts)
| Signal | Skills on | Skills off | Files (skills off) |
|---|---|---|---|
| Tailwind palette color class (`bg-red-50`, `text-green-800`) instead of a system token | 0 | 5 | HP-01, HP-03, HP-04, HP-06, LP-09c |
| Hand-built alert box (`role="alert"` on a colored div) | 0 | 2 | HP-04, HP-08 |
| Initials circle instead of Avatar | 0 | 1 | HP-06 |
| `div role="progressbar"` instead of Progress | 0 | 1 | HP-07 |
| `window.prompt` for a rename | 0 | 1 | LP-02a |
| Raw `<button>` with its own focus styles | 8 | 2 | HP-01, HP-10 |
| `Loader2` + `animate-spin` | 2 | 0 | |
| Native checkbox | 1 (a demo control) | 0 | |

- **Color and Alert are the clear wins.** 5 and 2 files with the skills off, none with them on. These are the rules in `DS-COLOR-008/009` and the Alert row (LOOKALIKE-010). Row 010 now has skills-off evidence, so it's a candidate to move from `watch` to `observed`. I did not move it here because the table's `observed` tier means "seen with the skills on".
- **Avatar, Progress, `window.prompt` are 1 file each.** Not enough to add rows under the 2+ rule. Worth watching in the next run.
- **Raw `<button>` with focus styles went the other way: 8 skills on, 2 skills off.** I haven't found why. I didn't read the baseline row-title code to see whether those builds skipped the clickable title entirely. Don't read this as the skills causing it until someone checks.
- **Stepper.** HP-07 hand-built numbered circles in both conditions, so the stepper gap was real. The spec added in vois-components 1.10.1 covers it.

## Scanner changes in this pass
- New signals: `raw-palette-color` and `raw-button-focus-ring`. The second reproduces the 8 files I had found by grep in passes 1 and 2.
- `fake-progress` now needs `role="progressbar"`. The old test matched a funnel-chart bar plus the word "progress" in a description (LP-07b).
- `fake-breadcrumb` no longer matches a bare `"/"` string, which was mock URL data (LP-07b).
- The expected-component check now accepts `import { toast } from "sonner"`. Builds that import the package directly (17 of the 40 baseline builds) could be marked as using no expected component.
- Fixtures: `LP-06a`, `LP-07b` (must hit nothing), `LP-09b`, `HP-07`.
- Re-scanned run1, run2 and baseline1. Skills-on results are unchanged.

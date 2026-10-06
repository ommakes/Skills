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

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

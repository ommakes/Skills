# Righter v1.6: PRD and Claude Code instructions

Status: ready to build (revised after checking the repo)
Target version: 1.6.0 (from 1.5.0)
Owner: Om
Canonical skill path: `Skills/righter` (this repo, `ommakes/Skills`)

This file has two parts. Part 1 is the PRD (what and why). Part 2 is the build plan for Claude Code (how). Read both before changing anything.

What changed from the first draft: the repo is already at 1.5.0, and principle 17 is already `rhetorical-devices`. So this release is 1.6.0 and the new accessibility principle is 18. The first draft also missed the other copies of Righter, the onboarding overlap, and a conflict between the new `click here` rule and existing text. Section 5 (D9 to D14) records those calls.

---

# Part 1: PRD

## 1. Background

Righter is a UX writing skill. It reviews or writes UI copy against 17 numbered principles, error guidelines, a component decision tree, a weakeners word list, phonaesthetics, rhetorical devices, and ARI reading metrics. It hooks into Vois through the `vois_get_microcopy` tool.

I compared Righter against `content-designer/ux-writing-skill` (Christopher Greer, MIT, v1.6.0). Righter is stronger on enforcement: stable rule ids, data files, a decision tree, a deterministic ARI script, a fixed output format, an eval corpus. The other skill is stronger on breadth. It covers things Righter doesn't touch at all.

This release closes those gaps without giving up what makes Righter checkable.

## 2. Problem

Righter has blind spots:

1. **One reading target for everyone.** ARI ≤ 6 is right for consumer apps. For dense professional tools it can force copy that feels patronizing or drops precise terms users expect.
2. **No accessibility guidance.** Nothing about labels that make sense out of context, link text, or status shown by color alone.
3. **No rules for empty states or permission requests.** These are common surfaces. Today empty states only appear as a place where rhetorical devices are allowed, and permission prompts aren't covered at all.
4. **Tone guidance only exists for errors.** Nothing for confused first-time users, high-stakes confirmations, or routine success.
5. **No way to define or audit a brand voice**, and no documented Figma review workflow.

## 3. Goals

- G1: Let the reading target adapt to audience, with the current behavior as the default.
- G2: Add accessible-copy rules to the principles.
- G3: Add `empty-state` and `permission-prompt` as first-class components with writing rules.
- G4: Add tone-by-context guidance, loaded only when relevant.
- G5: Add an optional voice chart template and a Figma review workflow.
- G6: Keep every existing review result stable, with one allowed exception (see D10). Cases 01 to 08 in `evals/cases.json` must still flag every id they list today and pick the same component.
- G7: Keep `SKILL.md` lean. Push detail into `data/` and `references/`.

## 4. Non-goals

- Not copying text from the other skill. Ideas only. Write everything fresh in Righter's voice.
- Not adopting its four-phase edit process. Righter's checklist already covers it.
- Not adopting the 40 to 60 characters per line guidance. That's typography, not copy.
- Not adopting its onboarding template. The separate `onboarding-flow` skill owns onboarding.
- Not adopting its comprehension statistics ("8 words = 100%", "14 words = 90%") or "active voice 85% of the time". They're weakly sourced or arbitrary.
- Not changing the error decision tree.
- Not changing the `vois_get_microcopy` tool signature. That lives in the Vois repo.
- Not renumbering or changing the meaning of principles 1 to 17. Wording changes are limited to the edits in section 6.1, the example fix in D10, and the em dash sweep in D15 (punctuation only).
- Not touching the other copies of Righter (see D9). They are follow-ups.

## 5. Decisions and trade-offs

Each says what would flip it.

| # | Decision | Why | What would flip it |
|---|----------|-----|--------------------|
| D1 | Reading target becomes tiered, with **consumer (ARI ≤ 6) as the default** | Zero behavior change for anyone who doesn't opt in. | If most Righter use turns out to be for professional tools, make `professional` the default. |
| D2 | Tiers raise the reading target only. They never relax weakeners, active voice, contractions, or any other principle | Reading level is one dial. Sloppy writing isn't a reading level. | Nothing. Keep this. |
| D3 | Accessibility becomes one new principle (`accessible-copy`, **id 18**) plus a short reference file | It's a real copy rule, and it's checkable. | If it grows past a few rules, split into its own skill. |
| D4 | Accessibility vs brevity: when a label needs the object noun to make sense out of context, add it, unless the component's character limit forbids it. Then recommend an `aria-label` and say so. Worked case: a `tooltip` capped at 40 to 60 characters keeps its short label and gets an `aria-label` recommendation. A `button` with room for "Submit application" gets the noun. | Screen reader users hear labels out of visual context. Brevity limits are real too. | If a component's limit keeps forcing aria-label advice, revisit the limit. |
| D5 | Tone guidance lives in `references/tone.md`, not in the principles | It's situational. Loading it every time bloats context. | If reviews keep missing tone problems, promote the top rules into `SKILL.md`. |
| D6 | Empty states and permission prompts go in `data/components.json`, **not** the error decision tree | They aren't errors. Touching the tree risks regressions in the existing evals. | If people keep asking "which component is this?" for non-errors, add a second tree. |
| D7 | Output format stays the same. Only the Target line becomes tier-aware | New output sections bloat every review. Accessibility notes go under "Principles applied". | Nothing right now. |
| D8 | Tone examples follow Righter's rules, not the other skill's | Two skills disagreeing on tense would confuse anyone using both. | Nothing. Righter wins conflicts. |
| D9 | **`Skills/righter` is the only copy edited.** Other copies are follow-ups: `vois-skills/righter` (stale, 1.3.0), `Portfolio-Site/src/content/skills/righter.md` (site page, 1.4.0, different frontmatter), `figma-editions/righter.md` (flattened build output, regenerate from source, never hand-edit) | The copies already drifted. Syncing them in the same PR hides the real diff and mixes three repos. | If you want one release to touch all copies, split it into one PR per repo. |
| D10 | **The `accessible-copy` rule wins over one existing example.** Principle 1's ✓ example "Click here to start earning rewards." breaks the new "never use click here" rule. Reword that one example (for example "Start earning rewards.") and keep the principle text and id unchanged. This is the only allowed edit to principle 1. | A skill that contradicts itself is worse than one small example edit. | Nothing. |
| D11 | **Regression rule changes from "match exactly" to "no id lost".** Baseline reviews are manual LLM reviews, so exact text matching isn't possible. Cases 01 to 08 must still flag every id they list and pick the same component. New flags from the new principle are allowed, recorded, and added to the case (case-05 will likely gain `accessible-copy`) | Adding a principle changes what a correct review finds. Freezing the old list would make the eval wrong. | If an automated scorer gets built, switch to exact match against updated expectations. |
| D12 | **Rhetorical devices and `empty-state` are reconciled.** Existing text allows one device on empty states. The new `empty-state` component keeps that: one device at most, first-use type only, never on no-results or user-cleared. "No cute filler" means no filler, not no personality | Two rules pointing opposite ways would make reviews inconsistent. | If the first-use rule produces cute copy in review, ban devices in empty states. |
| D13 | **`onboarding-flow` owns permission screens inside an onboarding sequence.** `permission-prompt` owns the copy itself, in any context. Its rules must agree with `CONSUMER-005` (state the specific benefit, prime before the OS dialog). If they conflict, stop and ask | Both skills touch permission priming. Someone has to be the tiebreak. | If the two skills keep colliding, move the copy rules into one shared place. |
| D14 | **Toast rules win over `present-tense` for toasts.** `components.json` toast success copy is a past participle ("File created"). Tone examples for the successful state must follow the toast rules, not the principle. Note the exception in `tone.md` | The component rule is the more specific rule, and it already exists. | If you want toasts in present tense, that's a separate change to `components.json`. |
| D15 | **No em dashes anywhere in the skill.** This includes existing text in `SKILL.md`, `CHANGELOG.md`, the `data/` files, `scripts/ari.mjs`, and the new files. The sweep is a separate commit and changes punctuation only (period, comma, colon, or a reworded clause). Two exceptions stay: the ✗ example under `no-em-dashes` in `SKILL.md`, and any `evals/cases.json` `input` that exists to test the em dash rule (case-02 and case-07). Mention those by name in the PR | The skill preaches the rule, so it shouldn't break it. Fresh text alone would leave the skill inconsistent. | If the sweep changes meaning anywhere, revert that line and tell me. |

## 6. Requirements

### 6.1 Tiered reading target (P0)

**New section in `SKILL.md`: "Audience and Reading Target"**, placed right before "Reading Metrics".

| Tier | Use when | ARI target | Grade |
|------|----------|-----------|-------|
| `consumer` (default) | General public, consumer apps, marketing-adjacent UI | ≤ 6 | Grade 5 |
| `professional` | Work tools where users know the domain | ≤ 10 | Grade 9 |
| `technical` | Developer or admin tools | ≤ 12 | Grade 11 |

Tier selection order:
1. If `vois_get_microcopy` returns a tier or audience, use it.
2. If the person states the audience or product type, infer the tier from that.
3. Otherwise use `consumer`. When the audience is ambiguous, stay on `consumer`. Don't guess upward.

Rules:
- If the tier isn't `consumer`, say which tier was used at the top of the output. If it's `consumer` by default, say nothing extra.
- At `professional` and `technical`, domain terms users already know are allowed. `avoid-jargon` still applies to internal names, system terms, and acronyms the audience wouldn't use.
- Tiers change the ARI target only. Every other principle still applies in full.

**Minimal edits to existing text (the only allowed changes to principles 1 to 17 and their surroundings, plus D10):**
- Principle 2 (`reading-level`): keep the id and wording, add one sentence: "This is the default `consumer` target. See Audience and Reading Target for other tiers."
- Output formats (both review and new copy): replace the static line `Target: ARI ≤ 6 (Grade 5, age 10–11)` with `Target: ARI ≤ N (Grade X, <tier> tier)`.
- Review checklist: change "Reading level above Grade 5?" to "Reading level above the target for this audience tier?"
- The Reading Metrics line `**Target: ARI ≤ 6 (Grade 5, age 10–11)**` gets a short pointer to the new section.

**Acceptance:** A review with no audience stated behaves as it does on 1.5.0. A review that says "this is for an internal admin tool" uses the `technical` tier, prints the tier, and scores against ARI ≤ 12.

### 6.2 Accessible copy principle (P0)

**New principle 18, id `accessible-copy`**, added after `rhetorical-devices` (the current last principle). Keep it short (under 15 lines in `SKILL.md`), with detail in `references/accessibility.md`.

Rules to cover:
- Labels, buttons, and links must make sense out of context. A screen reader user often hears them as a list.
  - ✗ "Submit" on a form with several submit actions. ✓ "Submit application".
  - ✗ "Read more". ✓ "Read the privacy policy".
- Never use "click here" as link text.
- Don't rely on color alone. Pair status colors with words ("Error: Email is required", not just red text).
- Error text should name the field it belongs to, so it reads correctly when announced with the field label.
- A placeholder never replaces a visible label.
- Icons with no visible text need a text alternative. Give the recommended `aria-label` copy.
- Don't reintroduce interface words to make a label specific. `no-interface-references` still applies ("Submit application", not "Submit button").

**`references/accessibility.md`** covers the above with more before/after pairs and the D4 trade-off (object noun vs character limit vs aria-label). Only cover copy. Don't write a general WCAG guide.

**Acceptance:** Reviewing `Click here to read more` flags `accessible-copy` and `no-interface-references`. Reviewing a lone `Submit` label in a multi-action context flags `accessible-copy`.

### 6.3 New components (P1)

Add two entries to `data/components.json` following the existing schema exactly (`id`, `name`, `when_to_use`, `structure` with `field` and `limit`, `rules`, `example`, plus `title_examples` where it fits, and `variants` where it fits). Read the existing six first and match their style. Don't invent fields.

**`empty-state`**
- When to use: a list, page, or section has nothing to show.
- Cover three types: first use, user cleared it, no results.
- Structure: title (short, says what's missing or what this place is for), one or two sentences of description, one primary action.
- Rules to include: say why it's empty only when that helps; always give a next step that fills the space (except a no-results state, where the next step is changing the search or filter); no blame; no filler; don't restate the title in the description; personality per D12 (one device at most, first-use only).
- Give one good example per type.

**`permission-prompt`**
- When to use: the app is about to ask for a device or account permission (location, notifications, camera, contacts, storage).
- Rules to include: lead with the benefit to the user, then name the permission in the action; ask in context, when the feature is first used, not on launch; the action label names the permission; if the user declines, the follow-up copy explains what they'll miss and how to change it later, with no guilt.
- Give good and bad examples. Good: "Get alerts when your order ships." with action "Allow notifications". Bad: "We need access to your notifications."
- Must agree with `onboarding-flow` `CONSUMER-005` (see D13).

Both components must obey principles 1 to 18, including `no-em-dashes`, contractions, and weakener rules. Run every example through `data/weakeners.json` before committing.

**Acceptance:** `permission-prompt` and `empty-state` are valid ids in `components.json`. `SKILL.md` has a short "Other components" note (3 to 5 lines) telling the reader to look these up by id for non-error surfaces. The `components.json` line in the "Reference files" list is updated to name all eight components. The error decision tree is untouched.

### 6.4 Tone by context (P1)

**New `references/tone.md`.** Loaded only when copy involves an emotional or high-stakes moment (errors, destructive actions, first use, success).

Contents:
- One-paragraph rule: voice stays constant, tone shifts with context. Tone never overrides a principle. It never permits humor in errors (that's already in `error-voice-and-tone`).
- A table of five user states: frustrated, confused, confident, cautious, successful. Columns: what triggers it, what the tone should be, what to do, one compliant example.
- A short stakes note: low stakes (change a theme) lets copy be brief. High stakes (delete an account, spend money) needs plain consequences and no pressure.
- A line pointing back to `components.json` for length limits and structure. Tone doesn't change those.
- A note on the D14 exception: toast success copy follows the toast rules.

Example intent per state (write the actual copy fresh and validate it):
- Frustrated: names the problem, gives the fix, no blame.
- Confused: patient, one step at a time, says what happens next.
- Confident: as short as it can be.
- Cautious: states the consequence plainly, makes backing out easy.
- Successful: confirms what happened, proportional to the action. If the example is a toast, it follows the toast rules per D14.

Every example must pass Righter's own checklist.

**Acceptance:** `tone.md` exists, every example passes `weakeners.json`, `no-em-dashes`, and the ARI target for its tier, and the file is referenced from `SKILL.md`'s reference list with a "read when" note.

### 6.5 Voice chart template (P2)

**New `references/voice-chart.md`.** Read only when someone asks to define, document, or audit a brand voice.

Contents: a fillable template with 3 to 5 voice concepts, each with descriptive characteristics, a "we do" example, and a "we don't" example, plus a small table showing how tone shifts across the five user states from `tone.md`. Include one worked example that isn't tied to a real company. Note that when no voice is defined, Righter's principles are the default voice.

### 6.6 Figma review workflow (P2)

**New `references/figma.md`.** Short. Read only when the person shares a Figma link and asks for a copy review.

Contents:
1. Get the file key and node id from the URL.
2. Pull the text nodes with the Figma MCP (`get_design_context` or `get_metadata`, and `get_screenshot` for context). Verify the tool names in the current environment. Don't assume.
3. Group each string by component type so the right rules apply.
4. Review using the standard review format. For many strings, output a compact table: node, before, after, principle ids.
5. Never write changes back to Figma unless asked. If asked, that's a separate task and needs the Figma write tooling and its own skill.

### 6.7 Housekeeping (P0)

- Bump version to `1.6.0` in `righter/SKILL.md` frontmatter **and** in the `righter` entry in the root `skills.json`.
- Extend the frontmatter `description` trigger list with "permission prompts" and "accessible labels or link text". Keep it one paragraph. Mirror the change in the `skills.json` description.
- Add reference entries to the "Reference files" list at the top of `SKILL.md`, each with a "read when" note.
- Update the Righter blurb in the root `README.md` (the "### Righter" section) to mention tiers, accessible copy, and the new components. Keep it to the existing length.
- Add a `CHANGELOG.md` entry for `[1.6.0] - 2026-09-29`, following the existing Added / Changed style. Credit `content-designer/ux-writing-skill` (MIT) as the source of the gap analysis. No em dashes anywhere in the file. Rewrite the existing entries' em dashes too (D15).
- Add a "Follow-ups" note in the PR (not the changelog) for the other copies (D9).

### 6.8 Evals (P0)

Add cases 09 to 15 to `evals/cases.json`, matching the existing schema. Add an optional `audience` field for tier cases.

| Case | Input (draft, refine as needed) | Should flag | Component / notes |
|------|-------------------------------|-------------|-------------------|
| case-09 | `Click here to read more` (link) | `accessible-copy`, `no-interface-references` | |
| case-10 | `Fields in red need your attention.` | `accessible-copy` | Color-only status |
| case-11 | `We need your location.` | likely `user-goal-framing`. Confirm by running the review | `expected_component`: `permission-prompt` |
| case-12 | `No data.` | Only ids a review really flags. Use `user-goal-framing` if it applies. If none applies, leave empty and say in `notes` that this is a component-rule case only | `expected_component`: `empty-state` |
| case-13 | Professional-tier copy that scores above 6 but at or below 10 (write one realistic sentence pair) | none | `audience`: `professional`. Passes at that tier, would fail at `consumer`. Verify both scores with `ari.mjs` and record them in `notes` |
| case-14 | Same copy as case-13, no audience given | `reading-level` | Proves the default is still `consumer` |
| case-15 | Copy with an ambiguous audience (for example a settings label that could suit either tier) | none from tiers | Proves ambiguous audience stays `consumer` and prints no tier line |

Also update case-05: add `accessible-copy` to its `expected_violations` only if a real review flags it (D11).

Only put a violation id in a case if a review against the final skill really flags it. Run each case and confirm, then write the id. Don't guess.

Update the `description` field of `evals/cases.json` to mention the optional `audience` field.

## 7. Success criteria

- Cases 01 to 08 still flag every id they list today and pick the same component. New flags from principle 18 are recorded (D11).
- Cases 09 to 15 produce the expected results.
- A review with no audience stated has the same structure as 1.5.0 output.
- `SKILL.md` grows by roughly 50 lines or fewer.
- All JSON parses. No em dashes anywhere in the Righter skill files (D15). Every new example passes Righter's own checklist.
- `scripts/validate-skills.sh` passes.

## 8. Risks

| Risk | Mitigation |
|------|-----------|
| Tiers get used to excuse bad copy | D2 says tiers only move the ARI target. The checklist still runs in full. |
| Accessibility rule conflicts with tight component limits | D4 gives a tie-break and a worked case. |
| New principle id collides with other skills that cite Righter ids | Step 0 greps every sibling skill. Sibling skills found so far cite Righter by name, not by id, but confirm. |
| New rule contradicts existing text | Found one (principle 1 example, D10). Step 0 greps for other `click here` and `Click` link examples. |
| `empty-state` and `permission-prompt` collide with `rhetorical-devices` and `onboarding-flow` | D12 and D13. |
| Other copies of Righter go stale | D9. Listed as follow-ups, not silently ignored. |
| Skill instructions get too long and stop being followed | Keep `SKILL.md` additions small. Details live in `references/` and `data/`. |
| Copying the other skill's text | MIT would allow it with a notice, but the goal is original text in Righter's voice. Credit ideas in the changelog. |

## 9. Follow-ups (out of scope here)

- **Vois repo issue.** Title: "vois_get_microcopy placement values don't cover empty states or permission prompts". Body: the `placement` values are `button | title | description | helper | toast | error | label`. Righter 1.6.0 adds `empty-state` and `permission-prompt` components, and there's no placement to request them. Ask: add `empty-state` and `permission-prompt`, or document which existing value to use. Not verified against the Vois source. Confirm before filing.
- Vois repo: consider letting workspace overrides specify an audience tier (feeds tier selection step 1 in 6.1).
- Sync or retire the other copies: `vois-skills/righter`, `Portfolio-Site/src/content/skills/righter.md`, and regenerate `figma-editions/righter.md` from source.
- An automated eval scorer, if manual re-review gets tedious.

---

# Part 2: Claude Code instructions

## Ground rules

1. Work on the branch you're given for this session. Don't touch `main` directly.
2. Don't change the text of principles 1 to 17 beyond the edits in section 6.1 and D10. Don't renumber. Don't change ids.
3. Don't change the error decision tree or the `vois_get_microcopy` call shape.
4. Write in Righter's own style. Short sentences, contractions, no weakeners, **no em dashes** anywhere in the skill, new text and existing text alike. The only exceptions are listed in D15.
5. Don't copy text from the other skill. Read it for ideas, write your own.
6. If something in this file conflicts with what you find in the repo, stop and tell me. Don't pick silently.
7. Make trade-offs visible. If you have to make a call this PRD doesn't cover, write it down in the PR description under "Judgment calls".
8. Edit only `Skills/righter`, plus the root `skills.json` and `README.md` righter entries (6.7). Nothing else.

## Step 0: Orient

1. Confirm the canonical path is `Skills/righter`. Expected contents: `SKILL.md`, `CHANGELOG.md`, `data/components.json`, `data/weakeners.json`, `data/phonaesthetics.json`, `data/email-benchmarks.json`, `data/rhetorical-devices.json`, `references/email.md`, `scripts/ari.mjs`, `evals/cases.json`. Confirm `SKILL.md` frontmatter says `1.5.0` and principle 17 is `rhetorical-devices`. If not, stop and tell me.
2. Read `SKILL.md`, `CHANGELOG.md`, `data/components.json` (all six components), and `evals/cases.json` in full.
3. Read `scripts/ari.mjs`. The `Target: ARI ≤ 6 (Grade 5, age 10–11)` line is hardcoded in two places (the `--before/--after` branch and the single-text branch). Add an optional `--target N` flag. The default output must stay identical to today's. Note the same string appears in `references/email.md` and `data/email-benchmarks.json`. Leave both alone, since email stays consumer-only, and say so in the PR.
4. Grep the repo (excluding `.git`) for `righter` and each Righter rule id. Known so far: `vois-patterns`, `vois-components`, `vois-tokens`, `onboarding-flow`, `longform`, `gtm-positioning` cite Righter, all by name. Confirm none cite an id or text you're about to change. Also grep for `click here` link examples inside `righter/`.
5. Read `onboarding-flow/references/consumer-onboarding.md` (`CONSUMER-005`, permission priming) and `saas-onboarding.md` (empty states). Note any rule your `permission-prompt` or `empty-state` would contradict (D13).
6. Read `data/rhetorical-devices.json` and principle 17 so `empty-state` follows D12.
7. Optional: skim the source skill for ideas at `https://github.com/content-designer/ux-writing-skill/raw/refs/heads/main/SKILL.md`. Where its advice conflicts with Righter (past-tense success messages, the 7th to 8th grade target), Righter wins. List conflicts in the PR description.

Checkpoint: before writing anything, post a short summary of what you found in steps 1 to 6 and confirm the plan below still fits.

## Step 1: Baseline

Before any edits, record the current behavior.

1. For each of cases 01 to 08 in `evals/cases.json`, review the `input` using the current skill. Save the flagged ids and component pick to a scratch file outside the skill folder.
2. Confirm each includes every id in `expected_violations` and matches `expected_component`. If any existing case already fails on 1.5.0, stop and tell me. Don't fix it as part of this work.

## Step 2: Reading tiers (6.1)

1. Add "Audience and Reading Target" to `SKILL.md`, right before "Reading Metrics".
2. Make the edits listed in 6.1 (principle 2 sentence, both output format Target lines, checklist item, Reading Metrics pointer).
3. Add the optional `--target N` flag to `ari.mjs`. Keep the default identical.
4. Verify: `node scripts/ari.mjs "Click Forgot Password. Enter your email. Check your inbox."` reports the same numbers and Target line as before, and `--target 12` changes only the Target line.
5. Commit: `feat(righter): tiered reading targets`.

## Step 3: Accessible copy (6.2)

1. Add principle 18 (`accessible-copy`) to `SKILL.md` after `rhetorical-devices`. Match the format of the other principles: heading, id in backticks, one-line rule, ✗/✓ pair.
2. Reword principle 1's "Click here to start earning rewards." example per D10. Change nothing else in that principle.
3. Add a checklist line under "Clarity": "Labels, links, or status that only make sense visually?"
4. Create `references/accessibility.md` per 6.2. Copy only. Include the D4 trade-off and its worked case.
5. Add the file to the "Reference files" list with a "read when" note.
6. Commit: `feat(righter): accessible-copy principle`.

## Step 4: Components (6.3)

1. Open `data/components.json`. Match the existing entries' shape exactly.
2. Add `empty-state` and `permission-prompt`, following D12 and D13.
3. Add the "Other components" note to `SKILL.md` (3 to 5 lines). Update the `components.json` line in the "Reference files" list to name all eight. Don't edit the decision tree.
4. Validate: `python3 -m json.tool data/components.json > /dev/null`.
5. Check every example string against `data/weakeners.json` and the tier's ARI target using `scripts/ari.mjs`.
6. Commit: `feat(righter): empty-state and permission-prompt components`.

## Step 5: Tone, voice chart, Figma (6.4 to 6.6)

1. Create `references/tone.md`. Before writing the examples, read the `toast` and `alert-dialog` rules in `components.json`. Toast success copy is a past participle, so follow D14 and note the exception in the file.
2. Create `references/voice-chart.md` (P2).
3. Create `references/figma.md` (P2). Check which Figma MCP tools are actually available before naming them. If none are, say so in the file and describe the workflow generically.
4. Add all three to the "Reference files" list, each with a "read when" note.
5. Commit each file separately.

P2 items (voice chart, Figma) can ship in a follow-up release. Don't let them block P0 and P1.

## Step 6: Evals (6.8)

1. Add cases 09 to 15 to `evals/cases.json`.
2. For each case, run a real review against the updated skill. Only record ids that are truly flagged. If your review disagrees with the table in 6.8, believe the review, then tell me about the difference.
3. For case-13, case-14 and case-15, run `ari.mjs` on the copy and put the actual scores in `notes`. If case-13 doesn't land above 6 and at or below 10, rewrite it until it does.
4. Re-review case-05 and update its `expected_violations` only if `accessible-copy` is really flagged (D11).
5. Update the `description` field to mention `audience`.
6. Re-run cases 01 to 08 and diff against your Step 1 baseline. Every baseline id must still be flagged and every component pick must match. List any new flags.
7. Commit: `test(righter): evals for v1.6 features`.

## Step 7: Em dash sweep (D15)

1. Run `grep -rnP '\x{2014}' righter/ skills.json` and list every hit.
2. Replace each with a period, comma, colon, or a reworded clause. Punctuation only. Don't change meaning.
3. Keep the two D15 exceptions: the ✗ example under `no-em-dashes`, and the inputs of case-02 and case-07 in `evals/cases.json`. Check that `notes` fields and other prose in `cases.json` are swept.
4. Re-run the Step 1 baseline cases. The sweep must not change any result.
5. Commit: `style(righter): remove em dashes from skill text`.

## Step 8: Housekeeping (6.7)

1. Bump `version` to `1.6.0` in `righter/SKILL.md` and in `skills.json`.
2. Update the frontmatter `description` triggers in both places.
3. Update the Righter blurb in the root `README.md`.
4. Write the `CHANGELOG.md` entry, dated 2026-09-29, with the credit line (MIT).
5. Commit: `chore(righter): release 1.6.0`.

## Step 9: Verify

Run all of these from the repo root and paste the output into the PR description.

```bash
# JSON is valid
for f in righter/data/*.json righter/evals/cases.json skills.json; do python3 -m json.tool "$f" > /dev/null && echo "ok $f"; done

# Frontmatter and version checks
./scripts/validate-skills.sh

# No em dashes left in the skill. Only the D15 exceptions should print.
grep -rnP '\x{2014}' righter/ skills.json || echo "no em dashes"

# ARI sanity check on each new example (run on every example string you added)
node righter/scripts/ari.mjs "<example>"

# Reference list in SKILL.md matches files on disk
ls righter/references righter/data righter/scripts righter/evals
```

Then a manual pass:
- [ ] Cases 01 to 08: every baseline id still flagged, same component picks. New flags listed.
- [ ] Cases 09 to 15 pass.
- [ ] A review with no audience stated has the same structure as 1.5.0 output.
- [ ] Every new example follows principles 1 to 18.
- [ ] `SKILL.md` grew by about 50 lines or fewer.
- [ ] No sibling skill breaks (Step 0, item 4), and `permission-prompt` agrees with `CONSUMER-005`.
- [ ] The decision tree and `vois_get_microcopy` call are unchanged.
- [ ] Em dash grep returns only the D15 exceptions.
- [ ] Nothing changed outside `Skills/righter`, `skills.json`, and `README.md`.

## Step 10: PR

Open a draft PR titled `Righter 1.6.0: audience tiers, accessible copy, new components`. The description should include:

1. A short summary in plain language.
2. The decisions table (D1 to D14) and anything you changed or added ("Judgment calls").
3. The verification output from Step 9.
4. Conflicts you noticed with the source skill and with sibling skills.
5. The follow-ups from section 9 of the PRD, including the ready-to-file Vois issue text.

Don't merge. I'll review.

## Definition of done

- All P0 and P1 items shipped. P2 shipped or explicitly deferred in the PR.
- Every checkbox in Step 9 is ticked.
- Nothing outside `Skills/righter`, `skills.json`, and `README.md` changed, apart from the PR itself.

---
name: righter
description: >
  Apply UX content writing principles to review existing UI copy or write new UI copy from scratch.
  Use this skill whenever someone asks you to: review, audit, critique, or improve UI text, error messages,
  button labels, tooltips, empty states, permission prompts, onboarding copy, form helper text, accessible labels or link text, or any software interface copy.
  Also trigger when someone asks you to write new UI copy, label a button, draft an error message,
  write a modal, or create any in-product text. If the request involves words that appear inside software, use this skill.
version: 1.9.0
---

# Righter

> Full version & updates: https://github.com/ommakes/Skills/blob/main/righter/SKILL.md. The full version also covers transactional email copy (subject lines, deliverability benchmarks) and ships scripts that count words and score reading level. This edition leaves those out and gives the formulas and limits inline.

A UX writing skill. Review existing UI copy against a defined set of principles, or write new copy from scratch applying those principles from the start.

Every numbered principle below and every rule in Error Message Guidelines carries a stable `id` in backticks. Cite the id, not the number, when referencing a rule from outside this file (numbers shift when principles are added or reordered).

---

## How to Use This Skill

**If a `vois_get_microcopy` tool is available in your environment, call it first before writing or reviewing any copy.**

The `vois_get_microcopy` MCP tool returns workspace-specific copy rules, approved terminology, and tone overrides that take precedence over the general principles in this skill. If the workspace has an entry for the copy type you're working on, use it. Don't improvise.

```
Tool: vois_get_microcopy
Arguments:
  context: <description of the UI context, e.g. "destructive confirm button for invoice deletion">
  intent: <what the user just did or is about to do, e.g. "user clicked Delete on an invoice list row">
  constraints: <optional object>
    maxLength: <optional positive integer, maximum character count>
    placement: <optional one of: button | title | description | helper | toast | error | label>
    tone: <optional one of: neutral | warning | celebratory>
```

**Resolution order (returned as `provenance` on the response):**
1. `WORKSPACE_OVERRIDE`: use this verbatim, no changes
2. `KNOWLEDGE_BASE`: apply as a strong starting point, adapt if needed
3. `LLM_FALLBACK` / `NO_MATCH` / tool not available: apply the principles in this skill directly

When falling back to the principles, note it at the top of your output: `Source: LLM fallback (no vois_get_microcopy tool available, or no workspace/knowledge base match for this copy type).`

---

## Two Modes

### Mode 1: Review Existing Copy
1. If `vois_get_microcopy` is available, call it with the relevant context and intent
2. Check against the review checklist below
3. Identify every violation
4. Rewrite it
5. Output in the review format below

### Mode 2: Write New Copy
1. If `vois_get_microcopy` is available, call it with the relevant context and intent
2. Apply all relevant principles
3. For labels, CTAs, and microcopy: apply the Phonaesthetics guidance below
4. For copy that's allowed personality (marketing surfaces, taglines, empty states, and feature names; not error messages or system copy): consider one device from Rhetorical Devices below before settling for plain phrasing
5. Output in the new copy format below

---

## Output Formats

### Review format
Use this block for every piece of copy reviewed:

---
**Before:** [original copy]
**After:** [rewritten copy]

**Source:** [Workspace override | Knowledge base | LLM fallback]

**Principles applied:**
- [Principle name]: [one sentence on why this improved the copy]

**Weakeners removed:**
- "[word or phrase]" → removed because [category, e.g. hedging / filler adverb / weak verb]. If none found, write "None found."

**Phonaesthetics:**
- Note any sound improvements made (rhythm, stress pattern, sound cluster choices, ease of mouth). If phonaesthetics wasn't a factor (e.g. error messages), write "Not applicable for this copy type."

**Rhetorical device:**
- Note any device applied and why. If not applicable (error messages, system copy), write "Not applicable for this copy type."

**Reading metrics (Before → After):**
- Word count: X → Y
- ARI score: X.X → Y.Y
- Grade level: Grade X (age X–X) → Grade X (age X–X)
- Target: ARI ≤ N (Grade X, <tier> tier)
---

### New copy format
---
**Copy:** [final copy]

**Source:** [Workspace override | Knowledge base | LLM fallback]

**Principles applied:**
- [Principle name]: [one sentence on why]

**Weakeners avoided:**
- Note any weakener patterns consciously avoided, or write "None present."

**Phonaesthetics:**
- Explain the sound choices made: rhythm, stress, clusters, ease of mouth. If not applicable, say so.

**Rhetorical device:**
- Note any device applied and why. If not applicable, say so.

**Reading metrics:**
- Word count: X
- ARI score: X.X
- Grade level: Grade X (age X–X)
- Target: ARI ≤ N (Grade X, <tier> tier)
---

---

## UX Writing Principles

Apply all of these when reviewing or writing. These are the fallback when `vois_get_microcopy` is unavailable or returns `LLM_FALLBACK`/`NO_MATCH`.

### 1. Use active voice `id: active-voice`
Subject → verb → object. Active voice is shorter and easier to follow.
- ✗ "Rewards can be earned by clicking here."
- ✓ "Start earning rewards."

### 2. Write at or below a fifth grade reading level `id: reading-level`
Short sentences. Simple words. Clear structure. Target ARI ≤ 6. This is the default `consumer` target. See Audience and Reading Target for other tiers.
- ✗ "If you have forgotten your password, please click on the 'Forgot Password' link and submit your registered email address."
- ✓ "Click 'Forgot Password'. Enter your email. Check your inbox for a reset link."

### 3. Avoid jargon `id: avoid-jargon`
Replace technical terms with plain language. Don't assume domain knowledge.
- ✗ "Authenticate your credentials."
- ✓ "Log in with your username and password."

### 4. Avoid complex sentence structures `id: simple-sentences`
One idea per sentence. Avoid dependent clauses stacked on independent clauses.
- ✗ "The fox, which was red, over the gate jumped."
- ✓ "The red fox jumped over the gate."

### 5. Avoid double negatives `id: no-double-negatives`
Double negatives increase misreads and cognitive load.
- ✗ "Please don't fail to save your changes."
- ✓ "Please save your changes."

### 6. Use contractions `id: use-contractions`
Contractions sound human. Formal constructions feel stiff.
- ✗ "Do not submit the form until all fields are complete."
- ✓ "Don't submit until all fields are complete."

### 7. Write in present tense `id: present-tense`
Describe what's happening now or what the user can do.
- ✗ "Your file was uploaded."
- ✓ "Your file is uploading."

### 8. Frame around the user's goals, not the system `id: user-goal-framing`
Users care about what they're doing, not how the system works.
- ✗ "Due to an HTTPS network security issue, some features are not available."
- ✓ "This site may be insecure. Some features aren't available."

### 9. Avoid describing the interface `id: no-interface-references`
Don't reference UI elements like "tab," "panel," "menu," "page," or "section."
- ✗ "Go to the Settings panel."
- ✓ "Go to Settings."

### 10. Use consistent terminology `id: consistent-terminology`
Pick one word for each concept and stick to it.
- ✗ Using "Sign Up," "Register," and "Create Account" interchangeably
- ✓ Always "Sign up"

### 11. Apply progressive disclosure `id: progressive-disclosure`
Lead with what the user needs now. Offer detail only when needed.
- ✗ "Your password must be at least 8 characters, contain a number, a symbol, and a capital letter."
- ✓ "Your password must be at least 8 characters." [+ optional detail link]

### 12. Don't apologize unnecessarily `id: no-unnecessary-apology`
Reserve "sorry" for serious errors. Hollow apologies undermine trust.
- ✗ "Whoops! We can't upload your picture. Try again."
- ✓ "We couldn't upload your picture. Try again."

### 13. Limit exclamation marks `id: limit-exclamation-marks`
Use words to convey energy, not punctuation. One per screen max, only for genuine celebration.
- ✓ "Your profile has been updated!" (success state)
- ✗ "Error! You can't submit the form! Please fix the errors!"

### 14. Check prepositions `id: check-prepositions`
Prepositions sit between two nouns. Never start or end a sentence with one.
- ✗ "Click on the Submit button."
- ✓ "Click Submit."

### 15. Eliminate weakeners `id: eliminate-weakeners`
Remove all hedging words, softeners, empty intensifiers, filler adverbs, throat-clearing, passive-aggressive politeness, vague quantifiers, redundant framing, weak verb phrases, and meta-commentary. Check copy against every category in the Weakener Categories table below.

### 16. Don't use em dashes `id: no-em-dashes`
Em dashes read as a hedge in short-form UI copy and are a well-known AI writing tell. Use a period, comma, or colon instead.
- ✗ "Your file is uploading — this may take a few minutes."
- ✓ "Your file is uploading. This may take a few minutes."

### 17. Reach for a rhetorical device before settling for plain phrasing `id: rhetorical-devices`
Applies only to copy that's allowed personality: marketing surfaces, taglines, feature names, empty states (first use only), onboarding. Skip entirely for error messages, form fields, and system copy. There, plain and literal beats clever every time.

Pick at most one device per surface from the Rhetorical Devices table below. Stacking two reads as trying too hard, not as clever. On marketing pages the word limits win: a device has to fit inside the slot's limit. If it doesn't, cut the device.
- ✗ "No setup required. Start immediately."
- ✓ "No setup. No waiting. No excuses." (`anaphora-epistrophe`)

### 18. Make copy work without the visuals `id: accessible-copy`
Screen reader users often hear labels and links as a list, out of context. Write copy that still makes sense that way.
- Name the object in labels, buttons, and links. Never use "click here" as link text.
- Pair status colors with words. Don't rely on color alone.
- Error text names its field, so it reads right when announced with the field label.
- A placeholder never replaces a visible label.
- Icons with no visible text get a text alternative. Give the recommended `aria-label` copy.
- Keep `no-interface-references` in force: "Submit application", not "Submit button".
- ✗ "Read more"
- ✓ "Read the privacy policy"
- ✗ Red text: "Email"
- ✓ "Error: Email is required"

### 19. Don't invent claims or commitments `id: no-invented-claims`
Never write a number, time, guarantee, price, legal term, or compliance or security claim that the product team or legal didn't give you. A made-up promise reads as a real one and becomes a support ticket or a legal problem.
- Covers response times ("within 2 hours"), uptime and SLAs, refund or retention windows, certifications ("SOC 2", "HIPAA compliant"), security claims ("end-to-end encrypted"), and absolute promises ("never", "always safe", "guaranteed").
- If the copy needs one and you don't have it, write copy that makes no promise, and flag the gap for the owner: "Needs a number from support: reply time."
- Placeholders in drafts are marked, not invented: `[reply time]`, not "2 hours".
- ✗ "We'll reply within 2 hours. Your data is always safe with us."
- ✓ "We'll reply by email." Flag: reply time and any security claim need an owner.

### 20. Keep personal data out of shared copy `id: no-pii-in-copy`
Don't put personal data in copy that gets logged, shared, previewed, or shown outside the screen: error messages, toasts, page titles, URLs, push and email subjects, notification previews, and analytics labels. Name the record by its role, or mask the value.
- PII means names, email addresses, phone numbers, street addresses, government or payment IDs, and anything that identifies one person on its own.
- Refer to the record, not the person: "the invoice for this customer", not "the invoice for Jane Doe".
- If an identifier helps, mask it: "the card ending 4821", "j***@acme.com".
- Examples and mock data use obviously fake values: `user@example.com`, "Jane Doe".
- ✗ "We couldn't send the invoice to jane.doe@acme.com."
- ✓ "We couldn't send the invoice. Check the recipient's email and try again."

---

## Weakener Categories

Remove on sight. This is the full checklist for principle 15 above.

| Category | Remove | Example |
|---|---|---|
| Hedging | maybe, perhaps, possibly, probably, likely, unlikely, seem(s/ed), appears, apparently, suggests, could/might/may be | "This will probably improve performance." → "This will improve performance." |
| Softening | kind of, sort of, a little, a bit, somewhat, in a way, to some extent, more or less, almost, nearly | "The UI is kind of confusing." → "The UI is confusing." |
| Empty intensifiers | very, really, quite, extremely, highly, so, too, super, totally, completely, absolutely, entirely, fully | "This is a very important step." → "This step matters." |
| Filler adverbs | actually, basically, literally, clearly, obviously, essentially, generally, typically, usually, normally, virtually, effectively, largely, mostly | "This basically means users sign in faster." → "This means users sign in faster." |
| Authorial throat-clearing | I think/believe/feel, I would say/argue, we think/believe/feel, in my opinion, from my perspective, it seems to me | "I think this is the best solution." → "This is the best solution." |
| Passive-aggressive politeness | please note, just, simply, we just want to, you may want to, it would be great if, feel free to | "You can just click the button below." → "Click the button below." |
| Vague quantifiers | some, several, many, few, various, a number of, a range of, a lot of, lots of, plenty of | "Several fields need your attention." → "3 fields need your attention." |
| Redundant framing | it is important/worth noting that, it should be noted that, the fact that, there is/are, it can be said that | "It is important to note that users churn quickly." → "Users churn quickly." |
| Over-cautious legalese | in most cases, under certain circumstances, as needed, where appropriate, if applicable, to the extent possible | "In most cases, changes save automatically." → "Changes save automatically." |
| Weak verb phrases | make a decision→decide, take action→act, give consideration to→consider, have an impact on→impact, play a role in→affect, provide an overview→overview, conduct an analysis→analyze | n/a |
| Talking about talking | this article/section will…, as mentioned earlier, as stated above, below we will see | "This section discusses how billing works." → "Billing charges on the 1st of each month." |

---

## Error Message Guidelines

Apply these on top of the general principles when reviewing or writing error messages.

### Structure `id: error-structure`
Every error must answer:
1. What happened? (required) `id: error-what-happened`
2. Why? (only if it genuinely helps) `id: error-why`
3. What should they do next? (required) `id: error-next-step`

### Voice and tone `id: error-voice-and-tone`
- **Instructive**: describe the issue precisely, optimize for understanding
- **Reassuring**: no disparaging tone, no unnecessary humor
- **Supportive**: always provide a clear next step

### Mechanics `id: error-mechanics`
- Sentence case: "This field is required." not "This Field Is Required."
- No ALL CAPS (except real acronyms)
- 1–2 sentences max

### Don't blame the user `id: error-no-blame`
Describe the situation, not the mistake.
- ✗ "You didn't enter enough characters."
- ✓ "This field needs 8 characters."

### Form field vs system errors `id: error-field-vs-system`
- **Form field**: what's wrong and how to fix it: "Enter a valid email address."
- **System error**: what happened and what to try next: "We couldn't connect. Check your internet or try again."

### Other rules `id: error-other-rules`
- Preserve user input where possible. Let users edit rather than start over
- Place errors adjacent to the element that triggered them (Law of Proximity)

### Component decision tree `id: error-decision-tree`
Use this before writing any error message to pick the right component. Then check the Component Writing Rules below for that component's full rules.

Walk the questions in order and stop at the first "Yes". Don't keep checking once one matches.

```
Does it block progress and require immediate action?
  └─ Yes → Alert Dialog

Is it a system-level issue (outage, permissions, account)?
  └─ Yes → Alert Banner

Is it confirming something that just happened?
  └─ Yes → Toast

Is it attached to a specific form field?
  └─ Yes → Helper Text

Is it contextual to a page section, non-blocking?
  └─ Yes → Inline Alert

Is it a hover label for an icon or interactive element?
  └─ Yes → Tooltip

None of the above?
  └─ Default to Inline Alert, the safest non-blocking option until the case is clear enough to fit one of the rows above
```

The tree is for errors only. Empty states and permission prompts are in Component Writing Rules below.

**Table copy.** Tables use the components above. An empty table is an Empty State. A validation message on one editable cell is Helper Text. A table-level partial failure, such as an import where some rows failed, is an Inline Alert above the table, not an Alert Banner. A bulk delete confirmation is an Alert Dialog. A failed single-row action is a judgment call: anchor it to the row and say which component you picked.

---

## Component Writing Rules

Full writing rules per component, referenced from the decision tree above.

**Shared prefix format** precedes the title, space-separated. Applies to Alert Dialog, Inline Alert, and Alert Banner titles when the component calls for a specific user action. Skip for purely informational or destructive-confirmation dialogs, system outages, or neutral/informational variants.
- `Action Required:` user must complete a step to proceed or restore functionality
- `Approval Required:` a workflow gate; someone must sign off before continuing
- `Review:` no hard block, but the user should look at this before moving on
- `Verify Now:` time-sensitive or security-related; reserve for genuine urgency, use sparingly

### Alert Dialog
**Use when:** the user must acknowledge or decide before continuing. High consequence. Blocking. Golden rule: the user is already interrupted. Be efficient.
- Title: 30–60 characters, no end punctuation, max 2 lines. Communicate the result or required decision, not the cause. Good: "Can't delete project", "Delete 13 files." Bad: "Error occurred while processing."
- Description: 80–200 characters, max 2 sentences. Include error codes in parentheses at the end. Don't repeat the title.
- Actions: verb-led, 2–3 words. Primary = recommended action (Confirm, Enable, Continue). Secondary = exit or undo (Cancel, Discard changes). Link = supplemental resource (Learn more).
- Variants: Confirmation, Informative (use Toast instead if no action needed), Destructive (red primary button), Warning (yellow icon), Error (consider Inline Alert if no specific action required).

### Toast
**Use when:** confirming a completed action. Low priority. No required response. Auto-dismisses.
- Sentence case, no period, max 90 characters, max 2 lines. Must be instantly understandable. If it needs explanation, don't use a toast. Not for promotional messages or upsells. Max 1 action (undo, fix, show, update).
- Success/Confirmation: short past-participle phrase ("Policy updated successfully", "File created"). Error/Negative: succinct statement + optional inline action ("Payment failed"). Neutral: no icon, use when semantic variants don't fit.

### Inline Alert
**Use when:** contextual to a section of the page. The user can continue without acting. Consequence is real but not blocking.
- Title: 20–50 characters. Description: 60–180 characters, 1–2 sentences, don't repeat the title. Optional link action for additional detail.
- Uses shared prefix format. Good: "Review: Premium may change." Bad: "Warning: Something to look at."
- Variants: Neutral (gray, reminders), Informative (blue, form context), Positive (green, confirmed action), Notice (yellow, needs attention).

### Helper Text
**Use when:** attached directly to a form field. Instructs correct input or surfaces a field-level error.
- Under 50 characters, 1 line or short sentence. Neutral state describes the solution proactively, before an error happens. Error state describes the fix, not the mistake. Tell them how to fix it, not what they did wrong. Error state uses a red warning icon.

### Alert Banner
**Use when:** system-level message. Affects the whole app or a major capability. High visibility, persistent until resolved.
- Never auto-dismisses (reappears on refresh if dismissed without fixing). Max 1 action per banner. Max 2 lines on smaller viewports.
- Title (optional): 20–40 characters. Description: 50–140 characters, no period on short phrases.
- Uses shared prefix format. Actions: secondary button (takes user to fix the issue) or link button (learn more).
- Variants: Neutral (gray), Informative (blue), Error (red).

### Tooltip
**Use when:** adding a label or short description to an interactive element on hover or keyboard focus.
- 40–60 characters max, 2 lines max. Only on interactive elements. Never duplicates the visible label of the trigger element. No actions inside tooltips. Only essential labels or descriptions, not "nice to have" context.

### Empty State
**Use when:** a list, page, or section has nothing to show. Not an error.
- Title: 15–40 characters, no end punctuation, says what's missing or what this place is for. Description: 40–120 characters, 1–2 sentences, doesn't restate the title. Action: one primary action, verb-led, 2–3 words.
- Say why it's empty only when that helps the user act. Give a next step that fills the space (for no results, the next step is changing the search or filter). Never blame the user. No filler.
- Variants: First use ("No invoices yet" / "Create an invoice and it shows up here." / Create invoice). User cleared ("All tasks done" / "Add a task to plan your next steps."). No results ("No results for \"invoice 204\"" / "Try a different search or clear your filters." / Clear filters). Empty by nature ("No open issues" / "Nothing needs your attention right now.", no action). No access ("You don't have access to invoices" / "Ask an admin to add you to the Billing team.", never a create action).
- Bad: "Nothing to see here", "Oops! Nothing found". Personality (one device) is for first use only, never user-cleared or no-results states.

### Permission Prompt
**Use when:** the app is about to ask for a device or account permission (location, notifications, camera, contacts, storage), including a priming screen before the native OS dialog.
- Benefit line: 40–80 characters, one sentence, leads with what the user gets. Optional description: 60–150 characters, one concrete detail. Primary action: verb plus the permission name, 2–3 words. Secondary action: exit with no penalty, 2 words ("Not now").
- Ask in context, when the user first reaches the feature that needs it, never on launch. The primary action names the permission and matches the OS dialog. State one specific benefit, not "we need access".
- If the user declines, the follow-up copy says what they'll miss and how to change it later. No guilt, no repeated asks.
- ✓ "Get alerts when your order ships." / Allow notifications / Not now. Declined: "You won't get shipping alerts. Turn them on anytime in Settings."
- ✗ "We need access to your notifications." "Allow all permissions to continue."

---

## Phonaesthetics

When writing new copy, especially labels, CTAs, empty states, and microcopy, consider sound alongside meaning. Copy that sounds good is easier to remember and more pleasant to use.

**Core rules to apply immediately:**
- Prefer consonant-vowel alternation (CVCV) for labels: natural rhythm, easy to say
- Two-beat phrases are catchy; three-beat phrases are melodic; irregular stress is awkward
- Liquids and nasals (l, m, n, r, w, y) → calm, gentle contexts
- Plosives (p, b, t, d, k, g) → energetic, action-oriented CTAs
- Avoid tongue twisters: if it's hard to say, it's hard to remember

**Sound clusters to reach for:**
- `gl-` → clarity, light (insight, vision, illumination features)
- `fl-` → flow, ease (smooth UX, motion)
- `sp-` → speed, energy (action, innovation)
- `cl-` → precision, closure (tools, interactions)

---

## Rhetorical Devices

For principle 17 only. One per surface, never in errors or system copy.

| Device | What it does | Example |
|---|---|---|
| metaphor | States one thing is another, without "like" or "as" | "Your inbox, zero." |
| simile | A lighter comparison with "like" or "as" | "Set up in minutes, not like the old way." |
| personification | Gives the system human agency | "Your dashboard is still waking up." |
| epithet | A short nickname for a feature | "Focus Mode", "Zen Inbox" |
| metonymy-synecdoche | An associated thing stands for the whole | "Add more seats" instead of "add more user licenses" |
| anaphora-epistrophe | Repeats the start or end of short lines | "No setup fees. No hidden costs. No surprises." |
| allusion | A brief reference the audience knows | "Your Swiss Army knife for spreadsheets." |
| paradox | Looks contradictory, resolves into an insight | "Do more by doing less." |
| anastrophe | Inverted word order, very noticeable | "Powerful, this update is." |

---

## Marketing Copy

For marketing sites only (hero, section heads, feature cards, buttons, meta descriptions). Product UI uses the principles and components above. Count a word as a whitespace-separated token that contains a letter or digit, so "in-house" is one word.

| Slot | Max words | Notes |
|---|---|---|
| Hero h1 | 7 | Say what it is and where. No adjectives. |
| Hero sub | 12 | One idea. One acronym max. |
| Section head | 5 | Name the job, not the mood. |
| Card title | 4 | Use the thing's real name. |
| Card description | 20 | Two sentences max. |
| Button or link | 2 to 4 | Verb first. Say what happens. |
| Eyebrow or label | 2 | Only if it carries information. |
| Form helper | 12 | |

**Limits beat rhetorical devices.** If a device doesn't fit the slot, cut the device.

**Puffery fails.** Cut "premier", "unique", "world-class", "best-in-class", "passionate", "we strive to". Warn on "leading". Use a number, a place, or a fact instead.

**Rules** (where a principle already covers it, the principle is named):
- `mkt-one-idea-per-sentence`: if "and" is doing the work of a period, split the sentence (`simple-sentences`).
- `mkt-concrete-over-adjective`: a number, a place, or a fact beats an adjective.
- `mkt-say-it-once`: a fact (rating, years open, price) appears in one place per page. Repeat it only in the footer.
- `mkt-one-name-per-thing`: "Jiu Jitsu" or "Jiu-Jitsu", never both. One label per action sitewide (`consistent-terminology`).
- `mkt-one-acronym`: one acronym per sentence, defined or dropped (`avoid-jargon`).
- `mkt-buttons-say-what-happens`: "Book a free class", not "Get started" or "Submit" (`accessible-copy`).
- `mkt-no-triple-data`: show a start time and a duration, not a range plus both.
- `mkt-no-weakeners`: drop "just", "simply", "really", "we strive to" (`eliminate-weakeners`).
- `mkt-lead-with-the-goal`: lead with the reader's goal, not the organization's history (`user-goal-framing`).
- `mkt-meta-description`: a sentence about the page, not a tagline.

Sentence case everywhere. Pick one heading case and keep it. Example: "Ashburn's premier martial arts facility for all ages" (8 words) becomes "Martial arts for all ages in Ashburn" (7).

---

## Audience and Reading Target

The reading target depends on who the copy is for. Pick a tier, then score against it.

| Tier | Use when | ARI target | Grade |
|---|---|---|---|
| `consumer` (default) | General public, consumer apps, marketing-adjacent UI | ≤ 6 | Grade 5 |
| `professional` | Work tools where users know the domain | ≤ 10 | Grade 9 |
| `technical` | Developer or admin tools | ≤ 12 | Grade 11 |

Choose the tier in this order:
1. If `vois_get_microcopy` returns a tier or audience, use it.
2. If the person states the audience or product type, infer the tier from that.
3. Otherwise use `consumer`. If the audience is unclear, stay on `consumer`. Don't guess upward.

- If the tier isn't `consumer`, name it at the top of the output. If it's `consumer` by default, say nothing extra.
- At `professional` and `technical`, terms the audience already knows are fine. `avoid-jargon` still applies to internal names, system terms, and acronyms the audience wouldn't use.
- A tier changes the ARI target only. Every other principle still applies in full.

---

## Reading Metrics

Calculate and show these for all reviewed and written copy.

### ARI Formula
```
ARI = 4.71 × (characters ÷ words) + 0.5 × (words ÷ sentences) − 21.43
```
- **Characters** = letters and numbers only (no spaces or punctuation)
- **Words** = space-separated tokens
- **Sentences** = units ending in `.` `?` or `!`

Round to one decimal place. Always include grade and age range.

### Grade Level Table

| ARI | Grade | Age |
|---|---|---|
| 1 | Kindergarten | 5–6 |
| 2 | Grade 1 | 6–7 |
| 3 | Grade 2 | 7–8 |
| 4 | Grade 3 | 8–9 |
| 5 | Grade 4 | 9–10 |
| **6** | **Grade 5** | **10–11** |
| 7 | Grade 6 | 11–12 |
| 8 | Grade 7 | 12–13 |
| 9 | Grade 8 | 13–14 |
| 10 | Grade 9 | 14–15 |
| 11 | Grade 10 | 15–16 |
| 12 | Grade 11 | 16–17 |
| 13 | Grade 12 | 17–18 |
| 14+ | Professional | 18+ |

**Target: ARI ≤ 6 (Grade 5, age 10–11) for the default `consumer` tier.** Other tiers are in Audience and Reading Target above.

---

## Review Checklist

Run through this for every piece of copy before finalizing.

**Before starting**
- [ ] If available, called `vois_get_microcopy` (with `context` and `intent`) and checked the returned `provenance` for a workspace/knowledge-base match?

**Voice and structure**
- [ ] Passive voice present?
- [ ] Complex sentence structure?
- [ ] Double negatives?
- [ ] Past or future tense where present tense works?
- [ ] Missing contractions (do not → don't)?

**Clarity**
- [ ] Jargon or technical terms?
- [ ] Reading level above the target for this audience tier?
- [ ] Interface elements named (tab, panel, section)?
- [ ] Labels, links, or status that only make sense visually?
- [ ] System-framing instead of user-goal framing?
- [ ] Too much information up front (no progressive disclosure)?

**Tone**
- [ ] Unnecessary apology?
- [ ] Overuse of exclamation marks?
- [ ] Any weakener words? (see Weakener Categories above)

**Claims and data**
- [ ] Any number, time, guarantee, price, certification, or security claim nobody supplied?
- [ ] Any name, email, phone, address, or ID in an error, toast, title, URL, subject, or analytics label?

**Mechanics**
- [ ] Inconsistent terminology?
- [ ] Preposition starting or ending a sentence?
- [ ] Em dashes present?

**Personality (marketing/taglines/empty states/feature names only)**
- [ ] Could a rhetorical device sharpen this? More than one device stacked on the same surface?

**Marketing pages (only)**
- [ ] Every slot within its limit? Any puffery (premier, unique, world-class)?
- [ ] A fact repeated outside the footer, or one action with two labels?

**Errors (if applicable)**
- [ ] Clear next step provided?
- [ ] Does it blame the user?
- [ ] Right component chosen? (use decision tree above)

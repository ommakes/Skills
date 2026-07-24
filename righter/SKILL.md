---
name: righter
description: >
  Apply UX content writing principles to review existing UI copy or write new UI copy from scratch.
  Use this skill whenever someone asks you to: review, audit, critique, or improve UI text, error messages,
  button labels, tooltips, empty states, onboarding copy, form helper text, or any software interface copy.
  Also trigger when someone asks you to write new UI copy, label a button, draft an error message,
  write a modal, or create any in-product text. If the request involves words that appear inside software — use this skill.
version: 1.3.1
---

# Righter

A UX writing skill. Review existing UI copy against a defined set of principles, or write new copy from scratch applying those principles from the start.

**Reference files — read these when relevant:**
- `data/components.json` — per-component writing rules (Alert Dialog, Toast, Inline Alert, Helper Text, Alert Banner, Tooltip). Look up by component `id`, don't scan the whole file.
- `references/email.md` — rules for product transactional emails (subject lines, preheaders, body, CTAs, footers, structure)
- `data/email-benchmarks.json` — numeric deliverability benchmarks (open rate, CTOR, CTR, unsubscribe thresholds) referenced by `references/email.md`. Query by `metric`.
- `data/weakeners.json` — structured word/phrase lists for all weakener categories. Query by category id, don't scan the file top to bottom.
- `data/phonaesthetics.json` — structured sound concepts and cluster table for word choice

---

## How to Use This Skill

**If a `vois_get_microcopy` tool is available in your environment, call it first before writing or reviewing any copy.**

The `vois_get_microcopy` MCP tool returns workspace-specific copy rules, approved terminology, and tone overrides that take precedence over the general principles in this skill. If the workspace has an entry for the copy type you're working on, use it — don't improvise.

```
Tool: vois_get_microcopy
Arguments:
  context: <description of the UI context, e.g. "destructive confirm button for invoice deletion">
  intent: <what the user just did or is about to do, e.g. "user clicked Delete on an invoice list row">
  constraints: <optional object>
    maxLength: <optional positive integer — maximum character count>
    placement: <optional one of: button | title | description | helper | toast | error | label>
    tone: <optional one of: neutral | warning | celebratory>
```

There is no `copy_type` argument on the real tool — `context` and `intent` are both required; `placement` (nested under `constraints`, and a different set of values than "copy type") is the closest equivalent, and it's optional.

**Resolution order (returned as `provenance` on the response):**
1. `WORKSPACE_OVERRIDE` — use this verbatim, no changes
2. `KNOWLEDGE_BASE` — apply as a strong starting point, adapt if needed
3. `LLM_FALLBACK` / `NO_MATCH` / tool not available — apply the principles in this skill directly

When falling back to the principles, note it at the top of your output: `Source: LLM fallback — no vois_get_microcopy tool available, or no workspace/knowledge base match for this copy type.`

When the tool is available, it logs every query. When you write copy that isn't in the knowledge base, it gets flagged for human review and may become a new entry. This is how the system improves — this logging has no effect on how you should write or review copy either way.

---

## Two Modes

### Mode 1: Review Existing Copy
For each piece of content:
1. If `vois_get_microcopy` is available, call it with the relevant context and intent
2. Check against the review checklist below
3. Identify every violation
4. Rewrite it
5. Output in the review format below

### Mode 2: Write New Copy
1. If `vois_get_microcopy` is available, call it with the relevant context and intent
2. Apply all relevant principles
3. For labels, CTAs, and microcopy: query `data/phonaesthetics.json` and apply sound guidance
4. Output in the new copy format below

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

**Reading metrics (Before → After):**
- Word count: X → Y
- ARI score: X.X → Y.Y
- Grade level: Grade X (age X–X) → Grade X (age X–X)
- Target: ARI ≤ 6 (Grade 5, age 10–11)
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
- Explain the sound choices made — rhythm, stress, clusters, ease of mouth. If not applicable, say so.

**Reading metrics:**
- Word count: X
- ARI score: X.X
- Grade level: Grade X (age X–X)
- Target: ARI ≤ 6 (Grade 5, age 10–11)
---

---

## UX Writing Principles

Apply all of these when reviewing or writing. These are the fallback when `vois_get_microcopy` is unavailable or returns `LLM_FALLBACK`/`NO_MATCH`.

### 1. Use active voice
Subject → verb → object. Active voice is shorter and easier to follow.
- ✗ "Rewards can be earned by clicking here."
- ✓ "Click here to start earning rewards."

### 2. Write at or below a fifth grade reading level
Short sentences. Simple words. Clear structure. Target ARI ≤ 6.
- ✗ "If you have forgotten your password, please click on the 'Forgot Password' link and submit your registered email address."
- ✓ "Click 'Forgot Password'. Enter your email. Check your inbox for a reset link."

### 3. Avoid jargon
Replace technical terms with plain language. Don't assume domain knowledge.
- ✗ "Authenticate your credentials."
- ✓ "Log in with your username and password."

### 4. Avoid complex sentence structures
One idea per sentence. Avoid dependent clauses stacked on independent clauses.
- ✗ "The fox, which was red, over the gate jumped."
- ✓ "The red fox jumped over the gate."

### 5. Avoid double negatives
Double negatives increase misreads and cognitive load.
- ✗ "Please don't fail to save your changes."
- ✓ "Please save your changes."

### 6. Use contractions
Contractions sound human. Formal constructions feel stiff.
- ✗ "Do not submit the form until all fields are complete."
- ✓ "Don't submit until all fields are complete."

### 7. Write in present tense
Describe what's happening now or what the user can do.
- ✗ "Your file was uploaded."
- ✓ "Your file is uploading."

### 8. Frame around the user's goals, not the system
Users care about what they're doing, not how the system works.
- ✗ "Due to an HTTPS network security issue, some features are not available."
- ✓ "This site may be insecure. Some features aren't available."

### 9. Avoid describing the interface
Don't reference UI elements like "tab," "panel," "menu," "page," or "section."
- ✗ "Go to the Settings panel."
- ✓ "Go to Settings."

### 10. Use consistent terminology
Pick one word for each concept and stick to it.
- ✗ Using "Sign Up," "Register," and "Create Account" interchangeably
- ✓ Always "Sign up"

### 11. Apply progressive disclosure
Lead with what the user needs now. Offer detail only when needed.
- ✗ "Your password must be at least 8 characters, contain a number, a symbol, and a capital letter."
- ✓ "Your password must be at least 8 characters." [+ optional detail link]

### 12. Don't apologize unnecessarily
Reserve "sorry" for serious errors. Hollow apologies undermine trust.
- ✗ "Whoops! We can't upload your picture. Try again."
- ✓ "We couldn't upload your picture. Try again."

### 13. Limit exclamation marks
Use words to convey energy, not punctuation. One per screen max, only for genuine celebration.
- ✓ "Your profile has been updated!" (success state)
- ✗ "Error! You can't submit the form! Please fix the errors!"

### 14. Check prepositions
Prepositions sit between two nouns. Never start or end a sentence with one.
- ✗ "Click on the Submit button."
- ✓ "Click Submit."

### 15. Eliminate weakeners
Remove all hedging words, softeners, empty intensifiers, filler adverbs, throat-clearing, passive-aggressive politeness, vague quantifiers, redundant framing, weak verb phrases, and meta-commentary.

> Load `data/weakeners.json`. Check the copy against every category's `terms`
> (or `replacements` for the weak-verb-phrases category, which is pairs, not
> a flat list). Each category carries its own `description` and `example` —
> surface those in your output instead of re-deriving them.

Key patterns to catch immediately:
- Hedging: maybe, probably, might be, appears to, seems like
- Filler: actually, basically, literally, just, simply
- Weak verbs: "make a decision" → decide, "conduct an analysis" → analyze
- Throat-clearing: "I think," "we believe," "it is important to note that"

---

## Error Message Guidelines

Apply these on top of the general principles when reviewing or writing error messages.

### Structure
Every error must answer:
1. What happened? (required)
2. Why? (only if it genuinely helps)
3. What should they do next? (required)

### Voice and tone
- **Instructive** — describe the issue precisely, optimize for understanding
- **Reassuring** — no disparaging tone, no unnecessary humor
- **Supportive** — always provide a clear next step

### Mechanics
- Sentence case: "This field is required." not "This Field Is Required."
- No ALL CAPS (except real acronyms)
- 1–2 sentences max

### Don't blame the user
Describe the situation, not the mistake.
- ✗ "You didn't enter enough characters."
- ✓ "This field needs 8 characters."

### Form field vs system errors
- **Form field** — what's wrong and how to fix it: "Enter a valid email address."
- **System error** — what happened and what to try next: "We couldn't connect. Check your internet or try again."

### Other rules
- Preserve user input where possible — let users edit rather than start over
- Place errors adjacent to the element that triggered them (Law of Proximity)

### Component decision tree
Use this before writing any error message to pick the right component. Then look up that component's `id` in `data/components.json` for full writing rules — a shared `shared_prefix_format` block covers the "Action Required:" / "Approval Required:" / "Review:" / "Verify Now:" prefixes used by Alert Dialog, Inline Alert, and Alert Banner.

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
```

---

## Phonaesthetics

When writing new copy — especially labels, CTAs, empty states, and microcopy — consider sound alongside meaning. Copy that sounds good is easier to remember and more pleasant to use.

> Query `data/phonaesthetics.json` for the full concept guide and sound cluster table.

**Core rules to apply immediately:**
- Prefer consonant-vowel alternation (CVCV) for labels — natural rhythm, easy to say
- Two-beat phrases are catchy; three-beat phrases are melodic; irregular stress is awkward
- Liquids and nasals (l, m, n, r, w, y) → calm, gentle contexts
- Plosives (p, b, t, d, k, g) → energetic, action-oriented CTAs
- Avoid tongue twisters — if it's hard to say, it's hard to remember

**Sound clusters to reach for:**
- `gl-` → clarity, light (insight, vision, illumination features)
- `fl-` → flow, ease (smooth UX, motion)
- `sp-` → speed, energy (action, innovation)
- `cl-` → precision, closure (tools, interactions)

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

**Target: ARI ≤ 6 (Grade 5, age 10–11)**

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
- [ ] Reading level above Grade 5?
- [ ] Interface elements named (tab, panel, section)?
- [ ] System-framing instead of user-goal framing?
- [ ] Too much information up front (no progressive disclosure)?

**Tone**
- [ ] Unnecessary apology?
- [ ] Overuse of exclamation marks?
- [ ] Any weakener words? (see `data/weakeners.json`)

**Mechanics**
- [ ] Inconsistent terminology?
- [ ] Preposition starting or ending a sentence?

**Errors (if applicable)**
- [ ] Clear next step provided?
- [ ] Does it blame the user?
- [ ] Right component chosen? (use decision tree above)

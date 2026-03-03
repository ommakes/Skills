---
name: righter
description: >
  Apply UX content writing principles to review existing UI copy or write new UI copy from scratch.
  Use this skill whenever someone asks you to: review, audit, critique, or improve UI text, error messages,
  button labels, tooltips, empty states, onboarding copy, form helper text, or any software interface copy.
  Also trigger when someone asks you to write new UI copy, label a button, draft an error message,
  write a modal, or create any in-product text. If the request involves words that appear inside software — use this skill.
---

# Righter

You are a skilled UX writer. When given UI copy to review, you identify violations and rewrite it. When asked to create new copy, you apply these principles from the start.

---

## Two Modes

### Mode 1: Review Existing Copy
When given existing UI copy, for **each piece of content**:
1. Identify every violation (see principles below)
2. Rewrite it
3. Show the before/after
4. List which principles were applied and why
5. Output reading metrics for both versions (see Reading Metrics section)

### Mode 2: Write New Copy
When writing new UI copy from scratch:
1. Apply all relevant principles silently
2. Output the final copy
3. List the principles you applied and why
4. Output reading metrics for the final copy (see Reading Metrics section)

---

## Review Output Format

For each piece of copy reviewed, output a block like this:

---
**Before:** [original copy]
**After:** [rewritten copy]

**Principles applied:**
- [Principle name]: [one sentence explaining why this improved the copy]

**Reading metrics (Before → After):**
- Word count: X → Y
- ARI score: X.X → Y.Y
- Grade level: [Grade X / Age range] → [Grade X / Age range]
- Target: ARI ≤ 6 (Grade 5, age 10–11)
---

If writing new copy (Mode 2), omit the "Before" row and "Before" metrics.

---

## UX Writing Principles

Apply all of these when reviewing or writing.

### 1. Use active voice
Subject → verb → object. Active voice is shorter, clearer, and easier to follow.
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
Double negatives increase misreads and cognitive load, especially in warnings.
- ✗ "Please don't fail to save your changes."
- ✓ "Please save your changes."

### 6. Use contractions
Contractions sound human. Formal constructions feel stiff and cold.
- ✗ "Do not submit the form until all fields are complete."
- ✓ "Don't submit until all fields are complete."

### 7. Write in present tense
Describe what's happening now or what the user can do. Avoid past and future tense.
- ✗ "Your file was uploaded."
- ✓ "Your file is uploading."

### 8. Frame around the user's goals, not the system
Write from the user's perspective. They care about what they're doing, not how your system works.
- ✗ "Due to an HTTPS network security issue, some features are not available."
- ✓ "This site may be insecure. Some features aren't available."

### 9. Avoid describing the interface
Don't reference UI elements like "tab," "panel," "menu," "page," or "section." UIs look different for everyone.
- ✗ "Go to the Settings panel."
- ✓ "Go to Settings."

### 10. Use consistent terminology
Pick one word for each concept and stick to it. Don't mix synonyms.
- ✗ Using "Sign Up," "Register," and "Create Account" interchangeably
- ✓ Always "Sign up"

### 11. Apply progressive disclosure
Lead with what the user needs to act on now. Offer additional context only when they need it.
- ✗ "Your password must be at least 8 characters, contain a number, a symbol, and a capital letter."
- ✓ "Your password must be at least 8 characters." [+ optional detail link]

### 12. Don't apologize unnecessarily
Reserve "sorry" for serious errors. Hollow apologies undermine trust.
- ✗ "Whoops! We can't upload your picture. Try again."
- ✓ "We couldn't upload your picture. Try again."

### 13. Limit exclamation marks
Use words to convey energy, not punctuation. One exclamation mark per screen maximum, and only for genuine celebration.
- ✓ Good: "Your profile has been updated!" (success state)
- ✗ Bad: "Error! You can't submit the form! Please fix the errors!"

### 14. Check prepositions
Prepositions should sit between two nouns. Never start or end a sentence with one.
- ✗ "Click on the Submit button."
- ✓ "Click Submit."

### 15. Eliminate weakeners
Remove all of the following word categories. They make copy feel unsure, padded, or passive-aggressive.

**Hedging:** maybe, perhaps, possibly, probably, likely, seem, appears, apparently, suggests, could be, might be, may be

**Softeners:** kind of, sort of, a little, a bit, somewhat, in a way, to some extent, more or less, almost, nearly

**Empty intensifiers:** very, really, quite, extremely, highly, so, too, super, pretty (adverb), totally, completely, absolutely, entirely, fully

**Filler adverbs:** actually, basically, literally, clearly, obviously, essentially, generally, typically, usually, normally, virtually, effectively, largely, mostly

**Throat-clearing:** I think, I believe, I feel, we think, we believe, in my opinion, from my perspective, it seems to me

**Passive-aggressive politeness:** please note, just, simply, we just want to, you may want to, it would be great if, feel free to

**Vague quantifiers:** some, several, many, few, various, a number of, a range of, a lot of, lots of

**Redundant framing:** it is important to note that, it should be noted that, it is worth mentioning that, the fact that, there is / there are, it can be said that

**Weak verbs:** make a decision → decide, take action → act, give consideration to → consider, have an impact on → impact, play a role in → affect, conduct an analysis → analyze

**Meta-commentary:** this section discusses, as mentioned earlier, as stated above, below we will see

---

## Error Message Guidelines

When reviewing or writing error messages, apply these rules on top of the general principles.

### Core error message structure
Every error must answer:
1. What happened? (required)
2. Why? (briefly, only if it helps)
3. What should they do next? (required)

### Error voice and tone
- **Instructive:** Describe the issue precisely. Optimize for understanding.
- **Reassuring:** No disparaging tone. No unnecessary humor.
- **Supportive:** Always provide a clear next step.

### Sentence case and mechanics
- Use sentence case: "This field is required." not "This Field Is Required."
- No ALL CAPS (except real acronyms).
- Correct punctuation. One to two sentences max.

### Don't blame the user
Use neutral phrasing. Describe the situation, not the user's mistake.
- ✗ "You didn't enter enough characters."
- ✓ "This field needs 8 characters."

### Form field errors vs system errors
- **Form field:** Focus on what's wrong with the input and how to fix it. → "Enter a valid email address."
- **System error:** Focus on what happened and what to try next. → "We couldn't connect. Check your internet or try again."

### Preserve user input
Where possible, allow users to edit their original action instead of starting from scratch.

### Place errors close to the source
Error messages should appear adjacent to the element that triggered them (Law of Proximity).

### Choosing the right component

Use this decision tree to pick the right component before writing the message.

**Step 1: Does it require immediate action and block progress?**
- Yes → **Alert Dialog**

**Step 2: Is it a system-level issue affecting the whole app (outage, permissions, account status)?**
- Yes → **Alert Banner**

**Step 3: Is it confirming something that just happened (past action, no required response)?**
- Yes → **Toast**

**Step 4: Is it attached to a specific form field or input?**
- Just a hint to help the user fill it in correctly → **Helper Text (Neutral)**
- User already submitted invalid input → **Helper Text (Negative)**

**Step 5: Is it contextual to a section of the page, and the user can continue without fixing it?**
- Yes → **Inline Alert**

**Step 6: Is it a label or description for an icon button or interactive element on hover?**
- Yes → **Tooltip**

---

## Component Writing Rules

Each component has specific copy rules. Always apply the relevant section below when writing or reviewing.

---

### Alert Dialog

**When to use:** The user must acknowledge or make a decision before continuing. High consequence. Blocking.

**Golden rule:** The user is already interrupted. Be efficient.

**Structure:**
1. Title: states the problem (30–60 characters, no end punctuation, max 2 lines)
2. Description: explains what to do next (80–200 characters, max 3 sentences)
3. Actions: verb-led, 2–3 words max

**Title rules:**
- Communicate the result or the required decision — not the cause
- No punctuation at the end
- ✓ "Can't delete project"
- ✓ "Delete 13 files"
- ✗ "Error occurred while processing"

**Description rules:**
- No more than 2 sentences
- Include error codes in parentheses at the end of the last sentence
- Don't repeat the title
- ✓ "This project has active members. Remove them before deleting."

**Action button rules:**
- Use verbs, not nouns
- Prefer 2–3 words
- Primary = recommended action (Confirm, Enable, Continue)
- Secondary = exit or undo (Cancel, Discard changes, Skip for now, Remind me later)
- Link = supplemental resource (Learn more)

**Variants:**
- **Confirmation** — user confirms a choice; primary highlights preferred action
- **Informative** — notable info to acknowledge; use toast instead if no action needed
- **Destructive** — permanent, negative impact on data; primary button is red
- **Warning** — user should be aware but isn't blocked; yellow warning icon
- **Error** — user may be blocked; consider inline alert if no specific action is required

---

### Toast

**When to use:** Confirming a completed action. Low priority. No required response. Auto-dismisses.

**Rules:**
- Sentence case, no period, max 90 characters, max 2 lines
- Must be instantly understandable — if it needs explanation, don't use a toast
- Don't use for promotional messages, upsells, or proactive/preventative information
- Max 1 action (undo, fix, show, update)

**Sentence construction by variant:**
- **Success/Confirmation:** short past participle phrase → "(noun) + verb-ed + (optional detail)" → "Policy updated successfully" / "File created"
- **Informative:** subject + verb phrase + optional info
- **Error/Negative:** succinct statement + optional inline action → "2 documents missing" / "Payment failed"
- **Neutral (default, gray):** no icon; use when semantic variants don't fit

---

### Inline Alert

**When to use:** Contextual to a section of the page. The user can continue without acting. Consequence is real but not blocking.

**Structure:**
1. Title: signals what the situation is (20–50 characters)
2. Description: explains consequence and next step (60–180 characters, 1–2 sentences)
3. Link action: optional, for additional detail in a new tab

**Rules:**
- Describe what happened, why, and what they can do
- Don't repeat or restate the title in the description
- ✓ Title: "Premium may change" / Body: "Adjusting the effective date can increase or decrease your total premium."

**Variants:**
- **Neutral (gray):** reminders, lower importance → "Payment information / Enter your billing address…"
- **Informative (blue):** notable form-related context → "Accepted payment methods / Only major credit cards are accepted…"
- **Positive (green):** successful action confirmed → "Purchase completed / You'll get a confirmation email shortly."
- **Notice (yellow):** risk or consequence requiring attention → "Update payment information / The saved credit card has expired."

---

### Helper Text

**When to use:** Attached directly to a form field. Instructs correct input or surfaces a field-level error.

**Rules:**
- Under 50 characters, 1 line or 1 short sentence
- Neutral state: describes the solution proactively, before the user makes an error
- Error state: describes the solution, not the error — tell them how to fix it, not what they did wrong
- Error state uses a red warning icon

**Examples:**
- Neutral: "Password must be at least 8 characters."
- Negative: "Create a password with at least 8 characters." (triggered after bad input)

---

### Alert Banner

**When to use:** System-level message. Affects the whole app or a major capability. High visibility, persistent until resolved.

**Use for:** system outages, role-based limitations, account-based restrictions, geographic restrictions.

**Rules:**
- Never auto-dismisses — persists until resolved (reappears on refresh if dismissed without fixing)
- Max 1 action per banner
- Max 2 lines in smaller viewports

**Title (optional):** emphasized lead-in text, flows naturally into the description (20–40 characters)

**Description:** impact + consequence + connects to the action (50–140 characters, no period on short phrases)

**Action types:**
- Secondary button: takes user to fix the issue
- Link button: takes user to learn more

**Variants:**
- **Neutral (gray):** concise message with optional recommended action
- **Informative (blue):** system-level context, include action when possible
- **Error (red):** system-level failure, include action when possible

---

### Tooltip

**When to use:** Adding a label or short description to an interactive element (icon buttons, buttons with no visible label). Appears on hover or keyboard focus.

**Rules:**
- 40–60 characters max, 2 lines max
- Only on interactive elements
- Never duplicates the visible label of the trigger element
- No actions inside tooltips
- Don't use to add "nice to have" context — only essential labels or descriptions

---

## Phonaesthetics (Word Sound Choice)

When writing new copy, especially for labels, CTAs, empty states, or microcopy, consider sound as well as meaning. Good UI copy should be easy to say and pleasant to read aloud.

**Prefer:**
- Consonant-vowel alternation (CVCV) for names and labels: natural rhythm
- Liquid/nasal sounds (l, m, n, r, w, y) for calm, gentle contexts: "melody," "lullaby"
- Plosives (p, b, t, d, k, g) for energetic, action-oriented CTAs: "Get started," "Pick up"
- Two-beat rhythms for labels ("Submit," "Get started," "Sign up")

**Avoid:**
- Tongue twisters and back-and-forth mouth gymnastics ("sixth," "rural")
- Irregular stress patterns in phrases

---

## Reading Metrics

Always calculate and display these for reviewed and written copy.

### How to calculate ARI (Automated Readability Index)

**Formula:**
```
ARI = 4.71 × (characters ÷ words) + 0.5 × (words ÷ sentences) − 21.43
```
- Characters = letters and numbers only (no spaces or punctuation)
- Words = space-separated tokens
- Sentences = units ending in . ? or !

**Grade level mapping:**
| ARI Score | Grade | Age |
|---|---|---|
| 1 | Kindergarten | 5–6 |
| 2 | Grade 1 | 6–7 |
| 3 | Grade 2 | 7–8 |
| 4 | Grade 3 | 8–9 |
| 5 | Grade 4 | 9–10 |
| 6 | Grade 5 | 10–11 |
| 7 | Grade 6 | 11–12 |
| 8 | Grade 7 | 12–13 |
| 9 | Grade 8 | 13–14 |
| 10 | Grade 9 | 14–15 |
| 11 | Grade 10 | 15–16 |
| 12 | Grade 11 | 16–17 |
| 13 | Grade 12 | 17–18 |
| 14+ | Professional | 18+ |

**Target for UI copy: ARI ≤ 6 (Grade 5, age 10–11)**

Round ARI to one decimal place. Always show the grade and age range alongside the score.

---

## Quick Reference: What to Flag in a Review

Go through this checklist for every piece of copy:

- [ ] Passive voice present?
- [ ] Reading level above Grade 5?
- [ ] Jargon or technical terms?
- [ ] Complex sentence structure?
- [ ] Double negatives?
- [ ] Missing contractions (do not → don't)?
- [ ] Past or future tense where present tense works?
- [ ] System-framing instead of user-goal framing?
- [ ] Interface elements named (tab, panel, section)?
- [ ] Inconsistent terminology?
- [ ] Too much information up front (no progressive disclosure)?
- [ ] Unnecessary apology?
- [ ] Overuse of exclamation marks?
- [ ] Preposition starting or ending a sentence?
- [ ] Any weakener words present?
- [ ] For errors: is there a clear next step?
- [ ] For errors: does it blame the user?

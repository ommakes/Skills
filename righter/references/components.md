# Component Writing Rules

Detailed writing rules for each UI component. Read the relevant section when writing or reviewing copy for that component.

---

## Alert Dialog

**When to use:** The user must acknowledge or decide before continuing. High consequence. Blocking.

**Golden rule:** The user is already interrupted. Be efficient.

**Structure:**
1. Title — states the problem (30–60 characters, no end punctuation, max 2 lines)
2. Description — explains what to do next (80–200 characters, max 3 sentences)
3. Actions — verb-led, 2–3 words max

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

## Toast

**When to use:** Confirming a completed action. Low priority. No required response. Auto-dismisses.

**Rules:**
- Sentence case, no period, max 90 characters, max 2 lines
- Must be instantly understandable — if it needs explanation, don't use a toast
- Don't use for promotional messages, upsells, or proactive/preventative information
- Max 1 action (undo, fix, show, update)

**Sentence construction by variant:**
- **Success/Confirmation** — short past participle phrase: "(noun) + verb-ed + (optional detail)" → "Policy updated successfully" / "File created"
- **Informative** — subject + verb phrase + optional info
- **Error/Negative** — succinct statement + optional inline action → "2 documents missing" / "Payment failed"
- **Neutral (gray)** — no icon; use when semantic variants don't fit

---

## Inline Alert

**When to use:** Contextual to a section of the page. The user can continue without acting. Consequence is real but not blocking.

**Structure:**
1. Title — signals what the situation is (20–50 characters)
2. Description — explains consequence and next step (60–180 characters, 1–2 sentences)
3. Link action — optional, for additional detail in a new tab

**Rules:**
- Describe what happened, why, and what they can do
- Don't repeat or restate the title in the description
- ✓ Title: "Premium may change" / Body: "Adjusting the effective date can increase or decrease your total premium."

**Variants:**
- **Neutral (gray)** — reminders, lower importance: "Payment information / Enter your billing address…"
- **Informative (blue)** — notable form-related context: "Accepted payment methods / Only major credit cards are accepted…"
- **Positive (green)** — successful action confirmed: "Purchase completed / You'll get a confirmation email shortly."
- **Notice (yellow)** — risk or consequence needing attention: "Update payment information / The saved credit card has expired."

---

## Helper Text

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

## Alert Banner

**When to use:** System-level message. Affects the whole app or a major capability. High visibility, persistent until resolved.

**Use for:** system outages, role-based limitations, account-based restrictions, geographic restrictions.

**Rules:**
- Never auto-dismisses — persists until resolved (reappears on refresh if dismissed without fixing)
- Max 1 action per banner
- Max 2 lines in smaller viewports

**Title (optional):** emphasized lead-in text, flows naturally into the description (20–40 characters)

**Description:** impact + consequence + connects to the action (50–140 characters, no period on short phrases)

**Action types:**
- Secondary button — takes user to fix the issue
- Link button — takes user to learn more

**Variants:**
- **Neutral (gray)** — concise message with optional recommended action
- **Informative (blue)** — system-level context, include action when possible
- **Error (red)** — system-level failure, include action when possible

---

## Tooltip

**When to use:** Adding a label or short description to an interactive element on hover or keyboard focus.

**Rules:**
- 40–60 characters max, 2 lines max
- Only on interactive elements
- Never duplicates the visible label of the trigger element
- No actions inside tooltips
- Don't use to add "nice to have" context — only essential labels or descriptions

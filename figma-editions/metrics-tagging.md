---
name: metrics-tagging
version: 1.0.0
description: Analyze UI mockups, screenshots, or prototype frames to identify all trackable interactions and generate a complete analytics event taxonomy table. Use this skill whenever a designer uploads a screen, mockup, prototype screenshot, or UI frame and wants to know what should be tagged, what events to fire, or how to document analytics for handoff. Also trigger when someone asks to "tag this screen," "identify events," "create a tagging spec," "what should we track," or "build an event table" for any UI. If a designer shares any visual of a UI and mentions analytics, tracking, tagging, GTM, events, or metrics — use this skill.
---

# Metrics Tagging Skill

> Full version & updates: https://github.com/ommakes/Skills/blob/main/metrics-tagging/SKILL.md

Analyze a UI mockup or screenshot and produce a complete analytics event taxonomy, ready for handoff to a tag implementation team.

## Mental Model: Three Levels of Tagging

Before generating the table, always frame the output across three levels. This helps designers understand *why* each tag matters — not just *what* it is.

| Level | What it answers | Example |
|-------|----------------|---------|
| **Page** | What happened on screen | User clicked "Save" button |
| **App** | What workflow is this part of | Account setup flow completion |
| **Business** | Which KPI does this feed | Task completion rate, time-on-task, abandonment rate |

## Input

Accept any of:
- Screenshot or photo of a UI mockup
- Prototype frame image
- Annotated design screenshot
- Description of a screen with listed components

The designer may also provide:
- The flow name (e.g. "Onboarding", "Checkout", "Settings", "Profile Edit")
- The product type (e.g. SaaS, e-commerce, internal tool, consumer app)
- Existing event naming conventions already in use
- Business KPIs this flow relates to

If the designer does not provide product or flow context, ask for it before generating the table. The "Purpose" column cannot be filled accurately without knowing what the flow is trying to accomplish.

## Naming Convention

Use camelCase. Follow this pattern: `noun + Verb`

**Format:** `[object/screen][Action]`

**General examples:**
- `checkoutViewed` — page load on checkout screen
- `cartItemRemoved` — user removes item from cart
- `planSelected` — user selects a pricing plan
- `passwordChanged` — user updates their password
- `formSubmitted` — generic form submit
- `modalDismissed` — user closes a modal
- `flowCancelled` — user exits a multi-step flow

**Rules:**
- No underscores, no hyphens
- Noun first, verb second
- Use past tense for completed actions (`Saved`, `Selected`, `Changed`, `Entered`)
- Use present tense for initiated states (`Start`, `Viewed`)
- Keep names under 30 characters
- If the product already has a naming convention, follow it exactly and note it in the output

## Output: Event Taxonomy Table

Produce a markdown table with exactly these five columns:

| # | Event or Action | ID or Variable | Definition | Purpose | Event Name |
|---|----------------|----------------|------------|---------|------------|

### Column definitions:

**Event or Action** — Plain English label. What the user did or what happened. Use the element type + label text. Examples:
- `Button Click: "Save Changes"`
- `Dropdown: "Account Type"`
- `Page Load`
- `Text Input: "Email Field Changed"`
- `Radio: "Billing Frequency"`

**ID or Variable** — The DOM-level selector or variable name the tag team will hook into. Use kebab-case. Infer from the label text if not visible in the mockup. Examples:
- `save-changes-btn`
- `account-type-select`
- `email-input`
- `billing-frequency-radio`

**Definition** — When exactly does this event fire? Be precise. Start with "When the user..." or "The moment the page..."

**Purpose** — Which business question does tracking this answer? Connect to a KPI. If flow context was provided, map directly to a stated KPI. If not, use the most likely KPI for that element type:
- Submit buttons → task completion rate
- Cancel/close buttons → abandonment rate
- Start events → funnel entry rate
- Feature toggles → feature adoption rate
- Error states → error rate

**Event Name** — camelCase event name following the naming convention above.

## Cascading Input Priority

Not all inputs are equal. When deciding whether to tag a specific input field, apply these two tests. If either passes, the input must be tagged and flagged.

**Test 1 — Does it cascade?**
If changing this field's value causes anything else in the flow to change — other fields appearing or hiding, validation rules shifting, downstream behavior changing — it must be tagged. These inputs explain why users take different paths through the same flow.

**Test 2 — Does it have sizeable outcome impact?**
Even if nothing visually changes, does this field's value directly affect the product's core outcome — pricing, eligibility, access level, subscription tier, risk calculation, permissions? If yes, tag it.

**General examples of must-tag inputs:**
- Plan type selector — changes what features or pricing applies
- Account type dropdown — may change what form fields appear next
- Billing frequency toggle — affects pricing calculation
- User role selector — changes what the user can access
- A/B test variant toggle — affects the entire experience downstream
- Any field that unlocks or hides a subsequent step

**General examples of lower-priority inputs:**
- Middle name or suffix fields
- Secondary address line
- Optional bio or description fields (unless length or content triggers logic)
- Display preference fields with no functional effect

When analyzing a mockup, mark each cascading or high-impact input with a **[CASCADE]** or **[HIGH IMPACT]** flag in the Purpose column. This tells the tag team what to prioritize if they need to phase implementation.

If cascade behavior of any input is unclear from the mockup, flag it in the Coverage Gaps section and prompt the designer to verify with a PM or business analyst before handoff.

## Element Coverage Checklist

When analyzing a screen, systematically check for all of these. Do not skip any category.

**Always tag:**
- [ ] Page/view load
- [ ] Every CTA button (primary and secondary)
- [ ] Every form submit button
- [ ] Every cancel / dismiss / close button (high abandonment signal)
- [ ] Every cascading input — any field whose value changes the flow
- [ ] Every high-impact input — any field with direct effect on a core business outcome
- [ ] Every radio button group
- [ ] Every checkbox and toggle that affects downstream behavior

**Tag if present and notable:**
- [ ] Dropdowns / selects (cascading ones first)
- [ ] Text input fields (high-impact ones first)
- [ ] Expand/collapse controls
- [ ] Search / autocomplete interactions
- [ ] Modal or drawer open/close events
- [ ] Warning or alert dismissed actions
- [ ] Add / expand section actions
- [ ] Back / navigation links
- [ ] Pagination or load-more actions

**Flag but do not generate — prompt the designer:**
- Screen states not visible in the mockup: error state, empty state, loading state
- Conditional logic (fires only when X condition is true)
- Multi-step flows where the same element appears across steps
- Any input whose cascade behavior cannot be determined from the mockup alone

## Coverage Gap Section

After the table, always output a Coverage Gaps section:
The following were NOT visible in the provided mockup or could not be
determined from it. Verify these before handoff:

 Error state: What fires if form validation fails?
 Loading state: Is there a spinner or skeleton? Should it be tracked?
 Empty state: What fires if the list/section is empty on load?
 [Any cascading inputs flagged as unclear]
 [Any conditional logic that depends on user state or permissions]

 ## Business Context Priming

If the designer provides flow context, use it to sharpen the Purpose column.
Common KPIs by product type to map to:

**SaaS / internal tools:**
- Task completion rate → flow save/submit events
- Task abandonment rate → cancel, close, back events
- Time on task → flow start + flow saved pair
- Feature adoption → optional feature toggles
- Error rate → validation error events

**E-commerce:**
- Conversion rate → add to cart, checkout initiated, purchase completed
- Cart abandonment → remove from cart, checkout exited
- Funnel drop-off → step viewed vs. step completed pairs

**Consumer apps:**
- Activation rate → onboarding completed event
- Retention signal → return visit, key feature used
- Engagement depth → feature interaction frequency

**If no context is provided**, use generic KPI language and note in the output that Purpose column accuracy will improve with flow context.

## Output Format

1. Start with a brief **Screen Summary** (1-2 sentences: what screen is this, what flow is it part of)
2. Output the **Event Taxonomy Table** in full
3. Output the **Coverage Gaps** section
4. End with a **Naming Convention Reference** block showing the pattern used and any conventions observed or inferred

## Example Output Structure

## Quality Check Before Outputting

Before finalizing output, verify:
- Every visible interactive element is in the table
- No event name is duplicated
- All event names follow the camelCase `nounVerb` pattern
- Every row has all 5 columns populated
- Cancel/close/dismiss buttons are included
- Cascading inputs are flagged [CASCADE] in the Purpose column
- High-impact inputs are flagged [HIGH IMPACT] in the Purpose column
- Coverage gaps section calls out all missing screen states
- Any input whose cascade behavior is unclear is flagged in Coverage Gaps
- If no flow context was provided, the output notes that Purpose column accuracy is limited and prompts the designer to re-run with context

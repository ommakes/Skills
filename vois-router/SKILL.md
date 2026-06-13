---
name: vois-router
version: 1.1.0
attribution: Personify Labs
license: CC-BY 4.0
description: >
  Orchestrates the Vois design system skill chain. Use this skill as the single
  entry point whenever you're doing any UI work against the Vois design system —
  building a screen, picking a component, writing copy, or defending a design
  decision. The router reads your input, identifies the right starting point and
  skill sequence, and packages context forward so you don't have to re-explain
  the problem at each step. Works with vois-patterns, vois-components,
  vois-design-system, righter, and design-rationale. Each of those skills can
  still be used standalone — this router is additive, not a replacement.
  Trigger when someone says "build this screen", "what component should I use",
  "help me write this copy", "route me through the design system", or pastes any
  feature brief, ticket, or design question without specifying which skill to use.
---

# Vois Router

A single entry point for the Vois design system skill chain. You describe what
you're working on. The router identifies which skills are needed, in what order,
and carries context forward between them so each skill starts with what it needs.

The skills this router coordinates:

- `vois-patterns` — structural container decisions
- `vois-components` — specific component selection
- `vois-design-system` — tokens, spacing, implementation
- `righter` — all UI copy, invoked inline throughout
- `design-rationale` — cognitive/behavioral audit, opt-in at two points in the chain

Each of these skills works standalone. The router adds orchestration on top —
nothing more.

-----

## Modes

The router runs in two modes. The designer sets this at the start or at any point
during a session.

**Gated mode (default)**
The router pauses at each handoff, shows what's being passed forward, and waits
for confirmation before loading the next skill. Use this when exploring unfamiliar
territory, when the brief is complex, or when the designer wants control at each step.

**Fast mode**
The router executes the full chain without stopping at handoffs, then presents a
complete summary at the end for review. The designer opts in by saying "just run it",
"no confirmations", or "fast mode". Default is always gated.

To switch modes mid-session: "switch to fast mode" or "switch to gated mode".

-----

## Session State

The router maintains a session state block throughout the chain. It is updated at
every step and reprinted collapsed at each handoff so the designer always knows
where they are.

Format:

```
━━ Session ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Work type:    [classification]
Platform:     [web | ios | android | inferred: web]
Mode:         [gated | fast]

Chain:
  ✓ vois-patterns     PATH-D — Dialog/Action Sheet
  ● vois-components   in progress
  ○ vois-design-system pending
  ○ righter           pending (3 copy items queued)
  ○ design-rationale  pending (offered after components)

Gaps flagged:  [none | description if any]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Legend: ✓ complete · ● in progress · ○ pending · ✕ skipped

Update the session state at every step. Never let it go stale. If the chain
is abandoned mid-run, the session state is the recovery artifact — the designer
can resume from it in a new session by pasting it back in.

-----

## Step 1: Read the input

Before routing anything, read the full input carefully. You're looking for four things:

1. **What exists** — ticket, brief, screen description, specific question, or
   existing design to evaluate?
1. **What's being asked** — build something new, make a decision, write copy,
   defend a choice, or pick up mid-chain?
1. **How complete is the context** — enough to route confidently, or is a
   clarifying question needed?
1. **Platform signal** — any explicit or inferable platform context?

If the input is too vague to route — "help me with the design system" with no
further context — ask one question before proceeding:

> What are you trying to build or decide? A sentence or two is enough.

Do not ask multiple questions. Do not ask for information that won't change the route.

-----

## Step 2: Resolve platform

Platform is a required input. It affects vois-patterns mobile rules,
vois-design-system breakpoint behavior, and righter copy choices. Silently
inferring the wrong platform produces wrong output through the entire chain.

**Infer confidently (no need to ask) when:**

- Brief mentions React, shadcn, Tailwind, web, browser → infer **web**
- Brief mentions iOS, Swift, SwiftUI, iPhone, iPad → infer **ios**
- Brief mentions Android, Kotlin, Jetpack → infer **android**
- The Vois design system is explicitly mentioned with no other context → infer **web**

**Ask before routing when:**

- No platform signal at all
- Brief could be web or native (e.g. "mobile app" with no further detail)

Ask:

> One quick thing — is this for web, iOS, or Android?

Record the platform in session state and carry it through every skill in the chain.

-----

## Step 3: Classify the work

Map the input to one of six work types.

|Work type         |Signals                                                                             |Entry point     |
|------------------|------------------------------------------------------------------------------------|----------------|
|**FULL-CHAIN**    |Feature brief, screen description, Jira/ADO ticket, "build this"                    |vois-patterns   |
|**PICK-UP**       |"I've done the structure", "I have path ID X", resuming a prior session             |vois-components |
|**COMPONENT-ONLY**|"Modal or drawer?", "which component for X?", single component decision             |vois-components |
|**COPY-ONLY**     |"What should this say?", copy pasted for review, error message request              |righter         |
|**RATIONALE-ONLY**|"Help me defend this", "what principle applies?", "how do I explain this?"          |design-rationale|
|**AUDIT**         |"Review this screen", "check this against the design system", existing design shared|design-rationale|

If the input signals multiple work types — a ticket that also asks for copy —
classify by the primary job. Copy embedded in a full-chain brief is handled
inline by righter and doesn't change the classification.

If the input could be FULL-CHAIN or PICK-UP, default to FULL-CHAIN. Running
vois-patterns when structure is already decided wastes one step. Skipping it
when it was needed produces worse decisions downstream.

-----

## Step 4: Output the route

Show the designer the planned route before loading any skill. In fast mode,
skip confirmation and proceed immediately after displaying it.

```
━━ Route ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Work type:  [classification]
Platform:   [platform]
Mode:       [gated | fast]

Sequence:
  1. [skill] — [one sentence on what it does here]
  2. [skill] — [one sentence]
  3. [skill] — [one sentence]

Righter:          [invoked inline / not needed]
Design-rationale: [offered after step 1 + step 2 / not applicable]

[Gated: Ready to start? Confirm or adjust.]
[Fast: Starting now.]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

In gated mode: wait for confirmation. If the designer adjusts the route,
re-display the updated sequence before proceeding.

In fast mode: display the route and immediately begin step 1.

-----

## Step 5: Execute the chain

### Gated mode — handoff block

Between each step, output the session state (updated) and a handoff block before
loading the next skill.

```
━━ Handoff ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ [skill name] complete

Passing forward:
  - [key output 1]
  - [key output 2]
  - [key output 3]

Next: [skill name] — [one sentence on what it will do with this context]

[Session state block]

Continue? →
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Keep it tight. The handoff block is not a summary of everything the skill did.
It's only the outputs the next skill needs. The designer should be able to read
it in five seconds.

If a designer says "continue", "yes", "go", or similar — proceed immediately.
Don't re-ask or add friction to confirmations.

### Fast mode — no handoff blocks

Execute all steps without pausing. Collect all outputs. At the end, present the
chain completion block (see below).

-----

## Skill sequences by work type

### FULL-CHAIN

```
1. vois-patterns
   Context package: user task, platform, constraints from the brief
   Outputs needed:  path ID, container type, mobile adaptation notes

   → Offer design-rationale here (opt-in)

2. vois-components
   Context package: path ID from step 1, jobs-to-be-done for the screen
   Outputs needed:  component selections, record_component_choice calls logged

   → Offer design-rationale here (opt-in)

3. vois-design-system
   Context package: components from step 2, platform, token constraints
   Outputs needed:  implemented UI with tokens, spacing, accessibility applied

righter: invoked inline at steps 1 and 2 (see righter rules below)
```

**Context packaging for vois-patterns:**

> "The user is trying to [user task]. Platform: [platform]. Constraints: [any
> from the brief]. What container type and structure should we use?"

Do not pass the raw input to vois-patterns. Translate it into the decision tree
framing the skill expects: what is the user trying to accomplish?

**Context packaging for vois-components:**

> "vois-patterns selected [PATH-X] — [container type]. Jobs-to-be-done for this
> screen: [list]. Which components should we use?"

**Context packaging for vois-design-system:**

> "Components selected: [list with reasoning]. Platform: [platform]. Implement
> using Vois tokens, spacing rules, and accessibility requirements."

-----

### PICK-UP

```
Entry point: vois-components
Context package: path ID from prior session, jobs-to-be-done

Then: vois-design-system
Context package: components from vois-components
```

**Path ID validation — always run this before passing forward:**

Before packaging the path ID to vois-components, confirm it with the designer:

> "You're picking up with [PATH-X] — [what that path means, one sentence]. Does
> that still match what you're building?"

If they confirm: proceed.
If they're unsure or the description doesn't match: offer to run vois-patterns
first to re-establish the correct path.

A stale or wrong path ID passed silently to vois-components produces subtly
wrong component selections with no error. Always validate.

-----

### COMPONENT-ONLY

```
1. vois-components
   Context package: decision framed as job-to-be-done

2. vois-design-system (scoped)
   Context package: selected component only — relevant token and usage rules,
   not a full implementation run
```

Frame the component question as a job before loading the skill:

> "The job is to [verb + object]. Which component handles this?"

Don't present it as "modal vs drawer" — vois-components works from jobs, not
component names. Let the decision tree resolve the choice.

-----

### COPY-ONLY

```
1. righter
   Context package: copy type, what the copy is for, existing copy if reviewing,
   platform if relevant
```

Frame for righter:

> "Copy type: [type]. Context: [what it's for]. [Existing copy to review /
> Write new copy from scratch]."

-----

### RATIONALE-ONLY

```
1. design-rationale
   Context package: the decision, user problem, trade-off, moment in flow,
   platform, reversibility
```

Before loading design-rationale, check whether the input covers its six
required fields:

- Decision ← required, ask if missing
- User problem ← required, ask if missing
- Trade-off ← required, ask if missing
- Moment in flow ← omit if not flow-specific
- Platform ← infer if not provided
- Reversibility ← infer if not provided

Ask for any of the first three that are missing before loading the skill.
Combine into one question if multiple are absent:

> "To give you a rationale that holds up, I need a bit more: [missing fields
> as a plain list]. Can you fill those in?"

-----

### AUDIT

An audit examines an existing design from two angles: cognitive/behavioral
(design-rationale) and structural (vois-patterns). Design-rationale runs first
because that's usually what the designer actually wants. The vois-patterns check
is secondary and runs in a defined lightweight mode.

```
1. design-rationale (audit mode)
   Context package: screen description or shared artifact, stated purpose,
   primary user task
   Output: principle alignment notes, tensions flagged, decisions worth defending

2. vois-patterns (audit mode — lightweight)
   Context package: structural decisions observed in the screen
   Output: one of three verdicts per structural decision observed:
     - ALIGNED — matches the pattern library
     - DIVERGES — differs from the pattern but for a stated reason
     - FLAGGED — differs from the pattern with no clear justification
```

The vois-patterns audit check is not a full re-run of the decision tree. It's
a focused question: does the container type, layout structure, and form handling
match what the pattern library would have produced for this user task? If yes,
note it. If no, flag it with the specific pattern it diverges from and why that
matters.

The audit does not prescribe redesigns. It surfaces findings. What the designer
does with them is their call.

-----

## Righter: inline invocation rules

Righter is not a sequential step. It's invoked whenever copy is needed or
identified during the chain. The router is responsible for recognizing copy
moments and loading righter at the right time.

**Trigger righter inline when:**

- vois-patterns identifies a section needing labels, button copy, or error messages
- vois-components selects a component with required copy (AlertDialog, Toast,
  empty states, helper text, confirmation dialogs)
- The designer asks about specific wording at any point
- Copy is included in the brief and needs review

### Single copy item

Pause the current step, run righter, then resume.

> "Pausing [current skill] — copy needed. [Copy type], context: [what it's for].
> Running righter."

After righter:

> "Righter complete. Copy: [output]. Resuming [current skill]."

### Batched copy (3 or more items)

If three or more copy items are identified at the same step, collect them all
first and run righter once with the full list. Don't invoke righter per item —
it fragments the chain badly on copy-heavy screens.

> "Pausing [current skill] — [N] copy items identified. Running righter in
> batch mode."

Pass all items to righter together:

> "Copy type and context for each:
> 
> 1. [type] — [context]
> 1. [type] — [context]
> 1. [type] — [context]
>    Write all. Apply righter principles to each."

After righter completes, resume the chain with all copy outputs integrated.

Track queued copy items in the session state so none get dropped across
righter invocations.

-----

## Design-rationale: two opt-in points

Design-rationale is offered at two points in a FULL-CHAIN run. Both are opt-in.
Neither is on the default path. The designer has to say yes for either to run.

**Offer point 1: after vois-patterns**

> "Structure decided: [PATH-X] — [container type]. Want a design-rationale check
> on this structural choice before moving to components? It'll surface whether
> the cognitive/behavioral case for this container type holds up. One extra step."

If yes: load design-rationale with the structural decision as input, using the
four-move structure for the container choice. Then proceed to vois-components.
If no or no response: proceed to vois-components immediately.

**Offer point 2: after vois-components**

> "Components selected. Want a design-rationale audit on these choices before
> implementation? It'll map each component to its cognitive rationale and flag
> any tensions. One extra step."

If yes: load design-rationale in audit mode with the component choices as input.
If no or no response: proceed to vois-design-system immediately.

Don't offer design-rationale in COPY-ONLY runs.
In RATIONALE-ONLY and AUDIT runs, design-rationale is the primary step.
Don't double-offer — if the designer declined offer point 1, don't re-offer
the same question at offer point 2.

-----

## Chain completion block

When the full chain finishes — or when fast mode completes — output a chain
completion block. This is the consolidated record of the session.

```
━━ Chain Complete ━━━━━━━━━━━━━━━━━━━━━━━━━
Work type:   [classification]
Platform:    [platform]

Decisions:
  Structure:    [PATH-X] — [container type]
  Components:   [list with one-line reasoning each]
  Copy:         [list of copy items produced]
  Rationale:    [ran / skipped at offer point 1 / skipped at offer point 2]

Gaps flagged:
  [none | description of any gap reports surfaced]

Design-rationale findings:
  [summary if ran, or "not run"]

Implementation:
  [link or reference to vois-design-system output]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

The completion block is the artifact. The designer should be able to paste it
into a Jira ticket, a design handoff doc, or a PR description and have a clear
record of what was decided and why.

-----

## Abandonment and recovery

If the designer stops responding mid-chain, the router does not keep prompting.
After one unanswered handoff prompt, stop and note:

> "Chain paused at [current step]. To resume, paste the session state block
> and say 'resume'."

If a designer pastes a session state block and says "resume", read it and
pick up the chain from the last completed step. Don't re-run completed steps.

-----

## Gap handling

If vois-patterns or vois-components calls `report_pattern_gap`, surface it
immediately. Don't absorb it silently and proceed as if a pattern matched.

> "Gap flagged by [skill]: [gap description]. Closest match: [path ID or
> component name].
> 
> How do you want to proceed?
> A — Use the closest match and note the divergence
> B — Stop here and design a new pattern before continuing
> C — Continue without a pattern match (document the decision)"

Record the gap and the designer's choice in the session state under
"Gaps flagged". Include it in the chain completion block.

-----

## What the router never does

- Routes before resolving platform when it's genuinely ambiguous
- Loads a skill without displaying the route first
- Skips the handoff block in gated mode
- Asks more than one clarifying question at a time
- Re-explains context the designer already provided
- Invokes design-rationale automatically — always opt-in
- Offers design-rationale twice if the designer already declined once
- Bypasses vois-patterns to enter at vois-components in a FULL-CHAIN run
- Passes a PICK-UP path ID forward without validating it first
- Makes component or structural decisions itself
- Invokes righter per-item when three or more copy items are queued
- Proceeds past a gap report without surfacing it
- Keeps prompting after one unanswered handoff in gated mode

-----

## Quick reference

|You provide                        |Classification  |Starts at                         |
|-----------------------------------|----------------|----------------------------------|
|Jira / ADO ticket                  |FULL-CHAIN      |vois-patterns                     |
|Feature brief or screen description|FULL-CHAIN      |vois-patterns                     |
|"Build this screen / feature"      |FULL-CHAIN      |vois-patterns                     |
|Session state block + "resume"     |PICK-UP         |last completed step               |
|"I have path ID X, now what"       |PICK-UP         |vois-components (after validation)|
|"Modal or drawer for this?"        |COMPONENT-ONLY  |vois-components                   |
|"What component handles X?"        |COMPONENT-ONLY  |vois-components                   |
|"What should this say?"            |COPY-ONLY       |righter                           |
|Copy pasted for review             |COPY-ONLY       |righter                           |
|"How do I explain this decision?"  |RATIONALE-ONLY  |design-rationale                  |
|"Audit this screen"                |AUDIT           |design-rationale                  |
|Unclear                            |Ask one question|—                                 |

# Questionnaires `[PATH-H]`

Use this path when someone answers questions that another person wrote. Surveys, intake forms, assessments, and feedback forms all qualify. If the user edits their own record, use PATH-C. Dense desktop forms stay in PATH-C.

Card sort is out of scope. Route it to a research tool. Copy for every state goes to the righter skill.

## Layout `[PATH-H-1]`

- One question per screen.
- Group 2 to 3 simple questions on one page only when the survey has 10 questions or fewer.
- Next is a full-width button in a sticky bar at the bottom.
- From 768px, centre the content at 640px max.

Why: SurveyMonkey's own research found that questions per page and scrolling change mobile completion. Total question count does not.

The 56px option row is an accepted exception to compact density, inside questionnaires only (`[DS-RESPONSIVE-013]`). The 52px input and button sizes are still proposals. Do not use them in dense agent tools.

## Pick the component `[PATH-H-2]`

Check the properties in order. The first match wins.

| # | The question | Component |
|---|---|---|
| 1 | Long answer, over 120 characters | LongTextbox |
| 2 | Short answer | OpenText. A typed value (email, phone, number) goes to vois-fields |
| 3 | Several statements share one scale | Accordion, one statement at a time, 5 per group at most |
| 4 | 11 points, 0 to 10 | Slider with word labels |
| 5 | 5 points | Likert, horizontal |
| 5 | 7 points | Likert, vertical |
| 6 | Order matters | Rank. 6 or fewer: rank all. 7 to 12: top 3. Over 12: do not rank |
| 7 | Multiple answers | CheckboxCard |
| 8 | Single answer | RadioCard up to 7, RadioListRow for 8 to 12, searchable list over 12 |

You run this with `scripts/question-engine.mjs`.

### Single select
- One column on mobile. Row is the target.
- Native radio inside fieldset and legend.
- Never a native select as the main mobile control.
- "Other" is the last option and opens a short field inline.

### Multiple choice
- Say the rule before the answer: "Select up to 3". Show "2 of 3 selected".
- At the max, disable the rest and say why. Never drop an earlier pick.
- "None of the above" clears the others, and any other pick clears it.
- Never auto-advance.

### Likert
- 5 points by default. 7 only when the construct needs it. Never mix 5 and 7 for one construct. Never flip direction.
- Label every point. Endpoint-only labels are fine for a 5-point numeric scale, never for 7.
- Batteries use an accordion on mobile. Never a grid below 1024px.

### Rank
- Rank is a card sort. Every item sits in one list. Press and hold a row (mouse or touch, 200ms) to drag it. Rows shift live as it moves. Page scroll still works before the hold ends.
- A keyboard works too: Space picks up, arrow keys move, Space drops, Escape cancels.
- Up and down buttons are always there. They are the way to rank without dragging (WCAG 2.5.7, `[DS-A11Y-023]`).
- The answer is empty until the person moves an item or taps "Keep this order". The starting order never counts as an answer.
- Top 3: the first 3 rows count. Show a cutoff line under row 3.
- Announce each move: "Battery life, moved to position 2 of 6".

### Open and long text
- Placeholder is an example, never the instruction.
- Long text starts at 3 rows and stops at 8 on mobile or 12 on desktop, then scrolls inside.
- The counter shows from the first character.
- Enter adds a new line. A shortcut such as Cmd+Enter submits and is printed by the button.

## Flow and progress `[PATH-H-3]`

- Progress is a 4px bar plus "Question 3 of 12". Never a bare percentage. Never 100% before the Submit screen.
- Count answered required questions over required questions on the path. If branching changes the total, use section progress.
- Back restores the answer, its prefill badge, and any draft.
- Changing a branch answer clears only the answers it makes invalid, with a notice.
- Save on change. Show a quiet "Saved". Never a modal.
- Review screen lists every answer with its source and an Edit link. Submit leads to a loading state and then a confirmation that says what was received and what happens next.
- Logic-skipped answers are stored as `skipped_by_logic` and appear as removed on Review.

## Required and errors `[PATH-H-4]`

- Mark every question "Required" or "Optional" in words. An asterisk alone is not enough.
- After a failed Next: top banner ("2 things to check") with links, a specific inline error under each bad question, a 2px error border, and focus on the first error.
- Examples: "Select at least 2. You selected 1."
- Put the error above the input, between label and field.

## Prefill and drafts `[PATH-H-5]`

The rules live in vois-fields as FIELD-PREFILL. In a questionnaire:

| Source | Show as |
|---|---|
| Verified profile data, high confidence | Prefilled, with a badge and a source line |
| Previous answer | "Last time you said: X" with Keep and Change |
| Link parameter | Prefilled, marked "From your invitation", one tap to clear |
| AI guess, low or medium confidence | Suggestion chip under a blank field |

Every answer carries its origin: user, prefill source, suggestion accepted, suggestion edited, or previous answer kept.

AI follow-up questions are labelled, optional, capped at 1 to 2 per trigger, and never built from a prefilled answer the respondent has not confirmed.

## Schema and checks

`data/question.schema.json` is the contract for a question. `scripts/check-questions.mjs` validates the schema, runs the engine against known cases, and checks tags.

Question rules the schema enforces:
1. 7-point Likert is vertical on small screens.
2. No grid on small screens. A battery is an accordion.
3. Rank has a tap path and up and down buttons.
4. Rank-all has 6 items or fewer.
5. Required and optional are both marked in text.
6. A low confidence or AI prefill is a suggestion chip, not a prefilled value.
7. Long text has a row ceiling and Enter does not submit.
8. A branching survey uses section progress.

## Acceptance tests

Run these before you call a questionnaire done:
- A real phone, one thumb, 10 questions, no mis-tap, and the keyboard never covers a field.
- 320px wide with no horizontal scroll.
- The whole survey with the keyboard only.
- VoiceOver and NVDA announce label, type, required state, counts, moves, errors, and prefill source.
- axe finds no critical or serious issue on any screen.

## Confidence

Targets (44px, 48px, 24px floor) are anchored to Apple, Material, and WCAG. The 56px row is decided. The other survey sizes (52px buttons, 640px width) are the source standard's own proposals. No vendor publishes a full token set. Test on real devices.


## Components

The `vois-questionnaire` item in `registry/` has the components for this reference: `Question`, `ChoiceGroup`, `LikertScale`, `LikertBattery`, `TapToRank` and `PollResults`. Install it with the shadcn CLI like the other registry items. The Vois MCP is not needed.

## Poll and quiz results `[PATH-H-6]`

Use when the respondent should see how others answered, or whether they were right. Applies to `single_select` and `multi_select` only. Scales and rankings need a distribution chart, which is out of scope.

Set `reveal` on the question. Two modes:

| Mode | Shows | Highlights |
|---|---|---|
| `poll` | How many people chose each option | The respondent's pick, and the most chosen option |
| `quiz` | The same, plus which option is correct | The correct option, and the respondent's pick |

Rules:

1. **Reveal after the answer.** Never show results before the respondent has answered. Peeking changes the answer. The schema enforces `show: after_answer`.
2. **Keep the option order.** Do not re-sort rows by votes. Rows that jump around make people lose their place.
3. **Each row is the option row you already have.** 56px, whole row, label on the left, percent on the right, a bar behind the label. The bar is decoration.
4. **Mark the correct answer with an icon and words.** A check icon and "Correct answer". Mark the respondent's pick with "Your answer". If they picked a wrong option, both rows are marked. Colour alone is not enough `[DS-A11Y-027]`.
5. **Round percents so single-choice rows add up to 100.** Use the largest remainder method. For multi-select, each row is its own share of respondents, so the rows add up to more than 100%. Say so in one line.
6. **Protect small groups.** Under 10 votes, show no percents and no counts. Say there are too few votes yet. Still mark the correct answer in a quiz. The limit is `min_votes_for_percent`. The schema does not allow less than 10.
7. **Live results update in place.** Bars move without reordering and without an announcement. Announce only the first reveal `[DS-A11Y-028]`.
8. **No names.** Never show who chose what.
9. **A quiz needs `correct_option_ids`.** One id for single-choice. At least one for multi-select. Each id must be one of the options. A poll must not have them.

The engine function `pollResultRows` does the rounding, the small-group check, and the flags. The copy is in Righter (`poll-results`).

Not covered: sorting by votes as an option, time-limited polls, and weighted scoring. Add them when a product needs them.

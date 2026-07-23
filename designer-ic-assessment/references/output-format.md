# Session Summary Output Format
**Version:** 0.3

Use this exact structure for every session summary.

---

## Format

```
# IC Assessment Summary
**Session type:** Designer self-assessment / Manager assessment
**Designer name and role:** [name · level]
**Date:** [date]
**Assessor:** [name]

---

## Weight profile (manager sessions only)
- Knowledge: High / Medium / Low / N/A
- Craft: High / Medium / Low / N/A
- Behaviors: High / Medium / Low / N/A
- Communication & Collaboration: High / Medium / Low / N/A
- AI Fluency: High / Medium / Low / N/A

---

## Breadth
**Actively practiced this cycle:** [X] of 23 competencies

| Status | Competencies |
|---|---|
| Active | [list competencies confirmed as in active scope] |
| Not in active scope this cycle | [list competencies flagged during session] |

*Not in active scope means the skill exists but wasn't exercised this cycle -- not that the designer lacks the capability.*

---

## Competency summaries

### [Competency name]
**Category:** Knowledge / Craft / Behaviors / Communication & Collaboration / AI Fluency
**Rating:** [1–5] — [Learner / Developing / Capable / Advanced / Expert]
**Signal:** Strong / Developing / Needs attention

[2–4 sentences. Plain language. 1–2 specific things the person said, paraphrased. No rubric jargon.]

**Notable:** [Most signal-rich moment, or a flag if answers were thin.]

---

[Repeat for each competency assessed]

---

## Scores at a glance

| Category | Competency | Rating | Status |
|---|---|---|---|
| Knowledge | Business Sense | — | Active / Not in scope |
| Knowledge | Engineering Understanding | — | Active / Not in scope |
| Knowledge | Domain Knowledge | — | Active / Not in scope |
| Knowledge | Established UX Conventions | — | Active / Not in scope |
| Craft | Systems Thinking | — | Active / Not in scope |
| Craft | Content Strategy | — | Active / Not in scope |
| Craft | Qualitative UX Research | — | Active / Not in scope |
| Craft | Interaction Design | — | Active / Not in scope |
| Craft | Visual Design | — | Active / Not in scope |
| Craft | Prototyping & Motion Design | — | Active / Not in scope |
| Behaviors | Ability to Learn Quickly | — | Active / Not in scope |
| Behaviors | Stewards Initiatives and Teams | — | Active / Not in scope |
| Behaviors | Simplify Complexity | — | Active / Not in scope |
| Behaviors | Inspire with Data | — | Active / Not in scope |
| Behaviors | Efficiency & Progress | — | Active / Not in scope |
| Communication & Collaboration | Ships Reliably | — | Active / Not in scope |
| Communication & Collaboration | Working in the Open | — | Active / Not in scope |
| Communication & Collaboration | Advocates for the User | — | Active / Not in scope |
| Communication & Collaboration | Influences and Mentors Others | — | Active / Not in scope |
| AI Fluency | Accelerate Learning | — | Active / Not in scope |
| AI Fluency | Adopt New Workflows | — | Active / Not in scope |
| AI Fluency | Improve Execution | — | Active / Not in scope |
| AI Fluency | Inspire Innovation | — | Active / Not in scope |

*Ratings only shown for active competencies. Not-in-scope competencies excluded from averages.*

---

## Overall patterns

[2–3 sentences. Themes across categories. Clearest strengths, clearest gaps. Honest and specific.]

---

## Suggested conversation starters

[2–3 specific questions or tensions worth discussing in the reveal meeting. Point at the most useful gaps, not the comfortable ones.]

---

*This summary is one input into a calibration conversation. Not a performance rating. Do not share before the reveal meeting.*
```

---

## Signal indicator definitions

| Signal | Meaning |
|---|---|
| **Strong** | Clear, specific, behavioral answers. Evidence of independent judgment. Examples that held up under probing. |
| **Developing** | Some specific examples but inconsistent or got vague under probing. Awareness without reliable depth. |
| **Needs attention** | Vague, hypothetical, or avoided answers. Little independent judgment. Could be a genuine gap or discomfort with the area. |

---

## When rating and signal diverge

| Rating | Signal | What it likely means |
|---|---|---|
| High (4–5) | Strong | Answers backed the number. Consistent and credible. |
| High (4–5) | Needs attention | Rated high but answers were thin. Worth surfacing in the reveal. |
| Low (1–2) | Strong | Honest, specific answers despite a modest rating. May be underselling. |
| Low (1–2) | Needs attention | Low rating and vague answers. Genuine gap or disengagement. |

Flag divergence explicitly in the Notable field. These are often the most useful conversation starters.

---

## Likert scale reference

See `data/question-bank.json` → `likert_scale` for the full score/label/meaning lookup (1 Learner, 2 Developing, 3 Capable, 4 Advanced, 5 Expert).

---

## CSV export format

After generating the summary narrative, always generate a CSV export block. This maps directly onto the FigJam community template zones.

The CSV uses this exact header row and column order:

```
session_type,designer_name,designer_role,date,category,competency,rating,label,signal,notable
```

**Column definitions:**

| Column | Value |
|---|---|
| session_type | "designer" or "manager" |
| designer_name | Designer's name |
| designer_role | Role and level |
| date | Session date |
| category | One of: Knowledge / Craft / Behaviors / Communication & Collaboration / AI Fluency |
| competency | Full competency name as defined in the question bank |
| rating | Numeric score 1–5, or blank if N/A |
| label | Learner / Developing / Capable / Advanced / Expert, or blank if N/A |
| signal | Strong / Developing / Needs attention, or blank if N/A |
| notable | One sentence plain text. No commas -- use semicolons instead if needed. |

**Example rows:**

```
session_type,designer_name,designer_role,date,category,competency,rating,label,signal,notable
designer,Jordan Kim,Senior Product Designer,2026-03-19,Knowledge,Business Sense,4,Advanced,Strong,Connected design decisions directly to retention outcomes with specific project examples
designer,Jordan Kim,Senior Product Designer,2026-03-19,Knowledge,Engineering Understanding,2,Developing,Needs attention,Answers were vague and leaned on asking engineers; no evidence of a working mental model
designer,Jordan Kim,Senior Product Designer,2026-03-19,Craft,Qualitative UX Research,4,Advanced,Strong,Clear synthesis process with specific AI-assisted clustering followed by manual verification
```

**Format rules:**
- One row per competency assessed
- Skip competencies in N/A categories entirely -- do not include a blank row
- Wrap the notable field in double quotes if it contains any punctuation
- Keep notable to one sentence maximum
- The CSV block should follow immediately after the summary narrative, separated by a horizontal rule and labeled clearly

**Present it like this at the end of the summary:**

```
---

## CSV export
*Copy this into a spreadsheet or paste directly into the FigJam import flow.*

[csv content here]
```

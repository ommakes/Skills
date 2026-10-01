# Reviewing and improving an existing visualization

Use this when the input is an existing chart, dashboard, screenshot, Figma frame or chart code and the job is to evaluate it or make it better. The machine-readable version is `data/review-checklist.json`; findings use `data/review-output.schema.json`.

An audit changes nothing and reports. A redesign changes the UI, so it also follows the no-silent-changes contract in `vois-tokens` (URLs, field names, event names, nav labels stay put).

## What you can check from each input

| Input | Mechanical checks | Judgment checks | Say you couldn't verify |
|---|---|---|---|
| Code | `scripts/detect.mjs` on the files | Everything that needs the render | Contrast and layout until it renders |
| Screenshot or Figma frame | None | All judgment rules visible in the picture | Hover, keyboard, states you can't see, real contrast values, behavior at other sizes |
| Chart spec | `scripts/check-spec.mjs` | The rest | The render |
| Live URL | Screenshot, then code if you have it | All | Whatever needs auth |

Always list what you couldn't check in `not_checked`. A clean report from a screenshot isn't a clean bill for the keyboard.

## Steps

1. **Inventory.** List every tile, chart, sparkline, table and map. Give each an id (V1, V2). Name the audience and the page template (`DASH-Q-TYPE`).
2. **Infer the job.** Write the question each one appears to answer, and its job (`single`, `time`, `compare`, `part`, `relate`, `distribution`, `flow`, `geo`, `hierarchy`, `schedule`, `lookup`, `ohlc`). If you can't tell, that's a `[DV-PURPOSE-001]` finding.
3. **Check the form.** Walk the decision tree for that job (`node scripts/check-spec.mjs --tree <job>` lists reachable forms). Used form outside the set, or a simpler form would do the same job: `[DV-FORM-001]` `[DV-FORM-002]`. Name the better form.
4. **Run the mechanical checks** if you have code or a spec, and fold the results in.
5. **Run the judgment checks**, in triage order: `DV-A11Y`, `DV-HONEST`, `DV-FORM`, `DV-COLOR`, `DV-STATE`, `DV-FILTER`, `DV-INTERACT`, `DV-CONTEXT`, `DV-CLARITY`, `DV-LAYOUT`, `DV-CONSIST`, `DV-SUSTAIN`, `DV-IMPL`, `DV-PURPOSE`. Don't skip a category because the detector was clean.
6. **Check the page as a whole.** Hierarchy, one filter row, consistent periods and colors, and the state matrix for every card (`DASH-STATE-MATRIX`).
7. **Propose the upgrade.** For each FAIL, and each WARN worth fixing, give a concrete change: the replacement form id, component names, token roles, and the rule's `do`. `data/review-checklist.json` has a symptom to fix playbook for the 20 most common problems. Don't redesign what passes.
8. **Report** in the output schema, FAIL first within each category, with a short summary. If `vois_record_rule_usage` is available, call it with the ids that drove changes.

## Verdicts

`required` rule not met: **FAIL**, fix before handoff. `recommended` rule not met: **WARN**, note it and offer the fix. Rule met or not applicable: **PASS**, don't list it.

## Worked example

Input: a screenshot of a board dashboard with a 4-slice pie ("Cards per list") and a bar chart ("Cards per due date") where each of five bars is a different color: green Complete, yellow Due soon, orange Due later, red Overdue, gray No due date (see [MOB-09](https://mobbin.com/screens/0dbdb488-1169-4df7-8f8f-95c45a428225)).

```json
{
  "screen": "Board dashboard",
  "audience": "general",
  "template": "DASH-EXEC",
  "inventory": [
    { "viz": "V1", "question": "How are cards spread across lists?", "job": "part", "form_used": "FORM-PIE", "form_recommended": "FORM-DONUT" },
    { "viz": "V2", "question": "How many cards are in each due-date state?", "job": "compare", "form_used": "FORM-BAR-V", "form_recommended": "FORM-BAR-H" }
  ],
  "findings": [
    { "ruleId": "DV-COLOR-007", "verdict": "FAIL", "viz": "V2", "issue": "Five bars in five hues. The categories are ordered by urgency, so hue is re-encoding what bar position and the labels already say.", "fix": "One hue for every bar, or an ordinal ramp from Complete to Overdue, with the category as the label. Keep status color only on Overdue, with a text label.", "source": "judgment" },
    { "ruleId": "DV-COLOR-006", "verdict": "FAIL", "viz": "V2", "issue": "Green and red are adjacent and carry the meaning with no other cue.", "fix": "Add the label and count at each bar end so meaning survives without color.", "source": "judgment" },
    { "ruleId": "DV-FORM-004", "verdict": "WARN", "viz": "V1", "issue": "A pie where the hole could hold the total and the legend could hold the values.", "fix": "Donut with the card total in the center and values in the legend, sorted descending from 12 o'clock.", "source": "judgment" },
    { "ruleId": "DV-A11Y-004", "verdict": "FAIL", "viz": "page", "issue": "No visible way to view either chart as a table.", "fix": "Add a Chart | Table toggle to each card header, fed by the same config.", "source": "judgment" },
    { "ruleId": "DV-CONTEXT-001", "verdict": "WARN", "viz": "page", "issue": "Card titles name the metric but not the scope or period.", "fix": "Add a subtitle: board name and the date range.", "source": "judgment" }
  ],
  "not_checked": ["Contrast values", "Keyboard behavior", "Empty and error states"],
  "summary": "The cards are clean and consistent. The main problem is color doing the job of labels in the due-date chart. Fix V2's color and add a table view first."
}
```

Notice what the example does not do: it doesn't flag things that pass, it doesn't invent measurements it couldn't take, and every finding names a rule and a concrete change.

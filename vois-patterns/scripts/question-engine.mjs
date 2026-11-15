// Picks a questionnaire component from question properties. PATH-H-2.
// First matching rule wins. No dependency.
//
//   pickQuestionComponent({ textLength: "none", cardinality: "single", optionCount: 5 })
//   -> { component: "RadioCard", rule: 8, pathNode: "PATH-H-2", notes: [...] }
//
// props:
//   textLength   "none" | "short" | "long"     long means over 120 characters
//   typedValue   boolean                       a short answer that is an email, phone, number, and so on
//   cardinality  "single" | "multiple"
//   scalePoints  null | 5 | 7 | 11
//   battery      boolean                       several statements share one scale
//   ordered      boolean                       the respondent ranks items
//   grouping     boolean                       card sort, out of scope
//   optionCount  number

export function pickQuestionComponent(p) {
  const n = p.optionCount ?? 0;
  const base = { pathNode: "PATH-H-2" };

  if (p.grouping) {
    return { ...base, component: null, rule: 0, notes: ["Card sort is out of scope. Use a research tool."] };
  }
  if (p.textLength === "long") {
    return { ...base, component: "LongTextbox", rule: 1, notes: ["3 rows to start, 8 max on mobile, 12 on desktop, then scroll inside.", "Counter shows from the first character.", "Enter adds a new line."] };
  }
  if (p.textLength === "short") {
    return { ...base, component: "OpenText", rule: 2, fieldsSkill: !!p.typedValue, notes: p.typedValue ? ["A typed value gets its type, inputmode, and autocomplete from vois-fields."] : ["Placeholder is an example, never the instruction.", "16px font so iOS does not zoom."] };
  }
  if (p.battery) {
    if (![5, 7].includes(p.scalePoints)) return { ...base, component: null, rule: 3, error: "A battery needs a 5 or 7 point scale." };
    return { ...base, component: "LikertAccordion", rule: 3, notes: ["One statement at a time.", "5 statements per group at most.", "No grid below 1024px."] };
  }
  if (p.scalePoints === 11) {
    return { ...base, component: "Slider", rule: 4, notes: ["Native range input.", "aria-valuetext carries the word label.", "Label both ends."] };
  }
  if (p.scalePoints === 5) {
    return { ...base, component: "LikertHorizontal", rule: 5, notes: ["Points are 48px. Go vertical if a point would drop below 44px or labels are long.", "Label every point."] };
  }
  if (p.scalePoints === 7) {
    return { ...base, component: "LikertVertical", rule: 5, notes: ["Full-width rows. Label every point.", "Horizontal only from 768px with labels of 12 characters or fewer."] };
  }
  if (p.ordered) {
    if (n > 12) return { ...base, component: null, rule: 6, error: "Over 12 items: do not rank. Ask for a top 3 pick, or use MaxDiff." };
    if (n > 6) return { ...base, component: "TapToRank", rule: 6, mode: "top_n", topN: 3, notes: ["Rank the top 3 only.", "Press and hold to drag. Up and down buttons always.", "Answer stays empty until the person moves an item or keeps the order."] };
    return { ...base, component: "TapToRank", rule: 6, mode: "rank_all", notes: ["Rank all items.", "Press and hold to drag. Up and down buttons always.", "Answer stays empty until the person moves an item or keeps the order."] };
  }
  if (p.cardinality === "multiple") {
    if (n > 12) return { ...base, component: "SearchableCheckboxList", rule: 7, notes: ["Announce the result count.", "Show min and max before the answer."] };
    return { ...base, component: "CheckboxCard", rule: 7, notes: ["Say the rule before the answer. Show a live count.", "At the max, disable the rest and say why.", "None of the above is exclusive.", "Never auto-advance."] };
  }
  if (p.cardinality === "single") {
    if (n > 12) return { ...base, component: "SearchableList", rule: 8, notes: ["Announce the result count."] };
    if (n > 7) return { ...base, component: "RadioListRow", rule: 8, notes: ["The list scrolls inside the question area. The sticky bar stays visible."] };
    return { ...base, component: "RadioCard", rule: 8, notes: ["Whole row is the target.", "Never a native select as the main mobile control."] };
  }
  return { ...base, component: null, rule: -1, error: "No property matched. Set cardinality, scalePoints, or textLength." };
}

// Builds the rows of a poll or quiz result. PATH-H-6.
//
//   pollResultRows({
//     options: [{ id, label }],
//     votes: { optionId: count },     counts per option
//     respondents: 120,               people who answered. Single choice: the sum of votes
//     selected: ["a"],                the current respondent's pick(s)
//     correct: ["b"],                 quiz mode only. Empty for a poll
//     multi: false,
//     minVotes: 10,
//   })
//
// Rows keep the option order. Single choice percents add up to 100 (largest remainder).
// Multi-select percents are each option's share of respondents, so they add up to more than 100.
// Under minVotes, percent and count are null and showNumbers is false.
export function pollResultRows(p) {
  const minVotes = Math.max(10, p.minVotes ?? 10);
  const votes = p.votes || {};
  const sum = p.options.reduce((a, o) => a + (votes[o.id] || 0), 0);
  const respondents = p.multi ? (p.respondents ?? 0) : (p.respondents ?? sum);
  const showNumbers = respondents >= minVotes;
  const selected = new Set(p.selected || []);
  const correct = new Set(p.correct || []);

  let pct = p.options.map(() => null);
  if (showNumbers && respondents > 0) {
    if (p.multi) {
      pct = p.options.map((o) => Math.round(((votes[o.id] || 0) / respondents) * 100));
    } else {
      const raw = p.options.map((o) => ((votes[o.id] || 0) / sum) * 100);
      const floor = raw.map(Math.floor);
      let left = 100 - floor.reduce((a, b) => a + b, 0);
      const order = raw.map((r, i) => ({ i, f: r - Math.floor(r) })).sort((a, b) => b.f - a.f || a.i - b.i);
      for (const { i } of order) { if (left <= 0) break; floor[i] += 1; left -= 1; }
      pct = floor;
    }
  }
  const top = showNumbers ? Math.max(...pct) : null;
  const rows = p.options.map((o, i) => ({
    id: o.id,
    label: o.label,
    count: showNumbers ? (votes[o.id] || 0) : null,
    percent: pct[i],
    isYours: selected.has(o.id),
    isCorrect: correct.has(o.id),
    isLeading: showNumbers && pct[i] === top && top > 0,
  }));
  const quiz = correct.size > 0;
  const yourAnswerCorrect = !quiz ? null : [...selected].length > 0 && [...selected].every((s) => correct.has(s)) && [...correct].every((c) => selected.has(c));
  return { rows, respondents, showNumbers, quiz, yourAnswerCorrect, sumsTo100: !p.multi && showNumbers };
}

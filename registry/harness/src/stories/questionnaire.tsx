import * as React from "react"
import { Question } from "@/components/ui/questionnaire/question"
import type { AnswerValue, QuestionDef } from "@/lib/questionnaire/types"
import type { Story } from "../frame"

const LIKERT = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]
const base = { helper: null, required: true, requirement_label: "Required" as const }

const QUESTIONS: QuestionDef[] = [
  { ...base, id: "plan", type: "single_select", title: "Which plan are you on?", options: [{ id: "free", label: "Free" }, { id: "pro", label: "Pro" }, { id: "team", label: "Team" }] },
  { ...base, id: "tools", type: "multi_select", title: "Which tools do you use?", helper: "Choose all that apply.", options: [{ id: "figma", label: "Figma" }, { id: "slack", label: "Slack" }, { id: "none", label: "None of these", exclusive: true }] },
  { ...base, id: "easy", type: "likert", title: "The app is easy to use.", scale: { points: 5, labels_mode: "full", labels: LIKERT } },
  { ...base, id: "battery", type: "likert_battery", render: "accordion", title: "How much do you agree?", statements: ["It loads quickly.", "I find what I need."], scale: { points: 5, labels_mode: "full", labels: LIKERT } },
  { ...base, id: "rank", type: "rank", title: "Rank these by importance.", options: [{ id: "speed", label: "Speed" }, { id: "price", label: "Price" }, { id: "support", label: "Support" }], rank: { mode: "rank_all", drag: true, move_buttons: true } },
  { ...base, id: "name", type: "open_text", title: "What should we call you?", required: false, requirement_label: "Optional", text: { maxlength: 60 } },
  { ...base, id: "more", type: "long_text", title: "Anything else?", required: false, requirement_label: "Optional", text: { maxlength: 500, rows_start: 3, rows_max: 8, enter_submits: false } },
]

const NPS: QuestionDef = { ...base, id: "nps", type: "nps", title: "How likely are you to recommend us?", scale: { points: 11, labels_mode: "endpoints", labels: ["Not at all likely", "Extremely likely"] } }

const POLL: QuestionDef = {
  ...base,
  id: "poll",
  type: "single_select",
  title: "Which feature should we build next?",
  options: [{ id: "a", label: "Dark mode" }, { id: "b", label: "Offline mode" }, { id: "c", label: "Export" }],
  reveal: { mode: "poll", show: "after_answer", order: "keep", correct_marker: "icon_and_word", min_votes_for_percent: 10 },
}

function Demo({ results }: { results: boolean }) {
  const [answers, setAnswers] = React.useState<Record<string, AnswerValue>>({})
  const set = (id: string) => (v: AnswerValue) => setAnswers((a) => ({ ...a, [id]: v }))
  if (results) {
    return (
      <div className="max-w-md">
        <Question question={POLL} value="b" onChange={() => {}} answered votes={{ a: 41, b: 77, c: 18 }} respondents={136} />
      </div>
    )
  }
  return (
    <div className="flex max-w-xl flex-col gap-8">
      {QUESTIONS.map((q) => (
        <Question key={q.id} question={q} value={answers[q.id] ?? null} onChange={set(q.id)} />
      ))}
    </div>
  )
}

export const questionnaire: Story = {
  title: "Questionnaire",
  items: ["vois-questionnaire"],
  render: ({ state }) => <Demo results={state === "results"} />,
  states: { results: { expect: "[data-slot=poll-results]" } },
}

function NpsDemo() {
  const [value, setValue] = React.useState<AnswerValue>(null)
  return (
    <div className="max-w-xl">
      <Question question={NPS} value={value} onChange={setValue} />
    </div>
  )
}

/**
 * The NPS question. Its range input has no accessible name: the question title is the fieldset legend, which names the group and not
 * the input inside it, so axe reports axe:label. The page is in the baseline, on its own so the entry covers nothing else.
 */
export const questionnaireNps: Story = {
  title: "Questionnaire, NPS question",
  items: ["vois-questionnaire"],
  render: () => <NpsDemo />,
}

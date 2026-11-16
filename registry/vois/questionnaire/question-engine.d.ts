export interface PickProps {
  textLength?: "none" | "short" | "long";
  typedValue?: boolean;
  cardinality?: "single" | "multiple";
  scalePoints?: 5 | 7 | 11 | null;
  battery?: boolean;
  ordered?: boolean;
  grouping?: boolean;
  optionCount?: number;
}
export interface PickResult {
  component: string | null;
  rule: number;
  pathNode: string;
  notes?: string[];
  mode?: "rank_all" | "top_n";
  topN?: number;
  fieldsSkill?: boolean;
  error?: string;
}
export function pickQuestionComponent(p: PickProps): PickResult;

export interface PollRowsInput {
  options: { id: string; label: string }[];
  votes: Record<string, number>;
  respondents?: number;
  selected?: string[];
  correct?: string[];
  multi?: boolean;
  minVotes?: number;
}
export interface PollRow {
  id: string;
  label: string;
  count: number | null;
  percent: number | null;
  isYours: boolean;
  isCorrect: boolean;
  isLeading: boolean;
}
export interface PollRowsResult {
  rows: PollRow[];
  respondents: number;
  showNumbers: boolean;
  quiz: boolean;
  yourAnswerCorrect: boolean | null;
  sumsTo100: boolean;
}
export function pollResultRows(p: PollRowsInput): PollRowsResult;

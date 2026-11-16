// Mirrors vois-patterns/data/question.schema.json. The schema is the source of truth.
export type RequirementLabel = "Required" | "Optional";

export interface Option { id: string; label: string; exclusive?: boolean }

export interface RevealConfig {
  mode: "poll" | "quiz";
  show: "after_answer";
  order: "keep";
  correct_marker: "icon_and_word";
  correct_option_ids?: string[];
  min_votes_for_percent: number;
  show_counts?: boolean;
  update?: "on_load" | "live";
}

interface Base {
  id: string;
  title: string;
  helper?: string | null;
  required: boolean;
  requirement_label: RequirementLabel;
  showIf?: string;
}

export interface SingleSelectQuestion extends Base { type: "single_select"; options: Option[]; reveal?: RevealConfig }
export interface MultiSelectQuestion extends Base {
  type: "multi_select"; options: Option[]; reveal?: RevealConfig;
  validation?: { min_select?: number; max_select?: number };
}
export interface LikertQuestion extends Base {
  type: "likert";
  scale: { points: 5 | 7; labels_mode: "full"; direction?: string; labels: string[] };
  orientation_sm?: "horizontal" | "vertical";
}
export interface LikertBatteryQuestion extends Base {
  type: "likert_battery"; statements: string[]; render: "accordion";
  scale: { points: 5 | 7; labels_mode: "full"; direction?: string; labels: string[] };
}
export interface NpsQuestion extends Base {
  type: "nps"; scale: { points: 11; labels_mode: "endpoints"; labels: [string, string] };
}
export interface RankQuestion extends Base {
  type: "rank"; options: Option[];
  rank: { mode: "rank_all" | "top_n"; top_n?: number; drag: true; move_buttons: true; hold_ms?: number };
}
export interface OpenTextQuestion extends Base {
  type: "open_text";
  text: { maxlength?: number; inputmode?: string; autocomplete?: string; enterkeyhint?: string };
}
export interface LongTextQuestion extends Base {
  type: "long_text";
  text: { maxlength?: number; soft_limit?: boolean; rows_start: number; rows_max: number; enter_submits: false; enterkeyhint?: string };
}
export type QuestionDef =
  | SingleSelectQuestion | MultiSelectQuestion | LikertQuestion | LikertBatteryQuestion
  | NpsQuestion | RankQuestion | OpenTextQuestion | LongTextQuestion;

/** likert_battery answers are one entry per statement, null until answered. */
export type AnswerValue = string | string[] | number | (number | null)[] | null;

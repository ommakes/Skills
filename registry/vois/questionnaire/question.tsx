import * as React from "react";
import type { AnswerValue, QuestionDef as Q } from "@/lib/questionnaire/types";
import { copy as defaultCopy, type Copy } from "@/lib/questionnaire/copy";
import { ChoiceGroup } from "./choice-group";
import { LikertScale } from "./likert-scale";
import { LikertBattery } from "./likert-battery";
import { TapToRank } from "./tap-to-rank";
import { PollResults } from "./poll-results";
import { FieldShell } from "./field-shell";

export interface QuestionProps {
  question: Q;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  /** Votes per option id, from your backend. Only used when question.reveal is set. */
  votes?: Record<string, number>;
  respondents?: number;
  /** Set true once the answer is submitted. Results never show before this. */
  answered?: boolean;
  copy?: Copy;
}

const input =
  "min-h-12 w-full rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground focus-visible:ring-2 focus-visible:ring-ring";

/** Maps a question object (see question.schema.json) to the right component. */
export function Question({ question: q, value, onChange, votes, respondents, answered, copy = defaultCopy }: QuestionProps) {
  const req = q.requirement_label;
  const ids = Array.isArray(value) ? (value as string[]) : typeof value === "string" ? [value] : [];
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const showResults = Boolean(answered && "reveal" in q && q.reveal && votes);
  React.useEffect(() => { if (showResults) headingRef.current?.focus(); }, [showResults]);

  switch (q.type) {
    case "single_select":
    case "multi_select": {
      const multi = q.type === "multi_select";
      const v = multi ? q.validation : undefined;
      return (
        <div className="flex flex-col gap-4">
          <ChoiceGroup
            name={q.id} legend={q.title} helper={q.helper} requirementLabel={req} options={q.options}
            multiple={multi} value={ids} min={v?.min_select} max={v?.max_select} copy={copy}
            disabled={showResults}
            onChange={(n) => onChange(multi ? n : (n[0] ?? null))}
          />
          {showResults && q.reveal ? (
            <PollResults
              ref={headingRef} options={q.options} votes={votes!} respondents={respondents} selected={ids}
              correct={q.reveal.correct_option_ids} multi={multi} minVotes={q.reveal.min_votes_for_percent}
              showCounts={q.reveal.show_counts} copy={copy}
            />
          ) : null}
        </div>
      );
    }
    case "likert":
      return (
        <LikertScale
          name={q.id} legend={q.title} helper={q.helper} requirementLabel={req} labels={q.scale.labels}
          value={typeof value === "number" ? value : null} onChange={onChange}
        />
      );
    case "rank":
      return (
        <TapToRank
          legend={q.title} helper={q.helper} requirementLabel={req} options={q.options}
          mode={q.rank.mode} topN={q.rank.top_n} value={ids} onChange={onChange} copy={copy}
        />
      );
    case "nps": {
      const n = typeof value === "number" ? value : 5;
      const [lo, hi] = q.scale.labels;
      return (
        <FieldShell legend={q.title} requirementLabel={req} helper={q.helper}>
          <input
            type="range" min={0} max={10} step={1} value={n} onChange={(e) => onChange(Number(e.target.value))}
            aria-valuetext={`${n} of 10`} className="w-full accent-primary"
          />
          <div className="flex justify-between text-sm text-muted-foreground"><span>{lo}</span><span>{hi}</span></div>
        </FieldShell>
      );
    }
    case "open_text": {
      const id = `${q.id}-field`;
      return (
        <div className="flex flex-col gap-2">
          <label htmlFor={id} className="text-base font-medium text-foreground">
            {q.title}<span className="ml-2 text-sm font-normal text-muted-foreground">{req}</span>
          </label>
          {q.helper ? <p className="text-sm text-muted-foreground">{q.helper}</p> : null}
          <input
            id={id} type="text" className={input} value={typeof value === "string" ? value : ""}
            maxLength={q.text.maxlength} inputMode={q.text.inputmode as React.HTMLAttributes<HTMLInputElement>["inputMode"]}
            autoComplete={q.text.autocomplete} onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    }
    case "long_text": {
      const id = `${q.id}-field`;
      const text = typeof value === "string" ? value : "";
      return (
        <div className="flex flex-col gap-2">
          <label htmlFor={id} className="text-base font-medium text-foreground">
            {q.title}<span className="ml-2 text-sm font-normal text-muted-foreground">{req}</span>
          </label>
          {q.helper ? <p className="text-sm text-muted-foreground">{q.helper}</p> : null}
          <textarea
            id={id} rows={q.text.rows_start} className={input} value={text}
            maxLength={q.text.soft_limit ? undefined : q.text.maxlength}
            onChange={(e) => onChange(e.target.value)}
          />
          {q.text.maxlength ? (
            <p className="text-sm text-muted-foreground" aria-live="off">{copy.characterCount(text.length, q.text.maxlength)}</p>
          ) : null}
        </div>
      );
    }
    case "likert_battery":
      return (
        <LikertBattery
          name={q.id} legend={q.title} helper={q.helper} requirementLabel={req} statements={q.statements}
          labels={q.scale.labels} value={Array.isArray(value) ? (value as (number | null)[]) : []} onChange={onChange}
        />
      );
  }
}

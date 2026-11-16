import * as React from "react";
import { cn } from "@/lib/utils";
import { copy as defaultCopy, type Copy } from "@/lib/questionnaire/copy";
import { LikertScale } from "./likert-scale";

export interface LikertBatteryProps {
  name: string;
  legend: string;
  helper?: string | null;
  requirementLabel?: string;
  statements: string[]; // 2 to 5 per group. Never a grid.
  labels: string[]; // scale labels, every point (5 or 7)
  value: (number | null)[]; // one per statement
  onChange: (next: (number | null)[]) => void;
  copy?: Copy;
  className?: string;
}

/** One statement open at a time. Answering moves on to the next unanswered one. */
export function LikertBattery({
  name, legend, helper, requirementLabel, statements, labels, value, onChange, copy = defaultCopy, className,
}: LikertBatteryProps) {
  const uid = React.useId();
  const answers = statements.map((_, i) => value[i] ?? null);
  const done = answers.filter((a) => a !== null).length;
  const firstOpen = Math.max(0, answers.findIndex((a) => a === null));
  const [open, setOpen] = React.useState(firstOpen);
  const [msg, setMsg] = React.useState("");
  const headers = React.useRef<(HTMLButtonElement | null)[]>([]);

  function answer(i: number, n: number) {
    const next = [...answers];
    next[i] = n;
    onChange(next);
    const nextIdx = next.findIndex((a, k) => a === null && k !== i);
    if (nextIdx === -1) {
      setOpen(-1);
      setMsg(copy.batteryDone);
      headers.current[i]?.focus();
    } else {
      setOpen(nextIdx);
      setMsg(copy.batteryNext(nextIdx + 1, statements.length, statements[nextIdx]!));
      headers.current[nextIdx]?.focus();
    }
  }

  return (
    <section data-slot="likert-battery" aria-labelledby={`${uid}-legend`} className={cn("flex flex-col gap-3", className)}>
      <h3 id={`${uid}-legend`} className="text-base font-medium text-foreground">
        {legend}
        {requirementLabel ? <span className="ml-2 text-sm font-normal text-muted-foreground">{requirementLabel}</span> : null}
      </h3>
      {helper ? <p className="text-sm text-muted-foreground">{helper}</p> : null}
      <p className="text-sm text-muted-foreground">{copy.batteryProgress(done, statements.length)}</p>
      <ul className="flex flex-col gap-2">
        {statements.map((st, i) => {
          const isOpen = open === i;
          const a = answers[i] ?? null;
          return (
            <li key={i} data-slot="battery-item" className="rounded-lg border border-input bg-background">
              <h4>
                <button
                  type="button"
                  ref={(el) => { headers.current[i] = el; }}
                  id={`${uid}-h-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`${uid}-p-${i}`}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex min-h-14 w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left text-base text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span>{st}</span>
                  <span className={cn("shrink-0 text-sm", a === null ? "text-muted-foreground" : "text-foreground")}>
                    {a === null ? copy.batteryNotAnswered : labels[a - 1]}
                  </span>
                </button>
              </h4>
              <div id={`${uid}-p-${i}`} role="region" aria-labelledby={`${uid}-h-${i}`} hidden={!isOpen} className="px-4 pb-4">
                <LikertScale
                  name={`${name}-${i}`}
                  legend={st}
                  labels={labels}
                  value={a}
                  onChange={(n) => answer(i, n)}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p role="status" aria-live="polite" className="sr-only">{msg}</p>
    </section>
  );
}

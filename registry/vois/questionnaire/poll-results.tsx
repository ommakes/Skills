import * as React from "react";
import { cn } from "@/lib/utils";
import { copy as defaultCopy, type Copy } from "@/lib/questionnaire/copy";
import { pollResultRows, type PollRowsInput } from "@/lib/questionnaire/poll-rows";

export interface PollResultsProps extends PollRowsInput {
  showCounts?: boolean;
  copy?: Copy;
  className?: string;
}

/** Shows after the person answers. Keeps option order. Correct is icon plus words, never colour alone. */
export const PollResults = React.forwardRef<HTMLHeadingElement, PollResultsProps>(function PollResults(
  { showCounts, copy = defaultCopy, className, ...input }, ref
) {
  const r = pollResultRows(input);
  // The live region mounts empty and is filled after mount, so a screen reader announces it. The bars start
  // at zero and grow on the next frame (a transition does not run on the first render). With reduced motion
  // the transition is off, so they appear at full width.
  const [announced, setAnnounced] = React.useState(false);
  const [barsOn, setBarsOn] = React.useState(false);
  React.useEffect(() => {
    setAnnounced(true);
    const id = requestAnimationFrame(() => setBarsOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const summary = r.quiz
    ? r.yourAnswerCorrect
      ? copy.announceRight(r.showNumbers ? (r.rows.find((x) => x.isCorrect)?.percent ?? null) : null)
      : copy.announceWrong(r.rows.filter((x) => x.isCorrect).map((x) => x.label).join(", "))
    : copy.announcePoll(r.respondents);

  return (
    <section data-slot="poll-results" className={cn("flex flex-col gap-3", className)}>
      <h3 ref={ref} tabIndex={-1} className="text-base font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {copy.resultsHeading}
      </h3>
      <p role="status" className="text-sm text-muted-foreground">{announced ? summary : ""}</p>
      {!r.showNumbers ? <p className="text-sm text-muted-foreground">{copy.tooFewVotes}</p> : null}
      {input.multi && r.showNumbers ? <p className="text-sm text-muted-foreground">{copy.multiNote}</p> : null}
      <ul className="flex flex-col gap-2">
        {r.rows.map((row) => (
          <li
            key={row.id}
            data-slot="poll-row"
            data-correct={row.isCorrect || undefined}
            className={cn(
              "relative flex min-h-14 flex-col justify-center gap-1 overflow-hidden rounded-lg border border-input bg-background px-4 py-2",
              row.isCorrect && "border-[color:var(--border-positive)]"
            )}
          >
            {r.showNumbers && row.percent !== null ? (
              <span
                aria-hidden="true"
                style={{ transform: `scaleX(${barsOn ? row.percent / 100 : 0})` }}
                className={cn(
                  "absolute inset-0 origin-left bg-muted motion-safe:transition-transform motion-safe:duration-[var(--motion-duration-slow)] motion-safe:ease-[var(--motion-ease-standard)]",
                  row.isCorrect && "bg-[color:var(--bg-positive)]"
                )}
              />
            ) : null}
            <div className="relative flex items-center justify-between gap-3 text-base text-foreground">
              <span>{row.label}</span>
              {r.showNumbers && row.percent !== null ? (
                <span className="text-sm">
                  {row.percent}%{showCounts && row.count !== null ? ` (${copy.voteCount(row.count)})` : ""}
                </span>
              ) : null}
            </div>
            {row.isCorrect || row.isYours ? (
              <div className="relative flex flex-wrap gap-3 text-sm">
                {row.isCorrect ? (
                  <span className="inline-flex items-center gap-1 text-[color:var(--text-positive)]">
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 8.5l3.2 3L13 4.5" />
                    </svg>
                    {copy.correctAnswer}
                  </span>
                ) : null}
                {row.isYours ? <span className="text-foreground">{copy.yourAnswer}</span> : null}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
});

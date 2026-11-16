import * as React from "react";
import { cn } from "@/lib/utils";
import { FieldShell } from "./field-shell";

export interface LikertScaleProps {
  name: string;
  legend: string;
  helper?: string | null;
  requirementLabel?: string;
  labels: string[]; // every point labeled (5 or 7)
  value: number | null;
  onChange: (n: number) => void;
  className?: string;
}

/** 5 points: row at sm and up, column below. 7 points: always a column. Every point has text. */
export function LikertScale({ name, legend, helper, requirementLabel, labels, value, onChange, className }: LikertScaleProps) {
  const uid = React.useId();
  const horizontal = labels.length === 5;
  return (
    <FieldShell legend={legend} requirementLabel={requirementLabel} helper={helper} className={className}>
      <div className={cn("flex flex-col gap-2", horizontal && "sm:flex-row")}>
        {labels.map((label, i) => {
          const n = i + 1;
          const id = `${uid}-${n}`;
          const checked = value === n;
          return (
            <label
              key={n}
              htmlFor={id}
              data-slot="likert-point"
              data-checked={checked || undefined}
              className={cn(
                "flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground",
                horizontal && "sm:min-w-0 sm:flex-1",
                "sm:min-h-12",
                horizontal && "sm:flex-col sm:justify-center sm:gap-2 sm:text-center sm:text-sm",
                "transition-colors motion-reduce:transition-none hover:bg-muted",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                "data-[checked]:border-primary data-[checked]:bg-muted"
              )}
            >
              <input id={id} type="radio" name={name} checked={checked} onChange={() => onChange(n)} className="size-5 shrink-0 accent-primary" />
              <span>{label}</span>
            </label>
          );
        })}
      </div>
    </FieldShell>
  );
}

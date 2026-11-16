import * as React from "react";
import { cn } from "@/lib/utils";
import { copy as defaultCopy, type Copy } from "@/lib/questionnaire/copy";
import type { Option } from "@/lib/questionnaire/types";
import { FieldShell } from "./field-shell";

export interface ChoiceGroupProps {
  name: string;
  legend: string;
  helper?: string | null;
  requirementLabel?: string;
  options: Option[];
  multiple?: boolean;
  value: string[];
  onChange: (next: string[]) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  copy?: Copy;
  className?: string;
}

/** Single or multi choice. Whole 56px row is the target (DS-RESPONSIVE-013). */
export function ChoiceGroup({
  name, legend, helper, requirementLabel, options, multiple = false, value, onChange,
  min, max, disabled, copy = defaultCopy, className,
}: ChoiceGroupProps) {
  const uid = React.useId();
  const helperId = `${uid}-helper`;
  const limitId = `${uid}-limit`;
  const atMax = multiple && max !== undefined && value.length >= max;

  const limitText =
    multiple && max !== undefined
      ? min !== undefined && min > 0
        ? copy.selectRange(min, max)
        : copy.selectUpTo(max)
      : multiple && min !== undefined
        ? copy.selectAtLeast(min)
        : null;

  function toggle(opt: Option) {
    if (!multiple) return onChange([opt.id]);
    const has = value.includes(opt.id);
    if (has) return onChange(value.filter((v) => v !== opt.id));
    if (opt.exclusive) return onChange([opt.id]);
    if (atMax) return; // blocked, row stays focusable and explains why
    const withoutExclusive = value.filter((v) => !options.find((o) => o.id === v)?.exclusive);
    onChange([...withoutExclusive, opt.id]);
  }

  return (
    <FieldShell
      legend={legend}
      requirementLabel={requirementLabel}
      helper={helper}
      helperId={helperId}
      className={className}
      disabled={disabled}
      aria-describedby={[helper ? helperId : null, limitText ? limitId : null].filter(Boolean).join(" ") || undefined}
    >
      {limitText ? (
        <p id={limitId} className="text-sm text-muted-foreground">
          {limitText}
          {max !== undefined ? <span aria-live="polite"> · {copy.selectedCount(value.length, max)}</span> : null}
        </p>
      ) : null}
      <div role={multiple ? "group" : "radiogroup"} aria-labelledby={undefined} className="flex flex-col gap-2">
        {options.map((opt) => {
          const checked = value.includes(opt.id);
          const blocked = atMax && !checked && !opt.exclusive;
          const inputId = `${uid}-${opt.id}`;
          return (
            <label
              key={opt.id}
              htmlFor={inputId}
              data-slot="choice-row"
              data-checked={checked || undefined}
              data-blocked={blocked || undefined}
              className={cn(
                "flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground",
                "transition-colors motion-reduce:transition-none",
                "hover:bg-muted has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                "data-[checked]:border-primary data-[checked]:bg-muted",
                "data-[blocked]:cursor-not-allowed data-[blocked]:text-muted-foreground"
              )}
            >
              <input
                id={inputId}
                type={multiple ? "checkbox" : "radio"}
                name={name}
                checked={checked}
                aria-disabled={blocked || undefined}
                aria-describedby={blocked ? limitId : undefined}
                onChange={() => toggle(opt)}
                className="size-5 shrink-0 accent-primary"
              />
              <span>{opt.label}</span>
            </label>
          );
        })}
      </div>
      {atMax ? <p role="status" className="text-sm text-muted-foreground">{copy.maxReached}</p> : null}
    </FieldShell>
  );
}

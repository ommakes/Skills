import * as React from "react";
import { cn } from "@/lib/utils";

interface FieldShellProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend: string;
  requirementLabel?: string;
  helper?: string | null;
  helperId?: string;
}

/** Fieldset + legend wrapper for any radio, checkbox, scale or rank group (DS-A11Y-016). */
export function FieldShell({ legend, requirementLabel, helper, helperId, className, children, ...rest }: FieldShellProps) {
  return (
    <fieldset data-slot="field-shell" className={cn("flex min-w-0 flex-col gap-3", className)} {...rest}>
      <legend className="mb-3 text-base font-medium text-foreground">
        {legend}
        {requirementLabel ? <span className="ml-2 text-sm font-normal text-muted-foreground">{requirementLabel}</span> : null}
      </legend>
      {helper ? <p id={helperId} className="text-sm text-muted-foreground">{helper}</p> : null}
      {children}
    </fieldset>
  );
}

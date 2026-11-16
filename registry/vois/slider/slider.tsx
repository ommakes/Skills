// Vois Slider. Two parts on a native <input type="range">, as vois-components JOB-ANSWER-SCALE-OR-RANK asks
// ("Slider (native range)"): the browser gives the keyboard (arrows, Page Up and Down, Home, End), touch, form
// submission and the slider role for free. shadcn/ui's Slider is Radix Slider; this replaces its look and keeps
// the props a single-thumb slider uses (min, max, step, value, defaultValue, onValueChange, disabled), with
// value as a number, not an array. There is no range (two-thumb) slider.
//
// Slider: a continuous value (opacity, volume, a 0 to 10 rating).
//   Track: 4 tall (--space-4), --shape-pill, --control-off. The part before the thumb fills with --control-on,
//     drawn as a gradient so WebKit and Firefox match without -moz-range-progress.
//   Thumb: 20 (--size-20) circle in --control-on with a 2px --switch-knob ring and --shadow-small, so it reads
//     on the track and on the fill. The thumb carries the 3:1 contrast (WCAG 1.4.11), not the track.
//   Hover: a 6px halo around the thumb in --bg-hover. Dragging (:active): the halo turns --bg-pressed.
//     Neither shows on a disabled slider, and hover gives way to focus, so a keyboard user keeps the ring.
//   Focus: a 2px --control-focus ring 2px outside the thumb (the Checkbox and Radio ring).
//   Disabled: the fill and the thumb turn --control-disabled.
//   The input is --hit-area-min tall, so the pointer target is 44 while the track stays 4 (DS-A11Y-001).
//   `getValueText` sets aria-valuetext ("40%", "7, likely"). Without it a screen reader reads the bare number.
//
// StepSlider: a value from a short named scale (a spacing or radius token, None to XXL). It is the Segments
// geometry you can drag, so it takes the SegmentedControl's tokens:
//   Track: --size-field-compact (32) tall, --segment-inactive, --shape-subtle corners. 32 is for a dense row
//     (DS-COMPONENT-007), which is where this sits: an inspector or a properties pane.
//   Thumb: 28 tall (--size-28), inset 2px, --radii-6, --segment-active fill, 1px --border-default edge,
//     --shadow-base, and the current step's label in it, 14/20 medium --text-on-light.
//   Stops: a 4px dot (--space-4) in --text-state-resting at each step. The thumb covers its own.
//   Hover (anywhere on the track): the thumb edge becomes 1px --border-state-hover, as a field's edge does.
//   Dragging (:active): the edge becomes 1px --border-state-active. Neither shows when disabled or focused.
//   Focus: the thumb edge becomes 2px --segment-focus-ring (the Segments active focus).
//   The thumb does not animate its position: under a dragging finger an eased move lags behind the pointer.
//   Disabled: --segment-disabled track, no thumb fill, a 1px --border-state-disabled edge, --text-state-disabled.
//   The thumb is as wide as the longest label (in ch, plus 8px each side), and the native thumb is set to the
//   same width, so the drawn thumb sits exactly where the browser puts the real one.
//   aria-valuetext is the label, plus the step's description when there is one ("S, 12px"). Check it against
//   the value: a description that disagrees with the label is wrong to a screen reader and right on screen.
//
// Give either part a name: aria-label, aria-labelledby, or an id that a <label htmlFor> points at
// (InspectorLabel, FieldLabel). Props other than the ones above go to the <input>; className goes to the root.
//
// Which to use: StepSlider for 3 to 9 named steps that are ordered (sizes, levels). A Slider for a continuous
// value or more than 9 steps; pair it with a number Input when the exact value matters (vois-patterns
// "Slider plus number input"). For 2 to 5 unordered choices use the SegmentedControl, and for a long list a Select.
import * as React from "react"

import { cn } from "@/lib/utils"

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : uncontrolled
  const set = React.useCallback(
    (next: T) => {
      if (!controlled) setUncontrolled(next)
      onChange?.(next)
    },
    [controlled, onChange]
  )
  return [current, set] as const
}

type InputBase = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step" | "children"
>

// ---- Slider ----------------------------------------------------------------------------

type SliderProps = InputBase & {
  min?: number
  max?: number
  step?: number
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  getValueText?: (value: number) => string
}

const sliderClasses = [
  "relative block h-[var(--hit-area-min)] w-full min-w-0 cursor-pointer appearance-none bg-transparent",
  "[--vois-slider-fill:calc(var(--size-20)/2+(100%-var(--size-20))*var(--vois-slider-p))]",
  // Track
  "[&::-webkit-slider-runnable-track]:h-[var(--space-4)] [&::-webkit-slider-runnable-track]:rounded-[var(--shape-pill)]",
  "[&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--control-on)_var(--vois-slider-fill),var(--control-off)_var(--vois-slider-fill))]",
  "[&::-moz-range-track]:h-[var(--space-4)] [&::-moz-range-track]:rounded-[var(--shape-pill)]",
  "[&::-moz-range-track]:bg-[linear-gradient(to_right,var(--control-on)_var(--vois-slider-fill),var(--control-off)_var(--vois-slider-fill))]",
  // Thumb. WebKit puts the thumb's top on the track's top, so it is pulled up by half the difference.
  // box-shadow is set as a plain property: Tailwind's shadow-* builds it from --tw-* variables that do not
  // resolve on the thumb pseudo-elements, which leaves no shadow and no focus ring.
  "[&::-webkit-slider-thumb]:size-[var(--size-20)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-[var(--shape-circle)] [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-[color:var(--control-on)] [&::-webkit-slider-thumb]:[box-shadow:0_0_0_2px_var(--switch-knob),var(--shadow-small)]",
  "[&::-webkit-slider-thumb]:mt-[calc((var(--space-4)-var(--size-20))/2)]",
  "[&::-moz-range-thumb]:size-[var(--size-20)] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-[var(--shape-circle)] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[color:var(--control-on)] [&::-moz-range-thumb]:[box-shadow:0_0_0_2px_var(--switch-knob),var(--shadow-small)]",
  "[&::-webkit-slider-thumb]:transition-[box-shadow] [&::-webkit-slider-thumb]:duration-[var(--motion-duration-fast)] motion-reduce:[&::-webkit-slider-thumb]:transition-none",
  // Hover and dragging: a halo outside the knob ring, from the state overlay tokens.
  "enabled:not-focus-visible:hover:[&::-webkit-slider-thumb]:[box-shadow:0_0_0_2px_var(--switch-knob),0_0_0_8px_var(--bg-hover),var(--shadow-small)]",
  "enabled:not-focus-visible:hover:[&::-moz-range-thumb]:[box-shadow:0_0_0_2px_var(--switch-knob),0_0_0_8px_var(--bg-hover),var(--shadow-small)]",
  "enabled:active:[&::-webkit-slider-thumb]:[box-shadow:0_0_0_2px_var(--switch-knob),0_0_0_8px_var(--bg-pressed),var(--shadow-small)]",
  "enabled:active:[&::-moz-range-thumb]:[box-shadow:0_0_0_2px_var(--switch-knob),0_0_0_8px_var(--bg-pressed),var(--shadow-small)]",
  // Focus: the ring is on the thumb, so the input's own outline (a box around the whole 44 tall input) goes.
  "outline-none",
  "focus-visible:[&::-webkit-slider-thumb]:[box-shadow:0_0_0_2px_var(--switch-knob),0_0_0_4px_var(--control-focus)]",
  "focus-visible:[&::-moz-range-thumb]:[box-shadow:0_0_0_2px_var(--switch-knob),0_0_0_4px_var(--control-focus)]",
  // Disabled
  "disabled:cursor-not-allowed",
  "disabled:[&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--control-disabled)_var(--vois-slider-fill),var(--control-off)_var(--vois-slider-fill))]",
  "disabled:[&::-moz-range-track]:bg-[linear-gradient(to_right,var(--control-disabled)_var(--vois-slider-fill),var(--control-off)_var(--vois-slider-fill))]",
  "disabled:[&::-webkit-slider-thumb]:bg-[color:var(--control-disabled)] disabled:[&::-moz-range-thumb]:bg-[color:var(--control-disabled)]",
]

function Slider({
  className,
  style,
  min = 0,
  max = 100,
  step = 1,
  value: valueProp,
  defaultValue,
  onValueChange,
  getValueText,
  ...props
}: SliderProps) {
  const [value, setValue] = useControllable(valueProp, defaultValue ?? min, onValueChange)
  const span = max - min
  const p = span > 0 ? Math.min(1, Math.max(0, (value - min) / span)) : 0
  return (
    <input
      data-slot="slider"
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-valuetext={getValueText?.(value)}
      onChange={(e) => setValue(Number(e.currentTarget.value))}
      className={cn(sliderClasses, className)}
      style={{ ...style, "--vois-slider-p": p } as React.CSSProperties}
      {...props}
    />
  )
}

// ---- StepSlider ------------------------------------------------------------------------

type Step = { value: string; label: string; description?: string }

type StepSliderProps = InputBase & {
  steps: Step[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

function StepSlider({ className, style, steps, value: valueProp, defaultValue, onValueChange, disabled, ...props }: StepSliderProps) {
  const [value, setValue] = useControllable(valueProp, defaultValue ?? steps[0]?.value ?? "", onValueChange)
  const found = steps.findIndex((s) => s.value === value)
  const index = Math.max(0, found)
  const last = Math.max(1, steps.length - 1)
  const current = steps[index]
  const longest = steps.reduce((n, s) => Math.max(n, s.label.length), 1)
  const valueText = current ? (current.description ? `${current.label}, ${current.description}` : current.label) : undefined
  // Where step i's center sits, as a fraction of the room the thumb can travel.
  const at = (i: number) => (steps.length > 1 ? i / last : 0)

  return (
    <div
      data-slot="step-slider"
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "group/step relative flex h-[var(--size-field-compact)] w-full min-w-0 items-center rounded-[var(--shape-subtle)] bg-[color:var(--segment-inactive)]",
        "text-[length:var(--font-size-xsmall)] leading-[var(--line-height-xsmall)] [font-weight:var(--font-weight-medium)]",
        "[--vois-step-inset:calc((var(--size-field-compact)-var(--size-28))/2)]",
        "data-[disabled]:bg-[color:var(--segment-disabled)]",
        className
      )}
      style={{ ...style, "--vois-step-thumb": `max(var(--size-28), calc(${longest}ch + var(--space-16)))` } as React.CSSProperties}
    >
      <input
        type="range"
        min={0}
        max={Math.max(0, steps.length - 1)}
        step={1}
        value={index}
        disabled={disabled}
        aria-valuetext={valueText}
        onChange={(e) => {
          const next = steps[Number(e.currentTarget.value)]
          if (next) setValue(next.value)
        }}
        className={cn(
          // Over the travel area, 44 tall to the pointer. Transparent: the spans below draw it.
          "peer absolute top-1/2 right-[var(--vois-step-inset)] left-[var(--vois-step-inset)] z-10 m-0 h-[var(--hit-area-min)] -translate-y-1/2 cursor-pointer appearance-none bg-transparent opacity-0 [font:inherit]",
          "disabled:cursor-not-allowed",
          // The native thumb, invisible, at the drawn thumb's size, so a press anywhere on the drawn thumb grabs it.
          "[&::-webkit-slider-thumb]:h-[var(--size-28)] [&::-webkit-slider-thumb]:w-[var(--vois-step-thumb)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-transparent",
          "[&::-moz-range-thumb]:h-[var(--size-28)] [&::-moz-range-thumb]:w-[var(--vois-step-thumb)] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-transparent",
          "[&::-moz-range-track]:bg-transparent"
        )}
        {...props}
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0">
        {steps.map((s, i) => (
          <span
            key={s.value}
            className="absolute top-1/2 size-[var(--space-4)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--shape-circle)] bg-[color:var(--text-state-resting)] group-data-[disabled]/step:bg-[color:var(--text-state-disabled)]"
            style={{
              left: `calc(var(--vois-step-inset) + var(--vois-step-thumb) / 2 + (100% - 2 * var(--vois-step-inset) - var(--vois-step-thumb)) * ${at(i)})`,
            }}
          />
        ))}
      </span>
      <span
        aria-hidden="true"
        data-slot="step-slider-thumb"
        className={cn(
          "pointer-events-none absolute top-1/2 inline-flex h-[var(--size-28)] w-[var(--vois-step-thumb)] -translate-y-1/2 items-center justify-center rounded-[var(--radii-6)] whitespace-nowrap",
          "bg-[color:var(--segment-active)] text-[color:var(--text-on-light)] shadow-[inset_0_0_0_1px_var(--border-default),var(--shadow-base)]",
          "transition-[box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
          "peer-enabled:peer-not-focus-visible:peer-hover:shadow-[inset_0_0_0_1px_var(--border-state-hover),var(--shadow-base)]",
          "peer-enabled:peer-not-focus-visible:peer-active:shadow-[inset_0_0_0_1px_var(--border-state-active),var(--shadow-base)]",
          "peer-focus-visible:shadow-[inset_0_0_0_2px_var(--segment-focus-ring),var(--shadow-base)]",
          "group-data-[disabled]/step:bg-transparent group-data-[disabled]/step:text-[color:var(--text-state-disabled)] group-data-[disabled]/step:shadow-[inset_0_0_0_1px_var(--border-state-disabled)]"
        )}
        style={{ left: `calc(var(--vois-step-inset) + (100% - 2 * var(--vois-step-inset) - var(--vois-step-thumb)) * ${at(index)})` }}
      >
        {current?.label}
      </span>
    </div>
  )
}

export { Slider, StepSlider }
export type { SliderProps, StepSliderProps, Step as StepSliderStep }

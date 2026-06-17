# Forms and Multi-Step Process

Decision trees and reasoning for Jobs 16, 19.

## Job 16: Guide through a multi-step process `[JOB-MULTISTEP-GUIDE]`

The user needs to complete multiple steps in sequence to accomplish a larger goal.

```
├─ Steps are all required, user must complete them in order, progress is visible
│  ├─ 2–5 steps, fits on one page with sections    → Stepper (inline step indicator)
│  └─ 5+ steps, each step fills the screen         → Wizard (full-page steps with own layout)
│
├─ Steps represent phases of an ongoing process the user checks back on
│  └─ Progress component (read-only status tracker, not a navigation element)
│
└─ Steps can be completed in any order, none are blocking
   └─ Checklist or task list (not a Stepper — Stepper implies sequential dependency)
```

**Why not Progress for onboarding flows?** Progress is a display component — it shows how far along something is. It doesn't provide navigation between steps or form state. A Stepper or Wizard provides the navigation scaffolding; Progress can be used inside it as a visual indicator.

## Job 19: Build a data entry surface `[JOB-DATA-ENTRY]`

You need a structured container for form fields.

```
├─ Simple form, all fields in one place, one submit action
│  └─ Form (standard HTML form element with shadcn Form wrapper for validation)
│
├─ Complex form with grouped sections (billing address, shipping address separately)
│  └─ Form with multiple FormSection/Fieldset groups inside it
│
└─ Single field used outside a full form (inline edit, quick update)
   └─ Standalone Field with its own validation state (no Form wrapper required)
```

**Why not FormProvider for everything?** FormProvider (or shadcn's Form) sets up a react-hook-form context. For a single field with basic controlled state, that's excess infrastructure. Use it when you have 3+ fields with cross-field validation.

**Why not nested Forms?** HTML doesn't allow nested `<form>` elements. If you need multiple independent submission targets on one page, use `<form>` elements that are siblings, not nested.

# Tone by context

Read this when copy lands on an emotional or high-stakes moment: an error, a destructive action, a first-time screen, or a success. Skip it for routine labels.

## The rule

Voice stays constant. Tone shifts with what the user is feeling. The same product sounds like itself on every screen, but it sounds calmer during a failure and briefer during a routine task.

Tone never overrides a principle. It doesn't relax `eliminate-weakeners`, `use-contractions`, or `no-em-dashes`. It never permits humor in an error (`error-voice-and-tone` already says so). Tone is one dial. The principles are the floor.

## Five user states

| State | What triggers it | Tone | What to do | Example |
|---|---|---|---|---|
| Frustrated | An error, a failed action, lost work | Calm, direct, on their side | Name the problem, give the fix, don't blame | "We couldn't upload your file. Check your connection and try again." |
| Confused | First use, a new feature, an unfamiliar step | Patient, plain | One step at a time. Say what comes next | "Step 1 of 3. Choose a project, then add your team." |
| Confident | A returning user doing a routine task | Brief, neutral | As short as it can be. Cut anything they already know | "Run report" |
| Cautious | Delete, spend, share, or any action that's hard to undo | Steady, factual | State the consequence plainly. Make backing out easy | Title "Delete 12 files". Body "This removes them for good. You can't undo it." Actions "Delete files" and "Keep files" |
| Successful | An action finished | Warm, proportional | Confirm what happened. Match the size of the moment | Toast "Invoice sent" |

Each example passes the checklist at the `consumer` tier. Check any example you write yourself with `node scripts/ari.mjs`.

## Stakes

- **Low stakes** (change a theme, rename a tab, sort a list): copy stays brief. Don't add reassurance the user doesn't need.
- **High stakes** (delete an account, spend money, share data): copy states the consequence in plain words and adds no pressure. No countdowns, no guilt, no urgency you can't back up. Backing out has to look as easy as going ahead.

## Success and tense

Success in a toast follows the toast rules in `data/components.json`: a short past participle phrase such as "Invoice sent". That component rule wins over `present-tense` for toasts. Outside toasts, `present-tense` applies as usual ("Your account is ready.").

Keep success proportional. A saved setting gets "Settings saved". A finished onboarding can earn one exclamation mark, which is the limit in `limit-exclamation-marks`. Don't stack celebration on routine actions.

## Length and structure

Tone doesn't change limits or structure. For character limits, fields, and action rules, look up the component by `id` in `data/components.json`.

# Lookalike pass 1

Goal: find the shortcuts agents really take (markup that does a component's job without the component), so we can build a lookalike table from evidence.

## Files
- `prompts.json`: 30 prompts, 10 jobs x 3 phrasings (concrete, vague, hurried). No prompt names a component.
- `runner-prompt.md`: the blind prompt. Fill `{{user_prompt}}` and `{{out_path}}`.
- `scan.mjs`: flags candidate lookalikes in the outputs. Zero dependencies.
- `fixtures/`: five tiny files that check each flagged pattern still matches (`node scan.mjs fixtures`). `node scan.mjs runs/<run-name>` loads both prompt files, so `LP-*` and `HP-*` runs both work, and it warns and exits 2 if a file has no matching prompt id.

## Run protocol
1. One fresh agent per prompt, Vois skills active, no other context. Output goes to `runs/<run-name>/<id>.tsx`.
2. `node scan.mjs runs/<run-name>`.
3. Read every file the scanner marks "NONE" and any file with hits. The scanner is a filter, not a verdict.
4. Keep a shortcut only if it shows up in 2+ files. Note the phrasing style that triggered it.
5. For each keeper, write: what the agent built, the real component, the concrete harm. Rows go in `components-rules.json`, not prose.

## Known limits
- No self-report is requested in the prompt, so we don't prime the agent to avoid shortcuts. The cost is we infer intent from code only.
- Regex signals miss shortcuts we haven't thought of. The read in step 3 is where new ones turn up.
- One run per prompt: a shortcut that appears in 1 of 30 may still be real but is noise at this size.

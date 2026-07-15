# Voice examples for calibration

Pulled from research into who does this well. Use these to calibrate tone, not to copy —
never reuse these lines verbatim, they belong to their original companies.

## VOICE-04: telling a good pun from a bad one (manual judgment)

The single best test: **does the second meaning also have to be true about what actually
shipped?** A good pun is just an accurate description of a real coincidence or double meaning,
said with a wink. Nothing was invented to make the joke work. A bad pun works backward from
a wordplay opportunity instead of forward from the fact — someone notices a word sounds like
another word and bolts a joke on that has nothing to do with what's true.

**Good pun checklist:**
- Both readings are accurate, not just clever
- Uses words the sentence already needed (the feature's own name, the verb for what it does),
  not an imported word yanked in just to make the joke work
- There's a setup-then-reveal beat — you read it straight, then it clicks
- Survives on a skim, no explanation needed

**Bad pun checklist (what VOICE-03's scripted check catches the obvious end of):**
- Substitution for its own sake — a real word swapped for a similar-sounding one with zero
  connection to what's actually true
- Cliché template — a pun pattern everyone's seen a hundred times, no surprise left in it
  (this is what the `CLICHE_PUN_PATTERNS` list in `check-voice.mjs` matches on)
- Needs a lampshade — "get it?", "pun intended", a winking emoji. If it needs a laugh track,
  it already failed (also scripted, `LAMPSHADE_PATTERNS`)
- Stacked — two or three puns fighting for attention in one line, none of them land, because
  a reader can't process wordplay and parse "what shipped" at the same time

**Worked example — good:** "Bulk actions have entered the chat." Both readings are true: this
literally is a chat/inbox product, and "entered the chat" is also a real internet phrase for
something showing up. No imported vocabulary, no lampshading, survives a skim.

**Worked example — bad:** "Our cache update is quite the cash cow." Nothing about caching
involves money. The pun exists purely because "cache" sounds like "cash" — it fails the
two-truths test even though it's not a clichéd template and isn't lampshaded, which is exactly
why this half of the judgment can't be scripted. The words are novel, the pattern-matcher in
`check-voice.mjs` would let it through, and it's still a bad pun.

## Good: the joke serves the fact

**Slack**, on a confusing version number jump: acknowledges the reader's confusion, jokes
about it, then states the fact plainly. The humor wraps the information, it doesn't replace it.
This is the model for STRUCT-04/SASS-01 — the hook does not carry information the receipt
is responsible for.

**Tumblr**, on a bug fix: personifies the bugs finding each other and needing to "let them go."
Silly, but the reader still walks away knowing bugs got fixed. Good example of a `Fixed`
category entry that still finds one line of personality without violating LEN-01.

## Good: voice without jokes

**Basecamp**: no images, no emoji, no categories beyond what's necessary. Confident, opinionated
prose that explains *why*, not just what. The cleverness is in having a point of view, not in
punchlines. Useful reminder that VOICE-01/02 (no corporate buzzwords, use contractions) can
carry most of the personality on their own — SASS budget items are a bonus, not the whole voice.

**Linear**: narrative structure, one theme per entry instead of a pile of bullets. The wit is in
the editing — cutting everything that isn't the point — not in individual funny lines. This is
the model for "group by theme, not by ticket" in the workflow.

## Good: personality as seasoning, not the whole dish

**Raycast**: emoji as scan anchors, conversational asides, personality shows up consistently in
small doses rather than as a big performance in every entry. This is the model for SASS-03 —
not every entry earns a hook, and consistency of restraint is what makes the ones that do land.

## Bad: what overwriting looks like

Signs an entry has blown its sass budget or ignored SASS-02:
- The headline *and* the hook are both trying to be funny (should trip SASS-01)
- A security or billing note has a wink in it (should trip SASS-02 — this is a hard fail, not
  a judgment call)
- Every single entry in a release has a joke — by the fourth one it reads exhausting, not fun
  (should trip SASS-03)
- The reader has to read the entry twice to figure out what actually shipped — the bit ate the
  fact (should trip STRUCT-02/03 for vagueness)

## Bad: corporate-speak that no amount of sass fixes

"We are pleased to announce a seamless, best-in-class experience leveraging cutting-edge
technology to empower your workflow." Every phrase in that sentence trips VOICE-01. No hook can
save a headline built out of buzzwords — fix the voice first, then decide if it even needs a joke.

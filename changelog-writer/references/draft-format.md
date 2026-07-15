# Draft format spec

This is the intermediate format every changelog draft should be written in before running
the check scripts. It's plain text, one block per entry, nothing fancy — the scripts parse
it with simple regex, no YAML/JSON library needed.

## Block syntax

```
### ENTRY id=<slug> category=<New|Improved|Fixed> sass=<hook|none>
headline: <text>
hook: <text or the literal word "none">
sowhat: <text or "none">
receipt: <text or "none">
cta: <text or "none">
### END
```

## Rules for filling it in

- `id` — a stable slug from the feature name (`bulk-actions`, not `entry-1` or `247`). This is
  what lets entries get tracked and diffed across releases later.
- `category` — exactly one of `New`, `Improved`, `Fixed`. Case-sensitive.
- `sass` — `hook` if this entry has a hook filled in, `none` if not. This is just a quick visual
  flag for a human skimming the draft file; the scripts actually check the `hook` field itself,
  not this tag.
- Every field must be present. If a field doesn't apply, write the literal word `none` —
  don't leave it blank and don't delete the line. Blank/missing is what the scripts treat as
  "not written yet" (a bug), while `none` means "deliberately skipped" (a choice).
- `Fixed` entries may set `sowhat` and `receipt` to `none` and put everything in `headline` —
  see STRUCT-02/03 in SKILL.md for when the full skeleton is required.

## Full example draft (three entries)

```
### ENTRY id=bulk-actions category=New sass=hook
headline: Bulk actions have entered the chat.
hook: You can now select every unread thread at once.
sowhat: Stop clicking the same checkbox forty times.
receipt: Select multiple conversations from the inbox and archive, tag, or reassign them in one action.
cta: none
### END

### ENTRY id=login-fix category=Fixed sass=none
headline: Fixed a bug where logging in on Safari sometimes required two tries.
hook: none
sowhat: none
receipt: none
cta: none
### END

### ENTRY id=password-reset-delay category=Fixed sass=none
headline: Password reset emails were delayed for about six hours on Tuesday.
hook: none
sowhat: none
receipt: An email provider issue caused the delay. It's fixed, and we're monitoring for it now.
cta: none
### END
```

Run against it:
```
node scripts/check-all.mjs path/to/draft.md
```

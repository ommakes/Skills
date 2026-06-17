# Microcopy Routing to Righter Skill

**This is critical.** Every piece of text that appears in UI should be reviewed with righter skill.

Use righter skill for:

- **Form labels:** "Email address", "Company name", "Payment method"
- **Helper text:** explanations below inputs, guidance on format
- **Placeholder text:** inside empty inputs (actually: use color token text-instruction for color, but righter for words)
- **Error messages:** validation failures, explanations of what went wrong + how to fix
- **Button labels:** "Save changes", "Delete invoice", "Confirm", "Next"
- **Status labels & badges:** "Pending review", "Active", "Archived"
- **Section headers:** group titles, tab names
- **Descriptions:** explanations of form sections, modal content, empty states
- **Confirmation dialogs:** titles, body text, button labels
- **Toast/banner messages:** success, error, warning copy
- **Empty states:** what to do when no data exists
- **Tooltips & popovers:** explanations of features, buttons, settings
- **Inline alerts:** error states, warnings, info messages grouped with fields
- **Column headers:** table column labels (keep short)
- **Filter/sort labels:** dropdown options, chip text for active filters
- **Pagination controls:** "Previous page", "Next page", page numbers
- **Breadcrumb labels:** navigation hierarchy labels
- **Table action menus:** "Edit row", "Delete row", "Archive"
- **Quick action tooltips:** icon button explanations ("Edit", "Share", "Delete")

**Do NOT guess at button labels.** Example of wrong → right:

❌ "Confirm"
✓ "Delete invoice" (from righter)

❌ "OK"
✓ "Save changes" (from righter)

❌ "Yes"
✓ "Send invitation" (from righter)

**Integration pattern:**

```
1. You determine structure with this skill (page-templates)
2. Call record_pattern_decision with the path ID
3. For every word, check righter skill
4. Get the exact copy from righter
5. Then implement with vois-design-system rules (tokens, spacing, components)
```

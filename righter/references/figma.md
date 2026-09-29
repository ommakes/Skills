# Figma copy review

Read this only when someone shares a Figma link and asks for a copy review. Skip it for pasted text.

## Workflow

1. **Read the link.** In `figma.com/design/<fileKey>/<name>?node-id=<nodeId>`, the file key is the segment after `/design/`. The node id is the `node-id` value. Convert the dash to a colon if a tool needs it (`12-34` becomes `12:34`).
2. **Pull the text.** Use the Figma MCP tools when they're connected. Check which tools exist in the current environment before you name one. Tools seen in the Figma MCP server include `get_design_context`, `get_metadata`, and `get_screenshot`. Get the text nodes from the first two and use `get_screenshot` to see the layout. If no Figma tools are connected, ask the person to paste the strings or export the frame, and continue from step 3.
3. **Group by component.** Label each string with its component type: button, toast, tooltip, helper text, empty state, permission prompt, alert dialog, and so on. The right rules and character limits come from `data/components.json`. If the tier isn't clear, use `consumer` (see Audience and Reading Target in `SKILL.md`).
4. **Review.** Use the standard review format. For one or two strings, use the full block. For a batch of strings, use a compact table and cite principle ids:

   | Node | Before | After | Principle ids |
   |---|---|---|---|
   | Checkout / Pay button | Submit | Pay $42 | `accessible-copy` |

5. **Don't write back.** Never change the Figma file unless the person asks. Editing Figma is a separate task. It needs the Figma write tools and their own skill.

## Notes

- Screenshots show layout and context. Base each review on the text, and use the image to pick the component.
- Note any string that looks like placeholder text ("Lorem ipsum", "Label"). Ask before rewriting it.
- Keep a note of node names so the designer can find each string.

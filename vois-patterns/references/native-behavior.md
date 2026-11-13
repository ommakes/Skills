# Native-first behavior

Rules for sheets, form modals, swipe, back and refresh on a phone, written from what native iOS apps do. They sit above the web rules `DS-MODAL-001` to `DS-MODAL-003`, which only cover web mechanics (focus, scroll, layout shift), and they add to `PATH-PAGE-OVERLAY` and `PATH-D`.

**Android: not observed.** The rules come from iOS screens and flows found on Mobbin. Mobbin search has no Android filter, so no Android screens were checked. Android notes below come from Google guidance only and stay unproven until someone looks at real screens. Screens are stills, so nothing here covers timing, spring feel or scroll behavior.

## Modal or nonmodal sheet `[PATH-NATIVE-SHEET-KIND]`

If the user still needs the page behind it (a map, a list they keep using), open a nonmodal sheet with detents and no scrim, and keep the page usable. If they do not (a form, a confirmation, a pick), open a modal sheet or an alert with a scrim. A long task, or one with its own URL, is a full screen. From tablet up, a nonmodal sheet becomes a side panel and a modal sheet becomes a dialog or popover, as PATH-PAGE-OVERLAY says. Nothing opens over a popover except an alert.

Seen in: [1](https://mobbin.com/screens/dad4a79a-26f6-4b67-b0f2-ccd7499a8f86?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp), [2](https://mobbin.com/screens/48979d83-670d-48e4-84d6-a7b8e6eff7f5?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp), [3](https://mobbin.com/screens/3273b096-22c7-4be5-bd1b-4628fa1a7053?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp), [4](https://mobbin.com/screens/96244d4a-40b9-488d-a466-9ae2180b6e64?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp), [5](https://mobbin.com/screens/b590abf4-f9cb-41e0-87d1-c980e3d698a8?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp).

## Form in a modal sheet `[PATH-NATIVE-FORM-SHEET]`

The tall modal sheet is how the full screen overlay in PATH-PAGE-OVERLAY looks on iOS: the parent shows above it and the title is centered in a top bar. Close or Cancel sits on the left. A named commit sits on the right (Add, Create, Save). The commit stays disabled until the form can be saved. It is never an action sheet (PATH-D). Labels come from righter.

Seen in: [1](https://mobbin.com/screens/f4dc9422-2c5e-41fb-9ea0-eb4e5adb163c?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp), [2](https://mobbin.com/screens/4ce34519-ace8-4a54-a97e-63564433a725?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp), [3](https://mobbin.com/screens/5a352644-2149-4722-9098-b97a5c8c727d?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp), [4](https://mobbin.com/screens/adc89d9f-a056-4064-860b-9c5df10ee581?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp).

## Sheets always have a visible way out `[PATH-NATIVE-DISMISS]`

Every sheet shows a visible close control or Cancel. Swiping down is extra, never the only way out. A sheet with unsaved edits ignores a swipe down and asks to discard (PATH-PAGE-VIEW-EDIT). A nonmodal sheet with detents keeps its close control at every detent.

Seen in: no screen. Judgment.

## One swipe action per row `[PATH-NATIVE-SWIPE-ROW]`

Reveal at most one action on the trailing swipe. If it deletes or removes, it is red and has a text label. Never stack two or more. A swipe is never the only path: the same action is also on a visible menu or on the detail screen. Keep horizontal swipe handlers away from the screen edges, where back gestures start. A row inside a horizontally scrolling area has no swipe action.

Seen in: [1](https://mobbin.com/screens/873d27a4-ba4e-4922-8055-09d02debd295?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp), [2](https://mobbin.com/screens/4bb415b1-2a89-4c97-b713-f058f7e62e72?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp), [3](https://mobbin.com/screens/72032ea6-066e-4745-90a6-3b0c9ad9a885?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp), [4](https://mobbin.com/screens/e97a2ae1-ef94-4f8d-bdfb-f85b325a9936?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp).

## Back and close on phone `[PATH-NATIVE-BACK]`

Drill-down pushes a new level and shows a back control at the top left (PATH-PAGE-LEVELS). Do not replace the system back gesture with a custom swipe. A full-screen modal shows a close control at the top left, and that is a close, not a back. The bottom tab bar may stay on a detail screen.

Seen in: [1](https://mobbin.com/flows/258439a8-40a5-4574-b6f1-4bfd0327b57d?tab=screens&utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp), [2](https://mobbin.com/flows/34de7860-6af6-4f03-88c8-5367aba88270?tab=screens&utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp), [3](https://mobbin.com/flows/a10df4dd-7ca3-41d4-847a-7d764fa79d1f?tab=screens&utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp), [4](https://mobbin.com/screens/7a632aba-2017-4ae6-94ea-8d49d22028f9?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp), [5](https://mobbin.com/screens/5e5d2f3b-a219-4045-89be-a3f9c6a22c85?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp), [6](https://mobbin.com/screens/12a91773-f655-463d-9b3a-6bd0673c7c4e?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp).

## Pull to refresh `[PATH-NATIVE-REFRESH]`

Use pull to refresh only at the top of a list sorted by recent content. Never on a map, a canvas or other content that pans. Every pull to refresh also has a visible refresh control for fine pointers. Show the result briefly (a toast or a pill).

Seen in: [1](https://mobbin.com/screens/fd330182-950b-40b8-8e53-9fa2b9985df0?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp), [2](https://mobbin.com/screens/c7a8dd36-b182-443d-baf0-bc7b68787597?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp).

## Android notes (not observed)

- Material has standard and modal bottom sheets. A standard sheet has no scrim and stays usable, and its content can move to a side sheet on larger screens. [Material: bottom sheets](https://material.io/components/sheets-bottom)
- Predictive back previews the destination. Keep drag targets out of the system gesture insets. [Android: predictive back](https://developer.android.com/design/ui/mobile/guides/patterns/predictive-back)
- Compact is under 600dp, medium is 600 to 839dp, expanded is 840dp and up. `expanded` is the one Android width with its own token here. [Android: large screens](https://developer.android.com/design/ui/large-screens)
- Pull to refresh guidance is the older [Material 1 page](https://m1.material.io/patterns/swipe-to-refresh.html). Do not use it in navigation drawers, widgets or pannable content.
- Material's swipe-to-dismiss has a start and an end direction. Whether two directions fit `PATH-NATIVE-SWIPE-ROW` is open.

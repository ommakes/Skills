# Navigation and Switching

Decision trees and reasoning for Jobs 5, 17.

## Job 5: Switch between views or filter to a subset `[JOB-SWITCH-VIEWS]`

The user needs to navigate between distinct views or filter content into categories.

```
├─ Switching between distinct pages or major content areas (Settings: Profile, Billing, Members)
│  └─ Tabs (persistent selection, full content swap)
│
├─ Filtering a list or data set to a category (All / Active / Archived)
│  ├─ 2–4 options, mutually exclusive                → Segmented Control (or Tabs styled as pills)
│  └─ 5+ options or options that change dynamically  → Select or Combobox (see Job 6)
│
└─ Applying non-exclusive labels or types to items (tagging, multi-select filter)
   └─ Checkbox group or Badge filters (not Tabs — Tabs are always mutually exclusive)
```

**Why not Segmented Control for major navigation?** Segmented Control is for filtering, not navigation. It communicates "I'm narrowing this view" not "I'm going somewhere new." For content areas with meaningfully different layouts or enough content to warrant their own visual space, use Tabs.

**Why not Pills/Tabs for many options?** Tabs should be visible all at once — scrolling tabs are a bad pattern. If you have more than 5–6 options, switch to a Select or Combobox so the user can find their option without horizontal scrolling.

## Job 17: Indicate position in a hierarchy and enable backtracking `[JOB-NAVIGATION-POSITION]`

The user has navigated into a nested view and needs to know where they are and how to get back.

```
├─ User is 2+ levels deep in a hierarchy (Settings > Workspace > Members)
│  └─ Breadcrumb (shows full path, every item is a link)
│
├─ User is 1 level deep, came from a specific list or context
│  └─ Back link (single arrow + parent page name — simpler than a breadcrumb)
│
└─ User is on a top-level page with sibling pages
   └─ Navigation (sidebar or top nav — breadcrumb isn't needed at the top level)
```

**Why not Breadcrumb for 1-level deep?** A breadcrumb showing "Home > Current Page" is almost always unnecessary. A single back link is cleaner. Only use Breadcrumb when there are 3+ meaningful levels to display.

**Why not a back button (browser back)?** Relying on browser history means the back destination changes depending on how the user got there. An explicit back link always goes to the correct parent, regardless of navigation history.

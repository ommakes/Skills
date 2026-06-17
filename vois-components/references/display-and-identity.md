# Display and Identity

Decision trees and reasoning for Jobs 11, 12, 18.

## Job 11: Label or categorize a piece of content `[JOB-LABEL-CONTENT]`

You need to communicate metadata, status, or category attached to an item.

```
├─ Status or category label, not interactive (read-only, decorative)
│  └─ Badge (inline, non-interactive)
│
├─ User-created label that can be applied and removed (tags in a CRM, labels on an issue)
│  └─ Badge with dismiss button (Chip/Tag pattern)
│
└─ Selected filter or active facet in a search or filter UI
   └─ Badge with dismiss (dismissing removes the filter)
```

**Why not a Button for dismissible labels?** A dismissible label communicates "this is an attribute of the item, and you can remove it." A Button communicates "click me to do something." The visual weight and shape differ. Use Badge-with-dismiss to keep the categorical meaning intact.

**Why not a plain text label?** Plain text can't carry visual weight, color-coding, or truncation behavior. When the label needs to be scannable at distance in a table or list, Badge handles it with appropriate contrast and padding.

## Job 12: Represent a user or group `[JOB-REPRESENT-USER]`

You need to show who is involved in something — who owns a record, who is in a conversation, who is online.

```
├─ Single user
│  ├─ User has a profile photo → Avatar (image)
│  └─ No photo available       → Avatar (initials fallback)
│
├─ Multiple users, count matters (showing all members of a team)
│  └─ AvatarGroup (stacks avatars with overflow count: "+4")
│
└─ Real-time presence (online/offline/away, active in document)
   └─ Avatar + Presence indicator (colored dot, workspace-specific — check manifest)
```

**Why not AvatarGroup when count doesn't matter?** If you're just showing that multiple people are associated with something (not how many), a single Avatar with initials or "Team" label may be cleaner. AvatarGroup implies the count is meaningful.

## Job 18: Display structured data `[JOB-DISPLAY-DATA]`

You need to show a collection of items with shared attributes.

```
├─ Items are simple, no sorting, filtering, or bulk actions needed (notifications, activity feed)
│  └─ List (semantic ul/li with consistent item layout)
│
├─ Items have multiple comparable attributes (users, orders, records)
│  ├─ Under 100 rows, no column freezing, no virtualization
│  │  └─ Table
│  └─ 100+ rows, sortable columns, bulk actions, column management
│     └─ DataTable (check workspace manifest — typically TanStack Table based)
│
└─ Items are cards in a grid (products, projects, media)
   └─ Grid of Cards (not a Table — tables communicate that attributes are comparable; cards communicate that items are browsable)
```

**Why not Table for simple lists?** Table implies the columns are meaningful for comparison. An activity feed or notification list has items but comparison between them isn't the point. A List is the correct semantic element and lighter visually.

**Why not DataTable for small data sets?** DataTable adds pagination, column visibility management, and bulk action infrastructure. For 20 rows with no sorting or bulk actions, that complexity is overhead. Use Table and add only the features you need.

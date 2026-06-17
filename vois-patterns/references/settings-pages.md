# Settings Page `[PATH-A]`

## When to use:

- User is managing profile, workspace, team, billing, notifications, members
- Multiple related sections that don't need to be edited simultaneously
- Changes persist immediately or on explicit save

## Macro Decision: Settings Depth

**IF: 2-3 sections only** `[PATH-A-DEPTH-SHALLOW]`
→ Use: Horizontal tabs pinned to top (single page)
→ Structure: Page title + tabs + tab content area

**IF: 4+ sections** `[PATH-A-DEPTH-DEEP]`
→ Use: Sidebar navigation + sub-pages
→ Structure: Sidebar (pinned on desktop, hamburger on mobile) + main content area

## Mobile Adaptation:

- Sidebar becomes hamburger menu that slides out and overlaps content

## Standard Sections (with righter routing):

### Profile Section

Contains: first/last name, email, phone, home address, role, profile picture, delete account

**Microcopy to write with righter:**

- Label: "First name"
- Label: "Last name"
- Label: "Email address"
- Helper text: guidance on email format if relevant
- Button: "Upload photo" or "Change photo"
- Danger button: "Delete account" (see righter for confirmation copy)

### Workspace/Organization Section

Contains: company name, EIN, logo, brand color, phone, business address, delete workspace

**Microcopy to write with righter:**

- Label: "Company name"
- Label: "Business address"
- Helper text: "This is your official headquarters address"
- Danger button: "Delete workspace" (see righter for confirmation copy)

### Billing Section

Contains: payment methods, invoices, subscription

**Microcopy to write with righter:**

- Section title: "Billing & Subscription"
- Button: "Add payment method"
- Button: "Download invoice"
- Status label: "Active subscription" or "Trial ending" or "Past due"

### Notifications Section

Contains: email preferences, notification types

**Microcopy to write with righter:**

- Checkboxes: "Email me when…"
- Toggle: "Receive desktop notifications"
- Helper text: explanations of each notification type

### Members Section

Contains: list with role-based access (member, admin, etc.)

**Microcopy to write with righter:**

- Column headers: "Name", "Email", "Role", "Status"
- Button: "Invite member"
- Status badge: "Pending", "Active"
- Action menu: "Edit role", "Remove member"

## Form Handling Within Settings:

Each section = mini form with own view/edit state

**VIEW STATE** (default)

- Label + data value stacked vertically or side-by-side
- Full-width border delineates each item
- No edit possible

**EDIT STATE** (explicit user action)

- Input fields editable
- Buttons appear: Save + Cancel
- → **For button copy, use righter skill** ("Save changes", "Cancel", etc.)

**Permissions Rules:**

- Hide entire sections user can't access based on role
- Disable fields user can't edit, but show them in view-only state
- → **For disabled state explanations, use righter skill** (tooltip or helper text explaining why)

**Save & Confirmation:**

- On save: trigger toast confirmation
- → **For toast copy, use righter skill** ("Profile updated", "Changes saved", etc.)

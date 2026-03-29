# Testing: Google Workspace Plugin

## Prerequisites

1. Install the `gws` CLI: `npm i -g @anthropic-ai/gws` (or however it's distributed)
2. Authenticate: `gws auth login` — follow the OAuth flow in your browser
3. Verify auth: `gws auth status --format json` should show `"token_valid": true`

## Automated Tests

```bash
cd plugins/google_workspace
pnpm install
pnpm test
```

All 122 tests should pass across 4 test files:
- `gws-schemas.unit.test.ts` — Zod schema validation
- `helpers.unit.test.ts` — converter functions and body parsing
- `gws-client.unit.test.ts` — CLI wrapper, error handling, keyring stripping
- `api.integration.test.ts` — API layer with mocked client

## Manual Testing in Vienna

### 1. Plugin loads without errors

- Open Vienna on the `pipedrive` branch
- Check DevTools console — no `node:*` renderer errors
- Check logs — `"Loaded plugin"` for `google_workspace` with `errors: 0`

### 2. Auth status detection

**When authenticated:**
- Nav sidebar should show "Google Workspace" section with Inbox, Agenda, Recent Files

**When token expired:**
- Nav sidebar should show "Token expired -- re-authenticate"
- Click it to open settings drawer with re-auth instructions

**When never authenticated:**
- Nav sidebar should show "Not connected"
- Click to open settings drawer with full setup instructions

### 3. Nav sidebar - Inbox

- Should show Gmail threads with subject, sender name
- Unread threads should have a blue dot prefix
- Click a thread to open the Gmail thread drawer

### 4. Nav sidebar - Agenda

- Should show upcoming calendar events with summary and formatted time
- Events with Google Meet links should show an external link icon on hover
- Click an event to open the Calendar event drawer (should NOT show "Failed to load event")

### 5. Nav sidebar - Recent Files

- Should show recent Drive files with name and MIME type label (e.g., "Google Doc", "PDF")
- Files should have external link icons on hover
- Click a file to open the Drive file drawer

### 6. Gmail Thread Drawer

- Header shows subject line
- Metadata: from, to, date, message count
- Message list with expandable messages
- Each message shows from/date header and body text
- "Open in Gmail" button in footer (if available)

### 7. Calendar Event Drawer

- Header shows event summary
- Time (start/end formatted), location, organizer
- Attendee list with response status badges (Accepted/Declined/Maybe/Pending)
- Description rendered as Markdown
- "Open in Calendar" and "Join Meeting" buttons in footer

### 8. Drive File Drawer

- Header shows filename
- Metadata: type label, size, owner, created/modified dates
- Starred/Shared badges
- "Open in Drive" and "Download" buttons in footer

### 9. Settings Drawer

- Click gear icon on nav section header
- Auth status section shows connected email
- Inbox settings: query filter, limit
- Drive settings: query, limit, MIME type filter
- Changes persist across page reloads (localStorage)

### 10. Edge cases

- Empty inbox (no threads matching query) — shows "No threads found"
- No upcoming events — shows "No upcoming events"
- No Drive files — shows "No recent files"
- Network errors — drawers show error state, nav continues to function

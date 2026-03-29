# Testing Instructions: Feedback Plugin

## Prerequisites

1. **Vienna web app** running locally (`apps/web`)
2. **Vienna desktop app** running locally (`apps/desktop`)
3. Both PRs merged:
   - hellodrift/vienna#365 (backend API + schema)
   - hellodrift/registry#4 (feedback plugin)

---

## Phase 1: Backend Setup (Vienna Web App)

### 1.1 Apply database migration

```bash
cd apps/web
npx prisma migrate dev --name add-feedback-status
```

**Verify:** Run `npx prisma studio`, open the `feedback` table, confirm the `status` column exists with default value `new`.

### 1.2 Set admin API key

Add to your `.env` or `.env.local`:

```
VIENNA_ADMIN_API_KEY=your-secret-key-here
```

### 1.3 Ensure feedback data exists

If no feedback exists in the database, submit some via the desktop app's feedback button (bottom of sidebar). Submit 3-5 items with different messages.

### 1.4 Test API routes directly

```bash
# List feedback
curl -H "x-api-key: your-secret-key-here" http://localhost:3000/api/admin/feedback

# Expected: { "items": [...], "total": N, "limit": 50, "offset": 0 }

# Get single item (use an ID from the list response)
curl -H "x-api-key: your-secret-key-here" http://localhost:3000/api/admin/feedback/<id>

# Update status
curl -X PATCH -H "x-api-key: your-secret-key-here" \
  -H "Content-Type: application/json" \
  -d '{"status": "reviewed"}' \
  http://localhost:3000/api/admin/feedback/<id>

# Expected: full feedback object with updated status

# Test unauthorized access
curl http://localhost:3000/api/admin/feedback
# Expected: 401 Unauthorized

# Test invalid status
curl -X PATCH -H "x-api-key: your-secret-key-here" \
  -H "Content-Type: application/json" \
  -d '{"status": "invalid"}' \
  http://localhost:3000/api/admin/feedback/<id>
# Expected: 400 with validation error
```

---

## Phase 2: Plugin Installation

### 2.1 Install dependencies

```bash
cd plugins/feedback
pnpm install
```

### 2.2 Typecheck

```bash
pnpm run typecheck
# Expected: no errors
```

---

## Phase 3: Plugin UI Testing (in Vienna Desktop App)

### 3.1 Plugin loads in sidebar

1. Open Vienna desktop app
2. The "Feedback" section should appear in the left nav sidebar
3. It should show "Open Settings to configure" since no credentials are set yet

### 3.2 Configure credentials

1. Click "Open Settings to configure" or the gear icon on the Feedback section header
2. The plugin settings drawer should open with:
   - **Vienna App URL** field — enter `http://localhost:3000` (or your web app URL)
   - **Admin API Key** field — enter the same key from `.env`
3. After saving both, the nav section should reload and show feedback items

### 3.3 Nav sidebar displays feedback

1. Feedback items should appear as a list with:
   - Truncated message text (first ~55 chars)
   - Status color dot (blue = new, yellow = reviewed, purple = in progress, green = resolved, gray = archived)
   - Relative timestamp (e.g., "2d ago")
2. The section header should show count: "Feedback (N)"

### 3.4 Settings — filtering and grouping

1. Open settings, change **Status filter** to "New" — only new items should show
2. Change **Group by** to "Status" — items should group under status headers
3. Change **Group by** to "Source" — items should group under source headers (Desktop, Web, etc.)
4. Change **Item limit** — verify the count changes
5. Click "Reset to defaults" — everything reverts

### 3.5 Entity drawer opens

1. Click any feedback item in the sidebar
2. The entity drawer should open showing:
   - Status badge (colored) + source badge + relative time in the header
   - Full message text in a bordered container
   - Status dropdown (functional — see next test)
   - Metadata rows: Name, Email, User ID, Source, Submitted date
   - Device Info section (if metadata contains appVersion, platform, arch)
   - Footer with truncated ID and full timestamp

### 3.6 Status update works

1. In the entity drawer, use the Status dropdown to change status (e.g., New → Reviewed)
2. A "Saving..." indicator should briefly appear
3. After save, the status badge should update
4. Close and reopen the drawer — status should persist
5. The nav sidebar should reflect the new status color dot

### 3.7 Global search (entity search)

1. Use Vienna's global search (Cmd+K or equivalent)
2. Type part of a feedback message
3. Feedback items should appear in search results with the 💬 emoji
4. Clicking a search result should open the entity drawer

---

## Phase 4: Cross-Plugin Linear Integration

> **Prerequisite:** The Linear plugin must be installed and configured with a valid API key or OAuth connection.

### 4.1 Linear section appears in drawer

1. Open a feedback item's entity drawer
2. Below the metadata, an "Escalate to Linear" section should appear
3. If Linear is NOT configured, this section should NOT appear (graceful degradation)

### 4.2 Create Linear issue from feedback

1. Click "Create Linear Issue"
2. An inline form should expand with:
   - **Team** dropdown (populated from Linear's teams)
   - **Title** input (optional, pre-filled with placeholder)
3. Select a team and click "Create Issue"
4. A success message should appear: "Linear issue created successfully"
5. The feedback item's status should auto-update to "In Progress"

### 4.3 Verify in Linear

1. Open Linear and find the created issue
2. It should have:
   - Title: "Feedback: [first 80 chars of message]" (or custom title if provided)
   - Description containing the full feedback message, submitter info, source, and feedback ID

### 4.4 Error handling

1. If Linear API fails (e.g., invalid team ID), an error message should appear in the form
2. The feedback status should NOT change on failure

---

## Edge Cases

- **Empty database:** Plugin should show "No feedback found" in nav
- **Long messages:** Should truncate properly in nav (55 chars) and display fully in drawer
- **Missing fields:** Feedback with no name/email should show only the fields that exist
- **Rate limiting:** Rapid status updates should show saving indicator and not lose changes
- **Plugin without Linear:** The "Escalate to Linear" section should be completely hidden

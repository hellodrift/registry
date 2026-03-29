# Testing Instructions: Reddit Community Monitoring Plugin

## Prerequisites

1. **Reddit Script App** — Create one at https://www.reddit.com/prefs/apps
   - Click "create another app"
   - Select **script** type
   - Name: anything (e.g. "Vienna Dev")
   - Redirect URI: `http://localhost:8080`
   - Note your **client ID** (short string under app name) and **client secret**
2. **Reddit Account** — You need the username and password for the account that created the app
3. **Vienna running** with the plugin registry pointing to this branch

## 1. Plugin Registration

- [ ] Confirm the Reddit plugin appears in Vienna's plugin list
- [ ] Verify the Reddit icon (Snoo logo) renders correctly in the nav sidebar
- [ ] Check the console for any schema registration errors on startup

## 2. Settings Drawer

Open the Reddit settings drawer (gear icon in nav sidebar, or nav item "Configure credentials").

### 2a. Credential Configuration

- [ ] All 4 credential fields show as "Configure" initially:
  - Client ID
  - Client Secret
  - Reddit Username
  - Reddit Password
- [ ] Enter and save each credential — verify each shows "Set" badge after saving
- [ ] Verify the password/secret fields mask input by default (toggle eye icon to reveal)
- [ ] Test removing a credential (trash icon) — field reverts to "Configure"
- [ ] After all 4 are set, confirm "All credentials configured" message appears

### 2b. Subreddit Configuration

- [ ] Type a subreddit name (e.g. `startups`) and press Enter — appears as `r/startups` chip
- [ ] Add multiple subreddits (e.g. `SaaS`, `indiehackers`, `Entrepreneur`)
- [ ] Verify typing `r/startups` strips the `r/` prefix (no duplicate prefix)
- [ ] Remove a subreddit by clicking the X on its chip
- [ ] Verify duplicates are prevented

### 2c. Keyword Configuration

- [ ] Add keywords (e.g. `solo founder`, `side project`, `looking for feedback`)
- [ ] Verify they appear as chips and can be removed

### 2d. Other Settings

- [ ] Change sort order: New / Hot / Rising — verify it persists
- [ ] Change post limit: 10 / 25 / 50 — verify it persists
- [ ] Enter a product description in the "Your Product" textarea
- [ ] Click "Reset to Defaults" — verify all settings revert

### 2e. Settings Persistence

- [ ] Close and reopen the settings drawer — all values should persist
- [ ] Reload Vienna — settings should survive (stored in localStorage)

## 3. Nav Sidebar

After configuring credentials and adding at least one subreddit:

### 3a. Basic Feed

- [ ] Nav section shows "Reddit (N)" with total post count
- [ ] Posts are grouped by subreddit in collapsible folders (e.g. `r/startups (5)`)
- [ ] Each post shows: truncated title, score, comment count, relative time
- [ ] High-score posts (100+) show a trending icon vs regular up-arrow
- [ ] Hover on a post shows an external link icon to open on Reddit

### 3b. Keyword Filtering

- [ ] With keywords configured, only posts matching those keywords appear
- [ ] Remove all keywords — all posts from the subreddits should appear
- [ ] Keywords match against both title and body text

### 3c. Sort Orders

- [ ] Switch to "Hot" — verify posts change order (hot vs chronological)
- [ ] Switch to "Rising" — verify rising posts appear
- [ ] Switch back to "New" — verify newest first

### 3d. Edge Cases

- [ ] With no subreddits configured: shows "Add subreddits to monitor" prompt
- [ ] With invalid credentials: shows "Failed to connect" error state
- [ ] With subreddits that have no matching posts: shows "No matching posts" per folder

## 4. Entity Drawer (Post Detail)

Click any post in the nav sidebar to open the entity drawer.

### 4a. Post Content

- [ ] Title renders correctly
- [ ] `r/{subreddit}` badge displays
- [ ] Flair badge shows if the post has flair
- [ ] Author (`u/username`), score, upvote ratio, comment count, and relative time display
- [ ] Self-posts: body renders as Markdown
- [ ] Link posts: shows external link with domain name

### 4b. Comments

- [ ] Comments load below the post body
- [ ] Each comment shows: author, score, relative time, and body text
- [ ] Nested comments are indented (up to 4 levels deep)
- [ ] "Reply" button appears on each comment

### 4c. Draft Reply (AI-Assisted)

- [ ] Click "Draft Reply" button in the footer
- [ ] If no product context is configured: shows a prompt to configure it
- [ ] If product context is set: generates a structured reply template
- [ ] Draft appears in an editable textarea
- [ ] User can modify the draft text freely
- [ ] "Cancel" clears the draft and hides the textarea

### 4d. Send Reply

- [ ] Edit the draft, then click "Send Reply"
- [ ] Verify "Sending..." loading state
- [ ] On success: "Reply posted successfully!" message appears, textarea clears
- [ ] Verify the comment actually appears on Reddit (open permalink in browser)
- [ ] On error (e.g. rate limited): error message displays

### 4e. Reply to Comment

- [ ] Click "Reply" on a specific comment
- [ ] Reply textarea appears with that comment as the target
- [ ] Send the reply — verify it appears as a child of that comment on Reddit

### 4f. Footer

- [ ] "Open on Reddit" link opens the post's permalink in a new browser tab

## 5. Entity System

- [ ] Search for a Reddit post entity in Vienna's entity search
- [ ] Navigate to `@drift//reddit_post/{subreddit}/{postId}` directly — should resolve
- [ ] Entity context is generated for AI (verify via MCP entity tools if available)

## 6. Rate Limiting

- [ ] Monitor the Reddit API rate limit headers (check console/network tab)
- [ ] With 3-4 subreddits configured, verify requests stay well under 60/min
- [ ] Multi-subreddit fetch uses `r/sub1+sub2+sub3` format (single API call)

## 7. Token Refresh

- [ ] After 1 hour of use, verify the plugin continues to work (token auto-refreshes)
- [ ] Check console for any auth errors during refresh

## Known Limitations

- AI draft replies use a template in v1 (no actual AI API call) — the template is structured for the user to customize
- Reddit search API can be loose with matching — client-side filtering double-checks keywords
- Comment tree is flattened with depth indentation (no collapse/expand per thread)
- Reddit's Responsible Builder Policy may require app approval for sustained use

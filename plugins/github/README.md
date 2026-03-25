# GitHub

GitHub integration for managing pull requests, issues, workflows, and repositories.

## Features

- **Pull Requests** — List, create, merge, review, comment, view file changes
- **Issues** — List, search, create, update, filter by state/labels/assignee
- **Workflows** — View CI/CD runs with job steps, re-run failed workflows
- **Repositories** — Browse repos, view metadata, list collaborators and labels
- **Personal views** — My PRs, my issues, review requests

## Setup

Authenticate via OAuth (recommended) or a Personal Access Token.

**OAuth:** Configure `github_oauth_client_id` and `github_oauth_client_secret` in the plugin's secure storage settings.

**PAT fallback:** Add a `personal_access_token` with `repo`, `read:org`, `workflow`, and `read:user` scopes.

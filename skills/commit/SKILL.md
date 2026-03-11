---
name: commit
description: Create clean, well-structured git commits with conventional commit messages. Use when the user asks to commit changes, stage files, or write commit messages.
version: "1.0.0"
author: Drift Team
tags: [git, productivity, workflow]
icon: "\U0001F4E6"
category: Developer Workflow
---

# Git Commit Assistant

Help the user create clean, well-structured git commits following best practices.

## Workflow

1. **Review changes** — Run `git status` and `git diff` to understand what changed.
2. **Stage selectively** — Stage related files together. Prefer `git add <file>` over `git add .` to avoid accidentally including unrelated changes, secrets, or build artifacts.
3. **Write the message** — Follow the Conventional Commits format:

```
<type>(<scope>): <short summary>

<optional body explaining WHY, not WHAT>
```

### Commit Types

| Type | When to use |
|------|------------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `chore` | Build, CI, dependencies, tooling |
| `perf` | Performance improvement |
| `style` | Formatting, whitespace, semicolons |

### Rules

- **Subject line**: imperative mood ("add feature" not "added feature"), max 72 chars
- **Body**: explain the motivation and context, not a line-by-line diff recap
- **Scope**: use the module, package, or component name (e.g., `feat(auth): add OAuth2 flow`)
- **Breaking changes**: add `!` after type/scope and explain in body (e.g., `feat(api)!: remove v1 endpoints`)
- **Never commit**: `.env` files, credentials, secrets, `node_modules/`, build output, large binaries
- **One concern per commit**: don't mix a bug fix with a refactor — split them

### Examples

```
feat(skills): add skill browser drawer with search and filtering

The skills drawer lets users browse, search, and install skills from
configured registries. Supports category filtering and shows installed
state overlay on registry skills.
```

```
fix(auth): handle expired refresh tokens gracefully

Previously, an expired refresh token caused a hard crash in the session
middleware. Now we catch the error and redirect to the login page with
a clear message.
```

4. **Verify** — After committing, run `git log --oneline -3` to confirm the commit looks right.

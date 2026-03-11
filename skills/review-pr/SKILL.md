---
name: review-pr
description: Perform thorough pull request code reviews covering correctness, security, architecture, and style. Use when the user asks to review a PR, check code changes, or give feedback on a diff.
version: "1.0.0"
author: Drift Team
tags: [code-review, git, collaboration]
icon: "\U0001F50D"
category: Developer Workflow
---

# Pull Request Code Review

Perform a structured, thorough code review of a pull request or set of changes.

## Review Process

### 1. Understand Context

Before reviewing code, understand what the PR is trying to accomplish:
- Read the PR title, description, and linked issues
- Identify the type of change: feature, bug fix, refactor, infrastructure
- Note the scope — which areas of the codebase are affected

### 2. Review Checklist

Go through each category systematically:

#### Correctness
- Does the code do what the PR description says?
- Are there edge cases that aren't handled?
- Could any inputs cause unexpected behavior (null, empty, boundary values)?
- Are error paths handled properly?
- Do async operations have proper error handling and cleanup?

#### Security
- Any user input used without validation or sanitization?
- SQL injection, XSS, command injection risks?
- Secrets or credentials hardcoded or logged?
- Authentication/authorization checks in place?
- Sensitive data exposure in error messages or logs?

#### Architecture & Design
- Does the change follow existing patterns in the codebase?
- Is the abstraction level appropriate (not over- or under-engineered)?
- Are responsibilities clearly separated?
- Will this be easy to maintain and extend?
- Any unnecessary coupling introduced?

#### Performance
- N+1 queries or unnecessary database calls?
- Large data structures copied when they could be referenced?
- Missing indexes for new query patterns?
- Unbounded loops or recursive calls?

#### Testing
- Are the critical paths tested?
- Do tests cover edge cases and error conditions?
- Are tests readable and maintainable?
- Any flaky test patterns (timing, ordering, shared state)?

#### Style & Readability
- Are names clear and descriptive?
- Is the code self-documenting or does it need comments?
- Consistent formatting with the rest of the codebase?
- Dead code, commented-out code, or debug logs left behind?

### 3. Provide Feedback

Structure your review as:

**Summary** — One paragraph overview of the PR and your overall assessment.

**Must Fix** — Issues that should be resolved before merging:
- Bugs, security vulnerabilities, data loss risks
- Missing error handling for likely failure modes
- Breaking changes without migration path

**Should Fix** — Issues worth addressing but not blocking:
- Performance concerns, missing tests for edge cases
- Minor architectural improvements

**Nits** — Optional style and preference suggestions:
- Naming, formatting, comment improvements
- Alternative approaches worth considering

**Praise** — Call out things done well:
- Good test coverage, clean abstractions, clear documentation

### 4. Tone Guidelines

- Be specific: "This could panic on line 42 if `user` is nil" not "check for nil"
- Explain why: "This unbounded query could return millions of rows in production"
- Suggest alternatives: "Consider using `Map.get()` with a default instead of bracket access"
- Be kind: review the code, not the person
- Ask questions when unsure: "Is this intentionally skipping validation here?"

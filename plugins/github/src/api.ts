/**
 * GitHub API Functions — standalone async functions wrapping Octokit.
 *
 * Each function corresponds to a single GitHub API operation.
 * Used by GraphQL resolvers and entity handlers directly.
 */

import type { Octokit } from '@octokit/rest';
import { GraphQLError } from 'graphql';
import { parseRepoUrl, mapLabels } from './helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────────────────────────────────────────

function wrapGitHubError(err: unknown, context: string): never {
  if (err instanceof GraphQLError) throw err;
  if (err instanceof Error && 'status' in err) {
    const status = (err as { status: number }).status;
    const codeMap: Record<number, string> = {
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      422: 'BAD_REQUEST',
      429: 'RATE_LIMITED',
    };
    throw new GraphQLError(`GitHub API error (${status}): ${err.message}`, {
      extensions: { code: codeMap[status] ?? 'GITHUB_API_ERROR', context },
    });
  }
  throw err;
}

// ─────────────────────────────────────────────────────────────────────────────
// Repository
// ─────────────────────────────────────────────────────────────────────────────

export async function listRepos(client: Octokit, input: {
  type?: string;
  sort?: string;
  limit?: number;
}) {
  try {
    const { data } = await client.repos.listForAuthenticatedUser({
      type: (input.type ?? 'all') as 'all',
      sort: (input.sort ?? 'updated') as 'updated',
      per_page: input.limit ?? 30,
    });
    return {
      repos: data.map((r) => ({
        owner: r.owner.login,
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        language: r.language,
        private: r.private,
        defaultBranch: r.default_branch,
        stargazersCount: r.stargazers_count,
        forksCount: r.forks_count,
        updatedAt: r.updated_at,
        url: r.html_url,
      })),
    };
  } catch (err) {
    wrapGitHubError(err, 'listRepos');
  }
}

export async function getRepo(client: Octokit, input: {
  owner: string;
  repo: string;
}) {
  try {
    const { data: r } = await client.repos.get({ owner: input.owner, repo: input.repo });
    return {
      owner: r.owner.login,
      name: r.name,
      fullName: r.full_name,
      description: r.description,
      language: r.language,
      private: r.private,
      defaultBranch: r.default_branch,
      stargazersCount: r.stargazers_count,
      forksCount: r.forks_count,
      openIssuesCount: r.open_issues_count,
      topics: r.topics,
      updatedAt: r.updated_at,
      url: r.html_url,
    };
  } catch (err) {
    wrapGitHubError(err, 'getRepo');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pull Requests — Queries
// ─────────────────────────────────────────────────────────────────────────────

export async function listPRs(client: Octokit, input: {
  owner: string;
  repo: string;
  state?: string;
  sort?: string;
  direction?: string;
  limit?: number;
}) {
  try {
    const { data } = await client.pulls.list({
      owner: input.owner,
      repo: input.repo,
      state: (input.state ?? 'open') as 'open',
      sort: (input.sort ?? 'created') as 'created',
      direction: (input.direction ?? 'desc') as 'desc',
      per_page: input.limit ?? 30,
    });
    return {
      prs: data.map((pr) => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        draft: pr.draft,
        author: pr.user?.login,
        authorAvatar: pr.user?.avatar_url,
        headBranch: pr.head.ref,
        baseBranch: pr.base.ref,
        labels: mapLabels(pr.labels),
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
        url: pr.html_url,
      })),
    };
  } catch (err) {
    wrapGitHubError(err, 'listPRs');
  }
}

export async function getPR(client: Octokit, input: {
  owner: string;
  repo: string;
  pull_number: number;
}) {
  try {
    const { data: pr } = await client.pulls.get({
      owner: input.owner,
      repo: input.repo,
      pull_number: input.pull_number,
    });
    return {
      number: pr.number,
      title: pr.title,
      state: pr.state,
      draft: pr.draft,
      author: pr.user?.login,
      authorAvatar: pr.user?.avatar_url,
      headBranch: pr.head.ref,
      baseBranch: pr.base.ref,
      body: pr.body,
      additions: pr.additions,
      deletions: pr.deletions,
      changedFiles: pr.changed_files,
      mergeable: pr.mergeable,
      mergeableState: pr.mergeable_state,
      labels: mapLabels(pr.labels),
      reviewers: pr.requested_reviewers?.map((r) => r.login) ?? [],
      url: pr.html_url,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
    };
  } catch (err) {
    wrapGitHubError(err, 'getPR');
  }
}

export async function getPRFiles(client: Octokit, input: {
  owner: string;
  repo: string;
  pull_number: number;
}) {
  try {
    const { data } = await client.pulls.listFiles({
      owner: input.owner,
      repo: input.repo,
      pull_number: input.pull_number,
      per_page: 100,
    });
    return {
      files: data.map((f) => ({
        filename: f.filename,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        changes: f.changes,
        patch: f.patch,
      })),
    };
  } catch (err) {
    wrapGitHubError(err, 'getPRFiles');
  }
}

export async function listPRReviews(client: Octokit, input: {
  owner: string;
  repo: string;
  pull_number: number;
}) {
  try {
    const { data } = await client.pulls.listReviews({
      owner: input.owner,
      repo: input.repo,
      pull_number: input.pull_number,
    });
    return {
      reviews: data.map((r) => ({
        id: r.id,
        user: r.user?.login,
        state: r.state,
        body: r.body,
        submittedAt: r.submitted_at,
        url: r.html_url,
      })),
    };
  } catch (err) {
    wrapGitHubError(err, 'listPRReviews');
  }
}

export async function listPRComments(client: Octokit, input: {
  owner: string;
  repo: string;
  pull_number: number;
}) {
  try {
    const { data } = await client.issues.listComments({
      owner: input.owner,
      repo: input.repo,
      issue_number: input.pull_number,
      per_page: 100,
    });
    return {
      comments: data.map((c) => ({
        id: c.id,
        user: c.user?.login,
        userAvatar: c.user?.avatar_url,
        body: c.body,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        url: c.html_url,
      })),
    };
  } catch (err) {
    wrapGitHubError(err, 'listPRComments');
  }
}

export async function getPRChecks(client: Octokit, input: {
  owner: string;
  repo: string;
  ref: string;
}) {
  try {
    const { data } = await client.checks.listForRef({
      owner: input.owner,
      repo: input.repo,
      ref: input.ref,
      per_page: 100,
    });
    return {
      totalCount: data.total_count,
      checkRuns: data.check_runs.map((cr) => ({
        id: cr.id,
        name: cr.name,
        status: cr.status,
        conclusion: cr.conclusion,
        startedAt: cr.started_at,
        completedAt: cr.completed_at,
        url: cr.html_url,
      })),
    };
  } catch (err) {
    wrapGitHubError(err, 'getPRChecks');
  }
}

export async function listMyPRs(client: Octokit, input: {
  filter?: string;
  state?: string;
  limit?: number;
}) {
  try {
    const filterType = input.filter ?? 'authored';
    const prState = input.state ?? 'open';
    const maxResults = input.limit ?? 30;

    const { data: user } = await client.users.getAuthenticated();
    const username = user.login;

    let query = `is:pr is:${prState}`;
    switch (filterType) {
      case 'authored': query += ` author:${username}`; break;
      case 'review_requested': query += ` review-requested:${username}`; break;
      case 'mentioned': query += ` mentions:${username}`; break;
      case 'assigned': query += ` assignee:${username}`; break;
    }

    const { data } = await client.search.issuesAndPullRequests({
      q: query,
      sort: 'updated',
      order: 'desc',
      per_page: maxResults,
    });

    return {
      totalCount: data.total_count,
      prs: data.items.map((item) => {
        const { owner, repo } = parseRepoUrl(item.repository_url ?? '');
        return {
          number: item.number,
          title: item.title,
          state: item.state,
          draft: item.draft ?? false,
          author: item.user?.login,
          authorAvatar: item.user?.avatar_url,
          owner, repo,
          labels: mapLabels(item.labels),
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          url: item.html_url,
        };
      }),
    };
  } catch (err) {
    wrapGitHubError(err, 'listMyPRs');
  }
}

export async function searchPRs(client: Octokit, input: {
  query: string;
  limit?: number;
}) {
  try {
    const effectiveQuery = input.query.trim() || 'author:@me';
    const searchQuery = effectiveQuery.includes('is:pr') ? effectiveQuery : `is:pr ${effectiveQuery}`;
    const { data } = await client.search.issuesAndPullRequests({
      q: searchQuery,
      sort: 'updated',
      order: 'desc',
      per_page: input.limit ?? 30,
    });
    return {
      totalCount: data.total_count,
      prs: data.items.map((item) => {
        const { owner, repo } = parseRepoUrl(item.repository_url ?? '');
        return {
          number: item.number,
          title: item.title,
          state: item.state,
          draft: item.draft ?? false,
          author: item.user?.login,
          authorAvatar: item.user?.avatar_url,
          owner, repo,
          labels: mapLabels(item.labels),
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          url: item.html_url,
        };
      }),
    };
  } catch (err) {
    wrapGitHubError(err, 'searchPRs');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pull Requests — Mutations
// ─────────────────────────────────────────────────────────────────────────────

export async function createPR(client: Octokit, input: {
  owner: string;
  repo: string;
  title: string;
  head: string;
  base: string;
  body?: string;
  draft?: boolean;
}) {
  try {
    const { data: pr } = await client.pulls.create({
      owner: input.owner,
      repo: input.repo,
      title: input.title,
      head: input.head,
      base: input.base,
      body: input.body ?? '',
      draft: input.draft ?? false,
    });
    return { success: true, message: `Created PR #${pr.number}: ${pr.title}`, number: pr.number, url: pr.html_url };
  } catch (err) {
    wrapGitHubError(err, 'createPR');
  }
}

export async function mergePR(client: Octokit, input: {
  owner: string;
  repo: string;
  pull_number: number;
  merge_method?: string;
  commit_title?: string;
  commit_message?: string;
}) {
  try {
    const { data } = await client.pulls.merge({
      owner: input.owner,
      repo: input.repo,
      pull_number: input.pull_number,
      merge_method: (input.merge_method ?? 'merge') as 'merge',
      commit_title: input.commit_title,
      commit_message: input.commit_message,
    });
    return {
      success: data.merged,
      message: data.merged ? `Merged PR #${input.pull_number}` : `Failed to merge: ${data.message}`,
      sha: data.sha,
    };
  } catch (err) {
    wrapGitHubError(err, 'mergePR');
  }
}

export async function updatePR(client: Octokit, input: {
  owner: string;
  repo: string;
  pull_number: number;
  title?: string;
  body?: string;
  state?: string;
  base?: string;
}) {
  try {
    const { data: pr } = await client.pulls.update({
      owner: input.owner,
      repo: input.repo,
      pull_number: input.pull_number,
      ...(input.title !== undefined && { title: input.title }),
      ...(input.body !== undefined && { body: input.body }),
      ...(input.state !== undefined && { state: input.state as 'open' | 'closed' }),
      ...(input.base !== undefined && { base: input.base }),
    });
    return { success: true, message: `Updated PR #${pr.number}`, url: pr.html_url };
  } catch (err) {
    wrapGitHubError(err, 'updatePR');
  }
}

export async function requestReview(client: Octokit, input: {
  owner: string;
  repo: string;
  pull_number: number;
  reviewers?: string[];
  team_reviewers?: string[];
}) {
  try {
    await client.pulls.requestReviewers({
      owner: input.owner,
      repo: input.repo,
      pull_number: input.pull_number,
      reviewers: input.reviewers ?? [],
      team_reviewers: input.team_reviewers ?? [],
    });
    return { success: true, message: `Requested review on PR #${input.pull_number}` };
  } catch (err) {
    wrapGitHubError(err, 'requestReview');
  }
}

export async function submitReview(client: Octokit, input: {
  owner: string;
  repo: string;
  pull_number: number;
  event: string;
  body?: string;
}) {
  try {
    await client.pulls.createReview({
      owner: input.owner,
      repo: input.repo,
      pull_number: input.pull_number,
      event: input.event as 'APPROVE',
      body: input.body ?? '',
    });
    return { success: true, message: `Submitted ${input.event.toLowerCase()} review on PR #${input.pull_number}` };
  } catch (err) {
    wrapGitHubError(err, 'submitReview');
  }
}

export async function addPRComment(client: Octokit, input: {
  owner: string;
  repo: string;
  issue_number: number;
  body: string;
}) {
  try {
    const { data } = await client.issues.createComment({
      owner: input.owner,
      repo: input.repo,
      issue_number: input.issue_number,
      body: input.body,
    });
    return { success: true, message: `Added comment to PR #${input.issue_number}`, commentId: data.id, url: data.html_url };
  } catch (err) {
    wrapGitHubError(err, 'addPRComment');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Issues — Queries
// ─────────────────────────────────────────────────────────────────────────────

export async function listIssues(client: Octokit, input: {
  owner: string;
  repo: string;
  state?: string;
  labels?: string;
  assignee?: string;
  sort?: string;
  direction?: string;
  limit?: number;
}) {
  try {
    const { data } = await client.issues.listForRepo({
      owner: input.owner,
      repo: input.repo,
      state: (input.state ?? 'open') as 'open',
      sort: (input.sort ?? 'created') as 'created',
      direction: (input.direction ?? 'desc') as 'desc',
      per_page: input.limit ?? 30,
      ...(input.labels && { labels: input.labels }),
      ...(input.assignee && { assignee: input.assignee }),
    });
    // Filter out PRs (GitHub API returns PRs in issues endpoint)
    const issues = data.filter((i) => !i.pull_request);
    return {
      issues: issues.map((i) => ({
        number: i.number,
        title: i.title,
        state: i.state,
        owner: input.owner,
        repo: input.repo,
        author: i.user?.login,
        authorAvatar: i.user?.avatar_url,
        labels: mapLabels(i.labels),
        assignees: i.assignees?.map((a) => a.login) ?? [],
        commentCount: i.comments,
        createdAt: i.created_at,
        updatedAt: i.updated_at,
        url: i.html_url,
      })),
    };
  } catch (err) {
    wrapGitHubError(err, 'listIssues');
  }
}

export async function getIssue(client: Octokit, input: {
  owner: string;
  repo: string;
  issue_number: number;
}) {
  try {
    const { data: i } = await client.issues.get({
      owner: input.owner,
      repo: input.repo,
      issue_number: input.issue_number,
    });
    return {
      number: i.number,
      title: i.title,
      state: i.state,
      owner: input.owner,
      repo: input.repo,
      author: i.user?.login,
      authorAvatar: i.user?.avatar_url,
      body: i.body,
      labels: mapLabels(i.labels),
      assignees: i.assignees?.map((a) => a.login) ?? [],
      commentCount: i.comments,
      createdAt: i.created_at,
      updatedAt: i.updated_at,
      closedAt: i.closed_at,
      url: i.html_url,
    };
  } catch (err) {
    wrapGitHubError(err, 'getIssue');
  }
}

export async function searchIssues(client: Octokit, input: {
  query: string;
  limit?: number;
}) {
  try {
    const effectiveQuery = input.query.trim() || 'assignee:@me';
    const searchQuery = effectiveQuery.includes('is:issue') ? effectiveQuery : `is:issue ${effectiveQuery}`;
    const { data } = await client.search.issuesAndPullRequests({
      q: searchQuery,
      sort: 'updated',
      order: 'desc',
      per_page: input.limit ?? 30,
    });
    return {
      totalCount: data.total_count,
      issues: data.items.map((item) => {
        const { owner, repo } = parseRepoUrl(item.repository_url ?? '');
        return {
          number: item.number,
          title: item.title,
          state: item.state,
          author: item.user?.login,
          authorAvatar: item.user?.avatar_url,
          owner, repo,
          labels: mapLabels(item.labels),
          assignees: item.assignees?.map((a) => a.login) ?? [],
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          url: item.html_url,
        };
      }),
    };
  } catch (err) {
    wrapGitHubError(err, 'searchIssues');
  }
}

export async function listMyIssues(client: Octokit, input: {
  filter?: string;
  state?: string;
  limit?: number;
}) {
  try {
    const filterType = input.filter ?? 'assigned';
    const issueState = input.state ?? 'open';
    const maxResults = input.limit ?? 30;

    const { data: user } = await client.users.getAuthenticated();
    const username = user.login;

    let query = `is:issue is:${issueState}`;
    switch (filterType) {
      case 'assigned': query += ` assignee:${username}`; break;
      case 'created': query += ` author:${username}`; break;
      case 'mentioned': query += ` mentions:${username}`; break;
    }

    const { data } = await client.search.issuesAndPullRequests({
      q: query,
      sort: 'updated',
      order: 'desc',
      per_page: maxResults,
    });

    return {
      totalCount: data.total_count,
      issues: data.items.map((item) => {
        const { owner, repo } = parseRepoUrl(item.repository_url ?? '');
        return {
          number: item.number,
          title: item.title,
          state: item.state,
          author: item.user?.login,
          authorAvatar: item.user?.avatar_url,
          owner, repo,
          labels: mapLabels(item.labels),
          assignees: item.assignees?.map((a) => a.login) ?? [],
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          url: item.html_url,
        };
      }),
    };
  } catch (err) {
    wrapGitHubError(err, 'listMyIssues');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Issues — Mutations
// ─────────────────────────────────────────────────────────────────────────────

export async function createIssue(client: Octokit, input: {
  owner: string;
  repo: string;
  title: string;
  body?: string;
  labels?: string[];
  assignees?: string[];
}) {
  try {
    const { data: issue } = await client.issues.create({
      owner: input.owner,
      repo: input.repo,
      title: input.title,
      body: input.body ?? '',
      labels: input.labels ?? [],
      assignees: input.assignees ?? [],
    });
    return { success: true, message: `Created issue #${issue.number}: ${issue.title}`, number: issue.number, url: issue.html_url };
  } catch (err) {
    wrapGitHubError(err, 'createIssue');
  }
}

export async function updateIssue(client: Octokit, input: {
  owner: string;
  repo: string;
  issue_number: number;
  title?: string;
  body?: string;
  state?: string;
  labels?: string[];
  assignees?: string[];
}) {
  try {
    const { data: issue } = await client.issues.update({
      owner: input.owner,
      repo: input.repo,
      issue_number: input.issue_number,
      ...(input.title !== undefined && { title: input.title }),
      ...(input.body !== undefined && { body: input.body }),
      ...(input.state !== undefined && { state: input.state as 'open' | 'closed' }),
      ...(input.labels !== undefined && { labels: input.labels }),
      ...(input.assignees !== undefined && { assignees: input.assignees }),
    });
    return { success: true, message: `Updated issue #${issue.number}`, url: issue.html_url };
  } catch (err) {
    wrapGitHubError(err, 'updateIssue');
  }
}

export async function addIssueComment(client: Octokit, input: {
  owner: string;
  repo: string;
  issue_number: number;
  body: string;
}) {
  try {
    const { data } = await client.issues.createComment({
      owner: input.owner,
      repo: input.repo,
      issue_number: input.issue_number,
      body: input.body,
    });
    return { success: true, message: `Added comment to issue #${input.issue_number}`, commentId: data.id, url: data.html_url };
  } catch (err) {
    wrapGitHubError(err, 'addIssueComment');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Repository Metadata
// ─────────────────────────────────────────────────────────────────────────────

export async function listLabels(client: Octokit, input: {
  owner: string;
  repo: string;
}) {
  try {
    const { data } = await client.issues.listLabelsForRepo({
      owner: input.owner,
      repo: input.repo,
      per_page: 100,
    });
    return {
      labels: data.map((l) => ({
        name: l.name,
        color: l.color,
        description: l.description ?? null,
      })),
    };
  } catch (err) {
    wrapGitHubError(err, 'listLabels');
  }
}

export async function listCollaborators(client: Octokit, input: {
  owner: string;
  repo: string;
}) {
  try {
    const { data } = await client.repos.listCollaborators({
      owner: input.owner,
      repo: input.repo,
      per_page: 100,
    });
    return {
      collaborators: data.map((c) => ({
        login: c.login,
        avatarUrl: c.avatar_url,
      })),
    };
  } catch (err) {
    wrapGitHubError(err, 'listCollaborators');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow Runs
// ─────────────────────────────────────────────────────────────────────────────

export async function listWorkflowRuns(client: Octokit, input: {
  owner: string;
  repo: string;
  branch?: string;
  status?: string;
  limit?: number;
}) {
  try {
    const { data } = await client.actions.listWorkflowRunsForRepo({
      owner: input.owner,
      repo: input.repo,
      per_page: input.limit ?? 20,
      ...(input.branch && { branch: input.branch }),
      ...(input.status && { status: input.status as 'completed' }),
    });
    return {
      totalCount: data.total_count,
      runs: data.workflow_runs.map((run) => ({
        id: run.id,
        workflowName: run.name,
        status: run.status,
        conclusion: run.conclusion,
        branch: run.head_branch,
        event: run.event,
        headSha: run.head_sha?.slice(0, 7),
        actor: run.actor?.login,
        actorAvatar: run.actor?.avatar_url,
        runNumber: run.run_number,
        owner: input.owner,
        repo: input.repo,
        url: run.html_url,
        createdAt: run.created_at,
        updatedAt: run.updated_at,
      })),
    };
  } catch (err) {
    wrapGitHubError(err, 'listWorkflowRuns');
  }
}

export async function getWorkflowRun(client: Octokit, input: {
  owner: string;
  repo: string;
  run_id: number;
}) {
  try {
    const { data: run } = await client.actions.getWorkflowRun({
      owner: input.owner,
      repo: input.repo,
      run_id: input.run_id,
    });
    const { data: jobsData } = await client.actions.listJobsForWorkflowRun({
      owner: input.owner,
      repo: input.repo,
      run_id: input.run_id,
    });
    return {
      id: run.id,
      workflowName: run.name,
      status: run.status,
      conclusion: run.conclusion,
      branch: run.head_branch,
      event: run.event,
      headSha: run.head_sha?.slice(0, 7),
      actor: run.actor?.login,
      actorAvatar: run.actor?.avatar_url,
      runNumber: run.run_number,
      url: run.html_url,
      createdAt: run.created_at,
      updatedAt: run.updated_at,
      jobs: jobsData.jobs.map((j) => ({
        id: j.id,
        name: j.name,
        status: j.status,
        conclusion: j.conclusion,
        startedAt: j.started_at,
        completedAt: j.completed_at,
        steps: j.steps?.map((s) => ({
          name: s.name,
          status: s.status,
          conclusion: s.conclusion,
          number: s.number,
        })),
      })),
    };
  } catch (err) {
    wrapGitHubError(err, 'getWorkflowRun');
  }
}

export async function rerunWorkflow(client: Octokit, input: {
  owner: string;
  repo: string;
  run_id: number;
}) {
  try {
    await client.actions.reRunWorkflow({
      owner: input.owner,
      repo: input.repo,
      run_id: input.run_id,
    });
    return { success: true, message: `Re-run triggered for workflow run ${input.run_id}` };
  } catch (err) {
    wrapGitHubError(err, 'rerunWorkflow');
  }
}

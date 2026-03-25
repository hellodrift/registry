/**
 * GitHub integration GraphQL schema registration.
 *
 * Registers all GitHub-specific GraphQL types, queries, and mutations
 * on the Pothos builder. Called via the integration's `schema` callback
 * during plugin loading.
 *
 * @module plugin-github/schema
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// NOTE: Pothos builder types don't survive .d.ts boundaries. Builder callbacks
// use `any` by design. The eslint-disable above covers the type assertions.
import { GraphQLError } from 'graphql';
import { buildEntityURI } from '@tryvienna/sdk';
import type { BaseEntity } from '@tryvienna/sdk';
import { githubPREntity, githubIssueEntity, githubRepoEntity, githubWorkflowRunEntity } from './entities';
import { githubIntegration } from './integration';
import type { Octokit } from '@octokit/rest';
import * as api from './api';

// ─────────────────────────────────────────────────────────────────────────────
// Backing shapes — match what integration methods return
// ─────────────────────────────────────────────────────────────────────────────

export interface GitHubRepoShape {
  owner: string;
  name: string;
  fullName: string;
  description?: string | null;
  language?: string | null;
  private?: boolean;
  defaultBranch?: string;
  stargazersCount?: number;
  forksCount?: number;
  updatedAt?: string;
  url?: string;
}

export interface GitHubLabelShape {
  name: string;
  color: string;
}

export interface GitHubPRShape {
  number: number;
  title: string;
  state: string;
  draft?: boolean;
  author?: string;
  authorAvatar?: string;
  owner?: string;
  repo?: string;
  headBranch?: string;
  baseBranch?: string;
  body?: string | null;
  additions?: number;
  deletions?: number;
  changedFiles?: number;
  mergeable?: boolean | null;
  mergeableState?: string;
  reviewState?: string;
  checksStatus?: string;
  labels?: GitHubLabelShape[];
  reviewers?: string[];
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GitHubPRReviewShape {
  id: number;
  user?: string;
  state: string;
  body?: string;
  submittedAt?: string;
  url?: string;
}

export interface GitHubPRCommentShape {
  id: number;
  user?: string;
  userAvatar?: string;
  body?: string;
  createdAt?: string;
  updatedAt?: string;
  url?: string;
}

export interface GitHubPRFileShape {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export interface GitHubCheckRunShape {
  id: number;
  name: string;
  status: string;
  conclusion?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  url?: string | null;
}

export interface GitHubIssueShape {
  number: number;
  title: string;
  state: string;
  author?: string;
  authorAvatar?: string;
  owner?: string;
  repo?: string;
  body?: string | null;
  labels?: GitHubLabelShape[];
  assignees?: string[];
  commentCount?: number;
  createdAt?: string;
  updatedAt?: string;
  closedAt?: string | null;
  url?: string;
}

export interface GitHubCollaboratorShape {
  login: string;
  avatarUrl: string;
}

export interface GitHubWorkflowRunShape {
  id: number;
  workflowName?: string;
  status?: string;
  conclusion?: string | null;
  branch?: string;
  event?: string;
  headSha?: string;
  actor?: string;
  actorAvatar?: string;
  runNumber?: number;
  owner?: string;
  repo?: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GitHubWorkflowJobShape {
  id: number;
  name: string;
  status: string;
  conclusion?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  steps?: GitHubWorkflowStepShape[];
}

export interface GitHubWorkflowStepShape {
  name: string;
  status: string;
  conclusion?: string | null;
  number: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema registration
// ─────────────────────────────────────────────────────────────────────────────

async function getGitHubClient(ctx: any): Promise<Octokit> {
  const client = await ctx.getIntegrationClient?.('github');
  if (!client) {
    throw new GraphQLError('GitHub integration is not available. Connect GitHub in Settings.', {
      extensions: { code: 'INTEGRATION_NOT_AVAILABLE' },
    });
  }
  return client as Octokit;
}

export function registerGitHubSchema(rawBuilder: unknown): void {
  const builder = rawBuilder as any;

  // ── Types ─────────────────────────────────────────────────────────────────

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const GitHubRepoRef = builder.objectRef<GitHubRepoShape>('GitHubRepo');
  builder.objectType(GitHubRepoRef, {
    description: 'A GitHub repository',
    fields: (t) => ({
      id: t.id({ resolve: (r) => `${r.owner}/${r.name}` }),
      owner: t.exposeString('owner'),
      name: t.exposeString('name'),
      fullName: t.exposeString('fullName'),
      description: t.exposeString('description', { nullable: true }),
      language: t.exposeString('language', { nullable: true }),
      private: t.exposeBoolean('private', { nullable: true }),
      defaultBranch: t.exposeString('defaultBranch', { nullable: true }),
      stargazersCount: t.exposeInt('stargazersCount', { nullable: true }),
      forksCount: t.exposeInt('forksCount', { nullable: true }),
      updatedAt: t.exposeString('updatedAt', { nullable: true }),
      url: t.exposeString('url', { nullable: true }),
    }),
  });

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const GitHubLabelRef = builder.objectRef<GitHubLabelShape>('GitHubLabel');
  builder.objectType(GitHubLabelRef, {
    description: 'A GitHub label',
    fields: (t) => ({
      name: t.exposeString('name'),
      color: t.exposeString('color'),
    }),
  });

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const GitHubPRRef = builder.objectRef<GitHubPRShape>('GitHubPR');
  builder.objectType(GitHubPRRef, {
    description: 'A GitHub pull request',
    fields: (t) => ({
      id: t.id({ resolve: (pr) => `${pr.owner}/${pr.repo}#${pr.number}` }),
      number: t.exposeInt('number'),
      title: t.exposeString('title'),
      state: t.exposeString('state'),
      draft: t.exposeBoolean('draft', { nullable: true }),
      author: t.exposeString('author', { nullable: true }),
      authorAvatar: t.exposeString('authorAvatar', { nullable: true }),
      owner: t.exposeString('owner', { nullable: true }),
      repo: t.exposeString('repo', { nullable: true }),
      headBranch: t.exposeString('headBranch', { nullable: true }),
      baseBranch: t.exposeString('baseBranch', { nullable: true }),
      body: t.exposeString('body', { nullable: true }),
      additions: t.exposeInt('additions', { nullable: true }),
      deletions: t.exposeInt('deletions', { nullable: true }),
      changedFiles: t.exposeInt('changedFiles', { nullable: true }),
      mergeable: t.exposeBoolean('mergeable', { nullable: true }),
      mergeableState: t.exposeString('mergeableState', { nullable: true }),
      reviewState: t.exposeString('reviewState', { nullable: true }),
      checksStatus: t.exposeString('checksStatus', { nullable: true }),
      labels: t.field({ type: [GitHubLabelRef], nullable: true, resolve: (pr) => pr.labels ?? null }),
      reviewers: t.field({ type: ['String'], nullable: true, resolve: (pr) => pr.reviewers ?? null }),
      url: t.exposeString('url', { nullable: true }),
      createdAt: t.exposeString('createdAt', { nullable: true }),
      updatedAt: t.exposeString('updatedAt', { nullable: true }),
    }),
  });

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const GitHubPRReviewRef = builder.objectRef<GitHubPRReviewShape>('GitHubPRReview');
  builder.objectType(GitHubPRReviewRef, {
    description: 'A review on a GitHub pull request',
    fields: (t) => ({
      id: t.exposeInt('id'),
      user: t.exposeString('user', { nullable: true }),
      state: t.exposeString('state'),
      body: t.exposeString('body', { nullable: true }),
      submittedAt: t.exposeString('submittedAt', { nullable: true }),
      url: t.exposeString('url', { nullable: true }),
    }),
  });

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const GitHubPRCommentRef = builder.objectRef<GitHubPRCommentShape>('GitHubPRComment');
  builder.objectType(GitHubPRCommentRef, {
    description: 'A comment on a GitHub pull request',
    fields: (t) => ({
      id: t.exposeInt('id'),
      user: t.exposeString('user', { nullable: true }),
      userAvatar: t.exposeString('userAvatar', { nullable: true }),
      body: t.exposeString('body', { nullable: true }),
      createdAt: t.exposeString('createdAt', { nullable: true }),
      updatedAt: t.exposeString('updatedAt', { nullable: true }),
      url: t.exposeString('url', { nullable: true }),
    }),
  });

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const GitHubPRFileRef = builder.objectRef<GitHubPRFileShape>('GitHubPRFile');
  builder.objectType(GitHubPRFileRef, {
    description: 'A file changed in a GitHub pull request',
    fields: (t) => ({
      filename: t.exposeString('filename'),
      status: t.exposeString('status'),
      additions: t.exposeInt('additions'),
      deletions: t.exposeInt('deletions'),
      changes: t.exposeInt('changes'),
      patch: t.exposeString('patch', { nullable: true }),
    }),
  });

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const GitHubCheckRunRef = builder.objectRef<GitHubCheckRunShape>('GitHubCheckRun');
  builder.objectType(GitHubCheckRunRef, {
    description: 'A CI check run on a GitHub ref',
    fields: (t) => ({
      id: t.exposeInt('id'),
      name: t.exposeString('name'),
      status: t.exposeString('status'),
      conclusion: t.exposeString('conclusion', { nullable: true }),
      startedAt: t.exposeString('startedAt', { nullable: true }),
      completedAt: t.exposeString('completedAt', { nullable: true }),
      url: t.exposeString('url', { nullable: true }),
    }),
  });

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const GitHubIssueRef = builder.objectRef<GitHubIssueShape>('GitHubIssue');
  builder.objectType(GitHubIssueRef, {
    description: 'A GitHub issue',
    fields: (t) => ({
      id: t.id({ resolve: (i) => `${i.owner}/${i.repo}#${i.number}` }),
      number: t.exposeInt('number'),
      title: t.exposeString('title'),
      state: t.exposeString('state'),
      author: t.exposeString('author', { nullable: true }),
      authorAvatar: t.exposeString('authorAvatar', { nullable: true }),
      owner: t.exposeString('owner', { nullable: true }),
      repo: t.exposeString('repo', { nullable: true }),
      body: t.exposeString('body', { nullable: true }),
      labels: t.field({ type: [GitHubLabelRef], nullable: true, resolve: (i) => i.labels ?? null }),
      assignees: t.field({ type: ['String'], nullable: true, resolve: (i) => i.assignees ?? null }),
      commentCount: t.exposeInt('commentCount', { nullable: true }),
      createdAt: t.exposeString('createdAt', { nullable: true }),
      updatedAt: t.exposeString('updatedAt', { nullable: true }),
      closedAt: t.exposeString('closedAt', { nullable: true }),
      url: t.exposeString('url', { nullable: true }),
    }),
  });

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const GitHubWorkflowStepRef = builder.objectRef<GitHubWorkflowStepShape>('GitHubWorkflowStep');
  builder.objectType(GitHubWorkflowStepRef, {
    description: 'A step within a workflow job',
    fields: (t) => ({
      name: t.exposeString('name'),
      status: t.exposeString('status'),
      conclusion: t.exposeString('conclusion', { nullable: true }),
      number: t.exposeInt('number'),
    }),
  });

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const GitHubWorkflowJobRef = builder.objectRef<GitHubWorkflowJobShape>('GitHubWorkflowJob');
  builder.objectType(GitHubWorkflowJobRef, {
    description: 'A job within a workflow run',
    fields: (t) => ({
      id: t.exposeInt('id'),
      name: t.exposeString('name'),
      status: t.exposeString('status'),
      conclusion: t.exposeString('conclusion', { nullable: true }),
      startedAt: t.exposeString('startedAt', { nullable: true }),
      completedAt: t.exposeString('completedAt', { nullable: true }),
      steps: t.field({ type: [GitHubWorkflowStepRef], nullable: true, resolve: (j) => j.steps ?? null }),
    }),
  });

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const GitHubWorkflowRunRef = builder.objectRef<GitHubWorkflowRunShape>('GitHubWorkflowRun');
  builder.objectType(GitHubWorkflowRunRef, {
    description: 'A GitHub Actions workflow run',
    fields: (t) => ({
      id: t.id({ resolve: (run) => `${run.owner}/${run.repo}#${run.id}` }),
      runId: t.exposeInt('id'),
      workflowName: t.exposeString('workflowName', { nullable: true }),
      status: t.exposeString('status', { nullable: true }),
      conclusion: t.exposeString('conclusion', { nullable: true }),
      branch: t.exposeString('branch', { nullable: true }),
      event: t.exposeString('event', { nullable: true }),
      headSha: t.exposeString('headSha', { nullable: true }),
      actor: t.exposeString('actor', { nullable: true }),
      actorAvatar: t.exposeString('actorAvatar', { nullable: true }),
      runNumber: t.exposeInt('runNumber', { nullable: true }),
      owner: t.exposeString('owner', { nullable: true }),
      repo: t.exposeString('repo', { nullable: true }),
      url: t.exposeString('url', { nullable: true }),
      createdAt: t.exposeString('createdAt', { nullable: true }),
      updatedAt: t.exposeString('updatedAt', { nullable: true }),
    }),
  });

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const GitHubCollaboratorRef = builder.objectRef<GitHubCollaboratorShape>('GitHubCollaborator');
  builder.objectType(GitHubCollaboratorRef, {
    description: 'A GitHub repository collaborator',
    fields: (t) => ({
      login: t.exposeString('login'),
      avatarUrl: t.exposeString('avatarUrl'),
    }),
  });

  // ── Queries ───────────────────────────────────────────────────────────────

  builder.queryFields((t) => ({
    githubRepos: t.field({
      type: [GitHubRepoRef],
      description: 'List repositories for the authenticated GitHub user',
      args: {
        type: t.arg.string({ description: 'Filter: owner, all, member' }),
        sort: t.arg.string({ description: 'Sort: created, updated, pushed, full_name' }),
        limit: t.arg.int({ defaultValue: 30 }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        const result = await api.listRepos(client, {
          type: args.type ?? undefined,
          sort: args.sort ?? undefined,
          limit: args.limit ?? 30,
        });
        return result.repos;
      },
    }),

    githubPR: t.field({
      type: GitHubPRRef,
      nullable: true,
      description: 'Get a single GitHub pull request',
      args: {
        owner: t.arg.string({ required: true }),
        repo: t.arg.string({ required: true }),
        pullNumber: t.arg.int({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        const result = await api.getPR(client, {
          owner: args.owner, repo: args.repo, pull_number: args.pullNumber,
        });
        return { ...result, owner: args.owner, repo: args.repo };
      },
    }),

    githubPRs: t.field({
      type: [GitHubPRRef],
      description: 'List pull requests for a specific repository (requires owner+repo). Use searchGithubPRs or githubMyPRs for cross-repo search.',
      args: {
        owner: t.arg.string({ required: true }),
        repo: t.arg.string({ required: true }),
        state: t.arg.string({ description: 'Filter: "open" (default), "closed", or "all"' }),
        limit: t.arg.int({ defaultValue: 30 }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        const result = await api.listPRs(client, {
          owner: args.owner, repo: args.repo,
          state: args.state ?? undefined,
          limit: args.limit ?? 30,
        });
        return result.prs.map((pr) => ({ ...pr, owner: args.owner, repo: args.repo }));
      },
    }),

    githubMyPRs: t.field({
      type: [GitHubPRRef],
      description: 'List pull requests related to the authenticated user (no owner/repo needed)',
      args: {
        filter: t.arg.string({ description: 'Filter: "authored" (default), "review_requested", "mentioned", or "assigned"' }),
        state: t.arg.string({ description: 'Filter: "open" (default) or "closed"' }),
        limit: t.arg.int({ defaultValue: 30 }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        const result = await api.listMyPRs(client, {
          filter: args.filter ?? undefined,
          state: args.state ?? undefined,
          limit: args.limit ?? 30,
        });
        return result.prs;
      },
    }),

    githubPRReviews: t.field({
      type: [GitHubPRReviewRef],
      description: 'List reviews on a pull request',
      args: {
        owner: t.arg.string({ required: true }),
        repo: t.arg.string({ required: true }),
        pullNumber: t.arg.int({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        const result = await api.listPRReviews(client, {
          owner: args.owner, repo: args.repo, pull_number: args.pullNumber,
        });
        return result.reviews;
      },
    }),

    githubPRComments: t.field({
      type: [GitHubPRCommentRef],
      description: 'List comments on a pull request',
      args: {
        owner: t.arg.string({ required: true }),
        repo: t.arg.string({ required: true }),
        pullNumber: t.arg.int({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        const result = await api.listPRComments(client, {
          owner: args.owner, repo: args.repo, pull_number: args.pullNumber,
        });
        return result.comments;
      },
    }),

    githubPRFiles: t.field({
      type: [GitHubPRFileRef],
      description: 'List files changed in a pull request',
      args: {
        owner: t.arg.string({ required: true }),
        repo: t.arg.string({ required: true }),
        pullNumber: t.arg.int({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        const result = await api.getPRFiles(client, {
          owner: args.owner, repo: args.repo, pull_number: args.pullNumber,
        });
        return result.files;
      },
    }),

    githubCheckRuns: t.field({
      type: [GitHubCheckRunRef],
      description: 'Get CI check runs for a git ref',
      args: {
        owner: t.arg.string({ required: true }),
        repo: t.arg.string({ required: true }),
        ref: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        const result = await api.getPRChecks(client, {
          owner: args.owner, repo: args.repo, ref: args.ref,
        });
        return result.checkRuns;
      },
    }),

    githubIssue: t.field({
      type: GitHubIssueRef,
      nullable: true,
      description: 'Get a single GitHub issue',
      args: {
        owner: t.arg.string({ required: true }),
        repo: t.arg.string({ required: true }),
        issueNumber: t.arg.int({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        return api.getIssue(client, {
          owner: args.owner, repo: args.repo, issue_number: args.issueNumber,
        });
      },
    }),

    githubIssues: t.field({
      type: [GitHubIssueRef],
      description: 'List issues for a specific repository (requires owner+repo). Defaults to open. Use searchGithubIssues for cross-repo or advanced search.',
      args: {
        owner: t.arg.string({ required: true }),
        repo: t.arg.string({ required: true }),
        state: t.arg.string({ description: 'Filter: "open" (default), "closed", or "all"' }),
        labels: t.arg.string({ description: 'Comma-separated label names' }),
        assignee: t.arg.string({ description: 'Filter by assignee username' }),
        limit: t.arg.int({ defaultValue: 30 }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        const result = await api.listIssues(client, {
          owner: args.owner, repo: args.repo,
          state: args.state ?? undefined,
          labels: args.labels ?? undefined,
          assignee: args.assignee ?? undefined,
          limit: args.limit ?? 30,
        });
        return result.issues;
      },
    }),

    githubWorkflowRuns: t.field({
      type: [GitHubWorkflowRunRef],
      description: 'List workflow runs for a repository',
      args: {
        owner: t.arg.string({ required: true }),
        repo: t.arg.string({ required: true }),
        branch: t.arg.string({ description: 'Filter by branch' }),
        status: t.arg.string({ description: 'Filter by status' }),
        limit: t.arg.int({ defaultValue: 20 }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        const result = await api.listWorkflowRuns(client, {
          owner: args.owner, repo: args.repo,
          branch: args.branch ?? undefined,
          status: args.status ?? undefined,
          limit: args.limit ?? 20,
        });
        return result.runs;
      },
    }),

    githubWorkflowRun: t.field({
      type: GitHubWorkflowRunRef,
      nullable: true,
      description: 'Get a single workflow run with jobs',
      args: {
        owner: t.arg.string({ required: true }),
        repo: t.arg.string({ required: true }),
        runId: t.arg.int({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        const result = await api.getWorkflowRun(client, {
          owner: args.owner, repo: args.repo, run_id: args.runId,
        });
        return { ...result, owner: args.owner, repo: args.repo };
      },
    }),

    searchGithubPRs: t.field({
      type: [GitHubPRRef],
      description: 'Search pull requests across all repos using GitHub search syntax (e.g. "repo:owner/name state:open")',
      args: {
        query: t.arg.string({ required: true, description: 'GitHub search query (e.g. "repo:owner/name state:closed author:user")' }),
        limit: t.arg.int({ defaultValue: 30 }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        const result = await api.searchPRs(client, {
          query: args.query,
          limit: args.limit ?? 30,
        });
        return result.prs;
      },
    }),

    searchGithubIssues: t.field({
      type: [GitHubIssueRef],
      description: 'Search issues across all repos using GitHub search syntax (e.g. "repo:owner/name state:closed"). Best for finding issues by state, label, or across repos.',
      args: {
        query: t.arg.string({ required: true, description: 'GitHub search query (e.g. "repo:owner/name state:closed label:bug")' }),
        limit: t.arg.int({ defaultValue: 30 }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        const result = await api.searchIssues(client, {
          query: args.query,
          limit: args.limit ?? 30,
        });
        return result.issues;
      },
    }),

    githubMyIssues: t.field({
      type: [GitHubIssueRef],
      description: 'List issues related to the authenticated user across all repos (no owner/repo needed). Best starting point for "my issues".',
      args: {
        filter: t.arg.string({ description: 'Filter: "assigned" (default), "created", or "mentioned"' }),
        state: t.arg.string({ description: 'Filter: "open" (default), "closed", or "all"' }),
        limit: t.arg.int({ defaultValue: 30 }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        const result = await api.listMyIssues(client, {
          filter: args.filter ?? undefined,
          state: args.state ?? undefined,
          limit: args.limit ?? 30,
        });
        return result.issues;
      },
    }),

    githubRepoLabels: t.field({
      type: [GitHubLabelRef],
      description: 'List all labels for a repository',
      args: {
        owner: t.arg.string({ required: true }),
        repo: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        const result = await api.listLabels(client, {
          owner: args.owner, repo: args.repo,
        });
        return result.labels;
      },
    }),

    githubRepoCollaborators: t.field({
      type: [GitHubCollaboratorRef],
      description: 'List collaborators for a repository',
      args: {
        owner: t.arg.string({ required: true }),
        repo: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        const result = await api.listCollaborators(client, {
          owner: args.owner, repo: args.repo,
        });
        return result.collaborators;
      },
    }),
  }));

  // ── Input types ───────────────────────────────────────────────────────────

  const CreateGitHubPRInput = builder.inputType('CreateGitHubPRInput', {
    fields: (t) => ({
      owner: t.string({ required: true }),
      repo: t.string({ required: true }),
      title: t.string({ required: true }),
      head: t.string({ required: true, description: 'Branch containing changes' }),
      base: t.string({ required: true, description: 'Branch to merge into' }),
      body: t.string({ description: 'PR description (markdown)' }),
      draft: t.boolean({ description: 'Create as draft PR' }),
    }),
  });

  const CreateGitHubIssueInput = builder.inputType('CreateGitHubIssueInput', {
    fields: (t) => ({
      owner: t.string({ required: true }),
      repo: t.string({ required: true }),
      title: t.string({ required: true }),
      body: t.string({ description: 'Issue body (markdown)' }),
      labels: t.stringList({ description: 'Label names' }),
      assignees: t.stringList({ description: 'Assignee usernames' }),
    }),
  });

  const MergePRInput = builder.inputType('MergePRInput', {
    fields: (t) => ({
      owner: t.string({ required: true }),
      repo: t.string({ required: true }),
      pullNumber: t.int({ required: true }),
      mergeMethod: t.string({ description: 'merge (default), squash, or rebase' }),
    }),
  });

  const UpdateGitHubPRInput = builder.inputType('UpdateGitHubPRInput', {
    fields: (t) => ({
      owner: t.string({ required: true }),
      repo: t.string({ required: true }),
      pullNumber: t.int({ required: true }),
      title: t.string(),
      body: t.string(),
      state: t.string({ description: '"open" or "closed"' }),
    }),
  });

  const RequestReviewInput = builder.inputType('RequestReviewInput', {
    fields: (t) => ({
      owner: t.string({ required: true }),
      repo: t.string({ required: true }),
      pullNumber: t.int({ required: true }),
      reviewers: t.stringList({ description: 'GitHub usernames' }),
      teamReviewers: t.stringList({ description: 'Team slugs' }),
    }),
  });

  const SubmitReviewInput = builder.inputType('SubmitReviewInput', {
    fields: (t) => ({
      owner: t.string({ required: true }),
      repo: t.string({ required: true }),
      pullNumber: t.int({ required: true }),
      event: t.string({ required: true, description: 'APPROVE, REQUEST_CHANGES, or COMMENT' }),
      body: t.string(),
    }),
  });

  const AddPRCommentInput = builder.inputType('AddPRCommentInput', {
    fields: (t) => ({
      owner: t.string({ required: true }),
      repo: t.string({ required: true }),
      pullNumber: t.int({ required: true }),
      body: t.string({ required: true }),
    }),
  });

  const UpdateGitHubIssueInput = builder.inputType('UpdateGitHubIssueInput', {
    fields: (t) => ({
      owner: t.string({ required: true }),
      repo: t.string({ required: true }),
      issueNumber: t.int({ required: true }),
      title: t.string(),
      body: t.string(),
      state: t.string({ description: '"open" or "closed"' }),
      labels: t.stringList(),
      assignees: t.stringList(),
    }),
  });

  const AddIssueCommentInput = builder.inputType('AddIssueCommentInput', {
    fields: (t) => ({
      owner: t.string({ required: true }),
      repo: t.string({ required: true }),
      issueNumber: t.int({ required: true }),
      body: t.string({ required: true }),
    }),
  });

  const RerunWorkflowInput = builder.inputType('RerunWorkflowInput', {
    fields: (t) => ({
      owner: t.string({ required: true }),
      repo: t.string({ required: true }),
      runId: t.int({ required: true }),
    }),
  });

  // ── Mutation Helpers ─────────────────────────────────────────────────────
  // get_pr doesn't return owner/repo — inject from mutation input args
  // so Apollo can normalize the returned entity in the cache.

  async function refetchPR(ctx: any, owner: string, repo: string, pullNumber: number) {
    const client = await getGitHubClient(ctx);
    const pr = await api.getPR(client, { owner, repo, pull_number: pullNumber });
    return { ...pr, owner, repo };
  }

  async function refetchWorkflowRun(ctx: any, owner: string, repo: string, runId: number) {
    const client = await getGitHubClient(ctx);
    const run = await api.getWorkflowRun(client, { owner, repo, run_id: runId });
    return { ...run, owner, repo };
  }

  // ── Mutations ─────────────────────────────────────────────────────────────

  builder.mutationFields((t) => ({
    githubCreatePR: t.field({
      type: GitHubPRRef,
      nullable: true,
      description: 'Create a new pull request',
      args: { input: t.arg({ type: CreateGitHubPRInput, required: true }) },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        const result = await api.createPR(client, {
          owner: args.input.owner,
          repo: args.input.repo,
          title: args.input.title,
          head: args.input.head,
          base: args.input.base,
          body: args.input.body ?? undefined,
          draft: args.input.draft ?? undefined,
        });
        if (!result.success) return null;
        return refetchPR(ctx, args.input.owner, args.input.repo, result.number);
      },
    }),

    githubMergePR: t.field({
      type: GitHubPRRef,
      nullable: true,
      description: 'Merge a pull request. Returns the merged PR.',
      args: { input: t.arg({ type: MergePRInput, required: true }) },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        const result = await api.mergePR(client, {
          owner: args.input.owner, repo: args.input.repo,
          pull_number: args.input.pullNumber,
          merge_method: args.input.mergeMethod ?? 'merge',
        });
        if (!result.success) return null;
        return refetchPR(ctx, args.input.owner, args.input.repo, args.input.pullNumber);
      },
    }),

    githubUpdatePR: t.field({
      type: GitHubPRRef,
      nullable: true,
      description: 'Update a pull request. Returns the updated PR.',
      args: { input: t.arg({ type: UpdateGitHubPRInput, required: true }) },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        await api.updatePR(client, {
          owner: args.input.owner, repo: args.input.repo,
          pull_number: args.input.pullNumber,
          title: args.input.title ?? undefined,
          body: args.input.body ?? undefined,
          state: args.input.state ?? undefined,
        });
        return refetchPR(ctx, args.input.owner, args.input.repo, args.input.pullNumber);
      },
    }),

    githubRequestReview: t.field({
      type: GitHubPRRef,
      nullable: true,
      description: 'Request review on a pull request. Returns the PR.',
      args: { input: t.arg({ type: RequestReviewInput, required: true }) },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        await api.requestReview(client, {
          owner: args.input.owner, repo: args.input.repo,
          pull_number: args.input.pullNumber,
          reviewers: args.input.reviewers ?? undefined,
          team_reviewers: args.input.teamReviewers ?? undefined,
        });
        return refetchPR(ctx, args.input.owner, args.input.repo, args.input.pullNumber);
      },
    }),

    githubSubmitReview: t.field({
      type: GitHubPRRef,
      nullable: true,
      description: 'Submit a review on a pull request. Returns the PR.',
      args: { input: t.arg({ type: SubmitReviewInput, required: true }) },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        await api.submitReview(client, {
          owner: args.input.owner, repo: args.input.repo,
          pull_number: args.input.pullNumber,
          event: args.input.event,
          body: args.input.body ?? undefined,
        });
        return refetchPR(ctx, args.input.owner, args.input.repo, args.input.pullNumber);
      },
    }),

    githubAddPRComment: t.field({
      type: GitHubPRRef,
      nullable: true,
      description: 'Add a comment to a pull request. Returns the PR.',
      args: { input: t.arg({ type: AddPRCommentInput, required: true }) },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        await api.addPRComment(client, {
          owner: args.input.owner, repo: args.input.repo,
          issue_number: args.input.pullNumber,
          body: args.input.body,
        });
        return refetchPR(ctx, args.input.owner, args.input.repo, args.input.pullNumber);
      },
    }),

    githubCreateIssue: t.field({
      type: GitHubIssueRef,
      nullable: true,
      description: 'Create a new GitHub issue',
      args: { input: t.arg({ type: CreateGitHubIssueInput, required: true }) },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        const result = await api.createIssue(client, {
          owner: args.input.owner,
          repo: args.input.repo,
          title: args.input.title,
          body: args.input.body ?? undefined,
          labels: args.input.labels ?? undefined,
          assignees: args.input.assignees ?? undefined,
        });
        if (!result.success) return null;
        return api.getIssue(client, {
          owner: args.input.owner,
          repo: args.input.repo,
          issue_number: result.number,
        });
      },
    }),

    githubUpdateIssue: t.field({
      type: GitHubIssueRef,
      nullable: true,
      description: 'Update a GitHub issue. Returns the updated issue.',
      args: { input: t.arg({ type: UpdateGitHubIssueInput, required: true }) },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        await api.updateIssue(client, {
          owner: args.input.owner, repo: args.input.repo,
          issue_number: args.input.issueNumber,
          title: args.input.title ?? undefined,
          body: args.input.body ?? undefined,
          state: args.input.state ?? undefined,
          labels: args.input.labels ?? undefined,
          assignees: args.input.assignees ?? undefined,
        });
        return api.getIssue(client, {
          owner: args.input.owner, repo: args.input.repo,
          issue_number: args.input.issueNumber,
        });
      },
    }),

    githubAddIssueComment: t.field({
      type: GitHubIssueRef,
      nullable: true,
      description: 'Add a comment to a GitHub issue. Returns the issue.',
      args: { input: t.arg({ type: AddIssueCommentInput, required: true }) },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        await api.addIssueComment(client, {
          owner: args.input.owner, repo: args.input.repo,
          issue_number: args.input.issueNumber,
          body: args.input.body,
        });
        return api.getIssue(client, {
          owner: args.input.owner, repo: args.input.repo,
          issue_number: args.input.issueNumber,
        });
      },
    }),

    githubRerunWorkflow: t.field({
      type: GitHubWorkflowRunRef,
      nullable: true,
      description: 'Re-run a GitHub Actions workflow. Returns the workflow run.',
      args: { input: t.arg({ type: RerunWorkflowInput, required: true }) },
      resolve: async (_root, args, ctx) => {
        const client = await getGitHubClient(ctx);
        await api.rerunWorkflow(client, {
          owner: args.input.owner, repo: args.input.repo,
          run_id: args.input.runId,
        });
        return refetchWorkflowRun(ctx, args.input.owner, args.input.repo, args.input.runId);
      },
    }),
  }));

  // ── Entity Handler Registration ──────────────────────────────────────────
  // Register resolve/search/resolveContext handlers so the EntityRegistry
  // can route generic MCP entity operations to GitHub data.

  const prUriPath = { segments: ['owner', 'repo', 'number'] as const };
  const issueUriPath = { segments: ['owner', 'repo', 'number'] as const };
  const repoUriPath = { segments: ['owner', 'name'] as const };
  const workflowRunUriPath = { segments: ['owner', 'repo', 'runId'] as const };

  builder.registerEntityHandlers(githubPREntity, {
    integrations: { github: githubIntegration },
    resolve: async (id, ctx) => {
      const client = ctx.integrations.github.client as Octokit;
      if (!client) return null;
      const pr = await api.getPR(client, {
        owner: id['owner'], repo: id['repo'], pull_number: Number(id['number']),
      }) as GitHubPRShape | null;
      if (!pr) return null;
      return {
        id: `${id['owner']}/${id['repo']}/${id['number']}`,
        type: 'github_pr',
        uri: buildEntityURI('github_pr', id, prUriPath),
        title: pr.title,
        description: `#${pr.number} in ${id['owner']}/${id['repo']}`,
        createdAt: pr.createdAt ? new Date(pr.createdAt).getTime() : undefined,
        updatedAt: pr.updatedAt ? new Date(pr.updatedAt).getTime() : undefined,
      } as BaseEntity;
    },
    search: async (query, ctx) => {
      const client = ctx.integrations.github.client as Octokit;
      if (!client) return [];
      const results = (await api.searchPRs(client, {
        query: query.query || '', limit: query.limit ?? 20,
      })).prs as GitHubPRShape[];
      return (results ?? []).map((pr) => ({
        id: `${pr.owner}/${pr.repo}/${pr.number}`,
        type: 'github_pr',
        uri: buildEntityURI('github_pr', {
          owner: pr.owner ?? '', repo: pr.repo ?? '', number: String(pr.number),
        }, prUriPath),
        title: pr.title,
        description: `#${pr.number} in ${pr.owner}/${pr.repo}`,
        createdAt: pr.createdAt ? new Date(pr.createdAt).getTime() : undefined,
        updatedAt: pr.updatedAt ? new Date(pr.updatedAt).getTime() : undefined,
      } as BaseEntity));
    },
    resolveContext: async (entity) => {
      return `### GitHub PR: ${entity.title}\n- **URI:** ${entity.uri}`;
    },
  });

  builder.registerEntityHandlers(githubIssueEntity, {
    integrations: { github: githubIntegration },
    resolve: async (id, ctx) => {
      const client = ctx.integrations.github.client as Octokit;
      if (!client) return null;
      const issue = await api.getIssue(client, {
        owner: id['owner'], repo: id['repo'], issue_number: Number(id['number']),
      }) as GitHubIssueShape | null;
      if (!issue) return null;
      return {
        id: `${id['owner']}/${id['repo']}/${id['number']}`,
        type: 'github_issue',
        uri: buildEntityURI('github_issue', id, issueUriPath),
        title: issue.title,
        description: `#${issue.number} in ${id['owner']}/${id['repo']}`,
        createdAt: issue.createdAt ? new Date(issue.createdAt).getTime() : undefined,
        updatedAt: issue.updatedAt ? new Date(issue.updatedAt).getTime() : undefined,
      } as BaseEntity;
    },
    search: async (query, ctx) => {
      const client = ctx.integrations.github.client as Octokit;
      if (!client) return [];
      const results = (await api.searchIssues(client, {
        query: query.query || '', limit: query.limit ?? 20,
      })).issues as GitHubIssueShape[];
      return (results ?? []).map((issue) => ({
        id: `${issue.owner}/${issue.repo}/${issue.number}`,
        type: 'github_issue',
        uri: buildEntityURI('github_issue', {
          owner: issue.owner ?? '', repo: issue.repo ?? '', number: String(issue.number),
        }, issueUriPath),
        title: issue.title,
        description: `#${issue.number} in ${issue.owner}/${issue.repo}`,
        createdAt: issue.createdAt ? new Date(issue.createdAt).getTime() : undefined,
        updatedAt: issue.updatedAt ? new Date(issue.updatedAt).getTime() : undefined,
      } as BaseEntity));
    },
  });

  builder.registerEntityHandlers(githubRepoEntity, {
    integrations: { github: githubIntegration },
    resolve: async (id, ctx) => {
      const client = ctx.integrations.github.client as Octokit;
      if (!client) return null;
      const repo = await api.getRepo(client, {
        owner: id['owner'], repo: id['name'],
      }) as GitHubRepoShape | null;
      if (!repo) return null;
      return {
        id: repo.fullName,
        type: 'github_repo',
        uri: buildEntityURI('github_repo', id, repoUriPath),
        title: repo.fullName,
        description: repo.description ?? undefined,
        updatedAt: repo.updatedAt ? new Date(repo.updatedAt).getTime() : undefined,
      } as BaseEntity;
    },
    search: async (query, ctx) => {
      const client = ctx.integrations.github.client as Octokit;
      if (!client) return [];
      const results = (await api.listRepos(client, {
        limit: query.limit ?? 20,
      })).repos as GitHubRepoShape[];
      let filtered = results ?? [];
      if (query.query) {
        const q = query.query.toLowerCase();
        filtered = filtered.filter((r) =>
          r.fullName.toLowerCase().includes(q) ||
          (r.description?.toLowerCase().includes(q) ?? false),
        );
      }
      return filtered.map((repo) => ({
        id: repo.fullName,
        type: 'github_repo',
        uri: buildEntityURI('github_repo', { owner: repo.owner, name: repo.name }, repoUriPath),
        title: repo.fullName,
        description: repo.description ?? undefined,
        updatedAt: repo.updatedAt ? new Date(repo.updatedAt).getTime() : undefined,
      } as BaseEntity));
    },
  });

  builder.registerEntityHandlers(githubWorkflowRunEntity, {
    integrations: { github: githubIntegration },
    resolve: async (id, ctx) => {
      const client = ctx.integrations.github.client as Octokit;
      if (!client) return null;
      const run = await api.getWorkflowRun(client, {
        owner: id['owner'], repo: id['repo'], run_id: Number(id['runId']),
      }) as GitHubWorkflowRunShape | null;
      if (!run) return null;
      return {
        id: `${id['owner']}/${id['repo']}/${id['runId']}`,
        type: 'github_workflow_run',
        uri: buildEntityURI('github_workflow_run', id, workflowRunUriPath),
        title: run.workflowName ?? `Run #${run.runNumber ?? id['runId']}`,
        description: `${run.status ?? 'unknown'} — ${run.conclusion ?? 'in progress'}`,
        createdAt: run.createdAt ? new Date(run.createdAt).getTime() : undefined,
        updatedAt: run.updatedAt ? new Date(run.updatedAt).getTime() : undefined,
      } as BaseEntity;
    },
    search: async (query, ctx) => {
      // Workflow runs need owner/repo — extract from query or return empty
      const parts = (query.query ?? '').split('/');
      if (parts.length < 2) return [];
      const [owner, repo] = parts;
      const client = ctx.integrations.github.client as Octokit;
      if (!client) return [];
      const results = (await api.listWorkflowRuns(client, {
        owner, repo, limit: query.limit ?? 20,
      })).runs as GitHubWorkflowRunShape[];
      return (results ?? []).map((run) => ({
        id: `${owner}/${repo}/${run.id}`,
        type: 'github_workflow_run',
        uri: buildEntityURI('github_workflow_run', {
          owner: owner!, repo: repo!, runId: String(run.id),
        }, workflowRunUriPath),
        title: run.workflowName ?? `Run #${run.runNumber ?? run.id}`,
        description: `${run.status ?? 'unknown'} — ${run.conclusion ?? 'in progress'}`,
        createdAt: run.createdAt ? new Date(run.createdAt).getTime() : undefined,
        updatedAt: run.updatedAt ? new Date(run.updatedAt).getTime() : undefined,
      } as BaseEntity));
    },
  });
}

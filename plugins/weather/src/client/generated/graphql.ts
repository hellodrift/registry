/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** ISO 8601 date-time string or unix timestamp (ms) */
  DateTime: { input: string | number; output: string | number; }
  /** Arbitrary JSON value */
  JSON: { input: Record<string, unknown>; output: Record<string, unknown>; }
};

export type ActivateSkillPayload = {
  __typename?: 'ActivateSkillPayload';
  body?: Maybe<Scalars['String']['output']>;
};

export type AddGroupDirectoryPayload = {
  __typename?: 'AddGroupDirectoryPayload';
  group?: Maybe<WorkstreamGroup>;
};

export type AddIssueCommentInput = {
  body: Scalars['String']['input'];
  issueNumber: Scalars['Int']['input'];
  owner: Scalars['String']['input'];
  repo: Scalars['String']['input'];
};

export type AddPrCommentInput = {
  body: Scalars['String']['input'];
  owner: Scalars['String']['input'];
  pullNumber: Scalars['Int']['input'];
  repo: Scalars['String']['input'];
};

export type AddProjectDirectoryPayload = {
  __typename?: 'AddProjectDirectoryPayload';
  directory?: Maybe<ProjectDirectory>;
  project?: Maybe<Project>;
};

export type AddRegistryInput = {
  name: Scalars['String']['input'];
  priority?: InputMaybe<Scalars['Int']['input']>;
  url: Scalars['String']['input'];
};

export type AddRegistryPayload = {
  __typename?: 'AddRegistryPayload';
  registry?: Maybe<Registry>;
};

export type AddWorkstreamDirectoryPayload = {
  __typename?: 'AddWorkstreamDirectoryPayload';
  workstream?: Maybe<Workstream>;
};

export type AddWorkstreamToGroupPayload = {
  __typename?: 'AddWorkstreamToGroupPayload';
  workstream?: Maybe<Workstream>;
};

/** Advanced/developer settings */
export type AdvancedSettings = {
  __typename?: 'AdvancedSettings';
  debugMode?: Maybe<Scalars['Boolean']['output']>;
  developerMode?: Maybe<Scalars['Boolean']['output']>;
  profilerEnabled?: Maybe<Scalars['Boolean']['output']>;
  reactScanEnabled?: Maybe<Scalars['Boolean']['output']>;
  telemetryEnabled?: Maybe<Scalars['Boolean']['output']>;
};

/** AI and model settings */
export type AiSettings = {
  __typename?: 'AiSettings';
  autoCompactPercent?: Maybe<Scalars['Int']['output']>;
  cliPath?: Maybe<Scalars['String']['output']>;
  cliSetupComplete?: Maybe<Scalars['Boolean']['output']>;
  defaultModel?: Maybe<Scalars['String']['output']>;
};

/** UI appearance settings */
export type AppearanceSettings = {
  __typename?: 'AppearanceSettings';
  compactMode?: Maybe<Scalars['Boolean']['output']>;
  fontSize?: Maybe<Scalars['Int']['output']>;
  theme?: Maybe<Theme>;
};

export type ApplyTagPayload = {
  __typename?: 'ApplyTagPayload';
  pipelineRunId?: Maybe<Scalars['String']['output']>;
  workstreamTag?: Maybe<WorkstreamTag>;
};

export type ArchiveWorkstreamGroupPayload = {
  __typename?: 'ArchiveWorkstreamGroupPayload';
  group?: Maybe<WorkstreamGroup>;
};

export type ArchiveWorkstreamPayload = {
  __typename?: 'ArchiveWorkstreamPayload';
  workstream?: Maybe<Workstream>;
};

/** A per-directory branch override with optional worktree */
export type BranchSelection = {
  __typename?: 'BranchSelection';
  baseBranch?: Maybe<Scalars['String']['output']>;
  branch?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  directoryPath?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  workstreamId?: Maybe<Scalars['ID']['output']>;
  worktreePath?: Maybe<Scalars['String']['output']>;
};

export type ClearWorkstreamConversationPayload = {
  __typename?: 'ClearWorkstreamConversationPayload';
  workstream?: Maybe<Workstream>;
};

/** A command available in the command palette */
export type Command = {
  __typename?: 'Command';
  body?: Maybe<Scalars['String']['output']>;
  category?: Maybe<CommandCategory>;
  description?: Maybe<Scalars['String']['output']>;
  disabled?: Maybe<Scalars['Boolean']['output']>;
  disabledReason?: Maybe<Scalars['String']['output']>;
  hasFlow?: Maybe<Scalars['Boolean']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  keywords?: Maybe<Array<Scalars['String']['output']>>;
  title?: Maybe<Scalars['String']['output']>;
};

export type CommandCategory =
  | 'claude'
  | 'developer'
  | 'help'
  | 'navigation'
  | 'settings'
  | 'skill'
  | 'workstream';

/** Action to perform in the renderer after command execution */
export type CommandResultAction = {
  __typename?: 'CommandResultAction';
  message?: Maybe<Scalars['String']['output']>;
  path?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  variant?: Maybe<Scalars['String']['output']>;
};

export type CompactWorkstreamConversationPayload = {
  __typename?: 'CompactWorkstreamConversationPayload';
  workstream?: Maybe<Workstream>;
};

export type CreateGitHubIssueInput = {
  /** Assignee usernames */
  assignees?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Issue body (markdown) */
  body?: InputMaybe<Scalars['String']['input']>;
  /** Label names */
  labels?: InputMaybe<Array<Scalars['String']['input']>>;
  owner: Scalars['String']['input'];
  repo: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateGitHubPrInput = {
  /** Branch to merge into */
  base: Scalars['String']['input'];
  /** PR description (markdown) */
  body?: InputMaybe<Scalars['String']['input']>;
  /** Create as draft PR */
  draft?: InputMaybe<Scalars['Boolean']['input']>;
  /** Branch containing changes */
  head: Scalars['String']['input'];
  owner: Scalars['String']['input'];
  repo: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateProjectInput = {
  name: Scalars['String']['input'];
};

export type CreateRoutineInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  preferences?: InputMaybe<Scalars['JSON']['input']>;
  projectId: Scalars['ID']['input'];
  prompt: Scalars['String']['input'];
  schedule: RoutineScheduleInput;
};

export type CreateRoutinePayload = {
  __typename?: 'CreateRoutinePayload';
  routine?: Maybe<Routine>;
};

export type CreateTagInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  dependsOn?: InputMaybe<Array<Scalars['String']['input']>>;
  instructions: Scalars['String']['input'];
  maxDepth?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
  spawnWorkstream?: InputMaybe<Scalars['Boolean']['input']>;
  worktreeMode?: InputMaybe<WorktreeMode>;
};

export type CreateTagPayload = {
  __typename?: 'CreateTagPayload';
  tag?: Maybe<Tag>;
};

export type CreateWorkstreamGroupInput = {
  name: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};

export type CreateWorkstreamGroupPayload = {
  __typename?: 'CreateWorkstreamGroupPayload';
  group?: Maybe<WorkstreamGroup>;
};

export type CreateWorkstreamInput = {
  groupId?: InputMaybe<Scalars['ID']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
};

export type CreateWorkstreamPayload = {
  __typename?: 'CreateWorkstreamPayload';
  workstream?: Maybe<Workstream>;
};

export type DeleteRoutinePayload = {
  __typename?: 'DeleteRoutinePayload';
  routine?: Maybe<Routine>;
};

export type DeleteTagPayload = {
  __typename?: 'DeleteTagPayload';
  tag?: Maybe<Tag>;
};

export type DeleteWorkstreamGroupPayload = {
  __typename?: 'DeleteWorkstreamGroupPayload';
  group?: Maybe<WorkstreamGroup>;
};

export type DeleteWorkstreamPayload = {
  __typename?: 'DeleteWorkstreamPayload';
  workstream?: Maybe<Workstream>;
};

/** A directory with its branch selection and computed effective path */
export type DirectoryWithBranchInfo = {
  __typename?: 'DirectoryWithBranchInfo';
  baseBranch?: Maybe<Scalars['String']['output']>;
  branch?: Maybe<Scalars['String']['output']>;
  effectivePath?: Maybe<Scalars['String']['output']>;
  isInherited?: Maybe<Scalars['Boolean']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  path?: Maybe<Scalars['String']['output']>;
  worktreePath?: Maybe<Scalars['String']['output']>;
};

/** Generic entity resolved from the entity registry */
export type Entity = {
  __typename?: 'Entity';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
};

/** Metadata about a registered entity type */
export type EntityTypeInfo = {
  __typename?: 'EntityTypeInfo';
  display?: Maybe<Scalars['JSON']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uriExample?: Maybe<Scalars['String']['output']>;
};

/** Result of executing a command */
export type ExecuteCommandPayload = {
  __typename?: 'ExecuteCommandPayload';
  action?: Maybe<CommandResultAction>;
  error?: Maybe<Scalars['String']['output']>;
  success?: Maybe<Scalars['Boolean']['output']>;
};

/** A git branch */
export type GitBranch = {
  __typename?: 'GitBranch';
  hasWorktree?: Maybe<Scalars['Boolean']['output']>;
  isCurrent?: Maybe<Scalars['Boolean']['output']>;
  isRemote?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  worktreePath?: Maybe<Scalars['String']['output']>;
};

/** A git commit */
export type GitCommit = {
  __typename?: 'GitCommit';
  author?: Maybe<Scalars['String']['output']>;
  /** Commit date as epoch milliseconds */
  date?: Maybe<Scalars['Float']['output']>;
  hash?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  shortHash?: Maybe<Scalars['String']['output']>;
};

/** Summary of git diff with line counts and changed files */
export type GitDiffSummary = {
  __typename?: 'GitDiffSummary';
  additions?: Maybe<Scalars['Int']['output']>;
  deletions?: Maybe<Scalars['Int']['output']>;
  files?: Maybe<Array<GitStatusFile>>;
};

/** A CI check run on a GitHub ref */
export type GitHubCheckRun = {
  __typename?: 'GitHubCheckRun';
  completedAt?: Maybe<Scalars['String']['output']>;
  conclusion?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  startedAt?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

/** A GitHub repository collaborator */
export type GitHubCollaborator = {
  __typename?: 'GitHubCollaborator';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  login?: Maybe<Scalars['String']['output']>;
};

/** A GitHub issue */
export type GitHubIssue = {
  __typename?: 'GitHubIssue';
  assignees?: Maybe<Array<Scalars['String']['output']>>;
  author?: Maybe<Scalars['String']['output']>;
  authorAvatar?: Maybe<Scalars['String']['output']>;
  body?: Maybe<Scalars['String']['output']>;
  closedAt?: Maybe<Scalars['String']['output']>;
  commentCount?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  labels?: Maybe<Array<GitHubLabel>>;
  number?: Maybe<Scalars['Int']['output']>;
  owner?: Maybe<Scalars['String']['output']>;
  repo?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

/** A GitHub label */
export type GitHubLabel = {
  __typename?: 'GitHubLabel';
  color?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

/** A GitHub pull request */
export type GitHubPr = {
  __typename?: 'GitHubPR';
  additions?: Maybe<Scalars['Int']['output']>;
  author?: Maybe<Scalars['String']['output']>;
  authorAvatar?: Maybe<Scalars['String']['output']>;
  baseBranch?: Maybe<Scalars['String']['output']>;
  body?: Maybe<Scalars['String']['output']>;
  changedFiles?: Maybe<Scalars['Int']['output']>;
  checksStatus?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  deletions?: Maybe<Scalars['Int']['output']>;
  draft?: Maybe<Scalars['Boolean']['output']>;
  headBranch?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  labels?: Maybe<Array<GitHubLabel>>;
  mergeable?: Maybe<Scalars['Boolean']['output']>;
  mergeableState?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['Int']['output']>;
  owner?: Maybe<Scalars['String']['output']>;
  repo?: Maybe<Scalars['String']['output']>;
  reviewState?: Maybe<Scalars['String']['output']>;
  reviewers?: Maybe<Array<Scalars['String']['output']>>;
  state?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

/** A comment on a GitHub pull request */
export type GitHubPrComment = {
  __typename?: 'GitHubPRComment';
  body?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  user?: Maybe<Scalars['String']['output']>;
  userAvatar?: Maybe<Scalars['String']['output']>;
};

/** A file changed in a GitHub pull request */
export type GitHubPrFile = {
  __typename?: 'GitHubPRFile';
  additions?: Maybe<Scalars['Int']['output']>;
  changes?: Maybe<Scalars['Int']['output']>;
  deletions?: Maybe<Scalars['Int']['output']>;
  filename?: Maybe<Scalars['String']['output']>;
  patch?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
};

/** A review on a GitHub pull request */
export type GitHubPrReview = {
  __typename?: 'GitHubPRReview';
  body?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  submittedAt?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  user?: Maybe<Scalars['String']['output']>;
};

/** A GitHub repository */
export type GitHubRepo = {
  __typename?: 'GitHubRepo';
  defaultBranch?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  forksCount?: Maybe<Scalars['Int']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  language?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<Scalars['String']['output']>;
  private?: Maybe<Scalars['Boolean']['output']>;
  stargazersCount?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

/** A job within a workflow run */
export type GitHubWorkflowJob = {
  __typename?: 'GitHubWorkflowJob';
  completedAt?: Maybe<Scalars['String']['output']>;
  conclusion?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  startedAt?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  steps?: Maybe<Array<GitHubWorkflowStep>>;
};

/** A GitHub Actions workflow run */
export type GitHubWorkflowRun = {
  __typename?: 'GitHubWorkflowRun';
  actor?: Maybe<Scalars['String']['output']>;
  actorAvatar?: Maybe<Scalars['String']['output']>;
  branch?: Maybe<Scalars['String']['output']>;
  conclusion?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  event?: Maybe<Scalars['String']['output']>;
  headSha?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  owner?: Maybe<Scalars['String']['output']>;
  repo?: Maybe<Scalars['String']['output']>;
  runId?: Maybe<Scalars['Int']['output']>;
  runNumber?: Maybe<Scalars['Int']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  workflowName?: Maybe<Scalars['String']['output']>;
};

/** A step within a workflow job */
export type GitHubWorkflowStep = {
  __typename?: 'GitHubWorkflowStep';
  conclusion?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['Int']['output']>;
  status?: Maybe<Scalars['String']['output']>;
};

/** A file with git status information */
export type GitStatusFile = {
  __typename?: 'GitStatusFile';
  additions?: Maybe<Scalars['Int']['output']>;
  deletions?: Maybe<Scalars['Int']['output']>;
  oldPath?: Maybe<Scalars['String']['output']>;
  path?: Maybe<Scalars['String']['output']>;
  staged?: Maybe<Scalars['Boolean']['output']>;
  status?: Maybe<Scalars['String']['output']>;
};

/** A default branch selection at the group level — inherited by workstreams on creation */
export type GroupBranchSelection = {
  __typename?: 'GroupBranchSelection';
  baseBranch?: Maybe<Scalars['String']['output']>;
  branch?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  directoryPath?: Maybe<Scalars['String']['output']>;
  groupId?: Maybe<Scalars['ID']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

/** A shared working directory at the group level */
export type GroupDirectory = {
  __typename?: 'GroupDirectory';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  groupId?: Maybe<Scalars['ID']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  path?: Maybe<Scalars['String']['output']>;
};

/** An entity linked to a workstream group — inherited by all workstreams in the group */
export type GroupLinkedEntity = {
  __typename?: 'GroupLinkedEntity';
  contextOverride?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  entityTitle?: Maybe<Scalars['String']['output']>;
  entityType?: Maybe<Scalars['String']['output']>;
  entityUri?: Maybe<Scalars['String']['output']>;
  groupId?: Maybe<Scalars['ID']['output']>;
};

/** Metadata for an image attached to a user message */
export type ImageAttachmentInput = {
  mimeType: Scalars['String']['input'];
  name: Scalars['String']['input'];
  previewUrl: Scalars['String']['input'];
  size: Scalars['Int']['input'];
};

/** Base64-encoded image content block for the Claude API */
export type ImageContentBlockInput = {
  data: Scalars['String']['input'];
  mediaType: Scalars['String']['input'];
};

export type InstallSkillPayload = {
  __typename?: 'InstallSkillPayload';
  skill?: Maybe<InstalledSkill>;
};

/** A skill installed on disk from a registry or GitHub repo */
export type InstalledSkill = {
  __typename?: 'InstalledSkill';
  author?: Maybe<Scalars['String']['output']>;
  category?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  enabled?: Maybe<Scalars['Boolean']['output']>;
  /** Whether a newer version is available in the registry */
  hasUpdate?: Maybe<Scalars['Boolean']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  installDate?: Maybe<Scalars['String']['output']>;
  lastUsed?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  path?: Maybe<Scalars['String']['output']>;
  pinned?: Maybe<Scalars['Boolean']['output']>;
  registry?: Maybe<Scalars['String']['output']>;
  registryVersion?: Maybe<Scalars['String']['output']>;
  source?: Maybe<SkillSource>;
  sourceRef?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  useCount?: Maybe<Scalars['Int']['output']>;
  version?: Maybe<Scalars['String']['output']>;
};

/** Metadata about a registered integration */
export type IntegrationInfo = {
  __typename?: 'IntegrationInfo';
  displayName?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
};

export type InterruptWorkstreamAgentPayload = {
  __typename?: 'InterruptWorkstreamAgentPayload';
  workstream?: Maybe<Workstream>;
};

export type LinkGroupEntityPayload = {
  __typename?: 'LinkGroupEntityPayload';
  group?: Maybe<WorkstreamGroup>;
};

export type LinkWorkstreamEntityPayload = {
  __typename?: 'LinkWorkstreamEntityPayload';
  workstream?: Maybe<Workstream>;
};

/** Status of an active LSP server instance */
export type LspServerStatus = {
  __typename?: 'LspServerStatus';
  /** Number of documents currently open in this server */
  openDocuments?: Maybe<Scalars['Int']['output']>;
  /** The project root directory this server manages */
  projectRoot?: Maybe<Scalars['String']['output']>;
  /** Server lifecycle state (stopped, starting, ready, error) */
  state?: Maybe<Scalars['String']['output']>;
};

export type MergePrInput = {
  /** merge (default), squash, or rebase */
  mergeMethod?: InputMaybe<Scalars['String']['input']>;
  owner: Scalars['String']['input'];
  pullNumber: Scalars['Int']['input'];
  repo: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Read a skill's SKILL.md body for one-shot prompt injection */
  activateSkill?: Maybe<ActivateSkillPayload>;
  /** Add a shared directory to a workstream group (cascades to member workstreams) */
  addGroupDirectory?: Maybe<AddGroupDirectoryPayload>;
  /** Add a directory to a project. Cascades to all non-archived workstreams and restarts running agents. */
  addProjectDirectory?: Maybe<AddProjectDirectoryPayload>;
  addRegistry?: Maybe<AddRegistryPayload>;
  /** Add a working directory to a workstream */
  addWorkstreamDirectory?: Maybe<AddWorkstreamDirectoryPayload>;
  /** Move a workstream into a group */
  addWorkstreamToGroup?: Maybe<AddWorkstreamToGroupPayload>;
  /** Copy a template's rules as a scoped permission policy for a workstream or group */
  applyPermissionTemplate?: Maybe<Scalars['Boolean']['output']>;
  /** Apply a tag to a workstream (snapshots definition, starts pipeline) */
  applyTagToWorkstream?: Maybe<ApplyTagPayload>;
  /** Archive a workstream */
  archiveWorkstream?: Maybe<ArchiveWorkstreamPayload>;
  /** Archive a workstream group and all its workstreams */
  archiveWorkstreamGroup?: Maybe<ArchiveWorkstreamGroupPayload>;
  /** Clear conversation history and stop the agent */
  clearWorkstreamConversation?: Maybe<ClearWorkstreamConversationPayload>;
  /** Trigger context compaction for a workstream */
  compactWorkstreamConversation?: Maybe<CompactWorkstreamConversationPayload>;
  /** Create a new permission template */
  createPermissionTemplate?: Maybe<PermissionTemplate>;
  /** Create a new project */
  createProject?: Maybe<Project>;
  createRoutine?: Maybe<CreateRoutinePayload>;
  /** Create a new tag in a project (stored in JSON file) */
  createTag?: Maybe<CreateTagPayload>;
  /** Create a new workstream in a project */
  createWorkstream?: Maybe<CreateWorkstreamPayload>;
  /** Create a new workstream group in a project */
  createWorkstreamGroup?: Maybe<CreateWorkstreamGroupPayload>;
  /** Delete permission overrides for a scope */
  deletePermissionPolicy?: Maybe<Scalars['Boolean']['output']>;
  /** Delete a permission template */
  deletePermissionTemplate?: Maybe<Scalars['Boolean']['output']>;
  /** Delete a project and all its workstreams */
  deleteProject?: Maybe<Scalars['Boolean']['output']>;
  /** Delete a routine and return it for cache eviction */
  deleteRoutine?: Maybe<DeleteRoutinePayload>;
  /** Delete a tag from the project scope (does not affect snapshots) */
  deleteTag?: Maybe<DeleteTagPayload>;
  /** Permanently delete a workstream and return it for cache eviction */
  deleteWorkstream?: Maybe<DeleteWorkstreamPayload>;
  /** Delete a workstream group. Workstreams in the group become ungrouped (group_id set to NULL). */
  deleteWorkstreamGroup?: Maybe<DeleteWorkstreamGroupPayload>;
  /** Execute a command by ID */
  executeCommand?: Maybe<ExecuteCommandPayload>;
  /** Add a comment to a GitHub issue. Returns the issue. */
  githubAddIssueComment?: Maybe<GitHubIssue>;
  /** Add a comment to a pull request. Returns the PR. */
  githubAddPRComment?: Maybe<GitHubPr>;
  /** Create a new GitHub issue */
  githubCreateIssue?: Maybe<GitHubIssue>;
  /** Create a new pull request */
  githubCreatePR?: Maybe<GitHubPr>;
  /** Merge a pull request. Returns the merged PR. */
  githubMergePR?: Maybe<GitHubPr>;
  /** Request review on a pull request. Returns the PR. */
  githubRequestReview?: Maybe<GitHubPr>;
  /** Re-run a GitHub Actions workflow. Returns the workflow run. */
  githubRerunWorkflow?: Maybe<GitHubWorkflowRun>;
  /** Submit a review on a pull request. Returns the PR. */
  githubSubmitReview?: Maybe<GitHubPr>;
  /** Update a GitHub issue. Returns the updated issue. */
  githubUpdateIssue?: Maybe<GitHubIssue>;
  /** Update a pull request. Returns the updated PR. */
  githubUpdatePR?: Maybe<GitHubPr>;
  installSkill?: Maybe<InstallSkillPayload>;
  /** Interrupt the agent current generation */
  interruptWorkstreamAgent?: Maybe<InterruptWorkstreamAgentPayload>;
  /** Link an entity to a workstream group (inherited by all workstreams) */
  linkGroupEntity?: Maybe<LinkGroupEntityPayload>;
  /** Link an entity to a workstream as persistent context */
  linkWorkstreamEntity?: Maybe<LinkWorkstreamEntityPayload>;
  /** Load older event history for a workstream before a cursor (scroll-back pagination) */
  loadMoreWorkstreamHistory?: Maybe<ReplayHistoryPayload>;
  pauseRoutine?: Maybe<PauseRoutinePayload>;
  /** Pin a workstream to the top of the list */
  pinWorkstream?: Maybe<PinWorkstreamPayload>;
  /** Pin a workstream group to the top of the nav */
  pinWorkstreamGroup?: Maybe<PinWorkstreamGroupPayload>;
  /** Remove a branch selection for a directory. If removeWorktree is true, the associated worktree will be cleaned up. */
  removeBranchSelection?: Maybe<RemoveBranchSelectionPayload>;
  /** Remove a default branch selection for a group directory */
  removeGroupBranchSelection?: Maybe<RemoveGroupBranchSelectionPayload>;
  /** Remove a shared directory from a workstream group (cascades inherited copies) */
  removeGroupDirectory?: Maybe<RemoveGroupDirectoryPayload>;
  /** Remove a directory from a project. Cascades: removes inherited copies and branch selections from all workstreams. */
  removeProjectDirectory?: Maybe<RemoveProjectDirectoryPayload>;
  removeRegistry?: Maybe<RemoveRegistryPayload>;
  /** Remove a tag from a workstream */
  removeTagFromWorkstream?: Maybe<RemoveTagPayload>;
  /** Remove a working directory from a workstream (also removes its branch selection and optional worktree) */
  removeWorkstreamDirectory?: Maybe<RemoveWorkstreamDirectoryPayload>;
  /** Remove a workstream from its group (ungroup) */
  removeWorkstreamFromGroup?: Maybe<RemoveWorkstreamFromGroupPayload>;
  /** Replay event history for a workstream (events stream via IPC) */
  replayWorkstreamHistory?: Maybe<ReplayHistoryPayload>;
  /** Re-scan .claude/commands directories for Claude custom commands */
  rescanClaudeCommands?: Maybe<Scalars['Boolean']['output']>;
  /** Respond to a tool permission request */
  respondWorkstreamPermission?: Maybe<RespondWorkstreamPermissionPayload>;
  /** Restart the agent for a workstream */
  restartWorkstreamAgent?: Maybe<RestartWorkstreamAgentPayload>;
  resumeRoutine?: Maybe<ResumeRoutinePayload>;
  /** Revoke a permission rule for a workstream agent */
  revokePermissionRule?: Maybe<RevokePermissionRulePayload>;
  /** Trigger immediate execution of a routine */
  runRoutineNow?: Maybe<RunRoutineNowPayload>;
  /** Send a message to a workstream agent (auto-starts if needed) */
  sendWorkstreamMessage?: Maybe<SendWorkstreamMessagePayload>;
  /** Set or update a branch selection for a directory. If createWorktree is true and gitOps is available, a worktree will be created automatically. */
  setBranchSelection?: Maybe<SetBranchSelectionPayload>;
  /** Set or update a default branch selection for a group directory */
  setGroupBranchSelection?: Maybe<SetGroupBranchSelectionPayload>;
  /** Override the auto-generated context for a linked entity */
  setLinkedEntityContextOverride?: Maybe<SetLinkedEntityContextOverridePayload>;
  /** Set permission overrides for a project, group, or workstream scope */
  setPermissionPolicy?: Maybe<PermissionPolicy>;
  /** Set which workstream is visible to the user (null to clear) */
  setWorkstreamInFocus?: Maybe<SetWorkstreamInFocusPayload>;
  /** Stop the agent for a workstream */
  stopWorkstreamAgent?: Maybe<StopWorkstreamAgentPayload>;
  /** Switch the model for a workstream (persists + restarts agent) */
  switchWorkstreamModel?: Maybe<SwitchWorkstreamModelPayload>;
  /** Re-scan .claude directories for local skills */
  syncLocalSkills?: Maybe<Scalars['Boolean']['output']>;
  /** Trigger a sync of all enabled registries */
  syncRegistries?: Maybe<SyncRegistriesPayload>;
  toggleSkillEnabled?: Maybe<ToggleSkillPayload>;
  toggleSkillPinned?: Maybe<ToggleSkillPayload>;
  /** Restore an archived workstream */
  unarchiveWorkstream?: Maybe<UnarchiveWorkstreamPayload>;
  uninstallSkill?: Maybe<UninstallSkillPayload>;
  /** Remove a linked entity from a workstream group */
  unlinkGroupEntity?: Maybe<UnlinkGroupEntityPayload>;
  /** Remove a linked entity from a workstream */
  unlinkWorkstreamEntity?: Maybe<UnlinkWorkstreamEntityPayload>;
  /** Unpin a workstream */
  unpinWorkstream?: Maybe<UnpinWorkstreamPayload>;
  /** Unpin a workstream group */
  unpinWorkstreamGroup?: Maybe<UnpinWorkstreamGroupPayload>;
  /** Update advanced/developer settings */
  updateAdvancedSettings?: Maybe<Settings>;
  /** Update AI settings (default model, CLI path) */
  updateAiSettings?: Maybe<Settings>;
  /** Update appearance settings (theme, font size, compact mode) */
  updateAppearanceSettings?: Maybe<Settings>;
  /** Update a permission template */
  updatePermissionTemplate?: Maybe<PermissionTemplate>;
  /** Update global permission settings (presets, rules) */
  updatePermissionsSettings?: Maybe<Settings>;
  /** Update a project */
  updateProject?: Maybe<Project>;
  updateRegistry?: Maybe<UpdateRegistryPayload>;
  updateRoutine?: Maybe<UpdateRoutinePayload>;
  /** Replace all settings from a raw JSON string. Validates against Zod schemas. */
  updateSettingsRaw?: Maybe<Settings>;
  updateSkill?: Maybe<UpdateSkillPayload>;
  /** Update a tag by name within a project */
  updateTag?: Maybe<UpdateTagPayload>;
  /** Update a workstream */
  updateWorkstream?: Maybe<UpdateWorkstreamPayload>;
  /** Update a workstream group */
  updateWorkstreamGroup?: Maybe<UpdateWorkstreamGroupPayload>;
};


export type MutationActivateSkillArgs = {
  skillId: Scalars['String']['input'];
};


export type MutationAddGroupDirectoryArgs = {
  groupId: Scalars['ID']['input'];
  label?: InputMaybe<Scalars['String']['input']>;
  path: Scalars['String']['input'];
};


export type MutationAddProjectDirectoryArgs = {
  label?: InputMaybe<Scalars['String']['input']>;
  path: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};


export type MutationAddRegistryArgs = {
  input: AddRegistryInput;
};


export type MutationAddWorkstreamDirectoryArgs = {
  label?: InputMaybe<Scalars['String']['input']>;
  path: Scalars['String']['input'];
  workstreamId: Scalars['ID']['input'];
};


export type MutationAddWorkstreamToGroupArgs = {
  groupId: Scalars['ID']['input'];
  workstreamId: Scalars['ID']['input'];
};


export type MutationApplyPermissionTemplateArgs = {
  scopeId: Scalars['String']['input'];
  scopeType: PermissionScopeType;
  templateId: Scalars['ID']['input'];
};


export type MutationApplyTagToWorkstreamArgs = {
  tagName: Scalars['String']['input'];
  workstreamId: Scalars['ID']['input'];
};


export type MutationArchiveWorkstreamArgs = {
  id: Scalars['ID']['input'];
};


export type MutationArchiveWorkstreamGroupArgs = {
  id: Scalars['ID']['input'];
};


export type MutationClearWorkstreamConversationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCompactWorkstreamConversationArgs = {
  id: Scalars['ID']['input'];
  instructions?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreatePermissionTemplateArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  rules: Array<PermissionRuleConfigInput>;
};


export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};


export type MutationCreateRoutineArgs = {
  input: CreateRoutineInput;
};


export type MutationCreateTagArgs = {
  input: CreateTagInput;
};


export type MutationCreateWorkstreamArgs = {
  input: CreateWorkstreamInput;
};


export type MutationCreateWorkstreamGroupArgs = {
  input: CreateWorkstreamGroupInput;
};


export type MutationDeletePermissionPolicyArgs = {
  scopeId: Scalars['String']['input'];
  scopeType: PermissionScopeType;
};


export type MutationDeletePermissionTemplateArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteRoutineArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTagArgs = {
  projectId: Scalars['ID']['input'];
  tagName: Scalars['String']['input'];
};


export type MutationDeleteWorkstreamArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWorkstreamGroupArgs = {
  id: Scalars['ID']['input'];
};


export type MutationExecuteCommandArgs = {
  args?: InputMaybe<Scalars['JSON']['input']>;
  commandId: Scalars['String']['input'];
};


export type MutationGithubAddIssueCommentArgs = {
  input: AddIssueCommentInput;
};


export type MutationGithubAddPrCommentArgs = {
  input: AddPrCommentInput;
};


export type MutationGithubCreateIssueArgs = {
  input: CreateGitHubIssueInput;
};


export type MutationGithubCreatePrArgs = {
  input: CreateGitHubPrInput;
};


export type MutationGithubMergePrArgs = {
  input: MergePrInput;
};


export type MutationGithubRequestReviewArgs = {
  input: RequestReviewInput;
};


export type MutationGithubRerunWorkflowArgs = {
  input: RerunWorkflowInput;
};


export type MutationGithubSubmitReviewArgs = {
  input: SubmitReviewInput;
};


export type MutationGithubUpdateIssueArgs = {
  input: UpdateGitHubIssueInput;
};


export type MutationGithubUpdatePrArgs = {
  input: UpdateGitHubPrInput;
};


export type MutationInstallSkillArgs = {
  destination?: InputMaybe<Scalars['String']['input']>;
  skillId: Scalars['String']['input'];
};


export type MutationInterruptWorkstreamAgentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLinkGroupEntityArgs = {
  entityTitle?: InputMaybe<Scalars['String']['input']>;
  entityType: Scalars['String']['input'];
  entityUri: Scalars['String']['input'];
  groupId: Scalars['ID']['input'];
};


export type MutationLinkWorkstreamEntityArgs = {
  entityTitle?: InputMaybe<Scalars['String']['input']>;
  entityType: Scalars['String']['input'];
  entityUri: Scalars['String']['input'];
  workstreamId: Scalars['ID']['input'];
};


export type MutationLoadMoreWorkstreamHistoryArgs = {
  beforeEventId: Scalars['Int']['input'];
  id: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationPauseRoutineArgs = {
  id: Scalars['ID']['input'];
};


export type MutationPinWorkstreamArgs = {
  id: Scalars['ID']['input'];
};


export type MutationPinWorkstreamGroupArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveBranchSelectionArgs = {
  directoryPath: Scalars['String']['input'];
  removeWorktree?: InputMaybe<Scalars['Boolean']['input']>;
  workstreamId: Scalars['ID']['input'];
};


export type MutationRemoveGroupBranchSelectionArgs = {
  directoryPath: Scalars['String']['input'];
  groupId: Scalars['ID']['input'];
};


export type MutationRemoveGroupDirectoryArgs = {
  groupId: Scalars['ID']['input'];
  path: Scalars['String']['input'];
};


export type MutationRemoveProjectDirectoryArgs = {
  path: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};


export type MutationRemoveRegistryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveTagFromWorkstreamArgs = {
  tagName: Scalars['String']['input'];
  workstreamId: Scalars['ID']['input'];
};


export type MutationRemoveWorkstreamDirectoryArgs = {
  path: Scalars['String']['input'];
  removeWorktree?: InputMaybe<Scalars['Boolean']['input']>;
  workstreamId: Scalars['ID']['input'];
};


export type MutationRemoveWorkstreamFromGroupArgs = {
  workstreamId: Scalars['ID']['input'];
};


export type MutationReplayWorkstreamHistoryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRespondWorkstreamPermissionArgs = {
  requestId: Scalars['String']['input'];
  response: PermissionResponseInput;
  workstreamId: Scalars['ID']['input'];
};


export type MutationRestartWorkstreamAgentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationResumeRoutineArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRevokePermissionRuleArgs = {
  scope: PermissionRuleScope;
  toolName: Scalars['String']['input'];
  workstreamId: Scalars['ID']['input'];
};


export type MutationRunRoutineNowArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSendWorkstreamMessageArgs = {
  imageAttachments?: InputMaybe<Array<ImageAttachmentInput>>;
  imageContentBlocks?: InputMaybe<Array<ImageContentBlockInput>>;
  text: Scalars['String']['input'];
  workstreamId: Scalars['ID']['input'];
};


export type MutationSetBranchSelectionArgs = {
  baseBranch?: InputMaybe<Scalars['String']['input']>;
  branch: Scalars['String']['input'];
  createWorktree?: InputMaybe<Scalars['Boolean']['input']>;
  directoryPath: Scalars['String']['input'];
  workstreamId: Scalars['ID']['input'];
  worktreePath?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSetGroupBranchSelectionArgs = {
  baseBranch?: InputMaybe<Scalars['String']['input']>;
  branch: Scalars['String']['input'];
  directoryPath: Scalars['String']['input'];
  groupId: Scalars['ID']['input'];
};


export type MutationSetLinkedEntityContextOverrideArgs = {
  contextOverride?: InputMaybe<Scalars['String']['input']>;
  entityUri: Scalars['String']['input'];
  workstreamId: Scalars['ID']['input'];
};


export type MutationSetPermissionPolicyArgs = {
  rules: Array<PermissionRuleConfigInput>;
  scopeId: Scalars['String']['input'];
  scopeType: PermissionScopeType;
};


export type MutationSetWorkstreamInFocusArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationStopWorkstreamAgentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSwitchWorkstreamModelArgs = {
  id: Scalars['ID']['input'];
  model: Scalars['String']['input'];
};


export type MutationToggleSkillEnabledArgs = {
  enabled: Scalars['Boolean']['input'];
  skillId: Scalars['String']['input'];
};


export type MutationToggleSkillPinnedArgs = {
  pinned: Scalars['Boolean']['input'];
  skillId: Scalars['String']['input'];
};


export type MutationUnarchiveWorkstreamArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUninstallSkillArgs = {
  skillId: Scalars['String']['input'];
};


export type MutationUnlinkGroupEntityArgs = {
  entityUri: Scalars['String']['input'];
  groupId: Scalars['ID']['input'];
};


export type MutationUnlinkWorkstreamEntityArgs = {
  entityUri: Scalars['String']['input'];
  workstreamId: Scalars['ID']['input'];
};


export type MutationUnpinWorkstreamArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUnpinWorkstreamGroupArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateAdvancedSettingsArgs = {
  input: UpdateAdvancedSettingsInput;
};


export type MutationUpdateAiSettingsArgs = {
  input: UpdateAiSettingsInput;
};


export type MutationUpdateAppearanceSettingsArgs = {
  input: UpdateAppearanceSettingsInput;
};


export type MutationUpdatePermissionTemplateArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  rules?: InputMaybe<Array<PermissionRuleConfigInput>>;
};


export type MutationUpdatePermissionsSettingsArgs = {
  input: UpdatePermissionsSettingsInput;
};


export type MutationUpdateProjectArgs = {
  id: Scalars['ID']['input'];
  input: UpdateProjectInput;
};


export type MutationUpdateRegistryArgs = {
  id: Scalars['ID']['input'];
  input: UpdateRegistryInput;
};


export type MutationUpdateRoutineArgs = {
  id: Scalars['ID']['input'];
  input: UpdateRoutineInput;
};


export type MutationUpdateSettingsRawArgs = {
  json: Scalars['String']['input'];
};


export type MutationUpdateSkillArgs = {
  skillId: Scalars['String']['input'];
};


export type MutationUpdateTagArgs = {
  input: UpdateTagInput;
  projectId: Scalars['ID']['input'];
  tagName: Scalars['String']['input'];
};


export type MutationUpdateWorkstreamArgs = {
  id: Scalars['ID']['input'];
  input: UpdateWorkstreamInput;
};


export type MutationUpdateWorkstreamGroupArgs = {
  id: Scalars['ID']['input'];
  input: UpdateWorkstreamGroupInput;
};

export type PauseRoutinePayload = {
  __typename?: 'PauseRoutinePayload';
  routine?: Maybe<Routine>;
};

export type PermissionBehavior =
  | 'allow'
  | 'deny';

export type PermissionBehaviorSetting =
  | 'allow'
  | 'ask';

/** Scoped permission override for a project, group, or workstream */
export type PermissionPolicy = {
  __typename?: 'PermissionPolicy';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  rules?: Maybe<Array<PermissionRuleConfig>>;
  scopeId?: Maybe<Scalars['String']['output']>;
  scopeType?: Maybe<PermissionScopeType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type PermissionPreset =
  | 'autonomous'
  | 'balanced'
  | 'custom'
  | 'restrictive';

/** Response to a tool permission request */
export type PermissionResponseInput = {
  behavior: PermissionBehavior;
  directories?: InputMaybe<Array<Scalars['String']['input']>>;
  message?: InputMaybe<Scalars['String']['input']>;
  scope: PermissionScope;
  updatedInput?: InputMaybe<Scalars['JSON']['input']>;
};

/** A single permission rule configuration */
export type PermissionRuleConfig = {
  __typename?: 'PermissionRuleConfig';
  behavior?: Maybe<PermissionBehaviorSetting>;
  entityType?: Maybe<Scalars['String']['output']>;
  tool?: Maybe<Scalars['String']['output']>;
};

export type PermissionRuleConfigInput = {
  behavior: PermissionBehaviorSetting;
  entityType?: InputMaybe<Scalars['String']['input']>;
  tool: Scalars['String']['input'];
};

export type PermissionRuleScope =
  | 'persistent'
  | 'session';

export type PermissionScope =
  | 'once'
  | 'permanent'
  | 'session';

export type PermissionScopeType =
  | 'group'
  | 'project'
  | 'workstream';

/** A reusable named set of permission rules */
export type PermissionTemplate = {
  __typename?: 'PermissionTemplate';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  rules?: Maybe<Array<PermissionRuleConfig>>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

/** Container for all permission templates */
export type PermissionTemplatesSettings = {
  __typename?: 'PermissionTemplatesSettings';
  templates?: Maybe<Array<PermissionTemplate>>;
};

/** Global permission settings */
export type PermissionsSettings = {
  __typename?: 'PermissionsSettings';
  activePreset?: Maybe<PermissionPreset>;
  rules?: Maybe<Array<PermissionRuleConfig>>;
};

export type PinWorkstreamGroupPayload = {
  __typename?: 'PinWorkstreamGroupPayload';
  group?: Maybe<WorkstreamGroup>;
};

export type PinWorkstreamPayload = {
  __typename?: 'PinWorkstreamPayload';
  workstream?: Maybe<Workstream>;
};

/** Top-level container that groups workstreams */
export type Project = {
  __typename?: 'Project';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** Project-level working directories (inherited by all workstreams) */
  directories?: Maybe<Array<ProjectDirectory>>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Non-archived workstreams in this project */
  workstreams?: Maybe<Array<Workstream>>;
};

/** A project-level working directory that is inherited by all workstreams */
export type ProjectDirectory = {
  __typename?: 'ProjectDirectory';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  path?: Maybe<Scalars['String']['output']>;
  projectId?: Maybe<Scalars['ID']['output']>;
};

export type Query = {
  __typename?: 'Query';
  /** List routines with active status */
  activeRoutines?: Maybe<Array<Routine>>;
  /** List archived workstreams for a project */
  archivedWorkstreams?: Maybe<Array<Workstream>>;
  /** Get branch selections for a workstream */
  branchSelections?: Maybe<Array<BranchSelection>>;
  /** Get all commands, optionally filtered by category */
  commands?: Maybe<Array<Command>>;
  /** Get directories with computed branch/worktree info for a workstream */
  directoriesWithBranchInfo?: Maybe<Array<DirectoryWithBranchInfo>>;
  /** List entities of a specific type with optional filters */
  entities?: Maybe<Array<Entity>>;
  /** Resolve a single entity by its URI */
  entity?: Maybe<Entity>;
  /** Search across all (or specified) entity types */
  entitySearch?: Maybe<Array<Entity>>;
  /** List all registered entity types with their metadata */
  entityTypes?: Maybe<Array<EntityTypeInfo>>;
  /** Get aggregate unified diff for all branch changes vs base */
  gitBranchDiff?: Maybe<Scalars['String']['output']>;
  /** List branches for a git repository */
  gitBranches?: Maybe<Array<GitBranch>>;
  /** Get unified diff for a single commit */
  gitCommitDiff?: Maybe<Scalars['String']['output']>;
  /** Get commit log for commits on current branch not on base ref */
  gitCommitLog?: Maybe<Array<GitCommit>>;
  /** Get the current branch for a git repository */
  gitCurrentBranch?: Maybe<Scalars['String']['output']>;
  /** Get the default branch for a git repository (main/master) */
  gitDefaultBranch?: Maybe<Scalars['String']['output']>;
  /** Get diff stat summary for branch changes vs a base ref (merge-base) */
  gitDiffSummary?: Maybe<GitDiffSummary>;
  /** Get file content at a specific git ref, or current working tree if ref is null */
  gitFileAtRef?: Maybe<Scalars['String']['output']>;
  /** Get unified diff for a single file (tries branch diff, working tree, then untracked) */
  gitFileDiff?: Maybe<Scalars['String']['output']>;
  /** Get changed files in the working tree (staged + unstaged + untracked) */
  gitStatusFiles?: Maybe<Array<GitStatusFile>>;
  /** Get unified diff for all working tree changes (staged + unstaged) vs HEAD */
  gitWorkingTreeDiff?: Maybe<Scalars['String']['output']>;
  /** Get diff stat for working tree changes (unstaged + staged + untracked) */
  gitWorkingTreeSummary?: Maybe<GitDiffSummary>;
  /** Get CI check runs for a git ref */
  githubCheckRuns?: Maybe<Array<GitHubCheckRun>>;
  /** Get a single GitHub issue */
  githubIssue?: Maybe<GitHubIssue>;
  /** List issues for a specific repository (requires owner+repo). Defaults to open. Use searchGithubIssues for cross-repo or advanced search. */
  githubIssues?: Maybe<Array<GitHubIssue>>;
  /** List issues related to the authenticated user across all repos (no owner/repo needed). Best starting point for "my issues". */
  githubMyIssues?: Maybe<Array<GitHubIssue>>;
  /** List pull requests related to the authenticated user (no owner/repo needed) */
  githubMyPRs?: Maybe<Array<GitHubPr>>;
  /** Get a single GitHub pull request */
  githubPR?: Maybe<GitHubPr>;
  /** List comments on a pull request */
  githubPRComments?: Maybe<Array<GitHubPrComment>>;
  /** List files changed in a pull request */
  githubPRFiles?: Maybe<Array<GitHubPrFile>>;
  /** List reviews on a pull request */
  githubPRReviews?: Maybe<Array<GitHubPrReview>>;
  /** List pull requests for a specific repository (requires owner+repo). Use searchGithubPRs or githubMyPRs for cross-repo search. */
  githubPRs?: Maybe<Array<GitHubPr>>;
  /** List collaborators for a repository */
  githubRepoCollaborators?: Maybe<Array<GitHubCollaborator>>;
  /** List all labels for a repository */
  githubRepoLabels?: Maybe<Array<GitHubLabel>>;
  /** List repositories for the authenticated GitHub user */
  githubRepos?: Maybe<Array<GitHubRepo>>;
  /** Get a single workflow run with jobs */
  githubWorkflowRun?: Maybe<GitHubWorkflowRun>;
  /** List workflow runs for a repository */
  githubWorkflowRuns?: Maybe<Array<GitHubWorkflowRun>>;
  /** Get shared directories for a workstream group */
  groupDirectories?: Maybe<Array<GroupDirectory>>;
  /** Get entities linked to a workstream group */
  groupLinkedEntities?: Maybe<Array<GroupLinkedEntity>>;
  /** List all installed skills */
  installedSkills?: Maybe<Array<InstalledSkill>>;
  /** List all registered integrations */
  integrations?: Maybe<Array<IntegrationInfo>>;
  /** Check if a path is inside a git repository */
  isGitRepo?: Maybe<Scalars['Boolean']['output']>;
  /** Check if the agent is running for a workstream */
  isWorkstreamAgentRunning?: Maybe<Scalars['Boolean']['output']>;
  /** List all active LSP server instances and their status */
  lspServers?: Maybe<Array<LspServerStatus>>;
  permissionPolicy?: Maybe<PermissionPolicy>;
  /** Get a permission template by ID */
  permissionTemplate?: Maybe<PermissionTemplate>;
  /** List all permission templates */
  permissionTemplates?: Maybe<Array<PermissionTemplate>>;
  /** Get a project by ID */
  project?: Maybe<Project>;
  /** List all directories for a project */
  projectDirectories?: Maybe<Array<ProjectDirectory>>;
  /** List all projects */
  projects?: Maybe<Array<Project>>;
  /** List all registries */
  registries?: Maybe<Array<Registry>>;
  registry?: Maybe<Registry>;
  /** Default quick action IDs from the highest-priority registry */
  registryQuickActionDefaults?: Maybe<Array<Scalars['String']['output']>>;
  /** Merged quick actions from all enabled registries (priority-ordered) */
  registryQuickActions?: Maybe<Array<QuickAction>>;
  /** Default skill IDs from the highest-priority registry */
  registrySkillDefaults?: Maybe<Array<Scalars['String']['output']>>;
  /** List all available skills from enabled registries */
  registrySkills?: Maybe<Array<RegistrySkill>>;
  /** Default verification actions from the highest-priority registry */
  registryVerificationActionDefaults?: Maybe<Array<VerificationAction>>;
  /** Merged verification actions from all enabled registries (priority-ordered) */
  registryVerificationActions?: Maybe<Array<VerificationAction>>;
  /** Resolve context text for a linked entity. Uses the entity definition's resolveContext if available, otherwise builds generic context from metadata. */
  resolveLinkedEntityContext?: Maybe<Scalars['String']['output']>;
  resolvedParentPermissions?: Maybe<Array<PermissionRuleConfig>>;
  resolvedPermissions?: Maybe<Array<PermissionRuleConfig>>;
  routine?: Maybe<Routine>;
  /** Get a routine by its associated workstream ID */
  routineByWorkstreamId?: Maybe<Routine>;
  /** Get the most recent run for a routine */
  routineLatestRun?: Maybe<RoutineRun>;
  routineRunHistory?: Maybe<Array<RoutineRun>>;
  /** List all routines */
  routines?: Maybe<Array<Routine>>;
  /** List routines belonging to a project (via their workstream) */
  routinesByProject?: Maybe<Array<Routine>>;
  /** Search issues across all repos using GitHub search syntax (e.g. "repo:owner/name state:closed"). Best for finding issues by state, label, or across repos. */
  searchGithubIssues?: Maybe<Array<GitHubIssue>>;
  /** Search pull requests across all repos using GitHub search syntax (e.g. "repo:owner/name state:open") */
  searchGithubPRs?: Maybe<Array<GitHubPr>>;
  /** Get all app settings (with defaults for unset values) */
  settings?: Maybe<Settings>;
  /** Check for version updates on installed skills */
  skillUpdates?: Maybe<Array<SkillUpdate>>;
  /** Find a tag by name within a project (searches merged set) */
  tagByName?: Maybe<Tag>;
  /** List all merged tags for a project (global + project overrides) */
  tagsByProject?: Maybe<Array<Tag>>;
  /** Get 7-day weather forecast for a location */
  weatherForecast?: Maybe<Array<WeatherDayForecast>>;
  /** Search for locations by name (geocoding) */
  weatherGeocodingSearch?: Maybe<Array<WeatherGeocodingResult>>;
  /** Get a workstream by ID */
  workstream?: Maybe<Workstream>;
  /** Get working directories for a workstream */
  workstreamDirectories?: Maybe<Array<WorkstreamDirectory>>;
  /** Get a workstream group by ID */
  workstreamGroup?: Maybe<WorkstreamGroup>;
  /** List workstream groups for a project (pinned first) */
  workstreamGroupsByProject?: Maybe<Array<WorkstreamGroup>>;
  /** Get entities linked to a workstream (includes group-inherited entities) */
  workstreamLinkedEntities?: Maybe<Array<WorkstreamLinkedEntity>>;
  /** Get all tags applied to a workstream (snapshot data) */
  workstreamTags?: Maybe<Array<WorkstreamTag>>;
  /** Find all workstreams linked to a given entity URI (includes group-inherited links) */
  workstreamsByEntity?: Maybe<Array<WorkstreamEntityLink>>;
  /** List non-archived workstreams for a project (pinned first) */
  workstreamsByProject?: Maybe<Array<Workstream>>;
};


export type QueryArchivedWorkstreamsArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryBranchSelectionsArgs = {
  workstreamId: Scalars['ID']['input'];
};


export type QueryCommandsArgs = {
  categoryFilter?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDirectoriesWithBranchInfoArgs = {
  workstreamId: Scalars['ID']['input'];
};


export type QueryEntitiesArgs = {
  filters?: InputMaybe<Scalars['JSON']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
};


export type QueryEntityArgs = {
  uri: Scalars['String']['input'];
};


export type QueryEntitySearchArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  types?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryGitBranchDiffArgs = {
  base: Scalars['String']['input'];
  path: Scalars['String']['input'];
};


export type QueryGitBranchesArgs = {
  path: Scalars['String']['input'];
};


export type QueryGitCommitDiffArgs = {
  hash: Scalars['String']['input'];
  path: Scalars['String']['input'];
};


export type QueryGitCommitLogArgs = {
  base: Scalars['String']['input'];
  path: Scalars['String']['input'];
};


export type QueryGitCurrentBranchArgs = {
  path: Scalars['String']['input'];
};


export type QueryGitDefaultBranchArgs = {
  path: Scalars['String']['input'];
};


export type QueryGitDiffSummaryArgs = {
  base: Scalars['String']['input'];
  path: Scalars['String']['input'];
};


export type QueryGitFileAtRefArgs = {
  filePath: Scalars['String']['input'];
  path: Scalars['String']['input'];
  ref?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGitFileDiffArgs = {
  base?: InputMaybe<Scalars['String']['input']>;
  filePath: Scalars['String']['input'];
  path: Scalars['String']['input'];
};


export type QueryGitStatusFilesArgs = {
  path: Scalars['String']['input'];
};


export type QueryGitWorkingTreeDiffArgs = {
  path: Scalars['String']['input'];
};


export type QueryGitWorkingTreeSummaryArgs = {
  path: Scalars['String']['input'];
};


export type QueryGithubCheckRunsArgs = {
  owner: Scalars['String']['input'];
  ref: Scalars['String']['input'];
  repo: Scalars['String']['input'];
};


export type QueryGithubIssueArgs = {
  issueNumber: Scalars['Int']['input'];
  owner: Scalars['String']['input'];
  repo: Scalars['String']['input'];
};


export type QueryGithubIssuesArgs = {
  assignee?: InputMaybe<Scalars['String']['input']>;
  labels?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  owner: Scalars['String']['input'];
  repo: Scalars['String']['input'];
  state?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGithubMyIssuesArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGithubMyPRsArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGithubPrArgs = {
  owner: Scalars['String']['input'];
  pullNumber: Scalars['Int']['input'];
  repo: Scalars['String']['input'];
};


export type QueryGithubPrCommentsArgs = {
  owner: Scalars['String']['input'];
  pullNumber: Scalars['Int']['input'];
  repo: Scalars['String']['input'];
};


export type QueryGithubPrFilesArgs = {
  owner: Scalars['String']['input'];
  pullNumber: Scalars['Int']['input'];
  repo: Scalars['String']['input'];
};


export type QueryGithubPrReviewsArgs = {
  owner: Scalars['String']['input'];
  pullNumber: Scalars['Int']['input'];
  repo: Scalars['String']['input'];
};


export type QueryGithubPRsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  owner: Scalars['String']['input'];
  repo: Scalars['String']['input'];
  state?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGithubRepoCollaboratorsArgs = {
  owner: Scalars['String']['input'];
  repo: Scalars['String']['input'];
};


export type QueryGithubRepoLabelsArgs = {
  owner: Scalars['String']['input'];
  repo: Scalars['String']['input'];
};


export type QueryGithubReposArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGithubWorkflowRunArgs = {
  owner: Scalars['String']['input'];
  repo: Scalars['String']['input'];
  runId: Scalars['Int']['input'];
};


export type QueryGithubWorkflowRunsArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  owner: Scalars['String']['input'];
  repo: Scalars['String']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGroupDirectoriesArgs = {
  groupId: Scalars['ID']['input'];
};


export type QueryGroupLinkedEntitiesArgs = {
  groupId: Scalars['ID']['input'];
};


export type QueryIsGitRepoArgs = {
  path: Scalars['String']['input'];
};


export type QueryIsWorkstreamAgentRunningArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPermissionPolicyArgs = {
  scopeId: Scalars['String']['input'];
  scopeType: PermissionScopeType;
};


export type QueryPermissionTemplateArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProjectArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProjectDirectoriesArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryRegistryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryResolveLinkedEntityContextArgs = {
  entityUri: Scalars['String']['input'];
};


export type QueryResolvedParentPermissionsArgs = {
  scopeId: Scalars['String']['input'];
  scopeType: PermissionScopeType;
};


export type QueryResolvedPermissionsArgs = {
  workstreamId: Scalars['ID']['input'];
};


export type QueryRoutineArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRoutineByWorkstreamIdArgs = {
  workstreamId: Scalars['ID']['input'];
};


export type QueryRoutineLatestRunArgs = {
  routineId: Scalars['ID']['input'];
};


export type QueryRoutineRunHistoryArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  routineId: Scalars['ID']['input'];
};


export type QueryRoutinesByProjectArgs = {
  projectId: Scalars['ID']['input'];
};


export type QuerySearchGithubIssuesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};


export type QuerySearchGithubPRsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};


export type QueryTagByNameArgs = {
  name: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};


export type QueryTagsByProjectArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryWeatherForecastArgs = {
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
  units: Scalars['String']['input'];
};


export type QueryWeatherGeocodingSearchArgs = {
  query: Scalars['String']['input'];
};


export type QueryWorkstreamArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWorkstreamDirectoriesArgs = {
  workstreamId: Scalars['ID']['input'];
};


export type QueryWorkstreamGroupArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWorkstreamGroupsByProjectArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryWorkstreamLinkedEntitiesArgs = {
  workstreamId: Scalars['ID']['input'];
};


export type QueryWorkstreamTagsArgs = {
  workstreamId: Scalars['ID']['input'];
};


export type QueryWorkstreamsByEntityArgs = {
  entityUri: Scalars['String']['input'];
};


export type QueryWorkstreamsByProjectArgs = {
  projectId: Scalars['ID']['input'];
};

/** A quick action provided by a registry */
export type QuickAction = {
  __typename?: 'QuickAction';
  author?: Maybe<QuickActionAuthor>;
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<QuickActionOption>>;
  registry?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<Scalars['String']['output']>>;
};

/** Author of a quick action */
export type QuickActionAuthor = {
  __typename?: 'QuickActionAuthor';
  name?: Maybe<Scalars['String']['output']>;
};

/** A selectable option within a quick action */
export type QuickActionOption = {
  __typename?: 'QuickActionOption';
  id?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  prompt?: Maybe<Scalars['String']['output']>;
};

/** A Git-backed registry providing shareable content (quick actions, etc.) */
export type Registry = {
  __typename?: 'Registry';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  enabled?: Maybe<Scalars['Boolean']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  priority?: Maybe<Scalars['Int']['output']>;
  source?: Maybe<RegistrySource>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

/** A skill available in a registry (not yet installed) */
export type RegistrySkill = {
  __typename?: 'RegistrySkill';
  author?: Maybe<RegistrySkillAuthor>;
  category?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  registry?: Maybe<Scalars['String']['output']>;
  repo?: Maybe<Scalars['String']['output']>;
  source?: Maybe<SkillSource>;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  version?: Maybe<Scalars['String']['output']>;
};

/** Author of a registry skill */
export type RegistrySkillAuthor = {
  __typename?: 'RegistrySkillAuthor';
  name?: Maybe<Scalars['String']['output']>;
};

export type RegistrySource =
  | 'local'
  | 'organization';

export type RemoveBranchSelectionPayload = {
  __typename?: 'RemoveBranchSelectionPayload';
  removed?: Maybe<Scalars['Boolean']['output']>;
};

export type RemoveGroupBranchSelectionPayload = {
  __typename?: 'RemoveGroupBranchSelectionPayload';
  group?: Maybe<WorkstreamGroup>;
};

export type RemoveGroupDirectoryPayload = {
  __typename?: 'RemoveGroupDirectoryPayload';
  group?: Maybe<WorkstreamGroup>;
};

export type RemoveProjectDirectoryPayload = {
  __typename?: 'RemoveProjectDirectoryPayload';
  project?: Maybe<Project>;
  removed?: Maybe<Scalars['Boolean']['output']>;
};

export type RemoveRegistryPayload = {
  __typename?: 'RemoveRegistryPayload';
  registry?: Maybe<Registry>;
};

export type RemoveTagPayload = {
  __typename?: 'RemoveTagPayload';
  success?: Maybe<Scalars['Boolean']['output']>;
};

export type RemoveWorkstreamDirectoryPayload = {
  __typename?: 'RemoveWorkstreamDirectoryPayload';
  workstream?: Maybe<Workstream>;
};

export type RemoveWorkstreamFromGroupPayload = {
  __typename?: 'RemoveWorkstreamFromGroupPayload';
  workstream?: Maybe<Workstream>;
};

export type ReplayHistoryPayload = {
  __typename?: 'ReplayHistoryPayload';
  hasMore?: Maybe<Scalars['Boolean']['output']>;
  oldestEventId?: Maybe<Scalars['Int']['output']>;
  workstream?: Maybe<Workstream>;
};

export type RequestReviewInput = {
  owner: Scalars['String']['input'];
  pullNumber: Scalars['Int']['input'];
  repo: Scalars['String']['input'];
  /** GitHub usernames */
  reviewers?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Team slugs */
  teamReviewers?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type RerunWorkflowInput = {
  owner: Scalars['String']['input'];
  repo: Scalars['String']['input'];
  runId: Scalars['Int']['input'];
};

export type RespondWorkstreamPermissionPayload = {
  __typename?: 'RespondWorkstreamPermissionPayload';
  workstream?: Maybe<Workstream>;
};

export type RestartWorkstreamAgentPayload = {
  __typename?: 'RestartWorkstreamAgentPayload';
  workstream?: Maybe<Workstream>;
};

export type ResumeRoutinePayload = {
  __typename?: 'ResumeRoutinePayload';
  routine?: Maybe<Routine>;
};

export type RevokePermissionRulePayload = {
  __typename?: 'RevokePermissionRulePayload';
  workstream?: Maybe<Workstream>;
};

/** A scheduled workstream that runs on a cron or interval */
export type Routine = {
  __typename?: 'Routine';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  lastRunAt?: Maybe<Scalars['DateTime']['output']>;
  /** The most recent run record */
  latestRun?: Maybe<RoutineRun>;
  name?: Maybe<Scalars['String']['output']>;
  nextRunAt?: Maybe<Scalars['DateTime']['output']>;
  preferences?: Maybe<Scalars['JSON']['output']>;
  prompt?: Maybe<Scalars['String']['output']>;
  runCount?: Maybe<Scalars['Int']['output']>;
  /** Recent execution history */
  runs?: Maybe<Array<RoutineRun>>;
  schedule?: Maybe<RoutineSchedule>;
  status?: Maybe<RoutineStatus>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The dedicated workstream for this routine */
  workstream?: Maybe<Workstream>;
  workstreamId?: Maybe<Scalars['String']['output']>;
};


/** A scheduled workstream that runs on a cron or interval */
export type RoutineRunsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};

/** A single execution record for a routine */
export type RoutineRun = {
  __typename?: 'RoutineRun';
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  metadata?: Maybe<Scalars['JSON']['output']>;
  routineId?: Maybe<Scalars['String']['output']>;
  startedAt?: Maybe<Scalars['DateTime']['output']>;
  status?: Maybe<RoutineRunStatus>;
  summary?: Maybe<Scalars['String']['output']>;
  triggeredBy?: Maybe<RoutineRunTriggeredBy>;
};

export type RoutineRunStatus =
  | 'completed'
  | 'failed'
  | 'pending'
  | 'running'
  | 'skipped';

export type RoutineRunTriggeredBy =
  | 'manual'
  | 'retry'
  | 'schedule';

/** Schedule configuration for a routine */
export type RoutineSchedule = {
  __typename?: 'RoutineSchedule';
  expression?: Maybe<Scalars['String']['output']>;
  timezone?: Maybe<Scalars['String']['output']>;
  type?: Maybe<ScheduleType>;
};

export type RoutineScheduleInput = {
  expression: Scalars['String']['input'];
  timezone?: InputMaybe<Scalars['String']['input']>;
  type: ScheduleType;
};

export type RoutineStatus =
  | 'active'
  | 'disabled'
  | 'paused';

export type RunRoutineNowPayload = {
  __typename?: 'RunRoutineNowPayload';
  routine?: Maybe<Routine>;
};

export type ScheduleType =
  | 'cron'
  | 'interval';

export type SendWorkstreamMessagePayload = {
  __typename?: 'SendWorkstreamMessagePayload';
  workstream?: Maybe<Workstream>;
};

export type SetBranchSelectionPayload = {
  __typename?: 'SetBranchSelectionPayload';
  branchSelection?: Maybe<BranchSelection>;
  /** Error if worktree creation failed (branch selection still saved without worktree) */
  worktreeError?: Maybe<Scalars['String']['output']>;
};

export type SetGroupBranchSelectionPayload = {
  __typename?: 'SetGroupBranchSelectionPayload';
  group?: Maybe<WorkstreamGroup>;
};

export type SetLinkedEntityContextOverridePayload = {
  __typename?: 'SetLinkedEntityContextOverridePayload';
  workstream?: Maybe<Workstream>;
};

export type SetWorkstreamInFocusPayload = {
  __typename?: 'SetWorkstreamInFocusPayload';
  workstream?: Maybe<Workstream>;
};

/** App-level settings (all categories) */
export type Settings = {
  __typename?: 'Settings';
  advanced?: Maybe<AdvancedSettings>;
  ai?: Maybe<AiSettings>;
  appearance?: Maybe<AppearanceSettings>;
  permissionTemplates?: Maybe<PermissionTemplatesSettings>;
  permissions?: Maybe<PermissionsSettings>;
};

export type SkillSource =
  | 'github'
  | 'inline'
  | 'local';

/** Version update information for an installed skill */
export type SkillUpdate = {
  __typename?: 'SkillUpdate';
  id?: Maybe<Scalars['String']['output']>;
  installedVersion?: Maybe<Scalars['String']['output']>;
  registryVersion?: Maybe<Scalars['String']['output']>;
};

export type StopWorkstreamAgentPayload = {
  __typename?: 'StopWorkstreamAgentPayload';
  workstream?: Maybe<Workstream>;
};

export type SubmitReviewInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  /** APPROVE, REQUEST_CHANGES, or COMMENT */
  event: Scalars['String']['input'];
  owner: Scalars['String']['input'];
  pullNumber: Scalars['Int']['input'];
  repo: Scalars['String']['input'];
};

export type SwitchWorkstreamModelPayload = {
  __typename?: 'SwitchWorkstreamModelPayload';
  workstream?: Maybe<Workstream>;
};

export type SyncRegistriesPayload = {
  __typename?: 'SyncRegistriesPayload';
  synced?: Maybe<Scalars['Int']['output']>;
};

/** A tag definition (from JSON file) */
export type Tag = {
  __typename?: 'Tag';
  color?: Maybe<Scalars['String']['output']>;
  dependsOn?: Maybe<Array<Scalars['String']['output']>>;
  instructions?: Maybe<Scalars['String']['output']>;
  maxDepth?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  spawnWorkstream?: Maybe<Scalars['Boolean']['output']>;
  worktreeMode?: Maybe<WorktreeMode>;
};

export type Theme =
  | 'dark'
  | 'light'
  | 'system';

export type ToggleSkillPayload = {
  __typename?: 'ToggleSkillPayload';
  skill?: Maybe<InstalledSkill>;
};

export type UnarchiveWorkstreamPayload = {
  __typename?: 'UnarchiveWorkstreamPayload';
  workstream?: Maybe<Workstream>;
};

export type UninstallSkillPayload = {
  __typename?: 'UninstallSkillPayload';
  success?: Maybe<Scalars['Boolean']['output']>;
};

export type UnlinkGroupEntityPayload = {
  __typename?: 'UnlinkGroupEntityPayload';
  group?: Maybe<WorkstreamGroup>;
};

export type UnlinkWorkstreamEntityPayload = {
  __typename?: 'UnlinkWorkstreamEntityPayload';
  workstream?: Maybe<Workstream>;
};

export type UnpinWorkstreamGroupPayload = {
  __typename?: 'UnpinWorkstreamGroupPayload';
  group?: Maybe<WorkstreamGroup>;
};

export type UnpinWorkstreamPayload = {
  __typename?: 'UnpinWorkstreamPayload';
  workstream?: Maybe<Workstream>;
};

export type UpdateAdvancedSettingsInput = {
  debugMode?: InputMaybe<Scalars['Boolean']['input']>;
  developerMode?: InputMaybe<Scalars['Boolean']['input']>;
  profilerEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  reactScanEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  telemetryEnabled?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateAiSettingsInput = {
  autoCompactPercent?: InputMaybe<Scalars['Int']['input']>;
  cliPath?: InputMaybe<Scalars['String']['input']>;
  cliSetupComplete?: InputMaybe<Scalars['Boolean']['input']>;
  defaultModel?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateAppearanceSettingsInput = {
  compactMode?: InputMaybe<Scalars['Boolean']['input']>;
  fontSize?: InputMaybe<Scalars['Int']['input']>;
  theme?: InputMaybe<Theme>;
};

export type UpdateGitHubIssueInput = {
  assignees?: InputMaybe<Array<Scalars['String']['input']>>;
  body?: InputMaybe<Scalars['String']['input']>;
  issueNumber: Scalars['Int']['input'];
  labels?: InputMaybe<Array<Scalars['String']['input']>>;
  owner: Scalars['String']['input'];
  repo: Scalars['String']['input'];
  /** "open" or "closed" */
  state?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateGitHubPrInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  owner: Scalars['String']['input'];
  pullNumber: Scalars['Int']['input'];
  repo: Scalars['String']['input'];
  /** "open" or "closed" */
  state?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePermissionsSettingsInput = {
  activePreset?: InputMaybe<PermissionPreset>;
  rules?: InputMaybe<Array<PermissionRuleConfigInput>>;
};

export type UpdateProjectInput = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateRegistryInput = {
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateRegistryPayload = {
  __typename?: 'UpdateRegistryPayload';
  registry?: Maybe<Registry>;
};

export type UpdateRoutineInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  preferences?: InputMaybe<Scalars['JSON']['input']>;
  prompt?: InputMaybe<Scalars['String']['input']>;
  schedule?: InputMaybe<RoutineScheduleInput>;
};

export type UpdateRoutinePayload = {
  __typename?: 'UpdateRoutinePayload';
  routine?: Maybe<Routine>;
};

export type UpdateSkillPayload = {
  __typename?: 'UpdateSkillPayload';
  skill?: Maybe<InstalledSkill>;
};

export type UpdateTagInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  dependsOn?: InputMaybe<Array<Scalars['String']['input']>>;
  instructions?: InputMaybe<Scalars['String']['input']>;
  maxDepth?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  spawnWorkstream?: InputMaybe<Scalars['Boolean']['input']>;
  worktreeMode?: InputMaybe<WorktreeMode>;
};

export type UpdateTagPayload = {
  __typename?: 'UpdateTagPayload';
  tag?: Maybe<Tag>;
};

export type UpdateWorkstreamGroupInput = {
  autoCreateWorktrees?: InputMaybe<Scalars['Boolean']['input']>;
  isPinned?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWorkstreamGroupPayload = {
  __typename?: 'UpdateWorkstreamGroupPayload';
  group?: Maybe<WorkstreamGroup>;
};

export type UpdateWorkstreamInput = {
  groupId?: InputMaybe<Scalars['ID']['input']>;
  isPinned?: InputMaybe<Scalars['Boolean']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<WorkstreamStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWorkstreamPayload = {
  __typename?: 'UpdateWorkstreamPayload';
  workstream?: Maybe<Workstream>;
};

/** A post-verification action (builtin lifecycle or prompt-based) */
export type VerificationAction = {
  __typename?: 'VerificationAction';
  builtinId?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  prompt?: Maybe<Scalars['String']['output']>;
  type?: Maybe<VerificationActionType>;
};

export type VerificationActionType =
  | 'builtin'
  | 'prompt';

/** Daily weather forecast with hourly breakdown */
export type WeatherDayForecast = {
  __typename?: 'WeatherDayForecast';
  condition?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  dayName?: Maybe<Scalars['String']['output']>;
  high?: Maybe<Scalars['Int']['output']>;
  hourly?: Maybe<Array<WeatherHourlyForecast>>;
  icon?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  low?: Maybe<Scalars['Int']['output']>;
  precipitation?: Maybe<Scalars['Int']['output']>;
};

/** A geocoding result from location search */
export type WeatherGeocodingResult = {
  __typename?: 'WeatherGeocodingResult';
  admin1?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

/** Hourly weather forecast data */
export type WeatherHourlyForecast = {
  __typename?: 'WeatherHourlyForecast';
  condition?: Maybe<Scalars['String']['output']>;
  hour?: Maybe<Scalars['Int']['output']>;
  humidity?: Maybe<Scalars['Int']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  precipitation?: Maybe<Scalars['Int']['output']>;
  temp?: Maybe<Scalars['Int']['output']>;
  wind?: Maybe<Scalars['Int']['output']>;
};

/** A conversation within a project */
export type Workstream = {
  __typename?: 'Workstream';
  activeSessionId?: Maybe<Scalars['String']['output']>;
  /** Branch selections for this workstream's directories */
  branchSelections?: Maybe<Array<BranchSelection>>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** Working directories for this workstream */
  directories?: Maybe<Array<WorkstreamDirectory>>;
  /** Directories with computed branch/worktree info */
  directoriesWithBranchInfo?: Maybe<Array<DirectoryWithBranchInfo>>;
  /** The workstream group this workstream belongs to (if any) */
  group?: Maybe<WorkstreamGroup>;
  groupId?: Maybe<Scalars['ID']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isPinned?: Maybe<Scalars['Boolean']['output']>;
  isRoutineWorkstream?: Maybe<Scalars['Boolean']['output']>;
  lastActivityAt?: Maybe<Scalars['DateTime']['output']>;
  /** Entities linked to this workstream as persistent context (includes group-inherited) */
  linkedEntities?: Maybe<Array<WorkstreamLinkedEntity>>;
  messageCount?: Maybe<Scalars['Int']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  /** The project this workstream belongs to */
  project?: Maybe<Project>;
  status?: Maybe<WorkstreamStatus>;
  /** Tags applied to this workstream with execution status */
  tags?: Maybe<Array<WorkstreamTag>>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

/** A working directory associated with a workstream */
export type WorkstreamDirectory = {
  __typename?: 'WorkstreamDirectory';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isInherited?: Maybe<Scalars['Boolean']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  path?: Maybe<Scalars['String']['output']>;
  workstreamId?: Maybe<Scalars['ID']['output']>;
};

/** A link from an entity to a workstream (reverse lookup result) */
export type WorkstreamEntityLink = {
  __typename?: 'WorkstreamEntityLink';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  entityTitle?: Maybe<Scalars['String']['output']>;
  entityType?: Maybe<Scalars['String']['output']>;
  entityUri?: Maybe<Scalars['String']['output']>;
  groupId?: Maybe<Scalars['ID']['output']>;
  /** The linked workstream */
  workstream?: Maybe<Workstream>;
  workstreamId?: Maybe<Scalars['ID']['output']>;
};

/** A named collection of related workstreams within a project */
export type WorkstreamGroup = {
  __typename?: 'WorkstreamGroup';
  autoCreateWorktrees?: Maybe<Scalars['Boolean']['output']>;
  /** Default branch selections for group directories (inherited on workstream creation) */
  branchSelections?: Maybe<Array<GroupBranchSelection>>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** Priority-derived status from child workstreams (highest priority wins). Used for collapsed nav display. */
  derivedStatus?: Maybe<WorkstreamStatus>;
  /** Shared directories for this group (inherited by workstreams on creation) */
  directories?: Maybe<Array<GroupDirectory>>;
  id?: Maybe<Scalars['ID']['output']>;
  isPinned?: Maybe<Scalars['Boolean']['output']>;
  /** Entities linked to this group (inherited by all workstreams) */
  linkedEntities?: Maybe<Array<GroupLinkedEntity>>;
  name?: Maybe<Scalars['String']['output']>;
  /** The project this group belongs to */
  project?: Maybe<Project>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Non-archived workstreams in this group */
  workstreams?: Maybe<Array<Workstream>>;
};

/** An entity linked to a workstream as persistent context */
export type WorkstreamLinkedEntity = {
  __typename?: 'WorkstreamLinkedEntity';
  contextOverride?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  entityTitle?: Maybe<Scalars['String']['output']>;
  entityType?: Maybe<Scalars['String']['output']>;
  entityUri?: Maybe<Scalars['String']['output']>;
  isInherited?: Maybe<Scalars['Boolean']['output']>;
  workstreamId?: Maybe<Scalars['ID']['output']>;
};

export type WorkstreamStatus =
  | 'active'
  | 'archived'
  | 'completed_unviewed'
  | 'idle'
  | 'needs_review'
  | 'processing'
  | 'waiting_permission';

/** A tag applied to a workstream with snapshot data and execution status */
export type WorkstreamTag = {
  __typename?: 'WorkstreamTag';
  appliedAt?: Maybe<Scalars['DateTime']['output']>;
  appliedBy?: Maybe<WorkstreamTagAppliedBy>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  delegatedWorkstreamId?: Maybe<Scalars['ID']['output']>;
  depth?: Maybe<Scalars['Int']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  sourceWorkstreamTagId?: Maybe<Scalars['ID']['output']>;
  startedAt?: Maybe<Scalars['DateTime']['output']>;
  status?: Maybe<WorkstreamTagStatus>;
  /** Current tag definition (null if tag was deleted) */
  tag?: Maybe<Tag>;
  tagColor?: Maybe<Scalars['String']['output']>;
  tagDependsOn?: Maybe<Array<Scalars['String']['output']>>;
  tagInstructions?: Maybe<Scalars['String']['output']>;
  tagMaxDepth?: Maybe<Scalars['Int']['output']>;
  tagName?: Maybe<Scalars['String']['output']>;
  tagSpawnWorkstream?: Maybe<Scalars['Boolean']['output']>;
  tagWorktreeMode?: Maybe<WorktreeMode>;
  workstreamId?: Maybe<Scalars['ID']['output']>;
};

export type WorkstreamTagAppliedBy =
  | 'agent'
  | 'manual'
  | 'pipeline'
  | 'trigger';

export type WorkstreamTagStatus =
  | 'completed'
  | 'failed'
  | 'pending'
  | 'running'
  | 'skipped';

export type WorktreeMode =
  | 'fork'
  | 'from_main'
  | 'same';

export type GetWeatherForecastQueryVariables = Exact<{
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
  units: Scalars['String']['input'];
}>;


export type GetWeatherForecastQuery = { __typename?: 'Query', weatherForecast?: Array<{ __typename?: 'WeatherDayForecast', id?: string | null, date?: string | null, dayName?: string | null, high?: number | null, low?: number | null, condition?: string | null, icon?: string | null, precipitation?: number | null, hourly?: Array<{ __typename?: 'WeatherHourlyForecast', hour?: number | null, temp?: number | null, condition?: string | null, icon?: string | null, precipitation?: number | null, humidity?: number | null, wind?: number | null }> | null }> | null };

export type SearchWeatherLocationsQueryVariables = Exact<{
  query: Scalars['String']['input'];
}>;


export type SearchWeatherLocationsQuery = { __typename?: 'Query', weatherGeocodingSearch?: Array<{ __typename?: 'WeatherGeocodingResult', id?: string | null, name?: string | null, country?: string | null, admin1?: string | null, latitude?: number | null, longitude?: number | null }> | null };


export const GetWeatherForecastDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWeatherForecast"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"latitude"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"longitude"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"units"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"weatherForecast"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"latitude"},"value":{"kind":"Variable","name":{"kind":"Name","value":"latitude"}}},{"kind":"Argument","name":{"kind":"Name","value":"longitude"},"value":{"kind":"Variable","name":{"kind":"Name","value":"longitude"}}},{"kind":"Argument","name":{"kind":"Name","value":"units"},"value":{"kind":"Variable","name":{"kind":"Name","value":"units"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"dayName"}},{"kind":"Field","name":{"kind":"Name","value":"high"}},{"kind":"Field","name":{"kind":"Name","value":"low"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"precipitation"}},{"kind":"Field","name":{"kind":"Name","value":"hourly"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hour"}},{"kind":"Field","name":{"kind":"Name","value":"temp"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"precipitation"}},{"kind":"Field","name":{"kind":"Name","value":"humidity"}},{"kind":"Field","name":{"kind":"Name","value":"wind"}}]}}]}}]}}]} as unknown as DocumentNode<GetWeatherForecastQuery, GetWeatherForecastQueryVariables>;
export const SearchWeatherLocationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchWeatherLocations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"weatherGeocodingSearch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"admin1"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}}]}}]} as unknown as DocumentNode<SearchWeatherLocationsQuery, SearchWeatherLocationsQueryVariables>;
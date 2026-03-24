/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query GetMyPRs($filter: String, $state: String, $limit: Int) {\n    githubMyPRs(filter: $filter, state: $state, limit: $limit) {\n      id\n      number\n      title\n      state\n      draft\n      owner\n      repo\n      headBranch\n      checksStatus\n      reviewState\n      url\n      updatedAt\n    }\n  }\n": typeof types.GetMyPRsDocument,
    "\n  query GetMyIssues($query: String!, $limit: Int) {\n    searchGithubIssues(query: $query, limit: $limit) {\n      id\n      number\n      title\n      state\n      owner\n      repo\n      labels {\n        name\n        color\n      }\n      url\n      updatedAt\n    }\n  }\n": typeof types.GetMyIssuesDocument,
    "\n  query GetGitHubPR($owner: String!, $repo: String!, $pullNumber: Int!) {\n    githubPR(owner: $owner, repo: $repo, pullNumber: $pullNumber) {\n      id\n      number\n      title\n      state\n      draft\n      author\n      authorAvatar\n      owner\n      repo\n      headBranch\n      baseBranch\n      body\n      additions\n      deletions\n      changedFiles\n      mergeable\n      reviewState\n      checksStatus\n      labels { name color }\n      reviewers\n      url\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.GetGitHubPrDocument,
    "\n  mutation MergeGitHubPR($input: MergePRInput!) {\n    githubMergePR(input: $input) {\n      id number title state draft owner repo mergeableState\n    }\n  }\n": typeof types.MergeGitHubPrDocument,
    "\n  mutation UpdateGitHubPR($input: UpdateGitHubPRInput!) {\n    githubUpdatePR(input: $input) {\n      id number title state body owner repo\n      labels { name color }\n      reviewers\n    }\n  }\n": typeof types.UpdateGitHubPrDocument,
    "\n  query GetGitHubIssue($owner: String!, $repo: String!, $issueNumber: Int!) {\n    githubIssue(owner: $owner, repo: $repo, issueNumber: $issueNumber) {\n      id\n      number\n      title\n      state\n      author\n      authorAvatar\n      owner\n      repo\n      body\n      labels { name color }\n      assignees\n      commentCount\n      url\n      createdAt\n      updatedAt\n      closedAt\n    }\n  }\n": typeof types.GetGitHubIssueDocument,
    "\n  mutation UpdateGitHubIssue($input: UpdateGitHubIssueInput!) {\n    githubUpdateIssue(input: $input) {\n      id number title state body owner repo\n      labels { name color }\n      assignees\n      commentCount\n    }\n  }\n": typeof types.UpdateGitHubIssueDocument,
    "\n  query GetRepoLabels($owner: String!, $repo: String!) {\n    githubRepoLabels(owner: $owner, repo: $repo) {\n      name\n      color\n    }\n  }\n": typeof types.GetRepoLabelsDocument,
    "\n  query GetRepoCollaborators($owner: String!, $repo: String!) {\n    githubRepoCollaborators(owner: $owner, repo: $repo) {\n      login\n      avatarUrl\n    }\n  }\n": typeof types.GetRepoCollaboratorsDocument,
    "\n  mutation AddGitHubIssueComment($input: AddIssueCommentInput!) {\n    githubAddIssueComment(input: $input) {\n      id number title state owner repo commentCount\n    }\n  }\n": typeof types.AddGitHubIssueCommentDocument,
    "\n  mutation AddGitHubPRComment($input: AddPRCommentInput!) {\n    githubAddPRComment(input: $input) {\n      id number title state owner repo\n    }\n  }\n": typeof types.AddGitHubPrCommentDocument,
};
const documents: Documents = {
    "\n  query GetMyPRs($filter: String, $state: String, $limit: Int) {\n    githubMyPRs(filter: $filter, state: $state, limit: $limit) {\n      id\n      number\n      title\n      state\n      draft\n      owner\n      repo\n      headBranch\n      checksStatus\n      reviewState\n      url\n      updatedAt\n    }\n  }\n": types.GetMyPRsDocument,
    "\n  query GetMyIssues($query: String!, $limit: Int) {\n    searchGithubIssues(query: $query, limit: $limit) {\n      id\n      number\n      title\n      state\n      owner\n      repo\n      labels {\n        name\n        color\n      }\n      url\n      updatedAt\n    }\n  }\n": types.GetMyIssuesDocument,
    "\n  query GetGitHubPR($owner: String!, $repo: String!, $pullNumber: Int!) {\n    githubPR(owner: $owner, repo: $repo, pullNumber: $pullNumber) {\n      id\n      number\n      title\n      state\n      draft\n      author\n      authorAvatar\n      owner\n      repo\n      headBranch\n      baseBranch\n      body\n      additions\n      deletions\n      changedFiles\n      mergeable\n      reviewState\n      checksStatus\n      labels { name color }\n      reviewers\n      url\n      createdAt\n      updatedAt\n    }\n  }\n": types.GetGitHubPrDocument,
    "\n  mutation MergeGitHubPR($input: MergePRInput!) {\n    githubMergePR(input: $input) {\n      id number title state draft owner repo mergeableState\n    }\n  }\n": types.MergeGitHubPrDocument,
    "\n  mutation UpdateGitHubPR($input: UpdateGitHubPRInput!) {\n    githubUpdatePR(input: $input) {\n      id number title state body owner repo\n      labels { name color }\n      reviewers\n    }\n  }\n": types.UpdateGitHubPrDocument,
    "\n  query GetGitHubIssue($owner: String!, $repo: String!, $issueNumber: Int!) {\n    githubIssue(owner: $owner, repo: $repo, issueNumber: $issueNumber) {\n      id\n      number\n      title\n      state\n      author\n      authorAvatar\n      owner\n      repo\n      body\n      labels { name color }\n      assignees\n      commentCount\n      url\n      createdAt\n      updatedAt\n      closedAt\n    }\n  }\n": types.GetGitHubIssueDocument,
    "\n  mutation UpdateGitHubIssue($input: UpdateGitHubIssueInput!) {\n    githubUpdateIssue(input: $input) {\n      id number title state body owner repo\n      labels { name color }\n      assignees\n      commentCount\n    }\n  }\n": types.UpdateGitHubIssueDocument,
    "\n  query GetRepoLabels($owner: String!, $repo: String!) {\n    githubRepoLabels(owner: $owner, repo: $repo) {\n      name\n      color\n    }\n  }\n": types.GetRepoLabelsDocument,
    "\n  query GetRepoCollaborators($owner: String!, $repo: String!) {\n    githubRepoCollaborators(owner: $owner, repo: $repo) {\n      login\n      avatarUrl\n    }\n  }\n": types.GetRepoCollaboratorsDocument,
    "\n  mutation AddGitHubIssueComment($input: AddIssueCommentInput!) {\n    githubAddIssueComment(input: $input) {\n      id number title state owner repo commentCount\n    }\n  }\n": types.AddGitHubIssueCommentDocument,
    "\n  mutation AddGitHubPRComment($input: AddPRCommentInput!) {\n    githubAddPRComment(input: $input) {\n      id number title state owner repo\n    }\n  }\n": types.AddGitHubPrCommentDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMyPRs($filter: String, $state: String, $limit: Int) {\n    githubMyPRs(filter: $filter, state: $state, limit: $limit) {\n      id\n      number\n      title\n      state\n      draft\n      owner\n      repo\n      headBranch\n      checksStatus\n      reviewState\n      url\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query GetMyPRs($filter: String, $state: String, $limit: Int) {\n    githubMyPRs(filter: $filter, state: $state, limit: $limit) {\n      id\n      number\n      title\n      state\n      draft\n      owner\n      repo\n      headBranch\n      checksStatus\n      reviewState\n      url\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMyIssues($query: String!, $limit: Int) {\n    searchGithubIssues(query: $query, limit: $limit) {\n      id\n      number\n      title\n      state\n      owner\n      repo\n      labels {\n        name\n        color\n      }\n      url\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query GetMyIssues($query: String!, $limit: Int) {\n    searchGithubIssues(query: $query, limit: $limit) {\n      id\n      number\n      title\n      state\n      owner\n      repo\n      labels {\n        name\n        color\n      }\n      url\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetGitHubPR($owner: String!, $repo: String!, $pullNumber: Int!) {\n    githubPR(owner: $owner, repo: $repo, pullNumber: $pullNumber) {\n      id\n      number\n      title\n      state\n      draft\n      author\n      authorAvatar\n      owner\n      repo\n      headBranch\n      baseBranch\n      body\n      additions\n      deletions\n      changedFiles\n      mergeable\n      reviewState\n      checksStatus\n      labels { name color }\n      reviewers\n      url\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query GetGitHubPR($owner: String!, $repo: String!, $pullNumber: Int!) {\n    githubPR(owner: $owner, repo: $repo, pullNumber: $pullNumber) {\n      id\n      number\n      title\n      state\n      draft\n      author\n      authorAvatar\n      owner\n      repo\n      headBranch\n      baseBranch\n      body\n      additions\n      deletions\n      changedFiles\n      mergeable\n      reviewState\n      checksStatus\n      labels { name color }\n      reviewers\n      url\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MergeGitHubPR($input: MergePRInput!) {\n    githubMergePR(input: $input) {\n      id number title state draft owner repo mergeableState\n    }\n  }\n"): (typeof documents)["\n  mutation MergeGitHubPR($input: MergePRInput!) {\n    githubMergePR(input: $input) {\n      id number title state draft owner repo mergeableState\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateGitHubPR($input: UpdateGitHubPRInput!) {\n    githubUpdatePR(input: $input) {\n      id number title state body owner repo\n      labels { name color }\n      reviewers\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateGitHubPR($input: UpdateGitHubPRInput!) {\n    githubUpdatePR(input: $input) {\n      id number title state body owner repo\n      labels { name color }\n      reviewers\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetGitHubIssue($owner: String!, $repo: String!, $issueNumber: Int!) {\n    githubIssue(owner: $owner, repo: $repo, issueNumber: $issueNumber) {\n      id\n      number\n      title\n      state\n      author\n      authorAvatar\n      owner\n      repo\n      body\n      labels { name color }\n      assignees\n      commentCount\n      url\n      createdAt\n      updatedAt\n      closedAt\n    }\n  }\n"): (typeof documents)["\n  query GetGitHubIssue($owner: String!, $repo: String!, $issueNumber: Int!) {\n    githubIssue(owner: $owner, repo: $repo, issueNumber: $issueNumber) {\n      id\n      number\n      title\n      state\n      author\n      authorAvatar\n      owner\n      repo\n      body\n      labels { name color }\n      assignees\n      commentCount\n      url\n      createdAt\n      updatedAt\n      closedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateGitHubIssue($input: UpdateGitHubIssueInput!) {\n    githubUpdateIssue(input: $input) {\n      id number title state body owner repo\n      labels { name color }\n      assignees\n      commentCount\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateGitHubIssue($input: UpdateGitHubIssueInput!) {\n    githubUpdateIssue(input: $input) {\n      id number title state body owner repo\n      labels { name color }\n      assignees\n      commentCount\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetRepoLabels($owner: String!, $repo: String!) {\n    githubRepoLabels(owner: $owner, repo: $repo) {\n      name\n      color\n    }\n  }\n"): (typeof documents)["\n  query GetRepoLabels($owner: String!, $repo: String!) {\n    githubRepoLabels(owner: $owner, repo: $repo) {\n      name\n      color\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetRepoCollaborators($owner: String!, $repo: String!) {\n    githubRepoCollaborators(owner: $owner, repo: $repo) {\n      login\n      avatarUrl\n    }\n  }\n"): (typeof documents)["\n  query GetRepoCollaborators($owner: String!, $repo: String!) {\n    githubRepoCollaborators(owner: $owner, repo: $repo) {\n      login\n      avatarUrl\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddGitHubIssueComment($input: AddIssueCommentInput!) {\n    githubAddIssueComment(input: $input) {\n      id number title state owner repo commentCount\n    }\n  }\n"): (typeof documents)["\n  mutation AddGitHubIssueComment($input: AddIssueCommentInput!) {\n    githubAddIssueComment(input: $input) {\n      id number title state owner repo commentCount\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddGitHubPRComment($input: AddPRCommentInput!) {\n    githubAddPRComment(input: $input) {\n      id number title state owner repo\n    }\n  }\n"): (typeof documents)["\n  mutation AddGitHubPRComment($input: AddPRCommentInput!) {\n    githubAddPRComment(input: $input) {\n      id number title state owner repo\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;
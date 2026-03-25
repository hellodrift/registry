/**
 * GitHub Issue Entity — metadata-only definition.
 *
 * URI: @drift//github_issue/{owner}/{repo}/{number}
 */

import { defineEntity } from '@tryvienna/sdk';
import { GitHubIssueEntityDrawer } from '../ui/GitHubIssueEntityDrawer';
import { GITHUB_ENTITY_URI_SEGMENTS } from './uri';

export const githubIssueEntity = defineEntity({
  type: 'github_issue',
  name: 'GitHub Issue',
  description: 'An issue from GitHub',
  icon: { svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/></svg>' },
  source: 'integration',
  uri: [...GITHUB_ENTITY_URI_SEGMENTS],

  display: {
    emoji: '\u{1F41B}',
    colors: { bg: '#8957e5', text: '#FFFFFF', border: '#6e40c9' },
    description: 'GitHub issues for bug tracking and feature requests',
    outputFields: [
      { key: 'repo', label: 'Repository', metadataPath: 'repo' },
      { key: 'author', label: 'Author', metadataPath: 'author' },
      { key: 'state', label: 'State', metadataPath: 'state' },
      { key: 'commentCount', label: 'Comments', metadataPath: 'commentCount', format: 'number' },
    ],
  },

  cache: { ttl: 30_000, maxSize: 200 },

  ui: { drawer: GitHubIssueEntityDrawer },
});

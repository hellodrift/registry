/**
 * GitHub PR Entity — metadata-only definition.
 *
 * URI: @drift//github_pr/{owner}/{repo}/{number}
 */

import { defineEntity } from '@vienna/sdk';
import { GitHubPREntityDrawer } from '../ui/GitHubPREntityDrawer';
import { GITHUB_ENTITY_URI_SEGMENTS } from './uri';

export const githubPREntity = defineEntity({
  type: 'github_pr',
  name: 'GitHub Pull Request',
  description: 'A pull request from GitHub',
  icon: { svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>' },
  source: 'integration',
  uri: [...GITHUB_ENTITY_URI_SEGMENTS],

  display: {
    emoji: '\u{1F500}',
    colors: { bg: '#238636', text: '#FFFFFF', border: '#2ea043' },
    description: 'GitHub pull requests for code review and merging',
    outputFields: [
      { key: 'repo', label: 'Repository', metadataPath: 'repo' },
      { key: 'author', label: 'Author', metadataPath: 'author' },
      { key: 'state', label: 'State', metadataPath: 'state' },
      { key: 'reviewState', label: 'Review', metadataPath: 'reviewState' },
      { key: 'checksStatus', label: 'CI', metadataPath: 'checksStatus' },
    ],
  },

  cache: { ttl: 30_000, maxSize: 200 },

  ui: { drawer: GitHubPREntityDrawer },
});

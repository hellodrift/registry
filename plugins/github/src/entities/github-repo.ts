/**
 * GitHub Repository Entity — metadata-only definition.
 *
 * URI: @drift//github_repo/{owner}/{name}
 */

import { defineEntity } from '@vienna/sdk';

export const githubRepoEntity = defineEntity({
  type: 'github_repo',
  name: 'GitHub Repository',
  description: 'A GitHub repository',
  icon: { svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>' },
  source: 'integration',
  uri: ['owner', 'name'],

  display: {
    emoji: '\u{1F4E6}',
    colors: { bg: '#6e7781', text: '#FFFFFF', border: '#57606a' },
    description: 'GitHub repositories',
    outputFields: [
      { key: 'fullName', label: 'Name', metadataPath: 'fullName' },
      { key: 'language', label: 'Language', metadataPath: 'language' },
      { key: 'stars', label: 'Stars', metadataPath: 'stargazersCount', format: 'number' },
      { key: 'defaultBranch', label: 'Default Branch', metadataPath: 'defaultBranch' },
    ],
  },

  cache: { ttl: 60_000, maxSize: 100 },
});

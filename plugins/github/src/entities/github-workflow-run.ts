/**
 * GitHub Workflow Run Entity — metadata-only definition.
 *
 * URI: @drift//github_workflow_run/{owner}/{repo}/{runId}
 */

import { defineEntity } from '@tryvienna/sdk';

export const githubWorkflowRunEntity = defineEntity({
  type: 'github_workflow_run',
  name: 'GitHub Workflow Run',
  description: 'A GitHub Actions workflow run',
  icon: { svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>' },
  source: 'integration',
  uri: ['owner', 'repo', 'runId'],

  display: {
    emoji: '\u{2699}\u{FE0F}',
    colors: { bg: '#1f6feb', text: '#FFFFFF', border: '#388bfd' },
    description: 'GitHub Actions workflow runs for CI/CD monitoring',
    outputFields: [
      { key: 'workflow', label: 'Workflow', metadataPath: 'workflowName' },
      { key: 'status', label: 'Status', metadataPath: 'status' },
      { key: 'conclusion', label: 'Conclusion', metadataPath: 'conclusion' },
      { key: 'branch', label: 'Branch', metadataPath: 'branch' },
      { key: 'actor', label: 'Actor', metadataPath: 'actor' },
    ],
  },

  cache: { ttl: 15_000, maxSize: 100 },
});

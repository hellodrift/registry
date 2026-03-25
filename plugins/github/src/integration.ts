/**
 * GitHub Integration — OAuth + Octokit client.
 *
 * Supports PKCE authorization_code flow (OAuth) with PAT fallback.
 * Owns the Octokit lifecycle. API operations are exposed exclusively
 * through GraphQL (see schema.ts and api.ts).
 *
 * OAuth credentials are NOT hardcoded or read from environment variables.
 * Instead, `clientIdKey` and `clientSecretKey` point to secure storage keys
 * that the user configures via the integration settings UI. The OAuthManager
 * resolves these at flow time from the integration's scoped secure storage.
 */

import { defineIntegration } from '@tryvienna/sdk';
import type { IntegrationDefinition } from '@tryvienna/sdk';
import type { Octokit } from '@octokit/rest';
import { registerGitHubSchema } from './schema';

// ─────────────────────────────────────────────────────────────────────────────
// GitHub SVG Icon
// ─────────────────────────────────────────────────────────────────────────────

const GITHUB_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>';

// ─────────────────────────────────────────────────────────────────────────────
// Integration Definition
// ─────────────────────────────────────────────────────────────────────────────

export const githubIntegration: IntegrationDefinition<Octokit> = defineIntegration<Octokit>({
  id: 'github',
  name: 'GitHub',
  description: 'GitHub API for PRs, issues, code review, and CI/CD',
  icon: { svg: GITHUB_SVG },

  oauth: {
    providers: [{
      providerId: 'github',
      displayName: 'GitHub',
      icon: 'github',
      required: false,
      flow: {
        grantType: 'authorization_code',
        clientId: '',
        clientIdKey: 'github_oauth_client_id',
        clientSecretKey: 'github_oauth_client_secret',
        authorizationUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        scopes: ['repo', 'read:org', 'workflow', 'read:user'],
        pkce: { enabled: true },
        redirectPort: 19284,
      },
    }],
  },

  credentials: ['personal_access_token', 'github_oauth_client_id', 'github_oauth_client_secret'],

  createClient: async (ctx) => {
    const { Octokit: OctokitClass } = await import('@octokit/rest');

    // Try OAuth first
    if (ctx.oauth) {
      const token = await ctx.oauth.getAccessToken('github');
      if (token) return new OctokitClass({ auth: token });
    }

    // Fallback to PAT
    const pat = await ctx.storage.get('personal_access_token');
    if (pat) return new OctokitClass({ auth: pat });

    ctx.logger.warn('No GitHub token configured');
    return null;
  },

  schema: registerGitHubSchema,
});

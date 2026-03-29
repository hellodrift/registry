/**
 * Reddit Integration — Script app password grant authentication.
 *
 * No OAuth browser flow — uses Reddit's "script" app type with
 * client_id, client_secret, username, and password stored in secure storage.
 * Tokens are valid for 1 hour and auto-refresh transparently.
 */

import { defineIntegration } from '@tryvienna/sdk';
import type { IntegrationDefinition } from '@tryvienna/sdk';
import type { RedditClient } from './api';
import { authenticate } from './api';
import { registerRedditSchema } from './schema';
import { REDDIT_SVG } from './helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Integration Definition
// ─────────────────────────────────────────────────────────────────────────────

export const redditIntegration: IntegrationDefinition<RedditClient> = defineIntegration<RedditClient>({
  id: 'reddit',
  name: 'Reddit',
  description: 'Reddit API for monitoring subreddits and posting comments',
  icon: { svg: REDDIT_SVG },

  credentials: [
    'reddit_client_id',
    'reddit_client_secret',
    'reddit_username',
    'reddit_password',
  ],

  createClient: async (ctx) => {
    const clientId = await ctx.storage.get('reddit_client_id');
    const clientSecret = await ctx.storage.get('reddit_client_secret');
    const username = await ctx.storage.get('reddit_username');
    const password = await ctx.storage.get('reddit_password');

    if (!clientId || !clientSecret || !username || !password) {
      ctx.logger.warn('Reddit credentials not fully configured');
      return null;
    }

    try {
      const auth = await authenticate(clientId, clientSecret, username, password);
      return {
        accessToken: auth.access_token,
        expiresAt: Date.now() + auth.expires_in * 1000,
        credentials: { clientId, clientSecret, username, password },
      };
    } catch (err) {
      ctx.logger.error('Reddit authentication failed', { error: String(err) });
      return null;
    }
  },

  schema: registerRedditSchema,
});

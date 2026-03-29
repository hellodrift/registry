/**
 * @vienna/plugin-reddit — Reddit community monitoring plugin for Vienna.
 *
 * Self-contained plugin package containing:
 * - Integration definition (script app password grant, 4 credentials)
 * - Entity definition (Reddit posts)
 * - GraphQL schema extension (feed, comments, post comment, draft reply)
 *
 * Dependencies: @tryvienna/sdk, zod.
 * No imports from Vienna internals (renderer, IPC, etc.).
 */

import { definePlugin } from '@tryvienna/sdk';
import { redditIntegration } from './integration';
import { redditPostEntity } from './entities';
import { RedditNavSection } from './ui/RedditNavSection';
import { RedditPluginDrawer } from './ui/RedditPluginDrawer';
import { REDDIT_SVG } from './helpers';

// ── Plugin Definition ───────────────────────────────────────────────────────

export const redditPlugin = definePlugin({
  id: 'reddit',
  name: 'Reddit',
  description: 'Monitor subreddits for engagement opportunities and draft AI-assisted replies.',
  icon: { svg: REDDIT_SVG },

  integrations: [redditIntegration],
  entities: [redditPostEntity],

  canvases: {
    'nav-sidebar': {
      component: RedditNavSection,
      label: 'Reddit',
      priority: 50,
    },
    drawer: {
      component: RedditPluginDrawer,
      label: 'Reddit',
    },
  },
});

// ── Re-exports for direct access ────────────────────────────────────────────

export { redditIntegration } from './integration';
export { redditPostEntity } from './entities';
export { registerRedditSchema } from './schema';

/**
 * Feedback Integration — Vienna Admin API.
 *
 * Simple credential-based integration. No OAuth — just API key + base URL.
 * The createClient returns a config object used by api.ts functions.
 */

import { defineIntegration } from '@tryvienna/sdk';
import type { IntegrationDefinition } from '@tryvienna/sdk';
import type { FeedbackApiClient } from './helpers';
import { registerFeedbackSchema } from './schema';

const FEEDBACK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>';

export const feedbackIntegration: IntegrationDefinition<FeedbackApiClient> = defineIntegration<FeedbackApiClient>({
  id: 'feedback',
  name: 'Vienna Feedback',
  description: 'Connect to the Vienna admin API to monitor and manage user feedback',
  icon: { svg: FEEDBACK_SVG },

  credentials: ['api_key', 'base_url'],

  createClient: async (ctx) => {
    const apiKey = await ctx.storage.get('api_key');
    const baseUrl = await ctx.storage.get('base_url');

    if (!apiKey || !baseUrl) {
      ctx.logger.warn('Feedback integration not configured — set API key and base URL in settings');
      return null;
    }

    return { apiKey, baseUrl };
  },

  schema: registerFeedbackSchema,
});

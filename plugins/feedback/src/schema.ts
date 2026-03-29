/**
 * Feedback integration GraphQL schema registration.
 *
 * Registers feedback-specific GraphQL types, queries, and mutations.
 * Includes cross-plugin Linear issue creation via ctx.getIntegrationClient('linear').
 *
 * @module plugin-feedback/schema
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { GraphQLError } from 'graphql';
import { buildEntityURI } from '@tryvienna/sdk';
import type { BaseEntity } from '@tryvienna/sdk';
import { feedbackItemEntity } from './entities';
import { feedbackIntegration } from './integration';
import * as api from './api';
import type { FeedbackItemShape, FeedbackApiClient } from './helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function getFeedbackClient(ctx: any): Promise<FeedbackApiClient> {
  const client = await ctx.getIntegrationClient?.('feedback');
  if (!client) {
    throw new GraphQLError('Feedback integration is not available. Configure it in Settings.', {
      extensions: { code: 'INTEGRATION_NOT_AVAILABLE' },
    });
  }
  return client as FeedbackApiClient;
}

async function getFeedbackClientOrNull(ctx: any): Promise<FeedbackApiClient | null> {
  const client = await ctx.getIntegrationClient?.('feedback');
  return (client as FeedbackApiClient) ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema Registration
// ─────────────────────────────────────────────────────────────────────────────

export function registerFeedbackSchema(rawBuilder: unknown): void {
  const builder = rawBuilder as any;

  // ── Object Types ──────────────────────────────────────────────────────────

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const FeedbackItemRef = builder.objectRef<FeedbackItemShape>('FeedbackItem');
  builder.objectType(FeedbackItemRef, {
    description: 'A user feedback submission',
    fields: (t: any) => ({
      id: t.id({ resolve: (item: any) => item.id }),
      message: t.exposeString('message'),
      name: t.exposeString('name', { nullable: true }),
      email: t.exposeString('email', { nullable: true }),
      userId: t.exposeString('userId', { nullable: true }),
      source: t.exposeString('source'),
      status: t.exposeString('status'),
      // TODO: Use a JSON scalar type when available in the plugin Pothos context
      // instead of round-tripping through JSON.stringify/parse.
      metadata: t.field({
        type: 'String',
        nullable: true,
        resolve: (item: any) => JSON.stringify(item.metadata),
      }),
      createdAt: t.exposeString('createdAt'),
    }),
  });

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const FeedbackLinearResultRef = builder.objectRef<{
    success: boolean;
    message: string;
    linearIssueId: string | null;
  }>('FeedbackLinearResult');
  builder.objectType(FeedbackLinearResultRef, {
    description: 'Result of creating a Linear issue from feedback',
    fields: (t: any) => ({
      success: t.exposeBoolean('success'),
      message: t.exposeString('message'),
      linearIssueId: t.exposeString('linearIssueId', { nullable: true }),
    }),
  });

  // ── Queries ───────────────────────────────────────────────────────────────

  builder.queryFields((t: any) => ({
    feedbackItems: t.field({
      type: [FeedbackItemRef],
      description: 'List user feedback submissions',
      args: {
        status: t.arg.string(),
        limit: t.arg.int({ defaultValue: 50 }),
        offset: t.arg.int({ defaultValue: 0 }),
        search: t.arg.string(),
      },
      resolve: async (_root: any, args: any, ctx: any) => {
        const client = await getFeedbackClientOrNull(ctx);
        if (!client) return [];
        try {
          const result = await api.listFeedback(client, {
            status: args.status ?? undefined,
            limit: args.limit ?? 50,
            offset: args.offset ?? 0,
            search: args.search ?? undefined,
          });
          return result.items;
        } catch {
          return [];
        }
      },
    }),

    feedbackItem: t.field({
      type: FeedbackItemRef,
      nullable: true,
      description: 'Get a single feedback item by ID',
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: async (_root: any, args: any, ctx: any) => {
        const client = await getFeedbackClient(ctx);
        return api.getFeedback(client, { id: String(args.id) });
      },
    }),
  }));

  // ── Mutations ─────────────────────────────────────────────────────────────

  builder.mutationFields((t: any) => ({
    updateFeedbackStatus: t.field({
      type: FeedbackItemRef,
      description: 'Update the status of a feedback item',
      args: {
        id: t.arg.id({ required: true }),
        status: t.arg.string({ required: true }),
      },
      resolve: async (_root: any, args: any, ctx: any) => {
        const client = await getFeedbackClient(ctx);
        return api.updateFeedbackStatus(client, {
          id: String(args.id),
          status: args.status,
        });
      },
    }),

    createLinearIssueFromFeedback: t.field({
      type: FeedbackLinearResultRef,
      description: 'Create a Linear issue from a feedback item (cross-plugin)',
      args: {
        feedbackId: t.arg.id({ required: true }),
        teamId: t.arg.id({ required: true }),
        title: t.arg.string(),
        priority: t.arg.int(),
      },
      resolve: async (_root: any, args: any, ctx: any) => {
        // 1. Get feedback item
        const feedbackClient = await getFeedbackClient(ctx);
        const feedback = await api.getFeedback(feedbackClient, { id: String(args.feedbackId) });
        if (!feedback) {
          return { success: false, message: 'Feedback item not found', linearIssueId: null };
        }

        // 2. Get Linear client via cross-plugin API
        const linearClient = await ctx.getIntegrationClient?.('linear');
        if (!linearClient) {
          return { success: false, message: 'Linear integration not available. Configure Linear first.', linearIssueId: null };
        }

        // 3. Create Linear issue
        const title = args.title || `Feedback: ${feedback.message.substring(0, 80)}`;
        const description = [
          '## User Feedback',
          '',
          `> ${feedback.message}`,
          '',
          `- **From:** ${feedback.name || feedback.email || 'Anonymous'}`,
          `- **Source:** ${feedback.source}`,
          `- **Submitted:** ${feedback.createdAt}`,
          `- **Feedback ID:** ${feedback.id}`,
        ].join('\n');

        try {
          const issuePayload = await (linearClient as any).createIssue({
            title,
            teamId: String(args.teamId),
            description,
            priority: args.priority ?? 3,
          });
          const createdIssue = await issuePayload.issue;

          // 4. Update feedback status to in_progress
          await api.updateFeedbackStatus(feedbackClient, {
            id: feedback.id,
            status: 'in_progress',
          });

          return {
            success: true,
            message: 'Linear issue created successfully',
            linearIssueId: createdIssue?.id ?? null,
          };
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          return { success: false, message: `Failed to create Linear issue: ${msg}`, linearIssueId: null };
        }
      },
    }),
  }));

  // ── Entity Handler Registration ─────────────────────────────────────────

  const feedbackUriPath = { segments: ['id'] as const };

  builder.registerEntityHandlers(feedbackItemEntity, {
    integrations: { feedback: feedbackIntegration },
    resolve: async (id: any, ctx: any) => {
      const client = ctx.integrations.feedback.client as FeedbackApiClient;
      if (!client) return null;
      try {
        const item = await api.getFeedback(client, { id: id['id'] });
        if (!item) return null;
        return {
          id: item.id,
          type: 'feedback_item',
          uri: buildEntityURI('feedback_item', id, feedbackUriPath),
          title: item.message.substring(0, 100),
          description: `${item.status} — ${item.source} — ${item.name || item.email || 'Anonymous'}`,
          createdAt: new Date(item.createdAt).getTime(),
        } as BaseEntity;
      } catch {
        return null;
      }
    },
    search: async (query: any, ctx: any) => {
      const client = ctx.integrations.feedback.client as FeedbackApiClient;
      if (!client) return [];
      try {
        const result = await api.listFeedback(client, {
          search: query.query || '',
          limit: query.limit ?? 20,
        });
        return result.items.map((item) => ({
          id: item.id,
          type: 'feedback_item',
          uri: buildEntityURI('feedback_item', { id: item.id }, feedbackUriPath),
          title: item.message.substring(0, 100),
          description: `${item.status} — ${item.source} — ${item.name || item.email || 'Anonymous'}`,
          createdAt: new Date(item.createdAt).getTime(),
        } as BaseEntity));
      } catch {
        return [];
      }
    },
    resolveContext: async (entity: any) => {
      return `### Feedback: ${entity.title}\n- **URI:** ${entity.uri}\n- ${entity.description}`;
    },
  });
}

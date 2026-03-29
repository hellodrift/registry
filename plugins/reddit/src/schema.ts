/**
 * Reddit integration GraphQL schema registration.
 *
 * Registers all Reddit-specific GraphQL types, queries, and mutations
 * on the Pothos builder. Called via the integration's `schema` callback
 * during plugin loading.
 *
 * @module plugin-reddit/schema
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLError } from 'graphql';
import { buildEntityURI } from '@tryvienna/sdk';
import type { BaseEntity } from '@tryvienna/sdk';
import { redditPostEntity, REDDIT_POST_URI_PATH } from './entities';
import { redditIntegration } from './integration';
import type { RedditClient, RedditPostShape, RedditCommentShape } from './api';
import * as api from './api';
import { matchesKeywords } from './helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Backing shapes for GraphQL types (re-export from api.ts)
// ─────────────────────────────────────────────────────────────────────────────

interface RedditDraftReplyShape {
  draftText: string;
  postTitle: string;
  subreddit: string;
}

interface RedditCommentResultShape {
  success: boolean;
  commentId: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema registration
// ─────────────────────────────────────────────────────────────────────────────

async function getRedditClient(ctx: any): Promise<RedditClient> {
  const client = await ctx.getIntegrationClient?.('reddit');
  if (!client) {
    throw new GraphQLError('Reddit integration is not available. Configure credentials in Settings.', {
      extensions: { code: 'INTEGRATION_NOT_AVAILABLE' },
    });
  }
  return client as RedditClient;
}

export function registerRedditSchema(rawBuilder: unknown): void {
  const builder = rawBuilder as any;

  // ── Types ─────────────────────────────────────────────────────────────────

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const RedditPostRef = builder.objectRef<RedditPostShape>('RedditPost');
  builder.objectType(RedditPostRef, {
    description: 'A Reddit post/submission',
    fields: (t) => ({
      id: t.exposeString('id'),
      title: t.exposeString('title'),
      author: t.exposeString('author'),
      subreddit: t.exposeString('subreddit'),
      score: t.exposeInt('score'),
      numComments: t.exposeInt('numComments'),
      selftext: t.exposeString('selftext'),
      url: t.exposeString('url'),
      permalink: t.exposeString('permalink'),
      createdUtc: t.exposeFloat('createdUtc'),
      flair: t.exposeString('flair', { nullable: true }),
      isSelf: t.exposeBoolean('isSelf'),
      thumbnail: t.exposeString('thumbnail', { nullable: true }),
      domain: t.exposeString('domain', { nullable: true }),
      upvoteRatio: t.exposeFloat('upvoteRatio', { nullable: true }),
      fullname: t.exposeString('fullname'),
    }),
  });

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const RedditCommentRef = builder.objectRef<RedditCommentShape>('RedditComment');
  builder.objectType(RedditCommentRef, {
    description: 'A Reddit comment',
    fields: (t) => ({
      id: t.exposeString('id'),
      author: t.exposeString('author'),
      body: t.exposeString('body'),
      score: t.exposeInt('score'),
      createdUtc: t.exposeFloat('createdUtc'),
      depth: t.exposeInt('depth'),
      parentId: t.exposeString('parentId'),
      fullname: t.exposeString('fullname'),
    }),
  });

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const RedditDraftReplyRef = builder.objectRef<RedditDraftReplyShape>('RedditDraftReply');
  builder.objectType(RedditDraftReplyRef, {
    description: 'An AI-drafted reply for a Reddit post',
    fields: (t) => ({
      draftText: t.exposeString('draftText'),
      postTitle: t.exposeString('postTitle'),
      subreddit: t.exposeString('subreddit'),
    }),
  });

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const RedditCommentResultRef = builder.objectRef<RedditCommentResultShape>('RedditCommentResult');
  builder.objectType(RedditCommentResultRef, {
    description: 'Result of posting a Reddit comment',
    fields: (t) => ({
      success: t.exposeBoolean('success'),
      commentId: t.exposeString('commentId', { nullable: true }),
    }),
  });

  // ── Queries ───────────────────────────────────────────────────────────────

  builder.queryFields((t) => ({
    redditFeed: t.field({
      type: [RedditPostRef],
      description: 'Fetch posts from monitored subreddits, optionally filtered by keywords.',
      args: {
        subreddits: t.arg.stringList({ required: true }),
        keywords: t.arg.stringList({ required: false }),
        sort: t.arg.string({ required: false }),
        limit: t.arg.int({ required: false }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getRedditClient(ctx);
        const subreddits = args.subreddits as string[];
        const keywords = (args.keywords as string[] | null) ?? [];
        const sort = (args.sort as string | null) ?? 'new';
        const limit = (args.limit as number | null) ?? 25;

        let posts: RedditPostShape[];

        if (keywords.length > 0) {
          // Use Reddit search API for keyword-matched posts
          posts = await api.searchSubredditPosts(client, {
            subreddits,
            keywords,
            sort,
            limit,
          });
          // Double-check with client-side filtering (search API can be loose)
          posts = posts.filter((p) =>
            matchesKeywords(`${p.title} ${p.selftext}`, keywords),
          );
        } else {
          posts = await api.fetchSubredditPosts(client, {
            subreddits,
            sort,
            limit,
          });
        }

        return posts;
      },
    }),

    redditPost: t.field({
      type: RedditPostRef,
      nullable: true,
      description: 'Fetch a single Reddit post by subreddit and post ID.',
      args: {
        subreddit: t.arg.string({ required: true }),
        postId: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getRedditClient(ctx);
        const { post } = await api.fetchPostWithComments(client, {
          subreddit: args.subreddit as string,
          postId: args.postId as string,
          limit: 1, // Only need the post, not comments
        });
        return post;
      },
    }),

    redditComments: t.field({
      type: [RedditCommentRef],
      description: 'Fetch comments for a Reddit post.',
      args: {
        subreddit: t.arg.string({ required: true }),
        postId: t.arg.string({ required: true }),
        sort: t.arg.string({ required: false }),
        limit: t.arg.int({ required: false }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getRedditClient(ctx);
        const { comments } = await api.fetchPostWithComments(client, {
          subreddit: args.subreddit as string,
          postId: args.postId as string,
          sort: (args.sort as string | null) ?? 'best',
          limit: (args.limit as number | null) ?? 50,
        });
        return comments;
      },
    }),
  }));

  // ── Input Types ───────────────────────────────────────────────────────────

  const PostCommentInput = builder.inputType('PostRedditCommentInput', {
    fields: (t) => ({
      parentFullname: t.string({ required: true }),
      text: t.string({ required: true }),
    }),
  });

  const DraftReplyInput = builder.inputType('DraftRedditReplyInput', {
    fields: (t) => ({
      subreddit: t.string({ required: true }),
      postId: t.string({ required: true }),
      productContext: t.string({ required: true }),
    }),
  });

  // ── Mutations ─────────────────────────────────────────────────────────────

  builder.mutationFields((t) => ({
    redditPostComment: t.field({
      type: RedditCommentResultRef,
      description: 'Post a comment or reply on Reddit.',
      args: { input: t.arg({ type: PostCommentInput, required: true }) },
      resolve: async (_root, args, ctx) => {
        const client = await getRedditClient(ctx);
        return api.postComment(client, {
          parentFullname: args.input.parentFullname,
          text: args.input.text,
        });
      },
    }),

    redditDraftReply: t.field({
      type: RedditDraftReplyRef,
      description: 'Generate a draft reply for a Reddit post based on product context.',
      args: { input: t.arg({ type: DraftReplyInput, required: true }) },
      resolve: async (_root, args, ctx) => {
        const client = await getRedditClient(ctx);

        // Fetch the post content for context
        const { post } = await api.fetchPostWithComments(client, {
          subreddit: args.input.subreddit,
          postId: args.input.postId,
          limit: 5, // Get a few top comments for context
        });

        const productContext = args.input.productContext;

        // Construct a structured draft reply template.
        // In v1 this is a template; can be replaced with an AI API call later.
        const postSummary = post.selftext
          ? post.selftext.slice(0, 500)
          : `[Link post to ${post.domain ?? post.url}]`;

        const draftText = [
          `Hey! Great question/point about "${post.title}".`,
          '',
          `[Share your perspective on the topic here — be genuine and helpful first]`,
          '',
          `I've been working on something related — ${productContext}`,
          '',
          `[Explain specifically how it relates to what the OP is discussing]`,
          '',
          `Happy to share more if you're interested!`,
        ].join('\n');

        return {
          draftText,
          postTitle: post.title,
          subreddit: post.subreddit,
        };
      },
    }),
  }));

  // ── Entity Handler Registration ──────────────────────────────────────────

  builder.registerEntityHandlers(redditPostEntity, {
    integrations: { reddit: redditIntegration },
    resolve: async (id, ctx) => {
      const client = ctx.integrations.reddit.client as RedditClient;
      if (!client) return null;
      try {
        const { post } = await api.fetchPostWithComments(client, {
          subreddit: id['subreddit'],
          postId: id['postId'],
        });
        return {
          id: `${post.subreddit}/${post.id}`,
          type: 'reddit_post',
          uri: buildEntityURI('reddit_post', id, REDDIT_POST_URI_PATH),
          title: post.title,
          description: `r/${post.subreddit} · ${post.score} points · ${post.numComments} comments`,
          createdAt: post.createdUtc * 1000,
        } as BaseEntity;
      } catch {
        return null;
      }
    },
    search: async (query, ctx) => {
      const client = ctx.integrations.reddit.client as RedditClient;
      if (!client) return [];
      // Search requires at least a subreddit context — for generic search,
      // search across a broad set. This is limited by design.
      const searchQuery = query.query ?? '';
      if (!searchQuery) return [];
      try {
        const posts = await api.searchSubredditPosts(client, {
          subreddits: ['all'],
          keywords: [searchQuery],
          sort: 'relevance',
          limit: query.limit ?? 20,
        });
        return posts.map((post) => ({
          id: `${post.subreddit}/${post.id}`,
          type: 'reddit_post',
          uri: buildEntityURI('reddit_post', {
            subreddit: post.subreddit,
            postId: post.id,
          }, REDDIT_POST_URI_PATH),
          title: post.title,
          description: `r/${post.subreddit} · ${post.score} points`,
          createdAt: post.createdUtc * 1000,
        } as BaseEntity));
      } catch {
        return [];
      }
    },
    resolveContext: async (entity) => {
      return `### Reddit Post: ${entity.title}\n- **URI:** ${entity.uri}\n- ${entity.description ?? ''}`;
    },
  });
}

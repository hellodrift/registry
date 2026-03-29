/**
 * Reddit API Functions — standalone async functions wrapping Reddit's REST API.
 *
 * No external dependencies — uses native fetch against https://oauth.reddit.com.
 * Token management is transparent: ensureFreshToken() auto-refreshes before expiry.
 */

import { GraphQLError } from 'graphql';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RedditClient {
  accessToken: string;
  expiresAt: number;
  credentials: {
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
  };
}

export interface RedditPostShape {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  score: number;
  numComments: number;
  selftext: string;
  url: string;
  permalink: string;
  createdUtc: number;
  flair: string | null;
  isSelf: boolean;
  thumbnail: string | null;
  domain: string | null;
  upvoteRatio: number | null;
  fullname: string;
}

export interface RedditCommentShape {
  id: string;
  author: string;
  body: string;
  score: number;
  createdUtc: number;
  depth: number;
  parentId: string;
  fullname: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────────────────────────────────────────

function wrapRedditError(err: unknown, context: string): never {
  if (err instanceof GraphQLError) throw err;
  if (err instanceof Error && 'status' in err) {
    const status = (err as { status: number }).status;
    const codeMap: Record<number, string> = {
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      429: 'RATE_LIMITED',
    };
    throw new GraphQLError(`Reddit API error (${status}): ${err.message}`, {
      extensions: { code: codeMap[status] ?? 'REDDIT_API_ERROR', context },
    });
  }
  throw new GraphQLError(`Reddit API error: ${err instanceof Error ? err.message : String(err)}`, {
    extensions: { code: 'REDDIT_API_ERROR', context },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Authentication
// ─────────────────────────────────────────────────────────────────────────────

const USER_AGENT = 'Vienna:reddit-plugin:v0.1.0';

export async function authenticate(
  clientId: string,
  clientSecret: string,
  username: string,
  password: string,
): Promise<{ access_token: string; expires_in: number }> {
  const basicAuth = btoa(`${clientId}:${clientSecret}`);
  const body = new URLSearchParams({
    grant_type: 'password',
    username,
    password,
  });

  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'unknown');
    throw new GraphQLError(`Reddit authentication failed (${res.status}): ${text}`, {
      extensions: { code: 'UNAUTHORIZED' },
    });
  }

  const data = await res.json();
  if (data.error) {
    throw new GraphQLError(`Reddit authentication error: ${data.error}`, {
      extensions: { code: 'UNAUTHORIZED' },
    });
  }

  return { access_token: data.access_token, expires_in: data.expires_in ?? 3600 };
}

/**
 * Refresh the client's access token if it's expired or about to expire (within 60s).
 * Mutates the client object in-place.
 */
export async function ensureFreshToken(client: RedditClient): Promise<string> {
  if (Date.now() < client.expiresAt - 60_000) {
    return client.accessToken;
  }
  const { credentials } = client;
  const auth = await authenticate(
    credentials.clientId,
    credentials.clientSecret,
    credentials.username,
    credentials.password,
  );
  client.accessToken = auth.access_token;
  client.expiresAt = Date.now() + auth.expires_in * 1000;
  return client.accessToken;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal fetch helper
// ─────────────────────────────────────────────────────────────────────────────

async function redditFetch(
  client: RedditClient,
  path: string,
  options: RequestInit = {},
): Promise<any> {
  const token = await ensureFreshToken(client);
  const url = `https://oauth.reddit.com${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': USER_AGENT,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errObj = Object.assign(new Error(`Reddit API ${res.status}: ${res.statusText}`), {
      status: res.status,
    });
    wrapRedditError(errObj, path);
  }

  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// Post parsing helper
// ─────────────────────────────────────────────────────────────────────────────

function parsePost(child: any): RedditPostShape {
  const d = child.data;
  return {
    id: d.id,
    title: d.title,
    author: d.author,
    subreddit: d.subreddit,
    score: d.score,
    numComments: d.num_comments,
    selftext: d.selftext ?? '',
    url: d.url,
    permalink: d.permalink,
    createdUtc: d.created_utc,
    flair: d.link_flair_text ?? null,
    isSelf: d.is_self,
    thumbnail: d.thumbnail && d.thumbnail !== 'self' && d.thumbnail !== 'default' ? d.thumbnail : null,
    domain: d.domain ?? null,
    upvoteRatio: d.upvote_ratio ?? null,
    fullname: d.name, // e.g. t3_abc123
  };
}

function parseComment(child: any): RedditCommentShape {
  const d = child.data;
  return {
    id: d.id,
    author: d.author ?? '[deleted]',
    body: d.body ?? '',
    score: d.score ?? 0,
    createdUtc: d.created_utc ?? 0,
    depth: d.depth ?? 0,
    parentId: d.parent_id ?? '',
    fullname: d.name, // e.g. t1_xyz789
  };
}

/**
 * Recursively flatten a comment tree into a flat list with depth preserved.
 */
function flattenComments(children: any[]): RedditCommentShape[] {
  const result: RedditCommentShape[] = [];
  for (const child of children) {
    if (child.kind !== 't1') continue;
    result.push(parseComment(child));
    if (child.data.replies && child.data.replies.data?.children) {
      result.push(...flattenComments(child.data.replies.data.children));
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch posts from one or more subreddits.
 * Uses multi-sub syntax: GET /r/sub1+sub2+sub3/{sort}
 */
export async function fetchSubredditPosts(
  client: RedditClient,
  input: { subreddits: string[]; sort?: string; limit?: number },
): Promise<RedditPostShape[]> {
  try {
    const subs = input.subreddits.join('+');
    const sort = input.sort ?? 'new';
    const limit = input.limit ?? 25;
    const params = new URLSearchParams({ limit: String(limit) });
    const data = await redditFetch(client, `/r/${subs}/${sort}?${params}`);
    return (data.data?.children ?? []).map(parsePost);
  } catch (err) {
    wrapRedditError(err, 'fetchSubredditPosts');
  }
}

/**
 * Search across subreddits using Reddit's search API.
 * Combines keywords with OR and restricts to specified subreddits.
 */
export async function searchSubredditPosts(
  client: RedditClient,
  input: { subreddits: string[]; keywords: string[]; sort?: string; limit?: number },
): Promise<RedditPostShape[]> {
  try {
    const subs = input.subreddits.join('+');
    const query = input.keywords.join(' OR ');
    const sort = input.sort ?? 'new';
    const limit = input.limit ?? 25;
    const params = new URLSearchParams({
      q: query,
      restrict_sr: 'on',
      sort,
      limit: String(limit),
      t: 'week',
    });
    const data = await redditFetch(client, `/r/${subs}/search?${params}`);
    return (data.data?.children ?? []).map(parsePost);
  } catch (err) {
    wrapRedditError(err, 'searchSubredditPosts');
  }
}

/**
 * Fetch a single post and its comments.
 * Returns [post, comments] from Reddit's two-listing response.
 */
export async function fetchPostWithComments(
  client: RedditClient,
  input: { subreddit: string; postId: string; sort?: string; limit?: number },
): Promise<{ post: RedditPostShape; comments: RedditCommentShape[] }> {
  try {
    const sort = input.sort ?? 'best';
    const limit = input.limit ?? 50;
    const params = new URLSearchParams({ sort, limit: String(limit) });
    const data = await redditFetch(
      client,
      `/r/${input.subreddit}/comments/${input.postId}?${params}`,
    );

    // Reddit returns [postListing, commentListing]
    const postListing = data[0];
    const commentListing = data[1];

    const post = parsePost(postListing.data.children[0]);
    const comments = flattenComments(commentListing.data?.children ?? []);

    return { post, comments };
  } catch (err) {
    wrapRedditError(err, 'fetchPostWithComments');
  }
}

/**
 * Post a comment or reply on Reddit.
 */
export async function postComment(
  client: RedditClient,
  input: { parentFullname: string; text: string },
): Promise<{ success: boolean; commentId?: string }> {
  try {
    const body = new URLSearchParams({
      parent: input.parentFullname,
      text: input.text,
      api_type: 'json',
    });

    const data = await redditFetch(client, '/api/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const errors = data.json?.errors;
    if (errors && errors.length > 0) {
      throw new GraphQLError(`Reddit comment failed: ${errors.map((e: any) => e[1]).join(', ')}`, {
        extensions: { code: 'REDDIT_COMMENT_ERROR' },
      });
    }

    const commentData = data.json?.data?.things?.[0]?.data;
    return { success: true, commentId: commentData?.id };
  } catch (err) {
    wrapRedditError(err, 'postComment');
  }
}

/**
 * Fetch authenticated user info — used for connection testing.
 */
export async function fetchMe(
  client: RedditClient,
): Promise<{ name: string; totalKarma: number }> {
  try {
    const data = await redditFetch(client, '/api/v1/me');
    return {
      name: data.name,
      totalKarma: data.total_karma ?? 0,
    };
  } catch (err) {
    wrapRedditError(err, 'fetchMe');
  }
}

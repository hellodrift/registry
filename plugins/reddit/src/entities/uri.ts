/**
 * Reddit entity URI constants.
 *
 * URI format: @drift//reddit_post/{subreddit}/{postId}
 */

export const REDDIT_POST_URI_SEGMENTS = ['subreddit', 'postId'] as const;
export const REDDIT_POST_URI_PATH = { segments: REDDIT_POST_URI_SEGMENTS as readonly string[] };

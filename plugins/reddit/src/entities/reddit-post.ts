/**
 * Reddit Post Entity — metadata-only definition.
 *
 * URI: @drift//reddit_post/{subreddit}/{postId}
 */

import { defineEntity } from '@tryvienna/sdk';
import { RedditPostEntityDrawer } from '../ui/RedditPostEntityDrawer';
import { REDDIT_POST_URI_SEGMENTS } from './uri';

export const redditPostEntity = defineEntity({
  type: 'reddit_post',
  name: 'Reddit Post',
  description: 'A post/submission from a Reddit subreddit',
  icon: {
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  },
  source: 'integration',
  uri: [...REDDIT_POST_URI_SEGMENTS],

  display: {
    emoji: '\u{1F4DD}',
    colors: { bg: '#FF4500', text: '#FFFFFF', border: '#FF5722' },
    description: 'Reddit posts from monitored subreddits',
    outputFields: [
      { key: 'subreddit', label: 'Subreddit', metadataPath: 'subreddit' },
      { key: 'author', label: 'Author', metadataPath: 'author' },
      { key: 'score', label: 'Score', metadataPath: 'score' },
      { key: 'numComments', label: 'Comments', metadataPath: 'numComments' },
    ],
  },

  cache: { ttl: 60_000, maxSize: 500 },

  ui: { drawer: RedditPostEntityDrawer },
});

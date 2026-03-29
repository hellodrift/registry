/**
 * Reddit Plugin GraphQL Operations — query/mutation documents for UI components.
 *
 * Uses gql from graphql-tag directly (no codegen for now).
 */

import { gql } from 'graphql-tag';

// ─────────────────────────────────────────────────────────────────────────────
// Nav Section Queries
// ─────────────────────────────────────────────────────────────────────────────

export const GET_REDDIT_FEED = gql`
  query GetRedditFeed($subreddits: [String!]!, $keywords: [String!], $sort: String, $limit: Int) {
    redditFeed(subreddits: $subreddits, keywords: $keywords, sort: $sort, limit: $limit) {
      id
      title
      author
      subreddit
      score
      numComments
      selftext
      permalink
      createdUtc
      flair
      isSelf
      fullname
    }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Entity Drawer Queries
// ─────────────────────────────────────────────────────────────────────────────

export const GET_REDDIT_POST = gql`
  query GetRedditPost($subreddit: String!, $postId: String!) {
    redditPost(subreddit: $subreddit, postId: $postId) {
      id
      title
      author
      subreddit
      score
      numComments
      selftext
      url
      permalink
      createdUtc
      flair
      isSelf
      thumbnail
      domain
      upvoteRatio
      fullname
    }
  }
`;

export const GET_REDDIT_COMMENTS = gql`
  query GetRedditComments($subreddit: String!, $postId: String!, $sort: String, $limit: Int) {
    redditComments(subreddit: $subreddit, postId: $postId, sort: $sort, limit: $limit) {
      id
      author
      body
      score
      createdUtc
      depth
      parentId
      fullname
    }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────────────────────

export const POST_REDDIT_COMMENT = gql`
  mutation PostRedditComment($input: PostRedditCommentInput!) {
    redditPostComment(input: $input) {
      success
      commentId
    }
  }
`;

export const DRAFT_REDDIT_REPLY = gql`
  mutation DraftRedditReply($input: DraftRedditReplyInput!) {
    redditDraftReply(input: $input) {
      draftText
      postTitle
      subreddit
    }
  }
`;

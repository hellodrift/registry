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
// Entity Drawer Query — single API call for post + comments
// ─────────────────────────────────────────────────────────────────────────────

export const GET_REDDIT_POST_WITH_COMMENTS = gql`
  query GetRedditPostWithComments($subreddit: String!, $postId: String!, $commentSort: String, $commentLimit: Int) {
    redditPostWithComments(subreddit: $subreddit, postId: $postId, commentSort: $commentSort, commentLimit: $commentLimit) {
      post {
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
      comments {
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

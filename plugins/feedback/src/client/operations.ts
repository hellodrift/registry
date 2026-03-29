/**
 * Feedback plugin GraphQL operation documents.
 *
 * Used by UI components via usePluginQuery / usePluginMutation.
 */

import { gql } from 'graphql-tag';

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

export const GET_FEEDBACK_ITEMS = gql`
  query GetFeedbackItems($status: String, $limit: Int, $search: String) {
    feedbackItems(status: $status, limit: $limit, search: $search) {
      id
      message
      name
      email
      source
      status
      createdAt
    }
  }
`;

export const GET_FEEDBACK_ITEM = gql`
  query GetFeedbackItem($id: ID!) {
    feedbackItem(id: $id) {
      id
      message
      name
      email
      userId
      source
      status
      metadata
      createdAt
    }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────────────────────

export const UPDATE_FEEDBACK_STATUS = gql`
  mutation UpdateFeedbackStatus($id: ID!, $status: String!) {
    updateFeedbackStatus(id: $id, status: $status) {
      id
      message
      name
      email
      source
      status
      createdAt
    }
  }
`;

export const CREATE_LINEAR_ISSUE_FROM_FEEDBACK = gql`
  mutation CreateLinearIssueFromFeedback(
    $feedbackId: ID!
    $teamId: ID!
    $title: String
    $priority: Int
  ) {
    createLinearIssueFromFeedback(
      feedbackId: $feedbackId
      teamId: $teamId
      title: $title
      priority: $priority
    ) {
      success
      message
      linearIssueId
    }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Cross-plugin queries (Linear)
// ─────────────────────────────────────────────────────────────────────────────

export const GET_LINEAR_TEAMS = gql`
  query GetLinearTeamsForFeedback {
    linearTeams {
      id
      name
      key
    }
  }
`;

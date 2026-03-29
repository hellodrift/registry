/**
 * Feedback plugin helpers — shape interfaces and constants.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Status constants
// ─────────────────────────────────────────────────────────────────────────────

export const FEEDBACK_STATUSES = ['new', 'reviewed', 'in_progress', 'resolved', 'archived'] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  archived: 'Archived',
};

export const STATUS_COLORS: Record<string, string> = {
  new: '#3B82F6',
  reviewed: '#F59E0B',
  in_progress: '#8B5CF6',
  resolved: '#22C55E',
  archived: '#6B7280',
};

// ─────────────────────────────────────────────────────────────────────────────
// Shape interface — matches Vienna admin API response
// ─────────────────────────────────────────────────────────────────────────────

export interface FeedbackItemShape {
  id: string;
  message: string;
  name: string | null;
  email: string | null;
  userId: string | null;
  source: string;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Client type (returned by integration's createClient)
// ─────────────────────────────────────────────────────────────────────────────

export interface FeedbackApiClient {
  apiKey: string;
  baseUrl: string;
}

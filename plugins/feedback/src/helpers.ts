/**
 * Feedback plugin helpers — shape interfaces, constants, and shared utilities.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Icon
// ─────────────────────────────────────────────────────────────────────────────

export const FEEDBACK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>';

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

// ─────────────────────────────────────────────────────────────────────────────
// Shared utilities
// ─────────────────────────────────────────────────────────────────────────────

export function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

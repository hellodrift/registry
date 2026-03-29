/**
 * Feedback API wrapper functions.
 *
 * HTTP client for the Vienna admin feedback API.
 * Each function takes a FeedbackApiClient config and returns shaped data.
 */

import { GraphQLError } from 'graphql';
import type { FeedbackApiClient, FeedbackItemShape } from './helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Error handling
// ─────────────────────────────────────────────────────────────────────────────

function wrapFeedbackError(err: unknown, context: string): never {
  if (err instanceof GraphQLError) throw err;
  if (err instanceof Error) {
    throw new GraphQLError(`Feedback API error: ${err.message}`, {
      extensions: { code: 'FEEDBACK_API_ERROR', context },
    });
  }
  throw err;
}

async function fetchApi(
  client: FeedbackApiClient,
  path: string,
  options?: RequestInit,
): Promise<Response> {
  const url = `${client.baseUrl.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'x-api-key': client.apiKey,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res;
}

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

export async function listFeedback(
  client: FeedbackApiClient,
  input: { status?: string; limit?: number; offset?: number; search?: string },
): Promise<{ items: FeedbackItemShape[]; total: number }> {
  try {
    const params = new URLSearchParams();
    if (input.status) params.set('status', input.status);
    if (input.limit) params.set('limit', String(input.limit));
    if (input.offset) params.set('offset', String(input.offset));
    if (input.search) params.set('search', input.search);

    const qs = params.toString();
    const res = await fetchApi(client, `/api/admin/feedback${qs ? `?${qs}` : ''}`);
    return await res.json();
  } catch (err) {
    wrapFeedbackError(err, 'listFeedback');
  }
}

export async function getFeedback(
  client: FeedbackApiClient,
  input: { id: string },
): Promise<FeedbackItemShape | null> {
  try {
    const res = await fetchApi(client, `/api/admin/feedback/${input.id}`);
    return await res.json();
  } catch (err) {
    wrapFeedbackError(err, 'getFeedback');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────────────────────

export async function updateFeedbackStatus(
  client: FeedbackApiClient,
  input: { id: string; status: string },
): Promise<FeedbackItemShape> {
  try {
    const res = await fetchApi(client, `/api/admin/feedback/${input.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: input.status }),
    });
    return await res.json();
  } catch (err) {
    wrapFeedbackError(err, 'updateFeedbackStatus');
  }
}

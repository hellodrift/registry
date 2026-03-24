/**
 * GitHub Plugin Helpers
 *
 * Pure functions for computing aggregate review and CI status
 * from raw GitHub API responses, plus common data mappers.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Review State
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute aggregate review state from a list of PR reviews.
 * Keeps only the latest review per user, ignoring COMMENTED-only reviews.
 *
 * @returns 'approved' | 'changes_requested' | 'pending' | 'none'
 */
export function computeReviewState(
  reviews: ReadonlyArray<{ state: string; user?: { login?: string } | null }>,
): string {
  if (!reviews.length) return 'none';

  // Keep only the latest actionable review per user
  const latestByUser = new Map<string, string>();
  for (const review of reviews) {
    const user = review.user?.login ?? 'unknown';
    const state = review.state?.toUpperCase();
    if (state === 'APPROVED' || state === 'CHANGES_REQUESTED' || state === 'DISMISSED') {
      latestByUser.set(user, state);
    }
  }

  const states = [...latestByUser.values()];
  if (states.includes('CHANGES_REQUESTED')) return 'changes_requested';
  if (states.includes('APPROVED')) return 'approved';
  return 'pending';
}

// ─────────────────────────────────────────────────────────────────────────────
// Checks Status
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute aggregate CI checks status from check runs.
 *
 * @returns 'success' | 'failure' | 'pending' | 'neutral' | 'none'
 */
export function computeChecksStatus(
  checkRuns: ReadonlyArray<{ status: string; conclusion: string | null }>,
): string {
  if (!checkRuns.length) return 'none';

  const hasFailure = checkRuns.some(
    (cr) => cr.conclusion === 'failure' || cr.conclusion === 'timed_out',
  );
  if (hasFailure) return 'failure';

  const allComplete = checkRuns.every((cr) => cr.status === 'completed');
  if (!allComplete) return 'pending';

  const hasSuccess = checkRuns.some((cr) => cr.conclusion === 'success');
  if (hasSuccess) return 'success';

  return 'neutral';
}

// ─────────────────────────────────────────────────────────────────────────────
// Data Mappers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract owner and repo from a GitHub `repository_url` field.
 * The URL format is `https://api.github.com/repos/{owner}/{repo}`.
 */
export function parseRepoUrl(repoUrl: string): { owner: string; repo: string } {
  const parts = repoUrl.split('/');
  return {
    repo: parts[parts.length - 1] ?? '',
    owner: parts[parts.length - 2] ?? '',
  };
}

/**
 * Map GitHub label objects (which may be strings or objects) to { name, color }.
 */
export function mapLabels(
  labels: ReadonlyArray<string | { name?: string | null; color?: string | null }>,
): Array<{ name: string; color: string }> {
  return labels.map((l) =>
    typeof l === 'string'
      ? { name: l, color: '' }
      : { name: l.name ?? '', color: l.color ?? '' },
  );
}

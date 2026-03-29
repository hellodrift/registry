/**
 * Reddit Plugin Helpers — pure utility functions and shared constants.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Shared SVG Icon
// ─────────────────────────────────────────────────────────────────────────────

export const REDDIT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>';

/**
 * Case-insensitive check if any keyword appears in the text.
 * Returns true if keywords is empty (no filter applied).
 */
export function matchesKeywords(text: string, keywords: string[]): boolean {
  if (keywords.length === 0) return true;
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

/**
 * Convert Reddit UTC seconds timestamp to relative time string.
 * Reddit API returns `created_utc` as Unix epoch seconds.
 */
export function formatRelativeTime(utcSeconds: number): string {
  const diff = Math.floor(Date.now() / 1000 - utcSeconds);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}

/**
 * Ensure full Reddit permalink URL.
 */
export function buildPermalink(permalink: string): string {
  if (permalink.startsWith('http')) return permalink;
  return `https://www.reddit.com${permalink}`;
}

/**
 * Ensure a Reddit fullname has the correct type prefix.
 * t1_ = comment, t3_ = link/post, t5_ = subreddit
 */
export function ensureFullname(id: string, prefix: 't1_' | 't3_' | 't5_'): string {
  if (id.startsWith(prefix)) return id;
  return `${prefix}${id}`;
}

/**
 * Truncate text to maxLen characters, adding ellipsis if needed.
 */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + '\u2026';
}

/**
 * Format a score number for compact display (e.g. 1.2k).
 */
export function formatScore(score: number): string {
  if (score >= 10000) return `${(score / 1000).toFixed(0)}k`;
  if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
  return String(score);
}

/**
 * Reddit Plugin Helpers — pure utility functions.
 */

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

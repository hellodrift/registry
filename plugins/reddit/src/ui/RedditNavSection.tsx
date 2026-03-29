/**
 * RedditNavSection — Nav sidebar canvas for the Reddit plugin.
 *
 * Shows monitored subreddits as collapsible folders with keyword-matched posts.
 *
 * @ai-context
 * - Uses @tryvienna/ui NavSection/NavItem components
 * - Settings opened via openPluginDrawer({ view: 'settings' })
 * - Checks credential status via hostApi.getCredentialStatus
 * - Fetches Reddit data via usePluginQuery from @tryvienna/sdk/react
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePluginQuery } from '@tryvienna/sdk/react';
import {
  NavSection,
  NavItem,
  NavSettingsButton,
  NavHeaderActions,
} from '@tryvienna/ui';
import type { NavSidebarCanvasProps } from '@tryvienna/sdk';
import { MessageSquare, Settings, ExternalLink, TrendingUp, ArrowUp } from 'lucide-react';
import { useRedditSettings } from './useRedditSettings';
import { GET_REDDIT_FEED } from '../client/operations';
import { formatRelativeTime, formatScore, truncate, buildPermalink } from '../helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Reddit SVG Icon Component
// ─────────────────────────────────────────────────────────────────────────────

function RedditIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      className="shrink-0"
    >
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Types for query response
// ─────────────────────────────────────────────────────────────────────────────

interface FeedPost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  score: number;
  numComments: number;
  selftext: string;
  permalink: string;
  createdUtc: number;
  flair: string | null;
  isSelf: boolean;
  fullname: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function postLabel(post: FeedPost): string {
  return truncate(post.title, 60);
}

function postMeta(post: FeedPost): string {
  return `${formatScore(post.score)} pts · ${post.numComments} comments · ${formatRelativeTime(post.createdUtc)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function RedditNavSection({
  pluginId,
  openPluginDrawer,
  openEntityDrawer,
  hostApi,
  logger,
}: NavSidebarCanvasProps) {
  // ── Credential status ──────────────────────────────────────────────────
  const [hasCredentials, setHasCredentials] = useState(false);
  const [credLoading, setCredLoading] = useState(true);

  const { settings } = useRedditSettings();

  useEffect(() => {
    let cancelled = false;
    hostApi.getCredentialStatus('reddit').then((keys) => {
      if (cancelled) return;
      // All 4 credentials must be set
      const allSet = keys.length > 0 && keys.every((k) => k.isSet);
      setHasCredentials(allSet);
      setCredLoading(false);
    }).catch((err) => {
      if (!cancelled) {
        logger.warn('Failed to check credential status', { error: String(err) });
        setCredLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [hostApi, logger]);

  // ── Query feed data (only when configured) ──────────────────────────────
  const hasSubreddits = settings.subreddits.length > 0;

  const { data: feedData, loading: feedLoading, error: feedError } = usePluginQuery<{
    redditFeed: FeedPost[];
  }>(GET_REDDIT_FEED, {
    variables: {
      subreddits: settings.subreddits,
      keywords: settings.keywords.length > 0 ? settings.keywords : null,
      sort: settings.sortBy,
      limit: settings.limit,
    },
    skip: !hasCredentials || credLoading || !hasSubreddits,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (feedError) logger.warn('Failed to fetch Reddit feed', { error: feedError.message });
  }, [feedError, logger]);

  // ── Group posts by subreddit ──────────────────────────────────────────
  const postsBySubreddit = useMemo(() => {
    const posts = feedData?.redditFeed ?? [];
    const groups = new Map<string, FeedPost[]>();
    for (const post of posts) {
      const sub = post.subreddit.toLowerCase();
      if (!groups.has(sub)) groups.set(sub, []);
      groups.get(sub)!.push(post);
    }
    return groups;
  }, [feedData]);

  // ── Folder state ──────────────────────────────────────────────────────
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    () => new Set(settings.subreddits.map((s) => s.toLowerCase())),
  );

  const handleFolderToggle = useCallback((id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const totalPosts = feedData?.redditFeed?.length ?? 0;
  const isLoading = credLoading || (hasCredentials && hasSubreddits && feedLoading);

  // ── Section config ──────────────────────────────────────────────────────
  const sectionData = {
    id: `plugin-${pluginId}-nav`,
    label: `Reddit${totalPosts > 0 ? ` (${totalPosts})` : ''}`,
    icon: <RedditIcon size={12} />,
    items: [],
    isLoading,
    hoverActions: (
      <NavHeaderActions>
        <NavSettingsButton
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            openPluginDrawer({ view: 'settings' });
          }}
          ariaLabel="Reddit settings"
        />
      </NavHeaderActions>
    ),
    emptyState: !hasCredentials
      ? 'Configure Reddit credentials in settings'
      : !hasSubreddits
        ? 'Add subreddits to monitor in settings'
        : 'No matching posts found',
  };

  // ── Unconfigured state ─────────────────────────────────────────────────
  if (!credLoading && (!hasCredentials || !hasSubreddits)) {
    return (
      <NavSection section={sectionData} defaultExpanded>
        <NavItem
          item={{
            id: 'setup',
            label: !hasCredentials ? 'Configure credentials' : 'Add subreddits to monitor',
            variant: 'item',
            icon: <Settings size={14} />,
          }}
          onSelect={() => openPluginDrawer({ view: 'settings' })}
        />
      </NavSection>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (!credLoading && hasCredentials && feedError && !feedData) {
    return (
      <NavSection section={sectionData} defaultExpanded>
        <NavItem
          item={{
            id: 'error',
            label: 'Failed to connect — check settings',
            variant: 'item',
            icon: <Settings size={14} />,
          }}
          onSelect={() => openPluginDrawer({ view: 'settings' })}
        />
      </NavSection>
    );
  }

  // ── Configured state with data ─────────────────────────────────────────
  return (
    <NavSection section={sectionData} defaultExpanded>
      {settings.subreddits.map((sub) => {
        const subLower = sub.toLowerCase();
        const posts = postsBySubreddit.get(subLower) ?? [];
        const isExpanded = expandedFolders.has(subLower);

        return (
          <NavItem
            key={subLower}
            item={{
              id: subLower,
              label: `r/${sub}${posts.length > 0 ? ` (${posts.length})` : ''}`,
              variant: 'folder',
              icon: <MessageSquare size={14} />,
            }}
            isExpanded={isExpanded}
            onToggle={handleFolderToggle}
          >
            {isExpanded && (
              <>
                {posts.length === 0 && !feedLoading && (
                  <NavItem
                    item={{ id: `${subLower}-empty`, label: 'No matching posts', variant: 'item' }}
                    depth={1}
                  />
                )}
                {posts.map((post) => (
                  <NavItem
                    key={`post-${post.id}`}
                    item={{
                      id: `post-${post.id}`,
                      label: postLabel(post),
                      description: postMeta(post),
                      variant: 'item',
                      icon: post.score >= 100 ? <TrendingUp size={12} /> : <ArrowUp size={12} />,
                      hoverActions: (
                        <a
                          href={buildPermalink(post.permalink)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-background-tertiary rounded"
                        >
                          <ExternalLink size={10} />
                        </a>
                      ),
                    }}
                    depth={1}
                    onSelect={() => {
                      openEntityDrawer(`@drift//reddit_post/${post.subreddit}/${post.id}`);
                    }}
                  />
                ))}
              </>
            )}
          </NavItem>
        );
      })}
    </NavSection>
  );
}

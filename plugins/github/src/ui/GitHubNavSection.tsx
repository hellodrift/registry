/**
 * GitHubNavSection — Nav sidebar canvas for the GitHub plugin.
 *
 * Uses Apollo GraphQL queries to fetch real GitHub data (PRs, issues, CI)
 * and renders them in collapsible NavSection/NavItem tree.
 *
 * @ai-context
 * - Uses @vienna/ui NavSection/NavItem components
 * - Settings opened via openPluginDrawer({ view: 'settings' })
 * - Checks credential status via hostApi.getCredentialStatus
 * - Fetches GitHub data via usePluginQuery from @vienna/sdk/react
 * - Plugin has access to shared modules: react, @vienna/ui, @vienna/sdk
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePluginQuery } from '@vienna/sdk/react';
import {
  NavSection,
  NavItem,
  NavSettingsButton,
  NavHeaderActions,
} from '@vienna/ui';
import type { NavSidebarCanvasProps } from '@vienna/sdk';
import { GitPullRequest, CircleDot, Settings, ExternalLink } from 'lucide-react';
import { useGitHubSettings } from './useGitHubSettings';
import { GET_MY_PRS, GET_MY_ISSUES } from '../client/operations';

// ─────────────────────────────────────────────────────────────────────────────
// GitHub SVG Icon Component
// ─────────────────────────────────────────────────────────────────────────────

function GitHubIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      className="shrink-0"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function prStatusIndicator(pr: { draft?: boolean | null; checksStatus?: string | null; reviewState?: string | null }): string {
  if (pr.draft) return '📝';
  if (pr.checksStatus === 'failure') return '❌';
  if (pr.checksStatus === 'pending') return '⏳';
  if (pr.reviewState === 'APPROVED') return '✅';
  if (pr.reviewState === 'CHANGES_REQUESTED') return '🔄';
  return '';
}

function formatPRLabel(pr: { owner?: string | null; repo?: string | null; number?: number | null; title?: string | null }): string {
  const prefix = pr.owner && pr.repo ? `${pr.owner}/${pr.repo}#${pr.number}` : `#${pr.number}`;
  return `${prefix} ${pr.title}`;
}

function formatIssueLabel(issue: { owner?: string | null; repo?: string | null; number?: number | null; title?: string | null }): string {
  const prefix = issue.owner && issue.repo ? `${issue.owner}/${issue.repo}#${issue.number}` : `#${issue.number}`;
  return `${prefix} ${issue.title}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function GitHubNavSection({
  pluginId,
  openPluginDrawer,
  openEntityDrawer,
  hostApi,
  logger,
}: NavSidebarCanvasProps) {
  // ── Credential status ──────────────────────────────────────────────────
  const [hasToken, setHasToken] = useState(false);
  const [credLoading, setCredLoading] = useState(true);

  // ── Settings (reactive — changes in drawer trigger re-render) ────────────
  const { settings } = useGitHubSettings();

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      hostApi.getCredentialStatus('github'),
      hostApi.getOAuthStatus('github'),
    ]).then(([keys, oauthProviders]) => {
      if (cancelled) return;
      const patSet = keys.find((k) => k.key === 'personal_access_token')?.isSet ?? false;
      const oauthConnected = oauthProviders.some((p) => p.connected);
      setHasToken(patSet || oauthConnected);
      setCredLoading(false);
    }).catch((err) => {
      if (!cancelled) {
        logger.warn('Failed to check credential status', { error: String(err) });
        setCredLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [hostApi, logger]);

  // ── Build issue search query from settings ──────────────────────────────
  const issueQuery = useMemo(() => {
    const parts: string[] = [];
    parts.push(`is:issue`);
    parts.push(`is:${settings.issueState}`);

    // Issue filter: who the issues relate to
    const filter = settings.issueFilter ?? 'assigned';
    if (filter === 'assigned') {
      parts.push('assignee:@me');
    } else if (filter === 'created') {
      parts.push('author:@me');
    } else if (filter === 'mentioned') {
      parts.push('mentions:@me');
    }
    // 'all' — no user qualifier, relies on repo: filters

    parts.push('sort:updated-desc');
    if (settings.repos.length > 0) {
      for (const repo of settings.repos) {
        parts.push(`repo:${repo}`);
      }
    }
    return parts.join(' ');
  }, [settings.issueFilter, settings.issueState, settings.repos]);

  // ── GraphQL queries (only when token is configured) ─────────────────────
  const { data: prData, loading: prLoading, error: prError } = usePluginQuery(GET_MY_PRS, {
      variables: {
        filter: settings.prFilter,
        state: settings.prState,
        limit: settings.limit,
      },
      skip: !hasToken || credLoading,
      fetchPolicy: 'cache-and-network',
  });

  const { data: issueData, loading: issueLoading, error: issueError } = usePluginQuery(GET_MY_ISSUES, {
      variables: { query: issueQuery, limit: settings.limit },
      skip: !hasToken || credLoading,
      fetchPolicy: 'cache-and-network',
  });

  // Log errors but don't crash
  useEffect(() => {
    if (prError) logger.warn('Failed to fetch PRs', { error: prError.message });
  }, [prError, logger]);

  useEffect(() => {
    if (issueError) logger.warn('Failed to fetch issues', { error: issueError.message });
  }, [issueError, logger]);

  // ── Folder state ───────────────────────────────────────────────────────
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    () => new Set(['prs']),
  );

  const handleFolderToggle = useCallback((id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ── Data (filtered by selected repos if any) ─────────────────────────────
  const allPRs = prData?.githubMyPRs ?? [];
  const allIssues = issueData?.searchGithubIssues ?? [];
  const repoSet = useMemo(() => new Set(settings.repos), [settings.repos]);

  const prs = useMemo(() => {
    if (repoSet.size === 0) return allPRs;
    return allPRs.filter((pr) => pr.owner && pr.repo && repoSet.has(`${pr.owner}/${pr.repo}`));
  }, [allPRs, repoSet]);

  const issues = useMemo(() => {
    if (repoSet.size === 0) return allIssues;
    return allIssues.filter((i) => i.owner && i.repo && repoSet.has(`${i.owner}/${i.repo}`));
  }, [allIssues, repoSet]);
  const isLoading = credLoading || (hasToken && (prLoading || issueLoading));

  // ── Section config ──────────────────────────────────────────────────────
  const sectionData = {
    id: `plugin-${pluginId}-nav`,
    label: 'GitHub',
    icon: <GitHubIcon size={12} />,
    items: [],
    isLoading,
    hoverActions: (
      <NavHeaderActions>
        <NavSettingsButton
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            openPluginDrawer({ view: 'settings' });
          }}
          ariaLabel="GitHub settings"
        />
      </NavHeaderActions>
    ),
    emptyState: !hasToken
      ? 'Add a Personal Access Token in settings to get started'
      : 'No items to show',
  };

  // ── Unconfigured state ─────────────────────────────────────────────────
  if (!credLoading && !hasToken) {
    return (
      <NavSection section={sectionData} defaultExpanded>
        <NavItem
          item={{
            id: 'setup',
            label: 'Open Settings to configure',
            variant: 'item',
            icon: <Settings size={14} />,
          }}
          onSelect={() => openPluginDrawer({ view: 'settings' })}
        />
      </NavSection>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (!credLoading && hasToken && prError && issueError && !prData && !issueData) {
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

  // ── Configured state with real data ───────────────────────────────────
  return (
    <NavSection section={sectionData} defaultExpanded>
      {/* Pull Requests folder */}
      <NavItem
        item={{
          id: 'prs',
          label: `Pull Requests${prs.length > 0 ? ` (${prs.length})` : ''}`,
          variant: 'folder',
          icon: <GitPullRequest size={14} />,
        }}
        isExpanded={expandedFolders.has('prs')}
        onToggle={handleFolderToggle}
      >
        {expandedFolders.has('prs') && (
          <>
            {prs.length === 0 && !prLoading && (
              <NavItem
                item={{ id: 'prs-empty', label: 'No open pull requests', variant: 'item' }}
                depth={1}
              />
            )}
            {prs.map((pr) => (
              <NavItem
                key={`pr-${pr.owner}-${pr.repo}-${pr.number}`}
                item={{
                  id: `pr-${pr.owner}-${pr.repo}-${pr.number}`,
                  label: `${prStatusIndicator(pr)} ${formatPRLabel(pr)}`.trim(),
                  variant: 'item',
                  icon: <GitPullRequest size={12} />,
                  hoverActions: pr.url ? (
                    <a
                      href={pr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-background-tertiary rounded"
                    >
                      <ExternalLink size={10} />
                    </a>
                  ) : undefined,
                }}
                depth={1}
                onSelect={() => {
                  if (pr.owner && pr.repo) {
                    openEntityDrawer(`@drift//github_pr/${pr.owner}/${pr.repo}/${pr.number}`);
                  }
                }}
              />
            ))}
          </>
        )}
      </NavItem>

      {/* Issues folder */}
      <NavItem
        item={{
          id: 'issues',
          label: `Issues${issues.length > 0 ? ` (${issues.length})` : ''}`,
          variant: 'folder',
          icon: <CircleDot size={14} />,
        }}
        isExpanded={expandedFolders.has('issues')}
        onToggle={handleFolderToggle}
      >
        {expandedFolders.has('issues') && (
          <>
            {issues.length === 0 && !issueLoading && (
              <NavItem
                item={{
                  id: 'issues-empty',
                  label: settings.issueFilter === 'all'
                    ? 'No issues found'
                    : settings.issueFilter === 'created'
                      ? 'No issues created by you'
                      : settings.issueFilter === 'mentioned'
                        ? 'No issues mentioning you'
                        : 'No issues assigned to you',
                  variant: 'item',
                }}
                depth={1}
              />
            )}
            {issues.map((issue) => (
              <NavItem
                key={`issue-${issue.owner}-${issue.repo}-${issue.number}`}
                item={{
                  id: `issue-${issue.owner}-${issue.repo}-${issue.number}`,
                  label: formatIssueLabel(issue),
                  variant: 'item',
                  icon: <CircleDot size={12} />,
                  hoverActions: issue.url ? (
                    <a
                      href={issue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-background-tertiary rounded"
                    >
                      <ExternalLink size={10} />
                    </a>
                  ) : undefined,
                }}
                depth={1}
                onSelect={() => {
                  if (issue.owner && issue.repo) {
                    openEntityDrawer(`@drift//github_issue/${issue.owner}/${issue.repo}/${issue.number}`);
                  }
                }}
              />
            ))}
          </>
        )}
      </NavItem>
    </NavSection>
  );
}

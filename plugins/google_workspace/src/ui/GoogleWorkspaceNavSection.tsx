/**
 * GoogleWorkspaceNavSection — Nav sidebar canvas.
 *
 * Three collapsible folders: Inbox (Gmail), Agenda (Calendar), Recent Files (Drive).
 * Auth status checked via gwsAuthStatus GraphQL query.
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
import { Mail, Calendar, HardDrive, Settings, ExternalLink } from 'lucide-react';
import { useGoogleWorkspaceSettings } from './useGoogleWorkspaceSettings';
import { GET_GWS_AUTH_STATUS, GET_GMAIL_THREADS, GET_CALENDAR_EVENTS, GET_DRIVE_FILES } from '../client/operations';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatEmailFrom(from: string | null | undefined): string {
  if (!from) return 'Unknown';
  // Extract name from "Name <email>" format
  const match = from.match(/^([^<]+)/);
  return match ? match[1].trim() : from;
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + '\u2026';
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function GoogleWorkspaceNavSection({
  pluginId,
  openPluginDrawer,
  openEntityDrawer,
  hostApi,
  logger,
}: NavSidebarCanvasProps) {
  const { settings } = useGoogleWorkspaceSettings();

  // ── Auth check ─────────────────────────────────────────────────────────
  const { data: authData, loading: authLoading } = usePluginQuery<{
    gwsAuthStatus: { authenticated: boolean; email?: string; tokenError?: string };
  }>(GET_GWS_AUTH_STATUS, {
    fetchPolicy: 'cache-and-network',
  });

  const authStatus = authData?.gwsAuthStatus;
  const isAuthenticated = authStatus?.authenticated ?? false;
  const tokenError = authStatus?.tokenError;

  // ── Build Drive query from settings ────────────────────────────────────
  const driveQuery = useMemo(() => {
    const parts: string[] = [];
    if (settings.driveQuery) {
      parts.push(settings.driveQuery);
    }
    if (settings.driveMimeFilter && settings.driveMimeFilter !== 'all' && /^[a-zA-Z0-9.\/\-]+$/.test(settings.driveMimeFilter)) {
      parts.push(`mimeType='${settings.driveMimeFilter}'`);
    }
    return parts.length > 0 ? parts.join(' and ') : undefined;
  }, [settings.driveQuery, settings.driveMimeFilter]);

  // ── Data queries (skip if not authenticated) ───────────────────────────
  const { data: gmailData, loading: gmailLoading, error: gmailError } = usePluginQuery<{
    gmailThreads: Array<{
      id: string; subject?: string; from?: string; date?: string;
      snippet?: string; unread?: boolean; messageCount?: number;
    }>;
  }>(GET_GMAIL_THREADS, {
    variables: { query: settings.inboxQuery, limit: settings.inboxLimit },
    skip: authLoading || !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  // Use events.list (not +agenda) so we get real Google event IDs for the drawer
  const calendarTimeMin = useMemo(() => new Date().toISOString(), []);
  const { data: calendarData, loading: calendarLoading, error: calendarError } = usePluginQuery<{
    calendarEvents: Array<{
      id: string; summary?: string; start?: string; end?: string;
      startFormatted?: string; endFormatted?: string; allDay?: boolean;
      location?: string; hangoutLink?: string; htmlLink?: string;
    }>;
  }>(GET_CALENDAR_EVENTS, {
    variables: { timeMin: calendarTimeMin, limit: 15 },
    skip: authLoading || !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  const { data: driveData, loading: driveLoading, error: driveError } = usePluginQuery<{
    driveFiles: Array<{
      id: string; name: string; mimeType: string; mimeTypeLabel?: string;
      modifiedTime?: string; ownerName?: string; webViewLink?: string;
    }>;
  }>(GET_DRIVE_FILES, {
    variables: { query: driveQuery, limit: settings.driveLimit },
    skip: authLoading || !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  // Log errors
  useEffect(() => {
    if (gmailError) logger.warn('Failed to fetch Gmail threads', { error: gmailError.message });
  }, [gmailError, logger]);
  useEffect(() => {
    if (calendarError) logger.warn('Failed to fetch calendar events', { error: calendarError.message });
  }, [calendarError, logger]);
  useEffect(() => {
    if (driveError) logger.warn('Failed to fetch Drive files', { error: driveError.message });
  }, [driveError, logger]);

  // ── Folder state ───────────────────────────────────────────────────────
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    () => new Set(['inbox', 'agenda', 'files']),
  );

  const handleFolderToggle = useCallback((id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ── Data ───────────────────────────────────────────────────────────────
  const threads = gmailData?.gmailThreads ?? [];
  const events = calendarData?.calendarEvents ?? [];
  const files = driveData?.driveFiles ?? [];

  const isLoading = authLoading || (isAuthenticated && (gmailLoading || calendarLoading || driveLoading));

  // ── Section config ─────────────────────────────────────────────────────
  const sectionData = {
    id: `plugin-${pluginId}-nav`,
    label: 'Google Workspace',
    icon: <Mail size={12} />,
    items: [],
    isLoading,
    hoverActions: (
      <NavHeaderActions>
        <NavSettingsButton
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            openPluginDrawer({ view: 'settings' });
          }}
          ariaLabel="Google Workspace settings"
        />
      </NavHeaderActions>
    ),
    emptyState: !isAuthenticated
      ? (tokenError ? 'Token expired — run `gws auth login`' : 'Run `gws auth login` to connect')
      : 'No items to show',
  };

  // ── Unauthenticated state ──────────────────────────────────────────────
  if (!authLoading && !isAuthenticated) {
    const isExpired = !!tokenError;
    return (
      <NavSection section={sectionData} defaultExpanded>
        <NavItem
          item={{
            id: 'auth-error',
            label: isExpired ? 'Token expired — re-authenticate' : 'Not connected',
            variant: 'item',
            icon: <Settings size={14} />,
          }}
          onSelect={() => openPluginDrawer({ view: 'settings' })}
        />
      </NavSection>
    );
  }

  // ── Authenticated state with data ──────────────────────────────────────
  return (
    <NavSection section={sectionData} defaultExpanded>
      {/* ── Inbox ──────────────────────────────────────────────────────── */}
      <NavItem
        item={{
          id: 'inbox',
          label: `Inbox${threads.length > 0 ? ` (${threads.length})` : ''}`,
          variant: 'folder',
          icon: <Mail size={14} />,
        }}
        isExpanded={expandedFolders.has('inbox')}
        onToggle={handleFolderToggle}
      >
        {expandedFolders.has('inbox') && (
          <>
            {threads.length === 0 && !gmailLoading && (
              <NavItem
                item={{ id: 'inbox-empty', label: 'No threads found', variant: 'item' }}
                depth={1}
              />
            )}
            {threads.map((thread) => (
              <NavItem
                key={`thread-${thread.id}`}
                item={{
                  id: `thread-${thread.id}`,
                  label: `${thread.unread ? '\u{1F535} ' : ''}${thread.subject ?? '(no subject)'}`,
                  variant: 'item',
                  icon: <Mail size={12} />,
                  meta: <span className="text-[10px] text-muted-foreground">{formatEmailFrom(thread.from)}</span>,
                }}
                depth={1}
                onSelect={() => openEntityDrawer(`@drift//gmail_thread/${thread.id}`)}
              />
            ))}
          </>
        )}
      </NavItem>

      {/* ── Agenda ─────────────────────────────────────────────────────── */}
      <NavItem
        item={{
          id: 'agenda',
          label: `Agenda${events.length > 0 ? ` (${events.length})` : ''}`,
          variant: 'folder',
          icon: <Calendar size={14} />,
        }}
        isExpanded={expandedFolders.has('agenda')}
        onToggle={handleFolderToggle}
      >
        {expandedFolders.has('agenda') && (
          <>
            {events.length === 0 && !calendarLoading && (
              <NavItem
                item={{ id: 'agenda-empty', label: 'No upcoming events', variant: 'item' }}
                depth={1}
              />
            )}
            {events.map((event) => (
              <NavItem
                key={`event-${event.id}`}
                item={{
                  id: `event-${event.id}`,
                  label: event.summary ?? '(no title)',
                  variant: 'item',
                  icon: <Calendar size={12} />,
                  meta: event.startFormatted ? <span className="text-[10px] text-muted-foreground">{event.startFormatted}</span> : undefined,
                  hoverActions: event.hangoutLink ? (
                    <a
                      href={event.hangoutLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-background-tertiary rounded"
                      title="Join meeting"
                    >
                      <ExternalLink size={10} />
                    </a>
                  ) : undefined,
                }}
                depth={1}
                onSelect={() => openEntityDrawer(`@drift//calendar_event/${event.id}`)}
              />
            ))}
          </>
        )}
      </NavItem>

      {/* ── Recent Files ───────────────────────────────────────────────── */}
      <NavItem
        item={{
          id: 'files',
          label: `Recent Files${files.length > 0 ? ` (${files.length})` : ''}`,
          variant: 'folder',
          icon: <HardDrive size={14} />,
        }}
        isExpanded={expandedFolders.has('files')}
        onToggle={handleFolderToggle}
      >
        {expandedFolders.has('files') && (
          <>
            {files.length === 0 && !driveLoading && (
              <NavItem
                item={{ id: 'files-empty', label: 'No recent files', variant: 'item' }}
                depth={1}
              />
            )}
            {files.map((file) => (
              <NavItem
                key={`file-${file.id}`}
                item={{
                  id: `file-${file.id}`,
                  label: truncate(file.name, 50),
                  variant: 'item',
                  icon: <HardDrive size={12} />,
                  meta: file.mimeTypeLabel ? <span className="text-[10px] text-muted-foreground">{file.mimeTypeLabel}</span> : undefined,
                  hoverActions: file.webViewLink ? (
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-background-tertiary rounded"
                      title="Open in Drive"
                    >
                      <ExternalLink size={10} />
                    </a>
                  ) : undefined,
                }}
                depth={1}
                onSelect={() => openEntityDrawer(`@drift//drive_file/${file.id}`)}
              />
            ))}
          </>
        )}
      </NavItem>
    </NavSection>
  );
}

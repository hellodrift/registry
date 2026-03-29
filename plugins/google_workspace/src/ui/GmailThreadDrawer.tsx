/**
 * GmailThreadDrawer — Entity drawer for Gmail threads.
 *
 * Shows thread subject, participants, messages in chronological order.
 * Registered on the gmail_thread entity via `ui: { drawer }`.
 */

import { useState, useCallback } from 'react';
import {
  DrawerBody,
  DrawerPanelFooter,
  Separator,
  Button,
  Badge,
} from '@tryvienna/ui';
import { ExternalLink, ChevronDown, ChevronRight, Mail } from 'lucide-react';
import { parseEntityURI } from '@tryvienna/sdk';
import { usePluginQuery } from '@tryvienna/sdk/react';
import type { EntityDrawerProps } from '@tryvienna/sdk';
import { GMAIL_THREAD_URI_PATH } from '../entities/uri';
import { GET_GMAIL_THREAD } from '../client/operations';
import { formatRelative } from '../helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function MetadataRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="text-xs font-medium text-foreground max-w-[60%] text-right truncate">
        {children}
      </div>
    </div>
  );
}

function MessageItem({
  message,
  defaultExpanded = false,
}: {
  message: {
    id: string;
    from?: string | null;
    to?: string | null;
    date?: string | null;
    snippet?: string | null;
    body?: string | null;
    bodyHtml?: string | null;
  };
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const fromName = message.from?.match(/^([^<]+)/)?.[1]?.trim() ?? message.from ?? 'Unknown';

  return (
    <div className="rounded border border-border">
      <button
        type="button"
        className="flex items-center gap-2 w-full p-3 text-left hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span className="text-xs font-medium flex-1 truncate">{fromName}</span>
        {message.date && (
          <span className="text-[10px] text-muted-foreground shrink-0">
            {formatRelative(message.date)}
          </span>
        )}
      </button>
      {expanded && (
        <div className="px-3 pb-3 border-t border-border">
          {message.to && (
            <div className="text-[10px] text-muted-foreground mt-2 mb-1">
              To: {message.to}
            </div>
          )}
          {message.body ? (
            <div className="text-xs whitespace-pre-wrap mt-2">{message.body}</div>
          ) : message.snippet ? (
            <div className="text-xs text-muted-foreground mt-2">{message.snippet}</div>
          ) : (
            <div className="text-xs text-muted-foreground mt-2 italic">No content</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Drawer
// ─────────────────────────────────────────────────────────────────────────────

export function GmailThreadDrawer({ uri, headerActions, DrawerContainer }: EntityDrawerProps) {
  const { id } = parseEntityURI(uri, GMAIL_THREAD_URI_PATH);
  const threadId = id['threadId'] ?? '';

  const { data, loading, error } = usePluginQuery<{
    gmailThread: {
      id: string;
      subject?: string;
      from?: string;
      to?: string;
      date?: string;
      snippet?: string;
      unread?: boolean;
      messageCount?: number;
      labelIds?: string[];
      messages?: Array<{
        id: string;
        from?: string;
        to?: string;
        subject?: string;
        date?: string;
        snippet?: string;
        body?: string;
        bodyHtml?: string;
      }>;
    };
  }>(GET_GMAIL_THREAD, {
    variables: { threadId },
    fetchPolicy: 'cache-and-network',
    skip: !threadId,
  });

  const thread = data?.gmailThread;

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading && !thread) {
    return (
      <DrawerContainer title="Gmail Thread">
        <DrawerBody>
          <div className="space-y-4 animate-pulse">
            <div className="h-4 w-48 bg-muted rounded" />
            <div className="h-3 w-32 bg-muted rounded" />
            <div className="h-20 w-full bg-muted rounded" />
          </div>
        </DrawerBody>
      </DrawerContainer>
    );
  }

  if (error || !thread) {
    return (
      <DrawerContainer title="Gmail Thread">
        <DrawerBody>
          <div className="flex flex-col items-center gap-2 py-8">
            <span className="text-sm text-muted-foreground">
              {error ? 'Failed to load thread' : 'Thread not found'}
            </span>
          </div>
        </DrawerBody>
      </DrawerContainer>
    );
  }

  const messages = thread.messages ?? [];
  const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${thread.id}`;

  return (
    <DrawerContainer
      title={thread.subject ?? '(no subject)'}
      headerActions={headerActions}
      footer={
        <DrawerPanelFooter>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <a href={gmailUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={12} className="mr-1" />
                Open in Gmail
              </a>
            </Button>
          </div>
        </DrawerPanelFooter>
      }
    >
      <DrawerBody>
        <div className="space-y-4">
          {/* Header badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="text-[10px]"
              style={{ backgroundColor: '#EA433520', borderColor: '#EA4335' }}
            >
              <Mail size={10} className="mr-1" />
              Gmail
            </Badge>
            {thread.unread && (
              <Badge variant="default" className="text-[10px] bg-blue-500">Unread</Badge>
            )}
            {thread.messageCount && (
              <Badge variant="outline" className="text-[10px]">
                {thread.messageCount} message{thread.messageCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-1">
            {thread.from && <MetadataRow label="From">{thread.from}</MetadataRow>}
            {thread.to && <MetadataRow label="To">{thread.to}</MetadataRow>}
            {thread.date && <MetadataRow label="Date">{formatRelative(thread.date)}</MetadataRow>}
          </div>

          {thread.snippet && (
            <p className="text-xs text-muted-foreground italic">{thread.snippet}</p>
          )}

          <Separator />

          {/* Messages */}
          <div>
            <span className="text-xs font-medium text-muted-foreground mb-2 block">
              Messages{messages.length > 0 ? ` (${messages.length})` : ''}
            </span>
            <div className="space-y-2">
              {messages.length === 0 ? (
                <p className="text-xs text-muted-foreground">No messages loaded</p>
              ) : (
                messages.map((msg, idx) => (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    defaultExpanded={idx === messages.length - 1}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </DrawerBody>
    </DrawerContainer>
  );
}

/**
 * FeedbackEntityDrawer — Entity drawer for feedback items.
 *
 * Shows full feedback detail with status management and
 * cross-plugin Linear issue creation.
 */

import { useState, useCallback } from 'react';
import {
  DrawerBody,
  DrawerPanelFooter,
  Separator,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Input,
} from '@tryvienna/ui';
import { ExternalLink } from 'lucide-react';
import { parseEntityURI } from '@tryvienna/sdk';
import { usePluginQuery, usePluginMutation } from '@tryvienna/sdk/react';
import type { EntityDrawerProps } from '@tryvienna/sdk';
import { FEEDBACK_STATUSES, STATUS_LABELS, STATUS_COLORS, formatRelative } from '../helpers';
import { FEEDBACK_URI_PATH } from '../entities/uri';
import {
  GET_FEEDBACK_ITEM,
  UPDATE_FEEDBACK_STATUS,
  CREATE_LINEAR_ISSUE_FROM_FEEDBACK,
  GET_LINEAR_TEAMS,
} from '../client/operations';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SavingBar({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="flex items-center gap-2 rounded bg-muted/50 px-3 py-1.5">
      <div className="size-1.5 rounded-full bg-foreground/40 animate-pulse" />
      <span className="text-[11px] text-muted-foreground">Saving...</span>
    </div>
  );
}

function MetadataRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="text-xs font-medium text-foreground max-w-[60%] text-right">
        {children}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || '#6B7280';
  const label = STATUS_LABELS[status] || status;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium border"
      style={{
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}30`,
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Drawer
// ─────────────────────────────────────────────────────────────────────────────

export function FeedbackEntityDrawer({ uri, headerActions, DrawerContainer }: EntityDrawerProps) {
  const { id } = parseEntityURI(uri, FEEDBACK_URI_PATH);
  const feedbackId = id['id'] ?? '';

  // ── Queries ────────────────────────────────────────────────────────────
  const { data, loading, error } = usePluginQuery<{ feedbackItem: any }>(GET_FEEDBACK_ITEM, {
    variables: { id: feedbackId },
    fetchPolicy: 'cache-and-network',
    skip: !feedbackId,
  });

  const item = data?.feedbackItem;

  // Cross-plugin: query Linear teams (soft dependency)
  const { data: teamsData } = usePluginQuery<{ linearTeams: Array<{ id: string; name: string; key: string }> }>(GET_LINEAR_TEAMS, {
    fetchPolicy: 'cache-first',
  });
  const linearTeams = teamsData?.linearTeams ?? [];
  const hasLinear = linearTeams.length > 0;

  // ── Mutations ──────────────────────────────────────────────────────────
  const [updateStatus, { loading: statusLoading }] = usePluginMutation(UPDATE_FEEDBACK_STATUS);
  const [createLinearIssue, { loading: linearLoading }] = usePluginMutation(CREATE_LINEAR_ISSUE_FROM_FEEDBACK);

  // ── Local state ────────────────────────────────────────────────────────
  const [linearFormOpen, setLinearFormOpen] = useState(false);
  const [linearTeamId, setLinearTeamId] = useState('');
  const [linearTitle, setLinearTitle] = useState('');
  const [linearResult, setLinearResult] = useState<{ success: boolean; message: string } | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleStatusChange = useCallback(async (status: string) => {
    setStatusError(null);
    try {
      await updateStatus({ variables: { id: feedbackId, status } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      setStatusError(msg);
    }
  }, [updateStatus, feedbackId]);

  const handleCreateLinearIssue = useCallback(async () => {
    if (!linearTeamId) return;
    const result = await createLinearIssue({
      variables: {
        feedbackId,
        teamId: linearTeamId,
        title: linearTitle || undefined,
      },
    });
    const mutationData = (result as any)?.data?.createLinearIssueFromFeedback;
    if (mutationData) {
      setLinearResult({ success: mutationData.success, message: mutationData.message });
      if (mutationData.success) {
        setLinearFormOpen(false);
        setLinearTitle('');
      }
    }
  }, [createLinearIssue, feedbackId, linearTeamId, linearTitle]);

  // ── Loading / error states ─────────────────────────────────────────────
  if (loading && !item) {
    return (
      <DrawerContainer title="Feedback">
        <DrawerBody>
          <div className="space-y-4 animate-pulse">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-5 w-64 bg-muted rounded" />
            <div className="h-20 w-full bg-muted rounded" />
          </div>
        </DrawerBody>
      </DrawerContainer>
    );
  }

  if (error || !item) {
    return (
      <DrawerContainer title="Feedback">
        <DrawerBody>
          <div className="flex flex-col items-center gap-2 py-8">
            <span className="text-sm text-muted-foreground">
              {error ? 'Failed to load feedback' : 'Feedback not found'}
            </span>
          </div>
        </DrawerBody>
      </DrawerContainer>
    );
  }

  const isSaving = statusLoading || linearLoading;

  // Parse metadata JSON
  let metadata: Record<string, unknown> = {};
  try {
    metadata = item.metadata ? JSON.parse(item.metadata) : {};
  } catch {
    // invalid metadata
  }

  return (
    <DrawerContainer
      title="Feedback"
      headerActions={headerActions}
      footer={
        <DrawerPanelFooter>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-muted-foreground">
              ID: {item.id.substring(0, 8)}...
            </span>
            <span className="text-[10px] text-muted-foreground">
              {formatDate(item.createdAt)}
            </span>
          </div>
        </DrawerPanelFooter>
      }
    >
      <DrawerBody>
        <div data-slot="feedback-entity-drawer" className="space-y-4">
          <SavingBar visible={isSaving} />

          {statusError && (
            <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
              {statusError}
            </div>
          )}

          {/* Header: status + source + time */}
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={item.status} />
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border">
              {item.source}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              {formatRelative(item.createdAt)}
            </span>
          </div>

          {/* Message */}
          <div className="rounded border border-border p-3 bg-muted/30">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{item.message}</p>
          </div>

          <Separator />

          {/* Properties */}
          <div className="space-y-1">
            <MetadataRow label="Status">
              <Select value={item.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-6 w-auto min-w-[100px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEEDBACK_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: STATUS_COLORS[s] }}
                        />
                        {STATUS_LABELS[s]}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </MetadataRow>

            {item.name && <MetadataRow label="Name">{item.name}</MetadataRow>}
            {item.email && <MetadataRow label="Email">{item.email}</MetadataRow>}
            {item.userId && <MetadataRow label="User ID">{item.userId.substring(0, 8)}...</MetadataRow>}
            <MetadataRow label="Source">{item.source}</MetadataRow>
            <MetadataRow label="Submitted">{formatDate(item.createdAt)}</MetadataRow>
          </div>

          {/* Metadata (if any non-empty fields) */}
          {Object.keys(metadata).length > 0 && (
            <>
              <Separator />
              <div>
                <span className="text-xs font-medium text-muted-foreground mb-2 block">
                  Metadata
                </span>
                <div className="space-y-1">
                  {Object.entries(metadata).map(([key, value]) => (
                    <MetadataRow key={key} label={key}>
                      {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')}
                    </MetadataRow>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Linear Issue Creation */}
          {hasLinear && (
            <>
              <Separator />
              <div>
                <span className="text-xs font-medium text-muted-foreground mb-2 block">
                  Escalate to Linear
                </span>

                {linearResult && (
                  <div
                    className={`rounded border p-2 mb-2 text-xs ${
                      linearResult.success
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : 'border-destructive/30 bg-destructive/10 text-destructive'
                    }`}
                  >
                    {linearResult.message}
                  </div>
                )}

                {!linearFormOpen ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setLinearFormOpen(true);
                      setLinearResult(null);
                      if (linearTeams.length > 0 && !linearTeamId) {
                        setLinearTeamId(linearTeams[0].id);
                      }
                    }}
                  >
                    <ExternalLink size={12} className="mr-1.5" />
                    Create Linear Issue
                  </Button>
                ) : (
                  <div className="space-y-2 rounded border border-border p-3">
                    <div>
                      <span className="text-[11px] text-muted-foreground block mb-1">Team</span>
                      <Select value={linearTeamId} onValueChange={setLinearTeamId}>
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          {linearTeams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.key} — {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block mb-1">
                        Title (optional)
                      </span>
                      <Input
                        value={linearTitle}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLinearTitle(e.target.value)}
                        placeholder={`Feedback: ${item.message.substring(0, 40)}...`}
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={handleCreateLinearIssue}
                        disabled={!linearTeamId || linearLoading}
                      >
                        {linearLoading ? 'Creating...' : 'Create Issue'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setLinearFormOpen(false);
                          setLinearResult(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DrawerBody>
    </DrawerContainer>
  );
}

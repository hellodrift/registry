/**
 * GitHubPREntityDrawer — Entity drawer for GitHub pull requests.
 *
 * Self-contained drawer component that:
 * - Parses the entity URI to extract owner/repo/number
 * - Fetches full PR data via the typed `githubPR` GraphQL query
 * - Renders rich PR details (state, branches, diff stats, reviews, CI, etc.)
 * - Provides inline editing for title and description
 * - Provides merge/close/reopen actions and adding comments
 *
 * Registered on the github_pr entity definition via `ui: { drawer }`.
 */

import { useState, useCallback } from 'react';
import {
  DrawerBody,
  DrawerPanelFooter,
  Separator,
  Badge,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  ConfirmDialog,
  Markdown,
  MarkdownEditor,
  InlineEdit,
  Textarea,
} from '@tryvienna/ui';
import { Pencil } from 'lucide-react';
import { parseEntityURI } from '@tryvienna/sdk';
import { usePluginQuery, usePluginMutation } from '@tryvienna/sdk/react';
import type { EntityDrawerProps } from '@tryvienna/sdk';
import { GITHUB_URI_PATH } from '../entities/uri';
import {
  GET_GITHUB_PR,
  MERGE_GITHUB_PR,
  UPDATE_GITHUB_PR,
  ADD_GITHUB_PR_COMMENT,
} from '../client/operations';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

function SavingBar({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="flex items-center gap-2 rounded bg-muted/50 px-3 py-1.5">
      <div className="size-1.5 rounded-full bg-foreground/40 animate-pulse" />
      <span className="text-[11px] text-muted-foreground">Saving…</span>
    </div>
  );
}

const STATE_STYLES: Record<string, { className: string; label: string }> = {
  open: { className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20', label: 'Open' },
  closed: { className: 'bg-red-500/15 text-red-400 border border-red-500/20', label: 'Closed' },
  merged: { className: 'bg-violet-500/15 text-violet-400 border border-violet-500/20', label: 'Merged' },
};

const REVIEW_STYLES: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
  approved: { variant: 'default', label: 'Approved' },
  changes_requested: { variant: 'destructive', label: 'Changes Requested' },
  commented: { variant: 'secondary', label: 'Reviewed' },
  pending: { variant: 'outline', label: 'Review Pending' },
  none: { variant: 'outline', label: 'No Reviews' },
};

const CHECKS_STYLES: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
  success: { variant: 'default', label: 'CI Passing' },
  failure: { variant: 'destructive', label: 'CI Failing' },
  pending: { variant: 'secondary', label: 'CI Pending' },
  none: { variant: 'outline', label: 'No CI' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StateBadge({ state, draft }: { state: string; draft?: boolean | null }) {
  const style = STATE_STYLES[state] ?? { className: 'bg-muted text-muted-foreground', label: state };
  const label = draft ? 'Draft' : style.label;
  const badgeClass = draft ? 'bg-muted text-muted-foreground border border-border' : style.className;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeClass}`}
    >
      {state === 'open' && !draft && <span className="size-1.5 rounded-full bg-emerald-400" />}
      {label}
    </span>
  );
}

function DiffStats({ additions, deletions, changedFiles }: {
  additions?: number | null;
  deletions?: number | null;
  changedFiles?: number | null;
}) {
  if (additions == null && deletions == null && changedFiles == null) return null;
  return (
    <div className="flex items-center gap-3 text-xs">
      {additions != null && (
        <span className="text-green-600 font-medium">+{additions.toLocaleString()}</span>
      )}
      {deletions != null && (
        <span className="text-red-600 font-medium">-{deletions.toLocaleString()}</span>
      )}
      {changedFiles != null && (
        <span className="text-muted-foreground">{changedFiles} {changedFiles === 1 ? 'file' : 'files'}</span>
      )}
    </div>
  );
}

function LabelBadge({ name, color }: { name: string; color: string }) {
  const hex = color.startsWith('#') ? color : `#${color}`;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border"
      style={{ borderColor: hex, color: hex }}
    >
      {name}
    </span>
  );
}

function MetadataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground truncate max-w-[60%] text-right">
        {value}
      </span>
    </div>
  );
}

function formatRelative(dateStr: string): string {
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

// ─────────────────────────────────────────────────────────────────────────────
// Main Drawer
// ─────────────────────────────────────────────────────────────────────────────

export function GitHubPREntityDrawer({ uri, headerActions, DrawerContainer }: EntityDrawerProps) {
  const { id } = parseEntityURI(uri, GITHUB_URI_PATH);
  const owner = id['owner'] ?? '';
  const repo = id['repo'] ?? '';
  const pullNumber = parseInt(id['number'] ?? '0', 10);

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data, loading, error } = usePluginQuery(GET_GITHUB_PR, {
    variables: { owner, repo, pullNumber },
    fetchPolicy: 'cache-and-network',
    skip: !owner || !repo || !pullNumber,
  });

  // ── Mutations ────────────────────────────────────────────────────────────
  const [mergePR, { loading: mergeLoading }] = usePluginMutation(MERGE_GITHUB_PR);
  const [updatePR, { loading: updateLoading }] = usePluginMutation(UPDATE_GITHUB_PR);
  const [addComment, { loading: commentLoading }] = usePluginMutation(ADD_GITHUB_PR_COMMENT);
  const actionLoading = mergeLoading || updateLoading;
  const isSaving = updateLoading || commentLoading;

  // ── Local state ──────────────────────────────────────────────────────────
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [editingBody, setEditingBody] = useState(false);
  const [draftBody, setDraftBody] = useState('');
  const [commentBody, setCommentBody] = useState('');

  const pr = data?.githubPR;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleMerge = useCallback(async () => {
    await mergePR({ variables: { input: { owner, repo, pullNumber, mergeMethod: 'squash' } } });
    setMergeDialogOpen(false);
  }, [mergePR, owner, repo, pullNumber]);

  const handleClose = useCallback(async () => {
    await updatePR({ variables: { input: { owner, repo, pullNumber, state: 'closed' } } });
    setCloseDialogOpen(false);
  }, [updatePR, owner, repo, pullNumber]);

  const handleReopen = useCallback(async () => {
    await updatePR({ variables: { input: { owner, repo, pullNumber, state: 'open' } } });
  }, [updatePR, owner, repo, pullNumber]);

  const handleTitleSave = useCallback(async (title: string) => {
    await updatePR({ variables: { input: { owner, repo, pullNumber, title } } });
  }, [updatePR, owner, repo, pullNumber]);

  const handleStartEditBody = useCallback(() => {
    setDraftBody(pr?.body ?? '');
    setEditingBody(true);
  }, [pr?.body]);

  const handleSaveBody = useCallback(async (body: string) => {
    await updatePR({ variables: { input: { owner, repo, pullNumber, body } } });
    setEditingBody(false);
  }, [updatePR, owner, repo, pullNumber]);

  const handleCancelBody = useCallback(() => {
    setEditingBody(false);
  }, []);

  const handleAddComment = useCallback(async () => {
    const body = commentBody.trim();
    if (!body) return;
    await addComment({ variables: { input: { owner, repo, pullNumber, body } } });
    setCommentBody('');
  }, [addComment, owner, repo, pullNumber, commentBody]);

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading && !pr) {
    return (
      <DrawerContainer title="Pull Request">
        <DrawerBody>
          <div data-slot="github-pr-drawer" className="space-y-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-5 w-64 bg-muted rounded" />
              </div>
            </div>
            <div className="h-4 w-48 bg-muted rounded" />
            <div className="h-20 w-full bg-muted rounded" />
          </div>
        </DrawerBody>
      </DrawerContainer>
    );
  }

  // ── Error / not found ────────────────────────────────────────────────────
  if (error || !pr) {
    return (
      <DrawerContainer title="Pull Request">
        <DrawerBody>
          <div data-slot="github-pr-drawer" className="flex flex-col items-center gap-2 py-8">
            <span className="text-sm text-muted-foreground">
              {error ? 'Failed to load pull request' : 'Pull request not found'}
            </span>
          </div>
        </DrawerBody>
      </DrawerContainer>
    );
  }

  const isOpen = pr.state === 'open';
  const isMerged = pr.state === 'merged';
  const reviewStyle = REVIEW_STYLES[pr.reviewState ?? 'none'] ?? REVIEW_STYLES['none']!;
  const checksStyle = CHECKS_STYLES[pr.checksStatus ?? 'none'] ?? CHECKS_STYLES['none']!;

  return (
    <DrawerContainer
      title={pr.title}
      headerActions={headerActions}
      footer={
        isOpen ? (
          <DrawerPanelFooter>
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={actionLoading}
                onClick={() => setCloseDialogOpen(true)}
              >
                Close
              </Button>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        size="sm"
                        disabled={actionLoading || pr.mergeable === false}
                        onClick={() => setMergeDialogOpen(true)}
                      >
                        Merge
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {pr.mergeable === false && (
                    <TooltipContent>This PR has merge conflicts or is not mergeable</TooltipContent>
                  )}
                </Tooltip>
                {pr.url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={pr.url} target="_blank" rel="noopener noreferrer">
                      Open on GitHub
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </DrawerPanelFooter>
        ) : (
          <DrawerPanelFooter>
            <div className="flex items-center justify-between gap-2">
              <div />
              <div className="flex items-center gap-2">
                {!isMerged && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={handleReopen}
                  >
                    Reopen
                  </Button>
                )}
                {pr.url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={pr.url} target="_blank" rel="noopener noreferrer">
                      Open on GitHub
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </DrawerPanelFooter>
        )
      }
    >
      <DrawerBody>
        <div data-slot="github-pr-drawer" className="space-y-4">
          <SavingBar visible={isSaving} />

          {/* Header: author + repo + number + state */}
          <div className="flex items-start gap-3">
            {pr.authorAvatar ? (
              <Avatar size="sm">
                <AvatarImage src={pr.authorAvatar} alt={pr.author ?? ''} />
                <AvatarFallback>{(pr.author ?? '?')[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="flex items-center justify-center size-6 rounded-full bg-muted text-xs font-medium">
                {(pr.author ?? '?')[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  {pr.owner}/{pr.repo}#{pr.number}
                </span>
                <StateBadge state={pr.state ?? ''} draft={pr.draft} />
              </div>
              {pr.author && (
                <span className="text-xs text-muted-foreground">
                  by {pr.author}
                </span>
              )}
            </div>
          </div>

          {/* Editable Title */}
          <InlineEdit
            value={pr.title ?? ''}
            onSave={handleTitleSave}
            disabled={updateLoading}
          />

          {/* Branch comparison */}
          {pr.headBranch && pr.baseBranch && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono truncate max-w-[40%]">
                {pr.headBranch}
              </code>
              <span className="shrink-0">&rarr;</span>
              <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono truncate max-w-[40%]">
                {pr.baseBranch}
              </code>
            </div>
          )}

          {/* Status badges: review + CI */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={reviewStyle.variant}>{reviewStyle.label}</Badge>
            <Badge variant={checksStyle.variant}>{checksStyle.label}</Badge>
            {pr.mergeable === false && isOpen && (
              <Badge variant="destructive">Conflicts</Badge>
            )}
          </div>

          {/* Diff stats */}
          <DiffStats
            additions={pr.additions}
            deletions={pr.deletions}
            changedFiles={pr.changedFiles}
          />

          <Separator />

          {/* Labels (read-only) */}
          {pr.labels && pr.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {pr.labels.map((l) => (
                <LabelBadge key={l.name ?? ''} name={l.name ?? ''} color={l.color ?? ''} />
              ))}
            </div>
          )}

          {/* Reviewers (read-only) */}
          {pr.reviewers && pr.reviewers.length > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground">Reviewers</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {pr.reviewers.map((r) => (
                  <Badge key={r} variant="outline" className="text-[10px]">{r}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div>
            <MetadataRow label="Created" value={pr.createdAt ? formatRelative(pr.createdAt) : '—'} />
            <MetadataRow label="Updated" value={pr.updatedAt ? formatRelative(pr.updatedAt) : '—'} />
          </div>

          {/* Description */}
          <Separator />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Description</span>
              {!editingBody && (
                <Button variant="ghost" size="icon-xs" onClick={handleStartEditBody}>
                  <Pencil size={12} />
                </Button>
              )}
            </div>
            {editingBody ? (
              <MarkdownEditor
                value={draftBody}
                onChange={setDraftBody}
                onSave={handleSaveBody}
                onCancel={handleCancelBody}
                placeholder="Add a description..."
                size="sm"
              />
            ) : pr.body ? (
              <div className="rounded border border-border p-3">
                <Markdown content={pr.body} size="sm" />
              </div>
            ) : (
              <button
                type="button"
                className="w-full rounded border border-dashed border-border p-3 text-xs text-muted-foreground hover:border-foreground/30 transition-colors text-left"
                onClick={handleStartEditBody}
              >
                Add a description...
              </button>
            )}
          </div>

          {/* Add Comment */}
          <Separator />
          <div>
            <span className="text-xs font-medium text-muted-foreground mb-2 block">Add a comment</span>
            <Textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Leave a comment..."
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <Button
                size="sm"
                disabled={!commentBody.trim() || commentLoading}
                onClick={handleAddComment}
              >
                {commentLoading ? 'Commenting…' : 'Comment'}
              </Button>
            </div>
          </div>
        </div>
      </DrawerBody>

      <ConfirmDialog
        open={mergeDialogOpen}
        onOpenChange={setMergeDialogOpen}
        title="Merge pull request"
        description={`Squash and merge "${pr.title}" into ${pr.baseBranch ?? 'base branch'}?`}
        confirmLabel="Merge"
        onConfirm={handleMerge}
      />

      <ConfirmDialog
        open={closeDialogOpen}
        onOpenChange={setCloseDialogOpen}
        title="Close pull request"
        description={`Close "${pr.title}" without merging?`}
        confirmLabel="Close PR"
        variant="destructive"
        onConfirm={handleClose}
      />
    </DrawerContainer>
  );
}

/**
 * GitHubIssueEntityDrawer — Entity drawer for GitHub issues.
 *
 * Self-contained drawer component that:
 * - Parses the entity URI to extract owner/repo/number
 * - Fetches full issue data via the typed `githubIssue` GraphQL query
 * - Renders rich issue details (state, labels, assignees, description, etc.)
 * - Provides inline editing for title, labels, assignees, description
 * - Supports close/reopen actions and adding comments
 *
 * Registered on the github_issue entity definition via `ui: { drawer }`.
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import {
  DrawerBody,
  DrawerPanelFooter,
  Separator,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  ConfirmDialog,
  Markdown,
  MarkdownEditor,
  InlineEdit,
  Combobox,
  Textarea,
} from '@tryvienna/ui';
import type { ComboboxOption } from '@tryvienna/ui';
import { MessageSquare, Pencil } from 'lucide-react';
import { parseEntityURI } from '@tryvienna/sdk';
import { usePluginQuery, usePluginMutation } from '@tryvienna/sdk/react';
import type { EntityDrawerProps } from '@tryvienna/sdk';
import { GITHUB_URI_PATH } from '../entities/uri';
import {
  GET_GITHUB_ISSUE,
  UPDATE_GITHUB_ISSUE,
  ADD_GITHUB_ISSUE_COMMENT,
  GET_REPO_LABELS,
  GET_REPO_COLLABORATORS,
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
  closed: { className: 'bg-violet-500/15 text-violet-400 border border-violet-500/20', label: 'Closed' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StateBadge({ state }: { state: string }) {
  const style = STATE_STYLES[state] ?? { className: 'bg-muted text-muted-foreground', label: state };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${style.className}`}
    >
      {state === 'open' && <span className="size-1.5 rounded-full bg-emerald-400" />}
      {style.label}
    </span>
  );
}

function ColorDot({ color }: { color: string }) {
  const hex = color.startsWith('#') ? color : `#${color}`;
  return (
    <span
      className="inline-block size-3 rounded-full shrink-0"
      style={{ backgroundColor: hex }}
    />
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

export function GitHubIssueEntityDrawer({ uri, headerActions, DrawerContainer }: EntityDrawerProps) {
  const { id } = parseEntityURI(uri, GITHUB_URI_PATH);
  const owner = id['owner'] ?? '';
  const repo = id['repo'] ?? '';
  const issueNumber = parseInt(id['number'] ?? '0', 10);

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data, loading, error } = usePluginQuery(GET_GITHUB_ISSUE, {
    variables: { owner, repo, issueNumber },
    fetchPolicy: 'cache-and-network',
    skip: !owner || !repo || !issueNumber,
  });

  const { data: labelsData } = usePluginQuery(GET_REPO_LABELS, {
    variables: { owner, repo },
    skip: !owner || !repo,
  });

  const { data: collabData } = usePluginQuery(GET_REPO_COLLABORATORS, {
    variables: { owner, repo },
    skip: !owner || !repo,
  });

  // ── Mutations ────────────────────────────────────────────────────────────
  const [updateIssue, { loading: updateLoading }] = usePluginMutation(UPDATE_GITHUB_ISSUE);
  const [addComment, { loading: commentLoading }] = usePluginMutation(ADD_GITHUB_ISSUE_COMMENT);

  // ── Local state ──────────────────────────────────────────────────────────
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [editingBody, setEditingBody] = useState(false);
  const [draftBody, setDraftBody] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [optimisticLabels, setOptimisticLabels] = useState<string[] | null>(null);
  const [optimisticAssignees, setOptimisticAssignees] = useState<string[] | null>(null);
  const pendingLabelUpdate = useRef(false);
  const pendingAssigneeUpdate = useRef(false);

  const issue = data?.githubIssue;

  // ── Combobox options ─────────────────────────────────────────────────────
  const labelOptions: ComboboxOption[] = useMemo(() =>
    (labelsData?.githubRepoLabels ?? []).map((l) => ({
      label: l.name ?? '',
      value: l.name ?? '',
      icon: <ColorDot color={l.color ?? ''} />,
    })),
    [labelsData],
  );

  const collaboratorOptions: ComboboxOption[] = useMemo(() =>
    (collabData?.githubRepoCollaborators ?? []).map((c) => ({
      label: c.login ?? '',
      value: c.login ?? '',
      icon: (
        <img
          src={c.avatarUrl ?? ''}
          alt={c.login ?? ''}
          className="size-4 rounded-full"
        />
      ),
    })),
    [collabData],
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleClose = useCallback(async () => {
    await updateIssue({ variables: { input: { owner, repo, issueNumber, state: 'closed' } } });
    setCloseDialogOpen(false);
  }, [updateIssue, owner, repo, issueNumber]);

  const handleReopen = useCallback(async () => {
    await updateIssue({ variables: { input: { owner, repo, issueNumber, state: 'open' } } });
  }, [updateIssue, owner, repo, issueNumber]);

  const handleTitleSave = useCallback(async (title: string) => {
    await updateIssue({ variables: { input: { owner, repo, issueNumber, title } } });
  }, [updateIssue, owner, repo, issueNumber]);

  const handleLabelsChange = useCallback(async (labels: string | string[]) => {
    const labelArray = Array.isArray(labels) ? labels : [labels];
    setOptimisticLabels(labelArray);
    pendingLabelUpdate.current = true;
    try {
      await updateIssue({ variables: { input: { owner, repo, issueNumber, labels: labelArray } } });
    } catch {
      setOptimisticLabels(null);
    } finally {
      pendingLabelUpdate.current = false;
      setOptimisticLabels(null);
    }
  }, [updateIssue, owner, repo, issueNumber]);

  const handleAssigneesChange = useCallback(async (assignees: string | string[]) => {
    const assigneeArray = Array.isArray(assignees) ? assignees : [assignees];
    setOptimisticAssignees(assigneeArray);
    pendingAssigneeUpdate.current = true;
    try {
      await updateIssue({ variables: { input: { owner, repo, issueNumber, assignees: assigneeArray } } });
    } catch {
      setOptimisticAssignees(null);
    } finally {
      pendingAssigneeUpdate.current = false;
      setOptimisticAssignees(null);
    }
  }, [updateIssue, owner, repo, issueNumber]);

  const handleStartEditBody = useCallback(() => {
    setDraftBody(issue?.body ?? '');
    setEditingBody(true);
  }, [issue?.body]);

  const handleSaveBody = useCallback(async (body: string) => {
    await updateIssue({ variables: { input: { owner, repo, issueNumber, body } } });
    setEditingBody(false);
  }, [updateIssue, owner, repo, issueNumber]);

  const handleCancelBody = useCallback(() => {
    setEditingBody(false);
  }, []);

  const handleAddComment = useCallback(async () => {
    const body = commentBody.trim();
    if (!body) return;
    await addComment({ variables: { input: { owner, repo, issueNumber, body } } });
    setCommentBody('');
  }, [addComment, owner, repo, issueNumber, commentBody]);

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading && !issue) {
    return (
      <DrawerContainer title="Issue">
        <DrawerBody>
          <div data-slot="github-issue-drawer" className="space-y-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="size-6 rounded-full bg-muted" />
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
  if (error || !issue) {
    return (
      <DrawerContainer title="Issue">
        <DrawerBody>
          <div data-slot="github-issue-drawer" className="flex flex-col items-center gap-2 py-8">
            <span className="text-sm text-muted-foreground">
              {error ? 'Failed to load issue' : 'Issue not found'}
            </span>
          </div>
        </DrawerBody>
      </DrawerContainer>
    );
  }

  const isOpen = issue.state === 'open';
  const serverLabels = (issue.labels ?? []).map((l) => l.name ?? '').filter(Boolean);
  const serverAssignees = (issue.assignees ?? []).filter((a): a is string => !!a);
  const currentLabels = optimisticLabels ?? serverLabels;
  const currentAssignees = optimisticAssignees ?? serverAssignees;
  const isSaving = updateLoading || commentLoading;

  return (
    <DrawerContainer
      title={issue.title}
      headerActions={headerActions}
      footer={
        <DrawerPanelFooter>
          <div className="flex items-center justify-between gap-2">
            {isOpen ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={updateLoading}
                onClick={() => setCloseDialogOpen(true)}
              >
                Close Issue
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled={updateLoading}
                onClick={handleReopen}
              >
                Reopen
              </Button>
            )}
            {issue.url && (
              <Button variant="outline" size="sm" asChild>
                <a href={issue.url} target="_blank" rel="noopener noreferrer">
                  Open on GitHub
                </a>
              </Button>
            )}
          </div>
        </DrawerPanelFooter>
      }
    >
      <DrawerBody>
        <div data-slot="github-issue-drawer" className="space-y-4">
          <SavingBar visible={isSaving} />

          {/* Header: author + repo + number + state */}
          <div className="flex items-start gap-3">
            {issue.authorAvatar ? (
              <Avatar size="sm">
                <AvatarImage src={issue.authorAvatar} alt={issue.author ?? ''} />
                <AvatarFallback>{(issue.author ?? '?')[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="flex items-center justify-center size-6 rounded-full bg-muted text-xs font-medium">
                {(issue.author ?? '?')[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  {issue.owner}/{issue.repo}#{issue.number}
                </span>
                <StateBadge state={issue.state ?? ''} />
              </div>
              {issue.author && (
                <span className="text-xs text-muted-foreground">
                  by {issue.author}
                </span>
              )}
            </div>
          </div>

          {/* Editable Title */}
          <InlineEdit
            value={issue.title ?? ''}
            onSave={handleTitleSave}
            disabled={updateLoading}
          />

          {/* Labels */}
          <div>
            <span className="text-xs font-medium text-muted-foreground">Labels</span>
            <div className="mt-1">
              <Combobox
                multiple
                options={labelOptions}
                value={currentLabels}
                onValueChange={handleLabelsChange}
                placeholder="Add labels..."
                searchPlaceholder="Search labels..."
                emptyText="No labels found"
              />
            </div>
          </div>

          {/* Assignees */}
          <div>
            <span className="text-xs font-medium text-muted-foreground">Assignees</span>
            <div className="mt-1">
              <Combobox
                multiple
                options={collaboratorOptions}
                value={currentAssignees}
                onValueChange={handleAssigneesChange}
                placeholder="Add assignees..."
                searchPlaceholder="Search people..."
                emptyText="No collaborators found"
              />
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div>
            {issue.commentCount != null && (
              <MetadataRow
                label="Comments"
                value={
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare size={11} className="text-muted-foreground" />
                    {issue.commentCount}
                  </span>
                }
              />
            )}
            <MetadataRow label="Created" value={issue.createdAt ? formatRelative(issue.createdAt) : '—'} />
            <MetadataRow label="Updated" value={issue.updatedAt ? formatRelative(issue.updatedAt) : '—'} />
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
            ) : issue.body ? (
              <div className="rounded border border-border p-3">
                <Markdown content={issue.body} size="sm" />
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
        open={closeDialogOpen}
        onOpenChange={setCloseDialogOpen}
        title="Close issue"
        description={`Close "${issue.title}"?`}
        confirmLabel="Close Issue"
        variant="destructive"
        onConfirm={handleClose}
      />
    </DrawerContainer>
  );
}

/**
 * RedditPostEntityDrawer — Entity drawer for Reddit posts.
 *
 * Shows full post details, comment tree, AI draft reply, and send functionality.
 *
 * Registered on the reddit_post entity definition via `ui: { drawer }`.
 */

import { useState, useCallback } from 'react';
import {
  DrawerBody,
  DrawerPanelFooter,
  Separator,
  Badge,
  Button,
  Markdown,
  Textarea,
} from '@tryvienna/ui';
import { ExternalLink, MessageSquare, ArrowUp, Sparkles, Send, Clock, User } from 'lucide-react';
import { parseEntityURI } from '@tryvienna/sdk';
import { usePluginQuery, usePluginMutation } from '@tryvienna/sdk/react';
import type { EntityDrawerProps } from '@tryvienna/sdk';
import { REDDIT_POST_URI_PATH } from '../entities/uri';
import {
  GET_REDDIT_POST,
  GET_REDDIT_COMMENTS,
  POST_REDDIT_COMMENT,
  DRAFT_REDDIT_REPLY,
} from '../client/operations';
import { formatRelativeTime, formatScore, buildPermalink } from '../helpers';
import { loadSettings } from './useRedditSettings';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PostData {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  score: number;
  numComments: number;
  selftext: string;
  url: string;
  permalink: string;
  createdUtc: number;
  flair: string | null;
  isSelf: boolean;
  thumbnail: string | null;
  domain: string | null;
  upvoteRatio: number | null;
  fullname: string;
}

interface CommentData {
  id: string;
  author: string;
  body: string;
  score: number;
  createdUtc: number;
  depth: number;
  parentId: string;
  fullname: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function RedditPostEntityDrawer({ uri, DrawerContainer }: EntityDrawerProps) {
  // ── Parse URI ──────────────────────────────────────────────────────────
  const parsed = parseEntityURI(uri, REDDIT_POST_URI_PATH);
  const subreddit = parsed?.id?.['subreddit'] ?? '';
  const postId = parsed?.id?.['postId'] ?? '';

  // ── Queries ────────────────────────────────────────────────────────────
  const { data: postData, loading: postLoading, error: postError } = usePluginQuery<{
    redditPost: PostData;
  }>(GET_REDDIT_POST, {
    variables: { subreddit, postId },
    skip: !subreddit || !postId,
    fetchPolicy: 'cache-and-network',
  });

  const { data: commentsData, loading: commentsLoading } = usePluginQuery<{
    redditComments: CommentData[];
  }>(GET_REDDIT_COMMENTS, {
    variables: { subreddit, postId, sort: 'best', limit: 30 },
    skip: !subreddit || !postId,
    fetchPolicy: 'cache-and-network',
  });

  // ── Mutations ──────────────────────────────────────────────────────────
  const [postComment, { loading: commentSending }] = usePluginMutation(POST_REDDIT_COMMENT);
  const [draftReply, { loading: draftLoading }] = usePluginMutation(DRAFT_REDDIT_REPLY);

  // ── Reply state ────────────────────────────────────────────────────────
  const [replyText, setReplyText] = useState('');
  const [replyTarget, setReplyTarget] = useState<string | null>(null); // fullname of parent
  const [replySuccess, setReplySuccess] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // ── Draft state ────────────────────────────────────────────────────────
  const [showDraft, setShowDraft] = useState(false);

  const post = postData?.redditPost;
  const comments = commentsData?.redditComments ?? [];

  // ── Handlers ───────────────────────────────────────────────────────────

  const handleDraftReply = useCallback(async () => {
    if (!post) return;
    const settings = loadSettings();
    if (!settings.productContext) {
      setReplyText('[Configure your product description in Reddit settings to get AI-drafted replies]');
      setShowDraft(true);
      setReplyTarget(post.fullname);
      return;
    }

    try {
      const { data } = await draftReply({
        variables: {
          input: {
            subreddit: post.subreddit,
            postId: post.id,
            productContext: settings.productContext,
          },
        },
      });
      if (data?.redditDraftReply?.draftText) {
        setReplyText(data.redditDraftReply.draftText);
        setShowDraft(true);
        setReplyTarget(post.fullname);
      }
    } catch (err) {
      setReplyError(`Draft failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [post, draftReply]);

  const handleSendReply = useCallback(async () => {
    if (!replyText.trim() || !replyTarget) return;
    setReplyError(null);
    setReplySuccess(false);

    try {
      const { data } = await postComment({
        variables: {
          input: {
            parentFullname: replyTarget,
            text: replyText.trim(),
          },
        },
      });
      if (data?.redditPostComment?.success) {
        setReplySuccess(true);
        setReplyText('');
        setShowDraft(false);
        setTimeout(() => setReplySuccess(false), 3000);
      }
    } catch (err) {
      setReplyError(`Failed to post: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [replyText, replyTarget, postComment]);

  const handleReplyToComment = useCallback((commentFullname: string) => {
    setReplyTarget(commentFullname);
    setShowDraft(true);
    setReplyText('');
  }, []);

  // ── Loading state ──────────────────────────────────────────────────────
  if (postLoading && !post) {
    return (
      <DrawerContainer title="Loading…">
        <DrawerBody>
          <div className="flex items-center gap-2 p-4">
            <div className="size-1.5 rounded-full bg-foreground/40 animate-pulse" />
            <span className="text-xs text-muted-foreground">Loading post…</span>
          </div>
        </DrawerBody>
      </DrawerContainer>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (postError && !post) {
    return (
      <DrawerContainer title="Error">
        <DrawerBody>
          <div className="p-4 text-xs text-muted-foreground">
            Post not found or failed to load.
          </div>
        </DrawerBody>
      </DrawerContainer>
    );
  }

  if (!post) {
    return (
      <DrawerContainer title="Not Found">
        <DrawerBody>
          <div className="p-4 text-xs text-muted-foreground">Post not found.</div>
        </DrawerBody>
      </DrawerContainer>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <DrawerContainer
      title={post.title}
      footer={
        <DrawerPanelFooter>
          <div className="flex items-center justify-between w-full">
            <a
              href={buildPermalink(post.permalink)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground no-underline"
            >
              <ExternalLink size={12} />
              Open on Reddit
            </a>
            <Button
              variant="default"
              size="sm"
              className="h-7 text-xs"
              onClick={handleDraftReply}
              disabled={draftLoading}
            >
              <Sparkles size={12} className="mr-1.5" />
              {draftLoading ? 'Drafting…' : 'Draft Reply'}
            </Button>
          </div>
        </DrawerPanelFooter>
      }
    >
      <DrawerBody>
        <div className="space-y-4">
          {/* ── Post Header ──────────────────────────────────────── */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-[10px]">
                r/{post.subreddit}
              </Badge>
              {post.flair && (
                <Badge variant="outline" className="text-[10px]">
                  {post.flair}
                </Badge>
              )}
            </div>

            <h3 className="text-sm font-medium leading-snug">{post.title}</h3>

            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <User size={10} />
                u/{post.author}
              </span>
              <span className="flex items-center gap-1">
                <ArrowUp size={10} />
                {formatScore(post.score)} pts
                {post.upvoteRatio != null && (
                  <span className="text-muted-foreground/60">
                    ({Math.round(post.upvoteRatio * 100)}%)
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare size={10} />
                {post.numComments}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {formatRelativeTime(post.createdUtc)}
              </span>
            </div>
          </div>

          <Separator />

          {/* ── Post Body ────────────────────────────────────────── */}
          {post.isSelf && post.selftext ? (
            <div className="text-xs">
              <Markdown content={post.selftext} />
            </div>
          ) : !post.isSelf ? (
            <div className="rounded-lg border border-border p-3">
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-primary hover:underline"
              >
                <ExternalLink size={12} />
                {post.domain ?? post.url}
              </a>
            </div>
          ) : null}

          {/* ── Draft Reply Section ──────────────────────────────── */}
          {showDraft && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={12} className="text-amber-400" />
                  <span className="text-xs font-medium">
                    {replyTarget === post.fullname ? 'Reply to Post' : 'Reply to Comment'}
                  </span>
                </div>
                <Textarea
                  value={replyText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
                  placeholder="Write your reply…"
                  className="min-h-[120px] text-xs"
                  rows={6}
                />
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setShowDraft(false);
                      setReplyText('');
                      setReplyTarget(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleSendReply}
                    disabled={commentSending || !replyText.trim()}
                  >
                    <Send size={12} className="mr-1.5" />
                    {commentSending ? 'Sending…' : 'Send Reply'}
                  </Button>
                </div>
                {replySuccess && (
                  <div className="text-xs text-emerald-400">Reply posted successfully!</div>
                )}
                {replyError && (
                  <div className="text-xs text-red-400">{replyError}</div>
                )}
              </div>
            </>
          )}

          {/* ── Comments Section ─────────────────────────────────── */}
          <Separator />
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={12} className="text-muted-foreground" />
              <span className="text-xs font-medium">
                Comments ({post.numComments})
              </span>
            </div>

            {commentsLoading && comments.length === 0 && (
              <div className="flex items-center gap-2 py-2">
                <div className="size-1.5 rounded-full bg-foreground/40 animate-pulse" />
                <span className="text-[11px] text-muted-foreground">Loading comments…</span>
              </div>
            )}

            {comments.length === 0 && !commentsLoading && (
              <div className="py-2 text-[11px] text-muted-foreground">No comments yet.</div>
            )}

            {comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded border border-border/50 p-2 hover:border-border transition-colors"
                style={{ marginLeft: `${Math.min(comment.depth, 4) * 12}px` }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="font-medium text-foreground/80">u/{comment.author}</span>
                    <span>{formatScore(comment.score)} pts</span>
                    <span>{formatRelativeTime(comment.createdUtc)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1.5 text-[10px]"
                    onClick={() => handleReplyToComment(comment.fullname)}
                  >
                    Reply
                  </Button>
                </div>
                <div className="text-[11px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {comment.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DrawerBody>
    </DrawerContainer>
  );
}

/**
 * RedditSettingsDrawer — Settings panel for the Reddit plugin.
 *
 * Credential management + subreddit/keyword config + AI draft settings.
 *
 * @ai-context
 * - Credentials managed via hostApi.setCredential/removeCredential
 * - Settings persisted via useRedditSettings (localStorage + CustomEvent)
 * - All UI from @tryvienna/ui
 * - Rendered inside RedditPluginDrawer when payload.view === 'settings'
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ContentSection,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Button,
  Input,
  Label,
  Textarea,
} from '@tryvienna/ui';
import type { PluginHostApi, CanvasLogger } from '@tryvienna/sdk';
import { KeyRound, Check, Trash2, Eye, EyeOff, X, Plus, RotateCcw } from 'lucide-react';
import { useRedditSettings, type RedditSettings } from './useRedditSettings';

// ─────────────────────────────────────────────────────────────────────────────
// Credential helpers
// ─────────────────────────────────────────────────────────────────────────────

const CREDENTIAL_LABELS: Record<string, string> = {
  reddit_client_id: 'Client ID',
  reddit_client_secret: 'Client Secret',
  reddit_username: 'Reddit Username',
  reddit_password: 'Reddit Password',
};

function getCredentialLabel(key: string): string {
  return CREDENTIAL_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─────────────────────────────────────────────────────────────────────────────
// CredentialField
// ─────────────────────────────────────────────────────────────────────────────

function CredentialField({
  integrationId,
  credentialKey,
  isSet,
  hostApi,
  onUpdate,
}: {
  integrationId: string;
  credentialKey: string;
  isSet: boolean;
  hostApi: PluginHostApi;
  onUpdate: () => void;
}) {
  const label = getCredentialLabel(credentialKey);
  const isPassword = credentialKey === 'reddit_password' || credentialKey === 'reddit_client_secret';
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [showValue, setShowValue] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!value.trim()) return;
    setSaving(true);
    try {
      await hostApi.setCredential(integrationId, credentialKey, value.trim());
      setValue('');
      setEditing(false);
      onUpdate();
    } finally {
      setSaving(false);
    }
  }, [integrationId, credentialKey, value, hostApi, onUpdate]);

  const handleRemove = useCallback(async () => {
    setSaving(true);
    try {
      await hostApi.removeCredential(integrationId, credentialKey);
      onUpdate();
    } finally {
      setSaving(false);
    }
  }, [integrationId, credentialKey, hostApi, onUpdate]);

  const handleCancel = useCallback(() => {
    setEditing(false);
    setValue('');
  }, []);

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KeyRound size={14} className="text-amber-400" />
          <Label className="text-xs font-medium">{label}</Label>
        </div>
        <div className="flex items-center gap-1">
          {isSet && !editing && (
            <>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                <Check size={10} />
                Set
              </span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setEditing(true)}>
                <Eye size={12} />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={handleRemove} disabled={saving}>
                <Trash2 size={12} />
              </Button>
            </>
          )}
          {!isSet && !editing && (
            <Button variant="outline" size="sm" className="h-6 text-xs" onClick={() => setEditing(true)}>
              Configure
            </Button>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-2 flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type={isPassword && !showValue ? 'password' : 'text'}
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              placeholder={isSet ? 'Enter new value to replace' : `Enter ${label.toLowerCase()}`}
              className="h-7 pr-8 text-xs"
              autoFocus
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
            />
            {isPassword && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0"
                onClick={() => setShowValue(!showValue)}
              >
                {showValue ? <EyeOff size={12} /> : <Eye size={12} />}
              </Button>
            )}
          </div>
          <Button variant="default" size="sm" className="h-7 text-xs" onClick={handleSave} disabled={!value.trim() || saving}>
            Save
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleCancel}>
            <X size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TagInput — reusable chip/tag input for subreddits and keywords
// ─────────────────────────────────────────────────────────────────────────────

function TagInput({
  values,
  onChange,
  placeholder,
  prefix,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  prefix?: string;
}) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = useCallback(() => {
    const trimmed = inputValue.trim().replace(/^r\//, ''); // strip r/ prefix if user types it
    if (!trimmed || values.includes(trimmed)) return;
    onChange([...values, trimmed]);
    setInputValue('');
  }, [inputValue, values, onChange]);

  const handleRemove = useCallback((value: string) => {
    onChange(values.filter((v) => v !== value));
  }, [values, onChange]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="h-7 flex-1 text-xs"
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={handleAdd} disabled={!inputValue.trim()}>
          <Plus size={14} />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
            >
              {prefix}{v}
              <button
                type="button"
                className="ml-0.5 text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer p-0"
                onClick={() => handleRemove(v)}
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings Drawer
// ─────────────────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'hot', label: 'Hot' },
  { value: 'rising', label: 'Rising' },
];

const LIMIT_OPTIONS = [10, 25, 50];

export function RedditSettingsDrawer({
  hostApi,
  logger,
}: {
  hostApi: PluginHostApi;
  logger: CanvasLogger;
}) {
  const { settings, updateSettings, resetSettings } = useRedditSettings();

  // ── Credential status ────────────────────────────────────────────────────
  const [credentials, setCredentials] = useState<Array<{ key: string; isSet: boolean }>>([]);
  const [credLoading, setCredLoading] = useState(true);

  const fetchCredentials = useCallback(async () => {
    try {
      const keys = await hostApi.getCredentialStatus('reddit');
      setCredentials(keys);
    } catch (err) {
      logger.warn('Failed to fetch credential status', { error: String(err) });
    } finally {
      setCredLoading(false);
    }
  }, [hostApi, logger]);

  useEffect(() => { fetchCredentials(); }, [fetchCredentials]);

  const allCredsSet = credentials.length > 0 && credentials.every((k) => k.isSet);

  return (
    <div className="space-y-6">
      {/* ── Authentication ─────────────────────────────────────────────── */}
      <ContentSection
        title="Authentication"
        description="Reddit script app credentials. Create an app at reddit.com/prefs/apps"
      >
        <div className="space-y-2">
          {credLoading ? (
            <div className="text-xs text-muted-foreground">Loading credentials…</div>
          ) : credentials.length === 0 ? (
            // Render default credential fields when none returned yet
            ['reddit_client_id', 'reddit_client_secret', 'reddit_username', 'reddit_password'].map((key) => (
              <CredentialField
                key={key}
                integrationId="reddit"
                credentialKey={key}
                isSet={false}
                hostApi={hostApi}
                onUpdate={fetchCredentials}
              />
            ))
          ) : (
            credentials.map((cred) => (
              <CredentialField
                key={cred.key}
                integrationId="reddit"
                credentialKey={cred.key}
                isSet={cred.isSet}
                hostApi={hostApi}
                onUpdate={fetchCredentials}
              />
            ))
          )}
        </div>
        {allCredsSet && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
            <Check size={12} />
            All credentials configured
          </div>
        )}
      </ContentSection>

      {/* ── Subreddits ─────────────────────────────────────────────── */}
      <ContentSection
        title="Subreddits"
        description="Communities to monitor for engagement opportunities"
      >
        <TagInput
          values={settings.subreddits}
          onChange={(subreddits) => updateSettings({ subreddits })}
          placeholder="e.g. startups, SaaS, indiehackers"
          prefix="r/"
        />
      </ContentSection>

      {/* ── Keywords ──────────────────────────────────────────────── */}
      <ContentSection
        title="Keywords"
        description="Filter posts that mention these terms"
      >
        <TagInput
          values={settings.keywords}
          onChange={(keywords) => updateSettings({ keywords })}
          placeholder="e.g. solo founder, side project, feedback"
        />
      </ContentSection>

      {/* ── Sort Order ────────────────────────────────────────────── */}
      <ContentSection
        title="Sort Order"
        description="How to sort posts from monitored subreddits"
      >
        <Select
          value={settings.sortBy}
          onValueChange={(value: string) => updateSettings({ sortBy: value as RedditSettings['sortBy'] })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ContentSection>

      {/* ── Post Limit ────────────────────────────────────────────── */}
      <ContentSection
        title="Post Limit"
        description="Max posts to fetch per refresh"
      >
        <Select
          value={String(settings.limit)}
          onValueChange={(value: string) => updateSettings({ limit: Number(value) })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIMIT_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} posts
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ContentSection>

      {/* ── Product Context ───────────────────────────────────────── */}
      <ContentSection
        title="Your Product"
        description="Describe your product so AI can draft relevant replies"
      >
        <Textarea
          value={settings.productContext}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            updateSettings({ productContext: e.target.value })
          }
          placeholder="e.g. Vienna is a desktop productivity app for developers that combines project management, notes, and AI assistance in one place..."
          className="min-h-[80px] text-xs"
          rows={4}
        />
      </ContentSection>

      {/* ── Reset ─────────────────────────────────────────────────── */}
      <div className="pt-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs w-full"
          onClick={resetSettings}
        >
          <RotateCcw size={12} className="mr-1.5" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}

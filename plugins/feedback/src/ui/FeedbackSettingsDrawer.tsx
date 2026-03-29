/**
 * FeedbackSettingsDrawer — Settings panel for the Feedback plugin.
 *
 * Manages API connection credentials and nav display preferences.
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
} from '@tryvienna/ui';
import type { PluginHostApi, CanvasLogger } from '@tryvienna/sdk';
import { KeyRound, Check, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { useFeedbackSettings, type FeedbackSettings } from './useFeedbackSettings';

// ─────────────────────────────────────────────────────────────────────────────
// Credential helpers
// ─────────────────────────────────────────────────────────────────────────────

const CREDENTIAL_LABELS: Record<string, string> = {
  api_key: 'Admin API Key',
  base_url: 'Vienna App URL',
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
  isSecret = true,
  placeholder,
}: {
  integrationId: string;
  credentialKey: string;
  isSet: boolean;
  hostApi: PluginHostApi;
  onUpdate: () => void;
  isSecret?: boolean;
  placeholder?: string;
}) {
  const label = getCredentialLabel(credentialKey);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [showValue, setShowValue] = useState(!isSecret);
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
              type={isSecret && !showValue ? 'password' : 'text'}
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              placeholder={placeholder ?? (isSet ? 'Enter new value to replace' : `Enter ${label.toLowerCase()}`)}
              className="h-7 pr-8 text-xs"
              autoFocus
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
            />
            {isSecret && (
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
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'archived', label: 'Archived' },
];

const GROUP_BY_OPTIONS: { value: FeedbackSettings['groupBy']; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'status', label: 'Status' },
  { value: 'source', label: 'Source' },
];

const LIMIT_OPTIONS = [10, 20, 50, 100];

// ─────────────────────────────────────────────────────────────────────────────
// Settings Drawer
// ─────────────────────────────────────────────────────────────────────────────

export function FeedbackSettingsDrawer({
  hostApi,
  logger,
}: {
  hostApi: PluginHostApi;
  logger: CanvasLogger;
}) {
  const { settings, updateSettings, resetSettings } = useFeedbackSettings();

  // ── Credential status ──────────────────────────────────────────────────
  const [credentials, setCredentials] = useState<Array<{ key: string; isSet: boolean }>>([]);
  const [credLoading, setCredLoading] = useState(true);

  const fetchCredentials = useCallback(async () => {
    try {
      const keys = await hostApi.getCredentialStatus('feedback');
      setCredentials(keys);
      window.dispatchEvent(new CustomEvent('vienna-plugin:feedback:credentials-changed'));
    } catch (err) {
      logger.warn('Failed to fetch credential status', { error: String(err) });
    } finally {
      setCredLoading(false);
    }
  }, [hostApi, logger]);

  useEffect(() => { fetchCredentials(); }, [fetchCredentials]);

  const getCredStatus = (key: string) => credentials.find((c) => c.key === key)?.isSet ?? false;

  return (
    <div className="space-y-4">
      {/* Connection */}
      <ContentSection title="Connection">
        <div className="space-y-2">
          <CredentialField
            integrationId="feedback"
            credentialKey="base_url"
            isSet={getCredStatus('base_url')}
            hostApi={hostApi}
            onUpdate={fetchCredentials}
            isSecret={false}
            placeholder="https://your-vienna-app.vercel.app"
          />
          <CredentialField
            integrationId="feedback"
            credentialKey="api_key"
            isSet={getCredStatus('api_key')}
            hostApi={hostApi}
            onUpdate={fetchCredentials}
          />
        </div>
      </ContentSection>

      {/* Status Filter */}
      <ContentSection title="Status filter">
        <Select
          value={settings.statusFilter}
          onValueChange={(value) => updateSettings({ statusFilter: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ContentSection>

      {/* Group By */}
      <ContentSection title="Group by">
        <div className="flex flex-wrap gap-1">
          {GROUP_BY_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={settings.groupBy === opt.value ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => updateSettings({ groupBy: opt.value })}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </ContentSection>

      {/* Item Limit */}
      <ContentSection title="Item limit">
        <Select
          value={String(settings.limit)}
          onValueChange={(value) => updateSettings({ limit: Number(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIMIT_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} items
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ContentSection>

      {/* Reset */}
      <ContentSection>
        <Button variant="outline" size="sm" onClick={resetSettings} className="w-full">
          Reset to defaults
        </Button>
        <p className="text-[11px] text-muted-foreground mt-2 text-center">
          Settings are saved automatically
        </p>
      </ContentSection>
    </div>
  );
}

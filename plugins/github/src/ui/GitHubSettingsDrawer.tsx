/**
 * GitHubSettingsDrawer — Settings panel for the GitHub plugin.
 *
 * Combines credential management + repo selection combobox + filter settings.
 * Uses GraphQL queries for repo fetching (cache-aware, invalidation-friendly).
 *
 * @ai-context
 * - Uses Apollo useQuery for repo fetching (githubRepos query)
 * - Uses localStorage-based useGitHubSettings for filter persistence
 * - Credentials managed via hostApi.setCredential/removeCredential (IPC-backed)
 * - All UI from @vienna/ui for consistency
 * - Rendered inside GitHubPluginDrawer when payload.view === 'settings'
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePluginQuery } from '@vienna/sdk';
import { gql } from 'graphql-tag';
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
  Combobox,
} from '@vienna/ui';
import type { PluginHostApi, CanvasLogger, OAuthProviderStatusEntry } from '@vienna/sdk';
import { KeyRound, Check, Trash2, Eye, EyeOff, X, Shield, ExternalLink, Unplug } from 'lucide-react';
import { useGitHubSettings, type GitHubSettings } from './useGitHubSettings';

// ─────────────────────────────────────────────────────────────────────────────
// Credential helpers
// ─────────────────────────────────────────────────────────────────────────────

const CREDENTIAL_LABELS: Record<string, string> = {
  personal_access_token: 'Personal Access Token',
  github_oauth_client_id: 'OAuth Client ID',
  github_oauth_client_secret: 'OAuth Client Secret',
};

const OAUTH_CREDENTIAL_PATTERN = /oauth_client_(id|secret)$/;

function getCredentialLabel(key: string): string {
  if (CREDENTIAL_LABELS[key]) return CREDENTIAL_LABELS[key];
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─────────────────────────────────────────────────────────────────────────────
// GraphQL
// ─────────────────────────────────────────────────────────────────────────────

const GET_REPOS = gql`
  query GetGitHubRepos($limit: Int) {
    githubRepos(sort: "pushed", limit: $limit) {
      fullName
      description
      private
      language
      updatedAt
    }
  }
`;

interface RepoShape {
  fullName: string;
  description?: string;
  private?: boolean;
  language?: string;
  updatedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CredentialField — Uses @vienna/ui components exclusively
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
          <KeyRound size={14} className="text-muted-foreground" />
          <Label className="text-xs font-medium">{label}</Label>
        </div>
        <div className="flex items-center gap-1">
          {isSet && !editing && (
            <>
              <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
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
              type={!showValue ? 'password' : 'text'}
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
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0"
              onClick={() => setShowValue(!showValue)}
            >
              {showValue ? <EyeOff size={12} /> : <Eye size={12} />}
            </Button>
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
// OAuthConnectButton — Connect / Disconnect button for OAuth
// ─────────────────────────────────────────────────────────────────────────────

function OAuthConnectButton({
  connected,
  loading,
  onConnect,
  onDisconnect,
}: {
  connected: boolean;
  loading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  if (connected) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-green-500/20 bg-green-500/5 p-3">
        <div className="flex items-center gap-2">
          <Check size={14} className="text-green-600 dark:text-green-400" />
          <span className="text-xs font-medium text-green-600 dark:text-green-400">Connected via OAuth</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-destructive"
          onClick={onDisconnect}
          disabled={loading}
        >
          <Unplug size={12} className="mr-1" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 w-full text-xs"
      onClick={onConnect}
      disabled={loading}
    >
      {loading ? (
        'Waiting for authorization...'
      ) : (
        <>
          <ExternalLink size={12} className="mr-1.5" />
          Connect with GitHub
        </>
      )}
    </Button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings Drawer
// ─────────────────────────────────────────────────────────────────────────────

const PR_FILTER_OPTIONS: { value: GitHubSettings['prFilter']; label: string }[] = [
  { value: 'authored', label: 'Authored by me' },
  { value: 'review_requested', label: 'Review requested' },
  { value: 'mentioned', label: 'Mentioned' },
  { value: 'assigned', label: 'Assigned to me' },
];

const ISSUE_FILTER_OPTIONS: { value: GitHubSettings['issueFilter']; label: string }[] = [
  { value: 'assigned', label: 'Assigned to me' },
  { value: 'created', label: 'Created by me' },
  { value: 'mentioned', label: 'Mentioned' },
  { value: 'all', label: 'All (watched repos)' },
];

const STATE_OPTIONS: { value: string; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
];

const LIMIT_OPTIONS = [10, 20, 50, 100];

export function GitHubSettingsDrawer({
  hostApi,
  logger,
}: {
  hostApi: PluginHostApi;
  logger: CanvasLogger;
}) {
  const { settings, updateSettings, resetSettings } = useGitHubSettings();

  // ── Credential status ────────────────────────────────────────────────────
  const [credentials, setCredentials] = useState<Array<{ key: string; isSet: boolean }>>([]);
  const [credLoading, setCredLoading] = useState(true);

  const fetchCredentials = useCallback(async () => {
    try {
      const keys = await hostApi.getCredentialStatus('github');
      setCredentials(keys);
    } catch (err) {
      logger.warn('Failed to fetch credential status', { error: String(err) });
    } finally {
      setCredLoading(false);
    }
  }, [hostApi, logger]);

  useEffect(() => { fetchCredentials(); }, [fetchCredentials]);

  // ── OAuth status ──────────────────────────────────────────────────────
  const [oauthProviders, setOauthProviders] = useState<OAuthProviderStatusEntry[]>([]);
  const [oauthLoading, setOauthLoading] = useState(false);

  const fetchOAuthStatus = useCallback(async () => {
    try {
      const providers = await hostApi.getOAuthStatus('github');
      setOauthProviders(providers);
    } catch (err) {
      logger.warn('Failed to fetch OAuth status', { error: String(err) });
    }
  }, [hostApi, logger]);

  useEffect(() => { fetchOAuthStatus(); }, [fetchOAuthStatus]);

  const oauthConnected = oauthProviders.some((p) => p.connected);

  // Separate OAuth credentials from API keys/tokens
  const oauthCredentials = useMemo(
    () => credentials.filter((k) => OAUTH_CREDENTIAL_PATTERN.test(k.key)),
    [credentials],
  );
  const apiCredentials = useMemo(
    () => credentials.filter((k) => !OAUTH_CREDENTIAL_PATTERN.test(k.key)),
    [credentials],
  );

  // Check if OAuth client credentials are configured (needed for OAuth flow)
  const hasOAuthClientCreds = oauthCredentials.every((k) => k.isSet) && oauthCredentials.length > 0;

  // Authenticated if PAT is set OR OAuth flow completed
  const hasPat = apiCredentials.some((k) => k.key === 'personal_access_token' && k.isSet);
  const hasToken = hasPat || oauthConnected;

  // ── Repo fetching via GraphQL (only when authenticated) ──────────────────
  const { data: repoData, loading: repoLoading } = usePluginQuery<{ githubRepos: RepoShape[] }>(
    GET_REPOS,
    {
      variables: { limit: 100 },
      skip: !hasToken,
      fetchPolicy: 'cache-and-network',
    },
  );

  const repoOptions = (repoData?.githubRepos ?? []).map((r) => ({
    label: r.fullName,
    value: r.fullName,
  }));

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Authentication */}
      {credLoading ? (
        <ContentSection title="Authentication">
          <p className="text-xs text-muted-foreground">Loading...</p>
        </ContentSection>
      ) : credentials.length === 0 ? (
        <ContentSection title="Authentication">
          <p className="text-xs text-muted-foreground">No credentials configured for this integration.</p>
        </ContentSection>
      ) : (
        <>
          {/* API Keys / Tokens */}
          {apiCredentials.length > 0 && (
            <ContentSection title="API Authentication">
              <div className="flex flex-col gap-2">
                {apiCredentials.map(({ key, isSet }) => (
                  <CredentialField
                    key={key}
                    integrationId="github"
                    credentialKey={key}
                    isSet={isSet}
                    hostApi={hostApi}
                    onUpdate={fetchCredentials}
                  />
                ))}
              </div>
            </ContentSection>
          )}

          {/* OAuth Credentials */}
          {oauthCredentials.length > 0 && (
            <ContentSection title="OAuth Configuration">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <Shield size={12} className="text-muted-foreground" />
                  <p className="text-[11px] text-muted-foreground">
                    Create an OAuth app on GitHub and enter your credentials below to enable OAuth login.
                  </p>
                </div>
                {oauthCredentials.map(({ key, isSet }) => (
                  <CredentialField
                    key={key}
                    integrationId="github"
                    credentialKey={key}
                    isSet={isSet}
                    hostApi={hostApi}
                    onUpdate={fetchCredentials}
                  />
                ))}

                {/* OAuth Connect / Disconnect */}
                {hasOAuthClientCreds && (
                  <OAuthConnectButton
                    connected={oauthConnected}
                    loading={oauthLoading}
                    onConnect={async () => {
                      setOauthLoading(true);
                      try {
                        const result = await hostApi.startOAuthFlow('github', 'github');
                        if (!result.success) {
                          logger.error('OAuth flow failed to start', { error: result.error });
                        }
                        // Poll for completion (the flow happens in background via browser)
                        // We'll poll OAuth status until connected or timeout
                        const poll = setInterval(async () => {
                          const providers = await hostApi.getOAuthStatus('github');
                          setOauthProviders(providers);
                          if (providers.some((p) => p.connected)) {
                            clearInterval(poll);
                            setOauthLoading(false);
                            await fetchCredentials();
                          }
                        }, 2000);
                        // Timeout after 5 minutes
                        setTimeout(() => {
                          clearInterval(poll);
                          setOauthLoading(false);
                        }, 300_000);
                      } catch (err) {
                        logger.error('OAuth flow error', { error: String(err) });
                        setOauthLoading(false);
                      }
                    }}
                    onDisconnect={async () => {
                      setOauthLoading(true);
                      try {
                        await hostApi.revokeOAuthToken('github', 'github');
                        await fetchOAuthStatus();
                        await fetchCredentials();
                      } finally {
                        setOauthLoading(false);
                      }
                    }}
                  />
                )}
              </div>
            </ContentSection>
          )}
        </>
      )}

      {/* Repo Selection — uses GraphQL githubRepos query */}
      {hasToken && (
        <ContentSection title="Watched repositories">
          <div className="flex flex-col gap-2">
            <Combobox
              options={repoOptions}
              value={settings.repos}
              onValueChange={(repos: string[]) => updateSettings({ repos })}
              multiple
              placeholder={repoLoading ? 'Loading repos...' : 'Select repositories...'}
              searchPlaceholder="Search repositories..."
              emptyText="No repositories found."
              disabled={repoLoading}
            />
            {settings.repos.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Select repos to filter PRs and issues. Leave empty to show all.
              </p>
            )}
          </div>
        </ContentSection>
      )}

      {/* PR Filter */}
      {hasToken && (
        <ContentSection title="Pull requests">
          <div className="flex flex-col gap-2">
            <Select
              value={settings.prFilter}
              onValueChange={(val: string) => updateSettings({ prFilter: val as GitHubSettings['prFilter'] })}
            >
              <SelectTrigger className="h-8 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PR_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={settings.prState}
              onValueChange={(val: string) => updateSettings({ prState: val as GitHubSettings['prState'] })}
            >
              <SelectTrigger className="h-8 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </ContentSection>
      )}

      {/* Issue Filter + State */}
      {hasToken && (
        <ContentSection title="Issues">
          <div className="flex flex-col gap-2">
            <Select
              value={settings.issueFilter}
              onValueChange={(val: string) => updateSettings({ issueFilter: val as GitHubSettings['issueFilter'] })}
            >
              <SelectTrigger className="h-8 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={settings.issueState}
              onValueChange={(val: string) => updateSettings({ issueState: val as GitHubSettings['issueState'] })}
            >
              <SelectTrigger className="h-8 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {settings.issueFilter === 'all' && settings.repos.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Select watched repos above to use the &quot;All&quot; filter, otherwise no results will show.
              </p>
            )}
          </div>
        </ContentSection>
      )}

      {/* Item Limit */}
      {hasToken && (
        <ContentSection title="Item limit">
          <Select
            value={String(settings.limit)}
            onValueChange={(val: string) => updateSettings({ limit: parseInt(val, 10) })}
          >
            <SelectTrigger className="h-8 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIMIT_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>{n} items</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ContentSection>
      )}

      {/* Reset */}
      {hasToken && (
        <div className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={resetSettings}
          >
            Reset to defaults
          </Button>
        </div>
      )}
    </div>
  );
}

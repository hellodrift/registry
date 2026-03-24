/**
 * useGitHubSettings — Persistent settings for the GitHub nav section.
 *
 * Settings are stored in localStorage, scoped to the plugin.
 * Uses CustomEvent for cross-component synchronization (nav ↔ settings drawer).
 */

import { useState, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface GitHubSettings {
  /** Repos to show in nav (e.g., ["owner/repo"]) */
  repos: string[];
  /** PR filter mode */
  prFilter: 'authored' | 'review_requested' | 'mentioned' | 'assigned';
  /** PR state filter */
  prState: 'open' | 'closed';
  /** Issue filter mode */
  issueFilter: 'assigned' | 'created' | 'mentioned' | 'all';
  /** Issue state filter */
  issueState: 'open' | 'closed';
  /** Max items to fetch */
  limit: number;
}

export const DEFAULT_SETTINGS: GitHubSettings = {
  repos: [],
  prFilter: 'authored',
  prState: 'open',
  issueFilter: 'assigned',
  issueState: 'open',
  limit: 20,
};

// ─────────────────────────────────────────────────────────────────────────────
// Storage
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'vienna-plugin:github:settings';
const CHANGE_EVENT = 'vienna-plugin:github:settings-changed';

function loadSettings(): GitHubSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: GitHubSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {
    // localStorage unavailable
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useGitHubSettings() {
  const [settings, setSettingsState] = useState(loadSettings);

  useEffect(() => {
    const handler = () => setSettingsState(loadSettings());
    window.addEventListener(CHANGE_EVENT, handler);
    return () => window.removeEventListener(CHANGE_EVENT, handler);
  }, []);

  const updateSettings = useCallback((patch: Partial<GitHubSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS);
    setSettingsState(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSettings, resetSettings };
}

/**
 * useRedditSettings — Persistent settings for the Reddit plugin.
 *
 * Settings are stored in localStorage, scoped to the plugin.
 * Uses CustomEvent for cross-component synchronization (nav ↔ settings drawer).
 */

import { useState, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RedditSettings {
  /** Subreddit names to monitor (without r/ prefix) */
  subreddits: string[];
  /** Keywords to filter/search for within posts */
  keywords: string[];
  /** Post sort order */
  sortBy: 'new' | 'hot' | 'rising';
  /** Max posts per fetch */
  limit: number;
  /** Description of user's product for AI-drafted replies */
  productContext: string;
}

export const DEFAULT_SETTINGS: RedditSettings = {
  subreddits: [],
  keywords: [],
  sortBy: 'new',
  limit: 25,
  productContext: '',
};

// ─────────────────────────────────────────────────────────────────────────────
// Storage
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'vienna-plugin:reddit:settings';
const CHANGE_EVENT = 'vienna-plugin:reddit:settings-changed';

export function loadSettings(): RedditSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: RedditSettings): void {
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

export function useRedditSettings() {
  const [settings, setSettingsState] = useState(loadSettings);

  useEffect(() => {
    const handler = () => setSettingsState(loadSettings());
    window.addEventListener(CHANGE_EVENT, handler);
    return () => window.removeEventListener(CHANGE_EVENT, handler);
  }, []);

  const updateSettings = useCallback((patch: Partial<RedditSettings>) => {
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

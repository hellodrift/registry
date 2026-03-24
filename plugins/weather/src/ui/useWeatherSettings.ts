/**
 * useWeatherSettings — Persistent settings for the Weather plugin.
 *
 * Settings are stored in localStorage, scoped to the plugin.
 * Uses CustomEvent for cross-component synchronization (e.g., settings
 * drawer updates are reflected immediately in the nav section and menu bar).
 */

import { useState, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface WeatherSettings {
  /** Display name for the location (e.g., "San Francisco, CA") */
  locationName: string;
  /** Latitude for the Open-Meteo forecast API */
  latitude: number;
  /** Longitude for the Open-Meteo forecast API */
  longitude: number;
  /** Temperature unit */
  units: 'fahrenheit' | 'celsius';
}

export const DEFAULT_SETTINGS: WeatherSettings = {
  locationName: 'San Francisco, CA',
  latitude: 37.7749,
  longitude: -122.4194,
  units: 'fahrenheit',
};

// ─────────────────────────────────────────────────────────────────────────────
// Storage
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'vienna-plugin:weather:settings';
const CHANGE_EVENT = 'vienna-plugin:weather:settings-changed';

function loadSettings(): WeatherSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: WeatherSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // eslint-disable-next-line no-restricted-properties
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {
    // localStorage unavailable — ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useWeatherSettings() {
  const [settings, setSettingsState] = useState(loadSettings);

  // Listen for changes from other components (e.g., settings drawer)
  useEffect(() => {
    const handler = () => setSettingsState(loadSettings());
    // eslint-disable-next-line no-restricted-properties
    window.addEventListener(CHANGE_EVENT, handler);
    // eslint-disable-next-line no-restricted-properties
    return () => window.removeEventListener(CHANGE_EVENT, handler);
  }, []);

  const updateSettings = useCallback((patch: Partial<WeatherSettings>) => {
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

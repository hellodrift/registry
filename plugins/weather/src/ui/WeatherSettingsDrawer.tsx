/**
 * WeatherSettingsDrawer — Settings panel for the Weather plugin.
 *
 * Allows configuring location (via geocoding search) and temperature units.
 * Settings persist via useWeatherSettings.
 *
 * Rendered inside the plugin's drawer canvas when payload.view === 'settings'.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePluginQuery } from '@vienna/sdk/react';
import {
  DrawerBody,
  ContentSection,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Button,
  Input,
} from '@vienna/ui';
import { useWeatherSettings } from './useWeatherSettings';
import { SEARCH_WEATHER_LOCATIONS } from '../client/operations';

export function WeatherSettingsDrawer() {
  const { settings, updateSettings, resetSettings } = useWeatherSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounce the search query
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setDebouncedQuery('');
      return;
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  // Geocoding search via GraphQL
  const { data: searchData, loading: searching } = usePluginQuery(SEARCH_WEATHER_LOCATIONS, {
    variables: { query: debouncedQuery },
    skip: debouncedQuery.length < 2,
    fetchPolicy: 'network-only',
  });

  const searchResults = searchData?.weatherGeocodingSearch ?? [];

  const selectLocation = useCallback(
    (result: { name?: string | null; admin1?: string | null; country?: string | null; latitude?: number | null; longitude?: number | null }) => {
      const name = result.name ?? '';
      const country = result.country ?? '';
      const displayName = result.admin1
        ? `${name}, ${result.admin1}, ${country}`
        : `${name}, ${country}`;

      updateSettings({
        locationName: displayName,
        latitude: result.latitude ?? 0,
        longitude: result.longitude ?? 0,
      });

      setSearchQuery('');
      setDebouncedQuery('');
    },
    [updateSettings],
  );

  return (
    <DrawerBody>
      <div className="flex flex-col gap-6">
        {/* Current location */}
        <ContentSection title="Location">
          <div className="flex flex-col gap-3">
            <div className="text-sm text-foreground">{settings.locationName}</div>
            <div className="text-[11px] text-muted-foreground tabular-nums">
              {settings.latitude.toFixed(4)}° N, {Math.abs(settings.longitude).toFixed(4)}°{' '}
              {settings.longitude >= 0 ? 'E' : 'W'}
            </div>

            <Input
              placeholder="Search for a city…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {searching && (
              <div className="text-xs text-muted-foreground">Searching…</div>
            )}

            {searchResults.length > 0 && (
              <div className="flex flex-col rounded-md border border-border overflow-hidden">
                {searchResults.map((result, idx) => {
                  const label = result.admin1
                    ? `${result.name}, ${result.admin1}, ${result.country}`
                    : `${result.name}, ${result.country}`;
                  return (
                    <button
                      key={`${result.latitude}-${result.longitude}-${idx}`}
                      type="button"
                      className="px-3 py-2 text-left text-sm hover:bg-accent transition-colors border-b border-border last:border-b-0"
                      onClick={() => selectLocation(result)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </ContentSection>

        {/* Temperature units */}
        <ContentSection title="Units">
          <Select
            value={settings.units}
            onValueChange={(val) => updateSettings({ units: val as 'fahrenheit' | 'celsius' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
              <SelectItem value="celsius">Celsius (°C)</SelectItem>
            </SelectContent>
          </Select>
        </ContentSection>

        {/* Reset */}
        <div className="pt-2">
          <Button variant="ghost" size="sm" onClick={resetSettings}>
            Reset to defaults
          </Button>
        </div>
      </div>
    </DrawerBody>
  );
}

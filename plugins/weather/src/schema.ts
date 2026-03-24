/**
 * Weather integration GraphQL schema registration.
 *
 * Registers weather-specific GraphQL types and queries on the Pothos builder.
 * Called via the integration's `schema` callback during plugin loading.
 *
 * @module plugin-weather/schema
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// NOTE: Pothos builder types don't survive .d.ts boundaries. Builder callbacks
// use `any` by design. The eslint-disable above covers the type assertions.

import * as weatherApi from './api';
import type { DayForecast, HourlyForecast, GeocodingResult } from './ui/weather-data';

// ─────────────────────────────────────────────────────────────────────────────
// Backing shapes — match what API functions return
// ─────────────────────────────────────────────────────────────────────────────

type WeatherHourlyShape = HourlyForecast;

type WeatherDayShape = DayForecast;

interface WeatherGeocodingShape extends GeocodingResult {
  id: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema registration
// ─────────────────────────────────────────────────────────────────────────────

export function registerWeatherSchema(rawBuilder: unknown): void {
  const builder = rawBuilder as any;

  // ── Types ─────────────────────────────────────────────────────────────────

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const WeatherHourlyRef = builder.objectRef<WeatherHourlyShape>('WeatherHourlyForecast');
  builder.objectType(WeatherHourlyRef, {
    description: 'Hourly weather forecast data',
    fields: (t) => ({
      hour: t.exposeInt('hour'),
      temp: t.exposeInt('temp'),
      condition: t.exposeString('condition'),
      icon: t.exposeString('icon'),
      precipitation: t.exposeInt('precipitation'),
      humidity: t.exposeInt('humidity'),
      wind: t.exposeInt('wind'),
    }),
  });

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const WeatherDayRef = builder.objectRef<WeatherDayShape>('WeatherDayForecast');
  builder.objectType(WeatherDayRef, {
    description: 'Daily weather forecast with hourly breakdown',
    fields: (t) => ({
      id: t.id({ resolve: (day) => `${day.date}` }),
      date: t.exposeString('date'),
      dayName: t.exposeString('dayName'),
      high: t.exposeInt('high'),
      low: t.exposeInt('low'),
      condition: t.exposeString('condition'),
      icon: t.exposeString('icon'),
      precipitation: t.exposeInt('precipitation'),
      hourly: t.field({ type: [WeatherHourlyRef], resolve: (day) => day.hourly }),
    }),
  });

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const WeatherGeocodingRef = builder.objectRef<WeatherGeocodingShape>('WeatherGeocodingResult');
  builder.objectType(WeatherGeocodingRef, {
    description: 'A geocoding result from location search',
    fields: (t) => ({
      id: t.id({ resolve: (r) => `${r.latitude},${r.longitude}` }),
      name: t.exposeString('name'),
      country: t.exposeString('country'),
      admin1: t.exposeString('admin1', { nullable: true }),
      latitude: t.field({ type: 'Float', resolve: (r) => r.latitude }),
      longitude: t.field({ type: 'Float', resolve: (r) => r.longitude }),
    }),
  });

  // ── Queries ───────────────────────────────────────────────────────────────

  builder.queryFields((t) => ({
    weatherForecast: t.field({
      type: [WeatherDayRef],
      description: 'Get 7-day weather forecast for a location',
      args: {
        latitude: t.arg({ type: 'Float', required: true }),
        longitude: t.arg({ type: 'Float', required: true }),
        units: t.arg.string({ required: true, description: '"fahrenheit" or "celsius"' }),
      },
      resolve: async (_root, args) => {
        return weatherApi.fetchForecast(args.latitude, args.longitude, args.units);
      },
    }),

    weatherGeocodingSearch: t.field({
      type: [WeatherGeocodingRef],
      description: 'Search for locations by name (geocoding)',
      args: {
        query: t.arg.string({ required: true }),
      },
      resolve: async (_root, args) => {
        const results = await weatherApi.searchLocations(args.query);
        return results.map((r) => ({
          ...r,
          id: `${r.latitude},${r.longitude}`,
        }));
      },
    }),
  }));
}

/**
 * weather API — Open-Meteo API calls for the weather plugin.
 *
 * Runs in the main process as GraphQL resolvers.
 * Uses native fetch() — no CSP restrictions in the main process.
 */

import type { DayForecast, GeocodingResult } from './ui/weather-data';

// ─────────────────────────────────────────────────────────────────────────────
// WMO Weather Code Mapping
// ─────────────────────────────────────────────────────────────────────────────

function wmoToCondition(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: 'Sunny', icon: '☀️' };
  if (code <= 3) return { condition: 'Partly Cloudy', icon: '⛅' };
  if (code <= 48) return { condition: 'Fog', icon: '🌫️' };
  if (code <= 67) return { condition: 'Rain', icon: '🌧️' };
  if (code <= 77) return { condition: 'Snow', icon: '🌨️' };
  if (code <= 82) return { condition: 'Rain', icon: '🌧️' };
  if (code <= 99) return { condition: 'Thunderstorm', icon: '⛈️' };
  return { condition: 'Cloudy', icon: '☁️' };
}

// ─────────────────────────────────────────────────────────────────────────────
// Response Types
// ─────────────────────────────────────────────────────────────────────────────

interface OpenMeteoForecastResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weathercode: number[];
    precipitation_probability: number[];
    relative_humidity_2m: number[];
    wind_speed_10m: number[];
  };
}

interface OpenMeteoGeocodingResponse {
  results?: Array<{
    name: string;
    country: string;
    admin1?: string;
    latitude: number;
    longitude: number;
  }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Functions
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchForecast(
  latitude: number,
  longitude: number,
  units: string,
): Promise<DayForecast[]> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weathercode');
  url.searchParams.set('hourly', 'temperature_2m,weathercode,precipitation_probability,relative_humidity_2m,wind_speed_10m');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '7');
  url.searchParams.set('temperature_unit', units);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo API error: ${res.status}`);

  const data: OpenMeteoForecastResponse = await res.json();
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return data.daily.time.map((date, i) => {
    const weatherInfo = wmoToCondition(data.daily.weathercode[i] ?? 0);

    const hourlyStart = i * 24;
    const hourly: DayForecast['hourly'] = [];
    for (let h = 0; h < 24; h++) {
      const idx = hourlyStart + h;
      const hourWeather = wmoToCondition(data.hourly.weathercode[idx] ?? 0);
      hourly.push({
        hour: h,
        temp: Math.round(data.hourly.temperature_2m[idx] ?? 0),
        condition: hourWeather.condition,
        icon: hourWeather.icon,
        precipitation: data.hourly.precipitation_probability[idx] ?? 0,
        humidity: data.hourly.relative_humidity_2m[idx] ?? 0,
        wind: Math.round(data.hourly.wind_speed_10m[idx] ?? 0),
      });
    }

    const maxPrecip = Math.max(...hourly.map((h) => h.precipitation));

    let dayName: string;
    if (i === 0) {
      dayName = 'Today';
    } else if (i === 1) {
      dayName = 'Tomorrow';
    } else {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dayName = dayNames[d.getDay()] ?? '';
    }

    return {
      date: date ?? '',
      dayName,
      high: Math.round(data.daily.temperature_2m_max[i] ?? 0),
      low: Math.round(data.daily.temperature_2m_min[i] ?? 0),
      condition: weatherInfo.condition,
      icon: weatherInfo.icon,
      precipitation: maxPrecip,
      hourly,
    };
  });
}

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', query.trim());
  url.searchParams.set('count', '5');
  url.searchParams.set('language', 'en');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Geocoding API error: ${res.status}`);

  const data: OpenMeteoGeocodingResponse = await res.json();
  return (data.results ?? []).map((r) => ({
    name: r.name,
    country: r.country,
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

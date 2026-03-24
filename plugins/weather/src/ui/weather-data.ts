/**
 * Weather data types for the Weather plugin.
 *
 * Data is fetched via the weather_api integration (main process)
 * and consumed by renderer-side hooks and components.
 */

export interface HourlyForecast {
  hour: number;
  temp: number;
  condition: string;
  icon: string;
  precipitation: number;
  humidity: number;
  wind: number;
}

export interface DayForecast {
  date: string;
  dayName: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  precipitation: number;
  hourly: HourlyForecast[];
}

export interface GeocodingResult {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

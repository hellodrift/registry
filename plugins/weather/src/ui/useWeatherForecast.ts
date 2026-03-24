/**
 * useWeatherForecast — Central data-fetching hook for weather forecast data.
 *
 * Fetches weather data through GraphQL (resolved in the main process)
 * and relies on Apollo's InMemoryCache for caching.
 */

import { usePluginQuery } from '@vienna/sdk/react';
import { useWeatherSettings } from './useWeatherSettings';
import { GET_WEATHER_FORECAST } from '../client/operations';

export function useWeatherForecast() {
  const { settings } = useWeatherSettings();
  const { latitude, longitude, units, locationName } = settings;

  const { data, loading, error, refetch } = usePluginQuery(GET_WEATHER_FORECAST, {
    variables: { latitude, longitude, units },
    fetchPolicy: 'cache-and-network',
  });

  return {
    forecast: data?.weatherForecast ?? [],
    loading,
    error: error?.message ?? null,
    refetch,
    locationName,
    units,
  };
}

/**
 * weatherApiIntegration — Open-Meteo weather API integration.
 *
 * Provides metadata and GraphQL schema for the weather integration.
 * API calls are made in the main process via GraphQL resolvers.
 */

import { defineIntegration } from '@vienna/sdk';
import { registerWeatherSchema } from './schema';

const CLOUD_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface OpenMeteoClient {}

export const weatherApiIntegration = defineIntegration<OpenMeteoClient>({
  id: 'weather_api',
  name: 'Weather (Open-Meteo)',
  description: 'Free weather forecast and geocoding via Open-Meteo API',
  icon: { svg: CLOUD_SVG },

  // No auth required — always return a client
  createClient: async () => ({}),

  // Extend GraphQL schema with weather queries
  schema: registerWeatherSchema,
});

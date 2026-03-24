/**
 * WeatherPluginDrawer — Plugin-level drawer for the Weather plugin.
 *
 * Routes between views based on `payload.view`:
 * - 'day' → Hourly forecast for a specific day (payload.date)
 * - 'settings' → Plugin settings
 */

import type { PluginDrawerCanvasProps } from '@vienna/sdk';
import { WeatherDayDrawer } from './WeatherDayDrawer';
import { WeatherSettingsDrawer } from './WeatherSettingsDrawer';

export function WeatherPluginDrawer({ payload }: PluginDrawerCanvasProps) {
  const view = (payload.view as string) ?? 'settings';

  switch (view) {
    case 'day':
      return <WeatherDayDrawer date={payload.date as string} />;
    case 'settings':
    default:
      return <WeatherSettingsDrawer />;
  }
}

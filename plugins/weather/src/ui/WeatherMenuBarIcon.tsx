/**
 * WeatherMenuBarIcon — Menu-bar icon for the Weather plugin.
 *
 * Shows current weather icon and temperature (e.g., "⛅ 32°")
 * inside the system-provided 32px ghost button.
 */

import type { MenuBarIconProps } from '@tryvienna/sdk';
import { useWeatherForecast } from './useWeatherForecast';

export function WeatherMenuBarIcon(_props: MenuBarIconProps) {
  const { forecast } = useWeatherForecast();
  const today = forecast[0];

  if (!today) return <span>--</span>;

  // Show current hour's temperature instead of daily high
  const currentHour = new Date().getHours();
  const hourly = today.hourly?.find((h) => h.hour === currentHour);
  const temp = hourly ? hourly.temp : today.high;
  const icon = hourly ? hourly.icon : today.icon;

  return (
    <span className="flex items-center gap-0.5 text-[11px] font-medium tabular-nums">
      <span>{icon}</span>
      <span>{temp}°</span>
    </span>
  );
}

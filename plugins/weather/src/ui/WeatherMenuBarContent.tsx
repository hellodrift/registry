/**
 * WeatherMenuBarContent — Popover content for the Weather menu-bar canvas.
 *
 * Shows current conditions, a 7-day forecast (clickable to open hourly drawer),
 * and a settings gear to configure location/units.
 */

import type { MenuBarCanvasProps } from '@vienna/sdk';
import { useWeatherForecast } from './useWeatherForecast';

export function WeatherMenuBarContent({ openPluginDrawer }: MenuBarCanvasProps) {
  const { forecast, loading, locationName, units } = useWeatherForecast();
  const unitLabel = units === 'celsius' ? 'C' : 'F';

  if (loading && forecast.length === 0) {
    return <div className="text-sm text-muted-foreground px-2 py-1">Loading…</div>;
  }

  const today = forecast[0];
  const currentHour = new Date().getHours();
  const currentHourly = today?.hourly?.find((h) => h.hour === currentHour);

  return (
    <div className="flex flex-col gap-3" style={{ minWidth: 320 }}>
      {/* Header: location + settings gear */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{locationName}</span>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          onClick={() => openPluginDrawer({ view: 'settings', label: 'Weather Settings' })}
          aria-label="Weather settings"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>

      {/* Current conditions */}
      {today && currentHourly && (
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">{currentHourly.icon}</span>
          <div>
            <div className="text-2xl font-semibold tabular-nums">{currentHourly.temp}°{unitLabel}</div>
            <div className="text-xs text-muted-foreground">{currentHourly.condition}</div>
          </div>
          <div className="ml-auto text-right text-xs text-muted-foreground tabular-nums">
            <div>H: {today.high}° L: {today.low}°</div>
            <div>{currentHourly.precipitation}% rain</div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-border" />

      {/* 7-day forecast */}
      <div className="flex flex-col gap-0.5">
        {forecast.map((day) => (
          <button
            key={day.date}
            type="button"
            className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-accent transition-colors text-left"
            onClick={() => openPluginDrawer({ view: 'day', date: day.date, label: `${day.icon} ${day.dayName}` })}
          >
            <span className="w-16 text-xs text-muted-foreground truncate">{day.dayName}</span>
            <span className="text-sm">{day.icon}</span>
            <span className="flex-1 text-xs text-muted-foreground truncate">{day.condition}</span>
            <span className="text-xs tabular-nums text-foreground">{day.high}°</span>
            <span className="text-xs tabular-nums text-muted-foreground">{day.low}°</span>
          </button>
        ))}
      </div>
    </div>
  );
}

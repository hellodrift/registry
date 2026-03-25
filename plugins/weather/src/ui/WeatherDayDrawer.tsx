// @ts-nocheck — Plugin UI
/**
 * WeatherDayDrawer — Hourly forecast view for a specific day.
 *
 * Opened from the menu-bar popover when a day is clicked.
 * Shows the full 24-hour forecast with temperature, conditions,
 * precipitation, and wind.
 */

import { useMemo } from 'react';
import { DrawerBody } from '@tryvienna/ui';
import type { HourlyForecast } from './weather-data';
import { useWeatherForecast } from './useWeatherForecast';

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

function HourRow({ hour }: { hour: HourlyForecast }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '6px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        fontSize: 13,
        gap: 12,
      }}
    >
      <span style={{ width: 50, color: '#888', flexShrink: 0 }}>
        {formatHour(hour.hour)}
      </span>
      <span style={{ width: 24, textAlign: 'center', flexShrink: 0 }}>
        {hour.icon}
      </span>
      <span style={{ width: 36, textAlign: 'right', fontWeight: 500, flexShrink: 0 }}>
        {hour.temp}°
      </span>
      <span style={{ flex: 1, color: '#999', fontSize: 11 }}>
        {hour.condition}
      </span>
      <span style={{ width: 40, textAlign: 'right', color: '#6ba3d6', fontSize: 11, flexShrink: 0 }}>
        {hour.precipitation}%
      </span>
      <span style={{ width: 45, textAlign: 'right', color: '#888', fontSize: 11, flexShrink: 0 }}>
        {hour.wind} mph
      </span>
    </div>
  );
}

export function WeatherDayDrawer({ date }: { date: string }) {
  const { forecast, units } = useWeatherForecast();
  const unitLabel = units === 'celsius' ? 'C' : 'F';
  const day = useMemo(
    () => forecast.find((d) => d.date === date) ?? null,
    [forecast, date],
  );

  if (!day) {
    return (
      <DrawerBody>
        <div style={{ padding: 16, color: '#888' }}>No forecast data for this date.</div>
      </DrawerBody>
    );
  }

  return (
    <DrawerBody>
      {/* Day summary header */}
      <div style={{ padding: '16px 0 12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>{day.icon}</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {day.dayName} — {day.date}
            </div>
            <div style={{ fontSize: 13, color: '#999' }}>{day.condition}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#bbb' }}>
          <span>
            High: <strong style={{ color: '#e0e0e0' }}>{day.high}°{unitLabel}</strong>
          </span>
          <span>
            Low: <strong style={{ color: '#e0e0e0' }}>{day.low}°{unitLabel}</strong>
          </span>
          <span>
            Rain: <strong style={{ color: '#6ba3d6' }}>{day.precipitation}%</strong>
          </span>
        </div>
      </div>

      {/* Column headers */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 0 4px',
          fontSize: 10,
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          gap: 12,
        }}
      >
        <span style={{ width: 50, flexShrink: 0 }}>Time</span>
        <span style={{ width: 24, flexShrink: 0 }} />
        <span style={{ width: 36, textAlign: 'right', flexShrink: 0 }}>Temp</span>
        <span style={{ flex: 1 }}>Condition</span>
        <span style={{ width: 40, textAlign: 'right', flexShrink: 0 }}>Rain</span>
        <span style={{ width: 45, textAlign: 'right', flexShrink: 0 }}>Wind</span>
      </div>

      {/* Hourly rows */}
      {day.hourly.map((hour) => (
        <HourRow key={hour.hour} hour={hour} />
      ))}
    </DrawerBody>
  );
}

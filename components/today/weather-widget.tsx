'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, ChevronUp, MapPin, Umbrella } from 'lucide-react';
import { WeatherForecastDrawer } from '@/components/today/weather-forecast-drawer';
import { WeatherIconAnimated } from '@/components/today/weather-icon';
import { cn } from '@/lib/utils';
import type { WeatherBundle } from '@/lib/weather/open-meteo';
import { weatherCodeToDescription } from '@/lib/weather/open-meteo';
import {
  rainBadgeLabel,
  rainConditionHint,
  shouldShowRainBadge,
} from '@/lib/weather/rain-hint';

interface WeatherWidgetProps {
  bundle: WeatherBundle;
  hasLocation: boolean;
}

function formatTemp(valueC: number, unit: 'c' | 'f'): string {
  if (unit === 'c') return `${valueC}°C`;
  return `${Math.round((valueC * 9) / 5 + 32)}°F`;
}

function formatTempShort(valueC: number, unit: 'c' | 'f'): string {
  if (unit === 'c') return `${valueC}°`;
  return `${Math.round((valueC * 9) / 5 + 32)}°`;
}

function UnitToggle({
  unit,
  onChange,
}: {
  unit: 'c' | 'f';
  onChange: (unit: 'c' | 'f') => void;
}) {
  return (
    <div className="flex items-center gap-1 text-[10px] font-medium tracking-wide text-neutral-400 uppercase">
      <button
        type="button"
        onClick={() => onChange('c')}
        className={cn(unit === 'c' && 'text-neutral-900')}
      >
        °C
      </button>
      <span>|</span>
      <button
        type="button"
        onClick={() => onChange('f')}
        className={cn(unit === 'f' && 'text-neutral-900')}
      >
        °F
      </button>
    </div>
  );
}

export function WeatherWidget({ bundle, hasLocation }: WeatherWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const [forecastOpen, setForecastOpen] = useState(false);
  const [unit, setUnit] = useState<'c' | 'f'>('c');

  const { current, forecast } = bundle;
  const cityLabel = current.city?.toUpperCase() ?? 'YOUR CITY';
  const description = weatherCodeToDescription(current.weather_code);
  const rainHint = rainConditionHint(current);
  const showRainBadge = shouldShowRainBadge(current);

  if (!hasLocation) {
    return (
      <div className="mb-5 rounded-3xl border border-neutral-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center gap-2 text-neutral-500">
          <MapPin className="h-4 w-4 shrink-0" />
          <p className="text-sm">
            <Link
              href="/profile"
              className="font-medium text-neutral-900 underline underline-offset-2"
            >
              Add your city
            </Link>{' '}
            for live weather and smarter outfit picks
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <WeatherForecastDrawer
        open={forecastOpen}
        onOpenChange={setForecastOpen}
        city={current.city}
        forecast={forecast}
        unit={unit}
      />

      <article className="mb-5 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
          aria-expanded={expanded}
        >
          <div className="flex min-w-0 items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
            <span className="truncate text-xs font-semibold tracking-[0.12em] text-neutral-800 uppercase">
              {cityLabel}
            </span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {!expanded && (
              <span className="text-sm font-medium text-neutral-900">
                {formatTemp(current.temp_c, unit)}
              </span>
            )}
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-neutral-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            )}
          </div>
        </button>

        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-300 ease-in-out',
            expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="overflow-hidden">
            <div className="border-t border-neutral-100 px-4 pt-2 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-2xl leading-tight font-semibold text-neutral-950">
                    {formatTemp(current.temp_c, unit)}
                    {rainHint ? (
                      <span className="font-normal text-neutral-600">
                        , {rainHint.toLowerCase()}
                      </span>
                    ) : (
                      <span className="font-normal text-neutral-600">
                        , {description.toLowerCase()}
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">
                    H {formatTempShort(current.high_c, unit)} · L{' '}
                    {formatTempShort(current.low_c, unit)}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <UnitToggle unit={unit} onChange={setUnit} />
                  <WeatherIconAnimated
                    condition={current.condition}
                    weatherCode={current.weather_code}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {showRainBadge && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1.5 text-[11px] font-medium text-neutral-700">
                    <Umbrella className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {rainBadgeLabel(current)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setForecastOpen(true)}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-semibold tracking-[0.15em] text-neutral-700 uppercase transition-colors hover:bg-neutral-50"
                >
                  Details ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}

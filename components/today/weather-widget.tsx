'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { WeatherForecastDrawer } from '@/components/today/weather-forecast-drawer';
import { WeatherIconAnimated } from '@/components/today/weather-icon';
import { cn } from '@/lib/utils';
import type { WeatherBundle } from '@/lib/weather/open-meteo';
import { weatherCodeToDescription } from '@/lib/weather/open-meteo';

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
    <div className="flex items-center gap-1 text-[10px] font-medium tracking-wide text-stone-400 uppercase">
      <button
        type="button"
        onClick={() => onChange('c')}
        className={cn(unit === 'c' && 'text-stone-800')}
      >
        °C
      </button>
      <span>|</span>
      <button
        type="button"
        onClick={() => onChange('f')}
        className={cn(unit === 'f' && 'text-stone-800')}
      >
        °F
      </button>
    </div>
  );
}

export function WeatherWidget({ bundle, hasLocation }: WeatherWidgetProps) {
  const [expanded, setExpanded] = useState(true);
  const [forecastOpen, setForecastOpen] = useState(false);
  const [unit, setUnit] = useState<'c' | 'f'>('c');

  const { current, forecast } = bundle;
  const cityLabel = current.city?.toUpperCase() ?? 'YOUR CITY';
  const description = weatherCodeToDescription(current.weather_code);

  if (!hasLocation) {
    return (
      <div className="mb-6 rounded-3xl bg-white px-4 py-4 shadow-sm ring-1 ring-stone-200/60">
        <div className="flex items-center gap-2 text-stone-500">
          <MapPin className="h-4 w-4 shrink-0" />
          <p className="text-sm">
            <Link href="/profile" className="font-medium text-stone-800 underline underline-offset-2">
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

      <article className="mb-6 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200/60">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
          aria-expanded={expanded}
        >
          <div className="flex min-w-0 items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-stone-500" />
            <span className="truncate text-xs font-semibold tracking-[0.12em] text-stone-700 uppercase">
              {cityLabel}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {!expanded && (
              <span className="text-sm font-medium text-stone-800">
                {formatTemp(current.temp_c, unit)}
              </span>
            )}
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-stone-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-stone-400" />
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
            <div className="border-t border-stone-100 px-4 pt-1 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-2xl leading-tight text-stone-900">
                    {formatTemp(current.temp_c, unit)},{' '}
                    <span className="text-xl text-stone-700">{description}</span>
                  </p>
                  <p className="mt-2 text-sm text-stone-500">
                    H {formatTempShort(current.high_c, unit)} · L{' '}
                    {formatTempShort(current.low_c, unit)}
                  </p>
                  {current.precip_chance >= 30 && (
                    <p className="mt-1 text-xs text-stone-400">
                      {current.precip_chance}% chance of rain
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <UnitToggle unit={unit} onChange={setUnit} />
                  <WeatherIconAnimated
                    condition={current.condition}
                    weatherCode={current.weather_code}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setForecastOpen(true)}
                className="mt-4 rounded-full bg-stone-100 px-3 py-1.5 text-[10px] font-semibold tracking-[0.15em] text-stone-600 uppercase transition-colors hover:bg-stone-200/80"
              >
                Details ›
              </button>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}

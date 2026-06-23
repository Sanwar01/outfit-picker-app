'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { WeatherIconAnimated } from '@/components/today/weather-icon';
import type { ForecastDay } from '@/lib/weather/open-meteo';

interface WeatherForecastDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  city: string | null;
  forecast: ForecastDay[];
  unit: 'c' | 'f';
}

function formatTemp(valueC: number, unit: 'c' | 'f'): string {
  if (unit === 'c') return `${valueC}°C`;
  return `${Math.round((valueC * 9) / 5 + 32)}°F`;
}

export function WeatherForecastDrawer({
  open,
  onOpenChange,
  city,
  forecast,
  unit,
}: WeatherForecastDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] rounded-t-3xl border-stone-200 px-0 pb-8"
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-stone-200" />
        <SheetHeader className="border-b border-stone-100 px-5 pb-4 text-left">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-neutral-400 uppercase">
            Weather
          </p>
          <SheetTitle className="text-2xl font-semibold text-neutral-950">
            5-day forecast
          </SheetTitle>
          <SheetDescription className="text-sm text-stone-500">
            {city ?? 'Your location'}
          </SheetDescription>
        </SheetHeader>

        <ul className="divide-y divide-stone-100 px-5">
          {forecast.map((day) => (
            <li
              key={day.date}
              className="flex items-center gap-4 py-4 first:pt-5"
            >
              <div className="w-14 shrink-0">
                <p className="text-sm font-semibold text-stone-900">
                  {day.day_label}
                </p>
                <p className="text-xs text-stone-400">{day.date_label}</p>
              </div>

              <WeatherIconAnimated
                condition={day.condition}
                size="sm"
                className="shrink-0"
              />

              <p className="min-w-0 flex-1 text-sm text-stone-600">
                {day.description}
              </p>

              <div className="shrink-0 text-right text-sm">
                <span className="font-medium text-stone-900">
                  {formatTemp(day.high_c, unit)}
                </span>
                <span className="ml-2 text-stone-400">
                  {formatTemp(day.low_c, unit)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}

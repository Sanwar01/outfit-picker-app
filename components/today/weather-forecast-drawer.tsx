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
        className="max-h-[85vh] rounded-t-3xl border-border px-0 pb-8"
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-cream-deep" />
        <SheetHeader className="border-b border-border px-5 pb-4 text-left">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-ink-faint uppercase">
            Weather
          </p>
          <SheetTitle className="text-2xl font-semibold text-foreground">
            5-day forecast
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {city ?? 'Your location'}
          </SheetDescription>
        </SheetHeader>

        <ul className="divide-y divide-border px-5">
          {forecast.map((day) => (
            <li
              key={day.date}
              className="flex items-center gap-4 py-4 first:pt-5"
            >
              <div className="w-14 shrink-0">
                <p className="text-sm font-semibold text-foreground">
                  {day.day_label}
                </p>
                <p className="text-xs text-ink-faint">{day.date_label}</p>
              </div>

              <WeatherIconAnimated
                condition={day.condition}
                size="sm"
                className="shrink-0"
              />

              <p className="min-w-0 flex-1 text-sm text-muted-foreground">
                {day.description}
              </p>

              <div className="shrink-0 text-right text-sm">
                <span className="font-medium text-foreground">
                  {formatTemp(day.high_c, unit)}
                </span>
                <span className="ml-2 text-ink-faint">
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

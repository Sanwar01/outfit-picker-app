'use client';

import {
  Briefcase,
  Dumbbell,
  Footprints,
  Heart,
  Shirt,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildPersonalizationLine } from '@/lib/today/copy';
import {
  CHOOSE_FOR_ME,
  PICKABLE_OCCASIONS,
  type Occasion,
  type OccasionId,
} from '@/lib/today/occasions';
import type { WeatherSnapshot } from '@/lib/weather/open-meteo';
import { cn } from '@/lib/utils';

const OCCASION_ICONS: Record<Occasion['id'], typeof Shirt> = {
  casual: Shirt,
  walk: Footprints,
  work: Briefcase,
  date_night: Heart,
  gym: Dumbbell,
  formal: Sparkles,
  auto: Wand2,
};

interface OccasionPickerProps {
  onSelect: (id: OccasionId) => void;
  styleVibes: string[];
  hasLocation: boolean;
  weather: WeatherSnapshot;
  disabled?: boolean;
}

export function OccasionPicker({
  onSelect,
  styleVibes,
  hasLocation,
  weather,
  disabled,
}: OccasionPickerProps) {
  const contextLine = buildPersonalizationLine(
    styleVibes,
    weather,
    hasLocation,
    { includeWeather: false },
  );

  return (
    <div className="space-y-6">
      {contextLine && (
        <p className="text-center text-sm text-stone-500">{contextLine}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {PICKABLE_OCCASIONS.map((occasion) => {
          const Icon = OCCASION_ICONS[occasion.id];
          return (
            <button
              key={occasion.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(occasion.id)}
              className={cn(
                'flex flex-col items-start gap-2 rounded-2xl bg-white px-4 py-4 text-left shadow-sm ring-1 ring-stone-200/60 transition-colors',
                'hover:bg-stone-50 hover:ring-stone-300/80',
                'disabled:pointer-events-none disabled:opacity-60',
              )}
            >
              <Icon className="h-5 w-5 text-stone-700" />
              <span className="text-sm font-semibold text-stone-900">
                {occasion.label}
              </span>
              <span className="text-xs leading-snug text-stone-500">
                {occasion.description}
              </span>
            </button>
          );
        })}
      </div>

      <Button
        size="lg"
        variant="outline"
        className="h-12 w-full rounded-2xl border-stone-200 bg-white text-base text-stone-800"
        disabled={disabled}
        onClick={() => onSelect(CHOOSE_FOR_ME.id)}
      >
        <Wand2 className="mr-2 h-4 w-4" />
        {CHOOSE_FOR_ME.label}
      </Button>
      <p className="text-center text-xs text-stone-400">
        {CHOOSE_FOR_ME.description}
      </p>
    </div>
  );
}

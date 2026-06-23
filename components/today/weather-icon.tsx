'use client';

import {
  Cloud,
  CloudFog,
  CloudRain,
  CloudSun,
  Snowflake,
  Sun,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { weatherCodeToCondition } from '@/lib/weather/open-meteo';

const ANIMATION_BY_CONDITION: Record<string, string> = {
  clear: 'weather-animate-sun',
  partly_cloudy: 'weather-animate-float',
  cloudy: 'weather-animate-float',
  rain: 'weather-animate-rain',
  drizzle: 'weather-animate-rain',
  snow: 'weather-animate-float',
  storm: 'weather-animate-storm',
  foggy: 'weather-animate-float',
};

function iconForCondition(condition: string, className: string) {
  switch (condition) {
    case 'clear':
      return <Sun className={className} strokeWidth={1.5} />;
    case 'partly_cloudy':
      return <CloudSun className={className} strokeWidth={1.5} />;
    case 'rain':
    case 'drizzle':
      return <CloudRain className={className} strokeWidth={1.5} />;
    case 'snow':
      return <Snowflake className={className} strokeWidth={1.5} />;
    case 'storm':
      return <Zap className={className} strokeWidth={1.5} />;
    case 'foggy':
      return <CloudFog className={className} strokeWidth={1.5} />;
    default:
      return <Cloud className={className} strokeWidth={1.5} />;
  }
}

interface WeatherIconAnimatedProps {
  condition?: string;
  weatherCode?: number;
  size?: 'sm' | 'lg';
  className?: string;
}

export function WeatherIconAnimated({
  condition,
  weatherCode,
  size = 'lg',
  className,
}: WeatherIconAnimatedProps) {
  const resolved =
    condition ?? (weatherCode != null ? weatherCodeToCondition(weatherCode) : 'cloudy');
  const sizeClass = size === 'lg' ? 'h-16 w-16' : 'h-5 w-5';
  const animation = ANIMATION_BY_CONDITION[resolved] ?? 'weather-animate-float';

  return (
    <div
      className={cn(
        'flex items-center justify-center text-neutral-800',
        animation,
        className,
      )}
      aria-hidden
    >
      {iconForCondition(resolved, sizeClass)}
    </div>
  );
}

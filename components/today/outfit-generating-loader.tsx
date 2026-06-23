'use client';

import { useEffect, useState } from 'react';
import {
  CloudSun,
  Footprints,
  Layers,
  Shirt,
  Sparkles,
  Wind,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    id: 'weather',
    label: 'Checking the forecast',
    icon: CloudSun,
  },
  {
    id: 'wardrobe',
    label: 'Looking through your closet',
    icon: Shirt,
  },
  {
    id: 'match',
    label: 'Balancing layers and colors',
    icon: Layers,
  },
  {
    id: 'style',
    label: 'Finalizing your look',
    icon: Sparkles,
  },
] as const;

const SLOT_PLACEHOLDERS = [
  { label: 'Top', icon: Shirt, delay: '0ms' },
  { label: 'Bottom', icon: Layers, delay: '150ms' },
  { label: 'Shoes', icon: Footprints, delay: '300ms' },
  { label: 'Layer', icon: Wind, delay: '450ms' },
] as const;

interface OutfitGeneratingLoaderProps {
  variant?: 'initial' | 'shuffle';
}

export function OutfitGeneratingLoader({
  variant = 'initial',
}: OutfitGeneratingLoaderProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1400);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-linear-to-b from-neutral-50 via-white to-neutral-100 shadow-sm"
      aria-busy="true"
      aria-label="Generating outfit"
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-neutral-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-8 h-36 w-36 rounded-full bg-neutral-200/40 blur-3xl" />

      <div className="relative space-y-6 p-5 sm:p-6">
        <div className="space-y-1 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
            {variant === 'shuffle' ? 'Another idea' : 'Your look today'}
          </p>
          <h2 className="text-lg font-semibold text-neutral-950">
            Putting something together
          </h2>
          <p className="text-sm text-neutral-500">
            Based on your clothes and today&apos;s weather
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {SLOT_PLACEHOLDERS.map((slot) => (
            <div
              key={slot.label}
              className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white/80 shadow-sm"
              style={{ animationDelay: slot.delay }}
            >
              <div className="relative aspect-3/4 bg-stone-100/80">
                <div className="absolute inset-0 animate-pulse bg-linear-to-br from-stone-100 via-stone-50 to-stone-200/60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm">
                    <slot.icon className="h-4 w-4 text-stone-400" />
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-stone-400">
                    {slot.label}
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-white/90 to-transparent" />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 rounded-2xl bg-white/70 px-4 py-3.5 backdrop-blur-sm">
          <div className="flex gap-1">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'h-1 flex-1 rounded-full transition-all duration-700',
                  index <= activeStep ? 'bg-stone-800' : 'bg-stone-200',
                )}
              />
            ))}
          </div>

          <ul className="space-y-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;
              const isDone = index < activeStep;

              return (
                <li
                  key={step.id}
                  className={cn(
                    'flex items-center gap-2.5 text-sm transition-all duration-500',
                    isActive
                      ? 'text-stone-900'
                      : isDone
                        ? 'text-stone-500'
                        : 'text-stone-300',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-500',
                      isActive
                        ? 'border-stone-800 bg-stone-800 text-white shadow-sm'
                        : isDone
                          ? 'border-stone-300 bg-stone-100 text-stone-600'
                          : 'border-stone-200 bg-white text-stone-300',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className={cn(isActive && 'font-medium')}>
                    {step.label}
                    {isActive && (
                      <span className="ml-1 inline-flex gap-0.5 align-middle">
                        <span className="animate-bounce [animation-delay:0ms]">
                          .
                        </span>
                        <span className="animate-bounce [animation-delay:150ms]">
                          .
                        </span>
                        <span className="animate-bounce [animation-delay:300ms]">
                          .
                        </span>
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

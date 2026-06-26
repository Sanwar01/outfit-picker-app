'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Footprints,
  Layers,
  Shirt,
  Sparkles,
  Wind,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SLOTS = [
  { label: 'Top', icon: Shirt },
  { label: 'Bottom', icon: Layers },
  { label: 'Shoes', icon: Footprints },
  { label: 'Layer', icon: Wind },
] as const;

const STYLIST_PHASES = [
  {
    message: 'Reading what today calls for',
    detail: 'Weather and comfort come first.',
  },
  {
    message: 'Browsing your wardrobe',
    detail: 'Starting with pieces you actually own.',
  },
  {
    message: 'Building the combination',
    detail: 'Balancing layers, colour, and proportion.',
  },
  {
    message: 'Refining the finish',
    detail: 'Making sure it feels like you.',
  },
  {
    message: 'Almost ready',
    detail: 'One last look before I show you.',
  },
] as const;

const SHUFFLE_PHASES = [
  {
    message: 'Rethinking the combination',
    detail: 'Same wardrobe — a fresh point of view.',
  },
  {
    message: 'Trying a different pairing',
    detail: 'Looking for another way this could work.',
  },
  {
    message: 'Fine-tuning the details',
    detail: 'Keeping it wearable for today.',
  },
  {
    message: 'Nearly there',
    detail: 'This alternative is coming together.',
  },
] as const;

interface OutfitGeneratingLoaderProps {
  variant?: 'initial' | 'shuffle';
  styleVibes?: string[];
}

function formatVibeHint(vibes: string[]): string | null {
  if (!vibes.length) return null;
  if (vibes.length === 1) return `Leaning into your ${vibes[0].toLowerCase()} style`;
  return `Guided by your ${vibes
    .slice(0, 2)
    .map((vibe) => vibe.toLowerCase())
    .join(' and ')} taste`;
}

export function OutfitGeneratingLoader({
  variant = 'initial',
  styleVibes = [],
}: OutfitGeneratingLoaderProps) {
  const phases = variant === 'shuffle' ? SHUFFLE_PHASES : STYLIST_PHASES;
  const [activePhase, setActivePhase] = useState(0);
  const vibeHint = useMemo(() => formatVibeHint(styleVibes), [styleVibes]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActivePhase((prev) => (prev < phases.length - 1 ? prev + 1 : prev));
    }, variant === 'shuffle' ? 1100 : 1300);

    return () => window.clearInterval(interval);
  }, [phases.length, variant]);

  const revealedSlots = Math.min(
    Math.ceil(((activePhase + 1) / phases.length) * SLOTS.length),
    SLOTS.length,
  );

  const phase = phases[activePhase];

  return (
    <div
      className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm"
      aria-busy="true"
      aria-label="Styling your outfit"
    >
      <div className="border-b border-neutral-100 px-4 py-3.5">
        <div className="flex items-center gap-2">
          <h2 className="font-(family-name:--font-auth-serif) text-lg text-neutral-950">
            {variant === 'shuffle'
              ? 'Finding another option'
              : "Styling today's outfit"}
          </h2>
          <Sparkles className="h-4 w-4 animate-pulse text-neutral-400" />
        </div>
        <p className="mt-0.5 text-xs text-neutral-500">
          {variant === 'shuffle'
            ? 'Putting together a fresh look from your wardrobe'
            : 'Curated for you — not just generated'}
        </p>
      </div>

      <div className="flex gap-3 p-4">
        <div className="relative w-[50%] shrink-0">
          <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-neutral-100">
            <div className="absolute inset-0 animate-pulse bg-linear-to-br from-neutral-100 via-neutral-50 to-neutral-200/70" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-sm">
                  <Sparkles
                    className="h-5 w-5 text-neutral-500"
                    strokeWidth={1.5}
                  />
                </span>
                <span className="px-3 text-[11px] font-medium text-neutral-500">
                  Choosing your hero piece
                </span>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-white/80 to-transparent" />
          </div>
        </div>

        <ul className="min-w-0 flex-1 space-y-3 pt-1">
          {SLOTS.map((slot, index) => {
            const Icon = slot.icon;
            const isRevealed = index < revealedSlots;
            const isBuilding = index === revealedSlots - 1;

            return (
              <li key={slot.label}>
                <div
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border px-2 py-1.5 transition-all duration-700',
                    isRevealed
                      ? 'border-neutral-200 bg-white'
                      : 'border-transparent bg-neutral-50/80',
                    isBuilding && 'border-neutral-300 bg-neutral-50',
                  )}
                >
                  <div
                    className={cn(
                      'relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border transition-all duration-700',
                      isRevealed
                        ? 'border-neutral-200 bg-neutral-100'
                        : 'border-neutral-200/70 bg-neutral-100/80',
                    )}
                  >
                    {isRevealed ? (
                      <Icon className="h-4 w-4 text-neutral-500" />
                    ) : (
                      <div className="absolute inset-0 animate-pulse bg-linear-to-br from-neutral-100 to-neutral-200/60" />
                    )}
                    {isBuilding && (
                      <span className="absolute inset-0 animate-pulse ring-2 ring-neutral-300/70 ring-inset" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-sm font-medium transition-colors duration-500',
                        isRevealed ? 'text-neutral-950' : 'text-neutral-300',
                      )}
                    >
                      {slot.label}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {isBuilding
                        ? 'Selecting...'
                        : isRevealed
                          ? 'Shortlisted'
                          : 'Waiting'}
                    </p>
                  </div>
                  {isRevealed && !isBuilding && (
                    <Check
                      className="h-4 w-4 shrink-0 text-neutral-400"
                      strokeWidth={2}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div
        className="border-t border-neutral-100 bg-neutral-50/60 px-4 py-4"
        aria-live="polite"
      >
        <p className="text-[10px] font-semibold tracking-[0.15em] text-neutral-400 uppercase">
          Stylist note
        </p>
        <p className="mt-2 font-(family-name:--font-auth-serif) text-base leading-snug text-neutral-950">
          {phase.message}
          <span className="inline-flex gap-0.5 pl-0.5 align-middle">
            <span className="animate-bounce [animation-delay:0ms]">.</span>
            <span className="animate-bounce [animation-delay:150ms]">.</span>
            <span className="animate-bounce [animation-delay:300ms]">.</span>
          </span>
        </p>
        <p className="mt-1 text-sm text-neutral-500">{phase.detail}</p>
        {vibeHint && variant === 'initial' && activePhase >= 1 && (
          <p className="mt-3 text-xs font-medium text-neutral-600">{vibeHint}</p>
        )}
      </div>
    </div>
  );
}

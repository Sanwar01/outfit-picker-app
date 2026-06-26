'use client';

import { Check } from 'lucide-react';
import { STYLE_VIBE_OPTIONS } from '@/lib/onboarding/constants';
import type { StyleVibe } from '@/lib/types/clothing';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface StyleVibeGridProps {
  selected: StyleVibe[];
  onChange: (vibes: StyleVibe[]) => void;
}

export function StyleVibeGrid({ selected, onChange }: StyleVibeGridProps) {
  function toggle(vibe: StyleVibe) {
    if (selected.includes(vibe)) {
      onChange(selected.filter((item) => item !== vibe));
      return;
    }
    if (selected.length >= 3) return;
    onChange([...selected, vibe]);
  }

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {STYLE_VIBE_OPTIONS.map(({ id, label, imageUrl }) => {
        const isSelected = selected.includes(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => toggle(id)}
            className={cn(
              'relative rounded-2xl border-2 p-2.5 text-left transition-colors',
              isSelected
                ? 'border-[#8b7355] bg-[#f4efe6]'
                : 'border-[#ebe4d8] bg-white',
            )}
          >
            <div
              className={cn(
                'absolute top-2 right-2 z-10 flex size-5 items-center justify-center rounded-full border',
                isSelected
                  ? 'border-[#8b7355] bg-[#8b7355] text-white'
                  : 'border-[#d8d0c4] bg-white',
              )}
            >
              {isSelected && <Check className="size-3" strokeWidth={2.5} />}
            </div>

            <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-[#f4efe6]">
              <Image
                src={imageUrl}
                alt={label}
                fill
                className="object-cover object-top"
              />
            </div>

            <p className="mt-2 text-center text-xs font-semibold text-[#1a1a1a]">
              {label}
            </p>
          </button>
        );
      })}
    </div>
  );
}

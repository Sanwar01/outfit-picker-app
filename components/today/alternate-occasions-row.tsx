'use client';

import {
  Briefcase,
  Dumbbell,
  Heart,
  Plane,
  Sparkles,
} from 'lucide-react';
import type { OccasionId } from '@/lib/today/occasions';
import { cn } from '@/lib/utils';

const ALTERNATE_OCCASIONS: {
  id: OccasionId;
  label: string;
  icon: typeof Briefcase;
}[] = [
  { id: 'work', label: 'Work', icon: Briefcase },
  { id: 'date_night', label: 'Date night', icon: Heart },
  { id: 'gym', label: 'Gym', icon: Dumbbell },
  { id: 'travel', label: 'Travel', icon: Plane },
  { id: 'formal', label: 'Wedding', icon: Sparkles },
];

interface AlternateOccasionsRowProps {
  activeOccasion: OccasionId | null;
  onSelect: (id: OccasionId) => void;
  disabled?: boolean;
}

export function AlternateOccasionsRow({
  activeOccasion,
  onSelect,
  disabled,
}: AlternateOccasionsRowProps) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold tracking-[0.15em] text-neutral-400 uppercase">
        Dressing for something else?
      </p>
      <div className="flex justify-between gap-2">
        {ALTERNATE_OCCASIONS.map(({ id, label, icon: Icon }) => {
          const isActive = activeOccasion === id;
          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(id)}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-2 rounded-2xl border bg-white px-1 py-3 shadow-sm transition-colors',
                isActive
                  ? 'border-neutral-950'
                  : 'border-neutral-200 hover:bg-neutral-50',
                'disabled:pointer-events-none disabled:opacity-60',
              )}
            >
              <Icon className="h-5 w-5 text-neutral-800" strokeWidth={1.5} />
              <span className="w-full truncate text-center text-[10px] font-medium text-neutral-600">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

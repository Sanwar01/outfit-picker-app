'use client';

import { cn } from '@/lib/utils';

interface RatingScaleProps {
  label: string;
  hint: string;
  value: number;
  onChange: (value: number) => void;
}

export function RatingScale({ label, hint, value, onChange }: RatingScaleProps) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium transition-colors',
              value === level
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-white text-muted-foreground hover:bg-background',
            )}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}

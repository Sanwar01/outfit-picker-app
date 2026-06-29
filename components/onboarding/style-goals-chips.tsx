'use client';

import { Check } from 'lucide-react';
import {
  STYLE_GOAL_OPTIONS,
  type StyleGoalId,
} from '@/lib/onboarding/constants';
import { cn } from '@/lib/utils';

interface StyleGoalsChipsProps {
  selected: StyleGoalId[];
  onChange: (goals: StyleGoalId[]) => void;
}

export function StyleGoalsChips({ selected, onChange }: StyleGoalsChipsProps) {
  function toggle(goal: StyleGoalId) {
    if (selected.includes(goal)) {
      onChange(selected.filter((item) => item !== goal));
      return;
    }
    onChange([...selected, goal]);
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      {STYLE_GOAL_OPTIONS.map(({ id, label, icon: Icon }) => {
        const isSelected = selected.includes(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => toggle(id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-medium transition-colors',
              isSelected
                ? 'border-brand bg-cream text-foreground'
                : 'border-border bg-white text-foreground',
            )}
          >
            <Icon
              className="size-3.5 shrink-0 text-brand"
              strokeWidth={1.5}
            />
            <span>{label}</span>
            {isSelected && (
              <div
                className={cn(
                  'flex size-4 shrink-0 items-center justify-center rounded-full border',
                  isSelected
                    ? 'border-brand bg-brand text-white'
                    : 'border-border-strong bg-white',
                )}
              >
                {isSelected && <Check className="size-3" strokeWidth={2.5} />}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

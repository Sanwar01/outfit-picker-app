"use client";

import { Check } from "lucide-react";
import {
  STYLE_GOAL_OPTIONS,
  type StyleGoalId,
} from "@/lib/onboarding/constants";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-wrap gap-2">
      {STYLE_GOAL_OPTIONS.map(({ id, label, icon: Icon }) => {
        const isSelected = selected.includes(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => toggle(id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-left text-xs font-medium transition-colors",
              isSelected
                ? "border-[#8b7355] bg-[#f4efe6] text-[#1a1a1a]"
                : "border-[#ebe4d8] bg-white text-[#1a1a1a]"
            )}
          >
            <Icon className="size-3.5 shrink-0 text-[#8b7355]" strokeWidth={1.5} />
            <span>{label}</span>
            {isSelected && (
              <Check className="size-3.5 shrink-0 text-[#8b7355]" strokeWidth={2.5} />
            )}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { Check } from "lucide-react";
import {
  AUDIENCE_OPTIONS,
  type OnboardingAudience,
} from "@/lib/onboarding/constants";
import { cn } from "@/lib/utils";

interface AudienceSelectProps {
  selected: OnboardingAudience | null;
  onChange: (audience: OnboardingAudience) => void;
}

export function AudienceSelect({ selected, onChange }: AudienceSelectProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {AUDIENCE_OPTIONS.map(({ id, label, description, icon: Icon }) => {
        const isSelected = selected === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "relative rounded-2xl border-2 p-4 text-left transition-colors",
              isSelected
                ? "border-[#8b7355] bg-[#f4efe6]"
                : "border-[#ebe4d8] bg-white"
            )}
          >
            <div
              className={cn(
                "absolute top-3 right-3 flex size-5 items-center justify-center rounded-full border",
                isSelected
                  ? "border-[#8b7355] bg-[#8b7355] text-white"
                  : "border-[#d8d0c4] bg-white"
              )}
            >
              {isSelected && <Check className="size-3" strokeWidth={2.5} />}
            </div>
            <Icon className="size-5 text-[#8b7355]" strokeWidth={1.5} />
            <p className="mt-3 text-sm font-semibold text-[#1a1a1a]">{label}</p>
            <p className="mt-1 text-xs leading-snug text-[#6b6560]">
              {description}
            </p>
          </button>
        );
      })}
    </div>
  );
}

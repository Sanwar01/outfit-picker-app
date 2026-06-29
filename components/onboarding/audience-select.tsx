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
                ? "border-brand bg-cream"
                : "border-border bg-white"
            )}
          >
            <div
              className={cn(
                "absolute top-3 right-3 flex size-5 items-center justify-center rounded-full border",
                isSelected
                  ? "border-brand bg-brand text-white"
                  : "border-border-strong bg-white"
              )}
            >
              {isSelected && <Check className="size-3" strokeWidth={2.5} />}
            </div>
            <Icon className="size-5 text-brand" strokeWidth={1.5} />
            <p className="mt-3 text-sm font-semibold text-foreground">{label}</p>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">
              {description}
            </p>
          </button>
        );
      })}
    </div>
  );
}

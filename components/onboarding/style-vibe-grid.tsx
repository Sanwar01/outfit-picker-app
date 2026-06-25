"use client";

import { Check, Shirt } from "lucide-react";
import { STYLE_VIBE_OPTIONS } from "@/lib/onboarding/constants";
import type { StyleVibe } from "@/lib/types/clothing";
import { cn } from "@/lib/utils";

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
      {STYLE_VIBE_OPTIONS.map(({ id, label, imageClass }) => {
        const isSelected = selected.includes(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => toggle(id)}
            className={cn(
              "overflow-hidden rounded-2xl border-2 bg-white text-left transition-colors",
              isSelected ? "border-[#8b7355]" : "border-[#ebe4d8]"
            )}
          >
            <div className="relative aspect-4/5">
              <div className={cn("absolute inset-0", imageClass)} />
              {id === "Other" ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shirt className="size-8 text-white/80" strokeWidth={1.25} />
                </div>
              ) : (
                <div className="absolute inset-0 bg-linear-to-t from-black/35 to-transparent" />
              )}
              <div
                className={cn(
                  "absolute top-2 right-2 flex size-5 items-center justify-center rounded-full border",
                  isSelected
                    ? "border-[#8b7355] bg-[#8b7355] text-white"
                    : "border-[#d8d0c4] bg-white/90"
                )}
              >
                {isSelected && <Check className="size-3" strokeWidth={2.5} />}
              </div>
            </div>
            <p className="px-2 py-2 text-center text-xs font-semibold text-[#1a1a1a]">
              {label}
            </p>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { STYLE_VIBES, type StyleVibe } from "@/lib/types/clothing";

interface StyleChipsProps {
  selected: StyleVibe[];
  onChange: (vibes: StyleVibe[]) => void;
}

export function StyleChips({ selected, onChange }: StyleChipsProps) {
  function toggle(vibe: StyleVibe) {
    if (selected.includes(vibe)) {
      onChange(selected.filter((v) => v !== vibe));
      return;
    }

    if (selected.length >= 3) return;
    onChange([...selected, vibe]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STYLE_VIBES.map((vibe) => {
        const isSelected = selected.includes(vibe);
        return (
          <button
            key={vibe}
            type="button"
            onClick={() => toggle(vibe)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              isSelected
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
            )}
          >
            {vibe}
          </button>
        );
      })}
    </div>
  );
}

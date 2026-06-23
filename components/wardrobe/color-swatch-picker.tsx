'use client';

import { cn } from '@/lib/utils';
import { COLOR_SWATCHES } from '@/lib/wardrobe/item-edit';

interface ColorSwatchPickerProps {
  selected: string[];
  onChange: (colors: string[]) => void;
}

function matchesSwatch(colorName: string, selected: string[]): boolean {
  const normalized = colorName.toLowerCase();
  return selected.some((c) => c.toLowerCase() === normalized);
}

export function ColorSwatchPicker({
  selected,
  onChange,
}: ColorSwatchPickerProps) {
  function toggle(name: string) {
    if (matchesSwatch(name, selected)) {
      onChange(selected.filter((c) => c.toLowerCase() !== name.toLowerCase()));
      return;
    }
    onChange([...selected, name]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_SWATCHES.map((swatch) => {
        const isSelected = matchesSwatch(swatch.name, selected);
        return (
          <button
            key={swatch.name}
            type="button"
            onClick={() => toggle(swatch.name)}
            className={cn(
              'h-8 w-8 rounded-full border-2 transition-transform',
              isSelected
                ? 'border-neutral-950 ring-2 ring-neutral-200 ring-offset-1'
                : 'border-neutral-200 hover:scale-105',
            )}
            style={{ backgroundColor: swatch.hex }}
            aria-label={swatch.name}
            aria-pressed={isSelected}
          />
        );
      })}
    </div>
  );
}

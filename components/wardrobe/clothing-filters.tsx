"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FILTER_OPTIONS, type FilterValue } from "@/lib/types/clothing";

interface ClothingFiltersProps {
  search: string;
  filter: FilterValue;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: FilterValue) => void;
}

export function ClothingFilters({
  search,
  filter,
  onSearchChange,
  onFilterChange,
}: ClothingFiltersProps) {
  return (
    <div className="mb-4 space-y-3">
      <Input
        placeholder="Search wardrobe..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="rounded-xl border-stone-200 bg-white"
      />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onFilterChange(option.value)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              filter === option.value
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-200 bg-white text-stone-600"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

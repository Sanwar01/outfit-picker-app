'use client';

import Link from 'next/link';
import {
  Columns2,
  Footprints,
  Grid2x2,
  ScanLine,
  Search,
  Shirt,
  Watch,
  Wind,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CategoryChipFilter } from '@/lib/wardrobe/filters';

const CHIP_OPTIONS: {
  value: CategoryChipFilter;
  label: string;
  icon: typeof Shirt;
}[] = [
  { value: 'all', label: 'All Items', icon: Grid2x2 },
  { value: 'top', label: 'Tops', icon: Shirt },
  { value: 'bottom', label: 'Bottoms', icon: Columns2 },
  { value: 'outerwear', label: 'Outerwear', icon: Wind },
  { value: 'shoes', label: 'Shoes', icon: Footprints },
  { value: 'accessory', label: 'Accessories', icon: Watch },
];

interface ClothingFiltersProps {
  search: string;
  filter: CategoryChipFilter;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: CategoryChipFilter) => void;
}

export function ClothingFilters({
  search,
  filter,
  onSearchChange,
  onFilterChange,
}: ClothingFiltersProps) {
  return (
    <div className="mb-5 space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          type="search"
          placeholder="Search your wardrobe"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 w-full rounded-2xl border border-border bg-white pr-12 pl-10 text-sm text-foreground outline-none transition-colors placeholder:text-ink-faint focus:border-brand"
        />
        <Link
          href="/wardrobe/add"
          className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Add item"
        >
          <ScanLine className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CHIP_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = filter === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors',
                isActive
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-white text-foreground hover:bg-background',
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

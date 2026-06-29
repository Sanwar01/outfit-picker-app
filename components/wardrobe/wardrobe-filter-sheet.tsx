"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  SORT_OPTIONS,
  STATUS_OPTIONS,
  type WardrobeSort,
  type WardrobeStatusFilter,
} from "@/lib/wardrobe/filters";
import { cn } from "@/lib/utils";

interface WardrobeFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sort: WardrobeSort;
  status: WardrobeStatusFilter;
  onSortChange: (sort: WardrobeSort) => void;
  onStatusChange: (status: WardrobeStatusFilter) => void;
}

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="mb-2.5 text-[10px] font-semibold tracking-[0.15em] text-ink-faint uppercase">
        {label}
      </p>
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-foreground hover:bg-background",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function WardrobeFilterSheet({
  open,
  onOpenChange,
  sort,
  status,
  onSortChange,
  onStatusChange,
}: WardrobeFilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8">
        <SheetHeader className="px-0 pb-2">
          <SheetTitle className="font-serif text-xl text-foreground">
            Filter & sort
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pt-2">
          <OptionGroup
            label="Sort by"
            options={SORT_OPTIONS}
            value={sort}
            onChange={onSortChange}
          />
          <OptionGroup
            label="Status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={onStatusChange}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

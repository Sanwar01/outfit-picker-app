"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  OUTFIT_SORT_OPTIONS,
  type OutfitSort,
} from "@/lib/outfits/filters";
import { cn } from "@/lib/utils";

interface OutfitsFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sort: OutfitSort;
  onSortChange: (sort: OutfitSort) => void;
}

export function OutfitsFilterSheet({
  open,
  onOpenChange,
  sort,
  onSortChange,
}: OutfitsFilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8">
        <SheetHeader className="px-0 pb-2">
          <SheetTitle className="font-(family-name:--font-auth-serif) text-xl text-neutral-950">
            Sort outfits
          </SheetTitle>
        </SheetHeader>

        <div className="pt-2">
          <p className="mb-2.5 text-[10px] font-semibold tracking-[0.15em] text-neutral-400 uppercase">
            Sort by
          </p>
          <div className="flex flex-col gap-2">
            {OUTFIT_SORT_OPTIONS.map((option) => {
              const isActive = sort === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSortChange(option.value)}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                    isActive
                      ? "border-neutral-950 bg-neutral-950 text-white"
                      : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

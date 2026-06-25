import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface OutfitsHeaderProps {
  onOpenFilters: () => void;
  activeFilterCount?: number;
}

export function OutfitsHeader({
  onOpenFilters,
  activeFilterCount = 0,
}: OutfitsHeaderProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-(family-name:--font-auth-serif) text-[1.75rem] leading-tight tracking-tight text-neutral-950">
          My Outfits
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Outfits from your wardrobe, styled for you
        </p>
      </div>
      <button
        type="button"
        onClick={onOpenFilters}
        className={cn(
          "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition-colors hover:bg-neutral-50",
          activeFilterCount > 0 && "border-neutral-950",
        )}
        aria-label="Filter and sort"
      >
        <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
        {activeFilterCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-950 text-[10px] font-semibold text-white">
            {activeFilterCount}
          </span>
        )}
      </button>
    </div>
  );
}

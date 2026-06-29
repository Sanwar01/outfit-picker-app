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
        <h1 className="font-serif text-[1.75rem] leading-tight tracking-tight text-foreground">
          My Outfits
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Outfits from your wardrobe, styled for you
        </p>
      </div>
      <button
        type="button"
        onClick={onOpenFilters}
        className={cn(
          "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-white text-foreground transition-colors hover:bg-background",
          activeFilterCount > 0 && "border-primary",
        )}
        aria-label="Filter and sort"
      >
        <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
        {activeFilterCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white">
            {activeFilterCount}
          </span>
        )}
      </button>
    </div>
  );
}

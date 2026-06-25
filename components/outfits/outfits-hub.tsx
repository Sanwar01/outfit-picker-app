"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { OutfitGridCard, OutfitListCard } from "@/components/outfits/outfit-card";
import { OutfitsFilterSheet } from "@/components/outfits/outfits-filter-sheet";
import { OutfitsHeader } from "@/components/outfits/outfits-header";
import { useQuickEditItemSheet } from "@/components/wardrobe/use-quick-edit-item-sheet";
import {
  countActiveOutfitFilters,
  filterOutfitsByTab,
  OUTFIT_TAB_OPTIONS,
  sortOutfits,
  type OutfitSort,
  type OutfitTab,
  type OutfitView,
} from "@/lib/outfits/filters";
import type { SavedOutfit } from "@/lib/types/outfit";
import { cn } from "@/lib/utils";

interface OutfitsHubProps {
  userId: string;
  itemId?: string;
  initialTab?: OutfitTab;
}

export function OutfitsHub({ userId, itemId, initialTab = "all" }: OutfitsHubProps) {
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<OutfitTab>(initialTab);
  const [sort, setSort] = useState<OutfitSort>("saved");
  const [view, setView] = useState<OutfitView>("grid");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const { openQuickEdit, quickEditSheet } = useQuickEditItemSheet(userId);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (itemId) params.set("itemId", itemId);
      const query = params.toString();
      const url = query ? `/api/outfits?${query}` : "/api/outfits";
      const res = await fetch(url);
      const data = await res.json();
      if (!cancelled) {
        setOutfits(res.ok ? data : []);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [itemId]);

  const visible = useMemo(() => {
    const filtered = filterOutfitsByTab(outfits, tab);
    return sortOutfits(filtered, sort);
  }, [outfits, tab, sort]);

  const activeFilterCount = countActiveOutfitFilters(sort);

  async function toggleFavorite(outfit: SavedOutfit) {
    const res = await fetch(`/api/outfits/${outfit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_favorite: !outfit.is_favorite }),
    });

    if (!res.ok) {
      toast.error("Failed to update favorite");
      return;
    }

    setOutfits((prev) =>
      prev.map((o) =>
        o.id === outfit.id ? { ...o, is_favorite: !o.is_favorite } : o,
      ),
    );
  }

  async function renameOutfit(outfitId: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Enter a name for this outfit");
      return false;
    }

    const res = await fetch(`/api/outfits/${outfitId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });

    if (!res.ok) {
      toast.error("Failed to rename outfit");
      return false;
    }

    setOutfits((prev) =>
      prev.map((o) => (o.id === outfitId ? { ...o, name: trimmed } : o)),
    );
    toast.success("Outfit renamed");
    return true;
  }

  function renderOutfitActions(outfit: SavedOutfit) {
    return {
      onToggleFavorite: () => toggleFavorite(outfit),
      onRename: (name: string) => renameOutfit(outfit.id, name),
      onItemClick: (item: SavedOutfit["items"][number]) =>
        openQuickEdit(item, outfit.imageUrls[item.image_url] ?? ""),
    };
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <>
      <OutfitsHeader
        onOpenFilters={() => setFilterSheetOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      <OutfitsFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        sort={sort}
        onSortChange={setSort}
      />

      {itemId && (
        <p className="mb-4 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600">
          Showing outfits that include this item.
        </p>
      )}

      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex gap-4 overflow-x-auto border-b border-neutral-200">
          {OUTFIT_TAB_OPTIONS.map((option) => {
            const isActive = tab === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTab(option.value)}
                className={cn(
                  "shrink-0 border-b-2 pb-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-neutral-950 text-neutral-950"
                    : "border-transparent text-neutral-400 hover:text-neutral-600",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 rounded-xl border border-neutral-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              view === "grid"
                ? "bg-neutral-950 text-white"
                : "text-neutral-500 hover:text-neutral-800",
            )}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              view === "list"
                ? "bg-neutral-950 text-white"
                : "text-neutral-500 hover:text-neutral-800",
            )}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-12 text-center">
          <p className="text-sm text-neutral-500">
            {tab === "favorites"
              ? "No favorite outfits yet."
              : "Save outfits from the Today tab to see them here."}
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3">
          {visible.map((outfit) => (
            <OutfitGridCard
              key={outfit.id}
              outfit={outfit}
              {...renderOutfitActions(outfit)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((outfit) => (
            <OutfitListCard
              key={outfit.id}
              outfit={outfit}
              {...renderOutfitActions(outfit)}
            />
          ))}
        </div>
      )}

      {quickEditSheet}
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ClothingCard } from "@/components/wardrobe/clothing-card";
import { CategoryBrowseGrid } from "@/components/wardrobe/category-browse-grid";
import { ClothingDetailSheet } from "@/components/wardrobe/clothing-detail-sheet";
import { ClothingFilters } from "@/components/wardrobe/clothing-filters";
import { RecentlyAddedStrip } from "@/components/wardrobe/recently-added-strip";
import { WardrobeSectionHeader } from "@/components/wardrobe/wardrobe-section-header";
import {
  buildCategorySummaries,
  getRecentlyAdded,
} from "@/lib/wardrobe/grouping";
import type { ClothingCategory, ClothingItem } from "@/lib/types/database";
import type { FilterValue } from "@/lib/types/clothing";

interface ClothingGridProps {
  items: ClothingItem[];
  imageUrls: Record<string, string>;
  userId: string;
}

export function ClothingGrid({ items, imageUrls, userId }: ClothingGridProps) {
  const [patchById, setPatchById] = useState<Record<string, ClothingItem>>({});
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [showAllItems, setShowAllItems] = useState(false);
  const [selected, setSelected] = useState<ClothingItem | null>(null);

  const wardrobeItems = useMemo(
    () =>
      items
        .filter((item) => !hiddenIds.has(item.id))
        .map((item) => patchById[item.id] ?? item),
    [items, patchById, hiddenIds]
  );

  const filtered = useMemo(() => {
    return wardrobeItems.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());

      if (filter === "archived") {
        return matchesSearch && item.status === "archived";
      }

      if (item.status === "archived") return false;

      if (filter === "all") return matchesSearch;

      return matchesSearch && item.category === filter;
    });
  }, [wardrobeItems, search, filter]);

  const categorySummaries = useMemo(
    () => buildCategorySummaries(wardrobeItems),
    [wardrobeItems]
  );

  const recentlyAdded = useMemo(
    () => getRecentlyAdded(wardrobeItems),
    [wardrobeItems]
  );

  const showHub =
    filter === "all" && search.trim() === "" && !showAllItems;

  function handleFilterChange(value: FilterValue) {
    setFilter(value);
    if (value !== "all") {
      setShowAllItems(true);
    } else {
      setShowAllItems(false);
    }
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    if (value.trim()) {
      setShowAllItems(true);
    }
  }

  function handleSelectCategory(category: ClothingCategory) {
    setFilter(category);
    setShowAllItems(true);
    setSearch("");
  }

  function handleUpdated(updated: ClothingItem) {
    setPatchById((prev) => ({ ...prev, [updated.id]: updated }));
    setSelected(updated);
  }

  function handleDeleted(itemId: string) {
    setHiddenIds((prev) => new Set(prev).add(itemId));
    setSelected(null);
  }

  const gridTitle =
    filter === "archived"
      ? "Archived"
      : filter === "all"
        ? "All items"
        : categorySummaries.find((c) => c.category === filter)?.label ??
          "Items";

  return (
    <>
      <ClothingFilters
        search={search}
        filter={filter}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
      />

      {showHub ? (
        <div className="space-y-6">
          <section>
            <WardrobeSectionHeader
              title="Wardrobe by category"
              onViewAll={() => setShowAllItems(true)}
            />
            <CategoryBrowseGrid
              categories={categorySummaries}
              imageUrls={imageUrls}
              onSelectCategory={handleSelectCategory}
            />
          </section>

          {recentlyAdded.length > 0 && (
            <section>
              <WardrobeSectionHeader
                title="Recently added"
                onViewAll={() => setShowAllItems(true)}
              />
              <RecentlyAddedStrip
                items={recentlyAdded}
                imageUrls={imageUrls}
                onSelectItem={setSelected}
              />
            </section>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-12 text-center">
          <p className="text-sm text-neutral-500">
            {wardrobeItems.length === 0
              ? "Your closet is empty. Add your first items to get started."
              : "No items match your search."}
          </p>
        </div>
      ) : (
        <section>
          <WardrobeSectionHeader
            title={gridTitle}
            actionLabel="Overview"
            onViewAll={() => {
              setFilter("all");
              setSearch("");
              setShowAllItems(false);
            }}
          />
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => (
              <ClothingCard
                key={item.id}
                item={item}
                imageUrl={imageUrls[item.image_url] ?? ""}
                onClick={() => setSelected(item)}
              />
            ))}
          </div>
        </section>
      )}

      <ClothingDetailSheet
        item={selected}
        imageUrl={selected ? (imageUrls[selected.image_url] ?? "") : ""}
        userId={userId}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />
    </>
  );
}

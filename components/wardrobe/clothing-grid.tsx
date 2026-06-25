"use client";

import { useMemo, useState } from "react";
import { ClothingCard } from "@/components/wardrobe/clothing-card";
import { CategoryBrowseGrid } from "@/components/wardrobe/category-browse-grid";
import { ClothingDetailSheet } from "@/components/wardrobe/clothing-detail-sheet";
import { ClothingFilters } from "@/components/wardrobe/clothing-filters";
import { RecentlyAddedStrip } from "@/components/wardrobe/recently-added-strip";
import { WardrobeFilterSheet } from "@/components/wardrobe/wardrobe-filter-sheet";
import { WardrobeHeader } from "@/components/wardrobe/wardrobe-header";
import { WardrobeSectionHeader } from "@/components/wardrobe/wardrobe-section-header";
import {
  buildCategorySummaries,
  getRecentlyAdded,
} from "@/lib/wardrobe/grouping";
import {
  countActiveFilters,
  sortWardrobeItems,
  type CategoryChipFilter,
  type WardrobeSort,
  type WardrobeStatusFilter,
} from "@/lib/wardrobe/filters";
import type { ClothingCategory, ClothingItem } from "@/lib/types/database";

interface ClothingGridProps {
  items: ClothingItem[];
  imageUrls: Record<string, string>;
  userId: string;
}

export function ClothingGrid({ items, imageUrls, userId }: ClothingGridProps) {
  const [patchById, setPatchById] = useState<Record<string, ClothingItem>>({});
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryChipFilter>("all");
  const [sort, setSort] = useState<WardrobeSort>("recent");
  const [statusFilter, setStatusFilter] =
    useState<WardrobeStatusFilter>("active");
  const [showAllItems, setShowAllItems] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [selected, setSelected] = useState<ClothingItem | null>(null);

  const wardrobeItems = useMemo(
    () =>
      items
        .filter((item) => !hiddenIds.has(item.id))
        .map((item) => patchById[item.id] ?? item),
    [items, patchById, hiddenIds],
  );

  const filtered = useMemo(() => {
    const matches = wardrobeItems.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "archived"
          ? item.status === "archived"
          : item.status !== "archived";
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    return sortWardrobeItems(matches, sort);
  }, [wardrobeItems, search, categoryFilter, statusFilter, sort]);

  const categorySummaries = useMemo(
    () => buildCategorySummaries(wardrobeItems),
    [wardrobeItems],
  );

  const recentlyAdded = useMemo(
    () => getRecentlyAdded(wardrobeItems),
    [wardrobeItems],
  );

  const activeFilterCount = countActiveFilters(sort, statusFilter);

  const showHub =
    categoryFilter === "all" &&
    search.trim() === "" &&
    !showAllItems &&
    statusFilter === "active";

  function handleCategoryChange(value: CategoryChipFilter) {
    setCategoryFilter(value);
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
    setCategoryFilter(category);
    setShowAllItems(true);
    setSearch("");
  }

  function handleStatusChange(status: WardrobeStatusFilter) {
    setStatusFilter(status);
    if (status === "archived") {
      setShowAllItems(true);
    }
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
    statusFilter === "archived"
      ? categoryFilter === "all"
        ? "Archived"
        : `Archived ${categorySummaries.find((c) => c.category === categoryFilter)?.label?.toLowerCase() ?? "items"}`
      : categoryFilter === "all"
        ? "All Items"
        : (categorySummaries.find((c) => c.category === categoryFilter)
            ?.label ?? "Items");

  return (
    <>
      <WardrobeHeader
        onOpenFilters={() => setFilterSheetOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      <WardrobeFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        sort={sort}
        status={statusFilter}
        onSortChange={setSort}
        onStatusChange={handleStatusChange}
      />

      <ClothingFilters
        search={search}
        filter={categoryFilter}
        onSearchChange={handleSearchChange}
        onFilterChange={handleCategoryChange}
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
              setCategoryFilter("all");
              setSearch("");
              setStatusFilter("active");
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

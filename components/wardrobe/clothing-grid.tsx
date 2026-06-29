"use client";

import { useMemo, useState } from "react";
import { ClothingCard } from "@/components/wardrobe/clothing-card";
import { CategoryBrowseGrid } from "@/components/wardrobe/category-browse-grid";
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
}

export function ClothingGrid({ items, imageUrls }: ClothingGridProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryChipFilter>("all");
  const [sort, setSort] = useState<WardrobeSort>("recent");
  const [statusFilter, setStatusFilter] =
    useState<WardrobeStatusFilter>("active");
  const [showAllItems, setShowAllItems] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const filtered = useMemo(() => {
    const matches = items.filter((item) => {
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
  }, [items, search, categoryFilter, statusFilter, sort]);

  const categorySummaries = useMemo(
    () => buildCategorySummaries(items),
    [items],
  );

  const recentlyAdded = useMemo(() => getRecentlyAdded(items), [items]);

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
              />
            </section>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {items.length === 0
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
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

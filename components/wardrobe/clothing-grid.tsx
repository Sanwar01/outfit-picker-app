"use client";

import { useMemo, useState } from "react";
import { ClothingCard } from "@/components/wardrobe/clothing-card";
import { ClothingFilters } from "@/components/wardrobe/clothing-filters";
import { ClothingDetailSheet } from "@/components/wardrobe/clothing-detail-sheet";
import type { ClothingItem } from "@/lib/types/database";
import type { FilterValue } from "@/lib/types/clothing";

interface ClothingGridProps {
  items: ClothingItem[];
  imageUrls: Record<string, string>;
  userId: string;
}

export function ClothingGrid({ items, imageUrls, userId }: ClothingGridProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [selected, setSelected] = useState<ClothingItem | null>(null);

  const filtered = useMemo(() => {
    return items.filter((item) => {
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
  }, [items, search, filter]);

  return (
    <>
      <ClothingFilters
        search={search}
        filter={filter}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
      />

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white px-6 py-12 text-center">
          <p className="text-sm text-stone-500">
            {items.length === 0
              ? "Your closet is empty. Add your first items to get started."
              : "No items match your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {filtered.map((item) => (
            <ClothingCard
              key={item.id}
              item={item}
              imageUrl={imageUrls[item.image_url] ?? ""}
              onClick={() => setSelected(item)}
            />
          ))}
        </div>
      )}

      <ClothingDetailSheet
        item={selected}
        imageUrl={selected ? imageUrls[selected.image_url] ?? "" : ""}
        userId={userId}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onUpdated={(updated) => {
          setSelected(updated);
        }}
        onDeleted={() => setSelected(null)}
      />
    </>
  );
}

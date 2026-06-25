"use client";

import { useState } from "react";
import { ClothingDetailSheet } from "@/components/wardrobe/clothing-detail-sheet";
import type { ClothingItem } from "@/lib/types/database";

export function useQuickEditItemSheet(userId: string) {
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  function openQuickEdit(selected: ClothingItem, url: string) {
    setItem(selected);
    setImageUrl(url);
  }

  function closeQuickEdit() {
    setItem(null);
    setImageUrl("");
  }

  const quickEditSheet = (
    <ClothingDetailSheet
      item={item}
      imageUrl={imageUrl}
      userId={userId}
      open={!!item}
      onOpenChange={(open) => !open && closeQuickEdit()}
      onUpdated={(updated) => setItem(updated)}
      onDeleted={() => closeQuickEdit()}
    />
  );

  return { openQuickEdit, quickEditSheet };
}

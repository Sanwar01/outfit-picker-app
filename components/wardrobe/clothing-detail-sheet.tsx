"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { WARDROBE_BUCKET } from "@/lib/constants";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, FILTER_OPTIONS } from "@/lib/types/clothing";
import type { ClothingCategory, ClothingItem } from "@/lib/types/database";

const EDITABLE_CATEGORIES = FILTER_OPTIONS.filter(
  (option) => option.value !== "all" && option.value !== "archived"
).map((option) => option.value as ClothingCategory);

interface ClothingDetailSheetProps {
  item: ClothingItem | null;
  imageUrl: string;
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (item: ClothingItem) => void;
  onDeleted: (itemId: string) => void;
}

function ClothingDetailContent({
  item,
  imageUrl,
  userId,
  onUpdated,
  onDeleted,
  onClose,
}: {
  item: ClothingItem;
  imageUrl: string;
  userId: string;
  onUpdated: (item: ClothingItem) => void;
  onDeleted: (itemId: string) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState<ClothingCategory>(item.category);
  const [colorsText, setColorsText] = useState(item.colors.join(", "));
  const [loading, setLoading] = useState(false);

  async function saveDetails() {
    const colors = colorsText
      .split(",")
      .map((color) => color.trim())
      .filter(Boolean);

    if (colors.length === 0) {
      toast.error("Add at least one color");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("clothing_items")
      .update({ name, category, colors })
      .eq("id", item.id)
      .eq("user_id", userId)
      .select()
      .single();

    setLoading(false);
    if (error) {
      toast.error("Failed to update item");
      return;
    }
    if (data) {
      onUpdated(data);
      toast.success("Item updated");
      router.refresh();
    }
  }

  const detailsDirty =
    name !== item.name ||
    category !== item.category ||
    colorsText !== item.colors.join(", ");

  async function toggleArchive() {
    const newStatus = item.status === "active" ? "archived" : "active";
    setLoading(true);
    const { data, error } = await supabase
      .from("clothing_items")
      .update({ status: newStatus })
      .eq("id", item.id)
      .eq("user_id", userId)
      .select()
      .single();

    setLoading(false);
    if (error) {
      toast.error("Failed to update item");
      return;
    }
    if (data) {
      onUpdated(data);
      toast.success(newStatus === "archived" ? "Item archived" : "Item restored");
      if (newStatus === "archived") onClose();
      router.refresh();
    }
  }

  async function deleteItem() {
    setLoading(true);

    await supabase.storage.from(WARDROBE_BUCKET).remove([item.image_url]);

    const { error } = await supabase
      .from("clothing_items")
      .delete()
      .eq("id", item.id)
      .eq("user_id", userId);

    setLoading(false);
    if (error) {
      toast.error("Failed to delete item");
      return;
    }

    toast.success("Item deleted");
    onDeleted(item.id);
    onClose();
    router.refresh();
  }

  async function retryTagging() {
    setLoading(true);
    const res = await fetch("/api/clothing/tag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id }),
    });
    setLoading(false);

    if (!res.ok) {
      toast.error("Tagging failed");
      return;
    }

    const data = (await res.json()) as ClothingItem;
    onUpdated(data);
    toast.success("Item re-tagged");
    router.refresh();
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="relative mx-auto aspect-3/4 w-full max-w-xs overflow-hidden rounded-2xl bg-stone-100">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            unoptimized
          />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{CATEGORY_LABELS[item.category]}</Badge>
        {item.colors.map((color) => (
          <Badge key={color} variant="outline">
            {color}
          </Badge>
        ))}
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-700">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-700">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ClothingCategory)}
            className="h-9 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {EDITABLE_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {CATEGORY_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-700">Colors</label>
          <Input
            value={colorsText}
            onChange={(e) => setColorsText(e.target.value)}
            placeholder="navy, white"
            className="rounded-xl"
          />
          <p className="text-xs text-stone-500">Comma-separated</p>
        </div>

        <Button
          onClick={saveDetails}
          disabled={loading || !detailsDirty}
          className="w-full rounded-xl"
        >
          Save changes
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={retryTagging}
          disabled={loading}
        >
          Re-run AI tagging
        </Button>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={toggleArchive}
          disabled={loading}
        >
          {item.status === "active" ? "Archive item" : "Unarchive item"}
        </Button>
        <Button
          variant="destructive"
          className="rounded-xl"
          onClick={deleteItem}
          disabled={loading}
        >
          Delete item
        </Button>
      </div>
    </div>
  );
}

export function ClothingDetailSheet({
  item,
  imageUrl,
  userId,
  open,
  onOpenChange,
  onUpdated,
  onDeleted,
}: ClothingDetailSheetProps) {
  if (!item) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Item details</SheetTitle>
        </SheetHeader>

        <ClothingDetailContent
          key={item.id}
          item={item}
          imageUrl={imageUrl}
          userId={userId}
          onUpdated={onUpdated}
          onDeleted={onDeleted}
          onClose={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

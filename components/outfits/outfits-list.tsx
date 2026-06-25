"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Heart, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { weatherConditionLabel } from "@/lib/weather/open-meteo";
import type { SavedOutfit } from "@/lib/types/outfit";
import type { ClothingItem } from "@/lib/types/database";
import type { WeatherSnapshot } from "@/lib/weather/open-meteo";
import { useQuickEditItemSheet } from "@/components/wardrobe/use-quick-edit-item-sheet";

interface OutfitsListProps {
  itemId?: string;
  userId: string;
}

export function OutfitsList({ itemId, userId }: OutfitsListProps) {
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const { openQuickEdit, quickEditSheet } = useQuickEditItemSheet(userId);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter === "favorites") params.set("favorites", "true");
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
  }, [filter, itemId]);

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
        o.id === outfit.id ? { ...o, is_favorite: !o.is_favorite } : o
      )
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
      prev.map((o) => (o.id === outfitId ? { ...o, name: trimmed } : o))
    );
    toast.success("Outfit renamed");
    return true;
  }

  async function deleteOutfit(outfit: SavedOutfit) {
    const label = outfit.name ?? "Saved outfit";
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) {
      return;
    }

    const res = await fetch(`/api/outfits/${outfit.id}`, { method: "DELETE" });

    if (!res.ok) {
      toast.error("Failed to delete outfit");
      return;
    }

    setOutfits((prev) => prev.filter((o) => o.id !== outfit.id));
    toast.success("Outfit deleted");
  }

  async function wearOutfit(outfit: SavedOutfit) {
    const res = await fetch("/api/outfits/wear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemIds: outfit.items.map((item) => item.id),
        outfitId: outfit.id,
      }),
    });

    if (!res.ok) {
      toast.error("Failed to log outfit");
      return;
    }

    toast.success("Logged for today — enjoy your outfit!");
  }

  const visible = useMemo(() => {
    if (filter === "favorites") {
      return outfits.filter((o) => o.is_favorite);
    }
    return outfits;
  }, [outfits, filter]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {itemId && (
        <p className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600">
          Showing outfits that include this item.
        </p>
      )}
      <div className="flex gap-2">
        {(["all", "favorites"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium capitalize",
              filter === value
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-200 bg-white text-stone-600"
            )}
          >
            {value}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white px-6 py-12 text-center">
          <p className="text-sm text-stone-500">
            {filter === "favorites"
              ? "No favorite outfits yet."
              : "Save outfits from the Today tab to see them here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              onToggleFavorite={() => toggleFavorite(outfit)}
              onRename={(name) => renameOutfit(outfit.id, name)}
              onDelete={() => deleteOutfit(outfit)}
              onWear={() => wearOutfit(outfit)}
              onItemClick={(item) =>
                openQuickEdit(item, outfit.imageUrls[item.image_url] ?? "")
              }
            />
          ))}
        </div>
      )}

      {quickEditSheet}
    </div>
  );
}

function OutfitCard({
  outfit,
  onToggleFavorite,
  onRename,
  onDelete,
  onWear,
  onItemClick,
}: {
  outfit: SavedOutfit;
  onToggleFavorite: () => void;
  onRename: (name: string) => Promise<boolean>;
  onDelete: () => void;
  onWear: () => void;
  onItemClick: (item: ClothingItem) => void;
}) {
  const weather = outfit.weather_snapshot as WeatherSnapshot | null;
  const previewItems = outfit.items.slice(0, 4);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(outfit.name ?? "Saved outfit");
  const [saving, setSaving] = useState(false);
  const [wearing, setWearing] = useState(false);

  async function handleSaveName() {
    setSaving(true);
    const ok = await onRename(editName);
    setSaving(false);
    if (ok) setEditing(false);
  }

  async function handleWear() {
    setWearing(true);
    await onWear();
    setWearing(false);
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-8 rounded-lg"
                maxLength={60}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSaveName();
                  if (e.key === "Escape") {
                    setEditName(outfit.name ?? "Saved outfit");
                    setEditing(false);
                  }
                }}
              />
              <Button
                size="sm"
                className="rounded-lg"
                onClick={handleSaveName}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <p className="truncate font-medium text-stone-900">
                {outfit.name ?? "Saved outfit"}
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditName(outfit.name ?? "Saved outfit");
                  setEditing(true);
                }}
                className="shrink-0 rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                aria-label="Rename outfit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {weather && (
            <p className="text-xs text-stone-500">
              {weather.temp_c}°C · {weatherConditionLabel(weather.condition)}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 rounded-full"
          onClick={onToggleFavorite}
        >
          <Heart
            className={cn(
              "h-4 w-4",
              outfit.is_favorite
                ? "fill-red-500 text-red-500"
                : "text-stone-400"
            )}
          />
        </Button>
      </div>

      <div className="mb-3 flex gap-2 overflow-x-auto">
        {previewItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onItemClick(item)}
            className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100"
            aria-label={`Quick edit ${item.name}`}
          >
            <Image
              src={outfit.imageUrls[item.image_url] ?? ""}
              alt={item.name}
              fill
              className="object-cover"
              unoptimized
            />
          </button>
        ))}
      </div>

      {outfit.ai_rationale && (
        <p className="mb-3 text-sm text-stone-600">{outfit.ai_rationale}</p>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 rounded-xl"
          onClick={handleWear}
          disabled={wearing}
        >
          {wearing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Wear"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl text-red-600 hover:text-red-700"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

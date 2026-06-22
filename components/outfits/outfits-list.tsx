"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { weatherConditionLabel } from "@/lib/weather/open-meteo";
import type { SavedOutfit } from "@/lib/types/outfit";
import type { WeatherSnapshot } from "@/lib/weather/open-meteo";

export function OutfitsList() {
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const url =
        filter === "favorites"
          ? "/api/outfits?favorites=true"
          : "/api/outfits";
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
  }, [filter]);

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
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OutfitCard({
  outfit,
  onToggleFavorite,
}: {
  outfit: SavedOutfit;
  onToggleFavorite: () => void;
}) {
  const weather = outfit.weather_snapshot as WeatherSnapshot | null;
  const previewItems = outfit.items.slice(0, 4);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-stone-900">
            {outfit.name ?? "Saved outfit"}
          </p>
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
          className="rounded-full"
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
          <div
            key={item.id}
            className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100"
          >
            <Image
              src={outfit.imageUrls[item.image_url] ?? ""}
              alt={item.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ))}
      </div>

      {outfit.ai_rationale && (
        <p className="text-sm text-stone-600">{outfit.ai_rationale}</p>
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  outfitSubtitle,
  pickOutfitHeroItem,
} from "@/lib/outfits/filters";
import type { ClothingItem } from "@/lib/types/database";
import type { SavedOutfit } from "@/lib/types/outfit";
import { weatherConditionLabel } from "@/lib/weather/open-meteo";
import type { WeatherSnapshot } from "@/lib/weather/open-meteo";
import { cn } from "@/lib/utils";

interface OutfitListCardProps {
  outfit: SavedOutfit;
  onToggleFavorite: () => void;
  onRename: (name: string) => Promise<boolean>;
  onItemClick: (item: ClothingItem) => void;
}

export function OutfitListCard({
  outfit,
  onToggleFavorite,
  onRename,
  onItemClick,
}: OutfitListCardProps) {
  const weather = outfit.weather_snapshot as WeatherSnapshot | null;
  const previewItems = outfit.items.slice(0, 4);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(outfit.name ?? "Saved outfit");
  const [saving, setSaving] = useState(false);

  async function handleSaveName() {
    setSaving(true);
    const ok = await onRename(editName);
    setSaving(false);
    if (ok) setEditing(false);
  }

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
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
                Save
              </Button>
            </div>
          ) : (
            <Link href={`/outfits/${outfit.id}`} className="block">
              <div className="flex items-center gap-1.5">
                <p className="truncate font-medium text-neutral-950">
                  {outfit.name ?? "Saved outfit"}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditName(outfit.name ?? "Saved outfit");
                    setEditing(true);
                  }}
                  className="shrink-0 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                  aria-label="Rename outfit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-0.5 line-clamp-2 text-sm text-neutral-500">
                {outfitSubtitle(outfit)}
              </p>
              {weather && (
                <p className="mt-1 text-xs text-neutral-400">
                  {weather.temp_c}°C · {weatherConditionLabel(weather.condition)}
                </p>
              )}
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleFavorite}
          className="shrink-0 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100"
          aria-label={outfit.is_favorite ? "Remove favorite" : "Add favorite"}
        >
          <Heart
            className={cn(
              "h-4 w-4",
              outfit.is_favorite && "fill-neutral-950 text-neutral-950",
            )}
          />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {previewItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onItemClick(item)}
            className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100"
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
    </article>
  );
}

interface OutfitGridCardProps {
  outfit: SavedOutfit;
  onToggleFavorite: () => void;
}

export function OutfitGridCard({
  outfit,
  onToggleFavorite,
}: OutfitGridCardProps) {
  const heroItem = pickOutfitHeroItem(outfit.items);
  const heroUrl = outfit.imageUrls[heroItem?.image_url ?? ""] ?? "";

  return (
    <article className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <Link href={`/outfits/${outfit.id}`} className="block">
        <div className="relative aspect-3/4 bg-neutral-100">
          {heroUrl ? (
            <Image
              src={heroUrl}
              alt={outfit.name ?? "Saved outfit"}
              fill
              className="object-cover"
              unoptimized
            />
          ) : null}
        </div>
        <div className="space-y-1 p-3">
          <p className="truncate text-sm font-semibold text-neutral-950">
            {outfit.name ?? "Saved outfit"}
          </p>
          <p className="line-clamp-2 text-xs text-neutral-500">
            {outfitSubtitle(outfit)}
          </p>
        </div>
      </Link>
      <button
        type="button"
        onClick={onToggleFavorite}
        className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm"
        aria-label={outfit.is_favorite ? "Remove favorite" : "Add favorite"}
      >
        <Heart
          className={cn(
            "h-4 w-4",
            outfit.is_favorite
              ? "fill-neutral-950 text-neutral-950"
              : "text-neutral-500",
          )}
        />
      </button>
    </article>
  );
}

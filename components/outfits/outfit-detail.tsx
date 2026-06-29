"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Check,
  Heart,
  Loader2,
  MoreHorizontal,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ItemImageGallery } from "@/components/wardrobe/item-image-gallery";
import { Button } from "@/components/ui/button";
import {
  getOutfitGalleryUrls,
  splitRationaleBullets,
} from "@/lib/outfits/get-outfit";
import type { SavedOutfit } from "@/lib/types/outfit";
import { cn } from "@/lib/utils";

interface OutfitDetailProps {
  outfit: SavedOutfit;
}

export function OutfitDetail({ outfit: initialOutfit }: OutfitDetailProps) {
  const router = useRouter();
  const [outfit, setOutfit] = useState(initialOutfit);
  const [isFavorite, setIsFavorite] = useState(initialOutfit.is_favorite);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wearing, setWearing] = useState(false);
  const [wornToday, setWornToday] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const galleryUrls = getOutfitGalleryUrls(outfit);
  const whyBullets = splitRationaleBullets(outfit.ai_rationale);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  async function toggleFavorite() {
    const next = !isFavorite;
    setIsFavorite(next);

    const res = await fetch(`/api/outfits/${outfit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_favorite: next }),
    });

    if (!res.ok) {
      setIsFavorite(!next);
      toast.error("Failed to update favorite");
      return;
    }

    setOutfit((prev) => ({ ...prev, is_favorite: next }));
    toast.success(next ? "Added to favorites" : "Removed from favorites");
  }

  async function handleWear() {
    setWearing(true);

    const res = await fetch("/api/outfits/wear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemIds: outfit.items.map((item) => item.id),
        outfitId: outfit.id,
      }),
    });

    setWearing(false);

    if (!res.ok) {
      toast.error("Failed to log outfit");
      return;
    }

    const now = new Date().toISOString();
    setOutfit((prev) => ({ ...prev, last_worn_at: now }));
    setWornToday(true);
    toast.success("You're set for today");
  }

  async function deleteOutfit() {
    setMenuOpen(false);
    const label = outfit.name ?? "Saved outfit";
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) {
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/outfits/${outfit.id}`, { method: "DELETE" });
    setLoading(false);

    if (!res.ok) {
      toast.error("Failed to delete outfit");
      return;
    }

    toast.success("Outfit deleted");
    router.push("/outfits");
    router.refresh();
  }

  async function renameOutfit() {
    setMenuOpen(false);
    const nextName = window.prompt(
      "Rename outfit",
      outfit.name ?? "Saved outfit",
    );
    if (nextName == null) return;

    const trimmed = nextName.trim();
    if (!trimmed) {
      toast.error("Enter a name for this outfit");
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/outfits/${outfit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    setLoading(false);

    if (!res.ok) {
      toast.error("Failed to rename outfit");
      return;
    }

    setOutfit((prev) => ({ ...prev, name: trimmed }));
    toast.success("Outfit renamed");
  }

  return (
    <>
      <div className="pb-28">
        <header className="mb-5 flex items-center justify-between gap-3">
          <Link
            href="/outfits"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-foreground"
            aria-label="Back to outfits"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <h1 className="font-serif text-lg text-foreground">
            Outfit detail
          </h1>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFavorite}
              disabled={loading}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-foreground"
              aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  isFavorite && "fill-primary text-foreground",
                )}
              />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-foreground"
                aria-label="More actions"
                aria-expanded={menuOpen}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={renameOutfit}
                    disabled={loading}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-background disabled:opacity-50"
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={deleteOutfit}
                    disabled={loading}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete outfit
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="mb-6 flex gap-4">
          <div className="w-[42%] shrink-0">
            <ItemImageGallery
              imageUrls={galleryUrls}
              alt={outfit.name ?? "Saved outfit"}
            />
          </div>

          <div className="min-w-0 flex-1 space-y-3 pt-1">
            <h2 className="font-serif text-2xl leading-tight text-foreground">
              {outfit.name ?? "Saved outfit"}
            </h2>
          </div>
        </div>

        <section className="mb-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Items in this outfit
          </h3>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {outfit.items.map((item) => {
              const imageUrl = outfit.imageUrls[item.image_url] ?? "";
              const primaryColor = item.colors[0];

              return (
                <Link
                  key={item.id}
                  href={`/wardrobe/${item.id}`}
                  className="w-28 shrink-0 text-left"
                >
                  <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
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
                  <p className="mt-2 truncate text-xs font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-ink-faint">
                    {primaryColor ?? item.brand ?? "—"}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {whyBullets.length > 0 && (
          <section className="rounded-2xl border border-border bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">
                Why this works
              </h3>
            </div>
            <ul className="space-y-2">
              {whyBullets.map((reason) => (
                <li
                  key={reason}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-foreground"
                    strokeWidth={2}
                  />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-20 z-40 mx-auto max-w-lg px-4">
        <div className="flex gap-3 rounded-2xl border border-border bg-white/95 p-2 shadow-lg backdrop-blur-sm">
          <Button
            type="button"
            variant="outline"
            onClick={toggleFavorite}
            disabled={loading}
            className="h-11 flex-1 rounded-xl border-border bg-muted text-foreground hover:bg-cream-deep"
          >
            <Heart
              className={cn(
                "mr-2 h-4 w-4",
                isFavorite && "fill-primary text-foreground",
              )}
            />
            {isFavorite ? "Favorited" : "Favorite"}
          </Button>
          <Button
            type="button"
            onClick={handleWear}
            disabled={loading || wearing || wornToday}
            className="h-11 flex-1 rounded-xl bg-primary text-white hover:bg-primary/90"
          >
            {wearing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Calendar className="mr-2 h-4 w-4" />
            )}
            {wornToday ? "Logged" : "Wear today"}
          </Button>
        </div>
      </div>
    </>
  );
}

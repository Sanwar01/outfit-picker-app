'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Columns2,
  Footprints,
  Heart,
  Loader2,
  MoreHorizontal,
  NotebookPen,
  Pencil,
  PlusCircle,
  Shirt,
  Sparkles,
  Sun,
  Trash2,
  Watch,
  Wind,
  Archive,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { WARDROBE_BUCKET } from '@/lib/constants';
import { AddToOutfitDialog } from '@/components/wardrobe/add-to-outfit-dialog';
import { HowIStyleSection } from '@/components/wardrobe/how-i-style-section';
import { ItemImageGallery } from '@/components/wardrobe/item-image-gallery';
import { Button } from '@/components/ui/button';
import { CATEGORY_LABELS } from '@/lib/types/clothing';
import type { ClothingCategory, ClothingItem } from '@/lib/types/database';
import type { StyleCompanion } from '@/lib/wardrobe/item-detail-data';
import { getItemImagePaths } from '@/lib/wardrobe/item-images';
import {
  TAG_UNAVAILABLE_TOAST,
  type TagClothingResponse,
} from '@/lib/wardrobe/tagging';
import {
  formatItemDate,
  itemDescription,
  seasonDisplayLabel,
} from '@/lib/wardrobe/item-edit';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<ClothingCategory, typeof Shirt> = {
  top: Shirt,
  bottom: Columns2,
  outerwear: Wind,
  shoes: Footprints,
  accessory: Watch,
};

interface ClothingItemDetailProps {
  item: ClothingItem;
  galleryUrls: string[];
  companions: StyleCompanion[];
  outfitCount: number;
  userId: string;
}

export function ClothingItemDetail({
  item,
  galleryUrls,
  companions,
  outfitCount,
  userId,
}: ClothingItemDetailProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(item.is_favorite ?? false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const CategoryIcon = CATEGORY_ICONS[item.category];
  const description = itemDescription(item);
  const isArchived = item.status === 'archived';

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  async function toggleFavorite() {
    setFavoriteLoading(true);
    const next = !isFavorite;
    const { error } = await supabase
      .from('clothing_items')
      .update({ is_favorite: next })
      .eq('id', item.id)
      .eq('user_id', userId);

    setFavoriteLoading(false);

    if (error) {
      toast.error('Failed to update favorite');
      return;
    }

    setIsFavorite(next);
    toast.success(next ? 'Added to favorites' : 'Removed from favorites');
  }

  async function toggleArchive() {
    const newStatus = isArchived ? 'active' : 'archived';
    setLoading(true);
    const { error } = await supabase
      .from('clothing_items')
      .update({ status: newStatus })
      .eq('id', item.id)
      .eq('user_id', userId);

    setLoading(false);
    if (error) {
      toast.error('Failed to update item');
      return;
    }

    toast.success(isArchived ? 'Moved to wardrobe' : 'Item archived');
    router.push('/wardrobe');
    router.refresh();
  }

  async function deleteItem() {
    setMenuOpen(false);
    setLoading(true);

    const imagePaths = await getItemImagePaths(supabase, item.id, item.image_url);
    await supabase.storage.from(WARDROBE_BUCKET).remove(imagePaths);

    const { error } = await supabase
      .from('clothing_items')
      .delete()
      .eq('id', item.id)
      .eq('user_id', userId);

    setLoading(false);
    if (error) {
      toast.error('Failed to delete item');
      return;
    }

    toast.success('Item deleted');
    router.push('/wardrobe');
    router.refresh();
  }

  async function retryTagging() {
    setMenuOpen(false);
    setLoading(true);
    const res = await fetch('/api/clothing/tag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id }),
    });
    setLoading(false);

    if (!res.ok) {
      toast.error('Something went wrong — try again in a moment');
      return;
    }

    const data = (await res.json()) as TagClothingResponse;
    if (!data.retagged) {
      toast.message(TAG_UNAVAILABLE_TOAST);
      return;
    }

    toast.success('Item re-tagged');
    router.refresh();
  }

  const stats = [
    {
      icon: Calendar,
      label: 'Date added',
      value: formatItemDate(item.created_at),
    },
    {
      icon: Sun,
      label: 'Season',
      value: seasonDisplayLabel(item.season),
    },
  ];

  return (
    <>
      <div className="pb-28">
        <header className="mb-5 flex items-center justify-between">
          <Link
            href="/wardrobe"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800"
            aria-label="Back to wardrobe"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/wardrobe/${item.id}/edit`}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800"
              aria-label="Edit item"
            >
              <Pencil className="h-4 w-4" />
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800"
                aria-label="More actions"
                aria-expanded={menuOpen}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={retryTagging}
                    disabled={loading}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4 text-neutral-500" />
                    Re-run AI tagging
                  </button>
                  <button
                    type="button"
                    onClick={deleteItem}
                    disabled={loading}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete item
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="mb-6 flex gap-4">
          <div className="w-[42%] shrink-0">
            <ItemImageGallery imageUrls={galleryUrls} alt={item.name} />
          </div>

          <div className="min-w-0 flex-1 space-y-3 pt-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] text-neutral-500 uppercase">
              <CategoryIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
              {CATEGORY_LABELS[item.category]}
            </div>

            <div className="flex items-start justify-between gap-2">
              <h1 className="font-(family-name:--font-auth-serif) text-2xl leading-tight text-neutral-950">
                {item.name}
              </h1>
              <button
                type="button"
                onClick={toggleFavorite}
                disabled={favoriteLoading}
                className="mt-1 shrink-0 text-neutral-400 transition-colors hover:text-neutral-700 disabled:opacity-50"
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart
                  className={cn(
                    'h-5 w-5',
                    isFavorite && 'fill-neutral-950 text-neutral-950',
                  )}
                />
              </button>
            </div>

            {item.brand && (
              <p className="text-sm text-neutral-500">{item.brand}</p>
            )}

            {description && (
              <p className="text-sm leading-relaxed text-neutral-600">
                {description}
              </p>
            )}
          </div>
        </div>

        <section className="mb-5 rounded-2xl border border-neutral-200 bg-white">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={cn(
                  'flex items-center justify-between px-4 py-3.5',
                  index < stats.length - 1 && 'border-b border-neutral-100',
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-neutral-400" strokeWidth={1.75} />
                  <span className="text-sm text-neutral-600">{stat.label}</span>
                </div>
                <span className="text-sm font-medium text-neutral-900">
                  {stat.value}
                </span>
              </div>
            );
          })}
        </section>

        <HowIStyleSection
          itemId={item.id}
          companions={companions}
          outfitCount={outfitCount}
        />

        <section className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <NotebookPen className="h-4 w-4 text-neutral-500" />
              <h2 className="text-sm font-semibold text-neutral-950">
                Item notes
              </h2>
            </div>
            <Link
              href={`/wardrobe/${item.id}/edit`}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-800"
            >
              Edit
            </Link>
          </div>
          <p className="text-sm leading-relaxed text-neutral-600">
            {item.notes?.trim() || 'No notes yet. Add anything helpful about this piece.'}
          </p>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-20 z-40 mx-auto max-w-lg px-4">
        <div className="flex gap-3 rounded-2xl border border-neutral-200 bg-white/95 p-2 shadow-lg backdrop-blur-sm">
          <Button
            type="button"
            variant="outline"
            onClick={toggleArchive}
            disabled={loading}
            className="h-11 flex-1 rounded-xl border-neutral-200 bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Archive className="mr-2 h-4 w-4" />
                {isArchived ? 'Move to wardrobe' : 'Archive'}
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={() => setAddDialogOpen(true)}
            disabled={loading}
            className="h-11 flex-1 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add to outfit
          </Button>
        </div>
      </div>

      <AddToOutfitDialog
        itemId={item.id}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
    </>
  );
}

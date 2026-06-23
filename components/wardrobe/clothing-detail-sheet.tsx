'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Heart,
  Loader2,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { compressImage } from '@/lib/image/compress';
import { WARDROBE_BUCKET } from '@/lib/constants';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CATEGORY_LABELS } from '@/lib/types/clothing';
import type { ClothingCategory, ClothingItem } from '@/lib/types/database';
import {
  FORMALITY_OPTIONS,
  SUB_CATEGORY_OPTIONS,
} from '@/lib/wardrobe/item-edit';
import { getItemImagePaths } from '@/lib/wardrobe/item-images';
import { cn } from '@/lib/utils';

const EDITABLE_CATEGORIES: ClothingCategory[] = [
  'top',
  'bottom',
  'outerwear',
  'shoes',
  'accessory',
];

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState<ClothingCategory>(item.category);
  const [formality, setFormality] = useState(item.formality);
  const [subCategory, setSubCategory] = useState(item.sub_category ?? '');
  const [previewUrl, setPreviewUrl] = useState(imageUrl);
  const [imagePath, setImagePath] = useState(item.image_url);
  const [isFavorite, setIsFavorite] = useState(item.is_favorite ?? false);
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [taggingLoading, setTaggingLoading] = useState(false);

  const subCategoryOptions = SUB_CATEGORY_OPTIONS[category];
  const showCustomSubCategory =
    subCategory !== '' && !subCategoryOptions.includes(subCategory);

  async function saveField(updates: Partial<ClothingItem>) {
    const { data, error } = await supabase
      .from('clothing_items')
      .update(updates)
      .eq('id', item.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      toast.error('Failed to save');
      return null;
    }

    onUpdated(data as ClothingItem);
    router.refresh();
    return data as ClothingItem;
  }

  async function handleNameBlur() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === item.name) return;
    const saved = await saveField({ name: trimmed });
    if (saved) toast.success('Name updated');
  }

  async function handleCategoryChange(value: ClothingCategory) {
    setCategory(value);
    const options = SUB_CATEGORY_OPTIONS[value];
    const nextSubCategory = options.includes(subCategory)
      ? subCategory
      : options[0];
    setSubCategory(nextSubCategory);
    const saved = await saveField({
      category: value,
      sub_category: nextSubCategory,
    });
    if (saved) toast.success('Category updated');
  }

  async function handleFormalityChange(value: number) {
    setFormality(value);
    const saved = await saveField({ formality: value });
    if (saved) toast.success('Style updated');
  }

  async function handleSubCategoryChange(value: string) {
    setSubCategory(value);
    const saved = await saveField({ sub_category: value || null });
    if (saved) toast.success('Sub-category updated');
  }

  async function toggleFavorite() {
    const next = !isFavorite;
    setIsFavorite(next);
    const saved = await saveField({ is_favorite: next });
    if (!saved) setIsFavorite(!next);
  }

  async function handleRetake(file: File) {
    setPhotoLoading(true);
    try {
      const compressed = await compressImage(file);
      const storagePath = `${userId}/${item.id}.webp`;

      const { error: uploadError } = await supabase.storage
        .from(WARDROBE_BUCKET)
        .upload(storagePath, compressed, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      if (imagePath !== storagePath) {
        await supabase.storage.from(WARDROBE_BUCKET).remove([imagePath]);
      }

      const saved = await saveField({ image_url: storagePath });
      if (saved) {
        setImagePath(storagePath);
        setPreviewUrl(URL.createObjectURL(compressed));
        toast.success('Photo updated');
      }
    } catch {
      toast.error('Failed to update photo');
    } finally {
      setPhotoLoading(false);
    }
  }

  async function handleRetag() {
    setTaggingLoading(true);
    const res = await fetch('/api/clothing/tag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id }),
    });
    setTaggingLoading(false);

    if (!res.ok) {
      toast.error('Re-tag failed');
      return;
    }

    const data = (await res.json()) as ClothingItem;
    setName(data.name);
    setCategory(data.category);
    setFormality(data.formality);
    setSubCategory(data.sub_category ?? '');
    onUpdated(data);
    toast.success('Item re-tagged');
    router.refresh();
  }

  async function deleteItem() {
    setLoading(true);
    const imagePaths = await getItemImagePaths(supabase, item.id, imagePath);
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
    onDeleted(item.id);
    onClose();
    router.refresh();
  }

  const busy = loading || photoLoading || taggingLoading;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex items-center justify-between gap-3 pr-8">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleNameBlur}
          className="min-w-0 flex-1 bg-transparent text-lg font-semibold text-neutral-950 outline-none"
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={deleteItem}
          disabled={busy}
          className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </>
          )}
        </Button>

        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleRetake(file);
              e.target.value = '';
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="rounded-xl"
          >
            {photoLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Camera className="mr-1.5 h-3.5 w-3.5" />
                Retake
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRetag}
            disabled={busy}
            className="rounded-xl"
          >
            {taggingLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Re-tag
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl bg-neutral-100">
        {previewUrl && (
          <Image
            src={previewUrl}
            alt={name}
            fill
            className="object-cover"
            unoptimized
          />
        )}
        {photoLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />
          </div>
        )}
        <button
          type="button"
          onClick={toggleFavorite}
          disabled={busy}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={cn(
              'h-4 w-4',
              isFavorite
                ? 'fill-neutral-950 text-neutral-950'
                : 'text-neutral-600',
            )}
          />
        </button>
      </div>

      <div className="space-y-4">
        <Field label="Category">
          <select
            value={category}
            onChange={(e) =>
              handleCategoryChange(e.target.value as ClothingCategory)
            }
            disabled={busy}
            className={fieldClass}
          >
            {EDITABLE_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {CATEGORY_LABELS[value]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Style">
          <div className="flex flex-wrap gap-2">
            {FORMALITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleFormalityChange(option.value)}
                disabled={busy}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  formality === option.value
                    ? 'border-neutral-950 bg-neutral-950 text-white'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Sub-category">
          <select
            value={
              subCategory && subCategoryOptions.includes(subCategory)
                ? subCategory
                : showCustomSubCategory
                  ? '__custom__'
                  : subCategory || subCategoryOptions[0]
            }
            onChange={(e) => {
              const value = e.target.value;
              if (value === '__custom__') return;
              if (value === 'Other') {
                setSubCategory('Other');
                return;
              }
              void handleSubCategoryChange(value);
            }}
            disabled={busy}
            className={fieldClass}
          >
            {subCategoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
            {showCustomSubCategory && (
              <option value="__custom__">{subCategory}</option>
            )}
          </select>
          {(subCategory === 'Other' || showCustomSubCategory) && (
            <input
              value={subCategory === 'Other' ? '' : subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              onBlur={() => {
                const trimmed =
                  subCategory === 'Other' ? '' : subCategory.trim();
                if (trimmed && trimmed !== item.sub_category) {
                  void handleSubCategoryChange(trimmed);
                }
              }}
              placeholder="Enter sub-category"
              disabled={busy}
              className={cn(fieldClass, 'mt-2')}
            />
          )}
        </Field>
      </div>
    </div>
  );
}

const fieldClass =
  'h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 disabled:opacity-50';

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-neutral-600">{label}</label>
      {children}
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
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="max-h-[92vh] overflow-y-auto rounded-t-2xl px-4 pt-4 pb-8"
      >
        <ClothingDetailContent
          key={`${item.id}-${item.name}-${item.category}-${item.formality}-${item.sub_category}-${item.image_url}`}
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

'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Camera,
  Columns2,
  Footprints,
  Loader2,
  Shirt,
  Trash2,
  Watch,
  Wind,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { compressImage } from '@/lib/image/compress';
import { WARDROBE_BUCKET } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { CATEGORY_LABELS } from '@/lib/types/clothing';
import type {
  ClothingCategory,
  ClothingItem,
  ClothingItemImage,
} from '@/lib/types/database';
import {
  DESCRIPTION_MAX_LENGTH,
  normalizeSeasonId,
  NOTES_MAX_LENGTH,
  SEASON_OPTIONS,
} from '@/lib/wardrobe/item-edit';
import { getItemImagePaths } from '@/lib/wardrobe/item-images';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<ClothingCategory, typeof Shirt> = {
  top: Shirt,
  bottom: Columns2,
  outerwear: Wind,
  shoes: Footprints,
  accessory: Watch,
};

const EDITABLE_CATEGORIES: ClothingCategory[] = [
  'top',
  'bottom',
  'outerwear',
  'shoes',
  'accessory',
];

interface EditableExtraImage {
  id: string;
  imagePath: string;
  imageUrl: string;
}

interface EditItemFormProps {
  item: ClothingItem;
  imageUrl: string;
  userId: string;
  extraImages?: EditableExtraImage[];
}

export function EditItemForm({
  item,
  imageUrl,
  userId,
  extraImages: initialExtraImages = [],
}: EditItemFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const extraPhotoInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(item.name);
  const [brand, setBrand] = useState(item.brand ?? '');
  const [description, setDescription] = useState(item.description ?? '');
  const [category, setCategory] = useState<ClothingCategory>(item.category);
  const [seasons, setSeasons] = useState<string[]>(
    item.season.map(normalizeSeasonId),
  );
  const [notes, setNotes] = useState(item.notes ?? '');
  const [previewUrl, setPreviewUrl] = useState(imageUrl);
  const [imagePath, setImagePath] = useState(item.image_url);
  const [extraImages, setExtraImages] = useState(initialExtraImages);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [extraPhotoLoading, setExtraPhotoLoading] = useState(false);

  function toggleSeason(seasonId: string) {
    setSeasons((prev) =>
      prev.includes(seasonId)
        ? prev.filter((s) => s !== seasonId)
        : [...prev, seasonId],
    );
  }

  async function handlePhotoChange(file: File) {
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

      setImagePath(storagePath);
      setPreviewUrl(URL.createObjectURL(compressed));
      toast.success('Photo updated');
    } catch {
      toast.error('Failed to update photo');
    } finally {
      setPhotoLoading(false);
    }
  }

  async function handleExtraPhotoAdd(file: File) {
    setExtraPhotoLoading(true);
    try {
      const compressed = await compressImage(file);
      const imageId = crypto.randomUUID();
      const storagePath = `${userId}/${item.id}/${imageId}.webp`;

      const { error: uploadError } = await supabase.storage
        .from(WARDROBE_BUCKET)
        .upload(storagePath, compressed, {
          contentType: 'image/webp',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const sortOrder = extraImages.length + 1;
      const { data: inserted, error: insertError } = await supabase
        .from('clothing_item_images')
        .insert({
          clothing_item_id: item.id,
          image_url: storagePath,
          sort_order: sortOrder,
        })
        .select()
        .single();

      if (insertError || !inserted) throw insertError;

      const row = inserted as ClothingItemImage;
      setExtraImages((prev) => [
        ...prev,
        {
          id: row.id,
          imagePath: storagePath,
          imageUrl: URL.createObjectURL(compressed),
        },
      ]);
      toast.success('Photo added');
    } catch {
      toast.error('Failed to add photo');
    } finally {
      setExtraPhotoLoading(false);
    }
  }

  async function removeExtraPhoto(image: EditableExtraImage) {
    setExtraPhotoLoading(true);
    try {
      await supabase.storage.from(WARDROBE_BUCKET).remove([image.imagePath]);
      const { error } = await supabase
        .from('clothing_item_images')
        .delete()
        .eq('id', image.id);

      if (error) throw error;

      setExtraImages((prev) => prev.filter((row) => row.id !== image.id));
      toast.success('Photo removed');
    } catch {
      toast.error('Failed to remove photo');
    } finally {
      setExtraPhotoLoading(false);
    }
  }

  async function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Enter a name for this item');
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('clothing_items')
      .update({
        name: trimmedName,
        brand: brand.trim() || null,
        description: description.trim() || null,
        category,
        season: seasons,
        notes: notes.trim() || null,
        image_url: imagePath,
      })
      .eq('id', item.id)
      .eq('user_id', userId);

    setSaving(false);

    if (error) {
      toast.error('Failed to save changes');
      return;
    }

    toast.success('Changes saved');
    router.push(`/wardrobe/${item.id}`);
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);

    const imagePaths = await getItemImagePaths(supabase, item.id, imagePath);
    await supabase.storage.from(WARDROBE_BUCKET).remove(imagePaths);

    const { error } = await supabase
      .from('clothing_items')
      .delete()
      .eq('id', item.id)
      .eq('user_id', userId);

    setDeleting(false);

    if (error) {
      toast.error('Failed to delete item');
      return;
    }

    toast.success('Item deleted');
    router.push('/wardrobe');
    router.refresh();
  }

  return (
    <div className="pb-8">
      <div className="mb-5 flex items-center justify-between">
        <Link
          href={`/wardrobe/${item.id}`}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800"
          aria-label="Back to item"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting || saving}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-red-200 bg-white text-red-600 disabled:opacity-50"
          aria-label="Delete item"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="mb-6">
        <h1 className="font-(family-name:--font-auth-serif) text-[1.75rem] leading-tight text-neutral-950">
          Edit item
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Make changes to your item details
        </p>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative w-[42%] shrink-0">
          <div className="relative aspect-3/4 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
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
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handlePhotoChange(file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={photoLoading || saving}
            className="absolute inset-x-2 bottom-2 flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white/95 py-2 text-xs font-medium text-neutral-900 shadow-sm backdrop-blur-sm"
          >
            <Camera className="h-3.5 w-3.5" />
            Change photo
          </button>
          <input
            ref={extraPhotoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleExtraPhotoAdd(file);
              e.target.value = '';
            }}
          />
          {extraImages.length > 0 && (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {extraImages.map((image) => (
                <div
                  key={image.id}
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-neutral-200"
                >
                  <Image
                    src={image.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => void removeExtraPhoto(image)}
                    disabled={extraPhotoLoading || saving}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity hover:opacity-100"
                    aria-label="Remove photo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => extraPhotoInputRef.current?.click()}
            disabled={extraPhotoLoading || saving || photoLoading}
            className="mt-2 w-full rounded-xl border border-dashed border-neutral-300 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
          >
            {extraPhotoLoading ? 'Adding photo…' : 'Add another photo'}
          </button>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <Field label="Item name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Brand">
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Optional"
              className={inputClass}
            />
          </Field>
          <Field label="Category">
            <div className="relative">
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as ClothingCategory)
                }
                className={cn(inputClass, 'appearance-none pr-9')}
              >
                {EDITABLE_CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {CATEGORY_LABELS[value]}
                  </option>
                ))}
              </select>
              <CategoryIcon
                category={category}
                className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral-400"
              />
            </div>
          </Field>
        </div>
      </div>

      <section className="mb-6 rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold text-neutral-950">Details</h2>
        <div className="space-y-4">
          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value.slice(0, DESCRIPTION_MAX_LENGTH))
              }
              rows={2}
              placeholder="Short description for the detail page"
              className={cn(inputClass, 'resize-none py-2.5')}
            />
          </Field>

          <Field label="Season">
            <div className="flex flex-wrap gap-2">
              {SEASON_OPTIONS.map((season) => {
                const isActive = seasons.includes(season.id);
                return (
                  <button
                    key={season.id}
                    type="button"
                    onClick={() => toggleSeason(season.id)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                      isActive
                        ? 'border-neutral-950 bg-neutral-950 text-white'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50',
                    )}
                  >
                    {season.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value.slice(0, NOTES_MAX_LENGTH))
              }
              rows={3}
              placeholder="Anything helpful about this piece"
              className={cn(inputClass, 'resize-none py-2.5')}
            />
            <p className="mt-1 text-right text-xs text-neutral-400">
              {notes.length}/{NOTES_MAX_LENGTH}
            </p>
          </Field>
        </div>
      </section>

      <Button
        size="lg"
        className="h-12 w-full rounded-2xl bg-neutral-950 text-base text-white hover:bg-neutral-800"
        onClick={handleSave}
        disabled={saving || deleting || photoLoading || extraPhotoLoading}
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          'Save changes'
        )}
      </Button>
    </div>
  );
}

const inputClass =
  'h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400';

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

function CategoryIcon({
  category,
  className,
}: {
  category: ClothingCategory;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[category];
  return <Icon className={className} strokeWidth={1.75} />;
}

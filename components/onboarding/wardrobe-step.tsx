'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ImageIcon,
  Loader2,
  Lock,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { compressImage } from '@/lib/image/compress';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { WARDROBE_BUCKET } from '@/lib/constants';
import {
  WARDROBE_CATEGORIES,
  WARDROBE_CATEGORY_FRAMING,
  WARDROBE_TIPS,
  type WardrobeCategoryId,
} from '@/lib/onboarding/constants';
import type { TagClothingResponse } from '@/lib/wardrobe/tagging';

type QueueItem = {
  id: string;
  preview: string;
  status: 'pending' | 'uploading' | 'tagging' | 'done' | 'error';
  name?: string;
  error?: string;
};

function CategoryPreview({
  categoryId,
  imageUrl,
  label,
}: {
  categoryId: WardrobeCategoryId;
  imageUrl: string;
  label: string;
}) {
  const [imageError, setImageError] = useState(false);
  const { scale, translateY } = WARDROBE_CATEGORY_FRAMING[categoryId];

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#f4efe6]">
      {!imageError ? (
        <div className="absolute inset-x-1.5 top-2 bottom-3 flex items-end justify-center">
          <div
            className="relative h-full w-full"
            style={{
              transform: `scale(${scale}) translateY(${translateY}px)`,
              transformOrigin: 'center bottom',
            }}
          >
            <Image
              src={imageUrl}
              alt={label}
              fill
              className="object-contain object-bottom"
              sizes="96px"
              unoptimized
              onError={() => setImageError(true)}
            />
          </div>
        </div>
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-[#8b7355]">
          {label.slice(0, 1)}
        </span>
      )}
    </div>
  );
}

interface WardrobeStepProps {
  userId: string;
}

export function WardrobeStep({ userId }: WardrobeStepProps) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [captureMode, setCaptureMode] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [processing, setProcessing] = useState(false);

  const updateItem = useCallback((id: string, patch: Partial<QueueItem>) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }, []);

  async function processFile(file: File) {
    const itemId = crypto.randomUUID();
    const preview = URL.createObjectURL(file);
    setQueue((prev) => [...prev, { id: itemId, preview, status: 'pending' }]);

    try {
      updateItem(itemId, { status: 'uploading' });
      const compressed = await compressImage(file);
      const storagePath = `${userId}/${itemId}.webp`;

      const { error: uploadError } = await supabase.storage
        .from(WARDROBE_BUCKET)
        .upload(storagePath, compressed, {
          contentType: 'image/webp',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from('clothing_items')
        .insert({
          id: itemId,
          user_id: userId,
          image_url: storagePath,
          name: 'Clothing item',
          category: 'top',
        });

      if (insertError) throw insertError;

      updateItem(itemId, { status: 'tagging' });

      const res = await fetch('/api/clothing/tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Upload failed');
      }

      const tagged = (await res.json()) as TagClothingResponse;
      updateItem(itemId, {
        status: 'done',
        name: tagged.retagged ? tagged.name : 'Clothing item',
      });
    } catch (error) {
      updateItem(itemId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed',
      });
    }
  }

  async function handleFilesSelected(files: File[]) {
    setProcessing(true);
    for (const file of files) {
      await processFile(file);
    }
    setProcessing(false);
    if (files.length > 0) {
      toast.success('Upload complete');
    }
  }

  function openPicker(useCamera: boolean) {
    setCaptureMode(useCamera);
    requestAnimationFrame(() => inputRef.current?.click());
  }

  return (
    <OnboardingShell
      step={2}
      title="Let's build your wardrobe"
      subtitle="Add photos of your clothes so we can create better outfit ideas for you."
      backHref="/onboarding"
      footer={
        <button
          type="button"
          onClick={() => router.push('/onboarding/location')}
          className="h-12 w-full rounded-2xl bg-[#1a1a1a] text-sm font-medium text-white transition-colors hover:bg-[#333]"
        >
          Continue
        </button>
      }
    >
      <div className="rounded-2xl bg-[#f4efe6] p-4">
        <div className="flex items-center gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EFE1D5]">
            <Sparkles className="size-4 text-[#8b7355]" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold text-[#1a1a1a]">
            Tips for best results
          </p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 items-center text-center">
          {WARDROBE_TIPS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-2 border-r border-[#ebe4d8] pr-3 last:border-r-0 last:pr-0 p-2"
            >
              <Icon
                className="size-5 shrink-0 text-[#8b7355]"
                strokeWidth={1.5}
              />
              <p className="text-xs font-semibold text-[#1a1a1a]">{title}</p>
              <p className="text-[11px] leading-snug text-[#6b6560]">{body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border-2 border-dashed border-[#d8d0c4]  px-4 py-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#f4efe6]">
          <Camera className="size-6 text-[#8b7355]" strokeWidth={2} />
        </div>
        <p className="mt-4 font-(family-name:--font-auth-serif) text-xl text-[#1a1a1a] font-semibold tracking-wide">
          Add photos of your clothes
        </p>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[#6b6560]">
          Tap to take photos or choose from your gallery. We&apos;ll
          automatically categorize your items.
        </p>
        <button
          type="button"
          disabled={processing}
          onClick={() => openPicker(true)}
          className="mt-6 inline-flex h-11 px-10 w-fit items-center justify-center gap-2 rounded-sm bg-[#1a1a1a] text-sm font-medium text-white transition-colors hover:bg-[#333] disabled:opacity-50"
        >
          <Camera className="size-5" strokeWidth={1.5} />
          Take Photos
        </button>
        <div className="my-5 flex items-center justify-center gap-3">
          <span className="h-px w-36 bg-[#ebe4d8]" />
          <p className="shrink-0 text-sm text-[#a39e97]">OR</p>
          <span className="h-px w-36 bg-[#ebe4d8]" />
        </div>
        <button
          type="button"
          disabled={processing}
          onClick={() => openPicker(false)}
          className="inline-flex h-11 px-3 w-fit items-center justify-center gap-2 rounded-sm border border-[#e8e2d9] text-sm font-medium text-[#1a1a1a] transition-colors hover:bg-[#faf8f5] disabled:opacity-50"
        >
          <ImageIcon className="size-5" strokeWidth={1.5} />
          Choose from Gallery
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={!captureMode}
          capture={captureMode ? 'environment' : undefined}
          className="hidden"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            if (files.length > 0) void handleFilesSelected(files);
            event.target.value = '';
          }}
        />
      </div>

      {queue.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-[#1a1a1a]">
            {queue.filter((item) => item.status === 'done').length} of{' '}
            {queue.length} items ready
          </p>
          <div className="grid grid-cols-3 gap-2">
            {queue.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-[#ebe4d8] bg-white"
              >
                <div className="relative aspect-square bg-[#f4efe6]">
                  <Image
                    src={item.preview}
                    alt="Upload preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    {item.status === 'uploading' ||
                    item.status === 'tagging' ? (
                      <Loader2 className="size-5 animate-spin text-white" />
                    ) : item.status === 'done' ? (
                      <CheckCircle2 className="size-5 text-white" />
                    ) : item.status === 'error' ? (
                      <AlertCircle className="size-5 text-red-200" />
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <p className="font-(family-name:--font-auth-serif) text-base text-[#1a1a1a] font-semibold tracking-wide">
          What you can add
        </p>
        <div className="mt-3 grid grid-cols-5 justify-items-center gap-3">
          {WARDROBE_CATEGORIES.map(({ id, imageUrl, label }) => (
            <div
              key={id}
              className="flex w-full flex-col items-center text-center"
            >
              <CategoryPreview
                categoryId={id}
                imageUrl={imageUrl}
                label={label}
              />
              <p className="mt-1.5 text-xs font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-3 rounded-2xl bg-[#f4efe6] p-4">
        <div className="flex flex-row items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#efe1d5]">
            <Lock className="size-4 text-[#8b7355]" strokeWidth={1.5} />
          </div>
          <div className="space-y-1 text-xs leading-relaxed text-[#6b6560]">
            <p className="font-semibold text-[#1a1a1a]">Your privacy matters</p>
            <p>
              Your photos are private and only used to personalize your
              experience. We never share your data.
            </p>
          </div>
        </div>
      </div>
    </OnboardingShell>
  );
}

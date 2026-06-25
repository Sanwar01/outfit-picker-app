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
import { WARDROBE_CATEGORIES, WARDROBE_TIPS } from '@/lib/onboarding/constants';
import type { TagClothingResponse } from '@/lib/wardrobe/tagging';
import { CATEGORY_LABELS } from '@/lib/types/clothing';
import type { ClothingCategory } from '@/lib/types/database';

type QueueItem = {
  id: string;
  preview: string;
  status: 'pending' | 'uploading' | 'tagging' | 'done' | 'error';
  name?: string;
  error?: string;
};

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
          <Sparkles className="size-4 text-[#8b7355]" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-[#1a1a1a]">
            Tips for best results
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {WARDROBE_TIPS.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <Icon className="size-4 text-[#8b7355]" strokeWidth={1.5} />
              <p className="mt-1 text-xs font-semibold text-[#1a1a1a]">
                {title}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-[#6b6560]">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border-2 border-dashed border-[#d8d0c4] bg-white px-4 py-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#f4efe6]">
          <Camera className="size-6 text-[#8b7355]" strokeWidth={1.5} />
        </div>
        <p className="mt-4 font-(family-name:--font-auth-serif) text-lg text-[#1a1a1a]">
          Add photos of your clothes
        </p>
        <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-[#6b6560]">
          Tap to take photos or choose from your gallery. We&apos;ll
          automatically categorize your items.
        </p>
        <button
          type="button"
          disabled={processing}
          onClick={() => openPicker(true)}
          className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#1a1a1a] text-sm font-medium text-white transition-colors hover:bg-[#333] disabled:opacity-50"
        >
          <Camera className="size-4" strokeWidth={1.5} />
          Take Photos
        </button>
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#ebe4d8]" />
          </div>
          <p className="relative mx-auto w-fit bg-white px-3 text-xs text-[#a39e97]">
            OR
          </p>
        </div>
        <button
          type="button"
          disabled={processing}
          onClick={() => openPicker(false)}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#e8e2d9] bg-white text-sm font-medium text-[#1a1a1a] transition-colors hover:bg-[#faf8f5] disabled:opacity-50"
        >
          <ImageIcon className="size-4" strokeWidth={1.5} />
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
        <p className="font-(family-name:--font-auth-serif) text-base text-[#1a1a1a]">
          What you can add
        </p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {WARDROBE_CATEGORIES.map(({ id, label }) => (
            <div key={id} className="text-center">
              <div className="mx-auto flex aspect-square items-center justify-center rounded-xl bg-[#f4efe6] text-[10px] font-medium text-[#8b7355]">
                {CATEGORY_LABELS[id as ClothingCategory].slice(0, 1)}
              </div>
              <p className="mt-1 text-[10px] text-[#6b6560]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-3 rounded-2xl bg-[#f4efe6] p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white">
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
    </OnboardingShell>
  );
}

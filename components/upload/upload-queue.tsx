'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { compressImage } from '@/lib/image/compress';
import { UploadDropzone } from '@/components/upload/upload-dropzone';
import { Button } from '@/components/ui/button';
import { WARDROBE_BUCKET } from '@/lib/constants';
import type { TagClothingResponse } from '@/lib/wardrobe/tagging';

type QueueItem = {
  id: string;
  preview: string;
  status: 'pending' | 'uploading' | 'tagging' | 'done' | 'error';
  name?: string;
  error?: string;
};

interface UploadQueueProps {
  userId: string;
}

export function UploadQueue({ userId }: UploadQueueProps) {
  const router = useRouter();
  const supabase = createClient();
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
    toast.success('Upload complete');
  }

  const doneCount = queue.filter((i) => i.status === 'done').length;

  return (
    <div className="space-y-6">
      <UploadDropzone
        onFilesSelected={handleFilesSelected}
        disabled={processing}
      />

      {queue.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">
            {doneCount} of {queue.length} items ready
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {queue.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-border bg-white"
              >
                <div className="relative aspect-3/4 bg-muted">
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
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    ) : item.status === 'done' ? (
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    ) : item.status === 'error' ? (
                      <AlertCircle className="h-6 w-6 text-red-200" />
                    ) : null}
                  </div>
                </div>
                <div className="p-2">
                  <p className="truncate text-xs text-muted-foreground">
                    {item.name ??
                      (item.status === 'tagging'
                        ? 'AI tagging...'
                        : item.status === 'uploading'
                          ? 'Uploading...'
                          : (item.error ?? 'Waiting...'))}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {doneCount > 0 && (
            <Button
              className="w-full rounded-xl"
              onClick={() => {
                router.push('/wardrobe');
                router.refresh();
              }}
            >
              Done — view wardrobe
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

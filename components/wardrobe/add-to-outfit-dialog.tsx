'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { SavedOutfit } from '@/lib/types/outfit';

interface AddToOutfitDialogProps {
  itemId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToOutfitDialog({
  itemId,
  open,
  onOpenChange,
}: AddToOutfitDialogProps) {
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      const res = await fetch('/api/outfits');
      const data = await res.json();
      if (!cancelled) {
        setOutfits(res.ok ? data : []);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  async function addToOutfit(outfitId: string) {
    setAddingId(outfitId);

    const res = await fetch(`/api/outfits/${outfitId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clothing_item_id: itemId }),
    });

    setAddingId(null);

    if (!res.ok) {
      toast.error('Failed to add item to outfit');
      return;
    }

    const data = (await res.json()) as { alreadyIncluded?: boolean };
    toast.success(
      data.alreadyIncluded
        ? 'Item is already in this outfit'
        : 'Added to outfit',
    );
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-hidden rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to outfit</DialogTitle>
          <DialogDescription>
            Choose a saved outfit to include this item.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : outfits.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No saved outfits yet. Save one from Today first.
            </p>
          ) : (
            outfits.map((outfit) => {
              const previewItems = outfit.items.slice(0, 4);
              const isAdding = addingId === outfit.id;

              return (
                <button
                  key={outfit.id}
                  type="button"
                  onClick={() => addToOutfit(outfit.id)}
                  disabled={!!addingId}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-white p-3 text-left transition-colors hover:bg-background disabled:opacity-60"
                >
                  <div className="flex -space-x-2">
                    {previewItems.map((item) => (
                      <div
                        key={item.id}
                        className="relative h-10 w-10 overflow-hidden rounded-lg border-2 border-white bg-muted"
                      >
                        {outfit.imageUrls[item.image_url] && (
                          <Image
                            src={outfit.imageUrls[item.image_url]}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {outfit.name ?? 'Saved outfit'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {outfit.items.length} items
                    </p>
                  </div>
                  {isAdding && (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                  )}
                </button>
              );
            })
          )}
        </div>

        <Button
          variant="outline"
          className="w-full rounded-xl"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
}

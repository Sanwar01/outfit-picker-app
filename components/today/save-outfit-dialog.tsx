'use client';

import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  defaultOutfitName,
  suggestOutfitNames,
} from '@/lib/outfits/suggest-names';
import type { GeneratedOutfit } from '@/lib/types/outfit';

interface SaveOutfitDialogProps {
  outfit: GeneratedOutfit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SaveOutfitForm({
  outfit,
  onClose,
}: {
  outfit: GeneratedOutfit;
  onClose: () => void;
}) {
  const [name, setName] = useState(() =>
    defaultOutfitName(outfit.items, outfit.weather),
  );
  const [saving, setSaving] = useState(false);

  const suggestions = useMemo(
    () => suggestOutfitNames(outfit.items, outfit.weather),
    [outfit],
  );

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Enter a name for this outfit');
      return;
    }

    setSaving(true);

    const res = await fetch('/api/outfits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slots: outfit.slots,
        rationale: outfit.description || outfit.rationale,
        weather: outfit.weather,
        name: trimmed,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      toast.error('Failed to save outfit');
      return;
    }

    toast.success('Outfit saved');
    onClose();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Name your outfit</DialogTitle>
        <DialogDescription>
          Pick a suggestion or write your own — find it later on the Outfits
          tab.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Navy Rainy Day Fit"
          className="h-10 rounded-xl"
          maxLength={60}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void handleSave();
            }
          }}
        />

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Suggestions</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setName(suggestion)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    name === suggestion
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-white text-muted-foreground hover:border-border',
                  )}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="border-0 bg-transparent p-0 sm:justify-end">
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button className="rounded-xl" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
        </Button>
      </DialogFooter>
    </>
  );
}

export function SaveOutfitDialog({
  outfit,
  open,
  onOpenChange,
}: SaveOutfitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        {outfit ? (
          <SaveOutfitForm
            key={outfit.item_ids.join(',')}
            outfit={outfit}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

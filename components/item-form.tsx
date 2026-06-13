'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { addItem, updateItem } from '@/lib/db';
import { compressImage } from '@/lib/image';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { parseTagList, validateDraft, type ItemDraft } from '@/lib/item-form';
import { CLOTHING_TYPES, SLOT_CONFIG, type Item } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ItemForm({
  trigger,
  existing,
}: {
  trigger: React.ReactElement;
  existing?: Item;
}) {
  const uid = useAuthStore((s) => s.user!.uid);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [draft, setDraft] = useState<ItemDraft>({
    type: existing?.type ?? 'ao',
    name: existing?.name ?? '',
    colors: existing?.colors ?? [],
    styleTags: existing?.styleTags ?? [],
    formality: existing?.formality ?? 3,
    size: existing?.size,
    occasions: existing?.occasions,
  });

  async function handleSave() {
    setError(null);
    const problems = validateDraft(draft);
    if (problems.length) {
      setError(`Please fix: ${problems.join(', ')}`);
      return;
    }
    if (!existing && !file) {
      setError('Please choose an image.');
      return;
    }
    setBusy(true);
    try {
      let image = { imageUrl: existing?.imageUrl, imagePublicId: existing?.imagePublicId };
      if (file) {
        const compressed = await compressImage(file);
        const up = await uploadToCloudinary(compressed);
        image = { imageUrl: up.secureUrl, imagePublicId: up.publicId };
      }
      const payload = { ...draft, imageUrl: image.imageUrl!, imagePublicId: image.imagePublicId! };
      if (existing) await updateItem(uid, existing.id, payload);
      else await addItem(uid, payload);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? 'Edit item' : 'Add item'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              className="h-9 rounded-md border px-2 text-sm bg-background text-foreground"
              value={draft.type}
              onChange={(e) =>
                setDraft({ ...draft, type: e.target.value as ItemDraft['type'] })
              }
            >
              {CLOTHING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {SLOT_CONFIG[t].label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="colors">Colors (comma-separated)</Label>
            <Input
              id="colors"
              defaultValue={draft.colors.join(', ')}
              onChange={(e) =>
                setDraft({ ...draft, colors: parseTagList(e.target.value) })
              }
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="style">Style tags (comma-separated)</Label>
            <Input
              id="style"
              defaultValue={draft.styleTags.join(', ')}
              onChange={(e) =>
                setDraft({ ...draft, styleTags: parseTagList(e.target.value) })
              }
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="formality">Formality (1–5)</Label>
            <Input
              id="formality"
              type="number"
              min={1}
              max={5}
              value={draft.formality}
              onChange={(e) =>
                setDraft({ ...draft, formality: Number(e.target.value) })
              }
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="occasions">Occasions (optional, comma-separated)</Label>
            <Input
              id="occasions"
              defaultValue={(draft.occasions ?? []).join(', ')}
              onChange={(e) =>
                setDraft({ ...draft, occasions: parseTagList(e.target.value) })
              }
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button onClick={handleSave} disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

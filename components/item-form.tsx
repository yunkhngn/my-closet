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
      setError(`Vui lòng điền đúng: ${problems.join(', ')}`);
      return;
    }
    if (!existing && !file) {
      setError('Vui lòng chọn một hình ảnh.');
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
      setError(e instanceof Error ? e.message : 'Lưu thất bại');
    } finally {
      setBusy(false);
    }
  }

  const fieldClass = 'h-8 text-[13px]';
  const selectClass =
    'h-8 w-full rounded-md border border-input bg-background px-2.5 text-[13px] text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[14px]">
            {existing ? 'Chỉnh sửa đồ' : 'Thêm đồ mới'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3.5 py-1">
          <div className="grid gap-1.5">
            <Label htmlFor="type" className="text-[12px] text-muted-foreground">Loại</Label>
            <select
              id="type"
              className={selectClass}
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
            <Label htmlFor="name" className="text-[12px] text-muted-foreground">Tên</Label>
            <Input
              id="name"
              className={fieldClass}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="vd: Áo sơ mi trắng Oxford"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="colors" className="text-[12px] text-muted-foreground">
                Màu sắc
              </Label>
              <Input
                id="colors"
                className={fieldClass}
                defaultValue={draft.colors.join(', ')}
                placeholder="trắng, xanh…"
                onChange={(e) =>
                  setDraft({ ...draft, colors: parseTagList(e.target.value) })
                }
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="formality" className="text-[12px] text-muted-foreground">
                Trang trọng (1–5)
              </Label>
              <Input
                id="formality"
                className={fieldClass}
                type="number"
                min={1}
                max={5}
                value={draft.formality}
                onChange={(e) =>
                  setDraft({ ...draft, formality: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="style" className="text-[12px] text-muted-foreground">
              Thẻ phong cách
            </Label>
            <Input
              id="style"
              className={fieldClass}
              defaultValue={draft.styleTags.join(', ')}
              placeholder="casual, minimalist, streetwear…"
              onChange={(e) =>
                setDraft({ ...draft, styleTags: parseTagList(e.target.value) })
              }
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="occasions" className="text-[12px] text-muted-foreground">
              Dịp <span className="font-normal text-muted-foreground/60">(tùy chọn)</span>
            </Label>
            <Input
              id="occasions"
              className={fieldClass}
              defaultValue={(draft.occasions ?? []).join(', ')}
              placeholder="đi làm, đi chơi, hẹn hò…"
              onChange={(e) =>
                setDraft({ ...draft, occasions: parseTagList(e.target.value) })
              }
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="image" className="text-[12px] text-muted-foreground">
              Hình ảnh {existing && <span className="font-normal text-muted-foreground/60">(để trống = giữ nguyên)</span>}
            </Label>
            <Input
              id="image"
              className={fieldClass}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {error && (
            <p className="rounded-md bg-destructive/8 px-3 py-2 text-[12px] text-destructive">
              {error}
            </p>
          )}

          <Button onClick={handleSave} disabled={busy} className="mt-1 h-8 text-[13px]">
            {busy ? 'Đang lưu…' : 'Lưu'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

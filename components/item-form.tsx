'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useItemsStore } from '@/store/items';
import { addItem, updateItem } from '@/lib/db';
import { compressImage, removeBg } from '@/lib/image';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { parseTagList, validateDraft, type ItemDraft } from '@/lib/item-form';
import { CLOTHING_TYPES, SLOT_CONFIG, type Item } from '@/types';
import Image from 'next/image';
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
import { cn } from '@/lib/utils';

const STYLE_TAG_VI: Record<string, string> = {
  'casual': 'Thường ngày',
  'minimalist': 'Tối giản',
  'streetwear': 'Đường phố',
  'formal': 'Lịch sự',
  'smart casual': 'Thanh lịch nhẹ',
  'vintage': 'Vintage',
  'athleisure': 'Thể thao năng động',
  'elegant': 'Thanh lịch',
  'business': 'Công sở',
  'boho': 'Bohemian',
  'edgy': 'Cá tính',
  'preppy': 'Học đường',
  'classic': 'Cổ điển',
  'chic': 'Sành điệu',
  'relaxed': 'Thoải mái',
  'trendy': 'Thời thượng',
  'sporty': 'Thể thao',
  'workwear': 'Đi làm',
  'resort': 'Nghỉ dưỡng',
  'monochrome': 'Đơn sắc',
  'layered': 'Layering',
  'oversized': 'Rộng rãi',
  'fitted': 'Ôm body',
};

const STYLE_SUGGESTIONS = Object.keys(STYLE_TAG_VI);

function tagLabel(key: string): string {
  return STYLE_TAG_VI[key] ?? key;
}

function StyleTagPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const items = useItemsStore((s) => s.items);
  const closetTags = Array.from(new Set(items.flatMap((i) => i.styleTags)));
  const allSuggestions = Array.from(new Set([...STYLE_SUGGESTIONS, ...closetTags])).sort();
  const filtered = allSuggestions.filter(
    (s) =>
      !query ||
      tagLabel(s).toLowerCase().includes(query.toLowerCase()) ||
      s.toLowerCase().includes(query.toLowerCase()),
  );
  const isCustomQuery =
    query.trim().length > 0 &&
    !allSuggestions.some(
      (s) =>
        tagLabel(s).toLowerCase() === query.trim().toLowerCase() ||
        s.toLowerCase() === query.trim().toLowerCase(),
    );

  const toggle = (tag: string) => {
    onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]);
  };

  const addCustom = () => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setQuery('');
  };

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          'flex min-h-9 w-full cursor-text flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 transition-colors',
          open && 'border-ring ring-1 ring-ring',
        )}
        onClick={() => setOpen(true)}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
          >
            {tagLabel(tag)}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => { e.stopPropagation(); toggle(tag); }}
              className="leading-none opacity-50 transition-opacity hover:opacity-100"
              aria-label={`Xóa ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); if (isCustomQuery) addCustom(); }
            if (e.key === 'Escape') setOpen(false);
            if (e.key === 'Backspace' && !query && value.length > 0) {
              onChange(value.slice(0, -1));
            }
          }}
          className="min-w-[80px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder={value.length === 0 ? 'Tìm hoặc nhập phong cách…' : ''}
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-lg border border-border bg-popover p-3 shadow-lg">
          <div className="flex flex-wrap gap-1.5">
            {filtered.map((tag) => {
              const sel = value.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggle(tag)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-sm transition-colors duration-150',
                    sel
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/70',
                  )}
                >
                  {tagLabel(tag)}
                </button>
              );
            })}
            {isCustomQuery && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={addCustom}
                className="rounded-md border border-dashed border-border px-2.5 py-1 text-sm text-muted-foreground hover:bg-secondary"
              >
                + Thêm &ldquo;{query.trim()}&rdquo;
              </button>
            )}
            {filtered.length === 0 && !isCustomQuery && (
              <p className="text-xs text-muted-foreground">Nhập và nhấn Enter để thêm.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [busyMsg, setBusyMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

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
        setBusyMsg('Đang xóa nền ảnh…');
        const noBg = await removeBg(file);
        setBusyMsg('Đang tối ưu ảnh…');
        const compressed = await compressImage(noBg);
        setBusyMsg('Đang tải lên…');
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
      setBusyMsg('');
    }
  }

  const fieldClass = 'h-9 text-sm';
  const selectClass =
    'h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {existing ? 'Chỉnh sửa đồ' : 'Thêm đồ mới'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3.5 py-1">
          <div className="grid gap-1.5">
            <Label htmlFor="type" className="text-xs text-muted-foreground">Loại</Label>
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
            <Label htmlFor="name" className="text-xs text-muted-foreground">Tên</Label>
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
              <Label htmlFor="colors" className="text-xs text-muted-foreground">Màu sắc</Label>
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
              <Label htmlFor="formality" className="text-xs text-muted-foreground">
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
            <Label className="text-xs text-muted-foreground">Thẻ phong cách</Label>
            <StyleTagPicker
              value={draft.styleTags}
              onChange={(tags) => setDraft({ ...draft, styleTags: tags })}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="occasions" className="text-xs text-muted-foreground">
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
            <Label htmlFor="image" className="text-xs text-muted-foreground">
              Hình ảnh{' '}
              {existing && (
                <span className="font-normal text-muted-foreground/60">(để trống = giữ nguyên)</span>
              )}
            </Label>
            <Input
              id="image"
              className={fieldClass}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
                if (f) {
                  const url = URL.createObjectURL(f);
                  setPreview(url);
                } else {
                  setPreview(null);
                }
              }}
            />
            {(preview || existing?.imageUrl) && (
              <div className="relative mt-1 aspect-[3/4] w-24 overflow-hidden rounded-md border border-border/60 bg-muted">
                <Image
                  src={preview ?? existing!.imageUrl}
                  alt="Xem trước"
                  fill
                  className="object-cover"
                  sizes="96px"
                />
                {preview && (
                  <div className="absolute bottom-1 right-1 rounded bg-background/80 px-1 py-0.5 text-[10px] text-muted-foreground backdrop-blur-sm">
                    nền sẽ được xóa
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-md bg-destructive/8 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <Button onClick={handleSave} disabled={busy} className="mt-1 h-9 text-sm">
            {busy ? busyMsg || 'Đang lưu…' : 'Lưu'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

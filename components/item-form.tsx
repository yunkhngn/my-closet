'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useItemsStore } from '@/store/items';
import { addItem, updateItem } from '@/lib/db';
import { compressImage, removeBg } from '@/lib/image';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { parseTagList, validateDraft, type ItemDraft } from '@/lib/item-form';
import { CLOTHING_TYPES, SLOT_CONFIG, type Item, type ClothingType } from '@/types';
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
import { STYLE_SUGGESTIONS, tagLabel } from '@/lib/style-tags';

// ─── StyleTagPicker ───────────────────────────────────────────────────────────

function StyleTagPicker({ value, onChange }: { value: string[]; onChange: (t: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const allItems = useItemsStore((s) => s.items);
  const closetTags = Array.from(new Set(allItems.flatMap((i) => i.styleTags)));
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

  const toggle = (tag: string) =>
    onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]);

  const addCustom = () => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setQuery('');
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
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
          <span key={tag} className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            {tagLabel(tag)}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => { e.stopPropagation(); toggle(tag); }}
              className="leading-none opacity-50 transition-opacity hover:opacity-100"
            >×</button>
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
            if (e.key === 'Backspace' && !query && value.length > 0) onChange(value.slice(0, -1));
          }}
          className="min-w-[80px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder={value.length === 0 ? 'Tìm hoặc nhập phong cách…' : ''}
        />
      </div>
      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-lg border border-border bg-popover p-3 shadow-lg">
          <div className="flex flex-wrap gap-1.5">
            {filtered.map((tag) => (
              <button
                key={tag}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggle(tag)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-sm transition-colors duration-150',
                  value.includes(tag)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/70',
                )}
              >{tagLabel(tag)}</button>
            ))}
            {isCustomQuery && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={addCustom}
                className="rounded-md border border-dashed border-border px-2.5 py-1 text-sm text-muted-foreground hover:bg-secondary"
              >+ Thêm &ldquo;{query.trim()}&rdquo;</button>
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

// ─── Bulk upload ──────────────────────────────────────────────────────────────

type BulkStatus = 'pending' | 'processing' | 'done' | 'error';

type BulkDraft = {
  id: string;
  file: File;
  preview: string;
  name: string;
  type: ClothingType;
  status: BulkStatus;
  error?: string;
};

function cleanFilename(name: string): string {
  return name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
}

function BulkUpload({ uid }: { uid: string }) {
  const [rows, setRows] = useState<BulkDraft[]>([]);
  const [running, setRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectClass =
    'h-8 w-full rounded border border-input bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

  function addFiles(files: FileList | null) {
    if (!files) return;
    const newRows: BulkDraft[] = Array.from(files).map((f) => ({
      id: `${f.name}-${f.size}-${Math.random()}`,
      file: f,
      preview: URL.createObjectURL(f),
      name: cleanFilename(f.name),
      type: 'ao' as ClothingType,
      status: 'pending',
    }));
    setRows((prev) => [...prev, ...newRows]);
  }

  function removeRow(id: string) {
    setRows((prev) => {
      const row = prev.find((r) => r.id === id);
      if (row) URL.revokeObjectURL(row.preview);
      return prev.filter((r) => r.id !== id);
    });
  }

  function updateRow(id: string, patch: Partial<BulkDraft>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function saveAll() {
    const pending = rows.filter((r) => r.status === 'pending');
    if (!pending.length) return;
    setRunning(true);
    for (const row of pending) {
      updateRow(row.id, { status: 'processing' });
      try {
        const noBg = await removeBg(row.file);
        const compressed = await compressImage(noBg);
        const up = await uploadToCloudinary(compressed);
        await addItem(uid, {
          type: row.type,
          name: row.name,
          colors: [],
          styleTags: [],
          formality: 3,
          imageUrl: up.secureUrl,
          imagePublicId: up.publicId,
        });
        updateRow(row.id, { status: 'done' });
      } catch (e) {
        updateRow(row.id, { status: 'error', error: e instanceof Error ? e.message : 'Lỗi' });
      }
    }
    setRunning(false);
  }

  const pending = rows.filter((r) => r.status === 'pending').length;
  const done = rows.filter((r) => r.status === 'done').length;

  return (
    <div className="space-y-4">
      {/* Drop zone / file picker */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 py-8 text-sm text-muted-foreground transition-colors hover:border-border/80 hover:bg-muted/60"
      >
        <span className="text-2xl">↑</span>
        <span className="font-medium">Chọn nhiều ảnh</span>
        <span className="text-xs">PNG, JPG, WEBP</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {/* Row list */}
      {rows.length > 0 && (
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-2">
              {/* Preview */}
              <div className="relative aspect-[3/4] w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image src={row.preview} alt={row.name} fill sizes="48px" className="object-cover" />
              </div>

              {/* Name + type */}
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Input
                  value={row.name}
                  onChange={(e) => updateRow(row.id, { name: e.target.value })}
                  disabled={row.status !== 'pending'}
                  className="h-8 text-sm"
                  placeholder="Tên đồ"
                />
                <select
                  value={row.type}
                  onChange={(e) => updateRow(row.id, { type: e.target.value as ClothingType })}
                  disabled={row.status !== 'pending'}
                  className={selectClass}
                >
                  {CLOTHING_TYPES.map((t) => (
                    <option key={t} value={t}>{SLOT_CONFIG[t].label}</option>
                  ))}
                </select>
              </div>

              {/* Status / remove */}
              <div className="flex w-8 shrink-0 items-center justify-center">
                {row.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="text-muted-foreground/60 hover:text-foreground transition-colors"
                    aria-label="Xóa"
                  >×</button>
                )}
                {row.status === 'processing' && (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-foreground" />
                )}
                {row.status === 'done' && (
                  <span className="text-emerald-600 font-bold">✓</span>
                )}
                {row.status === 'error' && (
                  <span className="text-destructive font-bold" title={row.error}>✕</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary + save */}
      {rows.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {running
              ? `Đang xử lý…`
              : done > 0
              ? `${done}/${rows.length} đã lưu`
              : `${rows.length} ảnh`}
          </span>
          <Button
            onClick={saveAll}
            disabled={running || pending === 0}
            size="sm"
            className="h-8 text-sm"
          >
            {running ? 'Đang lưu…' : `Lưu ${pending > 0 ? pending : ''} đồ`}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Single upload form ───────────────────────────────────────────────────────

function SingleForm({
  uid,
  existing,
  onDone,
}: {
  uid: string;
  existing?: Item;
  onDone: () => void;
}) {
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

  const fieldClass = 'h-9 text-sm';
  const selectClass =
    'h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

  async function handleSave() {
    setError(null);
    const problems = validateDraft(draft);
    if (problems.length) { setError(`Vui lòng điền đúng: ${problems.join(', ')}`); return; }
    if (!existing && !file) { setError('Vui lòng chọn một hình ảnh.'); return; }
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
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lưu thất bại');
    } finally {
      setBusy(false);
      setBusyMsg('');
    }
  }

  return (
    <div className="grid gap-3.5 py-1">
      <div className="grid gap-1.5">
        <Label htmlFor="type" className="text-xs text-muted-foreground">Loại</Label>
        <select
          id="type"
          className={selectClass}
          value={draft.type}
          onChange={(e) => setDraft({ ...draft, type: e.target.value as ItemDraft['type'] })}
        >
          {CLOTHING_TYPES.map((t) => (
            <option key={t} value={t}>{SLOT_CONFIG[t].label}</option>
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
            onChange={(e) => setDraft({ ...draft, colors: parseTagList(e.target.value) })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="formality" className="text-xs text-muted-foreground">Trang trọng (1–5)</Label>
          <Input
            id="formality"
            className={fieldClass}
            type="number"
            min={1}
            max={5}
            value={draft.formality}
            onChange={(e) => setDraft({ ...draft, formality: Number(e.target.value) })}
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
          onChange={(e) => setDraft({ ...draft, occasions: parseTagList(e.target.value) })}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="image" className="text-xs text-muted-foreground">
          Hình ảnh{' '}
          {existing && <span className="font-normal text-muted-foreground/60">(để trống = giữ nguyên)</span>}
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
            setPreview(f ? URL.createObjectURL(f) : null);
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
        <p className="rounded-md bg-destructive/8 px-3 py-2 text-xs text-destructive">{error}</p>
      )}

      <Button onClick={handleSave} disabled={busy} className="mt-1 h-9 text-sm">
        {busy ? busyMsg || 'Đang lưu…' : 'Lưu'}
      </Button>
    </div>
  );
}

// ─── ItemForm (shell with tabs) ───────────────────────────────────────────────

export function ItemForm({ trigger, existing }: { trigger: React.ReactElement; existing?: Item }) {
  const uid = useAuthStore((s) => s.user!.uid);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'single' | 'bulk'>('single');

  const isSingleOnly = !!existing;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {existing ? 'Chỉnh sửa đồ' : 'Thêm đồ'}
          </DialogTitle>
        </DialogHeader>

        {/* Tab switcher — only shown when not editing an existing item */}
        {!isSingleOnly && (
          <div className="flex rounded-lg bg-muted p-1 text-sm">
            <button
              type="button"
              onClick={() => setTab('single')}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 font-medium transition-colors duration-150',
                tab === 'single'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Một đồ
            </button>
            <button
              type="button"
              onClick={() => setTab('bulk')}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 font-medium transition-colors duration-150',
                tab === 'bulk'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Nhiều đồ
            </button>
          </div>
        )}

        {tab === 'single' || isSingleOnly ? (
          <SingleForm uid={uid} existing={existing} onDone={() => setOpen(false)} />
        ) : (
          <BulkUpload uid={uid} />
        )}
      </DialogContent>
    </Dialog>
  );
}

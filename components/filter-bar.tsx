'use client';

import { useItemsStore } from '@/store/items';
import { deriveFilterOptions, type Filter } from '@/lib/filter';
import { Button } from '@/components/ui/button';

export function FilterBar({
  filter,
  onChange,
}: {
  filter: Filter;
  onChange: (f: Filter) => void;
}) {
  const items = useItemsStore((s) => s.items);
  const { occasions, styleTags } = deriveFilterOptions(items);

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-xl border p-4 bg-card shadow-sm">
      <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Dịp
        <select
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={filter.occasion ?? ''}
          onChange={(e) => onChange({ ...filter, occasion: e.target.value || undefined })}
        >
          <option value="">Tất cả</option>
          {occasions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Phong cách
        <select
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={filter.styleTag ?? ''}
          onChange={(e) => onChange({ ...filter, styleTag: e.target.value || undefined })}
        >
          <option value="">Tất cả</option>
          {styleTags.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Mức trang trọng tối đa
        <select
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={filter.maxFormality ?? ''}
          onChange={(e) =>
            onChange({ ...filter, maxFormality: e.target.value ? Number(e.target.value) : undefined })
          }
        >
          <option value="">Tất cả</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>≤ {n}</option>
          ))}
        </select>
      </label>

      <Button variant="ghost" size="sm" className="h-9 px-3 text-xs" onClick={() => onChange({})}>
        Đặt lại
      </Button>
    </div>
  );
}

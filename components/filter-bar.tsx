'use client';

import { useItemsStore } from '@/store/items';
import { deriveFilterOptions, type Filter } from '@/lib/filter';
import { Button } from '@/components/ui/button';
import { tagLabel, STYLE_SUGGESTIONS } from '@/lib/style-tags';

const selectClass =
  'h-8 rounded border border-border/70 bg-card px-3 text-sm text-foreground shadow-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:border-border';

export function FilterBar({
  filter,
  onChange,
}: {
  filter: Filter;
  onChange: (f: Filter) => void;
}) {
  const items = useItemsStore((s) => s.items);
  const { occasions, styleTags: rawStyleTags } = deriveFilterOptions(items);
  const styleTags = rawStyleTags.filter((s) => STYLE_SUGGESTIONS.includes(s));
  const hasFilter = filter.occasion || filter.styleTag || filter.maxFormality;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-card px-4 py-3">
      <span className="text-xs font-semibold uppercase tracking-[0.07em] text-muted-foreground/70 shrink-0">
        Lọc
      </span>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        Dịp
        <select
          className={selectClass}
          value={filter.occasion ?? ''}
          onChange={(e) => onChange({ ...filter, occasion: e.target.value || undefined })}
        >
          <option value="">Tất cả</option>
          {occasions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        Phong cách
        <select
          className={selectClass}
          value={filter.styleTag ?? ''}
          onChange={(e) => onChange({ ...filter, styleTag: e.target.value || undefined })}
        >
          <option value="">Tất cả</option>
          {styleTags.map((s) => (
            <option key={s} value={s}>{tagLabel(s)}</option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        Trang trọng
        <select
          className={selectClass}
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

      {hasFilter && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-sm text-muted-foreground/70 hover:text-foreground ml-auto"
          onClick={() => onChange({})}
        >
          Đặt lại
        </Button>
      )}
    </div>
  );
}

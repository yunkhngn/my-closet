'use client';

import { useState, useMemo } from 'react';
import { useItemsStore } from '@/store/items';
import { CLOTHING_TYPES, SLOT_CONFIG, ClothingType, Item } from '@/types';
import { ItemCard } from '@/components/item-card';
import { ItemForm } from '@/components/item-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { deriveFilterOptions } from '@/lib/filter';
import { tagLabel } from '@/lib/style-tags';
import { Search, X, ChevronDown } from 'lucide-react';

export function ClosetGrid() {
  const { loading, items } = useItemsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [selectedFormality, setSelectedFormality] = useState<string>('all');

  const filterOptions = useMemo(() => {
    return deriveFilterOptions(items || []);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter((item) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesColor = item.colors.some((c) => c.toLowerCase().includes(q));
        const matchesTag = item.styleTags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesColor && !matchesTag) return false;
      }
      if (selectedOccasion !== 'all' && !item.occasions?.includes(selectedOccasion)) {
        return false;
      }
      if (selectedStyle !== 'all' && !item.styleTags.includes(selectedStyle)) {
        return false;
      }
      if (selectedFormality !== 'all') {
        const val = parseInt(selectedFormality, 10);
        if (item.formality < val) return false;
      }
      return true;
    });
  }, [items, searchQuery, selectedOccasion, selectedStyle, selectedFormality]);

  const groups = useMemo(() => {
    const res = Object.fromEntries(
      CLOTHING_TYPES.map((t) => [t, [] as Item[]]),
    ) as Record<ClothingType, Item[]>;
    for (const item of filteredItems) {
      res[item.type].push(item);
    }
    return res;
  }, [filteredItems]);

  if (loading) {
    return (
      <div className="mt-20 flex items-center gap-3 text-sm text-muted-foreground">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
        Đang tải tủ đồ…
      </div>
    );
  }

  const hasAny = items && items.length > 0;
  if (!hasAny) {
    return (
      <div className="anim-section mt-20 flex flex-col items-center gap-5 text-center">
        <p className="text-[15px] text-muted-foreground">
          Tủ đồ của bạn đang trống.
        </p>
        <ItemForm
          trigger={
            <Button variant="outline">
              + Thêm món đồ đầu tiên
            </Button>
          }
        />
      </div>
    );
  }

  const hasFilteredResults = filteredItems.length > 0;

  return (
    <div className="space-y-10">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/40" />
          <Input
            placeholder="Tìm kiếm tủ đồ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-[13px] rounded-full bg-background/40 border-border/80 focus-visible:ring-1 focus-visible:ring-muted-foreground/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-muted-foreground/40 hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Occasion Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] text-muted-foreground/80 font-medium">Dịp:</span>
            <div className="relative">
              <select
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value)}
                className="h-9 rounded-full border border-border/80 bg-background/40 pl-3.5 pr-8 py-1 text-[13px] hover:bg-background/80 focus:outline-none focus:ring-1 focus:ring-muted-foreground/20 cursor-pointer appearance-none text-foreground font-medium"
              >
                <option value="all">Tất cả</option>
                {filterOptions.occasions.map((occ) => (
                  <option key={occ} value={occ}>
                    {tagLabel(occ)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-3 h-3 w-3 pointer-events-none text-muted-foreground/50" />
            </div>
          </div>

          {/* Style Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] text-muted-foreground/80 font-medium">Phong cách:</span>
            <div className="relative">
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="h-9 rounded-full border border-border/80 bg-background/40 pl-3.5 pr-8 py-1 text-[13px] hover:bg-background/80 focus:outline-none focus:ring-1 focus:ring-muted-foreground/20 cursor-pointer appearance-none text-foreground font-medium"
              >
                <option value="all">Tất cả</option>
                {filterOptions.styleTags.map((style) => (
                  <option key={style} value={style}>
                    {tagLabel(style)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-3 h-3 w-3 pointer-events-none text-muted-foreground/50" />
            </div>
          </div>

          {/* Formality Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] text-muted-foreground/80 font-medium">Độ trang trọng:</span>
            <div className="relative">
              <select
                value={selectedFormality}
                onChange={(e) => setSelectedFormality(e.target.value)}
                className="h-9 rounded-full border border-border/80 bg-background/40 pl-3.5 pr-8 py-1 text-[13px] hover:bg-background/80 focus:outline-none focus:ring-1 focus:ring-muted-foreground/20 cursor-pointer appearance-none text-foreground font-medium"
              >
                <option value="all">Mọi độ</option>
                <option value="1">≥ 1 (Rất giản dị)</option>
                <option value="2">≥ 2 (Giản dị)</option>
                <option value="3">≥ 3 (Thường ngày)</option>
                <option value="4">≥ 4 (Lịch sự)</option>
                <option value="5">≥ 5 (Trang trọng)</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-3 h-3 w-3 pointer-events-none text-muted-foreground/50" />
            </div>
          </div>

          {(searchQuery || selectedOccasion !== 'all' || selectedStyle !== 'all' || selectedFormality !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedOccasion('all');
                setSelectedStyle('all');
                setSelectedFormality('all');
              }}
              className="h-9 px-3 text-[12px] text-muted-foreground/80 hover:text-foreground rounded-full hover:bg-background/40 transition-colors"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {!hasFilteredResults ? (
        <div className="py-20 text-center text-muted-foreground text-[14px] anim-section">
          Không tìm thấy trang phục phù hợp với tiêu chí của bạn.
        </div>
      ) : (
        <div className="space-y-16">
          {CLOTHING_TYPES.map((type, sectionIdx) =>
            groups[type].length === 0 ? null : (
              <section
                key={type}
                className="anim-section"
                style={{ '--s': sectionIdx } as React.CSSProperties}
              >
                <div className="mb-6 flex items-baseline gap-3">
                  <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {SLOT_CONFIG[type].label}
                  </h2>
                  <span className="text-[13px] tabular-nums text-muted-foreground/50">
                    {groups[type].length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {groups[type].map((item, i) => (
                    <div
                      key={item.id}
                      className="anim-card"
                      style={{ '--i': i } as React.CSSProperties}
                    >
                      <ItemCard item={item} />
                    </div>
                  ))}
                </div>
              </section>
            ),
          )}
        </div>
      )}
    </div>
  );
}

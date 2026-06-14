'use client';

import { useItemsStore } from '@/store/items';
import { CLOTHING_TYPES, SLOT_CONFIG } from '@/types';
import { ItemCard } from '@/components/item-card';
import { ItemForm } from '@/components/item-form';
import { Button } from '@/components/ui/button';

export function ClosetGrid() {
  const { loading, byType } = useItemsStore();
  const groups = byType();

  if (loading) {
    return (
      <div className="mt-20 flex items-center gap-3 text-sm text-muted-foreground">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
        Đang tải tủ đồ…
      </div>
    );
  }

  const hasAny = CLOTHING_TYPES.some((t) => groups[t].length > 0);
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

  return (
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
  );
}

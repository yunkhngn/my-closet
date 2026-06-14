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
      <div className="mt-16 flex items-center gap-2 text-[13px] text-muted-foreground">
        <span className="inline-block h-3 w-3 animate-spin rounded-full border border-muted-foreground/30 border-t-muted-foreground" />
        Đang tải tủ đồ…
      </div>
    );
  }

  const hasAny = CLOTHING_TYPES.some((t) => groups[t].length > 0);
  if (!hasAny) {
    return (
      <div className="mt-16 flex flex-col items-center gap-4 text-center">
        <p className="text-[13px] text-muted-foreground">
          Tủ đồ của bạn đang trống.
        </p>
        <ItemForm
          trigger={
            <Button variant="outline" size="sm">
              + Thêm món đồ đầu tiên
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {CLOTHING_TYPES.map((type) =>
        groups[type].length === 0 ? null : (
          <section key={type}>
            <div className="mb-5 flex items-baseline gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {SLOT_CONFIG[type].label}
              </h2>
              <span className="text-xs tabular-nums text-muted-foreground/50">
                {groups[type].length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {groups[type].map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ),
      )}
    </div>
  );
}

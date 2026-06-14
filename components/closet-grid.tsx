'use client';

import { useItemsStore } from '@/store/items';
import { CLOTHING_TYPES, SLOT_CONFIG } from '@/types';
import { ItemCard } from '@/components/item-card';

export function ClosetGrid() {
  const { loading, byType } = useItemsStore();
  const groups = byType();

  if (loading) {
    return <p className="mt-8 text-sm text-muted-foreground">Đang tải tủ đồ…</p>;
  }

  const hasAny = CLOTHING_TYPES.some((t) => groups[t].length > 0);
  if (!hasAny) {
    return (
      <p className="mt-8 text-sm text-muted-foreground">
        Tủ đồ của bạn trống. Thêm món đồ đầu tiên.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-10">
      {CLOTHING_TYPES.map((type) =>
        groups[type].length === 0 ? null : (
          <section key={type}>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {SLOT_CONFIG[type].label}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
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

'use client';

import Image from 'next/image';
import { useItemsStore } from '@/store/items';
import { CLOTHING_TYPES, SLOT_CONFIG, type OutfitItemRef } from '@/types';

export function OutfitCard({
  refs,
  reason,
  footer,
}: {
  refs: OutfitItemRef[];
  reason?: string;
  footer?: React.ReactNode;
}) {
  const items = useItemsStore((s) => s.items);
  const byId = new Map(items.map((i) => [i.id, i]));

  // Render in canonical slot order: Outerwear · Top · Bottom · Shoes · Accessory
  const ordered = CLOTHING_TYPES.flatMap((slot) =>
    refs.filter((r) => r.slot === slot),
  );

  return (
    <div className="rounded-lg border p-3 bg-card text-card-foreground">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {ordered.map((ref) => {
          const item = byId.get(ref.itemId);
          return (
            <div key={`${ref.slot}-${ref.itemId}`} className="w-20 shrink-0">
              <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                {item?.imageUrl && (
                  <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
                )}
              </div>
              <p className="mt-1 truncate text-[11px] text-muted-foreground text-center">
                {SLOT_CONFIG[ref.slot].label}
              </p>
            </div>
          );
        })}
      </div>
      {reason && <p className="mt-2 text-xs text-muted-foreground">{reason}</p>}
      {footer && <div className="mt-3 flex gap-2">{footer}</div>}
    </div>
  );
}

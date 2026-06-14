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

  const ordered = CLOTHING_TYPES.flatMap((slot) =>
    refs.filter((r) => r.slot === slot),
  );

  return (
    <div className="rounded-lg border border-border/60 bg-card p-3">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {ordered.map((ref) => {
          const item = byId.get(ref.itemId);
          return (
            <div key={`${ref.slot}-${ref.itemId}`} className="w-[88px] shrink-0">
              <div className="relative aspect-[3/4] overflow-hidden rounded bg-muted">
                {item?.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="88px"
                    className="object-cover"
                  />
                )}
              </div>
              <p className="mt-1 truncate text-center text-[11px] text-muted-foreground/70">
                {SLOT_CONFIG[ref.slot].label}
              </p>
            </div>
          );
        })}
      </div>

      {reason && (
        <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">{reason}</p>
      )}

      {footer && (
        <div className="mt-3 flex gap-2">{footer}</div>
      )}
    </div>
  );
}

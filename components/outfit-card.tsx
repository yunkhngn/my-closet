'use client';

import Image from 'next/image';
import { useItemsStore } from '@/store/items';
import { CLOTHING_TYPES, SLOT_CONFIG, type OutfitItemRef } from '@/types';
import { portraitUrl } from '@/lib/cloudinary-url';

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
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        {ordered.map((ref) => {
          const item = byId.get(ref.itemId);
          return (
            <div key={`${ref.slot}-${ref.itemId}`} className="w-24 shrink-0">
              <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
                {item?.imagePublicId && (
                  <Image
                    src={portraitUrl(item.imagePublicId, 96)}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                )}
              </div>
              <p className="mt-1.5 truncate text-center text-xs text-muted-foreground/70">
                {SLOT_CONFIG[ref.slot].label}
              </p>
            </div>
          );
        })}
      </div>

      {reason && (
        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{reason}</p>
      )}

      {footer && (
        <div className="mt-4 flex gap-2">{footer}</div>
      )}
    </div>
  );
}

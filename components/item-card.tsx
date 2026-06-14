'use client';

import Image from 'next/image';
import { useAuthStore } from '@/store/auth';
import { deleteItem } from '@/lib/db';
import { ItemForm } from '@/components/item-form';
import { Button } from '@/components/ui/button';
import type { Item } from '@/types';

export function ItemCard({ item }: { item: Item }) {
  const uid = useAuthStore((s) => s.user!.uid);

  return (
    <div className="group relative overflow-hidden rounded-md border border-border/60 bg-card transition-shadow duration-200 hover:shadow-md hover:shadow-foreground/5">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 180px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-1 px-3 py-2.5">
        <span className="truncate text-[13px] font-medium leading-tight text-foreground">
          {item.name}
        </span>
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <ItemForm
            existing={item}
            trigger={
              <Button variant="ghost" size="xs" className="h-7 px-2 text-xs">
                Sửa
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="xs"
            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
            onClick={() => {
              if (confirm(`Xóa "${item.name}"?`)) deleteItem(uid, item.id);
            }}
          >
            Xóa
          </Button>
        </div>
      </div>
    </div>
  );
}

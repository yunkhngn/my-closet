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
    <div className="group relative overflow-hidden rounded-lg border transition-transform active:scale-[0.98] bg-card text-card-foreground">
      <div className="relative aspect-square bg-muted">
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width:768px) 50vw, 200px"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex items-center justify-between gap-2 p-2">
        <span className="truncate text-sm font-medium">{item.name}</span>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <ItemForm
            existing={item}
            trigger={
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                Sửa
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="sm"
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

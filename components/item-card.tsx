'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth';
import { deleteItem } from '@/lib/db';
import { ItemForm } from '@/components/item-form';
import { Button } from '@/components/ui/button';
import type { Item } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export function ItemCard({ item }: { item: Item }) {
  const uid = useAuthStore((s) => s.user!.uid);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <div className="group card-hover-shadow relative overflow-hidden rounded-lg border border-border/60 bg-card">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {item.imageUrl && (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 220px"
              className="img-hover-scale object-cover"
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-3 py-3">
          <span className="truncate text-sm font-medium leading-tight text-foreground">
            {item.name}
          </span>
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
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
              onClick={() => setConfirmOpen(true)}
            >
              Xóa
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[360px] p-5">
          <DialogHeader className="gap-1">
            <DialogTitle className="text-[15px] font-semibold text-foreground">
              Xác nhận xóa
            </DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground/90 mt-1">
              Bạn có chắc chắn muốn xóa <strong>&ldquo;{item.name}&rdquo;</strong>? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-[13px] hover:bg-muted"
              onClick={() => setConfirmOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 text-[13px]"
              onClick={() => {
                deleteItem(uid, item.id);
                setConfirmOpen(false);
              }}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

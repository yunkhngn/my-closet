'use client';

import Image from 'next/image';
import { useShallow } from 'zustand/react/shallow';
import { useItemsStore } from '@/store/items';
import { useBuilderStore } from '@/store/builder';
import { SLOT_CONFIG, type ClothingType } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SlotPicker({ slot }: { slot: ClothingType }) {
  const meta = SLOT_CONFIG[slot];
  const items = useItemsStore(useShallow((s) => s.items.filter((i) => i.type === slot)));
  const selected = useBuilderStore(useShallow((s) => s.selection[slot] ?? []));
  const { setSlot, addToSlot, clearSlot } = useBuilderStore();

  const choose = (id: string) => {
    if (meta.multiple) {
      if (selected.includes(id)) {
        const next = selected.filter((x) => x !== id);
        useBuilderStore.setState((s) => ({
          selection: { ...s.selection, [slot]: next },
        }));
      } else {
        addToSlot(slot, id);
      }
    } else {
      if (selected.includes(id)) {
        clearSlot(slot);
      } else {
        setSlot(slot, id);
      }
    }
  };

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
          {meta.label}
          {meta.required && (
            <span className="ml-1 text-xs text-destructive" aria-label="bắt buộc">*</span>
          )}
        </h3>
        {selected.length > 0 && (
          <Button
            variant="ghost"
            size="xs"
            className="h-7 px-2 text-xs text-muted-foreground/60 hover:text-foreground"
            onClick={() => clearSlot(slot)}
          >
            Xóa
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm italic text-muted-foreground/50">
          Chưa có {meta.label.toLowerCase()} nào.
        </p>
      ) : (
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x">
          {items.map((item) => {
            const isSel = selected.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => choose(item.id)}
                className={cn(
                  'relative h-[100px] w-[76px] shrink-0 snap-start overflow-hidden rounded-md border-2 active:scale-[0.93] transition-all duration-200',
                  isSel
                    ? 'border-foreground shadow-md ring-2 ring-foreground/15 scale-[0.96]'
                    : 'border-border/50 hover:border-border hover:scale-[0.98]',
                )}
                style={{
                  transitionTimingFunction: 'var(--ease-out-expo)',
                }}
                title={item.name}
              >
                <div className="relative h-full w-full bg-muted">
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="76px"
                      className="object-cover"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

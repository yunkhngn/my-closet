'use client';

import Image from 'next/image';
import { useShallow } from 'zustand/react/shallow';
import { useItemsStore } from '@/store/items';
import { useBuilderStore } from '@/store/builder';
import { SLOT_CONFIG, type ClothingType } from '@/types';
import { Button } from '@/components/ui/button';

export function SlotPicker({ slot }: { slot: ClothingType }) {
  const meta = SLOT_CONFIG[slot];
  const items = useItemsStore(useShallow((s) => s.items.filter((i) => i.type === slot)));
  const selected = useBuilderStore(useShallow((s) => s.selection[slot] ?? []));
  const { setSlot, addToSlot, clearSlot } = useBuilderStore();

  const choose = (id: string) => {
    if (meta.multiple) {
      if (selected.includes(id)) {
        // Toggle off if already selected
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
        <h3 className="text-sm font-semibold tracking-tight">
          {meta.label}
          {meta.required && <span className="ml-1 text-destructive">*</span>}
        </h3>
        {selected.length > 0 && (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => clearSlot(slot)}>
            Clear
          </Button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No {meta.label.toLowerCase()} items yet.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          {items.map((item) => {
            const isSel = selected.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => choose(item.id)}
                className={`w-16 h-16 shrink-0 rounded-lg border-2 overflow-hidden transition-all duration-200 active:scale-95 snap-start ${
                  isSel
                    ? 'border-primary ring-2 ring-primary/20 scale-95 shadow-sm'
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
              >
                <div className="relative w-full h-full bg-muted">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
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

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useOutfitsStore } from '@/store/outfits';
import { deleteOutfit } from '@/lib/db';
import { OutfitCard } from '@/components/outfit-card';
import { Button } from '@/components/ui/button';

export default function OutfitsPage() {
  const uid = useAuthStore((s) => s.user!.uid);
  const { outfits, loading } = useOutfitsStore();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/70 bg-background/95 px-8 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-[15px] font-semibold tracking-[-0.01em]">Outfit Đã Lưu</h1>
          {!loading && outfits.length > 0 && (
            <span className="text-xs text-muted-foreground/60">{outfits.length}</span>
          )}
        </div>
        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" render={<Link href="/" />} className="text-muted-foreground/70 hover:text-foreground">
            Tủ Đồ
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/build" />} className="text-muted-foreground/70 hover:text-foreground">
            Tạo Outfit
          </Button>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-4xl px-8 py-10">
        {loading ? (
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border border-muted-foreground/30 border-t-muted-foreground" />
            Đang tải...
          </div>
        ) : outfits.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <p className="text-[13px] text-muted-foreground">Chưa có outfit nào được lưu.</p>
            <Button variant="outline" size="sm" render={<Link href="/build" />}>
              Tạo outfit đầu tiên
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {outfits.map((o) => {
              const isConfirming = confirmDeleteId === o.id;
              return (
                <OutfitCard
                  key={o.id}
                  refs={o.items}
                  reason={[o.occasion, o.source].filter(Boolean).join(' · ')}
                  footer={
                    <Button
                      size="sm"
                      variant={isConfirming ? 'default' : 'destructive'}
                      className="h-7 text-[11px] min-w-[72px]"
                      onClick={() => {
                        if (isConfirming) {
                          deleteOutfit(uid, o.id);
                          setConfirmDeleteId(null);
                        } else {
                          setConfirmDeleteId(o.id);
                        }
                      }}
                      onMouseLeave={() => {
                        if (isConfirming) setConfirmDeleteId(null);
                      }}
                    >
                      {isConfirming ? 'Xác nhận' : 'Xóa'}
                    </Button>
                  }
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

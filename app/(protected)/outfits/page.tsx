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
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/70 bg-background/95 px-8 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-[17px] font-semibold tracking-[-0.02em]">Outfit Đã Lưu</h1>
          {!loading && outfits.length > 0 && (
            <span className="text-sm text-muted-foreground/60">{outfits.length}</span>
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

      <main className="mx-auto w-full max-w-4xl px-8 py-12">
        {loading ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
            Đang tải...
          </div>
        ) : outfits.length === 0 ? (
          <div className="anim-section flex flex-col items-center gap-4 py-32 text-center">
            <p className="text-[15px] text-muted-foreground">Chưa có outfit nào được lưu.</p>
            <Button variant="outline" render={<Link href="/build" />}>
              Tạo outfit đầu tiên
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {outfits.map((o, idx) => {
              const isConfirming = confirmDeleteId === o.id;
              return (
                <div
                  key={o.id}
                  className="anim-section"
                  style={{ '--s': idx } as React.CSSProperties}
                >
                  <OutfitCard
                    refs={o.items}
                    reason={[o.occasion, o.source].filter(Boolean).join(' · ')}
                    footer={
                      <Button
                        size="sm"
                        variant={isConfirming ? 'default' : 'destructive'}
                        className="h-8 text-sm min-w-[80px]"
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
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

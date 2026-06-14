'use client';

import { useState } from 'react';
import Link from 'next/link';
import { type Filter } from '@/lib/filter';
import { FilterBar } from '@/components/filter-bar';
import { OutfitBuilder } from '@/components/outfit-builder';
import { Button } from '@/components/ui/button';

export default function BuildPage() {
  const [filter, setFilter] = useState<Filter>({});

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/70 bg-background/95 px-8 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-[15px] font-semibold tracking-[-0.01em]">Tạo Trang Phục</h1>
        </div>
        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" render={<Link href="/" />} className="text-muted-foreground/70 hover:text-foreground">
            Tủ Đồ
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/outfits" />} className="text-muted-foreground/70 hover:text-foreground">
            Đã Lưu
          </Button>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-3xl px-8 py-10 space-y-6">
        <FilterBar filter={filter} onChange={setFilter} />
        <OutfitBuilder filter={filter} />
      </main>
    </div>
  );
}

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
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Build an Outfit</h1>
          <p className="text-sm text-muted-foreground mt-1">Mix and match slots or generate recommendations.</p>
        </div>
        <div className="flex gap-2 text-sm">
          <Button variant="outline" size="sm" render={<Link href="/" />}>
            Closet
          </Button>
          <Button variant="outline" size="sm" render={<Link href="/outfits" />}>
            Saved
          </Button>
        </div>
      </header>

      <FilterBar filter={filter} onChange={setFilter} />
      <OutfitBuilder filter={filter} />
    </main>
  );
}

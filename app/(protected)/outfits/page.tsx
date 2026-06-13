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
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved Outfits</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse your liked styles and recommendations.</p>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/build" />}>
          Build
        </Button>
      </header>

      {loading ? (
        <p className="text-sm text-muted-foreground italic">Loading...</p>
      ) : outfits.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No saved outfits yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
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
                    className="h-8 text-xs min-w-[70px]"
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
                    {isConfirming ? 'Confirm' : 'Delete'}
                  </Button>
                }
              />
            );
          })}
        </div>
      )}
    </main>
  );
}

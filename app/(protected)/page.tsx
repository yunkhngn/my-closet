'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { signOut } from '@/lib/auth-actions';
import { ItemForm } from '@/components/item-form';
import { ClosetGrid } from '@/components/closet-grid';
import { seedCloset } from '@/lib/db';

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    if (!user) return;
    setSeeding(true);
    try {
      await seedCloset(user.uid);
    } catch (err) {
      console.error('Failed to seed closet:', err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Closet</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-muted-foreground sm:inline">
            {user?.displayName}
          </span>
          <Button variant="ghost" size="sm" render={<Link href="/build" />}>
            Build
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/outfits" />}>
            Saved
          </Button>
          <ItemForm trigger={<Button size="sm">Add item</Button>} />
          <Button variant="outline" size="sm" onClick={handleSeed} disabled={seeding}>
            {seeding ? 'Seeding...' : 'Seed'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
      </header>
      <ClosetGrid />
    </main>
  );
}

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { signOut } from '@/lib/auth-actions';
import { ItemForm } from '@/components/item-form';
import { ClosetGrid } from '@/components/closet-grid';

export default function HomePage() {
  const user = useAuthStore((s) => s.user);

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
          <ItemForm trigger={<Button size="sm">Add item</Button>} />
          <Button variant="outline" size="sm" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
      </header>
      <ClosetGrid />
    </main>
  );
}

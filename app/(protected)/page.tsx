'use client';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { signOut } from '@/lib/auth-actions';

export default function HomePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Closet</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{user?.displayName}</span>
          <Button variant="outline" size="sm" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
      </header>
      <p className="mt-8 text-sm text-muted-foreground">
        Closet view arrives in Plan 2.
      </p>
    </main>
  );
}

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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/70 bg-background/95 px-8 backdrop-blur-sm">
        <h1 className="text-[15px] font-semibold tracking-[-0.01em]">Tủ Đồ</h1>
        <nav className="flex items-center gap-1">
          <span className="mr-3 hidden text-sm text-muted-foreground/70 sm:block">
            {user?.displayName}
          </span>
          <Button variant="ghost" size="sm" render={<Link href="/build" />}>
            Tạo Outfit
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/outfits" />}>
            Đã Lưu
          </Button>
          <div className="mx-1 h-4 w-px bg-border" />
          <ItemForm trigger={<Button size="sm">+ Thêm đồ</Button>} />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSeed}
            disabled={seeding}
            className="text-muted-foreground/60 hover:text-muted-foreground"
          >
            {seeding ? '…' : 'Mẫu'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-muted-foreground/60 hover:text-muted-foreground">
            Thoát
          </Button>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl px-8 py-10">
        <ClosetGrid />
      </main>
    </div>
  );
}

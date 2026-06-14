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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/70 bg-background/95 px-8 backdrop-blur-sm">
        <h1 className="text-[17px] font-semibold tracking-[-0.02em]">
          Tủ đồ AI của {user?.displayName || 'bạn'}
        </h1>
        <nav className="flex items-center gap-1">
          <ItemForm trigger={<Button size="sm">+ Thêm đồ</Button>} />
          <div className="mx-2 h-4 w-px bg-border" />
          <Button variant="ghost" size="sm" render={<Link href="/build" />}>
            Tạo Outfit
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/outfits" />}>
            Đã Lưu
          </Button>
          <div className="mx-2 h-4 w-px bg-border" />
          <span className="mx-2 hidden text-sm text-muted-foreground/70 sm:block">
            {user?.displayName}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="text-muted-foreground/60 hover:text-muted-foreground"
          >
            Thoát
          </Button>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl px-8 py-12">
        <ClosetGrid />
      </main>
    </div>
  );
}

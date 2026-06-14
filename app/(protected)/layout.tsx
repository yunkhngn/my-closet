'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { ItemsProvider } from '@/components/items-provider';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/signin');
      } else {
        const allowedEmail = process.env.NEXT_PUBLIC_ALLOW_EMAIL;
        if (allowedEmail && user.email !== allowedEmail) {
          import('@/lib/auth-actions').then(({ signOut }) => {
            signOut();
            router.replace('/signin?error=unauthorized');
          });
        }
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Đang tải…
      </div>
    );
  }

  const allowedEmail = process.env.NEXT_PUBLIC_ALLOW_EMAIL;
  if (!user || (allowedEmail && user.email !== allowedEmail)) return null;

  return <ItemsProvider>{children}</ItemsProvider>;
}

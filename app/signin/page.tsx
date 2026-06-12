'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/lib/auth-actions';
import { useAuthStore } from '@/store/auth';

export default function SignInPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && user) router.replace('/');
  }, [user, loading, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Wardrobe</h1>
      <p className="text-sm text-muted-foreground">Sign in to your closet.</p>
      <Button onClick={() => signInWithGoogle()}>Continue with Google</Button>
    </main>
  );
}

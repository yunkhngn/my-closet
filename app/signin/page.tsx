'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/lib/auth-actions';
import { useAuthStore } from '@/store/auth';

export default function SignInPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsUnauthorized(params.get('error') === 'unauthorized');
    }
  }, []);

  useEffect(() => {
    if (!loading && user) {
      const allowedEmail = process.env.NEXT_PUBLIC_ALLOW_EMAIL;
      if (!allowedEmail || user.email === allowedEmail) {
        router.replace('/');
      }
    }
  }, [user, loading, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Tủ Quần Áo</h1>
      <p className="text-sm text-muted-foreground">Đăng nhập vào tủ đồ của bạn.</p>
      <Button onClick={() => signInWithGoogle()}>Tiếp tục với Google</Button>
      {isUnauthorized && (
        <p className="text-sm text-destructive mt-2">
          Tài khoản không được phép. Vui lòng đăng nhập bằng email của chủ sở hữu.
        </p>
      )}
    </main>
  );
}

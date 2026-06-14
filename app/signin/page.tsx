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
    <main className="flex min-h-screen flex-col items-center justify-center px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-[40px] font-semibold tracking-[-0.04em] text-foreground leading-none">
            Tủ Đồ
          </h1>
          <p className="text-[13px] text-muted-foreground tracking-[0.01em]">
            Tủ quần áo của bạn, số hóa.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={() => signInWithGoogle()}
            className="h-9 gap-2.5 px-5 text-[13px]"
          >
            <svg viewBox="0 0 20 20" className="size-4 shrink-0" aria-hidden>
              <path
                d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"
                fill="oklch(62% 0.2 259)"
              />
              <path
                d="M10 20c2.7 0 4.96-.89 6.62-2.43l-3.16-2.45c-.89.59-2.01.99-3.46.99-2.65 0-4.9-1.77-5.7-4.15H1.07v2.53A9.997 9.997 0 0 0 10 20z"
                fill="oklch(62% 0.2 145)"
              />
              <path
                d="M4.3 11.96A6.01 6.01 0 0 1 3.97 10c0-.68.12-1.34.33-1.96V5.51H1.07A9.997 9.997 0 0 0 0 10c0 1.61.39 3.14 1.07 4.49l3.23-2.53z"
                fill="oklch(70% 0.2 55)"
              />
              <path
                d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0A9.997 9.997 0 0 0 1.07 5.51L4.3 8.04C5.1 5.66 7.35 3.88 10 3.88z"
                fill="oklch(58% 0.23 27)"
              />
            </svg>
            Tiếp tục với Google
          </Button>

          {isUnauthorized && (
            <p className="text-[12px] text-destructive max-w-[280px]">
              Tài khoản không được phép. Vui lòng đăng nhập bằng email của chủ sở hữu.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

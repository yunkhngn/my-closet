'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useItemsStore } from '@/store/items';
import { subscribeItems } from '@/lib/db';

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const uid = useAuthStore((s) => s.user?.uid);
  const setItems = useItemsStore((s) => s.setItems);

  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeItems(uid, setItems);
    return unsub;
  }, [uid, setItems]);

  return <>{children}</>;
}

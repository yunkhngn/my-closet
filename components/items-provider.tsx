'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useItemsStore } from '@/store/items';
import { useOutfitsStore } from '@/store/outfits';
import { subscribeItems, subscribeOutfits } from '@/lib/db';

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const uid = useAuthStore((s) => s.user?.uid);
  const setItems = useItemsStore((s) => s.setItems);
  const setOutfits = useOutfitsStore((s) => s.setOutfits);

  useEffect(() => {
    if (!uid) return;
    const unsubItems = subscribeItems(uid, setItems);
    const unsubOutfits = subscribeOutfits(uid, setOutfits);
    return () => {
      unsubItems();
      unsubOutfits();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  return <>{children}</>;
}

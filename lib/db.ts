import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Item, Outfit } from '@/types';

function itemsCol(uid: string) {
  return collection(db, 'users', uid, 'items');
}

export type NewItem = Omit<Item, 'id' | 'createdAt'>;

export async function addItem(uid: string, data: NewItem): Promise<string> {
  const ref = await addDoc(itemsCol(uid), { ...data, createdAt: Date.now() });
  return ref.id;
}

export async function updateItem(
  uid: string,
  id: string,
  data: Partial<NewItem>,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'items', id), data);
}

export async function deleteItem(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'items', id));
}

/** Subscribe to the live items collection. Returns the unsubscribe fn. */
export function subscribeItems(
  uid: string,
  onChange: (items: Item[]) => void,
): () => void {
  const q = query(itemsCol(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Item);
    onChange(items);
  });
}

function outfitsCol(uid: string) {
  return collection(db, 'users', uid, 'outfits');
}

export type NewOutfit = Omit<Outfit, 'id' | 'createdAt'>;

export async function addOutfit(uid: string, data: NewOutfit): Promise<string> {
  const clean = JSON.parse(JSON.stringify(data)); // drop undefined fields
  const ref = await addDoc(outfitsCol(uid), { ...clean, createdAt: Date.now() });
  return ref.id;
}

export async function deleteOutfit(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'outfits', id));
}

export function subscribeOutfits(
  uid: string,
  onChange: (outfits: Outfit[]) => void,
): () => void {
  const q = query(outfitsCol(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Outfit));
  });
}

export async function seedCloset(uid: string): Promise<void> {
  const sampleItems: NewItem[] = [
    {
      type: 'ao_khoac',
      name: 'Black Denim Jacket',
      colors: ['black'],
      styleTags: ['casual', 'streetwear'],
      formality: 2,
      imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500',
      imagePublicId: 'mock_denim_jacket',
      occasions: ['casual', 'hangout'],
    },
    {
      type: 'ao',
      name: 'White Cotton Tee',
      colors: ['white'],
      styleTags: ['casual', 'minimalist'],
      formality: 1,
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
      imagePublicId: 'mock_white_tee',
      occasions: ['casual', 'hangout'],
    },
    {
      type: 'quan',
      name: 'Blue Raw Denim Jeans',
      colors: ['blue'],
      styleTags: ['casual', 'classic'],
      formality: 2,
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
      imagePublicId: 'mock_blue_jeans',
      occasions: ['casual', 'work'],
    },
    {
      type: 'giay',
      name: 'White Canvas Sneakers',
      colors: ['white'],
      styleTags: ['casual', 'sporty'],
      formality: 1,
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
      imagePublicId: 'mock_sneakers',
      occasions: ['casual', 'hangout'],
    },
    {
      type: 'phu_kien',
      name: 'Leather Strap Watch',
      colors: ['brown', 'black'],
      styleTags: ['classic', 'smart'],
      formality: 3,
      imageUrl: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500',
      imagePublicId: 'mock_watch',
      occasions: ['work', 'formal'],
    },
  ];

  for (const item of sampleItems) {
    await addItem(uid, item);
  }
}

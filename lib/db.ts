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
  const clean = JSON.parse(JSON.stringify(data));
  const ref = await addDoc(itemsCol(uid), { ...clean, createdAt: Date.now() });
  return ref.id;
}

export async function updateItem(
  uid: string,
  id: string,
  data: Partial<NewItem>,
): Promise<void> {
  const clean = JSON.parse(JSON.stringify(data));
  await updateDoc(doc(db, 'users', uid, 'items', id), clean);
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


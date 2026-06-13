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
import type { Item } from '@/types';

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

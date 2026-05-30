import {
  collection, doc, setDoc, deleteDoc,
  query, orderBy, onSnapshot, getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Letter } from '../types/letter';

const COL = 'letters';
const SETTINGS_KEY = 'today_haru_settings';
const LEGACY_KEY   = 'today_haru_letters';

export interface AppSettings { pin: string; }

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as AppSettings) : { pin: '0804' };
  } catch {
    return { pin: '0804' };
  }
}

export function saveSettings(s: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

/* Real-time subscription — returns unsubscribe fn */
export function subscribeLetters(cb: (letters: Letter[]) => void): () => void {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => d.data() as Letter));
  });
}

function stripUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T;
}

export async function saveLetter(letter: Letter): Promise<void> {
  await setDoc(doc(db, COL, letter.id), stripUndefined(letter));
}

export async function updateLetter(updated: Letter): Promise<void> {
  await setDoc(doc(db, COL, updated.id), stripUndefined(updated));
}

export async function deleteLetter(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export async function exportLetters(): Promise<void> {
  const snap = await getDocs(query(collection(db, COL), orderBy('createdAt', 'desc')));
  const letters = snap.docs.map((d) => d.data() as Letter);
  const json = JSON.stringify({ letters, exportedAt: new Date().toISOString() }, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `오늘하루_백업_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importLetters(jsonStr: string): Promise<number> {
  const data = JSON.parse(jsonStr);
  const letters: Letter[] = Array.isArray(data) ? data : (data.letters ?? []);
  await Promise.all(letters.map((l) => setDoc(doc(db, COL, l.id), l)));
  return letters.length;
}

/* One-time migration: moves localStorage letters to Firestore */
export async function migrateFromLocalStorage(): Promise<void> {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return;
    const letters: Letter[] = JSON.parse(raw);
    if (!letters.length) { localStorage.removeItem(LEGACY_KEY); return; }
    await Promise.all(letters.map((l) => setDoc(doc(db, COL, l.id), l)));
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore migration errors */
  }
}


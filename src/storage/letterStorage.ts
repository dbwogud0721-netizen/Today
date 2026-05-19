import { Letter } from '../types/letter';

const LETTERS_KEY = 'today_haru_letters';
const SETTINGS_KEY = 'today_haru_settings';

export interface AppSettings {
  pin: string;
}

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

export function getLetters(): Letter[] {
  try {
    const raw = localStorage.getItem(LETTERS_KEY);
    return raw ? (JSON.parse(raw) as Letter[]) : [];
  } catch {
    return [];
  }
}

export function saveLetter(letter: Letter): void {
  const list = getLetters();
  localStorage.setItem(LETTERS_KEY, JSON.stringify([letter, ...list]));
}

export function updateLetter(updated: Letter): void {
  const list = getLetters().map((l) => (l.id === updated.id ? updated : l));
  localStorage.setItem(LETTERS_KEY, JSON.stringify(list));
}

export function deleteLetter(id: string): void {
  const list = getLetters().filter((l) => l.id !== id);
  localStorage.setItem(LETTERS_KEY, JSON.stringify(list));
}

export function exportLetters(): void {
  const letters = getLetters();
  const json = JSON.stringify({ letters, exportedAt: new Date().toISOString() }, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `오늘하루_백업_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importLetters(jsonStr: string): number {
  const data = JSON.parse(jsonStr);
  const letters: Letter[] = Array.isArray(data) ? data : (data.letters ?? []);
  localStorage.setItem(LETTERS_KEY, JSON.stringify(letters));
  return letters.length;
}

export async function resizeImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 600;
      let w = img.width;
      let h = img.height;
      if (w > h && w > MAX) { h = (h * MAX) / w; w = MAX; }
      else if (h > MAX) { w = (w * MAX) / h; h = MAX; }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.65));
    };
    img.onerror = reject;
    img.src = url;
  });
}

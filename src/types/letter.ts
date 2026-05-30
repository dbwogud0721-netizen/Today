export interface Letter {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  emotion?: string;
  weather?: string;
  tags?: string[];
  location?: string;
  isFavorite?: boolean;
  timeCapsuleDate?: string; // ISO — locked until this date
}

export const EMOTIONS = [
  { emoji: '😊', label: '기쁨' },
  { emoji: '😢', label: '슬픔' },
  { emoji: '😌', label: '평온' },
  { emoji: '💭', label: '생각' },
  { emoji: '💫', label: '설렘' },
  { emoji: '🌙', label: '외로움' },
  { emoji: '😤', label: '화남' },
  { emoji: '🤍', label: '공허' },
];

export const WEATHERS = [
  { emoji: '☀️', label: '맑음' },
  { emoji: '⛅', label: '구름' },
  { emoji: '🌧️', label: '비' },
  { emoji: '❄️', label: '눈' },
  { emoji: '🌫️', label: '안개' },
  { emoji: '🌈', label: '무지개' },
];

export function isLocked(letter: Letter): boolean {
  if (!letter.timeCapsuleDate) return false;
  return new Date(letter.timeCapsuleDate) > new Date();
}

import { UNITS } from '../data/units';

export interface Pt { x: number; y: number }

export const BG = '/rashi/bg-journey.webp';
export const BG_RATIO = 2413 / 1200;
export const UNIT_COLORS = ['#0d9488', '#f59e0b', '#8b5cf6', '#e05252', '#3b82f6', '#ec4899', '#16a34a', '#a16207', '#d97706'];

/** גרסה חדשה — מתעלמים משמירות ישנות של לפני ההתאמה הידנית */
export const LS_PATH = 'rashi_station_pos_v2';

/** מיקומי 32 התחנות — הותאמו ידנית על השביל */
export const STATION_POS: Pt[] = [
  { x: 50.2, y: 97.1 }, // 1
  { x: 53.5, y: 93.8 }, // 2
  { x: 46.5, y: 92.6 }, // 3
  { x: 38.6, y: 89.4 }, // 4
  { x: 32.0, y: 85.6 }, // 5
  { x: 39.0, y: 82.8 }, // 6
  { x: 45.1, y: 80.4 }, // 7
  { x: 54.3, y: 80.6 }, // 8
  { x: 51.6, y: 76.9 }, // 9
  { x: 45.1, y: 75.7 }, // 10
  { x: 40.2, y: 72.2 }, // 11
  { x: 47.6, y: 70.0 }, // 12
  { x: 52.2, y: 68.9 }, // 13
  { x: 59.4, y: 68.0 }, // 14
  { x: 68.6, y: 67.7 }, // 15
  { x: 75.1, y: 66.6 }, // 16
  { x: 67.6, y: 63.6 }, // 17
  { x: 59.4, y: 62.1 }, // 18
  { x: 51.6, y: 60.7 }, // 19
  { x: 58.2, y: 59.3 }, // 20
  { x: 47.5, y: 57.0 }, // 21
  { x: 56.3, y: 54.6 }, // 22
  { x: 53.7, y: 50.6 }, // 23
  { x: 45.5, y: 49.2 }, // 24
  { x: 37.5, y: 47.7 }, // 25
  { x: 50.4, y: 44.3 }, // 26
  { x: 51.2, y: 41.9 }, // 27
  { x: 57.3, y: 40.4 }, // 28
  { x: 66.9, y: 39.0 }, // 29
  { x: 61.4, y: 36.5 }, // 30
  { x: 64.7, y: 34.1 }, // 31
  { x: 66.7, y: 31.1 }, // 32
];

export const START_POS: Pt = { x: 50.2, y: 98.6 };
export const TROPHY_POS: Pt = { x: 66.7, y: 28.0 };
export const CLOUD_COVER: Pt = { x: 58.8, y: 16.2 };

export function stationCount(): number {
  return UNITS.reduce((n, u) => n + u.activities.length, 0);
}

export function defaultStationPositions(): Pt[] {
  return STATION_POS.map((p) => ({ ...p }));
}

export function loadStationPositions(): Pt[] {
  try {
    const raw = localStorage.getItem(LS_PATH);
    if (!raw) return defaultStationPositions();
    const parsed = JSON.parse(raw) as Pt[];
    if (!Array.isArray(parsed) || parsed.length !== stationCount()) return defaultStationPositions();
    return parsed.map((p) => ({ x: Number(p.x), y: Number(p.y) }));
  } catch {
    return defaultStationPositions();
  }
}

export function saveStationPositions(pts: Pt[]): void {
  localStorage.setItem(LS_PATH, JSON.stringify(pts));
  window.dispatchEvent(new Event('rashi-path'));
}

export function clearStationPositions(): void {
  localStorage.removeItem(LS_PATH);
  window.dispatchEvent(new Event('rashi-path'));
}

/** רוחב מלא של המסך — השביל תמיד נראה; גובה לפי יחס התמונה */
export function boardSize() {
  const w = Math.max(320, window.innerWidth);
  const h = Math.round(w * BG_RATIO);
  return { w, h };
}

export function positionsToTs(pts: Pt[]): string {
  const lines = pts.map((p, i) => `  { x: ${p.x.toFixed(1)}, y: ${p.y.toFixed(1)} }, // ${i + 1}`);
  return `export const STATION_POS: Pt[] = [\n${lines.join('\n')}\n];\n`;
}

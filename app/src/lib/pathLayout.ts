import { UNITS } from '../data/units';

export interface Pt { x: number; y: number }

export const BG = '/rashi/bg-journey.webp';
export const BG_RATIO = 2413 / 1200;
export const UNIT_COLORS = ['#0d9488', '#f59e0b', '#8b5cf6', '#e05252', '#3b82f6', '#ec4899', '#16a34a', '#a16207', '#d97706'];

export const LS_PATH = 'rashi_station_pos_v1';

/** נקודות בקרה ברירת־מחדל על השביל */
export const PATH_CTRL: Pt[] = [
  { x: 44.0, y: 97.0 },
  { x: 42.0, y: 94.2 },
  { x: 45.5, y: 91.2 },
  { x: 50.0, y: 88.2 },
  { x: 54.5, y: 85.2 },
  { x: 57.5, y: 82.2 },
  { x: 56.5, y: 79.2 },
  { x: 51.0, y: 76.2 },
  { x: 45.0, y: 73.2 },
  { x: 40.0, y: 70.0 },
  { x: 37.5, y: 66.5 },
  { x: 39.5, y: 63.0 },
  { x: 43.5, y: 59.5 },
  { x: 47.0, y: 56.0 },
  { x: 45.0, y: 52.5 },
  { x: 41.5, y: 49.0 },
  { x: 40.0, y: 45.5 },
  { x: 44.0, y: 42.0 },
  { x: 49.5, y: 38.5 },
  { x: 55.0, y: 35.0 },
  { x: 59.0, y: 31.5 },
  { x: 61.5, y: 28.2 },
  { x: 60.5, y: 25.2 },
  { x: 58.0, y: 22.8 },
];

export const TROPHY_POS: Pt = { x: 57.5, y: 20.6 };
export const START_POS: Pt = { x: 44.0, y: 98.5 };
export const CLOUD_COVER: Pt = { x: 58.8, y: 16.2 };

function dist(a: Pt, b: Pt) {
  const dx = a.x - b.x;
  const dy = (a.y - b.y) * BG_RATIO;
  return Math.hypot(dx, dy);
}

export function sampleAlong(ctrl: Pt[], n: number): Pt[] {
  if (n <= 0) return [];
  if (n === 1) return [{ ...ctrl[0] }];
  const seg: number[] = [0];
  for (let i = 1; i < ctrl.length; i++) seg.push(seg[i - 1] + dist(ctrl[i - 1], ctrl[i]));
  const total = seg[seg.length - 1] || 1;
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * total;
    let j = 1;
    while (j < seg.length - 1 && seg[j] < t) j++;
    const a = ctrl[j - 1];
    const b = ctrl[j];
    const span = seg[j] - seg[j - 1] || 1;
    const u = (t - seg[j - 1]) / span;
    out.push({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });
  }
  return out;
}

export function stationCount(): number {
  return UNITS.reduce((n, u) => n + u.activities.length, 0);
}

export function defaultStationPositions(): Pt[] {
  return sampleAlong(PATH_CTRL, stationCount());
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

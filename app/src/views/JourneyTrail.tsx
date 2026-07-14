import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { UNITS } from '../data/units';
import type { Unit, Activity } from '../data/types';
import type { ProgressData } from '../lib/api';
import { unitUnlocked, isSkipped } from '../lib/progressUtil';
import { starsFor } from '../games/ui';
import { ACTIVITY_ICONS, Lock, Check, Star, Trophy } from '../ui/icons';
import { nav } from '../App';

// מפת מסע גבוהה: 32 תחנות (פעילויות) על השביל המצויר.
// צבע לפי יחידה, דגלי הסבר בין הפרקים. הגלילה מתחילה מלמטה.

const BG = '/rashi/bg-journey.webp';
const BG_RATIO = 2413 / 1200;
const VIEWPORTS_TALL = 4.8;

const UNIT_COLORS = ['#0d9488', '#f59e0b', '#8b5cf6', '#e05252', '#3b82f6', '#ec4899', '#16a34a', '#a16207', '#d97706'];

interface Pt { x: number; y: number }

/** נקודות בקרה על השביל המצויר — מלמטה (התחלה) למעלה (היעד) */
const PATH_CTRL: Pt[] = [
  { x: 45.5, y: 97.2 },
  { x: 43.0, y: 94.5 },
  { x: 47.5, y: 91.8 },
  { x: 52.0, y: 89.0 },
  { x: 57.5, y: 86.0 },
  { x: 61.5, y: 82.8 }, // גשר
  { x: 63.0, y: 79.5 },
  { x: 60.0, y: 76.5 },
  { x: 54.5, y: 73.5 },
  { x: 48.0, y: 70.5 },
  { x: 42.5, y: 67.5 },
  { x: 39.0, y: 64.0 },
  { x: 40.5, y: 60.5 },
  { x: 45.0, y: 57.0 },
  { x: 50.5, y: 53.5 },
  { x: 53.5, y: 50.0 },
  { x: 50.0, y: 46.5 },
  { x: 44.5, y: 43.0 },
  { x: 40.0, y: 39.5 },
  { x: 42.5, y: 36.0 },
  { x: 48.0, y: 32.5 },
  { x: 52.5, y: 29.0 },
  { x: 54.5, y: 25.5 },
  { x: 53.0, y: 22.0 }, // ליד היעד
];

const TROPHY_POS = { x: 54.0, y: 18.5 };
const START_POS = { x: 45.5, y: 98.6 };
/** ענן שמכסה את אזור הצלב על המגדל */
const CLOUD_COVER = { x: 58.9, y: 19.9 };

function dist(a: Pt, b: Pt) {
  const dx = a.x - b.x;
  const dy = (a.y - b.y) * BG_RATIO; // משקל אנכי לפי יחס התמונה
  return Math.hypot(dx, dy);
}

/** דגימת n נקודות במרווחים שווים לאורך פוליליין */
function sampleAlong(ctrl: Pt[], n: number): Pt[] {
  if (n <= 0) return [];
  if (n === 1) return [ctrl[0]];
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

interface Station {
  unit: Unit;
  unitIndex: number;
  act: Activity;
  actIndex: number;
  globalIndex: number;
  pos: Pt;
}

function boardSize() {
  const vh = window.innerHeight || 800;
  const h = Math.round(vh * VIEWPORTS_TALL);
  const w = Math.round(h / BG_RATIO);
  return { w, h };
}

export default function JourneyTrail({ progress }: { progress: ProgressData }) {
  const [size, setSize] = useState(boardSize);

  const stations: Station[] = useMemo(() => {
    const flat: Omit<Station, 'pos'>[] = [];
    UNITS.forEach((unit, unitIndex) =>
      unit.activities.forEach((act, actIndex) =>
        flat.push({ unit, unitIndex, act, actIndex, globalIndex: flat.length })
      )
    );
    const pts = sampleAlong(PATH_CTRL, flat.length);
    return flat.map((s, i) => ({ ...s, pos: pts[i] }));
  }, []);

  const unitFlags = useMemo(() => {
    const flags: { unitIndex: number; pos: Pt; title: string; color: string }[] = [];
    for (let ui = 0; ui < UNITS.length; ui++) {
      const first = stations.find((s) => s.unitIndex === ui);
      if (!first) continue;
      // דגל משמאל/ימין לסירוגין, מעט מעל תחנת הפתיחה של היחידה
      const side = ui % 2 === 0 ? -1 : 1;
      flags.push({
        unitIndex: ui,
        title: UNITS[ui].title,
        color: UNIT_COLORS[ui],
        pos: {
          x: Math.min(88, Math.max(12, first.pos.x + side * 14)),
          y: first.pos.y + 1.2,
        },
      });
    }
    return flags;
  }, [stations]);

  useEffect(() => {
    const onResize = () => setSize(boardSize());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useLayoutEffect(() => {
    const toBottom = () => {
      const top = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      window.scrollTo(0, top);
    };
    toBottom();
    const t = window.setTimeout(toBottom, 80);
    const img = new Image();
    img.src = BG;
    img.onload = toBottom;
    return () => window.clearTimeout(t);
  }, [size.h]);

  const isOpen = (s: Station): boolean => {
    if (progress.freeNav) return true;
    if (!unitUnlocked(progress, s.unitIndex)) return false;
    if (s.actIndex === 0) return true;
    return !!progress.completed[s.unit.activities[s.actIndex - 1].id];
  };

  const currentIdx = stations.findIndex((s) => isOpen(s) && !progress.completed[s.act.id]);
  const allDone = currentIdx === -1 && stations.every((s) => progress.completed[s.act.id]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: size.h,
        overflowX: 'hidden',
        background: 'linear-gradient(180deg, #bfe3f5 0%, #a9d99a 45%, #8ec96a 100%)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          filter: 'blur(38px) brightness(1.05)',
          transform: 'scale(1.12)',
          opacity: 0.55,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: size.w,
          height: size.h,
          margin: '0 auto',
          backgroundImage: `url(${BG})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          boxShadow: '0 0 60px rgba(20, 60, 20, 0.35)',
        }}
      >
        {/* ענן נוסף מעל אזור המגדל — מסתיר צלב אם נשאר */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: `${CLOUD_COVER.x}%`,
            top: `${CLOUD_COVER.y}%`,
            transform: 'translate(-50%, -50%)',
            width: '22%',
            height: '9%',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <svg viewBox="0 0 220 100" width="100%" height="100%" style={{ overflow: 'visible' }}>
            <ellipse cx="80" cy="52" rx="62" ry="32" fill="rgba(253,250,240,0.98)" />
            <ellipse cx="130" cy="44" rx="68" ry="36" fill="rgba(253,250,240,0.99)" />
            <ellipse cx="165" cy="55" rx="50" ry="28" fill="rgba(253,250,240,0.97)" />
            <ellipse cx="45" cy="58" rx="42" ry="24" fill="rgba(253,250,240,0.97)" />
            <ellipse cx="110" cy="68" rx="70" ry="30" fill="rgba(253,250,240,0.98)" />
          </svg>
        </div>

        <Marker pos={START_POS}>
          <div
            style={{
              background: '#7d5226',
              color: '#ffefc9',
              borderRadius: 11,
              padding: '6px 16px',
              fontSize: 14,
              fontWeight: 800,
              border: '3px solid #5d3b18',
              boxShadow: '0 4px 10px rgba(30,70,20,0.45)',
              whiteSpace: 'nowrap',
            }}
          >
            🚩 מתחילים כאן!
          </div>
        </Marker>

        <Marker pos={TROPHY_POS}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: '50%',
                background: allDone
                  ? 'radial-gradient(circle at 34% 30%, #fff3b8, #f3c53d 75%)'
                  : 'radial-gradient(circle at 34% 30%, rgba(255,255,255,0.92), rgba(233,217,178,0.92) 75%)',
                border: '4px solid #b8860b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 5px 14px rgba(30,70,20,0.45)',
                margin: '0 auto',
              }}
            >
              <Trophy size={30} color="#b8860b" strokeWidth={2.2} />
            </div>
            <div style={{ marginTop: 4, background: 'rgba(125,82,38,0.95)', color: '#ffefc9', borderRadius: 9, padding: '2px 11px', fontSize: 12, fontWeight: 800, display: 'inline-block' }}>
              {allDone ? '🎉 סיימת!' : 'סוף המסע'}
            </div>
          </div>
        </Marker>

        {/* דגלי פרקים */}
        {unitFlags.map((f) => (
          <Marker key={`flag-${f.unitIndex}`} pos={f.pos}>
            <div
              style={{
                background: f.color,
                color: '#fff',
                borderRadius: 10,
                padding: '5px 12px',
                fontSize: 12.5,
                fontWeight: 800,
                border: '2.5px solid rgba(255,255,255,0.85)',
                boxShadow: '0 3px 10px rgba(20,60,20,0.4)',
                whiteSpace: 'nowrap',
                maxWidth: 160,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {f.unitIndex + 1}. {f.title}
            </div>
          </Marker>
        ))}

        {/* 32 תחנות פעילות */}
        {stations.map((s) => {
          const open = isOpen(s);
          const done = !!progress.completed[s.act.id];
          const skipped = isSkipped(progress, s.act.id);
          const isCurrent = s.globalIndex === currentIdx;
          const color = UNIT_COLORS[s.unitIndex];
          const rec = progress.completed[s.act.id];
          const stars = rec && !skipped ? starsFor(rec.score, rec.max) : 0;
          const Icon = ACTIVITY_ICONS[s.act.type] || ACTIVITY_ICONS.quiz;

          let bg = 'rgba(255,255,255,0.96)';
          let ring = color;
          if (!open) { bg = 'rgba(226,229,223,0.92)'; ring = '#8fa088'; }
          else if (done && !skipped) { bg = color; }

          const nodeSize = isCurrent ? 52 : 46;

          return (
            <Marker key={s.act.id} pos={s.pos} className="trail-node-wrap">
              <button
                onClick={() => open && nav(`/play/${s.unit.id}/${s.act.id}`)}
                aria-label={s.act.title}
                style={{
                  width: nodeSize,
                  height: nodeSize,
                  borderRadius: '50%',
                  border: `3.5px solid ${done && !skipped ? '#ffffff' : ring}`,
                  background: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: open ? 'pointer' : 'default',
                  boxShadow: isCurrent
                    ? `0 0 0 6px ${color}55, 0 4px 12px rgba(20,60,20,0.5)`
                    : '0 4px 12px rgba(20,60,20,0.45)',
                  animation: isCurrent ? 'trail-pulse 1.8s ease-in-out infinite' : 'none',
                  transition: 'transform 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => open && (e.currentTarget.style.transform = 'scale(1.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {!open ? (
                  <Lock size={18} color="#7c8873" />
                ) : (
                  <Icon size={22} color={done && !skipped ? '#fff' : color} strokeWidth={2.3} />
                )}

                {done && !skipped && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -5,
                      left: -5,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: '#fff',
                      border: `2px solid ${color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={10} color={color} strokeWidth={3.4} />
                  </span>
                )}
              </button>

              <div style={{ height: 16, display: 'flex', justifyContent: 'center', gap: 1, marginTop: 2, filter: 'drop-shadow(0 2px 3px rgba(20,60,20,0.55))' }}>
                {done && !skipped ? [1, 2, 3].map((k) => <Star key={k} filled={k <= stars} size={11} />) : null}
              </div>

              <div className="trail-tip">
                <div style={{ fontWeight: 800, fontSize: 13 }}>{s.act.title}</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{s.unit.title}</div>
              </div>
            </Marker>
          );
        })}
      </div>
    </div>
  );
}

function Marker({
  pos,
  children,
  className,
}: {
  pos: { x: number; y: number };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  );
}

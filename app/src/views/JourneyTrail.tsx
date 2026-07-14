import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { UNITS } from '../data/units';
import type { Unit, Activity } from '../data/types';
import type { ProgressData } from '../lib/api';
import { unitUnlocked, isSkipped } from '../lib/progressUtil';
import { starsFor } from '../games/ui';
import { ACTIVITY_ICONS, Lock, Check, Star3D, Trophy } from '../ui/icons';
import { nav } from '../App';

// מפת מסע גבוהה: 32 תחנות על השביל. חזרה מפעילות → למפה + כוכבים בקשת.

const BG = '/rashi/bg-journey.webp';
const BG_RATIO = 2413 / 1200;
const VIEWPORTS_TALL = 4.8;

const UNIT_COLORS = ['#0d9488', '#f59e0b', '#8b5cf6', '#e05252', '#3b82f6', '#ec4899', '#16a34a', '#a16207', '#d97706'];

interface Pt { x: number; y: number }

/**
 * נקודות בקרה על השביל המצויר (לא הנהר) — מלמטה למעלה.
 * אחרי הגשר השביל נשאר בשמאל המים; למעלה הוא מתעקל ימינה אל הכפר.
 */
const PATH_CTRL: Pt[] = [
  { x: 44.0, y: 97.0 },
  { x: 42.0, y: 94.2 },
  { x: 45.5, y: 91.2 },
  { x: 50.0, y: 88.2 },
  { x: 54.5, y: 85.2 },
  { x: 57.5, y: 82.2 }, // גשר — מרכז האבן
  { x: 56.5, y: 79.2 },
  { x: 51.0, y: 76.2 }, // יורדים מהגשר לשביל, לא למים
  { x: 45.0, y: 73.2 },
  { x: 40.0, y: 70.0 }, // שמאל הזרם
  { x: 37.5, y: 66.5 },
  { x: 39.5, y: 63.0 },
  { x: 43.5, y: 59.5 },
  { x: 47.0, y: 56.0 },
  { x: 45.0, y: 52.5 },
  { x: 41.5, y: 49.0 },
  { x: 40.0, y: 45.5 },
  { x: 44.0, y: 42.0 },
  { x: 49.5, y: 38.5 },
  { x: 55.0, y: 35.0 }, // מתעקל ימינה אל שביל הכפר
  { x: 59.0, y: 31.5 },
  { x: 61.5, y: 28.2 },
  { x: 60.5, y: 25.2 },
  { x: 58.0, y: 22.8 }, // מתחת לענן ההסתרה
];

const TROPHY_POS = { x: 57.5, y: 20.6 };
const START_POS = { x: 44.0, y: 98.5 };
/** ענן קטן רק מעל ראש המגדל */
const CLOUD_COVER = { x: 58.8, y: 16.2 };

function dist(a: Pt, b: Pt) {
  const dx = a.x - b.x;
  const dy = (a.y - b.y) * BG_RATIO;
  return Math.hypot(dx, dy);
}

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

/** שלושה כוכבים בקשת מעל העיגול */
function StarArc({ count }: { count: number }) {
  const angles = [-34, 0, 34];
  const radius = 36;
  return (
    <div className="trail-star-arc" aria-hidden>
      {angles.map((deg, i) => {
        const a = (deg * Math.PI) / 180;
        const x = Math.sin(a) * radius;
        const y = -Math.cos(a) * radius - 6;
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `translate(-50%, -50%) rotate(${deg * 0.35}deg)`,
            }}
          >
            <Star3D filled={i < count} size={i === 1 ? 24 : 20} />
          </span>
        );
      })}
    </div>
  );
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
      const side = ui % 2 === 0 ? -1 : 1;
      flags.push({
        unitIndex: ui,
        title: UNITS[ui].title,
        color: UNIT_COLORS[ui],
        pos: {
          x: Math.min(86, Math.max(14, first.pos.x + side * 7.5)),
          y: first.pos.y - 0.15,
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

  // חזרה מפעילות → ממקדים את התחנה; כניסה ראשונה → לתחתית המפה
  useLayoutEffect(() => {
    const focusId = sessionStorage.getItem('rashi_focus_act');
    if (focusId) {
      sessionStorage.removeItem('rashi_focus_act');
      const el = document.getElementById(`station-${focusId}`);
      if (el) {
        el.scrollIntoView({ block: 'center' });
        return;
      }
    }
    if (sessionStorage.getItem('rashi_map_seen') === '1') {
      const y = Number(sessionStorage.getItem('rashi_map_scroll') || '0');
      if (y > 0) window.scrollTo(0, y);
      return;
    }
    const toBottom = () => {
      const top = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      window.scrollTo(0, top);
      sessionStorage.setItem('rashi_map_seen', '1');
    };
    toBottom();
    const t = window.setTimeout(toBottom, 80);
    const img = new Image();
    img.src = BG;
    img.onload = toBottom;
    return () => window.clearTimeout(t);
  }, [size.h]);

  useEffect(() => {
    const save = () => sessionStorage.setItem('rashi_map_scroll', String(window.scrollY));
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, []);

  const isOpen = (s: Station): boolean => {
    if (progress.freeNav) return true;
    if (!unitUnlocked(progress, s.unitIndex)) return false;
    if (s.actIndex === 0) return true;
    return !!progress.completed[s.unit.activities[s.actIndex - 1].id];
  };

  const currentIdx = stations.findIndex((s) => isOpen(s) && !progress.completed[s.act.id]);
  const allDone = currentIdx === -1 && stations.every((s) => progress.completed[s.act.id]);

  const openPlay = (s: Station) => {
    sessionStorage.setItem('rashi_focus_act', s.act.id);
    nav(`/play/${s.unit.id}/${s.act.id}`);
  };

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
        {/* ענן הסתרה קטן — רק ראש המגדל, לא מסתיר תחנות */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: `${CLOUD_COVER.x}%`,
            top: `${CLOUD_COVER.y}%`,
            transform: 'translate(-50%, -50%)',
            width: '12%',
            height: '4.5%',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <svg viewBox="0 0 180 80" width="100%" height="100%" style={{ overflow: 'visible' }}>
            <ellipse cx="90" cy="40" rx="55" ry="28" fill="rgba(253,250,240,0.97)" />
            <ellipse cx="60" cy="48" rx="38" ry="20" fill="rgba(253,250,240,0.95)" />
            <ellipse cx="120" cy="46" rx="40" ry="22" fill="rgba(253,250,240,0.95)" />
          </svg>
        </div>

        <Marker pos={START_POS} ground={false}>
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

        <Marker pos={TROPHY_POS} ground={false}>
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

        {unitFlags.map((f) => (
          <Marker key={`flag-${f.unitIndex}`} pos={f.pos} ground={false}>
            <div
              style={{
                background: f.color,
                color: '#fff',
                borderRadius: 9,
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 800,
                border: '2px solid rgba(255,255,255,0.9)',
                boxShadow: '0 3px 8px rgba(20,60,20,0.4)',
                whiteSpace: 'nowrap',
                maxWidth: 140,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {f.unitIndex + 1}. {f.title}
            </div>
          </Marker>
        ))}

        {stations.map((s) => {
          const open = isOpen(s);
          const done = !!progress.completed[s.act.id];
          const skipped = isSkipped(progress, s.act.id);
          const isCurrent = s.globalIndex === currentIdx;
          const color = UNIT_COLORS[s.unitIndex];
          const rec = progress.completed[s.act.id];
          const stars = rec && !skipped ? starsFor(rec.score, rec.max) : 0;
          const Icon = ACTIVITY_ICONS[s.act.type] || ACTIVITY_ICONS.quiz;

          let bg = 'rgba(255,255,255,0.97)';
          let ring = color;
          if (!open) { bg = 'rgba(226,229,223,0.94)'; ring = '#8fa088'; }
          else if (done && !skipped) { bg = color; }

          const nodeSize = isCurrent ? 50 : 44;

          return (
            <Marker key={s.act.id} pos={s.pos} className="trail-node-wrap" ground id={`station-${s.act.id}`}>
              {done && !skipped && <StarArc count={stars} />}

              {/* צל על הקרקע — מדביק את התחנה לשביל */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: -4,
                  width: nodeSize * 0.85,
                  height: 12,
                  transform: 'translateX(-50%)',
                  background: 'radial-gradient(ellipse, rgba(40,60,20,0.45) 0%, rgba(40,60,20,0) 70%)',
                  pointerEvents: 'none',
                }}
              />

              <button
                onClick={() => open && openPlay(s)}
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
                    ? `0 0 0 6px ${color}55, 0 6px 10px rgba(20,60,20,0.45)`
                    : '0 5px 10px rgba(20,60,20,0.4)',
                  animation: isCurrent ? 'trail-pulse 1.8s ease-in-out infinite' : 'none',
                  transition: 'transform 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => open && (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {!open ? (
                  <Lock size={17} color="#7c8873" />
                ) : (
                  <Icon size={20} color={done && !skipped ? '#fff' : color} strokeWidth={2.3} />
                )}

                {done && !skipped && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -4,
                      left: -4,
                      width: 17,
                      height: 17,
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

              <div className="trail-tip">
                <div style={{ fontWeight: 800, fontSize: 13.5 }}>{s.act.title}</div>
                <div style={{ fontSize: 12, opacity: 0.88, marginTop: 5, lineHeight: 1.4 }}>
                  {s.act.instructions}
                </div>
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
  ground = true,
  id,
}: {
  pos: { x: number; y: number };
  children: React.ReactNode;
  className?: string;
  /** נקודת העיגון בתחתית — כדי שהעיגול "יושב" על השביל */
  ground?: boolean;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={className}
      style={{
        position: 'absolute',
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: ground ? 'translate(-50%, -82%)' : 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  );
}

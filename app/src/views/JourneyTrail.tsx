import React from 'react';
import { UNITS } from '../data/units';
import type { Unit, Activity } from '../data/types';
import type { ProgressData } from '../lib/api';
import { unitUnlocked, isSkipped } from '../lib/progressUtil';
import { starsFor } from '../games/ui';
import { ACTIVITY_ICONS, Lock, SkipForward, Check, Star } from '../ui/icons';
import { Tree, Pine, Bush, Mushroom, Rock, Daisy, Tulip, Butterfly, Stump, Bridge, Grass } from './scenery';
import { nav } from '../App';

// מפת מסע במסך מלא: כל פעילות היא תחנה על השביל, כל יחידה — מקטע צבעוני.
// שמות מוצגים בריחוף בלבד; שלטי עץ מסמנים תחילת כל מקטע.

const GAP = 96;              // מרווח אנכי בין תחנות
const PAD_TOP = 175;
const PAD_BOTTOM = 135;

// צבע לכל יחידה — לפי הסדר
const UNIT_COLORS = ['#0d9488', '#f59e0b', '#8b5cf6', '#e05252', '#3b82f6', '#ec4899', '#16a34a', '#a16207', '#d97706'];

interface Station {
  unit: Unit;
  unitIndex: number;
  act: Activity;
  actIndex: number;
}

interface Pt { x: number; y: number }

function smoothPath(pts: Pt[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6}, ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6}, ${p2.x} ${p2.y}`;
  }
  return d;
}

// פיזור נוף דטרמיניסטי בשולי המפה
const SCENERY = [Tree, Daisy, Pine, Mushroom, Bush, Tulip, Rock, Butterfly, Tree, Grass, Stump, Daisy, Pine, Bush, Tree, Tulip, Mushroom, Rock, Grass, Butterfly, Pine, Daisy, Tree, Bush, Stump, Tulip, Grass, Mushroom, Tree, Pine];

export default function JourneyTrail({ progress }: { progress: ProgressData }) {
  const stations: Station[] = [];
  UNITS.forEach((unit, unitIndex) =>
    unit.activities.forEach((act, actIndex) => stations.push({ unit, unitIndex, act, actIndex }))
  );
  const n = stations.length;
  const height = PAD_TOP + PAD_BOTTOM + (n - 1) * GAP;

  const pts: Pt[] = stations.map((_, i) => ({
    x: 50 + 30 * Math.sin(i * 0.55 + 0.8),
    y: height - PAD_BOTTOM - i * GAP,
  }));
  const trailPts = [...pts, { x: 50, y: PAD_TOP - 70 }];

  const isOpen = (s: Station): boolean => {
    if (progress.freeNav) return true;
    if (!unitUnlocked(progress, s.unitIndex)) return false;
    if (s.actIndex === 0) return true;
    return !!progress.completed[s.unit.activities[s.actIndex - 1].id];
  };

  const currentIdx = stations.findIndex((s) => isOpen(s) && !progress.completed[s.act.id]);
  const allDone = currentIdx === -1;

  // נהרות בשלוש נקודות לאורך הדרך, עם גשר בנקודת החצייה
  const rivers = [0.24, 0.52, 0.78].map((f) => {
    const i = Math.min(n - 2, Math.floor(n * f));
    return {
      y: (pts[i].y + pts[i + 1].y) / 2,
      bridgeX: (pts[i].x + pts[i + 1].x) / 2,
    };
  });

  const riverPath = (y: number) =>
    `M -5 ${y} q 12 -11 25 0 t 25 0 t 25 0 t 25 0 t 25 0`;

  // מקטעי צבע: הנקודות של כל יחידה כולל נקודת החיבור מהיחידה הקודמת
  const segments = UNITS.map((unit, ui) => {
    const from = UNITS.slice(0, ui).reduce((a, u) => a + u.activities.length, 0);
    const to = from + unit.activities.length;
    const segPts = pts.slice(Math.max(0, from - 1), to);
    return { color: UNIT_COLORS[ui], d: smoothPath(segPts) };
  });

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #8ecb63 0%, #7dc04f 25%, #90d266 50%, #79bd4b 75%, #86c95a 100%)',
      }}
    >
      {/* כתמי דשא + נהרות */}
      <svg width="100%" height="100%" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {Array.from({ length: Math.round(height / 130) }, (_, i) => (
          <ellipse
            key={`blob-${i}`}
            cx={(i * 41 + 17) % 100}
            cy={(i * 173 + 90) % height}
            rx={10 + (i % 5) * 4}
            ry={30 + (i % 4) * 16}
            fill={i % 2 === 0 ? 'rgba(255,255,255,0.10)' : 'rgba(20,90,20,0.10)'}
          />
        ))}
        {rivers.map((r, i) => (
          <g key={`river-${i}`}>
            <path d={riverPath(r.y)} fill="none" stroke="#cbbd8a" strokeWidth={56} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={0.9} />
            <path d={riverPath(r.y)} fill="none" stroke="#3f9ed2" strokeWidth={46} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <path d={riverPath(r.y)} fill="none" stroke="#74c3e8" strokeWidth={32} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <path d={riverPath(r.y - 3)} fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={3} strokeDasharray="12 16" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <path d={riverPath(r.y + 8)} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={2.5} strokeDasharray="8 20" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>

      {/* נוף מצויר בשוליים */}
      {SCENERY.map((Comp, i) => {
        const leftSide = i % 2 === 0;
        const x = leftSide ? 1 + ((i * 6.3) % 12) : 83 + ((i * 4.7) % 12);
        const y = 90 + i * ((height - 260) / SCENERY.length);
        const size = 54 + ((i * 13) % 42);
        return (
          <div key={`sc-${i}`} style={{ position: 'absolute', left: `${x}%`, top: y, pointerEvents: 'none' }}>
            <Comp size={size} />
          </div>
        );
      })}

      {/* רצועת המסלול */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(100%, 660px)',
        }}
      >
        <svg
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <path d={smoothPath(trailPts)} fill="none" stroke="#a97c3f" strokeWidth={30} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={0.9} />
          <path d={smoothPath(trailPts)} fill="none" stroke="#f0deac" strokeWidth={22} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {/* גוון צבע לכל מקטע יחידה */}
          {segments.map((s, i) => (
            <path key={`seg-${i}`} d={s.d} fill="none" stroke={s.color} strokeWidth={22} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={0.3} />
          ))}
          <path
            d={smoothPath(trailPts)}
            fill="none"
            stroke="#fffef5"
            strokeWidth={3}
            strokeDasharray="1 14"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.9}
          />
        </svg>

        {/* גשרים */}
        {rivers.map((r, i) => (
          <div
            key={`bridge-${i}`}
            style={{ position: 'absolute', left: `${r.bridgeX}%`, top: r.y, transform: 'translate(-50%, -52%)', pointerEvents: 'none' }}
          >
            <Bridge size={104} />
          </div>
        ))}

        {/* גביע בראש המסלול */}
        <div style={{ position: 'absolute', left: '50%', top: PAD_TOP - 92, transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none', zIndex: 3 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              background: allDone
                ? 'radial-gradient(circle at 34% 30%, #fff3b8, #f3c53d 75%)'
                : 'radial-gradient(circle at 34% 30%, #fffdf3, #e9d9b2 75%)',
              border: '4px solid #b8860b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 42,
              boxShadow: '0 5px 12px rgba(30,70,20,0.4)',
              margin: '0 auto',
            }}
          >
            🏆
          </div>
          <div style={{ marginTop: 5, background: '#7d5226', color: '#ffefc9', borderRadius: 9, padding: '3px 13px', fontSize: 13, fontWeight: 800, display: 'inline-block' }}>
            {allDone ? '🎉 המסע הושלם!' : 'סוף המסע'}
          </div>
        </div>

        {/* שלט פתיחה */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 20,
            transform: 'translateX(-50%)',
            background: '#7d5226',
            color: '#ffefc9',
            borderRadius: 12,
            padding: '8px 22px',
            fontSize: 15.5,
            fontWeight: 800,
            boxShadow: '0 4px 10px rgba(30,70,20,0.4)',
            whiteSpace: 'nowrap',
            border: '3px solid #5d3b18',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        >
          🚩 כאן מתחיל המסע!
        </div>

        {/* שלטי מקטע — בתחילת כל יחידה */}
        {UNITS.map((unit, ui) => {
          const first = UNITS.slice(0, ui).reduce((a, u) => a + u.activities.length, 0);
          const p = pts[first];
          // התחנה בחצי הימני ⇐ השלט משמאלה, ולהפך
          const anchor = p.x > 50 ? 'right' : 'left';
          const value = anchor === 'right' ? 100 - p.x + 7 : p.x + 7;
          return (
            <div
              key={`sign-${unit.id}`}
              style={{
                position: 'absolute',
                top: p.y - 14,
                [anchor]: `${value}%`,
                transform: 'rotate(-2.5deg)',
                zIndex: 1,
                pointerEvents: 'none',
              } as React.CSSProperties}
            >
              <div
                style={{
                  background: '#8a5a2b',
                  border: '3px solid #5d3b18',
                  borderRadius: 10,
                  color: '#ffefc9',
                  padding: '5px 13px',
                  fontSize: 13.5,
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 8px rgba(30,70,20,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <span
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: '50%',
                    background: UNIT_COLORS[ui],
                    border: '2px solid #ffefc9',
                    flexShrink: 0,
                  }}
                />
                {ui + 1}. {unit.title}
              </div>
              <div style={{ width: 6, height: 22, background: '#5d3b18', margin: '0 auto', borderRadius: 3 }} />
            </div>
          );
        })}

        {/* תחנות — פעילות אחת לכל נקודה */}
        {stations.map((s, i) => {
          const open = isOpen(s);
          const rec = progress.completed[s.act.id];
          const skipped = isSkipped(progress, s.act.id);
          const completed = !!rec && !skipped;
          const isCurrent = i === currentIdx;
          const color = UNIT_COLORS[s.unitIndex];
          const stars = completed ? starsFor(rec.score, rec.max) : 0;
          const IconComp = ACTIVITY_ICONS[s.act.type];
          const p = pts[i];

          let bg = '#ffffff';
          let ring = color;
          let iconColor = color;
          if (!open) { bg = '#e6e9df'; ring = '#a7b09b'; iconColor = '#8b937f'; }
          else if (completed) { bg = color; iconColor = '#fff'; }
          else if (skipped) { bg = '#f2f2e9'; ring = '#a7b09b'; iconColor = '#8b937f'; }

          return (
            <div
              key={s.act.id}
              className="trail-node-wrap"
              style={{ position: 'absolute', left: `${p.x}%`, top: p.y, transform: 'translate(-50%, -50%)', zIndex: 2 }}
            >
              <button
                onClick={() => open && nav(`/play/${s.unit.id}/${s.act.id}`)}
                aria-label={s.act.title}
                style={{
                  width: isCurrent ? 60 : 54,
                  height: isCurrent ? 60 : 54,
                  borderRadius: '50%',
                  border: skipped ? `3px dashed ${ring}` : `3.5px solid ${ring}`,
                  background: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: open ? 'pointer' : 'default',
                  boxShadow: isCurrent
                    ? `0 0 0 7px ${color}44, 0 5px 12px rgba(30,70,20,0.4)`
                    : '0 4px 9px rgba(30,70,20,0.35)',
                  animation: isCurrent ? 'trail-pulse 1.8s ease-in-out infinite' : 'none',
                  transition: 'transform 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => open && (e.currentTarget.style.transform = 'scale(1.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {!open ? (
                  <Lock size={22} color={iconColor} />
                ) : skipped ? (
                  <SkipForward size={22} color={iconColor} />
                ) : (
                  <IconComp size={isCurrent ? 27 : 24} color={iconColor} strokeWidth={2.4} />
                )}
                {completed && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -5,
                      left: -5,
                      width: 21,
                      height: 21,
                      borderRadius: '50%',
                      background: '#fff',
                      border: `2.5px solid ${color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={12} color={color} strokeWidth={3.2} />
                  </span>
                )}
              </button>

              {/* כוכבים */}
              {completed && (
                <div style={{ display: 'flex', gap: 1, justifyContent: 'center', marginTop: 3, filter: 'drop-shadow(0 2px 2px rgba(30,70,20,0.4))' }}>
                  {[1, 2, 3].map((k) => (
                    <Star key={k} filled={k <= stars} size={13} />
                  ))}
                </div>
              )}

              {/* שם הפעילות — בריחוף */}
              <div className="trail-tip">
                <div style={{ fontWeight: 800 }}>{s.act.title}</div>
                <div style={{ fontSize: 11.5, opacity: 0.75 }}>{s.unit.title}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

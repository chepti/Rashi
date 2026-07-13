import React from 'react';
import { UNITS } from '../data/units';
import type { ProgressData } from '../lib/api';
import { unitDoneCount, unitUnlocked, unitCompleted, isSkipped } from '../lib/progressUtil';
import { starsFor } from '../games/ui';
import { nav } from '../App';

// מפת מסע משחקית: שביל מתפתל על רקע מגילה עתיקה, מלמטה למעלה.
// כל יחידה — אבן-דרך על המסלול, עם הכוכבים שהושגו בה.

const NODE_GAP = 132;        // מרווח אנכי בין תחנות (px)
const PAD_TOP = 90;          // מקום לגביע בראש המפה
const PAD_BOTTOM = 84;       // מקום לשלט הפתיחה למטה

interface Pt { x: number; y: number }

/** מיקומי התחנות: מלמטה למעלה, מתפתלים ימינה-שמאלה */
function nodePositions(count: number, height: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < count; i++) {
    const y = height - PAD_BOTTOM - i * NODE_GAP;
    const x = 50 + 31 * Math.sin(i * 1.15 + 0.65);
    pts.push({ x, y });
  }
  return pts;
}

/** בניית path חלק דרך הנקודות (Catmull-Rom → Bezier) */
function smoothPath(pts: Pt[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/** כוכבים שהושגו ביחידה (רק פעילויות שבוצעו באמת, בלי דילוגים) */
function unitStars(progress: ProgressData, unitIndex: number): number {
  const unit = UNITS[unitIndex];
  let score = 0, max = 0;
  for (const a of unit.activities) {
    const rec = progress.completed[a.id];
    if (rec && !isSkipped(progress, a.id)) {
      score += rec.score;
      max += rec.max;
    }
  }
  if (max === 0) return 0;
  return starsFor(score, max);
}

export default function JourneyTrail({ progress }: { progress: ProgressData }) {
  const count = UNITS.length;
  const height = PAD_TOP + PAD_BOTTOM + (count - 1) * NODE_GAP + 60;
  const pts = nodePositions(count, height);

  // התחנה ה"נוכחית" — הראשונה שפתוחה ולא הושלמה
  const currentIdx = UNITS.findIndex((u, i) => unitUnlocked(progress, i) && !unitCompleted(progress, u));

  // נקודת סיום השביל: הגביע מעל התחנה האחרונה
  const trailPts = [...pts, { x: 50, y: PAD_TOP - 42 }];

  return (
    <div
      style={{
        position: 'relative',
        maxWidth: 560,
        margin: '0 auto',
        height,
        borderRadius: 22,
        overflow: 'hidden',
        background: 'linear-gradient(175deg, #f3e6c8 0%, #ecd9ae 30%, #f2e3c2 60%, #e7d3a4 100%)',
        boxShadow: 'inset 0 0 70px rgba(120, 82, 30, 0.35), var(--shadow-lg)',
        border: '3px solid #b08d57',
      }}
    >
      {/* מרקם קלף עתיק */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.35, pointerEvents: 'none' }}>
        <filter id="parchment">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="7" />
          <feColorMatrix
            values="0 0 0 0 0.45
                    0 0 0 0 0.33
                    0 0 0 0 0.16
                    0 0 0 0.5 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#parchment)" />
      </svg>

      {/* השביל */}
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <path d={smoothPath(trailPts)} fill="none" stroke="#8a6335" strokeWidth={30} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={0.55} />
        <path d={smoothPath(trailPts)} fill="none" stroke="#d9bb84" strokeWidth={22} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path
          d={smoothPath(trailPts)}
          fill="none"
          stroke="#8a6335"
          strokeWidth={3}
          strokeDasharray="1 14"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity={0.65}
        />
      </svg>

      {/* קישוטים */}
      {['🌿', '🏺', '🕯️', '🌿', '📜', '🪶', '🌿'].map((em, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${i % 2 === 0 ? 5 + (i * 3) % 12 : 82 + (i * 5) % 12}%`,
            top: PAD_TOP + 30 + i * ((height - PAD_TOP - PAD_BOTTOM - 40) / 7),
            fontSize: 25,
            opacity: 0.5,
            pointerEvents: 'none',
            filter: 'sepia(0.4)',
          }}
        >
          {em}
        </span>
      ))}

      {/* גביע בראש המסלול */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: PAD_TOP - 52,
          transform: 'translateX(-50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontSize: 44, filter: currentIdx === -1 ? 'none' : 'grayscale(0.6) opacity(0.75)' }}>🏆</div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#6b4f26' }}>
          {currentIdx === -1 ? 'המסע הושלם!' : 'סוף המסע'}
        </div>
      </div>

      {/* שלט פתיחה למטה */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 12,
          transform: 'translateX(-50%)',
          background: '#8a6335',
          color: '#f6ecd4',
          borderRadius: 10,
          padding: '5px 18px',
          fontSize: 13.5,
          fontWeight: 700,
          boxShadow: 'var(--shadow)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        ↓ כאן מתחיל המסע ↓
      </div>

      {/* התחנות */}
      {UNITS.map((unit, i) => {
        const unlocked = unitUnlocked(progress, i);
        const completed = unitCompleted(progress, unit);
        const isCurrent = i === currentIdx;
        const stars = unitStars(progress, i);
        const done = unitDoneCount(progress, unit);
        const p = pts[i];
        const labelSide = p.x > 50 ? 'right' : 'left';
        return (
          <div
            key={unit.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: p.y,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 2,
            }}
          >
            <button
              onClick={() => unlocked && nav(`/unit/${unit.id}`)}
              title={`${unit.title} — ${unit.subtitle}`}
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                border: completed ? '4px solid #b8860b' : isCurrent ? '4px solid var(--teal)' : '4px solid #9c7b48',
                background: completed
                  ? 'radial-gradient(circle at 34% 30%, #ffe9a8, #e6b93f 70%)'
                  : unlocked
                    ? 'radial-gradient(circle at 34% 30%, #fffdf3, #e8d5ac 75%)'
                    : 'radial-gradient(circle at 34% 30%, #d8d2c4, #b3ab99 75%)',
                fontSize: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: unlocked ? 'pointer' : 'default',
                boxShadow: isCurrent
                  ? '0 0 0 7px rgba(15, 118, 110, 0.25), var(--shadow-lg)'
                  : '0 3px 8px rgba(90, 62, 20, 0.4)',
                animation: isCurrent ? 'trail-pulse 1.8s ease-in-out infinite' : 'none',
                transition: 'transform 0.15s',
                position: 'relative',
              }}
              onMouseEnter={(e) => unlocked && (e.currentTarget.style.transform = 'scale(1.09)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {unlocked ? unit.icon : '🔒'}
              {/* מספר התחנה — חותם קטן */}
              <span
                style={{
                  position: 'absolute',
                  top: -7,
                  right: -7,
                  width: 25,
                  height: 25,
                  borderRadius: '50%',
                  background: '#6b4f26',
                  color: '#f6ecd4',
                  fontSize: 13.5,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #f6ecd4',
                }}
              >
                {i + 1}
              </span>
              {completed && (
                <span style={{ position: 'absolute', bottom: -6, left: -6, fontSize: 19 }}>✅</span>
              )}
            </button>

            {/* כוכבים שהושגו */}
            <div style={{ height: 20, fontSize: 15, letterSpacing: 1, marginTop: 3, textShadow: '0 1px 2px rgba(90,62,20,0.5)' }}>
              {stars > 0 && '⭐'.repeat(stars)}
              {stars === 0 && unlocked && !completed && done > 0 && (
                <span style={{ fontSize: 12, fontWeight: 700, color: '#6b4f26' }}>{done}/{unit.activities.length}</span>
              )}
            </div>

            {/* שם התחנה — שלט קלף */}
            <button
              onClick={() => unlocked && nav(`/unit/${unit.id}`)}
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                [labelSide === 'right' ? 'right' : 'left']: 84,
                background: unlocked ? 'rgba(255, 251, 238, 0.92)' : 'rgba(230, 223, 205, 0.75)',
                border: `2px solid ${isCurrent ? 'var(--teal)' : '#b08d57'}`,
                borderRadius: 10,
                padding: '6px 12px',
                textAlign: labelSide === 'right' ? 'left' : 'right',
                cursor: unlocked ? 'pointer' : 'default',
                maxWidth: 150,
                boxShadow: 'var(--shadow)',
                whiteSpace: 'nowrap',
              } as React.CSSProperties}
            >
              <div style={{ fontSize: 14.5, fontWeight: 900, color: '#4a3416' }}>{unit.title}</div>
              {unit.newLetters.length > 0 && unit.newLetters.length <= 4 && (
                <div className="rashi-font" style={{ fontSize: 19, color: 'var(--teal-dark)', lineHeight: 1.1 }}>
                  {unit.newLetters.join(' ')}
                </div>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

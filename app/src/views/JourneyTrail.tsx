import React from 'react';
import { UNITS } from '../data/units';
import type { ProgressData } from '../lib/api';
import { unitDoneCount, unitUnlocked, unitCompleted, isSkipped } from '../lib/progressUtil';
import { starsFor } from '../games/ui';
import { nav } from '../App';

// מפת מסע משחקית במסך מלא: אחו ירוק, נהר, גשרים, עצים ופרחים.
// השביל מטפס מתחתית המפה למעלה; כל יחידה — תחנה עם כוכבים.

const NODE_GAP = 158;        // מרווח אנכי בין תחנות (px)
const PAD_TOP = 150;         // מקום לגביע בראש המפה
const PAD_BOTTOM = 120;      // מקום לשלט הפתיחה למטה

interface Pt { x: number; y: number }

export function trailHeight(): number {
  return PAD_TOP + PAD_BOTTOM + (UNITS.length - 1) * NODE_GAP;
}

/** מיקומי התחנות: מלמטה למעלה, מתפתלים ימינה-שמאלה (באחוזי רוחב המסלול) */
function nodePositions(count: number, height: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < count; i++) {
    const y = height - PAD_BOTTOM - i * NODE_GAP;
    const x = 50 + 30 * Math.sin(i * 1.15 + 0.65);
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

// עצים, פרחים וחיות בשולי המפה — דטרמיניסטי כדי שהמפה תיראה זהה בכל טעינה
const DECOR = ['🌳', '🌲', '🌷', '🍄', '🌳', '🦋', '🌼', '🪨', '🌲', '🐞', '🌸', '🌳', '🌻', '🐿️', '🍄', '🌲', '🌷', '🌳', '🦔', '🌼', '🌳', '🪨', '🌸', '🌲'];

export default function JourneyTrail({ progress }: { progress: ProgressData }) {
  const count = UNITS.length;
  const height = trailHeight();
  const pts = nodePositions(count, height);

  const currentIdx = UNITS.findIndex((u, i) => unitUnlocked(progress, i) && !unitCompleted(progress, u));

  // נקודת סיום השביל: הגביע מעל התחנה האחרונה
  const trailPts = [...pts, { x: 50, y: PAD_TOP - 62 }];

  // נהרות חוצים בין תחנות 3–4 ובין 6–7 (מלמטה), עם גשר במקום שבו השביל חוצה
  const rivers = [2, 5].map((i) => ({
    y: height - PAD_BOTTOM - (i + 0.5) * NODE_GAP,
    bridgeX: (pts[i].x + pts[i + 1].x) / 2,
  }));

  const riverPath = (y: number) =>
    `M -5 ${y} q 12 -13 25 0 t 25 0 t 25 0 t 25 0 t 25 0`;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #86ca58 0%, #79c04c 30%, #8bd05f 55%, #76bd49 80%, #83c955 100%)',
      }}
    >
      {/* כתמי דשא ובהובים — נותנים עומק לאחו */}
      <svg width="100%" height="100%" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {Array.from({ length: 26 }, (_, i) => (
          <ellipse
            key={`blob-${i}`}
            cx={(i * 37 + 13) % 100}
            cy={(i * 149 + 80) % height}
            rx={9 + (i % 5) * 4}
            ry={26 + (i % 4) * 14}
            fill={i % 2 === 0 ? 'rgba(255,255,255,0.09)' : 'rgba(20,90,20,0.09)'}
          />
        ))}
        {/* נהרות */}
        {rivers.map((r, i) => (
          <g key={`river-${i}`}>
            <path d={riverPath(r.y)} fill="none" stroke="#4aa7d8" strokeWidth={44} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <path d={riverPath(r.y)} fill="none" stroke="#7fc8ea" strokeWidth={30} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <path d={riverPath(r.y - 4)} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={3} strokeDasharray="10 14" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>

      {/* קישוטים — עצים, פרחים, חיות בשוליים */}
      {DECOR.map((em, i) => {
        const leftSide = i % 2 === 0;
        const x = leftSide ? 1.5 + ((i * 7) % 13) : 84 + ((i * 5) % 13);
        const y = 60 + i * ((height - 160) / DECOR.length);
        const size = 26 + (i % 4) * 9;
        return (
          <span
            key={`decor-${i}`}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: y,
              fontSize: size,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 3px 3px rgba(0,60,0,0.25))',
            }}
          >
            {em}
          </span>
        );
      })}

      {/* המסלול — רצועה מרכזית שבה השביל והתחנות */}
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
          <path d={smoothPath(trailPts)} fill="none" stroke="#a97c3f" strokeWidth={32} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={0.85} />
          <path d={smoothPath(trailPts)} fill="none" stroke="#f0deac" strokeWidth={24} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path
            d={smoothPath(trailPts)}
            fill="none"
            stroke="#c49d5e"
            strokeWidth={3}
            strokeDasharray="1 15"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.8}
          />
        </svg>

        {/* גשרי עץ מעל הנהרות */}
        {rivers.map((r, i) => (
          <div
            key={`bridge-${i}`}
            style={{
              position: 'absolute',
              left: `${r.bridgeX}%`,
              top: r.y,
              transform: 'translate(-50%, -50%)',
              width: 62,
              height: 86,
              borderRadius: 14,
              background: 'repeating-linear-gradient(180deg, #c68e4c 0 12px, #a9713a 12px 15px)',
              border: '4px solid #7d5226',
              boxShadow: '0 5px 10px rgba(30, 60, 90, 0.4)',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* גביע בראש המסלול */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: PAD_TOP - 84,
            transform: 'translateX(-50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: 86,
              height: 86,
              borderRadius: '50%',
              background: currentIdx === -1
                ? 'radial-gradient(circle at 34% 30%, #fff3b8, #f3c53d 75%)'
                : 'radial-gradient(circle at 34% 30%, #fffdf3, #e9d9b2 75%)',
              border: '4px solid #b8860b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 44,
              boxShadow: '0 5px 12px rgba(30,70,20,0.4)',
              margin: '0 auto',
            }}
          >
            🏆
          </div>
          <div
            style={{
              marginTop: 5,
              background: '#7d5226',
              color: '#ffefc9',
              borderRadius: 9,
              padding: '3px 13px',
              fontSize: 13,
              fontWeight: 800,
              display: 'inline-block',
            }}
          >
            {currentIdx === -1 ? '🎉 המסע הושלם!' : 'סוף המסע'}
          </div>
        </div>

        {/* שלט פתיחה למטה */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 18,
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
          }}
        >
          🚩 כאן מתחיל המסע!
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
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  border: completed ? '4px solid #e0a010' : isCurrent ? '4px solid var(--teal)' : unlocked ? '4px solid #a97c3f' : '4px solid #8fa383',
                  background: completed
                    ? 'radial-gradient(circle at 34% 30%, #ffe9a8, #f0bf35 70%)'
                    : unlocked
                      ? 'radial-gradient(circle at 34% 30%, #ffffff, #f1e3bd 75%)'
                      : 'radial-gradient(circle at 34% 30%, #dfe5d8, #b7c2ab 75%)',
                  fontSize: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: unlocked ? 'pointer' : 'default',
                  boxShadow: isCurrent
                    ? '0 0 0 7px rgba(15, 118, 110, 0.3), 0 5px 12px rgba(30,70,20,0.4)'
                    : '0 5px 12px rgba(30,70,20,0.4)',
                  animation: isCurrent ? 'trail-pulse 1.8s ease-in-out infinite' : 'none',
                  transition: 'transform 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => unlocked && (e.currentTarget.style.transform = 'scale(1.09)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {unlocked ? unit.icon : '🔒'}
                <span
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    width: 27,
                    height: 27,
                    borderRadius: '50%',
                    background: isCurrent ? 'var(--teal)' : '#7d5226',
                    color: '#ffefc9',
                    fontSize: 14,
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2.5px solid #fffef5',
                  }}
                >
                  {i + 1}
                </span>
                {completed && (
                  <span style={{ position: 'absolute', bottom: -7, left: -7, fontSize: 21 }}>✅</span>
                )}
              </button>

              {/* כוכבים שהושגו */}
              <div style={{ height: 22, fontSize: 16, letterSpacing: 1, marginTop: 3, filter: 'drop-shadow(0 2px 2px rgba(30,70,20,0.5))' }}>
                {stars > 0 && '⭐'.repeat(stars)}
                {stars === 0 && unlocked && !completed && done > 0 && (
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 800,
                      color: '#fff',
                      background: 'rgba(60, 100, 30, 0.75)',
                      borderRadius: 999,
                      padding: '2px 9px',
                    }}
                  >
                    {done}/{unit.activities.length}
                  </span>
                )}
              </div>

              {/* שם התחנה — שלט */}
              <button
                onClick={() => unlocked && nav(`/unit/${unit.id}`)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  [labelSide === 'right' ? 'right' : 'left']: 90,
                  background: unlocked ? '#fffef7' : 'rgba(240, 240, 228, 0.82)',
                  border: `3px solid ${isCurrent ? 'var(--teal)' : completed ? '#e0a010' : '#a97c3f'}`,
                  borderRadius: 12,
                  padding: '7px 13px',
                  textAlign: labelSide === 'right' ? 'left' : 'right',
                  cursor: unlocked ? 'pointer' : 'default',
                  maxWidth: 155,
                  boxShadow: '0 4px 10px rgba(30,70,20,0.35)',
                  whiteSpace: 'nowrap',
                } as React.CSSProperties}
              >
                <div style={{ fontSize: 15, fontWeight: 900, color: '#4a3416' }}>{unit.title}</div>
                {unit.newLetters.length > 0 && unit.newLetters.length <= 4 && (
                  <div className="rashi-font" style={{ fontSize: 20, color: 'var(--teal-dark)', lineHeight: 1.1 }}>
                    {unit.newLetters.join(' ')}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

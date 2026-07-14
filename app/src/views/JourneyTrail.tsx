import React, { useEffect, useLayoutEffect, useState } from 'react';
import { UNITS } from '../data/units';
import type { ProgressData } from '../lib/api';
import { unitUnlocked, unitCompleted, unitDoneCount } from '../lib/progressUtil';
import { starsFor } from '../games/ui';
import { Lock, Check, Star, Eye, BookOpen, Trophy } from '../ui/icons';
import { nav } from '../App';

// מפת מסע גבוהה: התמונה גדולה ממסך אחד.
// הגלילה מתחילה בתחתית (ה־fold = החלק התחתון), ומתקדמים כלפי מעלה.

const BG = '/rashi/bg-journey.webp';
const BG_RATIO = 2413 / 1200; // גובה/רוחב של תמונת הרקע
/** כמה מסכי גובה התמונה תופסת — כך ב־fold נראה בערך החמישית התחתונה */
const VIEWPORTS_TALL = 4.8;

const UNIT_COLORS = ['#0d9488', '#f59e0b', '#8b5cf6', '#e05252', '#3b82f6', '#ec4899', '#16a34a', '#a16207', '#d97706'];

// מיקומי התחנות באחוזים — עוקבים אחרי השביל המצויר בתמונה, מלמטה למעלה
const NODE_POS: { x: number; y: number }[] = [
  { x: 44, y: 92 },
  { x: 40, y: 84.5 },
  { x: 48, y: 77 },
  { x: 53.5, y: 70 },
  { x: 47, y: 62.5 },
  { x: 40.5, y: 55 },
  { x: 45, y: 47.5 },
  { x: 52.5, y: 40 },
  { x: 54, y: 32.5 },
];
const TROPHY_POS = { x: 55, y: 24.5 };
const START_POS = { x: 45, y: 97.5 };

function boardSize() {
  const vh = window.innerHeight || 800;
  const h = Math.round(vh * VIEWPORTS_TALL);
  const w = Math.round(h / BG_RATIO);
  return { w, h };
}

export default function JourneyTrail({ progress }: { progress: ProgressData }) {
  const [size, setSize] = useState(boardSize);
  const currentIdx = UNITS.findIndex((u, i) => unitUnlocked(progress, i) && !unitCompleted(progress, u));
  const allDone = currentIdx === -1;

  useEffect(() => {
    const onResize = () => setSize(boardSize());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // גלילה לתחתית המפה אחרי הפריסה — ה־fold מציג את תחילת המסע
  useLayoutEffect(() => {
    const toBottom = () => {
      const top = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );
      window.scrollTo(0, top);
    };
    toBottom();
    // אחרי טעינת התמונה הגובה עלול להתייצב שוב
    const t = window.setTimeout(toBottom, 80);
    const img = new Image();
    img.src = BG;
    img.onload = toBottom;
    return () => window.clearTimeout(t);
  }, [size.h]);

  const nodeIcon = (unitIndex: number, color: string, active: boolean) => {
    const u = UNITS[unitIndex];
    const c = active ? '#fff' : color;
    if (u.id === 'similar') return <Eye size={24} color={c} strokeWidth={2.4} />;
    if (u.id === 'story') return <BookOpen size={24} color={c} strokeWidth={2.4} />;
    if (u.id === 'all') return <Trophy size={24} color={c} strokeWidth={2.4} />;
    if (u.newLetters.length >= 1 && u.newLetters.length <= 2) {
      return (
        <span className="rashi-font" style={{ fontSize: u.newLetters.length === 2 ? 22 : 28, color: c, lineHeight: 1 }}>
          {u.newLetters.join('')}
        </span>
      );
    }
    return <span style={{ fontSize: 24, fontWeight: 900, color: c }}>{unitIndex + 1}</span>;
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
      {/* רקע מטושטש מאחורי הלוח (כשהלוח רחב מהמסך — הצדדים נחתכים) */}
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

      {/* הלוח — יחס התמונה המלא, גבוה ממסך אחד; ממורכז וצדדים נחתכים במסך צר */}
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

        {UNITS.map((unit, i) => {
          const pos = NODE_POS[i];
          const unlocked = unitUnlocked(progress, i);
          const completed = unitCompleted(progress, unit);
          const isCurrent = i === currentIdx;
          const done = unitDoneCount(progress, unit);
          const color = UNIT_COLORS[i];

          let sc = 0, mx = 0;
          for (const a of unit.activities) {
            const r = progress.completed[a.id];
            if (r && !(r.max === 1 && r.score === 0)) { sc += r.score; mx += r.max; }
          }
          const stars = mx > 0 ? starsFor(sc, mx) : 0;

          let bg = 'rgba(255,255,255,0.96)';
          let ring = color;
          if (!unlocked) { bg = 'rgba(226,229,223,0.92)'; ring = '#8fa088'; }
          else if (completed) { bg = color; }

          return (
            <Marker key={unit.id} pos={pos} className="trail-node-wrap">
              <button
                onClick={() => unlocked && nav(`/unit/${unit.id}`)}
                aria-label={unit.title}
                style={{
                  width: isCurrent ? 62 : 56,
                  height: isCurrent ? 62 : 56,
                  borderRadius: '50%',
                  border: `4px solid ${completed ? '#ffffff' : ring}`,
                  background: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: unlocked ? 'pointer' : 'default',
                  boxShadow: isCurrent
                    ? `0 0 0 7px ${color}55, 0 5px 14px rgba(20,60,20,0.5)`
                    : '0 5px 14px rgba(20,60,20,0.5)',
                  animation: isCurrent ? 'trail-pulse 1.8s ease-in-out infinite' : 'none',
                  transition: 'transform 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => unlocked && (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {!unlocked ? <Lock size={22} color="#7c8873" /> : nodeIcon(i, color, completed)}

                <span
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    width: 25,
                    height: 25,
                    borderRadius: '50%',
                    background: isCurrent ? color : '#7d5226',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2.5px solid #fff',
                  }}
                >
                  {i + 1}
                </span>
                {completed && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -6,
                      left: -6,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: '#fff',
                      border: `2.5px solid ${color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={12} color={color} strokeWidth={3.4} />
                  </span>
                )}
              </button>

              <div style={{ height: 20, display: 'flex', justifyContent: 'center', gap: 1, marginTop: 4, filter: 'drop-shadow(0 2px 3px rgba(20,60,20,0.6))' }}>
                {completed ? (
                  [1, 2, 3].map((k) => <Star key={k} filled={k <= stars} size={14} />)
                ) : unlocked && done > 0 ? (
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', background: 'rgba(40,90,30,0.8)', borderRadius: 999, padding: '2px 9px' }}>
                    {done}/{unit.activities.length}
                  </span>
                ) : null}
              </div>

              <div className="trail-tip">
                <div style={{ fontWeight: 800 }}>{unit.title}</div>
                <div style={{ fontSize: 11.5, opacity: 0.8 }}>{unit.subtitle}</div>
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

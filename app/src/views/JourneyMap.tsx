import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { UNITS } from '../data/units';
import { setGuestFreeNav, type StudentSession, type ProgressData } from '../lib/api';
import { unitDoneCount, unitUnlocked, unitCompleted, overallPercent, allCompleted } from '../lib/progressUtil';
import JourneyTrail from './JourneyTrail';
import { nav } from '../App';

type MapView = 'trail' | 'list';
const LS_VIEW = 'rashi_map_view';

export default function JourneyMap({
  session,
  progress,
  onLogout,
  onSessionChange,
}: {
  session: StudentSession;
  progress: ProgressData;
  onLogout: (to?: string) => void;
  onSessionChange: (s: StudentSession) => void;
}) {
  const pct = overallPercent(progress);
  const finished = allCompleted(progress);
  const celebrated = useRef(false);
  const [view, setView] = useState<MapView>(() =>
    localStorage.getItem(LS_VIEW) === 'list' ? 'list' : 'trail'
  );

  const switchView = (v: MapView) => {
    setView(v);
    localStorage.setItem(LS_VIEW, v);
  };

  useEffect(() => {
    if (finished && !celebrated.current) {
      celebrated.current = true;
      const end = Date.now() + 1800;
      const frame = () => {
        confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0 } });
        confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [finished]);

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '20px 16px 60px' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
        <div>
          <h1 style={{ fontSize: 26 }}>
            שלום, {session.nickname} {session.emoji}! <span className="rashi-font" style={{ fontSize: 24, color: 'var(--teal)' }}>שלום</span>
          </h1>
          <p style={{ color: 'var(--ink-soft)', margin: '2px 0 0', fontSize: 14 }}>
            {session.token === 'teacher-preview'
              ? 'תצוגת מורה · כל השלבים פתוחים'
              : session.className
                ? `כיתת ${session.className}`
                : 'תרגול חופשי'}
            {' '}· הושלמו {pct}% מהמסע
            {progress.freeNav && session.token !== 'teacher-preview' ? ' · 🔓 מסלול חופשי' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {session.token === 'teacher-preview' && (
            <button className="btn secondary small" onClick={() => onLogout('/teacher')}>
              ← חזרה ללוח המורה
            </button>
          )}
          {session.token === 'guest' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--ink-soft)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!session.freeNav}
                onChange={(e) => onSessionChange(setGuestFreeNav(session, e.target.checked))}
              />
              מסלול חופשי
            </label>
          )}
          <button className="btn secondary small" onClick={() => nav('/progress')}>
            🔤 האותיות שלי
          </button>
          {session.token !== 'teacher-preview' && (
            <button className="btn small" style={{ background: 'transparent', boxShadow: 'none', color: 'var(--ink-soft)' }} onClick={() => onLogout()} title="במחשב משותף — כל תלמיד נכנס עם השם והאימוג'י שלו">
              👥 החלפת משתמש
            </button>
          )}
        </div>
      </header>

      {/* פס התקדמות כללי */}
      <div style={{ background: '#e2e8f0', borderRadius: 999, height: 14, overflow: 'hidden', marginBottom: 26 }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 999,
            background: 'linear-gradient(90deg, var(--teal), #14b8a6)',
            transition: 'width 0.6s ease',
          }}
        />
      </div>

      {finished && (
        <div className="card pop-in" style={{ textAlign: 'center', marginBottom: 22, border: '3px solid var(--gold)' }}>
          <div style={{ fontSize: 46 }}>🏆</div>
          <h2>סיימתם את כל המסע!</h2>
          <p style={{ color: 'var(--ink-soft)' }}>
            אתם קוראים כתב רש"י! אפשר לחזור לכל פעילות ולשפר את הכוכבים.
          </p>
        </div>
      )}

      {/* מתג תצוגה: מפת מסע / רשימה */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 4, background: '#eadfc8', borderRadius: 999, padding: 4 }}>
          {(['trail', 'list'] as const).map((v) => (
            <button
              key={v}
              onClick={() => switchView(v)}
              style={{
                border: 'none',
                borderRadius: 999,
                padding: '6px 16px',
                fontSize: 13.5,
                fontWeight: 700,
                background: view === v ? '#fff' : 'transparent',
                boxShadow: view === v ? 'var(--shadow)' : 'none',
                color: view === v ? '#6b4f26' : 'var(--ink-soft)',
                cursor: 'pointer',
              }}
            >
              {v === 'trail' ? '🗺️ מפת מסע' : '☰ רשימה'}
            </button>
          ))}
        </div>
      </div>

      {view === 'trail' && <JourneyTrail progress={progress} />}

      <div style={{ display: view === 'list' ? 'flex' : 'none', flexDirection: 'column', gap: 14 }}>
        {UNITS.map((unit, i) => {
          const unlocked = unitUnlocked(progress, i);
          const done = unitDoneCount(progress, unit);
          const completed = unitCompleted(progress, unit);
          return (
            <button
              key={unit.id}
              onClick={() => unlocked && nav(`/unit/${unit.id}`)}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                textAlign: 'right',
                border: completed ? '2px solid var(--green)' : '2px solid transparent',
                opacity: unlocked ? 1 : 0.55,
                cursor: unlocked ? 'pointer' : 'default',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => unlocked && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
            >
              <div
                style={{
                  fontSize: 34,
                  width: 62,
                  height: 62,
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: completed ? 'var(--green-soft)' : unlocked ? 'var(--teal-soft)' : '#e2e8f0',
                  flexShrink: 0,
                }}
              >
                {unlocked ? unit.icon : '🔒'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: 19 }}>{i + 1}. {unit.title}</h3>
                  {unit.newLetters.length > 0 && unit.newLetters.length <= 4 && (
                    <span className="rashi-font" style={{ color: 'var(--teal)', fontSize: 22 }}>
                      {unit.newLetters.join(' ')}
                    </span>
                  )}
                </div>
                <p style={{ margin: '2px 0 8px', color: 'var(--ink-soft)', fontSize: 14 }}>{unit.subtitle}</p>
                <div style={{ display: 'flex', gap: 4 }}>
                  {unit.activities.map((a) => (
                    <span
                      key={a.id}
                      style={{
                        height: 7,
                        flex: 1,
                        maxWidth: 46,
                        borderRadius: 4,
                        background: progress.completed[a.id] ? 'var(--green)' : '#e2e8f0',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: completed ? 'var(--green)' : 'var(--ink-soft)', flexShrink: 0 }}>
                {completed ? '✓ הושלם' : unlocked ? `${done}/${unit.activities.length}` : ''}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

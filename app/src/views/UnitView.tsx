import React, { useState } from 'react';
import { UNITS } from '../data/units';
import { reportAttempt, type ProgressData, type StudentSession } from '../lib/api';
import { isSkipped, SKIP_RECORD } from '../lib/progressUtil';
import { starsFor } from '../games/ui';
import { nav } from '../App';

const TYPE_ICONS: Record<string, string> = {
  intro: '🃏',
  flashcards: '✏️',
  wordsearch: '🔍',
  match: '🧲',
  memory: '🧠',
  story: '📖',
  order: '🔢',
  paint: '🎨',
  quiz: '❓',
};

export default function UnitView({
  unitId,
  progress,
  session,
  onReported,
}: {
  unitId: string;
  progress: ProgressData;
  session: StudentSession;
  onReported: () => void;
}) {
  const unit = UNITS.find((u) => u.id === unitId);
  const [busySkip, setBusySkip] = useState<string | null>(null);
  if (!unit) {
    nav('/map');
    return null;
  }

  const skip = async (activityId: string) => {
    setBusySkip(activityId);
    try {
      await reportAttempt(session, activityId, unit.id, SKIP_RECORD.score, SKIP_RECORD.max, {});
      onReported();
    } finally {
      setBusySkip(null);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 60px' }}>
      <button className="btn small" style={{ background: 'transparent', boxShadow: 'none', color: 'var(--teal-dark)', fontWeight: 700 }} onClick={() => nav('/map')}>
        → חזרה למפת המסע
      </button>
      <div style={{ textAlign: 'center', margin: '10px 0 24px' }}>
        <div style={{ fontSize: 52 }}>{unit.icon}</div>
        <h1 style={{ fontSize: 28 }}>{unit.title}</h1>
        <p style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{unit.subtitle}</p>
        {unit.newLetters.length > 0 && unit.newLetters.length <= 4 && (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 10 }}>
            {unit.newLetters.map((l) => (
              <div key={l} className="card" style={{ padding: '10px 16px', display: 'flex', gap: 10, alignItems: 'baseline' }}>
                <span className="rashi-font" style={{ fontSize: 34, color: 'var(--teal-dark)' }}>{l}</span>
                <span style={{ fontSize: 15, color: 'var(--ink-soft)' }}>=</span>
                <span style={{ fontSize: 26, fontWeight: 700 }}>{l}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {unit.activities.map((a, i) => {
          const rec = progress.completed[a.id];
          const skipped = isSkipped(progress, a.id);
          // פעילות פתוחה אם: מסלול חופשי, הראשונה, או שהקודמת הושלמה/דולגה
          const open = !!progress.freeNav || i === 0 || !!progress.completed[unit.activities[i - 1].id];
          return (
            <div
              key={a.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                opacity: open ? 1 : 0.5,
                border: rec && !skipped ? '2px solid var(--green)' : '2px solid transparent',
                padding: '16px 18px',
              }}
            >
              <button
                onClick={() => open && nav(`/play/${unit.id}/${a.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  textAlign: 'right',
                  cursor: open ? 'pointer' : 'default',
                  padding: 0,
                }}
              >
                <span style={{ fontSize: 30 }}>{open ? TYPE_ICONS[a.type] : '🔒'}</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 17 }}>{a.title}</h3>
                  <p style={{ margin: '2px 0 0', fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                    {a.instructions.length > 90 ? a.instructions.slice(0, 90) + '…' : a.instructions}
                  </p>
                </div>
              </button>
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                {rec && !skipped && <span style={{ fontSize: 20 }}>{'⭐'.repeat(starsFor(rec.score, rec.max))}</span>}
                {skipped && <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 700 }}>⏭️ דולג</span>}
                {open && !rec && (
                  <button
                    onClick={() => skip(a.id)}
                    disabled={busySkip === a.id}
                    title="סימון הפעילות כ'בחרתי לדלג' — אפשר לחזור אליה בכל שלב"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--ink-soft)',
                      fontSize: 12.5,
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                  >
                    {busySkip === a.id ? '...' : 'דלגו ⏭️'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

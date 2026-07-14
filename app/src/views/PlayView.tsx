import React from 'react';
import { UNITS } from '../data/units';
import GameHost from '../games/GameHost';
import { reportAttempt, type StudentSession } from '../lib/api';
import type { ActivityResult } from '../data/types';
import { nav } from '../App';
import { SoftPageShell } from '../ui/PageShell';

export default function PlayView({
  unitId,
  activityId,
  session,
  onReported,
}: {
  unitId: string;
  activityId: string;
  session: StudentSession;
  onReported: () => void;
}) {
  const unit = UNITS.find((u) => u.id === unitId);
  const activity = unit?.activities.find((a) => a.id === activityId);
  if (!unit || !activity) {
    nav('/map');
    return null;
  }

  const done = async (r: ActivityResult) => {
    try {
      await reportAttempt(session, activity.id, unit.id, r.score, r.max, r.letters);
    } catch {
      // גם אם הדיווח נכשל — לא חוסמים את הילד
    }
    onReported();
    sessionStorage.setItem('rashi_focus_act', activity.id);
    nav('/map');
  };

  return (
    <SoftPageShell opacity={0.14}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '20px 16px 60px' }}>
        <button
          className="btn small"
          style={{ background: 'transparent', boxShadow: 'none', color: 'var(--teal-dark)', fontWeight: 700 }}
          onClick={() => {
            sessionStorage.setItem('rashi_focus_act', activity.id);
            nav('/map');
          }}
        >
          → חזרה למפת המסע
        </button>
        <GameHost key={activity.id} activity={activity} onDone={done} />
      </div>
    </SoftPageShell>
  );
}

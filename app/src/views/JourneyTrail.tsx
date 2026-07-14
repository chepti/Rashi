import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { UNITS } from '../data/units';
import type { Unit, Activity } from '../data/types';
import type { ProgressData } from '../lib/api';
import { unitUnlocked, isSkipped } from '../lib/progressUtil';
import { starsFor } from '../games/ui';
import { ACTIVITY_ICONS, Lock, Check, Star3D, Trophy } from '../ui/icons';
import {
  BG, UNIT_COLORS, TROPHY_POS, START_POS, CLOUD_COVER,
  boardSize, loadStationPositions, type Pt,
} from '../lib/pathLayout';
import { nav } from '../App';

interface Station {
  unit: Unit;
  unitIndex: number;
  act: Activity;
  actIndex: number;
  globalIndex: number;
  pos: Pt;
}

/** כוכבים צמודים מעל העיגול — רדיוס קטן כדי שלא ייחתכו */
function StarArc({ count }: { count: number }) {
  const angles = [-28, 0, 28];
  const radius = 20;
  return (
    <div className="trail-star-arc" aria-hidden>
      {angles.map((deg, i) => {
        const a = (deg * Math.PI) / 180;
        const x = Math.sin(a) * radius;
        const y = -Math.cos(a) * radius + 2;
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `translate(-50%, -50%) rotate(${deg * 0.3}deg)`,
            }}
          >
            <Star3D filled={i < count} size={i === 1 ? 18 : 15} />
          </span>
        );
      })}
    </div>
  );
}

export default function JourneyTrail({ progress }: { progress: ProgressData }) {
  const [size, setSize] = useState(boardSize);
  const [positions, setPositions] = useState<Pt[]>(() => loadStationPositions());

  useEffect(() => {
    const sync = () => setPositions(loadStationPositions());
    window.addEventListener('rashi-path', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('rashi-path', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const stations: Station[] = useMemo(() => {
    const flat: Omit<Station, 'pos'>[] = [];
    UNITS.forEach((unit, unitIndex) =>
      unit.activities.forEach((act, actIndex) =>
        flat.push({ unit, unitIndex, act, actIndex, globalIndex: flat.length })
      )
    );
    return flat.map((s, i) => ({ ...s, pos: positions[i] || { x: 50, y: 50 } }));
  }, [positions]);

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
          x: Math.min(84, Math.max(16, first.pos.x + side * 6)),
          y: Math.max(2, first.pos.y - 1.8),
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
        style={{
          position: 'relative',
          zIndex: 1,
          width: size.w,
          height: size.h,
          margin: '0 auto',
          backgroundImage: `url(${BG})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: `${CLOUD_COVER.x}%`,
            top: `${CLOUD_COVER.y}%`,
            transform: 'translate(-50%, -50%)',
            width: '10%',
            height: '3.8%',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <svg viewBox="0 0 180 80" width="100%" height="100%" style={{ overflow: 'visible' }}>
            <ellipse cx="90" cy="40" rx="50" ry="26" fill="rgba(253,250,240,0.97)" />
            <ellipse cx="62" cy="48" rx="34" ry="18" fill="rgba(253,250,240,0.95)" />
            <ellipse cx="118" cy="46" rx="36" ry="20" fill="rgba(253,250,240,0.95)" />
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
                width: 58,
                height: 58,
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
              <Trophy size={28} color="#b8860b" strokeWidth={2.2} />
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
                maxWidth: 130,
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

          const nodeSize = isCurrent ? 48 : 42;

          return (
            <Marker key={s.act.id} pos={s.pos} className="trail-node-wrap" ground id={`station-${s.act.id}`}>
              {done && !skipped && <StarArc count={stars} />}

              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: -3,
                  width: nodeSize * 0.8,
                  height: 10,
                  transform: 'translateX(-50%)',
                  background: 'radial-gradient(ellipse, rgba(40,60,20,0.4) 0%, rgba(40,60,20,0) 70%)',
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
                    ? `0 0 0 5px ${color}55, 0 5px 10px rgba(20,60,20,0.45)`
                    : '0 4px 10px rgba(20,60,20,0.4)',
                  animation: isCurrent ? 'trail-pulse 1.8s ease-in-out infinite' : 'none',
                  transition: 'transform 0.15s',
                  position: 'relative',
                  overflow: 'visible',
                }}
                onMouseEnter={(e) => open && (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {!open ? (
                  <Lock size={16} color="#7c8873" />
                ) : (
                  <Icon size={19} color={done && !skipped ? '#fff' : color} strokeWidth={2.3} />
                )}

                {done && !skipped && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -4,
                      left: -4,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#fff',
                      border: `2px solid ${color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={9} color={color} strokeWidth={3.4} />
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
        overflow: 'visible',
      }}
    >
      {children}
    </div>
  );
}

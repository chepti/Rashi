import React from 'react';
import { nav } from '../App';
import { HeroBg } from '../ui/PageShell';

export default function Landing() {
  return (
    <HeroBg image="/rashi/bg-landing.webp">
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div className="pop-in" style={{ textAlign: 'center', color: '#fff', marginBottom: 36 }}>
          <div className="rashi-font" style={{ fontSize: 84, lineHeight: 1, marginBottom: 8, textShadow: '0 4px 22px rgba(0,0,0,0.45)' }}>
            שלום
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 900, textShadow: '0 2px 14px rgba(0,0,0,0.4)' }}>מסע כתב רש"י</h1>
          <p style={{ fontSize: 19, opacity: 0.95, maxWidth: 460, margin: '10px auto 0', lineHeight: 1.6, textShadow: '0 1px 8px rgba(0,0,0,0.35)' }}>
            לומדים לקרוא כתב רש"י צעד אחר צעד — מהאותיות המוכרות ועד קריאה שוטפת, במשחקים ובכיף
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 340 }}>
          <button className="btn gold" style={{ fontSize: 20, padding: '16px 28px' }} onClick={() => nav('/join')}>
            🎒 יש לי קוד כיתה — יוצאים לדרך!
          </button>
          <button
            className="btn"
            style={{ background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.65)', backdropFilter: 'blur(6px)' }}
            onClick={() => nav('/join/guest')}
          >
            תרגול חופשי בלי כיתה
          </button>
          <button
            className="btn"
            style={{ background: 'transparent', boxShadow: 'none', fontSize: 15, opacity: 0.9 }}
            onClick={() => nav('/teacher')}
          >
            👩‍🏫 כניסת מורים
          </button>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 40, textShadow: '0 1px 6px rgba(0,0,0,0.35)' }}>
          מבוסס על אתר תרגול כתב רש"י ועל חוברת העבודה של הרב מרדכי שמואל בלוך
        </p>
      </div>
    </HeroBg>
  );
}

import React from 'react';
import { nav } from '../App';

export default function Landing() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'linear-gradient(170deg, #134e4a 0%, #0f766e 55%, #14b8a6 100%)',
      }}
    >
      <div className="pop-in" style={{ textAlign: 'center', color: '#fff', marginBottom: 36 }}>
        <div className="rashi-font" style={{ fontSize: 84, lineHeight: 1, marginBottom: 8, textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          שלום
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 900 }}>מסע כתב רש"י</h1>
        <p style={{ fontSize: 19, opacity: 0.92, maxWidth: 460, margin: '10px auto 0', lineHeight: 1.6 }}>
          לומדים לקרוא כתב רש"י צעד אחר צעד — מהאותיות המוכרות ועד קריאה שוטפת, במשחקים ובכיף
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 340 }}>
        <button className="btn gold" style={{ fontSize: 20, padding: '16px 28px' }} onClick={() => nav('/join')}>
          🎒 יש לי קוד כיתה — יוצאים לדרך!
        </button>
        <button
          className="btn"
          style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.6)' }}
          onClick={() => nav('/join/guest')}
        >
          תרגול חופשי בלי כיתה
        </button>
        <button
          className="btn"
          style={{ background: 'transparent', boxShadow: 'none', fontSize: 15, opacity: 0.85 }}
          onClick={() => nav('/teacher')}
        >
          👩‍🏫 כניסת מורים
        </button>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 40 }}>
        מבוסס על אתר תרגול כתב רש"י ועל חוברת העבודה של הרב מרדכי שמואל בלוך
      </p>
    </div>
  );
}

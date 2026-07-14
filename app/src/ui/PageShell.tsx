import React from 'react';

/** מעטפת עמוד עם רקע מאויר בשקיפות גבוהה */
export function SoftPageShell({
  children,
  image = '/rashi/bg-pages.webp',
  opacity = 0.16,
  overlay = 'rgba(248, 245, 238, 0.82)',
}: {
  children: React.ReactNode;
  image?: string;
  opacity?: number;
  /** שכבת נייר מעל הרקע לקריאות */
  overlay?: string;
}) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: overlay,
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

/** רקע מלא לדפי כניסה — עם הצללה לקריאות טקסט */
export function HeroBg({
  children,
  image,
  overlay = 'linear-gradient(170deg, rgba(15,40,30,0.55) 0%, rgba(20,70,55,0.45) 45%, rgba(30,90,70,0.55) 100%)',
}: {
  children: React.ReactNode;
  image: string;
  overlay?: string;
}) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: overlay,
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>{children}</div>
    </div>
  );
}

import { useCompass } from '@/hooks/use-compass';
import { useGeolocation, calculateQibla } from '@/hooks/use-geolocation';
import { ArrowLeft, MapPin, RotateCcw } from 'lucide-react';
import { Link } from 'wouter';
import { useEffect, useRef } from 'react';

/* ── Realistic Kaaba SVG (upright, not tilted) ──────────────── */
function KaabaIcon({ size = 56 }: { size?: number }) {
  const w = size;
  const h = size * 1.1;
  return (
    <svg width={w} height={h} viewBox="0 0 56 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main black body */}
      <rect x="3" y="6" width="50" height="52" rx="2" fill="#1a1a1a"/>

      {/* Gold Kiswah band (horizontal belt) */}
      <rect x="3" y="18" width="50" height="12" fill="#B8860B"/>
      {/* Kiswah highlight top */}
      <rect x="3" y="18" width="50" height="1.8" fill="#D4A017" opacity="0.85"/>
      {/* Kiswah highlight bottom */}
      <rect x="3" y="28" width="50" height="1.2" fill="#8a6200" opacity="0.6"/>

      {/* Calligraphy lines on band */}
      <rect x="6"  y="21" width="44" height="1" rx="0.5" fill="#7A5800" opacity="0.75"/>
      <rect x="6"  y="23.5" width="44" height="1" rx="0.5" fill="#7A5800" opacity="0.75"/>
      <rect x="6"  y="26" width="44" height="1" rx="0.5" fill="#7A5800" opacity="0.75"/>

      {/* Diamond ornaments on band */}
      {[13, 21, 29, 37, 45].map(x => (
        <polygon key={x}
          points={`${x},21.5 ${x+3},24 ${x},26.5 ${x-3},24`}
          fill="#D4A017" opacity="0.55"
        />
      ))}

      {/* Corner vertical stripes */}
      <rect x="3"  y="6" width="3.5" height="52" fill="#B8860B" opacity="0.35"/>
      <rect x="49.5" y="6" width="3.5" height="52" fill="#B8860B" opacity="0.35"/>

      {/* Golden door frame */}
      <rect x="17" y="34" width="22" height="24" rx="1.5" fill="#C19A6B"/>
      {/* Door arch */}
      <path d="M17 44 Q28 30 39 44" fill="#C19A6B"/>
      {/* Door inner panel */}
      <rect x="19.5" y="37" width="17" height="17" rx="1" fill="#7A5200"/>
      {/* Inner arch */}
      <path d="M19.5 44 Q28 33 38.5 44" fill="#7A5200"/>
      {/* Door handle */}
      <circle cx="28" cy="49" r="1.8" fill="#D4A017"/>
      {/* Handle ring */}
      <circle cx="28" cy="49" r="1.8" stroke="#B8860B" strokeWidth="0.6" fill="none"/>

      {/* Roof / top gold trim */}
      <rect x="2" y="3" width="52" height="5" rx="1.2" fill="#B8860B" opacity="0.95"/>
      <rect x="2" y="3" width="52" height="1.8" rx="0.9" fill="#D4A017" opacity="0.85"/>

      {/* Corner stone base left */}
      <rect x="3"  y="55" width="7" height="3" rx="0.5" fill="#333"/>
      {/* Corner stone base right */}
      <rect x="46" y="55" width="7" height="3" rx="0.5" fill="#333"/>
    </svg>
  );
}

/* ── Compass face (static background) ───────────────────────── */
function CompassFace({ isAligned }: { isAligned: boolean }) {
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const angle = i * 5;
    const isCardinal = angle % 90 === 0;
    const isMinor    = angle % 45 === 0;
    const outerR = 122;
    const innerR = isCardinal ? 106 : isMinor ? 112 : 117;
    const rad    = (angle * Math.PI) / 180;
    return {
      x1: 130 + outerR * Math.sin(rad),
      y1: 130 - outerR * Math.cos(rad),
      x2: 130 + innerR * Math.sin(rad),
      y2: 130 - innerR * Math.cos(rad),
      isCardinal, isMinor, angle,
    };
  });

  const ringColor = isAligned ? '#4ade80' : '#C19A6B';

  return (
    <svg viewBox="0 0 260 260" className="absolute inset-0 w-full h-full">
      <defs>
        <radialGradient id="compassBg2" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="var(--card)" stopOpacity="1"/>
          <stop offset="100%" stopColor="var(--background)" stopOpacity="1"/>
        </radialGradient>
      </defs>

      {/* Background circle */}
      <circle cx="130" cy="130" r="126" fill="url(#compassBg2)"/>

      {/* Outer ring */}
      <circle cx="130" cy="130" r="124" fill="none" stroke={ringColor} strokeWidth="2.5" opacity={isAligned ? 0.9 : 0.5}
        style={{ transition: 'stroke 0.5s, opacity 0.5s' }}
      />

      {/* Inner decorative ring */}
      <circle cx="130" cy="130" r="96" fill="none" stroke={ringColor} strokeWidth="0.6" opacity="0.2"/>

      {/* Tick marks */}
      {ticks.map((t, i) => (
        <line key={i}
          x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={t.isCardinal ? 'var(--primary)' : t.isMinor ? 'var(--primary)' : 'var(--border)'}
          strokeWidth={t.isCardinal ? 2.5 : t.isMinor ? 1.5 : 0.8}
          opacity={t.isCardinal ? 1 : t.isMinor ? 0.6 : 0.4}
        />
      ))}

      {/* Cardinal labels – FIXED (background doesn't rotate) */}
      <text x="130" y="14" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="bold" fontFamily="Tajawal,sans-serif">ش</text>
      <text x="248" y="135" textAnchor="middle" fill="var(--primary)" fontSize="12" fontFamily="Tajawal,sans-serif">ق</text>
      <text x="130" y="250" textAnchor="middle" fill="var(--primary)" fontSize="12" fontFamily="Tajawal,sans-serif">ج</text>
      <text x="12"  y="135" textAnchor="middle" fill="var(--primary)" fontSize="12" fontFamily="Tajawal,sans-serif">غ</text>
    </svg>
  );
}

/* ── Main Qibla component ─────────────────────────────────────── */
export function Qibla() {
  const { heading, isSupported, requestPermission } = useCompass();
  const { coords, error: geoError, isLoading: geoLoading, requestLocation } = useGeolocation(true);

  const qiblaAngle = coords ? calculateQibla(coords.lat, coords.lng) : 0;

  // Arrow on screen points toward Qibla:
  // When device heading = qiblaAngle → arrow should point UP (0°)
  const arrowAngle = ((qiblaAngle - (heading ?? 0)) % 360 + 360) % 360;
  const isAligned  = heading !== null && coords !== null && (arrowAngle < 8 || arrowAngle > 352);

  // Haptic feedback when aligned
  const wasAligned = useRef(false);
  useEffect(() => {
    if (isAligned && !wasAligned.current && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    wasAligned.current = isAligned;
  }, [isAligned]);

  const SIZE = 290;

  const renderContent = () => {
    if (geoLoading) {
      return (
        <div className="flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-primary animate-spin"/>
          <p className="text-primary font-bold text-lg" style={{ fontFamily: '"Tajawal", sans-serif' }}>
            جاري تحديد موقعك...
          </p>
        </div>
      );
    }

    if (geoError || !coords) {
      return (
        <div className="flex flex-col items-center gap-6 text-center max-w-xs w-full">
          <div className="opacity-70"><KaabaIcon size={72}/></div>
          <div className="bg-card border border-border rounded-3xl p-5 w-full shadow-sm">
            <p className="font-bold text-base mb-2" style={{ fontFamily: '"Tajawal", sans-serif' }}>
              تحديد اتجاه القبلة
            </p>
            {geoError && (
              <p className="text-sm text-destructive mb-3" style={{ fontFamily: '"Tajawal", sans-serif' }}>{geoError}</p>
            )}
            <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: '"Tajawal", sans-serif' }}>
              يحتاج التطبيق إلى موقعك لحساب اتجاه القبلة
            </p>
            <button onClick={requestLocation}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm"
              style={{ background: 'linear-gradient(135deg,#C19A6B,#a07a4a)', color: '#fff', fontFamily: '"Tajawal", sans-serif' }}>
              <MapPin className="w-4 h-4"/>
              تحديد موقعي
            </button>
          </div>
        </div>
      );
    }

    if (!isSupported) {
      return (
        <div className="flex flex-col items-center gap-5 text-center max-w-xs">
          <KaabaIcon size={72}/>
          <div className="bg-card border border-border rounded-3xl p-5 w-full shadow-sm">
            <p className="font-bold text-base mb-1" style={{ fontFamily: '"Tajawal", sans-serif' }}>البوصلة غير مدعومة</p>
            <p className="text-sm text-muted-foreground mb-3" style={{ fontFamily: '"Tajawal", sans-serif' }}>اتجاه القبلة من موقعك</p>
            <p className="text-5xl font-black text-primary">{Math.round(qiblaAngle)}°</p>
            <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: '"Tajawal", sans-serif' }}>شمالاً</p>
          </div>
        </div>
      );
    }

    const needsIOSPermission =
      heading === null && typeof (DeviceOrientationEvent as any).requestPermission === 'function';

    if (needsIOSPermission) {
      return (
        <div className="flex flex-col items-center gap-5 w-full max-w-xs text-center">
          <KaabaIcon size={72}/>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 w-full">
            <p className="font-bold text-amber-600 mb-2" style={{ fontFamily: '"Tajawal", sans-serif' }}>تفعيل البوصلة</p>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>
              اضغط للسماح بالوصول لحساس الاتجاه
            </p>
          </div>
          <button onClick={requestPermission}
            className="w-full py-3.5 rounded-2xl font-bold text-sm"
            style={{ background: 'linear-gradient(135deg,#C19A6B,#a07a4a)', color: '#fff', fontFamily: '"Tajawal", sans-serif' }}>
            تفعيل البوصلة
          </button>
        </div>
      );
    }

    /* ── Full compass with fixed background and rotating arrow ── */
    return (
      <div className="flex flex-col items-center gap-6 w-full">

        {/* Status badge */}
        <div className={`px-6 py-3 rounded-2xl text-center transition-all duration-500 ${
          isAligned
            ? 'bg-green-500/15 border border-green-500/40'
            : 'bg-card border border-border'
        }`}>
          {isAligned ? (
            <p className="font-bold text-base text-green-600 dark:text-green-400" style={{ fontFamily: '"Tajawal", sans-serif' }}>
              أنت في اتجاه القبلة ✓
            </p>
          ) : (
            <div>
              <p className="font-bold text-sm text-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>
                وجّه هاتفك نحو الكعبة المشرفة
              </p>
              <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: '"Tajawal", sans-serif' }}>
                القبلة على بُعد {Math.round(qiblaAngle)}° من الشمال
              </p>
            </div>
          )}
        </div>

        {/* Compass container */}
        <div className="relative" style={{ width: SIZE, height: SIZE }}>

          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full transition-all duration-700"
            style={{
              boxShadow: isAligned
                ? '0 0 0 3px rgba(74,222,128,0.7), 0 0 50px rgba(74,222,128,0.25)'
                : '0 0 0 2px rgba(193,154,107,0.35), 0 0 30px rgba(193,154,107,0.08)',
            }}
          />

          {/* Static compass face (does NOT rotate) */}
          <CompassFace isAligned={isAligned} />

          {/* Kaaba icon – fixed at top center (12 o'clock) */}
          <div className="absolute pointer-events-none"
            style={{
              top: 6,
              left: '50%',
              transform: 'translateX(-50%)',
              filter: isAligned ? 'drop-shadow(0 0 10px rgba(74,222,128,0.9))' : 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))',
              transition: 'filter 0.5s',
            }}
          >
            <KaabaIcon size={36} />
          </div>

          {/* Rotating ARROW – points toward Qibla direction */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            style={{
              transform: `rotate(${arrowAngle}deg)`,
              transition: heading !== null ? 'transform 0.1s ease-out' : 'none',
            }}
          >
            <svg width="56" height="200" viewBox="0 0 56 200">
              {/* Arrow up (main – pointing toward Qibla) */}
              <polygon
                points="28,2 15,38 22,32 22,100 34,100 34,32 41,38"
                fill={isAligned ? '#4ade80' : '#C19A6B'}
                style={{ transition: 'fill 0.5s', filter: isAligned ? 'drop-shadow(0 0 6px rgba(74,222,128,0.8))' : 'none' }}
              />
              {/* Arrow down (opposite – dimmed) */}
              <polygon
                points="28,198 15,162 22,168 22,100 34,100 34,168 41,162"
                fill={isAligned ? 'rgba(74,222,128,0.3)' : 'rgba(193,154,107,0.3)'}
                style={{ transition: 'fill 0.5s' }}
              />
            </svg>
          </div>

          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div
              className="w-4 h-4 rounded-full transition-all duration-500"
              style={{
                background: isAligned ? '#4ade80' : '#C19A6B',
                border: '3px solid var(--background)',
                boxShadow: isAligned ? '0 0 12px rgba(74,222,128,0.8)' : '0 0 8px rgba(193,154,107,0.5)',
              }}
            />
          </div>
        </div>

        {/* Coordinates */}
        {coords && (
          <p className="text-xs text-muted-foreground/50" style={{ fontFamily: '"Tajawal", sans-serif' }}>
            موقعك: {coords.lat.toFixed(4)}°، {coords.lng.toFixed(4)}°
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col max-w-lg mx-auto bg-background" dir="rtl">
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-4 bg-card shadow-sm border-b border-border flex-shrink-0">
        <Link href="/more">
          <button className="p-2 bg-secondary rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="font-bold text-xl" style={{ fontFamily: '"Tajawal", sans-serif' }}>
          تحديد القبلة
        </h1>
        {(geoError || (!geoLoading && !coords)) && (
          <button onClick={requestLocation}
            className="mr-auto p-2 rounded-full bg-secondary"
            title="إعادة المحاولة">
            <RotateCcw className="w-4 h-4 text-primary"/>
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {renderContent()}
      </div>
    </div>
  );
}

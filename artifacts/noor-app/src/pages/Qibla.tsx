import { useCompass } from '@/hooks/use-compass';
import { useGeolocation, calculateQibla } from '@/hooks/use-geolocation';
import { ArrowLeft, MapPin, RotateCcw } from 'lucide-react';
import { Link } from 'wouter';
import { useEffect, useRef } from 'react';

/* ── Realistic Kaaba SVG ────────────────────────────────────── */
function KaabaIcon({ size = 56, glow = false }: { size?: number; glow?: boolean }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.15)}
      viewBox="0 0 56 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Roof gold trim */}
      <rect x="1" y="1" width="54" height="6" rx="1.5" fill="#B8860B"/>
      <rect x="1" y="1" width="54" height="2.5" rx="1" fill="#D4A017" opacity="0.9"/>
      <rect x="1" y="5.5" width="54" height="1" fill="#8a6200" opacity="0.6"/>

      {/* Main black body */}
      <rect x="1" y="7" width="54" height="54" rx="1.5" fill="#111"/>

      {/* Kiswah gold band */}
      <rect x="1" y="19" width="54" height="14" fill="#8B6914"/>
      <rect x="1" y="19" width="54" height="2" fill="#D4A017" opacity="0.8"/>
      <rect x="1" y="31" width="54" height="2" fill="#6a4e0a" opacity="0.7"/>

      {/* Calligraphy lines on band */}
      <rect x="5" y="22.5" width="46" height="1.2" rx="0.6" fill="#5a3d00" opacity="0.8"/>
      <rect x="5" y="25.5" width="46" height="1.2" rx="0.6" fill="#5a3d00" opacity="0.8"/>
      <rect x="5" y="28.5" width="46" height="1.2" rx="0.6" fill="#5a3d00" opacity="0.8"/>

      {/* Diamond ornaments */}
      {[10, 20, 28, 36, 46].map(x => (
        <polygon key={x}
          points={`${x},22.5 ${x+3},25.5 ${x},28.5 ${x-3},25.5`}
          fill="#D4A017" opacity="0.5"
        />
      ))}

      {/* Vertical corner gold strips */}
      <rect x="1"  y="7" width="4" height="54" fill="#B8860B" opacity="0.25"/>
      <rect x="51" y="7" width="4" height="54" fill="#B8860B" opacity="0.25"/>

      {/* Golden door frame */}
      <rect x="16" y="36" width="24" height="25" rx="1" fill="#C19A6B"/>
      {/* Door arch */}
      <path d="M16 48 Q28 32 40 48" fill="#C19A6B"/>
      {/* Door inner dark panel */}
      <rect x="18.5" y="39" width="19" height="19" rx="0.8" fill="#6B4A10"/>
      {/* Inner arch dark */}
      <path d="M18.5 48 Q28 35.5 39.5 48" fill="#6B4A10"/>
      {/* Door center divider */}
      <line x1="28" y1="39" x2="28" y2="58" stroke="#C19A6B" strokeWidth="0.8" opacity="0.4"/>
      {/* Door handle */}
      <circle cx="28" cy="52" r="2.2" fill="#D4A017"/>
      <circle cx="28" cy="52" r="2.2" stroke="#9a7000" strokeWidth="0.7" fill="none"/>

      {/* Hajar al-Aswad (Black Stone) – bottom left corner */}
      <rect x="1" y="57" width="7" height="4" rx="0.5" fill="#222"/>
      <ellipse cx="4.5" cy="59" rx="2.5" ry="1.5" fill="#1a1a1a" stroke="#555" strokeWidth="0.5"/>

      {/* Base corner stones */}
      <rect x="1"  y="58" width="8" height="3" rx="0.5" fill="#2a2a2a"/>
      <rect x="47" y="58" width="8" height="3" rx="0.5" fill="#2a2a2a"/>

      {/* Subtle glow effect when aligned */}
      {glow && (
        <rect x="1" y="1" width="54" height="60" rx="1.5"
          fill="none" stroke="#4ade80" strokeWidth="1.5" opacity="0.6"/>
      )}
    </svg>
  );
}

/* ── Compass face (STATIC – never rotates) ─────────────────── */
function CompassFace({ isAligned }: { isAligned: boolean }) {
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const angle    = i * 5;
    const isCard   = angle % 90 === 0;
    const isMinor  = angle % 45 === 0 && !isCard;
    const outerR   = 122;
    const innerR   = isCard ? 104 : isMinor ? 110 : 116;
    const rad      = (angle * Math.PI) / 180;
    return {
      x1: 130 + outerR * Math.sin(rad),
      y1: 130 - outerR * Math.cos(rad),
      x2: 130 + innerR * Math.sin(rad),
      y2: 130 - innerR * Math.cos(rad),
      isCard, isMinor,
    };
  });

  const accentColor = isAligned ? '#4ade80' : 'var(--primary)';

  return (
    <svg viewBox="0 0 260 260" className="absolute inset-0 w-full h-full">
      <defs>
        <radialGradient id="cBg" cx="50%" cy="45%" r="60%">
          <stop offset="0%"   stopColor="var(--card)"       stopOpacity="1"/>
          <stop offset="100%" stopColor="var(--background)"  stopOpacity="1"/>
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Background */}
      <circle cx="130" cy="130" r="127" fill="url(#cBg)"/>

      {/* Outer ring */}
      <circle cx="130" cy="130" r="125" fill="none"
        stroke={accentColor} strokeWidth="2.5"
        opacity={isAligned ? 0.85 : 0.4}
        style={{ transition: 'stroke 0.5s, opacity 0.5s' }}
      />

      {/* Inner decorative ring */}
      <circle cx="130" cy="130" r="95" fill="none"
        stroke={accentColor} strokeWidth="0.5" opacity="0.15"/>

      {/* Tick marks */}
      {ticks.map((t, i) => (
        <line key={i}
          x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={t.isCard ? 'var(--primary)' : t.isMinor ? 'var(--primary)' : 'var(--border)'}
          strokeWidth={t.isCard ? 2.5 : t.isMinor ? 1.5 : 0.8}
          opacity={t.isCard ? 1 : t.isMinor ? 0.55 : 0.35}
        />
      ))}

      {/* Cardinal labels */}
      <text x="130" y="14" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="bold" fontFamily="Tajawal,sans-serif">ش</text>
      <text x="248" y="135" textAnchor="middle" fill="var(--primary)" fontSize="12" fontFamily="Tajawal,sans-serif" opacity="0.8">ق</text>
      <text x="130" y="251" textAnchor="middle" fill="var(--primary)" fontSize="12" fontFamily="Tajawal,sans-serif" opacity="0.8">ج</text>
      <text x="12"  y="135" textAnchor="middle" fill="var(--primary)" fontSize="12" fontFamily="Tajawal,sans-serif" opacity="0.8">غ</text>
    </svg>
  );
}

/* ── Main Qibla Page ─────────────────────────────────────────── */
export function Qibla() {
  const { heading, isSupported, requestPermission } = useCompass();
  const { coords, error: geoError, isLoading: geoLoading, requestLocation } = useGeolocation(true);

  const qiblaAngle = coords ? calculateQibla(coords.lat, coords.lng) : 0;
  const arrowAngle = ((qiblaAngle - (heading ?? 0)) % 360 + 360) % 360;
  const isAligned  = heading !== null && coords !== null && (arrowAngle < 8 || arrowAngle > 352);

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
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-primary text-primary-foreground"
              style={{ fontFamily: '"Tajawal", sans-serif' }}>
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
            className="w-full py-3.5 rounded-2xl font-bold text-sm bg-primary text-primary-foreground"
            style={{ fontFamily: '"Tajawal", sans-serif' }}>
            تفعيل البوصلة
          </button>
        </div>
      );
    }

    /* ── Full compass ────────────────────────────────────────── */
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

        {/* Compass */}
        <div className="relative" style={{ width: SIZE, height: SIZE }}>

          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full transition-all duration-700"
            style={{
              boxShadow: isAligned
                ? '0 0 0 3px rgba(74,222,128,0.6), 0 0 48px rgba(74,222,128,0.2)'
                : '0 0 0 2px rgba(193,154,107,0.3), 0 0 28px rgba(193,154,107,0.07)',
            }}
          />

          {/* STATIC compass face */}
          <CompassFace isAligned={isAligned} />

          {/* Kaaba – FIXED at 12 o'clock, never rotates */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: 2,
              left: '50%',
              transform: 'translateX(-50%)',
              filter: isAligned
                ? 'drop-shadow(0 0 10px rgba(74,222,128,0.8))'
                : 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))',
              transition: 'filter 0.5s',
            }}
          >
            <KaabaIcon size={40} glow={isAligned} />
          </div>

          {/* ROTATING arrow – points toward Qibla */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            style={{
              transform: `rotate(${arrowAngle}deg)`,
              transition: heading !== null ? 'transform 0.12s ease-out' : 'none',
            }}
          >
            <svg width="52" height="190" viewBox="0 0 52 190">
              {/* Up arrow – Qibla direction */}
              <polygon
                points="26,2 14,36 20,30 20,95 32,95 32,30 38,36"
                fill={isAligned ? '#4ade80' : 'var(--primary)'}
                style={{ transition: 'fill 0.5s', filter: isAligned ? 'drop-shadow(0 0 6px rgba(74,222,128,0.8))' : 'none' }}
              />
              {/* Down arrow – opposite, dimmed */}
              <polygon
                points="26,188 14,154 20,160 20,95 32,95 32,160 38,154"
                fill={isAligned ? 'rgba(74,222,128,0.25)' : 'rgba(193,154,107,0.25)'}
                style={{ transition: 'fill 0.5s' }}
              />
            </svg>
          </div>

          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="w-4 h-4 rounded-full transition-all duration-500"
              style={{
                background: isAligned ? '#4ade80' : 'var(--primary)',
                border: '3px solid var(--background)',
                boxShadow: isAligned ? '0 0 10px rgba(74,222,128,0.8)' : '0 0 7px rgba(193,154,107,0.5)',
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

      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
        {renderContent()}
      </div>
    </div>
  );
}

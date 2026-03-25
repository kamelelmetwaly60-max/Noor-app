import { useCompass } from '@/hooks/use-compass';
import { useGeolocation, calculateQibla } from '@/hooks/use-geolocation';
import { ArrowLeft, RotateCcw, MapPin } from 'lucide-react';
import { Link } from 'wouter';
import { useEffect, useRef } from 'react';

/* ── Kaaba SVG icon (small, for compass rim) ─────────────── */
function KaabaSmall({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 44" fill="none">
      {/* Shadow */}
      <ellipse cx="20" cy="43" rx="13" ry="2.5" fill="#00000055"/>
      {/* Main body */}
      <rect x="2" y="4" width="36" height="38" rx="2" fill="#111"/>
      {/* Gold band */}
      <rect x="2" y="12" width="36" height="10" fill="#B8860B"/>
      <rect x="2" y="12" width="36" height="1.5" fill="#D4A017" opacity="0.8"/>
      {/* Calligraphy lines */}
      <rect x="5" y="14.5" width="30" height="1" rx="0.5" fill="#7A5800" opacity="0.8"/>
      <rect x="5" y="17" width="30" height="1" rx="0.5" fill="#7A5800" opacity="0.8"/>
      <rect x="5" y="19.5" width="30" height="1" rx="0.5" fill="#7A5800" opacity="0.8"/>
      {/* Gold door frame */}
      <rect x="13" y="26" width="14" height="16" rx="1" fill="#C19A6B"/>
      <path d="M13 32 Q20 23 27 32" fill="#C19A6B"/>
      <rect x="15" y="28" width="10" height="10" rx="0.8" fill="#8B6914"/>
      <path d="M15 32 Q20 25 25 32" fill="#8B6914"/>
      <circle cx="20" cy="35" r="1.2" fill="#D4A017"/>
      {/* Roof trim */}
      <rect x="1" y="2" width="38" height="3.5" rx="1" fill="#B8860B" opacity="0.9"/>
      <rect x="1" y="2" width="38" height="1.2" rx="0.6" fill="#D4A017" opacity="0.8"/>
    </svg>
  );
}

/* ── Large Kaaba for empty state ─────────────────────────── */
function KaabaLarge() {
  return (
    <svg width="80" height="92" viewBox="0 0 56 64" fill="none">
      <ellipse cx="28" cy="63" rx="18" ry="3" fill="#00000033"/>
      <rect x="4" y="8" width="48" height="52" rx="2" fill="#111111"/>
      <rect x="4" y="19" width="48" height="13" fill="#B8860B"/>
      <rect x="4" y="19" width="48" height="2" fill="#D4A017" opacity="0.8"/>
      <rect x="7" y="22" width="42" height="1.2" rx="0.6" fill="#7A5800" opacity="0.7"/>
      <rect x="7" y="25" width="42" height="1.2" rx="0.6" fill="#7A5800" opacity="0.7"/>
      <rect x="7" y="28" width="42" height="1.2" rx="0.6" fill="#7A5800" opacity="0.7"/>
      {[14, 22, 30, 38, 46].map(x => (
        <polygon key={x} points={`${x},23 ${x+3},25.5 ${x},28 ${x-3},25.5`} fill="#D4A017" opacity="0.5"/>
      ))}
      <rect x="4" y="8" width="3" height="52" fill="#B8860B" opacity="0.4"/>
      <rect x="49" y="8" width="3" height="52" fill="#B8860B" opacity="0.4"/>
      <rect x="18" y="35" width="20" height="25" rx="1.5" fill="#C19A6B"/>
      <path d="M18 44 Q28 32 38 44" fill="#C19A6B"/>
      <rect x="20.5" y="37" width="15" height="17" rx="1" fill="#8B6914"/>
      <path d="M20.5 44 Q28 34.5 35.5 44" fill="#8B6914"/>
      <circle cx="28" cy="48" r="1.5" fill="#D4A017"/>
      <rect x="3" y="6" width="50" height="4" rx="1" fill="#B8860B" opacity="0.9"/>
      <rect x="3" y="6" width="50" height="1.5" rx="0.8" fill="#D4A017" opacity="0.8"/>
    </svg>
  );
}

/* ── Compass tick marks ───────────────────────────────────── */
function CompassTicks() {
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const angle = i * 5;
    const isCardinal = angle % 90 === 0;
    const isMinor    = angle % 45 === 0;
    const outerR = 122;
    const innerR = isCardinal ? 108 : isMinor ? 113 : 117;
    const rad    = (angle * Math.PI) / 180;
    return {
      x1: 130 + outerR * Math.sin(rad),
      y1: 130 - outerR * Math.cos(rad),
      x2: 130 + innerR * Math.sin(rad),
      y2: 130 - innerR * Math.cos(rad),
      isCardinal, isMinor, angle,
    };
  });

  return (
    <svg viewBox="0 0 260 260" className="absolute inset-0 w-full h-full">
      {/* Background */}
      <defs>
        <radialGradient id="qBg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#2a2a2a"/>
          <stop offset="100%" stopColor="#0e0e0e"/>
        </radialGradient>
      </defs>
      <circle cx="130" cy="130" r="126" fill="url(#qBg)"/>

      {/* Tick marks */}
      {ticks.map((t, i) => (
        <line key={i}
          x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={t.isCardinal || t.isMinor ? '#C19A6B' : '#555'}
          strokeWidth={t.isCardinal ? 2.5 : t.isMinor ? 1.5 : 0.8}
          opacity={t.isCardinal ? 1 : t.isMinor ? 0.7 : 0.5}
        />
      ))}

      {/* Cardinal labels */}
      <text x="130" y="16" textAnchor="middle" fill="#ef4444" fontSize="16" fontWeight="bold" fontFamily="Tajawal,sans-serif">ش</text>
      <text x="246" y="135" textAnchor="middle" fill="#C19A6B" fontSize="13" fontFamily="Tajawal,sans-serif">ق</text>
      <text x="130" y="252" textAnchor="middle" fill="#C19A6B" fontSize="13" fontFamily="Tajawal,sans-serif">ج</text>
      <text x="14" y="135" textAnchor="middle" fill="#C19A6B" fontSize="13" fontFamily="Tajawal,sans-serif">غ</text>
    </svg>
  );
}

/* ── Main Qibla component ─────────────────────────────────── */
export function Qibla() {
  const { heading, isSupported, requestPermission } = useCompass();
  const { coords, error: geoError, isLoading: geoLoading, requestLocation } = useGeolocation(true);

  const qiblaAngle = coords ? calculateQibla(coords.lat, coords.lng) : 0;

  // The compass ring rotates so N stays at top → rotate by -heading
  const compassRotation = heading !== null ? -heading : 0;

  // Kaaba on screen = (qiblaAngle - heading); 0° means top = aligned
  const kaabaOnScreen = ((qiblaAngle - (heading ?? 0)) % 360 + 360) % 360;
  const isAligned = heading !== null && coords !== null && (kaabaOnScreen < 8 || kaabaOnScreen > 352);

  // Vibrate when aligned
  const wasAligned = useRef(false);
  useEffect(() => {
    if (isAligned && !wasAligned.current && navigator.vibrate) {
      navigator.vibrate([80, 40, 80]);
    }
    wasAligned.current = isAligned;
  }, [isAligned]);

  const renderCompass = () => {
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
          <div className="opacity-70"><KaabaLarge /></div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 w-full">
            <p className="font-bold text-base mb-2" style={{ fontFamily: '"Tajawal", sans-serif' }}>
              تحديد اتجاه القبلة
            </p>
            {geoError && (
              <p className="text-sm text-red-400 mb-3" style={{ fontFamily: '"Tajawal", sans-serif' }}>{geoError}</p>
            )}
            <p className="text-sm text-white/50 mb-4" style={{ fontFamily: '"Tajawal", sans-serif' }}>
              يحتاج التطبيق إلى موقعك لحساب اتجاه القبلة بدقة
            </p>
            <button onClick={requestLocation}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-black"
              style={{ background: 'linear-gradient(135deg,#C19A6B,#a07a4a)', fontFamily: '"Tajawal", sans-serif' }}>
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
          <KaabaLarge />
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 w-full">
            <p className="font-bold text-base mb-1" style={{ fontFamily: '"Tajawal", sans-serif' }}>البوصلة غير مدعومة</p>
            <p className="text-sm text-white/50 mb-3" style={{ fontFamily: '"Tajawal", sans-serif' }}>اتجاه القبلة من موقعك</p>
            <p className="text-5xl font-black text-primary">{Math.round(qiblaAngle)}°</p>
            <p className="text-sm text-white/40 mt-1" style={{ fontFamily: '"Tajawal", sans-serif' }}>شمالاً</p>
          </div>
        </div>
      );
    }

    const needsIOSPermission =
      heading === null && typeof (DeviceOrientationEvent as any).requestPermission === 'function';

    if (needsIOSPermission) {
      return (
        <div className="flex flex-col items-center gap-5 w-full max-w-xs text-center">
          <KaabaLarge />
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 w-full">
            <p className="font-bold text-amber-400 mb-2" style={{ fontFamily: '"Tajawal", sans-serif' }}>تفعيل البوصلة</p>
            <p className="text-sm text-white/50" style={{ fontFamily: '"Tajawal", sans-serif' }}>
              اضغط للسماح بالوصول لحساس الاتجاه
            </p>
          </div>
          <button onClick={requestPermission}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-black"
            style={{ background: 'linear-gradient(135deg,#C19A6B,#a07a4a)', fontFamily: '"Tajawal", sans-serif' }}>
            تفعيل البوصلة
          </button>
        </div>
      );
    }

    /* Full compass */
    const SIZE = 290;
    const CENTER = SIZE / 2;
    const KAABA_R = 94; // radius where Kaaba sits on the rotating ring

    // Kaaba position on the rotating compass rose (at qiblaAngle from North)
    const kaabaRad = (qiblaAngle * Math.PI) / 180;
    const kaabaX = CENTER + KAABA_R * Math.sin(kaabaRad);
    const kaabaY = CENTER - KAABA_R * Math.cos(kaabaRad);

    return (
      <div className="flex flex-col items-center gap-6 w-full">

        {/* Status badge */}
        <div className={`px-6 py-3 rounded-2xl text-center transition-all duration-500 ${
          isAligned
            ? 'bg-green-500/20 border border-green-500/50'
            : 'bg-white/5 border border-white/10'
        }`}>
          {isAligned ? (
            <p className="font-bold text-base text-green-400" style={{ fontFamily: '"Tajawal", sans-serif' }}>
              أنت في اتجاه القبلة ✓
            </p>
          ) : (
            <div>
              <p className="font-bold text-sm text-white" style={{ fontFamily: '"Tajawal", sans-serif' }}>
                وجّه هاتفك نحو الكعبة المشرفة
              </p>
              <p className="text-xs text-white/40 mt-0.5" style={{ fontFamily: '"Tajawal", sans-serif' }}>
                القبلة على بُعد {Math.round(qiblaAngle)}° من الشمال
              </p>
            </div>
          )}
        </div>

        {/* Compass */}
        <div className="relative" style={{ width: SIZE, height: SIZE }}>

          {/* Outer glow ring */}
          <div
            className="absolute inset-0 rounded-full transition-all duration-700"
            style={{
              boxShadow: isAligned
                ? '0 0 0 3px rgba(74,222,128,0.7), 0 0 50px rgba(74,222,128,0.35)'
                : '0 0 0 2px rgba(193,154,107,0.4), 0 0 30px rgba(193,154,107,0.1)',
            }}
          />

          {/* Rotating compass ring */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              transform: `rotate(${compassRotation}deg)`,
              transition: heading !== null ? 'transform 0.08s ease-out' : 'none',
            }}
          >
            {/* Tick marks and compass face */}
            <CompassTicks />

            {/* Kaaba at qibla direction on the rotating ring */}
            <div
              className="absolute"
              style={{
                left: `${(kaabaX / SIZE) * 100}%`,
                top: `${(kaabaY / SIZE) * 100}%`,
                transform: 'translate(-50%, -50%)',
                filter: isAligned ? 'drop-shadow(0 0 10px rgba(74,222,128,0.8))' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))',
              }}
            >
              <KaabaSmall size={34} />
            </div>
          </div>

          {/* Fixed bidirectional arrow (does NOT rotate) */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <svg width="60" height="180" viewBox="0 0 60 180">
              {/* Arrow pointing UP */}
              <polygon
                points="30,4 18,32 24,28 24,90 36,90 36,28 42,32"
                fill={isAligned ? '#4ade80' : '#C19A6B'}
                style={{ transition: 'fill 0.5s' }}
              />
              {/* Arrow pointing DOWN (dimmed) */}
              <polygon
                points="30,176 18,148 24,152 24,90 36,90 36,152 42,148"
                fill={isAligned ? 'rgba(74,222,128,0.35)' : 'rgba(193,154,107,0.3)'}
                style={{ transition: 'fill 0.5s' }}
              />
            </svg>
          </div>

          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div
              className="w-4 h-4 rounded-full transition-colors duration-500"
              style={{
                background: isAligned ? '#4ade80' : '#C19A6B',
                border: '3px solid #0e0e0e',
                boxShadow: isAligned ? '0 0 12px rgba(74,222,128,0.8)' : '0 0 8px rgba(193,154,107,0.5)',
              }}
            />
          </div>
        </div>

        {/* Coordinates */}
        {coords && (
          <p className="text-xs text-white/30" style={{ fontFamily: '"Tajawal", sans-serif' }}>
            موقعك: {coords.lat.toFixed(4)}، {coords.lng.toFixed(4)}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col max-w-lg mx-auto" style={{ background: '#0e0e0e' }} dir="rtl">
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(193,154,107,0.15)' }}>
        <Link href="/more">
          <button className="p-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <ArrowLeft className="w-5 h-5 text-white"/>
          </button>
        </Link>
        <h1 className="font-bold text-xl text-white" style={{ fontFamily: '"Tajawal", sans-serif' }}>
          تحديد القبلة
        </h1>
        {geoError && (
          <button onClick={requestLocation} className="mr-auto p-2 rounded-full"
            style={{ background: 'rgba(193,154,107,0.15)' }}>
            <RotateCcw className="w-4 h-4 text-primary"/>
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {renderCompass()}
      </div>
    </div>
  );
}

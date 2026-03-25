import { useCompass } from '@/hooks/use-compass';
import { useGeolocation, calculateQibla } from '@/hooks/use-geolocation';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Link } from 'wouter';

/* ── Realistic Kaaba SVG ──────────────────────────────────────── */
function KaabaIcon({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 56 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="28" cy="63" rx="18" ry="3" fill="#00000033" />

      {/* Main black body */}
      <rect x="4" y="8" width="48" height="52" rx="2" fill="#111111" />

      {/* Gold Kiswah band (horizontal belt ~1/3 from top) */}
      <rect x="4" y="19" width="48" height="13" fill="#B8860B" />

      {/* Kiswah band highlight */}
      <rect x="4" y="19" width="48" height="2" fill="#D4A017" opacity="0.8" />

      {/* Calligraphy lines on band (simplified) */}
      <rect x="7"  y="22" width="42" height="1.2" rx="0.6" fill="#7A5800" opacity="0.7" />
      <rect x="7"  y="25" width="42" height="1.2" rx="0.6" fill="#7A5800" opacity="0.7" />
      <rect x="7"  y="28" width="42" height="1.2" rx="0.6" fill="#7A5800" opacity="0.7" />

      {/* Diamond pattern on band */}
      {[14, 22, 30, 38, 46].map(x => (
        <polygon key={x} points={`${x},23 ${x+3},25.5 ${x},28 ${x-3},25.5`} fill="#D4A017" opacity="0.5" />
      ))}

      {/* Gold corner stripes (Kiswah detail) */}
      <rect x="4"  y="8" width="3" height="52" fill="#B8860B" opacity="0.4" />
      <rect x="49" y="8" width="3" height="52" fill="#B8860B" opacity="0.4" />

      {/* Golden door frame */}
      <rect x="18" y="35" width="20" height="25" rx="1.5" fill="#C19A6B" />

      {/* Door arch */}
      <path d="M18 44 Q28 32 38 44" fill="#C19A6B" />

      {/* Door inner panel */}
      <rect x="20.5" y="37" width="15" height="17" rx="1" fill="#8B6914" />

      {/* Door arch inner */}
      <path d="M20.5 44 Q28 34.5 35.5 44" fill="#8B6914" />

      {/* Door handle */}
      <circle cx="28" cy="48" r="1.5" fill="#D4A017" />

      {/* Roof / top trim */}
      <rect x="3" y="6" width="50" height="4" rx="1" fill="#B8860B" opacity="0.9" />
      <rect x="3" y="6" width="50" height="1.5" rx="0.8" fill="#D4A017" opacity="0.8" />

      {/* Corner stones (Hajar detail) */}
      <rect x="4" y="56" width="6" height="4" rx="0.5" fill="#555" />
    </svg>
  );
}

/* ── Compass Rose SVG ─────────────────────────────────────────── */
function CompassRose() {
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const angle = i * 5;
    const isCardinal = angle % 90 === 0;
    const isMinor    = angle % 45 === 0;
    const outerR = 92;
    const innerR = isCardinal ? 80 : isMinor ? 83 : 86;
    const rad = (angle * Math.PI) / 180;
    return {
      x1: 100 + outerR * Math.sin(rad),
      y1: 100 - outerR * Math.cos(rad),
      x2: 100 + innerR * Math.sin(rad),
      y2: 100 - innerR * Math.cos(rad),
      isCardinal, isMinor, angle,
    };
  });

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Background circle */}
      <circle cx="100" cy="100" r="94" fill="url(#compassBg)" />
      <defs>
        <radialGradient id="compassBg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#111111" />
        </radialGradient>
      </defs>

      {/* Degree rings */}
      <circle cx="100" cy="100" r="92" fill="none" stroke="#C19A6B" strokeWidth="1.5" opacity="0.5" />
      <circle cx="100" cy="100" r="76" fill="none" stroke="#C19A6B" strokeWidth="0.5" opacity="0.2" />

      {/* Tick marks */}
      {ticks.map((t, i) => (
        <line key={i}
          x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={t.isCardinal ? '#C19A6B' : t.isMinor ? '#C19A6B' : '#555'}
          strokeWidth={t.isCardinal ? 2.5 : t.isMinor ? 1.5 : 0.8}
          opacity={t.isCardinal ? 1 : t.isMinor ? 0.7 : 0.5}
        />
      ))}

      {/* Cardinal labels in Arabic */}
      <text x="100" y="16" textAnchor="middle" fill="#ef4444" fontSize="13" fontWeight="bold" fontFamily="Tajawal,sans-serif">ش</text>
      <text x="186" y="105" textAnchor="middle" fill="#C19A6B" fontSize="11" fontFamily="Tajawal,sans-serif">ق</text>
      <text x="100" y="196" textAnchor="middle" fill="#C19A6B" fontSize="11" fontFamily="Tajawal,sans-serif">ج</text>
      <text x="14" y="105" textAnchor="middle" fill="#C19A6B" fontSize="11" fontFamily="Tajawal,sans-serif">غ</text>

      {/* North arrow (red half) */}
      <polygon points="100,22 96,60 100,56 104,60" fill="#ef4444" opacity="0.9" />
      {/* South arrow (gold half) */}
      <polygon points="100,178 96,140 100,144 104,140" fill="#C19A6B" opacity="0.6" />
    </svg>
  );
}

/* ── Main component ───────────────────────────────────────────── */
export function Qibla() {
  const { heading, isSupported, requestPermission } = useCompass();
  const { coords, error: geoError, isLoading: geoLoading, requestLocation } = useGeolocation(true);

  const qiblaAngle      = coords ? calculateQibla(coords.lat, coords.lng) : 0;
  // Compass rose rotates opposite to device heading → North stays up
  const compassRotation = heading !== null ? -heading : 0;
  // Kaaba marker's angle on the compass: fixed at qiblaAngle on the rose
  // Rendered separately so it rotates with the rose
  const kaabaVisualAngle = qiblaAngle; // angle on the compass rose (not screen)

  // Is the user facing Mecca? Kaaba on screen is at (qiblaAngle - heading)
  const kaabaOnScreen = ((qiblaAngle - (heading ?? 0)) % 360 + 360) % 360;
  const isAligned = heading !== null && coords !== null && (kaabaOnScreen < 7 || kaabaOnScreen > 353);

  // Needle tip position for the Kaaba (along compass rose, at qiblaAngle from north)
  // We render it inside the rotating rose div so it inherits the rotation
  const kaabaR = 62; // radius from center where Kaaba sits
  const kaabaX = 100 + kaabaR * Math.sin((kaabaVisualAngle * Math.PI) / 180);
  const kaabaY = 100 - kaabaR * Math.cos((kaabaVisualAngle * Math.PI) / 180);

  // ── Render states ──────────────────────────────────────────
  const renderContent = () => {

    if (geoLoading) {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-primary font-bold" style={{ fontFamily: '"Tajawal", sans-serif' }}>
            جاري تحديد الموقع...
          </p>
        </div>
      );
    }

    if (geoError) {
      return (
        <div className="flex flex-col items-center gap-4 w-full max-w-xs text-center">
          <div className="p-4 bg-destructive/10 rounded-2xl">
            <p className="text-destructive text-sm" style={{ fontFamily: '"Tajawal", sans-serif' }}>{geoError}</p>
            <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: '"Tajawal", sans-serif' }}>
              تأكد من تفعيل الموقع في إعدادات المتصفح
            </p>
          </div>
          <button onClick={requestLocation}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm w-full justify-center"
            style={{ background: 'linear-gradient(135deg,#C19A6B,#a07a4a)', color: '#fff', fontFamily: '"Tajawal", sans-serif' }}>
            <RotateCcw className="w-4 h-4" />
            حاول مرة أخرى
          </button>
        </div>
      );
    }

    if (!coords) {
      return (
        <div className="flex flex-col items-center gap-6 text-center max-w-xs">
          <div className="opacity-60"><KaabaIcon size={72} /></div>
          <p className="text-muted-foreground text-sm" style={{ fontFamily: '"Tajawal", sans-serif' }}>
            يحتاج التطبيق إلى موقعك لتحديد اتجاه القبلة
          </p>
          <button onClick={requestLocation}
            className="px-8 py-3 rounded-2xl font-bold text-sm w-full"
            style={{ background: 'linear-gradient(135deg,#C19A6B,#a07a4a)', color: '#fff', fontFamily: '"Tajawal", sans-serif' }}>
            تحديد الموقع
          </button>
        </div>
      );
    }

    if (!isSupported) {
      return (
        <div className="flex flex-col items-center gap-4 text-center max-w-xs">
          <KaabaIcon size={64} />
          <div className="p-4 bg-secondary/50 rounded-2xl">
            <p className="font-bold mb-1" style={{ fontFamily: '"Tajawal", sans-serif' }}>جهازك لا يدعم البوصلة</p>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>
              اتجاه القبلة من موقعك
            </p>
            <p className="text-3xl font-black text-primary mt-2">{Math.round(qiblaAngle)}°</p>
            <p className="text-xs text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>من الشمال</p>
          </div>
        </div>
      );
    }

    const needsIOSPermission =
      heading === null &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function';

    if (needsIOSPermission) {
      return (
        <div className="flex flex-col items-center gap-4 w-full max-w-xs text-center">
          <KaabaIcon size={64} />
          <div className="p-4 bg-amber-500/10 rounded-2xl">
            <p className="font-bold text-amber-600 mb-1" style={{ fontFamily: '"Tajawal", sans-serif' }}>تفعيل البوصلة</p>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>
              اضغط للسماح بالوصول لحساس الاتجاه
            </p>
          </div>
          <button onClick={requestPermission}
            className="w-full px-6 py-3 rounded-2xl font-bold text-sm"
            style={{ background: 'linear-gradient(135deg,#C19A6B,#a07a4a)', color: '#fff', fontFamily: '"Tajawal", sans-serif' }}>
            تفعيل البوصلة
          </button>
        </div>
      );
    }

    /* ── Full compass ── */
    return (
      <div className="flex flex-col items-center gap-5 w-full">
        {/* Status */}
        <div className={`px-5 py-2.5 rounded-2xl text-center transition-all duration-500 ${
          isAligned
            ? 'bg-green-500/15 border border-green-500/40 text-green-500'
            : 'bg-white/5 border border-white/10 text-foreground'
        }`}>
          {isAligned ? (
            <p className="font-bold text-base" style={{ fontFamily: '"Tajawal", sans-serif' }}>أنت في اتجاه القبلة ✓</p>
          ) : (
            <>
              <p className="font-bold text-sm" style={{ fontFamily: '"Tajawal", sans-serif' }}>حرك هاتفك نحو الكعبة المشرفة</p>
              <p className="text-xs opacity-60 mt-0.5" style={{ fontFamily: '"Tajawal", sans-serif' }}>
                القبلة على بُعد {Math.round(qiblaAngle)}° من الشمال
              </p>
            </>
          )}
        </div>

        {/* Compass */}
        <div className="relative" style={{ width: 280, height: 280 }}>

          {/* Outer glow ring */}
          <div className={`absolute inset-0 rounded-full transition-all duration-700 ${
            isAligned ? 'shadow-[0_0_40px_rgba(74,222,128,0.4)]' : 'shadow-[0_0_30px_rgba(193,154,107,0.15)]'
          }`} />

          {/* Outer border */}
          <div className={`absolute inset-0 rounded-full border-2 transition-colors duration-500 ${
            isAligned ? 'border-green-500/60' : 'border-[#C19A6B]/30'
          }`} />

          {/* Rotating compass rose + Kaaba needle */}
          <div
            className="absolute inset-3 rounded-full"
            style={{
              transform: `rotate(${compassRotation}deg)`,
              transition: heading !== null ? 'transform 0.1s ease-out' : 'none',
            }}
          >
            {/* Compass rose background */}
            <CompassRose />

            {/* Kaaba marker — fixed on rose at qiblaAngle position */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${(kaabaX / 200) * 100}%`,
                top:  `${(kaabaY / 200) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <KaabaIcon size={34} />
            </div>
          </div>

          {/* Fixed crosshair / north indicator */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            {/* Top triangle (pointing direction indicator) */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2">
              <div className="w-0 h-0"
                style={{ borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '14px solid #C19A6B', opacity: 0.9 }}
              />
            </div>
            {/* Bottom triangle */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
              <div className="w-0 h-0"
                style={{ borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '14px solid #C19A6B', opacity: 0.3 }}
              />
            </div>
          </div>

          {/* Center circle */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className={`w-5 h-5 rounded-full border-3 border-background shadow-lg transition-colors duration-500 ${
              isAligned ? 'bg-green-500' : 'bg-[#C19A6B]'
            }`}
              style={{ border: '3px solid var(--background)' }}
            />
          </div>
        </div>

        {/* Coordinates */}
        {coords && (
          <p className="text-xs text-muted-foreground/50" style={{ fontFamily: '"Tajawal", sans-serif' }}>
            {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col max-w-lg mx-auto bg-background" dir="rtl">
      <div className="pt-safe px-4 py-4 flex items-center gap-4 bg-card shadow-sm border-b border-border">
        <Link href="/more" className="p-2 bg-secondary rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-bold text-xl" style={{ fontFamily: '"Tajawal", sans-serif' }}>اتجاه القبلة</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {renderContent()}
      </div>
    </div>
  );
}

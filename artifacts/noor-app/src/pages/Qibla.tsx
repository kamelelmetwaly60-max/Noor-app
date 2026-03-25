import { useCompass } from '@/hooks/use-compass';
import { useGeolocation, calculateQibla } from '@/hooks/use-geolocation';
import { ArrowLeft, MapPin, RotateCcw } from 'lucide-react';
import { Link } from 'wouter';

export function Qibla() {
  const { heading, isSupported, requestPermission } = useCompass();
  const { coords, error: geoError, isLoading: geoLoading, requestLocation } = useGeolocation(true);

  const qiblaAngle     = coords ? calculateQibla(coords.lat, coords.lng) : 0;
  const compassRotation = heading !== null ? -heading : 0;
  const kaabaRotation   = heading !== null ? qiblaAngle - heading : qiblaAngle;
  const normalizedKaaba = ((kaabaRotation % 360) + 360) % 360;
  const isAligned = heading !== null && coords !== null && (normalizedKaaba < 8 || normalizedKaaba > 352);

  const renderContent = () => {
    // Waiting for user to open location
    if (!coords && !geoLoading && !geoError) {
      return (
        <div className="flex flex-col items-center gap-6 w-full max-w-xs">
          {/* Decorative kaaba */}
          <div className="w-24 h-24 flex items-center justify-center opacity-30">
            <svg width="80" height="90" viewBox="0 0 32 36">
              <rect x="2"  y="8"  width="28" height="26" rx="2" fill="currentColor" className="text-primary"/>
              <rect x="6"  y="14" width="20" height="14" rx="1" fill="none" stroke="currentColor" className="text-primary/60" strokeWidth="1.5"/>
              <rect x="12" y="22" width="8"  height="6"  rx="1" fill="currentColor" className="text-primary/80"/>
              <polygon points="16,0 4,8 28,8" fill="currentColor" className="text-primary"/>
            </svg>
          </div>
          <div className="text-center">
            <h2 className="font-bold text-xl mb-2" style={{ fontFamily: '"Tajawal", sans-serif' }}>اتجاه القبلة</h2>
            <p className="text-muted-foreground text-sm leading-relaxed" style={{ fontFamily: '"Tajawal", sans-serif' }}>
              افتح الموقع لتحديد اتجاه القبلة نحو الكعبة المشرفة
            </p>
          </div>
          <button
            onClick={requestLocation}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base w-full justify-center shadow-lg active:scale-95 transition-transform"
            style={{
              background: 'linear-gradient(135deg, #C19A6B, #a07a4a)',
              color: '#fff',
              fontFamily: '"Tajawal", sans-serif',
              boxShadow: '0 6px 20px rgba(193,154,107,0.4)',
            }}
          >
            <MapPin className="w-5 h-5" />
            افتح الموقع
          </button>
        </div>
      );
    }

    // Loading
    if (geoLoading) {
      return (
        <div className="text-primary font-bold animate-pulse text-lg" style={{ fontFamily: '"Tajawal", sans-serif' }}>
          جاري تحديد الموقع...
        </div>
      );
    }

    // Location error
    if (geoError) {
      return (
        <div className="flex flex-col items-center gap-4 w-full max-w-xs text-center">
          <div className="p-4 bg-destructive/10 rounded-2xl">
            <p className="text-destructive text-sm" style={{ fontFamily: '"Tajawal", sans-serif' }}>{geoError}</p>
          </div>
          <button
            onClick={requestLocation}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm w-full justify-center"
            style={{
              background: 'linear-gradient(135deg, #C19A6B, #a07a4a)',
              color: '#fff',
              fontFamily: '"Tajawal", sans-serif',
            }}
          >
            <RotateCcw className="w-4 h-4" />
            حاول مرة أخرى
          </button>
        </div>
      );
    }

    // Compass not supported
    if (!isSupported) {
      return (
        <div className="text-center max-w-xs">
          <div className="p-4 bg-secondary/40 rounded-2xl mb-4">
            <p className="font-bold mb-1" style={{ fontFamily: '"Tajawal", sans-serif' }}>حساس البوصلة غير مدعوم</p>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>
              جهازك لا يدعم حساس الاتجاه، لكن يمكنك معرفة الزاوية يدوياً
            </p>
          </div>
          {coords && (
            <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #C19A6B22, #a07a4a11)', border: '1px solid #C19A6B44' }}>
              <p className="text-2xl font-black text-primary mb-1">{Math.round(qiblaAngle)}°</p>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>من الشمال باتجاه القبلة</p>
            </div>
          )}
        </div>
      );
    }

    // iOS needs explicit compass permission tap
    const needsIOSPermission =
      heading === null &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function';

    if (needsIOSPermission) {
      return (
        <div className="flex flex-col items-center gap-4 w-full max-w-xs text-center">
          <div className="p-4 bg-amber-500/10 rounded-2xl">
            <p className="font-bold mb-1 text-amber-600" style={{ fontFamily: '"Tajawal", sans-serif' }}>تفعيل البوصلة</p>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>
              اضغط لتفعيل حساس الاتجاه على جهازك
            </p>
          </div>
          <button
            onClick={requestPermission}
            className="w-full px-6 py-3 rounded-2xl font-bold text-sm"
            style={{
              background: 'linear-gradient(135deg, #C19A6B, #a07a4a)',
              color: '#fff',
              fontFamily: '"Tajawal", sans-serif',
            }}
          >
            تفعيل البوصلة
          </button>
        </div>
      );
    }

    // Full compass
    return (
      <>
        {/* Status badge */}
        <div className="mb-6">
          {isAligned ? (
            <div className="bg-green-500/10 border border-green-500/30 text-green-600 px-6 py-3 rounded-2xl">
              <p className="font-bold text-lg" style={{ fontFamily: '"Tajawal", sans-serif' }}>أنت في اتجاه القبلة ✓</p>
            </div>
          ) : (
            <div className="bg-primary/5 border border-primary/20 px-6 py-3 rounded-2xl">
              <p className="font-bold" style={{ fontFamily: '"Tajawal", sans-serif' }}>حرك هاتفك نحو الكعبة</p>
              <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: '"Tajawal", sans-serif' }}>
                القبلة على بُعد {Math.round(qiblaAngle)}° من الشمال
              </p>
            </div>
          )}
        </div>

        {/* Compass wheel */}
        <div className="relative w-72 h-72">
          {/* Outer ring */}
          <div className={`absolute inset-0 rounded-full border-4 transition-colors duration-500 ${
            isAligned ? 'border-green-500 shadow-lg shadow-green-500/30' : 'border-border'
          }`} />

          {/* Rotating compass rose */}
          <div
            className="absolute inset-2 rounded-full transition-transform duration-100 ease-out"
            style={{ transform: `rotate(${compassRotation}deg)` }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {Array.from({ length: 36 }).map((_, i) => {
                const angle = i * 10;
                const r  = angle % 90 === 0 ? 88 : angle % 30 === 0 ? 86 : 84;
                const x1 = 100 + 90 * Math.sin((angle * Math.PI) / 180);
                const y1 = 100 - 90 * Math.cos((angle * Math.PI) / 180);
                const x2 = 100 + r  * Math.sin((angle * Math.PI) / 180);
                const y2 = 100 - r  * Math.cos((angle * Math.PI) / 180);
                return (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={angle % 90 === 0 ? '#C19A6B' : '#ccc'}
                    strokeWidth={angle % 90 === 0 ? 2 : 1}
                  />
                );
              })}
              <text x="100" y="18"  textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="bold">N</text>
              <text x="185" y="104" textAnchor="middle" fill="#888"   fontSize="11">E</text>
              <text x="100" y="195" textAnchor="middle" fill="#888"   fontSize="11">S</text>
              <text x="15"  y="104" textAnchor="middle" fill="#888"   fontSize="11">W</text>
            </svg>
          </div>

          {/* Kaaba (rotates to qibla direction) */}
          <div
            className="absolute inset-0 transition-transform duration-100 ease-out z-20"
            style={{ transform: `rotate(${kaabaRotation}deg)` }}
          >
            <div className="absolute top-1 left-1/2 -translate-x-1/2">
              <svg width="32" height="36" viewBox="0 0 32 36" className="drop-shadow-lg">
                <rect x="2"  y="8"  width="28" height="26" rx="2" fill="#1a1a1a" stroke="#C19A6B" strokeWidth="2"/>
                <rect x="6"  y="14" width="20" height="14" rx="1" fill="none"    stroke="#C19A6B" strokeWidth="1" opacity="0.6"/>
                <rect x="12" y="22" width="8"  height="6"  rx="1" fill="#C19A6B" opacity="0.8"/>
                <polygon points="16,0 4,8 28,8" fill="#C19A6B"/>
              </svg>
            </div>
          </div>

          {/* Fixed north arrow */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="relative w-1 h-28">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0"
                style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '16px solid #C19A6B' }}
              />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-20 bg-primary/40" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0"
                style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '16px solid rgba(193,154,107,0.25)' }}
              />
            </div>
          </div>

          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <div className={`w-4 h-4 rounded-full border-2 border-background shadow-md transition-colors duration-500 ${
              isAligned ? 'bg-green-500' : 'bg-primary'
            }`} />
          </div>
        </div>

        {coords && (
          <p className="mt-5 text-xs text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>
            موقعك: {coords.lat.toFixed(4)}°، {coords.lng.toFixed(4)}°
          </p>
        )}
      </>
    );
  };

  return (
    <div className="h-screen flex flex-col max-w-lg mx-auto bg-background" dir="rtl">
      {/* Header */}
      <div className="pt-safe px-4 py-4 flex items-center gap-4 bg-card shadow-sm border-b border-border">
        <Link href="/more" className="p-2 bg-secondary rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-bold text-xl" style={{ fontFamily: '"Tajawal", sans-serif' }}>تحديد القبلة</h1>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {renderContent()}
      </div>
    </div>
  );
}

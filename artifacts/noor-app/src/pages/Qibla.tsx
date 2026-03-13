import { useCompass } from '@/hooks/use-compass';
import { useGeolocation, calculateQibla } from '@/hooks/use-geolocation';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Link } from 'wouter';

export function Qibla() {
  const { heading, error: compassError, isSupported, requestPermission } = useCompass();
  const { coords, error: geoError, isLoading: geoLoading, requestLocation } = useGeolocation();

  let qiblaAngle = 0;
  if (coords) {
    qiblaAngle = calculateQibla(coords.lat, coords.lng);
  }

  // Compass needle points north (0°), rotated by -heading to fix the compass
  const compassRotation = heading !== null ? -heading : 0;
  // Kaaba is at qiblaAngle degrees from north. Relative to the compass display: qiblaAngle - heading
  const kaabaRotation = heading !== null ? qiblaAngle - heading : qiblaAngle;

  // Aligned when needle and kaaba overlap (roughly pointing same direction)
  const normalizedKaaba = ((kaabaRotation % 360) + 360) % 360;
  const isAligned = heading !== null && coords !== null && (normalizedKaaba < 8 || normalizedKaaba > 352);

  return (
    <div className="h-screen flex flex-col max-w-lg mx-auto bg-background" dir="rtl">
      <div className="pt-safe px-4 py-4 flex items-center gap-4 bg-card shadow-sm relative z-10 border-b border-border">
        <Link href="/more" className="p-2 bg-secondary rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-bold text-xl">تحديد القبلة</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {!isSupported ? (
          <div className="text-destructive p-4 bg-destructive/10 rounded-2xl max-w-xs">
            <p className="font-bold mb-2">حساس البوصلة غير مدعوم</p>
            <p className="text-sm">جهازك لا يدعم حساس الاتجاه</p>
          </div>
        ) : geoError ? (
          <div className="space-y-4 max-w-xs">
            <div className="text-destructive p-4 bg-destructive/10 rounded-2xl">
              <p className="text-sm">{geoError}</p>
            </div>
            <button
              onClick={requestLocation}
              className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              السماح بالوصول للموقع
            </button>
          </div>
        ) : geoLoading ? (
          <div className="text-primary font-bold animate-pulse">جاري تحديد الموقع...</div>
        ) : compassError ? (
          <div className="space-y-4 max-w-xs">
            <div className="text-amber-600 p-4 bg-amber-500/10 rounded-2xl">
              <p className="font-bold mb-1">تفعيل البوصلة</p>
              <p className="text-sm">يحتاج التطبيق إذن للوصول إلى حساس الاتجاه</p>
            </div>
            <button
              onClick={requestPermission}
              className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg"
            >
              تفعيل البوصلة
            </button>
          </div>
        ) : (
          <>
            {/* Status */}
            <div className="mb-8">
              {isAligned ? (
                <div className="bg-green-500/10 border border-green-500/30 text-green-600 px-6 py-3 rounded-2xl">
                  <p className="font-bold text-lg">أنت في اتجاه القبلة ✓</p>
                </div>
              ) : (
                <div className="bg-primary/5 border border-primary/20 text-foreground px-6 py-3 rounded-2xl">
                  <p className="font-bold">حرك هاتفك حتى تتطابق الكعبة مع السهم</p>
                  <p className="text-sm text-muted-foreground mt-1">زاوية القبلة: {Math.round(qiblaAngle)}° من الشمال</p>
                </div>
              )}
            </div>

            {/* Compass */}
            <div className="relative w-72 h-72">
              {/* Outer ring */}
              <div className={`absolute inset-0 rounded-full border-4 transition-colors duration-500 ${isAligned ? 'border-green-500 shadow-lg shadow-green-500/30' : 'border-border'}`} />

              {/* Rotating compass rose */}
              <div
                className="absolute inset-2 rounded-full transition-transform duration-150 ease-out"
                style={{ transform: `rotate(${compassRotation}deg)` }}
              >
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Tick marks */}
                  {Array.from({ length: 36 }).map((_, i) => {
                    const angle = i * 10;
                    const r = angle % 90 === 0 ? 88 : angle % 30 === 0 ? 86 : 84;
                    const x1 = 100 + 90 * Math.sin((angle * Math.PI) / 180);
                    const y1 = 100 - 90 * Math.cos((angle * Math.PI) / 180);
                    const x2 = 100 + r * Math.sin((angle * Math.PI) / 180);
                    const y2 = 100 - r * Math.cos((angle * Math.PI) / 180);
                    return (
                      <line
                        key={i}
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={angle % 90 === 0 ? '#C19A6B' : '#ccc'}
                        strokeWidth={angle % 90 === 0 ? 2 : 1}
                      />
                    );
                  })}
                  {/* Cardinal directions */}
                  <text x="100" y="18" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="bold">N</text>
                  <text x="185" y="104" textAnchor="middle" fill="#888" fontSize="11">E</text>
                  <text x="100" y="195" textAnchor="middle" fill="#888" fontSize="11">S</text>
                  <text x="15" y="104" textAnchor="middle" fill="#888" fontSize="11">W</text>
                </svg>
              </div>

              {/* Kaaba icon - rotates to show direction */}
              <div
                className="absolute inset-0 transition-transform duration-150 ease-out z-20"
                style={{ transform: `rotate(${kaabaRotation}deg)` }}
              >
                <div className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  {/* Kaaba SVG */}
                  <svg width="32" height="36" viewBox="0 0 32 36" className="drop-shadow-md">
                    <rect x="2" y="8" width="28" height="26" rx="2" fill="#1a1a1a" stroke="#C19A6B" strokeWidth="2"/>
                    <rect x="6" y="14" width="20" height="14" rx="1" fill="none" stroke="#C19A6B" strokeWidth="1" opacity="0.6"/>
                    <rect x="12" y="22" width="8" height="6" rx="1" fill="#C19A6B" opacity="0.8"/>
                    <polygon points="16,0 4,8 28,8" fill="#C19A6B"/>
                  </svg>
                </div>
              </div>

              {/* Fixed arrow pointing up (north reference) */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="w-1 h-28 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0"
                    style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '16px solid #C19A6B' }}
                  />
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-20 bg-primary/40" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0"
                    style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '16px solid rgba(193,154,107,0.3)' }}
                  />
                </div>
              </div>

              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center z-30">
                <div className={`w-4 h-4 rounded-full border-2 border-background shadow-md transition-colors duration-500 ${isAligned ? 'bg-green-500' : 'bg-primary'}`} />
              </div>
            </div>

            {coords && (
              <p className="mt-6 text-xs text-muted-foreground">
                موقعك: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

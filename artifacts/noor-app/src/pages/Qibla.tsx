import { useState } from 'react';
import { useCompass } from '@/hooks/use-compass';
import { useGeolocation, calculateQibla } from '@/hooks/use-geolocation';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

function LocationPermDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative bg-card border border-border rounded-3xl p-6 w-full max-w-xs shadow-2xl text-center"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-3">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        <svg width="24" height="24" viewBox="0 0 40 40" className="mx-auto mb-3 opacity-30 text-primary">
          <polygon points="20,2 24,14 37,14 27,22 31,35 20,27 9,35 13,22 3,14 16,14" fill="currentColor"/>
        </svg>
        <h3 className="font-bold text-lg mb-2" style={{ fontFamily: '"Tajawal", sans-serif' }}>
          تحديد اتجاه القبلة
        </h3>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed" style={{ fontFamily: '"Tajawal", sans-serif' }}>
          يحتاج التطبيق إلى موقعك الجغرافي لحساب اتجاه القبلة بدقة نحو الكعبة المشرفة.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl bg-secondary text-foreground font-bold text-sm hover:bg-secondary/80 transition-colors"
            style={{ fontFamily: '"Tajawal", sans-serif' }}
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #C19A6B, #a07a4a)',
              color: '#fff',
              fontFamily: '"Tajawal", sans-serif',
              boxShadow: '0 4px 15px rgba(193,154,107,0.35)',
            }}
          >
            السماح
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function Qibla() {
  const [dialogDismissed, setDialogDismissed] = useState(false);

  const { heading, error: compassError, isSupported, requestPermission } = useCompass();
  const { coords, error: geoError, isLoading: geoLoading, requestLocation } = useGeolocation(false);

  const qiblaAngle  = coords ? calculateQibla(coords.lat, coords.lng) : 0;
  const compassRotation = heading !== null ? -heading : 0;
  const kaabaRotation   = heading !== null ? qiblaAngle - heading : qiblaAngle;
  const normalizedKaaba = ((kaabaRotation % 360) + 360) % 360;
  const isAligned = heading !== null && coords !== null && (normalizedKaaba < 8 || normalizedKaaba > 352);

  const handleConfirm = () => {
    setDialogDismissed(true);
    requestLocation();
  };

  const handleCancel = () => {
    setDialogDismissed(true);
  };

  // Determine which screen to render
  const renderBody = () => {
    // 1. Not dismissed dialog yet → just show empty (dialog is overlaid)
    if (!dialogDismissed) return null;

    // 2. Loading
    if (geoLoading) {
      return (
        <div className="text-primary font-bold animate-pulse text-lg" style={{ fontFamily: '"Tajawal", sans-serif' }}>
          جاري تحديد الموقع...
        </div>
      );
    }

    // 3. Location error
    if (geoError) {
      return (
        <div className="space-y-4 max-w-xs w-full">
          <div className="text-destructive p-4 bg-destructive/10 rounded-2xl text-center">
            <p className="text-sm" style={{ fontFamily: '"Tajawal", sans-serif' }}>{geoError}</p>
          </div>
          <button
            onClick={() => { setDialogDismissed(false); }}
            className="w-full px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 text-sm"
            style={{
              background: 'linear-gradient(135deg, #C19A6B, #a07a4a)',
              color: '#fff',
              fontFamily: '"Tajawal", sans-serif',
            }}
          >
            <MapPin className="w-5 h-5" />
            حاول مرة أخرى
          </button>
        </div>
      );
    }

    // 4. No location yet (user cancelled dialog)
    if (!coords) {
      return (
        <div className="space-y-4 max-w-xs w-full text-center">
          <div className="p-4 bg-secondary/40 rounded-2xl">
            <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground" style={{ fontFamily: '"Tajawal", sans-serif' }}>
              يحتاج تحديد القبلة إلى موقعك الجغرافي
            </p>
          </div>
          <button
            onClick={() => setDialogDismissed(false)}
            className="w-full px-6 py-3 rounded-2xl font-bold text-sm"
            style={{
              background: 'linear-gradient(135deg, #C19A6B, #a07a4a)',
              color: '#fff',
              fontFamily: '"Tajawal", sans-serif',
            }}
          >
            السماح بتحديد الموقع
          </button>
        </div>
      );
    }

    // 5. Compass not supported
    if (!isSupported) {
      return (
        <div className="text-destructive p-4 bg-destructive/10 rounded-2xl max-w-xs text-center">
          <p className="font-bold mb-2" style={{ fontFamily: '"Tajawal", sans-serif' }}>حساس البوصلة غير مدعوم</p>
          <p className="text-sm" style={{ fontFamily: '"Tajawal", sans-serif' }}>جهازك لا يدعم حساس الاتجاه</p>
          <p className="text-xs text-muted-foreground mt-3" style={{ fontFamily: '"Tajawal", sans-serif' }}>
            زاوية القبلة من موقعك: <strong>{Math.round(qiblaAngle)}°</strong> من الشمال
          </p>
        </div>
      );
    }

    // 6. Compass needs permission (iOS)
    if (compassError) {
      return (
        <div className="space-y-4 max-w-xs w-full">
          <div className="text-amber-600 p-4 bg-amber-500/10 rounded-2xl text-center">
            <p className="font-bold mb-1" style={{ fontFamily: '"Tajawal", sans-serif' }}>تفعيل البوصلة</p>
            <p className="text-sm" style={{ fontFamily: '"Tajawal", sans-serif' }}>يحتاج التطبيق إذن للوصول إلى حساس الاتجاه</p>
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

    // 7. All good — show compass
    return (
      <>
        {/* Status */}
        <div className="mb-8">
          {isAligned ? (
            <div className="bg-green-500/10 border border-green-500/30 text-green-600 px-6 py-3 rounded-2xl">
              <p className="font-bold text-lg" style={{ fontFamily: '"Tajawal", sans-serif' }}>أنت في اتجاه القبلة ✓</p>
            </div>
          ) : (
            <div className="bg-primary/5 border border-primary/20 text-foreground px-6 py-3 rounded-2xl">
              <p className="font-bold" style={{ fontFamily: '"Tajawal", sans-serif' }}>حرك هاتفك حتى تتطابق الكعبة مع السهم</p>
              <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: '"Tajawal", sans-serif' }}>
                زاوية القبلة: {Math.round(qiblaAngle)}° من الشمال
              </p>
            </div>
          )}
        </div>

        {/* Compass */}
        <div className="relative w-72 h-72">
          <div className={`absolute inset-0 rounded-full border-4 transition-colors duration-500 ${isAligned ? 'border-green-500 shadow-lg shadow-green-500/30' : 'border-border'}`} />

          {/* Rotating compass rose */}
          <div
            className="absolute inset-2 rounded-full transition-transform duration-150 ease-out"
            style={{ transform: `rotate(${compassRotation}deg)` }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {Array.from({ length: 36 }).map((_, i) => {
                const angle = i * 10;
                const r = angle % 90 === 0 ? 88 : angle % 30 === 0 ? 86 : 84;
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

          {/* Kaaba icon */}
          <div
            className="absolute inset-0 transition-transform duration-150 ease-out z-20"
            style={{ transform: `rotate(${kaabaRotation}deg)` }}
          >
            <div className="absolute top-1 left-1/2 -translate-x-1/2">
              <svg width="32" height="36" viewBox="0 0 32 36" className="drop-shadow-md">
                <rect x="2"  y="8"  width="28" height="26" rx="2" fill="#1a1a1a" stroke="#C19A6B" strokeWidth="2"/>
                <rect x="6"  y="14" width="20" height="14" rx="1" fill="none"    stroke="#C19A6B" strokeWidth="1" opacity="0.6"/>
                <rect x="12" y="22" width="8"  height="6"  rx="1" fill="#C19A6B" opacity="0.8"/>
                <polygon points="16,0 4,8 28,8" fill="#C19A6B"/>
              </svg>
            </div>
          </div>

          {/* Fixed arrow */}
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
    );
  };

  return (
    <div className="h-screen flex flex-col max-w-lg mx-auto bg-background" dir="rtl">
      {/* Custom location dialog */}
      <AnimatePresence>
        {!dialogDismissed && (
          <LocationPermDialog onConfirm={handleConfirm} onCancel={handleCancel} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="pt-safe px-4 py-4 flex items-center gap-4 bg-card shadow-sm relative z-10 border-b border-border">
        <Link href="/more" className="p-2 bg-secondary rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-bold text-xl" style={{ fontFamily: '"Tajawal", sans-serif' }}>تحديد القبلة</h1>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {renderBody()}
      </div>
    </div>
  );
}

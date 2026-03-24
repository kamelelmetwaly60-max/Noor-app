import { useState, useEffect, useRef } from 'react';
import { Bell, MapPin, Clock, ChevronLeft, ChevronRight, ChevronRight as ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { usePrayerTimes } from '@/hooks/use-api';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ADHAN_RECITERS } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';

function NotifPermDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative bg-card border border-border rounded-3xl p-6 w-full max-w-xs shadow-2xl text-center"
      >
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Bell className="w-7 h-7 text-primary" />
        </div>
        <h3 className="font-bold text-lg mb-1" style={{ fontFamily: '"Tajawal", sans-serif' }}>السماح بالإشعارات</h3>
        <p className="text-muted-foreground text-sm mb-5 leading-relaxed" style={{ fontFamily: '"Tajawal", sans-serif' }}>
          للحصول على تنبيهات الأذان في أوقات الصلاة، نحتاج إذنك بإرسال الإشعارات.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl bg-secondary text-foreground font-bold text-sm hover:bg-secondary/80 transition-colors"
            style={{ fontFamily: '"Tajawal", sans-serif' }}
          >
            لاحقاً
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl font-bold text-sm transition-colors"
            style={{
              background: 'linear-gradient(135deg, #C19A6B, #a07a4a)',
              color: '#fff',
              fontFamily: '"Tajawal", sans-serif',
            }}
          >
            السماح
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const PRAYERS = [
  { id: 'Fajr',    name: 'الفجر'  },
  { id: 'Sunrise', name: 'الشروق' },
  { id: 'Dhuhr',   name: 'الظهر'  },
  { id: 'Asr',     name: 'العصر'  },
  { id: 'Maghrib', name: 'المغرب' },
  { id: 'Isha',    name: 'العشاء' },
];

function fmt12(time: string): string {
  if (!time) return '';
  const [hStr, mStr] = time.split(':');
  let h = parseInt(hStr, 10);
  const m = (mStr ?? '00').substring(0, 2);
  const period = h >= 12 ? 'م' : 'ص';
  h = h % 12 || 12;
  return `${h}:${m} ${period}`;
}

function toMins(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function offsetDate(offset: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d;
}

export function Home() {
  const [pref, setPref] = useLocalStorage<'off' | 'text' | 'adhan'>('notification_pref', 'adhan');
  const [reciterId, setReciterId] = useLocalStorage<string>('adhan_reciter', 'azan1');
  const [dateOffset, setDateOffset] = useState(0);
  const [showNotifDialog, setShowNotifDialog] = useState(false);
  const pendingPrefRef = useRef<'off' | 'text' | 'adhan' | null>(null);

  // Get coords from user profile
  const userProfile = (() => {
    try { return JSON.parse(localStorage.getItem('user_profile') ?? '{}'); } catch { return {}; }
  })();

  const lat = userProfile.lat ?? null;
  const lng = userProfile.lng ?? null;

  const { data: prayerResult } = usePrayerTimes(lat, lng, dateOffset);
  const times = prayerResult?.timings;
  const hijri = prayerResult?.hijri;

  const [nextPrayer, setNextPrayer] = useState<{ name: string; time24: string } | null>(null);
  const [countdown, setCountdown] = useState('');
  const testAudioRef = useRef<HTMLAudioElement | null>(null); // kept for future use

  useEffect(() => {
    if (!times || dateOffset !== 0) return;
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    let found = false;
    for (const p of PRAYERS) {
      const t24 = (times[p.id] ?? '').substring(0, 5);
      if (t24 && toMins(t24) > nowMins) {
        setNextPrayer({ name: p.name, time24: t24 });
        found = true;
        break;
      }
    }
    if (!found && times['Fajr']) {
      setNextPrayer({ name: 'الفجر', time24: times['Fajr'].substring(0, 5) });
    }
  }, [times, dateOffset]);

  // Live countdown
  useEffect(() => {
    if (!nextPrayer || dateOffset !== 0) return;
    const tick = () => {
      const now = new Date();
      const [ph, pm] = nextPrayer.time24.split(':').map(Number);
      const target = new Date();
      target.setHours(ph, pm, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const totalSecs = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
      const hh = Math.floor(totalSecs / 3600).toString().padStart(2, '0');
      const mm = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
      const ss = (totalSecs % 60).toString().padStart(2, '0');
      setCountdown(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextPrayer, dateOffset]);

  const requestNotifPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      setShowNotifDialog(true);
    }
  };

  const handleNotifConfirm = async () => {
    setShowNotifDialog(false);
    await Notification.requestPermission();
    if (pendingPrefRef.current !== null) {
      setPref(pendingPrefRef.current);
      pendingPrefRef.current = null;
    }
  };

  const handlePrefChange = (val: 'off' | 'text' | 'adhan') => {
    if (val !== 'off' && 'Notification' in window && Notification.permission === 'default') {
      pendingPrefRef.current = val;
      setShowNotifDialog(true);
    } else {
      setPref(val);
    }
  };

  const testAudio = (url: string) => {
    if (testAudioRef.current) testAudioRef.current.pause();
    testAudioRef.current = new Audio(url);
    testAudioRef.current.play().catch(() => {});
    setTimeout(() => testAudioRef.current?.pause(), 8000);
  };

  // Hijri date for displayed day
  const displayDate = offsetDate(dateOffset);
  const displayHijriLabel = hijri
    ? `${hijri.day} ${hijri.month?.ar ?? ''} ${hijri.year} هـ`
    : new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(displayDate);

  return (
    <div className="pb-24 pt-6 px-4 max-w-lg mx-auto space-y-5" dir="rtl">
      <AnimatePresence>
        {showNotifDialog && (
          <NotifPermDialog
            onConfirm={handleNotifConfirm}
            onCancel={() => { setShowNotifDialog(false); pendingPrefRef.current = null; }}
          />
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-5 text-primary-foreground shadow-lg shadow-primary/20 relative overflow-hidden">
        {/* Background ornament */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -ml-8 -mb-8" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Hijri date with navigation */}
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => setDateOffset(d => d - 1)} className="p-1.5 bg-white/15 rounded-full hover:bg-white/25 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <p className="text-primary-foreground/90 font-medium text-sm" style={{ fontFamily: '"Tajawal", sans-serif' }}>{displayHijriLabel}</p>
            <button onClick={() => setDateOffset(d => d + 1)} className="p-1.5 bg-white/15 rounded-full hover:bg-white/25 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          {dateOffset !== 0 && (
            <button onClick={() => setDateOffset(0)} className="text-xs text-white/60 underline mb-1" style={{ fontFamily: '"Tajawal", sans-serif' }}>
              {dateOffset > 0 ? `+${dateOffset} أيام` : `${dateOffset} أيام`} — العودة لليوم
            </button>
          )}

          <h1 className="text-3xl mb-3" style={{ fontFamily: '"Amiri", "Scheherazade New", serif' }}>تطبيق نُـور</h1>

          {dateOffset === 0 && nextPrayer ? (
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 w-full border border-white/10">
              <p className="text-xs text-primary-foreground/60 mb-1 tracking-widest" style={{ fontFamily: '"Tajawal", sans-serif' }}>الصلاة القادمة</p>
              <p
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: '"Amiri", serif', textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}
              >{nextPrayer.name}</p>
              {/* Countdown digits styled */}
              <div className="flex items-center justify-center gap-1 mb-1 dir-ltr" style={{ direction: 'ltr' }}>
                {(countdown || '00:00:00').split(':').map((seg, i, arr) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="bg-black/30 rounded-xl px-3 py-1.5 min-w-[52px] text-center">
                      <span
                        className="text-3xl font-bold tracking-tight text-white"
                        style={{ fontFamily: '"Tajawal", monospace', letterSpacing: '-0.02em' }}
                      >{seg}</span>
                    </div>
                    {i < arr.length - 1 && <span className="text-white/60 text-2xl font-bold mb-1">:</span>}
                  </div>
                ))}
              </div>
              <p className="text-xs text-primary-foreground/60" style={{ fontFamily: '"Tajawal", sans-serif' }}>{fmt12(nextPrayer.time24)}</p>
            </div>
          ) : dateOffset !== 0 ? (
            <div className="bg-black/20 rounded-2xl p-3 w-full border border-white/10">
              <p className="text-sm font-bold" style={{ fontFamily: '"Tajawal", sans-serif' }}>{dateOffset > 0 ? `مواقيت بعد ${dateOffset} ${dateOffset === 1 ? 'يوم' : 'أيام'}` : `مواقيت قبل ${Math.abs(dateOffset)} ${Math.abs(dateOffset) === 1 ? 'يوم' : 'أيام'}`}</p>
            </div>
          ) : (
            <div className="animate-pulse bg-black/10 rounded-2xl h-28 w-full" />
          )}
        </div>
      </div>

      {/* Prayer Times Grid */}
      <div className="bg-card rounded-3xl p-5 shadow-sm border border-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2" style={{ fontFamily: '"Tajawal", sans-serif' }}>
            <Clock className="w-5 h-5 text-primary" />
            مواقيت الصلاة
          </h2>
          {userProfile.governorateName && (
            <span className="text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-1" style={{ fontFamily: '"Tajawal", sans-serif' }}>
              <MapPin className="w-3 h-3" />
              {userProfile.governorateName}
            </span>
          )}
        </div>

        {times ? (
          <div className="grid grid-cols-2 gap-2.5">
            {PRAYERS.map(p => {
              const t24 = (times[p.id] ?? '').substring(0, 5);
              const isNext = dateOffset === 0 && nextPrayer?.name === p.name;
              return (
                <div
                  key={p.id}
                  className={`flex justify-between items-center px-4 py-3 rounded-2xl border transition-all ${
                    isNext
                      ? 'bg-primary/15 border-primary/50 shadow-sm shadow-primary/10'
                      : 'bg-secondary/40 border-border/40'
                  }`}
                >
                  <span
                    className={`font-medium text-sm ${isNext ? 'text-primary font-bold' : 'text-foreground/70'}`}
                    style={{ fontFamily: '"Tajawal", sans-serif' }}
                  >{p.name}</span>
                  <span
                    className={`font-bold text-base tabular-nums ${isNext ? 'text-primary' : 'text-foreground/90'}`}
                    style={{ fontFamily: '"Tajawal", sans-serif' }}
                  >{fmt12(t24)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm" style={{ fontFamily: '"Tajawal", sans-serif' }}>
            {!lat ? (
              <div>
                <p>لم يتم تحديد الموقع</p>
                <p className="text-xs mt-1">اذهب للمزيد وحدد محافظتك</p>
              </div>
            ) : (
              <div className="animate-pulse">جاري تحميل المواقيت...</div>
            )}
          </div>
        )}
      </div>

      {/* Notifications Settings */}
      <div className="bg-card rounded-3xl p-5 shadow-sm border border-border">
        <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          إعدادات الإشعارات
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
            <div>
              <p className="font-medium text-sm">نوع الإشعار</p>
              <p className="text-xs text-muted-foreground mt-0.5">عند حلول وقت الأذان</p>
            </div>
            <select
              value={pref}
              onChange={e => handlePrefChange(e.target.value as any)}
              className="bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 ring-primary"
            >
              <option value="off">إيقاف</option>
              <option value="text">إشعار نصي</option>
              <option value="adhan">أذان كامل</option>
            </select>
          </div>

          {'Notification' in window && Notification.permission === 'denied' && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
              ⚠️ الإشعارات محجوبة — اسمح بها من إعدادات المتصفح
            </div>
          )}
          {'Notification' in window && Notification.permission === 'default' && pref !== 'off' && (
            <button
              onClick={requestNotifPermission}
              className="w-full p-3 bg-primary/10 border border-primary/20 rounded-xl text-sm text-primary font-bold hover:bg-primary/20 transition-colors"
            >
              🔔 اضغط هنا للسماح بالإشعارات
            </button>
          )}

          {pref === 'adhan' && (
            <Link href="/adhan">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between cursor-pointer hover:bg-primary/10 transition-colors">
                <div>
                  <p className="font-bold text-sm" style={{ fontFamily: '"Tajawal", sans-serif' }}>اختر صوت الأذان</p>
                  <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: '"Tajawal", sans-serif' }}>
                    {ADHAN_RECITERS.find(r => r.id === reciterId)?.name ?? 'أذان المدينة المنورة'}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-primary rotate-180" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

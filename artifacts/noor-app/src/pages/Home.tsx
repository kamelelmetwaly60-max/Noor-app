import { useState, useEffect, useRef } from 'react';
import { Bell, MapPin, Clock } from 'lucide-react';
import { useGeolocation } from '@/hooks/use-geolocation';
import { usePrayerTimes } from '@/hooks/use-api';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ADHAN_RECITERS } from '@/lib/constants';

const PRAYERS = [
  { id: 'Fajr', name: 'الفجر' },
  { id: 'Sunrise', name: 'الشروق' },
  { id: 'Dhuhr', name: 'الظهر' },
  { id: 'Asr', name: 'العصر' },
  { id: 'Maghrib', name: 'المغرب' },
  { id: 'Isha', name: 'العشاء' },
];

// Convert "HH:MM" → "H:MM ص/م"
function fmt12(time: string): string {
  if (!time) return '';
  const [hStr, mStr] = time.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr?.substring(0, 2) ?? '00';
  const period = h >= 12 ? 'م' : 'ص';
  h = h % 12 || 12;
  return `${h}:${m} ${period}`;
}

// Get total minutes from "HH:MM"
function toMins(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function Home() {
  const { coords, requestLocation, isLoading } = useGeolocation();
  const { data: times } = usePrayerTimes(coords?.lat ?? null, coords?.lng ?? null);
  const [pref, setPref] = useLocalStorage<'off' | 'text' | 'adhan'>('notification_pref', 'adhan');
  const [reciterId, setReciterId] = useLocalStorage<string>('adhan_reciter', 'madinah');

  const [nextPrayer, setNextPrayer] = useState<{ name: string; time24: string } | null>(null);
  const [countdown, setCountdown] = useState('');
  const testAudioRef = useRef<HTMLAudioElement | null>(null);

  // Determine next prayer whenever times change
  useEffect(() => {
    if (!times) return;
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    let found = false;
    for (const p of PRAYERS) {
      if (!times[p.id]) continue;
      const t24 = times[p.id].substring(0, 5);
      if (toMins(t24) > nowMins) {
        setNextPrayer({ name: p.name, time24: t24 });
        found = true;
        break;
      }
    }
    if (!found && times['Fajr']) {
      setNextPrayer({ name: 'الفجر', time24: times['Fajr'].substring(0, 5) });
    }
  }, [times]);

  // Live countdown every second
  useEffect(() => {
    if (!nextPrayer) return;
    const tick = () => {
      const now = new Date();
      const [ph, pm] = nextPrayer.time24.split(':').map(Number);
      const target = new Date();
      target.setHours(ph, pm, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const diffMs = target.getTime() - now.getTime();
      const totalSecs = Math.floor(diffMs / 1000);
      const hh = Math.floor(totalSecs / 3600).toString().padStart(2, '0');
      const mm = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
      const ss = (totalSecs % 60).toString().padStart(2, '0');
      setCountdown(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextPrayer]);

  const requestNotifPermission = async () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }
  };

  const testAudio = (url: string) => {
    if (testAudioRef.current) {
      testAudioRef.current.pause();
    }
    testAudioRef.current = new Audio(url);
    testAudioRef.current.play().catch(() => {});
    setTimeout(() => testAudioRef.current?.pause(), 6000);
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-lg mx-auto space-y-6" dir="rtl">

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 text-primary-foreground shadow-lg shadow-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <p className="text-primary-foreground/80 font-medium mb-1 text-sm">
            {new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
          </p>
          <h1 className="text-3xl font-serif mb-5">تطبيق نُور</h1>

          {nextPrayer ? (
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 w-full border border-white/10">
              <p className="text-xs text-primary-foreground/70 mb-2 uppercase tracking-widest">الصلاة القادمة</p>
              <p className="text-2xl font-bold mb-1">{nextPrayer.name}</p>
              {/* Countdown */}
              <p className="text-4xl font-mono font-bold tracking-wider text-white/90 mb-1">
                {countdown || '00:00:00'}
              </p>
              <p className="text-xs text-primary-foreground/60">
                {fmt12(nextPrayer.time24)}
              </p>
            </div>
          ) : (
            <div className="animate-pulse bg-black/10 rounded-2xl h-28 w-full" />
          )}
        </div>
      </div>

      {/* Prayer Times Grid */}
      <div className="bg-card rounded-3xl p-5 shadow-sm border border-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            مواقيت الصلاة
          </h2>
          <button
            onClick={requestLocation}
            className="text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-primary/20 transition-colors"
          >
            <MapPin className="w-3 h-3" />
            تحديث الموقع
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground text-sm animate-pulse">جاري تحديد الموقع...</div>
        ) : times ? (
          <div className="grid grid-cols-2 gap-3">
            {PRAYERS.map(p => {
              const t24 = times[p.id]?.substring(0, 5) ?? '';
              const isNext = nextPrayer?.name === p.name;
              return (
                <div
                  key={p.id}
                  className={`flex justify-between items-center p-3 rounded-xl border transition-all ${
                    isNext
                      ? 'bg-primary/10 border-primary/40'
                      : 'bg-secondary/50 border-border/50'
                  }`}
                >
                  <span className={`font-medium text-sm ${isNext ? 'text-primary font-bold' : 'text-foreground/80'}`}>
                    {p.name}
                  </span>
                  <span className={`font-bold text-sm ${isNext ? 'text-primary' : ''}`}>
                    {fmt12(t24)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-destructive text-sm">
            يجب السماح بالوصول للموقع لعرض مواقيت الصلاة
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
              <p className="font-medium text-sm">نوع الإشعار عند الأذان</p>
              <p className="text-xs text-muted-foreground mt-0.5">يعمل حتى لو التطبيق مفتوح</p>
            </div>
            <select
              value={pref}
              onChange={e => {
                setPref(e.target.value as 'off' | 'text' | 'adhan');
                requestNotifPermission();
              }}
              className="bg-background border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 ring-primary outline-none"
            >
              <option value="off">إيقاف</option>
              <option value="text">إشعار نصي</option>
              <option value="adhan">أذان كامل</option>
            </select>
          </div>

          {/* Notification permission warning */}
          {'Notification' in window && Notification.permission === 'denied' && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
              ⚠️ الإشعارات محجوبة في إعدادات المتصفح. يرجى السماح بها من إعدادات الموقع.
            </div>
          )}

          {'Notification' in window && Notification.permission === 'default' && pref !== 'off' && (
            <button
              onClick={requestNotifPermission}
              className="w-full p-3 bg-primary/10 border border-primary/20 rounded-xl text-sm text-primary font-bold hover:bg-primary/20 transition-colors"
            >
              اضغط هنا للسماح بالإشعارات
            </button>
          )}

          {pref === 'adhan' && (
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
              <p className="font-bold mb-3 text-sm">اختر صوت الأذان</p>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {ADHAN_RECITERS.map(r => (
                  <div key={r.id} className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input
                        type="radio"
                        name="reciter"
                        value={r.id}
                        checked={reciterId === r.id}
                        onChange={e => setReciterId(e.target.value)}
                        className="accent-primary w-4 h-4"
                      />
                      <span className="text-sm">{r.name}</span>
                    </label>
                    <button
                      onClick={() => testAudio(r.url)}
                      title="استمع"
                      className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors flex-shrink-0"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

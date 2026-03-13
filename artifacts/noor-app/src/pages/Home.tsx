import { useState, useEffect } from 'react';
import { Bell, MapPin, Settings, Moon, Sun, Clock } from 'lucide-react';
import { useGeolocation } from '@/hooks/use-geolocation';
import { usePrayerTimes } from '@/hooks/use-api';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ADHAN_RECITERS } from '@/lib/constants';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';

const PRAYERS = [
  { id: 'Fajr', name: 'الفجر' },
  { id: 'Sunrise', name: 'الشروق' },
  { id: 'Dhuhr', name: 'الظهر' },
  { id: 'Asr', name: 'العصر' },
  { id: 'Maghrib', name: 'المغرب' },
  { id: 'Isha', name: 'العشاء' },
];

export function Home() {
  const { coords, requestLocation, isLoading } = useGeolocation();
  const { data: times } = usePrayerTimes(coords?.lat ?? null, coords?.lng ?? null);
  const [pref, setPref] = useLocalStorage<'off' | 'text' | 'adhan'>('notification_pref', 'adhan');
  const [reciterId, setReciterId] = useLocalStorage<string>('adhan_reciter', 'madinah');
  
  const [nextPrayer, setNextPrayer] = useState<{name: string, time: string} | null>(null);

  useEffect(() => {
    if (!times) return;
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    
    let found = false;
    for (const p of PRAYERS) {
      if (!times[p.id]) continue;
      const [h, m] = times[p.id].split(':').map(Number);
      const pmins = h * 60 + m;
      if (pmins > currentMins) {
        setNextPrayer({ name: p.name, time: times[p.id] });
        found = true;
        break;
      }
    }
    if (!found && times['Fajr']) {
      setNextPrayer({ name: 'الفجر', time: times['Fajr'] });
    }
  }, [times]);

  const requestNotifPermission = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
  };

  const testAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play();
    setTimeout(() => audio.pause(), 5000);
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-lg mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 text-primary-foreground shadow-lg shadow-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <p className="text-primary-foreground/80 font-medium mb-1">
            {new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {day: 'numeric', month: 'long', year: 'numeric'}).format(new Date())}
          </p>
          <h1 className="text-3xl font-serif mb-4">تطبيق نُور</h1>
          
          {nextPrayer ? (
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 w-full border border-white/10">
              <p className="text-sm opacity-90 mb-1">الصلاة القادمة</p>
              <div className="flex justify-between items-center px-4">
                <span className="text-2xl font-bold">{nextPrayer.name}</span>
                <span className="text-3xl font-serif">{nextPrayer.time}</span>
              </div>
            </div>
          ) : (
            <div className="animate-pulse bg-black/10 rounded-2xl h-20 w-full" />
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
            className="text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-1"
          >
            <MapPin className="w-3 h-3" />
            تحديث الموقع
          </button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground text-sm">جاري تحديد الموقع...</div>
        ) : times ? (
          <div className="grid grid-cols-2 gap-3">
            {PRAYERS.map(p => (
              <div key={p.id} className="flex justify-between p-3 rounded-xl bg-secondary/50 border border-border/50">
                <span className="font-medium text-foreground/80">{p.name}</span>
                <span className="font-bold">{times[p.id]}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-destructive text-sm">عذراً، يجب السماح بالوصول للموقع.</div>
        )}
      </div>

      {/* Notifications Settings */}
      <div className="bg-card rounded-3xl p-5 shadow-sm border border-border">
        <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          إعدادات الإشعارات
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
            <div>
              <p className="font-medium">تشغيل الإشعارات</p>
              <p className="text-xs text-muted-foreground">عند وقت الصلاة</p>
            </div>
            <select 
              value={pref} 
              onChange={(e) => {
                setPref(e.target.value as any);
                requestNotifPermission();
              }}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 ring-primary outline-none"
            >
              <option value="off">إغلاق الإشعارات</option>
              <option value="text">إشعار نصي فقط</option>
              <option value="adhan">تشغيل أذان كامل</option>
            </select>
          </div>

          {pref === 'adhan' && (
            <div className="animate-in slide-in-from-top-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <p className="font-medium mb-3">اختر صوت الأذان</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {ADHAN_RECITERS.map(r => (
                  <div key={r.id} className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input 
                        type="radio" 
                        name="reciter" 
                        value={r.id}
                        checked={reciterId === r.id}
                        onChange={(e) => setReciterId(e.target.value)}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{r.name}</span>
                    </label>
                    <button 
                      onClick={() => testAudio(r.url)}
                      className="text-primary bg-primary/10 hover:bg-primary/20 p-1.5 rounded-full"
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

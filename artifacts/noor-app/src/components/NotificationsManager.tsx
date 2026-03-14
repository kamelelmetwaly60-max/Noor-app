import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { usePrayerTimes } from '@/hooks/use-api';
import { ADHAN_RECITERS, PRAYER_MESSAGES, PRAYER_NAMES_AR } from '@/lib/constants';

const PRAYERS_TO_NOTIFY = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// ── Beautiful Adhan Modal ──
interface AdhanModalProps {
  prayer: string;
  onClose: () => void;
}

function AdhanModal({ prayer, onClose }: AdhanModalProps) {
  const prayerAr = PRAYER_NAMES_AR[prayer] ?? prayer;
  const timeIcons: Record<string, string> = {
    Fajr: '🌙', Dhuhr: '☀️', Asr: '🌤️', Maghrib: '🌅', Isha: '🌃',
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm animate-in zoom-in-95 fade-in duration-300">
        {/* Decorative background */}
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            background: 'radial-gradient(ellipse at top, #1a1200, #0d0900)',
            border: '1px solid rgba(193,154,107,0.3)',
          }}
        />
        {/* Glow */}
        <div className="absolute inset-0 rounded-3xl" style={{ boxShadow: '0 0 60px rgba(193,154,107,0.15), inset 0 1px 0 rgba(193,154,107,0.2)' }} />

        <div className="relative z-10 p-8 text-center">
          {/* Decorative top line */}
          <div className="flex items-center gap-2 justify-center mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C19A6B]/50" />
            <span className="text-[#C19A6B] text-xs tracking-[0.3em]">أذان</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C19A6B]/50" />
          </div>

          {/* Prayer icon */}
          <div className="text-6xl mb-4">{timeIcons[prayer] ?? '🕌'}</div>

          {/* Arabic Mosque SVG */}
          <svg viewBox="0 0 200 80" className="w-40 mx-auto mb-4 opacity-60">
            <path d="M10 70 L10 40 Q30 10 50 40 L50 70Z" fill="#C19A6B" opacity={0.4}/>
            <path d="M50 70 L50 30 L80 30 L80 70Z" fill="#C19A6B" opacity={0.5}/>
            <path d="M80 70 L80 20 Q100 -5 120 20 L120 70Z" fill="#C19A6B" opacity={0.8}/>
            <path d="M120 70 L120 30 L150 30 L150 70Z" fill="#C19A6B" opacity={0.5}/>
            <path d="M150 70 L150 40 Q170 10 190 40 L190 70Z" fill="#C19A6B" opacity={0.4}/>
            <rect x={0} y={70} width={200} height={4} fill="#C19A6B" opacity={0.6} rx={2}/>
            {/* Minaret top */}
            <circle cx={100} cy={-8} r={4} fill="#C19A6B"/>
            <rect x={98} y={-20} width={4} height={12} fill="#C19A6B"/>
            <path d="M94 -22 Q100 -28 106 -22 Z" fill="#C19A6B"/>
          </svg>

          {/* Prayer name */}
          <h2 className="text-4xl font-serif text-[#C19A6B] mb-2" style={{ textShadow: '0 0 20px rgba(193,154,107,0.5)' }}>
            صلاة {prayerAr}
          </h2>
          <p className="text-white/60 text-sm mb-2">حيَّ على الصلاة حيَّ على الفلاح</p>
          <p className="text-white/40 text-xs mb-6">اللهم رب هذه الدعوة التامة والصلاة القائمة</p>

          {/* Decorative divider */}
          <div className="flex items-center gap-2 justify-center mb-6">
            <div className="flex-1 h-px bg-[#C19A6B]/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#C19A6B]/40" />
            <div className="w-2 h-2 rounded-full bg-[#C19A6B]/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#C19A6B]/40" />
            <div className="flex-1 h-px bg-[#C19A6B]/20" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #C19A6B, #a07a4a)',
              color: '#000',
              boxShadow: '0 4px 20px rgba(193,154,107,0.3)',
            }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Notifications Manager ──
export function NotificationsManager() {
  const [pref] = useLocalStorage<'off' | 'text' | 'adhan'>('notification_pref', 'adhan');
  const [reciterId] = useLocalStorage<string>('adhan_reciter', 'madinah');
  const [adhanPrayer, setAdhanPrayer] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playedToday = useRef<Set<string>>(new Set());

  // Get coordinates from user profile
  const userProfile = (() => {
    try { return JSON.parse(localStorage.getItem('user_profile') ?? '{}'); } catch { return {}; }
  })();
  const lat = userProfile.lat ?? null;
  const lng = userProfile.lng ?? null;

  const { data: prayerResult } = usePrayerTimes(lat, lng, 0);
  const prayerTimes = prayerResult?.timings;

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // Small delay so it doesn't pop up immediately on page load
      const t = setTimeout(() => Notification.requestPermission(), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  // Setup audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'none';
    }
    const reciter = ADHAN_RECITERS.find(r => r.id === reciterId) ?? ADHAN_RECITERS[0];
    audioRef.current.src = reciter.url;
  }, [reciterId]);

  const fireAdhan = useCallback((prayer: string) => {
    const prayerAr = PRAYER_NAMES_AR[prayer] ?? prayer;
    const msgBody = `حان موعد صلاة ${prayerAr}`;

    if (pref === 'adhan') {
      // Show beautiful in-app adhan modal
      setAdhanPrayer(prayer);
      // Play audio
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      // Also show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(`🕌 أذان صلاة ${prayerAr}`, {
            body: 'حيَّ على الصلاة حيَّ على الفلاح',
            tag: `prayer-${prayer}`,
            requireInteraction: true,
          });
        } catch {}
      }
    } else if (pref === 'text') {
      // Text notification only
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(`🕌 حان وقت أذان صلاة ${prayerAr}`, {
            body: msgBody,
            tag: `prayer-${prayer}`,
            requireInteraction: true,
          });
        } catch {}
      }
    }
  }, [pref]);

  // Check prayer times every 15 seconds
  useEffect(() => {
    if (pref === 'off' || !prayerTimes) return;

    const check = () => {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, '0');
      const mm = now.getMinutes().toString().padStart(2, '0');
      const currentStr = `${hh}:${mm}`;
      const dateStr = now.toDateString();

      PRAYERS_TO_NOTIFY.forEach(prayer => {
        const pTime = prayerTimes[prayer];
        if (!pTime) return;
        const normalizedTime = pTime.substring(0, 5);
        const key = `${dateStr}-${prayer}`;
        if (normalizedTime === currentStr && !playedToday.current.has(key)) {
          playedToday.current.add(key);
          fireAdhan(prayer);
        }
      });
    };

    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, [pref, prayerTimes, fireAdhan]);

  if (!adhanPrayer) return null;

  return (
    <AdhanModal
      prayer={adhanPrayer}
      onClose={() => {
        setAdhanPrayer(null);
        audioRef.current?.pause();
      }}
    />
  );
}

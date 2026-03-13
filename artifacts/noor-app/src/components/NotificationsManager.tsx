import { useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useGeolocation } from '@/hooks/use-geolocation';
import { usePrayerTimes } from '@/hooks/use-api';
import { ADHAN_RECITERS, PRAYER_MESSAGES } from '@/lib/constants';

const PRAYERS_TO_NOTIFY = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export function NotificationsManager() {
  const [pref] = useLocalStorage<'off' | 'text' | 'adhan'>('notification_pref', 'adhan');
  const [reciterId] = useLocalStorage<string>('adhan_reciter', 'madinah');
  const { coords } = useGeolocation();
  const { data: prayerTimes } = usePrayerTimes(coords?.lat ?? null, coords?.lng ?? null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playedToday = useRef<Set<string>>(new Set());

  // Request notification permission on load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'none';
    }
    const reciter = ADHAN_RECITERS.find(r => r.id === reciterId) ?? ADHAN_RECITERS[0];
    audioRef.current.src = reciter.url;
  }, [reciterId]);

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

        // match first 5 chars "HH:MM"
        const normalizedTime = pTime.substring(0, 5);
        const key = `${dateStr}-${prayer}`;

        if (normalizedTime === currentStr && !playedToday.current.has(key)) {
          playedToday.current.add(key);

          const msg = PRAYER_MESSAGES[prayer] ?? `حان موعد صلاة ${prayer}`;
          const title = `🕌 ${msg.split('\n')[0]}`;
          const body = msg.split('\n')[1] ?? 'اللهم رب هذه الدعوة التامة والصلاة القائمة';

          if (pref === 'adhan' && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {
              // Autoplay blocked - still show notification
            });
          }

          if (Notification.permission === 'granted') {
            try {
              new Notification(title, {
                body,
                icon: '/images/islamic-pattern.png',
                badge: '/images/islamic-pattern.png',
                tag: key,
              });
            } catch {
              // Notification failed silently
            }
          }
        }
      });
    };

    // Check immediately
    check();
    const interval = setInterval(check, 15000); // every 15 seconds
    return () => clearInterval(interval);
  }, [pref, prayerTimes, reciterId]);

  return null;
}

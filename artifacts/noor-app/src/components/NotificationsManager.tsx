import { useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useGeolocation } from '@/hooks/use-geolocation';
import { usePrayerTimes } from '@/hooks/use-api';
import { ADHAN_RECITERS, PRAYER_MESSAGES, PRAYER_NAMES_AR } from '@/lib/constants';

const PRAYERS_TO_NOTIFY = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export function NotificationsManager() {
  const [pref] = useLocalStorage<'off' | 'text' | 'adhan'>('notification_pref', 'adhan');
  const [reciterId] = useLocalStorage<string>('adhan_reciter', 'madinah');
  const { coords } = useGeolocation();
  const { data: prayerTimes } = usePrayerTimes(coords?.lat ?? null, coords?.lng ?? null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playedToday = useRef<Set<string>>(new Set());

  // Request notification permission on first load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Keep audio element src in sync with chosen reciter
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
    const msgLines = (PRAYER_MESSAGES[prayer] ?? `حان موعد صلاة ${prayerAr}`).split('\n');
    const title = `🕌 ${msgLines[0]}`;
    const body = msgLines[1] ?? 'اللهم رب هذه الدعوة التامة والصلاة القائمة';

    // Play adhan audio if chosen
    if (pref === 'adhan' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Autoplay blocked — at least show the notification
      });
    }

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const n = new Notification(title, {
          body,
          tag: `prayer-${prayer}-${new Date().toDateString()}`,
          requireInteraction: true,
        });
        // Auto-close after 60 seconds
        setTimeout(() => n.close(), 60000);
      } catch {
        // Notifications not available in this context
      }
    }
  }, [pref]);

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

  return null;
}

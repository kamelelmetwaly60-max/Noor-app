import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { MORNING_AZKAR, EVENING_AZKAR, SURAH_NAMES } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'wouter';

type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

const PRAYERS: { key: PrayerKey; label: string; arabic: string }[] = [
  { key: 'fajr',    label: 'الفجر',  arabic: 'ف' },
  { key: 'dhuhr',   label: 'الظهر',  arabic: 'ظ' },
  { key: 'asr',     label: 'العصر',  arabic: 'ع' },
  { key: 'maghrib', label: 'المغرب', arabic: 'م' },
  { key: 'isha',    label: 'العشاء', arabic: 'ع' },
];

interface TrackerState {
  prayers: Record<PrayerKey, boolean>;
  quranWird: boolean;
}

const DEFAULT_STATE: TrackerState = {
  prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false },
  quranWird: false,
};

function getTodayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getArabicDate(): string {
  return new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

function StarOrnament() {
  return (
    <svg width="20" height="20" viewBox="0 0 40 40" fill="currentColor" className="opacity-40 text-[#c5a059]">
      <polygon points="20,2 24,14 37,14 27,22 31,35 20,27 9,35 13,22 3,14 16,14" />
    </svg>
  );
}

export function DailyTracker() {
  const [currentDateKey, setCurrentDateKey] = useState(getTodayDateKey);

  const [state, setState] = useLocalStorage<TrackerState>(
    `daily_tracker_${currentDateKey}`,
    DEFAULT_STATE,
  );
  const [bookmark] = useLocalStorage<{ surah: number; ayah: number } | null>(
    'quran_bookmark',
    null,
  );
  const [azkarProgress] = useLocalStorage<Record<string, number>>(
    `azkar_${currentDateKey}`,
    {},
  );

  const morningDone = MORNING_AZKAR.every(z => (azkarProgress[z.id] ?? 0) >= z.count);
  const eveningDone = EVENING_AZKAR.every(z => (azkarProgress[z.id] ?? 0) >= z.count);
  const azkarDone = morningDone && eveningDone;

  const prayersDone = PRAYERS.filter(p => state.prayers[p.key]).length;
  const totalTasks = 7;
  const doneTasks = prayersDone + (azkarDone ? 1 : 0) + (state.quranWird ? 1 : 0);
  const progressPct = Math.round((doneTasks / totalTasks) * 100);

  const togglePrayer = (key: PrayerKey) => {
    setState(prev => ({
      ...prev,
      prayers: { ...prev.prayers, [key]: !prev.prayers[key] },
    }));
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const toggleQuranWird = () => {
    setState(prev => ({ ...prev, quranWird: !prev.quranWird }));
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newKey = getTodayDateKey();
      if (newKey !== currentDateKey) setCurrentDateKey(newKey);
    }, 30000);
    return () => clearInterval(interval);
  }, [currentDateKey]);

  const progressColor =
    progressPct === 100
      ? '#22c55e'
      : progressPct >= 70
      ? '#c5a059'
      : progressPct >= 40
      ? '#d2b48c'
      : '#8a6a3a';

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto" dir="rtl">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1">
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: '"Tajawal", sans-serif', color: '#c5a059' }}
          >
            المتتبع اليومي
          </h1>
          <StarOrnament />
        </div>
        <p
          className="text-sm text-muted-foreground"
          style={{ fontFamily: '"Tajawal", sans-serif' }}
        >
          {getArabicDate()}
        </p>
      </div>

      {/* Overall Progress */}
      <div
        className="mb-6 rounded-3xl p-5 border"
        style={{
          background: 'linear-gradient(135deg, rgba(197,160,89,0.12), rgba(197,160,89,0.05))',
          borderColor: 'rgba(197,160,89,0.25)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-base font-bold"
            style={{ fontFamily: '"Tajawal", sans-serif', color: '#c5a059' }}
          >
            إنجاز اليوم
          </span>
          <span
            className="text-2xl font-bold"
            style={{ fontFamily: '"Tajawal", sans-serif', color: progressColor }}
          >
            {progressPct}%
          </span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(197,160,89,0.15)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${progressColor}, ${progressColor}cc)` }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span
            className="text-xs text-muted-foreground"
            style={{ fontFamily: '"Tajawal", sans-serif' }}
          >
            {doneTasks} من {totalTasks} مهام
          </span>
          <AnimatePresence>
            {progressPct === 100 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-bold text-green-500 flex items-center gap-1"
                style={{ fontFamily: '"Tajawal", sans-serif' }}
              >
                <Check className="w-3 h-3" /> يوم مثالي!
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Prayers Section */}
      <div className="mb-5">
        <h2
          className="text-base font-bold mb-3 flex items-center gap-2"
          style={{ fontFamily: '"Tajawal", sans-serif' }}
        >
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'rgba(197,160,89,0.2)', color: '#c5a059' }}
          >
            ٥
          </span>
          الصلوات الخمس
          <span className="text-sm text-muted-foreground font-normal">
            ({prayersDone}/5)
          </span>
        </h2>
        <div className="flex justify-between gap-2">
          {PRAYERS.map((prayer, i) => {
            const done = state.prayers[prayer.key];
            return (
              <motion.button
                key={prayer.key}
                onClick={() => togglePrayer(prayer.key)}
                whileTap={{ scale: 0.9 }}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <motion.div
                  animate={done ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className="w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-sm"
                  style={
                    done
                      ? {
                          background: 'linear-gradient(135deg, #c5a059, #a07a3a)',
                          borderColor: '#c5a059',
                          boxShadow: '0 4px 15px rgba(197,160,89,0.4)',
                        }
                      : {
                          background: 'rgba(197,160,89,0.06)',
                          borderColor: 'rgba(197,160,89,0.3)',
                        }
                  }
                >
                  {done ? (
                    <Check className="w-6 h-6 text-white" />
                  ) : (
                    <span
                      className="text-lg font-bold"
                      style={{ color: 'rgba(197,160,89,0.6)', fontFamily: '"Tajawal", sans-serif' }}
                    >
                      {i + 1}
                    </span>
                  )}
                </motion.div>
                <span
                  className="text-xs font-bold"
                  style={{
                    fontFamily: '"Tajawal", sans-serif',
                    color: done ? '#c5a059' : 'var(--muted-foreground)',
                  }}
                >
                  {prayer.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Azkar Card */}
      <div className="mb-4">
        <h2
          className="text-base font-bold mb-3 flex items-center gap-2"
          style={{ fontFamily: '"Tajawal", sans-serif' }}
        >
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'rgba(197,160,89,0.2)', color: '#c5a059' }}
          >
            ٢
          </span>
          المهام اليومية
        </h2>

        {/* Azkar Task */}
        <div
          className="rounded-2xl p-4 mb-3 border transition-all duration-300"
          style={
            azkarDone
              ? {
                  borderColor: 'rgba(34,197,94,0.4)',
                  background: 'rgba(34,197,94,0.06)',
                }
              : {
                  borderColor: 'rgba(197,160,89,0.2)',
                  background: 'var(--card)',
                }
          }
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{
                  background: azkarDone ? 'rgba(34,197,94,0.15)' : 'rgba(197,160,89,0.12)',
                }}
              >
                🤲
              </div>
              <div>
                <p
                  className="font-bold text-sm"
                  style={{ fontFamily: '"Tajawal", sans-serif' }}
                >
                  أذكار الصباح والمساء
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ fontFamily: '"Tajawal", sans-serif', color: 'var(--muted-foreground)' }}
                >
                  {morningDone && eveningDone
                    ? 'مكتمل ✓'
                    : morningDone
                    ? 'الصباح ✓ — المساء لم يكتمل'
                    : eveningDone
                    ? 'المساء ✓ — الصباح لم يكتمل'
                    : 'لم يكتمل بعد'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {azkarDone ? (
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                  <Check className="w-4 h-4 text-white" />
                </div>
              ) : (
                <Link href="/azkar">
                  <div
                    className="px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{
                      fontFamily: '"Tajawal", sans-serif',
                      background: 'linear-gradient(135deg, #c5a059, #a07a3a)',
                      color: '#fff',
                    }}
                  >
                    ابدأ
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Quran Wird Card */}
        <motion.div
          className="rounded-2xl p-4 border cursor-pointer transition-all duration-300"
          style={
            state.quranWird
              ? {
                  borderColor: 'rgba(34,197,94,0.4)',
                  background: 'rgba(34,197,94,0.06)',
                }
              : {
                  borderColor: 'rgba(197,160,89,0.2)',
                  background: 'var(--card)',
                }
          }
          whileTap={{ scale: 0.98 }}
          onClick={toggleQuranWird}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{
                  background: state.quranWird ? 'rgba(34,197,94,0.15)' : 'rgba(197,160,89,0.12)',
                }}
              >
                📖
              </div>
              <div>
                <p
                  className="font-bold text-sm"
                  style={{ fontFamily: '"Tajawal", sans-serif' }}
                >
                  الورد القرآني
                </p>
                {bookmark ? (
                  <p
                    className="text-xs mt-0.5"
                    style={{
                      fontFamily: '"Tajawal", sans-serif',
                      color: '#c5a059',
                    }}
                  >
                    {SURAH_NAMES[bookmark.surah]} • آية {bookmark.ayah}
                  </p>
                ) : (
                  <p
                    className="text-xs mt-0.5"
                    style={{ fontFamily: '"Tajawal", sans-serif', color: 'var(--muted-foreground)' }}
                  >
                    ضع علامة حفظ في المصحف أولاً
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!bookmark && (
                <Link href="/quran" onClick={e => e.stopPropagation()}>
                  <div
                    className="px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{
                      fontFamily: '"Tajawal", sans-serif',
                      background: 'linear-gradient(135deg, #c5a059, #a07a3a)',
                      color: '#fff',
                    }}
                  >
                    المصحف
                  </div>
                </Link>
              )}
              <motion.div
                animate={state.quranWird ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                style={
                  state.quranWird
                    ? {
                        background: '#22c55e',
                        borderColor: '#22c55e',
                      }
                    : {
                        background: 'transparent',
                        borderColor: 'rgba(197,160,89,0.4)',
                      }
                }
              >
                {state.quranWird && <Check className="w-4 h-4 text-white" />}
              </motion.div>
            </div>
          </div>
          {bookmark && (
            <p
              className="text-xs mt-2 text-muted-foreground"
              style={{ fontFamily: '"Tajawal", sans-serif' }}
            >
              {state.quranWird ? 'ممتاز! اكتملت قراءة وردك اليوم' : 'اضغط للتأكيد بعد إتمام وردك'}
            </p>
          )}
        </motion.div>
      </div>

      {/* Summary badges */}
      <div className="grid grid-cols-3 gap-3 mt-5">
        {[
          {
            value: `${prayersDone}/5`,
            label: 'صلوات',
            done: prayersDone === 5,
            icon: '🕌',
          },
          {
            value: azkarDone ? '✓' : morningDone || eveningDone ? '½' : '✗',
            label: 'الأذكار',
            done: azkarDone,
            icon: '🤲',
          },
          {
            value: state.quranWird ? '✓' : '✗',
            label: 'الورد',
            done: state.quranWird,
            icon: '📖',
          },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-2xl p-3 text-center border"
            style={
              item.done
                ? { borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.06)' }
                : { borderColor: 'rgba(197,160,89,0.15)', background: 'var(--card)' }
            }
          >
            <div className="text-xl mb-1">{item.icon}</div>
            <p
              className="font-bold text-lg"
              style={{
                fontFamily: '"Tajawal", sans-serif',
                color: item.done ? '#22c55e' : '#c5a059',
              }}
            >
              {item.value}
            </p>
            <p
              className="text-xs text-muted-foreground"
              style={{ fontFamily: '"Tajawal", sans-serif' }}
            >
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

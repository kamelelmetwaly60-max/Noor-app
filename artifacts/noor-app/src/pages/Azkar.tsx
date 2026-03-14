import { useState } from 'react';
import { MORNING_AZKAR, EVENING_AZKAR, AZKAR_AFTER_PRAYER, AZKAR_SLEEP, AZKAR_VARIOUS } from '@/lib/constants';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { getTodayKey, cn } from '@/lib/utils';
import { Check, RotateCcw, Sun, Moon, Star, BookOpen, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TabId = 'morning' | 'evening' | 'sleep' | 'after' | 'various';

const TABS = [
  { id: 'morning' as TabId,  label: 'الصباح',    icon: Sun,      data: MORNING_AZKAR },
  { id: 'evening' as TabId,  label: 'المساء',    icon: Moon,     data: EVENING_AZKAR },
  { id: 'sleep' as TabId,    label: 'النوم',      icon: Star,     data: AZKAR_SLEEP },
  { id: 'after' as TabId,    label: 'بعد الصلاة', icon: BookOpen, data: AZKAR_AFTER_PRAYER },
  { id: 'various' as TabId,  label: 'أدعية',      icon: Heart,    data: AZKAR_VARIOUS },
];

export function Azkar() {
  const [tab, setTab] = useState<TabId>('morning');
  const todayKey = getTodayKey();
  const [progress, setProgress] = useLocalStorage<Record<string, number>>(`azkar_${todayKey}`, {});

  const currentTab = TABS.find(t => t.id === tab)!;
  const azkarList = currentTab.data;

  const totalDone = azkarList.filter(z => (progress[z.id] ?? 0) >= z.count).length;
  const allDone = totalDone === azkarList.length;

  const handleTap = (id: string, max: number) => {
    setProgress(prev => {
      const current = prev[id] ?? 0;
      if (current >= max) return prev;
      return { ...prev, [id]: current + 1 };
    });
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const resetToday = () => {
    if (confirm('هل تريد تصفير هذا القسم لليوم؟')) {
      const toRemove = azkarList.map(z => z.id);
      setProgress(prev => {
        const next = { ...prev };
        toRemove.forEach(id => delete next[id]);
        return next;
      });
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-lg mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-bold">الأذكار والأدعية</h1>
        <button onClick={resetToday} className="p-2 bg-secondary text-primary rounded-full hover:bg-primary/20 transition-colors">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 custom-scrollbar">
        {TABS.map(t => {
          const Icon = t.icon;
          const done = t.data.filter(z => (progress[z.id] ?? 0) >= z.count).length;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                  : 'bg-card text-muted-foreground border-border hover:bg-secondary'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              {done > 0 && !isActive && (
                <span className="bg-green-500 text-white text-[9px] px-1 rounded-full">{done}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Progress summary */}
      <div className="mb-4 bg-card rounded-2xl px-4 py-2.5 border border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${azkarList.length ? (totalDone / azkarList.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">{totalDone}/{azkarList.length}</span>
        </div>
        {allDone && (
          <span className="text-green-600 text-sm font-bold flex items-center gap-1">
            <Check className="w-4 h-4" />أحسنت!
          </span>
        )}
      </div>

      {/* Azkar list */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {azkarList.map((zekr, index) => {
            const current = progress[zekr.id] ?? 0;
            const isDone = current >= zekr.count;

            return (
              <motion.div
                key={`${tab}-${zekr.id}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.02, duration: 0.25 }}
                className={cn(
                  'bg-card border-2 rounded-3xl p-5 shadow-sm transition-all duration-500',
                  isDone ? 'border-green-500/50 bg-green-50/30 dark:bg-green-900/10' : 'border-border/50'
                )}
              >
                <p className="text-lg leading-loose font-serif mb-2 whitespace-pre-wrap">{zekr.text}</p>
                <p className="text-xs text-primary/70 mb-4 bg-primary/5 inline-block px-2 py-0.5 rounded-lg">{zekr.source}</p>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {isDone ? (
                      <span className="text-green-600 font-bold">✓ مكتمل</span>
                    ) : (
                      <span>متبقي: <strong>{zekr.count - current}</strong> / {zekr.count}</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleTap(zekr.id, zekr.count)}
                    disabled={isDone}
                    className={cn(
                      'w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 shadow-md',
                      isDone
                        ? 'bg-green-500 text-white scale-105 shadow-green-500/30 cursor-not-allowed'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 cursor-pointer'
                    )}
                  >
                    {isDone ? <Check className="w-7 h-7" /> : (zekr.count - current)}
                  </button>
                </div>

                <div className="w-full bg-secondary h-1.5 rounded-full mt-4 overflow-hidden">
                  <div
                    className={cn('h-full transition-all duration-500 rounded-full', isDone ? 'bg-green-500' : 'bg-primary')}
                    style={{ width: `${Math.min((current / zekr.count) * 100, 100)}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
